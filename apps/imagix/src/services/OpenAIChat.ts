import { OpenAI } from "openai";
import { ChatRequest, ChatResponse } from "@/types/message";

export type OpenAIChatConfig = {
  baseURL: string;
  apiKey: string;
  model: string;
}

export type OpenAIChatService = {
  chat: (request: ChatRequest) => Promise<ChatResponse>;
  streamChat: (request: ChatRequest) => AsyncGenerator<ChatResponse>;
}

export function makeOpenAIChatService(config: OpenAIChatConfig): OpenAIChatService {
  const { baseURL, apiKey, model } = config;

  const client = new OpenAI({
    apiKey,
    baseURL
  });

  async function chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await client.chat.completions.create({
      model: model,
      messages: request.messages,
      top_p: request.topP ?? 1,
      max_tokens: request.maxTokens ?? 100,
      temperature: request.temperature ?? 0.7,
    });

    if (response.choices && response.choices.length > 0) {
      const content = response.choices[0]?.message?.content ?? "";
      return { content };
    }
    throw new Error("No choices in response");
  }

  async function* streamChat(request: ChatRequest): AsyncGenerator<ChatResponse> {
    const response = await client.chat.completions.create({
      model: model,
      messages: request.messages,
      top_p: request.topP ?? 1,
      max_tokens: request.maxTokens ?? 100,
      temperature: request.temperature ?? 0.7,
      stream: true,
    });

    for await (const chunk of response) {
      if (chunk.choices && chunk.choices.length > 0) {
        const content = chunk.choices[0]?.delta?.content ?? "";
        yield { content };
      }
    }
  }

  return { chat, streamChat}
}
