import { compareCodePoints } from '@tianshu/shared';
import type { BattleRewardStats, BattleRewards, BattleSessionState } from '../types';
import { computeBattleRewards } from './index';

export function projectBattleRewards(session: BattleSessionState): BattleRewards | null {
  if (session.battle.phase !== 'ended') return null;
  const state = session.battle;
  const grantsDrops = state.result === 'win' && state.setup.rules.mode !== 'spar';
  return computeBattleRewards({ ...state, setup: { ...state.setup, rewards: {
    ...state.setup.rewards, lootDraws: 0,
  } } }, undefined, { includeDrops: grantsDrops });
}

/** Persist exact training facts; this does not invent SXP or permanent meridian gains. */
export function mergeBattleTraining(previous: BattleRewardStats | undefined,
  current: BattleRewardStats, recipients: ReadonlySet<string>): BattleRewardStats {
  const martialUses = (previous?.martialUses ?? []).map((entry) => ({ ...entry }));
  for (const entry of current.martialUses) {
    if (!recipients.has(entry.unitId)) continue;
    const row = martialUses.find((value) => value.unitId === entry.unitId && value.skillId === entry.skillId);
    if (row) row.uses += entry.uses; else martialUses.push({ ...entry });
  }
  const merge = (before: readonly { unitId: string; count: number }[],
    added: readonly { unitId: string; count: number }[]) => {
    const rows = before.map((entry) => ({ ...entry }));
    for (const entry of added) {
      if (!recipients.has(entry.unitId)) continue;
      const row = rows.find((value) => value.unitId === entry.unitId);
      if (row) row.count += entry.count; else rows.push({ ...entry });
    }
    return rows.sort((a, b) => compareCodePoints(a.unitId, b.unitId));
  };
  return { martialUses: martialUses.sort((a, b) => compareCodePoints(a.unitId, b.unitId)
    || compareCodePoints(a.skillId, b.skillId)),
  movementActions: merge(previous?.movementActions ?? [], current.movementActions),
  fullCirculations: merge(previous?.fullCirculations ?? [], current.fullCirculations) };
}
