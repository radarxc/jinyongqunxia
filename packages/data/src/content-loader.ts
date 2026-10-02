import { canonicalJson, compareCodePoints, type JsonValue } from '@tianshu/shared';

export interface ChapterPackLeaf {
  readonly logicalName: string; readonly kind: 'rules' | 'text'; readonly locale?: string;
  readonly region?: string; readonly rawBytes: number; readonly gzipBytes: number;
  readonly sha256: string; readonly load: 'resident' | 'chapter' | 'region';
}
export interface ChapterPackManifest {
  readonly format: 1; readonly chapter: string; readonly schemaHash: string;
  readonly contentHash: string; readonly textHashes: Readonly<Record<string, string>>;
  readonly releaseHash: string; readonly idRemaps: readonly { from: string; to: string; since: string }[];
  readonly leaves: readonly ChapterPackLeaf[];
}
export interface ChapterPack { readonly manifest: ChapterPackManifest;
  readonly leaves: Readonly<Record<string, unknown>>; }
export interface ContentSource { readJson(path: string): Promise<unknown>; }
const HASH = /^[a-f0-9]{64}$/u;
const CHAPTER = /^ch(?:0[0-9]|1[0-5])_[a-z0-9]+(?:_[a-z0-9]+)*$/u;
const encoder = new TextEncoder();
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const only = (value: Record<string, unknown>, keys: readonly string[]): boolean =>
  Object.keys(value).every((key) => keys.includes(key));
function validRemap(value: unknown): boolean {
  return isRecord(value) && only(value, ['from', 'to', 'since']) &&
    typeof value['from'] === 'string' && value['from'].length > 0 &&
    typeof value['to'] === 'string' && value['to'].length > 0 &&
    typeof value['since'] === 'string' && HASH.test(value['since']);
}
function freeze<T>(value: T, seen = new Set<object>()): T {
  if (typeof value !== 'object' || value === null || seen.has(value)) return value;
  seen.add(value); Object.values(value).forEach((child) => freeze(child, seen)); return Object.freeze(value);
}
async function hash(value: unknown): Promise<string> {
  const bytes = encoder.encode(canonicalJson(value as JsonValue));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
function parseLeaf(raw: unknown): ChapterPackLeaf {
  if (!isRecord(raw) || !only(raw, ['logicalName', 'kind', 'locale', 'region', 'rawBytes', 'gzipBytes', 'sha256', 'load']) ||
      typeof raw['logicalName'] !== 'string' || !/^[a-z0-9-]+(?:\.[A-Za-z0-9-]+)+\.json$/u.test(raw['logicalName']) ||
      !['rules', 'text'].includes(String(raw['kind'])) || !Number.isSafeInteger(raw['rawBytes']) || Number(raw['rawBytes']) < 0 ||
      !Number.isSafeInteger(raw['gzipBytes']) || Number(raw['gzipBytes']) < 0 || typeof raw['sha256'] !== 'string' || !HASH.test(raw['sha256']) ||
      !['resident', 'chapter', 'region'].includes(String(raw['load'])) ||
      ((raw['kind'] === 'text') !== (typeof raw['locale'] === 'string')) ||
      (raw['region'] !== undefined && (typeof raw['region'] !== 'string' || !/^rg_[a-z0-9_]+$/u.test(raw['region']))))
    throw new TypeError('INVALID_CHAPTER_PACK');
  return raw as unknown as ChapterPackLeaf;
}
function parseManifest(raw: unknown): ChapterPackManifest {
  if (!isRecord(raw) || !only(raw, ['format', 'chapter', 'schemaHash', 'contentHash', 'textHashes', 'releaseHash', 'idRemaps', 'leaves']) ||
      raw['format'] !== 1 || typeof raw['chapter'] !== 'string' || !CHAPTER.test(raw['chapter']) ||
      typeof raw['schemaHash'] !== 'string' || !HASH.test(raw['schemaHash']) || typeof raw['contentHash'] !== 'string' || !HASH.test(raw['contentHash']) ||
      typeof raw['releaseHash'] !== 'string' || !HASH.test(raw['releaseHash']) || !isRecord(raw['textHashes']) ||
      !Object.values(raw['textHashes']).every((entry) => typeof entry === 'string' && HASH.test(entry)) ||
      !Array.isArray(raw['idRemaps']) || !raw['idRemaps'].every(validRemap) ||
      !Array.isArray(raw['leaves'])) throw new TypeError('INVALID_CHAPTER_PACK');
  const leaves = raw['leaves'].map(parseLeaf); const names = leaves.map((leaf) => leaf.logicalName);
  const textHashes = raw['textHashes'] as Record<string, unknown>;
  if (names.some((name, index) => index > 0 && compareCodePoints(names[index - 1]!, name) >= 0) ||
      new Set(leaves.map((leaf) => leaf.sha256)).size !== leaves.length ||
      Object.keys(textHashes).some((locale) =>
        !leaves.some((leaf) => leaf.kind === 'text' && leaf.locale === locale)) ||
      leaves.some((leaf) => leaf.kind === 'text' &&
        !(leaf.locale! in textHashes)) ||
      raw['idRemaps'].some((remap, index, rows) => index > 0 &&
        compareCodePoints((rows[index - 1] as Record<string, string>)['from']!,
          (remap as Record<string, string>)['from']!) >= 0))
    throw new TypeError('INVALID_CHAPTER_PACK');
  return { ...(raw as unknown as ChapterPackManifest), leaves };
}
export async function loadChapterPack(source: ContentSource, chapterId: string): Promise<ChapterPack> {
  const manifest = parseManifest(await source.readJson(`${chapterId}/manifest.json`));
  if (manifest.chapter !== chapterId) throw new TypeError('CHAPTER_PACK_ID_MISMATCH');
  const base = { ...manifest, releaseHash: undefined } as Record<string, unknown>; delete base['releaseHash'];
  if (await hash(base) !== manifest.releaseHash) throw new TypeError('CHAPTER_PACK_RELEASE_HASH_MISMATCH');
  const values: Record<string, unknown> = {};
  for (const leaf of manifest.leaves) {
    const value = await source.readJson(`${chapterId}/${leaf.logicalName}`);
    const bytes = encoder.encode(canonicalJson(value as JsonValue));
    if (bytes.byteLength !== leaf.rawBytes || await hash(value) !== leaf.sha256)
      throw new TypeError(`CHAPTER_PACK_LEAF_HASH_MISMATCH:${leaf.logicalName}`);
    values[leaf.logicalName] = value;
  }
  const pairs = (kind: 'rules' | 'text', locale?: string): [string, string][] => manifest.leaves
    .filter((leaf) => leaf.kind === kind && (locale === undefined || leaf.locale === locale))
    .map((leaf) => [leaf.logicalName, leaf.sha256]);
  const remapHash = await hash(manifest.idRemaps);
  if (await hash(['tianshu-content-v1', ...pairs('rules'), ['id-remaps', remapHash]]) !== manifest.contentHash)
    throw new TypeError('CHAPTER_PACK_CONTENT_HASH_MISMATCH');
  for (const [locale, expected] of Object.entries(manifest.textHashes))
    if (await hash(['tianshu-text-v1', locale, ...pairs('text', locale)]) !== expected)
      throw new TypeError(`CHAPTER_PACK_TEXT_HASH_MISMATCH:${locale}`);
  return freeze({ manifest, leaves: values });
}
