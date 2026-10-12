import type { BuildingPlanView, BuildKitView, Recipe, RecipeSink } from '../../types';
import { box } from '../core/prims';
import { roofMesherFor } from '../roof';
import { emitPlatform, hallOrigin, hallSizeM, kitLayer, type HallPartContext } from '../parts/platform';
import { emitSteps } from '../parts/steps';
import { emitColumns } from '../parts/columns';
import { emitBeams, hallHeights, type HallHeights } from '../parts/beams';
import { emitWalls, hallEntrances } from '../parts/walls';
import { emitFrames } from '../parts/frames';
import { emitBrackets } from '../parts/brackets';
import { emitDressing } from '../parts/dressing';

export interface HallBodyResult {
  readonly heights: HallHeights;
}

export function emitHallBody(
  plan: BuildingPlanView,
  unit: number,
  kit: BuildKitView,
  lod: 0 | 1,
  sink: RecipeSink,
): HallBodyResult {
  const floorM = (plan.elev[0] + (plan.floorY[0] ?? plan.elev[1])) / 1000;
  const context: HallPartContext = { writer: sink.shell, plan, unit, localGroundM: floorM };
  const entrances = hallEntrances(plan, kit);
  emitPlatform(context, kit, entrances);
  emitSteps(context, kit, entrances);
  const layout = emitColumns(context, kit, lod);
  const heights = emitBeams(context, kit, layout);
  const walls = emitWalls(context, kit, layout, heights);
  emitFrames(context, kit, walls.openings, sink);
  emitBrackets(context, kit, layout, heights, lod);
  emitDressing(context, kit, heights, sink, lod, walls.openings);
  return { heights };
}

function fallbackRoof(
  plan: BuildingPlanView,
  unit: number,
  kit: BuildKitView,
  sink: RecipeSink,
  heights: HallHeights,
): void {
  const [width, depth] = hallSizeM(plan);
  const ridge = (plan.elev[0] + plan.elev[1] + plan.roof[2]) / 1000;
  const eave = (plan.elev[0] + plan.elev[1] + plan.roof[1]) / 1000;
  const bottom = Math.max(heights.bodyTopM, eave);
  box(sink.roof, {
    center: [0, bottom + Math.max(0.04, ridge - bottom) / 2, 0],
    size: [width, Math.max(0.04, ridge - bottom), depth],
    origin: hallOrigin(plan),
    yaw: plan.yaw,
    unit,
    localGroundM: heights.floorM,
    layer: kitLayer(kit, 'tile_roof'),
    ao: 180,
    flags: 1 << 4,
  });
  // r0's aUnit regression reads the roof-attachment/eave ring from shell; r2 replaces this
  // marker once the real roof mesh owns the eave geometry.
  box(sink.shell, {
    center: [0, eave - 0.02, 0],
    size: [width, 0.04, depth],
    origin: hallOrigin(plan),
    yaw: plan.yaw,
    unit,
    localGroundM: heights.floorM,
    layer: kitLayer(kit, 'timber_raw', 'timber_painted', kit.walls.front.layer),
    ao: 180,
    flags: 1 << 2,
  });
}

export const hallRecipe: Recipe = (plan, unit, kit, lod, sink) => {
  if (plan.storeys !== 1) throw new RangeError('BUILDGEN_HALL_REQUIRES_ONE_STOREY');
  const { heights } = emitHallBody(plan, unit, kit, lod, sink);
  try {
    roofMesherFor(plan.roof[0])(plan, unit, sink);
  } catch (error) {
    if (!(error instanceof Error) || error.message !== 'BUILDGEN_NOT_IMPLEMENTED:roofMesher')
      throw error;
    fallbackRoof(plan, unit, kit, sink, heights);
  }
};

export function measureHallBody(plan: BuildingPlanView, kit: BuildKitView): HallHeights {
  const floorM = (plan.elev[0] + (plan.floorY[0] ?? plan.elev[1])) / 1000;
  return hallHeights({ writer: {} as never, plan, unit: 0, localGroundM: floorM }, kit);
}
