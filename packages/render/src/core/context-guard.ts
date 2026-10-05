/* global HTMLCanvasElement */
export type ContextState = 'ok' | 'lost' | 'failed';
export type ContextFailure = 'reload' | 'restart-browser';

export interface ContextGuardRenderer {
  getContext(): { isContextLost(): boolean };
  setPixelRatio(value: number): void;
  setSize(width: number, height: number, updateStyle?: boolean): void;
}

export interface ContextGuardOptions {
  readonly timeoutMs?: number;
  readonly onStateChange?: ((state: ContextState) => void) | undefined;
  readonly onLoss?: ((sessionLossCount: number) => void) | undefined;
  readonly onRestore?: (() => void) | undefined;
  readonly onRecreate?: (() => Promise<boolean>) | undefined;
  readonly onFatal?: ((kind: ContextFailure) => void) | undefined;
  readonly requestFrame?: (() => void) | undefined;
}

export interface ContextGuard {
  readonly state: ContextState;
  readonly sessionLossCount: number;
  readonly canRender: boolean;
  resize(width: number, height: number, pixelRatio: number): void;
  dispose(): void;
}

export function createContextGuard(
  canvas: HTMLCanvasElement,
  renderer: ContextGuardRenderer,
  options: ContextGuardOptions = {},
): ContextGuard {
  let state: ContextState = 'ok';
  let sessionLossCount = 0;
  let width = 1;
  let height = 1;
  let pixelRatio = 1;
  let disposed = false;
  let restoreTimer: ReturnType<typeof setTimeout> | undefined;
  let recoveryGeneration = 0;
  const owner = canvas.ownerDocument;

  const changeState = (next: ContextState): void => {
    if (state === next) return;
    state = next;
    options.onStateChange?.(next);
  };
  const clearRestoreTimer = (): void => {
    if (restoreTimer !== undefined) clearTimeout(restoreTimer);
    restoreTimer = undefined;
  };
  const fail = (): void => {
    changeState('failed');
    options.onFatal?.(sessionLossCount >= 3 ? 'restart-browser' : 'reload');
  };
  const escalate = async (): Promise<void> => {
    const generation = recoveryGeneration;
    changeState('failed');
    if (options.onRecreate) {
      try {
        if (await options.onRecreate()) return;
      } catch { /* Surface the failure through the DOM recovery owner. */ }
    }
    if (!disposed && generation === recoveryGeneration && state === 'failed') fail();
  };
  const enterLost = (): void => {
    if (disposed || state === 'lost' || state === 'failed') return;
    sessionLossCount += 1;
    recoveryGeneration += 1;
    changeState('lost');
    options.onLoss?.(sessionLossCount);
    clearRestoreTimer();
    restoreTimer = setTimeout(() => {
      restoreTimer = undefined;
      if (!disposed && state === 'lost') void escalate();
    }, options.timeoutMs ?? 5_000);
  };
  const lost = (event: Event): void => {
    event.preventDefault();
    enterLost();
  };
  const restored = (): void => {
    if (disposed || state === 'ok') return;
    recoveryGeneration += 1;
    clearRestoreTimer();
    try {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      options.onRestore?.();
    } catch { fail(); return; }
    changeState('ok');
    if (owner.visibilityState !== 'hidden') options.requestFrame?.();
  };
  const visibility = (): void => {
    if (disposed || owner.visibilityState === 'hidden') return;
    if (renderer.getContext().isContextLost()) enterLost();
    else if (state === 'ok') options.requestFrame?.();
    else restored();
  };

  canvas.addEventListener('webglcontextlost', lost);
  canvas.addEventListener('webglcontextrestored', restored);
  owner.addEventListener('visibilitychange', visibility);
  owner.defaultView?.addEventListener('pageshow', visibility);
  if (renderer.getContext().isContextLost()) enterLost();

  return {
    get state() { return state; },
    get sessionLossCount() { return sessionLossCount; },
    get canRender() { return !disposed && state === 'ok' && owner.visibilityState !== 'hidden'; },
    resize(nextWidth, nextHeight, nextPixelRatio) {
      if (disposed) return;
      width = Math.max(1, nextWidth);
      height = Math.max(1, nextHeight);
      pixelRatio = Number.isFinite(nextPixelRatio) && nextPixelRatio > 0 ? nextPixelRatio : 1;
      if (state === 'ok') {
        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(width, height, false);
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      recoveryGeneration += 1;
      clearRestoreTimer();
      canvas.removeEventListener('webglcontextlost', lost);
      canvas.removeEventListener('webglcontextrestored', restored);
      owner.removeEventListener('visibilitychange', visibility);
      owner.defaultView?.removeEventListener('pageshow', visibility);
    },
  };
}
