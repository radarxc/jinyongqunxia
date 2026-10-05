import { describe, expect, it, vi } from 'vitest';
import { createProjectionMainThreadHost, createProjectionWorkerHost } from './projection-host';
const comlink = vi.hoisted(() => ({ wrap: vi.fn(), releaseProxy: Symbol('releaseProxy') }));
vi.mock('comlink', () => ({ wrap: comlink.wrap, releaseProxy: comlink.releaseProxy, expose: vi.fn() }));

describe('projection host lifecycle', () => {
  it('orders commands and serializes save barriers, with no state alias into UI', async () => {
    const state = { nested: { count: 0 } };
    const remote = {
      async dispatch(delta: number) {
        await Promise.resolve(); state.nested.count += delta;
        return { accepted: true, changes: structuredClone(state), events: ['changed'] };
      },
      query: () => state, snapshot: () => state, validate: () => undefined,
      restore: (next: typeof state) => { state.nested.count = next.nested.count; return { accepted: true, changes: state, events: ['restored'] }; },
    };
    const host = createProjectionMainThreadHost(remote);
    const listener = vi.fn(); const off = host.subscribe(listener);
    const first = host.dispatch(1); const second = host.dispatch(2); const snapshot = host.snapshot();
    await Promise.all([first, second]); expect((await snapshot).nested.count).toBe(3);
    expect(listener).toHaveBeenCalledTimes(2);
    const view = await host.query(); view.nested.count = 90;
    expect((await host.snapshot()).nested.count).toBe(3);
    off(); await host.dispatch(1); expect(listener).toHaveBeenCalledTimes(2);
    host.dispose(); await expect(host.query()).rejects.toThrow('HOST_DISPOSED');
  });
  it('rejects an outstanding operation on dispose', async () => {
    const remote = { dispatch: () => new Promise<never>(() => undefined), query: () => ({}),
      snapshot: () => ({}), validate: () => undefined, restore: () => ({ accepted: true, changes: {}, events: [] }) };
    const host = createProjectionMainThreadHost(remote);
    const pending = host.dispatch({}); host.dispose();
    await expect(pending).rejects.toThrow('HOST_DISPOSED');
  });
});

describe('projection worker watchdog', () => {
  it('terminates a stuck Worker call and rejects the queued FIFO', async () => {
    vi.useFakeTimers();
    const dispatch = vi.fn().mockImplementationOnce(() => new Promise<never>(() => undefined))
      .mockResolvedValue({ accepted: true, changes: { ready: true }, events: [] });
    const remote = { dispatch, query: vi.fn().mockResolvedValue({}), snapshot: vi.fn(),
      validate: vi.fn(), restore: vi.fn(), [comlink.releaseProxy]: vi.fn() };
    const listeners = new Map<string, EventListener>();
    const worker = { addEventListener: vi.fn((name: string, listener: EventListener) => listeners.set(name, listener)),
      removeEventListener: vi.fn(), terminate: vi.fn() } as unknown as Worker;
    comlink.wrap.mockReturnValue(remote);
    try {
      const host = createProjectionWorkerHost(worker, { timeoutMs: 25 });
      const subscriber = vi.fn(); host.subscribe(subscriber);
      const first = host.dispatch(1); const second = host.dispatch(2);
      await vi.advanceTimersByTimeAsync(25);
      await expect(first).rejects.toThrow('CORE_WORKER_FAILED:CORE_CALL_TIMEOUT');
      await expect(second).rejects.toThrow('HOST_DISPOSED');
      expect(subscriber).toHaveBeenCalledWith({ accepted: false, changes: {}, events: [],
        error: 'CORE_WORKER_FAILED:CORE_CALL_TIMEOUT' });
      expect(worker.terminate).toHaveBeenCalledOnce();
      host.dispose();
    } finally { comlink.wrap.mockReset(); vi.useRealTimers(); }
  });
  it('publishes CORE_WORKER_FAILED to subscribers before rejecting calls', async () => {
    const remote = { dispatch: vi.fn(() => new Promise<never>(() => undefined)), query: vi.fn(),
      snapshot: vi.fn(), validate: vi.fn(), restore: vi.fn(), [comlink.releaseProxy]: vi.fn() };
    comlink.wrap.mockReturnValue(remote); const listeners = new Map<string, EventListener>();
    const worker = { addEventListener: vi.fn((name: string, listener: EventListener) => listeners.set(name, listener)),
      removeEventListener: vi.fn(), terminate: vi.fn() } as unknown as Worker;
    const host = createProjectionWorkerHost(worker); const subscriber = vi.fn(); host.subscribe(subscriber);
    const pending = host.dispatch(1); listeners.get('error')!(new Event('error'));
    await expect(pending).rejects.toThrow('CORE_WORKER_FAILED');
    expect(subscriber).toHaveBeenCalledWith({ accepted: false, changes: {}, events: [],
      error: 'CORE_WORKER_FAILED' }); host.dispose();
  });
});
