import type { BuildingPlanView, MeshWriter } from '../../types';
import { writeRoofPatch } from '../roof/patch';

export const AWNING_SAG_RATIO = 0.03;
export const AWNING_MIN_CLEARANCE_M = 2.25;

export interface AwningOptions {
  readonly writer: MeshWriter;
  readonly plan: BuildingPlanView;
  readonly unit: number;
  readonly lod: 0 | 1;
  readonly layer: number;
}
export interface AwningMeasure {
  readonly sagM: number;
  readonly lowerEdgeM: number;
  readonly frontM: number;
  readonly backM: number;
}

export function awningEdgeHeights(
  plan: BuildingPlanView,
): readonly [frontM: number, backM: number] {
  const depth = plan.footprint[3] / 1000 - 0.08;
  const sagM = depth * AWNING_SAG_RATIO;
  const baseM = (plan.elev[0] + plan.elev[1]) / 1000;
  const frontM = baseM + plan.roof[1] / 1000;
  const backM = baseM + plan.roof[2] / 1000;
  const deltaM = backM - frontM;
  const lowestT = Math.max(0, Math.min(1, (4 * sagM - deltaM) / (8 * sagM)));
  const rawLowM = frontM + deltaM * lowestT - 4 * sagM * lowestT * (1 - lowestT);
  const liftM = Math.max(0, plan.elev[0] / 1000 + AWNING_MIN_CLEARANCE_M - rawLowM);
  return [frontM + liftM, backM + liftM];
}

/** Stall cloth awning with exactly 3% parabolic sag across its depth. */
export function emitAwning(options: AwningOptions): AwningMeasure {
  const { writer, plan, unit, lod, layer } = options;
  const width = plan.footprint[2] / 1000 - 0.08;
  const depth = plan.footprint[3] / 1000 - 0.08;
  const [frontM, backM] = awningEdgeHeights(plan);
  const sagM = depth * AWNING_SAG_RATIO;
  const heightAt = (t: number): number => frontM + (backM - frontM) * t - 4 * sagM * t * (1 - t);
  let lowerEdgeM = Infinity;
  for (let sample = 0; sample <= 64; sample += 1)
    lowerEdgeM = Math.min(lowerEdgeM, heightAt(sample / 64));
  if (lowerEdgeM < plan.elev[0] / 1000 + AWNING_MIN_CLEARANCE_M)
    throw new RangeError('BUILDGEN_AWNING_CLEARANCE');
  writeRoofPatch(writer, {
    eaveLine: [
      [-width / 2, frontM, depth / 2],
      [width / 2, frontM, depth / 2],
    ],
    ridgeLine: [
      [-width / 2, backM, -depth / 2],
      [width / 2, backM, -depth / 2],
    ],
    heightAt,
    tSegments: lod === 0 ? Math.max(4, Math.ceil(depth)) : 2,
    material: {
      layer,
      ao: 235,
      flags: 1 << 4,
      unit,
      localGroundM: plan.elev[0] / 1000,
    },
    origin: [plan.footprint[0] / 1000, 0, plan.footprint[1] / 1000],
    yaw: plan.yaw,
  });
  return { sagM, lowerEdgeM, frontM, backM };
}
