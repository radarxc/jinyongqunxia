export interface KeyboardEdge {
  code: string;
  key: string;
  down: boolean;
  repeat: boolean;
  shift: boolean;
  ctrl: boolean;
  alt: boolean;
  meta: boolean;
  composing: boolean;
  editableTarget: boolean;
}

export type KeyboardEdgeListener = (edge: Readonly<KeyboardEdge>) => void;

export interface KeyboardState {
  isDown(code: string): boolean;
  /** A stable read-only view. Do not cast it back to a mutable Set. */
  downCodes(): ReadonlySet<string>;
  subscribe(listener: KeyboardEdgeListener): () => void;
  dispose(): void;
}

type WindowTarget = Pick<Window, 'addEventListener' | 'removeEventListener'>;
type DocumentTarget = Pick<
  Document,
  'addEventListener' | 'removeEventListener' | 'visibilityState'
>;

interface ClosestTarget {
  closest(selectors: string): unknown;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (target === null || typeof target !== 'object') return false;
  const closest = (target as Partial<ClosestTarget>).closest;
  if (typeof closest !== 'function') return false;
  return closest.call(target, 'input, textarea, select, [contenteditable]') !== null;
}

/**
 * Tracks physical keys by `KeyboardEvent.code` and emits transition edges.
 *
 * The edge object is reused after each listener call. Consumers must copy any
 * fields they need to retain beyond the callback.
 */
export function createKeyboardState(
  target: WindowTarget,
  doc?: DocumentTarget,
): KeyboardState {
  const down = new Set<string>();
  const readonlyDown: ReadonlySet<string> = {
    get size() { return down.size; },
    has: (code) => down.has(code),
    forEach(callback, thisArg) {
      down.forEach((code) => callback.call(thisArg, code, code, readonlyDown));
    },
    entries: () => down.entries(),
    keys: () => down.keys(),
    values: () => down.values(),
    [Symbol.iterator]: () => down[Symbol.iterator](),
  };
  const keyByCode = new Map<string, string>();
  const listeners = new Set<KeyboardEdgeListener>();
  const edge: KeyboardEdge = {
    code: '', key: '', down: false, repeat: false,
    shift: false, ctrl: false, alt: false, meta: false,
    composing: false, editableTarget: false,
  };
  let disposed = false;

  const emit = (event: KeyboardEvent, isDown: boolean): void => {
    edge.code = event.code;
    edge.key = event.key;
    edge.down = isDown;
    edge.repeat = event.repeat;
    edge.shift = event.shiftKey;
    edge.ctrl = event.ctrlKey;
    edge.alt = event.altKey;
    edge.meta = event.metaKey;
    edge.composing = event.isComposing || event.keyCode === 229;
    edge.editableTarget = isEditableTarget(event.target);
    for (const listener of listeners) listener(edge);
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    if (down.has(event.code)) return;
    down.add(event.code);
    keyByCode.set(event.code, event.key);
    emit(event, true);
  };

  const onKeyUp = (event: KeyboardEvent): void => {
    if (!down.delete(event.code)) return;
    keyByCode.delete(event.code);
    emit(event, false);
  };

  const releaseAll = (): void => {
    for (const code of down) {
      const key = keyByCode.get(code) ?? '';
      down.delete(code); keyByCode.delete(code);
      edge.code = code; edge.key = key; edge.down = false;
      edge.repeat = false; edge.shift = false; edge.ctrl = false;
      edge.alt = false; edge.meta = false; edge.composing = false;
      edge.editableTarget = false;
      for (const listener of listeners) listener(edge);
    }
  };

  const onBlur = (): void => releaseAll();
  const onVisibilityChange = (): void => {
    if (doc?.visibilityState === 'hidden') releaseAll();
  };

  target.addEventListener('keydown', onKeyDown);
  target.addEventListener('keyup', onKeyUp);
  target.addEventListener('blur', onBlur);
  doc?.addEventListener('visibilitychange', onVisibilityChange);

  return {
    isDown: (code) => down.has(code),
    downCodes: () => readonlyDown,
    subscribe(listener) {
      if (disposed) return () => undefined;
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      target.removeEventListener('keydown', onKeyDown);
      target.removeEventListener('keyup', onKeyUp);
      target.removeEventListener('blur', onBlur);
      doc?.removeEventListener('visibilitychange', onVisibilityChange);
      down.clear(); keyByCode.clear(); listeners.clear();
    },
  };
}
