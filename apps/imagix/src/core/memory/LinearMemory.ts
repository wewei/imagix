import { v4 as uuidv4 } from "uuid";
import type { Memory, Message, StateId } from "../types";

// Linear memory implementation for storing and retrieving messages
export const makeLinearMemory = (prompt: string): Memory => {
  const prevChain: Record<StateId, StateId> = {};
  const messageDict: Record<StateId, Message> = {};

  const handleMessage = async (message: Message, stateId: StateId | null): Promise<StateId> => {
    const newStateId = uuidv4();
    messageDict[newStateId] = message;
    if (stateId) {
      const prevMessage = messageDict[stateId];
      if (!prevMessage) {
        throw new Error("Previous message not found");
      }
      if (message.timestamp < prevMessage.timestamp) {
        throw new Error("Message timestamp is earlier than previous message");
      }
      prevChain[newStateId] = stateId;
    }
    return newStateId;
  };

  const trigger = async (stateId: StateId, maxContextLength: number): Promise<{ prompt: string; messages: Message[] }> => {
    const messages: Message[] = [];
    let currentStateId = stateId;
    let length = prompt.length;

    while (currentStateId) {
      const message = messageDict[currentStateId];
      if (!message) {
        throw new Error("Message not found");
      }
      length += message.content.length;
      if (length > maxContextLength) {
        break;
      }
      messages.unshift(message);
      currentStateId = prevChain[currentStateId];
    }

    return { prompt, messages };
  };

  return { handleMessage, trigger };
}