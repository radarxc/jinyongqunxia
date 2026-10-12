import type { BuildingPlanView, BuildKitView, Recipe } from '../../types';
import { prism, quad, transformPoint, type PrimitiveMaterial, type Vec3 } from '../core/prims';
import { writeRoofFinial } from '../roof/ornaments';
import { kitLayer } from '../parts/platform';

export const OCT_FINIAL_MM = 1_200;
const OCT_EAVE_OUTSET_M = 0.35;
const OCT_EAVE_SLAB_M = 0.18;

function definition(plan: BuildingPlanView, kit: BuildKitView) {
  const value = kit.landmarks[plan.archetype] ?? kit.archetypes[plan.archetype];
  if (!value || !('recipe' in value) || value.recipe !== 'pagoda_oct')
    throw new Error(`BUILDGEN_OCT_RECIPE_MISSING:${plan.archetype}`);
  return value;
}
function point(radius: number, index: number, y: number): Vec3 {
  const angle = (Math.PI * 2 * index) / 8;
  return [Math.sin(angle) * radius, y, Math.cos(angle) * radius];
}
function ring(
  writer: Parameters<typeof quad>[0],
  plan: BuildingPlanView,
  radius: number,
  y: number,
  material: PrimitiveMaterial,
): void {
  const outer = radius + OCT_EAVE_OUTSET_M;
  const transform = {
    origin: [plan.footprint[0] / 1_000, 0, plan.footprint[1] / 1_000] as Vec3,
    yaw: plan.yaw,
  };
  for (let index = 0; index < 8; index += 1) {
    const next = (index + 1) % 8;
    const world = (value: Vec3): Vec3 => transformPoint(value, transform);
    quad(
      writer,
      [
        world(point(radius, index, y)),
        world(point(radius, next, y)),
        world(point(outer, next, y)),
        world(point(outer, index, y)),
      ],
      material,
    );
    quad(
      writer,
      [
        world(point(outer, index, y)),
        world(point(outer, next, y)),
        world(point(outer, next, y - OCT_EAVE_SLAB_M)),
        world(point(outer, index, y - OCT_EAVE_SLAB_M)),
      ],
      material,
    );
    quad(
      writer,
      [
        world(point(outer, index, y - OCT_EAVE_SLAB_M)),
        world(point(outer, next, y - OCT_EAVE_SLAB_M)),
        world(point(radius, next, y - OCT_EAVE_SLAB_M)),
        world(point(radius, index, y - OCT_EAVE_SLAB_M)),
      ],
      material,
    );
  }
}

export const pagodaOctRecipe: Recipe = (plan, unit, kit, lod, sink) => {
  const recipe = definition(plan, kit);
  const levels = recipe.eaves ?? 10;
  const heightM = recipe.heightM ?? plan.roof[2] / 1_000;
  if (!Number.isInteger(levels) || levels < 2 || !(heightM > OCT_FINIAL_MM / 1_000))
    throw new RangeError('BUILDGEN_INVALID_OCT_PAGODA');
  const baseY = plan.elev[0] / 1_000;
  const finialBase = baseY + heightM - OCT_FINIAL_MM / 1_000;
  const bodyBottom = baseY + Math.min(0.8, heightM * 0.06);
  const baseRadius = Math.min(plan.footprint[2], plan.footprint[3]) / 2_000 - 0.4;
  const origin = [plan.footprint[0] / 1_000, 0, plan.footprint[1] / 1_000] as Vec3;
  const common = { unit, localGroundM: baseY };
  const wall = { ...common, layer: kitLayer(kit, 'plaster_lime', 'earth_plaster') };
  const tile = { ...common, layer: kitLayer(kit, 'tile_roof', 'ridge_tiles') };
  prism(sink.roof, {
    center: [0, (baseY + bodyBottom) / 2, 0],
    radiusM: baseRadius + 0.3,
    heightM: bodyBottom - baseY,
    sides: 8,
    origin,
    yaw: plan.yaw,
    ...wall,
  });
  let previous = bodyBottom;
  for (let level = 0; level < levels; level += 1) {
    const amount = level / (levels - 1);
    const y = bodyBottom + (finialBase - bodyBottom) * amount;
    const radius = baseRadius * (1 - amount * 0.32);
    if (level > 0) {
      const previousAmount = (level - 1) / (levels - 1);
      const previousRadius = baseRadius * (1 - previousAmount * 0.32);
      prism(sink.roof, {
        center: [0, (previous + y) / 2, 0],
        radiusM: Math.min(radius, previousRadius),
        heightM: y - previous,
        sides: 8,
        origin,
        yaw: plan.yaw,
        ...wall,
      });
    }
    ring(sink.roof, plan, radius, y, tile);
    previous = y;
  }
  writeRoofFinial(sink.roof, [0, finialBase, 0], OCT_FINIAL_MM, lod, {
    origin,
    yaw: plan.yaw,
    material: tile,
  });
};
