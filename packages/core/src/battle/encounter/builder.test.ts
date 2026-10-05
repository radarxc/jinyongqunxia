/// <reference types="node" />
// eslint-disable-next-line no-restricted-imports -- Test-only RegionMap base64 fixture.
import { Buffer } from 'node:buffer';
import type { RegionMap } from '@tianshu/data/schemas';
import { canonicalJson, mulBpFloor } from '@tianshu/shared';
import { describe, expect, it } from 'vitest';
import { PROLOGUE_ENCOUNTERS, PROLOGUE_TEMPLATE, prologueEncounterSources } from '../../testing';
import { battleSeed } from '../../testing/combat-fixture';
import { commitEncounterActionFacts, createBattleState, encounterRetryAllowed, evaluateBattleEnd,
  finishBattle, resolveBattleConcede } from './index';
import { buildEncounter, expandEncounterUnitSeed } from './builder';
import { executeBattleScript } from '../script';
import { createBattleSession, deriveRetrySeed, retryBattleSession } from '../session';

const build = (index: number, lossStreak = 0) => buildEncounter(PROLOGUE_ENCOUNTERS[index]!, {
  setupId: `setup-${index}`, seed: 0x1234_5678, sourceSnapshotHash: '0'.repeat(64),
  sourceId: 'fixture', triggerId: 'fixture', worldTick: 7, difficulty: 'diff_xiake', lossStreak,
  units: prologueEncounterSources(), templates: [PROLOGUE_TEMPLATE],
});

function arenaMap(): RegionMap {
  const valid = new Uint8Array(128); valid[0] = 3;
  const terrain = new Uint8Array(1_024); terrain[1] = 1;
  const heights = new Uint8Array(1_024);
  const cells = [{ q: 0, r: 0, h: 0 }, { q: 1, r: 0, h: 0 }];
  return { schemaVersion: 'region-map.v1', id: 'sc_00_arena', regionId: 'rg_fixture',
    chapterScope: ['ch00_yuenv'], eraLayer: 'ch00',
    bounds: { qMin: 0, qMax: 31, rMin: 0, rMax: 31 }, chunkSize: 32,
    terrainTable: ['tr_pingdi', 'tr_zhulin'], chunks: [{ q: 0, r: 0, width: 32, height: 32,
      valid: Buffer.from(valid).toString('base64'), terrainEncoding: 'u8',
      terrain: Buffer.from(terrain).toString('base64'), heights: Buffer.from(heights).toString('base64'),
      ramps: [], water: [], precomputedAo: null, decos: [], objects: [] }],
    objects: [{ id: 'arena_fixture', class: 'BattleArena', q: 0, r: 0, h: 0, cells,
      encounterId: 'enc_00_baiyuan', playerCapacity: 1, enemyCapacity: 1, narrow: false }],
    playerSpawns: [], adjacentRegions: [], eraPatchRefs: [], backdropAssetKey: null };
}

