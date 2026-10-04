import { describe, expect, it } from 'vitest';
import { ASSET_CACHE, cacheRequestForFile, contentCacheName, MANIFEST_CACHE,
  pruneSupersededAssets, putRecord, stagingCacheName } from './cache';
import { collectOfflineGarbage } from './gc';
import { MemoryCacheStorage } from './memory-cache';
import { publishOfflineClosures } from './publication';
import type { InstalledClosureRecord, OfflineFile } from './types';

const record = (chapter: string, release: string, installedAt: number,
  files: readonly OfflineFile[] = []): InstalledClosureRecord => ({
  format: 1, installedAt, lastVerifiedAt: installedAt, state: 'active', pinned: true,
  closure: { format: 1, chapter, releaseHash: release, files,
    totals: { files: files.length, bytes: files.reduce((sum, file) => sum + file.bytes, 0), enterBytes: 0,
      byKind: { manifest: 0, content: 0, asset: 0, vfx: 0 } } },
});

describe('collectOfflineGarbage', () => {
  it('keeps current chapter releases plus one previous release', async () => {
    const storage = new MemoryCacheStorage(); const releases = ['a', 'b', 'c'].map(value => value.repeat(64));
    const manifests = await storage.open(MANIFEST_CACHE); const files: OfflineFile[] = [];
    for (let index = 0; index < releases.length; index += 1) {
      const file: OfflineFile = { url: '/content/ch01_tianlong/manifest.json', bytes: 1,
        sha256: String(index + 1).repeat(64), kind: 'manifest' };
      files.push(file); await manifests.put(cacheRequestForFile(file), new Response(String(index)));
      await putRecord(storage, record('ch01_tianlong', releases[index]!, index, [file]));
      await storage.open(contentCacheName(releases[index]!));
    }
    const result = await collectOfflineGarbage({ cacheStorage: storage, reason: 'build-switch' });
    expect(result.keptReleases).toEqual([releases[1], releases[2]].sort());
    expect(result.removedReleases).toEqual([releases[0]]);
    expect(await storage.has(contentCacheName(releases[0]!))).toBe(false);
    expect(await manifests.match(cacheRequestForFile(files[0]!))).toBeUndefined();
    expect(await manifests.match(cacheRequestForFile(files[1]!))).toBeDefined();
    expect(await manifests.match(cacheRequestForFile(files[2]!))).toBeDefined();
  });

  it('keeps an active pointer even after its record row becomes evictable', async () => {
    const storage = new MemoryCacheStorage(); const current = '6'.repeat(64); const next = '5'.repeat(64);
    await putRecord(storage, record('ch01_tianlong', current, 1));
    await putRecord(storage, { ...record('ch01_tianlong', next, 2), state: 'prefetched', pinned: false });
    await putRecord(storage, { ...record('ch01_tianlong', current, 1), state: 'evictable', pinned: false });
    const result = await collectOfflineGarbage({ cacheStorage: storage, reason: 'quota' });
    expect(result.keptReleases).toContain(current); expect(result.removedReleases).toContain(next);
  });

  it('quota GC keeps reachable shared assets and removes evictable-only assets', async () => {
    const storage = new MemoryCacheStorage(); const active = 'd'.repeat(64); const disposable = 'e'.repeat(64);
    const shared: OfflineFile = { url: '/assets/default/shared.png', bytes: 6, sha256: '1'.repeat(64), kind: 'asset' };
    const exclusive: OfflineFile = { url: '/assets/default/exclusive.png', bytes: 9, sha256: '2'.repeat(64),
      kind: 'asset' };
    await putRecord(storage, record('ch01_tianlong', active, 2, [shared]));
    await putRecord(storage, { ...record('ch02_shediao', disposable, 1, [shared, exclusive]),
      state: 'evictable', pinned: false });
    const assets = await storage.open(ASSET_CACHE);
    await assets.put(cacheRequestForFile(shared), new Response('shared'));
    await assets.put(cacheRequestForFile(exclusive), new Response('exclusive'));
    await storage.open(contentCacheName(active)); await storage.open(contentCacheName(disposable));
    const result = await collectOfflineGarbage({ cacheStorage: storage, reason: 'quota' });
    expect(result.removedReleases).toEqual([disposable]);
    expect(await storage.has(contentCacheName(active))).toBe(true);
    expect(await storage.has(contentCacheName(disposable))).toBe(false);
    expect(await assets.match(cacheRequestForFile(shared))).toBeDefined();
    expect(await assets.match(cacheRequestForFile(exclusive))).toBeUndefined();
  });

  it('never evicts a pinned record under quota pressure', async () => {
    const storage = new MemoryCacheStorage(); const release = 'f'.repeat(64);
    await putRecord(storage, { ...record('ch03_shediao', release, 1), state: 'evictable', pinned: true });
    await collectOfflineGarbage({ cacheStorage: storage, reason: 'quota' });
    expect((await collectOfflineGarbage({ cacheStorage: storage, reason: 'manual' })).keptReleases)
      .toContain(release);
  });

  it('evicts an unpinned prefetched record under quota pressure', async () => {
    const storage = new MemoryCacheStorage(); const release = '8'.repeat(64);
    await putRecord(storage, { ...record('ch04_xiaoke', release, 1), state: 'prefetched', pinned: false });
    const result = await collectOfflineGarbage({ cacheStorage: storage, reason: 'quota' });
    expect(result.removedReleases).toEqual([release]);
  });

  it('preserves the release currently being committed even when it is prefetched', async () => {
    const storage = new MemoryCacheStorage(); const release = '7'.repeat(64);
    await putRecord(storage, { ...record('ch05_xiaoao', release, 1), state: 'prefetched', pinned: false });
    const result = await collectOfflineGarbage({ cacheStorage: storage, reason: 'build-switch',
      preserveReleases: [release] });
    expect(result.keptReleases).toContain(release); expect(result.removedReleases).not.toContain(release);
  });

  it('drops only superseded hashes for paths present in the next active closures', async () => {
    const storage = new MemoryCacheStorage(); const release = '9'.repeat(64);
    const current: OfflineFile = { url: '/assets/default/a.png', bytes: 3, sha256: '3'.repeat(64), kind: 'asset' };
    const old = { ...current, sha256: '4'.repeat(64) };
    const unrelated = { ...current, url: '/assets/default/unused.png', sha256: '5'.repeat(64) };
    const assets = await storage.open(ASSET_CACHE);
    await assets.put(cacheRequestForFile(current), new Response('new'));
    await assets.put(cacheRequestForFile(old), new Response('old'));
    await assets.put(cacheRequestForFile(unrelated), new Response('keep'));
    expect(await pruneSupersededAssets(storage, [record('ch01_tianlong', release, 1, [current]).closure]))
      .toBe(1);
    expect(await assets.match(cacheRequestForFile(current))).toBeDefined();
    expect(await assets.match(cacheRequestForFile(old))).toBeUndefined();
    expect(await assets.match(cacheRequestForFile(unrelated))).toBeDefined();
  });

  it('prunes a changed same-path asset only after the new closure is published', async () => {
    const storage = new MemoryCacheStorage(); const release = '7'.repeat(64);
    const next = { url: '/assets/default/a.png', bytes: 3,
      sha256: '11507a0e2f5e69d5dfa40a62a1bd7b6ee57e6bcd85c67c9b8431b36fff21c437', kind: 'asset' } as const;
    const old = { ...next, sha256: '4'.repeat(64) }; const assets = await storage.open(ASSET_CACHE);
    await assets.put(cacheRequestForFile(old), new Response('old'));
    await assets.put(cacheRequestForFile(next), new Response('new'));
    const closure = record('ch01_tianlong', release, 2, [next]).closure;
    await (await storage.open(stagingCacheName(release))).put(cacheRequestForFile(next), new Response('new'));
    await putRecord(storage, { ...record('ch01_tianlong', release, 2, [next]), pendingPublication: true }, false);
    await publishOfflineClosures([closure], storage);
    expect(await assets.match(cacheRequestForFile(next))).toBeDefined();
    expect(await assets.match(cacheRequestForFile(old))).toBeUndefined();
  });
});
