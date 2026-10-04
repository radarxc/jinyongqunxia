import { createPinia } from 'pinia';
import { shallowRef } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import type { TianshuStorage } from '@tianshu/platform';
import { useUiStore } from '@tianshu/ui/runtime';
import { createBattleController } from './battle/controller';
import type { GameHost, GameUpdate } from './runtime/contracts';
import { createGameController } from './game-controller';
import { defaultGameSettings } from './settings';

function failingHost(): GameHost {
  return { mode: 'main-thread', dispatch: vi.fn().mockRejectedValue(new TypeError('INT_OVERFLOW')),
    query: vi.fn(), snapshot: vi.fn(), validate: vi.fn(), restore: vi.fn(),
    subscribe: () => () => undefined, dispose: vi.fn() } as unknown as GameHost;
}

function trackedHost() {
  let disposed = false;
  const listeners = new Set<(update: GameUpdate) => void>();
  const subscribe = vi.fn((listener: (update: GameUpdate) => void) => {
    if (disposed) throw new Error('HOST_DISPOSED');
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  });
  const host = { ...failingHost(), subscribe, dispose: vi.fn(() => {
    disposed = true;
    listeners.clear();
  })
  } as unknown as GameHost;
  return { host, subscribe, publish(update: GameUpdate) {
    for (const listener of listeners) listener(update);
  } };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

describe('game controller engine failure boundary', () => {
  it('terminates gameplay after an internal command error while retaining the host for export', async () => {
    const host = failingHost();
    const controller = createGameController(host, useUiStore(createPinia()));
    controller.loading.value = false; controller.setSceneRunsWorldTicks(true);
    const logged = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      await controller.worldMapCommand({ t: 'worldmap/cancel' });
      expect(controller.notice.value).toContain('游戏内部错误');
      expect(controller.frozenProjection.value).not.toBeNull();
      expect(controller.canRunWorldTicks()).toBe(false);
      await controller.worldMapCommand({ t: 'worldmap/cancel' });
      expect(host.dispatch).toHaveBeenCalledTimes(1);
      expect(host.dispose).not.toHaveBeenCalled();
    } finally { logged.mockRestore(); controller.dispose(); }
  });
});

describe('game controller battle loading lifecycle', () => {
  it('discards a late load and lets the replacement host create the battle controller', async () => {
    const create = vi.fn((host: GameHost) => createBattleController(host, {
      request: () => 1, cancel: vi.fn(),
    }));
    const module = {
      createBattleController: create,
    };
    const held = deferred<typeof module>();
    const unhandled: unknown[] = [];
    const onUnhandled = (error: unknown) => { unhandled.push(error); };
    process.on('unhandledRejection', onUnhandled);
    try {
      const oldHost = trackedHost();
      const loadBattleController = vi.fn(() => held.promise);
      const oldController = createGameController(oldHost.host, useUiStore(createPinia()), {
        loadBattleController,
      });
      oldHost.publish({ accepted: true, changes: { battle: null }, events: [] });
      await Promise.resolve();
      expect(loadBattleController).toHaveBeenCalledOnce();
      expect(oldHost.subscribe).toHaveBeenCalledOnce();

      oldController.dispose();
      const newHost = trackedHost();
      const newController = createGameController(newHost.host, useUiStore(createPinia()), {
        loadBattleController: async () => module,
      });
      held.resolve(module);

      await new Promise<void>((resolve) => setImmediate(resolve));
      await expect(oldController.ensureBattle()).resolves.toBeNull();
      expect(oldHost.subscribe).toHaveBeenCalledOnce();
      const replacementBattle = await newController.ensureBattle();
      expect(replacementBattle).toBe(newController.battle.value);
      expect(replacementBattle).not.toBeNull();
      expect(create).toHaveBeenCalledOnce();
      expect(create).toHaveBeenCalledWith(newHost.host);
      expect(newHost.subscribe).toHaveBeenCalledTimes(2);
      await new Promise<void>((resolve) => setImmediate(resolve));
      expect(unhandled).toEqual([]);
      newController.dispose();
    } finally {
      process.off('unhandledRejection', onUnhandled);
    }
  });

  it('turns a loader failure into retryable UI state', async () => {
    const host = trackedHost();
    const module = {
      createBattleController: (current: GameHost) => createBattleController(current, {
        request: () => 1, cancel: vi.fn(),
      }),
    };
    const loadBattleController = vi.fn(async () => module);
    loadBattleController.mockRejectedValueOnce(new Error('chunk unavailable'));
    const controller = createGameController(host.host, useUiStore(createPinia()), {
      loadBattleController,
    });

    await expect(controller.ensureBattle()).resolves.toBeNull();
    expect(controller.notice.value).toContain('重新进入战斗重试');
    expect(host.subscribe).toHaveBeenCalledOnce();
    expect(await controller.ensureBattle()).not.toBeNull();
    expect(loadBattleController).toHaveBeenCalledTimes(2);
    expect(host.subscribe).toHaveBeenCalledTimes(2);
    controller.dispose();
  });
});

