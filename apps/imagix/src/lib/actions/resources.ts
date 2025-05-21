'use server';

import {
  NewResourceParams,
  insertResourceSchema,
  resources
} from '@/lib/db/schema/resources';
import { db } from '@/lib/db';
import { generateEmbeddings } from '@/lib/ai/embedding';
import { embeddings as embeddingsTable } from '@/lib/db/schema/embeddings';

export const createResource = async (input: NewResourceParams) => {
  try {
    const { content } = insertResourceSchema.parse(input);

    const [resource] = await db
      .insert(resources)
      .values({ content })
      .returning()

    const embeddings = await generateEmbeddings(content);

    console.log('embeddings', embeddings);

    const result = await db.insert(embeddingsTable).values(
      embeddings.map((embedding) => ({
        resourceId: resource.id,
        ...embedding
      }))
    );

    console.log('result', result);

    return 'Resource successfully created and embedded';
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating resource:', error);
      return error.message.length > 0 ? error.message : 'Error creating resource';
    }
  }
}