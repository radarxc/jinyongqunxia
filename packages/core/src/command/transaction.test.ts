import { describe, expect, it } from 'vitest';
import { createCore } from '../api';
import type { CommandHandler } from '.';
import { dispatchCommand } from './bus';

describe('core command transaction journal', () => {
  it('rolls back state, all RNG streams, version and event sequence after an internal failure', () => {
    const state = createCore(7).snapshot(); const before = structuredClone(state);
    const handler: CommandHandler = {
      validate: () => null,
      apply(tx) {
        tx.set(['party', 'money'], 99); tx.rng('world').nextU32();
        tx.rng('loot').nextU32(); tx.emit({ t: 'test/written', payload: { value: 99 } });
        throw new TypeError('INT_OVERFLOW');
      },
    };
    expect(() => dispatchCommand(state, { t: 'world/tick' }, {},
      { 'world/tick': handler })).toThrow('INT_OVERFLOW');
    expect(state).toEqual(before);
  });

  it('rolls back when the prospective committed state violates a canonical invariant', () => {
    const state = createCore(7).snapshot(); const before = structuredClone(state);
    const handler: CommandHandler = {
      validate: () => null,
      apply(tx) {
        tx.set(['party', 'money'], -1);
        tx.rng('world').nextU32();
        tx.emit({ t: 'test/invalid', payload: null });
      },
    };
    expect(() => dispatchCommand(state, { t: 'world/tick' }, {},
      { 'world/tick': handler })).toThrow('STATE_SHAPE');
    expect(state).toEqual(before);
  });

  it('rejects a non-JSON event payload as an internal error and rolls back', () => {
    const state = createCore(7).snapshot(); const before = structuredClone(state);
    const handler: CommandHandler = {
      validate: () => null,
      apply(tx) {
        tx.set(['party', 'money'], 99); tx.rng('qiyu').nextU32();
        tx.emit({ t: 'test/invalidPayload',
          payload: { value: undefined } as never });
      },
    };
    expect(() => dispatchCommand(state, { t: 'world/tick' }, {},
      { 'world/tick': handler })).toThrow('EVENT_PAYLOAD_UNDEFINED');
    expect(state).toEqual(before);
  });

  it('rolls back an explicit abort and exposes only its stable reason', () => {
    const state = createCore(7).snapshot(); const before = structuredClone(state);
    const handler: CommandHandler = {
      validate: () => null,
      apply(tx) {
        tx.set(['party', 'money'], 99); tx.rng('world').nextU32();
        tx.emit({ t: 'test/written', payload: null }); tx.abort('INVENTORY_INSUFFICIENT', 'itemId');
      },
    };
    expect(dispatchCommand(state, { t: 'world/tick' }, {}, { 'world/tick': handler }))
      .toEqual({ ok: false, reason: 'INVENTORY_INSUFFICIENT', at: 'itemId' });
    expect(state).toEqual(before);
  });

  it('commits consecutive events with one cause and root parent links', () => {
    const state = createCore(7).snapshot();
    const handler: CommandHandler = { validate: () => null, apply(tx) {
      tx.emit({ t: 'test/first', payload: null });
      tx.emit({ t: 'test/second', payload: { n: 2 } });
    } };
    const result = dispatchCommand(state, { t: 'world/tick' }, {}, { 'world/tick': handler });
    expect(result).toMatchObject({ ok: true, stateVersion: 1, events: [
      { seq: 1, causeId: '1:1', parentSeq: null },
      { seq: 2, causeId: '1:1', parentSeq: 1 },
    ] });
    expect(state.meta).toMatchObject({ stateVersion: 1, nextEventSeq: 3,
      nextRuntimeOrdinal: 2 });
  });
});
