import { canonicalJson, type JsonValue } from '@tianshu/shared';
import type { CommittedDomainEvent } from '../event';
import { assertCanonicalGameState, type GameState } from '../state';
import type { Command, CommandHandler, CoreContent, RejectReason } from '.';
import { inventoryHandler, rejectionFrom, townHandler, worldMapHandler, worldTickHandler } from './handlers';
import { dialogueHandler, difficultyHandler, questChoiceHandler } from './story-handlers';
import { bookSleepHandler } from './chapter-handler';
import { regionHandler } from './region-handler';
import { battleHandler } from './battle-handler';
import { CommandAbort, MutableCoreTransaction } from './transaction';

export type DispatchResult =
  | { readonly ok: true; readonly stateVersion: number; readonly events: readonly CommittedDomainEvent[] }
  | { readonly ok: false; readonly reason: RejectReason; readonly at?: string };

const HANDLERS: Readonly<Record<string, CommandHandler>> = {
  'world/tick': worldTickHandler as CommandHandler,
  'worldmap/travel': worldMapHandler as CommandHandler,
  'worldmap/step': worldMapHandler as CommandHandler,
  'worldmap/cancel': worldMapHandler as CommandHandler,
  'worldmap/resume': worldMapHandler as CommandHandler,
  'worldmap/enter': worldMapHandler as CommandHandler,
  'worldmap/leave': worldMapHandler as CommandHandler,
  'town/move': townHandler as CommandHandler,
  'town/settle-building': townHandler as CommandHandler,
  'town/exit-building': townHandler as CommandHandler,
  'town/interact': townHandler as CommandHandler,
  'town/meditate': townHandler as CommandHandler,
  'inventory/equip': inventoryHandler as CommandHandler,
  'inventory/unequip': inventoryHandler as CommandHandler,
  'inventory/use': inventoryHandler as CommandHandler,
  'dialogue/start': dialogueHandler as CommandHandler,
  'dialogue/continue': dialogueHandler as CommandHandler,
  'dialogue/choose': dialogueHandler as CommandHandler,
  'quest/choose': questChoiceHandler as CommandHandler,
  'rules/setDifficulty': difficultyHandler as CommandHandler,
  'chapter/bookSleep': bookSleepHandler as CommandHandler,
  'world/mountRegion': regionHandler as CommandHandler,
  'world/walkTo': regionHandler as CommandHandler,
  'world/interact': regionHandler as CommandHandler,
  'battle/enter': battleHandler as CommandHandler,
  'battle/act': battleHandler as CommandHandler,
  'battle/setAuto': battleHandler as CommandHandler,
  'battle/retry': battleHandler as CommandHandler,
  'battle/concede': battleHandler as CommandHandler,
  'battle/subdue': battleHandler as CommandHandler,
  'battle/demonstration': battleHandler as CommandHandler,
  'battle/finalize': battleHandler as CommandHandler,
  'battle/leave': battleHandler as CommandHandler,
};
function rejection(reason: RejectReason, at?: string): DispatchResult {
  return at === undefined ? { ok: false, reason } : { ok: false, reason, at };
}
function assertEventJson(value: unknown, seen: Set<object>): void {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return;
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value)) throw new TypeError('EVENT_PAYLOAD_NON_INTEGER');
    return;
  }
  if (typeof value !== 'object') throw new TypeError('EVENT_PAYLOAD_NOT_JSON');
  if (seen.has(value)) throw new TypeError('EVENT_PAYLOAD_CYCLIC');
  const prototype = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null)
    throw new TypeError('EVENT_PAYLOAD_NOT_JSON');
  seen.add(value);
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      if (!(index in value)) throw new TypeError('EVENT_PAYLOAD_SPARSE');
      assertEventJson(value[index], seen);
    }
  } else {
    for (const child of Object.values(value)) {
      if (child === undefined) throw new TypeError('EVENT_PAYLOAD_UNDEFINED');
      assertEventJson(child, seen);
    }
  }
  seen.delete(value);
}
function assertPendingEvents(tx: MutableCoreTransaction): void {
  for (const event of tx.pendingEvents()) {
    if (typeof event.t !== 'string' || event.t.length === 0) throw new TypeError('EVENT_TYPE_INVALID');
    if (event.parent !== undefined && event.parent !== null && event.parent !== 'root')
      throw new TypeError('EVENT_PARENT_INVALID');
    assertEventJson(event.payload, new Set<object>());
    canonicalJson(event.payload);
  }
}
function envelope(state: GameState, tx: MutableCoreTransaction, version: number,
  ordinal: number): readonly CommittedDomainEvent[] {
  const firstSeq = state.meta.nextEventSeq; const causeId = `${version}:${ordinal}`;
  return tx.pendingEvents().map((event, index) => ({ t: event.t, seq: firstSeq + index,
    stateVersion: version, causeId, parentSeq: index === 0 || event.parent === null
      ? null : firstSeq, payload: event.payload as JsonValue }));
}

/** Executes the seven-step command transaction against one mutable core-owned state. */
export function dispatchCommand(state: GameState, command: Command, content: CoreContent = {},
  handlers: Readonly<Record<string, CommandHandler>> = HANDLERS): DispatchResult {
  const handler = handlers[command.t];
  if (!handler) return rejection('COMMAND_UNKNOWN', 't');
  const invalid = handler.validate(state, command, content);
  if (invalid) return rejection(invalid);
  if (handler.noop?.(state, command, content) === true)
    return { ok: true, stateVersion: state.meta.stateVersion, events: [] };
  const tx = new MutableCoreTransaction(state, content);
  try {
    handler.apply(tx, command); assertPendingEvents(tx); tx.commitRng();
    const version = state.meta.stateVersion + 1;
    if (!Number.isSafeInteger(version)) throw new RangeError('STATE_VERSION_OVERFLOW');
    const ordinal = state.meta.nextRuntimeOrdinal;
    const events = envelope(state, tx, version, ordinal);
    tx.set(['meta', 'stateVersion'], version);
    tx.set(['meta', 'nextRuntimeOrdinal'], ordinal + 1);
    tx.set(['meta', 'nextEventSeq'], state.meta.nextEventSeq + events.length);
    assertCanonicalGameState(state, true);
    return { ok: true, stateVersion: version, events };
  } catch (error) {
    tx.rollback();
    if (error instanceof CommandAbort) return rejection(error.reason, error.at);
    const domain = rejectionFrom(error);
    if (domain) return rejection(domain);
    throw error;
  }
}

export function isCommand(value: { readonly t: string }): value is Command {
  return Object.hasOwn(HANDLERS, value.t);
}

export { MutableCoreTransaction } from './transaction';
