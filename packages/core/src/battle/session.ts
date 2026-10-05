import { chooseAutoCommand, defaultMaxActions, type AutoPolicy } from '../ai';
import { createRng, seedStream } from '../rng';
import { cloneJsonValue } from '../state/json';
import { freezeJsonTree } from '../state/immutable-json';
import { advanceBattleToReady, resolveBattleAction, type BattleActionResult } from './action';
import { createBattleState, evaluateBattleEnd, type BattleUnitSeed } from './encounter';
import { peekReadyUnitId } from './timeline';
import { battleActionCandidate } from './candidate';
import type { BattleCommand, BattleEvent, BattleOpeningState, BattleSessionState, BattleSetup } from './types';

export const DEFAULT_AUTO_POLICY: AutoPolicy = { style: 'aggressive', reserveMpBp: 0,
  allowUltimate: true, allowItems: false };

export function deriveRetrySeed(seed: number, retryCount: number): number {
  if (!Number.isSafeInteger(seed) || seed < 0 || seed > 0xffff_ffff
    || !Number.isSafeInteger(retryCount) || retryCount < 1) throw new RangeError('BATTLE_RETRY_COUNT');
  let value = (seed ^ retryCount ^ 0x9e3779b9) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x85ebca6b) >>> 0;
  value = Math.imul(value ^ (value >>> 13), 0xc2b2ae35) >>> 0;
  return (value ^ (value >>> 16)) >>> 0;
}

function withSeed(setup: BattleSetup, seed: number): BattleSetup {
  return { ...cloneJsonValue(setup), seed };
}

export function createBattleSession(setup: BattleSetup, seeds: readonly BattleUnitSeed[]): BattleSessionState {
  const opening: BattleOpeningState = freezeJsonTree({ setup: cloneJsonValue(setup), seeds: cloneJsonValue(seeds) });
  const session: BattleSessionState = { schema: 'battle-session.v1', battleId: setup.setupId,
    battle: createBattleState(opening.setup, opening.seeds), battleRng: seedStream(setup.seed, 'battle'),
    aiRng: seedStream(setup.seed, 'ai'), opening, acceptedOrdinal: 0, decisionOrdinal: 0,
    revision: 0, retryCount: 0, auto: false, outcomeSeq: 0, commandLog: [] };
  readyBattleSession(session);
  freezeJsonTree(session.battle.grid);
  for (const row of session.battle.meridianByUnit) freezeJsonTree(row.flow);
  return session;
}

export function readyBattleSession(session: BattleSessionState): void {
  if (session.battle.phase === 'ended') return;
  const outcome = evaluateBattleEnd(session.battle);
  if (outcome !== null) { endBattleSession(session, outcome); return; }
  if (advanceBattleToReady(session.battle).kind === 'stalled') endBattleSession(session, 'draw');
  else for (const unit of session.battle.units) unit.revision += 1;
  const afterTicks = evaluateBattleEnd(session.battle);
  if (afterTicks !== null) endBattleSession(session, afterTicks);
}

export function endBattleSession(session: BattleSessionState,
  result: 'win' | 'lose' | 'retreat' | 'draw'): void {
  if (session.battle.phase !== 'ended') {
    session.battle.phase = 'ended'; session.battle.result = result;
    session.outcomeSeq += 1;
    session.battle.events.push({ t: 'battle/ended', actionNo: session.battle.actionNo, message: result });
  }
  if (session.auto) {
    session.auto = false; session.battle.events.push({ t: 'battle/autoSimulationEnded',
      actionNo: session.battle.actionNo, message: result });
  }
}

export interface BattleSessionActionResult extends BattleActionResult {
  readonly command: BattleCommand; readonly events: readonly BattleEvent[];
}

