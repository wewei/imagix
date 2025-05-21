// import { createDeepSeek } from "@ai-sdk/deepseek";

// export const siliconFlow = createDeepSeek({ baseURL: 'https://api.siliconflow.cn/v1/' });
import { createOpenAI } from "@ai-sdk/openai";

export const siliconFlow = createOpenAI({ baseURL: 'https://api.siliconflow.cn/v1/' });
