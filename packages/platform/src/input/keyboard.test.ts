import { describe, expect, it, vi } from 'vitest';
import { createKeyboardState, type KeyboardEdge } from './keyboard';

class FakeEventTarget {
  private readonly listeners = new Map<string, Set<(event: Event) => void>>();

  addEventListener(type: string, listener: EventListenerOrEventListenerObject | null): void {
    if (listener === null) return;
    const callback = typeof listener === 'function'
      ? listener
      : (event: Event) => listener.handleEvent(event);
    const group = this.listeners.get(type) ?? new Set<(event: Event) => void>();
    group.add(callback);
    this.listeners.set(type, group);
  }

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null): void {
    if (typeof listener === 'function') this.listeners.get(type)?.delete(listener);
  }

  dispatch(type: string, init: Record<string, unknown> = {}): void {
    const event = { code: '', key: '', repeat: false, shiftKey: false, ctrlKey: false,
      altKey: false, metaKey: false, isComposing: false, keyCode: 0, target: null,
      ...init } as unknown as Event;
    for (const listener of [...(this.listeners.get(type) ?? [])]) listener(event);
  }
}

function setup() {
  const win = new FakeEventTarget();
  const documentEvents = new FakeEventTarget();
  const doc = {
    addEventListener: documentEvents.addEventListener.bind(documentEvents),
    removeEventListener: documentEvents.removeEventListener.bind(documentEvents),
    visibilityState: 'visible' as DocumentVisibilityState,
  };
  const state = createKeyboardState(
    win as unknown as Pick<Window, 'addEventListener' | 'removeEventListener'>,
    doc as Pick<Document, 'addEventListener' | 'removeEventListener' | 'visibilityState'>,
  );
  return { win, documentEvents, doc, state };
}

describe('createKeyboardState', () => {
  it('tracks held keys by physical code and exposes a stable read-only view', () => {
    const { win, state } = setup();
    const view = state.downCodes();
    win.dispatch('keydown', { code: 'KeyW', key: 'w' });
    expect(state.isDown('KeyW')).toBe(true);
    expect([...view]).toEqual(['KeyW']);
    expect(state.downCodes()).toBe(view);
    win.dispatch('keyup', { code: 'KeyW', key: 'w' });
    expect(state.isDown('KeyW')).toBe(false);
  });

  it('does not emit a second down edge for repeated keydown', () => {
    const { win, state } = setup();
    const listener = vi.fn(); state.subscribe(listener);
    win.dispatch('keydown', { code: 'KeyW', key: 'w' });
    win.dispatch('keydown', { code: 'KeyW', key: 'w', repeat: true });
    expect(listener).toHaveBeenCalledOnce();
    expect(listener.mock.calls[0]?.[0]).toMatchObject({ code: 'KeyW', down: true, repeat: false });
  });

  it('reports Shift, Ctrl, Alt, and Meta modifiers on an edge', () => {
    const { win, state } = setup();
    let copy: KeyboardEdge | undefined;
    state.subscribe((edge) => { copy = { ...edge }; });
    win.dispatch('keydown', { code: 'KeyQ', key: 'Q', shiftKey: true, ctrlKey: true,
      altKey: true, metaKey: true });
    expect(copy).toMatchObject({ shift: true, ctrl: true, alt: true, meta: true });
  });

  it('marks targets contained by an editable element', () => {
    const { win, state } = setup();
    let editable = false; state.subscribe((edge) => { editable = edge.editableTarget; });
    const target = { closest: vi.fn(() => ({ tagName: 'TEXTAREA' })) };
    win.dispatch('keydown', { code: 'KeyA', key: 'a', target });
    expect(target.closest).toHaveBeenCalledWith('input, textarea, select, [contenteditable]');
    expect(editable).toBe(true);
  });

  it('marks composition from isComposing and legacy keyCode 229', () => {
    const { win, state } = setup();
    const values: boolean[] = []; state.subscribe((edge) => values.push(edge.composing));
    win.dispatch('keydown', { code: 'KeyA', key: 'a', isComposing: true });
    win.dispatch('keyup', { code: 'KeyA', key: 'a' });
    win.dispatch('keydown', { code: 'KeyB', key: 'b', keyCode: 229 });
    expect(values).toEqual([true, false, true]);
  });

  it('releases every held key on window blur', () => {
    const { win, state } = setup();
    const edges: KeyboardEdge[] = []; const queryDuringRelease: boolean[] = [];
    state.subscribe((edge) => {
      edges.push({ ...edge });
      if (!edge.down) queryDuringRelease.push(state.isDown(edge.code));
    });
    win.dispatch('keydown', { code: 'KeyW', key: 'w' });
    win.dispatch('keydown', { code: 'KeyD', key: 'd' });
    win.dispatch('blur');
    expect([...state.downCodes()]).toEqual([]);
    expect(queryDuringRelease).toEqual([false, false]);
    expect(edges.slice(-2)).toEqual([
      expect.objectContaining({ code: 'KeyW', down: false }),
      expect.objectContaining({ code: 'KeyD', down: false }),
    ]);
  });

  it('releases every held key when the document becomes hidden', () => {
    const { win, documentEvents, doc, state } = setup();
    const listener = vi.fn(); state.subscribe(listener);
    win.dispatch('keydown', { code: 'Space', key: ' ' });
    doc.visibilityState = 'hidden'; documentEvents.dispatch('visibilitychange');
    expect(state.isDown('Space')).toBe(false);
    expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ code: 'Space', down: false }));
  });

  it('stops dispatching after an idempotent dispose', () => {
    const { win, state } = setup();
    const listener = vi.fn(); state.subscribe(listener);
    state.dispose(); state.dispose();
    win.dispatch('keydown', { code: 'KeyW', key: 'w' });
    expect(listener).not.toHaveBeenCalled();
    expect(state.isDown('KeyW')).toBe(false);
  });
});
