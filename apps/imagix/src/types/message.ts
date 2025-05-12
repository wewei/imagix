// Define shared types for the chat components
export type BaseMessage = {
  content: string;
}

export type UserMessage = BaseMessage & {
  role: 'user';
}

export type AssistantMessage = BaseMessage & {
  role: 'assistant';
}

export type SystemMessage = BaseMessage & {
  role: 'system';
}

export type Message = UserMessage | AssistantMessage | SystemMessage;

export type ChatCompletionRequest = {
  messages: Message[];
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

export type ChatCompletionResponse = {
  message: string;
  toolCall?: string;
}
