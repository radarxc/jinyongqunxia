import { compareCodePoints, floorDivInt } from '@tianshu/shared';
import { localToWorldQuarter, worldSide } from '../town-plan';
import type { TownBuildingPlan } from '../../schemas/region-map';
import { HEX_DIRECTIONS, cellCentreMm } from './frame';
import {
  canOpenDoorThresholdEdge,
  doorOutwardDistance,
  isInteriorCell,
  pointInFootprint,
} from './geometry';
import type { CellState, DoorAssignment, TownWork } from './types';

const OFFSETS_MM = [0, -1_000, 1_000, -2_000, 2_000, -3_000, 3_000] as const;
function doorCentre(plan: TownBuildingPlan, shift: number): readonly [number, number] {
  const entrance = plan.entrances[0] ?? [0, 0, 1_400];
  const localSide = entrance[0];
  const along = entrance[1] + shift;
  const halfW = floorDivInt(plan.footprint[2], 2);
  const halfD = floorDivInt(plan.footprint[3], 2);
  const local: readonly [number, number] =
    localSide === 0
      ? [along, halfD]
      : localSide === 1
        ? [-halfW, -along]
        : localSide === 2
          ? [-along, -halfD]
          : [halfW, along];
  const [dx, dz] = localToWorldQuarter(local[0], local[1], plan.yaw);
  return [plan.footprint[0] + dx, plan.footprint[1] + dz];
}
function outsidePoint(plan: TownBuildingPlan, shift: number): readonly [number, number] {
  const [x, z] = doorCentre(plan, shift);
  const side = worldSide(plan.entrances[0]?.[0] ?? 0, plan.yaw);
  return side === 0
    ? [x, z + 600]
    : side === 1
      ? [x - 600, z]
      : side === 2
        ? [x, z - 600]
        : [x + 600, z];
}
function squaredDistance(cell: CellState, point: readonly [number, number]): number {
  const [x, z] = cellCentreMm(cell);
  const dx = x - point[0];
  const dz = z - point[1];
  return dx * dx + dz * dz;
}
function nearest(
  cells: readonly CellState[],
  point: readonly [number, number],
): CellState | undefined {
  let result: CellState | undefined;
  let score = Number.MAX_SAFE_INTEGER;
  for (const cell of cells) {
    const next = squaredDistance(cell, point);
    if (
      next < score ||
      (next === score &&
        (result === undefined || cell.r < result.r || (cell.r === result.r && cell.q < result.q)))
    ) {
      result = cell;
      score = next;
    }
  }
  return result;
}
function connectedToStreet(start: CellState, work: TownWork): boolean {
  if (start.outdoorWalkable) return true;
  const queue: { cell: CellState; depth: number }[] = [{ cell: start, depth: 0 }];
  const seen = new Set([start.key]);
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.depth >= 6) continue;
    for (const [dq, dr] of HEX_DIRECTIONS) {
      const next = work.cells.get(`${current.cell.q + dq},${current.cell.r + dr}`);
      if (next === undefined || seen.has(next.key) || next.building !== 0) continue;
      if (next.outdoorWalkable) return true;
      seen.add(next.key);
      queue.push({ cell: next, depth: current.depth + 1 });
    }
  }
  return false;
}
function passageBetween(
  outside: CellState,
  plan: TownBuildingPlan,
  building: number,
  work: TownWork,
): readonly CellState[] | undefined {
  const path: CellState[] = [outside];
  for (let depth = 0; depth < 6; depth += 1) {
    const current = path[path.length - 1]!;
    const candidates = HEX_DIRECTIONS.map(([dq, dr]) =>
      work.cells.get(`${current.q + dq},${current.r + dr}`),
    )
      .filter(
        (next): next is CellState =>
          next !== undefined &&
          (next.building === 0 || next.building === building) &&
          (next.building === 0 || isInteriorCell(plan, next) || next.terrain === 'tr_shibi') &&
          canOpenDoorThresholdEdge(plan, current, next),
      )
      .sort(
        (a, b) =>
          doorOutwardDistance(plan, a) - doorOutwardDistance(plan, b) ||
          squaredDistance(a, doorCentre(plan, 0)) - squaredDistance(b, doorCentre(plan, 0)) ||
          a.r - b.r ||
          a.q - b.q,
      );
    const next = candidates[0];
    if (next === undefined) return undefined;
    path.push(next);
    if (isInteriorCell(plan, next) && !next.blocked) return path;
  }
  return undefined;
}
function chooseDoor(
  plan: TownBuildingPlan,
  work: TownWork,
  used: Map<string, string>,
): DoorAssignment | undefined {
  const inside = [...work.cells.values()].filter((cell) => isInteriorCell(plan, cell));
  if (inside.length === 0) return undefined;
  const building = work.plans.indexOf(plan) + 1;
  const conflicts = new Set<string>();
  const outside = [...work.cells.values()].filter((cell) => {
    const [x, z] = cellCentreMm(cell);
    return cell.building === 0 && !pointInFootprint(plan, x, z);
  });
  const layoutBuilding = work.input.layout.buildings.find(({ id }) => id === plan.id);
  for (const movedMm of OFFSETS_MM) {
    const shiftedPlan = movePlanEntrance(plan, movedMm);
    const target = outsidePoint(shiftedPlan, 0);
    const out = nearest(outside, target);
    if (
      out === undefined ||
      squaredDistance(out, target) > 9_000_000 ||
      !connectedToStreet(out, work)
    )
      continue;
    const conflict = used.get(out.key);
    if (conflict !== undefined) {
      conflicts.add(conflict);
      continue;
    }
    const passage = passageBetween(out, shiftedPlan, building, work);
    const inner = passage?.[passage.length - 1];
    if (inner !== undefined)
      return { buildingId: plan.id, outside: out, inside: inner, passage: passage!, movedMm };
  }
  const fallback = layoutBuilding?.entrance_hexes[0];
  if (fallback !== undefined) {
    const raw = `${fallback.q - work.input.layout.runtime_partition.q_min},${fallback.r - work.input.layout.runtime_partition.r_min}`;
    const out = work.cells.get(raw);
    const conflict = out === undefined ? undefined : used.get(out.key);
    if (conflict !== undefined) conflicts.add(conflict);
    const passage = out === undefined ? undefined : passageBetween(out, plan, building, work);
    const inner = passage?.[passage.length - 1];
    if (
      out !== undefined &&
      out.building === 0 &&
      inner !== undefined &&
      conflict === undefined &&
      passage !== undefined
    )
      return { buildingId: plan.id, outside: out, inside: inner, passage, movedMm: 0 };
  }
  if (conflicts.size > 0) {
    const other = [...conflicts].sort(compareCodePoints)[0]!;
    work.diagnostics.push({
      code: 'TOWN_DOOR_CONFLICT',
      severity: 'warning',
      message: `${other} and ${plan.id} cannot get unique door cells within 3000 mm`,
      buildingIds: [other, plan.id].sort(compareCodePoints),
    });
    throw new Error(`TOWN_COMPILE_DOOR_CONFLICT:${other}:${plan.id}`);
  }
  return undefined;
}
function movePlanEntrance(plan: TownBuildingPlan, movedMm: number): TownBuildingPlan {
  if (movedMm === 0) return plan;
  const first = plan.entrances[0];
  if (first === undefined) return plan;
  return {
    ...plan,
    entrances: [[first[0], first[1] + movedMm, first[2]], ...plan.entrances.slice(1)],
  };
}

