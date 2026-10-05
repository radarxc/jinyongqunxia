import { cacheNameForFile, cacheRequestForFile, deleteDownloadIntent, listDownloadIntents,
  listRecords, putDownloadIntent, putRecord, stagingCacheName } from './cache';
import { OfflineDownloadError, isQuotaExceeded } from './errors';
import { collectOfflineGarbage } from './gc';
import { hasVerifiedFile, hasVerifiedStagedFile } from './integrity';
import { VerifiedProgress } from './progress';
import { fetchWithRetry } from './retry';
import { verifyBytes } from './hash';
import { publishOfflineClosure } from './publication';
import { assertOfflineClosure } from './closure';
import type { OfflineClosure, OfflineDownloadOptions, OfflineDownloadResult, OfflineFile } from './types';

async function findReusable(cacheStorage: CacheStorage, closure: OfflineClosure,
  file: OfflineFile): Promise<Response | null> {
  const records = await listRecords(cacheStorage); const intents = await listDownloadIntents(cacheStorage);
  for (const candidate of [...records.map(row => row.closure), ...intents.map(row => row.closure)]) {
    const previous = candidate.files.find(row => row.url === file.url && row.sha256 === file.sha256);
    if (!previous || candidate.releaseHash === closure.releaseHash) continue;
    const names = [cacheNameForFile(previous, candidate.releaseHash), stagingCacheName(candidate.releaseHash)];
    for (const name of names) {
      const cache = await cacheStorage.open(name); const response = await cache.match(cacheRequestForFile(previous));
      if (response && response.status === 200 &&
          await verifyBytes(await response.clone().arrayBuffer(), file.bytes, file.sha256) === 'valid') return response;
    }
  }
  return null;
}

async function findMissing(cacheStorage: CacheStorage, closure: OfflineClosure): Promise<{
  missing: OfflineFile[]; reusedBytes: number; reusedFiles: number }> {
  const missing: OfflineFile[] = []; let reusedBytes = 0; let reusedFiles = 0;
  for (const file of closure.files) {
    if (await hasVerifiedFile(cacheStorage, closure, file) ||
        await hasVerifiedStagedFile(cacheStorage, closure, file)) {
      reusedBytes += file.bytes; reusedFiles += 1; continue;
    }
    const reusable = await findReusable(cacheStorage, closure, file);
    if (reusable) {
      await (await cacheStorage.open(stagingCacheName(closure.releaseHash)))
        .put(cacheRequestForFile(file), reusable);
      reusedBytes += file.bytes; reusedFiles += 1;
    } else missing.push(file);
  }
  return { missing, reusedBytes, reusedFiles };
}

async function downloadFile(closure: OfflineClosure, file: OfflineFile, options: OfflineDownloadOptions,
  cacheStorage: CacheStorage): Promise<void> {
  const networkUrl = new URL(file.url, globalThis.location?.origin ?? 'https://tianshu.invalid');
  networkUrl.searchParams.set('__ts_download', file.sha256);
  const response = await fetchWithRetry(networkUrl, { fetch: options.fetch, signal: options.signal,
    sleep: options.sleep, random: options.random, maxBytes: file.bytes + 1 });
  if (response.status === 206) throw new OfflineDownloadError('HTTP', 'OFFLINE_PARTIAL_RESPONSE', 206);
  const bytes = await response.arrayBuffer(); const verified = await verifyBytes(bytes, file.bytes, file.sha256);
  if (verified === 'bytes') throw new OfflineDownloadError('SIZE_MISMATCH', `OFFLINE_SIZE_MISMATCH:${file.url}`);
  if (verified === 'hash') throw new OfflineDownloadError('HASH_MISMATCH', `OFFLINE_HASH_MISMATCH:${file.url}`);
  await (await cacheStorage.open(stagingCacheName(closure.releaseHash))).put(cacheRequestForFile(file),
    new Response(bytes, { status: 200, headers: response.headers }));
}

async function commitStaged(cacheStorage: CacheStorage, closure: OfflineClosure): Promise<void> {
  const staging = await cacheStorage.open(stagingCacheName(closure.releaseHash));
  for (const file of closure.files) {
    if (await hasVerifiedFile(cacheStorage, closure, file)) continue;
    const request = cacheRequestForFile(file); const response = await staging.match(request);
    if (!response || await verifyBytes(await response.clone().arrayBuffer(), file.bytes, file.sha256) !== 'valid')
      throw new OfflineDownloadError('MANIFEST_STALE', `OFFLINE_STAGING_INCOMPLETE:${file.url}`);
    await (await cacheStorage.open(cacheNameForFile(file, closure.releaseHash))).put(request, response);
  }
}

async function ensureQuota(options: OfflineDownloadOptions, required: number, multiplier: number,
  releaseHash: string, cacheStorage: CacheStorage): Promise<void> {
  const storage = options.storage === undefined
    ? (typeof navigator === 'undefined' ? null : navigator.storage) : options.storage;
  let estimate = await storage?.estimate?.();
  if (estimate?.quota !== undefined && estimate.quota - (estimate.usage ?? 0) < required * multiplier) {
    await collectOfflineGarbage({ cacheStorage, reason: 'quota', preserveReleases: [releaseHash] });
    await options.onQuotaPressure?.('estimate', releaseHash); estimate = await storage?.estimate?.();
    if (estimate?.quota !== undefined && estimate.quota - (estimate.usage ?? 0) < required * multiplier)
      throw new OfflineDownloadError('QUOTA', `OFFLINE_QUOTA_SHORTAGE:${required}`);
  }
}

