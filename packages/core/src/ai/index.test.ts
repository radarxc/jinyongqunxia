import { describe, expect, it } from 'vitest';
import { combatFixture } from '../testing/combat-fixture';
import { chooseAutoCommand, defaultMaxActions, simulateAbstractBattle } from './index';

const aggressive = { style: 'aggressive', reserveMpBp: 0, allowUltimate: true, allowItems: false } as const;

describe('abstract automatic combat', () => {
  it('uses no geometry and chooses a stable move and target order', () => {
    const state = combatFixture({ enemies: 2 }); const actor = state.units[0]!;
    expect(chooseAutoCommand(state, actor, aggressive)).toEqual({ t: 'battle/act', actor: 'hero',
      moveId: 'mv_basic_strike', targetIds: ['enemy_0'] });
    expect(JSON.stringify(state)).not.toMatch(/position|facing|lineOfSight|zoc/i);
  });

  it('is deterministic for identical setup, seed and policy', () => {
    const first = simulateAbstractBattle(combatFixture({ seed: 19, hp: 300 }), {});
    const second = simulateAbstractBattle(combatFixture({ seed: 19, hp: 300 }), {});
    expect(second.result).toBe(first.result); expect(second.commandLog).toEqual(first.commandLog);
    expect(second.eventLog).toEqual(first.eventLog); expect(second.stateHash).toBe(first.stateHash);
    expect(first.eventLog.filter((event) => event.t === 'battle/autoExchangeResolved'))
      .toHaveLength(first.state.actionNo);
  });

  it('terminates no-op combat after five active-unit rounds', () => {
    const state = combatFixture({ playerMoves: [], enemyMoves: [] });
    const result = simulateAbstractBattle(state, {});
    expect(result.result).toBe('draw'); expect(result.state.actionNo).toBe(10);
    expect(result.commandLog.every((command) => command.t === 'battle/wait')).toBe(true);
  });

  it('counts duration changes as effective progress before the five-round draw guard', () => {
    const state = combatFixture({ playerMoves: [], enemyMoves: [] });
    state.units[0]!.buffs.push({ iid: 1, def: 'bf_chaqi', holder: 'hero', source: null,
      grade: 1, stacks: 1, turnsLeft: 2, fresh: false });
    const result = simulateAbstractBattle(state, {});
    expect(result.result).toBe('draw');
    expect(result.state.actionNo).toBeGreaterThan(10);
    expect(result.state.units[0]!.buffs).toEqual([]);
  });

  it('honours noAuto and documented action caps', () => {
    expect(defaultMaxActions(1)).toBe(60); expect(defaultMaxActions(100)).toBe(2000);
    expect(() => simulateAbstractBattle(combatFixture({ noAuto: true }), {}))
      .toThrow('BATTLE_AUTO_FORBIDDEN');
  });

  it('terminates 200 deterministic random seeds with safe resources and no post-down action', () => {
    for (let seed = 0; seed < 200; seed += 1) {
      const result = simulateAbstractBattle(combatFixture({ seed, hp: 240 }), {});
      expect(result.state.phase, `seed=${seed}`).toBe('ended');
      expect(result.state.actionNo, `seed=${seed}`).toBeLessThanOrEqual(defaultMaxActions(2));
      for (const unit of result.state.units) {
        expect(Number.isFinite(unit.hp) && Number.isInteger(unit.hp), `seed=${seed}`).toBe(true);
        expect(unit.hp, `seed=${seed}`).toBeGreaterThanOrEqual(0);
      }
      const downed = new Set<string>();
      for (const event of result.eventLog) {
        if (event.t === 'battle/unitDowned' && event.target !== undefined) downed.add(event.target);
        if (event.t === 'battle/autoExchangeResolved' && event.actor !== undefined) {
          expect(downed.has(event.actor), `seed=${seed},actor=${event.actor}`).toBe(false);
        }
      }
    }
  });
});
