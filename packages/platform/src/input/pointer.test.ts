import { describe, expect, it, vi } from 'vitest';
import { createPointerGestures, type DragGesture, type PinchGesture } from './pointer';

class FakePointerTarget {
  private readonly listeners = new Map<string, Set<(event: PointerEvent) => void>>();
  readonly setPointerCapture = vi.fn();
  readonly releasePointerCapture = vi.fn();

  addEventListener(type: string, listener: EventListenerOrEventListenerObject | null): void {
    if (typeof listener !== 'function') return;
    const group = this.listeners.get(type) ?? new Set<(event: PointerEvent) => void>();
    group.add(listener as (event: PointerEvent) => void); this.listeners.set(type, group);
  }

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null): void {
    if (typeof listener === 'function')
      this.listeners.get(type)?.delete(listener as (event: PointerEvent) => void);
  }

  dispatch(type: string, init: Partial<PointerEvent> & { pointerId: number }): void {
    const event = { clientX: 0, clientY: 0, timeStamp: 0, pointerType: 'touch', button: 0,
      ...init } as PointerEvent;
    for (const listener of [...(this.listeners.get(type) ?? [])]) listener(event);
  }
}

function asElement(target: FakePointerTarget): HTMLElement {
  return target as unknown as HTMLElement;
}

describe('createPointerGestures', () => {
  it('recognizes a tap at both inclusive duration and distance boundaries', () => {
    const target = new FakePointerTarget(); const taps = vi.fn();
    createPointerGestures(asElement(target), { onTap: taps });
    target.dispatch('pointerdown', { pointerId: 7, clientX: 2, clientY: 3, timeStamp: 100 });
    target.dispatch('pointerup', { pointerId: 7, clientX: 8, clientY: 11, timeStamp: 350 });
    expect(taps).toHaveBeenCalledOnce();
    expect(taps).toHaveBeenCalledWith(expect.objectContaining({
      x: 8, y: 11, pointerId: 7, pointerType: 'touch', button: 0,
    }));
  });

  it('rejects a stationary press longer than 250 ms as a tap', () => {
    const target = new FakePointerTarget(); const taps = vi.fn();
    createPointerGestures(asElement(target), { onTap: taps });
    target.dispatch('pointerdown', { pointerId: 1, timeStamp: 0 });
    target.dispatch('pointerup', { pointerId: 1, timeStamp: 251 });
    expect(taps).not.toHaveBeenCalled();
  });

  it('starts a drag only after movement exceeds 10 px and never emits a tap', () => {
    const target = new FakePointerTarget(); const taps = vi.fn(); const drags: DragGesture[] = [];
    createPointerGestures(asElement(target), {
      onTap: taps, onDrag: (gesture) => drags.push({ ...gesture }),
    });
    target.dispatch('pointerdown', { pointerId: 1, clientX: 0, clientY: 0 });
    target.dispatch('pointermove', { pointerId: 1, clientX: 10, clientY: 0, timeStamp: 10 });
    expect(drags).toEqual([]);
    target.dispatch('pointermove', { pointerId: 1, clientX: 10.1, clientY: 0, timeStamp: 20 });
    target.dispatch('pointermove', { pointerId: 1, clientX: 12, clientY: 2, timeStamp: 30 });
    target.dispatch('pointerup', { pointerId: 1, clientX: 13, clientY: 3, timeStamp: 40 });
    expect(drags.map((event) => event.phase)).toEqual(['start', 'move', 'end']);
    expect(drags[0]).toMatchObject({ startX: 0, startY: 0, dx: 10.1, dy: 0 });
    expect(taps).not.toHaveBeenCalled();
  });

  it('classifies a pointerup beyond 10 px as a drag without an intermediate move', () => {
    const target = new FakePointerTarget(); const phases: string[] = []; const taps = vi.fn();
    createPointerGestures(asElement(target), {
      onTap: taps, onDrag: (gesture) => phases.push(gesture.phase),
    });
    target.dispatch('pointerdown', { pointerId: 1, clientX: 0, clientY: 0 });
    target.dispatch('pointerup', { pointerId: 1, clientX: 11, clientY: 0, timeStamp: 10 });
    expect(phases).toEqual(['start', 'end']);
    expect(taps).not.toHaveBeenCalled();
  });

  it('reports two-pointer pinch scale and center from the initial distance', () => {
    const target = new FakePointerTarget(); const pinches: PinchGesture[] = [];
    const references: Readonly<PinchGesture>[] = [];
    createPointerGestures(asElement(target), { onPinch: (gesture) => {
      references.push(gesture); pinches.push({ ...gesture });
    } });
    target.dispatch('pointerdown', { pointerId: 1, clientX: 0, clientY: 0 });
    target.dispatch('pointerdown', { pointerId: 2, clientX: 0, clientY: 10 });
    target.dispatch('pointermove', { pointerId: 2, clientX: 0, clientY: 20 });
    expect(pinches).toEqual([
      { scale: 1, centerX: 0, centerY: 5 },
      { scale: 2, centerX: 0, centerY: 10 },
    ]);
    expect(references[1]).toBe(references[0]);
  });

  it('brackets every pinch gesture with exactly one start and one end callback', () => {
    const target = new FakePointerTarget(); const events: string[] = [];
    createPointerGestures(asElement(target), {
      onPinchStart: (gesture) => events.push(`start:${gesture.scale}`),
      onPinch: (gesture) => events.push(`pinch:${gesture.scale}`),
      onPinchEnd: (gesture) => events.push(`end:${gesture.scale}`),
    });
    for (let gesture = 0; gesture < 2; gesture += 1) {
      target.dispatch('pointerdown', { pointerId: 1, clientX: 0, clientY: 0 });
      target.dispatch('pointerdown', { pointerId: 2, clientX: 0, clientY: 10 });
      target.dispatch('pointermove', { pointerId: 2, clientX: 0, clientY: 20 });
      target.dispatch('pointermove', { pointerId: 2, clientX: 0, clientY: 10 });
      target.dispatch('pointerup', { pointerId: 2, clientX: 0, clientY: 10 });
      target.dispatch('pointerup', { pointerId: 1, clientX: 0, clientY: 0 });
    }
    const one = ['start:1', 'pinch:1', 'pinch:2', 'pinch:1', 'end:1'];
    expect(events).toEqual([...one, ...one]);
  });

  it('cancels an active drag on pointercancel', () => {
    const target = new FakePointerTarget(); const phases: string[] = [];
    createPointerGestures(asElement(target), { onDrag: (gesture) => phases.push(gesture.phase) });
    target.dispatch('pointerdown', { pointerId: 1 });
    target.dispatch('pointermove', { pointerId: 1, clientX: 11 });
    target.dispatch('pointercancel', { pointerId: 1, clientX: 12 });
    expect(phases).toEqual(['start', 'cancel']);
  });

  it('captures pointers and stops all callbacks after idempotent dispose', () => {
    const target = new FakePointerTarget(); const taps = vi.fn();
    const gestures = createPointerGestures(asElement(target), { onTap: taps });
    target.dispatch('pointerdown', { pointerId: 3 });
    target.dispatch('pointerup', { pointerId: 3, timeStamp: 1 });
    expect(target.setPointerCapture).toHaveBeenCalledWith(3);
    expect(target.releasePointerCapture).toHaveBeenCalledWith(3);
    expect(taps).toHaveBeenCalledOnce();
    gestures.dispose(); gestures.dispose();
    target.dispatch('pointerdown', { pointerId: 4 });
    target.dispatch('pointerup', { pointerId: 4, timeStamp: 1 });
    expect(taps).toHaveBeenCalledOnce();
  });
});
