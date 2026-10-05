import { mulBpFloor } from '@tianshu/shared';
import type { QigongDeviationEffect } from '../progression';

export type BuffId = `bf_${string}`;
export type BuffHook = 'onTurnStart' | 'onTurnEnd' | 'onExtraAction' | 'onApply' | 'onRemove';
export type BuffOpcode =
  | { readonly op: 'damageHp'; readonly amountBp: number; readonly perStack: boolean; readonly bypassShield: boolean }
  | { readonly op: 'modifyMp'; readonly amount: number }
  | { readonly op: 'skipAction' }
  | { readonly op: 'log'; readonly messageKey: string };
export interface CompiledBuffTrigger { readonly hook: BuffHook; readonly priority: number;
  readonly triggerIndex: number; readonly minStacks?: number; readonly ops: readonly BuffOpcode[] }
export interface BuffProgram { readonly id: BuffId; readonly triggers: readonly CompiledBuffTrigger[] }
export interface BuffInstance { readonly iid: number; readonly def: BuffId; readonly holder: string;
  readonly source: string | null; readonly grade: number; readonly key?: string;
  stacks: number; turnsLeft: number; fresh: boolean }
export interface BuffTarget { readonly id: string; hp: number; readonly hpMax: number;
  mp: number; readonly mpMax: number; shield?: number }
export interface BuffEvent { readonly t: 'buff/damage' | 'buff/mpChanged' | 'buff/actionSkipped' | 'buff/log';
  readonly holder: string; readonly buffId: BuffId; readonly iid: number; readonly amount: number;
  readonly shieldSpent?: number; readonly messageKey?: string }

export const GRADE_FACTOR_BP = [0, 10_000, 11_000, 12_000, 14_000, 15_500, 17_000,
  20_000, 22_000, 24_000, 28_000, 31_000, 35_000] as const;

const gradeFactorBp = (grade: number): number =>
  GRADE_FACTOR_BP[Math.max(1, Math.min(12, grade))] ?? 10_000;

function strongestGrade(instances: readonly BuffInstance[], id: BuffId): number {
  let grade = 0;
  for (const instance of instances) if (instance.def === id) grade = Math.max(grade, instance.grade);
  return grade;
}

function scaledPenaltyBp(instances: readonly BuffInstance[], id: BuffId, baseBp: number): number {
  const grade = strongestGrade(instances, id);
  return grade === 0 ? 0 : mulBpFloor(baseBp, gradeFactorBp(grade));
}

/** Percent modifiers from the three on-hit definitions, expressed as signed basis points. */
export function onHitBuffModifiers(instances: readonly BuffInstance[]): {
  readonly hitBp: number; readonly parryBp: number; readonly defOutBp: number;
  readonly effResBp: number;
} {
  return {
    hitBp: -scaledPenaltyBp(instances, 'bf_shiheng', 200),
    parryBp: -scaledPenaltyBp(instances, 'bf_shiheng', 400),
    defOutBp: -scaledPenaltyBp(instances, 'bf_pojia', 600),
    effResBp: -scaledPenaltyBp(instances, 'bf_dongyao', 500),
  };
}

export function applyPctModifier(value: number, modifierBp: number): number {
  const factor = Math.max(2_000, 10_000 + modifierBp);
  if (value >= 0) return mulBpFloor(value, factor);
  return -mulBpFloor(-value, factor);
}

export const hasStaggerRecoveryPenalty = (instances: readonly BuffInstance[]): boolean =>
  strongestGrade(instances, 'bf_shiheng') > 0;

export function consumeStaggerRecoveryPenalty(instances: BuffInstance[]): void {
  const index = instances.findIndex((instance) => instance.def === 'bf_shiheng');
  if (index >= 0) instances.splice(index, 1);
}

export const NEGATIVE_BUFF_PROGRAMS: readonly BuffProgram[] = [
  { id: 'bf_zhongdu', triggers: [{ hook: 'onTurnStart', priority: 210, triggerIndex: 0,
    ops: [{ op: 'damageHp', amountBp: 80, perStack: true, bypassShield: true }] }] },
  { id: 'bf_liuxue', triggers: [{ hook: 'onTurnStart', priority: 230, triggerIndex: 0,
    ops: [{ op: 'damageHp', amountBp: 100, perStack: true, bypassShield: false }] }] },
  { id: 'bf_neishang', triggers: [{ hook: 'onTurnStart', priority: 260, triggerIndex: 0,
    ops: [{ op: 'damageHp', amountBp: 40, perStack: true, bypassShield: true }] }] },
  { id: 'bf_xuanyun', triggers: [{ hook: 'onTurnStart', priority: 450, triggerIndex: 0,
    ops: [{ op: 'skipAction' }] }] },
  { id: 'bf_xueweishoufeng', triggers: [{ hook: 'onTurnStart', priority: 450, triggerIndex: 0,
    minStacks: 9, ops: [{ op: 'skipAction' }] }] },
  { id: 'bf_chaqi', triggers: [] },
  { id: 'bf_dantianshousun', triggers: [] },
  { id: 'bf_jiangu', triggers: [] },
  { id: 'bf_xieli', triggers: [] },
];

function programById(id: BuffId, programs: readonly BuffProgram[]): BuffProgram | undefined {
  return programs.find((program) => program.id === id);
}

