import { floorDivInt } from '@tianshu/shared';
import { planDimensions, resolvePlanRecipe } from './dims';
import { isShopfront, planDoors } from './doors';
import { entranceSide, planningRectCentreMm, yawFromEntranceSide } from './frame';
import { defaultInteriorPlanner } from './interiors/solver';
import { planCompound } from './plan-compound';
import { RoofStyle } from './types';
import type {
  BuildKitRecipe, CompiledBuildKit, FixtureTuple, LayoutBuildingInput, PlanDiagnostic,
  PlanningFrame, RectMm, TownBuildingPlan, Yaw4,
} from './types';

const CELL_MM = 1_000;
const PARAPET_DEFAULT_MM = 450;
const SIGN_STYLE: Readonly<Record<string, number>> = { plaque: 0, flag: 1 };
const ROOF_STYLE: Readonly<Record<string, RoofStyle>> = {
  none: RoofStyle.None, yingshan: RoofStyle.Yingshan, xuanshan: RoofStyle.Xuanshan,
  xieshan: RoofStyle.Xieshan, wudian: RoofStyle.Wudian, cuanjian: RoofStyle.Cuanjian,
  juanpeng: RoofStyle.Juanpeng, flat: RoofStyle.Flat, dome: RoofStyle.Dome,
  canopy: RoofStyle.Canopy,
};

export interface InteriorPlannerContext {
  readonly plan: TownBuildingPlan;
  readonly input: LayoutBuildingInput;
  readonly kit: CompiledBuildKit;
  readonly recipe: BuildKitRecipe;
}
export interface InteriorPlan {
  readonly fixtures: readonly FixtureTuple[];
  readonly floors: readonly RectMm[];
  readonly floorY: readonly number[];
}
export type InteriorPlanner = (context: InteriorPlannerContext) => InteriorPlan;
export interface PlanBuildingOptions {
  readonly variant?: string;
  readonly interior?: InteriorPlanner;
}
export const emptyInteriorPlanner: InteriorPlanner = ({ plan }) => ({
  fixtures: plan.fixtures, floors: plan.floors, floorY: plan.floorY,
});

function floorRect(
  cxMm: number, czMm: number, yaw: Yaw4, kit: CompiledBuildKit,
  footprintWidthMm: number, footprintDepthMm: number, baySpanMm: number,
  roofRunMm: number, shopfront: boolean,
): RectMm {
  const widthCandidate = baySpanMm - kit.walls.gable.t;
  const widthLimit = footprintWidthMm - kit.walls.gable.t * 2;
  const clearWidth = widthCandidate < widthLimit ? widthCandidate : widthLimit;
  const frontBack = shopfront
    ? floorDivInt(kit.walls.front.t + kit.walls.back.t, 2)
    : kit.walls.front.t > kit.walls.back.t ? kit.walls.front.t : kit.walls.back.t;
  const depthWall = floorDivInt(frontBack, 100) * 100;
  const depthCandidate = roofRunMm - depthWall;
  const depthInset = kit.walls.front.t > kit.walls.back.t
    ? kit.walls.front.t : kit.walls.back.t;
  const depthLimit = footprintDepthMm - depthInset * 2;
  const clearDepth = depthCandidate < depthLimit ? depthCandidate : depthLimit;
  const worldWidth = yaw === 0 || yaw === 2 ? clearWidth : clearDepth;
  const worldDepth = yaw === 0 || yaw === 2 ? clearDepth : clearWidth;
  const halfWidthLow = floorDivInt(worldWidth, 2);
  const halfDepthLow = floorDivInt(worldDepth, 2);
  return [cxMm - halfWidthLow, czMm - halfDepthLow,
    cxMm + worldWidth - halfWidthLow, czMm + worldDepth - halfDepthLow];
}

function roofStyle(recipe: BuildKitRecipe): RoofStyle {
  if ('unsupported' in recipe) return RoofStyle.None;
  const style = recipe.roof === undefined ? undefined : ROOF_STYLE[recipe.roof];
  if (style === undefined) throw new TypeError(`TOWN_PLAN_UNKNOWN_ROOF:${recipe.roof ?? ''}`);
  return style;
}

function variantRoof(
  archetype: string, recipe: BuildKitRecipe, kit: CompiledBuildKit, facility: string,
  variant?: string,
): RoofStyle {
  const base = roofStyle(recipe);
  const set = variant === undefined ? undefined : kit.variantSets?.[variant];
  const forbidden = recipe.roof !== undefined && set?.forbid?.includes(recipe.roof) === true;
  if (!forbidden) return base;
  const institutional = facility === 'temple' || facility === 'office'
    || archetype === 'shrine' || archetype === 'temple_hall' || archetype === 'yamen';
  return institutional ? RoofStyle.Cuanjian : RoofStyle.Flat;
}

function variantFinial(
  archetype: string, facility: string, kit: CompiledBuildKit, variant?: string,
): TownBuildingPlan['finial'] {
  const finial = variant === undefined ? undefined : kit.variantSets?.[variant]?.finial;
  const temple = facility === 'temple' || archetype === 'shrine' || archetype === 'temple_hall';
  return finial === 'tang_stupa' && temple ? finial : undefined;
}

