import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const metodologiaCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/metodologia" }),
  schema: z.object({
    title: z.string(),
    order: z.number().optional(),
    description: z.string().optional(),
  }),
});

export const collections = {
  'metodologia': metodologiaCollection,
};
