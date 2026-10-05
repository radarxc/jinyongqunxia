import { describe, expect, it } from 'vitest';
import type { ItemDef } from '@tianshu/data/schemas';
import { compileBattleMove, MartialArtDefSchema, MoveDefSchema } from '@tianshu/data/schemas';
import { parseContentFile } from '@tianshu/data/tooling';
// eslint-disable-next-line no-restricted-imports -- Test-only production content fixture loading.
import { readFileSync } from 'node:fs';
import { floorDivInt } from '@tianshu/shared';
import { calculateJudgeChances } from '../damage';
import { onHitBuffModifiers } from '../../buff';
import { createRng } from '../../rng';
import { BASIC_MOVE, battleSeed, combatFixture } from '../../testing/combat-fixture';
import { createBattleState, createMeditationAmbushBattleSetup } from '../encounter';
import { createMeridianFlowRuntime, type MeridianFlowInput } from '../meridian-flow';
import type { BattleCommand, BattleMove, BattleState } from '../types';
import { advanceBattleTick, advanceBattleToReady, previewBattleRoute, queryBattleAction,
  queryBattleQi, resolveBattleAction } from './index';

const contentFile = (path: string) => parseContentFile({ path, text: readFileSync(
  new URL(`../../../../../${path}`, import.meta.url), 'utf8') }).value;

const special: BattleMove = { id: 'mv_test_toujin', powerBp: 10_000, referencePowerBp: 10_000,
  wInBp: 10_000, recovery: 1_000, mpCost: 10, hitZone: 'hand', projection: true,
  penetratingQi: true, acupointStrike: true, sourceGrade: 4, sourceInnerId: 'sk_test',
  releasedQi: 20, qiSpeedBp: 10_000, digestRatioBp: 10_000, sealBp: 10_000, sealLevel: 7,
  targetAcupoint: 'ap_test_joint', affectedRouteRefs: ['mfr_b', 'mfr_a'], autoTargetCap: 2,
  meridianAttackBp: 12_000, range: { min: 1, max: 2 }, delivery: 'ranged',
  shape: { tpl: 'aoe_single' }, hTol: 2, target: 'enemy' };

function battleItem(id = 'it_test_heal', action: NonNullable<ItemDef['use']>['action'] = 'consume'): ItemDef {
  return { schemaVersion: 'item.v1', id, name: id, kind: 'pill', sub: 'medicine', grade: 1, stack: 9,
    chapters: 'any', origin: 'expanded', price: 1, flags: [], use: { context: 'battle', action,
      target: 'self', effects: [{ op: 'healPct', params: { valueBp: 1_000 } }] },
    assets: { icon: `item/${id}` }, text: { desc: id }, extension: { type: 'generic', value: {} } };
}

function meridianFixture(unitIds: readonly string[], options: { readonly purpose?: 'attack' | 'defense';
  readonly steps?: number; readonly hardCap?: number; readonly riskBp?: number } = {}): MeridianFlowInput[] {
  const stepCount = options.steps ?? 1;
  return unitIds.map((unitId) => {
    const nodes = Array.from({ length: stepCount }, (_, index) => ({
      acupointRef: `ap_test_${index}`, opened: true, fluxCap: 64, lengthUnit: 12, flowBp: 10_000,
    }));
    return { unitId, productionPerTick: 64, qiSpeedBp: 10_000, practiceBp: 3_500,
      unitQiHardCap: options.hardCap ?? 64, nodes, routes: [{ routeId: 'mfr_test',
        purpose: options.purpose ?? 'attack', steps: nodes.map((node) => ({
          acupointRef: node.acupointRef, lengthUnit: node.lengthUnit, segmentCt: 60,
          riskBp: options.riskBp ?? 0 })) }], activeRouteId: 'mfr_test' };
  });
}

