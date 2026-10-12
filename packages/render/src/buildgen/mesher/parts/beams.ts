import type { BuildKitView } from '../../types';
import { box } from '../core/prims';
import { hallOrigin, hallSizeM, kitLayer, type HallPartContext } from './platform';
import { hallSizeKey, type ColumnLayout } from './columns';

export interface HallHeights {
  readonly floorM: number;
  readonly columnTopM: number;
  readonly bodyTopM: number;
  readonly frameM: number;
  readonly bracketBandM: number;
}

export function hallHeights(context: HallPartContext, kit: BuildKitView): HallHeights {
  const { plan } = context;
  const size = hallSizeKey(plan, kit);
  const dims = kit.dims[size];
  const floorM = (plan.elev[0] + plan.elev[1]) / 1000;
  const frameM = (dims.beam ?? (size === 'hall' ? 900 : 350)) / 1000;
  const bracketBandM = size === 'hall' ? Math.min(0.55, frameM) : 0;
  const columnTopM = floorM + dims.column / 1000;
  return { floorM, columnTopM, bodyTopM: columnTopM + frameM, frameM, bracketBandM };
}

export function emitBeams(
  context: HallPartContext,
  kit: BuildKitView,
  layout: ColumnLayout,
): HallHeights {
  const { writer, plan, unit, localGroundM } = context;
  const heights = hallHeights(context, kit);
  const [width, depth] = hallSizeM(plan);
  const origin = hallOrigin(plan);
  const beamH = heights.frameM - heights.bracketBandM;
  const common = {
    origin,
    yaw: plan.yaw,
    unit,
    localGroundM,
    layer: kitLayer(kit, 'timber_raw', 'timber_painted', kit.walls.front.layer),
    ao: 220,
    flags: 1,
  } as const;
  const y = heights.columnTopM + heights.bracketBandM + beamH / 2;
  for (let index = 0; index < layout.zM.length; index += 1) {
    const facade =
      index === layout.zM.length - 1 ? 1 << plan.yaw : index === 0 ? 1 << ((plan.yaw + 2) % 4) : 0;
    box(writer, {
      ...common,
      center: [0, y, layout.zM[index]!],
      size: [width, beamH, 0.2],
      facade,
    });
  }
  const sideFacade = [1 << ((plan.yaw + 1) % 4), 1 << ((plan.yaw + 3) % 4)] as const;
  for (const [index, x] of [layout.xM[0]!, layout.xM.at(-1)!].entries())
    box(writer, {
      ...common,
      center: [x, y, 0],
      size: [0.2, beamH, depth],
      facade: sideFacade[index],
    });
  return heights;
}
