import { ASSET_CACHE, cacheNameForFile, cacheRequestForFile, CONTENT_CACHE_PREFIX, deleteDownloadIntent,
  deleteRecord, listActiveRecords, listDownloadIntents, listRecords, MANIFEST_CACHE,
  STAGING_CACHE_PREFIX } from './cache';
import type { InstalledClosureRecord } from './types';

export interface GarbageCollectionResult {
  readonly keptReleases: readonly string[];
  readonly removedReleases: readonly string[];
  readonly deletedEntries: number;
}

function normalRetained(records: readonly InstalledClosureRecord[],
  active: readonly InstalledClosureRecord[]): InstalledClosureRecord[] {
  const chapters = new Set([...records, ...active].map(record => record.closure.chapter));
  const retained: InstalledClosureRecord[] = [];
  for (const chapter of chapters) {
    const rows = records.filter(record => record.closure.chapter === chapter && !record.pendingPublication)
      .sort((left, right) => right.installedAt - left.installedAt);
    const current = active.find(record => record.closure.chapter === chapter) ?? rows[0];
    if (current) retained.push(current);
    const previous = rows.find(record => record.closure.releaseHash !== current?.closure.releaseHash);
    if (previous) retained.push(previous);
  }
  return [...new Map([...retained, ...records.filter(record => record.pinned || record.pendingPublication)].map(record =>
    [`${record.closure.chapter}|${record.closure.releaseHash}`, record])).values()];
}

export async function collectOfflineGarbage(
  options: { readonly cacheStorage?: CacheStorage; readonly reason?: 'build-switch' | 'book-sleep' | 'quota' | 'manual';
    readonly preserveReleases?: readonly string[] } = {},
): Promise<GarbageCollectionResult> {
  const cacheStorage = options.cacheStorage ?? caches; const records = await listRecords(cacheStorage);
  const active = await listActiveRecords(cacheStorage); const intents = await listDownloadIntents(cacheStorage);
  const baseRetained = options.reason === 'quota'
    ? [...active, ...records.filter(record => record.pinned)] : normalRetained(records, active);
  const preserved = new Set(options.preserveReleases ?? []);
  const retained = [...new Map([...baseRetained, ...records.filter(record =>
    preserved.has(record.closure.releaseHash))].map(record =>
    [`${record.closure.chapter}|${record.closure.releaseHash}`, record])).values()];
  const retainedHashes = new Set(retained.map(row => row.closure.releaseHash));
  for (const release of preserved) retainedHashes.add(release);
  const removed = records.filter(record => !retainedHashes.has(record.closure.releaseHash));
  let deletedEntries = 0;
  for (const record of removed) {
    await deleteRecord(cacheStorage, record);
    if (await cacheStorage.delete(`${CONTENT_CACHE_PREFIX}${record.closure.releaseHash}`)) deletedEntries += 1;
  }
  if (options.reason === 'quota') for (const intent of intents) {
    if (intent.intent !== 'prefetch' || preserved.has(intent.closure.releaseHash)) continue;
    if (await cacheStorage.delete(STAGING_CACHE_PREFIX + intent.closure.releaseHash)) deletedEntries += 1;
    await deleteDownloadIntent(cacheStorage, intent.closure.chapter);
  }
  const protectedClosures = intents.filter(intent => preserved.has(intent.closure.releaseHash))
    .map(intent => intent.closure);
  const reachable = new Set([...retained.map(record => record.closure), ...protectedClosures]
    .flatMap(closure => closure.files.map(file =>
      `${cacheNameForFile(file, closure.releaseHash)}|${cacheRequestForFile(file).url}`)));
  for (const name of await cacheStorage.keys()) {
    if (name.startsWith(STAGING_CACHE_PREFIX)) {
      if (options.reason === 'quota' && !preserved.has(name.slice(STAGING_CACHE_PREFIX.length)) &&
          !intents.some(intent => intent.intent === 'download' &&
          name === STAGING_CACHE_PREFIX + intent.closure.releaseHash) && await cacheStorage.delete(name))
        deletedEntries += 1;
      continue;
    }
    if (name.startsWith(CONTENT_CACHE_PREFIX) && !retainedHashes.has(name.slice(CONTENT_CACHE_PREFIX.length))) {
      if (await cacheStorage.delete(name)) deletedEntries += 1; continue;
    }
    const cache = await cacheStorage.open(name);
    for (const request of await cache.keys()) if (!reachable.has(`${name}|${request.url}`) &&
      ((name === ASSET_CACHE && (options.reason === 'quota' || records.some(record => record.closure.files.some(file =>
        cacheNameForFile(file, record.closure.releaseHash) === name && cacheRequestForFile(file).url === request.url)))) ||
        name.startsWith(CONTENT_CACHE_PREFIX) ||
        name === MANIFEST_CACHE && new URL(request.url).searchParams.has('__ts_hash'))) {
      if (await cache.delete(request)) deletedEntries += 1;
    }
  }
  return { keptReleases: [...retainedHashes].sort(),
    removedReleases: [...new Set(removed.map(row => row.closure.releaseHash))].sort(), deletedEntries };
}

export async function deleteOfflineClosure(
  record: InstalledClosureRecord, cacheStorage: CacheStorage = caches,
): Promise<number> {
  const remaining = (await listRecords(cacheStorage)).filter(row =>
    row.closure.chapter !== record.closure.chapter || row.closure.releaseHash !== record.closure.releaseHash);
  const shared = new Set(remaining.flatMap(row => row.closure.files.map(file =>
    `${cacheNameForFile(file, row.closure.releaseHash)}|${cacheRequestForFile(file).url}`)));
  let deleted = 0;
  for (const file of record.closure.files) {
    const name = cacheNameForFile(file, record.closure.releaseHash); const request = cacheRequestForFile(file);
    if (!shared.has(`${name}|${request.url}`) && await (await cacheStorage.open(name)).delete(request)) deleted += 1;
  }
  await deleteRecord(cacheStorage, record);
  return deleted;
}

/** User deletion includes unfinished intents; no IndexedDB database is opened or removed. */
export async function deleteOfflineDownload(chapter: string, cacheStorage: CacheStorage = caches): Promise<number> {
  let deleted = 0;
  for (const record of (await listRecords(cacheStorage)).filter(row => row.closure.chapter === chapter))
    deleted += await deleteOfflineClosure(record, cacheStorage);
  for (const intent of await listDownloadIntents(cacheStorage)) {
    if (intent.closure.chapter !== chapter) continue;
    if (await cacheStorage.delete(STAGING_CACHE_PREFIX + intent.closure.releaseHash)) deleted += 1;
    if (await cacheStorage.delete(CONTENT_CACHE_PREFIX + intent.closure.releaseHash)) deleted += 1;
  }
  await deleteDownloadIntent(cacheStorage, chapter);
  return deleted;
}