function signage(input: LayoutBuildingInput, recipe: BuildKitRecipe): TownBuildingPlan['signage'] {
  if ('unsupported' in recipe || recipe.signage === undefined || input.signTextKey === undefined) {
    return null;
  }
  const style = SIGN_STYLE[recipe.signage];
  if (style === undefined) throw new TypeError(`TOWN_PLAN_UNKNOWN_SIGNAGE:${recipe.signage}`);
  return [input.signTextKey, style];
}

function parapetMm(kit: CompiledBuildKit): number {
  const value = kit.variants['parapetMm'];
  return typeof value === 'number' ? value : PARAPET_DEFAULT_MM;
}

function specialPlan(
  input: LayoutBuildingInput, kit: CompiledBuildKit, seed: number, archetype: string,
  recipe: BuildKitRecipe, yaw: Yaw4, cxMm: number, czMm: number, wMm: number, dMm: number,
): TownBuildingPlan {
  const heightMm = ('unsupported' in recipe ? undefined : recipe.heightM) ?? 15;
  const storeys = ('unsupported' in recipe ? undefined : recipe.storeys) ?? 1;
  return {
    id: input.id, archetype, kit: kit.id, seed, footprint: [cxMm, czMm, wMm, dMm], yaw,
    storeys, roof: [RoofStyle.Cuanjian, heightMm * 1_000, heightMm * 1_000],
    entrances: [], enterable: false, elev: [input.baseYMm, 1_200], floors: [], floorY: [],
    fixtures: [],
    signage: null, facility: input.facility ?? 'none',
  };
}

function draftPlan(
  input: LayoutBuildingInput, kit: CompiledBuildKit, seed: number, frame: PlanningFrame,
  options: PlanBuildingOptions,
): TownBuildingPlan {
  const [archetype, recipe] = resolvePlanRecipe(input, kit);
  if ('unsupported' in recipe) throw new TypeError('TOWN_PLAN_RECIPE_UNSUPPORTED');
  const dims = planDimensions(input, kit);
  const side = entranceSide(input.originCell, input.sizeCells, input.entranceCell);
  const yaw = yawFromEntranceSide(side);
  const [cxMm, czMm] = planningRectCentreMm(frame, input.originCell, input.sizeCells);
  const [gridWMm, gridDMm] = [input.sizeCells[0] * CELL_MM, input.sizeCells[1] * CELL_MM];
  const wMm = yaw === 0 || yaw === 2 ? gridWMm : gridDMm;
  const dMm = yaw === 0 || yaw === 2 ? gridDMm : gridWMm;
  if (recipe.recipe === 'pagoda_dense' || recipe.recipe === 'pagoda_oct') {
    return specialPlan(
      input, kit, seed, archetype, recipe, yaw, cxMm, czMm, wMm, dMm,
    );
  }
  const compound = recipe.recipe === 'compound';
  const stall = recipe.recipe === 'stall';
  const adobe = recipe.recipe === 'adobe';
  if (compound) {
    return planCompound(
      input, kit, seed, frame, options.interior ?? defaultInteriorPlanner, options.variant,
    );
  }
  const canEnter = input.enterable && !stall;
  const floor = floorRect(cxMm, czMm, yaw, kit, dims.widthMm, dims.depthMm,
    dims.baySpanMm, dims.roofRunMm, isShopfront(recipe));
  const centreBay = dims.bayWidthsMm[floorDivInt(dims.bayWidthsMm.length, 2)] ?? dims.baySpanMm;
  const doors = planDoors(input, [cxMm, czMm, wMm, dMm], kit, recipe, centreBay, dims.platformMm);
  const facility = input.facility ?? recipe.facility ?? 'none';
  const selectedRoof = variantRoof(archetype, recipe, kit, facility, options.variant);
  const finial = variantFinial(archetype, facility, kit, options.variant);
  const roofTop = adobe && selectedRoof === RoofStyle.Flat
    ? dims.roofDeckMm : dims.ridgeMm;
  const roof = adobe && selectedRoof === RoofStyle.Flat
    ? [RoofStyle.Flat, roofTop, roofTop + parapetMm(kit)] as const
    : [selectedRoof, dims.eaveMm, dims.ridgeMm] as const;
  const plan: TownBuildingPlan = {
    id: input.id, archetype, kit: kit.id, seed, footprint: [cxMm, czMm, wMm, dMm], yaw,
    storeys: dims.storeys, roof, entrances: stall ? [] : doors.entrances, enterable: canEnter,
    elev: [input.baseYMm, dims.platformMm], floors: canEnter ? [floor] : [],
    floorY: canEnter ? [dims.platformMm] : [], fixtures: [],
    ...(finial === undefined ? {} : { finial }), signage: signage(input, recipe),
    facility,
  };
  const interior = (options.interior ?? defaultInteriorPlanner)({ plan, input, kit, recipe });
  return { ...plan, ...interior };
}

/**
 * Deterministic integer building plan. Options carry the active kit variant and i1 injection seam.
 */
export function planBuilding(
  input: LayoutBuildingInput, kit: CompiledBuildKit, seed: number, frame: PlanningFrame,
  options: PlanBuildingOptions = {},
): TownBuildingPlan {
  return draftPlan(input, kit, seed, frame, options);
}

export function planBuildingDiagnostics(
  input: LayoutBuildingInput, kit: CompiledBuildKit,
): readonly PlanDiagnostic[] {
  resolvePlanRecipe(input, kit);
  return [];
}
