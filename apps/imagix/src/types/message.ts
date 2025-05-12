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

export type ChatRequest = {
  messages: Message[];
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

export type ChatResponse = {
  content: string;
}
