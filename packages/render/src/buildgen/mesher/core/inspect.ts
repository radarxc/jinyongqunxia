import {
  buildgenNotImplemented,
  type BuildingPlanView,
  type BuildKitView,
  type MeshPayload,
  type PartView,
} from '../../types';
import { columnLayout } from '../parts/columns';

export interface GeometryDiagnostic {
  readonly invariant: 'INV-1' | 'INV-2' | 'INV-3' | 'INV-4' | 'INV-5' | 'INV-6';
  readonly code: string;
  readonly message: string;
  readonly planId?: string;
  readonly vertex?: number;
  readonly triangle?: number;
}
function localXZ(
  plan: BuildingPlanView,
  worldX: number,
  worldZ: number,
): readonly [number, number] {
  const x = worldX - plan.footprint[0] / 1000;
  const z = worldZ - plan.footprint[1] / 1000;
  switch (plan.yaw) {
    case 0:
      return [x, z];
    case 1:
      return [z, -x];
    case 2:
      return [-x, -z];
    case 3:
      return [-z, x];
  }
}
interface UnitOwner {
  readonly plan: BuildingPlanView;
  readonly part?: PartView;
}
function unitOwners(plans: readonly BuildingPlanView[]): readonly UnitOwner[] {
  const owners: UnitOwner[] = plans.map((plan) => ({ plan }));
  for (const plan of plans) for (const part of plan.parts ?? []) owners.push({ plan, part });
  return owners;
}
function ownerForVertex(
  mesh: MeshPayload,
  vertex: number,
  owners: readonly UnitOwner[],
): UnitOwner | undefined {
  return owners[mesh.unit[vertex * 2] ?? -1];
}
function trianglePoints(
  mesh: MeshPayload,
  triangleOffset: number,
): readonly [number, number, number][] {
  const result: [number, number, number][] = [];
  for (let corner = 0; corner < 3; corner += 1) {
    const offset = mesh.index[triangleOffset + corner]! * 3;
    result.push([mesh.position[offset]!, mesh.position[offset + 1]!, mesh.position[offset + 2]!]);
  }
  return result;
}
export interface HangingPropGeometry {
  readonly kind: 'sign' | 'flag' | 'lantern';
  readonly vertices: readonly number[];
}
export function decodeHangingProps(
  payload: Uint32Array,
  target: 'shell' | 'roof',
): HangingPropGeometry[] {
  const kinds = ['', 'sign', 'flag', 'lantern'] as const;
  const result: HangingPropGeometry[] = [];
  for (let offset = 0; offset < payload.length;) {
    const meshTarget = payload[offset++];
    const kind = kinds[payload[offset++] ?? 0];
    const count = payload[offset++] ?? 0;
    if ((meshTarget !== 0 && meshTarget !== 1) || !kind || offset + count > payload.length)
      throw new RangeError('BUILDGEN_INVALID_HANGING_METADATA');
    const vertices = Array.from(payload.subarray(offset, offset + count));
    offset += count;
    if (meshTarget === (target === 'shell' ? 0 : 1)) result.push({ kind, vertices });
  }
  return result;
}
function highHangingVertices(
  mesh: MeshPayload,
  owners: readonly UnitOwner[],
  props: readonly HangingPropGeometry[],
): ReadonlySet<number> {
  const result = new Set<number>();
  for (const prop of props) {
    const vertices = prop.vertices;
    if (
      vertices.length >= 3 &&
      vertices.every((vertex) => {
        const owner = ownerForVertex(mesh, vertex, owners);
        return (
          vertex >= 0 &&
          vertex < mesh.position.length / 3 &&
          !!owner &&
          mesh.position[vertex * 3 + 1]! >= owner.plan.elev[0] / 1000 + 2.25 - 0.000_01
        );
      })
    )
      for (const vertex of vertices) result.add(vertex);
  }
  return result;
}

