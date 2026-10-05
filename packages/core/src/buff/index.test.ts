import { describe, expect, it } from 'vitest';
import { interruptMeditation, createMeditationState } from '../progression';
import {
  applyPctModifier, consumeStaggerRecoveryPenalty, createQigongDeviationBuff, endOwnAction,
  executeBuffHook, forbidsAcuteGather, hasStaggerRecoveryPenalty, onHitBuffModifiers,
  qiProductionBp, type BuffInstance, type BuffProgram,
} from './index';

function instance(def: `bf_${string}`, iid: number, extra: Partial<BuffInstance> = {}): BuffInstance {
  return { iid, def, holder: 'u', source: null, grade: 1, stacks: 1, turnsLeft: 3,
    fresh: false, ...extra };
}

describe('Buff IR runtime', () => {
  it('dispatches by priority, iid and trigger index', () => {
    const programs: BuffProgram[] = [{ id: 'bf_test', triggers: [
      { hook: 'onTurnStart', priority: 2, triggerIndex: 1, ops: [{ op: 'log', messageKey: 'late' }] },
      { hook: 'onTurnStart', priority: 1, triggerIndex: 0, ops: [{ op: 'log', messageKey: 'early' }] },
    ] }];
    const target = { id: 'u', hp: 100, hpMax: 100, mp: 10, mpMax: 10 };
    expect(executeBuffHook({ hook: 'onTurnStart', holder: target,
      instances: [instance('bf_test', 2), instance('bf_test', 1)], programs })
      .map((event) => [event.iid, event.messageKey])).toEqual([
        [1, 'early'], [2, 'early'], [1, 'late'], [2, 'late'],
      ]);
  });

  it('caps poison, injury and bleed DOT together at 12 percent hpMax', () => {
    const target = { id: 'u', hp: 1000, hpMax: 1000, mp: 0, mpMax: 0 };
    const events = executeBuffHook({ hook: 'onTurnStart', holder: target, instances: [
      instance('bf_zhongdu', 1, { grade: 12, stacks: 10 }),
      instance('bf_neishang', 2, { grade: 12, stacks: 10 }),
      instance('bf_liuxue', 3, { grade: 12, stacks: 10 }),
    ] });
    expect(events.reduce((sum, event) => sum + event.amount, 0)).toBe(120);
    expect(target.hp).toBe(880);
  });

  it('accounts for every instance when a compiled damage opcode is shared', () => {
    const target = { id: 'u', hp: 1000, hpMax: 1000, mp: 0, mpMax: 0 };
    const events = executeBuffHook({ hook: 'onTurnStart', holder: target, instances: [
      instance('bf_zhongdu', 1), instance('bf_zhongdu', 2),
    ] });
    expect(events.map((event) => [event.iid, event.amount])).toEqual([[1, 8], [2, 8]]);
    expect(target.hp).toBe(984);
  });

  it('routes bleed through shield while poison and internal injury bypass it', () => {
    const bleedTarget = { id: 'u', hp: 1000, hpMax: 1000, mp: 0, mpMax: 0, shield: 20 };
    expect(executeBuffHook({ hook: 'onTurnStart', holder: bleedTarget,
      instances: [instance('bf_liuxue', 1)] })).toEqual([expect.objectContaining({
        amount: 0, shieldSpent: 10 })]);
    expect(bleedTarget).toMatchObject({ hp: 1000, shield: 10 });
    const poisonTarget = { id: 'u', hp: 1000, hpMax: 1000, mp: 0, mpMax: 0, shield: 20 };
    expect(executeBuffHook({ hook: 'onTurnStart', holder: poisonTarget,
      instances: [instance('bf_zhongdu', 1), instance('bf_neishang', 2)] }))
      .toEqual([expect.objectContaining({ amount: 8, shieldSpent: 0 }),
        expect.objectContaining({ amount: 4, shieldSpent: 0 })]);
    expect(poisonTarget).toMatchObject({ hp: 988, shield: 20 });
  });

  it('emits one hard-control skip event for stun', () => {
    const target = { id: 'u', hp: 100, hpMax: 100, mp: 0, mpMax: 0 };
    expect(executeBuffHook({ hook: 'onTurnStart', holder: target,
      instances: [instance('bf_xuanyun', 1)] })).toEqual([{ t: 'buff/actionSkipped',
        holder: 'u', buffId: 'bf_xuanyun', iid: 1, amount: 1 }]);
  });

  it('only treats level-nine acupoint seals as hard control', () => {
    const target = { id: 'u', hp: 100, hpMax: 100, mp: 0, mpMax: 0 };
    expect(executeBuffHook({ hook: 'onTurnStart', holder: target, instances: [
      instance('bf_xueweishoufeng', 1, { stacks: 8 }),
      instance('bf_xueweishoufeng', 2, { stacks: 9 }),
    ] })).toEqual([expect.objectContaining({ t: 'buff/actionSkipped', iid: 2 })]);
  });

  it('does not decrement a freshly applied duration at the current E2', () => {
    const buffs = [instance('bf_xuanyun', 1, { turnsLeft: 1, fresh: true })];
    expect(endOwnAction(buffs)[0]).toMatchObject({ turnsLeft: 1, fresh: false });
    expect(endOwnAction(buffs)).toEqual([]);
  });

  it('does not decrement duration on extra actions', () => {
    const buffs = [instance('bf_xuanyun', 1, { turnsLeft: 1 })];
    expect(endOwnAction(buffs, true)[0]?.turnsLeft).toBe(1);
  });

  it('bridges interrupted meditation into the canonical qi-deviation Buff', () => {
    const interruption = interruptMeditation(createMeditationState('med', 10), 'ambush', 5);
    const buff = createQigongDeviationBuff(interruption.effect!, 'hero', 3);
    expect(buff).toMatchObject({ def: 'bf_chaqi', holder: 'hero', turnsLeft: 3, fresh: false });
    expect(qiProductionBp([buff])).toBe(5000);
    expect(forbidsAcuteGather([buff])).toBe(true);
  });

  it('combines qi-deviation and dantian damage multiplicatively', () => {
    expect(qiProductionBp([instance('bf_chaqi', 1),
      instance('bf_dantianshousun', 2, { stacks: 2 })])).toBe(3500);
    expect(forbidsAcuteGather([instance('bf_dantianshousun', 2, { stacks: 4 })])).toBe(true);
  });

  it('scales all three on-hit Buff modifiers from the strongest inherited grade', () => {
    const buffs = [instance('bf_shiheng', 1, { grade: 7 }),
      instance('bf_pojia', 2, { grade: 7 }), instance('bf_dongyao', 3, { grade: 7 })];
    expect(onHitBuffModifiers(buffs)).toEqual({
      hitBp: -400, parryBp: -800, defOutBp: -1200, effResBp: -1000,
    });
    expect(applyPctModifier(100, -400)).toBe(96);
    expect(applyPctModifier(-100, -400)).toBe(-96);
  });

  it('consumes only one stagger instance when the next move is executed', () => {
    const buffs = [instance('bf_pojia', 1), instance('bf_shiheng', 2)];
    expect(hasStaggerRecoveryPenalty(buffs)).toBe(true);
    consumeStaggerRecoveryPenalty(buffs);
    expect(buffs.map((buff) => buff.def)).toEqual(['bf_pojia']);
    expect(hasStaggerRecoveryPenalty(buffs)).toBe(false);
  });
});
