// Define shared types for the chat components
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}