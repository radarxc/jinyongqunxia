import { isUpdateSafe, PwaUpdateMachine, UPDATE_REMINDER_MS, type PwaSnapshot, type UpdateSafety } from './machine';
import { probeVersion, type NetworkSnapshot } from './network';

export interface PwaControllerSnapshot { readonly update: PwaSnapshot; readonly network: NetworkSnapshot }
export interface PwaControllerOptions {
  readonly now?: () => number;
  readonly fetch?: typeof globalThis.fetch;
  readonly safety?: () => UpdateSafety;
  readonly syncDownloadedPacks?: () => Promise<void>;
  readonly unregister?: () => Promise<void>;
  readonly deleteShellCaches?: () => Promise<void>;
  readonly reload?: () => void;
  readonly schedule?: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>;
  readonly cancelSchedule?: (timer: ReturnType<typeof setTimeout>) => void;
}

export class PwaController {
  readonly machine = new PwaUpdateMachine();
  private updateServiceWorker?: (reloadPage?: boolean) => Promise<void>;
  private network: NetworkSnapshot = { status: 'checking', browserOnline: true, reachable: null, checkedAt: null };
  private listeners = new Set<(value: PwaControllerSnapshot) => void>();
  private readonly now: () => number;
  private reminder: ReturnType<typeof setTimeout> | undefined;
  private safetyProvider: (() => UpdateSafety) | undefined;
  private refreshing: Promise<void> | undefined;
  private retryPreparation: (() => Promise<void>) | undefined;
  private activating = false;
  private probeId = 0;
  private releaseKey = '';
  constructor(private readonly options: PwaControllerOptions = {}) { this.now = options.now ?? Date.now;
    this.machine.subscribe(() => this.emit()); }
  snapshot(): PwaControllerSnapshot { return { update: this.machine.snapshot(), network: this.network }; }
  subscribe(listener: (value: PwaControllerSnapshot) => void): () => void {
    this.listeners.add(listener); listener(this.snapshot()); return () => this.listeners.delete(listener);
  }
  private emit(): void { const value = this.snapshot(); for (const listener of this.listeners) listener(value); }
  setSafetyProvider(provider: (() => UpdateSafety) | undefined): void { this.safetyProvider = provider; }
  offlineReady(): void { this.machine.dispatch({ type: 'OFFLINE_READY' }); }
  async needRefresh(update: (reloadPage?: boolean) => Promise<void>, hasPacks: boolean,
    syncDownloadedPacks = this.options.syncDownloadedPacks, releaseKey = ''): Promise<void> {
    if (this.refreshing) return this.refreshing;
    this.retryPreparation = () => this.needRefresh(update, hasPacks, syncDownloadedPacks, releaseKey);
    this.releaseKey = releaseKey;
    this.updateServiceWorker = update; this.machine.dispatch({ type: 'UPDATE_FOUND', now: this.now(), hasDownloadedPacks: hasPacks });
    this.refreshing = (async () => {
      if (!hasPacks) this.machine.dispatch({ type: 'READY' });
      else {
        this.machine.dispatch({ type: 'DELTA_SYNC_STARTED' });
        try {
          if (!syncDownloadedPacks) throw new Error('OFFLINE_SYNC_UNAVAILABLE');
          await syncDownloadedPacks(); this.machine.dispatch({ type: 'DELTA_SYNCED' });
        } catch (error) { this.machine.dispatch({ type: 'DELTA_FAILED', error: error instanceof Error ? error.message : String(error) }); }
      }
      try {
        const stored = JSON.parse(globalThis.localStorage?.getItem('ts-pwa-reminder') ?? 'null') as
          { releaseKey: string; remindAt: number } | null;
        if (stored?.releaseKey === releaseKey && stored.remindAt > this.now() && this.machine.snapshot().phase === 'ready') {
          this.machine.dispatch({ type: 'RESTORE_REMINDER', remindAt: stored.remindAt });
          this.scheduleReminder(stored.remindAt - this.now());
        }
      } catch { /* Storage can be denied; the in-session timer remains available. */ }
    })();
    try { await this.refreshing; } finally { this.refreshing = undefined; }
  }
  async retryUpdate(): Promise<void> { await this.retryPreparation?.(); }
  async activate(safetyOverride?: UpdateSafety): Promise<boolean> {
    if (this.activating || !this.updateServiceWorker || this.machine.snapshot().phase !== 'ready') return false;
    const safety = this.safety(safetyOverride);
    const next = this.machine.dispatch({ type: 'ACTIVATE', safety });
    if (next.phase !== 'activating') return false;
    this.activating = true;
    try { await this.updateServiceWorker(true); return true; }
    catch (error) { this.machine.dispatch({ type: 'ACTIVATION_FAILED', error: error instanceof Error ? error.message : String(error) }); return false; }
    finally { this.activating = false; }
  }
  private safety(override?: UpdateSafety): UpdateSafety {
    return override ?? this.safetyProvider?.() ?? this.options.safety?.() ??
      { localTransactionComplete: false, inBattle: true, dialogueCommitting: true };
  }
  remindLater(): void {
    this.machine.dispatch({ type: 'REMIND_LATER', now: this.now() });
    if (this.machine.snapshot().remindAt === null) return;
    try { globalThis.localStorage?.setItem('ts-pwa-reminder', JSON.stringify({ releaseKey: this.releaseKey,
      remindAt: this.machine.snapshot().remindAt })); } catch { /* Best effort. */ }
    this.scheduleReminder(UPDATE_REMINDER_MS);
  }
  private scheduleReminder(delay: number): void {
    if (this.reminder !== undefined) (this.options.cancelSchedule ?? clearTimeout)(this.reminder);
    this.reminder = (this.options.schedule ?? setTimeout)(() => this.tick(), delay);
  }
  tick(): void { this.machine.dispatch({ type: 'TICK', now: this.now() }); }
  async refreshNetwork(signal?: AbortSignal): Promise<NetworkSnapshot> {
    const id = ++this.probeId; const next = await probeVersion({ fetch: this.options.fetch, signal, now: this.now });
    if (id === this.probeId) { this.network = next; this.emit(); } return this.network;
  }
  async forceUpdate(): Promise<void> {
    if (this.activating || !isUpdateSafe(this.safety())) return;
    this.activating = true;
    try {
    if (this.options.unregister) await this.options.unregister();
    else if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
    }
    if (this.options.deleteShellCaches) await this.options.deleteShellCaches();
    else if ('caches' in globalThis) {
      const names = await caches.keys();
      await Promise.all(names.filter(name => name === 'ts-shell' || name.startsWith('workbox-precache'))
        .map(name => caches.delete(name)));
    }
    (this.options.reload ?? (() => location.reload()))();
    } finally { this.activating = false; }
  }
  dispose(): void {
    if (this.reminder !== undefined) (this.options.cancelSchedule ?? clearTimeout)(this.reminder);
    this.listeners.clear(); this.probeId += 1;
  }
}

export const pwaController = new PwaController();
