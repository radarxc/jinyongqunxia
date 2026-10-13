import { describe, expect, it, vi } from 'vitest';
import { createZoomController, TOWN_ZOOM_OPTIONS } from './zoom';

describe('createZoomController', () => {
  it('steps through presets and chooses the adjacent preset between stops', () => {
    const zoom = createZoomController(TOWN_ZOOM_OPTIONS);
    expect(zoom.value()).toBe(80);
    expect(zoom.stepIn()).toBe(96);
    expect(zoom.stepIn()).toBe(96);
    expect(zoom.stepOut()).toBe(80);
    zoom.set(72);
    expect(zoom.stepIn()).toBe(80);
    zoom.set(72);
    expect(zoom.stepOut()).toBe(64);
    zoom.set(44);
    expect(zoom.stepOut()).toBe(44);
  });

  it('clamps continuous wheel and pinch zoom to 40–112', () => {
    const zoom = createZoomController(TOWN_ZOOM_OPTIONS);
    expect(zoom.wheel(10_000)).toBe(40);
    expect(zoom.wheel(-10_000)).toBe(112);
    zoom.set(80);
    expect(zoom.pinch(1)).toBe(80);
    expect(zoom.pinch(2)).toBe(112);
    expect(zoom.pinch(0.01)).toBe(40);
  });

  it('resets to the active context default', () => {
    const zoom = createZoomController(TOWN_ZOOM_OPTIONS);
    zoom.set(48); expect(zoom.reset()).toBe(80);
    zoom.setContext('interior');
    zoom.set(64); expect(zoom.reset()).toBe(96);
  });

  it('keeps manual zoom until context changes, then uses each new context default', () => {
    const zoom = createZoomController(TOWN_ZOOM_OPTIONS);
    zoom.set(64);
    expect(zoom.setContext('street')).toBe(64);
    expect(zoom.setContext('interior')).toBe(96);
    zoom.set(48);
    expect(zoom.setContext('street')).toBe(80);
  });

  it('uses one immediate subscription source for every zoom mutation', () => {
    const zoom = createZoomController(TOWN_ZOOM_OPTIONS); const listener = vi.fn();
    const unsubscribe = zoom.subscribe(listener);
    zoom.stepIn(); zoom.wheel(8); zoom.pinch(1); zoom.pinch(1.1); zoom.reset();
    expect(listener.mock.calls.map(call => call[0]).slice(0, 3)).toEqual([80, 96, 95]);
    expect(listener.mock.calls[3]![0]).toBeCloseTo(104.5);
    expect(listener.mock.calls[4]![0]).toBe(80);
    unsubscribe(); zoom.stepOut();
    expect(listener).toHaveBeenCalledTimes(5);
  });
  it('keeps one pinch gesture absolute to its start: 1 → 1.25 → 1 → 0.8', () => {
    const zoom = createZoomController(TOWN_ZOOM_OPTIONS);
    zoom.pinchStart();
    expect([1, 1.25, 1, 0.8].map(scale => zoom.pinch(scale))).toEqual([80, 100, 80, 64]);
    zoom.pinchEnd();
  });

  it('starts each new pinch gesture from the zoom the previous one ended at', () => {
    const zoom = createZoomController(TOWN_ZOOM_OPTIONS);
    zoom.pinchStart(); expect(zoom.pinch(1.25)).toBe(100); zoom.pinchEnd();
    zoom.pinchStart(); expect(zoom.pinch(0.8)).toBe(80); expect(zoom.pinch(1)).toBe(100);
    zoom.pinchEnd();
    expect(zoom.value()).toBe(100);
  });
});
