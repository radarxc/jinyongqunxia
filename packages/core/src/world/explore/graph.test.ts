/// <reference types="node" />
// eslint-disable-next-line no-restricted-imports -- Test-only compiled RegionMap fixture.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { hexKey } from '../../hex';
import { decodeRegionMap, terrainMoveCost, terrainStandable } from '../region-codec';
import { regionEdges } from '../region-runtime';
import type { RegionDynamicTileState, RegionMap } from '../region-types';
import { forEachExploreEdge } from './astar';
import {
  EXPLORE_BLOCKED,
  EXPLORE_OPAQUE,
  EXPLORE_STANDABLE,
  getExploreGraph,
  exploreNodeAt,
} from './graph';
import { exploreNodeQ, exploreNodeR } from './graph';
import { fixtureMap, rectangle } from './__fixtures__/maps';

const realFixture = JSON.parse(
  readFileSync(
    new URL('./__fixtures__/sc_00_changbai_cave.compiled.json', import.meta.url),
    'utf8',
  ),
) as { map: RegionMap };

function oldEdges(
  map: RegionMap,
  tier: number,
  swim: number,
  q: number,
  r: number,
  dynamicTiles: readonly RegionDynamicTileState[] = [],
) {
  const decoded = decodeRegionMap(map, tier, swim);
  const dynamic = new Map(dynamicTiles.map((tile) => [hexKey(tile), tile]));
  const overlaid = decoded.cells.map((cell) => {
    const tile = dynamic.get(hexKey(cell));
    return tile
      ? {
          ...cell,
          terrainId: tile.terrainId,
          height: tile.height,
          moveCost: terrainMoveCost(tile.terrainId, tier),
          standable: terrainStandable(tile.terrainId, tier, swim),
        }
      : cell;
  });
  const cells = new Map(overlaid.map((cell) => [`${cell.q},${cell.r}`, cell]));
  const from = cells.get(`${q},${r}`);
  if (!from) return [];
  const context = {
    query: {
      cells: overlaid,
      units: [],
      start: from,
      mover: { id: 'player', qgTier: tier, jump: tier, move: Number.MAX_SAFE_INTEGER },
    },
    cells,
    ramps: decoded.ramps,
  };
  return regionEdges(context, from).map((edge) => [edge.target.q, edge.target.r, edge.cost]);
}

function graphEdges(
  map: RegionMap,
  tier: number,
  swim: number,
  q: number,
  r: number,
  dynamicTiles: readonly RegionDynamicTileState[] = [],
) {
  const graph = getExploreGraph(map, tier, swim, dynamicTiles, 0);
  const result: number[][] = [];
  forEachExploreEdge(graph, exploreNodeAt(graph, q, r), (target, cost) => {
    result.push([exploreNodeQ(graph, target), exploreNodeR(graph, target), cost]);
  });
  return result;
}

