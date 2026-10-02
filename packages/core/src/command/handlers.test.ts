import type { ItemDef, TownRuntimeDefinition, WorldMapRuntimeDefinition } from '@tianshu/data/schemas';
import { describe, expect, it } from 'vitest';
import { createCoreFromState, type Core } from '../api';
import { createCharacterState, createInitialGameState, type GameState } from '../state';
import { RNG_PROTOCOL, RNG_STREAMS, seedStream } from '../rng';
import { createInitialWorldMapState, createTownState } from '../world';
import type { Command, CoreContent, DispatchResult } from '.';
import { townHandler } from './handlers';

const entry = (sceneId: string) => ({ sceneId, townSpec: null, templateYear: null,
  gateId: null, spawn: null, accessNote: 'command bus fixture' });
const map: WorldMapRuntimeDefinition = {
  version: 'worldmap.v1', revision: '0'.repeat(64), chapterId: 'ch01_tianlong',
  era: 'ch01', eraBand: 'northern_song', name: '总线测试地图', years: [1093, 1094],
  mapReferenceYear: 1093, grid: { width: 16, height: 8 }, startNodeId: 'city_bus_a',
  travel: { liPerHour: 10, stepLi: 10 }, terrain: { land: [], rivers: [], mountains: [] },
  nodes: [
    { id: 'city_bus_a', name: '甲城', kind: 'town', point: [0, 0], regionId: 'rg_bus',
      eras: ['ch01'], open: true, levelRange: [1, 9], levelNote: 'fixture', entry: entry('city_bus_a') },
    { id: 'rs_bus_b', name: '乙墟', kind: 'ruin', point: [10, 0], regionId: 'rg_bus',
      eras: ['ch01'], open: true, levelRange: [1, 9], levelNote: 'fixture', entry: entry('rs_bus_b') },
  ],
  roads: [{ key: 'route_bus:0', routeId: 'route_bus', start: 'city_bus_a', end: 'rs_bus_b',
    distanceLi: 10, points: [[0, 0], [10, 0]], sourceHours: 1, kind: 'post_road', eras: ['ch01'] }],
};
const town: TownRuntimeDefinition = {
  schemaVersion: 'town-runtime.v1', revision: '1'.repeat(64), cityId: 'city_bus_a',
  chapterId: 'ch01', sceneId: 'city_bus_a', displayName: '甲城', historicalYear: 1093,
  eraKit: 'song_dali', source: { spec: 'fixture', layout: 'fixture', sha256: '2'.repeat(64) },
  grid: { width: 2, height: 1, cellM: 1, chunkCells: 32 },
  projection: { tilePx: [64, 32], pitchDeg: 30, yawDeg: 45, elevationCmPerM: 100 },
  assets: { tile: { baseUrl: '/', manifest: 'tile', entries: [] },
    building: { baseUrl: '/', manifest: 'building', entries: [] } },
  groundPalette: [{ ground: 'earth', overlay: null, elevationCm: 0, walkable: true }],
  groundRuns: [[0, 2, 0]], edgeTiles: [], waterRuns: [], bridgeRuns: [],
  navigation: { neighborOrder: 'axial-rq-v1', maxStepCm: 50,
    nodes: [[0, 0, 0, 'flat'], [1, 0, 0, 'flat']], spawn: [0, 0] },
  buildings: [{ id: 'bi_bus', type: 'bld_shop', origin: [1, 0], size: [1, 1],
    rotationDeg: 0, entrances: [[1, 0]], businessRef: 'shop_bus', poi: null,
    enterable: true, interiorKind: 'shop', assetId: 'bld_shop' }],
  anchors: [{ id: 'anchor_bus_meditation', kind: 'meditation', point: [0, 0],
    buildingId: null, ref: null, riskBaseBp: 0 }],
};
const sword = { id: 'eq_bus_sword', kind: 'weapon', grade: 1, stack: 1 } as ItemDef;
const medicine = { id: 'it_bus_medicine', kind: 'pill', grade: 1, stack: 9, flags: [],
  use: { context: 'field', action: 'consume', target: 'self', fieldTime: 2,
    effects: [{ op: 'healPct', params: { valueBp: 1_000 } }] } } as unknown as ItemDef;
const content: CoreContent = { items: [sword, medicine], worldMaps: [map], towns: [town],
  equipmentRules: [{ itemId: sword.id, slot: 'mainHand', hands: 1 }], identityTags: [] };
