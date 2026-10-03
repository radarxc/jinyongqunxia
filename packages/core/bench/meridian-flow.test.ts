import { performance } from 'node:perf_hooks';
import { describe, expect, it } from 'vitest';
import { createMeridianPreviewWorkload, runMeridianFastForwardWorkload,
  runMeridianTickWorkload } from './meridian-flow.fixture';

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

  it('collapses a 1,000,000-tick stable tail within 5 ms', () => {
    for (let warmup = 0; warmup < 8; warmup += 1) runMeridianFastForwardWorkload();
    let bestMs = Number.POSITIVE_INFINITY;
    for (let sample = 0; sample < 9; sample += 1) {
      const started = performance.now();
      runMeridianFastForwardWorkload();
      bestMs = Math.min(bestMs, performance.now() - started);
    }
    console.info(`[meridian-fast-forward-perf] best-of-9=${bestMs.toFixed(3)}ms budget=5ms`);
    expect(bestMs).toBeLessThanOrEqual(5);
  });

  it('previews 12 compiled routes within the 2 ms AI budget', () => {
    const run = createMeridianPreviewWorkload();
    for (let warmup = 0; warmup < 20; warmup += 1) run();
    let bestMs = Number.POSITIVE_INFINITY;
    for (let sample = 0; sample < 9; sample += 1) {
      const started = performance.now();
      run();
      bestMs = Math.min(bestMs, performance.now() - started);
    }
    console.info(`[meridian-preview-perf] best-of-9=${bestMs.toFixed(3)}ms budget=2ms`);
    expect(bestMs).toBeLessThanOrEqual(2);
  });
});
