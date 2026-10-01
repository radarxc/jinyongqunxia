import { BP_SCALE, mulDivFloor } from '@tianshu/shared';
import { applyMeridianBoost } from '../progression';
import { TICKS_PER_HOUR } from '../state';
import { InventoryRuntime } from './inventory';
import type {
  AppliedItemEffect, ConsumableTargetState, PermanentItemBonuses,
  ConsumableUseState, UseConsumableInput, UseConsumableResult,
} from './types';

const CONSUMABLE_KINDS = new Set([
  'pill', 'tonic', 'poison', 'antidote', 'food', 'dish', 'wine',
]);

function usageAfterUse(input: UseConsumableInput): ConsumableUseState {
  const usage = input.usage ?? { battleUses: {}, chapterUses: {} };
  const battleUses = { ...usage.battleUses };
  const chapterUses = { ...usage.chapterUses };
  const lastBattleUseTurns = { ...(usage.lastBattleUseTurns ?? {}) };
  const perBattle = input.item.use?.battleLimit?.perBattle;
  if (perBattle !== undefined) {
    const used = battleUses[input.item.id] ?? 0;
    if (!Number.isSafeInteger(used) || used < 0 || used >= perBattle)
      throw new RangeError('CONSUMABLE_BATTLE_LIMIT');
    battleUses[input.item.id] = used + 1;
  }
  const cooldown = input.item.use?.battleLimit?.cooldown ?? 0;
  if (input.context === 'battle' && cooldown > 0) {
    const turn = input.battleTurnToken;
    if (!Number.isSafeInteger(turn) || (turn as number) < 0)
      throw new RangeError('CONSUMABLE_BATTLE_TURN');
    const previous = lastBattleUseTurns[input.item.id];
    if (previous !== undefined && (turn as number) <= previous + cooldown)
      throw new RangeError('CONSUMABLE_COOLDOWN');
    lastBattleUseTurns[input.item.id] = turn as number;
  }
  if (input.item.flags.includes('uniqueUse')) {
    const used = chapterUses[input.item.id] ?? 0;
    if (!Number.isSafeInteger(used) || used < 0 || used >= 1)
      throw new RangeError('CONSUMABLE_CHAPTER_LIMIT');
    chapterUses[input.item.id] = used + 1;
  }
  return { battleUses, chapterUses, lastBattleUseTurns };
}

function intParam(params: Readonly<Record<string, unknown>>, key: string, fallback = 0): number {
  const value = params[key] ?? fallback;
  if (!Number.isSafeInteger(value)) throw new TypeError('CONSUMABLE_EFFECT_INT');
  return value as number;
}

function recover(current: number, maximum: number, valueBp: number, receiveBp: number): number {
  if (valueBp < 0 || receiveBp < 0) throw new RangeError('CONSUMABLE_EFFECT_RANGE');
  const amount = mulDivFloor(maximum, valueBp * receiveBp, BP_SCALE * BP_SCALE);
  return Math.min(maximum, current + amount);
}

function permanent(
  current: PermanentItemBonuses, op: string, params: Readonly<Record<string, unknown>>,
): PermanentItemBonuses {
  if (op === 'permMaxPct') {
    return { ...current, hpMaxBp: current.hpMaxBp + intParam(params, 'hpMaxBp'),
      mpMaxBp: current.mpMaxBp + intParam(params, 'mpMaxBp') };
  }
  const stat = params['stat'];
  if (typeof stat !== 'string') throw new TypeError('CONSUMABLE_PERM_STAT');
  const value = intParam(params, 'value');
  return { ...current, stats: { ...current.stats, [stat]: (current.stats[stat] ?? 0) + value } };
}

function applyEffect(
  target: ConsumableTargetState, op: string, params: Readonly<Record<string, unknown>>,
  grade: number, receiveBp: number, context: UseConsumableInput['context'],
): ConsumableTargetState {
  switch (op) {
    case 'healPct': return { ...target, hp: recover(target.hp, target.hpMax,
      intParam(params, 'valueBp'), receiveBp) };
    case 'mpPct': return { ...target, mp: recover(target.mp, target.mpMax,
      intParam(params, 'valueBp'), BP_SCALE) };
    case 'staPct': return { ...target, stamina: recover(target.stamina, target.staminaMax,
      intParam(params, 'valueBp'), BP_SCALE) };
    case 'dispel': {
      const raw = params['tags'];
      if (!Array.isArray(raw) || !raw.every((tag) => typeof tag === 'string'))
        throw new TypeError('CONSUMABLE_DISPEL_TAGS');
      const tags = new Set(raw as string[]);
      return { ...target, ailments: target.ailments.filter(
        (ailment) => !tags.has(ailment.tag) || ailment.grade > intParam(params, 'grade', grade),
      ) };
    }
    case 'revive':
      if (context !== 'battle') throw new RangeError('CONSUMABLE_REVIVE_CONTEXT');
      return target.alive ? target : { ...target, alive: true, hp: Math.max(1,
        recover(0, target.hpMax, intParam(params, 'valueBp', 3000), receiveBp)) };
    case 'permStat':
    case 'permMaxPct':
      if (context !== 'field') throw new RangeError('CONSUMABLE_PERMANENT_CONTEXT');
      return { ...target, permanentBonuses: permanent(target.permanentBonuses, op, params) };
    default: {
      const effect: AppliedItemEffect = { op, grade, params: { ...params } };
      return { ...target, temporaryEffects: [...target.temporaryEffects, effect] };
    }
  }
}

export function useConsumable(input: UseConsumableInput): UseConsumableResult {
  if (!CONSUMABLE_KINDS.has(input.item.kind) || input.item.use === undefined)
    throw new TypeError('CONSUMABLE_ITEM_REQUIRED');
  const use = input.item.use;
  if (use.context !== 'both' && use.context !== input.context)
    throw new RangeError('CONSUMABLE_CONTEXT');
  const usage = usageAfterUse(input);
  const inventory = new InventoryRuntime(input.inventory, input.itemDefs);
  if (inventory.count(input.item.id) < 1) throw new RangeError('INVENTORY_INSUFFICIENT');
  let target = input.target;
  const progressionEvents = [];
  for (const effect of use.effects)
    target = applyEffect(target, effect.op, effect.params, input.item.grade ?? 1,
      input.healingReceivedBp ?? BP_SCALE, input.context);
  if (use.meridianTemper !== undefined) {
    if (input.context !== 'field') throw new RangeError('CONSUMABLE_MERIDIAN_CONTEXT');
    const result = applyMeridianBoost(target.meridians, use.meridianTemper);
    target = { ...target, meridians: result.progress };
    progressionEvents.push(result.event);
  }
  if (use.meridianAid !== undefined) {
    if (input.context !== 'field') throw new RangeError('CONSUMABLE_MERIDIAN_CONTEXT');
    const aid = use.meridianAid;
    target = { ...target, meridianAids: [...target.meridianAids, {
      sourceItemId: input.item.id, expiresAtTick: input.currentTick + aid.hours * TICKS_PER_HOUR,
      rateBp: aid.rateBp, successBp: aid.successBp, costReduceBp: aid.costReduceBp,
      ...(aid.meridians === undefined ? {} : { meridians: [...aid.meridians] }),
    }] };
  }
  inventory.remove(input.item.id, 1);
  return { inventory: inventory.snapshot(), target, usage, fieldTime: use.fieldTime ?? 0, events: [
    { t: 'economy/itemUsed', itemId: input.item.id, targetId: target.characterId },
    ...progressionEvents,
  ] };
}
