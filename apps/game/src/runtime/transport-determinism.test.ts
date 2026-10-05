import { createHash } from 'node:crypto';
import { createProjectionMainThreadHost } from '@tianshu/platform/host';
import { createNewGameState, FIRST_SLEEP_RULE,
  type BookSleepPlan } from '@tianshu/core';
import { canonicalJson, type JsonValue } from '@tianshu/shared';
import { describe, expect, it } from 'vitest';
import type { GameCommand, GameHost, GameRemote, GameUpdate, SessionSnapshot } from './contracts';
import { createGameSession, createLoadedGameSession } from './session';
import { fixtureContent, fixtureItemPack } from './test-fixture';
import { loadGameContent } from './item-content';

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
const sleepPlan: BookSleepPlan = {
  id: '00000000-0000-4000-8000-000000000017', from: 'ch00_yuenv', to: 'ch10_baima',
  targetTier: 'LOW', sleepEventId: 'slp_first_changbai',
  skills: { martial: [], inner: [] }, convert: { forget: [], dissipate: [] }, equips: [],
  sleepAlloc: Object.fromEntries(FIRST_SLEEP_RULE.keys.map((key) => [key, 50])),
  acknowledged: [], allocationSource: 'balanced', allocationRuleVersion: 'first-sleep.v1',
};
function prologueStart(contentHash: string): SessionSnapshot {
  return createNewGameState({ masterSeed: 271828, contentHash,
    identity: { name: '沈砚', gender: 'female', appearance: 'hero_f01', pronoun: '她',
      originId: 'origin_wenshiguan' }, difficulty: 'diff_xiake' });
}
async function chapterFixtureSource() {
  const [ch00, ch10] = await Promise.all([fixtureItemPack('ch00_yuenv'),
    fixtureItemPack('ch10_baima')]);
  const source = { readJson: async (path: string) =>
    ch00.values.get(path) ?? ch10.values.get(path) };
  const base = fixtureContent();
  const [ch00Content, ch10Content] = await Promise.all([
    loadGameContent(base, source, 'ch00_yuenv'), loadGameContent(base, source, 'ch10_baima'),
  ]);
  return { ch00, ch10, source, ch00Content, ch10Content };
}

