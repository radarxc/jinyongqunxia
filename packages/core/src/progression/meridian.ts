import { compareCodePoints, floorDivInt } from '@tianshu/shared';
import type { MeridianProgress } from '@tianshu/data/schemas';
import { fluxTrainingGain, strengthExperienceThreshold } from './math';
import type {
  FluxTrainingChange, InnerPracticeInput, InnerPracticeResult, MeridianTemperEffect, ProgressionEvent,
} from './types';

type PermanentStat = MeridianProgress['acupointStats'][string];

function assertIntRange(value: number, min: number, max: number, code: string): void {
  if (!Number.isSafeInteger(value) || value < min || value > max) throw new RangeError(code);
}

function trainStrength(stat: PermanentStat, gainedXp: number): PermanentStat {
  let strengthLayer = stat.strengthLayer;
  let strengthXp = stat.strengthXp + gainedXp;
  if (!Number.isSafeInteger(strengthXp)) throw new RangeError('PROGRESSION_STRENGTH_XP');
  while (strengthLayer < 9) {
    const threshold = strengthExperienceThreshold(strengthLayer);
    if (strengthXp < threshold) break;
    strengthXp -= threshold; strengthLayer += 1;
  }
  return { ...stat, strengthLayer, strengthXp };
}

function cloneProgress(progress: MeridianProgress): MeridianProgress {
  return { ...progress, opened: [...progress.opened],
    meridianStats: { ...progress.meridianStats },
    acupointStats: { ...progress.acupointStats }, targets: { ...progress.targets } };
}

function trainTarget(
  stat: PermanentStat, hardCap: number, cycles: number, fluxTrainBase: number,
  effectiveLayer: number, strengthXpPerCycle: number,
): PermanentStat {
  let result = { ...stat };
  for (let cycle = 0; cycle < cycles; cycle += 1) {
    result = trainStrength(result, strengthXpPerCycle);
    result = { ...result, fluxCap: result.fluxCap
      + fluxTrainingGain(result.fluxCap, hardCap, fluxTrainBase, effectiveLayer) };
  }
  return result;
}

function uniqueSorted(values: readonly string[]): string[] {
  const result = [...new Set(values)];
  result.sort(compareCodePoints);
  return result;
}

function change(
  targetKind: FluxTrainingChange['targetKind'], targetRef: string,
  previous: PermanentStat, next: PermanentStat,
): FluxTrainingChange {
  return { targetKind, targetRef, previousFluxCap: previous.fluxCap, fluxCap: next.fluxCap,
    previousStrengthLayer: previous.strengthLayer, strengthLayer: next.strengthLayer,
    strengthXp: next.strengthXp };
}

export function advanceInnerPractice(
  progress: MeridianProgress, input: InnerPracticeInput,
): InnerPracticeResult {
  assertIntRange(input.elapsedTicks, 0, Number.MAX_SAFE_INTEGER, 'PROGRESSION_ELAPSED_TICKS');
  assertIntRange(input.carriedTicks ?? 0, 0, Number.MAX_SAFE_INTEGER, 'PROGRESSION_CARRIED_TICKS');
  assertIntRange(input.cycleTicks, 1, Number.MAX_SAFE_INTEGER, 'PROGRESSION_CYCLE_TICKS');
  assertIntRange(input.rateH, 0, Number.MAX_SAFE_INTEGER, 'PROGRESSION_RATE_H');
  const elapsed = input.elapsedTicks + (input.carriedTicks ?? 0);
  if (!Number.isSafeInteger(elapsed)) throw new RangeError('PROGRESSION_TICKS_OVERFLOW');
  const completedCycles = floorDivInt(elapsed, input.cycleTicks);
  const remainderTicks = elapsed % input.cycleTicks;
  if (completedCycles === 0) return { progress, completedCycles, remainderTicks, changes: [], events: [] };
  const next = cloneProgress(progress);
  const changes: FluxTrainingChange[] = [];
  const gainedXp = Math.max(1, floorDivInt(input.rateH, 20));
  for (const targetRef of uniqueSorted(input.meridianIds)) {
    const previous = next.meridianStats[targetRef];
    if (previous === undefined) throw new RangeError('PROGRESSION_TARGET_NOT_OPEN');
    const trained = trainTarget(previous, 96, completedCycles, input.fluxTrainBase, input.effectiveLayer, gainedXp);
    next.meridianStats[targetRef] = trained; changes.push(change('meridian', targetRef, previous, trained));
  }
  for (const targetRef of uniqueSorted(input.acupointIds)) {
    const previous = next.acupointStats[targetRef];
    if (previous === undefined || !next.opened.includes(targetRef)) throw new RangeError('PROGRESSION_TARGET_NOT_OPEN');
    const trained = trainTarget(previous, 64, completedCycles, input.fluxTrainBase, input.effectiveLayer, gainedXp);
    next.acupointStats[targetRef] = trained; changes.push(change('acupoint', targetRef, previous, trained));
  }
  const event: ProgressionEvent = { t: 'progression/innerPracticeCompleted', mode: input.mode,
    completedCycles, remainderTicks };
  return { progress: next, completedCycles, remainderTicks, changes, events: [event] };
}

function validateEffect(effect: MeridianTemperEffect): void {
  assertIntRange(effect.gradeUp, 0, 3, 'PROGRESSION_GRADE_UP');
  assertIntRange(effect.strengthXp, 0, 5000, 'PROGRESSION_STRENGTH_XP');
  assertIntRange(effect.fluxFlat, 0, 16, 'PROGRESSION_FLUX_FLAT');
  if (effect.gradeUp + effect.strengthXp + effect.fluxFlat === 0) {
    throw new RangeError('PROGRESSION_EMPTY_BOOST');
  }
}

export function applyMeridianBoost(
  progress: MeridianProgress, effect: MeridianTemperEffect,
): { readonly progress: MeridianProgress; readonly event: ProgressionEvent } {
  validateEffect(effect);
  const source = effect.targetKind === 'meridian'
    ? progress.meridianStats[effect.targetRef] : progress.acupointStats[effect.targetRef];
  if (source === undefined || (effect.targetKind === 'acupoint'
    && !progress.opened.includes(effect.targetRef))) throw new RangeError('PROGRESSION_TARGET_NOT_OPEN');
  const hardCap = effect.targetKind === 'meridian' ? 96 : 64;
  const strengthened = trainStrength({ ...source, grade: Math.min(12, source.grade + effect.gradeUp) },
    effect.strengthXp);
  const stat = { ...strengthened, fluxCap: Math.min(hardCap, strengthened.fluxCap + effect.fluxFlat) };
  const next = cloneProgress(progress);
  if (effect.targetKind === 'meridian') next.meridianStats[effect.targetRef] = stat;
  else next.acupointStats[effect.targetRef] = stat;
  return { progress: next, event: { t: 'progression/meridianBoostApplied',
    targetKind: effect.targetKind, targetRef: effect.targetRef, grade: stat.grade,
    strengthLayer: stat.strengthLayer, strengthXp: stat.strengthXp, fluxCap: stat.fluxCap } };
}