describe('game controller command scheduling', () => {
  it('queues FIFO input while autosave is pending instead of dropping it', async () => {
    let listener: ((update: GameUpdate) => void) | undefined;
    let releaseDispatch!: () => void;
    const dispatch = vi.fn().mockImplementationOnce(() => new Promise<GameUpdate>((resolve) => {
      releaseDispatch = () => resolve({ accepted: true, changes: {}, events: [] });
    })).mockResolvedValue({ accepted: true, changes: {}, events: [] });
    const host = { mode: 'main-thread', dispatch, query: vi.fn(), snapshot: vi.fn(),
      validate: vi.fn(), restore: vi.fn(), subscribe: (next: (update: GameUpdate) => void) =>
        (listener = next, () => undefined), dispose: vi.fn() } as unknown as GameHost;
    let releaseSave!: () => void;
    const autosave = vi.fn(() => new Promise<'saved'>((resolve) => {
      releaseSave = () => resolve('saved');
    }));
    const controller = createGameController(host, useUiStore(createPinia()), { autosave });
    listener!({ accepted: true, changes: {}, events: [{ t: 'changed' }] } as unknown as GameUpdate);
    await vi.waitFor(() => expect(autosave).toHaveBeenCalledOnce());
    const first = controller.worldMapCommand({ t: 'worldmap/cancel' });
    const second = controller.worldMapCommand({ t: 'worldmap/cancel' });
    expect(controller.busy.value).toBe(true); releaseSave(); await Promise.resolve();
    await vi.waitFor(() => expect(dispatch).toHaveBeenCalledTimes(1)); releaseDispatch();
    await first; await second;
    expect(dispatch.mock.calls.map(call => call[0].t)).toEqual(['worldmap/cancel', 'worldmap/cancel']);
    controller.dispose();
  });

  it('blocks quick saves while dialogue or book-sleep transactions are active', async () => {
    const ui = useUiStore(createPinia());
    const host = { ...failingHost(), dispatch: vi.fn() } as unknown as GameHost;
    const controller = createGameController(host, ui); controller.loading.value = false;
    ui.applyProjection({ dialogue: { storyId: 'story_test', storyHash: 'a', entryKey: 'start',
      speakerId: 'book_spirit', textKey: 'line', choices: [], history: [] } });
    await controller.saveAction('save', 'save_quick');
    expect(controller.notice.value).toContain('对话结束后');
    ui.applyProjection({ dialogue: null }); controller.setBookSleepActive(true);
    await controller.saveAction('save', 'save_quick');
    expect(controller.notice.value).toContain('书眠事务结束后');
    controller.dispose();
  });

  it('does not commit a difficulty rejected by the running core', async () => {
    const settings = shallowRef(defaultGameSettings());
    const persist = vi.fn().mockResolvedValue(undefined);
    const host = { ...failingHost(),
      dispatch: vi.fn().mockResolvedValue({ accepted: false, changes: {}, events: [],
        error: 'DIFFICULTY_LOCKED' }),
    } as unknown as GameHost;
    const storage = { settings: { set: persist } } as unknown as TianshuStorage;
    const controller = createGameController(host, useUiStore(createPinia()), { settings, storage });
    controller.playing.value = true;

    controller.setSetting('difficulty', 'diff_xiake');

    await vi.waitFor(() => expect(host.dispatch).toHaveBeenCalledOnce());
    await vi.waitFor(() => expect(controller.busy.value).toBe(false));
    expect(settings.value.difficulty).toBe('diff_jianghu');
    expect(persist).not.toHaveBeenCalled();
    controller.dispose();
  });
});
