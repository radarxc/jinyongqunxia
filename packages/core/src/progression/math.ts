import { BP_SCALE, clampInt, floorDivInt, mulDivFloor } from '@tianshu/shared';

const GRADE_FACTOR_TENTHS = [10, 12, 14, 18, 21, 24, 30, 34, 38, 46, 52, 60] as const;
const LAYER_FACTOR_TENTHS = [10, 15, 22, 30, 40, 52, 66, 82, 120] as const;

function assertIntRange(value: number, min: number, max: number, code: string): void {
  if (!Number.isSafeInteger(value) || value < min || value > max) throw new RangeError(code);
}

export function innerLayerCurveBp(effectiveLayer: number): number {
  assertIntRange(effectiveLayer, 1, 9, 'PROGRESSION_LAYER_RANGE');
  return 5000 + 625 * effectiveLayer;
}

export function fluxTrainingGain(
  currentFlux: number, hardCap: number, fluxTrainBase: number, effectiveLayer: number,
): number {
  assertIntRange(currentFlux, 1, hardCap, 'PROGRESSION_FLUX_RANGE');
  assertIntRange(hardCap, 1, 96, 'PROGRESSION_FLUX_CAP');
  assertIntRange(fluxTrainBase, 1, 8, 'PROGRESSION_FLUX_TRAIN_BASE');
  if (currentFlux >= hardCap) return 0;
  const headroomBp = mulDivFloor(hardCap - currentFlux, BP_SCALE, hardCap);
  const raw = mulDivFloor(fluxTrainBase * innerLayerCurveBp(effectiveLayer),
    headroomBp, BP_SCALE * BP_SCALE);
  return Math.min(hardCap - currentFlux, Math.max(1, raw));
}

export function strengthExperienceThreshold(strengthLayer: number): number {
  assertIntRange(strengthLayer, 1, 8, 'PROGRESSION_STRENGTH_LAYER');
  return 100 * strengthLayer * strengthLayer;
}

export function skillExpToNext(grade: number, layer: number): number {
  assertIntRange(grade, 1, 12, 'PROGRESSION_GRADE_RANGE');
  assertIntRange(layer, 1, 9, 'PROGRESSION_SKILL_LAYER');
  const raw = GRADE_FACTOR_TENTHS[grade - 1]! * LAYER_FACTOR_TENTHS[layer - 1]!;
  return floorDivInt(raw + 5, 10) * 10;
}

export function clampPracticeLayer(layer: number): number {
  if (!Number.isSafeInteger(layer)) throw new RangeError('PROGRESSION_LAYER_INTEGER');
  return clampInt(layer, 1, 9);
}
