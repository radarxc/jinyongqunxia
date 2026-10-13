import { addInventoryItem, cloneJsonValue, type CharacterState, type GameState } from '../state';
import { createBattleSession, actBattleSession, retryBattleSession, setBattleAuto,
  stepBattleSession, computeBattleRewards, forkBattleSession, peekReadyUnitId,
  type BattleSessionState } from '../battle';
import type { BattleBusCommand, CommandHandler, CoreTransaction, RejectReason } from '.';
import { mergeBattleTraining } from '../battle/rewards/settlement';
import { freezeJsonTree, trackAppendOnlyJson } from '../state/immutable-json';

function receiptKey(command: { readonly battleId: string; readonly outcomeSeq: number }): string {
  return `${command.battleId}/${command.outcomeSeq}`;
}
function hasReceipt(state: Readonly<GameState>, command: { readonly battleId: string;
  readonly outcomeSeq: number }): boolean {
  return (state.world.battleReceipts ?? []).some((row) => receiptKey(row) === receiptKey(command));
}
function preflight(state: Readonly<GameState>, command: BattleBusCommand): RejectReason | null {
  if (command.t === 'battle/enter') return state.battle === null ? null : 'BATTLE_ALREADY_ACTIVE';
  if (command.t === 'battle/finalize' && hasReceipt(state, command)) return null;
  const session = state.battle; if (session === null) return 'BATTLE_NOT_ACTIVE';
  if ('expectedRevision' in command && command.expectedRevision !== undefined
    && command.expectedRevision !== session.revision) return 'BATTLE_STALE_REVISION';
  if (command.t === 'battle/act') {
    if (session.battle.phase === 'ended') return 'BATTLE_ENDED';
    const actor = session.battle.units.find((unit) =>
      unit.id === peekReadyUnitId(session.battle));
    if (command.automatic === true) {
      if (!session.auto && actor?.control !== 'ai') return 'BATTLE_MANUAL_TURN';
    } else if (session.auto) return 'BATTLE_AUTO_ACTIVE';
    else if (actor?.control !== 'player') return 'BATTLE_NOT_MANUAL_TURN';
    return null;
  }
  if (command.t === 'battle/setAuto') {
    if (session.battle.phase === 'ended') return 'BATTLE_ENDED';
    return command.mode === 'auto' && session.battle.setup.rules.noAuto
      ? 'BATTLE_AUTO_FORBIDDEN' : null;
  }
  if (command.t === 'battle/retry') return session.battle.phase === 'ended'
    ? null : 'BATTLE_NOT_ENDED';
  if (session.battleId !== command.battleId || session.outcomeSeq !== command.outcomeSeq)
    return 'BATTLE_RECEIPT_MISMATCH';
  return session.battle.phase === 'ended' ? null : 'BATTLE_NOT_ENDED';
}

function settleCharacter(character: CharacterState, session: BattleSessionState): CharacterState {
  if (session.battle.setup.returnContext.recovery !== 'preserve') return character;
  const unit = session.battle.units.find((row) => row.id === character.characterId);
  if (unit === undefined) return character;
  return { ...character, resources: { hp: Math.min(unit.hp, character.stats.hpMax),
    mp: Math.min(unit.mp, character.stats.mpMax) },
    consumable: { ...character.consumable, stamina: Math.min(unit.stamina, character.consumable.staminaMax),
      temporaryEffects: cloneJsonValue(unit.itemEffects) } };
}

