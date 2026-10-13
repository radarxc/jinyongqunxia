import { describe, expect, it } from 'vitest';
import type { TownBuildingPlan } from '../../schemas/region-map';
import { hexCentreMm } from '../town-plan';
import { HEX_DIRECTIONS } from './frame';
import {
  canOpenDoorThresholdEdge,
  canTraverseBuildingEdge,
  isInteriorPoint,
  pointInFootprint,
} from './geometry';
import type { CellState } from './types';

const plan: TownBuildingPlan = {
  id: 'bi_box',
  archetype: 'house',
  kit: 'song_dali',
  seed: 1,
  footprint: [0, 0, 6_000, 5_000],
  yaw: 0,
  storeys: 1,
  roof: [2, 3_000, 4_500],
  entrances: [[0, 0, 1_400]],
  enterable: true,
  elev: [0, 150],
  floors: [[-2_700, -2_200, 2_700, 2_200]],
  floorY: [150],
  fixtures: [],
  signage: null,
  facility: 'none',
};
const cell = (q: number, r: number, blocked = false): CellState => ({
  rawQ: q,
  rawR: r,
  q,
  r,
  key: `${q},${r}`,
  terrain: 'tr_shinei',
  surface: 'wood_floor',
  height: 0,
  blocked,
  building: 1,
  outdoorWalkable: false,
});
function mulberry32(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let next = Math.imul(value ^ (value >>> 15), value | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 0x1_0000_0000;
  };
}
function placedCell(q: number, r: number, current: TownBuildingPlan): CellState {
  const [x, z] = hexCentreMm(q, r);
  const building = pointInFootprint(current, x, z) ? 1 : 0;
  return { ...cell(q, r), building, terrain: building === 0 ? 'tr_pingdi' : 'tr_shinei' };
}

describe('C6 interior walk geometry', () => {
  it('uses cell centres with a 250 mm solid-edge clearance for a 6 x 5 box', () => {
    let count = 0;
    for (let q = -8; q <= 8; q += 1)
      for (let r = -5; r <= 5; r += 1) {
        const x = Math.round(577.35 * (2 * q + r));
        const z = 1_000 * r;
        if (isInteriorPoint(plan, x, z)) count += 1;
      }
    // r=-1,0,1 have 4,5,4 accepted centres respectively: 13 total.
    expect(count).toBe(13);
  });

  it('connects the 1.4 m door pair while rejecting an edge whose midpoint is wall', () => {
    const inside = cell(-1, 2);
    const doorway = { ...cell(-1, 3), building: 0, outdoorWalkable: true };
    const wallInside = cell(0, 2);
    const wallOutside = { ...cell(0, 3), building: 0, outdoorWalkable: true };
    expect(canTraverseBuildingEdge(inside, doorway, [plan])).toBe(true);
    expect(canTraverseBuildingEdge(wallInside, wallOutside, [plan])).toBe(false);
  });

  it('rejects offset and folded threshold steps through solid wall', () => {
    const outside = { ...cell(-1, 3), building: 0, outdoorWalkable: true };
    const straight = cell(-1, 2, true);
    const offset = cell(0, 2, true);
    expect(canOpenDoorThresholdEdge(plan, outside, straight)).toBe(true);
    expect(canOpenDoorThresholdEdge(plan, outside, offset)).toBe(false);
    expect(canOpenDoorThresholdEdge(plan, straight, offset)).toBe(false);
    expect(canTraverseBuildingEdge(outside, offset, [plan])).toBe(false);
  });

  it('keeps C6 door edges open and adjacent solid wall edges closed across yaw and offsets', () => {
    const random = mulberry32(0x114c600d);
    const offsets = [-287, 0, 311] as const;
    for (const yaw of [0, 1, 2, 3] as const)
      for (const offset of offsets) {
        const shifted: TownBuildingPlan = {
          ...plan,
          footprint: [offset, -offset, 6_000, 5_000],
          yaw,
        };
        let openDoorEdges = 0;
        let closedWallEdges = 0;
        for (let sample = 0; sample < 80; sample += 1) {
          const q = Math.trunc(random() * 18) - 9;
          const r = Math.trunc(random() * 12) - 6;
          const from = placedCell(q, r, shifted);
          for (const [dq, dr] of HEX_DIRECTIONS) {
            const to = placedCell(q + dq, r + dr, shifted);
            if (from.building === to.building) continue;
            const traverses = canTraverseBuildingEdge(from, to, [shifted]);
            if (traverses) openDoorEdges += 1;
            else closedWallEdges += 1;
          }
        }
        expect(openDoorEdges, `yaw=${yaw}, offset=${offset}`).toBeGreaterThan(0);
        expect(closedWallEdges, `yaw=${yaw}, offset=${offset}`).toBeGreaterThan(0);
      }
  });
});
