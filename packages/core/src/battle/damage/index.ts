import type { Rng } from '../../rng';
import {
  calculateDamage, rollDamageVariance, rollJudge, type DamageFormulaInput, type DamageTrace,
  type JudgeInput, type JudgeResult,
} from './formula';
import { settleDamage, type DamageSettlement, type DamageSettlementInput } from './settlement';

export * from './formula';
export * from './meridian-effects';
export * from './settlement';

export interface ResolveDamageInput {
  readonly judge: JudgeInput; readonly formula: DamageFormulaInput;
  readonly resources: Omit<DamageSettlementInput, 'incoming' | 'outwardQi'>;
  readonly outwardQi?: Omit<NonNullable<DamageSettlementInput['outwardQi']>,
    'postShield' | 'd10' | 'neutralQiD10'>;
}
export interface ResolveDamageResult {
  readonly judge: JudgeResult; readonly incoming: number; readonly trace: DamageTrace | null;
  readonly neutralTrace: DamageTrace | null; readonly settlement: DamageSettlement | null;
}

export function resolveDamage(input: ResolveDamageInput, rng: Rng): ResolveDamageResult {
  const judge = rollJudge(input.judge, rng);
  if (!judge.hit) return { judge, incoming: 0, trace: null, neutralTrace: null, settlement: null };
  const varianceBp = rollDamageVariance(rng);
  const outcomes = { critical: judge.critical, parried: judge.parried };
  const trace = calculateDamage(input.formula, outcomes, varianceBp);
  const neutralTrace = input.outwardQi === undefined ? null : calculateDamage(
    { ...input.formula, meridianAttackBp: 10_000 }, outcomes, varianceBp);
  const outwardQi = input.outwardQi === undefined || neutralTrace === null ? undefined : {
    ...input.outwardQi, postShield: Math.max(0, trace.z10 - Math.min(input.resources.shield, trace.z10)),
    d10: trace.z10, neutralQiD10: neutralTrace.z10,
  };
  const settlement = settleDamage({ ...input.resources, incoming: trace.z10,
    ...(outwardQi === undefined ? {} : { outwardQi }) });
  return { judge, incoming: trace.z10, trace, neutralTrace, settlement };
}
