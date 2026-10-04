import { describe, expect, it, vi } from 'vitest';
import { ASSET_CACHE, contentCacheName, listActiveRecords,
  listDownloadIntents, MANIFEST_CACHE, stagingCacheName } from './cache';
import { downloadOfflineClosure, fetchWithRetry, RETRY_DELAYS_MS } from './downloader';
import { scanOfflineClosure } from './integrity';
import { MemoryCacheStorage } from './memory-cache';
import type { OfflineClosure } from './types';

const bytes = (text: string) => new TextEncoder().encode(text);
function closure(): OfflineClosure {
  const a = bytes('content'); const b = bytes('asset');
  return { format: 1, chapter: 'ch01_tianlong', releaseHash: 'a'.repeat(64), files: [
    { url: '/content/ch01_tianlong/a.json', bytes: a.byteLength,
      sha256: 'ed7002b439e9ac845f22357d822bac1444730fbdb6016d3ec9432297b9ec9f73', kind: 'content' },
    { url: '/assets/default/a.png', bytes: b.byteLength,
      sha256: 'd59386e0ae435e292fbe0ebcdb954b75ed5fb3922091277cb19f798fc5d50718', kind: 'asset' },
  ], totals: { files: 2, bytes: a.byteLength + b.byteLength, enterBytes: a.byteLength + b.byteLength,
    byKind: { manifest: 0, content: a.byteLength, asset: b.byteLength, vfx: 0 } } };
}
const responseFor = (url: string) => new Response(bytes(url.includes('content') ? 'content' : 'asset'));

