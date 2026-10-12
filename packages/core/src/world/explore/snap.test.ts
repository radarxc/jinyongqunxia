import { describe, expect, it } from 'vitest';
import {
  EXPLORE_OPAQUE,
  EXPLORE_STANDABLE,
  exploreNodeAt,
  exploreNodeQ,
  exploreNodeR,
  getExploreGraph,
} from './graph';
import { ExploreMinHeap } from './heap';
import { snapExploreTarget, snapToStandable } from './snap';
import { fixtureMap, rectangle } from './__fixtures__/maps';

describe('explore target snapping', () => {
  it('snaps wall and water targets to the first r-q ordered cell in the start component', () => {
    const cells = rectangle(5, 3).map((cell) =>
      cell.q === 2 && cell.r === 1
        ? { ...cell, terrain: 1 }
        : cell.q === 3 && cell.r === 1
          ? { ...cell, terrain: 2 }
          : cell,
    );
    const graph = getExploreGraph(fixtureMap('snap-wall-water', 5, 3, cells), 0, 0, [], 0);
    const start = exploreNodeAt(graph, 0, 1);
    const wall = snapExploreTarget(graph, start, { q: 2, r: 1 });
    expect([exploreNodeQ(graph, wall as number), exploreNodeR(graph, wall as number)]).toEqual([
      2, 0,
    ]);
    const water = snapToStandable(graph, start, { q: 3, r: 1 });
    expect([exploreNodeQ(graph, water as number), exploreNodeR(graph, water as number)]).toEqual([
      3, 0,
    ]);
  });

  it('skips nearer cells in another undirected component and caps attempts at six', () => {
    const cells = rectangle(8, 1).map((cell) => (cell.q === 3 ? { ...cell, terrain: 1 } : cell));
    const graph = getExploreGraph(fixtureMap('snap-components', 8, 1, cells), 0, 0, [], 0);
    const start = exploreNodeAt(graph, 0, 0);
    const snapped = snapExploreTarget(graph, start, { q: 4, r: 0 });
    expect(snapped).not.toBe('REGION_PATH_BLOCKED');
    expect(exploreNodeQ(graph, snapped as number)).toBe(2);
    const occupied = new Set<number>();
    for (let node = 0; node < graph.nodeCount; node += 1)
      if (exploreNodeQ(graph, node) <= 2) occupied.add(node);
    expect(snapExploreTarget(graph, start, { q: 4, r: 0 }, occupied)).toBe('REGION_PATH_BLOCKED');
  });

  it('returns blocked when the seventh candidate would be the first in the start component', () => {
    const cells = [
      { q: 0, r: 4 },
      { q: 1, r: 4 },
      { q: 2, r: 4 },
      { q: 3, r: 4 },
      { q: 4, r: 3 },
      { q: 4, r: 2, height: 10 },
      { q: 4, r: 1, height: 10 },
      { q: 5, r: 1, height: 10 },
      { q: 3, r: 2, height: 10 },
      { q: 5, r: 2, height: 10 },
      { q: 3, r: 3, height: 10 },
    ];
    const graph = getExploreGraph(fixtureMap('snap-six', 6, 5, cells), 0, 0, [], 0);
    expect(snapExploreTarget(graph, exploreNodeAt(graph, 0, 4), { q: 4, r: 2 })).toBe(
      'REGION_PATH_BLOCKED',
    );
  });
});

describe('explore heap', () => {
  it('orders by f then h then r then q and grows beyond its initial capacity', () => {
    const graph = getExploreGraph(fixtureMap('heap', 4, 2, rectangle(4, 2)), 0, 0, [], 0);
    const f = new Int32Array(graph.nodeCount);
    const h = new Int32Array(graph.nodeCount);
    f.fill(5);
    h.fill(2);
    f[3] = 4;
    h[2] = 1;
    const heap = new ExploreMinHeap(graph, f, h, 1);
    for (const node of [7, 6, 5, 4, 3, 2, 1, 0]) heap.pushOrDecrease(node);
    expect(Array.from({ length: 8 }, () => heap.pop())).toEqual([3, 2, 0, 1, 4, 5, 6, 7]);
    expect(heap.pop()).toBe(-1);
  });

  it('restores heap order when an inserted node decreases its mutable keys', () => {
    const graph = getExploreGraph(fixtureMap('heap-decrease', 4, 1, rectangle(4, 1)), 0, 0, [], 0);
    const f = Int32Array.from([8, 6, 7, 5]);
    const h = Int32Array.from([0, 0, 0, 0]);
    const heap = new ExploreMinHeap(graph, f, h, 1);
    for (const node of [0, 1, 2, 3]) heap.pushOrDecrease(node);
    f[0] = 4;
    heap.pushOrDecrease(0);
    expect(Array.from({ length: 4 }, () => heap.pop())).toEqual([0, 3, 1, 2]);
  });
});

describe('explore source constraints', () => {
  it('uses no string interpolation keys, native division, clocks, or nondeterministic random', async () => {
    const sources = await Promise.all(
      ['graph.ts', 'astar.ts', 'heap.ts', 'snap.ts'].map(
        async (name) =>
          [
            name,
            await import('node:fs/promises').then(({ readFile }) =>
              readFile(new URL(name, import.meta.url), 'utf8'),
            ),
          ] as const,
      ),
    );
    for (const [name, source] of sources) {
      expect(source, name).not.toContain(' / ');
      expect(source, name).not.toMatch(
        /Math[.]random|Date|performance[.]now|Math[.](pow|exp|log)/u,
      );
      expect(source, name).not.toMatch(/\d+[.]\d+/u);
    }
    for (const [name, source] of sources.filter(
      ([name]) => name === 'graph.ts' || name === 'astar.ts',
    ))
      expect(source, name).not.toContain('${');
  });

  it('marks invalid slots opaque while blocked cells remain transparent', () => {
    const graph = getExploreGraph(
      fixtureMap('flags', 3, 1, [
        { q: 0, r: 0 },
        { q: 1, r: 0, blocked: true },
      ]),
      0,
      0,
      [],
      0,
    );
    expect(graph.flags[exploreNodeAt(graph, 1, 0)]! & EXPLORE_OPAQUE).toBe(0);
    expect(graph.flags[exploreNodeAt(graph, 1, 0)]! & EXPLORE_STANDABLE).toBe(0);
    expect(graph.flags[exploreNodeAt(graph, 2, 0)]! & EXPLORE_OPAQUE).toBe(EXPLORE_OPAQUE);
  });
});
