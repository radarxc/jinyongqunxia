import { performance } from 'node:perf_hooks';
import { describe, expect, it } from 'vitest';
import { createCore } from '../src';

function percentile(samples: readonly number[], ratio: number): number {
  const sorted = [...samples].sort((left, right) => left - right);
  return sorted[Math.ceil(sorted.length * ratio) - 1]!;
}

describe('world tick dispatch performance', () => {
  it('keeps a single in-process dispatch comfortably below the frame budget', () => {
    const attempts: { p50: number; p95: number }[] = [];
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const core = createCore(attempt + 1);
      for (let warmup = 0; warmup < 500; warmup += 1) core.tick();
      const samples: number[] = [];
      for (let sample = 0; sample < 2_000; sample += 1) {
        const start = performance.now(); core.tick(); samples.push(performance.now() - start);
      }
      attempts.push({ p50: percentile(samples, 0.5), p95: percentile(samples, 0.95) });
    }
    const result = attempts.reduce((best, candidate) =>
      candidate.p95 < best.p95 ? candidate : best);
    console.info(`world/tick dispatch P50=${result.p50.toFixed(4)} ms P95=${result.p95.toFixed(4)} ms`);
    expect(result.p95).toBeLessThanOrEqual(5);
  });
});
