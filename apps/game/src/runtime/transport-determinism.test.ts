import { createHash } from 'node:crypto';
import { createProjectionMainThreadHost } from '@tianshu/platform/host';
import { canonicalJson, type JsonValue } from '@tianshu/shared';
import { describe, expect, it } from 'vitest';
import type { GameCommand, GameHost, GameRemote, GameUpdate, SessionSnapshot } from './contracts';
import { createGameSession } from './session';
import { fixtureContent } from './test-fixture';

function copy<T>(value: T): T { return structuredClone(value); }

/** Node test double for the structured-clone boundary used by Comlink's Worker host. */
function workerBoundaryHost(remote: GameRemote): GameHost {
  let disposed = false;
  let queue: Promise<unknown> = Promise.resolve();
  const listeners = new Set<(update: GameUpdate) => void>();
  function run<T>(work: () => T | Promise<T>): Promise<T> {
    if (disposed) return Promise.reject(new Error('HOST_DISPOSED'));
    const next = queue.then(async () => {
      if (disposed) throw new Error('HOST_DISPOSED');
      return copy(await work());
    });
    queue = next.catch(() => undefined);
    return next;
  }
  function publish(update: GameUpdate): GameUpdate {
    for (const listener of listeners) listener(copy(update));
    return update;
  }
  return {
    mode: 'worker',
    dispatch: (command: GameCommand) => run(async () =>
      publish(copy(await remote.dispatch(copy(command))))),
    query: () => run(() => remote.query()),
    snapshot: () => run(() => remote.snapshot()),
    validate: (snapshot: SessionSnapshot) => run(() => remote.validate(copy(snapshot))),
    restore: (snapshot: SessionSnapshot) => run(async () =>
      publish(copy(await remote.restore(copy(snapshot))))),
    subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    dispose() { disposed = true; listeners.clear(); },
  };
}

function stateHash(snapshot: SessionSnapshot): string {
  const json = canonicalJson(snapshot as unknown as JsonValue);
  return createHash('sha256').update(json, 'utf8').digest('hex');
}

describe('main-thread and Worker transport determinism', () => {
  it('produces the same canonical hash for one accepted command sequence', async () => {
    const content = fixtureContent();
    const main = createProjectionMainThreadHost(createGameSession(content));
    const worker = workerBoundaryHost(createGameSession(content));
    const commands: readonly GameCommand[] = [
      { t: 'world/tick' },
      { t: 'world/tick' },
      { t: 'inventory/equip', itemId: 'eq_qinggangjian', slot: 'mainHand' },
      { t: 'inventory/unequip', slot: 'mainHand' },
      { t: 'inventory/use', itemId: 'it_jinchuangyao', targetId: 'npc_zhujue' },
      { t: 'worldmap/enter' },
    ];
    for (const command of commands) {
      const [local, remote] = await Promise.all([main.dispatch(command), worker.dispatch(command)]);
      expect(local.accepted).toBe(true);
      expect(remote).toEqual(local);
    }
    const [mainState, workerState] = await Promise.all([main.snapshot(), worker.snapshot()]);
    expect(stateHash(workerState)).toBe(stateHash(mainState));
    expect(canonicalJson(workerState as unknown as JsonValue))
      .toBe(canonicalJson(mainState as unknown as JsonValue));
    main.dispose(); worker.dispose();
  });
});
