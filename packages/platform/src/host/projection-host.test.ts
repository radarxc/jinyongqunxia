import { describe, expect, it, vi } from 'vitest';
import { createProjectionMainThreadHost } from './projection-host';

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
