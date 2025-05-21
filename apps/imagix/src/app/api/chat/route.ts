import { streamText, tool } from 'ai';
import { siliconFlow } from '@/lib/ai/siliconFlow';
import { z } from 'zod';
import { createResource } from '@/lib/actions/resources';
import { findRelevantContent } from '@/lib/ai/embedding';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const systemPrompt =
`You are a helpful assistant. Check your knowledge base before answering any questions.
Only respond to questions using information from tool calls.
if no relevant information is found in the tool calls, respond, "Sorry, I don't know."`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  try {
    const result = streamText({
      model: siliconFlow('deepseek-ai/DeepSeek-V3'),
      system: systemPrompt,
      messages,
      tools: {
        addResource: tool({
          description: 'Add a new resource to the knowledge base. If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.',
          parameters: z.object({
            content: z.string().describe('The content of the resource to add.'),
          }),
          execute: async ({ content }) => {
            console.log('Adding resource:', content);
            return createResource({ content });
          },
        }),
        getInformation: tool({
          description: 'Get information from the knowledge base to answer questions.',
          parameters: z.object({
            question: z.string().describe('The users question.'),
          }),
          execute: async ({ question }) => {
            console.log('Finding relevant content for question:', question);
            return findRelevantContent(question)
          },
        }),
      }
    });

    return result.toDataStreamResponse({
      getErrorMessage: (error) => {
        console.error('Error in streaming response:', error);
        return 'Error in streaming response';
      }
    });
  } catch (error) {
    console.error('Error in streaming response:', error);
    return new Response('Error in streaming response', { status: 500 });
  }
}