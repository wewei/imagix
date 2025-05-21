import { embedMany } from "ai";
import { siliconFlow } from "./siliconFlow";

const embeddingModel = siliconFlow.textEmbeddingModel('BAAI/bge-large-zh-v1.5');

export const generateChunks = (input: string): string[] => input.split('.').filter(i => i !== '').map(c => c.trim());

export const generateEmbeddings = async (input: string): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(input);
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
}