export function compileDoors(work: TownWork): void {
  const used = new Map<string, string>();
  for (const plan of [...work.plans].sort((a, b) => compareCodePoints(a.id, b.id))) {
    if (!plan.enterable) continue;
    const door = chooseDoor(plan, work, used);
    if (door === undefined) {
      const hasInterior = [...work.cells.values()].some((cell) => isInteriorCell(plan, cell));
      if (!hasInterior) {
        const index = work.plans.indexOf(plan);
        work.plans[index] = { ...plan, enterable: false, entrances: [], floors: [], floorY: [] };
        work.diagnostics.push({
          code: 'TOWN_BUILDING_NO_INTERIOR_CELL',
          severity: 'warning',
          message: `${plan.id} has no interior hex after clearance and is non-enterable`,
          buildingIds: [plan.id],
        });
        continue;
      }
      const conflict =
        [...used.entries()].sort((a, b) => compareCodePoints(a[0], b[0]))[0]?.[1] ?? 'unknown';
      throw new Error(`TOWN_COMPILE_DOOR_CONFLICT:${conflict}:${plan.id}`);
    }
    const planIndex = work.plans.indexOf(plan);
    work.plans[planIndex] = movePlanEntrance(plan, door.movedMm);
    used.set(door.outside.key, plan.id);
    work.doors.push(door);
    for (const cell of door.passage) {
      cell.blocked = false;
      cell.terrain = cell.building === 0 ? 'tr_taijie' : 'tr_shinei';
      cell.surface = 'threshold';
    }
    if (door.movedMm !== 0)
      work.diagnostics.push({
        code: 'TOWN_DOOR_MOVED',
        severity: 'info',
        message: `${plan.id} door moved ${door.movedMm} mm`,
        buildingIds: [plan.id],
      });
  }
  emitBuildingObjects(work);
}