function initial(): GameState {
  const seed = 23;
  const rng = Object.fromEntries(RNG_STREAMS.map((stream) => [stream, seedStream(seed, stream)]));
  const base = createInitialGameState({ coreVersion: 'test', coreBuild: 'test',
    chapterId: map.chapterId, epochId: 'epoch_bus', epochYear: 1093, rngProtocol: RNG_PROTOCOL,
    masterSeed: seed, rng: rng as GameState['meta']['rng'], locationId: map.startNodeId });
  const protagonist = createCharacterState({ characterId: 'npc_bus_hero', status: 'active',
    innate: { con: 1, str: 1, agi: 1, wis: 1, wil: 1, luk: 1, cha: 1 }, skills: [],
    meridians: { schemaVersion: 2, opened: [], meridianStats: {}, acupointStats: {},
      targets: {}, turnCompleted: 0, lastAppliedMigration: 0 },
    legacyHpCredit: 0, legacyMpCredit: 0 }, []);
  return { ...base, profile: { protagonist: { ...protagonist,
    resources: { ...protagonist.resources, hp: 1 } }, companions: [] },
    party: { ...base.party, inventory: { stacks: [
      { itemId: sword.id, count: 1 }, { itemId: medicine.id, count: 2 }] } },
    chapter: { ...base.chapter, worldMap: createInitialWorldMapState(map),
      town: null, itemChapterUses: {} } };
}
function core(state: GameState = initial(), supplied: CoreContent = content): Core {
  return createCoreFromState(state, supplied);
}
function townCore(supplied: CoreContent = content): Core {
  const state = initial();
  return core({ ...state, chapter: { ...state.chapter, town: createTownState(town) } }, supplied);
}
function accepted(result: DispatchResult): Extract<DispatchResult, { ok: true }> {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.reason);
  return result;
}
async function ready(kind: 'base' | 'town', setup: readonly Command[] = []): Promise<Core> {
  const runtime = kind === 'town' ? townCore() : core();
  for (const command of setup) accepted(runtime.dispatch(command));
  return runtime;
}
interface CommandCase {
  readonly name: string; readonly kind: 'base' | 'town'; readonly setup?: readonly Command[];
  readonly command: Command; readonly rejection: { readonly setup?: readonly Command[];
    readonly command: Command; readonly reason: string; readonly kind?: 'base' | 'town' };
}
const equip: Command = { t: 'inventory/equip', itemId: sword.id, slot: 'mainHand' };
const travel: Command = { t: 'worldmap/travel', nodeId: 'rs_bus_b' };
const move: Command = { t: 'town/move', destination: [1, 0] };
const settle: Command = { t: 'town/settle-building' };
const enter: Command = { t: 'worldmap/enter' };
const CASES: readonly CommandCase[] = [
  { name: 'world/tick', kind: 'base', command: { t: 'world/tick' }, rejection: {
    command: { t: 'world/tick' }, reason: 'WORLD_PAUSED' } },
  { name: 'worldmap/travel', kind: 'base', command: travel, rejection: {
    command: { t: 'worldmap/travel', nodeId: 'missing' }, reason: 'MAP_UNREACHABLE' } },
  { name: 'worldmap/step', kind: 'base', setup: [travel],
    command: { t: 'worldmap/step', journeyId: 1, expectedTravelledLi: 0 }, rejection: {
      command: { t: 'worldmap/step', journeyId: 1, expectedTravelledLi: 0 }, reason: 'MAP_STEP_STALE' } },
  { name: 'worldmap/cancel', kind: 'base', setup: [travel], command: { t: 'worldmap/cancel' },
    rejection: { command: { t: 'worldmap/cancel' }, reason: 'MAP_NOT_WALKING' } },
  { name: 'worldmap/resume', kind: 'base', setup: [travel, { t: 'worldmap/cancel' }],
    command: { t: 'worldmap/resume' }, rejection: {
      command: { t: 'worldmap/resume' }, reason: 'MAP_NOT_PAUSED' } },
  { name: 'worldmap/enter', kind: 'base', command: enter, rejection: { setup: [enter],
    command: enter, reason: 'MAP_SCENE_BUSY' } },
  { name: 'worldmap/leave', kind: 'base', setup: [enter], command: { t: 'worldmap/leave' },
    rejection: { command: { t: 'worldmap/leave' }, reason: 'MAP_NOT_IN_SCENE' } },
  { name: 'town/move', kind: 'town', command: move, rejection: { kind: 'town',
    command: { t: 'town/move', destination: [9, 9] }, reason: 'TOWN_UNREACHABLE' } },
  { name: 'town/settle-building', kind: 'town', setup: [move], command: settle, rejection: {
    kind: 'base', command: settle, reason: 'TOWN_UNAVAILABLE' } },
  { name: 'town/exit-building', kind: 'town', setup: [move, settle],
    command: { t: 'town/exit-building' }, rejection: { kind: 'town',
      command: { t: 'town/exit-building' }, reason: 'TOWN_NOT_INSIDE' } },
  { name: 'town/interact', kind: 'town', setup: [move, settle],
    command: { t: 'town/interact' }, rejection: { kind: 'town',
      command: { t: 'town/interact' }, reason: 'TOWN_NOT_AT_SHOP' } },
  { name: 'town/meditate', kind: 'town', command: { t: 'town/meditate',
    anchorId: 'anchor_bus_meditation', plannedTicks: 600 }, rejection: { kind: 'town',
      command: { t: 'town/meditate', anchorId: 'anchor_bus_meditation', plannedTicks: 599 },
      reason: 'TOWN_MEDITATION_UNAVAILABLE' } },
  { name: 'inventory/equip', kind: 'base', command: equip, rejection: {
    command: { t: 'inventory/equip', itemId: sword.id, slot: 'feet' },
    reason: 'EQUIPMENT_SLOT_MISMATCH' } },
  { name: 'inventory/unequip', kind: 'base', setup: [equip],
    command: { t: 'inventory/unequip', slot: 'mainHand' }, rejection: {
      command: { t: 'inventory/unequip', slot: 'mainHand' }, reason: 'EQUIPMENT_SLOT_EMPTY' } },
  { name: 'inventory/use', kind: 'base', command: { t: 'inventory/use',
    itemId: medicine.id, targetId: 'npc_bus_hero' }, rejection: {
      command: { t: 'inventory/use', itemId: 'it_missing', targetId: 'npc_bus_hero' },
      reason: 'ITEM_EFFECT_UNAVAILABLE' } },
];

