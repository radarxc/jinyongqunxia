/// <reference types="node" />
// eslint-disable-next-line no-restricted-imports -- test-only fixed replay hash oracle.
import { createHash } from 'node:crypto';
import { canonicalJson, type JsonValue } from '@tianshu/shared';
import { Compiler } from 'inkjs/full';
import { beforeEach, describe, expect, it } from 'vitest';
import { RNG_PROTOCOL, RNG_STREAMS, seedStream } from '../rng';
import { createInitialGameState, type GameState } from '../state';
import { advanceExploreWalk } from '../world/explore/tick';
import { registerExploreTick } from '../world/explore/tick-hook';
import { exploreAstarCallCount, resetExploreAstarCallCount } from '../world/explore/astar';
import { previewTravel } from '../world/explore/walk';
import { exploreMapIndexBuildCount, exploreObjectIndexBuildCount,
  exploreOccupancyBuildCount } from '../world/explore/walk-validate';
import { fixtureMap, rectangle } from '../world/explore/__fixtures__/maps';
import type { RegionMap, RegionObject, RegionRuntimeContent } from '../world';
import type { CoreContent } from '.';
import { dispatchCommand } from './bus';

const hex = (q: number, r: number, h = 0) => ({ q, r, h });
const object = (id: string, q: number, r: number) => ({ id, q, r, h: 0, cells: [hex(q, r)] });
const objects: readonly RegionObject[] = [
  { ...object('entry', 0, 2), class: 'PlayerSpawn', facing: 0, safe: false, entry: true },
  { ...object('once', 2, 2), class: 'Trigger', once: true, autosave: false, safe: false },
  { ...object('npc_friend', 5, 2), class: 'NpcSpawn', npcId: 'npc_friend', facing: 3 },
];

function map(cells = rectangle(12, 5), extra: readonly RegionObject[] = objects): RegionMap {
  const source = fixtureMap('sc_walk_fixture', 12, 5, cells);
  return { ...source, regionId: 'rg_walk_fixture', chapterScope: ['ch00_yuenv'],
    eraLayer: 'ch00', objects: [...extra], playerSpawns: ['entry'] };
}

function ink(): string {
  const value = new Compiler('=== start ===\nhello\n-> END').Compile().ToJson();
  if (typeof value !== 'string') throw new TypeError('INK_FIXTURE');
  return value;
}

function content(regionMap = map()): CoreContent {
  const region: RegionRuntimeContent = { maps: [regionMap], gateFacts: { qinggong: 0 },
    dialogues: [{ sceneId: regionMap.id, anchorId: 'npc_friend',
      storyId: 'story_walk', entryKey: 'start' }] };
  return { region, inkStories: [{ storyId: 'story_walk', storyHash: 'a'.repeat(64),
    storyJson: ink() }] };
}

function state(at = { q: 0, r: 2 }): GameState {
  const rng = Object.fromEntries(RNG_STREAMS.map((name) => [name, seedStream(27, name)]));
  const base = createInitialGameState({ coreVersion: 'test', chapterId: 'ch00_yuenv',
    epochId: 'epoch_ch00', epochYear: -482, rngProtocol: RNG_PROTOCOL,
    rng: rng as GameState['meta']['rng'] });
  return { ...base, world: { ...base.world, navigation: { ...base.world.navigation,
    locationId: 'sc_walk_fixture', mountedRegion: { regionId: 'rg_walk_fixture', spawnId: 'entry',
      playerHex: at, facing: 0, dynamicTiles: [], entities: [], walk: null } } } };
}

function tick(target: GameState, supplied: CoreContent, count: number) {
  const events: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const result = dispatchCommand(target, { t: 'world/tick' }, supplied);
    if (result.ok) events.push(...result.events.map((event) => event.t));
  }
  return events;
}

