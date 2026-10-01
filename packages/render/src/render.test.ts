import { describe, expect, it } from 'vitest';
import { createFrameStatsTracker } from './frame-stats';

describe('frame stats', () => {
  it('samples frame time and draw calls without replacing the hot-path object', () => {
    const tracker = createFrameStatsTracker();
    const identity = tracker.value;
    tracker.sample(100, 3);
    expect(tracker.value).toEqual({ drawCalls: 3, frameTimeMs: 0 });
    tracker.sample(116.7, 4);
    expect(tracker.value).toBe(identity);
    expect(tracker.value.drawCalls).toBe(4);
    expect(tracker.value.frameTimeMs).toBeCloseTo(16.7);
  });

  it('clamps invalid negative deltas and draw counts', () => {
    const tracker = createFrameStatsTracker();
    tracker.sample(10, -1);
    tracker.sample(5, -2);
    expect(tracker.value).toEqual({ drawCalls: 0, frameTimeMs: 0 });
  });
});
