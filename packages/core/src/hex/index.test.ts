import { describe, expect, it } from 'vitest';
import {
  HEX_DIRECTIONS, hexCone, hexDisk, hexDistance, hexLine, hexLineBetween, hexNeighbor, hexRing,
} from './index';

const ORIGIN = { q: 0, r: 0 } as const;

describe('hex geometry', () => {
  it('measures the H-01 axial distance exactly', () => {
    expect(hexDistance({ q: 0, r: 0 }, { q: 3, r: -2 })).toBe(3);
  });

  it('uses the canonical six pointy-top directions', () => {
    expect(HEX_DIRECTIONS).toEqual([
      { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
      { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 },
    ]);
    expect(HEX_DIRECTIONS.map((_, direction) =>
      hexNeighbor(ORIGIN, direction as 0 | 1 | 2 | 3 | 4 | 5))).toEqual(HEX_DIRECTIONS);
  });

  it.each([[0, 1], [1, 7], [2, 19], [3, 37]] as const)(
    'enumerates a radius %i disk with %i cells in stable order', (radius, count) => {
      const cells = hexDisk(ORIGIN, radius);
      expect(cells).toHaveLength(count);
      expect(cells[0]).toEqual(ORIGIN);
      expect(cells.every((cell) => hexDistance(ORIGIN, cell) <= radius)).toBe(true);
      expect(cells).toEqual([...cells].sort((left, right) =>
        hexDistance(ORIGIN, left) - hexDistance(ORIGIN, right)
        || left.r - right.r || left.q - right.q));
    },
  );

  it.each([[1, 6], [2, 12], [3, 18]] as const)(
    'enumerates a radius %i ring with %i cells', (radius, count) => {
      const cells = hexRing({ q: 4, r: -2 }, radius);
      expect(cells).toHaveLength(count);
      expect(cells.every((cell) => hexDistance({ q: 4, r: -2 }, cell) === radius)).toBe(true);
    },
  );

  it('enumerates straight lines without the origin', () => {
    expect(hexLine(ORIGIN, 1, 3)).toEqual([
      { q: 1, r: -1 }, { q: 2, r: -2 }, { q: 3, r: -3 },
    ]);
  });

  it.each([[60, 7], [120, 15]] as const)(
    'enumerates the six-direction radius-three %i-degree cone', (angle, count) => {
      const cells = hexCone(ORIGIN, 3, angle, { dirCount: 6, dir: 0 });
      expect(cells).toHaveLength(count);
      expect(cells.every((cell) => hexDistance(ORIGIN, cell) <= 3)).toBe(true);
    },
  );

  it.each([[1, 1, 3], [2, 4, 8], [3, 7, 15], [4, 12, 24]] as const)(
    'rotates radius %i cones with stable 60/120-degree counts', (radius, narrow, wide) => {
      for (let direction = 0; direction < 6; direction += 1) {
        expect(hexCone(ORIGIN, radius, 60, { dirCount: 6, dir: direction as 0 | 1 | 2 | 3 | 4 | 5 }))
          .toHaveLength(narrow);
        expect(hexCone(ORIGIN, radius, 120, { dirCount: 6, dir: direction as 0 | 1 | 2 | 3 | 4 | 5 }))
          .toHaveLength(wide);
      }
    },
  );

  it.each([[60, 9], [120, 13]] as const)(
    'enumerates the twelve-direction radius-three half-aim %i-degree cone', (angle, count) => {
      expect(hexCone(ORIGIN, 3, angle, { dirCount: 12, dir: 1 })).toHaveLength(count);
    },
  );

  it('rejects non-integer and unbounded geometry inputs', () => {
    expect(() => hexDistance({ q: 0.5, r: 0 }, ORIGIN)).toThrow('HEX_COORD_INTEGER');
    expect(() => hexDisk(ORIGIN, 65)).toThrow('HEX_RADIUS');
  });

  it('uses one stable boundary cell in either line direction', () => {
    const from = { q: 0, r: 0 }; const to = { q: 3, r: -1 };
    const forward = hexLineBetween(from, to);
    const reverse = hexLineBetween(to, from);
    expect(forward).toHaveLength(2);
    expect([...forward].sort((a, b) => a.r - b.r || a.q - b.q))
      .toEqual([...reverse].sort((a, b) => a.r - b.r || a.q - b.q));
  });

  it('keeps every short integer line symmetric as a cell set', () => {
    const coords = hexDisk(ORIGIN, 4);
    for (const from of coords) for (const to of coords) {
      const order = (left: typeof from, right: typeof to) => left.r - right.r || left.q - right.q;
      expect([...hexLineBetween(from, to)].sort(order), `${from.q},${from.r}->${to.q},${to.r}`)
        .toEqual([...hexLineBetween(to, from)].sort(order));
    }
  });
});
