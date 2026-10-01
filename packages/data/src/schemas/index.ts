import { z } from 'zod';

export const ChapterIdSchema = z.string().regex(/^ch(?:0[0-9]|1[0-5])_[a-z0-9_]+$/);
export const ContentManifestSchema = z.strictObject({
  schemaVersion: z.literal(1),
  chapterId: ChapterIdSchema,
  contentHash: z.string().regex(/^[a-f0-9]{64}$/),
  files: z.array(z.string().min(1)).readonly(),
});

export type ContentManifest = z.output<typeof ContentManifestSchema>;
