// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createContextGuard, type ContextGuardOptions, type ContextState } from './context-guard';

function fixture(options: ContextGuardOptions = {}) {
  const canvas = document.createElement('canvas');
  const context = { isContextLost: vi.fn(() => false) };
  const renderer = {
    getContext: vi.fn(() => context),
    setPixelRatio: vi.fn(),
    setSize: vi.fn(),
  };
  const states: ContextState[] = [];
  const onLoss = vi.fn();
  const onRestore = vi.fn();
  const requestFrame = vi.fn();
  const guard = createContextGuard(canvas, renderer, {
    onStateChange: (state) => states.push(state),
    onLoss,
    onRestore,
    requestFrame,
    ...options,
  });
  guard.resize(640, 360, 1.25);
  return { canvas, context, renderer, states, onLoss, onRestore, requestFrame, guard };
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('context guard', () => {
  it('pauses on loss and restores viewport resources before requesting a frame', () => {
    vi.useFakeTimers();
    const item = fixture();
    const lost = new Event('webglcontextlost', { cancelable: true });
    item.canvas.dispatchEvent(lost);
    expect(lost.defaultPrevented).toBe(true);
    expect(item.guard.state).toBe('lost');
    expect(item.onLoss).toHaveBeenCalledWith(1);
    expect(item.states).toEqual(['lost']);

    vi.advanceTimersByTime(4_999);
    item.canvas.dispatchEvent(new Event('webglcontextrestored'));
    expect(item.guard.state).toBe('ok');
    expect(item.onRestore).toHaveBeenCalledOnce();
    expect(item.renderer.setPixelRatio).toHaveBeenLastCalledWith(1.25);
    expect(item.renderer.setSize).toHaveBeenLastCalledWith(640, 360, false);
    expect(item.requestFrame).toHaveBeenCalledOnce();
    expect(item.states).toEqual(['lost', 'ok']);
    item.guard.dispose();
  });

  it('enters failed after five seconds and still accepts a late browser restore', () => {
    vi.useFakeTimers();
    const item = fixture();
    item.canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
    vi.advanceTimersByTime(5_000);
    expect(item.guard.state).toBe('failed');
    expect(item.states).toEqual(['lost', 'failed']);
    item.canvas.dispatchEvent(new Event('webglcontextrestored'));
    expect(item.guard.state).toBe('ok');
    item.guard.dispose();
  });

  it('checks the GL state before resuming from the foreground', () => {
    vi.useFakeTimers();
    const item = fixture();
    item.context.isContextLost.mockReturnValue(true);
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(item.guard.state).toBe('lost');
    expect(item.onLoss).toHaveBeenCalledOnce();
    item.guard.dispose();
  });

  it('removes canvas and visibility listeners when disposed', () => {
    vi.useFakeTimers();
    const item = fixture();
    item.guard.dispose();
    item.canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
    document.dispatchEvent(new Event('visibilitychange'));
    vi.advanceTimersByTime(5_000);
    expect(item.guard.state).toBe('ok');
    expect(item.onLoss).not.toHaveBeenCalled();
    expect(item.states).toEqual([]);
  });

  it('keeps a failed recovery visible when rebuilding resources throws', () => {
    vi.useFakeTimers();
    const item = fixture();
    item.onRestore.mockImplementation(() => { throw new Error('upload failed'); });
    item.canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
    item.canvas.dispatchEvent(new Event('webglcontextrestored'));
    expect(item.guard.state).toBe('failed');
    expect(item.requestFrame).not.toHaveBeenCalled();
    item.guard.dispose();
  });

  it('counts each loss once and reapplies the latest pending viewport', () => {
    vi.useFakeTimers();
    const item = fixture();
    item.canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
    item.canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
    item.guard.resize(800, 450, 0.85);
    expect(item.onLoss).toHaveBeenCalledOnce();
    expect(item.renderer.setSize).toHaveBeenLastCalledWith(640, 360, false);
    item.canvas.dispatchEvent(new Event('webglcontextrestored'));
    expect(item.renderer.setSize).toHaveBeenLastCalledWith(800, 450, false);
    expect(item.renderer.setPixelRatio).toHaveBeenLastCalledWith(0.85);
    item.canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
    expect(item.onLoss).toHaveBeenLastCalledWith(2);
    item.guard.dispose();
    vi.advanceTimersByTime(5_000);
    expect(item.states).toEqual(['lost', 'ok', 'lost']);
  });

  it('attempts recreation once on timeout and escalates repeated failures', async () => {
    vi.useFakeTimers();
    const onRecreate = vi.fn(async () => false);
    const onFatal = vi.fn();
    const item = fixture({ onRecreate, onFatal });
    for (let index = 0; index < 3; index += 1) {
      item.canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
      await vi.advanceTimersByTimeAsync(5_000);
      expect(onFatal).toHaveBeenLastCalledWith(index === 2 ? 'restart-browser' : 'reload');
      item.canvas.dispatchEvent(new Event('webglcontextrestored'));
    }
    expect(onRecreate).toHaveBeenCalledTimes(3);
    item.guard.dispose();
  });

  it('does not report a stale recreation failure after a late restore', async () => {
    vi.useFakeTimers();
    let finish!: (value: boolean) => void;
    const onFatal = vi.fn();
    const item = fixture({ onRecreate: () => new Promise(resolve => { finish = resolve; }), onFatal });
    item.canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
    await vi.advanceTimersByTimeAsync(5_000);
    item.canvas.dispatchEvent(new Event('webglcontextrestored'));
    finish(false);
    await Promise.resolve();
    expect(item.guard.state).toBe('ok');
    expect(onFatal).not.toHaveBeenCalled();
    item.guard.dispose();
  });

  it('stops hidden drawing and checks GL before a bfcache resume', () => {
    vi.useFakeTimers();
    const item = fixture();
    const visible = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    const initialChecks = item.context.isContextLost.mock.calls.length;
    expect(item.guard.canRender).toBe(false);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(item.context.isContextLost).toHaveBeenCalledTimes(initialChecks);
    visible.mockReturnValue('visible');
    item.context.isContextLost.mockReturnValue(true);
    window.dispatchEvent(new Event('pageshow'));
    expect(item.guard.state).toBe('lost');
    item.guard.dispose();
  });
});
