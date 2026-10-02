import { describe, expect, it } from 'vitest';
import { TownRuntimeSchema, type TownRuntimeDefinition } from './schemas';

function fixture(): TownRuntimeDefinition {
  return {
    schemaVersion: 'town-runtime.v1', revision: '0'.repeat(64),
    cityId: 'city_test', chapterId: 'ch01', sceneId: 'city_test',
    displayName: '测试镇', historicalYear: 1093, eraKit: 'song_dali',
    source: { spec: 'docs/design/town/city_test__ch01.yaml',
      layout: 'assets/default/baseline/town/town_test__ch01.layout.yaml',
      sha256: '1'.repeat(64) },
    grid: { width: 2, height: 2, cellM: 1, chunkCells: 32 },
    projection: { tilePx: [64, 32], pitchDeg: 30, yawDeg: 45, elevationCmPerM: 100 },
    assets: {
      tile: { baseUrl: '/assets/town/tile/', manifest: 'assets/default/baseline/tile/manifest.yaml', entries: [] },
      building: { baseUrl: '/assets/town/building/', manifest: 'assets/default/baseline/building-map/manifest.yaml', entries: [] },
    },
    groundPalette: [
      { ground: 'ground_stone', overlay: null, elevationCm: 0, walkable: true },
      { ground: 'ground_water', overlay: null, elevationCm: 0, walkable: false },
    ],
    groundRuns: [[0, 3, 0], [3, 1, 1]], edgeTiles: [[2, 'riverbank', 124]],
    waterRuns: [[3, 1]], bridgeRuns: [],
    navigation: { neighborOrder: 'axial-rq-v1', maxStepCm: 50,
      nodes: [[0, 0, 0, 'flat'], [1, 0, 25, 'ramp'], [0, 1, 0, 'stairs']], spawn: [0, 0] },
    buildings: [{ id: 'bi_0001', type: 'bld_shop', origin: [1, 1], size: [1, 1],
      rotationDeg: 0, entrances: [[1, 0]], businessRef: 'shop_test', poi: '市集',
      enterable: true, interiorKind: 'shop', assetId: 'building_shop' }],
    anchors: [
      { id: 'anchor_building_bi_0001', kind: 'building', point: [1, 0],
        buildingId: 'bi_0001', ref: 'shop_test', riskBaseBp: null },
      { id: 'anchor_meditation_bi_0001', kind: 'meditation', point: [0, 1],
        buildingId: 'bi_0001', ref: null, riskBaseBp: 500 },
    ],
  };
}

describe('TownRuntimeSchema', () => {
  it('accepts the compact runtime contract and preserves integer elevations', () => {
    const town = fixture();
    expect(TownRuntimeSchema.parse(town)).toEqual(town);
  });

  it('rejects incomplete RLE, duplicate navigation nodes and blocked entrances', () => {
    const town = fixture();
    expect(() => TownRuntimeSchema.parse({ ...town, groundRuns: [[0, 3, 0]] })).toThrow();
    expect(() => TownRuntimeSchema.parse({ ...town, navigation: { ...town.navigation,
      nodes: [...town.navigation.nodes, town.navigation.nodes[0]!] } })).toThrow();
    expect(() => TownRuntimeSchema.parse({ ...town, buildings: [{ ...town.buildings[0]!,
      entrances: [[9, 9]] }] })).toThrow();
    expect(() => TownRuntimeSchema.parse({ ...town, edgeTiles: [[4, 'road_edge', 0]] })).toThrow();
  });

  it('keeps anchor slots local instead of accepting an unregistered global ID prefix', () => {
    const town = fixture();
    expect(() => TownRuntimeSchema.parse({ ...town, anchors: [{ ...town.anchors[0]!,
      id: 'ta_building_bi_0001' }] })).toThrow();
  });
});