export function inspectInv1(
  mesh: MeshPayload,
  plans: readonly BuildingPlanView[],
  hangingProps: readonly HangingPropGeometry[] = [],
): GeometryDiagnostic[] {
  const result: GeometryDiagnostic[] = [];
  const owners = unitOwners(plans);
  const insetM = 0.04;
  const hangingReachM = 0.6;
  const hangingVertices = highHangingVertices(mesh, owners, hangingProps);
  const epsilon = 0.000_01;
  for (let vertex = 0; vertex < mesh.position.length / 3; vertex += 1) {
    const owner = ownerForVertex(mesh, vertex, owners);
    if (!owner) {
      result.push({
        invariant: 'INV-1',
        code: 'UNKNOWN_UNIT',
        message: 'vertex unit has no plan',
        vertex,
      });
      continue;
    }
    const plan = owner.plan;
    const offset = vertex * 3;
    const [x, z] = localXZ(plan, mesh.position[offset]!, mesh.position[offset + 2]!);
    const halfW = plan.footprint[2] / 2000 - insetM;
    const halfD = plan.footprint[3] / 2000 - insetM;
    const outsideInset =
      x < -halfW - epsilon || x > halfW + epsilon || z < -halfD - epsilon || z > halfD + epsilon;
    const isHighHangingProp =
      hangingVertices.has(vertex) &&
      Math.abs(x) <= plan.footprint[2] / 2000 + hangingReachM + epsilon &&
      Math.abs(z) <= plan.footprint[3] / 2000 + hangingReachM + epsilon;
    if (outsideInset && !isHighHangingProp)
      result.push({
        invariant: 'INV-1',
        code: 'OUTSIDE_FOOTPRINT',
        message: `vertex is outside ${plan.id} inset footprint`,
        planId: plan.id,
        vertex,
      });
  }
  return result;
}

type Point3 = readonly [number, number, number];
/** Door clear-opening box in door-frame coordinates: u along the wall, y up, d inward depth. */
interface DoorBox {
  readonly center: Point3;
  readonly half: Point3;
  readonly side: number;
}
/** Faces that only touch the opening (jambs, lintel underside, threshold top) are legal. */
const DOOR_TOUCH_M = 0.001;

/** Plan-local extent of all floors; empty plans (stalls) have no walkable doorway. */
function localFloorBounds(plan: BuildingPlanView) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const [x0, z0, x1, z1] of plan.floors)
    for (const [x, z] of [
      [x0, z0],
      [x1, z1],
    ] as const) {
      const [localX, localZ] = localXZ(plan, x / 1000, z / 1000);
      minX = Math.min(minX, localX);
      maxX = Math.max(maxX, localX);
      minZ = Math.min(minZ, localZ);
      maxZ = Math.max(maxZ, localZ);
    }
  return { minX, maxX, minZ, maxZ };
}
/**
 * One box per entrance: [offset ± width/2] × [floor + threshold, floor + 2.1 m] × the real wall
 * band from the footprint edge to the floors edge on that side (tech/16 §5.4 INV-3).
 */
