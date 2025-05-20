import { createDeepSeek, deepseek } from '@ai-sdk/deepseek';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const siliconFlow = createDeepSeek({ baseURL: 'https://api.siliconflow.cn/v1/' });

export async function POST(req: Request) {
  const { messages } = await req.json();

  try {
    const result = streamText({
      model: siliconFlow('deepseek-ai/DeepSeek-V3'),
      messages,
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