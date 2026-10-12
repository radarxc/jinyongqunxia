import { townPlanNotImplemented } from './types';
import type { CompiledBuildKit, PlanDiagnostic, TownBuildingPlan } from './types';

export function checkPlan(
  _plan: TownBuildingPlan, _kit: CompiledBuildKit,
): readonly PlanDiagnostic[] {
  return townPlanNotImplemented('checkPlan');
}
