export type ChatRequest = {
  content: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
};

export type ChatRequestChunk = {
  content: string;
}
