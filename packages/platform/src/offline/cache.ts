import type { InstalledClosureRecord, OfflineClosure, OfflineDownloadIntent } from './types';

export const ASSET_CACHE = 'ts-assets-v1';
export const META_CACHE = 'ts-offline-meta';
export const MANIFEST_CACHE = 'ts-manifests-v1';
export const CONTENT_CACHE_PREFIX = 'ts-content-';
export const STAGING_CACHE_PREFIX = 'ts-offline-stage-';
export const ACTIVE_SET_URL = '/__offline/published.json';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function contentCacheName(releaseHash: string): string {
  if (!/^[a-f0-9]{64}$/u.test(releaseHash)) throw new TypeError('OFFLINE_RELEASE_HASH_INVALID');
  return `${CONTENT_CACHE_PREFIX}${releaseHash}`;
}

export function stagingCacheName(releaseHash: string): string {
  if (!/^[a-f0-9]{64}$/u.test(releaseHash)) throw new TypeError('OFFLINE_RELEASE_HASH_INVALID');
  return `${STAGING_CACHE_PREFIX}${releaseHash}`;
}

export function cacheNameForFile(file: OfflineClosure['files'][number], releaseHash: string): string {
  if (file.kind === 'content') return contentCacheName(releaseHash);
  return file.kind === 'manifest' ? MANIFEST_CACHE : ASSET_CACHE;
}

export function canonicalRequest(url: string): Request {
  return new Request(new URL(url, globalThis.location?.origin ?? 'https://tianshu.invalid').href);
}

export function cacheRequestForFile(file: OfflineClosure['files'][number]): Request {
  const url = new URL(file.url, globalThis.location?.origin ?? 'https://tianshu.invalid');
  if (file.kind !== 'content') url.searchParams.set('__ts_hash', file.sha256);
  return new Request(url.href);
}

export async function pruneSupersededAssetVersions(
  cacheStorage: CacheStorage,
  file: Pick<OfflineClosure['files'][number], 'url' | 'sha256'>,
): Promise<number> {
  const cache = await cacheStorage.open(ASSET_CACHE);
  const current = cacheRequestForFile({ ...file, bytes: 0, kind: 'asset' }).url;
  const pathname = new URL(current).pathname; let deleted = 0;
  for (const request of await cache.keys()) {
    if (request.url !== current && new URL(request.url).pathname === pathname && await cache.delete(request))
      deleted += 1;
  }
  return deleted;
}

export async function pruneSupersededAssets(
  cacheStorage: CacheStorage,
  keep: readonly OfflineClosure[],
): Promise<number> {
  const reachable = new Map<string, Set<string>>();
  for (const file of keep.flatMap(closure => closure.files)) {
    if (file.kind !== 'asset' && file.kind !== 'vfx') continue;
    const requestUrl = cacheRequestForFile(file).url; const pathname = new URL(requestUrl).pathname;
    const versions = reachable.get(pathname) ?? new Set<string>();
    versions.add(requestUrl); reachable.set(pathname, versions);
  }
  const cache = await cacheStorage.open(ASSET_CACHE); let deleted = 0;
  for (const request of await cache.keys()) {
    const versions = reachable.get(new URL(request.url).pathname);
    if (versions && !versions.has(request.url) && await cache.delete(request)) deleted += 1;
  }
  return deleted;
}

export function recordUrl(chapter: string, releaseHash: string): string {
  return new URL(`/__offline/record/${encodeURIComponent(chapter)}/${releaseHash}.json`,
    globalThis.location?.origin ?? 'https://tianshu.invalid').href;
}

export function intentUrl(chapter: string): string {
  return new URL(`/__offline/intent/${encodeURIComponent(chapter)}.json`,
    globalThis.location?.origin ?? 'https://tianshu.invalid').href;
}

export function activeRecordUrl(chapter: string): string {
  return new URL(`/__offline/active/${encodeURIComponent(chapter)}.json`,
    globalThis.location?.origin ?? 'https://tianshu.invalid').href;
}

export async function putRecord(
  cacheStorage: CacheStorage,
  record: InstalledClosureRecord,
  publish = true,
): Promise<void> {
  const cache = await cacheStorage.open(META_CACHE);
  await cache.put(recordUrl(record.closure.chapter, record.closure.releaseHash), new Response(
    encoder.encode(JSON.stringify(record)), { headers: { 'content-type': 'application/json' } },
  ));
  if (!publish) return;
  const active = await listActiveRecords(cacheStorage);
  if (record.state === 'active' || active.some(row => row.closure.releaseHash === record.closure.releaseHash))
    await publishRecords(cacheStorage, [record]);
}

