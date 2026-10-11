import { onBeforeUnmount, onMounted } from 'vue';
import type { KeyboardEdge, KeyboardState } from '@tianshu/platform/input';

export type ActionContextName =
  | 'modal' | 'dialogue' | 'areaMap' | 'explore' | 'worldmap' | 'global';
export type GlobalPageAction = 'characters' | 'inventory' | 'martial' | 'quests' | 'journey';
export type HexDirection = 0 | 1 | 2 | 3 | 4 | 5;

export interface ScreenVector {
  readonly vx: number;
  readonly vy: number;
}

type ActionResult = boolean | void;

export interface ActionHandlers {
  zoomIn?(): ActionResult;
  zoomOut?(): ActionResult;
  zoomReset?(): ActionResult;
  rotateLeft?(): ActionResult;
  rotateRight?(): ActionResult;
  move?(vector: Readonly<ScreenVector>): ActionResult;
  interact?(): ActionResult;
  toggleAreaMap?(): ActionResult;
  back?(): ActionResult;
  navigate?(page: GlobalPageAction): ActionResult;
  toggleDevPanel?(): ActionResult;
}

export interface ActionMap {
  pushContext(name: ActionContextName, handlers: Readonly<ActionHandlers>): () => void;
  handle(edge: Readonly<KeyboardEdge>, downCodes?: ReadonlySet<string>): boolean;
  /** Re-emits the held screen vector after a camera-yaw change. */
  reemitMove(): boolean;
  /**
   * Stops the walking explore context (one zero vector) and forgets accepted movement keys,
   * e.g. the moment the scene switches to battle; keys still held do not resume afterwards.
   */
  cancelMovement(): void;
  connect(source: KeyboardState, target?: KeyboardDomTarget, enabled?: () => boolean): () => void;
}

export interface KeyboardDomTarget {
  addEventListener(type: string, listener: EventListener, capture?: boolean): void;
  removeEventListener(type: string, listener: EventListener, capture?: boolean): void;
}

interface ContextEntry {
  readonly name: ActionContextName;
  readonly handlers: Readonly<ActionHandlers>;
  active: boolean;
}

const CONTEXT_PRIORITY: readonly ActionContextName[] = [
  'modal', 'dialogue', 'areaMap', 'explore', 'worldmap', 'global',
];
const MOVEMENT_CODES = new Set([
  'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight',
]);
const KEY_FALLBACK: Readonly<Record<string, string>> = {
  '=': 'Equal', '+': 'Equal', '-': 'Minus', '0': 'Digit0',
  q: 'KeyQ', Q: 'KeyQ', e: 'KeyE', E: 'KeyE',
  w: 'KeyW', W: 'KeyW', a: 'KeyA', A: 'KeyA',
  s: 'KeyS', S: 'KeyS', d: 'KeyD', D: 'KeyD',
  f: 'KeyF', F: 'KeyF', m: 'KeyM', M: 'KeyM',
  c: 'KeyC', C: 'KeyC', b: 'KeyB', B: 'KeyB',
  k: 'KeyK', K: 'KeyK', j: 'KeyJ', J: 'KeyJ',
  ' ': 'Space', Enter: 'Enter', Escape: 'Escape',
  ArrowUp: 'ArrowUp', ArrowLeft: 'ArrowLeft',
  ArrowDown: 'ArrowDown', ArrowRight: 'ArrowRight',
};
function codeOf(edge: Readonly<KeyboardEdge>): string {
  if (edge.code) return edge.code;
  if ((edge.key.length === 1 && edge.key.charCodeAt(0) === 96) || edge.key === '~') {
    return 'Backquote';
  }
  return KEY_FALLBACK[edge.key] || '';
}

function isHandled(result: ActionResult): boolean {
  return result !== false;
}

