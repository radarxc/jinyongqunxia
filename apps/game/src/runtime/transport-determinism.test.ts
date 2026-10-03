import { createHash } from 'node:crypto';
import { createProjectionMainThreadHost } from '@tianshu/platform/host';
import { canonicalJson, type JsonValue } from '@tianshu/shared';
import { describe, expect, it } from 'vitest';
import type { GameCommand, GameHost, GameRemote, GameUpdate, SessionSnapshot } from './contracts';
import { createGameSession, createLoadedGameSession } from './session';
import { fixtureContent, fixtureItemPack } from './test-fixture';

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
  it('keeps the canonical session hash when item rules move out of the entry', async () => {
    const fixture = await fixtureItemPack();
    const inline = fixtureContent();
    const expected = createGameSession({ ...inline, contentHash: fixture.manifest.contentHash },
      undefined, undefined, { demo: true });
    const loaded = await createLoadedGameSession(inline, fixture.source, undefined, undefined,
      { demo: true });
    const [before, after] = await Promise.all([expected.snapshot(), loaded.snapshot()]);
    expect(stateHash(after)).toBe(stateHash(before));
    expect(after).toEqual(before);
  });

  it('uses one verified loader for preview, new game, and another-chapter restore', async () => {
    const packs = await Promise.all(['ch01_tianlong', 'ch00_yuenv', 'ch10_baima']
      .map((chapter) => fixtureItemPack(chapter)));
    const reads: string[] = [];
    const source = { readJson: async (path: string) => {
      reads.push(path);
      return packs.find((pack) => pack.values.has(path))?.values.get(path);
    } };
    const session = await createLoadedGameSession(fixtureContent(), source, undefined, undefined,
      { demo: true, seedSource: () => 7 });
    await session.createNewGame({ identity: { name: '沈砚', gender: 'female',
      appearance: 'hero_f01', pronoun: '她', originId: 'origin_wenshiguan' },
    difficulty: 'diff_jianghu' });
    const current = await session.snapshot();
    const ch10 = packs[2]!;
    const candidate = { ...current, meta: { ...current.meta,
      contentHash: ch10.manifest.contentHash }, chapter: { ...current.chapter,
      chapterId: 'ch10_baima', story: { ...current.chapter.story, chapterId: 'ch10_baima' } } };
    await session.validate(candidate);
    await session.restore(candidate);
    expect((await session.snapshot()).chapter.chapterId).toBe('ch10_baima');
    expect(reads).toEqual([
      'ch01_tianlong/manifest.json', 'ch01_tianlong/common.rules.items.json',
      'ch00_yuenv/manifest.json', 'ch00_yuenv/common.rules.items.json',
      'ch10_baima/manifest.json', 'ch10_baima/common.rules.items.json',
    ]);
    const before = await session.snapshot();
    const retry = await createLoadedGameSession(fixtureContent(), source, before, undefined,
      { demo: false });
    const foreign = { ...before, chapter: { ...before.chapter, chapterId: 'ch00_yuenv',
      story: { ...before.chapter.story, chapterId: 'ch00_yuenv' } } };
    packs[1]!.values.set('ch00_yuenv/common.rules.items.json', []);
    await expect(retry.restore(foreign)).rejects.toThrow(
      'ITEM_RULES_UNAVAILABLE:CHAPTER_PACK_LEAF_HASH_MISMATCH');
    expect(await retry.snapshot()).toEqual(before);
  });

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
