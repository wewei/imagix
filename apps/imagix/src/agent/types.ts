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

export type Memory = {
  // Function to retrieve prompt & messages based on the input and context length
  retrieve: (stateId: StateId, input: string, maxContextLength: number) => Promise<{
    prompt: string, // System prompt
    messages: Message[], // Messages related to the input
  }>;

  // Function to update the memory with a new message
  update: (stateId: StateId, messages: Message) => Promise<StateId>;
};

export type Chunk = {
  content: string;
};

export type Agent = {
  input: (stateId: StateId, input: string) => Promise<StateId>;
  respond: (stateId: StateId, options: Partial<ChatOptions>) => Promise<StateId>;
}