describe('main-thread and Worker transport determinism', () => {
  it('keeps the canonical session hash when item rules move out of the entry', async () => {
    const fixture = await fixtureItemPack('ch10_baima');
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
    const packs = await Promise.all(['ch10_baima', 'ch00_yuenv']
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
    const ch10 = packs[0]!;
    const candidate = { ...current, meta: { ...current.meta,
      contentHash: ch10.manifest.contentHash }, chapter: { ...current.chapter,
      chapterId: 'ch10_baima', story: { ...current.chapter.story, chapterId: 'ch10_baima' } } };
    await session.validate(candidate);
    await session.restore(candidate);
    expect((await session.snapshot()).chapter.chapterId).toBe('ch10_baima');
    expect(reads).toEqual([
      'ch10_baima/manifest.json', 'ch10_baima/ch10.rules.base.json',
      'ch10_baima/ch10.text.zh-Hans.base.json',
      'ch10_baima/common.rules.items.json', 'ch10_baima/world.rules.era.ch10.json',
      'ch00_yuenv/manifest.json',
      'ch00_yuenv/ch00.rules.base.json', 'ch00_yuenv/ch00.text.zh-Hans.base.json',
      'ch00_yuenv/common.rules.items.json',
      'ch00_yuenv/world.rules.era.ch00.json',
    ]);
    const before = await session.snapshot();
    const retry = await createLoadedGameSession(fixtureContent(), source, before, undefined,
      { demo: false });
    const foreign = { ...before, meta: { ...before.meta,
      contentHash: packs[1]!.manifest.contentHash }, chapter: { ...before.chapter, chapterId: 'ch00_yuenv',
      story: { ...before.chapter.story, chapterId: 'ch00_yuenv' } } };
    const validRules = packs[1]!.values.get('ch00_yuenv/common.rules.items.json');
    packs[1]!.values.set('ch00_yuenv/common.rules.items.json', []);
    await expect(retry.restore(foreign)).rejects.toThrow(
      'ITEM_RULES_UNAVAILABLE:CHAPTER_PACK_LEAF_HASH_MISMATCH');
    expect(await retry.snapshot()).toEqual(before);
    packs[1]!.values.set('ch00_yuenv/common.rules.items.json', validRules);
    await expect(retry.restore(foreign)).resolves.toMatchObject({ accepted: true });
    expect((await retry.snapshot()).chapter.chapterId).toBe('ch00_yuenv');
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

  // The 100-cycle determinism sweep is functional coverage, not a performance assertion.
  it('commits skip plus first sleep identically through main-thread and Worker hosts 100 times',
    async () => {
    const { ch00, ch10, ch00Content, ch10Content } = await chapterFixtureSource();
    const initial = prologueStart(ch00.manifest.contentHash);
    const expectedHashes = new Set<string>();
    for (let index = 0; index < 100; index += 1) {
      const options = { demo: false, preloadChapter: async () => ch10Content };
      const mainRemote = createGameSession(ch00Content, initial, undefined, options);
      const workerRemote = createGameSession(ch00Content, initial, undefined, options);
      const main = createProjectionMainThreadHost(mainRemote);
      const worker = workerBoundaryHost(workerRemote);
      const commands: readonly GameCommand[] = [
        { t: 'quest/choose', questId: 'dc_00_01', optionId: 'skip' },
        { t: 'quest/choose', questId: 'dc_00_01', optionId: 'skip', phase: 'settle',
          completionNodeId: 'n_skip_complete' },
      ];
      for (const command of commands) {
        const [local, remote] = await Promise.all([main.dispatch(command), worker.dispatch(command)]);
        expect(remote).toEqual(local); expect(local.accepted).toBe(true);
      }
      const beforeRng = (await main.snapshot()).meta.rng;
      const [local, remote] = await Promise.all([
        main.dispatch({ t: 'chapter/bookSleep', plan: sleepPlan }),
        worker.dispatch({ t: 'chapter/bookSleep', plan: sleepPlan }),
      ]);
      expect(remote).toEqual(local); expect(local.accepted).toBe(true);
      const [mainState, workerState] = await Promise.all([main.snapshot(), worker.snapshot()]);
      expect(workerState).toEqual(mainState); expect(mainState.meta.rng).toEqual(beforeRng);
      expect(mainState).toMatchObject({ meta: { contentHash: ch10.manifest.contentHash,
        worldTick: 0 }, chapter: { chapterId: 'ch10_baima', eraLayerId: 'ch10',
        worldYear: 702, clock: { elapsedTicks: 0 } },
      world: { navigation: { locationId: 'sc_10_fengshi_feiyi', pendingMount: null } } });
      expectedHashes.add(stateHash(mainState)); main.dispose(); worker.dispose();
    }
    expect(expectedHashes.size).toBe(1);
  }, 30_000);

  it('keeps committed state untouched when target mount validation fails', async () => {
    const { ch00, ch10, source } = await chapterFixtureSource();
    const initial = prologueStart(ch00.manifest.contentHash);
    const session = await createLoadedGameSession(fixtureContent(), source, initial, undefined,
      { demo: false });
    await session.dispatch({ t: 'quest/choose', questId: 'dc_00_01', optionId: 'skip' });
    await session.dispatch({ t: 'quest/choose', questId: 'dc_00_01', optionId: 'skip',
      phase: 'settle', completionNodeId: 'n_skip_complete' });
    const before = await session.snapshot();
    ch10.values.set('ch10_baima/common.rules.items.json', []);
    await expect(session.dispatch({ t: 'chapter/bookSleep', plan: sleepPlan }))
      .rejects.toThrow('ITEM_RULES_UNAVAILABLE:CHAPTER_PACK_LEAF_HASH_MISMATCH');
    expect(await session.snapshot()).toEqual(before);
  });
});
