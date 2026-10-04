import { ASSET_CACHE, MANIFEST_CACHE, cacheRequestForFile, canonicalRequest, contentCacheName,
  listActiveRecords, matchPublishedManifest, verifyBytes, type OfflineFile } from '@tianshu/platform/offline';
import { chapterFromContentUrl, classifySwRoute } from './routes';

export interface SwBuildMetadata {
  readonly assets: readonly OfflineFile[];
  readonly chapters: Readonly<Record<string, { releaseHash: string; files: readonly OfflineFile[] }>>;
}

export function createSwRuntime(build: SwBuildMetadata, storage: CacheStorage, fetcher: typeof fetch) {
  async function networkFirst(request: Request): Promise<Response> {
    const cache = await storage.open(MANIFEST_CACHE); const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    try {
      const response = await fetcher(request, { signal: controller.signal, cache: 'no-cache' });
      if (response.status !== 200) throw new Error('SW_HTTP_' + response.status);
      const text = await response.text(); JSON.parse(text);
      const result = new Response(text, { headers: { 'content-type': 'application/json' } });
      try { await cache.put(request, result.clone()); } catch { /* Online response remains usable if quota is full. */ }
      return result;
    } catch (error) { return await cache.match(request) ?? Promise.reject(error); }
    finally { clearTimeout(timer); }
  }

  async function manifest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.searchParams.has('__ts_download') || url.pathname === '/version.json') return fetcher(request, { cache: 'no-store' });
    const active = await listActiveRecords(storage);
    if (url.pathname === '/offline/copied-assets.json' && active.length) return new Response(JSON.stringify({
      format: 1, files: [...new Map([...build.assets, ...active.flatMap(row => row.closure.files)
        .filter(file => file.kind === 'asset' || file.kind === 'vfx')].map(file => [file.url, file])).values()],
    }), { headers: { 'content-type': 'application/json' } });
    const chapter = /^\/offline\/closure\.([a-z0-9_]+)\.json$/u.exec(url.pathname)?.[1] ?? chapterFromContentUrl(url.pathname);
    const record = active.find(row => row.closure.chapter === chapter) ??
      (url.pathname === '/content/index.json' ? active[0] : undefined);
    if (record) {
      if (url.pathname.startsWith('/offline/closure.')) return new Response(JSON.stringify(record.closure),
        { headers: { 'content-type': 'application/json' } });
      const hit = await matchPublishedManifest(record.closure, url.pathname, storage);
      if (hit) return hit;
    }
    return networkFirst(canonicalRequest(url.pathname));
  }

  async function resource(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.searchParams.has('__ts_download') || request.headers.has('range')) return fetcher(request);
    const chapter = chapterFromContentUrl(url.pathname); const active = await listActiveRecords(storage);
    const selected = active.find(record => record.closure.chapter === chapter)?.closure;
    const content = selected ?? (chapter ? build.chapters[chapter] : undefined);
    const isContent = classifySwRoute(url) === 'content';
    const file = isContent ? content?.files.find(entry => entry.url === url.pathname)
      : active.flatMap(record => record.closure.files).find(entry => entry.url === url.pathname) ??
        build.assets.find(entry => entry.url === url.pathname);
    if (!file) return fetcher(request);
    const name = isContent ? contentCacheName(content!.releaseHash) : ASSET_CACHE;
    const cache = await storage.open(name); const key = cacheRequestForFile(file);
    const valid = async (response: Response) => response.status === 200 &&
      await verifyBytes(await response.clone().arrayBuffer(), file.bytes, file.sha256) === 'valid';
    const hit = await cache.match(key);
    if (hit && await valid(hit)) return hit;
    if (hit) await cache.delete(key);
    try {
      const response = await fetcher(request, { cache: 'no-cache' });
      if (!await valid(response)) throw new Error('SW_INTEGRITY:' + file.url);
      try { await cache.put(key, response.clone()); } catch { /* Downloader owns quota UI and recovery. */ }
      return response;
    } catch (error) {
      if (/\.(?:png|webp|jpe?g|avif|svg)$/u.test(url.pathname)) return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#c7b99d"/></svg>',
        { headers: { 'content-type': 'image/svg+xml', 'X-Tianshu-Placeholder': '1' } });
      throw error;
    }
  }
  return { manifest, resource, networkFirst };
}