function assertRejectedUnchanged(state: BattleState, command: BattleCommand, error: string): void {
  const rng = createRng([9, 8, 7, 6]);
  const before = JSON.stringify(state); const rngBefore = rng.snapshot();
  expect(resolveBattleAction(state, command, rng)).toMatchObject({ accepted: false, error });
  expect(JSON.stringify(state)).toBe(before); expect(rng.snapshot()).toEqual(rngBefore);
}

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

  it('uses dynamic facing, height, terrain and cover in production settlement', () => {
    const highBack = combatFixture({ gridRadius: 3 });
    const lowFront = combatFixture({ gridRadius: 3 });
    for (const state of [highBack, lowFront]) {
      state.units[0]!.pos = { q: -1, r: 0 }; state.units[1]!.pos = { q: 0, r: 0 };
      state.units[1]!.facing = state === highBack ? 0 : 3;
      Object.assign(state.grid.cells.find(cell => cell.q === -1 && cell.r === 0)!, {
        height: state === highBack ? 2 : 0, terrainDealtBp: state === highBack ? 500 : 0,
      });
      Object.assign(state.grid.cells.find(cell => cell.q === 0 && cell.r === 0)!, {
        height: state === highBack ? 0 : 2, terrainTakenBp: state === highBack ? 500 : 0,
      });
    }
    const attack = { t: 'battle/act' as const, actor: 'hero',
      action: { t: 'skill' as const, move: BASIC_MOVE.id, target: 'enemy_0' } };
    const boosted = resolveBattleAction(highBack, attack, createRng([0, 0, 9_999, 0]));
    const penalized = resolveBattleAction(lowFront, attack, createRng([0, 0, 9_999, 0]));
    expect(boosted.accepted).toBe(true); expect(penalized.accepted).toBe(true);
    expect(boosted.hpDamage).toBeGreaterThan(penalized.hpDamage);
  });

  it('applies LOS and cover hit penalties before consuming the same hit roll', () => {
    const ranged = { ...BASIC_MOVE, id: 'mv_test_geometry_hit' as const,
      hitMod: -15, delivery: 'ranged' as const, range: { min: 1, max: 4 } };
    const clear = combatFixture({ gridRadius: 4, playerMoves: [ranged] });
    const obscured = combatFixture({ gridRadius: 4, playerMoves: [ranged] });
    for (const state of [clear, obscured]) {
      state.units[1]!.pos = { q: 4, r: 0 }; Object.assign(state.units[1]!.stats, { eva: 80 });
    }
    Object.assign(obscured.grid.cells.find(cell => cell.q === 2 && cell.r === 0)!,
      { los: 'partial', canopy: 1 });
    Object.assign(obscured.grid.cells.find(cell => cell.q === 4 && cell.r === 0)!,
      { cover: { vs: ['ranged'], hit: -15, damageBp: 0 } });
    const command = { t: 'battle/act' as const, actor: 'hero',
      action: { t: 'skill' as const, move: ranged.id, target: 'enemy_0' } };
    const hitRoll = calculateJudgeChances({ hitEff: 85, eva: 80, parry: -100, pierce: 100,
      crit: 100, tough: 40 }).hitBp - 1;
    const rngState = [hitRoll, 0, 0, 0] as const;
    expect(resolveBattleAction(clear, command, createRng(rngState)))
      .toMatchObject({ accepted: true, hpDamage: expect.any(Number) });
    expect(clear.units[1]!.hp).toBeLessThan(clear.units[1]!.hpMax);
    expect(resolveBattleAction(obscured, command, createRng(rngState)))
      .toMatchObject({ accepted: true, hpDamage: 0 });
  });

  it('evaluates area target geometry independently in distance then unit order', () => {
    const area = { ...BASIC_MOVE, id: 'mv_test_geometry_area' as const, target: 'tile' as const,
      range: { min: 1, max: 3 }, shape: { tpl: 'aoe_disk' as const, r: 1 }, autoTargetCap: 2 };
    const state = combatFixture({ gridRadius: 3, enemies: 2, playerMoves: [area] });
    state.units[1]!.pos = { q: 1, r: 0 }; state.units[1]!.facing = 0;
    state.units[2]!.pos = { q: 2, r: 0 }; state.units[2]!.facing = 3;
    Object.assign(state.grid.cells.find(cell => cell.q === 2 && cell.r === 0)!,
      { height: 2, terrainTakenBp: 1_000 });
    const result = resolveBattleAction(state, { t: 'battle/act', actor: 'hero',
      action: { t: 'skill', move: area.id, target: { q: 1, r: 0 } } },
    createRng([0, 0, 9_999, 0]));
    expect(result.accepted).toBe(true);
    expect(state.events.filter(event => event.t === 'battle/damageResolved').map(event => event.target))
      .toEqual(['enemy_0', 'enemy_1']);
    expect(state.units[1]!.hp).not.toBe(state.units[2]!.hp);
  });

  it('keeps abstract resolution independent of board geometry', () => {
    const flat = combatFixture({ gridRadius: 3 });
    const altered = combatFixture({ gridRadius: 3 });
    Object.assign(altered.grid.cells.find(cell => cell.q === 0 && cell.r === 0)!, {
      height: 3, terrainDealtBp: 1_000,
    });
    Object.assign(altered.grid.cells.find(cell => cell.q === 1 && cell.r === 0)!, {
      height: 0, terrainTakenBp: 1_000,
    });
    const command = { t: 'battle/act' as const, actor: 'hero',
      action: { t: 'skill' as const, move: BASIC_MOVE.id, target: 'enemy_0' } };
    const flatRng = createRng([0, 0, 9_999, 0]);
    const alteredRng = createRng([0, 0, 9_999, 0]);
    const flatResult = resolveBattleAction(flat, command, flatRng, { ignoreGeometry: true });
    const alteredResult = resolveBattleAction(altered, command, alteredRng, { ignoreGeometry: true });
    expect(alteredResult).toEqual(flatResult);
    expect(altered.units.map(unit => unit.hp)).toEqual(flat.units.map(unit => unit.hp));
    expect(alteredRng.snapshot()).toEqual(flatRng.snapshot());
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

  it('uses the committed route release for penetrating Qi instead of the static move hint', () => {
    const routed = { ...special, id: 'mv_test_routed_effect' as const, releasedQi: 1,
      meridianRouteRef: 'mfr_test' };
    const meridians = meridianFixture(['hero', 'enemy_0']);
    const state = combatFixture({ playerMoves: [routed], meridianInputs: meridians });
    const runtime = createMeridianFlowRuntime(meridians[0]!); runtime.tick(1);
    state.meridianByUnit[0]!.flow = runtime.snapshot();
    state.units[0]!.mp = 400; state.units[1]!.mp = 100;

    expect(resolveBattleAction(state, { t: 'battle/act', actor: 'hero',
      action: { t: 'skill', move: routed.id, target: 'enemy_0' } },
    createRng([0, 0, 0, 9_999])).accepted).toBe(true);
    const released = state.events.find((event) => event.t === 'qi.moveResolved')?.amount;
    expect(released).toBeGreaterThan(1);
    expect(state.units[1]!.foreignQi[0]?.injectedQi).toBe(released);
  });

  it('keeps two units of one meridian template independent through commits and previews', () => {
    const routed = { ...BASIC_MOVE, meridianRouteRef: 'mfr_test' };
    const inputs = meridianFixture(['hero', 'enemy_0']);
    const state = combatFixture({ meridianInputs: inputs, playerMoves: [routed] });
    for (let tick = 0; tick < 5; tick += 1) advanceBattleTick(state);
    const opponentBefore = structuredClone(state.meridianByUnit[1]);
    const preview = previewBattleRoute(state, 'hero', 'mfr_test');
    const heldPreview = structuredClone(preview);
    expect(resolveBattleAction(state, { t: 'battle/act', actor: 'hero',
      action: { t: 'skill', move: routed.id, target: 'enemy_0' } },
    createRng([0, 0, 0, 9_999])).accepted).toBe(true);
    expect(state.meridianByUnit[1]).toEqual(opponentBefore);
    expect(queryBattleQi(state, 'hero', 'mfr_test').routeInFlightQi)
      .toBeLessThan(heldPreview.releasedQi);
    expect(queryBattleQi(state, 'enemy_0', 'mfr_test').routeInFlightQi).toBe(64);
    expect(previewBattleRoute(state, 'hero', 'mfr_test').releasedQi).toBe(0);
    expect(heldPreview.releasedQi).toBe(64);
  });

  it('advances meridians through a CT jump exactly like individual ticks', () => {
    const batch = combatFixture({ meridianInputs: meridianFixture(['hero', 'enemy_0']) });
    batch.openingOrder.splice(0); batch.phase = 'running';
    batch.units[0]!.ct = 0; batch.units[1]!.ct = -200;
    batch.units[0]!.buffs.push({ iid: 1, def: 'bf_chaqi', holder: 'hero', source: null,
      grade: 1, stacks: 1, turnsLeft: 2, fresh: false });
    const stepped = structuredClone(batch);
    expect(advanceBattleToReady(batch)).toEqual({ kind: 'unit', unitId: 'hero' });
    for (let tick = 0; tick < 10; tick += 1) {
      advanceBattleTick(stepped); stepped.tick += 1;
      for (const unit of stepped.units) unit.ct += unit.spd;
    }
    expect(batch).toEqual(stepped);
  });

  it('blocks an occupied route and clears the seal projection when its Buff expires', () => {
    const move = { ...BASIC_MOVE, meridianRouteRef: 'mfr_test' };
    const state = combatFixture({ playerMoves: [move],
      meridianInputs: meridianFixture(['hero', 'enemy_0']) });
    const hero = state.units[0]!;
    hero.acupointOccupancies.push({ acupointRef: 'ap_test_0', sourceUnitId: 'enemy_0',
      sourceInnerId: 'sk_test', occupyingQi: 1, digestRatioBp: 20_000, level: 1,
      remainingOwnActions: 2, affectedRouteRefs: ['mfr_test'] });
    const command = { t: 'battle/act' as const, actor: hero.id,
      action: { t: 'skill' as const, move: move.id, target: 'enemy_0' } };
    assertRejectedUnchanged(state, command, 'MERIDIAN_ROUTE_BLOCKED');
    advanceBattleTick(state);
    expect(hero.acupointOccupancies).toEqual([]);
    expect(queryBattleAction(state, command).enabled).toBe(true);
    hero.buffs.push({ iid: 1, def: 'bf_xueweishoufeng', holder: hero.id, source: 'enemy_0',
      grade: 1, key: 'ap_test_0', stacks: 9, turnsLeft: 1, fresh: false });
    assertRejectedUnchanged(state, command, 'MERIDIAN_ROUTE_BLOCKED');
    expect(resolveBattleAction(state, { t: 'battle/wait', actor: hero.id },
      createRng([1, 2, 3, 4])).accepted).toBe(true);
    expect(hero.buffs).toEqual([]);
    expect(state.meridianByUnit[0]!.flow.nodes[0]!.sealLevel).toBe(0);
    state.openingOrder.splice(0, state.openingOrder.length, hero.id); hero.ct = 1_000;
    expect(queryBattleAction(state, command).enabled).toBe(true);
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

  it('uses the unit meridian instance production as the hostile-Qi digestion budget', () => {
    const state = combatFixture({ meridianInputs: meridianFixture(['hero', 'enemy_0']) });
    const hero = state.units[0]!;
    expect(hero.qiProductionPerTick).toBe(1);
    hero.foreignQi.push({ id: 1, sourceUnitId: 'enemy_0', sourceInnerId: 'sk_test',
      injectedQi: 100, remainingQi: 100, injectedSpeedBp: 10_000,
      injectionAcupoint: 'ap_test', hitZone: 'body', digestRatioBp: 10_000,
      reversePath: [{ acupointRef: 'ap_test', lengthUnit: 5 }], stepIndex: 0,
      remainingTravelTick: 5, arrivedAtTick: 0 });

    advanceBattleTick(state);

    expect(hero.foreignQi[0]?.remainingQi).toBe(36);
    expect(hero.mp).toBe(336);
    expect(state.events).toContainEqual(expect.objectContaining({
      t: 'battle/foreignQiDigested', target: 'hero', amount: 64,
    }));
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

  it('records a hard-control skip without pretending the submitted action gathered Qi', () => {
    const state = combatFixture({ meridianInputs: meridianFixture(['hero', 'enemy_0']) });
    const hero = state.units[0]!; hero.buffs.push({ iid: 1, def: 'bf_xuanyun', holder: hero.id,
      source: null, grade: 1, stacks: 1, turnsLeft: 1, fresh: false });
    const beforeFlow = structuredClone(state.meridianByUnit[0]!.flow);
    const result = resolveBattleAction(state, { t: 'battle/act', actor: hero.id,
      action: { t: 'acuteQiGather', routeRef: 'mfr_test' } }, createRng([1, 2, 3, 4]));
    expect(result.accepted).toBe(true);
    expect(state.events.map((event) => event.t)).toContain('buff/actionSkipped');
    expect(state.events.map((event) => event.t)).not.toContain('battle/acuteQiGathered');
    expect(state.meridianByUnit[0]!.flow.activeRouteId).toBe(beforeFlow.activeRouteId);
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

  it('applies guard stance for one own action with grade-scaled defense and 700 recovery', () => {
    const guarded = combatFixture(); const plain = combatFixture();
    Object.assign(guarded.units[0]!, { innerGrade: 4 });
    expect(resolveBattleAction(guarded, { t: 'battle/act', actor: 'hero',
      action: { t: 'guard' } }, createRng([1, 2, 3, 4])).accepted).toBe(true);
    expect(guarded.units[0]!.ct).toBe(300);
    expect(guarded.units[0]!.buffs).toEqual([
      expect.objectContaining({ def: 'bf_jiangu', grade: 4, turnsLeft: 1, fresh: false }),
      expect.objectContaining({ def: 'bf_xieli', grade: 4, turnsLeft: 1, fresh: false }),
    ]);
    guarded.units[0]!.facing = 3;
    const incoming = { t: 'battle/act' as const, actor: 'enemy_0',
      action: { t: 'skill' as const, move: BASIC_MOVE.id, target: 'hero' } };
    expect(resolveBattleAction(guarded, incoming, createRng([0, 0, 9999, 0])).accepted).toBe(true);
    expect(resolveBattleAction(plain, { t: 'battle/wait', actor: 'hero' },
      createRng([1, 2, 3, 4])).accepted).toBe(true);
    expect(resolveBattleAction(plain, incoming, createRng([0, 0, 9999, 0])).accepted).toBe(true);
    expect(guarded.units[0]!.facing).toBe(0);
    expect(guarded.units[0]!.hp).toBeGreaterThan(plain.units[0]!.hp);
    expect(guarded.units[0]!.buffs).toHaveLength(2);
  });

  it('rejects defense route submission until the defense-route commit API exists', () => {
    const state = combatFixture({ meridianInputs: meridianFixture(['hero', 'enemy_0'],
      { purpose: 'defense' }) });
    assertRejectedUnchanged(state, { t: 'battle/act', actor: 'hero',
      action: { t: 'guard', routeRef: 'mfr_test' } }, 'MERIDIAN_ROUTE_BLOCKED');
  });

  it('performs acute gathering as a zero-RNG 1000-recovery own action', () => {
    const state = combatFixture({ meridianInputs: meridianFixture(['hero', 'enemy_0']) });
    const rng = createRng([9, 8, 7, 6]); const before = rng.snapshot();
    const result = resolveBattleAction(state, { t: 'battle/act', actor: 'hero',
      action: { t: 'acuteQiGather', routeRef: 'mfr_test' } }, rng);
    expect(result.accepted).toBe(true); expect(rng.snapshot()).toEqual(before);
    expect(state.units[0]).toMatchObject({ ct: 0, ownActions: 1, mp: 400 });
    expect(state.events).toContainEqual(expect.objectContaining({
      t: 'battle/acuteQiGathered', actor: 'hero', routeId: 'mfr_test' }));
  });

  it('consumes the F3 route roll before the F6 hit roll for a routed move', () => {
    const routed: BattleMove = { ...BASIC_MOVE, id: 'mv_test_routed',
      meridianRouteRef: 'mfr_test' };
    const vector = [0, 0, 0, 9_999] as const;
    const proof = createRng(vector);
    expect([proof.nextU32() % 10_000, proof.nextU32() % 10_000]).toEqual([9_999, 0]);
    const state = combatFixture({ playerMoves: [routed],
      meridianInputs: meridianFixture(['hero', 'enemy_0'], { riskBp: 1_200 }) });

    const result = resolveBattleAction(state, { t: 'battle/act', actor: 'hero',
      action: { t: 'skill', move: routed.id, target: 'enemy_0' } }, createRng(vector));

    expect(result).toMatchObject({ accepted: true });
    expect(result.hpDamage).toBeGreaterThan(0);
    const qiIndex = state.events.findIndex((event) => event.t === 'qi.moveResolved');
    const damageIndex = state.events.findIndex((event) => event.t === 'battle/damageResolved');
    expect(qiIndex).toBeGreaterThanOrEqual(0); expect(damageIndex).toBeGreaterThan(qiIndex);
    expect((state.events[qiIndex]!.payload as { trace: readonly { jammed: boolean }[] })
      .trace[0]?.jammed).toBe(false);
  });

  it.each([
    ['QI_ROUTE_UNAVAILABLE', { t: 'battle/act', actor: 'hero', walkTo: { q: 0, r: 1 },
      action: { t: 'acuteQiGather', routeRef: 'mfr_test' } }],
    ['QI_ROUTE_UNAVAILABLE', { t: 'battle/act', actor: 'hero',
      action: { t: 'acuteQiGather', routeRef: 'mfr_missing' } }],
    ['DISABLED_BY_STATUS', { t: 'battle/act', actor: 'hero',
      action: { t: 'acuteQiGather', routeRef: 'mfr_test' } }],
  ] as const)('rejects acute gather with %s without state or RNG changes', (error, command) => {
    const state = combatFixture({ meridianInputs: meridianFixture(['hero', 'enemy_0']) });
    if (error === 'DISABLED_BY_STATUS') state.units[0]!.buffs.push({ iid: 1, def: 'bf_chaqi',
      holder: 'hero', source: null, grade: 1, stacks: 1, turnsLeft: 1, fresh: false });
    assertRejectedUnchanged(state, command, error);
  });

  it('allows full-capacity gathering until circulation completes, then returns QI_CARRY_FULL', () => {
    const meridians = meridianFixture(['hero', 'enemy_0'], { hardCap: 64 });
    const state = combatFixture({ meridianInputs: meridians });
    const runtime = createMeridianFlowRuntime(meridians[0]!); runtime.tick(1);
    state.meridianByUnit[0]!.flow = runtime.snapshot();
    expect(runtime.queryGatherStatus('mfr_test')).toMatchObject({
      totalInFlightQi: 64, canInject: false, canAdvance: true, full: false });
    expect(resolveBattleAction(state, { t: 'battle/act', actor: 'hero',
      action: { t: 'acuteQiGather', routeRef: 'mfr_test' } }, createRng([1, 2, 3, 4])).accepted).toBe(true);

    state.openingOrder.splice(0, state.openingOrder.length, 'hero'); state.units[0]!.ct = 1_000;
    const completed = createMeridianFlowRuntime(meridians[0]!); completed.restore(state.meridianByUnit[0]!.flow);
    completed.tick(20); state.meridianByUnit[0]!.flow = completed.snapshot();
    assertRejectedUnchanged(state, { t: 'battle/act', actor: 'hero',
      action: { t: 'acuteQiGather', routeRef: 'mfr_test' } }, 'QI_CARRY_FULL');
  });

  it('enforces the medical item cap and same-ID two-own-action cooldown (T28/T40)', () => {
    const herb = battleItem();
    const state = combatFixture({ playerMedical: 45, itemDefs: [herb],
      inventory: { stacks: [{ itemId: herb.id, count: 9 }] } });
    expect(state.units[0]!.itemState.maxUses).toBe(4);
    const use = { t: 'battle/act' as const, actor: 'hero',
      action: { t: 'item' as const, item: herb.id, target: 'hero' } };
    expect(resolveBattleAction(state, use, createRng([1, 2, 3, 4])).accepted).toBe(true);
    state.openingOrder.splice(0, state.openingOrder.length, 'hero'); state.units[0]!.ct = 1_000;
    assertRejectedUnchanged(state, use, 'ON_COOLDOWN');
    for (let turn = 0; turn < 2; turn += 1) {
      expect(resolveBattleAction(state, { t: 'battle/wait', actor: 'hero' },
        createRng([1, 2, 3, 4])).accepted).toBe(true);
      state.openingOrder.splice(0, state.openingOrder.length, 'hero'); state.units[0]!.ct = 1_000;
    }
    expect(resolveBattleAction(state, use, createRng([1, 2, 3, 4])).accepted).toBe(true);
    state.units[0]!.itemState.uses = 4;
    state.openingOrder.splice(0, state.openingOrder.length, 'hero'); state.units[0]!.ct = 1_000;
    assertRejectedUnchanged(state, { ...use, action: { ...use.action, item: 'it_other' } }, 'ILLEGAL_TARGET');
    assertRejectedUnchanged(state, use, 'LIMIT_REACHED');
  });

  it('preserves cooldowns for earlier item IDs after using a different item', () => {
    const itemA = battleItem('it_test_a'); const itemB = battleItem('it_test_b');
    const state = combatFixture({ itemDefs: [itemA, itemB], inventory: { stacks: [
      { itemId: itemA.id, count: 2 }, { itemId: itemB.id, count: 1 },
    ] } });
    const use = (item: string) => ({ t: 'battle/act' as const, actor: 'hero',
      action: { t: 'item' as const, item, target: 'hero' } });

    expect(resolveBattleAction(state, use(itemA.id), createRng([1, 2, 3, 4])).accepted).toBe(true);
    state.openingOrder.splice(0, state.openingOrder.length, 'hero'); state.units[0]!.ct = 1_000;
    expect(resolveBattleAction(state, use(itemB.id), createRng([1, 2, 3, 4])).accepted).toBe(true);
    expect(state.units[0]!.itemState.lastBattleUseTurns).toEqual({ it_test_a: 0, it_test_b: 1 });
    state.openingOrder.splice(0, state.openingOrder.length, 'hero'); state.units[0]!.ct = 1_000;
    assertRejectedUnchanged(state, use(itemA.id), 'ON_COOLDOWN');
  });

  it.each([0, 45, 80])('derives itemUsesMax from medical=%i', (medical) => {
    expect(combatFixture({ playerMedical: medical }).units[0]!.itemState.maxUses)
      .toBe(3 + floorDivInt(medical, 40));
  });

  it('shares item button eligibility with commit validation without writing state', () => {
    const item = battleItem();
    const state = combatFixture({ itemDefs: [item],
      inventory: { stacks: [{ itemId: item.id, count: 2 }] } });
    const use = { t: 'battle/act' as const, actor: 'hero',
      action: { t: 'item' as const, item: item.id, target: 'hero' } };
    const before = JSON.stringify(state);
    expect(queryBattleAction(state, use)).toEqual({ enabled: true, reason: null });
    expect(JSON.stringify(state)).toBe(before);
    expect(resolveBattleAction(state, use, createRng([1, 2, 3, 4])).accepted).toBe(true);
    state.openingOrder.splice(0, state.openingOrder.length, 'hero'); state.units[0]!.ct = 1_000;
    const after = JSON.stringify(state);
    expect(queryBattleAction(state, use)).toEqual({ enabled: false, reason: 'ON_COOLDOWN' });
    expect(JSON.stringify(state)).toBe(after);
    assertRejectedUnchanged(state, use, 'ON_COOLDOWN');
  });

  it('counts ordinary and ultimate skill use once per action even on a miss', () => {
    for (const ultimate of [false, true]) {
      const move = { ...BASIC_MOVE, ultimate };
      const state = combatFixture({ playerMoves: [move] });
      expect(resolveBattleAction(state, { t: 'battle/act', actor: 'hero',
        action: { t: 'skill', move: move.id, target: 'enemy_0' } },
      createRng([0, 0, 0, 9_999]))).toMatchObject({ accepted: true, hpDamage: 0 });
      expect(state.rewardStats.martialUses).toEqual([
        { unitId: 'hero', skillId: 'sk_basic', uses: ultimate ? 3 : 1 },
      ]);
    }
  });

  it('rejects disabled, absent and illegal-target items transactionally', () => {
    const herb = battleItem();
    const disabled = combatFixture({ noItems: true, itemDefs: [herb],
      inventory: { stacks: [{ itemId: herb.id, count: 1 }] } });
    const command = { t: 'battle/act' as const, actor: 'hero',
      action: { t: 'item' as const, item: herb.id, target: 'hero' } };
    assertRejectedUnchanged(disabled, command, 'DISABLED_BY_STATUS');
    const empty = combatFixture({ itemDefs: [herb] });
    assertRejectedUnchanged(empty, command, 'LIMIT_REACHED');
    const wrongTarget = combatFixture({ itemDefs: [herb],
      inventory: { stacks: [{ itemId: herb.id, count: 1 }] } });
    assertRejectedUnchanged(wrongTarget, { ...command, action: { ...command.action,
      target: 'enemy_0' } }, 'ILLEGAL_TARGET');
  });

  it.each(['wall', 'unit'])('blocks a thrown item behind a %s without spending it', (blocker) => {
    const base = battleItem('it_test_heal', 'throw');
    const item = { ...base, use: { ...base.use!, target: 'enemy' as const, range: 3 } };
    const state = combatFixture({ enemies: 2, gridRadius: 3, itemDefs: [item],
      inventory: { stacks: [{ itemId: item.id, count: 1 }] } });
    state.units[1]!.pos = { q: 3, r: 0 };
    if (blocker === 'wall') {
      Object.assign(state.grid.cells.find((cell) => cell.q === 1 && cell.r === 0)!, { height: 3 });
    } else state.units[2]!.pos = { q: 1, r: 0 };
    assertRejectedUnchanged(state, { t: 'battle/act', actor: 'hero',
      action: { t: 'item', item: item.id, target: 'enemy_0' } }, 'NO_LOS');
  });

  it('rejects healing an inactive target even when it is in range', () => {
    const base = battleItem();
    const item = { ...base, use: { ...base.use!, target: 'enemy' as const } };
    const state = combatFixture({ itemDefs: [item],
      inventory: { stacks: [{ itemId: item.id, count: 1 }] } });
    state.units[1]!.active = false; state.units[1]!.state = 'downed'; state.units[1]!.hp = 0;
    assertRejectedUnchanged(state, { t: 'battle/act', actor: 'hero',
      action: { t: 'item', item: item.id, target: 'enemy_0' } }, 'ILLEGAL_TARGET');
  });

  it('limits a heavenly pill to one use even without a perBattle declaration', () => {
    const item = { ...battleItem(), grade: 10 };
    const state = combatFixture({ itemDefs: [item],
      inventory: { stacks: [{ itemId: item.id, count: 2 }] } });
    const command = { t: 'battle/act' as const, actor: 'hero',
      action: { t: 'item' as const, item: item.id, target: 'hero' } };
    expect(resolveBattleAction(state, command, createRng([1, 2, 3, 4])).accepted).toBe(true);
    state.openingOrder.splice(0, state.openingOrder.length, 'hero'); state.units[0]!.ct = 1_000;
    state.units[0]!.ownActions = 3;
    assertRejectedUnchanged(state, command, 'LIMIT_REACHED');
  });

  it('shares the heavenly-pill limit across all units in one battle', () => {
    const item = { ...battleItem(), grade: 10 };
    const state = combatFixture({ itemDefs: [item],
      inventory: { stacks: [{ itemId: item.id, count: 2 }] } });
    expect(resolveBattleAction(state, { t: 'battle/act', actor: 'hero',
      action: { t: 'item', item: item.id, target: 'hero' } },
    createRng([1, 2, 3, 4])).accepted).toBe(true);
    assertRejectedUnchanged(state, { t: 'battle/act', actor: 'enemy_0',
      action: { t: 'item', item: item.id, target: 'enemy_0' } }, 'LIMIT_REACHED');
  });

  it.each(['consume', 'apply', 'throw', 'dose', 'load'] as const)(
    'records every %s use and its specified recovery without changing the setup inventory', (action) => {
      const item = battleItem('it_test_heal', action);
      const state = combatFixture({ itemDefs: [item],
        inventory: { stacks: [{ itemId: item.id, count: 2 }] } });
      state.units[0]!.hp = 600;
      const rng = createRng([1, 2, 3, 4]); const before = rng.snapshot();
      expect(resolveBattleAction(state, { t: 'battle/act', actor: 'hero',
        action: { t: 'item', item: item.id, target: 'hero' } }, rng).accepted).toBe(true);
      expect(state.units[0]!.hp).toBe(720);
      expect(state.units[0]!.itemState.battleUses[item.id]).toBe(1);
      expect(state.units[0]!.ct).toBe(action === 'load' ? 0
        : action === 'throw' || action === 'dose' ? 100 : 200);
      expect(state.inventory.stacks[0]!.count).toBe(1);
      expect(state.setup.inventory.stacks[0]!.count).toBe(2);
      expect(rng.snapshot()).toEqual(before);
    },
  );

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

  it('applies, refreshes and decrements an on-hit Buff on the holder own action clock', () => {
    const move = { ...BASIC_MOVE, id: 'mv_test_on_hit_buff' as const, sourceGrade: 7,
      onHit: { applyBuffs: [{ buffId: 'bf_pojia' as const, chanceBp: 10_000, turns: 2 }] } };
    const state = combatFixture({ playerMoves: [move] });
    expect(resolveBattleAction(state, { t: 'battle/act', actor: 'hero',
      action: { t: 'skill', move: move.id, target: 'enemy_0' } },
    createRng([0, 0, 0, 0])).accepted).toBe(true);
    const target = state.units[1]!;
    expect(target.buffs).toEqual([expect.objectContaining({ def: 'bf_pojia', grade: 7,
      turnsLeft: 2, fresh: false, source: 'hero' })]);
    expect(state.events).toContainEqual(expect.objectContaining({ t: 'battle/buffApplied',
      actor: 'hero', target: 'enemy_0', payload: expect.objectContaining({
        buffId: 'bf_pojia', rngChild: 'battle/onHit', refreshed: false,
      }) }));
    expect(resolveBattleAction(state, { t: 'battle/wait', actor: 'enemy_0' },
      createRng([1, 2, 3, 4])).accepted).toBe(true);
    expect(target.buffs[0]?.turnsLeft).toBe(1);
    state.openingOrder.splice(0, state.openingOrder.length, 'hero'); state.units[0]!.ct = 1_000;
    expect(resolveBattleAction(state, { t: 'battle/act', actor: 'hero',
      action: { t: 'skill', move: move.id, target: 'enemy_0' } },
    createRng([0, 0, 0, 0])).accepted).toBe(true);
    expect(target.buffs).toEqual([expect.objectContaining({ turnsLeft: 2 })]);
    expect(state.events.at(-1)).toMatchObject({ t: 'battle/buffApplied',
      payload: { refreshed: true } });
  });

  it('compiles the formal Yuenv move with its source effGrade before applying the Buff', () => {
    const skill = MartialArtDefSchema.parse(contentFile('content/common/skills/sk_yuenvjian.yaml'));
    const definition = MoveDefSchema.parse(contentFile(
      'content/common/moves/mv_yuenvjian_zhuying.yaml'));
    const move = compileBattleMove(definition, { skillId: skill.id as `sk_${string}`,
      effGrade: skill.grade }) as unknown as BattleMove;
    const state = combatFixture({ playerMoves: [move] });
    expect(resolveBattleAction(state, { t: 'battle/act', actor: 'hero',
      action: { t: 'skill', move: move.id, target: 'enemy_0' } },
    createRng([4, 0, 0, 0])).accepted).toBe(true);
    expect(state.units[1]!.buffs).toContainEqual(expect.objectContaining({
      def: 'bf_shiheng', grade: 9, turnsLeft: 1, source: 'hero',
    }));
  });

  it('rejects a precompiled on-hit move without source grade at battle creation', () => {
    const move = { ...BASIC_MOVE, id: 'mv_test_missing_source_grade' as const,
      onHit: { applyBuffs: [{ buffId: 'bf_shiheng' as const, chanceBp: 3_000, turns: 1 }] } };
    expect(() => combatFixture({ playerMoves: [move] }))
      .toThrow('BATTLE_MOVE_SOURCE_GRADE_REQUIRED:hero:mv_test_missing_source_grade');
  });

  it('uses target effect resistance when deciding whether an on-hit Buff lands', () => {
    const move = { ...BASIC_MOVE, id: 'mv_test_effect_res' as const, sourceGrade: 1,
      onHit: { applyBuffs: [{ buffId: 'bf_pojia' as const, chanceBp: 5_000, turns: 2 }] } };
    const susceptible = combatFixture({ playerMoves: [move] });
    const resistant = combatFixture({ playerMoves: [move] });
    Object.assign(susceptible.units[1]!.stats, { effRes: -5 });
    Object.assign(resistant.units[1]!.stats, { effRes: 5 });
    const command = { t: 'battle/act' as const, actor: 'hero',
      action: { t: 'skill' as const, move: move.id, target: 'enemy_0' } };
    expect(resolveBattleAction(susceptible, command, createRng([290, 0, 0, 0])).accepted).toBe(true);
    expect(resolveBattleAction(resistant, command, createRng([290, 0, 0, 0])).accepted).toBe(true);
    expect(susceptible.units[1]!.buffs.some((buff) => buff.def === 'bf_pojia')).toBe(true);
    expect(resistant.units[1]!.buffs.some((buff) => buff.def === 'bf_pojia')).toBe(false);
  });

  it('makes formal poajia and shiheng instances change later damage, hit and parry settlement', () => {
    const attack = { t: 'battle/act' as const, actor: 'hero',
      action: { t: 'skill' as const, move: BASIC_MOVE.id, target: 'enemy_0' } };
    const base = combatFixture(); const debuffed = combatFixture();
    debuffed.units[1]!.buffs.push(
      { iid: 1, def: 'bf_pojia', holder: 'enemy_0', source: 'hero', grade: 9,
        stacks: 1, turnsLeft: 2, fresh: false },
      { iid: 2, def: 'bf_shiheng', holder: 'enemy_0', source: 'hero', grade: 9,
        stacks: 1, turnsLeft: 2, fresh: false },
    );
    Object.assign(base.units[1]!.stats, { eva: 100, parry: 100 });
    Object.assign(debuffed.units[1]!.stats, { eva: 100, parry: 100 });
    const baseResult = resolveBattleAction(base, attack, createRng([0, 0, 9_999, 0]));
    const debuffedResult = resolveBattleAction(debuffed, attack, createRng([0, 0, 9_999, 0]));
    expect(debuffedResult.hpDamage).toBeGreaterThan(baseResult.hpDamage);
    const modifiers = onHitBuffModifiers(debuffed.units[1]!.buffs);
    expect(modifiers).toMatchObject({ hitBp: -480, parryBp: -960, defOutBp: -1440 });
  });

  it('makes an applied dongyao instance lower effect resistance in the next on-hit check', () => {
    const follow = { ...BASIC_MOVE, id: 'mv_test_effect_follow' as const, sourceGrade: 9,
      onHit: { applyBuffs: [{ buffId: 'bf_pojia' as const, chanceBp: 5_000, turns: 2 }] } };
    const plain = combatFixture({ playerMoves: [follow] });
    const shaken = combatFixture({ playerMoves: [follow] });
    for (const state of [plain, shaken]) Object.assign(state.units[1]!.stats, { effRes: 50 });
    shaken.units[1]!.buffs.push({ iid: 1, def: 'bf_dongyao', holder: 'enemy_0', source: 'hero',
      grade: 9, stacks: 1, turnsLeft: 2, fresh: false });
    const command = { t: 'battle/act' as const, actor: 'hero',
      action: { t: 'skill' as const, move: follow.id, target: 'enemy_0' } };
    expect(resolveBattleAction(plain, command, createRng([28, 0, 0, 0])).accepted).toBe(true);
    expect(resolveBattleAction(shaken, command, createRng([28, 0, 0, 0])).accepted).toBe(true);
    expect(plain.units[1]!.buffs.some((buff) => buff.def === 'bf_pojia')).toBe(false);
    expect(shaken.units[1]!.buffs.some((buff) => buff.def === 'bf_pojia')).toBe(true);
  });

  it('stops knockback at occupied cells, terrain blockers and the map edge', () => {
    const move = { ...BASIC_MOVE, id: 'mv_test_knockback' as const,
      onHit: { displace: { kind: 'knockback' as const, cells: 3 } } };
    const occupied = combatFixture({ gridRadius: 4, enemies: 2, playerMoves: [move] });
    occupied.units[2]!.pos = { q: 3, r: 0 };
    expect(resolveBattleAction(occupied, { t: 'battle/act', actor: 'hero',
      action: { t: 'skill', move: move.id, target: 'enemy_0' } },
    createRng([0, 0, 9_999, 0])).accepted).toBe(true);
    expect(occupied.units[1]!.pos).toEqual({ q: 2, r: 0 });
    expect(occupied.events.at(-1)).toMatchObject({ t: 'battle/displaced', amount: 1,
      payload: { stoppedBy: 'unit', requestedCells: 3 } });

    const terrain = combatFixture({ gridRadius: 4, playerMoves: [move] });
    Object.assign(terrain.grid.cells.find((cell) => cell.q === 3 && cell.r === 0)!,
      { standable: false });
    expect(resolveBattleAction(terrain, { t: 'battle/act', actor: 'hero',
      action: { t: 'skill', move: move.id, target: 'enemy_0' } },
    createRng([0, 0, 9_999, 0])).accepted).toBe(true);
    expect(terrain.units[1]!.pos).toEqual({ q: 2, r: 0 });
    expect(terrain.events.at(-1)).toMatchObject({ t: 'battle/displaced',
      payload: { stoppedBy: 'terrain' } });

    const edge = combatFixture({ gridRadius: 2, playerMoves: [move] });
    expect(resolveBattleAction(edge, { t: 'battle/act', actor: 'hero',
      action: { t: 'skill', move: move.id, target: 'enemy_0' } },
    createRng([0, 0, 9_999, 0])).accepted).toBe(true);
    expect(edge.units[1]!.pos).toEqual({ q: 2, r: 0 });
    expect(edge.events.at(-1)).toMatchObject({ t: 'battle/displaced',
      payload: { stoppedBy: 'edge' } });
  });

  it('blocks uphill knockback and applies one collision packet to both units', () => {
    const move = { ...BASIC_MOVE, id: 'mv_test_knockback_uphill' as const,
      onHit: { displace: { kind: 'knockback' as const, cells: 2 } } };
    const state = combatFixture({ gridRadius: 4, enemies: 2, playerMoves: [move] });
    Object.assign(state.grid.cells.find((cell) => cell.q === 2 && cell.r === 0)!, { height: 2 });
    state.units[2]!.pos = { q: 0, r: 3 };
    const before = state.units[1]!.hp;
    expect(resolveBattleAction(state, { t: 'battle/act', actor: 'hero',
      action: { t: 'skill', move: move.id, target: 'enemy_0' } },
    createRng([0, 0, 9_999, 0])).accepted).toBe(true);
    expect(state.units[1]!.pos).toEqual({ q: 1, r: 0 });
    expect(state.events).toContainEqual(expect.objectContaining({ t: 'battle/collisionDamage',
      target: 'enemy_0' }));
    expect(state.events.at(-1)).toMatchObject({ t: 'battle/displaced',
      payload: { stoppedBy: 'uphill' } });
    expect(state.units[1]!.hp).toBeLessThan(before);
  });

  it('settles a 10-to-0 forced fall and cannot knock a target uphill from 7 to 10', () => {
    const move = { ...BASIC_MOVE, id: 'mv_test_knockback_height' as const,
      onHit: { displace: { kind: 'knockback' as const, cells: 1 } } };
    const fall = combatFixture({ gridRadius: 3, playerMoves: [move] });
    Object.assign(fall.grid.cells.find((cell) => cell.q === 0 && cell.r === 0)!, { height: 10 });
    Object.assign(fall.grid.cells.find((cell) => cell.q === 1 && cell.r === 0)!, { height: 10 });
    Object.assign(fall.grid.cells.find((cell) => cell.q === 2 && cell.r === 0)!, { height: 0 });
    const fallBefore = fall.units[1]!.hp;
    expect(resolveBattleAction(fall, { t: 'battle/act', actor: 'hero',
      action: { t: 'skill', move: move.id, target: 'enemy_0' } },
    createRng([0, 0, 9_999, 0])).accepted).toBe(true);
    expect(fall.units[1]!.pos).toEqual({ q: 2, r: 0 });
    expect(fall.units[1]!.hp).toBeLessThan(fallBefore);
    expect(fall.events).toContainEqual(expect.objectContaining({ t: 'battle/fallDamage' }));

    const exact = combatFixture({ gridRadius: 3, playerMoves: [move], hp: 1_001 });
    Object.assign(exact.units[1]!, { qinggong: 100, jump: 3 });
    Object.assign(exact.grid.cells.find((cell) => cell.q === 0 && cell.r === 0)!, { height: 8 });
    Object.assign(exact.grid.cells.find((cell) => cell.q === 1 && cell.r === 0)!, { height: 8 });
    Object.assign(exact.grid.cells.find((cell) => cell.q === 2 && cell.r === 0)!,
      { height: 0, landMulBp: 15_000 });
    expect(resolveBattleAction(exact, { t: 'battle/act', actor: 'hero',
      action: { t: 'skill', move: move.id, target: 'enemy_0' } },
    createRng([0, 0, 9_999, 0])).accepted).toBe(true);
    expect(exact.events).toContainEqual(expect.objectContaining({
      t: 'battle/fallDamage', amount: 259, payload: { incoming: 259 },
    }));

    const uphill = combatFixture({ gridRadius: 3, playerMoves: [move] });
    Object.assign(uphill.grid.cells.find((cell) => cell.q === 0 && cell.r === 0)!, { height: 7 });
    Object.assign(uphill.grid.cells.find((cell) => cell.q === 1 && cell.r === 0)!, { height: 7 });
    Object.assign(uphill.grid.cells.find((cell) => cell.q === 2 && cell.r === 0)!, { height: 10 });
    expect(resolveBattleAction(uphill, { t: 'battle/act', actor: 'hero',
      action: { t: 'skill', move: move.id, target: 'enemy_0' } },
    createRng([0, 0, 9_999, 0])).accepted).toBe(true);
    expect(uphill.units[1]!.pos).toEqual({ q: 1, r: 0 });
    expect(uphill.events.at(-1)).toMatchObject({ payload: { stoppedBy: 'uphill' } });
  });

  it('uses explicit edge metadata for plunges and arena ring-outs', () => {
    const move = { ...BASIC_MOVE, id: 'mv_test_knockback_edge_kind' as const,
      onHit: { displace: { kind: 'knockback' as const, cells: 1 } } };
    const plunged = combatFixture({ gridRadius: 1, playerMoves: [move] });
    Object.assign(plunged.grid.cells.find((cell) => cell.q === 1 && cell.r === 0)!,
      { displacementExits: [{ direction: 0, kind: 'void' }] });
    expect(resolveBattleAction(plunged, { t: 'battle/act', actor: 'hero',
      action: { t: 'skill', move: move.id, target: 'enemy_0' } },
    createRng([0, 0, 9_999, 0])).accepted).toBe(true);
    expect(plunged.units[1]).toMatchObject({ active: false, state: 'plunged' });
    expect(plunged.events).toContainEqual(expect.objectContaining({ t: 'battle/unitPlunged' }));

    const bossFightMinion = combatFixture({ gridRadius: 1, playerMoves: [move], boss: true });
    Object.assign(bossFightMinion.grid.cells.find((cell) => cell.q === 1 && cell.r === 0)!,
      { displacementExits: [{ direction: 0, kind: 'void' }] });
    expect(resolveBattleAction(bossFightMinion, { t: 'battle/act', actor: 'hero',
      action: { t: 'skill', move: move.id, target: 'enemy_0' } },
    createRng([0, 0, 9_999, 0])).accepted).toBe(true);
    expect(bossFightMinion.units[1]).toMatchObject({ active: false, state: 'plunged' });

    const boss = combatFixture({ gridRadius: 1, playerMoves: [move], boss: true });
    Object.assign(boss.units[1]!, { boss: true });
    Object.assign(boss.grid.cells.find((cell) => cell.q === 1 && cell.r === 0)!,
      { displacementExits: [{ direction: 0, kind: 'void' }] });
    expect(resolveBattleAction(boss, { t: 'battle/act', actor: 'hero',
      action: { t: 'skill', move: move.id, target: 'enemy_0' } },
    createRng([0, 0, 9_999, 0])).accepted).toBe(true);
    expect(boss.units[1]).toMatchObject({ active: true, state: 'active', pos: { q: 1, r: 0 } });
    expect(boss.events.at(-1)).toMatchObject({ t: 'battle/displaced',
      payload: { stoppedBy: 'void', bossImmune: true } });

    const ring = combatFixture({ gridRadius: 1, playerMoves: [move], ringOut: true });
    expect(resolveBattleAction(ring, { t: 'battle/act', actor: 'hero',
      action: { t: 'skill', move: move.id, target: 'enemy_0' } },
    createRng([0, 0, 9_999, 0])).accepted).toBe(true);
    expect(ring.units[1]).toMatchObject({ active: false, state: 'fled' });
    expect(ring.events).toContainEqual(expect.objectContaining({ t: 'battle/unitRingOut' }));
  });

  it('consumes stagger only on a skill and adds its 20 percent before route flow cost', () => {
    const routed = { ...BASIC_MOVE, id: 'mv_test_stagger_recovery' as const, recovery: 500,
      meridianRouteRef: 'mfr_test' };
    const state = combatFixture({ playerMoves: [routed],
      meridianInputs: meridianFixture(['hero', 'enemy_0']) });
    const hero = state.units[0]!;
    hero.buffs.push({ iid: 1, def: 'bf_shiheng', holder: hero.id, source: 'enemy_0',
      grade: 1, stacks: 1, turnsLeft: 2, fresh: false });
    expect(resolveBattleAction(state, { t: 'battle/wait', actor: hero.id },
      createRng([1, 2, 3, 4])).accepted).toBe(true);
    expect(hero.buffs.some((buff) => buff.def === 'bf_shiheng')).toBe(true);
    state.openingOrder.splice(0, state.openingOrder.length, hero.id); hero.ct = 1_000;
    expect(resolveBattleAction(state, { t: 'battle/act', actor: hero.id,
      action: { t: 'skill', move: routed.id, target: 'enemy_0' } },
    createRng([0, 0, 0, 0])).accepted).toBe(true);
    expect(hero.buffs.some((buff) => buff.def === 'bf_shiheng')).toBe(false);
    expect(hero.ct).toBe(340);
  });

  it('stores an accepted command without retaining caller references', () => {
    const state = combatFixture();
    const command = { t: 'battle/act' as const, actor: 'hero', action: { t: 'wait' as const },
      walkTo: { q: 0, r: 1 } };
    expect(resolveBattleAction(state, command, createRng([1, 2, 3, 4])).accepted).toBe(true);
    command.walkTo.q = 9;
    expect(state.acceptedCommands[0]).toMatchObject({ walkTo: { q: 0, r: 1 } });
  });

  it('keeps on-hit child RNG and settlement bytes identical across 100 runs', () => {
    const move = { ...BASIC_MOVE, id: 'mv_test_on_hit_determinism' as const, sourceGrade: 4,
      onHit: { applyBuffs: [
        { buffId: 'bf_shiheng' as const, chanceBp: 3_000, turns: 1 },
        { buffId: 'bf_pojia' as const, chanceBp: 4_000, turns: 2 },
      ], displace: { kind: 'knockback' as const, cells: 1 } } };
    const command = { t: 'battle/act' as const, actor: 'hero',
      action: { t: 'skill' as const, move: move.id, target: 'enemy_0' } };
    const run = () => {
      const state = combatFixture({ gridRadius: 3, playerMoves: [move] });
      const rng = createRng([1, 2, 3, 4]);
      expect(resolveBattleAction(state, command, rng).accepted).toBe(true);
      return JSON.stringify({ state, rng: rng.snapshot() });
    };
    const expected = run();
    for (let iteration = 1; iteration < 100; iteration += 1) expect(run()).toBe(expected);
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