function doorBoxes(
  plan: BuildingPlanView,
  thresholdMm: number,
  minimumWidthMm: number,
  kit?: BuildKitView,
  defaultEntrance = false,
): readonly DoorBox[] {
  if (!plan.enterable || plan.floors.length === 0) return [];
  const halfW = plan.footprint[2] / 2000;
  const halfD = plan.footprint[3] / 2000;
  const floors = localFloorBounds(plan);
  const floor = (plan.elev[0] + Math.min(...plan.floorY)) / 1000;
  const bottom = floor + thresholdMm / 1000 + DOOR_TOUCH_M * 2;
  const top = floor + 2.1;
  const entrances =
    plan.entrances.length > 0
      ? plan.entrances
      : defaultEntrance
        ? ([[0, 0, minimumWidthMm]] as const)
        : [];
  return entrances.flatMap(([side, offsetMm, widthMm]) => {
    const clearWidthMm = Math.max(minimumWidthMm, widthMm);
    const wallDepth = [
      halfD - floors.maxZ,
      floors.minX + halfW,
      floors.minZ + halfD,
      halfW - floors.maxX,
    ][side]!;
    const half: Point3 = [
      clearWidthMm / 2000 - DOOR_TOUCH_M,
      (top - bottom) / 2 - DOOR_TOUCH_M,
      wallDepth / 2 - DOOR_TOUCH_M,
    ];
    if (half.some((value) => !(value > 0))) return [];
    return [{ center: [offsetMm / 1000, (top + bottom) / 2, wallDepth / 2], half, side }];
  });
}
/** World point → door-frame (u, y, d) for the given entrance side of a plan. */
function doorFrame(plan: BuildingPlanView, side: number, [x, y, z]: Point3): Point3 {
  const [localX, localZ] = localXZ(plan, x, z);
  const halfW = plan.footprint[2] / 2000;
  const halfD = plan.footprint[3] / 2000;
  if (side === 0) return [localX, y, halfD - localZ];
  if (side === 1) return [localZ, y, localX + halfW];
  if (side === 2) return [-localX, y, localZ + halfD];
  return [-localZ, y, halfW - localX];
}
function crossAxis(a: Point3, b: Point3): Point3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
/** Separating-axis triangle / AABB test (box axes, triangle normal, 9 edge cross products). */
export function triangleOverlapsBox(
  center: Point3,
  half: Point3,
  triangle: readonly Point3[],
): boolean {
  const v = triangle.map((point) => [
    point[0] - center[0],
    point[1] - center[1],
    point[2] - center[2],
  ]) as unknown as readonly [Point3, Point3, Point3];
  const edges: Point3[] = [0, 1, 2].map((index) => {
    const from = v[index]!;
    const to = v[(index + 1) % 3]!;
    return [to[0] - from[0], to[1] - from[1], to[2] - from[2]] as const;
  });
  const units: readonly Point3[] = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
  const axes: Point3[] = [...units, crossAxis(edges[0]!, edges[1]!)];
  for (const unit of units) for (const edge of edges) axes.push(crossAxis(unit, edge));
  for (const axis of axes) {
    if (axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2] < 1e-18) continue;
    const projections = v.map(
      (point) => point[0] * axis[0] + point[1] * axis[1] + point[2] * axis[2],
    );
    const radius =
      half[0] * Math.abs(axis[0]) + half[1] * Math.abs(axis[1]) + half[2] * Math.abs(axis[2]);
    if (Math.min(...projections) > radius || Math.max(...projections) < -radius) return false;
  }
  return true;
}
function triangleIntersectsDoor(
  plan: BuildingPlanView,
  boxes: readonly DoorBox[],
  points: readonly Point3[],
): boolean {
  return boxes.some((box) =>
    triangleOverlapsBox(
      box.center,
      box.half,
      points.map((point) => doorFrame(plan, box.side, point)),
    ),
  );
}
/**
 * INV-3: no triangle inside any entrance's clear opening. Only enterable plans with floors have a
 * walkable doorway; `kit.door.threshold` (mm) lifts the box bottom above the threshold sill.
 */
export function inspectInv3(
  mesh: MeshPayload,
  plans: readonly BuildingPlanView[],
  kit?: BuildKitView,
): GeometryDiagnostic[] {
  const result: GeometryDiagnostic[] = [];
  const owners = unitOwners(plans);
  const boxesByPlan = new Map(
    plans.map((plan) => {
      const definition = kit?.archetypes[plan.archetype] ?? kit?.landmarks[plan.archetype];
      const hall = definition?.size === 'hall' || definition?.brackets || plan.facility === 'temple';
      const thresholdMm = hall ? Math.max(200, kit?.door.threshold ?? 0) : kit?.door.threshold ?? 0;
      const defaultEntrance = definition?.recipe === 'hall';
      return [plan, doorBoxes(plan, thresholdMm, hall ? 2_000 : 1_200, kit, defaultEntrance)] as const;
    }),
  );
  for (let offset = 0; offset < mesh.index.length; offset += 3) {
    const vertex = mesh.index[offset]!;
    const plan = ownerForVertex(mesh, vertex, owners)?.plan;
    if (!plan) continue;
    if (triangleIntersectsDoor(plan, boxesByPlan.get(plan) ?? [], trianglePoints(mesh, offset)))
      result.push({
        invariant: 'INV-3',
        code: 'TRIANGLE_IN_DOOR',
        message: `triangle occupies ${plan.id} entrance`,
        planId: plan.id,
        triangle: offset / 3,
      });
  }
  return result;
}

