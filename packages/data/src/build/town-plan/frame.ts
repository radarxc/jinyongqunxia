import { floorDivInt } from '@tianshu/shared';
import type { LocalSide, PlanningFrame, Yaw4 } from './types';

const CELL_MM = 1_000;

function assertYaw(yaw: Yaw4): void {
  if (yaw !== 0 && yaw !== 1 && yaw !== 2 && yaw !== 3) {
    throw new RangeError('TOWN_PLAN_INVALID_YAW');
  }
}

function roundDivInt(numerator: number, denominator: number): number {
  return floorDivInt(numerator * 2 + denominator, denominator * 2);
}

export function planningPointMm(
  frame: PlanningFrame, xCell: number, zCell: number,
): readonly [xMm: number, zMm: number] {
  return [
    frame.originXMm + xCell * CELL_MM,
    frame.originZMm + (frame.heightCells - zCell) * CELL_MM,
  ];
}

export function planningRectCentreMm(
  frame: PlanningFrame,
  originCell: readonly [x: number, z: number],
  sizeCells: readonly [w: number, h: number],
): readonly [xMm: number, zMm: number] {
  const xTwice = frame.originXMm * 2 + (originCell[0] * 2 + sizeCells[0]) * CELL_MM;
  const zTwice = frame.originZMm * 2
    + (frame.heightCells * 2 - originCell[1] * 2 - sizeCells[1]) * CELL_MM;
  return [floorDivInt(xTwice, 2), floorDivInt(zTwice, 2)];
}

export function localToWorldQuarter(
  xMm: number, zMm: number, yaw: Yaw4,
): readonly [xMm: number, zMm: number] {
  assertYaw(yaw);
  switch (yaw) {
    case 0: return [xMm, zMm];
    case 1: return [-zMm, xMm];
    case 2: return [-xMm, -zMm];
    case 3: return [zMm, -xMm];
  }
}

export function worldToLocalQuarter(
  xMm: number, zMm: number, yaw: Yaw4,
): readonly [xMm: number, zMm: number] {
  assertYaw(yaw);
  switch (yaw) {
    case 0: return [xMm, zMm];
    case 1: return [zMm, -xMm];
    case 2: return [-xMm, -zMm];
    case 3: return [-zMm, xMm];
  }
}

export function worldSide(localSide: LocalSide, yaw: Yaw4): LocalSide {
  const sum = localSide + yaw;
  return (sum >= 4 ? sum - 4 : sum) as LocalSide;
}

export function yawFromEntranceSide(side: LocalSide): Yaw4 {
  return side;
}

export function entranceSide(
  originCell: readonly [x: number, z: number],
  sizeCells: readonly [w: number, h: number],
  entranceCell: readonly [x: number, z: number],
): LocalSide {
  const [x, z] = entranceCell;
  const [ox, oz] = originCell;
  const [w, h] = sizeCells;
  if (z < oz && x >= ox && x < ox + w) return 0;
  if (x < ox && z >= oz && z < oz + h) return 1;
  if (z >= oz + h && x >= ox && x < ox + w) return 2;
  if (x >= ox + w && z >= oz && z < oz + h) return 3;
  throw new RangeError('TOWN_PLAN_ENTRANCE_NOT_ON_OUTSIDE_EDGE');
}

export function hexCentreMm(q: number, r: number): readonly [xMm: number, zMm: number] {
  return [roundDivInt(57_735 * (2 * q + r), 100), CELL_MM * r];
}
