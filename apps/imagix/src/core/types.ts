// Define shared types for the chat components
export type BaseMessage = {
  content: string;
};

export type Message = {
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
};

export type ChatOptions = {
  maxTokens: number; // Maximum number of tokens to generate
  temperature: number; // Sampling temperature
  topP: number; // Nucleus sampling parameter
};

export type StateId = string;

export type Chunk = {
  content: string;
};

export type Memory = {
  handleMessage: (message: Message, stateId: StateId | null) => Promise<StateId>;
  trigger: (stateId: StateId, maxContextLength: number) => Promise<{
    prompt: string;      // The action to be taken at the given state
    messages: Message[]; // The triggered memory as messages at the given state
  }>;
}

export type AgentOutput = {
  stream: ReadableStream<Chunk>; // The stream of chunks from the agent
  userState: StateId; // The state after the user has sent the input
  assistantState: Promise<StateId>; // The state after the assistant has processed the input
};

export type Agent = {
  chat: (content: string, state: StateId | null, options: ChatOptions) => Promise<AgentOutput>;
}

export type ChatRequest = {
  content: string;
  options: ChatOptions;
}

export type ChatResponse = {
  state: StateId;
}

export type ChatEvent = {
  type: 'chunk';
  content: string;
} | {
  type: 'done';
  state: StateId;
};