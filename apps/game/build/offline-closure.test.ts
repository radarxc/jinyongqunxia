import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { CopiedAssetManifest } from './copied-assets';
import { buildOfflineClosures, enforceEnterBudget, MAX_ENTER_BYTES, MAX_OFFLINE_FILE_BYTES,
  traceEnterUrls } from './offline-closure';

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
  it('traces only each chapter base and opening-region asset references', () => {
    const copied: CopiedAssetManifest = { format: 1, files: [
      { url: '/assets/ch01.png', bytes: 1, sha256: '1'.repeat(64), kind: 'asset' },
      { url: '/assets/ch02.png', bytes: 1, sha256: '2'.repeat(64), kind: 'asset' },
      { url: '/assets/start.png', bytes: 1, sha256: '3'.repeat(64), kind: 'asset' },
      { url: '/assets/other.png', bytes: 1, sha256: '4'.repeat(64), kind: 'asset' },
      { url: '/assets/unused.png', bytes: 1, sha256: '5'.repeat(64), kind: 'asset' },
    ], references: { ch01_asset: ['/assets/ch01.png'], ch02_asset: ['/assets/ch02.png'],
      start_asset: ['/assets/start.png'], other_asset: ['/assets/other.png'] } };
    const ch01 = { chapter: 'ch01_tianlong', releaseHash: 'a'.repeat(64), leaves: [
      { logicalName: 'ch01.rules.base.json', rawBytes: 1, sha256: 'a'.repeat(64), load: 'chapter' as const },
      { logicalName: 'ch01.rules.start.json', rawBytes: 1, sha256: 'b'.repeat(64),
        load: 'region' as const, region: 'rg_start' },
      { logicalName: 'ch01.rules.other.json', rawBytes: 1, sha256: 'c'.repeat(64),
        load: 'region' as const, region: 'rg_other' },
    ] };
    const first = traceEnterUrls(ch01, {
      'ch01.rules.base.json': [{ schemaVersion: 'book-world.v1', id: 'ch01_tianlong',
        wake: { regionId: 'rg_start' } }, { asset: 'ch01_asset' }],
      'ch01.rules.start.json': { asset: 'start_asset' },
      'ch01.rules.other.json': { asset: 'other_asset' },
    }, copied);
    expect(first.openingRegion).toBe('rg_start');
    expect(first.assetUrls).toEqual(['/assets/ch01.png', '/assets/start.png']);
    expect(first.contentUrls).toEqual(['/content/ch01_tianlong/ch01.rules.base.json',
      '/content/ch01_tianlong/ch01.rules.start.json']);
    const ch02 = { chapter: 'ch02_shediao', releaseHash: 'd'.repeat(64), leaves: [
      { logicalName: 'ch02.rules.base.json', rawBytes: 1, sha256: 'd'.repeat(64), load: 'chapter' as const },
    ] };
    expect(traceEnterUrls(ch02, { 'ch02.rules.base.json': { asset: 'ch02_asset' } }, copied).assetUrls)
      .toEqual(['/assets/ch02.png']);
  });
  it('emits deterministic sorted files with full sha256', async () => {
    const dirs = await fixture(); const first = await buildOfflineClosures(dirs);
    const bytes = await readFile(join(dirs.outDir, 'offline/closure.ch01_tianlong.json'));
    const version = await readFile(join(dirs.outDir, 'version.json'));
    const second = await buildOfflineClosures(dirs);
    expect(await readFile(join(dirs.outDir, 'offline/closure.ch01_tianlong.json'))).toEqual(bytes);
    expect(await readFile(join(dirs.outDir, 'version.json'))).toEqual(version);
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
  it('keeps unreferenced copied assets in the full closure but out of enter bytes', async () => {
    const dirs = await fixture(); const referenced = Buffer.from('used'); const unused = Buffer.from('unused');
    await mkdir(join(dirs.publicDir, 'assets'), { recursive: true });
    await mkdir(join(dirs.outDir, 'offline'), { recursive: true });
    await writeFile(join(dirs.publicDir, 'assets/used.png'), referenced);
    await writeFile(join(dirs.publicDir, 'assets/unused.png'), unused);
    const path = join(dirs.publicDir, 'content/ch01_tianlong/ch01.rules.base.json');
    const value = Buffer.from(JSON.stringify({ asset: 'used_asset' })); await writeFile(path, value);
    const manifestPath = join(dirs.publicDir, 'content/ch01_tianlong/manifest.json');
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as { leaves: { rawBytes: number; sha256: string }[] };
    manifest.leaves[0] = { ...manifest.leaves[0]!, rawBytes: value.byteLength, sha256: hash(value) };
    await writeFile(manifestPath, JSON.stringify(manifest));
    await writeFile(join(dirs.outDir, 'offline/copied-assets.json'), JSON.stringify({ format: 1, files: [
      { url: '/assets/used.png', bytes: referenced.byteLength, sha256: hash(referenced), kind: 'asset' },
      { url: '/assets/unused.png', bytes: unused.byteLength, sha256: hash(unused), kind: 'asset' },
    ], references: { used_asset: ['/assets/used.png'] } }));
    const [closure] = await buildOfflineClosures(dirs);
    expect(closure!.files.map(file => file.url)).toContain('/assets/unused.png');
    expect(closure!.totals.enterBytes).toBeLessThan(closure!.totals.bytes - unused.byteLength + 1);
  });
});