describe('encounter.v1 builder', () => {
  it('builds all three prologue encounters with authored grids and deterministic bytes', () => {
    expect(PROLOGUE_ENCOUNTERS.map((_, index) => build(index).setup.grid.cells.length))
      .toEqual([61, 73, 91]);
    expect(canonicalJson(build(2) as never)).toBe(canonicalJson(build(2) as never));
    expect(build(2).setup.participants.map((row) => row.unitRef)).toEqual([
      'hero', 'yue_soldier_1', 'aqing_projection', 'wu_swordsman_1', 'wu_swordsman_2',
    ]);
  });

  it('resolves a RegionMap BattleArena into the battle grid', () => {
    const definition = structuredClone(PROLOGUE_ENCOUNTERS[1]!);
    definition.arena = { kind: 'regionArena', regionId: 'rg_fixture',
      sceneId: 'sc_00_arena', arenaId: 'arena_fixture' };
    const launch = buildEncounter(definition, { setupId: 'setup-arena', seed: 1,
      sourceSnapshotHash: '0'.repeat(64), sourceId: 'fixture', triggerId: 'arena_fixture', worldTick: 0,
      difficulty: 'diff_xiake', units: prologueEncounterSources(), templates: [PROLOGUE_TEMPLATE],
      regionMaps: [arenaMap()] });
    expect(launch.setup.grid.cells.map(({ q, r }) => ({ q, r })))
      .toEqual([{ q: 0, r: 0 }, { q: 1, r: 0 }]);
    expect(launch.setup.grid.cells[1]).toMatchObject({ canopy: 3, los: 'partial',
      terrainDealtBySubTypeBp: { spear: -1_000, staff: -1_000 },
      cover: { vs: ['projectile', 'ranged'], hit: -5,
        hitByDelivery: { projectile: -10, ranged: -5 }, damageBp: 0 } });
    expect(launch.setup.returnContext).toMatchObject({ sceneRef: 'sc_00_arena',
      anchorRef: 'arena_fixture' });
  });

  it('rejects missing or mismatched RegionMap and BattleArena references', () => {
    const definition = structuredClone(PROLOGUE_ENCOUNTERS[1]!);
    definition.arena = { kind: 'regionArena', regionId: 'rg_fixture',
      sceneId: 'sc_00_arena', arenaId: 'arena_fixture' };
    const context = { setupId: 'setup-arena-ref', seed: 1, sourceSnapshotHash: '0'.repeat(64),
      sourceId: 'fixture', triggerId: 'arena_fixture', worldTick: 0, difficulty: 'diff_xiake' as const,
      units: prologueEncounterSources(), templates: [PROLOGUE_TEMPLATE] };
    expect(() => buildEncounter(definition, context)).toThrow('ENCOUNTER_REGION_MAP_MISSING');
    definition.arena.arenaId = 'arena_missing';
    expect(() => buildEncounter(definition, { ...context, regionMaps: [arenaMap()] }))
      .toThrow('ENCOUNTER_BATTLE_ARENA_MISSING');
    const mismatched = structuredClone(PROLOGUE_ENCOUNTERS[0]!);
    mismatched.arena = { kind: 'regionArena', regionId: 'rg_fixture',
      sceneId: 'sc_00_arena', arenaId: 'arena_fixture' };
    expect(() => buildEncounter(mismatched, { ...context, regionMaps: [arenaMap()] }))
      .toThrow('ENCOUNTER_BATTLE_ARENA_ENCOUNTER');
  });

  it('rejects a participant roster beyond BattleArena side capacity', () => {
    const definition = structuredClone(PROLOGUE_ENCOUNTERS[1]!);
    definition.arena = { kind: 'regionArena', regionId: 'rg_fixture',
      sceneId: 'sc_00_arena', arenaId: 'arena_fixture' };
    const extra = structuredClone(definition.participants[1]!);
    extra.unitRef = 'baiyuan_2'; extra.spawnId = 'spawn_baiyuan_2';
    extra.placement.pos = { q: 0, r: 1 }; definition.participants.push(extra);
    expect(() => buildEncounter(definition, { setupId: 'setup-capacity', seed: 1,
      sourceSnapshotHash: '0'.repeat(64), sourceId: 'fixture', triggerId: 'arena_fixture', worldTick: 0,
      difficulty: 'diff_xiake', units: prologueEncounterSources(), templates: [PROLOGUE_TEMPLATE],
      regionMaps: [arenaMap()] })).toThrow('ENCOUNTER_BATTLE_ARENA_CAPACITY');
  });

  it('keeps offgrid participant placement without activating the unit', () => {
    const definition = structuredClone(PROLOGUE_ENCOUNTERS[0]!);
    definition.participants[2]!.state = 'offgrid';
    definition.participants[2]!.placement.pos = { q: 3, r: 0 };
    const launch = buildEncounter(definition, { setupId: 'setup-offgrid', seed: 1,
      sourceSnapshotHash: '0'.repeat(64), sourceId: 'fixture', triggerId: 'fixture', worldTick: 0,
      difficulty: 'diff_xiake', units: prologueEncounterSources(), templates: [PROLOGUE_TEMPLATE] });
    expect(launch.setup.start.initialByUnit.find((row) => row.unitRef === 'road_swordsman_2')?.pos)
      .toEqual({ q: 3, r: 0 });
    expect(createBattleState(launch.setup, launch.seeds).units
      .find((row) => row.id === 'road_swordsman_2')).toMatchObject({ state: 'offgrid', active: false });
  });

  it('completes both story fixtures through their authored terminal paths', () => {
    const zhulin = createBattleState(build(0).setup, build(0).seeds);
    zhulin.units.find((unit) => unit.id === 'hero')!.active = false;
    expect(evaluateBattleEnd(zhulin)).toBe('lose'); finishBattle(zhulin, 'lose');
    expect(zhulin).toMatchObject({ phase: 'ended', result: 'lose' });
    expect(encounterRetryAllowed(zhulin.setup)).toBe(true);

    const biandaoLaunch = build(2);
    const biandao = createBattleState(biandaoLaunch.setup, biandaoLaunch.seeds);
    for (const unit of biandao.units.filter((candidate) => candidate.side === 'enemy')) unit.active = false;
    expect(evaluateBattleEnd(biandao)).toBe('win'); finishBattle(biandao, 'win');
    expect(biandao).toMatchObject({ phase: 'ended', result: 'win' });
  });

  it('wins the spar on one hit, two survived rounds, or concede-advance', () => {
    const launch = build(1); const hit = createBattleState(launch.setup, launch.seeds);
    hit.events.push({ t: 'battle/damageResolved', actionNo: 1, actor: 'hero', target: 'baiyuan', amount: 1 });
    expect(evaluateBattleEnd(hit)).toBe('win');
    const rounds = createBattleState(launch.setup, launch.seeds); rounds.round = 2;
    expect(evaluateBattleEnd(rounds)).toBe('win');
    expect(resolveBattleConcede(rounds)).toBe('win');
  });

  it('accumulates hit-count progress across append-buffer actions', () => {
    const definition = structuredClone(PROLOGUE_ENCOUNTERS[1]!);
    definition.outcome.win[0] = { kind: 'hitCount', actorSide: 'player', targetSide: 'enemy', hits: 2 };
    const launch = buildEncounter(definition, { setupId: 'setup-hits', seed: 1,
      sourceSnapshotHash: '0'.repeat(64), sourceId: 'fixture', triggerId: 'fixture', worldTick: 0,
      difficulty: 'diff_xiake', units: prologueEncounterSources(), templates: [PROLOGUE_TEMPLATE] });
    const state = createBattleState(launch.setup, launch.seeds);
    state.events.push({ t: 'battle/damageResolved', actionNo: 1, actor: 'hero', target: 'baiyuan' });
    expect(evaluateBattleEnd(state)).toBeNull(); commitEncounterActionFacts(state);
    state.events.push({ t: 'battle/damageResolved', actionNo: 2, actor: 'hero', target: 'baiyuan' });
    expect(evaluateBattleEnd(state)).toBe('win');
  });

  it('applies D1 and mode bp only to enemy hp and attack', () => {
    const participant = PROLOGUE_ENCOUNTERS[0]!.participants[1]!;
    const base = battleSeed('road_swordsman_1');
    const scaled = expandEncounterUnitSeed(base, participant, 'normal', 'diff_xiake', 9_000);
    expect([scaled.hpMax, scaled.stats.atkOut, scaled.stats.atkIn])
      .toEqual([648, 216, 198]);
    expect([scaled.mpMax, scaled.stats.defOut, scaled.stats.defIn, scaled.spd])
      .toEqual([400, 153, 144, 95]);
    expect([scaled.stats.defOut, scaled.spd]).toEqual([
      mulBpFloor(base.stats.defOut, 8_500), mulBpFloor(base.spd, 9_500),
    ]);
    const ally = expandEncounterUnitSeed(base, { ...participant, side: 'ally' },
      'normal', 'diff_zongshi', 9_000);
    expect([ally.hpMax, ally.stats.atkOut, ally.stats.atkIn]).toEqual([
      mulBpFloor(base.hpMax, 6_000), base.stats.atkOut, base.stats.atkIn,
    ]);
  });

  it('applies full NPC difficulty without template hp or defense multipliers', () => {
    const participant = PROLOGUE_ENCOUNTERS[1]!.participants[1]!;
    const base = battleSeed('baiyuan');
    const scaled = expandEncounterUnitSeed(base, participant, undefined, 'diff_zongshi', 9_000);
    expect([scaled.hpMax, scaled.stats.atkOut, scaled.stats.atkIn, scaled.spd])
      .toEqual([1440, 268, 246, 103]);
    expect([scaled.stats.defOut, scaled.stats.defIn, scaled.stats.hit])
      .toEqual([base.stats.defOut, base.stats.defIn, base.stats.hit + 6]);
  });

  it('fires Aqings rescue below 45 percent once', () => {
    const launch = build(0); const state = createBattleState(launch.setup, launch.seeds);
    const enemy = state.units.find((unit) => unit.id === 'road_swordsman_1')!;
    const before = { ...enemy.pos };
    state.units[0]!.hp = 539;
    expect(executeBattleScript(state, 0).events.map((event) => event.t))
      .toContain('battle/aqingRescue');
    expect(enemy.pos).not.toEqual(before);
    expect(state.events).toContainEqual(expect.objectContaining({
      t: 'battle/rescueDisplaced', target: 'road_swordsman_1', message: 'aqing_rescue',
    }));
    expect(executeBattleScript(state, 0).triggered).toEqual([]);
    expect(state.events.filter((event) => event.t === 'battle/rescueDisplaced')).toHaveLength(1);
  });

  it('offers the demonstration after three losses and switches the authored projection', () => {
    const zhulin = build(0, 3); const first = createBattleState(zhulin.setup, zhulin.seeds);
    expect(executeBattleScript(first, 3).events).toContainEqual(expect.objectContaining({
      t: 'battle/demonstrationOffered', message: 'replay_zhulin_demo',
    }));
    const biandao = build(2, 3); const second = createBattleState(biandao.setup, biandao.seeds);
    expect(executeBattleScript(second, 3).triggered).toEqual(['aqing_projection']);
    expect(second.units.find((row) => row.id === 'aqing_projection')).toMatchObject({
      active: false, control: 'player', state: 'offgrid',
    });
  });

  it('offers the demonstration after three retry losses in one battle session', () => {
    const launch = build(0);
    const session = createBattleSession(launch.setup, launch.seeds);
    session.battle.units[0]!.hp = 539;
    evaluateBattleEnd(session.battle);
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      finishBattle(session.battle, 'lose');
      retryBattleSession(session);
    }
    expect(session.retryCount).toBe(3);
    expect(session.battle.events).toContainEqual(expect.objectContaining({
      t: 'battle/demonstrationOffered', message: 'replay_zhulin_demo',
    }));
    session.battle.units[0]!.hp = 539;
    evaluateBattleEnd(session.battle);
    expect(session.battle.events.filter((event) => event.t === 'battle/aqingRescue'))
      .toHaveLength(1);
    finishBattle(session.battle, 'lose');
    retryBattleSession(session);
    expect(session.battle.events.filter((event) =>
      event.t === 'battle/demonstrationOffered')).toHaveLength(1);
  });

  it('exposes retry policy while ENG-16c derives retries from the opening seed', () => {
    const retryable = build(0);
    expect(encounterRetryAllowed(retryable.setup)).toBe(true);
    expect(deriveRetrySeed(retryable.setup.seed, 1)).toBe(0x48c6_9a09);
    const spar = build(1);
    expect(encounterRetryAllowed(spar.setup)).toBe(false);
  });

  it('does not count damage events retained from an earlier retry attempt', () => {
    const launch = build(1); const session = createBattleSession(launch.setup, launch.seeds);
    session.battle.events.push({ t: 'battle/damageResolved', actionNo: 1,
      actor: 'hero', target: 'baiyuan', amount: 1 });
    session.battle.phase = 'ended'; session.battle.result = 'win';
    retryBattleSession(session);
    expect(session.battle.result).toBeNull();
    expect(session.battle.units.find((row) => row.id === 'hero')?.hitProgress).toBeUndefined();
  });
});
