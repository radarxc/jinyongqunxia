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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function loadChapterPack(
  source: ContentSource,
  chapterId: string,
): Promise<ChapterPack> {
  const value = await source.readJson(`${chapterId}/pack.json`);
  if (!isRecord(value) || !isRecord(value['manifest']) || !isRecord(value['payload'])) {
    throw new TypeError('INVALID_CHAPTER_PACK');
  }
  const manifest = value['manifest'];
  const files = manifest['files'];
  if (
    manifest['schemaVersion'] !== 1 ||
    typeof manifest['chapterId'] !== 'string' ||
    typeof manifest['contentHash'] !== 'string' ||
    !Array.isArray(files) ||
    !files.every((entry) => typeof entry === 'string')
  ) {
    throw new TypeError('INVALID_CHAPTER_PACK');
  }
  if (manifest['chapterId'] !== chapterId) throw new TypeError('CHAPTER_PACK_ID_MISMATCH');
  return {
    manifest: {
      schemaVersion: 1,
      chapterId: manifest['chapterId'],
      contentHash: manifest['contentHash'],
      files,
    },
    payload: value['payload'],
  };
}
