import { describe, expect, it } from 'vitest';
import { mapFromRegistration, WorldMapDefinitionSchema, type WorldMapDefinition } from './schemas';

function mapFixture(): WorldMapDefinition {
  return {
    version: 'worldmap.v1', revision: '0'.repeat(64), chapterId: 'ch01_tianlong', era: 'ch01',
    eraBand: 'northern_song', name: '测试地图', years: [1093, 1094], mapReferenceYear: 1093,
    grid: { width: 256, height: 128, projection: 'test-grid' },
    travel: { liPerHour: 10, stepLi: 10, note: '测试' }, startNodeId: 'city_a',
    nodes: [
      { id: 'city_a', name: '甲城', kind: 'town', point: [0, 0], regionId: 'rg_test',
        eras: ['ch01'], open: true, levelRange: [1, 9], levelNote: '测试', coordinateNote: '测试',
        entry: { sceneId: 'city_a', townSpec: null, templateYear: null, gateId: null, spawn: null, accessNote: '测试' } },
      { id: 'rs_b', name: '乙遗迹', kind: 'ruin', point: [100, 0], regionId: 'rg_test',
        eras: ['ch01'], open: true, levelRange: null, levelNote: '测试', coordinateNote: '测试',
        accessNote: '遗迹入口测试',
        entry: { sceneId: 'rs_b', townSpec: null, templateYear: null, gateId: null, spawn: null, accessNote: '测试' } },
    ],
    roads: [{ key: 'route_ab:0', routeId: 'route_ab', start: 'city_a', end: 'rs_b',
      distanceLi: 10, points: [[0, 0], [100, 0]], sourceHours: 1, kind: 'post_road',
      eras: ['ch01'], note: '测试' }],
    terrain: { land: [[[0, 0], [255, 0], [255, 127]]], rivers: [], mountains: [] },
    sources: ['test'],
  };
}

describe('WorldMapDefinitionSchema', () => {
  it('accepts a complete deterministic map and its registration envelope', () => {
    const map = mapFixture();
    expect(WorldMapDefinitionSchema.parse(map)).toEqual(map);
    expect(mapFromRegistration({ schemaVersion: 'event.v1', id: 'ev_01_ditu',
      chapterId: 'ch01_tianlong', event: 'world/mapRegistered', once: false,
      actions: [{ op: 'mountWorldMap', map }] })).toEqual(map);
  });

  it('accepts optional display tiers and road paths whose ends sit on the nodes', () => {
    const map = mapFixture();
    const nodes = map.nodes.map((node) => node.id === 'city_a'
      ? { ...node, tier: 'capital' as const, marker: 'city_large' as const }
      : { ...node, tier: 'site' as const, marker: 'temple' as const });
    const roads = [{ ...map.roads[0]!, path: [[0, 0], [40.25, 3.5], [100, 0]] as [number, number][] }];
    expect(WorldMapDefinitionSchema.parse({ ...map, nodes, roads }).roads[0]!.path).toEqual(roads[0]!.path);
    const offEnd = [{ ...map.roads[0]!, path: [[0, 0], [99.5, 0]] as [number, number][] }];
    expect(() => WorldMapDefinitionSchema.parse({ ...map, roads: offEnd })).toThrow();
    expect(() => WorldMapDefinitionSchema.parse({ ...map, nodes: map.nodes.map((node) =>
      ({ ...node, tier: 'huge' })) })).toThrow();
    expect(() => WorldMapDefinitionSchema.parse({ ...map, nodes: map.nodes.map((node) =>
      ({ ...node, marker: 'castle' })) })).toThrow();
  });

  it('accepts sect seats tied to known nodes and rejects duplicates or unknown cities', () => {
    const map = mapFixture();
    const sect = { id: 'sect_test', name: '测试派', siteName: '测试山', kind: 'headquarters',
      point: [40, 0] as [number, number], status: 'O' as const, marker: 'sect' as const, cityId: 'city_a' };
    expect(WorldMapDefinitionSchema.parse({ ...map, sects: [sect] }).sects).toEqual([sect]);
    expect(WorldMapDefinitionSchema.parse({ ...map, sects: [{ ...sect, cityId: null }] }).sects).toHaveLength(1);
    expect(() => WorldMapDefinitionSchema.parse({ ...map, sects: [sect, sect] })).toThrow();
    expect(() => WorldMapDefinitionSchema.parse({ ...map, sects: [{ ...sect, cityId: 'city_zz' }] })).toThrow();
    expect(() => WorldMapDefinitionSchema.parse({ ...map, sects: [{ ...sect, status: 'N' }] })).toThrow();
    expect(() => WorldMapDefinitionSchema.parse({ ...map, sects: [{ ...sect, marker: 'city_large' }] })).toThrow();
    expect(WorldMapDefinitionSchema.parse({ ...map, sects: [{ ...sect, marker: 'daoist' }] }).sects![0]!.marker).toBe('daoist');
  });

  it('rejects geometry, era and envelope identities that disagree with the map', () => {
    const map = mapFixture();
    const roads = [{ ...map.roads[0]!, points: [[1, 0], [100, 0]] as const }];
    expect(() => WorldMapDefinitionSchema.parse({ ...map, roads })).toThrow();
    expect(() => WorldMapDefinitionSchema.parse({ ...map, nodes: map.nodes.map((node) =>
      node.id === 'city_a' ? { ...node, open: false } : node) })).toThrow();
    expect(() => mapFromRegistration({ schemaVersion: 'event.v1', id: 'ev_02_ditu',
      chapterId: 'ch01_tianlong', event: 'world/mapRegistered', once: false,
      actions: [{ op: 'mountWorldMap', map }] })).toThrow();
  });
});
