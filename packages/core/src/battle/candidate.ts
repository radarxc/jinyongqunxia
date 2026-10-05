import { cloneJsonValue } from '../state/json';
import type { BattleState } from './types';

/** Copy mutable unit fields; stats, moves, and replaced flow snapshots are read-only. */
export function battleActionCandidate(state: BattleState): BattleState {
  return { ...state, units: state.units.map((unit) => ({ ...unit, pos: { ...unit.pos },
    zoneGuards: { body: { ...unit.zoneGuards.body }, hand: { ...unit.zoneGuards.hand },
      leg: { ...unit.zoneGuards.leg } },
    buffs: cloneJsonValue(unit.buffs), foreignQi: cloneJsonValue(unit.foreignQi),
    acupointOccupancies: cloneJsonValue(unit.acupointOccupancies),
    itemEffects: cloneJsonValue(unit.itemEffects), itemState: { ...unit.itemState,
      battleUses: { ...unit.itemState.battleUses }, lastBattleUseTurns: { ...unit.itemState.lastBattleUseTurns } },
  })), openingOrder: [...state.openingOrder],
  meridianByUnit: state.meridianByUnit.map((row) => ({ ...row })),
  inventory: { stacks: state.inventory.stacks.map((row) => ({ ...row })) },
  rewardStats: { martialUses: state.rewardStats.martialUses.map((row) => ({ ...row })),
    movementActions: state.rewardStats.movementActions.map((row) => ({ ...row })),
    fullCirculations: state.rewardStats.fullCirculations.map((row) => ({ ...row })) },
  events: [], acceptedCommands: [] };
}
