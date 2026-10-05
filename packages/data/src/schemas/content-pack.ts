import { z } from 'zod';
import { compareCodePoints } from '@tianshu/shared';
import { ChapterIdSchema } from './primitives';

const HashSchema = z.string().regex(/^[a-f0-9]{64}$/);
const LogicalNameSchema = z.string().regex(/^[a-z0-9-]+(?:\.[A-Za-z0-9-]+)+\.json$/);

export const IdRemapSchema = z.strictObject({
  from: z.string().min(1), to: z.string().min(1), since: HashSchema, reason: z.string().min(1),
});
export const ManifestIdRemapSchema = IdRemapSchema.omit({ reason: true });

export const ChapterPackLeafSchema = z.strictObject({
  logicalName: LogicalNameSchema,
  kind: z.enum(['rules', 'text']),
  locale: z.string().min(1).optional(),
  region: z.string().regex(/^rg_[a-z0-9_]+$/).optional(),
  rawBytes: z.number().int().nonnegative(),
  gzipBytes: z.number().int().nonnegative(),
  sha256: HashSchema,
  load: z.enum(['resident', 'chapter', 'region']),
}).superRefine((leaf, context) => {
  if ((leaf.kind === 'text') !== (leaf.locale !== undefined)) {
    context.addIssue({ code: 'custom', path: ['locale'], message: 'text leaves require locale; rules forbid it' });
  }
});

export const ChapterPackManifestSchema = z.strictObject({
  format: z.literal(1), chapter: ChapterIdSchema, schemaHash: HashSchema,
  contentHash: HashSchema, textHashes: z.record(z.string().min(1), HashSchema),
  releaseHash: HashSchema, idRemaps: z.array(ManifestIdRemapSchema),
  leaves: z.array(ChapterPackLeafSchema),
}).superRefine((manifest, context) => {
  const names = manifest.leaves.map((leaf) => leaf.logicalName);
  const sorted = [...names].sort((left, right) =>
    left < right ? -1 : left > right ? 1 : 0);
  if (names.some((name, index) => name !== sorted[index]))
    context.addIssue({ code: 'custom', path: ['leaves'], message: 'leaves must be sorted' });
  if (new Set(names).size !== names.length)
    context.addIssue({ code: 'custom', path: ['leaves'], message: 'logical names must be unique' });
  const hashes = manifest.leaves.map((leaf) => leaf.sha256);
  if (new Set(hashes).size !== hashes.length)
    context.addIssue({ code: 'custom', path: ['leaves'], message: 'leaf hashes must be unique' });
  for (const locale of Object.keys(manifest.textHashes)) if (!manifest.leaves.some((leaf) =>
    leaf.kind === 'text' && leaf.locale === locale))
    context.addIssue({ code: 'custom', path: ['textHashes', locale], message: 'locale has no text leaf' });
  for (const leaf of manifest.leaves) if (leaf.kind === 'text' &&
      manifest.textHashes[leaf.locale!] === undefined)
    context.addIssue({ code: 'custom', path: ['textHashes'], message: `missing ${leaf.locale!} text hash` });
  const remapFrom = manifest.idRemaps.map((remap) => remap.from);
  if (remapFrom.some((from, index) => index > 0 &&
      compareCodePoints(from, remapFrom[index - 1]!) <= 0))
    context.addIssue({ code: 'custom', path: ['idRemaps'], message: 'id remaps must be sorted and unique' });
});

export type ChapterPackLeaf = z.output<typeof ChapterPackLeafSchema>;
export type ChapterPackManifest = z.output<typeof ChapterPackManifestSchema>;
export type IdRemap = z.output<typeof IdRemapSchema>;
export type ManifestIdRemap = z.output<typeof ManifestIdRemapSchema>;
