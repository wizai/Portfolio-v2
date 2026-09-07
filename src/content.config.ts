import { defineCollection, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

const textGridItemSchema = z.object({
  title: z.string(),
  description: z.string()
});

const gridMediaItemSchema = (context: SchemaContext) => z.object({
  mediaImg: context.image(), 
  videoWebm: z.string().optional(),
  videoMp4: z.string().optional(),
  altText: z.string(),
  aspectClass: z.string().optional()
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: (context: SchemaContext) => z.object({
    title: z.string(),
    tagline: z.string(),
    context: z.string(),
    contextDetail: z.string().optional(),
    timeline: z.string(),
    pubDate: z.coerce.date(),
    stack: z.string(),
    websiteUrl: z.string().url(),
    
    coverImg: context.image(),
    coverAspectClass: z.string().optional(),

    mediasFirst: z.array(gridMediaItemSchema(context)),
    mediasSecond: z.array(gridMediaItemSchema(context)).optional(),
    mediasThird: z.array(gridMediaItemSchema(context)).optional(),
    mediasFourth: z.array(gridMediaItemSchema(context)).optional(),
    
    textGridFirstTitle: z.string(),
    textGridFirst: z.array(textGridItemSchema),
    textGridSecondTitle: z.string(),
    textGridSecond: z.array(textGridItemSchema)
  }),
});

export const collections = { projects };
