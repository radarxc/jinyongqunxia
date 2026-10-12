import type { BuildingPlanView, RecipeSink } from '../../types';
import type { PrimitiveMaterial } from '../core/prims';
import { writeRoofPatch } from './patch';

export interface CanopyRoofOptions {
  readonly plan: BuildingPlanView;
  readonly unit: number;
  readonly sink: Pick<RecipeSink, 'roof'>;
  readonly layer?: number | undefined;
  readonly uSegments?: number | undefined;
  readonly tSegments?: number | undefined;
}

/** Deterministic catenary-like cloth: centre sag is exactly 3% of its span. */
export function writeCanopyRoof(options: CanopyRoofOptions): void {
  const { plan, sink, unit } = options;
  const width = plan.footprint[2] / 1000 - 0.08;
  const depth = plan.footprint[3] / 1000 - 0.08;
  const base = (plan.elev[0] + plan.elev[1]) / 1000;
  const sag = depth * 0.03;
  const eaveHeight = base + plan.roof[1] / 1000;
  const ridgeHeight = base + plan.roof[2] / 1000;
  const heightAt = (t: number): number =>
    eaveHeight + (ridgeHeight - eaveHeight) * t - 4 * sag * t * (1 - t);
  let lowerEdge = Infinity;
  for (let sample = 0; sample <= 64; sample += 1)
    lowerEdge = Math.min(lowerEdge, heightAt(sample / 64));
  if (lowerEdge < plan.elev[0] / 1000 + 2.25)
    throw new RangeError('BUILDGEN_ROOF_CANOPY_CLEARANCE');
  const material: PrimitiveMaterial = {
    layer: options.layer ?? 15,
    unit,
    localGroundM: (plan.elev[0] + (plan.floorY[0] ?? 0)) / 1000,
  };
  writeRoofPatch(sink.roof, {
    eaveLine: [
      [-width / 2, eaveHeight, depth / 2],
      [width / 2, eaveHeight, depth / 2],
    ],
    ridgeLine: [
      [-width / 2, ridgeHeight, -depth / 2],
      [width / 2, ridgeHeight, -depth / 2],
    ],
    heightAt,
    uSegments: options.uSegments,
    tSegments: options.tSegments ?? Math.max(4, Math.ceil(depth)),
    material,
    origin: [plan.footprint[0] / 1000, 0, plan.footprint[1] / 1000],
    yaw: plan.yaw,
  });
}
