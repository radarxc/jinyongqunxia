import type { BuildingPlanView, BuildKitView, MeshWriter } from '../../types';
import { quad, type PrimitiveMaterial, type Vec3 } from '../core/prims';
import { hallOrigin, hallSizeM, kitLayer } from './platform';

export const PENT_EAVE_SLOPE = 0.45;

export interface PentEaveOptions {
  readonly writer: MeshWriter;
  readonly plan: BuildingPlanView;
  readonly unit: number;
  readonly kit: BuildKitView;
  readonly bearerM: number;
  readonly projectionM?: number;
  readonly innerHalfWidthM?: number;
  readonly innerHalfDepthM?: number;
  readonly thicknessM?: number;
}
export interface PentEaveMeasure {
  readonly projectionM: number;
  readonly projectionXM: number;
  readonly projectionZM: number;
  readonly bottomM: number;
}

/** Four-sided 0.45-pitch waist eave, wholly inside the plan footprint. */
export function emitPentEave(options: PentEaveOptions): PentEaveMeasure {
  const { writer, plan, unit, kit, bearerM } = options;
  const [width, depth] = hallSizeM(plan);
  const requestedM =
    options.projectionM ?? Math.max(0.7, Math.min(0.9, kit.dims.middle.eave / 1000));
  const thicknessM = options.thicknessM ?? 0.16;
  const x = width / 2;
  const z = depth / 2;
  const xi = options.innerHalfWidthM ?? x - requestedM;
  const zi = options.innerHalfDepthM ?? z - requestedM;
  const projectionXM = x - xi;
  const projectionZM = z - zi;
  const toleranceM = 0.000_001;
  if (
    projectionXM < 0.7 - toleranceM ||
    projectionXM > 0.9 + toleranceM ||
    projectionZM < 0.7 - toleranceM ||
    projectionZM > 0.9 + toleranceM
  )
    throw new RangeError('BUILDGEN_PENT_EAVE_INVALID_PROJECTION');
  if (Math.abs(projectionXM - projectionZM) > 0.001)
    throw new RangeError('BUILDGEN_PENT_EAVE_UNEVEN_PROJECTION');
  const projectionM = Math.max(projectionXM, projectionZM);
  const dripM = bearerM - projectionM * PENT_EAVE_SLOPE;
  const bottomM = dripM - thicknessM;
  const material: PrimitiveMaterial = {
    layer: kitLayer(kit, 'tile_roof'),
    ao: 210,
    flags: 1 << 4,
    unit,
    localGroundM: (plan.elev[0] + (plan.floorY[0] ?? plan.elev[1])) / 1000,
  };
  const origin = hallOrigin(plan);
  const transform = { origin, yaw: plan.yaw } as const;
  const strips: readonly (readonly [Vec3, Vec3, Vec3, Vec3])[] = [
    [
      [-x, dripM, z],
      [x, dripM, z],
      [xi, bearerM, zi],
      [-xi, bearerM, zi],
    ],
    [
      [x, dripM, -z],
      [-x, dripM, -z],
      [-xi, bearerM, -zi],
      [xi, bearerM, -zi],
    ],
    [
      [-x, dripM, -z],
      [-x, dripM, z],
      [-xi, bearerM, zi],
      [-xi, bearerM, -zi],
    ],
    [
      [x, dripM, z],
      [x, dripM, -z],
      [xi, bearerM, -zi],
      [xi, bearerM, zi],
    ],
  ];
  for (const top of strips) {
    quad(writer, top, material, transform);
    quad(
      writer,
      [
        top[3],
        top[2],
        [top[1][0], top[1][1] - thicknessM, top[1][2]],
        [top[0][0], top[0][1] - thicknessM, top[0][2]],
      ],
      { ...material, layer: kitLayer(kit, 'eave_soffit', 'timber_raw') },
      transform,
    );
    quad(
      writer,
      [
        top[0],
        [top[0][0], top[0][1] - thicknessM, top[0][2]],
        [top[1][0], top[1][1] - thicknessM, top[1][2]],
        top[1],
      ],
      material,
      transform,
    );
  }
  return { projectionM, projectionXM, projectionZM, bottomM };
}