describe('downloadOfflineClosure', () => {
  it('resumes by verified file difference, calls persist and never regresses progress', async () => {
    const storage = new MemoryCacheStorage(); const value = closure();
    await (await storage.open(contentCacheName(value.releaseHash))).put(value.files[0]!.url, responseFor('content'));
    const progress: number[] = []; const fetcher = vi.fn(async (input: RequestInfo | URL) => responseFor(String(input)));
    const persist = vi.fn(async () => true);
    const result = await downloadOfflineClosure(value, { cacheStorage: storage, fetch: fetcher,
      storage: { estimate: async () => ({ quota: 1_000, usage: 0 }), persist },
      onProgress: row => progress.push(row.verifiedBytes) });
    expect(fetcher).toHaveBeenCalledTimes(1); expect(persist).toHaveBeenCalledOnce();
    expect(result).toMatchObject({ downloadedFiles: 1, reusedFiles: 1, persisted: true });
    expect(progress).toEqual([...progress].sort((a, b) => a - b));
  });

  it('rejects insufficient quota before fetching', async () => {
    const fetcher = vi.fn();
    await expect(downloadOfflineClosure(closure(), { cacheStorage: new MemoryCacheStorage(), fetch: fetcher,
      storage: { estimate: async () => ({ quota: 1, usage: 0 }), persist: async () => false } }))
      .rejects.toThrow('OFFLINE_QUOTA_SHORTAGE');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('evicts once on a CacheStorage quota error and retries the staged file', async () => {
    const storage = new MemoryCacheStorage(); let rejected = false; const opened = storage.open.bind(storage);
    storage.open = vi.fn(async name => {
      const cache = await opened(name);
      if (!name.startsWith('ts-offline-stage-')) return cache;
      return new Proxy(cache, { get(target, property) {
        if (property !== 'put') return Reflect.get(target, property, target);
        return async (request: RequestInfo | URL, response: Response) => {
          if (!rejected) { rejected = true; throw new DOMException('full', 'QuotaExceededError'); }
          return target.put(request, response);
        };
      } });
    });
    const evict = vi.fn(async (_reason: 'estimate' | 'write', _releaseHash: string) => undefined);
    await expect(downloadOfflineClosure(closure(), { cacheStorage: storage, storage: null,
      fetch: async input => responseFor(String(input)), onQuotaPressure: evict })).resolves.toMatchObject({ downloadedFiles: 2 });
    expect(evict).toHaveBeenCalledOnce();
    expect(evict).toHaveBeenCalledWith('write', closure().releaseHash);
  });

  it('uses the exact retry schedule for 5xx responses', async () => {
    const sleeps: number[] = []; const fetcher = vi.fn().mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(new Response('', { status: 503 })).mockImplementation(async (input: RequestInfo | URL) => responseFor(String(input)));
    await downloadOfflineClosure(closure(), { cacheStorage: new MemoryCacheStorage(), fetch: fetcher,
      storage: null, random: () => 0, sleep: async ms => { sleeps.push(ms); } });
    expect(sleeps).toEqual(RETRY_DELAYS_MS.slice(0, 2));
  });

  it('runs all five retry delays under fake timers', async () => {
    vi.useFakeTimers();
    try {
      const fetcher = vi.fn().mockResolvedValue(new Response('', { status: 503 }));
      const pending = fetchWithRetry('/retry', { fetch: fetcher, random: () => 0 });
      const rejected = expect(pending).rejects.toThrow('OFFLINE_HTTP_503');
      await vi.runAllTimersAsync();
      await rejected;
      expect(fetcher).toHaveBeenCalledTimes(RETRY_DELAYS_MS.length + 1);
    } finally { vi.useRealTimers(); }
  });

  it.each([{ type: '404', response: new Response('', { status: 404 }) },
    { type: 'hash', response: new Response('xxxxxxx') }])('does not retry $type', async ({ response }) => {
    const fetcher = vi.fn(async () => response.clone());
    await expect(downloadOfflineClosure(closure(), { cacheStorage: new MemoryCacheStorage(), fetch: fetcher, storage: null }))
      .rejects.toThrow(); expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('refreshes the closure once for a stale root and never loops', async () => {
    const fetcher = vi.fn(async () => new Response('', { status: 404 }));
    const refreshClosure = vi.fn(async () => closure());
    await expect(downloadOfflineClosure(closure(), { cacheStorage: new MemoryCacheStorage(),
      fetch: fetcher, storage: null, refreshClosure })).rejects.toThrow('OFFLINE_HTTP_404');
    expect(refreshClosure).toHaveBeenCalledOnce(); expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('does not cache a byte-size mismatch', async () => {
    const storage = new MemoryCacheStorage();
    await expect(downloadOfflineClosure(closure(), { cacheStorage: storage, fetch: async () => new Response('x'), storage: null }))
      .rejects.toThrow('OFFLINE_SIZE_MISMATCH');
    expect(await (await storage.open(stagingCacheName(closure().releaseHash))).keys()).toHaveLength(0);
    expect(await (await storage.open(ASSET_CACHE)).keys()).toHaveLength(0);
  });

  it('stages a verified manifest without publishing its canonical pointer', async () => {
    const storage = new MemoryCacheStorage();
    const manifest = bytes('{"chapter":"ch01_tianlong"}');
    const value: OfflineClosure = { ...closure(), files: [{ url: '/content/ch01_tianlong/manifest.json', bytes: manifest.byteLength,
      sha256: '0922e8271f0e92460fdb56ba743ae182b194c844f02f8490e91f091978dd2741', kind: 'manifest' }],
    totals: { files: 1, bytes: manifest.byteLength, enterBytes: manifest.byteLength,
      byKind: { manifest: manifest.byteLength, content: 0, asset: 0, vfx: 0 } } };
    await downloadOfflineClosure(value, { cacheStorage: storage, storage: null, deferPublish: true,
      fetch: async () => new Response(manifest) });
    const cache = await storage.open(MANIFEST_CACHE);
    expect(await cache.match(value.files[0]!.url)).toBeUndefined();
    expect(await cache.match(`${value.files[0]!.url}?__ts_hash=${value.files[0]!.sha256}`)).toBeDefined();
    expect(await listActiveRecords(storage)).toEqual([]);
  });

  it('aborts without losing already completed files and scans the missing byte count', async () => {
    const storage = new MemoryCacheStorage(); const controller = new AbortController(); let calls = 0;
    await expect(downloadOfflineClosure(closure(), { cacheStorage: storage, storage: null, signal: controller.signal,
      fetch: async input => { calls += 1; if (calls === 1) { controller.abort(); return responseFor(String(input)); }
        return responseFor(String(input)); } })).rejects.toThrow();
    const result = await scanOfflineClosure(closure(), { cacheStorage: storage, now: () => 7 });
    expect(result).toMatchObject({ complete: false, missingBytes: 12, validBytes: 0, checkedAt: 7 });
    expect(await listDownloadIntents(storage)).toHaveLength(1);
    expect(await storage.has(stagingCacheName(closure().releaseHash))).toBe(true);
    expect(await (await storage.open(contentCacheName(closure().releaseHash))).keys()).toHaveLength(0);
  });

  it('resumes a later attempt from files preserved in staging', async () => {
    const storage = new MemoryCacheStorage(); let calls = 0;
    await expect(downloadOfflineClosure(closure(), { cacheStorage: storage, storage: null,
      fetch: async input => { calls += 1; if (calls === 2) throw new DOMException('paused', 'AbortError');
        return responseFor(String(input)); } })).rejects.toThrow();
    const fetcher = vi.fn(async (input: RequestInfo | URL) => responseFor(String(input)));
    const result = await downloadOfflineClosure(closure(), { cacheStorage: storage, storage: null, fetch: fetcher });
    expect(result).toMatchObject({ downloadedFiles: 1, reusedFiles: 1 });
    expect(fetcher).toHaveBeenCalledOnce();
  });
});
