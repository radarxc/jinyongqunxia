import { performance } from 'node:perf_hooks';
import { describe, expect, it } from 'vitest';
import { runLongSessionWorkload } from './combat.fixture';

describe('BattleSession performance gate', () => {
  it('keeps a 2000-action BattleSession linear enough for the action cap', () => {
    for (let warmup = 0; warmup < 2; warmup += 1) runLongSessionWorkload(200, warmup);
    const bestOf = (actions: number) => {
      let bestMs = Number.POSITIVE_INFINITY;
      for (let sample = 0; sample < 5; sample += 1) {
        const started = performance.now(); runLongSessionWorkload(actions, sample);
        bestMs = Math.min(bestMs, performance.now() - started);
      }
      return bestMs;
    };
    const halfMs = bestOf(1_000); const fullMs = bestOf(2_000);
    expect(fullMs).toBeLessThanOrEqual(2_000);
    expect(fullMs).toBeLessThanOrEqual(halfMs * 3);
  });
});