export async function listActiveRecords(cacheStorage: CacheStorage): Promise<InstalledClosureRecord[]> {
  const response = await (await cacheStorage.open(META_CACHE)).match(canonicalRequest(ACTIVE_SET_URL));
  if (!response) return [];
  const value = await response.json() as { records: InstalledClosureRecord[] };
  return value.records;
}

/** One Cache.put is the publication boundary; no reader sees a half-switched root. */
export async function publishRecords(cacheStorage: CacheStorage, updates: readonly InstalledClosureRecord[]): Promise<void> {
  const cache = await cacheStorage.open(META_CACHE);
  const active = await listActiveRecords(cacheStorage);
  const next = new Map(active.map(record => [record.closure.chapter, record]));
  for (const record of updates) {
    const previous = next.get(record.closure.chapter);
    if (previous && previous.closure.releaseHash !== record.closure.releaseHash)
      await putRecord(cacheStorage, { ...previous, state: 'evictable', pinned: false }, false);
    next.set(record.closure.chapter, record);
  }
  const records = [...next.values()].sort((a, b) => a.closure.chapter < b.closure.chapter ? -1 : 1);
  await cache.put(canonicalRequest(ACTIVE_SET_URL), new Response(JSON.stringify({ format: 1, records }),
    { headers: { 'content-type': 'application/json' } }));
}

export async function listRecords(cacheStorage: CacheStorage): Promise<InstalledClosureRecord[]> {
  const cache = await cacheStorage.open(META_CACHE);
  const result: InstalledClosureRecord[] = [];
  for (const request of await cache.keys()) {
    if (!new URL(request.url).pathname.startsWith('/__offline/record/')) continue;
    const response = await cache.match(request);
    if (!response) continue;
    try {
      const raw = JSON.parse(decoder.decode(await response.arrayBuffer())) as InstalledClosureRecord;
      if (raw.format === 1 && raw.closure?.format === 1) result.push(raw);
    } catch {
      await cache.delete(request);
    }
  }
  return result.sort((left, right) => right.installedAt - left.installedAt ||
    left.closure.releaseHash.localeCompare(right.closure.releaseHash));
}

export async function putDownloadIntent(
  cacheStorage: CacheStorage,
  intent: OfflineDownloadIntent,
): Promise<void> {
  const cache = await cacheStorage.open(META_CACHE);
  await cache.put(intentUrl(intent.closure.chapter), new Response(encoder.encode(JSON.stringify(intent)),
    { headers: { 'content-type': 'application/json' } }));
}

export async function listDownloadIntents(cacheStorage: CacheStorage): Promise<OfflineDownloadIntent[]> {
  const cache = await cacheStorage.open(META_CACHE); const result: OfflineDownloadIntent[] = [];
  for (const request of await cache.keys()) {
    if (!new URL(request.url).pathname.startsWith('/__offline/intent/')) continue;
    const response = await cache.match(request); if (!response) continue;
    try {
      const raw = JSON.parse(decoder.decode(await response.arrayBuffer())) as OfflineDownloadIntent;
      if (raw.format === 1 && raw.closure?.format === 1) result.push(raw);
    } catch { await cache.delete(request); }
  }
  return result.sort((left, right) => right.startedAt - left.startedAt);
}

export async function deleteDownloadIntent(cacheStorage: CacheStorage, chapter: string): Promise<void> {
  await (await cacheStorage.open(META_CACHE)).delete(intentUrl(chapter));
}

export async function deleteRecord(
  cacheStorage: CacheStorage,
  record: InstalledClosureRecord,
): Promise<void> {
  const cache = await cacheStorage.open(META_CACHE);
  await cache.delete(recordUrl(record.closure.chapter, record.closure.releaseHash));
  const active = await listActiveRecords(cacheStorage);
  const remaining = active.filter(row => row.closure.chapter !== record.closure.chapter ||
    row.closure.releaseHash !== record.closure.releaseHash);
  if (remaining.length !== active.length) await cache.put(canonicalRequest(ACTIVE_SET_URL),
    new Response(JSON.stringify({ format: 1, records: remaining }),
      { headers: { 'content-type': 'application/json' } }));
}