describe('explore graph cache and edge authority', () => {
  it('caches by map identity, tier, swim, and dynamic revision', () => {
    const map = fixtureMap('cache', 2, 1, rectangle(2, 1));
    const first = getExploreGraph(map, 0, 0, [], 1);
    expect(getExploreGraph(map, 0, 0, [], 1)).toBe(first);
    expect(getExploreGraph(map, 0, 0, [], 2)).not.toBe(first);
    expect(getExploreGraph(map, 1, 0, [], 1)).not.toBe(first);
    expect(getExploreGraph(map, 0, 1, [], 1)).not.toBe(first);
  });

  it('overlays dynamic terrain and height while blocked stays transparent and unstandable', () => {
    const map = fixtureMap('overlay', 3, 1, [
      { q: 0, r: 0 },
      { q: 1, r: 0, blocked: true },
      { q: 2, r: 0, terrain: 1 },
    ]);
    const graph = getExploreGraph(map, 0, 0, [{ q: 0, r: 0, terrainId: 'tr_shibi', height: 4 }], 1);
    const dynamic = exploreNodeAt(graph, 0, 0);
    const blocked = exploreNodeAt(graph, 1, 0);
    const wall = exploreNodeAt(graph, 2, 0);
    expect(graph.heights[dynamic]).toBe(4);
    expect(graph.flags[dynamic]! & (EXPLORE_OPAQUE | EXPLORE_STANDABLE)).toBe(EXPLORE_OPAQUE);
    expect(graph.flags[blocked]! & (EXPLORE_BLOCKED | EXPLORE_OPAQUE | EXPLORE_STANDABLE)).toBe(
      EXPLORE_BLOCKED,
    );
    expect(graph.flags[wall]! & EXPLORE_OPAQUE).toBe(EXPLORE_OPAQUE);
  });

  it('lets a dynamic overlay on a static blocked cell follow query(): standable by new terrain', () => {
    // 3x1: the centre is statically blocked, then dynamically overlaid as flat ground.
    const map = fixtureMap(
      'dynamic-blocked',
      3,
      1,
      rectangle(3, 1).map((cell) => (cell.q === 1 ? { ...cell, blocked: true } : cell)),
    );
    const dynamic = [{ q: 1, r: 0, terrainId: 'tr_pingdi' as const, height: 0 }];
    const graph = getExploreGraph(map, 0, 0, dynamic, 0);
    const node = exploreNodeAt(graph, 1, 0);
    expect(graph.flags[node]! & EXPLORE_BLOCKED).toBe(0);
    expect(graph.flags[node]! & EXPLORE_STANDABLE).toBe(EXPLORE_STANDABLE);
    expect(graph.flags[node]! & EXPLORE_OPAQUE).toBe(0);
    expect(graphEdges(map, 0, 0, 0, 0, dynamic)).toEqual([[1, 0, 1]]);
    expect(oldEdges(map, 0, 0, 0, 0, dynamic)).toEqual([[1, 0, 1]]);
    // An opaque dynamic terrain on a blocked cell is opaque and unstandable, as in query().
    const wall = getExploreGraph(map, 0, 0, [{ q: 1, r: 0, terrainId: 'tr_shibi', height: 4 }], 1);
    expect(wall.flags[exploreNodeAt(wall, 1, 0)]! & (EXPLORE_OPAQUE | EXPLORE_STANDABLE)).toBe(
      EXPLORE_OPAQUE,
    );
    // Without the overlay the static blocked centre stays see-through and unstandable (a fresh map
    // object: graphs are cached per map and dynamic revision).
    const plainMap = fixtureMap(
      'dynamic-blocked-plain',
      3,
      1,
      rectangle(3, 1).map((cell) => (cell.q === 1 ? { ...cell, blocked: true } : cell)),
    );
    const plain = getExploreGraph(plainMap, 0, 0, [], 0);
    expect(plain.flags[exploreNodeAt(plain, 1, 0)]! & (EXPLORE_BLOCKED | EXPLORE_STANDABLE)).toBe(
      EXPLORE_BLOCKED,
    );
    expect(graphEdges(plainMap, 0, 0, 0, 0)).toEqual([]);
    expect(oldEdges(plainMap, 0, 0, 0, 0)).toEqual([]);
  });

  it('matches regionEdges after a dynamic terrain and height overlay', () => {
    // Includes statically blocked cells, one of them overlaid dynamically.
    const map = fixtureMap(
      'dynamic-edges',
      4,
      2,
      rectangle(4, 2).map((cell) =>
        (cell.q === 3 && cell.r === 0) || (cell.q === 0 && cell.r === 1)
          ? { ...cell, blocked: true }
          : cell,
      ),
    );
    const dynamic = [
      { q: 1, r: 0, terrainId: 'tr_jingji' as const, height: 1 },
      { q: 2, r: 1, terrainId: 'tr_shenshui' as const, height: 0 },
      { q: 3, r: 0, terrainId: 'tr_pingdi' as const, height: 0 },
    ];
    for (const cell of decodeRegionMap(map, 3, 0).cells)
      expect(graphEdges(map, 3, 0, cell.q, cell.r, dynamic)).toEqual(
        oldEdges(map, 3, 0, cell.q, cell.r, dynamic),
      );
  });

  it('builds a complete 219 by 160 multi-chunk performance fixture', () => {
    const map = fixtureMap('perf', 219, 160, rectangle(219, 160));
    const decoded = decodeRegionMap(map, 0, 0);
    expect(map.bounds).toEqual({ qMin: 0, qMax: 218, rMin: 0, rMax: 159 });
    expect(map.chunks).toHaveLength(35);
    expect(decoded.cells).toHaveLength(35_040);
    expect(decoded.cells[decoded.cells.length - 1]).toMatchObject({ q: 218, r: 159 });
  });

  it.each([
    ['synthetic flat', fixtureMap('flat', 5, 4, rectangle(5, 4)), 0],
    [
      'synthetic ramp and gap',
      fixtureMap(
        'ramp-gap',
        5,
        2,
        [
          ...rectangle(5, 2),
          { q: 1, r: 0, terrain: 3 },
          { q: 2, r: 0, terrain: 3 },
          { q: 1, r: 1, height: 5 },
        ],
        undefined,
        [{ index: 32, dir: 0 }],
      ),
      3,
    ],
    ['compiled changbai cave', realFixture.map, 2],
  ] as const)('matches regionEdges on every valid cell: %s', (_name, map, tier) => {
    const decoded = decodeRegionMap(map, tier, 0);
    for (const cell of decoded.cells)
      expect(graphEdges(map, tier, 0, cell.q, cell.r)).toEqual(
        oldEdges(map, tier, 0, cell.q, cell.r),
      );
  });
});
