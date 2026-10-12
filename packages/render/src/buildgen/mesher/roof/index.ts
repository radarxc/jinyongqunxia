import { ROOF_STYLE, type BuildingPlanView, type BuildKitView, type RecipeSink } from '../../types';
import { writeCanopyRoof } from './canopy';
import { writeDomeRoof } from './dome';
import { writeFlatRoof } from './flat';
import { writeXuanshanRoof, writeYingshanRoof } from './gable';
import { writeWudianRoof } from './hip';
import { writePyramidRoof } from './pyramid';
import { writeRolledRoof } from './rolled';
import { writeXieshanRoof } from './xieshan';

export interface RoofContext {
  readonly kit?: BuildKitView | undefined;
  readonly lod?: 0 | 1 | undefined;
}
export type RoofMesher = (
  plan: BuildingPlanView,
  unitBase: number,
  sink: RecipeSink,
  context?: RoofContext,
) => void;

function requireRoof(sink: RecipeSink): void {
  // Keep r0's extension probe diagnostic for deliberately incomplete callers.
  if (!sink?.roof) throw new Error('BUILDGEN_NOT_IMPLEMENTED:roofMesher');
}
function dimensions(plan: BuildingPlanView, kit?: BuildKitView) {
  const recipe = kit?.archetypes[plan.archetype] ?? kit?.landmarks[plan.archetype];
  const fallback = plan.archetype === 'shop' ? 'shop' : plan.storeys > 1 ? 'middle' : 'vernacular';
  const size = recipe && !('unsupported' in recipe) ? (recipe.size ?? fallback) : fallback;
  return kit?.dims[size];
}
function r3SizeKey(plan: BuildingPlanView, kit?: BuildKitView) {
  const recipe = kit?.archetypes[plan.archetype] ?? kit?.landmarks[plan.archetype];
  const fallback =
    recipe && !('unsupported' in recipe) && (recipe.brackets || plan.facility === 'temple')
      ? 'hall'
      : plan.archetype === 'shop' || plan.facility === 'general_store'
        ? 'shop'
        : plan.storeys > 1
          ? 'middle'
          : 'vernacular';
  return recipe && !('unsupported' in recipe) ? (recipe.size ?? fallback) : fallback;
}
function r3Dimensions(plan: BuildingPlanView, kit?: BuildKitView) {
  return kit?.dims[r3SizeKey(plan, kit)];
}
/** Same rule as the planner's `ridgeBodyMm` (town-plan dims.ts): roof[2] = purlin + rise + this. */
function r3RidgeBodyMm(plan: BuildingPlanView, kit?: BuildKitView): number {
  if (r3SizeKey(plan, kit) === 'hall') return 650;
  return plan.storeys > 1 ? 450 : 350;
}
/** Same 450 mm bracket projection the planner adds for `brackets: true` recipes. */
function r3BracketMm(plan: BuildingPlanView, kit?: BuildKitView): number {
  const recipe = kit?.archetypes[plan.archetype] ?? kit?.landmarks[plan.archetype];
  return recipe && !('unsupported' in recipe) && recipe.brackets === true ? 450 : 0;
}
function pyramidSides(plan: BuildingPlanView, kit?: BuildKitView): 4 | 6 | 8 {
  const recipe = kit?.archetypes[plan.archetype] ?? kit?.landmarks[plan.archetype];
  if (recipe?.recipe === 'pagoda_oct') return 8;
  if (plan.archetype.includes('hex')) return 6;
  return 4;
}