describe('explore travel commands and ticks', () => {
  beforeEach(() => { registerExploreTick(advanceExploreWalk); resetExploreAstarCallCount(); });

  it('runs exactly one A star for travelTo and none during 2000 ticks', () => {
    const target = state(); const supplied = content();
    expect(dispatchCommand(target, { t: 'world/travelTo', pace: 'run',
      target: { kind: 'hex', hex: { q: 11, r: 2 } } }, supplied).ok).toBe(true);
    expect(exploreAstarCallCount()).toBe(1);
    tick(target, supplied, 2_000);
    expect(exploreAstarCallCount()).toBe(1);
  });

  it('reuses map, object, and occupancy indexes throughout hot walking ticks', () => {
    const target = state();
    const supplied = content(map(rectangle(12, 5), [objects[0]!]));
    dispatchCommand(target, { t: 'world/travelTo', pace: 'walk',
      target: { kind: 'hex', hex: { q: 4, r: 2 } } }, supplied);
    const builds = [exploreMapIndexBuildCount(), exploreObjectIndexBuildCount(),
      exploreOccupancyBuildCount()];
    tick(target, supplied, 36);
    expect([exploreMapIndexBuildCount(), exploreObjectIndexBuildCount(),
      exploreOccupancyBuildCount()]).toEqual(builds);
  });

  it('previews only the first 64 cells without writing state', () => {
    const large = fixtureMap('sc_walk_fixture', 80, 1, rectangle(80, 1));
    const supplied = content({ ...large, regionId: 'rg_walk_fixture', chapterScope: ['ch00_yuenv'],
      eraLayer: 'ch00', objects: [objects[0]!], playerSpawns: ['entry'] });
    const target = state({ q: 0, r: 0 });
    const before = JSON.stringify(target);
    expect(previewTravel(target, supplied.region!, { kind: 'hex', hex: { q: 79, r: 0 } })?.path)
      .toHaveLength(64);
    expect(JSON.stringify(target)).toBe(before);
  });

  it('walks one flat edge in 9 ticks, runs it in 3, and never crosses two edges per tick', () => {
    for (const [pace, count] of [['walk', 9], ['run', 3]] as const) {
      const target = state(); const supplied = content();
      dispatchCommand(target, { t: 'world/travelTo', pace,
        target: { kind: 'hex', hex: { q: 1, r: 2 } } }, supplied);
      tick(target, supplied, count - 1);
      expect(target.world.navigation.mountedRegion?.playerHex).toEqual({ q: 0, r: 2 });
      const events = tick(target, supplied, 1);
      expect(target.world.navigation.mountedRegion?.playerHex).toEqual({ q: 1, r: 2 });
      expect(events).toContain('world/arrived');
    }
  });

  it('slides steer in dir+1 before dir+5 and steer null stops', () => {
    const target = state(); const supplied = content(map(rectangle(12, 5).map((cell) =>
      cell.q === 1 && cell.r === 2 ? { ...cell, blocked: true } : cell)));
    expect(dispatchCommand(target, { t: 'world/steer', dir: 0, pace: 'run' }, supplied).ok).toBe(true);
    tick(target, supplied, 3);
    expect(target.world.navigation.mountedRegion?.playerHex).toEqual({ q: 1, r: 1 });
    expect(dispatchCommand(target, { t: 'world/steer', dir: null }, supplied).ok).toBe(true);
    expect(target.world.navigation.mountedRegion?.walk?.path).toEqual([
      { q: 1, r: 1 }, { q: 2, r: 1 },
    ]);
    tick(target, supplied, 3);
    expect(target.world.navigation.mountedRegion?.walk).toBeNull();
  });

  it('fires a once trigger once across revisits', () => {
    const target = state(); const supplied = content();
    dispatchCommand(target, { t: 'world/travelTo', pace: 'run',
      target: { kind: 'hex', hex: { q: 3, r: 2 } } }, supplied);
    expect(tick(target, supplied, 9).filter((event) => event === 'world/triggered')).toHaveLength(1);
    dispatchCommand(target, { t: 'world/travelTo', pace: 'run',
      target: { kind: 'hex', hex: { q: 0, r: 2 } } }, supplied);
    expect(tick(target, supplied, 9).filter((event) => event === 'world/triggered')).toHaveLength(0);
  });

  it('stops walking when a passed trigger requests dialogue presentation', () => {
    const trigger: RegionObject = { ...object('story_trigger', 1, 2), class: 'Trigger',
      eventId: 'ev_walk_dialogue', once: false, autosave: false, safe: false };
    const supplied = { ...content(map(rectangle(12, 5), [objects[0]!, trigger])), events: [{
      schemaVersion: 'event.v1' as const, id: 'ev_walk_dialogue', chapterId: 'ch00_yuenv',
      event: 'world/trigger', once: false,
      actions: [{ op: 'dialogue/start' as const, storyId: 'story_walk', knot: 'start' }],
    }] };
    const target = state();
    dispatchCommand(target, { t: 'world/travelTo', pace: 'run',
      target: { kind: 'hex', hex: { q: 3, r: 2 } } }, supplied);
    const events = tick(target, supplied, 3);
    expect(events).toContain('world/eventPresented');
    expect(target.world.navigation.mountedRegion?.walk).toBeNull();
  });

  it('clears a residual walk instead of advancing while a mount is pending', () => {
    const target = state(); const supplied = content();
    dispatchCommand(target, { t: 'world/travelTo', pace: 'run',
      target: { kind: 'hex', hex: { q: 3, r: 2 } } }, supplied);
    (target.world.navigation as { pendingMount: GameState['world']['navigation']['pendingMount'] })
      .pendingMount = { regionId: 'rg_next', sceneId: 'sc_next', spawnId: 'entry' };
    tick(target, supplied, 1);
    expect(target.world.navigation.mountedRegion?.playerHex).toEqual({ q: 0, r: 2 });
    expect(target.world.navigation.mountedRegion?.walk).toBeNull();
  });

  it('keeps the current partial edge when rerouted and stop finishes that edge', () => {
    const target = state(); const supplied = content();
    dispatchCommand(target, { t: 'world/travelTo', target: { kind: 'hex', hex: { q: 4, r: 2 } } },
      supplied);
    tick(target, supplied, 4);
    dispatchCommand(target, { t: 'world/travelTo', pace: 'run',
      target: { kind: 'hex', hex: { q: 1, r: 4 } } }, supplied);
    expect(target.world.navigation.mountedRegion?.walk?.path.slice(0, 2))
      .toEqual([{ q: 0, r: 2 }, { q: 1, r: 2 }]);
    dispatchCommand(target, { t: 'world/stop' }, supplied);
    tick(target, supplied, 2);
    expect(target.world.navigation.mountedRegion?.playerHex).toEqual({ q: 1, r: 2 });
    expect(target.world.navigation.mountedRegion?.walk).toBeNull();
  });

  it('interrupts at the boundary when a dynamic door closes', () => {
    const target = state(); const supplied = content();
    dispatchCommand(target, { t: 'world/travelTo', pace: 'run',
      target: { kind: 'hex', hex: { q: 2, r: 2 } } }, supplied);
    tick(target, supplied, 2);
    const mounted = target.world.navigation.mountedRegion!;
    (target.world.navigation as { mountedRegion: GameState['world']['navigation']['mountedRegion'] })
      .mountedRegion = { ...mounted, dynamicTiles: [
        { q: 1, r: 2, terrainId: 'tr_shibi', height: 0 },
      ] };
    const events = tick(target, supplied, 1);
    expect(events).toContain('world/pathInterrupted');
    expect(target.world.navigation.mountedRegion?.walk).toBeNull();
    expect(target.world.navigation.mountedRegion?.playerHex).toEqual({ q: 0, r: 2 });
  });

  it('starts thenInteract dialogue in the arrival transaction and clears walking', () => {
    const target = state(); const supplied = content();
    dispatchCommand(target, { t: 'world/travelTo', pace: 'run', thenInteract: true,
      target: { kind: 'anchor', anchorId: 'npc_friend' } }, supplied);
    const events = tick(target, supplied, 20);
    expect(events).toContain('dialogue/started');
    expect(target.dialogue?.storyId).toBe('story_walk');
    expect(target.world.navigation.mountedRegion?.walk).toBeNull();
  });

  it('emits buildingEntered then buildingLeft as the building layer changes', () => {
    const cells = rectangle(5, 3).map((cell) => ({ ...cell,
      building: cell.q === 1 && cell.r === 1 ? 1 : 0 }));
    const building: RegionObject = { ...object('bi_shop', 1, 0), class: 'Building',
      footprint: { q: 1, r: 1, width: 1, height: 1 },
      interiorRect: { q: 1, r: 1, width: 1, height: 1 }, roofGroup: 'roof', cutawayWalls: [] };
    const supplied = content(map(cells, [
      { ...object('entry', 0, 1), class: 'PlayerSpawn', facing: 0, safe: false, entry: true },
      building,
    ]));
    const target = state({ q: 0, r: 1 });
    dispatchCommand(target, { t: 'world/travelTo', pace: 'run',
      target: { kind: 'hex', hex: { q: 2, r: 1 } } }, supplied);
    const events = tick(target, supplied, 6);
    expect(events.filter((event) => event === 'world/buildingEntered' ||
      event === 'world/buildingLeft')).toEqual(['world/buildingEntered', 'world/buildingLeft']);
  });

  it('replays the same command sequence to byte-identical state and event JSON', () => {
    const run = () => {
      const target = state(); const supplied = content(); const events: unknown[] = [];
      const send = (command: Parameters<typeof dispatchCommand>[1]) => {
        const result = dispatchCommand(target, command, supplied);
        expect(result.ok).toBe(true);
        if (result.ok) events.push(...result.events);
      };
      send({ t: 'world/travelTo', pace: 'run',
        target: { kind: 'hex', hex: { q: 4, r: 2 } } });
      for (let index = 0; index < 4; index += 1) send({ t: 'world/tick' });
      send({ t: 'world/stop' });
      for (let index = 0; index < 3; index += 1) send({ t: 'world/tick' });
      const stateBytes = canonicalJson(target as unknown as JsonValue);
      const eventBytes = canonicalJson(events as JsonValue);
      return { eventBytes, stateHash: createHash('sha256').update(stateBytes).digest('hex') };
    };
    const first = run(); const second = run();
    expect(second).toEqual(first);
    expect(first.stateHash).toBe('4240302a8fb3b54f78062794072ad58ebea25f50823ebaa7139fdb80ab0a09d6');
  });
});
