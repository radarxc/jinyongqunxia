import { floorDivInt } from '@tianshu/shared';
import { FIXTURE_KINDS } from '../fixtures';
import { hexCentreMm } from '../frame';
import type { FixtureTuple, RectMm } from '../types';

export interface InteriorHex {
  readonly q: number;
  readonly r: number;
}
const CLEARANCE_MM = 250;
const CLEARANCE_SQUARED = CLEARANCE_MM * CLEARANCE_MM;
const NEIGHBOURS: readonly (readonly [number, number])[] = [
  [1, 0],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [0, -1],
  [1, -1],
];
const HEIGHT_BY_INDEX: ReadonlyMap<number, number> = new Map(
  FIXTURE_KINDS.map((fixture) => [fixture.idx, fixture.hMm]),
);

function pointInRect(x: number, z: number, rect: RectMm): boolean {
  return x >= rect[0] && z >= rect[1] && x < rect[2] && z < rect[3];
}
function pointInFloors(x: number, z: number, floors: readonly RectMm[]): boolean {
  return floors.some((floor) => pointInRect(x, z, floor));
}
function distanceSquaredToSegment(
  x: number,
  z: number,
  vertical: boolean,
  fixed: number,
  start: number,
  end: number,
): number {
  const along = vertical ? z : x;
  const across = (vertical ? x : z) - fixed;
  const beyond = along < start ? along - start : along > end ? along - end : 0;
  return across * across + beyond * beyond;
}
function exposedEdgeTooClose(
  x: number,
  z: number,
  floors: readonly RectMm[],
  vertical: boolean,
  fixed: number,
  start: number,
  end: number,
  outsideDelta: -1 | 0,
): boolean {
  const cuts = [start, end];
  for (const floor of floors) {
    const low = vertical ? floor[1] : floor[0];
    const high = vertical ? floor[3] : floor[2];
    if (low > start && low < end) cuts.push(low);
    if (high > start && high < end) cuts.push(high);
  }
  cuts.sort((a, b) => a - b);
  for (let index = 1; index < cuts.length; index += 1) {
    const low = cuts[index - 1]!;
    const high = cuts[index]!;
    if (low === high) continue;
    const middle = floorDivInt(low + high, 2);
    const probeX = vertical ? fixed + outsideDelta : middle;
    const probeZ = vertical ? middle : fixed + outsideDelta;
    if (
      !pointInFloors(probeX, probeZ, floors) &&
      distanceSquaredToSegment(x, z, vertical, fixed, low, high) < CLEARANCE_SQUARED
    )
      return true;
  }
  return false;
}
function hasFloorClearance(x: number, z: number, floors: readonly RectMm[]): boolean {
  if (!pointInFloors(x, z, floors)) return false;
  for (const floor of floors) {
    if (
      exposedEdgeTooClose(x, z, floors, true, floor[0], floor[1], floor[3], -1) ||
      exposedEdgeTooClose(x, z, floors, true, floor[2], floor[1], floor[3], 0) ||
      exposedEdgeTooClose(x, z, floors, false, floor[1], floor[0], floor[2], -1) ||
      exposedEdgeTooClose(x, z, floors, false, floor[3], floor[0], floor[2], 0)
    )
      return false;
  }
  return true;
}
function fixtureBounds(item: FixtureTuple): RectMm {
  const odd = item[5] === 1 || item[5] === 3;
  const width = odd ? item[4] : item[3];
  const depth = odd ? item[3] : item[4];
  const x0 = item[1] - floorDivInt(width, 2);
  const z0 = item[2] - floorDivInt(depth, 2);
  return [x0, z0, x0 + width, z0 + depth];
}
function blocksHex(x: number, z: number, item: FixtureTuple): boolean {
  if (item[6] === 0 || item[3] === 0 || item[4] === 0) return false;
  const height = HEIGHT_BY_INDEX.get(item[0]);
  if (height !== undefined && height <= 250) return false;
  const bounds = fixtureBounds(item);
  const dx = x < bounds[0] ? bounds[0] - x : x > bounds[2] ? x - bounds[2] : 0;
  const dz = z < bounds[1] ? bounds[1] - z : z > bounds[3] ? z - bounds[3] : 0;
  return dx * dx + dz * dz < CLEARANCE_SQUARED;
}

/** C6 centre rule: floor-union inset and 250 mm clearance from blocking fixtures. */
export function isInteriorHexWalkable(
  floors: readonly RectMm[],
  fixtures: readonly FixtureTuple[],
  hex: InteriorHex,
): boolean {
  const [x, z] = hexCentreMm(hex.q, hex.r);
  return hasFloorClearance(x, z, floors) && !fixtures.some((item) => blocksHex(x, z, item));
}

function edgeMidpointInFloor(
  floors: readonly RectMm[],
  from: InteriorHex,
  to: InteriorHex,
): boolean {
  const a = hexCentreMm(from.q, from.r);
  const b = hexCentreMm(to.q, to.r);
  return pointInFloors(floorDivInt(a[0] + b[0], 2), floorDivInt(a[1] + b[1], 2), floors);
}

/** Deterministic breadth-first C6 reachability in axial neighbour order. */
export function reachableInteriorHexes(
  floors: readonly RectMm[],
  fixtures: readonly FixtureTuple[],
  start: InteriorHex,
): readonly InteriorHex[] {
  if (!isInteriorHexWalkable(floors, fixtures, start)) return [];
  const result: InteriorHex[] = [start];
  const seen = new Set<string>([`${start.q},${start.r}`]);
  for (let cursor = 0; cursor < result.length; cursor += 1) {
    const current = result[cursor]!;
    for (const [dq, dr] of NEIGHBOURS) {
      const next: InteriorHex = { q: current.q + dq, r: current.r + dr };
      const key = `${next.q},${next.r}`;
      if (
        seen.has(key) ||
        !isInteriorHexWalkable(floors, fixtures, next) ||
        !edgeMidpointInFloor(floors, current, next)
      )
        continue;
      seen.add(key);
      result.push(next);
    }
  }
  return result;
}
