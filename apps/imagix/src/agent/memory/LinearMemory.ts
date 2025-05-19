import { DEFAULT_MAX_CONTEXT_LENGTH } from "@/constants";
import type { Message } from "../types";

// Linear memory implementation for storing and retrieving messages
export const makeLinearMemory = (prompt: string) => {
  const allMessages: Message[] = [];

  // Function to retrieve messages based on the input and max context length
  // For linear memory, we retrieve the last N messages, ignoring the user input, and always use the static system prompt
  const retrieve = async (input: string, maxContextLength: number) => {
    if (maxContextLength <= 0) {
      return { prompt, messages: allMessages };
    }
    const messages = [];
    let totalLength = 0;
    for (let i = allMessages.length - 1; i >= 0; i--) {
      const message = allMessages[i];
      const messageLength = message.content.length;
      if (totalLength + messageLength > maxContextLength) {
        break;
      }
      totalLength += messageLength;
      messages.unshift(message);
    }
    return {
      prompt,
      messages: messages
    };
  };

  const update = async (newMessages: Message[]) => {
    allMessages.push(...newMessages);
    // Make sure the messages are sorted by timestamp
    allMessages.sort((a, b) => a.timestamp - b.timestamp);
  };

  return { retrieve, update };
}