/** Maps a screen-space vector to the nearest pointy-top axial direction. */
export function screenVectorToHexDir(
  vx: number,
  vy: number,
  cameraYawDeg: number,
): HexDirection | null {
  if (!Number.isFinite(vx) || !Number.isFinite(vy) || !Number.isFinite(cameraYawDeg)
      || (vx === 0 && vy === 0)) return null;
  const screenOffset = Math.atan2(-vx, vy) * 180 / Math.PI;
  const desiredYaw = ((cameraYawDeg + screenOffset) % 360 + 360) % 360;
  const directionYaws = [0, 300, 240, 180, 120, 60] as const;
  let direction: HexDirection = 0;
  let nearest = Number.POSITIVE_INFINITY;
  for (let index = 0; index < directionYaws.length; index += 1) {
    const distance = Math.abs(((desiredYaw - directionYaws[index]! + 540) % 360) - 180);
    if (distance < nearest) {
      direction = index as HexDirection;
      nearest = distance;
    }
  }
  return direction;
}

const ZERO_MOVE: ScreenVector = Object.freeze({ vx: 0, vy: 0 });

export function createActionMap(): ActionMap {
  const entries: ContextEntry[] = [];
  /**
   * Movement keys the map actually accepted (pressed while explore was the top scene context, with
   * no IME composition, editable target or Ctrl / Meta / Alt). Raw platform `downCodes()` are only
   * used to drop keys whose release was lost; they never add directions.
   */
  const acceptedMovementCodes = new Set<string>();
  /** Dedup baseline: the top explore registration when the last vector was emitted. */
  let lastMoveTarget: ContextEntry | null = null;
  let lastEmittedMove: ScreenVector = ZERO_MOVE;
  let lastMoveHandled = false;
  /**
   * The entry whose `move` actually accepted the last non-zero vector (it may sit below a top
   * explore entry that has no `move` or returned false). Stops always go to this walker.
   */
  let moveHandler: ContextEntry | null = null;

  const entriesFor = (name: ActionContextName): ContextEntry[] =>
    entries.filter(entry => entry.active && entry.name === name).reverse();
  const topSceneContext = (): ActionContextName | null => {
    for (const name of CONTEXT_PRIORITY) {
      if (name !== 'global' && entries.some(entry => entry.active && entry.name === name)) {
        return name;
      }
    }
    return null;
  };
  const topExploreEntry = (): ContextEntry | null =>
    topSceneContext() === 'explore' ? entriesFor('explore')[0] ?? null : null;
  /** Runs `action` from the newest entry of `name` down; returns the entry that handled it. */
  const invokeEntry = <K extends keyof ActionHandlers>(
    name: ActionContextName,
    action: K,
    ...args: Parameters<NonNullable<ActionHandlers[K]>>
  ): ContextEntry | null => {
    for (const entry of entriesFor(name)) {
      const handler = entry.handlers[action];
      if (handler !== undefined && isHandled((handler as (...values: typeof args) => ActionResult)(...args))) {
        return entry;
      }
    }
    return null;
  };
  const invoke = <K extends keyof ActionHandlers>(
    name: ActionContextName,
    action: K,
    ...args: Parameters<NonNullable<ActionHandlers[K]>>
  ): boolean => invokeEntry(name, action, ...args) !== null;

  const invokeStack = <K extends keyof ActionHandlers>(
    action: K,
    ...args: Parameters<NonNullable<ActionHandlers[K]>>
  ): boolean => {
    for (const name of CONTEXT_PRIORITY) {
      if (invoke(name, action, ...args)) return true;
    }
    return false;
  };
  const currentMove = (): ScreenVector => {
    const isDown = (value: string): boolean => acceptedMovementCodes.has(value);
    return {
      vx: (isDown('KeyD') || isDown('ArrowRight') ? 1 : 0)
        - (isDown('KeyA') || isDown('ArrowLeft') ? 1 : 0),
      vy: (isDown('KeyS') || isDown('ArrowDown') ? 1 : 0)
        - (isDown('KeyW') || isDown('ArrowUp') ? 1 : 0),
    };
  };
  /** Sends the accepted vector to the top explore context, only when it changed for that context. */
  const emitMove = (force = false): boolean => {
    const target = topExploreEntry();
    if (target === null) return false;
    const vector = currentMove();
    if (!force && target === lastMoveTarget
        && vector.vx === lastEmittedMove.vx && vector.vy === lastEmittedMove.vy) {
      return lastMoveHandled;
    }
    lastMoveTarget = target;
    lastEmittedMove = vector;
    const handledBy = invokeEntry('explore', 'move', vector);
    // A different entry took over (or nobody did): the previous walker must still stop.
    if (moveHandler !== null && moveHandler !== handledBy && moveHandler.active) {
      moveHandler.handlers.move?.(ZERO_MOVE);
    }
    moveHandler = vector.vx === 0 && vector.vy === 0 ? null : handledBy;
    lastMoveHandled = handledBy !== null;
    return lastMoveHandled;
  };
  /**
   * Explore lost the top of the stack (modal / dialogue / area map / newer explore pushed, its entry
   * popped, or the map was disabled): stop the context that was walking and forget held keys, so
   * the player re-presses after the overlay closes and stale keys never leak into a new context.
   */
  const stopMovement = (): void => {
    const walker = moveHandler;
    acceptedMovementCodes.clear();
    lastMoveTarget = null;
    lastEmittedMove = ZERO_MOVE;
    lastMoveHandled = false;
    moveHandler = null;
    if (walker !== null && walker.active) walker.handlers.move?.(ZERO_MOVE);
  };
  const syncMovementOwner = (): void => {
    if (lastMoveTarget !== null && topExploreEntry() !== lastMoveTarget) stopMovement();
  };
  const movement = (
    edge: Readonly<KeyboardEdge>,
    code: string,
    downCodes?: ReadonlySet<string>,
  ): boolean => {
    if (downCodes !== undefined) {
      for (const held of [...acceptedMovementCodes]) {
        if (held !== code && !downCodes.has(held)) acceptedMovementCodes.delete(held);
      }
    }
    if (!edge.down) {
      // Releases of accepted keys always count (even on inputs or with modifiers held).
      if (!acceptedMovementCodes.delete(code)) return false;
      return emitMove();
    }
    if (edge.composing || edge.editableTarget || edge.ctrl || edge.meta || edge.alt) return false;
    if (topExploreEntry() === null) return false;
    acceptedMovementCodes.add(code);
    return emitMove();
  };
  const handle = (
    edge: Readonly<KeyboardEdge>,
    downCodes?: ReadonlySet<string>,
  ): boolean => {
    const code = codeOf(edge);
    if (MOVEMENT_CODES.has(code)) return movement(edge, code, downCodes);
    if (code === 'F5' || edge.composing || edge.editableTarget) return false;
    if (!edge.down || edge.repeat) return false;

    const modified = edge.ctrl || edge.meta || edge.alt;
    if (code === 'Equal' || code === 'NumpadAdd') {
      if (modified) return false;
      const context = topSceneContext();
      return context === 'explore' || context === 'areaMap'
        ? invoke(context, 'zoomIn') : false;
    }
    if (code === 'Minus' || code === 'NumpadSubtract') {
      if (modified) return false;
      const context = topSceneContext();
      return context === 'explore' || context === 'areaMap'
        ? invoke(context, 'zoomOut') : false;
    }
    if (code === 'Digit0' || code === 'Numpad0') {
      if (modified) return false;
      const context = topSceneContext();
      return context === 'explore' || context === 'areaMap'
        ? invoke(context, 'zoomReset') : false;
    }
    if (modified) return false;

    const top = topSceneContext();
    if (code === 'KeyQ') return top === 'explore' && invoke('explore', 'rotateLeft');
    if (code === 'KeyE') return top === 'explore' && invoke('explore', 'rotateRight');
    if (code === 'KeyF' || code === 'Space' || code === 'Enter') {
      return top === 'explore' && invoke('explore', 'interact');
    }
    if (code === 'KeyM') {
      if (top === 'explore' || top === 'areaMap') return invoke(top, 'toggleAreaMap');
      return invoke('global', 'navigate', 'journey');
    }
    if (code === 'Escape') return invokeStack('back');
    const pages: Readonly<Partial<Record<string, GlobalPageAction>>> = {
      KeyC: 'characters', KeyB: 'inventory', KeyK: 'martial', KeyJ: 'quests',
    };
    const page = pages[code];
    if (page !== undefined) return invokeStack('navigate', page);
    if (code === 'Backquote') return invokeStack('toggleDevPanel');
    return false;
  };

  return {
    pushContext(name, handlers) {
      const entry: ContextEntry = { name, handlers, active: true };
      entries.push(entry);
      syncMovementOwner();
      return () => {
        if (!entry.active) return;
        // Stop first, while the leaving handler is still active, so it receives the zero vector.
        if (entry === lastMoveTarget || entry === moveHandler) stopMovement();
        entry.active = false;
        const index = entries.indexOf(entry);
        if (index >= 0) entries.splice(index, 1);
        syncMovementOwner();
      };
    },
    handle,
    reemitMove: () => emitMove(true),
    cancelMovement: () => { stopMovement(); },
    connect(source, target, enabled = () => true) {
      let handled = false;
      let nativeEvent: KeyboardEvent | undefined;
      const captureNative = (event: KeyboardEvent): void => { nativeEvent = event; };
      const targetMatches = (selectors: string): boolean => {
        const closest = (nativeEvent?.target as { closest?: (query: string) => unknown } | null)?.closest;
        return typeof closest === 'function'
          && closest.call(nativeEvent?.target, selectors) !== null;
      };
      const unsubscribe = source.subscribe((edge) => {
        if (!enabled()) { handled = false; stopMovement(); return; }
        const code = codeOf(edge);
        // Releasing an accepted movement key always cleans up, wherever focus is.
        if (MOVEMENT_CODES.has(code) && !edge.down) {
          handled = handle(edge, source.downCodes());
          return;
        }
        if (nativeEvent?.defaultPrevented === true) { handled = false; return; }
        if (targetMatches('[role=dialog]')) {
          // Inside a dialog only Escape reaches a registered modal / dialogue context; without
          // one (or for any other key) the dialog keeps the event, as before ActionMap.
          handled = code === 'Escape' && edge.down && !edge.repeat && !edge.composing
            && !edge.editableTarget && !edge.ctrl && !edge.meta && !edge.alt
            && (invoke('modal', 'back') || invoke('dialogue', 'back'));
          return;
        }
        const interactKey = code === 'KeyF' || code === 'Space' || code === 'Enter';
        handled = !(interactKey && targetMatches('button')) && handle(edge, source.downCodes());
      });
      const preventHandled = (event: KeyboardEvent): void => {
        if (handled) event.preventDefault();
        handled = false;
        nativeEvent = undefined;
      };
      const clearNative = (): void => { nativeEvent = undefined; };
      target?.addEventListener('keydown', captureNative as EventListener, true);
      target?.addEventListener('keyup', captureNative as EventListener, true);
      target?.addEventListener('keydown', preventHandled as EventListener);
      target?.addEventListener('keyup', clearNative as EventListener);
      let connected = true;
      return () => {
        if (!connected) return;
        connected = false;
        stopMovement();
        unsubscribe();
        target?.removeEventListener('keydown', captureNative as EventListener, true);
        target?.removeEventListener('keyup', captureNative as EventListener, true);
        target?.removeEventListener('keydown', preventHandled as EventListener);
        target?.removeEventListener('keyup', clearNative as EventListener);
      };
    },
  };
}

export const actionMap = createActionMap();

/** Registers an application action context for the lifetime of a Vue component. */
export function useActionContext(
  name: ActionContextName,
  handlers: Readonly<ActionHandlers>,
): void {
  let release: (() => void) | undefined;
  onMounted(() => { release = actionMap.pushContext(name, handlers); });
  onBeforeUnmount(() => { release?.(); release = undefined; });
}