export function actBattleSession(session: BattleSessionState, command: BattleCommand,
  ownedCandidate = false): BattleSessionActionResult {
  if (!ownedCandidate) {
    const candidate = forkBattleSession(session);
    const result = actBattleSession(candidate, command, true);
    if (result.accepted) commitBattleSession(session, candidate);
    return result;
  }
  const eventStart = session.battle.events.length; const rng = createRng(session.battleRng);
  const aiRng = createRng(session.aiRng);
  if (command.automatic === true && command.aiSeed !== aiRng.nextU32()) return {
    accepted: false, error: 'BATTLE_AI_SEED_MISMATCH', hpDamage: 0, eventsAdded: 0, command, events: [] };
  const ready = session.battle.units.find((unit) => unit.id === peekReadyUnitId(session.battle));
  if (command.automatic === true && !session.auto && ready?.control !== 'ai') return { accepted: false,
    error: 'BATTLE_AUTO_INACTIVE', hpDamage: 0, eventsAdded: 0, command, events: [] };
  const result = resolveBattleAction(session.battle, command, rng,
    { deferEndCheck: true, ownedCandidate: true });
  if (!result.accepted) return { ...result, command, events: [] };
  session.battleRng = rng.snapshot(); session.acceptedOrdinal += 1;
  if (command.automatic === true) {
    session.aiRng = aiRng.snapshot(); session.decisionOrdinal += 1;
  }
  session.commandLog.push(cloneJsonValue(command)); session.revision += 1;
  if (command.automatic === true) {
    const target = command.t === 'battle/act' && command.action.t === 'skill'
      && typeof command.action.target === 'string' ? command.action.target : undefined;
    session.battle.events.push({ t: 'battle/autoExchangeResolved', actionNo: session.battle.actionNo,
      actor: command.actor, amount: result.hpDamage, ...(target === undefined ? {} : { target }) });
  }
  const outcome = evaluateBattleEnd(session.battle);
  if (outcome !== null && session.battle.phase !== 'ended') endBattleSession(session, outcome);
  if (session.battle.phase !== 'ended' && session.battle.actionNo >=
      defaultMaxActions(session.battle.units.length)) endBattleSession(session, 'draw');
  readyBattleSession(session);
  return { ...result, command, events: session.battle.events.slice(eventStart) };
}

export function setBattleAuto(session: BattleSessionState, enabled: boolean): readonly BattleEvent[] {
  if (session.battle.phase === 'ended') throw new RangeError('BATTLE_ENDED');
  if (enabled && session.battle.setup.rules.noAuto) throw new RangeError('BATTLE_AUTO_FORBIDDEN');
  if (session.auto === enabled) return [];
  const event: BattleEvent = { t: enabled ? 'battle/autoSimulationStarted'
    : 'battle/autoSimulationEnded', actionNo: session.battle.actionNo };
  session.auto = enabled; session.acceptedOrdinal += 1; session.revision += 1;
  session.commandLog.push({ t: 'battle/setAuto', mode: enabled ? 'auto' : 'manual' });
  session.battle.events.push(event);
  return [event];
}

export function stepBattleSession(session: BattleSessionState,
  policy: AutoPolicy = DEFAULT_AUTO_POLICY, ownedCandidate = false): BattleSessionActionResult {
  if (session.battle.phase === 'ended') throw new RangeError('BATTLE_ENDED');
  const actorId = peekReadyUnitId(session.battle);
  const actor = session.battle.units.find((unit) => unit.id === actorId);
  if (actor === undefined || (!session.auto && actor.control !== 'ai')) {
    throw new RangeError('BATTLE_MANUAL_TURN');
  }
  const command = { ...chooseAutoCommand(session.battle, actor, policy), automatic: true as const,
    aiSeed: createRng(session.aiRng).nextU32() };
  return actBattleSession(session, command, ownedCandidate);
}

export function retryBattleSession(session: BattleSessionState): void {
  if (session.battle.phase !== 'ended') throw new RangeError('BATTLE_NOT_ENDED');
  const retryCount = session.retryCount + 1;
  const setup = freezeJsonTree(withSeed(session.opening.setup, deriveRetrySeed(session.opening.setup.seed, retryCount)));
  const previousEvents = session.battle.events;
  const previousCommands = session.battle.acceptedCommands;
  session.battle = { ...createBattleState(setup, session.opening.seeds),
    events: previousEvents, acceptedCommands: previousCommands };
  freezeJsonTree(session.battle.grid);
  session.battleRng = seedStream(setup.seed, 'battle'); session.aiRng = seedStream(setup.seed, 'ai');
  session.retryCount = retryCount; session.acceptedOrdinal += 1; session.decisionOrdinal = 0;
  session.auto = false; session.revision += 1;
  session.commandLog.push({ t: 'battle/retry', option: 'restart' });
  session.battle.events.push({ t: 'battle/retried', actionNo: 0,
    amount: retryCount, message: String(setup.seed) });
  readyBattleSession(session);
}

export function cloneBattleSession(session: BattleSessionState): BattleSessionState {
  return cloneJsonValue(session);
}

function commitBattleSession(session: BattleSessionState, candidate: BattleSessionState): void {
  const events = session.battle.events; const acceptedCommands = session.battle.acceptedCommands;
  const commandLog = session.commandLog;
  for (const event of candidate.battle.events) events.push(event);
  for (const command of candidate.battle.acceptedCommands) acceptedCommands.push(command);
  for (const command of candidate.commandLog) commandLog.push(command);
  Object.assign(session, candidate, { commandLog, battle: { ...candidate.battle, events, acceptedCommands } });
}

/** Command scratch copies mutable units/small ledgers but keeps historical logs as append buffers. */
export function forkBattleSession(session: BattleSessionState): BattleSessionState {
  return { ...session, battle: battleActionCandidate(session.battle), commandLog: [] };
}
