import { addInventoryItem, cloneJsonValue, type CharacterState, type GameState } from '../state';
import { createBattleSession, actBattleSession, retryBattleSession, setBattleAuto,
  stepBattleSession, computeBattleRewards, forkBattleSession, peekReadyUnitId,
  concedeBattleSession, acceptBattleDemonstration, encounterRetryAllowed,
  queryBattleSubdue, subdueBattleUnit, type BattleSessionState } from '../battle';
import type { BattleBusCommand, CommandHandler, CoreTransaction, RejectReason } from '.';
import { mergeBattleTraining } from '../battle/rewards/settlement';
import { freezeJsonTree, trackAppendOnlyJson } from '../state/immutable-json';
import { executeActions, type ActionExecutionContext } from '../event/event-executor';
import type { EncounterSettlementAction } from '@tianshu/data/schemas';

const SETTLEMENT_CONTEXT: ActionExecutionContext = { sourceId: 'battle/settlement', anchorId: null,
  reject: { condition: 'SOURCE_EVENT_CONDITION', action: 'SOURCE_EVENT_ACTION',
    reference: 'SOURCE_EVENT_REFERENCE', inventory: 'SOURCE_EVENT_INVENTORY',
    quest: 'SOURCE_EVENT_ACTION', battle: 'SOURCE_EVENT_ACTION' } };
function settlementActions(tx: CoreTransaction, assisted = false): readonly EncounterSettlementAction[] {
  const session = tx.state.battle!;
  const definition = tx.content.encounters?.find((row) =>
    row.id === session.battle.setup.encounterId);
  const settlement = definition?.settlement;
  if (!settlement) return [];
  if (assisted) return settlement.onAssisted;
  const conceded = session.battle.events.some((event) => event.t === 'battle/conceded');
  return conceded ? settlement.onConcede : session.battle.result === 'win'
    ? settlement.onWin : settlement.onLose;
}
function executeSettlement(tx: CoreTransaction, assisted = false): void {
  const session = tx.state.battle!;
  const definition = tx.content.encounters?.find((row) => row.id === session.battle.setup.encounterId);
  const actions = [...settlementActions(tx, assisted)];
  if ((assisted || session.battle.result === 'win') && definition?.settlement?.resetLossOnWin)
    actions.push(...definition.settlement.lossFlags.map((flagId) =>
      ({ op: 'flag/set' as const, flagId, value: false })));
  const context = { ...SETTLEMENT_CONTEXT, sourceId: session.battle.setup.encounterId };
  for (const action of actions) {
    if (action.op === 'quest/advance') {
      const line = tx.state.chapter.story.lines.find((row) => row.lineId === action.quest);
      const current = line?.activeNodeIds[0];
      const definition = tx.content.quests?.find((row) => row.id === action.quest);
      if (current === action.stage || definition?.stages.find((row) => row.id === current)
        ?.transitions.some((edge) => edge.to === action.stage) === true)
        executeActions(tx, [action], context);
    } else executeActions(tx, [action], context);
  }
}
function lossFlags(tx: CoreTransaction): readonly string[] {
  const encounterId = tx.state.battle?.battle.setup.encounterId;
  return tx.content.encounters?.find((row) => row.id === encounterId)?.settlement?.lossFlags ?? [];
}
function storedLossStreak(tx: CoreTransaction, flags: readonly string[]): number {
  const switches = tx.state.profile.replayRules?.switches ?? {};
  let count = 0;
  for (let index = 0; index < flags.length; index += 1)
    if (switches[flags[index]!] === true) count = index + 1;
  return count;
}
function persistAttemptLoss(tx: CoreTransaction, attemptedLosses: number): void {
  const flags = lossFlags(tx); if (flags.length === 0) return;
  const base = tx.state.battle?.opening.setup.scriptContext?.lossStreak ?? storedLossStreak(tx, flags);
  const count = Math.min(flags.length, Math.max(storedLossStreak(tx, flags), base + attemptedLosses));
  const actions = flags.map((flagId, index) => ({ op: 'flag/set' as const, flagId,
    value: index < count }));
  executeActions(tx, actions, { ...SETTLEMENT_CONTEXT,
    sourceId: tx.state.battle!.battle.setup.encounterId });
}

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
  if (command.t === 'battle/retry') {
    if (session.battle.phase !== 'ended') return 'BATTLE_NOT_ENDED';
    return session.battle.result === 'lose' && encounterRetryAllowed(session.battle.setup)
      ? null : 'BATTLE_ACTION_REJECTED';
  }
  if (command.t === 'battle/concede') return session.battle.phase === 'ended'
    ? 'BATTLE_ENDED' : session.battle.setup.end.concede === undefined ||
      session.battle.setup.end.concede === 'forbidden' ? 'BATTLE_ACTION_REJECTED' : null;
  if (command.t === 'battle/subdue')
    return queryBattleSubdue(session, command.actor, command.target).enabled
      ? null : 'BATTLE_ACTION_REJECTED';
  if (command.t === 'battle/demonstration') {
    if (session.battle.phase === 'ended') return 'BATTLE_ENDED';
    return session.battle.events.some((event) => event.t === 'battle/demonstrationOffered'
      && event.message === command.replayId) ? null : 'BATTLE_ACTION_REJECTED';
  }
  if (session.battleId !== command.battleId || session.outcomeSeq !== command.outcomeSeq)
    return 'BATTLE_RECEIPT_MISMATCH';
  return session.battle.phase === 'ended' ? null : 'BATTLE_NOT_ENDED';
}

