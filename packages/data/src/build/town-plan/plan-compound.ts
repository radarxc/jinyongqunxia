import { townPlanNotImplemented } from './types';
import type { CompiledBuildKit, LayoutBuildingInput, PlanningFrame, TownBuildingPlan } from './types';

export function planCompound(
  _input: LayoutBuildingInput, _kit: CompiledBuildKit, _seed: number, _frame: PlanningFrame,
): TownBuildingPlan {
  return townPlanNotImplemented('planCompound');
}
