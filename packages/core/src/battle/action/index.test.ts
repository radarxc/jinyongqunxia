import { describe, expect, it } from 'vitest';
import { createRng } from '../../rng';
import { BASIC_MOVE, battleSeed, combatFixture } from '../../testing/combat-fixture';
import { createBattleState, createMeditationAmbushBattleSetup } from '../encounter';
import type { BattleMove } from '../types';
import { advanceBattleToReady, resolveBattleAction } from './index';

const special: BattleMove = { id: 'mv_test_toujin', powerBp: 10_000, referencePowerBp: 10_000,
  wInBp: 10_000, recovery: 1_000, mpCost: 10, hitZone: 'hand', projection: true,
  penetratingQi: true, acupointStrike: true, sourceGrade: 4, sourceInnerId: 'sk_test',
  releasedQi: 20, qiSpeedBp: 10_000, digestRatioBp: 10_000, sealBp: 10_000, sealLevel: 7,
  targetAcupoint: 'ap_test_joint', affectedRouteRefs: ['mfr_b', 'mfr_a'], autoTargetCap: 2,
  meridianAttackBp: 12_000, range: { min: 1, max: 2 }, delivery: 'ranged',
  shape: { tpl: 'aoe_single' }, hTol: 2, target: 'enemy' };

describe('shared battle action resolver', () => {
  it('rejects an out-of-turn action without changing state or RNG', () => {
    const state = combatFixture(); const rng = createRng([1, 2, 3, 4]);
    const before = JSON.stringify(state); const rngBefore = rng.snapshot();
    expect(resolveBattleAction(state, { t: 'battle/act', actor: 'enemy_0',
      action: { t: 'skill', move: 'mv_basic_strike', target: 'hero' } }, rng)).toMatchObject({
      accepted: false, error: 'NOT_YOUR_TURN' });
    expect(JSON.stringify(state)).toBe(before); expect(rng.snapshot()).toEqual(rngBefore);
  });

  it('settles multiple targets in unit order and records one command', () => {
    const state = combatFixture({ enemies: 2, playerMoves: [special] });
    const result = resolveBattleAction(state, { t: 'battle/act', actor: 'hero',
      action: { t: 'skill', move: special.id, target: 'enemy_0' } }, createRng([0, 0, 0, 0]));
    expect(result.accepted).toBe(true); expect(result.hpDamage).toBeGreaterThan(0);
    expect(state.events.filter((event) => event.t === 'battle/damageResolved')
      .map((event) => event.target)).toEqual(['enemy_0']);
    expect(state.acceptedCommands).toHaveLength(1); expect(state.units[0]?.mp).toBe(390);
    expect(state.units[0]?.ct).toBe(0);
  });

  it('creates penetrating Qi and an acupoint occupancy after damage settlement', () => {
    const state = combatFixture({ playerMoves: [special] });
    state.units[0]!.mp = 400; state.units[1]!.mp = 100;
    expect(resolveBattleAction(state, { t: 'battle/act', actor: 'hero',
      action: { t: 'skill', move: special.id, target: 'enemy_0' } }, createRng([0, 0, 0, 0])).accepted).toBe(true);
    expect(state.units[1]!.foreignQi).toEqual([expect.objectContaining({ remainingQi: 20,
      sourceInnerId: 'sk_test', injectionAcupoint: 'ap_test_joint' })]);
    expect(state.units[1]!.acupointOccupancies).toEqual([expect.objectContaining({
      digestRatioBp: 20_000, affectedRouteRefs: ['mfr_a', 'mfr_b'] })]);
    expect(state.units[1]!.buffs).toEqual([expect.objectContaining({
      def: 'bf_xueweishoufeng', stacks: 7, fresh: false })]);
  });

  it('ticks hostile Qi during CT advance and creates dantian damage', () => {
    const state = combatFixture();
    state.openingOrder.splice(0); state.units[0]!.ct = 900; state.units[1]!.ct = 0;
    state.units[0]!.foreignQi.push({ id: 1, sourceUnitId: 'enemy_0', sourceInnerId: 'sk_test',
      injectedQi: 40, remainingQi: 40, injectedSpeedBp: 10_000, injectionAcupoint: 'ap_test',
      hitZone: 'body', digestRatioBp: 100_000, reversePath: [], stepIndex: 0,
      remainingTravelTick: 0, arrivedAtTick: 0 });
    state.units[0]!.mp = 0; advanceBattleToReady(state);
    expect(state.tick).toBe(1); expect(state.units[0]!.foreignQi).toHaveLength(0);
    expect(state.units[0]!.hp).toBe(1_140);
    expect(state.units[0]!.buffs).toEqual([expect.objectContaining({
      def: 'bf_dantianshousun', stacks: 2, turnsLeft: 3, fresh: false })]);
  });

  it('applies the meditation ambush Buff before the first action and does not charge a stunned move', () => {
    const participants = [
      { unitRef: 'hero', side: 'player' as const, control: 'player' as const, spawn: 'p',
        state: 'active' as const, required: true },
      { unitRef: 'enemy', side: 'enemy' as const, control: 'ai' as const, spawn: 'e',
        state: 'active' as const, required: true },
    ];
    const setup = createMeditationAmbushBattleSetup({ encounterId: 'enc_ambush', setupId: 'ambush', seed: 1,
      sourceSnapshotHash: '0'.repeat(64), sourceId: 'town', triggerId: 'attack', worldTick: 1,
      participants, sceneRef: 'sc_town', anchorRef: 'inn', meditationUnitRefs: ['hero'] });
    const hero = battleSeed('hero'); hero.buffs.push({ iid: 1, def: 'bf_xuanyun', holder: 'hero',
      source: null, grade: 1, stacks: 1, turnsLeft: 1, fresh: false });
    const state = createBattleState(setup, [hero, battleSeed('enemy')]);
    expect(resolveBattleAction(state, { t: 'battle/act', actor: 'enemy',
      action: { t: 'skill', move: 'mv_basic_strike', target: 'hero' } }, createRng([0, 0, 0, 0])).accepted).toBe(true);
    expect(resolveBattleAction(state, { t: 'battle/act', actor: 'hero',
      action: { t: 'skill', move: 'mv_basic_strike', target: 'enemy' } }, createRng([0, 0, 0, 0])).accepted).toBe(true);
    expect(state.units[0]!.mp).toBe(400); expect(state.units[0]!.ownActions).toBe(1);
    expect(state.units[0]!.ct).toBe(0);
  });

  it('refreshes one dantian-damage instance at the highest level and longest duration', () => {
    const state = combatFixture(); const hero = state.units[0]!;
    state.openingOrder.splice(0); hero.ct = 900; state.units[1]!.ct = 0; hero.mp = 0;
    hero.buffs.push({ iid: 1, def: 'bf_dantianshousun', holder: hero.id, source: null,
      grade: 1, stacks: 2, turnsLeft: 5, fresh: false });
    hero.foreignQi.push({ id: 1, sourceUnitId: 'enemy_0', sourceInnerId: 'sk_test',
      injectedQi: 160, remainingQi: 160, injectedSpeedBp: 10_000, injectionAcupoint: 'ap_test',
      hitZone: 'body', digestRatioBp: 100_000, reversePath: [], stepIndex: 0,
      remainingTravelTick: 0, arrivedAtTick: 0 });
    advanceBattleToReady(state);
    expect(hero.buffs.filter((buff) => buff.def === 'bf_dantianshousun')).toEqual([
      expect.objectContaining({ iid: 1, stacks: 4, turnsLeft: 6 }),
    ]);
  });

  it('refreshes one keyed seal per acupoint and evicts its projection with occupancy', () => {
    const state = combatFixture({ playerMoves: [special] }); const target = state.units[1]!;
    target.acupointOccupancies.push(
      { acupointRef: 'ap_a', sourceUnitId: 'old', sourceInnerId: 'sk_old', occupyingQi: 1,
        digestRatioBp: 20_000, level: 1, remainingOwnActions: 1, affectedRouteRefs: [] },
      { acupointRef: 'ap_b', sourceUnitId: 'old', sourceInnerId: 'sk_old', occupyingQi: 1,
        digestRatioBp: 20_000, level: 2, remainingOwnActions: 2, affectedRouteRefs: [] },
      { acupointRef: 'ap_c', sourceUnitId: 'old', sourceInnerId: 'sk_old', occupyingQi: 1,
        digestRatioBp: 20_000, level: 3, remainingOwnActions: 2, affectedRouteRefs: [] },
    );
    for (let index = 0; index < 3; index += 1) target.buffs.push({ iid: index + 1,
      def: 'bf_xueweishoufeng', holder: target.id, source: 'old', grade: 1,
      key: `ap_${String.fromCharCode(97 + index)}`, stacks: index + 1, turnsLeft: index + 1, fresh: false });
    expect(resolveBattleAction(state, { t: 'battle/act', actor: 'hero',
      action: { t: 'skill', move: special.id, target: 'enemy_0' } }, createRng([0, 0, 0, 0])).accepted).toBe(true);
    expect(target.acupointOccupancies.map((entry) => entry.acupointRef))
      .toEqual(['ap_b', 'ap_c', 'ap_test_joint']);
    expect(target.buffs.filter((buff) => buff.def === 'bf_xueweishoufeng')
      .map((buff) => buff.key ?? ''))
      .toEqual(['ap_b', 'ap_c', 'ap_test_joint']);
  });

  it('releases occupancy at expiry while preserving the seal lifecycle', () => {
    const state = combatFixture(); const hero = state.units[0]!;
    hero.acupointOccupancies.push({ acupointRef: 'ap_a', sourceUnitId: 'enemy_0',
      sourceInnerId: 'sk_test', occupyingQi: 1, digestRatioBp: 20_000, level: 2,
      remainingOwnActions: 1, affectedRouteRefs: [] });
    hero.buffs.push({ iid: 1, def: 'bf_xueweishoufeng', holder: hero.id, source: 'enemy_0',
      grade: 4, key: 'ap_a', stacks: 2, turnsLeft: 2, fresh: false });
    expect(resolveBattleAction(state, { t: 'battle/wait', actor: 'hero' },
      createRng([0, 0, 0, 0])).accepted).toBe(true);
    expect(hero.acupointOccupancies).toEqual([]);
    expect(hero.buffs).toEqual([expect.objectContaining({ key: 'ap_a', turnsLeft: 1 })]);
  });

  it('moves the round anchor to the first surviving friendly after the protagonist leaves play', () => {
    const participants = [
      { unitRef: 'hero', side: 'player' as const, control: 'player' as const, spawn: 'p0',
        state: 'downed' as const, required: true },
      { unitRef: 'companion', side: 'player' as const, control: 'player' as const, spawn: 'p1',
        state: 'active' as const, required: false },
      { unitRef: 'enemy', side: 'enemy' as const, control: 'ai' as const, spawn: 'e',
        state: 'active' as const, required: true },
    ];
    const setup = createMeditationAmbushBattleSetup({ encounterId: 'enc_round_anchor',
      setupId: 'round-anchor', seed: 1, sourceSnapshotHash: '0'.repeat(64), sourceId: 'story',
      triggerId: 'continue-after-protagonist', worldTick: 1, participants, sceneRef: 'sc_test',
      anchorRef: 'arena', meditationUnitRefs: [], loseCond: [{ kind: 'actionLimit', actions: 99 }] });
    const state = createBattleState(setup, [battleSeed('hero'), battleSeed('companion'),
      battleSeed('enemy')]);
    state.openingOrder.splice(0, state.openingOrder.length, 'companion', 'enemy');
    expect(resolveBattleAction(state, { t: 'battle/wait', actor: 'companion' },
      createRng([0, 0, 0, 0])).accepted).toBe(true);
    expect(state.round).toBe(1);
  });

  it('commits movement with skill and updates facing from the target', () => {
    const state = combatFixture({ gridRadius: 3 }); const hero = state.units[0]!;
    state.units[1]!.pos = { q: 2, r: 0 };
    const result = resolveBattleAction(state, { t: 'battle/act', actor: hero.id,
      walkTo: { q: 1, r: 0 }, action: { t: 'skill', move: BASIC_MOVE.id, target: 'enemy_0' } },
    createRng([1, 2, 3, 4]));
    expect(result.accepted).toBe(true); expect(hero.pos).toEqual({ q: 1, r: 0 });
    expect(hero.facing).toBe(0); expect(hero.waitStreak).toBe(0);
  });

  it('uses an explicit final facing or defaults to the nearest visible enemy', () => {
    const explicit = combatFixture(); explicit.units[0]!.facing = 3;
    expect(resolveBattleAction(explicit, { t: 'battle/act', actor: 'hero', action: { t: 'wait' }, facing: 2 },
      createRng([1, 2, 3, 4])).accepted).toBe(true);
    expect(explicit.units[0]!.facing).toBe(2);
    const defaulted = combatFixture(); defaulted.units[0]!.facing = 3;
    expect(resolveBattleAction(defaulted, { t: 'battle/wait', actor: 'hero' },
      createRng([1, 2, 3, 4])).accepted).toBe(true);
    expect(defaulted.units[0]!.facing).toBe(0);
  });

  it.each([
    ['PATH_BLOCKED', { walkTo: { q: 9, r: 9 }, action: { t: 'wait' as const } }],
    ['OUT_OF_RANGE', { action: { t: 'skill' as const, move: BASIC_MOVE.id, target: 'enemy_0' } }],
    ['INVALID_TARGET', { action: { t: 'skill' as const, move: BASIC_MOVE.id, target: 'missing' } }],
  ])('rejects %s without changing state or RNG', (error, plan) => {
    const state = combatFixture({ gridRadius: 4 }); state.units[1]!.pos = { q: 3, r: 0 };
    if (error === 'INVALID_TARGET') state.units[1]!.pos = { q: 1, r: 0 };
    const rng = createRng([9, 8, 7, 6]); const before = JSON.stringify(state); const rngBefore = rng.snapshot();
    expect(resolveBattleAction(state, { t: 'battle/act', actor: 'hero', ...plan }, rng))
      .toMatchObject({ accepted: false, error });
    expect(JSON.stringify(state)).toBe(before); expect(rng.snapshot()).toEqual(rngBefore);
  });

  it('uses 700, 800 and then 1000 recovery for wait plans', () => {
    const first = combatFixture();
    expect(resolveBattleAction(first, { t: 'battle/act', actor: 'hero', action: { t: 'wait' } },
      createRng([1, 2, 3, 4])).accepted).toBe(true);
    expect(first.units[0]!.ct).toBe(300);
    const moved = combatFixture();
    expect(resolveBattleAction(moved, { t: 'battle/act', actor: 'hero', walkTo: { q: 0, r: 1 },
      action: { t: 'wait' } }, createRng([1, 2, 3, 4])).accepted).toBe(true);
    expect(moved.units[0]!.ct).toBe(200);
    const repeated = combatFixture(); repeated.units[0]!.waitStreak = 1;
    expect(resolveBattleAction(repeated, { t: 'battle/wait', actor: 'hero' },
      createRng([1, 2, 3, 4])).accepted).toBe(true);
    expect(repeated.units[0]!.ct).toBe(0);
  });

  it('rejects NO_LOS transactionally when a wall appears before submit', () => {
    const ranged = { ...BASIC_MOVE, range: { min: 1, max: 4 }, delivery: 'ranged' as const };
    const state = combatFixture({ gridRadius: 4, playerMoves: [ranged] });
    state.units[1]!.pos = { q: 4, r: 0 };
    Object.assign(state.grid.cells.find(cell => cell.q === 2 && cell.r === 0)!, { height: 3 });
    const rng = createRng([9, 8, 7, 6]); const before = JSON.stringify(state); const rngBefore = rng.snapshot();
    expect(resolveBattleAction(state, { t: 'battle/act', actor: 'hero',
      action: { t: 'skill', move: ranged.id, target: 'enemy_0' } }, rng))
      .toMatchObject({ accepted: false, error: 'NO_LOS' });
    expect(JSON.stringify(state)).toBe(before); expect(rng.snapshot()).toEqual(rngBefore);
  });

  it('recomputes occupancy at commit after a path preview', () => {
    const state = combatFixture({ gridRadius: 3 }); const rng = createRng([9, 8, 7, 6]);
    const destination = { q: 0, r: 1 };
    expect(state.units[0]!.pos).toEqual({ q: 0, r: 0 });
    state.units[1]!.pos = destination;
    const before = JSON.stringify(state); const rngBefore = rng.snapshot();
    expect(resolveBattleAction(state, { t: 'battle/act', actor: 'hero', walkTo: destination,
      action: { t: 'wait' } }, rng)).toMatchObject({ accepted: false, error: 'PATH_BLOCKED' });
    expect(JSON.stringify(state)).toBe(before); expect(rng.snapshot()).toEqual(rngBefore);
  });

  it('does not move or turn a unit whose action is skipped', () => {
    const state = combatFixture({ gridRadius: 3 }); const hero = state.units[0]!; hero.facing = 4;
    hero.buffs.push({ iid: 1, def: 'bf_xuanyun', holder: 'hero', source: null, grade: 1,
      stacks: 1, turnsLeft: 1, fresh: false });
    expect(resolveBattleAction(state, { t: 'battle/act', actor: 'hero', walkTo: { q: 0, r: 1 },
      action: { t: 'wait' }, facing: 2 }, createRng([1, 2, 3, 4])).accepted).toBe(true);
    expect(hero.pos).toEqual({ q: 0, r: 0 }); expect(hero.facing).toBe(4);
  });

  it('stores an accepted command without retaining caller references', () => {
    const state = combatFixture();
    const command = { t: 'battle/act' as const, actor: 'hero', action: { t: 'wait' as const },
      walkTo: { q: 0, r: 1 } };
    expect(resolveBattleAction(state, command, createRng([1, 2, 3, 4])).accepted).toBe(true);
    command.walkTo.q = 9;
    expect(state.acceptedCommands[0]).toMatchObject({ walkTo: { q: 0, r: 1 } });
  });

  it('resolves the same command sequence to identical final bytes 100 times', () => {
    const commands = [
      { t: 'battle/act' as const, actor: 'hero', action: { t: 'skill' as const,
        move: BASIC_MOVE.id, target: 'enemy_0' } },
      { t: 'battle/act' as const, actor: 'enemy_0', action: { t: 'skill' as const,
        move: BASIC_MOVE.id, target: 'hero' } },
    ];
    const run = () => {
      const state = combatFixture({ seed: 20261002 }); const rng = createRng([1, 2, 3, 4]);
      for (const command of commands) {
        expect(resolveBattleAction(state, command, rng).accepted).toBe(true);
      }
      return JSON.stringify({ state, rng: rng.snapshot() });
    };
    const expected = run();
    for (let iteration = 1; iteration < 100; iteration += 1) expect(run()).toBe(expected);
  });
});
