import type { BuildKitView, EntranceView } from '../../types';
import { box } from '../core/prims';
import { hallOrigin, hallSizeM, kitLayer, stepFlight, type HallPartContext } from './platform';

export const STEP_RISE_M = 0.15;
export const STEP_RUN_M = 0.3;

/**
 * Steps rise inward from the footprint edge, so the complete flight remains on the platform; the
 * flight span comes from `stepFlight()` (shared with the platform cutout) and never leaves the
 * 40 mm inset footprint even for large entrance offsets.
 */
export function emitSteps(
  context: HallPartContext,
  kit: BuildKitView,
  entrances: readonly EntranceView[],
): void {
  const { writer, plan, unit, localGroundM } = context;
  const [width, depth] = hallSizeM(plan);
  const base = plan.elev[0] / 1000;
  const platformM = plan.elev[1] / 1000;
  const count = Math.ceil(platformM / STEP_RISE_M);
  if (count <= 0) return;
  const maxDepth = Math.min(width, depth);
  for (const [side, offsetMm, doorWidthMm] of entrances) {
    const flight = stepFlight(side, offsetMm, doorWidthMm, width, depth);
    for (let index = 0; index < count; index += 1) {
      const run = Math.min(maxDepth, STEP_RUN_M);
      const top = Math.min(platformM, (index + 1) * STEP_RISE_M);
      const inward = index * STEP_RUN_M + run / 2;
      const centre: [number, number, number] =
        side % 2 === 0
          ? [
              flight.centre,
              base + top / 2,
              side === 0 ? depth / 2 - inward : -depth / 2 + inward,
            ]
          : [
              side === 1 ? -width / 2 + inward : width / 2 - inward,
              base + top / 2,
              flight.centre,
            ];
      box(writer, {
        center: centre,
        size: side % 2 === 0 ? [flight.width, top, run] : [run, top, flight.width],
        origin: hallOrigin(plan),
        yaw: plan.yaw,
        unit,
        localGroundM,
        layer: kitLayer(kit, 'stone_dressed', 'stone_rubble', 'stone'),
        ao: 210,
        flags: 1 << 4,
        facade: 0,
      });
    }
  }
}
