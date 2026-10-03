/// <reference types="node" />
// eslint-disable-next-line no-restricted-imports -- Test-only RegionMap base64 fixture.
import { Buffer } from 'node:buffer';
// eslint-disable-next-line no-restricted-imports -- Test-only deterministic hash oracle.
import { createHash } from 'node:crypto';
import { Compiler } from 'inkjs/full';
import { describe, expect, it } from 'vitest';
import { createCoreFromState, createNewGameState, evaluateGate, previewRegionPath,
  projectRegionDynamic, projectRegionStatic, type Core, type CoreContent,
  type RegionMap, type RegionObject, type RegionRuntimeContent } from '..';

const identity = { name: '沈砚', gender: 'female', appearance: 'hero_f01',
  pronoun: '她', originId: 'origin_wenshiguan' };
const cell = (q: number, r: number, h = 0) => ({ q, r, h });
const base = (id: string, q: number, r: number, h = 0) =>
  ({ id, q, r, h, cells: [cell(q, r, h)] });
const spawn = (id: string, q: number, r: number, safe = false): RegionObject =>
  ({ ...base(id, q, r), class: 'PlayerSpawn', facing: 0, safe, entry: true });

function scene(id: string, cells: readonly { q: number; r: number; terrain?: number;
  height?: number }[], objects: readonly RegionObject[], ramps: readonly {
    index: number; dir: 0 | 1 | 2 | 3 | 4 | 5 }[] = []): RegionMap {
  const valid = new Uint8Array(128); const terrain = new Uint8Array(1024);
  const heights = new Uint8Array(1024);
  for (const entry of cells) {
    const index = entry.r * 32 + entry.q;
    valid[index >> 3] = valid[index >> 3]! | 1 << (index & 7); terrain[index] = entry.terrain ?? 0;
    heights[index] = entry.height ?? 0;
  }
  const ordered = [...objects].sort((left, right) => left.r - right.r || left.q - right.q ||
    (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
  return { schemaVersion: 'region-map.v1', id, regionId: 'rg_fixture',
    chapterScope: ['ch00_yuenv'], eraLayer: 'ch00',
    bounds: { qMin: 0, qMax: 31, rMin: 0, rMax: 31 }, chunkSize: 32,
    terrainTable: ['tr_pingdi', 'tr_shibi', 'tr_wuding'], chunks: [{ q: 0, r: 0,
      width: 32, height: 32, valid: Buffer.from(valid).toString('base64'),
      terrainEncoding: 'u8', terrain: Buffer.from(terrain).toString('base64'),
      heights: Buffer.from(heights).toString('base64'), ramps: [...ramps], water: [],
      precomputedAo: null, decos: [], objects: ordered }], objects: [],
    playerSpawns: ordered.filter((object) => object.class === 'PlayerSpawn').map((object) => object.id),
    adjacentRegions: [], eraPatchRefs: [], backdropAssetKey: null };
}

const SCENE_A_OBJECTS: readonly RegionObject[] = [
  spawn('bookfall', 0, 0, true),
  { ...base('checkpoint', 1, 0), class: 'Trigger', eventId: 'fx_checkpoint',
    once: true, autosave: true, safe: true },
  { ...base('door_to_shanjing', 2, 0), class: 'Door', mode: 'door',
    pairId: 'door_to_zhulin', oneWay: false, targetRegionId: 'rg_fixture',
    targetSceneId: 'sc_00_shanjing', targetSpawnId: 'from_zhulin' },
  { ...base('chest_supplies', 0, 1), class: 'Chest', lootRef: 'loot_supplies' },
  { ...base('door_locked', 0, 1), class: 'Door', mode: 'door', pairId: 'door_locked_back',
    oneWay: false, targetRegionId: 'rg_fixture', targetSceneId: 'sc_00_shanjing',
    targetSpawnId: 'from_zhulin', lockedBy: 'gate_story_flag' },
  { ...base('aqing', 1, 1), class: 'NpcSpawn', npcId: 'npc_aqing', facing: 3 },
];
const MAP_A = scene('sc_00_zhulin', [
  { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 },
  { q: 3, r: 0, terrain: 1 }, { q: 0, r: 1 }, { q: 1, r: 1 },
  { q: 2, r: 1, terrain: 2 }, { q: 0, r: 2, height: 5 },
], SCENE_A_OBJECTS);
const MAP_B = scene('sc_00_shanjing', [{ q: 0, r: 0 }, { q: 1, r: 0 }], [
  spawn('from_zhulin', 0, 0, true),
  { ...base('door_to_zhulin', 1, 0), class: 'Door', mode: 'door',
    pairId: 'door_to_shanjing', oneWay: false, targetRegionId: 'rg_fixture',
    targetSceneId: 'sc_00_zhulin', targetSpawnId: 'bookfall' },
]);
const RAMP_MAP = scene('sc_00_ramp', [{ q: 0, r: 0 }, { q: 1, r: 0, height: 5 }],
  [spawn('ramp_start', 0, 0)], [{ index: 0, dir: 0 }]);
const GORGE_MAP = (() => {
  const map = scene('sc_00_gorge', [
    { q: 0, r: 0 }, { q: 1, r: 0, terrain: 1 }, { q: 2, r: 0 },
  ], [spawn('gorge_start', 0, 0)]);
  return { ...map, terrainTable: ['tr_pingdi', 'tr_shengu', 'tr_wuding'] as RegionMap['terrainTable'] };
})();

function storyJson(): string {
  const output = new Compiler('=== opening ===\nink.region.text.0000\n-> END').Compile().ToJson();
  if (typeof output !== 'string') throw new TypeError('INK_FIXTURE'); return output;
}
function content(maps: readonly RegionMap[] = [MAP_A, MAP_B]): CoreContent {
  const region: RegionRuntimeContent = { maps, gateFacts: { qinggong: 0, flags: [] },
    gates: [{ gateId: 'gate_story_flag', expression: { flag: 'fx_door_open' } }],
    dialogues: [{ sceneId: 'sc_00_zhulin', anchorId: 'aqing',
      storyId: 'story_region', entryKey: 'opening' }],
    loot: [{ lootRef: 'loot_supplies', items: [{ itemId: 'it_fixture', count: 1 }] }] };
  return { region, items: [{ id: 'it_fixture', kind: 'material', grade: 1, stack: 1 } as never],
    inkStories: [{ storyId: 'story_region', storyHash: 'a'.repeat(64), storyJson: storyJson() }] };
}
function runtime(supplied = content()): Core {
  return createCoreFromState(createNewGameState({ masterSeed: 17, identity,
    difficulty: 'diff_xiake' }), supplied);
}
const hash = (core: Core) => createHash('sha256').update(core.canonicalStateJson()).digest('hex');

describe('region exploration command pipeline', () => {
  it('mounts, walks through checkpoints, exits, mounts the next scene, and repeats the same hash', () => {
    const run = () => {
      const core = runtime();
      expect(core.dispatch({ t: 'world/mountRegion', regionId: 'rg_fixture',
        sceneId: 'sc_00_zhulin', spawnId: 'bookfall' }).ok).toBe(true);
      const preview = previewRegionPath(core.snapshot(), content().region!, { q: 1, r: 0 });
      expect(preview).toMatchObject({ path: [{ q: 0, r: 0 }, { q: 1, r: 0 }], cost: 1 });
      expect(core.snapshot().world.navigation.mountedRegion?.playerHex).toEqual({ q: 0, r: 0 });
      const walked = core.dispatch({ t: 'world/walkTo', hex: { q: 1, r: 0 } });
      expect(walked.ok && walked.events.map((event) => event.t)).toEqual([
        'world/walked', 'world/triggered', 'world/safeAnchorReached', 'world/autosaveRequested']);
      expect(core.dispatch({ t: 'world/walkTo', hex: { q: 2, r: 0 } }).ok).toBe(true);
      const exit = core.dispatch({ t: 'world/interact', anchorId: 'door_to_shanjing' });
      expect(exit.ok && exit.events.map((event) => event.t)).toEqual([
        'world/autosaveRequested', 'world/regionRequested']);
      expect(core.snapshot().world.navigation.pendingMount).toEqual({ regionId: 'rg_fixture',
        sceneId: 'sc_00_shanjing', spawnId: 'from_zhulin' });
      expect(core.dispatch({ t: 'world/mountRegion', regionId: 'rg_fixture',
        sceneId: 'sc_00_shanjing', spawnId: 'from_zhulin' }).ok).toBe(true);
      return hash(core);
    };
    expect(run()).toBe(run());
  });

  it('rejects invalid mount, terrain, height, qinggong, and occupied paths without mutation', () => {
    const core = runtime(); const beforeMount = hash(core);
    expect(core.dispatch({ t: 'world/mountRegion', regionId: 'rg_fixture',
      sceneId: 'sc_00_missing', spawnId: 'bookfall' })).toEqual({
      ok: false, reason: 'REGION_UNAVAILABLE' });
    expect(hash(core)).toBe(beforeMount);
    core.dispatch({ t: 'world/mountRegion', regionId: 'rg_fixture',
      sceneId: 'sc_00_zhulin', spawnId: 'bookfall' });
    for (const [hex, reason] of [
      [{ q: 3, r: 0 }, 'REGION_PATH_NOT_STANDABLE'],
      [{ q: 0, r: 2 }, 'REGION_PATH_HEIGHT'],
      [{ q: 2, r: 1 }, 'REGION_PATH_QINGGONG'],
      [{ q: 1, r: 1 }, 'REGION_PATH_BLOCKED'],
    ] as const) {
      const before = hash(core); expect(core.dispatch({ t: 'world/walkTo', hex }))
        .toEqual({ ok: false, reason }); expect(hash(core)).toBe(before);
    }
  });

  it('uses ramp metadata as an allowed edge even above the normal jump limit', () => {
    const supplied = content([RAMP_MAP]); const core = runtime(supplied);
    core.dispatch({ t: 'world/mountRegion', regionId: 'rg_fixture',
      sceneId: 'sc_00_ramp', spawnId: 'ramp_start' });
    const moved = core.dispatch({ t: 'world/walkTo', hex: { q: 1, r: 0 } });
    expect(moved.ok).toBe(true);
    expect(core.snapshot().world.navigation.mountedRegion?.playerHex).toEqual({ q: 1, r: 0 });
  });

  it('crosses one straight non-standable cell at qg1 and rejects it at qg0', () => {
    const low = content([GORGE_MAP]); const blocked = runtime(low);
    blocked.dispatch({ t: 'world/mountRegion', regionId: 'rg_fixture',
      sceneId: 'sc_00_gorge', spawnId: 'gorge_start' });
    expect(blocked.dispatch({ t: 'world/walkTo', hex: { q: 2, r: 0 } }))
      .toEqual({ ok: false, reason: 'REGION_PATH_QINGGONG' });
    const enough = { ...low, region: { ...low.region!, gateFacts: { qinggong: 20 } } };
    const core = runtime(enough); core.dispatch({ t: 'world/mountRegion', regionId: 'rg_fixture',
      sceneId: 'sc_00_gorge', spawnId: 'gorge_start' });
    expect(previewRegionPath(core.snapshot(), enough.region!, { q: 2, r: 0 }))
      .toMatchObject({ path: [{ q: 0, r: 0 }, { q: 2, r: 0 }], cost: 2 });
    expect(core.dispatch({ t: 'world/walkTo', hex: { q: 2, r: 0 } }).ok).toBe(true);
  });

  it('does not treat an opaque wall as a crossable gap at any qinggong tier', () => {
    const wall = scene('sc_00_wall', [
      { q: 0, r: 0 }, { q: 1, r: 0, terrain: 1 }, { q: 2, r: 0 },
    ], [spawn('wall_start', 0, 0)]);
    const supplied = content([wall]); const high = { ...supplied, region: {
      ...supplied.region!, gateFacts: { qinggong: 200 },
    } };
    const core = runtime(high); core.dispatch({ t: 'world/mountRegion', regionId: 'rg_fixture',
      sceneId: 'sc_00_wall', spawnId: 'wall_start' });
    expect(core.dispatch({ t: 'world/walkTo', hex: { q: 2, r: 0 } }))
      .toEqual({ ok: false, reason: 'REGION_PATH_BLOCKED' });
  });

  it('reports a stable soft-lock reason and consumes a chest only after successful loot', () => {
    const core = runtime(); core.dispatch({ t: 'world/mountRegion', regionId: 'rg_fixture',
      sceneId: 'sc_00_zhulin', spawnId: 'bookfall' });
    expect(projectRegionDynamic(core.snapshot(), content().region!)?.doors
      .find((door) => door.anchorId === 'door_locked')).toMatchObject({
        open: false, locked: true, reason: 'REGION_GATE_FLAG' });
    expect(core.dispatch({ t: 'world/interact', anchorId: 'door_locked' }))
      .toEqual({ ok: false, reason: 'REGION_GATE_FLAG' });
    const opened = core.dispatch({ t: 'world/interact', anchorId: 'chest_supplies' });
    expect(opened.ok).toBe(true); expect(core.snapshot().party.inventory.stacks)
      .toEqual([{ itemId: 'it_fixture', count: 1 }]);
    expect(core.dispatch({ t: 'world/interact', anchorId: 'chest_supplies' }))
      .toEqual({ ok: false, reason: 'REGION_ANCHOR_CONSUMED' });
  });

  it('rejects unknown loot and all interactions while an exit is pending without mutation', () => {
    const unknown = content(); const core = runtime({ ...unknown, region: { ...unknown.region!,
      loot: [{ lootRef: 'loot_supplies', items: [{ itemId: 'it_missing', count: 1 }] }] } });
    core.dispatch({ t: 'world/mountRegion', regionId: 'rg_fixture',
      sceneId: 'sc_00_zhulin', spawnId: 'bookfall' });
    const beforeLoot = hash(core);
    expect(core.dispatch({ t: 'world/interact', anchorId: 'chest_supplies' }))
      .toEqual({ ok: false, reason: 'REGION_LOOT_UNKNOWN' });
    expect(hash(core)).toBe(beforeLoot);
    core.dispatch({ t: 'world/walkTo', hex: { q: 1, r: 0 } });
    core.dispatch({ t: 'world/walkTo', hex: { q: 2, r: 0 } });
    expect(core.dispatch({ t: 'world/interact', anchorId: 'door_to_shanjing' }).ok).toBe(true);
    const beforePending = hash(core);
    expect(core.dispatch({ t: 'world/interact', anchorId: 'door_to_shanjing' }))
      .toEqual({ ok: false, reason: 'REGION_EXIT_PENDING' });
    expect(hash(core)).toBe(beforePending);
  });

  it('starts the bound Ink dialogue and suppresses checkpoint commands while it is active', () => {
    const core = runtime(); core.dispatch({ t: 'world/mountRegion', regionId: 'rg_fixture',
      sceneId: 'sc_00_zhulin', spawnId: 'bookfall' });
    core.dispatch({ t: 'world/walkTo', hex: { q: 1, r: 0 } });
    const started = core.dispatch({ t: 'world/interact', anchorId: 'aqing' });
    expect(started.ok && started.events[0]).toMatchObject({ t: 'dialogue/started',
      payload: { storyId: 'story_region', entryKey: 'opening' } });
    expect(core.snapshot().dialogue).toMatchObject({ storyId: 'story_region' });
    expect(core.dispatch({ t: 'world/walkTo', hex: { q: 1, r: 0 } }))
      .toEqual({ ok: false, reason: 'REGION_INTERACTION_BUSY' });
  });

  it('evaluates flag, quest and qinggong GateExpr branches deterministically', () => {
    expect(evaluateGate({ flag: 'opened' }, { qinggong: 0, flags: [] }))
      .toEqual({ allowed: false, reason: 'REGION_GATE_FLAG' });
    expect(evaluateGate({ all: [{ flag: 'opened' }, { quest: 'q_00_main_c_01',
      state: 'active' }] }, { qinggong: 0, flags: ['opened'],
      quests: { q_00_main_c_01: 'active' } })).toEqual({ allowed: true, reason: null });
    expect(evaluateGate({ any: [{ qg: 2 }, { item: 'it_feizhua' }] },
      { qinggong: 19, items: {} })).toEqual({ allowed: false, reason: 'REGION_GATE_QINGGONG' });
  });

  it('projects static geometry separately from player, anchors, and door state', () => {
    const core = runtime(); core.dispatch({ t: 'world/mountRegion', regionId: 'rg_fixture',
      sceneId: 'sc_00_zhulin', spawnId: 'bookfall' });
    expect(projectRegionStatic(content().region!, 'sc_00_zhulin')).toMatchObject({
      schemaVersion: 'region-static.v1', regionId: 'rg_fixture', sceneId: 'sc_00_zhulin' });
    expect(projectRegionDynamic(core.snapshot(), content().region!)).toMatchObject({
      playerHex: { q: 0, r: 0 }, facing: 0, pendingMount: null });
  });

  it('applies dynamic tiles and inactive entities to path and interaction queries', () => {
    const source = runtime(); source.dispatch({ t: 'world/mountRegion', regionId: 'rg_fixture',
      sceneId: 'sc_00_zhulin', spawnId: 'bookfall' });
    const mounted = source.snapshot().world.navigation.mountedRegion!;
    const state = source.snapshot(); const core = createCoreFromState({ ...state, world: {
      ...state.world, navigation: { ...state.world.navigation, mountedRegion: { ...mounted,
        dynamicTiles: [{ q: 1, r: 0, terrainId: 'tr_shibi', height: 0 }],
        entities: [{ anchorId: 'chest_supplies', active: false, consumed: false }],
      } },
    } }, content());
    expect(core.dispatch({ t: 'world/walkTo', hex: { q: 1, r: 0 } }))
      .toEqual({ ok: false, reason: 'REGION_PATH_NOT_STANDABLE' });
    expect(projectRegionDynamic(core.snapshot(), content().region!)?.interactableAnchors
      .some((anchor) => anchor.anchorId === 'chest_supplies')).toBe(false);
    expect(core.dispatch({ t: 'world/interact', anchorId: 'chest_supplies' }))
      .toEqual({ ok: false, reason: 'REGION_ANCHOR_UNKNOWN' });
    const inactiveTrigger = createCoreFromState({ ...state, world: { ...state.world,
      navigation: { ...state.world.navigation, mountedRegion: { ...mounted,
        entities: [{ anchorId: 'checkpoint', active: false, consumed: false }],
      } },
    } }, content());
    const walked = inactiveTrigger.dispatch({ t: 'world/walkTo', hex: { q: 1, r: 0 } });
    expect(walked.ok && walked.events.map((event) => event.t)).toEqual(['world/walked']);
  });
});
