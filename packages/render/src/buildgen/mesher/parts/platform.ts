import type { BuildingPlanView, BuildKitView, EntranceView, MeshWriter } from '../../types';
import { quad } from '../core/prims';

export const HALL_INSET_M = 0.04;
const EDGE_M = 0.12;
const STEP_RUN_M = 0.3;
const STEP_RISE_M = 0.15;

export interface HallPartContext {
  readonly writer: MeshWriter;
  readonly plan: BuildingPlanView;
  readonly unit: number;
  readonly localGroundM: number;
}

export function hallOrigin(plan: BuildingPlanView): readonly [number, number, number] {
  return [plan.footprint[0] / 1000, 0, plan.footprint[1] / 1000];
}

export function hallSizeM(plan: BuildingPlanView): readonly [number, number] {
  return [plan.footprint[2] / 1000 - HALL_INSET_M * 2, plan.footprint[3] / 1000 - HALL_INSET_M * 2];
}

export function kitLayer(kit: BuildKitView, ...ids: readonly string[]): number {
  for (const id of ids) {
    const index = kit.layers.findIndex((layer) => layer.id === id);
    if (index >= 0) return index;
  }
  return 0;
}

/**
 * Stair flight on one entrance edge, shared by the steps and the platform cutout: final door width
 * + 600 mm (capped to the edge), centred on the door but shifted inward when a large plan offset
 * would push it past the 40 mm inset footprint. The door itself keeps its plan offset.
 * `centre` is the along-edge local coordinate (x on sides 0 / 2, z on sides 1 / 3).
 */
export function stepFlight(
  side: number, offsetMm: number, doorWidthMm: number, width: number, depth: number,
): { readonly centre: number; readonly width: number } {
  const across = side % 2 === 0 ? width : depth;
  const flightWidth = Math.min(across, doorWidthMm / 1000 + 0.6);
  const limit = (across - flightWidth) / 2;
  const doorCentre = side === 0 || side === 1 ? offsetMm / 1000 : -offsetMm / 1000;
  return { centre: Math.max(-limit, Math.min(limit, doorCentre)), width: flightWidth };
}

interface Cutout {
  readonly x0: number; readonly x1: number; readonly z0: number; readonly z1: number;
}
function stepCutouts(
  entrances: readonly EntranceView[], width: number, depth: number, height: number,
): Cutout[] {
  const run = Math.ceil(height / STEP_RISE_M) * STEP_RUN_M;
  return entrances.map(([side, offsetMm, doorWidthMm]) => {
    const flight = stepFlight(side, offsetMm, doorWidthMm, width, depth);
    const lo = flight.centre - flight.width / 2; const hi = flight.centre + flight.width / 2;
    if (side === 0) return { x0: lo, x1: hi, z0: depth / 2 - run, z1: depth / 2 };
    if (side === 1) return { x0: -width / 2, x1: -width / 2 + run, z0: lo, z1: hi };
    if (side === 2) return { x0: lo, x1: hi, z0: -depth / 2, z1: -depth / 2 + run };
    return { x0: width / 2 - run, x1: width / 2, z0: lo, z1: hi };
  });
}
function insideCutout(x: number, z: number, cutouts: readonly Cutout[]): boolean {
  return cutouts.some((cutout) => x > cutout.x0 && x < cutout.x1 && z > cutout.z0 && z < cutout.z1);
}
function emitPlatformQuad(
  context: HallPartContext, points: readonly [number, number, number][], layer: number, ao: number,
): void {
  quad(context.writer, points as [typeof points[0], typeof points[0], typeof points[0], typeof points[0]],
    { layer, ao, flags: 1 << 4, facade: 0, unit: context.unit, localGroundM: context.localGroundM },
    { origin: hallOrigin(context.plan), yaw: context.plan.yaw });
}

export function emitPlatform(
  context: HallPartContext, kit: BuildKitView, entrances: readonly EntranceView[] = [],
): void {
  const { plan } = context;
  const [width, depth] = hallSizeM(plan);
  const base = plan.elev[0] / 1000;
  const height = plan.elev[1] / 1000;
  if (height <= 0) return;
  const edge = Math.min(EDGE_M, height / 2);
  const cutouts = stepCutouts(entrances, width, depth, height);
  const clipped = (value: number, half: number) => Math.max(-half, Math.min(half, value));
  const xs = [-width / 2, -width / 2 + edge, width / 2 - edge, width / 2];
  const zs = [-depth / 2, -depth / 2 + edge, depth / 2 - edge, depth / 2];
  for (const cutout of cutouts) {
    xs.push(clipped(cutout.x0, width / 2), clipped(cutout.x1, width / 2));
    zs.push(clipped(cutout.z0, depth / 2), clipped(cutout.z1, depth / 2));
  }
  xs.sort((a, b) => a - b); zs.sort((a, b) => a - b);
  const rubble = kitLayer(kit, kit.walls.gable.dado?.layer ?? '', 'stone_rubble', 'stone');
  const dressed = kitLayer(kit, 'stone_dressed', kit.walls.gable.dado?.layer ?? '', 'stone_rubble');
  const occupied = (xi: number, zi: number) => xi >= 0 && zi >= 0 && xi < xs.length - 1 &&
    zi < zs.length - 1 && !insideCutout((xs[xi]! + xs[xi + 1]!) / 2, (zs[zi]! + zs[zi + 1]!) / 2, cutouts);
  for (let xi = 0; xi < xs.length - 1; xi += 1)
    for (let zi = 0; zi < zs.length - 1; zi += 1) {
      const x0 = xs[xi]!; const x1 = xs[xi + 1]!;
      const z0 = zs[zi]!; const z1 = zs[zi + 1]!;
      if (x1 - x0 < 0.001 || z1 - z0 < 0.001 || insideCutout((x0 + x1) / 2, (z0 + z1) / 2, cutouts)) continue;
      const border = x0 <= -width / 2 + edge || x1 >= width / 2 - edge ||
        z0 <= -depth / 2 + edge || z1 >= depth / 2 - edge;
      emitPlatformQuad(context, [[x0, base + height, z1], [x1, base + height, z1],
        [x1, base + height, z0], [x0, base + height, z0]], border ? dressed : rubble, 230);
      if (!occupied(xi - 1, zi)) emitPlatformQuad(context, [[x0, base, z0], [x0, base, z1],
        [x0, base + height, z1], [x0, base + height, z0]], dressed, 199);
      if (!occupied(xi + 1, zi)) emitPlatformQuad(context, [[x1, base, z1], [x1, base, z0],
        [x1, base + height, z0], [x1, base + height, z1]], dressed, 199);
      if (!occupied(xi, zi - 1)) emitPlatformQuad(context, [[x1, base, z0], [x0, base, z0],
        [x0, base + height, z0], [x1, base + height, z0]], dressed, 199);
      if (!occupied(xi, zi + 1)) emitPlatformQuad(context, [[x0, base, z1], [x1, base, z1],
        [x1, base + height, z1], [x0, base + height, z1]], dressed, 199);
    }
}