export function executeBuffHook(input: { readonly hook: BuffHook; readonly holder: BuffTarget;
  readonly instances: BuffInstance[]; readonly programs?: readonly BuffProgram[] }): readonly BuffEvent[] {
  const programs = input.programs ?? NEGATIVE_BUFF_PROGRAMS;
  const work: Array<{ instance: BuffInstance; trigger: CompiledBuffTrigger }> = [];
  for (const instance of input.instances) {
    const program = programById(instance.def, programs);
    if (program === undefined) continue;
    for (const trigger of program.triggers) if (trigger.hook === input.hook
      && instance.stacks >= (trigger.minStacks ?? 0)) work.push({ instance, trigger });
  }
  work.sort((left, right) => left.trigger.priority - right.trigger.priority
    || left.instance.iid - right.instance.iid || left.trigger.triggerIndex - right.trigger.triggerIndex);
  const rawDamage: number[][] = [];
  let rawDamageTotal = 0;
  for (let workIndex = 0; workIndex < work.length; workIndex += 1) {
    const item = work[workIndex]!; const row: number[] = []; rawDamage.push(row);
    for (let opIndex = 0; opIndex < item.trigger.ops.length; opIndex += 1) {
      const op = item.trigger.ops[opIndex]!;
      if (op.op !== 'damageHp') { row.push(0); continue; }
      const gradeFactor = gradeFactorBp(item.instance.grade);
      const stacks = op.perStack ? item.instance.stacks : 1;
      const raw = mulBpFloor(mulBpFloor(input.holder.hpMax, op.amountBp), gradeFactor) * stacks;
      row.push(raw); rawDamageTotal += raw;
    }
  }
  let trim = Math.max(0, rawDamageTotal - mulBpFloor(input.holder.hpMax, 1_200));
  for (let index = work.length - 1; index >= 0 && trim > 0; index -= 1) {
    const ops = work[index]!.trigger.ops;
    for (let opIndex = ops.length - 1; opIndex >= 0 && trim > 0; opIndex -= 1) {
      const op = ops[opIndex]!;
      if (op.op !== 'damageHp') continue;
      const raw = rawDamage[index]![opIndex] ?? 0; const cut = Math.min(raw, trim);
      rawDamage[index]![opIndex] = raw - cut; trim -= cut;
    }
  }
  const result: BuffEvent[] = [];
  for (let workIndex = 0; workIndex < work.length; workIndex += 1) {
    const item = work[workIndex]!;
    for (let opIndex = 0; opIndex < item.trigger.ops.length; opIndex += 1) {
      const op = item.trigger.ops[opIndex]!;
    if (op.op === 'damageHp') {
      const applied = Math.min(rawDamage[workIndex]![opIndex] ?? 0,
        input.holder.hp + (op.bypassShield ? 0 : input.holder.shield ?? 0));
      if (applied > 0) {
        const shieldSpent = op.bypassShield ? 0 : Math.min(input.holder.shield ?? 0, applied);
        if (input.holder.shield !== undefined) input.holder.shield -= shieldSpent;
        const amount = Math.min(input.holder.hp, applied - shieldSpent);
        input.holder.hp -= amount; result.push({
          t: 'buff/damage', holder: input.holder.id, buffId: item.instance.def,
          iid: item.instance.iid, amount, shieldSpent });
      }
    } else if (op.op === 'modifyMp') {
      const before = input.holder.mp; input.holder.mp = Math.max(0, Math.min(input.holder.mpMax, before + op.amount));
      result.push({ t: 'buff/mpChanged', holder: input.holder.id, buffId: item.instance.def,
        iid: item.instance.iid, amount: input.holder.mp - before });
    } else if (op.op === 'skipAction') result.push({ t: 'buff/actionSkipped', holder: input.holder.id,
      buffId: item.instance.def, iid: item.instance.iid, amount: 1 });
    else result.push({ t: 'buff/log', holder: input.holder.id, buffId: item.instance.def,
      iid: item.instance.iid, amount: 0, messageKey: op.messageKey });
    }
  }
  return result;
}

export function endOwnAction(instances: BuffInstance[], extraAction = false): BuffInstance[] {
  if (extraAction) return instances;
  for (const instance of instances) {
    if (instance.fresh) instance.fresh = false;
    else if (instance.turnsLeft > 0) instance.turnsLeft -= 1;
  }
  return instances.filter((instance) => instance.turnsLeft !== 0);
}

export function createQigongDeviationBuff(effect: QigongDeviationEffect, holder: string, iid: number): BuffInstance {
  return { iid, def: effect.buffId, holder, source: null, grade: 1, stacks: 1,
    turnsLeft: effect.ownActions, fresh: false };
}

export function qiProductionBp(instances: readonly BuffInstance[]): number {
  let result = 10_000;
  // Fixed program order matches the previous stable ID sort without allocating on every tick.
  for (const instance of instances) {
    if (instance.def === 'bf_chaqi') result = mulBpFloor(result, 5_000);
  }
  for (const instance of instances) {
    if (instance.def === 'bf_dantianshousun') result = mulBpFloor(result,
      10_000 - ([1_500, 3_000, 5_000, 7_500][Math.min(4, Math.max(1, instance.stacks)) - 1] ?? 0));
  }
  return result;
}

export const forbidsAcuteGather = (instances: readonly BuffInstance[]): boolean =>
  instances.some((instance) => instance.def === 'bf_chaqi'
    || (instance.def === 'bf_dantianshousun' && instance.stacks >= 4));

function defensiveBonusBp(instances: readonly BuffInstance[], id: BuffId): number {
  const grade = strongestGrade(instances, id);
  return grade === 0 ? 0 : mulBpFloor(500, gradeFactorBp(grade));
}

export const guardDefenseBonusBp = (instances: readonly BuffInstance[]): number =>
  defensiveBonusBp(instances, 'bf_jiangu');
export const guardDamageDownBp = (instances: readonly BuffInstance[]): number =>
  defensiveBonusBp(instances, 'bf_xieli');
export const hasGuardStance = (instances: readonly BuffInstance[]): boolean =>
  instances.some((instance) => instance.def === 'bf_jiangu' || instance.def === 'bf_xieli');