function finalize(tx: CoreTransaction): void {
  const session = tx.state.battle!;
  const grantsDrops = session.battle.result === 'win' && session.battle.setup.rules.mode !== 'spar';
  const computed = computeBattleRewards(session.battle, grantsDrops ? tx.rng('loot') : undefined,
    { includeDrops: grantsDrops });
  const rewards = computed;
  let inventory = session.battle.inventory;
  if (session.battle.result === 'win') for (const drop of rewards.drops) {
    const item = session.battle.setup.itemDefs.find((row) => row.id === drop.itemId);
    if (item === undefined) tx.abort('BATTLE_REWARD_ITEM_UNKNOWN');
    try { inventory = addInventoryItem(inventory, item, drop.count); }
    catch (error) {
      if (error instanceof TypeError && error.message === 'INVENTORY_STACK_LIMIT')
        tx.abort('BATTLE_REWARD_CAPACITY');
      throw error;
    }
  }
  const protagonist = tx.state.profile.protagonist === null ? null
    : settleCharacter(tx.state.profile.protagonist, session);
  const companions = tx.state.profile.companions.map((row) => settleCharacter(row, session));
  const receipt = { battleId: session.battleId, outcomeSeq: session.outcomeSeq };
  const recipients = new Set([protagonist?.characterId, ...companions.map((row) => row.characterId)]
    .filter((id): id is string => id !== undefined));
  const training = mergeBattleTraining(tx.state.profile.battleTraining, session.battle.rewardStats, recipients);
  tx.set(['party', 'inventory'], inventory);
  if (session.battle.itemChapterUses !== undefined)
    tx.set(['chapter', 'itemChapterUses'], { ...session.battle.itemChapterUses });
  tx.set(['profile'], { ...tx.state.profile, protagonist, companions, battleTraining: training });
  tx.set(['world', 'battleReceipts'], [...(tx.state.world.battleReceipts ?? []), receipt]);
  tx.set(['battle'], null);
  tx.emit({ t: 'battle/rewards', payload: rewards as never });
  tx.emit({ t: 'battle/finalized', payload: receipt });
}

function commitSession(tx: CoreTransaction, current: BattleSessionState,
  candidate: BattleSessionState): void {
  const events = candidate.battle.events; const accepted = candidate.battle.acceptedCommands;
  const recorded = candidate.commandLog;
  for (const row of candidate.battle.meridianByUnit) freezeJsonTree(row.flow);
  for (const row of [...events, ...accepted, ...recorded]) freezeJsonTree(row);
  for (const rows of [current.battle.events, current.battle.acceptedCommands, current.commandLog])
    trackAppendOnlyJson(rows);
  const next: BattleSessionState = { ...candidate, battle: { ...candidate.battle,
    events: current.battle.events, acceptedCommands: current.battle.acceptedCommands },
    commandLog: current.commandLog };
  tx.set(['battle'], next);
  tx.splice(['battle', 'battle', 'events'], current.battle.events.length, 0, events);
  tx.splice(['battle', 'battle', 'acceptedCommands'], current.battle.acceptedCommands.length, 0, accepted);
  tx.splice(['battle', 'commandLog'], current.commandLog.length, 0, recorded);
  for (const event of events) tx.emit({ t: event.t, payload: { ...event } as never });
}

function apply(tx: CoreTransaction, command: BattleBusCommand): void {
  if (command.t === 'battle/enter') {
    const seed = tx.rng('world').nextU32(); const setup = { ...cloneJsonValue(command.setup), seed,
      setupId: `${command.setup.setupId}:${tx.state.meta.nextRuntimeOrdinal}`,
      ...(Object.keys(tx.state.chapter.itemChapterUses).length === 0 ? {}
        : { itemChapterUses: { ...tx.state.chapter.itemChapterUses } }),
      inventory: cloneJsonValue(tx.state.party.inventory) };
    if (Object.keys(tx.state.chapter.itemChapterUses).length === 0) delete setup.itemChapterUses;
    const session = createBattleSession(setup, command.seeds); tx.set(['battle'], session);
    tx.emit({ t: 'battle/entered', payload: { battleId: session.battleId, seed } }); return;
  }
  const current = tx.state.battle!; const session = forkBattleSession(current);
  if (command.t === 'battle/act') {
    const result = command.automatic === true ? stepBattleSession(session, undefined, true)
      : actBattleSession(session, command, true);
    if (!result.accepted) tx.abort('BATTLE_ACTION_REJECTED', result.error);
  } else if (command.t === 'battle/setAuto') setBattleAuto(session, command.mode === 'auto');
  else if (command.t === 'battle/retry') retryBattleSession(session);
  else if (command.t === 'battle/finalize') { finalize(tx); return; }
  else { finalize(tx); tx.emit({ t: 'battle/left', payload: { battleId: command.battleId,
    outcomeSeq: command.outcomeSeq } }); return; }
  commitSession(tx, current, session);
}

export const battleHandler: CommandHandler<BattleBusCommand> = {
  noop: (state, command) => command.t === 'battle/finalize' && hasReceipt(state, command)
    || command.t === 'battle/setAuto' && state.battle !== null
      && state.battle.battle.phase !== 'ended' && state.battle.auto === (command.mode === 'auto'),
  validate: preflight, apply,
};
