import { describe, expect, it } from 'vitest';
import { createRng } from '../../rng';
import { battleSeed, combatFixture } from '../../testing/combat-fixture';
import { createBattleState, createMeditationAmbushBattleSetup } from '../encounter';
import type { BattleMove } from '../types';
import { advanceBattleToReady, resolveBattleAction } from './index';

const special: BattleMove = { id: 'mv_test_toujin', powerBp: 10_000, referencePowerBp: 10_000,
  wInBp: 10_000, recovery: 1_000, mpCost: 10, hitZone: 'hand', projection: true,
  penetratingQi: true, acupointStrike: true, sourceGrade: 4, sourceInnerId: 'sk_test',
  releasedQi: 20, qiSpeedBp: 10_000, digestRatioBp: 10_000, sealBp: 10_000, sealLevel: 7,
  targetAcupoint: 'ap_test_joint', affectedRouteRefs: ['mfr_b', 'mfr_a'], autoTargetCap: 2,
  meridianAttackBp: 12_000 };

describe('shared battle action resolver', () => {
  it('rejects an out-of-turn action without changing state or RNG', () => {
    const state = combatFixture(); const rng = createRng([1, 2, 3, 4]);
    const before = JSON.stringify(state); const rngBefore = rng.snapshot();
    expect(resolveBattleAction(state, { t: 'battle/act', actor: 'enemy_0',
      moveId: 'mv_basic_strike', targetIds: ['hero'] }, rng)).toMatchObject({
      accepted: false, error: 'NOT_YOUR_TURN' });
    expect(JSON.stringify(state)).toBe(before); expect(rng.snapshot()).toEqual(rngBefore);
  });

  it('settles multiple targets in unit order and records one command', () => {
    const state = combatFixture({ enemies: 2, playerMoves: [special] });
    const result = resolveBattleAction(state, { t: 'battle/act', actor: 'hero',
      moveId: special.id, targetIds: ['enemy_1', 'enemy_0'] }, createRng([0, 0, 0, 0]));
    expect(result.accepted).toBe(true); expect(result.hpDamage).toBeGreaterThan(0);
    expect(state.events.filter((event) => event.t === 'battle/damageResolved')
      .map((event) => event.target)).toEqual(['enemy_0', 'enemy_1']);
    expect(state.acceptedCommands).toHaveLength(1); expect(state.units[0]?.mp).toBe(390);
    expect(state.units[0]?.ct).toBe(0);
  });

  it('creates penetrating Qi and an acupoint occupancy after damage settlement', () => {
    const state = combatFixture({ playerMoves: [special] });
    state.units[0]!.mp = 400; state.units[1]!.mp = 100;
    expect(resolveBattleAction(state, { t: 'battle/act', actor: 'hero', moveId: special.id,
      targetIds: ['enemy_0'] }, createRng([0, 0, 0, 0])).accepted).toBe(true);
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
    expect(resolveBattleAction(state, { t: 'battle/act', actor: 'enemy', moveId: 'mv_basic_strike',
      targetIds: ['hero'] }, createRng([0, 0, 0, 0])).accepted).toBe(true);
    expect(resolveBattleAction(state, { t: 'battle/act', actor: 'hero', moveId: 'mv_basic_strike',
      targetIds: ['enemy'] }, createRng([0, 0, 0, 0])).accepted).toBe(true);
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
    expect(resolveBattleAction(state, { t: 'battle/act', actor: 'hero', moveId: special.id,
      targetIds: ['enemy_0'] }, createRng([0, 0, 0, 0])).accepted).toBe(true);
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
});
