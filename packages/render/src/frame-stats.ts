export interface FrameStats {
  readonly drawCalls: number;
  readonly frameTimeMs: number;
}

export interface FrameStatsTracker {
  readonly value: FrameStats;
  sample(timeMs: number, drawCalls: number): void;
}

export function createFrameStatsTracker(): FrameStatsTracker {
  let previousTimeMs: number | null = null;
  const value = { drawCalls: 0, frameTimeMs: 0 };
  return {
    value,
    sample(timeMs, drawCalls) {
      value.frameTimeMs = previousTimeMs === null ? 0 : Math.max(0, timeMs - previousTimeMs);
      value.drawCalls = Math.max(0, Math.trunc(drawCalls));
      previousTimeMs = timeMs;
    },
  };
}
