import { performance } from 'node:perf_hooks';
import { describe, expect, it } from 'vitest';
import { runCombatWorkload, runLongCommandWorkload } from './combat.fixture';

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

  it('commits 2000 actions through the transaction bus within 2000 ms', () => {
    runLongCommandWorkload(200, 0);
    let bestMs = Number.POSITIVE_INFINITY;
    for (let sample = 0; sample < 3; sample += 1) {
      const started = performance.now();
      runLongCommandWorkload(2_000, sample);
      bestMs = Math.min(bestMs, performance.now() - started);
    }
    expect(bestMs).toBeLessThanOrEqual(2_000);
  });
});
