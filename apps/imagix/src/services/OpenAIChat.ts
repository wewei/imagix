import { OpenAI } from "openai";
import { ChatCompletionRequest, ChatCompletionResponse } from "@/types/message";

export type OpenAIChatConfig = {
  baseURL: string;
  apiKey: string;
  model: string;
}

export type OpenAIChatService = {
  chat: (request: ChatCompletionRequest) => Promise<ChatCompletionResponse>;
  streamChat: (request: ChatCompletionRequest) => AsyncGenerator<ChatCompletionRequest>;
}

export function makeOpenAIChatService(config: OpenAIChatConfig): OpenAIChatService {
  const { baseURL, apiKey, model } = config;

  const client = new OpenAI({
    apiKey,
    baseURL
  });

  async function chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const response = await client.completions.create({
      model: model,
      messages: request.messages,
      top_p: request.topP ?? 1,
      max_tokens: request.maxTokens ?? 100,
      temperature: request.temperature ?? 0.7,
    });

    if (response.choices && response.choices.length > 0) {
      const message = response.choices[0]?.text || "No content";
      return { message };
    }
    throw new Error("No choices in response");
  }

  async function* streamChat(request: ChatCompletionRequest): AsyncGenerator<ChatCompletionRequest> {
  }

  return { chat, streamChat}

}