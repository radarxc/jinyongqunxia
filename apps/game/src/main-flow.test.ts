// @vitest-environment happy-dom
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createIndexedDbStorage, createProjectionMainThreadHost } from '@tianshu/platform';
import { createGameSession } from './runtime/session';
import { fixtureContent } from './runtime/test-fixture';
import { createSaveService } from './storage/save-service';

const mocks = vi.hoisted(() => ({ createHost: vi.fn(), failFirst: false, created: 0 }));
vi.mock('./core-host', () => ({ createGameCoreHost: mocks.createHost }));
vi.mock('./loop', () => ({ createGameLoop: () => ({ start: vi.fn(), stop: vi.fn(), reset: vi.fn() }) }));
vi.mock('./pwa', () => ({ schedulePwaRegistration: vi.fn() }));
vi.mock('./render-host', () => ({ createRenderQuality: async () => ({ setTier: vi.fn() }),
  setRenderRecoveryHandlers: () => () => undefined }));
vi.mock('./App.vue', () => ({ default: { props: ['controller'],
  template: '<main data-game="ready">{{ controller.saveStatus.value }}</main>' } }));

afterEach(() => { document.body.innerHTML = ''; vi.resetModules(); vi.unstubAllGlobals();
  mocks.createHost.mockReset(); mocks.created = 0; mocks.failFirst = false; });
describe('application title and recovery flow', () => {
  it('continues a formal save, then replaces a failed host and restores the latest auto save', async () => {
    vi.stubGlobal('indexedDB', new IDBFactory()); vi.stubGlobal('IDBKeyRange', IDBKeyRange);
    const seedHost = createProjectionMainThreadHost(createGameSession(fixtureContent(), undefined, undefined, { demo: false }));
    const storage = await createIndexedDbStorage({ databaseName: 'tianshu', storageManager: null });
    const saves = createSaveService(storage, seedHost);
    await saves.save('save_quick'); await saves.autosave('test', true);
    await storage.close(); seedHost.dispose();
    mocks.createHost.mockImplementation(async () => {
      const index = mocks.created++;
      const host = createProjectionMainThreadHost(createGameSession(fixtureContent(), undefined, undefined, { demo: false }));
      const dispatch = host.dispatch.bind(host);
      return { ...host, dispatch: (command: Parameters<typeof dispatch>[0]) =>
        index === 0 && mocks.failFirst ? Promise.reject(new Error('CORE_WORKER_FAILED')) : dispatch(command) };
    });
    document.body.innerHTML = '<div id="app"></div>';
    const shell = await import('./main'); await shell.gameReady;
    const button = (label: string) => [...document.querySelectorAll('button')]
      .find(entry => entry.textContent?.trim() === label) as HTMLButtonElement | undefined;
    expect(button('继续')?.disabled).toBe(false); button('继续')!.click();
    await vi.waitFor(() => expect(document.querySelector('[data-game]')).not.toBeNull());
    mocks.failFirst = true; const { uiBus } = await import('@tianshu/ui/runtime');
    uiBus.emit({ type: 'core-command', command: { t: 'worldmap/cancel' } });
    await vi.waitFor(() => expect(document.body.textContent).toContain('核心进程已停止响应'));
    expect(button('从最近自动存档恢复')?.disabled).toBe(false);
    button('从最近自动存档恢复')!.click();
    await vi.waitFor(() => expect(document.querySelector('[data-game]')?.textContent).toContain('自动存档恢复'));
    expect(mocks.createHost).toHaveBeenCalledTimes(2); shell.disposeGameShell();
  });
});
