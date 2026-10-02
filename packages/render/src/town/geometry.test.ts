import { describe, expect, it } from 'vitest';
import { Texture } from 'three';
import { createTownGeometry, townEdgeDirections, townEdgePieces, type TownAtlas } from './geometry';
import type { TownRuntimeView } from './types';

const atlas = (ids: readonly string[]): TownAtlas => ({ texture: new Texture(),
  cells: new Map(ids.map((id, index) => [id, { u0: index / ids.length, v0: 0,
    du: 1 / ids.length, dv: 1 }])), ownedImages: [], dispose() {} });
const town: TownRuntimeView = { cityId: 'city_test', displayName: '测试城',
  grid: { width: 2, height: 2, chunkCells: 32 },
  assets: { tile: { baseUrl: '/tile/', entries: [
    { id: 'earth', file: 'earth.png', kind: 'earth', width: 64, height: 32, anchor: null, footprintWidthPx: null },
    { id: 'water', file: 'water.png', kind: 'water', width: 64, height: 32, anchor: null, footprintWidthPx: null },
  ] }, building: { baseUrl: '/building/', entries: [
    { id: 'house', file: 'house.png', kind: 'building', width: 128, height: 96, anchor: [64, 72], footprintWidthPx: 128 },
  ] } },
  groundPalette: [{ ground: 'earth', overlay: null, elevationCm: 0, walkable: true },
    { ground: 'water', overlay: null, elevationCm: 25, walkable: false }],
  groundRuns: [[0, 3, 0], [3, 1, 1]], edgeTiles: [],
  navigation: { nodes: [[0, 0, 0, 'flat']] },
  buildings: [{ id: 'bi_0001', origin: [0, 0], size: [2, 2], rotationDeg: 0,
    assetId: 'house', entrances: [[0, 0]], enterable: true, interiorKind: 'residence' }],
};

describe('town batched geometry', () => {
  it('uses one ground batch per chunk and keeps interiors in one hidden batch', () => {
    const geometry = createTownGeometry(town, atlas(['earth', 'water']), atlas(['house']));
    expect(geometry).toMatchObject({ groundInstances: 4, edgeInstances: 0,
      buildingInstances: 1, staticDrawCalls: 3 });
    expect(geometry.groundChunks).toHaveLength(1); expect(geometry.groundChunks[0]!.count).toBe(4);
    expect(geometry.buildings.count).toBe(1); expect(geometry.interiors.count).toBe(2);
    expect(geometry.interiors.visible).toBe(false);
    expect(geometry.buildingIds).toEqual(['bi_0001']);
    geometry.dispose();
  });

  it('changes only the focused building opacity for direct entry', () => {
    const geometry = createTownGeometry(town, atlas(['earth', 'water']), atlas(['house']));
    geometry.setBuildingFocus('bi_0001', 0.28);
    const opacity = geometry.buildings.geometry.getAttribute('townOpacity');
    expect(opacity.getX(0)).toBeCloseTo(0.28);
    expect(geometry.interiors.visible).toBe(true);
    geometry.setBuildingFocus(null, 1); expect(opacity.getX(0)).toBe(1);
    expect(geometry.interiors.visible).toBe(false);
    geometry.dispose();
  });

  it('decomposes offline masks into the delivered eight-direction pieces', () => {
    expect(townEdgeDirections(124)).toEqual(['n']);
    expect(townEdgeDirections(112)).toEqual(['ne']);
    expect(townEdgeDirections(0)).toEqual(['ne', 'sw']);
    expect(townEdgeDirections(255)).toEqual([]);
    expect(townEdgePieces(253)).toEqual([{ direction: 'ne', crop: [60, 14, 64, 18] }]);
    expect(townEdgePieces(247)).toEqual([{ direction: 'se', crop: [30, 30, 34, 32] }]);
  });

  it('splits a large city into 32 by 32 independently culled batches', () => {
    const large = { ...town, grid: { width: 33, height: 33, chunkCells: 32 },
      groundRuns: [[0, 1089, 0]] as const, edgeTiles: [] };
    const geometry = createTownGeometry(large, atlas(['earth']), atlas(['house']));
    expect(geometry.groundChunks).toHaveLength(4);
    expect(geometry.groundChunks.every((mesh) => mesh.frustumCulled)).toBe(true);
    geometry.dispose();
  });
});
