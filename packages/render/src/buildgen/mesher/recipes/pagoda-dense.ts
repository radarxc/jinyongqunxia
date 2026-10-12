import type { BuildingPlanView, BuildKitView, Recipe, RecipeSink } from '../../types';
import { box, prism, quad, transformPoint, type PrimitiveMaterial, type Vec3 } from '../core/prims';
import { wallWithOpenings } from '../core/openings';
import { writeRoofFinial } from '../roof/ornaments';
import { kitLayer } from '../parts/platform';

export const DENSE_EAVE_COUNT = 16;
export const DENSE_FIRST_STOREY_MM = 6_500;
export const DENSE_PLATFORM_MM = 1_200;
export const DENSE_EAVE_OUTSET_MM = 450;
export const DENSE_EAVE_SLAB_MM = 250;
export const DENSE_CORNER_LIFT_MM = 80;
export const DENSE_FINIAL_MM = 3_000;

function lerpBp(a: number, b: number, numerator: number, denominator: number): number {
  return a + Math.round(((b - a) * numerator) / denominator);
}

/** Integer-bp taper: a 6% lower-body bulge, then 0.7H..top contracts to 0.62 W0. */
export function denseWidthAtBp(progressBp: number): number {
  if (!Number.isInteger(progressBp) || progressBp < 0 || progressBp > 10_000)
    throw new RangeError('BUILDGEN_INVALID_DENSE_HEIGHT_BP');
  return progressBp <= 7_000
    ? lerpBp(10_000, 10_600, progressBp, 7_000)
    : lerpBp(10_600, 6_200, progressBp - 7_000, 3_000);
}
export function denseWidthBp(index: number, count = DENSE_EAVE_COUNT): number {
  if (!Number.isInteger(index) || index < 0 || index >= count || count < 2)
    throw new RangeError('BUILDGEN_INVALID_DENSE_EAVE_INDEX');
  return denseWidthAtBp(Math.round((index * 10_000) / (count - 1)));
}

function recipeDefinition(plan: BuildingPlanView, kit: BuildKitView) {
  const value = kit.landmarks[plan.archetype] ?? kit.archetypes[plan.archetype];
  if (!value || !('recipe' in value) || value.recipe !== 'pagoda_dense')
    throw new Error(`BUILDGEN_DENSE_RECIPE_MISSING:${plan.archetype}`);
  return value;
}
function towerMaterial(plan: BuildingPlanView, unit: number, layer: number): PrimitiveMaterial {
  return { layer, unit, localGroundM: plan.elev[0] / 1_000 };
}
function origin(plan: BuildingPlanView): Vec3 {
  return [plan.footprint[0] / 1_000, 0, plan.footprint[1] / 1_000];
}
function squareRing(
  sink: RecipeSink,
  plan: BuildingPlanView,
  halfInner: number,
  y: number,
  material: PrimitiveMaterial,
): void {
  const outer = halfInner + DENSE_EAVE_OUTSET_MM / 1_000;
  const slab = DENSE_EAVE_SLAB_MM / 1_000;
  const lift = DENSE_CORNER_LIFT_MM / 1_000;
  const corners = [
    [-outer, -outer],
    [outer, -outer],
    [outer, outer],
    [-outer, outer],
  ] as const;
  const inner = [
    [-halfInner, -halfInner],
    [halfInner, -halfInner],
    [halfInner, halfInner],
    [-halfInner, halfInner],
  ] as const;
  const transform = { origin: origin(plan), yaw: plan.yaw } as const;
  const point = (xz: readonly [number, number], height: number): Vec3 =>
    transformPoint([xz[0], height, xz[1]], transform);
  for (let side = 0; side < 4; side += 1) {
    const next = (side + 1) % 4;
    const a = corners[side]!;
    const b = corners[next]!;
    const ia = inner[side]!;
    const ib = inner[next]!;
    const om = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as const;
    const im = [(ia[0] + ib[0]) / 2, (ia[1] + ib[1]) / 2] as const;
    for (const [fromOuter, toOuter, fromInner, toInner] of [
      [a, om, ia, im],
      [om, b, im, ib],
    ] as const) {
      const fromLift = fromOuter === om ? 0 : lift;
      const toLift = toOuter === om ? 0 : lift;
      quad(
        sink.roof,
        [
          point(fromInner, y),
          point(toInner, y),
          point(toOuter, y + toLift),
          point(fromOuter, y + fromLift),
        ],
        material,
      );
      quad(
        sink.roof,
        [
          point(fromOuter, y + fromLift - slab),
          point(toOuter, y + toLift - slab),
          point(toInner, y - slab),
          point(fromInner, y - slab),
        ],
        material,
      );
      quad(
        sink.roof,
        [
          point(fromOuter, y + fromLift),
          point(toOuter, y + toLift),
          point(toOuter, y + toLift - slab),
          point(fromOuter, y + fromLift - slab),
        ],
        material,
      );
    }
  }
}