describe('registered non-battle command handlers', () => {
  it.each(CASES)('$name commits through the bus with a canonical event envelope', async (row) => {
    const runtime = await ready(row.kind, row.setup); const before = runtime.snapshot();
    const result = accepted(runtime.dispatch(row.command));
    expect(result.stateVersion).toBe(before.meta.stateVersion + 1);
    expect(result.events.length).toBeGreaterThan(0);
    result.events.forEach((event, index) => {
      expect(event.seq).toBe(before.meta.nextEventSeq + index);
      expect(event.stateVersion).toBe(result.stateVersion);
      expect(event.causeId).toBe(`${result.stateVersion}:${before.meta.nextRuntimeOrdinal}`);
      expect(event.parentSeq).toBe(index === 0 ? null : before.meta.nextEventSeq);
    });
  });

  it.each(CASES)('$name rejects without changing canonical state', async (row) => {
    const rejection = row.rejection;
    let runtime: Core;
    if (row.name === 'world/tick') {
      const state = initial(); runtime = core({ ...state, dialogue: { storyId: 'story_bus',
        storyHash: '0'.repeat(64), entryKey: 'start', storyJsonState: '{}', randomSeed: 1,
        pendingIntents: [], consumedTagKeys: [] } });
    } else runtime = await ready(rejection.kind ?? row.kind, rejection.setup);
    const before = runtime.canonicalStateJson();
    expect(runtime.dispatch(rejection.command)).toEqual({ ok: false, reason: rejection.reason });
    expect(runtime.canonicalStateJson()).toBe(before);
  });

  it('rejects an unknown discriminant without allocating a transaction', () => {
    const runtime = core(); const before = runtime.canonicalStateJson();
    expect(runtime.dispatch({ t: 'world/missing' } as unknown as Command)).toEqual({
      ok: false, reason: 'COMMAND_UNKNOWN', at: 't' });
    expect(runtime.canonicalStateJson()).toBe(before);
  });

  it('commits clock boundary events from a world tick', () => {
    const state = initial();
    const clock = { ...state.chapter.clock, elapsedTicks: 599 };
    const runtime = core({ ...state, meta: { ...state.meta, worldTick: 599 },
      chapter: { ...state.chapter, clock } });
    const result = accepted(runtime.dispatch({ t: 'world/tick' }));
    expect(result.events.map((event) => event.t)).toEqual(['world/ticked', 'world/timeBoundary']);
    expect(result.events[1]?.payload).toEqual({
      atTick: 600, kind: 'shichen', periodIndex: 1,
    });
    expect(result.events[1]?.parentSeq).toBe(result.events[0]?.seq);
  });

  it('converts consumable fieldTime from shichen to ticks', () => {
    const runtime = core();
    const result = accepted(runtime.dispatch({ t: 'inventory/use',
      itemId: medicine.id, targetId: 'npc_bus_hero' }));
    const state = runtime.snapshot();
    expect(state.meta.worldTick).toBe(2_400);
    expect(state.chapter.clock.elapsedTicks).toBe(2_400);
    expect(result.events.filter((event) => event.t === 'world/timeBoundary')
      .map((event) => event.payload)).toEqual([
      { atTick: 600, kind: 'shichen', periodIndex: 1 },
      { atTick: 1_800, kind: 'shichen', periodIndex: 2 },
    ]);
  });

  it('validates meditation without reading or advancing a RNG stream', () => {
    const base = initial();
    const rng = { ...base.meta.rng };
    Object.defineProperty(rng, 'world', { enumerable: true, get: () => {
      throw new Error('VALIDATE_TOUCHED_RNG');
    } });
    const state = { ...base, meta: { ...base.meta, rng },
      chapter: { ...base.chapter, town: createTownState(town) } } as GameState;
    expect(townHandler.validate(state, { t: 'town/meditate',
      anchorId: 'anchor_bus_meditation', plannedTicks: 600 }, content)).toBeNull();
  });
});