function participantRef(session: BattleSessionState, character: CharacterState,
  protagonist: boolean): string {
  const characterRef = protagonist ? 'protagonist' : `companion:${character.characterId}`;
  return session.battle.setup.participants.find((row) => row.characterRef === characterRef)?.unitRef
    ?? character.characterId;
}
function settleCharacter(character: CharacterState, session: BattleSessionState,
  unitRef: string): CharacterState {
  if (session.battle.setup.returnContext.recovery !== 'preserve') return character;
  const unit = session.battle.units.find((row) => row.id === unitRef);
  if (unit === undefined) return character;
  return { ...character, resources: { hp: Math.min(unit.hp, character.stats.hpMax),
    mp: Math.min(unit.mp, character.stats.mpMax) },
    consumable: { ...character.consumable, stamina: Math.min(unit.stamina, character.consumable.staminaMax),
      temporaryEffects: cloneJsonValue(unit.itemEffects) } };
}

function finalize(tx: CoreTransaction): void {
  const session = tx.state.battle!;
  if (session.battle.result === 'lose') persistAttemptLoss(tx, session.retryCount + 1);
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
  const protagonistRef = tx.state.profile.protagonist === null ? null
    : participantRef(session, tx.state.profile.protagonist, true);
  const companionRefs = tx.state.profile.companions.map((row) => participantRef(session, row, false));
  const protagonist = tx.state.profile.protagonist === null ? null
    : settleCharacter(tx.state.profile.protagonist, session, protagonistRef!);
  const companions = tx.state.profile.companions.map((row, index) =>
    settleCharacter(row, session, companionRefs[index]!));
  const receipt = { battleId: session.battleId, outcomeSeq: session.outcomeSeq };
  const recipients = new Set([protagonistRef, ...companionRefs]
    .filter((id): id is string => id !== undefined));
  const training = mergeBattleTraining(tx.state.profile.battleTraining, session.battle.rewardStats, recipients);
  executeSettlement(tx, session.battle.events.some((event) =>
    event.t === 'battle/demonstrationAccepted'));
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
  else if (command.t === 'battle/retry') {
    persistAttemptLoss(tx, session.retryCount + 1); retryBattleSession(session);
  }
  else if (command.t === 'battle/concede') {
    concedeBattleSession(session);
  }
  else if (command.t === 'battle/subdue') {
    subdueBattleUnit(session, command.actor, command.target);
  }
  else if (command.t === 'battle/demonstration') {
    acceptBattleDemonstration(session, command.replayId);
  }
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
