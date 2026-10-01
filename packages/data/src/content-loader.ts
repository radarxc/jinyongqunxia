export interface ChapterPack {
  readonly manifest: {
    readonly schemaVersion: 1;
    readonly chapterId: string;
    readonly contentHash: string;
    readonly files: readonly string[];
  };
  readonly payload: Readonly<Record<string, unknown>>;
}

export interface ContentSource {
  readJson(path: string): Promise<unknown>;
}

const HASH_PATTERN = /^[a-f0-9]{64}$/;
const CHAPTER_PATTERN = /^ch(?:0[0-9]|1[0-5])_[a-z0-9]+(?:_[a-z0-9]+)*$/;

function freezePack<T>(value: T, seen = new Set<object>()): T {
  if (typeof value !== 'object' || value === null || seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) freezePack(child, seen);
  return Object.freeze(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const allowed = new Set(keys);
  return Object.keys(value).every((key) => allowed.has(key));
}

export async function loadChapterPack(
  source: ContentSource,
  chapterId: string,
): Promise<ChapterPack> {
  const value = await source.readJson(`${chapterId}/pack.json`);
  if (!isRecord(value) || !hasOnlyKeys(value, ['manifest', 'payload']) ||
      !isRecord(value['manifest']) || !isRecord(value['payload'])) {
    throw new TypeError('INVALID_CHAPTER_PACK');
  }
  const manifest = value['manifest'];
  const files = manifest['files'];
  if (
    manifest['schemaVersion'] !== 1 ||
    !hasOnlyKeys(manifest, ['schemaVersion', 'chapterId', 'contentHash', 'files']) ||
    typeof manifest['chapterId'] !== 'string' || !CHAPTER_PATTERN.test(manifest['chapterId']) ||
    typeof manifest['contentHash'] !== 'string' || !HASH_PATTERN.test(manifest['contentHash']) ||
    !Array.isArray(files) ||
    !files.every((entry) => typeof entry === 'string' && entry.length > 0)
  ) {
    throw new TypeError('INVALID_CHAPTER_PACK');
  }
  if (manifest['chapterId'] !== chapterId) throw new TypeError('CHAPTER_PACK_ID_MISMATCH');
  return freezePack({
    manifest: {
      schemaVersion: 1,
      chapterId: manifest['chapterId'],
      contentHash: manifest['contentHash'],
      files: [...files],
    },
    payload: structuredClone(value['payload']),
  });
}
