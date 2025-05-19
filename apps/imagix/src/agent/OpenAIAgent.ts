import { type OpenAI } from "openai"
import type { Agent, Memory, AgentOutput } from "./types"
import { DEFAULT_MAX_TOKENS, DEFAULT_TEMPRATURE, DEFAULT_TOP_P } from "@/constants";
import { randomUUID } from "node:crypto";

export function makeOpenAIAgent(
  openAI: OpenAI,
  memory: Memory,
  model: string,
  maxContextLength: number,
): Agent {
  return async function(stateId, input, options): Promise<AgentOutput> {
    const {
      maxTokens = DEFAULT_MAX_TOKENS,
      temperature = DEFAULT_TEMPRATURE,
      topP = DEFAULT_TOP_P,
    } = options;
    const { prompt, messages } = await memory.retrieve(stateId, input, maxContextLength);
    const response = await openAI.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: prompt },
        ...messages,
        { role: 'user', content: input },
      ],
      stream: true,
      temperature,
      top_p: topP,
      max_completion_tokens: maxTokens,
    });
    const newStateId = randomUUID();

    const stream = (async function* () { 
      for await (const chunk of response) {
        if (chunk.choices && chunk.choices.length > 0) {
          const content = chunk.choices[0]?.delta?.content ?? "";
          yield { content };
        }
      }
    })();

    return { state: newStateId, stream };
  }
}