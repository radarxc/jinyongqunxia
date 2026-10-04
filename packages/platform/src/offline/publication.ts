import { cacheNameForFile, cacheRequestForFile, listActiveRecords, listRecords,
  pruneSupersededAssets, publishRecords, putRecord } from './cache';
import { OfflineDownloadError } from './errors';
import { scanOfflineClosure } from './integrity';
import { verifyBytes } from './hash';
import type { InstalledClosureRecord, OfflineClosure } from './types';

/** All files and immutable metadata are written before the single active-set pointer. */
export async function publishOfflineClosures(
  closures: readonly OfflineClosure[], cacheStorage: CacheStorage = caches,
): Promise<void> {
  const records = await listRecords(cacheStorage); const updates: InstalledClosureRecord[] = [];
  for (const closure of closures) {
    if (!(await scanOfflineClosure(closure, { cacheStorage })).complete)
      throw new OfflineDownloadError('MANIFEST_STALE', 'OFFLINE_PUBLICATION_INCOMPLETE');
    const row = records.find(record => record.closure.releaseHash === closure.releaseHash);
    const now = Date.now();
    const record: InstalledClosureRecord = { format: 1, installedAt: now, lastVerifiedAt: now,
      state: 'active', pinned: true, ...row, closure, pendingPublication: false };
    await putRecord(cacheStorage, record, false); updates.push(record);
  }
  await publishRecords(cacheStorage, updates);
  await pruneSupersededAssets(cacheStorage, (await listActiveRecords(cacheStorage)).map(record => record.closure));
}

export async function publishOfflineClosure(closure: OfflineClosure, cacheStorage: CacheStorage = caches): Promise<void> {
  await publishOfflineClosures([closure], cacheStorage);
}

/** Read the manifest selected by a published closure, without following a newer network root. */
export async function matchPublishedManifest(closure: OfflineClosure, url: string, cacheStorage: CacheStorage): Promise<Response | undefined> {
  const file = closure.files.find(row => row.kind === 'manifest' && row.url === url);
  if (!file) return undefined;
  const cache = await cacheStorage.open(cacheNameForFile(file, closure.releaseHash));
  const request = cacheRequestForFile(file); const response = await cache.match(request);
  if (!response) return undefined;
  if (response.status === 200 &&
      await verifyBytes(await response.clone().arrayBuffer(), file.bytes, file.sha256) === 'valid') return response;
  await cache.delete(request); return undefined;
}
