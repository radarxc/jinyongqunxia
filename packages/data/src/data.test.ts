import { describe, expect, it } from 'vitest';
import { loadChapterPack, type ContentSource } from './index';
import { emitLeaves, createManifest } from './build';
import { ChapterPackManifestSchema, ContentManifestSchema } from './schemas';

const hash = 'a'.repeat(64);
async function fixture(tamper = false): Promise<{ source: ContentSource; manifest: Awaited<ReturnType<typeof createManifest>> }> {
  const leaves = await emitLeaves([{ logicalName: 'ch01.rules.base.json', kind: 'rules',
    load: 'chapter', value: { damage: 1 } }]);
  const manifest = await createManifest('ch01_tianlong', hash, leaves, []);
  const values = new Map<string, unknown>([[
    'ch01_tianlong/manifest.json', manifest,
  ], ['ch01_tianlong/ch01.rules.base.json', tamper ? { damage: 2 } : { damage: 1 }]]);
  return { manifest, source: { readJson: async (path) => values.get(path) } };
}

describe('data boundaries', () => {
  it('keeps the legacy content manifest strict', () => {
    expect(ContentManifestSchema.parse({ schemaVersion: 1, chapterId: 'ch01_tianlong',
      contentHash: hash, files: ['rules.json'] }).chapterId).toBe('ch01_tianlong');
    expect(() => ContentManifestSchema.parse({ schemaVersion: 1, chapterId: 'ch01_tianlong',
      contentHash: hash, files: [], extra: true })).toThrow();
  });

  it('accepts and loads the strict leaf manifest', async () => {
    const { source, manifest } = await fixture();
    expect(ChapterPackManifestSchema.parse(manifest)).toEqual(manifest);
    const pack = await loadChapterPack(source, 'ch01_tianlong');
    expect(pack.manifest.chapter).toBe('ch01_tianlong');
    expect(pack.leaves['ch01.rules.base.json']).toEqual({ damage: 1 });
  });

  it('propagates source errors and rejects malformed packs', async () => {
    await expect(loadChapterPack({ readJson: async () => null }, 'ch01_tianlong'))
      .rejects.toThrow('INVALID_CHAPTER_PACK');
    await expect(loadChapterPack({ readJson: async () => { throw new Error('offline'); } },
      'ch01_tianlong')).rejects.toThrow('offline');
  });

  it('rejects another chapter before loading leaves', async () => {
    const { manifest } = await fixture();
    const other = { ...manifest, chapter: 'ch02_shediao' };
    await expect(loadChapterPack({ readJson: async () => other }, 'ch01_tianlong'))
      .rejects.toThrow('CHAPTER_PACK_ID_MISMATCH');
  });

  it('rejects tampered leaf bytes', async () => {
    const { source } = await fixture(true);
    await expect(loadChapterPack(source, 'ch01_tianlong'))
      .rejects.toThrow('CHAPTER_PACK_LEAF_HASH_MISMATCH:ch01.rules.base.json');
  });

  it('rejects malformed remap rows before hash validation', async () => {
    const { manifest } = await fixture();
    const malformed = { ...manifest, idRemaps: [{ from: 'it_old', to: 'it_new',
      since: hash, reason: 'must not ship' }] };
    await expect(loadChapterPack({ readJson: async () => malformed }, 'ch01_tianlong'))
      .rejects.toThrow('INVALID_CHAPTER_PACK');
  });

  it('rejects a non-canonical leaf manifest', async () => {
    const { manifest } = await fixture();
    await expect(loadChapterPack({
      readJson: async () => ({
        ...manifest,
        contentHash: 'not-a-sha256',
        unexpected: true,
      }),
    }, 'ch01_tianlong')).rejects.toThrow('INVALID_CHAPTER_PACK');
  });

  it('rejects text hash coverage and remap ordering mismatches', async () => {
    const { manifest } = await fixture();
    const noLeafForLocale = { ...manifest, textHashes: { 'zh-Hant': hash } };
    await expect(loadChapterPack({ readJson: async () => noLeafForLocale }, 'ch01_tianlong'))
      .rejects.toThrow('INVALID_CHAPTER_PACK');
    const unordered = { ...manifest, idRemaps: [
      { from: 'it_z', to: 'it_new', since: hash },
      { from: 'it_a', to: 'it_new', since: hash },
    ] };
    await expect(loadChapterPack({ readJson: async () => unordered }, 'ch01_tianlong'))
      .rejects.toThrow('INVALID_CHAPTER_PACK');
  });
});
