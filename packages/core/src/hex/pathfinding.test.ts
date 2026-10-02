import { describe, expect, it } from 'vitest';
import {
  evaluateStep, findHexPath, hexDisk, hexKey, jumpDistance, movementPoints,
  type HexPathCell, type HexPathQuery,
} from './index';

function query(seed = 0): HexPathQuery {
  const cells = hexDisk({ q: 0, r: 0 }, 4).map((pos, index) => ({ ...pos, height: 0,
    moveCost: 1 + Number(((index * 1103515245 + seed) >>> 0) % 5 === 0),
    standable: ((index * 2654435761 + seed) >>> 0) % 13 !== 0 || (pos.q === 0 && pos.r === 0),
    narrow: false, dangerous: ((index + seed) % 11) === 0 }));
  return { cells, units: [], mover: { id: 'u', qgTier: 2, jump: 2, move: 20 },
    start: { q: 0, r: 0 }, maxCost: 20 };
}

function bruteCost(input: HexPathQuery, goal: { readonly q: number; readonly r: number }): number | null {
  const cells = new Map(input.cells.map((cell) => [hexKey(cell), cell]));
  const costs = new Map<string, number>([[hexKey(input.start), 0]]);
  const pending: HexPathCell[] = [cells.get(hexKey(input.start))!];
  while (pending.length > 0) {
    pending.sort((left, right) => costs.get(hexKey(right))! - costs.get(hexKey(left))!);
    const current = pending.pop()!; const cost = costs.get(hexKey(current))!;
    for (const next of cells.values()) {
      const edge = evaluateStep(input, current, next);
      if (!edge.allowed) continue;
      const candidate = cost + edge.cost; const key = hexKey(next);
      if (candidate >= (costs.get(key) ?? Number.MAX_SAFE_INTEGER)) continue;
      costs.set(key, candidate); pending.push(next);
    }
  }
  return costs.get(hexKey(goal)) ?? null;
}

describe('hex pathfinding', () => {
  it('derives movement and jump from qinggong anchors', () => {
    expect([movementPoints(98), movementPoints(104, { buffMoveFlat: 1 }),
      movementPoints(88, { heavyArmorPenalty: 1 })]).toEqual([6, 7, 5]);
    expect(jumpDistance(98)).toBe(3);
  });

  it('takes the complete stable tie-break on a symmetric map', () => {
    const input = query();
    const result = findHexPath({ ...input, cells: input.cells.map(cell => ({ ...cell, moveCost: 1,
      standable: true, dangerous: false })), goal: { q: 2, r: -1 } });
    expect(result?.path).toEqual([{ q: 0, r: 0 }, { q: 1, r: -1 }, { q: 2, r: -1 }]);
  });

  it('charges leaving hostile ZOC and lets qg3 reduce it', () => {
    const base = { ...query(), cells: hexDisk({ q: 0, r: 0 }, 3).map(pos => ({ ...pos, height: 0,
      moveCost: 1, standable: true, narrow: false, dangerous: false })),
    start: { q: 1, r: 0 }, goal: { q: -1, r: 0 }, maxCost: 4, units: [
      { id: 'enemy', q: 0, r: 0, relation: 'hostile' as const, active: true, exertsZoc: true },
    ] };
    expect(findHexPath({ ...base, mover: { id: 'u', qgTier: 0, jump: 0, move: 4 } })).toBeNull();
    expect(findHexPath({ ...base, mover: { id: 'u', qgTier: 3, jump: 3, move: 4 } })?.cost).toBe(3);
    expect(findHexPath({ ...base, mover: { id: 'u', qgTier: 0, jump: 0, move: 4,
      ignoreZoc: true } })?.cost).toBe(3);
  });

  it('matches an independent brute Dijkstra oracle for 200 fixed seeded maps', () => {
    for (let seed = 0; seed < 200; seed += 1) {
      const input = query(seed); const goal = input.cells[(seed * 17 + 7) % input.cells.length]!;
      const expected = bruteCost(input, goal);
      expect(findHexPath({ ...input, goal })?.cost ?? null, `seed=${seed},cell=${goal.q},${goal.r}`)
        .toBe(expected !== null && expected <= (input.maxCost ?? 20) ? expected : null);
    }
  });

  it('is byte-stable when input cells are reversed', () => {
    const input = query(91); const goal = { q: 3, r: -2 };
    expect(JSON.stringify(findHexPath({ ...input, goal }))).toBe(JSON.stringify(findHexPath({
      ...input, cells: [...input.cells].reverse(), goal })));
  });
});
