export interface WheelDeltaLike {
  readonly deltaX: number;
  readonly deltaY: number;
  readonly deltaMode: number;
}

export interface NormalizedWheelDelta {
  readonly dx: number;
  readonly dy: number;
}

/** Converts DOM_DELTA_PIXEL / LINE / PAGE wheel values to CSS pixels. */
export function normalizeWheel(
  event: WheelDeltaLike,
  lineHeightPx = 16,
  pageHeightPx = 800,
): NormalizedWheelDelta {
  const multiplier = event.deltaMode === 1
    ? lineHeightPx
    : event.deltaMode === 2 ? pageHeightPx : 1;
  return { dx: event.deltaX * multiplier, dy: event.deltaY * multiplier };
}
