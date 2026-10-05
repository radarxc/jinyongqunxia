import type { JsonValue } from '@tianshu/shared';
import type { CoreContent, CoreTransaction, RejectReason, StatePath } from './index';
import type { PendingDomainEvent } from '../event';
import { executeSourceEventDefs, isEventDefSourceEvent } from '../event/event-executor';
import { createRng, RNG_STREAMS, type Rng, type RngState, type RngStreamName } from '../rng';
import type { GameState } from '../state';
import { invalidateAppendValidation } from '../state/immutable-json';

export class CommandAbort extends Error {
  public constructor(readonly reason: RejectReason, readonly at?: string) {
    super(reason); this.name = 'CommandAbort';
  }
}
interface JournalEntry {
  readonly target: Record<PropertyKey, unknown>; readonly key: string | number;
  readonly existed: boolean; readonly oldValue: unknown;
}
type SourceEventDispatcher = (tx: CoreTransaction, event: PendingDomainEvent) => void;
function mutable(value: unknown): Record<PropertyKey, unknown> {
  if (value === null || typeof value !== 'object') throw new TypeError('TRANSACTION_PATH');
  return value as Record<PropertyKey, unknown>;
}
function resolveParent(root: GameState, path: StatePath): {
  target: Record<PropertyKey, unknown>; key: string | number;
} {
  if (path.length === 0) throw new TypeError('TRANSACTION_PATH');
  let cursor: unknown = root;
  for (let index = 0; index < path.length - 1; index += 1) cursor = mutable(cursor)[path[index]!];
  return { target: mutable(cursor), key: path[path.length - 1]! };
}

/** Mutable transaction facade. Every first write is journaled and all RNG streams are isolated. */
export class MutableCoreTransaction implements CoreTransaction {
  readonly state: Readonly<GameState>; readonly #mutableState: GameState;
  readonly #journal: JournalEntry[] = []; readonly #seen = new WeakMap<object, Set<string | number>>();
  readonly #events: PendingDomainEvent[] = []; readonly #rng = new Map<RngStreamName, Rng>();
  readonly #sourceEventDispatcher: SourceEventDispatcher;
  #sourceEventDepth = 0;
  public constructor(state: GameState, readonly content: CoreContent,
    sourceEventDispatcher: SourceEventDispatcher = executeSourceEventDefs) {
    this.state = state; this.#mutableState = state;
    this.#sourceEventDispatcher = sourceEventDispatcher;
  }
  set(path: StatePath, value: unknown): void {
    const { target, key } = resolveParent(this.#mutableState, path);
    invalidateAppendValidation(target);
    this.remember(target, key); target[key] = value;
  }
  splice(path: StatePath, start: number, deleteCount: number, values: readonly unknown[]): void {
    let cursor: unknown = this.#mutableState;
    for (const key of path) cursor = mutable(cursor)[key];
    if (!Array.isArray(cursor)) throw new TypeError('TRANSACTION_PATH');
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(deleteCount) ||
        start < 0 || deleteCount < 0 || start > cursor.length) throw new RangeError('TRANSACTION_SPLICE');
    const target = cursor as unknown as Record<PropertyKey, unknown>;
    if (start < cursor.length || deleteCount > 0) invalidateAppendValidation(cursor);
    for (let index = start; index < cursor.length; index += 1) this.remember(target, index);
    this.remember(target, 'length');
    if (start === cursor.length && deleteCount === 0) {
      for (const value of values) cursor.push(value);
    } else {
      cursor.splice(start, deleteCount);
      for (let index = 0; index < values.length; index += 1) cursor.splice(start + index, 0, values[index]);
    }
  }
  rng(stream: RngStreamName): Rng {
    if (!RNG_STREAMS.includes(stream)) throw new TypeError('RNG_STREAM');
    let local = this.#rng.get(stream);
    if (!local) { local = createRng(this.#mutableState.meta.rng[stream]); this.#rng.set(stream, local); }
    return local;
  }
  emit(event: PendingDomainEvent): void {
    this.#events.push(event);
    if (this.#sourceEventDepth !== 0 || !isEventDefSourceEvent(event.t)) return;
    this.#sourceEventDepth = 1;
    try { this.#sourceEventDispatcher(this, event); } finally { this.#sourceEventDepth = 0; }
  }
  abort(reason: RejectReason, at?: string): never { throw new CommandAbort(reason, at); }
  pendingEvents(): readonly PendingDomainEvent[] { return this.#events; }
  commitRng(): void {
    if (this.#rng.size === 0) return;
    const next = { ...this.#mutableState.meta.rng } as Record<RngStreamName, RngState>;
    for (const [stream, rng] of this.#rng) next[stream] = rng.snapshot();
    this.set(['meta', 'rng'], next);
  }
  rollback(): void {
    for (let index = this.#journal.length - 1; index >= 0; index -= 1) {
      const entry = this.#journal[index]!;
      invalidateAppendValidation(entry.target);
      if (entry.existed) entry.target[entry.key] = entry.oldValue;
      else delete entry.target[entry.key];
    }
    this.#events.length = 0; this.#rng.clear();
  }
  private remember(target: Record<PropertyKey, unknown>, key: string | number): void {
    let keys = this.#seen.get(target);
    if (!keys) { keys = new Set(); this.#seen.set(target, keys); }
    if (keys.has(key)) return;
    keys.add(key); this.#journal.push({ target, key, existed: key in target, oldValue: target[key] });
  }
}

export function eventPayload(value: Record<string, unknown>): JsonValue {
  return value as JsonValue;
}
