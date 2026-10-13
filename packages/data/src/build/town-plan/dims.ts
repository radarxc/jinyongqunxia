import { floorDivInt } from '@tianshu/shared';
import { parseBuildingType } from './archetype';
import { entranceSide } from './frame';
import { townPlanNotImplemented } from './types';
import type {
  BuildKitDims, BuildKitRecipe, BuildKitSize, CompiledBuildKit, LayoutBuildingInput,
} from './types';

const BP = 10_000;
const FLYING_RAFTER_LIFT_MM = 40;
const FLOOR_SLAB_MM = 200;
const RAFTER_GAP_MM = 100;
const BRACKET_PROJECTION_MM = 450;

export interface PlannedDimensions {
  readonly size: BuildKitSize;
  readonly widthMm: number;
  readonly depthMm: number;
  readonly platformMm: number;
  readonly baySpanMm: number;
  readonly bayWidthsMm: readonly number[];
  readonly columnHeightMm: number;
  readonly columnDiameterMm: number;
  readonly beamHeightMm: number;
  readonly overhangMm: number;
  readonly roofRunMm: number;
  readonly riseMm: number;
  readonly roofDeckMm: number;
  readonly eaveMm: number;
  readonly ridgeMm: number;
  readonly storeys: 1 | 2 | 3;
}

function clamp(value: number, low: number, high: number): number {
  if (value < low) return low;
  return value > high ? high : value;
}

function roundDiv(numerator: number, denominator: number): number {
  return floorDivInt(numerator * 2 + denominator, denominator * 2);
}

function mulBpRound(value: number, bp: number): number {
  return roundDiv(value * bp, BP);
}

export function resolvePlanRecipe(
  input: LayoutBuildingInput, kit: CompiledBuildKit,
): readonly [archetype: string, recipe: BuildKitRecipe] {
  const parsed = parseBuildingType(input.type);
  const archetype = 'landmark' in parsed ? parsed.landmark : parsed.archetype;
  const recipe = 'landmark' in parsed
    ? kit.landmarks[parsed.landmark]
    : kit.archetypes[parsed.archetype];
  if (recipe === undefined) throw new TypeError(`TOWN_PLAN_RECIPE_MISSING:${archetype}`);
  if ('unsupported' in recipe) {
    throw new TypeError(`TOWN_PLAN_RECIPE_UNSUPPORTED:${archetype}:${recipe.unsupported}`);
  }
  return [archetype, recipe];
}

function localSize(input: LayoutBuildingInput): readonly [number, number] {
  const side = entranceSide(input.originCell, input.sizeCells, input.entranceCell);
  const widthCells = side === 0 || side === 2 ? input.sizeCells[0] : input.sizeCells[1];
  const depthCells = side === 0 || side === 2 ? input.sizeCells[1] : input.sizeCells[0];
  return [widthCells * 1_000, depthCells * 1_000];
}

function diameter(dims: BuildKitDims, size: BuildKitSize, adobe: boolean): number {
  const raw = roundDiv(dims.column, dims.diaRatio ?? (size === 'hall' ? 10 : 11));
  if (adobe) return clamp(raw, 200, 260);
  if (size === 'hall') return clamp(raw, 350, 500);
  if (size === 'middle') return clamp(raw, 260, 300);
  return clamp(raw, 180, 300);
}

function baySpan(widthMm: number, size: BuildKitSize): number {
  const inset = size === 'vernacular' ? 450
    : size === 'shop' ? 1_250
      : size === 'middle' ? 1_000 : 1_200;
  return widthMm > inset ? widthMm - inset : widthMm;
}

function bayCount(spanMm: number): 1 | 3 | 5 | 7 {
  if (spanMm < 5_000) return 1;
  if (spanMm < 11_000) return 3;
  if (spanMm < 18_000) return 5;
  return 7;
}

function weightedBays(spanMm: number, weights: readonly number[]): readonly number[] {
  let denominator = BP;
  for (const weight of weights) denominator += weight * 2;
  const centreGuess = roundDiv(spanMm * BP, denominator);
  const sides = weights.map((weight) => mulBpRound(centreGuess, weight));
  let used = 0;
  for (const side of sides) used += side * 2;
  const result = [...sides].reverse();
  result.push(spanMm - used);
  result.push(...sides);
  return result;
}

export function planBayWidths(spanMm: number): readonly number[] {
  const count = bayCount(spanMm);
  if (count === 1) return [spanMm];
  if (count === 3) return weightedBays(spanMm, [8_200]);
  if (count === 5) return weightedBays(spanMm, [8_200, 6_800]);
  return weightedBays(spanMm, [8_200, 6_800, 5_600]);
}

function ridgeBodyMm(size: BuildKitSize, storeys: number): number {
  if (size === 'hall') return 650;
  if (storeys > 1) return 450;
  return 350;
}

export function planDimensions(
  input: LayoutBuildingInput, kit: CompiledBuildKit,
): PlannedDimensions {
  if (input.type === undefined || kit.archetypes === undefined) {
    return townPlanNotImplemented('planDimensions');
  }
  if (input.sizeCells[0] <= 0 || input.sizeCells[1] <= 0) {
    throw new RangeError('TOWN_PLAN_INVALID_SIZE');
  }
  const [, recipe] = resolvePlanRecipe(input, kit);
  if ('unsupported' in recipe) throw new TypeError('TOWN_PLAN_RECIPE_UNSUPPORTED');
  const size = recipe.size ?? 'vernacular';
  const dims = kit.dims[size];
  const [widthMm, depthMm] = localSize(input);
  const stall = recipe.recipe === 'stall';
  const storeys = recipe.recipe === 'storeyed' ? 2 : recipe.storeys ?? 1;
  const columnHeightMm = stall ? 2_300 : dims.column;
  const beamHeightMm = stall ? 0 : dims.beam ?? 350;
  const columnStackMm = columnHeightMm
    + (storeys > 1 ? (dims.upperStorey ?? dims.column) + FLOOR_SLAB_MM : 0);
  const purlinMm = columnStackMm + beamHeightMm;
  const bracketMm = recipe.brackets === true ? BRACKET_PROJECTION_MM : 0;
  const roofRunMm = stall ? depthMm
    : depthMm - dims.eave * 2 - RAFTER_GAP_MM + bracketMm * 2;
  const riseBp = recipe.brackets === true && dims.rise === 3_330 ? 3_333 : dims.rise;
  const riseMm = stall ? 0 : mulBpRound(roofRunMm, riseBp);
  const bracketSettleMm = roundDiv(bracketMm, 10);
  const eaveMm = stall ? purlinMm : purlinMm - mulBpRound(dims.eave, 4_000)
    + FLYING_RAFTER_LIFT_MM - bracketSettleMm;
  return {
    size, widthMm, depthMm, platformMm: stall ? 0 : dims.platform,
    baySpanMm: baySpan(widthMm, size),
    bayWidthsMm: planBayWidths(baySpan(widthMm, size)),
    columnHeightMm,
    columnDiameterMm: diameter(dims, size, kit.style === 'adobe'),
    beamHeightMm, overhangMm: dims.eave, roofRunMm, riseMm, roofDeckMm: purlinMm, eaveMm,
    ridgeMm: stall ? purlinMm : purlinMm + riseMm + ridgeBodyMm(size, storeys),
    storeys,
  };
}
