import { hexCentreMm, worldToLocalQuarter } from '../town-plan';
import type { TownBuildingPlan } from '../../schemas/region-map';
import { hexDistance } from './frame';
import type { CellState } from './types';

const CLEARANCE_MM = 250;
const within = (x: number, z: number, rect: readonly number[], inset = 0): boolean =>
  x >= rect[0]! + inset && x < rect[2]! - inset && z >= rect[1]! + inset && z < rect[3]! - inset;

export function footprintBounds(plan: TownBuildingPlan): readonly [number, number, number, number] {
  const [cx, cz, w, d] = plan.footprint;
  const width = plan.yaw % 2 === 0 ? w : d;
  const depth = plan.yaw % 2 === 0 ? d : w;
  return [cx * 2 - width, cz * 2 - depth, cx * 2 + width, cz * 2 + depth];
}
export function pointInFootprint(plan: TownBuildingPlan, x: number, z: number): boolean {
  const [x0, z0, x1, z1] = footprintBounds(plan);
  return x * 2 >= x0 && x * 2 < x1 && z * 2 >= z0 && z * 2 < z1;
}
export function fixtureBlocksPoint(plan: TownBuildingPlan, x: number, z: number): boolean {
  const [lx, lz] = worldToLocalQuarter(x - plan.footprint[0], z - plan.footprint[1], plan.yaw);
  return plan.fixtures.some(([, cx, cz, width, depth, yaw, blocks]) => {
    if (blocks !== 1) return false;
    const [fx, fz] = worldToLocalQuarter(lx - cx, lz - cz, yaw);
    return (
      Math.abs(fx) * 2 <= width + CLEARANCE_MM * 2 && Math.abs(fz) * 2 <= depth + CLEARANCE_MM * 2
    );
  });
}
export function isFloorPoint(plan: TownBuildingPlan, x: number, z: number): boolean {
  return plan.enterable && plan.floors.some((floor) => within(x, z, floor, CLEARANCE_MM));
}
export function isInteriorPoint(plan: TownBuildingPlan, x: number, z: number): boolean {
  return isFloorPoint(plan, x, z) && !fixtureBlocksPoint(plan, x, z);
}
export function isInteriorCell(plan: TownBuildingPlan, cell: CellState): boolean {
  const [x, z] = hexCentreMm(cell.rawQ, cell.rawR);
  return isInteriorPoint(plan, x, z);
}
function doorCoordinates(
  plan: TownBuildingPlan,
  x: number,
  z: number,
): readonly [tangent: number, outward: number, along: number, width: number] {
  const [lx, lz] = worldToLocalQuarter(x - plan.footprint[0], z - plan.footprint[1], plan.yaw);
  const halfW = Math.trunc(plan.footprint[2] / 2);
  const halfD = Math.trunc(plan.footprint[3] / 2);
  const [side, along, width] = plan.entrances[0] ?? [0, 0, 1_400];
  const tangent = side === 0 ? lx : side === 1 ? -lz : side === 2 ? -lx : lz;
  const outward =
    side === 0 ? lz - halfD : side === 1 ? -lx - halfW : side === 2 ? -lz - halfD : lx - halfW;
  return [tangent, outward, along, width];
}
export function doorOutwardDistance(plan: TownBuildingPlan, cell: CellState): number {
  const [x, z] = hexCentreMm(cell.rawQ, cell.rawR);
  return doorCoordinates(plan, x, z)[1];
}
function pointInDoorCorridor(plan: TownBuildingPlan, x: number, z: number): boolean {
  const [tangent, outward, along, width] = doorCoordinates(plan, x, z);
  return Math.abs(tangent - along) * 2 <= width && outward <= 600;
}
export function canTraverseBuildingEdge(
  from: CellState,
  to: CellState,
  plans: readonly TownBuildingPlan[],
): boolean {
  if (from.blocked || to.blocked || hexDistance(from, to) !== 1) return false;
  const [ax, az] = hexCentreMm(from.rawQ, from.rawR);
  const [bx, bz] = hexCentreMm(to.rawQ, to.rawR);
  const mx = Math.trunc((ax + bx) / 2);
  const mz = Math.trunc((az + bz) / 2);
  const thresholdEdge =
    from.surface === 'threshold' &&
    to.surface === 'threshold' &&
    plans.some((plan) => pointInDoorCorridor(plan, mx, mz));
  if (from.building === 0 && to.building === 0)
    return thresholdEdge || plans.every((plan) => !pointInFootprint(plan, mx, mz));
  if (from.building !== to.building) {
    const building = from.building === 0 ? to.building : from.building;
    const plan = plans[building - 1];
    return plan !== undefined && pointInDoorCorridor(plan, mx, mz);
  }
  const plan = plans[from.building - 1];
  return (
    plan !== undefined &&
    (plan.floors.some((floor) => within(mx, mz, floor)) ||
      !pointInFootprint(plan, mx, mz) ||
      (from.surface === 'threshold' &&
        to.surface === 'threshold' &&
        pointInDoorCorridor(plan, mx, mz)))
  );
}
export function canOpenDoorThresholdEdge(
  plan: TownBuildingPlan,
  from: CellState,
  to: CellState,
): boolean {
  if (hexDistance(from, to) !== 1) return false;
  const [ax, az] = hexCentreMm(from.rawQ, from.rawR);
  const [bx, bz] = hexCentreMm(to.rawQ, to.rawR);
  const midpoint = [Math.trunc((ax + bx) / 2), Math.trunc((az + bz) / 2)] as const;
  return (
    pointInDoorCorridor(plan, midpoint[0], midpoint[1]) &&
    doorOutwardDistance(plan, to) < doorOutwardDistance(plan, from)
  );
}
