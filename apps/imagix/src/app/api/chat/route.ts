import { makeLinearMemory } from '@/agent/memory/LinearMemory';
import { makeOpenAIAgent } from '@/agent/OpenAIAgent';
import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { ChatRequest } from './types';
import { DEFAULT_MAX_CONTEXT_LENGTH, DEFAULT_MAX_TOKENS, DEFAULT_TEMPRATURE, DEFAULT_TOP_P } from '@/constants';

console.log('OpenAI API Base URL:', process.env.OPENAI_API_BASE_URL);
console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? '****' : 'Not set');
console.log('OpenAI API Model:', process.env.OPENAI_API_MODEL);

const openAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL,
});

const memory = makeLinearMemory('You are a helpful assistant.');
const model = process.env.OPENAI_API_MODEL || 'gpt-3.5-turbo';

const agent = makeOpenAIAgent(openAI, memory, model, DEFAULT_MAX_CONTEXT_LENGTH);

/**
 * API handler for AI text completion
 * GET /api/chat
 */
export async function GET(request: NextRequest) {
  try {
    // Parse request body
    const body = request;
    const { content, maxTokens = DEFAULT_MAX_TOKENS, temperature = DEFAULT_TEMPRATURE, topP = DEFAULT_TOP_P } = body;
    
    // Validate input
    if (typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json(
        { error: 'Input content is required' },
        { status: 400 }
      );
    }

    if (typeof maxTokens !== 'number' || maxTokens <= 0) {
      return NextResponse.json(
        { error: 'maxTokens must be a positive number' },
        { status: 400 }
      );
    }

    if (typeof temperature !== 'number' || temperature < 0 || temperature > 1) {
      return NextResponse.json(
        { error: 'temperature must be between 0 and 1' },
        { status: 400 }
      );
    }
    if (typeof topP !== 'number' || topP < 0 || topP > 1) {
      return NextResponse.json(
        { error: 'topP must be between 0 and 1' },
        { status: 400 }
      );
    }
    
    // Prepare response
    const response = agent(content, {
      maxTokens,
      temperature,
      topP,
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async pull(controller) {
        const { value, done } = await response.next();
        if (done) {
          controller.close();
        } else {
          controller.enqueue(encoder.encode(JSON.stringify(value)));
        }
      }
    });

    return new Response(readableStream, {
      headers: {
        'Connection': 'keep-alive',
        'Content-Encoding': 'none',
        'Cache-Control': 'no-store, no-transform',
        'Content-Type': 'text/event-stream; charset=utf-8',
      }
    });
  } catch (error) {
    console.error('Error processing completion request:', error);
    return Response.json(
      { error: 'Failed to process request', details: (error as Error).message },
      { status: 500 }
    );
  }
}