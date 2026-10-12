import type { BuildKitView } from '../../types';
import { box } from '../core/prims';
import { hallOrigin, hallSizeM, kitLayer, type HallPartContext } from './platform';
import { hallDefinition, type ColumnLayout } from './columns';
import type { HallHeights } from './beams';

/** LOD0 uses five blocks (60 triangles) per group; LOD1 is one painted band. */
export function emitBrackets(
  context: HallPartContext,
  kit: BuildKitView,
  layout: ColumnLayout,
  heights: HallHeights,
  lod: 0 | 1,
): void {
  const role = hallDefinition(context.plan, kit).brackets ?? layout.hall;
  if (!role || heights.bracketBandM <= 0) return;
  const { writer, plan, unit, localGroundM } = context;
  const origin = hallOrigin(plan);
  const groups = [...layout.xM];
  const halfWidth = hallSizeM(plan)[0] / 2;
  for (let bay = 0; bay < layout.xM.length - 1; bay += 1)
    groups.push((layout.xM[bay]! + layout.xM[bay + 1]!) / 2);
  const common = {
    origin,
    yaw: plan.yaw,
    unit,
    localGroundM,
    layer: kitLayer(kit, lod === 1 ? 'painted_band' : 'timber_painted', 'timber_raw'),
    flags: 1,
  } as const;
  if (lod === 1) {
    const left = layout.xM[0]!;
    const right = layout.xM.at(-1)!;
    for (let row = 0; row < layout.zM.length; row += 1)
      box(writer, { ...common,
        center: [(left + right) / 2, heights.columnTopM + heights.bracketBandM / 2, layout.zM[row]!],
        size: [right - left + 0.4, heights.bracketBandM, 0.12], ao: 180,
        facade: 1 << ((plan.yaw + (row === 0 ? 2 : 0)) % 4),
      });
    return;
  }
  for (let row = 0; row < layout.zM.length; row += 1)
    for (const x of groups) for (let tier = 0; tier < 5; tier += 1) {
      const y = heights.columnTopM + (heights.bracketBandM * (tier + 0.5)) / 5;
      const alongX = tier % 2 === 0;
      const z = layout.zM[row]!;
      const reach = Math.min(0.28 + tier * 0.055, halfWidth - 0.04 - Math.abs(x),
        alongX ? Infinity : 0.15);
      box(writer, {
        ...common,
        center: [x, y, z],
        size: alongX
          ? [reach * 2, heights.bracketBandM / 5, 0.14]
          : [0.14, heights.bracketBandM / 5, reach * 2],
        ao: 170,
        facade: 1 << ((plan.yaw + (row === 0 ? 2 : 0)) % 4),
      });
    }
}