async function runDownload(
  initial: OfflineClosure, options: OfflineDownloadOptions = {},
): Promise<OfflineDownloadResult> {
  const cacheStorage = options.cacheStorage ?? caches;
  options.signal?.throwIfAborted(); assertOfflineClosure(initial);
  let quotaRetried = false;
  const write = async <T>(operation: () => Promise<T>): Promise<T> => {
    try { return await operation(); } catch (error) {
      if (!isQuotaExceeded(error)) throw error;
      if (quotaRetried) throw new OfflineDownloadError('QUOTA', 'OFFLINE_QUOTA_EXCEEDED');
      quotaRetried = true;
      await collectOfflineGarbage({ cacheStorage, reason: 'quota', preserveReleases: [closure.releaseHash] });
      await options.onQuotaPressure?.('write', closure.releaseHash);
      try { return await operation(); } catch (again) {
        if (isQuotaExceeded(again)) throw new OfflineDownloadError('QUOTA', 'OFFLINE_QUOTA_EXCEEDED');
        throw again;
      }
    }
  };
  const storage = options.storage === undefined
    ? (typeof navigator === 'undefined' ? null : navigator.storage) : options.storage;
  let closure = initial; let refreshed = false; const now = options.now ?? Date.now;
  let delta = await write(() => findMissing(cacheStorage, closure));
  let progress = new VerifiedProgress(closure.totals.bytes, closure.files.length,
    delta.reusedBytes, delta.reusedFiles, now, options.onProgress);
  progress.report('checking');
  await ensureQuota(options, delta.missing.reduce((sum, file) => sum + file.bytes, 0),
    options.intent === 'prefetch' ? 2 : 1.2, closure.releaseHash, cacheStorage);
  progress.report('persisting'); let persisted: boolean | null = null;
  try { persisted = await storage?.persist?.() ?? null; } catch { persisted = false; }
  await write(() => putDownloadIntent(cacheStorage, { format: 1, closure, startedAt: now(),
    intent: options.intent ?? 'download' }));
  const downloaded = new Set<string>();
  download: while (true) {
    for (const file of delta.missing) {
      options.signal?.throwIfAborted(); progress.report('downloading', file.url);
      try { await write(() => downloadFile(closure, file, options, cacheStorage)); } catch (error) {
        const stale = error instanceof OfflineDownloadError &&
          (error.status === 404 || error.code === 'HASH_MISMATCH');
        if (stale && !refreshed && options.refreshClosure) {
          refreshed = true; const previousRelease = closure.releaseHash;
          const next = await options.refreshClosure();
          assertOfflineClosure(next);
          if (next.chapter !== initial.chapter) throw new TypeError('OFFLINE_REFRESH_CHAPTER_MISMATCH');
          if (next.releaseHash === previousRelease || next.files.some(row =>
            row.url === file.url && row.sha256 === file.sha256)) throw error;
          delta = await write(() => findMissing(cacheStorage, next)); closure = next;
          await ensureQuota(options, delta.missing.reduce((sum, row) => sum + row.bytes, 0),
            options.intent === 'prefetch' ? 2 : 1.2, closure.releaseHash, cacheStorage);
          await write(() => putDownloadIntent(cacheStorage, { format: 1, closure, startedAt: now(),
            intent: options.intent ?? 'download' }));
          if (previousRelease !== next.releaseHash) await cacheStorage.delete(stagingCacheName(previousRelease));
          progress = new VerifiedProgress(closure.totals.bytes, closure.files.length,
            delta.reusedBytes, delta.reusedFiles, now, options.onProgress);
          continue download;
        }
        throw error;
      }
      downloaded.add(`${file.url}|${file.sha256}`); progress.verified(file.bytes, file.url);
    }
    await write(async () => {
      options.signal?.throwIfAborted(); progress.report('committing'); await commitStaged(cacheStorage, closure);
      const installedAt = now();
      await putRecord(cacheStorage, { format: 1, closure, installedAt, lastVerifiedAt: installedAt,
        state: options.state ?? (options.intent === 'prefetch' ? 'prefetched' : 'active'),
        pinned: options.pinned ?? options.intent !== 'prefetch', pendingPublication: options.deferPublish ?? false }, false);
      if (!options.deferPublish && options.intent !== 'prefetch') await publishOfflineClosure(closure, cacheStorage);
    });
    break;
  }
  await cacheStorage.delete(stagingCacheName(closure.releaseHash));
  await deleteDownloadIntent(cacheStorage, closure.chapter);
  await collectOfflineGarbage({ cacheStorage, reason: 'build-switch', preserveReleases: [closure.releaseHash] });
  progress.report('complete'); const done = progress.snapshot();
  const downloadedFiles = closure.files.filter(file => downloaded.has(`${file.url}|${file.sha256}`)).length;
  return { closure, chapter: closure.chapter, releaseHash: closure.releaseHash, downloadedFiles,
    reusedFiles: closure.files.length - downloadedFiles, verifiedBytes: done.verifiedBytes, persisted };
}

const downloadQueues = new WeakMap<CacheStorage, Promise<unknown>>();
export async function downloadOfflineClosure(initial: OfflineClosure, options: OfflineDownloadOptions = {}): Promise<OfflineDownloadResult> {
  const storage = options.cacheStorage ?? caches;
  const task = () => runDownload(initial, { ...options, cacheStorage: storage });
  if (typeof navigator !== 'undefined' && navigator.locks)
    return navigator.locks.request('ts-offline-mutation', { ...(options.signal ? { signal: options.signal } : {}) }, task);
  const pending = (downloadQueues.get(storage) ?? Promise.resolve()).then(task, task);
  downloadQueues.set(storage, pending.catch(() => undefined)); return pending;
}

export { FETCH_TIMEOUT_MS, RETRY_DELAYS_MS, fetchWithRetry, sleepWithSignal } from './retry';
