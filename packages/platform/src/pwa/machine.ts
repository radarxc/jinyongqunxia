export type PwaPhase = 'idle' | 'offlineReady' | 'needRefresh' | 'deltaSync' | 'ready' | 'activating';
export interface UpdateSafety { readonly localTransactionComplete: boolean;
  readonly inBattle: boolean; readonly dialogueCommitting: boolean }
export interface PwaSnapshot { readonly phase: PwaPhase; readonly firstPromptAt: number | null;
  readonly remindAt: number | null; readonly forced: boolean; readonly error: string | null }
export type PwaEvent =
  | { readonly type: 'OFFLINE_READY' }
  | { readonly type: 'UPDATE_FOUND'; readonly now: number; readonly hasDownloadedPacks: boolean; readonly forced?: boolean }
  | { readonly type: 'DELTA_SYNC_STARTED' }
  | { readonly type: 'DELTA_SYNCED' }
  | { readonly type: 'READY' }
  | { readonly type: 'DELTA_FAILED'; readonly error: string }
  | { readonly type: 'ACTIVATION_FAILED'; readonly error: string }
  | { readonly type: 'RESTORE_REMINDER'; readonly remindAt: number }
  | { readonly type: 'ACTIVATE'; readonly safety: UpdateSafety }
  | { readonly type: 'REMIND_LATER'; readonly now: number }
  | { readonly type: 'TICK'; readonly now: number }
  | { readonly type: 'RESET' };

export const UPDATE_REMINDER_MS = 24 * 60 * 60 * 1_000;
export const initialPwaSnapshot = (): PwaSnapshot => ({ phase: 'idle', firstPromptAt: null,
  remindAt: null, forced: false, error: null });
export const isUpdateSafe = (safety: UpdateSafety): boolean => safety.localTransactionComplete &&
  !safety.inBattle && !safety.dialogueCommitting;

export function reducePwaState(state: PwaSnapshot, event: PwaEvent): PwaSnapshot {
  switch (event.type) {
    case 'OFFLINE_READY': return state.phase === 'idle' ? { ...state, phase: 'offlineReady' } : state;
    case 'UPDATE_FOUND': return { phase: 'needRefresh',
      firstPromptAt: state.firstPromptAt ?? event.now, remindAt: null, forced: event.forced ?? false, error: null };
    case 'DELTA_SYNC_STARTED': return state.phase === 'needRefresh' ? { ...state, phase: 'deltaSync' } : state;
    case 'DELTA_SYNCED': return state.phase === 'deltaSync' ? { ...state, phase: 'ready', error: null } : state;
    case 'READY': return state.phase === 'needRefresh' ? { ...state, phase: 'ready' } : state;
    case 'DELTA_FAILED': return state.phase === 'deltaSync' ? { ...state, error: event.error } : state;
    case 'ACTIVATION_FAILED': return { ...state, phase: 'ready', error: event.error };
    case 'RESTORE_REMINDER': return { ...state, phase: 'needRefresh', remindAt: event.remindAt };
    case 'ACTIVATE': return state.phase === 'ready' && isUpdateSafe(event.safety)
      ? { ...state, phase: 'activating' } : state;
    case 'REMIND_LATER': return state.phase === 'ready' ? { ...state, phase: 'needRefresh',
      remindAt: event.now + UPDATE_REMINDER_MS } : state;
    case 'TICK': return state.phase === 'needRefresh' && state.remindAt !== null && event.now >= state.remindAt
      ? { ...state, phase: 'ready', remindAt: null } : state;
    case 'RESET': return initialPwaSnapshot();
  }
}

export class PwaUpdateMachine {
  private value = initialPwaSnapshot();
  private listeners = new Set<(state: PwaSnapshot) => void>();
  snapshot(): PwaSnapshot { return this.value; }
  dispatch(event: PwaEvent): PwaSnapshot {
    const next = reducePwaState(this.value, event);
    if (next !== this.value) { this.value = next; for (const listener of this.listeners) listener(next); }
    return next;
  }
  subscribe(listener: (state: PwaSnapshot) => void): () => void {
    this.listeners.add(listener); listener(this.value); return () => this.listeners.delete(listener);
  }
}

export const pwaUpdateMachine = new PwaUpdateMachine();