/** Dispatches the plan's `roof[0]` code. r3 replaces only the deliberate pending branches. */
export function roofMesherFor(style: number): RoofMesher {
  switch (style) {
    case ROOF_STYLE.Yingshan:
      return (plan, unit, sink, context) => {
        requireRoof(sink);
        const dims = dimensions(plan, context?.kit);
        const bearerSpanMm = plan.footprint[3] - 2 * (dims?.eave ?? 700) - 100;
        writeYingshanRoof({
          plan,
          unit,
          sink,
          lod: context?.lod,
          profile: context?.kit?.profile,
          eaveProjectionMm: dims?.eave,
          structuralRiseMm: dims ? (bearerSpanMm * dims.rise) / 10_000 : undefined,
          ridgeHeightMm: context?.kit?.ridge.h,
          ridgeEnds: context?.kit?.ridge.ends,
        });
      };
    case ROOF_STYLE.Xuanshan:
      return (plan, unit, sink, context) => {
        requireRoof(sink);
        const dims = dimensions(plan, context?.kit);
        const bearerSpanMm = plan.footprint[3] - 2 * (dims?.eave ?? 800) - 100;
        writeXuanshanRoof({
          plan,
          unit,
          sink,
          lod: context?.lod,
          profile: context?.kit?.profile,
          eaveProjectionMm: dims?.eave,
          structuralRiseMm: dims ? (bearerSpanMm * dims.rise) / 10_000 : undefined,
          ridgeHeightMm: context?.kit?.ridge.h,
          ridgeEnds: context?.kit?.ridge.ends,
          vergeMm: dims?.verge ?? 500,
        });
      };
    case ROOF_STYLE.Flat:
      return (plan, unit, sink) => {
        requireRoof(sink);
        writeFlatRoof({ plan, unit, sink, layer: 0, copingLayer: 1, soffitLayer: 2 });
      };
    case ROOF_STYLE.Canopy:
      return (plan, unit, sink, context) => {
        requireRoof(sink);
        writeCanopyRoof({
          plan,
          unit,
          sink,
          layer: 15,
          tSegments: context?.lod === 1 ? 2 : undefined,
        });
      };
    case ROOF_STYLE.Xieshan:
      return (plan, unit, sink, context) => {
        requireRoof(sink);
        const dims = r3Dimensions(plan, context?.kit);
        writeXieshanRoof({
          plan,
          unit,
          sink,
          lod: context?.lod,
          profile: context?.kit?.profile,
          eaveProjectionMm: dims?.eave,
          liftMm: dims?.lift[0] ?? 0,
          outsetMm: dims?.lift[1] ?? 0,
          ridgeHeightMm: r3RidgeBodyMm(plan, context?.kit),
          bracketMm: r3BracketMm(plan, context?.kit),
          ridgeEnds:
            r3SizeKey(plan, context?.kit) === 'hall'
              ? context?.kit?.ridge.hallEnds
              : context?.kit?.ridge.ends,
        });
      };
    case ROOF_STYLE.Wudian:
      return (plan, unit, sink, context) => {
        requireRoof(sink);
        const dims = r3Dimensions(plan, context?.kit);
        writeWudianRoof({
          plan,
          unit,
          sink,
          kit: context?.kit,
          lod: context?.lod,
          profile: context?.kit?.profile,
          eaveProjectionMm: dims?.eave,
          liftMm: dims?.lift[0] ?? 0,
          outsetMm: dims?.lift[1] ?? 0,
          ridgeHeightMm: r3RidgeBodyMm(plan, context?.kit),
          bracketMm: r3BracketMm(plan, context?.kit),
          ridgeEnds:
            r3SizeKey(plan, context?.kit) === 'hall'
              ? context?.kit?.ridge.hallEnds
              : context?.kit?.ridge.ends,
        });
      };
    case ROOF_STYLE.Cuanjian:
      return (plan, unit, sink, context) => {
        requireRoof(sink);
        const dims = r3Dimensions(plan, context?.kit);
        writePyramidRoof({
          plan,
          unit,
          sink,
          lod: context?.lod,
          liftMm: dims?.lift[0] ?? 0,
          outsetMm: dims?.lift[1] ?? 0,
          sides: pyramidSides(plan, context?.kit),
        });
      };
    case ROOF_STYLE.Juanpeng:
      return (plan, unit, sink, context) => {
        requireRoof(sink);
        writeRolledRoof({ plan, unit, sink, lod: context?.lod });
      };
    case ROOF_STYLE.Dome:
      return (plan, unit, sink, context) => {
        requireRoof(sink);
        writeDomeRoof({ plan, unit, sink, lod: context?.lod });
      };
    case ROOF_STYLE.None:
      return () => undefined;
    default:
      throw new Error(`BUILDGEN_UNKNOWN_ROOF_STYLE:${style}`);
  }
}

export {
  EAVE_SLOPE,
  FLY_RAFTER_LIFT_MM,
  dripHeightMm,
  profileHeightAt,
  roofProfileHeightAt,
  qingJujia,
  songZhe,
  songZheAt,
  type RoofProfile,
} from './profile';
export {
  cornerUStations,
  roofPatchTSegments,
  roofPatchTStations,
  sampleRoofPatch,
  writeRoofPatch,
  type RoofPatchDeformer,
  type RoofPatchOptions,
} from './patch';
export { writeRidge, type RidgeOptions } from './ridge';
export { writeRoofShell, type RoofShellOptions } from './shell';
