import { performance } from 'node:perf_hooks';
import { describe, expect, it } from 'vitest';
import { runMeridianTickWorkload } from './meridian-flow.fixture';

describe('meridian-flow performance gate', () => {
  it('advances 1000 ticks across 12 compiled routes within 5 ms', () => {
    for (let warmup = 0; warmup < 8; warmup += 1) runMeridianTickWorkload();
    let bestMs = Number.POSITIVE_INFINITY;
    for (let sample = 0; sample < 7; sample += 1) {
      const started = performance.now();
      runMeridianTickWorkload();
      bestMs = Math.min(bestMs, performance.now() - started);
    }
    expect(bestMs).toBeLessThanOrEqual(5);
  });
});
