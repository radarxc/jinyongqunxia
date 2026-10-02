import { describe, expect, it } from 'vitest';
import type { WorldMapRuntimeDefinition } from '@tianshu/data/schemas';
import type { EquipmentRule } from '../economy';
import { createCore } from '../api';
import { RoadPathfinder } from './worldmap-pathfinder';
import { createWorldMapRuntime } from './worldmap-runtime';
import { createInitialWorldMapState, reachableWorldMapNodeIds,
  validateWorldMapState, worldMapPoint } from './worldmap-state';

const entry = (sceneId: string) => ({ sceneId, townSpec: null, templateYear: null,
  gateId: null, spawn: null, accessNote: '测试入口' });
function node(id: string, point: [number, number], kind: 'town' | 'ruin' = 'town') {
  return { id, name: id, kind, point, regionId: 'rg_test', eras: ['ch01'], open: true,
    levelRange: [1, 9] as [number, number], levelNote: '测试', entry: entry(id) };
}
function road(key: string, start: string, end: string, distanceLi: number,
  points: [number, number][]) {
  return { key, routeId: 'route_test', start, end, distanceLi, points,
    sourceHours: distanceLi === 20 ? 2 : 1, kind: 'post_road', eras: ['ch01'] };
}
function mapFixture(): WorldMapRuntimeDefinition {
  const nodes = [node('city_a', [0, 0]), node('city_b', [100, 0]),
    node('rs_c', [200, 0], 'ruin'), node('city_d', [0, 100])];
  return { version: 'worldmap.v1', revision: '0'.repeat(64), chapterId: 'ch01_tianlong',
    era: 'ch01', eraBand: 'northern_song', name: '测试地图', years: [1093, 1094],
    mapReferenceYear: 1093, grid: { width: 256, height: 128 }, nodes,
    startNodeId: 'city_a', travel: { liPerHour: 10, stepLi: 10 },
    roads: [road('route_ab:0', 'city_a', 'city_b', 10, [[0, 0], [100, 0]]),
      road('route_bc:0', 'city_b', 'rs_c', 20, [[100, 0], [200, 0]]),
      road('route_ad:0', 'city_a', 'city_d', 10, [[0, 0], [0, 100]]),
      road('route_dc:0', 'city_d', 'rs_c', 20, [[0, 100], [200, 0]])],
    terrain: { land: [[[0, 0], [255, 0], [255, 127]]], rivers: [], mountains: [] } };
}
function stateFixture(map = mapFixture(), rules: readonly EquipmentRule[] = []) {
  const state = createCore(1).snapshot();
  const equipment = rules.length === 0 ? state.party.equipment :
    { entries: state.party.equipment.entries.map((slot) => slot.slot === 'mainHand'
      ? { ...slot, itemId: rules[0]!.itemId } : slot) };
  return { ...state, party: { ...state.party, equipment }, chapter: { ...state.chapter,
    worldMap: createInitialWorldMapState(map) } };
}

describe('RoadPathfinder', () => {
  it('chooses a deterministic shortest route and rejects unknown destinations', () => {
    const paths = new RoadPathfinder(mapFixture());
    expect(paths.find('city_a', 'rs_c')).toEqual({ legs: [
      { roadKey: 'route_ab:0', from: 'city_a', to: 'city_b' },
      { roadKey: 'route_bc:0', from: 'city_b', to: 'rs_c' },
    ], offsetLi: 0, totalLi: 30 });
    expect(paths.find('city_a', 'city_missing')).toBeNull();
  });
  it('preserves the physical point when rerouting from a road', () => {
    const map = mapFixture();
    const path = new RoadPathfinder(map).fromPosition({ kind: 'road',
      leg: { roadKey: 'route_ab:0', from: 'city_a', to: 'city_b' }, offsetLi: 4 }, 'city_a');
    expect(path).toEqual({ legs: [{ roadKey: 'route_ab:0', from: 'city_b', to: 'city_a' }],
      offsetLi: 6, totalLi: 4 });
    expect(worldMapPoint(map, { kind: 'road', leg: path!.legs[0]!,
      offsetLi: path!.offsetLi })).toEqual([40, 0]);
  });
});

