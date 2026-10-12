import { ROOF_STYLE, type BuildingPlanView, type BuildKitView, type Recipe } from '../../types';
import { box } from '../core/prims';
import { awningEdgeHeights, emitAwning } from '../parts/awning';
import { hallDefinition } from '../parts/columns';
import { hallOrigin, hallSizeM, kitLayer } from '../parts/platform';
import { roofMesherFor } from '../roof';
import { stubRecipe } from './stub';

export const STALL_COUNTER_HEIGHT_M = 0.85;

/** Stations (fixture ids >= 200) are people metadata; the mesher draws none and needs none. */
function assertStallPlan(plan: BuildingPlanView): void {
  if (plan.enterable) throw new RangeError('BUILDGEN_STALL_MUST_NOT_BE_ENTERABLE');
  if (plan.floors.length > 0 || plan.floorY.length > 0)
    throw new RangeError('BUILDGEN_STALL_MUST_NOT_HAVE_FLOORS');
}

function stallRoofStyle(plan: BuildingPlanView, declared: string | undefined): number {
  if (declared === undefined) return plan.roof[0];
  if (declared === 'canopy') return ROOF_STYLE.Canopy;
  if (declared === 'xuanshan') return ROOF_STYLE.Xuanshan;
  throw new RangeError(`BUILDGEN_STALL_UNKNOWN_ROOF:${declared}`);
}

function stallLayer(kit: BuildKitView, ...ids: readonly string[]): number {
  return kitLayer(kit, ...ids);
}

/** Open stall: four posts, front counter and goods placeholders; people remain fixture metadata. */
export const stallRecipe: Recipe = (plan, unit, kit, lod, sink) => {
  const definition = hallDefinition(plan, kit);
  if (definition.recipe !== 'stall') throw new RangeError('BUILDGEN_STALL_RECIPE_MISMATCH');
  if (definition.roof === undefined) {
    stubRecipe(plan, unit, kit, lod, sink);
    return;
  }
  assertStallPlan(plan);
  const roofStyle = stallRoofStyle(plan, definition.roof);
  const geometryPlan =
    roofStyle === plan.roof[0]
      ? plan
      : { ...plan, roof: [roofStyle, plan.roof[1], plan.roof[2]] as const };
  const [width, depth] = hallSizeM(plan);
  const origin = hallOrigin(plan);
  const baseM = plan.elev[0] / 1000;
  const roofBaseM = (plan.elev[0] + plan.elev[1]) / 1000;
  const [frontTopM, backTopM] =
    roofStyle === ROOF_STYLE.Canopy
      ? awningEdgeHeights(geometryPlan)
      : [roofBaseM + geometryPlan.roof[1] / 1000, roofBaseM + geometryPlan.roof[1] / 1000];
  const size = definition.size ?? 'vernacular';
  const gableRoofHalfWidthM =
    plan.footprint[2] / 2000 - 0.04 - 0.6 + (kit.dims[size].verge ?? 500) / 1000;
  const postHalfWidthM =
    (roofStyle === ROOF_STYLE.Xuanshan ? gableRoofHalfWidthM : width / 2) - 0.05;
  const postHalfDepthM =
    (roofStyle === ROOF_STYLE.Xuanshan ? plan.footprint[3] / 2000 - 0.05 : depth / 2) - 0.05;
  const timber = stallLayer(kit, 'timber_raw', 'timber_painted', kit.walls.front.layer);
  const common = {
    origin,
    yaw: plan.yaw,
    unit,
    localGroundM: baseM,
    layer: timber,
    flags: 1 << 4,
    ao: 220,
  } as const;
  for (const x of [-postHalfWidthM, postHalfWidthM])
    for (const [z, postTopM] of [
      [-postHalfDepthM, backTopM],
      [postHalfDepthM, frontTopM],
    ] as const)
      box(sink.shell, {
        ...common,
        center: [x, (baseM + postTopM) / 2, z],
        size: [0.1, postTopM - baseM, 0.1],
      });
  const counterDepthM = Math.min(0.1, depth / 3);
  const counterWidthM = Math.max(0.6, width - 0.35);
  const counterZ = depth / 2 - counterDepthM / 2;
  box(sink.shell, {
    ...common,
    center: [0, baseM + STALL_COUNTER_HEIGHT_M / 2, counterZ],
    size: [counterWidthM, STALL_COUNTER_HEIGHT_M, counterDepthM],
    layer: stallLayer(kit, 'wood_furniture', 'timber_raw'),
    flags: 1 << 5,
    ao: 205,
  });
  const goods = lod === 0 ? 5 : 3;
  const goodsWidthM = Math.min(0.16, counterWidthM / goods - 0.04);
  const goodsUsableM = counterWidthM - goodsWidthM;
  for (let index = 0; index < goods; index += 1) {
    const x = -goodsUsableM / 2 + (goodsUsableM * index) / Math.max(1, goods - 1);
    const height = 0.1 + (index % 2) * 0.04;
    box(sink.shell, {
      ...common,
      center: [x, baseM + STALL_COUNTER_HEIGHT_M + height / 2, counterZ],
      size: [goodsWidthM, height, 0.08],
      layer: stallLayer(kit, 'props', 'cloth_bolt', 'timber_raw'),
      flags: 1 << 5,
      ao: 230,
    });
  }
  if (roofStyle === ROOF_STYLE.Canopy)
    emitAwning({
      writer: sink.roof,
      plan: geometryPlan,
      unit,
      lod,
      layer: stallLayer(kit, 'cloth_awning', 'canvas_awning'),
    });
  else roofMesherFor(roofStyle)(geometryPlan, unit, sink, { kit, lod });
};
