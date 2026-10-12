/// <reference types="node" />
// eslint-disable-next-line no-restricted-imports -- Test-only compiled RegionMap fixture.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { RegionMap } from '../region-types';
import { findPath, findPathToAny, forEachExploreEdge, type ExploreOccupied } from './astar';
import {
  exploreNodeAt,
  exploreNodeQ,
  exploreNodeR,
  getExploreGraph,
  type ExploreGraph,
} from './graph';
import { fixtureMap, rectangle, type FixtureCell } from './__fixtures__/maps';

const realFixture = JSON.parse(
  readFileSync(
    new URL('./__fixtures__/sc_00_changbai_cave.compiled.json', import.meta.url),
    'utf8',
  ),
) as { map: RegionMap };

function dijkstra(
  graph: ExploreGraph,
  start: number,
  goal: number,
  occupied: ExploreOccupied,
): number | null {
  const costs = new Int32Array(graph.nodeCount);
  costs.fill(2_147_483_647);
  costs[start] = 0;
  const done = new Uint8Array(graph.nodeCount);
  while (true) {
    let current = -1;
    let best = 2_147_483_647;
    for (let node = 0; node < graph.nodeCount; node += 1)
      if (done[node] === 0 && costs[node]! < best) {
        current = node;
        best = costs[node]!;
      }
    if (current < 0) return null;
    if (current === goal) return best;
    done[current] = 1;
    forEachExploreEdge(graph, current, (next, edgeCost) => {
      if (
        (occupied instanceof Uint8Array ? occupied[next] !== 0 : occupied.has(next)) ||
        done[next] !== 0
      )
        return;
      const cost = best + edgeCost;
      if (cost < costs[next]!) costs[next] = cost;
    });
  }
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return (value ^ (value >>> 14)) >>> 0;
  };
}

function randomMap(seed: number): { map: RegionMap; tier: number; occupied: Set<number> } {
  const next = mulberry32(seed);
  const width = 7;
  const height = 6;
  const cells: FixtureCell[] = [];
  const terrain = ['tr_pingdi', 'tr_shibi', 'tr_shenshui', 'tr_shengu', 'tr_jingji'] as const;
  for (let r = 0; r < height; r += 1)
    for (let q = 0; q < width; q += 1) {
      const sampled = next() % 5;
      const isolatedWater = sampled === 2 && (q - r + 12) % 3 !== 0 ? 0 : sampled;
      cells.push({
        q,
        r,
        terrain: (q === 0 && r === 0) || (q === width - 1 && r === height - 1) ? 0 : isolatedWater,
        height: next() % 7,
      });
    }
  const rampQ = next() % width;
  const rampR = next() % height;
  const map = fixtureMap(`random-${seed}`, width, height, cells, terrain, [
    { index: rampR * 32 + rampQ, dir: (next() % 6) as 0 | 1 | 2 | 3 | 4 | 5 },
  ]);
  const occupied = new Set<number>();
  for (let node = 1; node < width * height - 1; node += 1)
    if (next() % 11 === 0) occupied.add(node);
  return { map, tier: next() % 6, occupied };
}

function coordinates(graph: ExploreGraph, path: Int32Array): string[] {
  return [...path].map((node) => `${exploreNodeQ(graph, node)},${exploreNodeR(graph, node)}`);
}

