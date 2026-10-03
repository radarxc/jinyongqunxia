import { describe, expect, it } from 'vitest';
import { createFrameStatsTracker } from './frame-stats';

describe('frame stats', () => {
  it('samples frame time and draw calls without replacing the hot-path object', () => {
    const tracker = createFrameStatsTracker();
    const identity = tracker.value;
    tracker.sample(100, 3);
    expect(tracker.value).toEqual({ drawCalls: 3, frameTimeMs: 0, qualityTier: 'high', renderScale: 1 });
    tracker.sample(116.7, 4);
    expect(tracker.value).toBe(identity);
    expect(tracker.value.drawCalls).toBe(4);
    expect(tracker.value.frameTimeMs).toBeCloseTo(16.7);
  });

  it('clamps invalid negative deltas and draw counts', () => {
    const tracker = createFrameStatsTracker();
    tracker.sample(10, -1);
    tracker.sample(5, -2);
    expect(tracker.value).toEqual({ drawCalls: 0, frameTimeMs: 0, qualityTier: 'high', renderScale: 1 });
  });

  it('feeds frame intervals to the shared quality source without replacing stats', () => {
    const sampled: number[] = [];
    const quality = { tier: 'mid' as const, renderScale: 0.9,
      effectivePixelRatio: (dpr: number) => dpr * 0.9,
      sample: (interval: number) => sampled.push(interval) };
    const tracker = createFrameStatsTracker(quality);
    tracker.sample(100, 1); tracker.sample(117, 2, 4);
    expect(sampled).toEqual([17]);
    expect(tracker.value).toMatchObject({ qualityTier: 'mid', renderScale: 0.9 });
  });

  it('discards the wake-up gap after a sampling reset', () => {
    const sampled: number[] = [];
    const quality = { tier: 'high' as const, renderScale: 1, effectivePixelRatio: (dpr: number) => dpr,
      sample: (interval: number) => sampled.push(interval) };
    const tracker = createFrameStatsTracker(quality);
    tracker.sample(100, 2); tracker.reset();
    tracker.sample(10_000, 2); tracker.sample(10_016, 2);
    expect(sampled).toEqual([16]);
  });
});
