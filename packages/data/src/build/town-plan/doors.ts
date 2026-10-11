import { townPlanNotImplemented } from './types';
import type { EntranceTuple, LayoutBuildingInput, TownBuildingPlan } from './types';

export interface PlannedDoors {
  readonly entrances: readonly EntranceTuple[];
  readonly floorY: readonly number[];
}

export function planDoors(
  _input: LayoutBuildingInput, _footprint: TownBuildingPlan['footprint'],
): PlannedDoors {
  return townPlanNotImplemented('planDoors');
}
