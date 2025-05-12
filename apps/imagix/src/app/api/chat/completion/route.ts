import { makeOpenAIChatService } from '@/services/OpenAIChat';
import { ChatRequest } from '@/types/message';
import { NextRequest, NextResponse } from 'next/server';

console.log('OpenAI API Base URL:', process.env.OPENAI_API_BASE_URL);
console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? '****' : 'Not set');
console.log('OpenAI API Model:', process.env.OPENAI_API_MODEL);

const chatService = makeOpenAIChatService({
  baseURL: process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1',
  apiKey: process.env.OPENAI_API_KEY || '',
  model: process.env.OPENAI_API_MODEL || 'gpt-3.5-turbo',
});

/**
 * API handler for AI text completion
 * POST /api/chat/completion
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json() as ChatRequest;
    const { messages, maxTokens, temperature, topP } = body;
    
    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    if (maxTokens && (typeof maxTokens !== 'number' || maxTokens <= 0)) {
      return NextResponse.json(
        { error: 'maxTokens must be a positive number' },
        { status: 400 }
      );
    }

    if (temperature && (typeof temperature !== 'number' || temperature < 0 || temperature > 1)) {
      return NextResponse.json(
        { error: 'temperature must be between 0 and 1' },
        { status: 400 }
      );
    }
    if (topP && (typeof topP !== 'number' || topP < 0 || topP > 1)) {
      return NextResponse.json(
        { error: 'topP must be between 0 and 1' },
        { status: 400 }
      );
    }
    
    // Prepare response
    const response = await chatService.chat({
      messages,
      maxTokens: maxTokens || 100,
      temperature: temperature || 0.7,
      topP: topP || 1,
    });
    
    return Response.json(response);
  } catch (error) {
    console.error('Error processing completion request:', error);
    return Response.json(
      { error: 'Failed to process request', details: (error as Error).message },
      { status: 500 }
    );
  }
}