import { Message } from "@/types/message";
import { OpenAIChatService } from "./OpenAIChat";

export type Agent<Memory, Delta> = (
  memory: Memory,
  input: string,
  handleOutput: (chunk: string) => void
) => Promise<Delta>;

export type AgentParams<Memory, Delta> = (memory: Memory) => {
  getMessages: (input: string) => Promise<Message[]>;
  getDelta: (output: string) => Promise<Delta>;
};

export const makeOpenAIAgent =
  <Memory, Delta>(
    params: AgentParams<Memory, Delta>,
    chatService: OpenAIChatService
  ): Agent<Memory, Delta> =>
  async (memory, input, handleOutput) => {
    const { getMessages, getDelta } = params(memory);

    const messages = await getMessages(input);
    if (messages.length === 0) {
      throw new Error("No messages found");
    }
    const stream = chatService.streamChat({
      messages,
      maxTokens: 100,
      temperature: 0.7,
      topP: 1,
    });

    const contents: string[] = [];

    for await (const chunk of stream) {
      if (chunk.content) {
        handleOutput(chunk.content);
        contents.push(chunk.content);
      }
    }
    return await getDelta(contents.join(""));
  };
