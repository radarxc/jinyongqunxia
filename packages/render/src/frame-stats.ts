import { getDefaultRenderQuality, type QualityTier, type RenderQualitySource } from './quality/tiers';
import type { FrameSamplingState } from './quality/auto-tuner';

export interface FrameStats {
  readonly drawCalls: number;
  readonly frameTimeMs: number;
  readonly qualityTier: QualityTier;
  readonly renderScale: number;
}

export interface FrameStatsTracker {
  readonly value: FrameStats;
  sample(timeMs: number, drawCalls: number, workMs?: number, state?: FrameSamplingState): void;
  reset(timeMs?: number): void;
}

export function createFrameStatsTracker(quality: RenderQualitySource = getDefaultRenderQuality()): FrameStatsTracker {
  let previousTimeMs: number | null = null;
  const value = { drawCalls: 0, frameTimeMs: 0, qualityTier: quality.tier, renderScale: quality.renderScale };
  return {
    value,
    sample(timeMs, drawCalls, workMs = 0, state) {
      if (!Number.isFinite(timeMs)) return;
      value.frameTimeMs = previousTimeMs === null ? 0 : Math.max(0, timeMs - previousTimeMs);
      value.drawCalls = Math.max(0, Math.trunc(drawCalls));
      if (value.frameTimeMs > 0) quality.sample?.(value.frameTimeMs, workMs, timeMs, state);
      value.qualityTier = quality.tier; value.renderScale = quality.renderScale;
      previousTimeMs = timeMs;
    },
    reset(timeMs) { previousTimeMs = null; value.frameTimeMs = 0; quality.invalidateSamples?.(timeMs); },
  };
}
