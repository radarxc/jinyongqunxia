import { describe, expect, it } from 'vitest';
import { createWorldMapGeometry, mapPointToWorld, terrainHeight } from './geometry';
import type { MapGeometryView } from './types';

const map: MapGeometryView = {
  grid: { width: 100, height: 50 },
  nodes: [
    { id: 'city_a', name: '甲城', kind: 'town', point: [10, 10], open: true },
    { id: 'rs_b', name: '乙遗迹', kind: 'ruin', point: [90, 40], open: true },
    { id: 'city_closed', name: '旧城', kind: 'town', point: [50, 25], open: false },
  ],
  roads: [{ key: 'route_a:0', start: 'city_a', end: 'rs_b', points: [[10, 10], [50, 20], [90, 40]] }],
  terrain: {
    land: [[[0, 0], [99, 0], [99, 49], [0, 49]]],
    rivers: [[[10, 25], [90, 25]]], mountains: [[[40, 15], [60, 15]]],
  },
};

describe('world map scene geometry', () => {
  it('builds batched static layers and instances only visible era nodes', () => {
    const geometry = createWorldMapGeometry(map);
    expect(geometry.group.children.map(child => child.name)).toEqual([
      'terrain-heightmap', 'road-network', 'river-layer', 'mountain-layer', 'map-node-instances',
    ]);
    expect(geometry).toMatchObject({ nodeInstances: 2, roadSegments: 2, staticDrawCalls: 5 });
    expect(geometry.nodes.count).toBe(2);
    geometry.dispose();
    expect(geometry.group.children).toHaveLength(0);
  });

  it('projects integer map points deterministically onto a raised 2.5D surface', () => {
    expect(mapPointToWorld(map, [0, 0])).toEqual([-10, terrainHeight(map, [0, 0]), 5]);
    expect(mapPointToWorld(map, [100, 50])).toEqual([10, terrainHeight(map, [100, 50]), -5]);
    expect(terrainHeight(map, [50, 15])).toBeGreaterThan(terrainHeight(map, [0, 49]));
  });
});
