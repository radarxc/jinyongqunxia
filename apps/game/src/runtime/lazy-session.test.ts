import { describe, expect, it, vi } from 'vitest';
import type { GameRemote } from './contracts';
import { createLazyGameSession, type LazySessionLoaders } from './lazy-session';
import { fixtureContent } from './test-fixture';

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
});
