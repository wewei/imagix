import { embed, embedMany } from "ai";
import { siliconFlow } from "./siliconFlow";
import { db } from "@/lib/db";
import { cosineDistance, sql, gt, desc } from "drizzle-orm";
import { embeddings } from "@/lib/db/schema/embeddings";

// const embeddingModel = siliconFlow.textEmbeddingModel('BAAI/bge-large-zh-v1.5');
const embeddingModel = siliconFlow.textEmbeddingModel('netease-youdao/bce-embedding-base_v1');

export const generateChunks = (input: string): string[] => input.split('.').filter(i => i !== '').map(c => c.trim());

export const generateEmbeddings = async (input: string): Promise<{ embedding: number[]; content: string }[]> => {
  const chunks = generateChunks(input);
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
}

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.trim().replaceAll(/\s+/g, ' ');
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
}

export const findRelevantContent = async (userQuery: string): Promise<{ content: string; similarity: number }[]> => {
  const userQueryEmbedding = await generateEmbedding(userQuery);
  const similarity = sql<number>`1 - (${cosineDistance(embeddings.embedding, userQueryEmbedding)})`;
  const similarGuides = await db
    .select({ content: embeddings.content, similarity })
    .from(embeddings)
    .where(gt(similarity, 0.5))
    .orderBy(t => desc(t.similarity))
    .limit(4);
  console.log('similarGuides', similarGuides);
  return similarGuides;
}
