import type { BuildingPlanView, RecipeSink } from '../../types';
import { box, type PrimitiveMaterial } from '../core/prims';

export interface FlatRoofOptions {
  readonly plan: BuildingPlanView;
  readonly unit: number;
  readonly sink: Pick<RecipeSink, 'roof'>;
  readonly slabMm?: number | undefined;
  readonly parapetMm?: number | undefined;
  readonly layer?: number | undefined;
  readonly copingLayer?: number | undefined;
  readonly soffitLayer?: number | undefined;
}

/** Xiyu flat slab plus a 450 mm parapet, entirely in the roof/fade buffer. */
export function writeFlatRoof(options: FlatRoofOptions): void {
  const { plan, sink, unit } = options;
  const slabMm = options.slabMm ?? 200;
  const parapetMm = options.parapetMm ?? 450;
  if (!(slabMm >= 150 && slabMm <= 300) || !(parapetMm > 0))
    throw new RangeError('BUILDGEN_ROOF_INVALID_FLAT_DIMENSIONS');
  const width = plan.footprint[2] / 1000 - 0.08;
  const depth = plan.footprint[3] / 1000 - 0.08;
  const base = (plan.elev[0] + plan.elev[1]) / 1000;
  const slabTop = base + plan.roof[1] / 1000;
  const wallTop = base + plan.roof[2] / 1000;
  const origin = [plan.footprint[0] / 1000, 0, plan.footprint[1] / 1000] as const;
  const material: PrimitiveMaterial = {
    unit,
    localGroundM: (plan.elev[0] + (plan.floorY[0] ?? 0)) / 1000,
  };
  box(sink.roof, {
    center: [0, slabTop - slabMm / 2000, 0],
    size: [width, slabMm / 1000, depth],
    origin,
    yaw: plan.yaw,
    ...material,
    layer: options.soffitLayer ?? 2,
  });
  box(sink.roof, {
    center: [0, slabTop + 0.01, 0],
    size: [width, 0.02, depth],
    origin,
    yaw: plan.yaw,
    ...material,
    layer: options.layer ?? 0,
  });
  const height = Math.max(parapetMm / 1000, wallTop - slabTop);
  const thickness = 0.2;
  for (const [x, z, w, d] of [
    [0, depth / 2 - thickness / 2, width, thickness],
    [0, -depth / 2 + thickness / 2, width, thickness],
    [-width / 2 + thickness / 2, 0, thickness, depth - thickness * 2],
    [width / 2 - thickness / 2, 0, thickness, depth - thickness * 2],
  ] as const) {
    box(sink.roof, {
      center: [x, slabTop + height / 2, z],
      size: [w, height, d],
      origin,
      yaw: plan.yaw,
      ...material,
      layer: options.layer ?? 0,
    });
    box(sink.roof, {
      center: [x, slabTop + height - 0.025, z],
      size: [w, 0.05, d],
      origin,
      yaw: plan.yaw,
      ...material,
      layer: options.copingLayer ?? 1,
    });
  }
}
