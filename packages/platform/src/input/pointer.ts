export const TAP_MAX_DURATION_MS = 250;
export const TAP_MAX_DISTANCE_PX = 10;

export interface TapGesture {
  x: number;
  y: number;
  pointerId: number;
  pointerType: string;
  button: number;
}

export interface DragGesture extends TapGesture {
  phase: 'start' | 'move' | 'end' | 'cancel';
  startX: number;
  startY: number;
  dx: number;
  dy: number;
}

export interface PinchGesture {
  scale: number;
  centerX: number;
  centerY: number;
}

export interface PointerGestureOptions {
  onTap?(gesture: Readonly<TapGesture>): void;
  onDrag?(gesture: Readonly<DragGesture>): void;
  onPinch?(gesture: Readonly<PinchGesture>): void;
}

export interface PointerGestures {
  dispose(): void;
}

type PointerTarget = Pick<HTMLElement, 'addEventListener' | 'removeEventListener'>
  & Partial<Pick<HTMLElement, 'setPointerCapture' | 'releasePointerCapture'>>;

interface PointerTrack {
  id: number; startX: number; startY: number; x: number; y: number;
  lastX: number; lastY: number; startTime: number; pointerType: string;
  button: number; dragging: boolean; suppressed: boolean;
}

/**
 * Recognizes tap, drag, and two-pointer pinch using Pointer Events only.
 * Callback payload objects are reused after each callback; copy fields that
 * must outlive the callback. This helper intentionally does not set touch-action.
 */
export function createPointerGestures(
  element: PointerTarget,
  options: PointerGestureOptions,
): PointerGestures {
  const pointers = new Map<number, PointerTrack>();
  const tap: TapGesture = { x: 0, y: 0, pointerId: 0, pointerType: '', button: 0 };
  const drag: DragGesture = { ...tap, phase: 'start', startX: 0, startY: 0, dx: 0, dy: 0 };
  const pinch: PinchGesture = { scale: 1, centerX: 0, centerY: 0 };
  let pinchA: PointerTrack | undefined;
  let pinchB: PointerTrack | undefined;
  let pinchStartDistance = 0;
  let disposed = false;

  const fillPoint = (out: TapGesture, track: PointerTrack): void => {
    out.x = track.x; out.y = track.y; out.pointerId = track.id;
    out.pointerType = track.pointerType; out.button = track.button;
  };
  const emitDrag = (track: PointerTrack, phase: DragGesture['phase']): void => {
    fillPoint(drag, track); drag.phase = phase;
    drag.startX = track.startX; drag.startY = track.startY;
    drag.dx = track.x - track.lastX; drag.dy = track.y - track.lastY;
    options.onDrag?.(drag);
    track.lastX = track.x; track.lastY = track.y;
  };
  const distance = (a: PointerTrack, b: PointerTrack): number =>
    Math.hypot(a.x - b.x, a.y - b.y);
  const emitPinch = (): void => {
    if (pinchA === undefined || pinchB === undefined) return;
    const currentDistance = distance(pinchA, pinchB);
    pinch.scale = pinchStartDistance === 0 ? 1 : currentDistance / pinchStartDistance;
    pinch.centerX = (pinchA.x + pinchB.x) / 2;
    pinch.centerY = (pinchA.y + pinchB.y) / 2;
    options.onPinch?.(pinch);
  };
  const beginPinch = (): void => {
    if (pointers.size !== 2 || pinchA !== undefined) return;
    const iterator = pointers.values();
    pinchA = iterator.next().value as PointerTrack;
    pinchB = iterator.next().value as PointerTrack;
    for (const track of [pinchA, pinchB]) {
      if (track.dragging) emitDrag(track, 'cancel');
      track.suppressed = true;
    }
    pinchStartDistance = distance(pinchA, pinchB);
    emitPinch();
  };
  const updatePosition = (track: PointerTrack, event: PointerEvent): void => {
    track.x = event.clientX; track.y = event.clientY;
  };
  const movedDistance = (track: PointerTrack): number =>
    Math.hypot(track.x - track.startX, track.y - track.startY);

  const onPointerDown = (event: PointerEvent): void => {
    if (pointers.has(event.pointerId)) return;
    const track: PointerTrack = {
      id: event.pointerId, startX: event.clientX, startY: event.clientY,
      x: event.clientX, y: event.clientY, lastX: event.clientX, lastY: event.clientY,
      startTime: event.timeStamp, pointerType: event.pointerType, button: event.button,
      dragging: false, suppressed: pinchA !== undefined,
    };
    pointers.set(event.pointerId, track);
    element.setPointerCapture?.(event.pointerId);
    beginPinch();
  };

  const onPointerMove = (event: PointerEvent): void => {
    const track = pointers.get(event.pointerId);
    if (track === undefined) return;
    updatePosition(track, event);
    if (track === pinchA || track === pinchB) { emitPinch(); return; }
    if (track.suppressed) return;
    if (!track.dragging && movedDistance(track) > TAP_MAX_DISTANCE_PX) {
      track.dragging = true; emitDrag(track, 'start'); return;
    }
    if (track.dragging) emitDrag(track, 'move');
  };

  const finishPointer = (event: PointerEvent, cancelled: boolean): void => {
    const track = pointers.get(event.pointerId);
    if (track === undefined) return;
    updatePosition(track, event);
    const wasPinching = track === pinchA || track === pinchB;
    if (!wasPinching && !track.suppressed) {
      if (!track.dragging && movedDistance(track) > TAP_MAX_DISTANCE_PX) {
        track.dragging = true;
        emitDrag(track, 'start');
      }
      if (track.dragging) {
        emitDrag(track, cancelled ? 'cancel' : 'end');
      } else if (!cancelled
        && event.timeStamp - track.startTime <= TAP_MAX_DURATION_MS
        && movedDistance(track) <= TAP_MAX_DISTANCE_PX) {
        fillPoint(tap, track); options.onTap?.(tap);
      }
    }
    pointers.delete(event.pointerId);
    element.releasePointerCapture?.(event.pointerId);
    if (wasPinching) {
      pinchA = undefined; pinchB = undefined; pinchStartDistance = 0;
      for (const remaining of pointers.values()) remaining.suppressed = true;
    }
  };
  const onPointerUp = (event: PointerEvent): void => finishPointer(event, false);
  const onPointerCancel = (event: PointerEvent): void => finishPointer(event, true);

  element.addEventListener('pointerdown', onPointerDown);
  element.addEventListener('pointermove', onPointerMove);
  element.addEventListener('pointerup', onPointerUp);
  element.addEventListener('pointercancel', onPointerCancel);

  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerup', onPointerUp);
      element.removeEventListener('pointercancel', onPointerCancel);
      pointers.clear(); pinchA = undefined; pinchB = undefined;
    },
  };
}
