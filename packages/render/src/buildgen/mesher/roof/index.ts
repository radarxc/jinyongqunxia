import { ROOF_STYLE, type BuildingPlanView, type BuildKitView, type RecipeSink } from '../../types';
import { writeCanopyRoof } from './canopy';
import { writeFlatRoof } from './flat';
import { writeXuanshanRoof, writeYingshanRoof } from './gable';

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

function pending(style: number): RoofMesher {
  return () => {
    throw new Error(`BUILDGEN_ROOF_PENDING:${style}`);
  };
}
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
    case ROOF_STYLE.Wudian:
    case ROOF_STYLE.Cuanjian:
    case ROOF_STYLE.Juanpeng:
    case ROOF_STYLE.Dome:
      return pending(style);
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
