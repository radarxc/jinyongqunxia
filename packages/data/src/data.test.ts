import { describe, expect, it } from 'vitest';
import { loadChapterPack } from './index';
import { ContentManifestSchema } from './schemas';

const hash = 'a'.repeat(64);

describe('data boundaries', () => {
  it('accepts a strict content manifest', () => {
    expect(
      ContentManifestSchema.parse({
        schemaVersion: 1,
        chapterId: 'ch01_tianlong',
        contentHash: hash,
        files: ['rules.json'],
      }).chapterId,
    ).toBe('ch01_tianlong');
    expect(() =>
      ContentManifestSchema.parse({
        schemaVersion: 1,
        chapterId: 'ch01_tianlong',
        contentHash: hash,
        files: [],
        extra: true,
      }),
    ).toThrow();
  });

  it('loads a lightweight pack without importing schemas', async () => {
    const pack = await loadChapterPack(
      {
        readJson: async (path) => ({
          manifest: {
            schemaVersion: 1,
            chapterId: path.split('/')[0],
            contentHash: hash,
            files: [],
          },
          payload: { npcs: [] },
        }),
      },
      'ch01_tianlong',
    );
    expect(pack.manifest.chapterId).toBe('ch01_tianlong');
  });

  it('propagates source errors and rejects malformed packs', async () => {
    await expect(loadChapterPack({ readJson: async () => null }, 'ch01_tianlong')).rejects.toThrow(
      'INVALID_CHAPTER_PACK',
    );
    await expect(
      loadChapterPack(
        {
          readJson: async () => {
            throw new Error('offline');
          },
        },
        'ch01_tianlong',
      ),
    ).rejects.toThrow('offline');
  });

  it('rejects a pack whose manifest belongs to another chapter', async () => {
    await expect(
      loadChapterPack(
        {
          readJson: async () => ({
            manifest: { schemaVersion: 1, chapterId: 'ch02_shediao', contentHash: hash, files: [] },
            payload: {},
          }),
        },
        'ch01_tianlong',
      ),
    ).rejects.toThrow('CHAPTER_PACK_ID_MISMATCH');
  });

  it('rejects a pack with a non-canonical manifest', async () => {
    await expect(
      loadChapterPack(
        {
          readJson: async () => ({
            manifest: {
              schemaVersion: 1,
              chapterId: 'ch01_tianlong',
              contentHash: 'not-a-sha256',
              files: ['rules.json'],
              unexpected: true,
            },
            payload: {},
          }),
        },
        'ch01_tianlong',
      ),
    ).rejects.toThrow('INVALID_CHAPTER_PACK');
  });
});
