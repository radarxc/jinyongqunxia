import { performance } from 'node:perf_hooks';
import { describe, expect, it } from 'vitest';
import { runCombatWorkload } from './combat.fixture';

describe('automatic combat performance gate', () => {
  it('settles a 20-round automatic battle within 20 ms', () => {
    for (let warmup = 0; warmup < 12; warmup += 1) runCombatWorkload(warmup);
    let bestMs = Number.POSITIVE_INFINITY;
    for (let sample = 0; sample < 9; sample += 1) {
      const started = performance.now();
      runCombatWorkload(sample);
      bestMs = Math.min(bestMs, performance.now() - started);
    }
    expect(bestMs).toBeLessThanOrEqual(20);
  });
});
