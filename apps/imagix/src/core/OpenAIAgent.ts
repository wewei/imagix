import { type OpenAI } from "openai"
import type { Agent, Memory, Chunk } from "./types"

export function makeOpenAIAgent(
  openAI: OpenAI,
  memory: Memory,
  model: string,
  maxContextLength: number,
): Agent {
  return {
    chat: async (content, stateId, options) => {
      const userState = await memory.handleMessage({
        role: "user",
        content,
        timestamp: Date.now(),
      }, stateId);
      const { prompt, messages } = await memory.trigger(userState, maxContextLength);
      const { maxTokens, temperature, topP } = options;
      const response = await openAI.chat.completions.create({
        model,
        messages: [
          { role: "system", content: prompt },
          ...messages,
        ],
        max_tokens: maxTokens,
        temperature: temperature,
        top_p: topP,
        stream: true,
      });
      const { readable: stream, writable } = new TransformStream<Chunk>();
      const assistantState = (async () => {
        const contents: string[] = [];
        for await (const chunk of response) {
          if (chunk.choices && chunk.choices.length > 0) {
            const content = chunk.choices[0]?.delta?.content ?? "";
            contents.push(content);
            const message: Chunk = { content };
            writable.getWriter().write(message);
          }
        }
        return memory.handleMessage({
          role: "assistant",
          content: contents.join(""),
          timestamp: Date.now(),
        }, userState);
      })();

      return { stream, userState, assistantState };
    },
  }
}