describe('typed-array A star', () => {
  it('keeps the optimal cost when an open node receives a decrease-key', () => {
    const rows = [
      '32231223',
      '22231222',
      '31221113',
      '12321311',
      '21113213',
      '12231322',
      '33233313',
      '33111322',
    ];
    const blocked = new Set(['2,1', '6,1', '1,2', '5,2', '7,3', '2,5', '7,5', '1,6', '4,7']);
    const cells = rows.flatMap((row, r) =>
      [...row].map((cost, q) => ({
        q,
        r,
        terrain: Number(cost) - 1,
        blocked: blocked.has(`${q},${r}`),
      })),
    );
    const map = fixtureMap('decrease-key-regression', 8, 8, cells, [
      'tr_pingdi',
      'tr_huacong',
      'tr_jingji',
    ]);
    const graph = getExploreGraph(map, 0, 0, [], 0);
    const start = exploreNodeAt(graph, 0, 0);
    const goal = exploreNodeAt(graph, 7, 7);
    const result = findPath(graph, start, goal, new Set());
    expect(dijkstra(graph, start, goal, new Set())).toBe(23);
    expect(result?.cost).toBe(23);
  });

  it('matches brute-force Dijkstra on 300 fixed-seed maps and every returned step is legal', () => {
    for (let seed = 1; seed <= 300; seed += 1) {
      const fixture = randomMap(seed);
      const graph = getExploreGraph(fixture.map, fixture.tier, 0, [], 0);
      const start = exploreNodeAt(graph, 0, 0);
      const goal = exploreNodeAt(graph, graph.width - 1, graph.height - 1);
      const result = findPath(graph, start, goal, fixture.occupied);
      const expected = dijkstra(graph, start, goal, fixture.occupied);
      if (result === null) {
        expect(expected, `seed ${seed}`).toBeNull();
        continue;
      }
      expect(result.cost, `seed ${seed}`).toBe(expected);
      expect(result.path[0]).toBe(start);
      expect(result.path[result.path.length - 1]).toBe(goal);
      let cost = 0;
      for (let index = 1; index < result.path.length; index += 1) {
        const edges = new Map<number, number>();
        forEachExploreEdge(graph, result.path[index - 1]!, (target, edgeCost) =>
          edges.set(target, edgeCost),
        );
        expect(edges.has(result.path[index]!), `seed ${seed} step ${index}`).toBe(true);
        expect(fixture.occupied.has(result.path[index]!), `seed ${seed} occupied ${index}`).toBe(
          false,
        );
        cost += edges.get(result.path[index]!)!;
      }
      expect(cost).toBe(result.cost);
    }
  });

  it.each([
    [
      'flat tie',
      fixtureMap('gold-flat', 3, 3, rectangle(3, 3)),
      0,
      [0, 0],
      [2, 2],
      ['0,0', '1,0', '2,0', '2,1', '2,2'],
    ],
    [
      'ramp',
      fixtureMap(
        'gold-ramp',
        3,
        2,
        [
          ...rectangle(3, 2).filter((cell) => cell.q !== 1 || cell.r !== 0),
          { q: 1, r: 0, height: 5 },
        ],
        undefined,
        [{ index: 0, dir: 0 }],
      ),
      0,
      [0, 0],
      [2, 0],
      ['0,0', '1,0', '2,0'],
    ],
    ['compiled', realFixture.map, 2, [3, 4], [6, 5], ['3,4', '4,4', '5,4', '6,4', '6,5']],
  ] as const)(
    'locks deterministic path golden: %s',
    (_name, map, tier, startHex, goalHex, expected) => {
      const graph = getExploreGraph(map, tier, 0, [], 0);
      const result = findPath(
        graph,
        exploreNodeAt(graph, startHex[0], startHex[1]),
        exploreNodeAt(graph, goalHex[0], goalHex[1]),
        new Set(),
      );
      expect(result && coordinates(graph, result.path)).toEqual(expected);
    },
  );

  it('finds interaction endpoints in ranges one and three with blocked transparent and wall opaque', () => {
    const cells = rectangle(7, 3).map((cell) =>
      cell.q === 3 && cell.r === 1
        ? { ...cell, blocked: true }
        : cell.q === 3 && cell.r === 0
          ? { ...cell, terrain: 1 }
          : cell,
    );
    const map = fixtureMap('multi', 7, 3, cells);
    const graph = getExploreGraph(map, 0, 0, [], 0);
    const start = exploreNodeAt(graph, 0, 1);
    const npc = findPathToAny(graph, start, { q: 4, r: 1 }, 1, new Set());
    expect(npc).not.toBeNull();
    const npcEnd = npc!.path[npc!.path.length - 1]!;
    expect([exploreNodeQ(graph, npcEnd), exploreNodeR(graph, npcEnd)]).toEqual([3, 2]);
    const keeper = findPathToAny(graph, start, { q: 6, r: 1 }, 3, new Set());
    expect(keeper).not.toBeNull();
    const keeperEnd = keeper!.path[keeper!.path.length - 1]!;
    expect(
      Math.max(
        Math.abs(exploreNodeQ(graph, keeperEnd) - 6),
        Math.abs(exploreNodeR(graph, keeperEnd) - 1),
        Math.abs(exploreNodeQ(graph, keeperEnd) - 6 + exploreNodeR(graph, keeperEnd) - 1),
      ),
    ).toBeLessThanOrEqual(3);
    const counter = getExploreGraph(
      fixtureMap(
        'counter-los',
        7,
        1,
        rectangle(7, 1).map((cell) =>
          cell.q === 4 || cell.q === 5 ? { ...cell, blocked: true } : cell,
        ),
      ),
      0,
      0,
      [],
      0,
    );
    expect(findPathToAny(counter, 0, { q: 6, r: 0 }, 3, new Set())).not.toBeNull();
    const wall = getExploreGraph(
      fixtureMap(
        'wall-los',
        7,
        1,
        rectangle(7, 1).map((cell) =>
          cell.q === 4 || cell.q === 5 ? { ...cell, terrain: 1 } : cell,
        ),
      ),
      0,
      0,
      [],
      0,
    );
    expect(findPathToAny(wall, 0, { q: 6, r: 0 }, 3, new Set())).toBeNull();
  });

  it('rejects an occupied goal and a path whose winning route exceeds the tier deep-water run', () => {
    const map = fixtureMap(
      'water',
      6,
      1,
      rectangle(6, 1).map((cell) => (cell.q > 0 && cell.q < 5 ? { ...cell, terrain: 2 } : cell)),
    );
    const graph = getExploreGraph(map, 3, 0, [], 0);
    const start = 0;
    const goal = 5;
    expect(findPath(graph, start, goal, new Set([goal]))).toBeNull();
    expect(findPath(graph, start, goal, new Set())).toBeNull();
  });
});
