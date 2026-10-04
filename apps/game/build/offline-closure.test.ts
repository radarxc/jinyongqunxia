import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildOfflineClosures, enforceEnterBudget, MAX_ENTER_BYTES, MAX_OFFLINE_FILE_BYTES } from './offline-closure';

const hash = (value: Buffer) => createHash('sha256').update(value).digest('hex');
async function fixture(file = Buffer.from('{"ok":true}')): Promise<{ publicDir: string; outDir: string }> {
  const root = await mkdtemp(join(tmpdir(), 'ts-offline-')); const publicDir = join(root, 'public');
  const outDir = join(root, 'dist'); const chapter = 'ch01_tianlong';
  await mkdir(join(publicDir, 'content', chapter), { recursive: true });
  const leaf = { logicalName: 'ch01.rules.base.json', rawBytes: file.byteLength, sha256: hash(file),
    load: 'chapter' };
  const manifest = { chapter, releaseHash: 'a'.repeat(64), leaves: [leaf] };
  await writeFile(join(publicDir, 'content', chapter, leaf.logicalName), file);
  await writeFile(join(publicDir, 'content', chapter, 'manifest.json'), JSON.stringify(manifest));
  await writeFile(join(publicDir, 'content/index.json'), JSON.stringify({ chapters: [{ chapter,
    manifest: `${chapter}/manifest.json`, releaseHash: manifest.releaseHash }] }));
  return { publicDir, outDir };
}

describe('buildOfflineClosures', () => {
  it('emits deterministic sorted files with full sha256', async () => {
    const dirs = await fixture(); const first = await buildOfflineClosures(dirs);
    const bytes = await readFile(join(dirs.outDir, 'offline/closure.ch01_tianlong.json'));
    const second = await buildOfflineClosures(dirs);
    expect(await readFile(join(dirs.outDir, 'offline/closure.ch01_tianlong.json'))).toEqual(bytes);
    expect(first).toEqual(second); expect(first[0]!.files[0]!.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(first[0]!.files.some(file => file.url === '/content/index.json' &&
      file.kind === 'manifest')).toBe(true);
  });
  it('rejects a single file above 8 MiB', async () => {
    const dirs = await fixture(Buffer.alloc(MAX_OFFLINE_FILE_BYTES + 1));
    await expect(buildOfflineClosures(dirs)).rejects.toThrow('OFFLINE_FILE_TOO_LARGE');
  });
  it('warns only for the unfinished ch00 enter set and rejects other over-budget chapters', () => {
    const warnings: string[] = [];
    enforceEnterBudget('ch00_yuenv', MAX_ENTER_BYTES + 1, message => warnings.push(message));
    expect(warnings).toEqual([`OFFLINE_ENTER_TOO_LARGE:ch00_yuenv:${MAX_ENTER_BYTES + 1}`]);
    expect(() => enforceEnterBudget('ch01_tianlong', MAX_ENTER_BYTES + 1)).toThrow('OFFLINE_ENTER_TOO_LARGE');
  });
  it('rejects a content-index row that disagrees with its manifest', async () => {
    const dirs = await fixture();
    const path = join(dirs.publicDir, 'content/index.json');
    const index = JSON.parse(await readFile(path, 'utf8')) as { chapters: { releaseHash: string }[] };
    index.chapters[0]!.releaseHash = 'b'.repeat(64); await writeFile(path, JSON.stringify(index));
    await expect(buildOfflineClosures(dirs)).rejects.toThrow('OFFLINE_MANIFEST_MISMATCH');
  });
});