function occupiedBounds(
  work: TownWork,
  index: number,
  door?: CellState,
): { q: number; r: number; width: number; height: number; cell: CellState } {
  const cells = [...work.cells.values()].filter((cell) => cell.building === index);
  if (cells.length === 0)
    throw new Error(`TOWN_COMPILE_BUILDING_OUTSIDE:${work.plans[index - 1]!.id}`);
  const q0 = Math.min(...cells.map(({ q }) => q));
  const q1 = Math.max(...cells.map(({ q }) => q));
  const r0 = Math.min(...cells.map(({ r }) => r));
  const r1 = Math.max(...cells.map(({ r }) => r));
  const candidates = [
    {
      q: door === undefined ? q0 : door.q + 1,
      r: r0,
      width: q1 - (door?.q ?? q0),
      height: r1 - r0 + 1,
    },
    { q: q0, r: r0, width: (door?.q ?? q1) - q0, height: r1 - r0 + 1 },
    {
      q: q0,
      r: door === undefined ? r0 : door.r + 1,
      width: q1 - q0 + 1,
      height: r1 - (door?.r ?? r0),
    },
    { q: q0, r: r0, width: q1 - q0 + 1, height: (door?.r ?? r1) - r0 },
  ]
    .filter(({ width, height }) => width > 0 && height > 0)
    .sort((a, b) => b.width * b.height - a.width * a.height);
  const rect =
    door !== undefined && door.q >= q0 && door.q <= q1 && door.r >= r0 && door.r <= r1
      ? candidates[0]!
      : { q: q0, r: r0, width: q1 - q0 + 1, height: r1 - r0 + 1 };
  return { ...rect, cell: cells.sort((a, b) => a.r - b.r || a.q - b.q)[0]! };
}
function emitBuildingObjects(work: TownWork): void {
  for (const [offset, plan] of work.plans.entries()) {
    const door = work.doors.find(({ buildingId }) => buildingId === plan.id);
    const index = offset + 1;
    const bounds = occupiedBounds(work, index, door?.outside);
    const anchor = plan.enterable ? door?.outside : bounds.cell;
    if (anchor === undefined) throw new Error(`TOWN_COMPILE_DOOR_MISSING:${plan.id}`);
    const facility = work.input.facilities.facilities.find(
      ({ buildingId }) => buildingId === plan.id,
    );
    work.objects.push({
      id: plan.id,
      class: 'Building',
      q: anchor.q,
      r: anchor.r,
      h: anchor.height,
      cells: [{ q: anchor.q, r: anchor.r, h: anchor.height }],
      footprint: { q: bounds.q, r: bounds.r, width: bounds.width, height: bounds.height },
      interiorRect: { q: bounds.q, r: bounds.r, width: bounds.width, height: bounds.height },
      roofGroup: `roof_${plan.id}`,
      cutawayWalls: [0, 1, 2, 3],
      enterable: plan.enterable,
      ...(facility === undefined ? {} : { facilityKey: facility.key, nameKey: facility.nameKey }),
    });
  }
}
