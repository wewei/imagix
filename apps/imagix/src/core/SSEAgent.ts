import type { Agent, StateId, ChatOptions, Chunk, ChatEvent } from "./types";

export function makeSSEAgent(baseUrl: string): Agent {
  async function postUserMessage(content: string, stateId: StateId | null, options: ChatOptions): Promise<StateId> {
    const url = stateId ? `${baseUrl}/${stateId}` : baseUrl;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        options,
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to post user message: ${response.statusText}`);
    }
    const { id } = await response.json() as { id: StateId };
    return id;
  }

  async function getAssistantMessage(stateId: StateId): Promise<{
    stream: ReadableStream<Chunk>;
    assistantStateId: Promise<StateId>;
  }> {
    const url = `${baseUrl}/${stateId}`;
    const sse = new EventSource(url);
    const { readable: stream, writable } = new TransformStream<Chunk>();
    const assistantStateId = new Promise<StateId>((resolve, reject) => {
      const handleClose = () => {
        writable.getWriter().close();
        sse.close();
      };
      const handleError = (error: Error) => {
        reject(error);
        handleClose();
      };
      sse.addEventListener("message", (event) => {
        const data = JSON.parse(event.data) as ChatEvent;
        if (data.type === "chunk") {
          const { content } = data;
          if (typeof content !== "string") {
            return handleError(new Error("Invalid chunk data"));
          }
          writable.getWriter().write({ content });
        } else if (data.type === "done") {
          const { state } = data;
          if (typeof state !== "string") {
            return handleError(new Error("Invalid done data"));
          }
          resolve(data.state);
          writable.getWriter().close();
          sse.close();
        }
      });
      sse.addEventListener("error", (event) => {
        handleError(new Error("SSE error", { cause: event }));
      });
    });

    return { stream, assistantStateId };
  }

  return {
    chat: async (content, stateId, options) => {
      const userStateId = await postUserMessage(content, stateId, options);
      const { stream, assistantStateId } = await getAssistantMessage(userStateId);
      return { stream, userState: userStateId, assistantState: assistantStateId };
    }
  };
}
