import { computed, shallowRef } from 'vue';
import { deleteOfflineDownload, downloadOfflineClosure, fetchWithRetry, listActiveRecords,
  parseOfflineClosure, scanOfflineClosure, type OfflineClosure } from '@tianshu/platform/offline';

export type DownloadState = 'not-downloaded' | 'downloading' | 'complete' | 'partial' | 'error';
export interface DownloadRow { readonly chapter: string; readonly closure: OfflineClosure;
  readonly state: DownloadState; readonly verifiedBytes: number; readonly lastVerifiedAt: number | null;
  readonly etaSeconds: number | null; readonly error: string | null }
export const downloadRows = shallowRef<readonly DownloadRow[]>([]);
export const downloadActive = computed(() => downloadRows.value.some(row => row.state === 'downloading'));
let abortDownload: AbortController | undefined;
export function pauseDownloads(): void { abortDownload?.abort(); }
const patch = (chapter: string, update: Partial<DownloadRow>) => {
  downloadRows.value = downloadRows.value.map(row => row.chapter === chapter ? { ...row, ...update } : row);
};
export async function fetchClosure(chapter: string, refreshRoot = false): Promise<OfflineClosure> {
  if (!/^ch\d{2}_[a-z0-9_]+$/u.test(chapter)) throw new TypeError('OFFLINE_CHAPTER_INVALID');
  if (refreshRoot) await fetchWithRetry('/content/index.json?__ts_download=1');
  const response = await fetchWithRetry('/offline/closure.' + chapter + '.json?__ts_download=1');
  return parseOfflineClosure(await response.json());
}
export async function loadDownloads(): Promise<void> {
  if (!navigator.serviceWorker?.controller) return;
  const active = await listActiveRecords(caches);
  let chapters = active.map(row => row.closure.chapter);
  try {
    const response = await fetchWithRetry('/content/index.json?__ts_download=1');
    const value = await response.json() as { chapters: { chapter: string }[] };
    chapters = [...new Set([...chapters, ...value.chapters.map(row => row.chapter)])];
  } catch { /* Installed manifests remain available offline. */ }
  const rows: DownloadRow[] = [];
  for (const chapter of chapters.sort()) {
    const installed = active.find(row => row.closure.chapter === chapter);
    let closure = installed?.closure;
    if (!closure) { try { closure = await fetchClosure(chapter); } catch { continue; } }
    const scan = installed ? await scanOfflineClosure(closure) : null;
    rows.push({ chapter, closure, state: scan?.complete ? 'complete' : scan ? 'partial' : 'not-downloaded',
      verifiedBytes: scan?.validBytes ?? 0, lastVerifiedAt: scan?.checkedAt ?? null, etaSeconds: null, error: null });
  }
  downloadRows.value = rows;
}
export async function startDownload(chapter: string): Promise<void> {
  if (downloadActive.value || !navigator.serviceWorker?.controller) return;
  const row = downloadRows.value.find(entry => entry.chapter === chapter); if (!row) return;
  abortDownload = new AbortController();
  patch(chapter, { state: 'downloading', error: null });
  try {
    const result = await downloadOfflineClosure(row.closure, { signal: abortDownload.signal,
      refreshClosure: () => fetchClosure(chapter, true), onProgress: progress => patch(chapter, {
        verifiedBytes: progress.verifiedBytes, etaSeconds: progress.etaSeconds,
      }) });
    patch(chapter, { closure: result.closure, state: 'complete', verifiedBytes: result.verifiedBytes,
      lastVerifiedAt: Date.now(), etaSeconds: null });
  } catch (error) { patch(chapter, { state: abortDownload.signal.aborted ? 'partial' : 'error',
    etaSeconds: null, error: abortDownload.signal.aborted ? null : error instanceof Error ? error.message : String(error) }); }
  finally { abortDownload = undefined; }
}
export async function removeDownload(chapter: string): Promise<void> {
  if (downloadActive.value) return;
  await deleteOfflineDownload(chapter);
  patch(chapter, { state: 'not-downloaded', verifiedBytes: 0, lastVerifiedAt: null, error: null });
}
