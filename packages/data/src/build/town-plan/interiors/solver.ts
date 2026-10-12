import { townPlanNotImplemented } from '../types';
import type { FacilityKind, FixtureTuple, PlanDiagnostic, RectMm } from '../types';

export interface InteriorSolveInput {
  readonly room: RectMm;
  readonly facility: FacilityKind;
  readonly doorOffsetMm: number;
  readonly doorWidthMm: number;
  readonly seed: number;
}

export interface InteriorSolveResult {
  readonly floors: readonly RectMm[];
  readonly fixtures: readonly FixtureTuple[];
  readonly diagnostics: readonly PlanDiagnostic[];
}

export function solveInterior(_input: InteriorSolveInput): InteriorSolveResult {
  return townPlanNotImplemented('solveInterior');
}
