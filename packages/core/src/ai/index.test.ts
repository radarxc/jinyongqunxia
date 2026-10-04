import { describe, expect, it } from 'vitest';
import type { MeridianFlowInput } from '../battle';
import { BASIC_MOVE, combatFixture } from '../testing/combat-fixture';
import { chooseAcuteGatherAction, chooseAutoCommand, defaultMaxActions, simulateAbstractBattle } from './index';
import { createRng, seedStream } from '../rng';

const aggressive = { style: 'aggressive', reserveMpBp: 0, allowUltimate: true, allowItems: false } as const;
const simulate = (state: ReturnType<typeof combatFixture>, max?: number) => simulateAbstractBattle(
  state, {}, createRng(seedStream(state.setup.seed, 'battle')), max);

function meridians(): MeridianFlowInput[] {
  return ['hero', 'enemy_0'].map((unitId) => ({ unitId, productionPerTick: 8,
    qiSpeedBp: 10_000, practiceBp: 9_000, unitQiHardCap: 16,
    nodes: [{ acupointRef: 'ap_test', opened: true, fluxCap: 16, lengthUnit: 1, flowBp: 10_000 }],
    routes: [{ routeId: 'mfr_test', purpose: 'attack' as const, steps: [
      { acupointRef: 'ap_test', lengthUnit: 1, segmentCt: 60, riskBp: 0 },
    ] }], activeRouteId: 'mfr_test' }));
}

describe('abstract automatic combat', () => {
  it('uses no geometry and chooses a stable move and target order', () => {
    const state = combatFixture({ enemies: 2 }); const actor = state.units[0]!;
    expect(chooseAutoCommand(state, actor, aggressive)).toEqual({ t: 'battle/act', actor: 'hero',
      action: { t: 'skill', move: 'mv_basic_strike', target: 'enemy_0' } });
  });

  it('is deterministic for identical setup, seed and policy', () => {
    const first = simulate(combatFixture({ seed: 19, hp: 300 }));
    const second = simulate(combatFixture({ seed: 19, hp: 300 }));
    expect(second.result).toBe(first.result); expect(second.commandLog).toEqual(first.commandLog);
    expect(second.eventLog).toEqual(first.eventLog); expect(second.stateHash).toBe(first.stateHash);
    expect(first.eventLog.filter((event) => event.t === 'battle/autoExchangeResolved'))
      .toHaveLength(first.state.actionNo);
  });

  it('continues from the caller RNG instead of replaying the opening rolls', () => {
    const first = combatFixture({ seed: 19, hp: 300 });
    const second = combatFixture({ seed: 19, hp: 300 });
    const firstRng = createRng(seedStream(19, 'battle'));
    const secondRng = createRng(seedStream(19, 'battle')); secondRng.nextU32();
    const a = simulateAbstractBattle(first, {}, firstRng);
    const b = simulateAbstractBattle(second, {}, secondRng);
    expect(b.stateHash).not.toBe(a.stateHash);
  });

  it('terminates no-op combat after five active-unit rounds', () => {
    const state = combatFixture({ playerMoves: [], enemyMoves: [] });
    const result = simulate(state);
    expect(result.result).toBe('draw'); expect(result.state.actionNo).toBe(10);
    expect(result.commandLog.every((command) => command.t === 'battle/wait')).toBe(true);
  });

  it('counts duration changes as effective progress before the five-round draw guard', () => {
    const state = combatFixture({ playerMoves: [], enemyMoves: [] });
    state.units[0]!.buffs.push({ iid: 1, def: 'bf_chaqi', holder: 'hero', source: null,
      grade: 1, stacks: 1, turnsLeft: 2, fresh: false });
    const result = simulate(state);
    expect(result.result).toBe('draw');
    expect(result.state.actionNo).toBeGreaterThan(10);
    expect(result.state.units[0]!.buffs).toEqual([]);
  });

  it('honours noAuto and documented action caps', () => {
    expect(defaultMaxActions(1)).toBe(60); expect(defaultMaxActions(100)).toBe(2000);
    expect(() => simulate(combatFixture({ noAuto: true })))
      .toThrow('BATTLE_AUTO_FORBIDDEN');
  });

  it('approaches an out-of-range target before attacking', () => {
    const state = combatFixture({ gridRadius: 4 }); const actor = state.units[0]!;
    state.units[1]!.pos = { q: 4, r: 0 };
    const command = chooseAutoCommand(state, actor, aggressive);
    expect(command).toMatchObject({ t: 'battle/act', actor: 'hero',
      walkTo: expect.any(Object), action: { t: 'skill', move: 'mv_basic_strike', target: 'enemy_0' } });
  });

  it('gathers only above the survival threshold and never adds movement', () => {
    const healthy = combatFixture({ meridianInputs: meridians() });
    expect(chooseAcuteGatherAction(healthy, healthy.units[0]!)).toEqual({
      t: 'battle/act', actor: 'hero', action: { t: 'acuteQiGather', routeRef: 'mfr_test' },
    });
    healthy.units[0]!.hp = 100;
    expect(chooseAcuteGatherAction(healthy, healthy.units[0]!)).toBeNull();

    const simulated = simulate(combatFixture({ meridianInputs: meridians(), hp: 300 }));
    expect(simulated.commandLog.some((command) => command.t === 'battle/act'
      && command.action.t === 'acuteQiGather')).toBe(false);
    expect(simulated.commandLog.every((command) => command.t !== 'battle/act'
      || command.walkTo === undefined)).toBe(true);
  });

  it('does not gather when the next two hostile attacks leave less than half survival', () => {
    const lethal = { ...BASIC_MOVE, id: 'mv_lethal_probe' as const,
      powerBp: 100_000, referencePowerBp: 10_000 };
    const state = combatFixture({ meridianInputs: meridians(), enemyMoves: [lethal] });

    expect(state.units[0]!.hp).toBe(state.units[0]!.hpMax);
    expect(chooseAcuteGatherAction(state, state.units[0]!)).toBeNull();
  });

  it('estimates survival without changing battle state and does not equate low HP with death', () => {
    const state = combatFixture({ meridianInputs: meridians(), enemyMoves: [] });
    state.units[0]!.hp = 1;
    const before = structuredClone(state);
    expect(chooseAutoCommand(state, state.units[0]!, aggressive)).toMatchObject({
      action: { t: 'acuteQiGather', routeRef: 'mfr_test' },
    });
    expect(state).toEqual(before);
  });

  it('does not choose gathering while acute gathering is disabled by a status', () => {
    for (const buff of [
      { def: 'bf_chaqi', stacks: 1 },
      { def: 'bf_dantianshousun', stacks: 4 },
    ] as const) {
      const state = combatFixture({ meridianInputs: meridians() });
      const actor = state.units[0]!;
      actor.buffs.push({ iid: 1, def: buff.def, holder: actor.id, source: null, grade: 1,
        stacks: buff.stacks, turnsLeft: 3, fresh: false });
      expect(chooseAcuteGatherAction(state, actor), buff.def).toBeNull();
    }
  });

  it('terminates 200 deterministic random seeds with safe resources and no post-down action', () => {
    for (let seed = 0; seed < 200; seed += 1) {
      const result = simulate(combatFixture({ seed, hp: 240 }));
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
