import { simulateAbstractBattle } from '../src/ai';
import { createCore } from '../src/api';
import { createBattleSession, setBattleAuto, stepBattleSession } from '../src/battle';
import { createEncounterBattleSetup } from '../src/battle/encounter';
import { dispatchCommand } from '../src/command/bus';
import { hexDisk } from '../src/hex';
import { createRng, seedStream } from '../src/rng';
import { battleSeed, combatFixture } from '../src/testing/combat-fixture';

export const COMBAT_BENCH_ROUNDS = 20;
export const COMBAT_BENCH_ACTIONS = COMBAT_BENCH_ROUNDS * 2;

export function runCombatWorkload(seed = 20261001): void {
  const result = simulateAbstractBattle(combatFixture({ seed, hp: 1_000_000 }), {},
    createRng(seedStream(seed, 'battle')), COMBAT_BENCH_ACTIONS);
  if (result.state.round !== COMBAT_BENCH_ROUNDS
    || result.state.actionNo !== COMBAT_BENCH_ACTIONS || result.state.phase !== 'ended') {
    throw new Error('COMBAT_BENCH_INCOMPLETE');
  }
}

function longSessionOpening(seed: number) {
  const ids = ['hero', ...Array.from({ length: 49 }, (_, index) => `enemy_${index}`)];
  const cells = hexDisk({ q: 0, r: 0 }, 4);
  const setup = createEncounterBattleSetup({ encounterId: 'enc_combat_fixture',
    setupId: 'setup-long-bench', seed, sourceSnapshotHash: '0'.repeat(64),
    sourceId: 'bench', triggerId: 'bench', worldTick: 0, sceneRef: 'sc_fixture',
    anchorRef: 'anchor_fixture', roundLimit: 10_000,
    participants: ids.map((unitRef, index) => ({ unitRef,
      side: index === 0 ? 'player' : 'enemy', control: index === 0 ? 'player' : 'ai',
      spawn: index === 0 ? 'spawn_player' : 'spawn_enemy',
      state: index < 2 ? 'active' : 'downed', required: index < 2 })),
    grid: cells.map((cell) => ({ ...cell, height: 0, moveCost: 1 })),
    initialUnits: ids.map((unitRef, index) => ({ unitRef, pos: cells[index]!,
      facing: index === 0 ? 0 : 3 })),
  });
  return { setup, seeds: ids.map((id) => battleSeed(id, [])) };
}

export function runLongSessionWorkload(actions = 2_000, seed = 20261001): void {
  const { setup, seeds } = longSessionOpening(seed);
  const session = createBattleSession(setup, seeds);
  setBattleAuto(session, true);
  for (let action = 0; action < actions; action += 1) stepBattleSession(session);
  if (session.battle.actionNo !== actions || actions === 2_000
    && (session.battle.phase !== 'ended' || session.battle.result !== 'draw')) {
    throw new Error('COMBAT_LONG_BENCH_INCOMPLETE');
  }
}

export function runLongCommandWorkload(actions = 2_000, seed = 20261001): void {
  const state = createCore(seed).snapshot();
  if (!dispatchCommand(state, { t: 'battle/enter', ...longSessionOpening(seed) }).ok
    || !dispatchCommand(state, { t: 'battle/setAuto', mode: 'auto' }).ok)
    throw new Error('COMBAT_LONG_BENCH_ENTER');
  for (let action = 0; action < actions; action += 1) {
    if (!dispatchCommand(state, { t: 'battle/act', automatic: true }).ok)
      throw new Error('COMBAT_LONG_BENCH_ACTION');
  }
  if (state.battle?.battle.actionNo !== actions || actions === 2_000
    && (state.battle.battle.phase !== 'ended' || state.battle.battle.result !== 'draw'))
    throw new Error('COMBAT_LONG_BENCH_INCOMPLETE');
}
