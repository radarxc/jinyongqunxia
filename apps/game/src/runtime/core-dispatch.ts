import { canonicalJson, type JsonValue } from '@tianshu/shared';
import type { Command, CommandHandler, CoreContent, DispatchResult } from '@tianshu/core/kernel';
import type { GameState } from '@tianshu/core/state';
import type { CommittedDomainEvent } from '@tianshu/core/kernel';
import { assertCanonicalGameState, CommandAbort,
  MutableCoreTransaction } from '@tianshu/core/kernel';

type HandlerMap = Readonly<Record<string, CommandHandler>>;
const handlers = new Map<string, Promise<HandlerMap>>();
const load = (key: string, factory: () => Promise<HandlerMap>) => {
  let pending = handlers.get(key);
  if (!pending) {
    pending = factory().catch((error: unknown) => { handlers.delete(key); throw error; });
    handlers.set(key, pending);
  }
  return pending;
};
function unavailable(code: string, cause: unknown): Error { return new Error(code, { cause }); }
const questHandlers = () => load('quest', async () => ({
  'quest/choose': (await import('@tianshu/core/quest')).questChoiceHandler as CommandHandler,
}));
const chapterHandlers = () => load('chapter', async () => ({
  'chapter/bookSleep': (await import('@tianshu/core/chapter')).bookSleepHandler as CommandHandler,
}));
function commandFamily(command: Command): string {
  if (command.t === 'world/mountRegion' || command.t === 'world/walkTo' ||
      command.t === 'world/interact') return 'REGION';
  return command.t.split('/')[0]!.toUpperCase();
}

async function commandHandlers(command: Command): Promise<HandlerMap> {
  try {
    if (command.t === 'world/tick') return await load('clock', async () => ({
      'world/tick': (await import('@tianshu/core/clock')).worldTickHandler as CommandHandler,
    }));
    if (command.t.startsWith('worldmap/')) return await load('worldmap', async () => {
      const { worldMapHandler } = await import('@tianshu/core/worldmap');
      return Object.fromEntries(['travel', 'step', 'cancel', 'resume', 'enter', 'leave']
        .map((name) => [`worldmap/${name}`, worldMapHandler as CommandHandler]));
    });
    if (command.t.startsWith('town/')) return await load('town', async () => {
      const { townHandler } = await import('@tianshu/core/town');
      return Object.fromEntries(['move', 'settle-building', 'exit-building', 'interact', 'meditate']
        .map((name) => [`town/${name}`, townHandler as CommandHandler]));
    });
    if (command.t.startsWith('inventory/')) return await load('inventory', async () => {
      const { inventoryHandler } = await import('@tianshu/core/inventory');
      return Object.fromEntries(['equip', 'unequip', 'use']
        .map((name) => [`inventory/${name}`, inventoryHandler as CommandHandler]));
    });
    if (command.t.startsWith('dialogue/')) return await load('dialogue', async () => {
      const { dialogueHandler } = await import('@tianshu/core/dialogue-command');
      return { 'dialogue/start': dialogueHandler as CommandHandler,
        'dialogue/continue': dialogueHandler as CommandHandler,
        'dialogue/choose': dialogueHandler as CommandHandler };
    });
    if (command.t === 'quest/choose') return await questHandlers();
    if (command.t === 'rules/setDifficulty') return await load('difficulty', async () => ({
      'rules/setDifficulty': (await import('@tianshu/core/difficulty')).difficultyHandler as CommandHandler,
    }));
    if (command.t === 'chapter/bookSleep') return await chapterHandlers();
    if (command.t.startsWith('battle/')) return await load('battle', async () => {
      const { battleHandler } = await import('@tianshu/core/battle');
      return Object.fromEntries(['enter', 'act', 'setAuto', 'retry', 'finalize', 'leave']
        .map((name) => [`battle/${name}`, battleHandler as CommandHandler]));
    });
    if (command.t === 'world/mountRegion' || command.t === 'world/walkTo' ||
        command.t === 'world/interact') return await load('region', async () => {
      const { regionHandler } = await import('@tianshu/core/region-command');
      return { 'world/mountRegion': regionHandler as CommandHandler,
        'world/walkTo': regionHandler as CommandHandler,
        'world/interact': regionHandler as CommandHandler };
    });
    return {};
  } catch (error) {
    throw unavailable(`${commandFamily(command)}_SUBSYSTEM_UNAVAILABLE`, error);
  }
}
function rejection(reason: string, at?: string): DispatchResult {
  return at === undefined ? { ok: false, reason: reason as never }
    : { ok: false, reason: reason as never, at };
}
function assertEventJson(value: unknown, seen: Set<object>): void {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return;
  if (typeof value === 'number') { if (!Number.isSafeInteger(value)) throw new TypeError('EVENT_PAYLOAD_NON_INTEGER'); return; }
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
    if (typeof event.t !== 'string' || event.t.length === 0)
      throw new TypeError('EVENT_TYPE_INVALID');
    if (event.parent !== undefined && event.parent !== null && event.parent !== 'root')
      throw new TypeError('EVENT_PARENT_INVALID');
    assertEventJson(event.payload, new Set<object>()); canonicalJson(event.payload);
  }
}
function envelope(state: GameState, tx: MutableCoreTransaction, version: number, ordinal: number):
readonly CommittedDomainEvent[] {
  const firstSeq = state.meta.nextEventSeq; const causeId = `${version}:${ordinal}`;
  return tx.pendingEvents().map((event, index) => ({ t: event.t, seq: firstSeq + index,
    stateVersion: version, causeId, parentSeq: index === 0 || event.parent === null
      ? null : firstSeq, payload: event.payload as JsonValue }));
}

/** Same seven-step transaction as core dispatch, with the handler family loaded first. */
export async function dispatchCoreCommand(state: GameState, command: Command,
  content: CoreContent = {}): Promise<DispatchResult> {
  const loaded = await commandHandlers(command); const handler = loaded[command.t];
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
    const ordinal = state.meta.nextRuntimeOrdinal; const events = envelope(state, tx, version, ordinal);
    tx.set(['meta', 'stateVersion'], version); tx.set(['meta', 'nextRuntimeOrdinal'], ordinal + 1);
    tx.set(['meta', 'nextEventSeq'], state.meta.nextEventSeq + events.length);
    assertCanonicalGameState(state, true);
    return { ok: true, stateVersion: version, events };
  } catch (error) {
    tx.rollback();
    if (error instanceof CommandAbort) return rejection(error.reason, error.at);
    try {
      const { rejectionFrom } = await import('@tianshu/core/inventory');
      const domain = rejectionFrom(error); if (domain) return rejection(domain);
    } catch (loadError) {
      if (error instanceof Error && error.message.endsWith('_SUBSYSTEM_UNAVAILABLE')) throw error;
      throw unavailable('INVENTORY_SUBSYSTEM_UNAVAILABLE', loadError);
    }
    throw error;
  }
}
