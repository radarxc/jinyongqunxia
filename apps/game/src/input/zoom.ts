export type ZoomContext = 'street' | 'interior';

export interface ZoomControllerOptions {
  readonly presets: readonly number[];
  readonly min: number;
  readonly max: number;
  readonly defaults: Readonly<Record<ZoomContext, number>>;
}

export interface ZoomController {
  value(): number;
  context(): ZoomContext;
  set(value: number): number;
  stepIn(): number;
  stepOut(): number;
  wheel(dyPx: number): number;
  /** Starts a pinch gesture at the current zoom (platform `onPinchStart`). */
  pinchStart(): number;
  /** Absolute scale relative to the gesture start; starts a gesture implicitly if none is open. */
  pinch(scale: number): number;
  /** Ends the gesture (platform `onPinchEnd`); the next pinch starts from the then-current zoom. */
  pinchEnd(): number;
  reset(): number;
  setContext(context: ZoomContext): number;
  subscribe(listener: (value: number) => void): () => void;
}

export const TOWN_ZOOM_OPTIONS: ZoomControllerOptions = {
  presets: [48, 64, 80, 96],
  min: 40,
  max: 112,
  defaults: { street: 80, interior: 96 },
};

const WHEEL_PX_PER_ZOOM_PX = 8;

export function createZoomController(options: ZoomControllerOptions): ZoomController {
  const presets = [...new Set(options.presets)]
    .filter(value => Number.isFinite(value) && value >= options.min && value <= options.max)
    .sort((left, right) => left - right);
  if (!Number.isFinite(options.min) || !Number.isFinite(options.max)
      || options.min > options.max || presets.length === 0) {
    throw new RangeError('Zoom bounds and presets must be finite and non-empty.');
  }
  const clamp = (candidate: number): number =>
    Math.min(options.max, Math.max(options.min, candidate));
  let currentContext: ZoomContext = 'street';
  let current = clamp(options.defaults[currentContext]);
  /** Zoom when the open pinch gesture began; null while no gesture is open. */
  let pinchOrigin: number | null = null;
  const listeners = new Set<(value: number) => void>();
  const update = (next: number): number => {
    if (!Number.isFinite(next)) return current;
    const clamped = clamp(next);
    if (clamped === current) return current;
    current = clamped;
    for (const listener of listeners) listener(current);
    return current;
  };

  return {
    value: () => current,
    context: () => currentContext,
    set(value) {
      if (!Number.isFinite(value)) return current;
      return update(value);
    },
    stepIn() {
      return update(presets.find(value => value > current) ?? current);
    },
    stepOut() {
      let next = current;
      for (let index = presets.length - 1; index >= 0; index -= 1) {
        if (presets[index]! < current) { next = presets[index]!; break; }
      }
      return update(next);
    },
    wheel(dyPx) {
      if (!Number.isFinite(dyPx)) return current;
      return update(current - dyPx / WHEEL_PX_PER_ZOOM_PX);
    },
    pinchStart() {
      pinchOrigin = current;
      return current;
    },
    pinch(scale) {
      if (!Number.isFinite(scale) || scale <= 0) return current;
      if (pinchOrigin === null) pinchOrigin = current;
      return update(pinchOrigin * scale);
    },
    pinchEnd() {
      pinchOrigin = null;
      return current;
    },
    reset() {
      pinchOrigin = null;
      return update(clamp(options.defaults[currentContext]));
    },
    setContext(context) {
      if (context === currentContext) return current;
      currentContext = context;
      pinchOrigin = null;
      return update(clamp(options.defaults[context]));
    },
    subscribe(listener) {
      listeners.add(listener);
      listener(current);
      return () => { listeners.delete(listener); };
    },
  };
}