function firstStorey(
  plan: BuildingPlanView,
  sink: RecipeSink,
  widthM: number,
  y0: number,
  y1: number,
  wall: PrimitiveMaterial,
  niche: PrimitiveMaterial,
): void {
  const thickness = 0.3;
  const localOrigin: Vec3 = [-widthM / 2, 0, widthM / 2 - thickness / 2];
  const common = {
    lengthM: widthM,
    y0M: y0,
    y1M: y1,
    thicknessM: thickness,
    ...wall,
  };
  wallWithOpenings(sink.roof, {
    ...common,
    openings: [{ x0: widthM / 2 - 0.55, x1: widthM / 2 + 0.55, y0: y0 + 1.2, y1: y0 + 3.4 }],
    origin: transformPoint(localOrigin, { origin: origin(plan), yaw: plan.yaw }),
    yaw: plan.yaw,
  });
  for (let side = 1; side < 4; side += 1) {
    const starts = [
      localOrigin,
      [-widthM / 2 + thickness / 2, 0, -widthM / 2],
      [widthM / 2, 0, -widthM / 2 + thickness / 2],
      [widthM / 2 - thickness / 2, 0, widthM / 2],
    ] as const;
    wallWithOpenings(sink.roof, {
      ...common,
      openings: [],
      origin: transformPoint(starts[side]!, { origin: origin(plan), yaw: plan.yaw }),
      yaw: ((plan.yaw + side) % 4) as BuildingPlanView['yaw'],
    });
  }
  quad(
    sink.roof,
    [
      [-0.55, y0 + 1.2, widthM / 2 - 0.31],
      [0.55, y0 + 1.2, widthM / 2 - 0.31],
      [0.55, y0 + 3.4, widthM / 2 - 0.31],
      [-0.55, y0 + 3.4, widthM / 2 - 0.31],
    ],
    niche,
    { origin: origin(plan), yaw: plan.yaw },
  );
}

export const pagodaDenseRecipe: Recipe = (plan, unit, kit, lod, sink) => {
  const definition = recipeDefinition(plan, kit);
  const eaves = definition.eaves ?? DENSE_EAVE_COUNT;
  if (eaves !== DENSE_EAVE_COUNT) throw new RangeError('BUILDGEN_DENSE_REQUIRES_16_EAVES');
  const minimumHeightM =
    (DENSE_PLATFORM_MM + DENSE_FIRST_STOREY_MM + DENSE_FINIAL_MM + DENSE_EAVE_SLAB_MM) / 1_000;
  const heightM = definition.heightM ?? Math.max(minimumHeightM, plan.roof[2] / 1_000);
  if (!(heightM >= minimumHeightM)) throw new RangeError('BUILDGEN_INVALID_DENSE_HEIGHT');
  const baseY = plan.elev[0] / 1_000;
  const platformTop = baseY + DENSE_PLATFORM_MM / 1_000;
  const firstEaveY = platformTop + DENSE_FIRST_STOREY_MM / 1_000;
  const finialBaseY = baseY + heightM - DENSE_FINIAL_MM / 1_000;
  const widthM = Math.min(plan.footprint[2], plan.footprint[3]) / 1_000 - 0.08;
  const shell = towerMaterial(plan, unit, kitLayer(kit, 'plaster_lime', 'earth_plaster'));
  const tile = towerMaterial(plan, unit, kitLayer(kit, 'tile_roof', 'ridge_tiles'));
  const dark = towerMaterial(plan, unit, kitLayer(kit, 'interior_dark', 'timber_raw'));
  const stone = towerMaterial(plan, unit, kitLayer(kit, 'stone_dressed', 'stone_rubble'));
  box(sink.roof, {
    center: [0, baseY + 0.6, 0],
    size: [widthM, 1.2, widthM],
    origin: origin(plan),
    yaw: plan.yaw,
    ...stone,
  });
  firstStorey(plan, sink, widthM, platformTop, firstEaveY, shell, dark);
  let previousY = firstEaveY;
  for (let index = 0; index < eaves; index += 1) {
    const amount = index / (eaves - 1);
    const y = firstEaveY + (finialBaseY - firstEaveY) * amount;
    const width = (widthM * denseWidthBp(index, eaves)) / 10_000;
    if (index > 0) {
      const previousWidth = (widthM * denseWidthBp(index - 1, eaves)) / 10_000;
      box(sink.roof, {
        center: [0, (previousY + y) / 2, 0],
        size: [Math.min(previousWidth, width), y - previousY, Math.min(previousWidth, width)],
        origin: origin(plan),
        yaw: plan.yaw,
        ...shell,
      });
    }
    squareRing(sink, plan, width / 2, y, tile);
    previousY = y;
  }
  prism(sink.roof, {
    center: [0, finialBaseY + 0.9, 0],
    radiusM: 0.18,
    heightM: 1.8,
    sides: lod === 1 ? 6 : 10,
    origin: origin(plan),
    yaw: plan.yaw,
    ...tile,
  });
  writeRoofFinial(sink.roof, [0, finialBaseY + 1.8, 0], 1_200, lod, {
    origin: origin(plan),
    yaw: plan.yaw,
    material: tile,
  });
};
