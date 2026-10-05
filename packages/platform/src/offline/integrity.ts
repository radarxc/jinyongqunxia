import { cacheNameForFile, cacheRequestForFile, putRecord, stagingCacheName } from './cache';
import { verifyBytes } from './hash';
import type { IntegrityResult, InstalledClosureRecord, OfflineClosure } from './types';

export async function hasVerifiedFile(
  cacheStorage: CacheStorage,
  closure: OfflineClosure,
  file: OfflineClosure['files'][number],
  deleteInvalid = true,
): Promise<boolean> {
  const cache = await cacheStorage.open(cacheNameForFile(file, closure.releaseHash));
  const request = cacheRequestForFile(file); const response = await cache.match(request);
  if (!response || response.status !== 200) return false;
  const result = await verifyBytes(await response.arrayBuffer(), file.bytes, file.sha256);
  if (result !== 'valid' && deleteInvalid) await cache.delete(request);
  return result === 'valid';
}

export async function hasVerifiedStagedFile(
  cacheStorage: CacheStorage,
  closure: OfflineClosure,
  file: OfflineClosure['files'][number],
): Promise<boolean> {
  const cache = await cacheStorage.open(stagingCacheName(closure.releaseHash));
  const request = cacheRequestForFile(file); const response = await cache.match(request);
  if (!response || response.status !== 200) return false;
  const result = await verifyBytes(await response.arrayBuffer(), file.bytes, file.sha256);
  if (result !== 'valid') await cache.delete(request);
  return result === 'valid';
}

export async function scanOfflineClosure(
  closure: OfflineClosure,
  options: { readonly cacheStorage?: CacheStorage; readonly now?: () => number; readonly includeStaged?: boolean } = {},
): Promise<IntegrityResult> {
  const cacheStorage = options.cacheStorage ?? caches;
  const missingFiles: OfflineClosure['files'][number][] = [];
  let validBytes = 0;
  for (const file of closure.files) {
    if (await hasVerifiedFile(cacheStorage, closure, file) ||
        options.includeStaged && await hasVerifiedStagedFile(cacheStorage, closure, file)) validBytes += file.bytes;
    else missingFiles.push(file);
  }
  return { complete: missingFiles.length === 0, checkedAt: (options.now ?? Date.now)(),
    missingFiles, missingBytes: missingFiles.reduce((sum, file) => sum + file.bytes, 0), validBytes };
}

export async function verifyAndRecord(
  record: InstalledClosureRecord,
  cacheStorage: CacheStorage = caches,
  now: () => number = Date.now,
): Promise<IntegrityResult> {
  const result = await scanOfflineClosure(record.closure, { cacheStorage, now });
  await putRecord(cacheStorage, { ...record, lastVerifiedAt: result.checkedAt,
    state: result.complete ? record.state : 'evictable' });
  return result;
}
