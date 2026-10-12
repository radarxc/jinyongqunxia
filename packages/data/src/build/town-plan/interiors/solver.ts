import { floorDivInt } from '@tianshu/shared';
import { localToWorldQuarter, worldToLocalQuarter } from '../frame';
import { SALT, splitmix32 } from '../rng';
import type { InteriorPlanner } from '../plan-hall';
import type { FacilityKind, FixtureTuple, PlanDiagnostic, RectMm, Yaw4 } from '../types';
import { generalStoreBackShelfMm, planGeneralStore } from './general-store';
import { planInn } from './inn';
import { planPharmacy } from './pharmacy';
import { planResidence } from './residence';
import { planSmithy } from './smithy';
import { planStall } from './stall';
import { planTavern } from './tavern';

export interface InteriorSolveInput {
  readonly room: RectMm;
  readonly facility: FacilityKind;
  readonly doorOffsetMm: number;
  readonly doorWidthMm: number;
  readonly seed: number;
  readonly yaw?: Yaw4;
}
export interface InteriorSolveResult {
  readonly floors: readonly RectMm[];
  readonly fixtures: readonly FixtureTuple[];
  readonly diagnostics: readonly PlanDiagnostic[];
}
export interface InteriorTemplateInput {
  readonly room: RectMm;
  readonly passage: RectMm;
  readonly widthMm: number;
  readonly depthMm: number;
  readonly facility: FacilityKind;
  readonly degrade: number;
  readonly interiorSeed: number;
  readonly propsSeed: number;
  readonly yaw?: Yaw4;
  readonly worldCentreMm?: readonly [number, number];
}
export interface InteriorTemplateResult {
  readonly fixtures: readonly FixtureTuple[];
  readonly excluded: readonly RectMm[];
}
type Template = (input: InteriorTemplateInput) => InteriorTemplateResult;

const TEMPLATES: Readonly<Partial<Record<FacilityKind, Template>>> = {
  general_store: planGeneralStore,
  pharmacy: planPharmacy,
  inn: planInn,
  tavern: planTavern,
  teahouse: planTavern,
  residence: planResidence,
  smithy: planSmithy,
  stall_goods: planStall,
  stall_food: planStall,
};
const MIN_SIZE: Readonly<Partial<Record<FacilityKind, readonly [number, number]>>> = {
  general_store: [3_600, 2_800],
  pharmacy: [3_600, 3_000],
  inn: [6_000, 4_600],
  tavern: [6_000, 4_600],
  teahouse: [6_000, 4_600],
  residence: [3_600, 2_800],
  smithy: [4_400, 3_100],
  stall_goods: [2_600, 1_600],
  stall_food: [2_600, 1_600],
};

/** tech/16 §8.2 door passage depth (1400). Coordinator ruling 2026-10-12: in a general store the
 * passage is what remains in front of the counter (back shelf + 800 aisle + 550 counter), capped
 * at 1400 and never below 1100; below 2800 depth the solver falls back to a back-wall keeper. */
export const GENERAL_STORE_MIN_DEPTH_MM = 2_800;
export function interiorPassageDepthMm(facility: FacilityKind, depthMm: number): number {
  if (facility !== 'general_store') return 1_400;
  const front = depthMm - generalStoreBackShelfMm(depthMm) - 800 - 550;
  return front >= 1_400 ? 1_400 : front > 1_100 ? front : 1_100;
}

function dimensions(room: RectMm, yaw: Yaw4): readonly [number, number] {
  const worldW = room[2] - room[0];
  const worldD = room[3] - room[1];
  return yaw === 0 || yaw === 2 ? [worldW, worldD] : [worldD, worldW];
}
function centredRoom(width: number, depth: number): RectMm {
  const x0 = -floorDivInt(width, 2);
  const z0 = -floorDivInt(depth, 2);
  return [x0, z0, x0 + width, z0 + depth];
}
function degradation(width: number, depth: number, min: readonly [number, number]): number {
  if (width >= min[0] && depth >= min[1]) return 0;
  if (width >= min[0] - 400 && depth >= min[1] - 200) return 1;
  if (width >= min[0] - 800 && depth >= min[1] - 400) return 2;
  return 3;
}
function diagnostic(code: string, facility: FacilityKind, message: string): PlanDiagnostic {
  return { code, message, path: facility };
}

