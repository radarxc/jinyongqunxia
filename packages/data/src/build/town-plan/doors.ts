import { floorDivInt } from '@tianshu/shared';
import { entranceSide } from './frame';
import { townPlanNotImplemented } from './types';
import type {
  BuildKitRecipe, BuildKitSize, CompiledBuildKit, EntranceTuple, LayoutBuildingInput,
  TownBuildingPlan,
} from './types';

export interface PlannedDoors {
  readonly entrances: readonly EntranceTuple[];
  readonly clearHeightMm: number;
  readonly thresholdMm: number;
  readonly floorY: readonly number[];
}

function clamp(value: number, low: number, high: number): number {
  if (value < low) return low;
  return value > high ? high : value;
}

export interface DoorClearance {
  readonly clearHeightMm: number;
  readonly thresholdMm: number;
}

export function isShopfront(recipe: BuildKitRecipe): boolean {
  return recipe.front === 'shopfront' || recipe.front === 'carved_shopfront';
}

/** Vertical door dimensions omitted from EntranceTuple; shared by planner and mesh consumers. */
export function doorClearanceFor(
  kit: CompiledBuildKit, size: BuildKitSize, shopfront = false,
): DoorClearance {
  const clearHeightMm = size === 'hall' ? clamp(3_000, 2_800, 3_200)
    : size === 'middle' ? clamp(2_350, 2_300, 2_400)
      : size === 'shop' && shopfront ? 2_700 : clamp(kit.door.clearH, 2_100, 2_200);
  const thresholdMm = size === 'hall' ? clamp(kit.door.threshold, 200, 300)
    : size === 'middle' ? clamp(kit.door.threshold, 150, 300)
      : clamp(kit.door.threshold, 100, 150);
  return { clearHeightMm, thresholdMm };
}

function layoutOffsetMm(input: LayoutBuildingInput): number {
  const side = entranceSide(input.originCell, input.sizeCells, input.entranceCell);
  const along = side === 0 || side === 2
    ? input.entranceCell[0] - input.originCell[0]
    : input.entranceCell[1] - input.originCell[1];
  const spanCells = side === 0 || side === 2 ? input.sizeCells[0] : input.sizeCells[1];
  const unsigned = (along * 2 + 1 - spanCells) * 500;
  return side === 1 || side === 2 ? -unsigned : unsigned;
}

function doorWidth(
  input: LayoutBuildingInput, kit: CompiledBuildKit, recipe: BuildKitRecipe,
  size: BuildKitSize, centreBayMm: number,
): number {
  if (size === 'hall') return clamp(kit.door.double, 2_000, 2_600);
  if (size === 'middle') return clamp(kit.door.double, 1_500, 1_800);
  if (size === 'shop' && isShopfront(recipe)) {
    return clamp(centreBayMm, 1_500, 3_200);
  }
  if (input.enterable && kit.door.single === 900) {
    return clamp(kit.door.double, 1_300, 1_500);
  }
  if (input.enterable) return clamp(kit.door.double, 1_200, 1_500);
  return kit.door.single;
}

export function planDoors(
  input: LayoutBuildingInput, footprint: TownBuildingPlan['footprint'],
  kit?: CompiledBuildKit, recipe?: BuildKitRecipe, centreBayMm = 1_400, platformMm = 0,
): PlannedDoors {
  if (kit === undefined || recipe === undefined || input.entranceCell === undefined) {
    return townPlanNotImplemented('planDoors');
  }
  const size = recipe.size ?? 'vernacular';
  const offset = layoutOffsetMm(input);
  const widthMm = doorWidth(input, kit, recipe, size, centreBayMm);
  const desiredOffset = offset < -1_000 || offset > 1_000 ? offset : 0;
  const offsetLimit = floorDivInt(footprint[2] - widthMm, 2);
  const snappedOffset = clamp(desiredOffset, -offsetLimit, offsetLimit);
  const clearance = doorClearanceFor(kit, size, size === 'shop' && isShopfront(recipe));
  return {
    entrances: [[0, snappedOffset, widthMm]],
    ...clearance,
    floorY: input.enterable ? [platformMm] : [],
  };
}