describe('world map state', () => {
  it('projects registered-road components and rejects inconsistent journeys', () => {
    const base = mapFixture();
    const map = { ...base, nodes: [...base.nodes, node('city_isolated', [240, 100])] };
    expect(reachableWorldMapNodeIds(map, { kind: 'node', nodeId: 'city_a' })).toEqual([
      'city_a', 'city_b', 'city_d', 'rs_c',
    ]);
    expect(reachableWorldMapNodeIds(map, { kind: 'node', nodeId: 'city_isolated' }))
      .toEqual(['city_isolated']);
    const state = { ...createInitialWorldMapState(map), nextJourneyId: 2,
      journey: { id: 1, destination: 'rs_c',
        legs: [{ roadKey: 'route_dc:0', from: 'city_d', to: 'rs_c' }],
        legIndex: 0, offsetLi: 0, travelledLi: 0, totalLi: 20, status: 'walking' as const } };
    expect(() => validateWorldMapState(state, map)).toThrow('SAVE_WORLDMAP_INVALID');
  });
});

describe('createWorldMapRuntime', () => {
  it('advances one hour per ten li and supports pause then resume', () => {
    const map = mapFixture(); const runtime = createWorldMapRuntime({ map, equipmentRules: [], identityTags: [] });
    const initial = stateFixture(map);
    const started = runtime.dispatch(initial, { t: 'worldmap/travel', nodeId: 'rs_c' });
    const journey = started.state.chapter.worldMap!.journey!;
    const paused = runtime.dispatch(started.state, { t: 'worldmap/cancel' });
    expect(paused.state.chapter.worldMap!.journey?.status).toBe('paused');
    const resumed = runtime.dispatch(paused.state, { t: 'worldmap/resume' });
    const stepped = runtime.dispatch(resumed.state, { t: 'worldmap/step', journeyId: journey.id,
      expectedTravelledLi: 0 });
    expect(stepped.state.meta.worldTick - initial.meta.worldTick).toBe(600);
    expect(stepped.state.chapter.worldMap).toMatchObject({
      position: { kind: 'node', nodeId: 'city_b' },
      journey: { travelledLi: 10, legIndex: 1, offsetLi: 0 } });
  });
  it('holds a completed final leg for its encounter before scene entry', () => {
    const map = mapFixture(); const runtime = createWorldMapRuntime({ map, equipmentRules: [],
      identityTags: [], ports: { encounter: () =>
        ({ command: 'battle/startEncounter', encounterId: 'enc_test' }) } });
    const started = runtime.dispatch(stateFixture(map), { t: 'worldmap/travel', nodeId: 'city_b' });
    const journey = started.state.chapter.worldMap!.journey!;
    const result = runtime.dispatch(started.state, { t: 'worldmap/step', journeyId: journey.id,
      expectedTravelledLi: 0 });
    expect(result.state.chapter.worldMap!.journey).toMatchObject({
      id: journey.id, status: 'encounter', travelledLi: 10 });
    expect(result.state.chapter.worldMap!.scene).toBeNull();
    expect(result.events.map((event) => event.t)).not.toContain('worldmap/sceneRequested');
  });
  it('blocks an unauthorized visible uniform at a normal city gate', () => {
    const map = mapFixture();
    const rules: readonly EquipmentRule[] = [{ itemId: 'eq_test', slot: 'mainHand',
      exposure: 'visible', lawProfile: { uniform: true, allowedIdentityTags: ['office_test'],
        violation: 'uniformImpersonation', wantedIntent: 'activate', normalGate: 'blocked' } }];
    const runtime = createWorldMapRuntime({ map, equipmentRules: rules, identityTags: [] });
    const result = runtime.dispatch(stateFixture(map, rules), { t: 'worldmap/enter' });
    expect(result.state.chapter.worldMap).toMatchObject({
      scene: null, law: { wantedLevel: 1, normalCityGateBlocked: true } });
    expect(result.events.map((event) => event.t)).toEqual([
      'world/uniformExposed', 'worldmap/gateBlocked',
    ]);
  });
});