function subtractRect(source: RectMm, cut: RectMm): RectMm[] {
  const x0 = source[0] > cut[0] ? source[0] : cut[0];
  const z0 = source[1] > cut[1] ? source[1] : cut[1];
  const x1 = source[2] < cut[2] ? source[2] : cut[2];
  const z1 = source[3] < cut[3] ? source[3] : cut[3];
  if (x0 >= x1 || z0 >= z1) return [source];
  const result: RectMm[] = [];
  if (source[1] < z0) result.push([source[0], source[1], source[2], z0]);
  if (z1 < source[3]) result.push([source[0], z1, source[2], source[3]]);
  if (source[0] < x0) result.push([source[0], z0, x0, z1]);
  if (x1 < source[2]) result.push([x1, z0, source[2], z1]);
  return result;
}
function subtractAll(room: RectMm, cuts: readonly RectMm[]): RectMm[] {
  let floors: RectMm[] = [room];
  for (const cut of cuts) floors = floors.flatMap((floor) => subtractRect(floor, cut));
  return floors;
}

function rotateRect(rect: RectMm, yaw: Yaw4, cx: number, cz: number): RectMm {
  const points = [
    localToWorldQuarter(rect[0], rect[1], yaw),
    localToWorldQuarter(rect[0], rect[3], yaw),
    localToWorldQuarter(rect[2], rect[1], yaw),
    localToWorldQuarter(rect[2], rect[3], yaw),
  ];
  let x0 = points[0]![0];
  let x1 = x0;
  let z0 = points[0]![1];
  let z1 = z0;
  for (const point of points) {
    if (point[0] < x0) x0 = point[0];
    if (point[0] > x1) x1 = point[0];
    if (point[1] < z0) z0 = point[1];
    if (point[1] > z1) z1 = point[1];
  }
  return [x0 + cx, z0 + cz, x1 + cx, z1 + cz];
}
function rotateYaw(local: Yaw4, building: Yaw4): Yaw4 {
  const sum = local + building;
  return (sum >= 4 ? sum - 4 : sum) as Yaw4;
}
function rotateFixture(item: FixtureTuple, yaw: Yaw4, cx: number, cz: number): FixtureTuple {
  const [x, z] = localToWorldQuarter(item[1], item[2], yaw);
  return [item[0], x + cx, z + cz, item[3], item[4], rotateYaw(item[5], yaw), item[6]];
}
function worldCentre(room: RectMm): readonly [number, number] {
  return [floorDivInt(room[0] + room[2], 2), floorDivInt(room[1] + room[3], 2)];
}
function fallbackSmall(
  room: RectMm,
  facility: FacilityKind,
  diagnostics: PlanDiagnostic[],
): InteriorSolveResult {
  const keeperIdx = facility === 'smithy' ? 209 : facility.startsWith('stall_') ? 204 : 200;
  diagnostics.push(
    diagnostic(
      'INTERIOR_ROOM_BELOW_MINIMUM',
      facility,
      'room below minimum; counter omitted and keeper moved to back wall',
    ),
  );
  return { floors: [room], fixtures: [[keeperIdx, 0, room[1] + 300, 0, 0, 0, 0]], diagnostics };
}