function ownerLocalXZ(owner: UnitOwner, worldX: number, worldZ: number): readonly [number, number] {
  if (!owner.part) return localXZ(owner.plan, worldX, worldZ);
  const [, cx, cz, , , yaw] = owner.part;
  const proxy = { ...owner.plan, footprint: [cx, cz, 0, 0], yaw } as BuildingPlanView;
  return localXZ(proxy, worldX, worldZ);
}
/** Spec maximum wall thickness (tech/16 §3: front 120, gable/back 300–600 mm) plus 1 mm. */
const MAX_WALL_BAND_M = 0.601;
/**
 * Depth from the 40 mm inset edge within which a vertical outer surface belongs to that facade:
 * the kit's thickest wall (+1 mm), so both faces of a 120 / 350 / 600 mm wall carry its facade bit.
 */
export function facadeBandM(kit?: Pick<BuildKitView, 'walls'>): number {
  if (!kit) return MAX_WALL_BAND_M;
  const thickest = Math.max(...Object.values(kit.walls).map((wall) => wall.t));
  // Exterior column/bracket inner faces reach 500 mm from the 40 mm inset edge.
  return Math.max(0.5, thickest / 1000) + 0.001;
}
function expectedFacade(owner: UnitOwner, localX: number, localZ: number, bandM: number): number {
  const width = owner.part?.[3] ?? owner.plan.footprint[2];
  const depth = owner.part?.[4] ?? owner.plan.footprint[3];
  const yaw = owner.part?.[5] ?? owner.plan.yaw;
  const halfW = width / 2000 - 0.04;
  const halfD = depth / 2000 - 0.04;
  const atOrOutside = [
    localZ >= halfD - bandM,
    localX <= -halfW + bandM,
    localZ <= -halfD + bandM,
    localX >= halfW - bandM,
  ];
  let positionMask = 0;
  for (let side = 0; side < atOrOutside.length; side += 1)
    if (atOrOutside[side]) positionMask |= 1 << ((side + yaw) % 4);
  return positionMask;
}
function expectedColumnCorner(
  owner: UnitOwner, localX: number, localZ: number, kit?: BuildKitView,
): number {
  if (!kit || owner.part) return 0;
  const definition = kit.archetypes[owner.plan.archetype] ?? kit.landmarks[owner.plan.archetype];
  if (definition?.recipe !== 'hall') return 0;
  const layout = columnLayout(owner.plan, kit);
  const tolerance = layout.diameterM / 2 + 0.001;
  const atLeft = Math.abs(localX - layout.xM[0]!) <= tolerance;
  const atRight = Math.abs(localX - layout.xM.at(-1)!) <= tolerance;
  const atBack = Math.abs(localZ - layout.zM[0]!) <= tolerance;
  const atFront = Math.abs(localZ - layout.zM.at(-1)!) <= tolerance;
  let mask = 0;
  if (atFront) mask |= 1 << owner.plan.yaw;
  if (atLeft) mask |= 1 << ((owner.plan.yaw + 1) % 4);
  if (atBack) mask |= 1 << ((owner.plan.yaw + 2) % 4);
  if (atRight) mask |= 1 << ((owner.plan.yaw + 3) % 4);
  return mask;
}
function hasRoof(owner: UnitOwner): boolean {
  return (owner.part?.[7] ?? owner.plan.roof[0]) !== 0;
}
export function inspectInv5(
  shell: MeshPayload,
  roof: MeshPayload,
  plans: readonly BuildingPlanView[],
  cellUnits?: readonly number[] | Uint16Array,
  kit?: BuildKitView,
): GeometryDiagnostic[] {
  const result: GeometryDiagnostic[] = [];
  const owners = unitOwners(plans);
  const bandM = facadeBandM(kit);
  const roofUnits = new Set<number>();
  for (let vertex = 0; vertex < shell.position.length / 3; vertex += 1) {
    const unit = shell.unit[vertex * 2]!;
    if (!owners[unit])
      result.push({
        invariant: 'INV-5',
        code: 'INVALID_SHELL_UNIT',
        message: `shell vertex has invalid unit ${unit}`,
        vertex,
      });
  }
  for (let vertex = 0; vertex < roof.position.length / 3; vertex += 1) {
    const unit = roof.unit[vertex * 2]!;
    roofUnits.add(unit);
    if (!owners[unit])
      result.push({
        invariant: 'INV-5',
        code: 'INVALID_ROOF_UNIT',
        message: `roof vertex has invalid unit ${unit}`,
        vertex,
      });
  }
  const requiredUnits = cellUnits ?? owners.map((_, unit) => unit);
  for (const unit of requiredUnits) {
    const owner = owners[unit];
    if (!owner) continue;
    if (hasRoof(owner) && !roofUnits.has(unit))
      result.push({
        invariant: 'INV-5',
        code: 'MISSING_ROOF_UNIT',
        message: `unit ${unit} has no roof vertices`,
        planId: owner.plan.id,
      });
  }
  for (let vertex = 0; vertex < shell.position.length / 3; vertex += 1) {
    const owner = ownerForVertex(shell, vertex, owners);
    if (!owner) {
      const actual = shell.mat[vertex * 4 + 3]!;
      if (actual !== 0)
        result.push({
          invariant: 'INV-5',
          code: 'FACADE_MISMATCH',
          message: `facade mask ${actual} belongs to an invalid shell unit`,
          vertex,
        });
      continue;
    }
    const plan = owner.plan;
    const offset = vertex * 3;
    const [x, z] = ownerLocalXZ(owner, shell.position[offset]!, shell.position[offset + 2]!);
    const actual = shell.mat[vertex * 4 + 3]!;
    const flags = shell.mat[vertex * 4 + 2]!;
    const nx = shell.normal[vertex * 4]! / 127;
    const nz = shell.normal[vertex * 4 + 2]! / 127;
    const verticalOutside = nx * nx + nz * nz > 0.9 && (flags & 0b110110) === 0;
    const allowed = expectedFacade(owner, x, z, bandM) | expectedColumnCorner(owner, x, z, kit);
    const cornerMask = actual !== 0 && (actual & (actual - 1)) !== 0;
    const diagonal = Math.abs(nx) > 0.2 && Math.abs(nz) > 0.2;
    const adjacentPair = cornerMask && (actual === 0b0011 || actual === 0b0110 ||
      actual === 0b1100 || actual === 0b1001);
    const realCorner = adjacentPair && (actual & allowed) === actual;
    const wrongVertical =
      verticalOutside &&
      (allowed === 0
        ? actual !== 0
        : actual === 0 ||
          (actual & ~allowed) !== 0 ||
          (cornerMask && !realCorner) ||
          (diagonal && actual !== allowed));
    const wrongOther =
      !verticalOutside &&
      (flags & (1 << 2)) === 0 &&
      actual !== 0 &&
      (cornerMask && !realCorner);
    if (wrongVertical || wrongOther)
      result.push({
        invariant: 'INV-5',
        code: 'FACADE_MISMATCH',
        message: `facade mask ${actual} disagrees with ${plan.id} vertex position`,
        planId: plan.id,
        vertex,
      });
  }
  return result;
}

