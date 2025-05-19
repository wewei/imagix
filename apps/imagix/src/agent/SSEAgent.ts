import type { Agent, Chunk, ChatOptions, Memory, Message } from "./types";
import { DEFAULT_MAX_TOKENS, DEFAULT_TEMPRATURE, DEFAULT_TOP_P, DEFAULT_MAX_CONTEXT_LENGTH } from "@/constants";
import { makeLinearMemory } from "./memory/LinearMemory";

/**
 * Creates an SSE-based Agent that communicates with the API using Server-Sent Events
 * @returns An Agent implementation that uses SSE for streaming responses
 */
export function makeSSEAgent(
  memory = makeLinearMemory("You are a helpful AI assistant."),
  maxContextLength = DEFAULT_MAX_CONTEXT_LENGTH
): Agent {
  return async function* (input: string, options: Partial<ChatOptions>): AsyncGenerator<Chunk> {
    const {
      maxTokens = DEFAULT_MAX_TOKENS,
      temperature = DEFAULT_TEMPRATURE,
      topP = DEFAULT_TOP_P,
    } = options;
    
    // Use memory to retrieve relevant context
    const { prompt, messages } = await memory.retrieve(input, maxContextLength);    // Prepare the request payload
    const stateInternal
    const payload = {
      prompt: input,
      context: messages.map((msg: Message) => ({
        role: msg.role,
        content: msg.content
      })),
      maxTokens,
      temperature,
      topP
    };

    // Create a URL with query parameters for the SSE connection
    const queryParams = new URLSearchParams();
    queryParams.append('data', JSON.stringify(payload));
    const url = `/api/chat?${queryParams.toString()}`;

    // Create an EventSource for SSE communication
    const eventSource = new EventSource(url);
      try {
      // Use a Promise-based approach to handle the SSE events
      let assistantResponse = '';
      
      while (true) {
        const result = await new Promise<{ chunk?: Chunk, done: boolean }>((resolve, reject) => {
          // One-time message handler
          const messageHandler = (event: MessageEvent) => {
            try {
              const chunk: Chunk = JSON.parse(event.data);
              eventSource.removeEventListener('message', messageHandler);
              resolve({ chunk, done: false });
            } catch (error) {
              console.error("Error parsing SSE message:", error);
              eventSource.removeEventListener('message', messageHandler);
              reject(error);
            }
          };

          // One-time done handler
          const doneHandler = () => {
            eventSource.removeEventListener('done', doneHandler);
            eventSource.removeEventListener('message', messageHandler);
            resolve({ done: true });
          };

          // One-time error handler
          const errorHandler = (error: Event) => {
            console.error("SSE Error:", error);
            eventSource.removeEventListener('error', errorHandler);
            eventSource.removeEventListener('message', messageHandler);
            eventSource.removeEventListener('done', doneHandler);
            reject(error);
          };

          // Set up the event handlers
          eventSource.addEventListener('message', messageHandler);
          eventSource.addEventListener('done', doneHandler);
          eventSource.addEventListener('error', errorHandler);
        });

        if (result.done) {
          break;
        }        if (result.chunk) {
          assistantResponse += result.chunk.content || '';
          yield result.chunk;
        }
      }
      
      // Update memory with the new message pair
      if (assistantResponse) {
        const userMessage: Message = {
          role: 'user',
          content: input,
          timestamp: Date.now()
        };
        
        const assistantMessage: Message = {
          role: 'assistant',
          content: assistantResponse,
          timestamp: Date.now() + 1 // Ensure it's after the user message
        };
        
        await memory.update([userMessage, assistantMessage]);
      }
    } finally {
      // Ensure EventSource is closed
      eventSource.close();
    }
  };
}
