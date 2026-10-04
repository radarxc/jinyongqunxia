// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ registerSW: vi.fn(), offlineReady: vi.fn(), needRefresh: vi.fn(),
  refreshNetwork: vi.fn(async () => undefined), listActiveRecords: vi.fn(async () => []),
  listRecords: vi.fn(async () => []) }));
vi.mock('./registration', () => ({ registerSW: mocks.registerSW }));
vi.mock('@tianshu/platform/pwa', () => ({ pwaController: { subscribe: vi.fn(), activate: vi.fn(),
  remindLater: vi.fn(), forceUpdate: vi.fn(), offlineReady: mocks.offlineReady,
  needRefresh: mocks.needRefresh, refreshNetwork: mocks.refreshNetwork } }));
vi.mock('@tianshu/platform/offline', () => ({ collectOfflineGarbage: vi.fn(),
  downloadOfflineClosure: vi.fn(), listActiveRecords: mocks.listActiveRecords,
  listRecords: mocks.listRecords, publishOfflineClosures: vi.fn() }));
vi.mock('./downloads', () => ({ fetchClosure: vi.fn() }));

describe('registerPwa', () => {
  beforeEach(() => { vi.clearAllMocks(); Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true, value: {} }); Object.defineProperty(globalThis, 'caches', { configurable: true, value: {} });
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ releaseHash: 'b'.repeat(64) })))); });
  // This wait synchronizes functional state; loaded-host latency is not a performance assertion.
  it('wires offline-ready and waiting-worker callbacks into the UI state controller', async () => {
    const update = vi.fn(async () => undefined); let callbacks: Record<string, (...args: unknown[]) => unknown> = {};
    mocks.registerSW.mockImplementation(options => { callbacks = options; return update; });
    const { registerPwa } = await import('./client'); await registerPwa();
    callbacks['onOfflineReady']?.(); callbacks['onNeedRefresh']?.();
    await vi.waitFor(() => expect(mocks.needRefresh).toHaveBeenCalledOnce(), { timeout: 10_000 });
    expect(mocks.offlineReady).toHaveBeenCalledOnce();
    expect(mocks.needRefresh).toHaveBeenCalledWith(expect.any(Function), false, expect.any(Function), 'b'.repeat(64));
  }, 30_000);
});