const SAMPLE_STEP_M = 0.05;
const FLOOR_INSET_M = 0.01;
function distance(a: Point3, b: Point3): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
/** Both orientations of every barycentric cell are sampled; spacing is at most 50 mm. */
function sampleTriangle50(
  points: readonly Point3[],
  predicate: (point: Point3) => boolean,
): boolean {
  const [a, b, c] = points as unknown as readonly [Point3, Point3, Point3];
  const divisions = Math.max(
    1,
    Math.ceil(Math.max(distance(a, b), distance(b, c), distance(c, a)) / SAMPLE_STEP_M),
  );
  const sample = (wb: number, wc: number): boolean => {
    const wa = 1 - wb - wc;
    return predicate([
      a[0] * wa + b[0] * wb + c[0] * wc,
      a[1] * wa + b[1] * wb + c[1] * wc,
      a[2] * wa + b[2] * wb + c[2] * wc,
    ]);
  };
  for (let row = 0; row < divisions; row += 1)
    for (let column = 0; column < divisions - row; column += 1) {
      if (sample((column + 1 / 3) / divisions, (row + 1 / 3) / divisions)) return true;
      if (column + row < divisions - 1)
        if (sample((column + 2 / 3) / divisions, (row + 2 / 3) / divisions)) return true;
    }
  return false;
}
function pointInFloor(plan: BuildingPlanView, point: Point3, insetM: number): number {
  for (let index = 0; index < plan.floors.length; index += 1) {
    const [x0, z0, x1, z1] = plan.floors[index]!;
    if (
      point[0] > x0 / 1000 + insetM &&
      point[0] < x1 / 1000 - insetM &&
      point[2] > z0 / 1000 + insetM &&
      point[2] < z1 / 1000 - insetM
    )
      return index;
  }
  return -1;
}
function fixtureContains(
  plan: BuildingPlanView,
  fixture: BuildingPlanView['fixtures'][number],
  point: Point3,
): boolean {
  const [localX, localZ] = localXZ(plan, point[0], point[2]);
  const [, cxMm, czMm, wMm, dMm, yaw] = fixture;
  const halfX = (yaw % 2 === 0 ? wMm : dMm) / 2000 + FLOOR_INSET_M;
  const halfZ = (yaw % 2 === 0 ? dMm : wMm) / 2000 + FLOOR_INSET_M;
  return Math.abs(localX - cxMm / 1000) <= halfX &&
    Math.abs(localZ - czMm / 1000) <= halfZ;
}
function blockingFixtureContains(plan: BuildingPlanView, point: Point3): boolean {
  return plan.fixtures.some((fixture) => fixture[6] === 1 && fixtureContains(plan, fixture, point));
}
interface FixtureClearance {
  readonly fixture: BuildingPlanView['fixtures'][number];
  readonly legal: boolean;
}
function nonBlockingClearances(
  mesh: MeshPayload,
  owner: UnitOwner,
  owners: readonly UnitOwner[],
): readonly FixtureClearance[] {
  if (owner.part) return [];
  return owner.plan.fixtures.filter((fixture) => fixture[6] === 0 && fixture[3] > 0 && fixture[4] > 0)
    .map((fixture) => {
      let minY = Number.POSITIVE_INFINITY;
      let maxY = Number.NEGATIVE_INFINITY;
      for (let vertex = 0; vertex < mesh.position.length / 3; vertex += 1) {
        if (ownerForVertex(mesh, vertex, owners) !== owner) continue;
        // bit 5 distinguishes sampled fixture geometry from floor/shell triangles in the same rect.
        if ((mesh.mat[vertex * 4 + 2]! & (1 << 5)) === 0) continue;
        const point: Point3 = [
          mesh.position[vertex * 3]!, mesh.position[vertex * 3 + 1]!, mesh.position[vertex * 3 + 2]!,
        ];
        if (!fixtureContains(owner.plan, fixture, point)) continue;
        minY = Math.min(minY, point[1]);
        maxY = Math.max(maxY, point[1]);
      }
      const floor = floorHeightM(owner.plan, 0);
      const hasGeometry = Number.isFinite(minY) && Number.isFinite(maxY);
      return {
        fixture,
        legal: hasGeometry &&
          (maxY - minY <= 0.25 + 0.000_01 || minY >= floor + 2.2 - 0.000_01),
      };
    });
}
function floorHeightM(plan: BuildingPlanView, floorIndex: number): number {
  return (plan.elev[0] + (plan.floorY[floorIndex] ?? plan.floorY[0] ?? plan.elev[1])) / 1000;
}
function ownerPointInFloor(owner: UnitOwner, point: Point3): number {
  return pointInFloor(owner.plan, point, FLOOR_INSET_M);
}
function ownerFloorHeightM(owner: UnitOwner, floorIndex: number): number {
  if (!owner.part) return floorHeightM(owner.plan, floorIndex);
  return (owner.plan.elev[0] + owner.part[10]) / 1000;
}
/** Fixture geometry carries flag bit 5 on every corner; only such triangles may use a legal
 *  non-blocking fixture's exemption, so a cushion cannot hide a wall or column in its rectangle. */
