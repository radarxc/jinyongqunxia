import { townPlanNotImplemented } from './types';
import type { CompiledBuildKit, LayoutBuildingInput } from './types';

export interface PlannedDimensions {
  readonly platformMm: number;
  readonly eaveMm: number;
  readonly ridgeMm: number;
  readonly storeys: 1 | 2 | 3;
}

export function planDimensions(
  _input: LayoutBuildingInput, _kit: CompiledBuildKit,
): PlannedDimensions {
  return townPlanNotImplemented('planDimensions');
}
