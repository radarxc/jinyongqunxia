import { performance } from 'node:perf_hooks';
import { describe, expect, it } from 'vitest';
import { runCombatWorkload, runLongCommandWorkload, runLongSessionWorkload } from './combat.fixture';

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