/** Pure-integer interior solve; input room is world AABB, template work is door-facing local. */
export function solveInterior(input: InteriorSolveInput): InteriorSolveResult {
  const yaw = input.yaw ?? 0;
  const template = TEMPLATES[input.facility];
  const diagnostics: PlanDiagnostic[] = [];
  if (template === undefined)
    return {
      floors: [input.room],
      fixtures: [],
      diagnostics: [
        diagnostic('INTERIOR_TEMPLATE_PENDING', input.facility, 'facility template belongs to i2'),
      ],
    };
  const [width, depth] = dimensions(input.room, yaw);
  const room = centredRoom(width, depth);
  const min = MIN_SIZE[input.facility]!;
  const degrade = degradation(width, depth, min);
  if (
    (degrade === 3 && (width < min[0] - 800 || depth < min[1] - 600)) ||
    (input.facility === 'general_store' && depth < GENERAL_STORE_MIN_DEPTH_MM)
  ) {
    const fallback = fallbackSmall(room, input.facility, diagnostics);
    const [cx, cz] = worldCentre(input.room);
    return {
      floors: fallback.floors.map((rect) => rotateRect(rect, yaw, cx, cz)),
      fixtures: fallback.fixtures.map((item) => rotateFixture(item, yaw, cx, cz)),
      diagnostics,
    };
  }
  if (degrade > 0)
    diagnostics.push(
      diagnostic(
        'INTERIOR_DEGRADED',
        input.facility,
        `degrade=${degrade}: optional props, side shelves, then secondary stations removed`,
      ),
    );
  const halfDoor = floorDivInt(input.doorWidthMm, 2);
  const passage: RectMm = [
    input.doorOffsetMm - halfDoor - 200,
    room[3] - interiorPassageDepthMm(input.facility, depth),
    input.doorOffsetMm + input.doorWidthMm - halfDoor + 200,
    room[3],
  ];
  const [cx, cz] = worldCentre(input.room);
  const layout = template({
    room,
    passage,
    widthMm: width,
    depthMm: depth,
    facility: input.facility,
    degrade,
    interiorSeed: splitmix32(input.seed ^ SALT.interior),
    propsSeed: splitmix32(input.seed ^ SALT.props),
    yaw,
    worldCentreMm: [cx, cz],
  });
  const localFloors = subtractAll(room, layout.excluded);
  const floors = localFloors.map((rect) => rotateRect(rect, yaw, cx, cz));
  const fixtures = layout.fixtures.map((item) => rotateFixture(item, yaw, cx, cz));
  return {
    floors,
    fixtures,
    diagnostics,
  };
}

function localDoorOffset(
  room: RectMm,
  yaw: Yaw4,
  planCx: number,
  planCz: number,
  doorCx: number,
  doorCz: number,
): number {
  const [x] = worldToLocalQuarter(doorCx - planCx, doorCz - planCz, yaw);
  const [roomCx] = worldToLocalQuarter(
    floorDivInt(room[0] + room[2], 2) - planCx,
    floorDivInt(room[1] + room[3], 2) - planCz,
    yaw,
  );
  return x - roomCx;
}

/** Default planBuilding integration; custom planners can still override it. */
export const defaultInteriorPlanner: InteriorPlanner = ({ plan }) => {
  const solved = solvePlanInterior(plan);
  const y = plan.floorY[0] ?? plan.elev[1];
  return { fixtures: solved.fixtures, floors: solved.floors, floorY: solved.floors.map(() => y) };
};

export function solvePlanInterior(
  plan: Parameters<InteriorPlanner>[0]['plan'],
): InteriorSolveResult {
  if (plan.facility === 'stall_goods' || plan.facility === 'stall_food') {
    const worldWidth = plan.yaw === 0 || plan.yaw === 2 ? plan.footprint[2] : plan.footprint[3];
    const worldDepth = plan.yaw === 0 || plan.yaw === 2 ? plan.footprint[3] : plan.footprint[2];
    const x0 = plan.footprint[0] - floorDivInt(worldWidth, 2);
    const z0 = plan.footprint[1] - floorDivInt(worldDepth, 2);
    return solveInterior({
      room: [x0, z0, x0 + worldWidth, z0 + worldDepth],
      facility: plan.facility,
      doorOffsetMm: 0,
      doorWidthMm: 0,
      seed: plan.seed,
      yaw: plan.yaw,
    });
  }
  if (!plan.enterable || plan.floors.length === 0 || plan.entrances.length === 0) {
    return { floors: plan.floors, fixtures: plan.fixtures, diagnostics: [] };
  }
  const entrance = plan.entrances[0]!;
  const doorLocal = localToWorldQuarter(entrance[1], floorDivInt(plan.footprint[3], 2), plan.yaw);
  const offset = localDoorOffset(
    plan.floors[0]!,
    plan.yaw,
    plan.footprint[0],
    plan.footprint[1],
    plan.footprint[0] + doorLocal[0],
    plan.footprint[1] + doorLocal[1],
  );
  return solveInterior({
    room: plan.floors[0]!,
    facility: plan.facility,
    doorOffsetMm: offset,
    doorWidthMm: entrance[2],
    seed: plan.seed,
    yaw: plan.yaw,
  });
}
