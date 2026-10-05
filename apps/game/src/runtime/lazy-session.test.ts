import { describe, expect, it, vi } from 'vitest';
import type { GameRemote } from './contracts';
import { createLazyGameSession, type LazySessionLoaders } from './lazy-session';
import { fixtureContent, fixtureItemPack } from './test-fixture';

const source = { readJson: async () => undefined };
const content = async () => ({ default: fixtureContent() });
function remote(overrides: Partial<GameRemote> = {}): GameRemote {
  return { dispatch: async () => ({ accepted: true, changes: {}, events: [] }),
    query: async () => { throw new Error('unused'); },
    snapshot: async () => { throw new Error('unused'); }, validate: async () => undefined,
    restore: async () => ({ accepted: true, changes: {}, events: [] }), ...overrides };
}
const sessionLoader = (factory: () => Promise<GameRemote>): NonNullable<
  LazySessionLoaders['session']> => async () => factory as never;

describe('lazy core session boundary', () => {
  it('returns a stable error and retries a failed first session import', async () => {
    const loaded = sessionLoader(async () => remote());
    const factory: NonNullable<LazySessionLoaders['session']> = vi.fn()
      .mockRejectedValueOnce(new Error('network')).mockImplementationOnce(loaded);
    const session = createLazyGameSession({ contentSource: source, loaders: {
      session: factory, content,
    } });
    await expect(session.dispatch({ t: 'world/tick' })).resolves.toEqual({ accepted: false,
      changes: {}, events: [], error: 'CORE_SESSION_UNAVAILABLE' });
    await expect(session.dispatch({ t: 'world/tick' })).resolves.toMatchObject({ accepted: true });
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('preserves subsystem error codes for dispatch and restore', async () => {
    const failure = new Error('TOWN_SUBSYSTEM_UNAVAILABLE');
    const session = createLazyGameSession({ contentSource: source, loaders: { content,
      session: sessionLoader(async () => remote({
        dispatch: async () => { throw failure; }, restore: async () => { throw failure; },
      })),
    } });
    const expected = { accepted: false, changes: {}, events: [],
      error: 'TOWN_SUBSYSTEM_UNAVAILABLE' };
    await expect(session.dispatch({ t: 'world/tick' })).resolves.toEqual(expected);
    await expect(session.restore({} as never)).resolves.toEqual(expected);
  });

  it('reports a chapter asset leaf failure and retries session creation', async () => {
    const loadAssets = vi.fn()
      .mockRejectedValueOnce(new Error('chunk offline')).mockResolvedValue({});
    const create = vi.fn(async (...args: Parameters<NonNullable<
      Awaited<ReturnType<NonNullable<LazySessionLoaders['session']>>>>>) => {
      await args[5]?.('ch10_baima');
      return remote();
    });
    const session = createLazyGameSession({ contentSource: source, loaders: {
      content: async () => ({ default: fixtureContent(), loadChapterAssets: loadAssets }),
      session: async () => create,
    } });
    await expect(session.dispatch({ t: 'world/tick' })).resolves.toEqual({ accepted: false,
      changes: {}, events: [], error: 'CHAPTER_ASSETS_SUBSYSTEM_UNAVAILABLE' });
    await expect(session.dispatch({ t: 'world/tick' })).resolves.toMatchObject({ accepted: true });
    expect(loadAssets).toHaveBeenCalledTimes(2);
    expect(create).toHaveBeenCalledTimes(2);
  });

  it('normalizes a missing chapter content leaf and allows dispatch retry', async () => {
    const dispatch = vi.fn()
      .mockRejectedValueOnce(new Error('ITEM_RULES_UNAVAILABLE:CHAPTER_PACK_LEAF_MISSING'))
      .mockResolvedValue({ accepted: true, changes: {}, events: [] });
    const session = createLazyGameSession({ contentSource: source, loaders: { content,
      session: sessionLoader(async () => remote({ dispatch })),
    } });
    await expect(session.dispatch({ t: 'world/tick' })).resolves.toEqual({ accepted: false,
      changes: {}, events: [], error: 'CHAPTER_CONTENT_SUBSYSTEM_UNAVAILABLE' });
    await expect(session.dispatch({ t: 'world/tick' })).resolves.toMatchObject({ accepted: true });
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it('retries real preview creation after a chapter leaf read fails', async () => {
    const fixture = await fixtureItemPack('ch10_baima');
    let fail = true;
    const retrySource = { readJson: async (path: string) => {
      if (fail && path.endsWith('/ch10.rules.base.json')) {
        fail = false; throw new Error('offline');
      }
      return fixture.values.get(path);
    } };
    const session = createLazyGameSession({ demo: true, contentSource: retrySource, loaders: {
      content: async () => ({ default: fixtureContent(), loadChapterAssets: async () => ({}) }),
    } });
    await expect(session.dispatch({ t: 'world/tick' })).resolves.toMatchObject({
      accepted: false, error: 'CHAPTER_CONTENT_SUBSYSTEM_UNAVAILABLE',
    });
    await expect(session.dispatch({ t: 'world/tick' })).resolves.toMatchObject({ accepted: true });
    expect((await session.snapshot()).chapter.chapterId).toBe('ch10_baima');
  });
});
