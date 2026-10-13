import type { BuildingPlanView, RecipeSink } from '../../types';
import type { PrimitiveMaterial, Vec3 } from '../core/prims';
import { writeRoofShell } from './shell';

export const ROLLED_RIDGE_RADIUS_M = 0.35;
const ARC_JOIN_M = ROLLED_RIDGE_RADIUS_M / Math.SQRT2;

export interface RolledRoofOptions {
  readonly plan: BuildingPlanView;
  readonly unit: number;
  readonly sink: Pick<RecipeSink, 'roof'>;
  readonly layer?: number | undefined;
  readonly soffitLayer?: number | undefined;
  readonly shellThicknessMm?: number | undefined;
  readonly lod?: 0 | 1 | undefined;
}

function material(plan: BuildingPlanView, unit: number, layer: number): PrimitiveMaterial {
  return { layer, unit, localGroundM: (plan.elev[0] + (plan.floorY[0] ?? 0)) / 1000 };
}
function hermite(
  y0: number,
  y1: number,
  m0: number,
  m1: number,
  length: number,
  u: number,
): number {
  const u2 = u * u;
  const u3 = u2 * u;
  return (
    (2 * u3 - 3 * u2 + 1) * y0 +
    (u3 - 2 * u2 + u) * length * m0 +
    (-2 * u3 + 3 * u2) * y1 +
    (u3 - u2) * length * m1
  );
}

/** Symmetric half-profile with an exact radius-350 mm circular crown and C1 flank joins. */
export function rolledRoofHeightAt(
  distanceFromRidgeM: number,
  halfDepthM: number,
  dripY: number,
  crownY: number,
): number {
  const z = Math.max(0, Math.min(halfDepthM, distanceFromRidgeM));
  if (halfDepthM <= ARC_JOIN_M) {
    const normalized = z / halfDepthM;
    return crownY + (dripY - crownY) * normalized * normalized;
  }
  if (z <= ARC_JOIN_M)
    return crownY - ROLLED_RIDGE_RADIUS_M + Math.sqrt(ROLLED_RIDGE_RADIUS_M ** 2 - z ** 2);
  const joinY = crownY - ROLLED_RIDGE_RADIUS_M + ROLLED_RIDGE_RADIUS_M / Math.SQRT2;
  const length = halfDepthM - ARC_JOIN_M;
  const u = (z - ARC_JOIN_M) / length;
  return hermite(joinY, dripY, -1, (dripY - joinY) / length, length, u);
}

/** Juanpeng has two shell halves and deliberately emits no main ridge. */
export function writeRolledRoof(options: RolledRoofOptions): void {
  const { plan, unit, sink } = options;
  const halfWidth = plan.footprint[2] / 2000 - 0.04;
  const halfDepth = plan.footprint[3] / 2000 - 0.04;
  const baseY = (plan.elev[0] + plan.elev[1]) / 1000;
  const dripY = baseY + plan.roof[1] / 1000;
  const crownY = baseY + plan.roof[2] / 1000;
  if (!(crownY > dripY)) throw new RangeError('BUILDGEN_ROOF_INVALID_ROLLED_HEIGHT');
  const segments = options.lod === 1 ? 8 : 16;
  const joinT = 1 - ARC_JOIN_M / halfDepth;
  const stations = Array.from({ length: segments + 1 }, (_, index) => index / segments);
  if (joinT > 0 && joinT < 1) stations.push(joinT);
  // Four equal-angle crown chords keep the actual mesh normal turn at the ridge <= 11.25 degrees.
  for (let step = 1; step < 4; step += 1) {
    const distance = ROLLED_RIDGE_RADIUS_M * Math.sin((Math.PI * step) / 16);
    stations.push(1 - distance / halfDepth);
  }
  stations.sort((a, b) => a - b);
  const tStations = stations.filter(
    (value, index) => index === 0 || Math.abs(value - stations[index - 1]!) > 1e-9,
  );
  const origin: Vec3 = [plan.footprint[0] / 1000, 0, plan.footprint[1] / 1000];
  const tile = material(plan, unit, options.layer ?? 0);
  const underside = material(plan, unit, options.soffitLayer ?? 2);
  for (const side of [-1, 1] as const)
    writeRoofShell(sink.roof, {
      eaveLine: [
        [-halfWidth, dripY, side * halfDepth],
        [halfWidth, dripY, side * halfDepth],
      ],
      ridgeLine: [
        [-halfWidth, crownY, 0],
        [halfWidth, crownY, 0],
      ],
      heightAt: (t) => rolledRoofHeightAt(halfDepth * (1 - t), halfDepth, dripY, crownY),
      tSegments: tStations.length - 1,
      tStations,
      material: tile,
      undersideMaterial: underside,
      fasciaMaterial: underside,
      closeVerges: true,
      thicknessMm: options.shellThicknessMm,
      origin,
      yaw: plan.yaw,
    });
}
