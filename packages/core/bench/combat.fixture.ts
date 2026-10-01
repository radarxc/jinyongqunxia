import { simulateAbstractBattle } from '../src/ai';
import { combatFixture } from '../src/testing/combat-fixture';

export const COMBAT_BENCH_ROUNDS = 20;
export const COMBAT_BENCH_ACTIONS = COMBAT_BENCH_ROUNDS * 2;

export function runCombatWorkload(seed = 20261001): void {
  const result = simulateAbstractBattle(combatFixture({ seed, hp: 1_000_000 }), {}, COMBAT_BENCH_ACTIONS);
  if (result.state.round !== COMBAT_BENCH_ROUNDS
    || result.state.actionNo !== COMBAT_BENCH_ACTIONS || result.state.phase !== 'ended') {
    throw new Error('COMBAT_BENCH_INCOMPLETE');
  }
}
