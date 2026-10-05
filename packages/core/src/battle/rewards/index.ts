import { compareCodePoints } from '@tianshu/shared';
import { intInclusive, type Rng } from '../../rng';
import { cloneJsonValue } from '../../state/json';
import type { BattleDrop, BattleRewards, BattleState } from '../types';

function addDrop(target: BattleDrop[], drop: BattleDrop): void {
  const existing = target.find((entry) => entry.itemId === drop.itemId);
  if (existing === undefined) target.push({ ...drop });
  else target[target.indexOf(existing)] = { ...existing, count: existing.count + drop.count };
}

function drawWeighted(state: BattleState, rng: Rng): BattleDrop {
  const pool = state.setup.rewards.lootPool;
  const total = pool.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = intInclusive(rng, 1, total);
  for (const entry of pool) {
    roll -= entry.weight;
    if (roll <= 0) return { itemId: entry.itemId, name: entry.name, count: entry.count };
  }
  throw new RangeError('BATTLE_LOOT_POOL');
}

export interface BattleRewardOptions { readonly includeDrops?: boolean }

/** Computes battle facts only. World inventory/progression writes belong to battle/finalize. */
export function computeBattleRewards(state: BattleState, lootRng?: Rng,
  options: BattleRewardOptions = {}): BattleRewards {
  const drops: BattleDrop[] = [];
  if (options.includeDrops !== false) for (const drop of state.setup.rewards.drops) addDrop(drops, drop);
  if (options.includeDrops !== false && state.setup.rewards.lootDraws > 0) {
    if (state.setup.rewards.lootPool.length === 0) throw new RangeError('BATTLE_LOOT_POOL');
    if (lootRng === undefined) throw new RangeError('BATTLE_LOOT_RNG_REQUIRED');
    for (let draw = 0; draw < state.setup.rewards.lootDraws; draw += 1) {
      addDrop(drops, drawWeighted(state, lootRng));
    }
  }
  return {
    drops: drops.sort((left, right) => compareCodePoints(left.itemId, right.itemId)),
    martialUses: [...state.rewardStats.martialUses]
      .sort((left, right) => compareCodePoints(left.unitId, right.unitId)
        || compareCodePoints(left.skillId, right.skillId))
      .map((entry) => ({ ...entry })),
    movementTrained: state.rewardStats.movementActions
      .filter((entry) => entry.count >= 3).map((entry) => entry.unitId).sort(compareCodePoints),
    fullCirculations: [...state.rewardStats.fullCirculations]
      .sort((left, right) => compareCodePoints(left.unitId, right.unitId)).map((entry) => ({ ...entry })),
  };
}

export function emitBattleRewards(state: BattleState, rewards: BattleRewards): void {
  if (state.phase !== 'ended') throw new RangeError('BATTLE_NOT_ENDED');
  if (state.events.some((event) => event.t === 'battle/rewards')) return;
  state.events.push({ t: 'battle/rewards', actionNo: state.actionNo, payload: cloneJsonValue(rewards) });
}
