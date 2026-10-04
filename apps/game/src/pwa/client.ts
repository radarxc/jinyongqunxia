import { pwaController } from '@tianshu/platform/pwa';
import { downloadOfflineClosure, listActiveRecords, listRecords, publishOfflineClosures,
  type OfflineClosure } from '@tianshu/platform/offline';
import { fetchClosure } from './downloads';
import { registerSW } from './registration';

export async function registerPwa(): Promise<void> {
  if (!('serviceWorker' in navigator) || !('caches' in globalThis)) {
    await pwaController.refreshNetwork(); return;
  }
  const releaseKey = (async (): Promise<string> => {
    const controller = new AbortController();
    const timer = globalThis.setTimeout(() => controller.abort(), 3_000);
    try {
      const response = await fetch('/version.json?__ts_update=1', { cache: 'no-store', signal: controller.signal });
      const version = response.ok ? await response.json() as { releaseHash?: string } : null;
      return typeof version?.releaseHash === 'string' ? version.releaseHash : '';
    } catch { return ''; } finally { globalThis.clearTimeout(timer); }
  })();
  let pendingClosures: OfflineClosure[] = [];
  const syncDownloaded = async (): Promise<void> => {
    pendingClosures = [];
    const active = await listActiveRecords(caches); const all = await listRecords(caches);
    const records = [...new Map([...active, ...all.filter(row => row.state === 'prefetched')]
      .map(row => [row.closure.chapter, row])).values()];
    for (const record of records) {
      const closure = await fetchClosure(record.closure.chapter);
      const result = await downloadOfflineClosure(closure, { cacheStorage: caches, state: record.state,
        pinned: record.pinned, deferPublish: true,
        refreshClosure: () => fetchClosure(record.closure.chapter, true) });
      pendingClosures.push(result.closure);
    }
  };
  const activate = async (reloadPage?: boolean): Promise<void> => {
    await publishOfflineClosures(pendingClosures, caches);
    pendingClosures = []; await update(reloadPage);
  };
  const update = registerSW({ immediate: false,
    onOfflineReady: () => pwaController.offlineReady(),
    onNeedRefresh: () => { void Promise.all([listActiveRecords(caches), listRecords(caches), releaseKey])
      .then(([active, records, release]) => pwaController.needRefresh(activate,
        active.length > 0 || records.some(record => record.state === 'prefetched'), syncDownloaded, release))
      .catch(error => console.error('PWA update preparation failed', error)); },
    onRegisteredSW: (_url, registration) => { void registration?.update().catch(() => undefined); },
    onRegisterError: error => console.error('PWA registration failed', error),
  });
  const refresh = () => { void pwaController.refreshNetwork(); };
  window.addEventListener('online', refresh); window.addEventListener('offline', refresh);
  await pwaController.refreshNetwork();
}
