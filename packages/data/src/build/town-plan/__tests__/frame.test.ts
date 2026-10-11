import { describe, expect, it } from 'vitest';
import {
  entranceSide, hexCentreMm, localToWorldQuarter, planningPointMm, planningRectCentreMm,
  worldSide, worldToLocalQuarter, yawFromEntranceSide,
} from '../frame';
import type { LocalSide } from '../types';

function mulberry32(seed: number): () => number {
  let value = seed;
  return () => {
    value = value + 0x6d2b79f5 | 0;
    let word = Math.imul(value ^ value >>> 15, 1 | value);
    word ^= word + Math.imul(word ^ word >>> 7, 61 | word);
    return (word ^ word >>> 14) >>> 0;
  };
}

describe('town planning frame', () => {
  it('converts one-metre planning cells to world millimetres', () => {
    const frame = { heightCells: 80, originXMm: -2_000, originZMm: 5_000 };
    expect(planningPointMm(frame, 3, 7)).toEqual([1_000, 78_000]);
    expect(planningRectCentreMm(frame, [3, 7], [5, 4])).toEqual([3_500, 76_000]);
  });

  it('round-trips 10,000 integer points exactly under every quarter turn', () => {
    const next = mulberry32(0x51a7c0de);
    for (let index = 0; index < 10_000; index += 1) {
      const x = next() % 2_000_001 - 1_000_000;
      const z = next() % 2_000_001 - 1_000_000;
      for (const yaw of [0, 1, 2, 3] as const) {
        const world = localToWorldQuarter(x, z, yaw);
        expect(worldToLocalQuarter(world[0], world[1], yaw)).toEqual([x, z]);
      }
    }
  });

  it('maps the local front normal to S, W, N and E', () => {
    const expected = [0, 1, 2, 3] as const;
    for (const yaw of expected) {
      expect(worldSide(0, yaw)).toBe(expected[yaw]);
      expect(yawFromEntranceSide(yaw)).toBe(yaw);
    }
  });

  it('recognises outside entrance edges in S, W, N, E order', () => {
    const origin = [10, 20] as const;
    const size = [6, 5] as const;
    const cases: readonly [readonly [number, number], LocalSide][] = [
      [[13, 19], 0], [[9, 22], 1], [[13, 25], 2], [[16, 22], 3],
    ];
    for (const [entrance, side] of cases) expect(entranceSide(origin, size, entrance)).toBe(side);
  });

  it('matches the render regionHexWorld formula within one millimetre', () => {
    const samples = [[0, 0], [1, 0], [0, 1], [-48, 1], [82, 96], [128, -64]] as const;
    for (const [q, r] of samples) {
      const [xMm, zMm] = hexCentreMm(q, r);
      const renderX = Math.sqrt(3) * (2 / 3) * (q + r / 2) * 1_000;
      expect(Math.abs(xMm - renderX)).toBeLessThanOrEqual(1);
      expect(zMm).toBe(r * 1_000);
    }
  });

  it('rejects an entrance inside the footprint', () => {
    expect(() => entranceSide([0, 0], [4, 4], [2, 2]))
      .toThrow('TOWN_PLAN_ENTRANCE_NOT_ON_OUTSIDE_EDGE');
  });

  it('rejects a diagonal cell outside two footprint edges', () => {
    expect(() => entranceSide([0, 0], [4, 4], [-1, -1]))
      .toThrow('TOWN_PLAN_ENTRANCE_NOT_ON_OUTSIDE_EDGE');
  });
});
