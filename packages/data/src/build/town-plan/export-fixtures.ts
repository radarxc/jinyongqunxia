import { townPlanNotImplemented } from './types';
import type { CompiledBuildKit, TownBuildingPlan } from './types';

export interface ExportedTownPlanFixtures {
  readonly kit: CompiledBuildKit;
  readonly plans: readonly TownBuildingPlan[];
}

export function exportFixtures(
  _kit: CompiledBuildKit, _plans: readonly TownBuildingPlan[],
): string {
  return townPlanNotImplemented('exportFixtures');
}
