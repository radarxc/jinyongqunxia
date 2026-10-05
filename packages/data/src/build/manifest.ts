import { compareCodePoints, type JsonValue } from '@tianshu/shared';
import { ChapterPackManifestSchema, type ChapterPackManifest, type IdRemap } from '../schemas';
import { canonicalBytes, hashValue } from './hash';
import type { EmittedLeaf } from './types';

const pairs = (leaves: readonly EmittedLeaf[]): [string, string][] =>
  leaves.map((leaf): [string, string] => [leaf.logicalName, leaf.sha256])
    .sort((left, right) => compareCodePoints(left[0], right[0]));

export async function createManifest(chapter: string, schemaHash: string, leaves: readonly EmittedLeaf[],
  idRemaps: readonly IdRemap[]): Promise<ChapterPackManifest> {
  const publishedRemaps = idRemaps.map(({ from, to, since }) => ({ from, to, since }))
    .sort((left, right) => compareCodePoints(left.from, right.from));
  const rules = leaves.filter((leaf) => leaf.kind === 'rules');
  const remapHash = await hashValue(publishedRemaps);
  const contentHash = await hashValue(['tianshu-content-v1', ...pairs(rules),
    ['id-remaps', remapHash]]);
  const locales = [...new Set(leaves.flatMap((leaf) => leaf.locale === undefined ? [] : [leaf.locale]))]
    .sort(compareCodePoints);
  const textHashes: Record<string, string> = {};
  for (const locale of locales) textHashes[locale] = await hashValue(['tianshu-text-v1', locale,
    ...pairs(leaves.filter((leaf) => leaf.kind === 'text' && leaf.locale === locale))]);
  const base = { format: 1 as const, chapter, schemaHash, contentHash, textHashes, idRemaps: publishedRemaps,
    leaves: [...leaves].sort((left, right) => compareCodePoints(left.logicalName, right.logicalName))
      .map((leaf) => ({ logicalName: leaf.logicalName, kind: leaf.kind,
      ...(leaf.locale === undefined ? {} : { locale: leaf.locale }),
      ...(leaf.region === undefined ? {} : { region: leaf.region }), rawBytes: leaf.bytes.byteLength,
      gzipBytes: leaf.gzipBytes, sha256: leaf.sha256, load: leaf.load })) };
  const releaseHash = await hashValue(base);
  return ChapterPackManifestSchema.parse({ ...base, releaseHash });
}

export function manifestBytes(manifest: ChapterPackManifest): Uint8Array {
  return canonicalBytes(manifest as unknown as JsonValue, true);
}