function fixtureTriangle(mesh: MeshPayload, triangleOffset: number): boolean {
  for (let corner = 0; corner < 3; corner += 1)
    if ((mesh.mat[mesh.index[triangleOffset + corner]! * 4 + 2]! & (1 << 5)) === 0) return false;
  return true;
}
function obstructsClearance(
  owner: UnitOwner,
  point: Point3,
  clearances: readonly FixtureClearance[],
  ownFixtureGeometry: boolean,
): boolean {
  const floorIndex = ownerPointInFloor(owner, point);
  if (
    floorIndex < 0 ||
    blockingFixtureContains(owner.plan, point) ||
    (ownFixtureGeometry &&
      clearances.some(({ fixture, legal }) => legal && fixtureContains(owner.plan, fixture, point)))
  )
    return false;
  const floor = ownerFloorHeightM(owner, floorIndex);
  return point[1] > floor + 0.05 && point[1] < floor + 2.2;
}
function belowRoofClearance(owner: UnitOwner, point: Point3): boolean {
  const floorIndex = ownerPointInFloor(owner, point);
  if (floorIndex < 0) return false;
  return point[1] < ownerFloorHeightM(owner, floorIndex) + 2.2;
}

export function inspectInv2(
  mesh: MeshPayload,
  plans: readonly BuildingPlanView[],
): GeometryDiagnostic[] {
  if (mesh.index.length === 0) return [];
  const result: GeometryDiagnostic[] = [];
  const owners = unitOwners(plans);
  const clearances = new Map<UnitOwner, readonly FixtureClearance[]>();
  for (let offset = 0; offset < mesh.index.length; offset += 3) {
    const firstVertex = mesh.index[offset]!;
    const owner = ownerForVertex(mesh, firstVertex, owners);
    if (!owner) continue;
    let ownerClearances = clearances.get(owner);
    if (!ownerClearances) {
      ownerClearances = nonBlockingClearances(mesh, owner, owners);
      clearances.set(owner, ownerClearances);
    }
    const points = trianglePoints(mesh, offset);
    const ownFixtureGeometry = fixtureTriangle(mesh, offset);
    if (sampleTriangle50(points,
      (point) => obstructsClearance(owner, point, ownerClearances, ownFixtureGeometry)))
      result.push({
        invariant: 'INV-2',
        code: 'CLEARANCE_BLOCKED',
        message: `triangle blocks ${owner.plan.id} 2.2 m clearance`,
        planId: owner.plan.id,
        triangle: offset / 3,
      });
  }
  return result;
}
export function inspectInv4(
  mesh: MeshPayload,
  plans: readonly BuildingPlanView[],
): GeometryDiagnostic[] {
  if (mesh.index.length === 0) return [];
  const result: GeometryDiagnostic[] = [];
  const owners = unitOwners(plans);
  for (let offset = 0; offset < mesh.index.length; offset += 3) {
    const owner = ownerForVertex(mesh, mesh.index[offset]!, owners);
    if (!owner) continue;
    const points = trianglePoints(mesh, offset);
    if (sampleTriangle50(points, (point) => belowRoofClearance(owner, point)))
      result.push({
        invariant: 'INV-4',
        code: 'ROOF_BELOW_CLEARANCE',
        message: `roof triangle is below ${owner.plan.id} 2.2 m clearance`,
        planId: owner.plan.id,
        triangle: offset / 3,
      });
  }
  return result;
}
export function inspectInv6(
  _mesh: MeshPayload,
  _plans: readonly BuildingPlanView[],
): GeometryDiagnostic[] {
  return buildgenNotImplemented('inspectInv6');
}
export function inspectCoreGeometry(
  shell: MeshPayload,
  roof: MeshPayload,
  plans: readonly BuildingPlanView[],
  cellUnits?: readonly number[] | Uint16Array,
  shellHangingProps: readonly HangingPropGeometry[] = [],
  roofHangingProps: readonly HangingPropGeometry[] = [],
  kit?: BuildKitView,
): GeometryDiagnostic[] {
  return [
    ...inspectInv1(shell, plans, shellHangingProps),
    ...inspectInv1(roof, plans, roofHangingProps),
    ...inspectInv2(shell, plans),
    ...inspectInv4(roof, plans),
    ...inspectInv3(shell, plans, kit),
    ...inspectInv3(roof, plans, kit),
    ...inspectInv5(shell, roof, plans, cellUnits, kit),
  ];
}
