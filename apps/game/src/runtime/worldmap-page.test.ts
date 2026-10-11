// @vitest-environment happy-dom
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { nextTick, shallowRef } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useUiStore } from '@tianshu/ui/runtime';
import type { UiProjection } from '@tianshu/ui';
import type { WorldMapProjection } from '@tianshu/core';
import type { WorldMapRuntimeDefinition } from '@tianshu/data/schemas';
import type { GameController } from '../game-controller';
import WorldMapPage from '../pages/WorldMapPage.vue';
import { gridToScreen, screenToGrid } from '../worldmap/painted-view';
import * as paintedView from '../worldmap/painted-view';
import type { Point, Size, ViewState } from '../worldmap/painted-view';

type SpriteJobLike = { key: string; url: string };
type Batch = { made: Map<string, string>; failed: Set<string> };
// Canvas resampling is browser-only; tests drive it through this switchboard (off by default).
const sprites = vi.hoisted(() => ({
  can: false,
  load: (_url: string): Promise<unknown> => Promise.resolve({ naturalWidth: 1, naturalHeight: 1 }),
  batch: (_jobs: readonly SpriteJobLike[]): Promise<Batch> => Promise.resolve({ made: new Map(), failed: new Set() }),
}));
vi.mock('../worldmap/map-sprites', () => ({
  canResample: () => sprites.can,
  loadImage: (url: string) => sprites.load(url),
  resampleSprites: (jobs: readonly SpriteJobLike[]) => sprites.batch(jobs),
}));
type MapNode = WorldMapRuntimeDefinition['nodes'][number];
type DebugState = ViewState & { z: number; viewport: Size; image: Size; following: boolean; sprites: number };
type DebugHandle = { state(): DebugState; focus(id: string): void; setZoom(z: number): void };
const debugWindow = window as unknown as { __worldMapView?: DebugHandle };
const debug = () => debugWindow.__worldMapView!;
function node(id: string, name: string, point: [number, number], open = true): MapNode {
  return { id, name, kind: 'town', point, open, eras: open ? ['ch01'] : ['ch02'], regionId: 'rg_test',
    levelRange: null, levelNote: '', entry: { sceneId: 'scene_test', townSpec: null,
      templateYear: null, gateId: null, spawn: null, accessNote: '' } };
}
const nodes = [node('city_home', '大理（待考）地区所指治所', [256, 192]),
  node('city_east', '江陵所指治所', [340, 192]), node('city_west', '长安', [160, 192]),
  node('city_closed', '未开放', [250, 192], false)];
const map: WorldMapRuntimeDefinition = { version: 'worldmap.v1', revision: 'a'.repeat(64),
  chapterId: 'ch01_tianlong', era: 'ch01', eraBand: 'song', name: '江湖', years: [1093, 1094],
  mapReferenceYear: 1093, grid: { width: 512, height: 384 }, travel: { liPerHour: 10, stepLi: 10 },
  startNodeId: 'city_home', nodes, terrain: { land: [], rivers: [], mountains: [] },
  roads: [{ key: 'east', start: 'city_home', end: 'city_east', routeId: null, distanceLi: 20,
    sourceHours: 2, kind: 'post_road', eras: ['ch01'], points: [[256, 192], [300, 200], [340, 192]] }] };
const initial: WorldMapProjection = { point: [256, 192], positionNodeId: 'city_home', journey: null,
  reachableNodeIds: ['city_home', 'city_east', 'city_west'] };
function journey(point: [number, number] = [400, 192], id = 1): WorldMapProjection {
  return { ...initial, point, positionNodeId: null, journey: { id, destination: 'city_east', legs: [],
    legIndex: 0, offsetLi: 0, travelledLi: 0, totalLi: 20, status: 'walking' } };
}
let bounds: { width: number; height: number; left: number; top: number };
let frames: Map<number, FrameRequestCallback>;
let nextFrameId: number;
let resizeCallback: ResizeObserverCallback;
let observed: Element;
const disconnect = vi.fn();
const wrappers: Array<ReturnType<typeof mount>> = [];
const requestFrame = vi.fn((callback: FrameRequestCallback) => {
  const id = ++nextFrameId; frames.set(id, callback); return id;
});
const cancelFrame = vi.fn((id: number) => { frames.delete(id); });
function rect(): DOMRect { return { ...bounds, x: bounds.left, y: bounds.top,
  right: bounds.left + bounds.width, bottom: bounds.top + bounds.height, toJSON: () => ({}) } as DOMRect; }
async function flushFrame(time = window.performance.now()): Promise<void> {
  await nextTick();
  const pending = [...frames]; frames.clear();
  for (const [, callback] of pending) callback(time);
  await nextTick();
}
function setup(state: WorldMapProjection | null = initial, texture = 'assets/default/map/world/test.webp') {
  const pinia = createPinia();
  const store = useUiStore(pinia);
  store.replaceProjection({ worldmapStatic: { map, mapTextureUrl: texture } } as UiProjection);
  const worldmap = shallowRef<WorldMapProjection | null>(state);
  const settings = shallowRef({ reducedMotion: false });
  const busy = shallowRef(false);
  const command = vi.fn().mockResolvedValue(undefined);
  const controller = { worldmap, settings, busy, worldMapCommand: command } as unknown as GameController;
  const wrapper = mount(WorldMapPage, { attachTo: document.body, props: { controller }, global: { plugins: [pinia] } });
  wrappers.push(wrapper);
  return { wrapper, worldmap, settings, busy, command, store };
}
function pointer(target: Element, type: string, point: Point, id = 1): void {
  target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, button: 0,
    pointerId: id, pointerType: id === 1 ? 'mouse' : 'touch', clientX: point[0] + bounds.left, clientY: point[1] + bounds.top }));
}
function wheel(target: Element, point: Point, deltaY = -200): void {
  const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY });
  // happy-dom's WheelEvent currently ignores inherited MouseEvent coordinates.
  Object.assign(event, { clientX: point[0] + bounds.left, clientY: point[1] + bounds.top });
  target.dispatchEvent(event);
}
function gesture(target: Element, type: string, point: Point, scale = 1): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, { clientX: point[0] + bounds.left, clientY: point[1] + bounds.top, scale });
  target.dispatchEvent(event); return event;
}
async function loadImage(wrapper: ReturnType<typeof mount>, width = 4800, height = 3600): Promise<void> {
  const image = wrapper.get('.map-painted-image').element as HTMLImageElement;
  Object.defineProperties(image, { naturalWidth: { configurable: true, value: width },
    naturalHeight: { configurable: true, value: height } });
  image.dispatchEvent(new Event('load')); await flushFrame();
}
function expectCovered(state: DebugState): void {
  expect(state.tx).toBeLessThanOrEqual(0); expect(state.ty).toBeLessThanOrEqual(0);
  expect(state.tx + state.image.width * state.s).toBeGreaterThanOrEqual(state.viewport.width - 1e-9);
  expect(state.ty + state.image.height * state.s).toBeGreaterThanOrEqual(state.viewport.height - 1e-9);
  expect(state.z).toBeGreaterThanOrEqual(1); expect(state.z).toBeLessThanOrEqual(4);
}

beforeEach(() => {
  sprites.can = false;
  sprites.load = () => Promise.resolve({ naturalWidth: 1, naturalHeight: 1 });
  sprites.batch = () => Promise.resolve({ made: new Map(), failed: new Set() });
  bounds = { width: 1200, height: 800, left: 15, top: 25 };
  frames = new Map(); nextFrameId = 0;
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
  vi.stubGlobal('requestAnimationFrame', requestFrame);
  vi.stubGlobal('cancelAnimationFrame', cancelFrame);
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: ResizeObserverCallback) { resizeCallback = callback; }
    observe(target: Element) { observed = target; }
    disconnect = disconnect;
  });
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(rect);
  // Optional overlay files (marker atlas, landmark index) are absent unless a test provides them.
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => null }));
});
afterEach(() => {
  for (const wrapper of wrappers.splice(0)) wrapper.unmount();
  vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); vi.clearAllMocks();
  document.body.innerHTML = '';
});

describe('WorldMapPage painted layers and resource lifecycle', () => {
  it('renders open town labels, cleans names and sends travel once when a label is clicked', async () => {
    const { wrapper, command } = setup(); await flushFrame();
    expect(wrapper.find('canvas').exists()).toBe(false);
    const labels = wrapper.findAll('.map-city-badge');
    expect(labels.map(label => label.text())).toEqual(['大理', '江陵', '长安']);
    expect(labels.every(label => label.isVisible())).toBe(true);
    expect(wrapper.find('[data-node-id="city_closed"]').exists()).toBe(false);
    expect(wrapper.get('.map-painted-image').attributes()).toMatchObject({
      src: '/assets/default/map/world/test.webp', decoding: 'async' });
    expect(wrapper.get('.map-zoom input').attributes()).toMatchObject({ min: '1', max: '4', step: '0.05' });
    expect(debug().state().z).toBeCloseTo(1.6);
    const label = wrapper.get('[data-node-id="city_east"]');
    pointer(label.element, 'pointerdown', [900, 420]); pointer(label.element, 'pointerup', [900, 420]);
    await label.trigger('click', { detail: 1 });
    expect(command).toHaveBeenCalledExactlyOnceWith({ t: 'worldmap/travel', nodeId: 'city_east' });
    await flushFrame(); expect(wrapper.find('.map-destination').exists()).toBe(true);
  });

  it('uses natural image dimensions and keeps cached road strings unchanged by load and zoom', async () => {
    const { wrapper } = setup(); await flushFrame();
    const path = wrapper.get('.map-road-ink').attributes('d');
    expect(path).toBe('M 256 192 L 300 200 L 340 192');
    await loadImage(wrapper);
    expect(debug().state().image).toEqual({ width: 4800, height: 3600 });
    expect(debug().state().z).toBeCloseTo(1.6); expectCovered(debug().state());
    expect(wrapper.get('.map-road > path').attributes('vector-effect')).toBe('non-scaling-stroke');
    expect(wrapper.get('.map-roads > g > g').attributes('transform')).toBe('scale(9.375 9.375)');
    debug().setZoom(3); await flushFrame();
    expect(wrapper.get('.map-road-ink').attributes('d')).toBe(path);
    expect(wrapper.get('.map-painted-plane').attributes('style')).toContain('translate3d(');
    expect(wrapper.get('.map-hero img').attributes('src')).toBe('/img/hero_cutout.png');
  });

  it('keeps paper, roads and labels usable while the image is missing or has a bad aspect ratio', async () => {
    const { wrapper, command } = setup(); await flushFrame();
    expect(wrapper.get('.map-painted-image').isVisible()).toBe(false);
    await wrapper.get('.map-painted-image').trigger('error');
    expect(wrapper.get('.map-error').text()).toContain('暂不可用');
    expect(wrapper.find('.map-road-ink').exists()).toBe(true);
    await loadImage(wrapper, 4800, 3400);
    expect(wrapper.get('.map-error').text()).toContain('比例不符');
    expect(wrapper.get('.map-painted-image').isVisible()).toBe(false);
    await wrapper.get('[data-node-id="city_east"]').trigger('click');
    expect(command).toHaveBeenCalledWith({ t: 'worldmap/travel', nodeId: 'city_east' });
    await loadImage(wrapper);
    expect(wrapper.find('.map-error').exists()).toBe(false);
    expect(wrapper.get('.map-painted-image').isVisible()).toBe(true);
  });

  it('has no idle frame loop and coalesces repeated interaction into one frame', async () => {
    const { wrapper } = setup(); await flushFrame();
    requestFrame.mockClear(); const interval = vi.spyOn(window, 'setInterval');
    await vi.advanceTimersByTimeAsync(5000);
    expect(requestFrame).not.toHaveBeenCalled(); expect(frames.size).toBe(0);
    expect(vi.getTimerCount()).toBe(0); expect(interval).not.toHaveBeenCalled();
    const stage = wrapper.get('.worldmap-stage').element;
    for (let i = 0; i < 20; i++) wheel(stage, [500, 350], -3);
    expect(requestFrame).toHaveBeenCalledTimes(1); expect(frames.size).toBe(1);
    await flushFrame(); expect(frames.size).toBe(0);
    const requests = requestFrame.mock.calls.length;
    await vi.advanceTimersByTimeAsync(5000);
    expect(requestFrame).toHaveBeenCalledTimes(requests);
  });

  it('removes input listeners, ResizeObserver, travel timer, animation frame and debug handle on unmount', async () => {
    const add = vi.spyOn(HTMLElement.prototype, 'addEventListener');
    const remove = vi.spyOn(HTMLElement.prototype, 'removeEventListener');
    const interval = vi.spyOn(window, 'setInterval');
    const { wrapper, command } = setup(); await flushFrame();
    const stage = wrapper.get('.worldmap-stage').element;
    wheel(stage, [400, 300]);
    expect(frames.size).toBe(1);
    const nativeTypes = ['wheel', 'gesturestart', 'gesturechange', 'gestureend'];
    const listeners = add.mock.calls.filter(([type], index) => nativeTypes.includes(type) && add.mock.contexts[index] === stage);
    expect(listeners).toHaveLength(4);
    const handle = debug();
    expect(Object.isFrozen(handle)).toBe(true); expect(Object.isFrozen(handle.state())).toBe(true);
    wrapper.unmount();
    expect(disconnect).toHaveBeenCalled(); expect(cancelFrame).toHaveBeenCalled();
    for (const [type, callback] of listeners)
      expect(remove.mock.calls.some(call => call[0] === type && call[1] === callback)).toBe(true);
    const count = requestFrame.mock.calls.length;
    wheel(stage, [400, 300]); gesture(stage, 'gesturestart', [400, 300]);
    resizeCallback([{ target: observed, contentRect: rect() } as ResizeObserverEntry], {} as ResizeObserver);
    handle.setZoom(2); handle.focus('city_east');
    await vi.advanceTimersByTimeAsync(5000);
    expect(requestFrame).toHaveBeenCalledTimes(count);
    expect(frames.size).toBe(0); expect(vi.getTimerCount()).toBe(0);
    expect(command).not.toHaveBeenCalled(); expect(interval).not.toHaveBeenCalled();
    expect(debugWindow.__worldMapView).toBeUndefined();
  });

  it('clears an active walking timer on unmount and ignores a late image load', async () => {
    const { wrapper, command } = setup(journey()); await flushFrame();
    const image = wrapper.get('.map-painted-image').element;
    expect(vi.getTimerCount()).toBe(1);
    wrapper.unmount(); image.dispatchEvent(new Event('load'));
    await vi.advanceTimersByTimeAsync(5000);
    expect(command).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0); expect(frames.size).toBe(0);
  });

  it('binds safely when map data arrives after mounting and disconnects when it disappears', async () => {
    const { wrapper, worldmap } = setup(null); await nextTick();
    expect(wrapper.text()).toContain('尚未装载'); expect(frames.size).toBe(0);
    worldmap.value = initial; await flushFrame();
    expect(wrapper.findAll('.map-city-badge')).toHaveLength(3);
    worldmap.value = null; await nextTick();
    expect(disconnect).toHaveBeenCalled(); expect(frames.size).toBe(0);
    worldmap.value = initial; await flushFrame(); expectCovered(debug().state());
  });

  it('ignores late events from a replaced texture and accepts the new image aspect tolerance', async () => {
    const { wrapper, store } = setup(); await loadImage(wrapper);
    const oldImage = wrapper.get('.map-painted-image').element;
    store.replaceProjection({ worldmapStatic: { map, mapTextureUrl: '/new.webp' } } as UiProjection);
    await nextTick();
    oldImage.dispatchEvent(new Event('load')); oldImage.dispatchEvent(new Event('error'));
    expect(wrapper.find('.map-error').exists()).toBe(false);
    expect(wrapper.get('.map-painted-image').isVisible()).toBe(false);
    await loadImage(wrapper, 4810, 3600);
    expect(wrapper.get('.map-painted-image').isVisible()).toBe(true);
    expect(debug().state().image).toEqual({ width: 4810, height: 3600 });
    expectCovered(debug().state());
  });

  it('only recalculates labels for their inputs and builds roads only when map definitions change', async () => {
    const labels = vi.spyOn(paintedView, 'layoutLabels'); const paths = vi.spyOn(paintedView, 'roadPaths');
    const { wrapper, worldmap, store } = setup(); await flushFrame();
    expect(labels).toHaveBeenCalledTimes(1); expect(paths).toHaveBeenCalledTimes(1);
    const stage = wrapper.get('.worldmap-stage').element;
    for (let i = 0; i < 10; i++) pointer(stage, 'pointermove', [600 + i, 400]);
    worldmap.value = { ...initial, lastMessage: '旅途消息' }; await nextTick();
    expect(frames.size).toBe(0); expect(labels).toHaveBeenCalledTimes(1);
    for (let i = 0; i < 10; i++) wheel(stage, [600, 400], -5);
    await flushFrame(); expect(labels).toHaveBeenCalledTimes(2);
    debug().setZoom(debug().state().z); await flushFrame(); expect(labels).toHaveBeenCalledTimes(2);
    pointer(stage, 'pointerdown', [600, 400]); pointer(stage, 'pointermove', [500, 380]);
    pointer(stage, 'pointermove', [450, 360]); pointer(stage, 'pointerup', [450, 360]); await flushFrame();
    // A pan only moves the planes and the overlay; names keep their layout.
    expect(labels).toHaveBeenCalledTimes(2);
    await loadImage(wrapper); expect(paths).toHaveBeenCalledTimes(1);
    const heroBefore = (wrapper.get('.map-hero').element as HTMLElement).style.left;
    worldmap.value = { ...initial, point: [260, 192] }; await flushFrame();
    // The hero moves, but labels never depend on its position.
    expect((wrapper.get('.map-hero').element as HTMLElement).style.left).not.toBe(heroBefore);
    expect(labels).toHaveBeenCalledTimes(3);
    const otherEra: WorldMapRuntimeDefinition = { ...map, era: 'ch02',
      nodes: nodes.map(node => ({ ...node, open: node.id === 'city_closed' })) };
    store.replaceProjection({ worldmapStatic: { map: otherEra, mapTextureUrl: '/new.webp' } } as UiProjection);
    await flushFrame();
    expect(paths).toHaveBeenCalledTimes(2);
    expect(wrapper.findAll('.map-road-ink')).toHaveLength(0);
    expect(wrapper.findAll('.map-city-badge').map(label => label.text())).toEqual(['未开放']);
  });
});

describe('WorldMapPage map gestures and journeys', () => {
  it('zooms at the wheel pointer, clamps the slider and preserves the centre on resize', async () => {
    const { wrapper } = setup(); await flushFrame();
    const stage = wrapper.get('.worldmap-stage').element;
    const before = debug().state(); const point: Point = [440, 320];
    const anchor = screenToGrid(point, before, before.image);
    wheel(stage, point); await flushFrame();
    const after = debug().state(); const result = screenToGrid(point, after, after.image);
    expect(result[0]).toBeCloseTo(anchor[0]); expect(result[1]).toBeCloseTo(anchor[1]);
    const centre = screenToGrid([600, 400], after, after.image);
    bounds = { ...bounds, width: 390, height: 844 };
    resizeCallback([{ target: observed, contentRect: rect() } as ResizeObserverEntry], {} as ResizeObserver);
    await flushFrame();
    const resized = debug().state(); const newCentre = screenToGrid([195, 422], resized, resized.image);
    expect(newCentre[0]).toBeCloseTo(centre[0]); expect(newCentre[1]).toBeCloseTo(centre[1]);
    expectCovered(resized);
    await wrapper.get('.map-zoom input').setValue(1); await flushFrame();
    expect(debug().state().z).toBe(1); expectCovered(debug().state());
    debug().setZoom(100); await flushFrame(); expect(debug().state().z).toBe(4); expectCovered(debug().state());
  });

  it('picks and hovers the nearest open town within 28 screen pixels on the background', async () => {
    const { wrapper, command } = setup(); await flushFrame();
    const stage = wrapper.get('.worldmap-stage').element; const state = debug().state();
    const town = gridToScreen([340, 192], state, state.image); const point: Point = [town[0] + 27, town[1]];
    pointer(stage, 'pointermove', point); await nextTick();
    expect(wrapper.get('[data-node-id="city_east"]').classes()).toContain('hovered');
    pointer(stage, 'pointerdown', point); pointer(stage, 'pointerup', point); await nextTick();
    expect(command).toHaveBeenCalledExactlyOnceWith({ t: 'worldmap/travel', nodeId: 'city_east' });
    pointer(stage, 'pointerdown', [10, 10]); pointer(stage, 'pointerup', [10, 10]);
    expect(command).toHaveBeenCalledTimes(1);
    pointer(stage, 'pointerleave', [0, 0]); await nextTick();
    expect(wrapper.get('[data-node-id="city_east"]').classes()).not.toContain('hovered');
  });

  it('suppresses drag clicks, disables following, and locate restores following', async () => {
    const { wrapper, command } = setup(); await flushFrame();
    const stage = wrapper.get('.worldmap-stage').element; const before = debug().state();
    const town = gridToScreen([340, 192], before, before.image);
    pointer(stage, 'pointerdown', town); pointer(stage, 'pointermove', [town[0] - 100, town[1]]);
    pointer(stage, 'pointerup', [town[0] - 100, town[1]]); await flushFrame();
    expect(command).not.toHaveBeenCalled(); expect(debug().state().following).toBe(false);
    expect(debug().state().tx).toBe(before.tx - 100); expectCovered(debug().state());
    await wrapper.get('[data-node-id="city_east"]').trigger('click', { detail: 1 });
    expect(command).not.toHaveBeenCalled();
    await wrapper.get('.locate-btn').trigger('click'); await flushFrame();
    expect(debug().state().following).toBe(true);
    const located = debug().state(); expect(gridToScreen([256, 192], located, located.image)).toEqual([600, 400]);
  });

  it('pinches around the two-pointer midpoint without triggering travel', async () => {
    const { wrapper, command } = setup(); await flushFrame();
    const stage = wrapper.get('.worldmap-stage').element;
    pointer(stage, 'pointerdown', [400, 350], 2); pointer(stage, 'pointerdown', [600, 350], 3);
    const before = debug().state(); const anchor = screenToGrid([500, 350], before, before.image);
    pointer(stage, 'pointermove', [350, 350], 2); pointer(stage, 'pointermove', [650, 350], 3);
    await flushFrame(); const after = debug().state();
    expect(after.z).toBeCloseTo(2.4);
    const result = screenToGrid([500, 350], after, after.image);
    expect(result[0]).toBeCloseTo(anchor[0]); expect(result[1]).toBeCloseTo(anchor[1]);
    pointer(stage, 'pointerup', [350, 350], 2); pointer(stage, 'pointerup', [650, 350], 3);
    expect(command).not.toHaveBeenCalled(); expectCovered(after);
  });

  it('keeps a short press clickable and cancels drags when pointers leave or are cancelled', async () => {
    const { wrapper, command } = setup(); await flushFrame(); const stage = wrapper.get('.worldmap-stage').element;
    pointer(stage, 'pointerdown', [600, 400]); pointer(stage, 'pointermove', [605, 400]);
    pointer(stage, 'pointerup', [605, 400]); await nextTick();
    expect(command).toHaveBeenCalledExactlyOnceWith({ t: 'worldmap/travel', nodeId: 'city_home' });
    command.mockClear();
    pointer(stage, 'pointerdown', [600, 400]); pointer(stage, 'pointermove', [650, 400]);
    pointer(stage, 'pointermove', [1300, 400]); pointer(stage, 'pointerup', [600, 400]); await flushFrame();
    const stopped = debug().state(); pointer(stage, 'pointermove', [700, 400]); await flushFrame();
    expect(debug().state()).toEqual(stopped); expect(command).not.toHaveBeenCalled();
    pointer(stage, 'pointerdown', [600, 400]); pointer(stage, 'pointercancel', [600, 400]);
    pointer(stage, 'pointerup', [600, 400]); expect(command).not.toHaveBeenCalled();
  });

  it('accepts a touch label tap when pointerleave precedes the compatibility click', async () => {
    const { wrapper, command } = setup(); await flushFrame();
    const label = wrapper.get('[data-node-id="city_east"]');
    pointer(label.element, 'pointerdown', [900, 420], 2);
    pointer(label.element, 'pointerup', [900, 420], 2);
    pointer(wrapper.get('.worldmap-stage').element, 'pointerleave', [900, 420], 2);
    await label.trigger('click', { detail: 1 });
    expect(command).toHaveBeenCalledExactlyOnceWith({ t: 'worldmap/travel', nodeId: 'city_east' });
  });

  it('supports Safari gesture events with the same stationary midpoint', async () => {
    const { wrapper, command } = setup(); await flushFrame();
    const stage = wrapper.get('.worldmap-stage').element; const before = debug().state();
    const anchor = screenToGrid([500, 350], before, before.image);
    expect(gesture(stage, 'gesturestart', [500, 350]).defaultPrevented).toBe(true);
    gesture(stage, 'gesturechange', [500, 350], 1.5); gesture(stage, 'gestureend', [500, 350]);
    await flushFrame(); const after = debug().state();
    expect(after.z).toBeCloseTo(2.4); const result = screenToGrid([500, 350], after, after.image);
    expect(result[0]).toBeCloseTo(anchor[0]); expect(result[1]).toBeCloseTo(anchor[1]);
    expect(command).not.toHaveBeenCalled();
  });

  it('follows a new journey outside the central 60%, finishes easing, and honours reduced motion', async () => {
    const { wrapper, worldmap, settings } = setup(); await flushFrame();
    const startTime = window.performance.now(); const before = debug().state();
    worldmap.value = journey(); await nextTick();
    await flushFrame(startTime + 100); expect(debug().state().tx).toBeLessThan(before.tx);
    await flushFrame(startTime + 250); expect(frames.size).toBe(0); expectCovered(debug().state());
    const stage = wrapper.get('.worldmap-stage').element;
    pointer(stage, 'pointerdown', [600, 400]); pointer(stage, 'pointermove', [700, 400]);
    pointer(stage, 'pointerup', [700, 400]); await flushFrame();
    const dragged = debug().state(); worldmap.value = journey([100, 192]); await flushFrame();
    expect(debug().state().tx).toBe(dragged.tx); expect(debug().state().following).toBe(false);
    settings.value = { reducedMotion: true }; worldmap.value = journey([90, 192], 2); await flushFrame();
    expect(debug().state().following).toBe(true); expect(frames.size).toBe(0);
    expect(wrapper.classes()).toContain('reduced-motion');
    expect(wrapper.get('.map-hero').classes()).toContain('facing-left');
    expect(wrapper.get('.map-hero').classes()).toContain('walking');
    expectCovered(debug().state());
  });

  it('retains travel step, fast travel, pause/resume, enter and scene events', async () => {
    const { wrapper, worldmap, command, busy } = setup(); await flushFrame();
    const action = (text: string) => wrapper.findAll('.map-actions button').find(button => button.text() === text)!;
    await action('进入此地').trigger('click'); expect(command).toHaveBeenLastCalledWith({ t: 'worldmap/enter' });
    worldmap.value = journey([270, 192]); await flushFrame();
    await action('停步').trigger('click'); expect(command).toHaveBeenLastCalledWith({ t: 'worldmap/cancel' });
    busy.value = true; await vi.advanceTimersByTimeAsync(45);
    expect(command).not.toHaveBeenCalledWith(expect.objectContaining({ t: 'worldmap/step' }));
    busy.value = false; await action('疾行').trigger('click');
    await vi.advanceTimersByTimeAsync(12);
    expect(command).toHaveBeenLastCalledWith({ t: 'worldmap/step', journeyId: 1, expectedTravelledLi: 0 });
    worldmap.value = { ...journey(), journey: { ...journey().journey!, status: 'paused' } }; await nextTick();
    await action('继续').trigger('click'); expect(command).toHaveBeenLastCalledWith({ t: 'worldmap/resume' });
    expect(vi.getTimerCount()).toBe(0);
    worldmap.value = { ...initial, scene: { ...nodes[0]!.entry, kind: 'town', nodeId: 'city_home',
      name: '大理', chapterId: 'ch01_tianlong', era: 'ch01', returnNodeId: 'city_home' } }; await nextTick();
    expect(wrapper.emitted('scene')).toEqual([['town']]);
  });
});

describe('WorldMapPage terrain paths, tiered markers and landmarks (tech/13 §5)', () => {
  const pathMap: WorldMapRuntimeDefinition = { ...map,
    nodes: map.nodes.map((row) => row.id === 'city_east'
      ? { ...row, tier: 'capital' as const, marker: 'city_large' as const }
      : { ...row, tier: 'major' as const, marker: 'city_prefecture' as const }),
    roads: [{ ...map.roads[0]!, path: [[256, 192], [256, 232], [340, 232], [340, 192]] }] };
  function setupPath(state: WorldMapProjection) {
    const pinia = createPinia();
    useUiStore(pinia).replaceProjection({ worldmapStatic: { map: pathMap,
      mapTextureUrl: 'assets/default/map/world/test.webp' } } as UiProjection);
    const controller = { worldmap: shallowRef<WorldMapProjection | null>(state),
      settings: shallowRef({ reducedMotion: true }), busy: shallowRef(false),
      worldMapCommand: vi.fn().mockResolvedValue(undefined) } as unknown as GameController;
    const wrapper = mount(WorldMapPage, { attachTo: document.body, props: { controller },
      global: { plugins: [pinia] } });
    wrappers.push(wrapper);
    return wrapper;
  }

  it('draws the terrain path as curves and shows the hero along the current leg by arc length', async () => {
    const walking: WorldMapProjection = { ...initial, point: [298, 192], positionNodeId: null,
      journey: { id: 3, destination: 'city_east', legs: [{ roadKey: 'east', from: 'city_home', to: 'city_east' }],
        legIndex: 0, offsetLi: 10, travelledLi: 10, totalLi: 20, status: 'walking' } };
    const wrapper = setupPath(walking);
    await loadImage(wrapper);
    expect(wrapper.get('.map-road-ink').attributes('d')).toContain(' C ');
    const state = debug().state();
    const [x, y] = gridToScreen([298, 232], { ...state, tx: 0, ty: 0 }, state.image);
    const hero = wrapper.get('.map-hero').element as HTMLElement;
    expect(Number.parseFloat(hero.style.left)).toBeCloseTo(x, 6);
    expect(Number.parseFloat(hero.style.top)).toBeCloseTo(y, 6);
  });

  it('walks the path backwards when the leg runs from the road end to its start', async () => {
    const back: WorldMapProjection = { ...initial, point: [298, 192], positionNodeId: null,
      journey: { id: 4, destination: 'city_home', legs: [{ roadKey: 'east', from: 'city_east', to: 'city_home' }],
        legIndex: 0, offsetLi: 5, travelledLi: 5, totalLi: 20, status: 'walking' } };
    const wrapper = setupPath(back);
    await loadImage(wrapper);
    const state = debug().state();
    // Reversed path is 164 units long; a quarter (41) runs down 40 then 1 unit west along y = 232.
    const [x, y] = gridToScreen([339, 232], { ...state, tx: 0, ty: 0 }, state.image);
    const hero = wrapper.get('.map-hero').element as HTMLElement;
    expect(Number.parseFloat(hero.style.left)).toBeCloseTo(x, 6);
    expect(Number.parseFloat(hero.style.top)).toBeCloseTo(y, 6);
  });

  it('paints landmarks and tiered atlas art into the town plane at the base image density', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => ({ ok: true, json: async () => url.endsWith('atlas.json')
      ? { image: 'atlas.webp', width: 256, height: 128, markers: {
        city_large: { x: 0, y: 0, w: 128, h: 128, anchor: [64, 64] },
        city_prefecture: { x: 128, y: 0, w: 128, h: 128, anchor: [64, 70] } } }
      : [{ id: 'map_landmark_city_west__song', node: 'city_west', chapters: ['ch01'],
        url: '/assets/default/map/landmark/west.webp', anchor: [50, 60], footprintGrid: 8, width: 100, height: 80 }] })));
    const wrapper = setupPath(initial);
    await loadImage(wrapper);
    await vi.waitFor(() => expect(wrapper.find('.map-landmark').exists()).toBe(true));
    await flushFrame();
    const landmark = wrapper.get('.map-town-plane .map-landmark').element as HTMLElement;
    expect(landmark.getAttribute('data-landmark-node')).toBe('city_west');
    // 8 grid units at 4800 / 512 image px per unit; whole image pixels with the anchor on the node.
    expect(landmark.style.width).toBe('75px'); expect(landmark.style.height).toBe('60px');
    expect(landmark.style.left).toBe(Math.round(160 * 9.375 - 50 * 0.75) + 'px');
    expect(landmark.style.top).toBe(Math.round(192 * 9.375 - 60 * 0.75) + 'px');
    expect(wrapper.find('[data-town-node="city_west"]').exists()).toBe(false);
    const art = (id: string) => wrapper.get(`[data-town-node="${id}"]`).element as HTMLElement;
    expect(art('city_east').classList.contains('atlas')).toBe(true);
    expect(art('city_east').style.backgroundImage).toContain('/assets/default/map/markers/atlas.webp');
    // Edge = tier size in grid units at the image density, rounded to whole pixels.
    expect(art('city_east').style.width).toBe(Math.round(paintedView.TOWN_SIZE.capital * 9.375) + 'px');
    expect(art('city_home').style.width).toBe(Math.round(paintedView.TOWN_SIZE.major * 9.375) + 'px');
    // The town plane shares the base image's transform; names ride the translate-only overlay.
    const plane = (wrapper.get('.map-painted-plane').element as HTMLElement).style.transform;
    expect((wrapper.get('.map-town-plane').element as HTMLElement).style.transform).toBe(plane);
    const state = debug().state();
    expect((wrapper.get('.map-overlay').element as HTMLElement).style.transform)
      .toBe(`translate3d(${state.tx}px, ${state.ty}px, 0)`);
    const badge = (id: string) => wrapper.get(`[data-node-id="${id}"]`);
    expect(badge('city_east').get('.city-name').attributes('style')).toContain('font-size: 17px');
    // The capital's hit area covers its painted art at the current scale.
    const hit = badge('city_east').get('.city-hit').element as HTMLElement;
    expect(Number.parseFloat(hit.style.width)).toBeCloseTo(Number.parseFloat(art('city_east').style.width) * state.s, 6);
  });
});

describe('WorldMapPage sect seats (tech/13 §5.4)', () => {
  it('draws open seats with names, keeps hidden ones quiet and travels through the anchor city', async () => {
    const sectMap: WorldMapRuntimeDefinition = { ...map, sects: [
      { id: 'sect_east', name: '东岳派（待考）', siteName: '东岳山门', kind: 'headquarters', point: [345, 186],
        status: 'O', marker: 'sect', cityId: 'city_east' },
      { id: 'sect_hidden', name: '隐门', siteName: '', kind: 'hidden_valley', point: [150, 200],
        status: 'H', marker: 'temple', cityId: null },
      { id: 'sect_gone', name: '旧派', siteName: '', kind: 'headquarters', point: [200, 200],
        status: 'M', marker: 'sect', cityId: null }] };
    const pinia = createPinia();
    useUiStore(pinia).replaceProjection({ worldmapStatic: { map: sectMap,
      mapTextureUrl: 'assets/default/map/world/test.webp' } } as UiProjection);
    const command = vi.fn().mockResolvedValue(undefined);
    const controller = { worldmap: shallowRef<WorldMapProjection | null>(initial),
      settings: shallowRef({ reducedMotion: true }), busy: shallowRef(false),
      worldMapCommand: command } as unknown as GameController;
    const wrapper = mount(WorldMapPage, { attachTo: document.body, props: { controller }, global: { plugins: [pinia] } });
    wrappers.push(wrapper);
    await loadImage(wrapper);
    const open = wrapper.get('[data-node-id="sect_east"]');
    expect(open.classes()).toContain('sect');
    expect(open.get('.city-name').text()).toBe('东岳派');
    expect(wrapper.get('[data-node-id="sect_hidden"]').classes()).toEqual(expect.arrayContaining(['quiet', 'no-label']));
    expect(wrapper.find('[data-node-id="sect_gone"]').exists()).toBe(false);
    await open.trigger('click');
    await flushFrame();
    expect(command).not.toHaveBeenCalled();
    expect(wrapper.get('.worldmap-panel').text()).toContain('门派驻地 · 东岳山门');
    const go = wrapper.findAll('.map-actions button').find(button => button.text() === '前往江陵')!;
    await go.trigger('click');
    expect(command).toHaveBeenCalledWith({ t: 'worldmap/travel', nodeId: 'city_east' });
  });
});

describe('WorldMapPage overlay validation and selection exclusivity', () => {
  it('drops a malformed atlas entirely and filters bad landmark rows', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => ({ ok: true, json: async () => url.endsWith('atlas.json')
      ? { image: 'atlas.webp', width: 256, height: 128, markers: {
        city_large: { x: 0, y: 0, w: 128, h: 128, anchor: [64, 64] },
        city_prefecture: { x: 200, y: 0, w: 128, h: 128, anchor: [64] } } }
      : [{ id: 'bad', node: 'city_west', chapters: ['ch01'], url: '/assets/x.webp', anchor: [1, 2],
        footprintGrid: Number.NaN, width: 10, height: 10 },
      { id: 'outside', node: 'city_home', chapters: ['ch01'], url: '/assets/z.webp', anchor: [5, 11],
        footprintGrid: 8, width: 10, height: 10 },
      { id: 'good', node: 'city_east', chapters: ['ch01'], url: '/assets/y.webp', anchor: [5, 5],
        footprintGrid: 8, width: 10, height: 10 }] })));
    const { wrapper } = setup();
    await loadImage(wrapper);
    await vi.waitFor(() => expect(wrapper.findAll('.map-landmark')).toHaveLength(1));
    await flushFrame();
    expect(wrapper.get('.map-landmark').attributes('data-landmark-node')).toBe('city_east');
    for (const icon of wrapper.findAll('.map-town')) expect(icon.classes()).not.toContain('atlas');
  });

  it('clears the town selection and hover when a sect is chosen', async () => {
    const sectMap: WorldMapRuntimeDefinition = { ...map, sects: [{ id: 'sect_west', name: '西岳派', siteName: '',
      kind: 'headquarters', point: [170, 190], status: 'O', marker: 'sect', cityId: 'city_west' }] };
    const pinia = createPinia();
    useUiStore(pinia).replaceProjection({ worldmapStatic: { map: sectMap,
      mapTextureUrl: 'assets/default/map/world/test.webp' } } as UiProjection);
    const controller = { worldmap: shallowRef<WorldMapProjection | null>(initial),
      settings: shallowRef({ reducedMotion: true }), busy: shallowRef(false),
      worldMapCommand: vi.fn().mockResolvedValue(undefined) } as unknown as GameController;
    const wrapper = mount(WorldMapPage, { attachTo: document.body, props: { controller }, global: { plugins: [pinia] } });
    wrappers.push(wrapper);
    await loadImage(wrapper);
    await wrapper.get('[data-node-id="city_east"]').trigger('click'); await flushFrame();
    expect(wrapper.get('[data-node-id="city_east"]').classes()).toContain('selected');
    await wrapper.get('[data-node-id="sect_west"]').trigger('pointerenter');
    await wrapper.get('[data-node-id="sect_west"]').trigger('click'); await flushFrame();
    expect(wrapper.get('[data-node-id="city_east"]').classes()).not.toContain('selected');
    expect(wrapper.get('[data-node-id="sect_west"]').classes()).toContain('selected');
    expect(wrapper.findAll('.map-city-badge.hovered').map(badge => badge.attributes('data-node-id'))).toEqual(['sect_west']);
  });
});

describe('WorldMapPage atlas anchor bounds', () => {
  it('drops an atlas whose anchor leaves its cell', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => ({ ok: true, json: async () => url.endsWith('atlas.json')
      ? { image: 'atlas.webp', width: 128, height: 128, markers: {
        city_prefecture: { x: 0, y: 0, w: 128, h: 128, anchor: [64, 129] } } } : [] })));
    const { wrapper } = setup();
    await loadImage(wrapper); await flushFrame(); await flushFrame();
    for (const icon of wrapper.findAll('.map-town')) expect(icon.classes()).not.toContain('atlas');
  });
});

describe('WorldMapPage painted towns: one commit point and art fallbacks (tech/13 §5.5)', () => {
  const overlayFetch = () => vi.fn(async (url: string) => ({ ok: true, json: async () => url.endsWith('atlas.json')
    ? { image: 'atlas.webp', width: 256, height: 128, markers: {
      city_county: { x: 0, y: 0, w: 128, h: 128, anchor: [64, 64] },
      city_prefecture: { x: 128, y: 0, w: 128, h: 128, anchor: [64, 70] } } }
    : [{ id: 'map_landmark_city_west__song', node: 'city_west', chapters: ['ch01'],
      url: '/assets/default/map/landmark/west.webp', anchor: [50, 60], footprintGrid: 8, width: 100, height: 80 }] }));
  function transforms(wrapper: ReturnType<typeof mount>) {
    const style = (selector: string) => (wrapper.get(selector).element as HTMLElement).style.transform;
    return { plane: style('.map-painted-plane'), towns: style('.map-town-plane'), overlay: style('.map-overlay'),
      roads: wrapper.get('.map-roads > g').attributes('transform') };
  }
  function expectOneCommit(wrapper: ReturnType<typeof mount>): void {
    const { s, tx, ty } = debug().state(); const now = transforms(wrapper);
    expect(now.plane).toBe(`translate3d(${tx}px, ${ty}px, 0) scale(${s})`);
    expect(now.towns).toBe(now.plane);
    expect(now.overlay).toBe(`translate3d(${tx}px, ${ty}px, 0)`);
    expect(now.roads).toBe(`translate(${tx} ${ty}) scale(${s})`);
  }

  it('moves the base image, roads, painted towns and overlay together while dragging and following', async () => {
    const { wrapper, worldmap } = setup(); await loadImage(wrapper); expectOneCommit(wrapper);
    const stage = wrapper.get('.worldmap-stage').element;
    pointer(stage, 'pointerdown', [600, 400]); pointer(stage, 'pointermove', [520, 380]); await flushFrame();
    expectOneCommit(wrapper);
    pointer(stage, 'pointermove', [480, 330]); pointer(stage, 'pointerup', [480, 330]); await flushFrame();
    expectOneCommit(wrapper);
    await wrapper.get('.locate-btn').trigger('click'); await flushFrame();
    const start = window.performance.now(); worldmap.value = journey(); await nextTick();
    // Mid-way through the 200ms follow easing every layer still carries the same view.
    await flushFrame(start + 80); expectOneCommit(wrapper);
    await flushFrame(start + 260); expectOneCommit(wrapper);
  });

  it('paints resampled art, ignores a stale batch and falls back when a vignette fails to load', async () => {
    vi.stubGlobal('fetch', overlayFetch());
    sprites.can = true;
    const resolvers: Array<(batch: Batch) => void> = []; const asked: SpriteJobLike[][] = [];
    sprites.batch = (jobs) => { asked.push([...jobs]); return new Promise(resolve => { resolvers.push(resolve); }); };
    const { wrapper } = setup();
    await loadImage(wrapper);
    await vi.waitFor(() => expect(asked.length).toBeGreaterThan(0));
    // A newer batch (another base image size) starts before the first one answers.
    await loadImage(wrapper, 4096, 3072);
    await vi.waitFor(() => expect(asked.length).toBe(2));
    const atlasUrl = '/assets/default/map/markers/atlas.webp';
    const vignette = '/assets/default/map/landmark/west.webp';
    resolvers[1]!({ made: new Map(asked[1]!.filter(job => job.url === atlasUrl).map(job => [job.key, 'data:image/png;new'])),
      failed: new Set([vignette]) });
    await vi.waitFor(() => expect(wrapper.find('.map-landmark').exists()).toBe(false));
    // The stale batch's failure must not drop the atlas.
    resolvers[0]!({ made: new Map(), failed: new Set([atlasUrl]) }); await flushFrame();
    const art = (id: string) => wrapper.get(`[data-town-node="${id}"]`).element as HTMLElement;
    expect(art('city_east').style.backgroundImage).toContain('data:image/png;new');
    expect(art('city_east').classList.contains('atlas')).toBe(true);
    // The failed vignette's node is painted with its town art instead of leaving a blank.
    await vi.waitFor(() => expect(wrapper.find('[data-town-node="city_west"]').exists()).toBe(true));
  });

  it('drops a landmark whose image errors and an atlas whose image never loads', async () => {
    vi.stubGlobal('fetch', overlayFetch());
    let failAtlas: (value: unknown) => void = () => {};
    sprites.load = () => new Promise(resolve => { failAtlas = resolve; });
    const { wrapper } = setup(); await loadImage(wrapper);
    await vi.waitFor(() => expect(wrapper.find('.map-landmark').exists()).toBe(true));
    await flushFrame();
    expect(wrapper.find('[data-town-node="city_west"]').exists()).toBe(false);
    await wrapper.get('.map-landmark').trigger('error'); await flushFrame();
    expect(wrapper.find('.map-landmark').exists()).toBe(false);
    expect(wrapper.find('[data-town-node="city_west"]').exists()).toBe(true);
    expect(wrapper.get('[data-town-node="city_east"]').classes()).toContain('atlas');
    failAtlas(null); await flushFrame(); await flushFrame();
    for (const icon of wrapper.findAll('.map-town')) expect(icon.classes()).not.toContain('atlas');
  });

  it('retries failed art after a new chapter or base image instead of remembering the failure', async () => {
    vi.stubGlobal('fetch', overlayFetch());
    let answer: unknown = null;
    sprites.load = () => Promise.resolve(answer);
    const { wrapper, store } = setup(); await loadImage(wrapper);
    await vi.waitFor(() => expect(wrapper.find('.map-landmark').exists()).toBe(true));
    await flushFrame();
    // The atlas probe failed and the vignette errored: legacy icons and town art for the vignette's node.
    await vi.waitFor(() => expect(wrapper.get('[data-town-node="city_east"]').classes()).not.toContain('atlas'));
    await wrapper.get('.map-landmark').trigger('error'); await flushFrame();
    expect(wrapper.find('.map-landmark').exists()).toBe(false);
    // A new base image: both files are tried again and now load.
    answer = { naturalWidth: 1, naturalHeight: 1 };
    store.replaceProjection({ worldmapStatic: { map, mapTextureUrl: '/retry.webp' } } as UiProjection);
    await nextTick(); await loadImage(wrapper);
    await vi.waitFor(() => expect(wrapper.get('[data-town-node="city_east"]').classes()).toContain('atlas'));
    expect(wrapper.find('.map-landmark').exists()).toBe(true);
    // The same holds for a new chapter definition.
    answer = null;
    await wrapper.get('.map-landmark').trigger('error'); await flushFrame();
    expect(wrapper.find('.map-landmark').exists()).toBe(false);
    answer = { naturalWidth: 1, naturalHeight: 1 };
    store.replaceProjection({ worldmapStatic: { map: { ...map, revision: 'b'.repeat(64) }, mapTextureUrl: '/retry.webp' } } as UiProjection);
    await flushFrame();
    await vi.waitFor(() => expect(wrapper.find('.map-landmark').exists()).toBe(true));
  });

  it('retires a running batch as soon as the base image changes, before the next batch starts', async () => {
    vi.stubGlobal('fetch', overlayFetch());
    sprites.can = true;
    const resolvers: Array<(batch: Batch) => void> = [];
    sprites.batch = () => new Promise(resolve => { resolvers.push(resolve); });
    const { wrapper, store } = setup(); await loadImage(wrapper);
    await vi.waitFor(() => expect(resolvers.length).toBe(1));
    // The texture switches; the new image has not loaded, so no new batch is running yet.
    store.replaceProjection({ worldmapStatic: { map, mapTextureUrl: '/next.webp' } } as UiProjection);
    await nextTick();
    resolvers[0]!({ made: new Map(), failed: new Set(['/assets/default/map/markers/atlas.webp']) });
    await flushFrame(); await flushFrame();
    expect(resolvers).toHaveLength(1);
    expect(wrapper.get('[data-town-node="city_east"]').classes()).toContain('atlas');
  });

  it('keeps town art on vignette nodes until a good base image is loaded', async () => {
    vi.stubGlobal('fetch', overlayFetch());
    const { wrapper } = setup(); await flushFrame(); await flushFrame();
    // No base image yet: the vignette's node is painted with its town art.
    expect(wrapper.find('.map-landmark').exists()).toBe(false);
    expect(wrapper.find('[data-town-node="city_west"]').exists()).toBe(true);
    await loadImage(wrapper);
    await vi.waitFor(() => expect(wrapper.find('.map-landmark').exists()).toBe(true));
    expect(wrapper.find('[data-town-node="city_west"]').exists()).toBe(false);
    await loadImage(wrapper, 4800, 3400); // wrong aspect ratio: the paper fallback, so town art again
    expect(wrapper.find('.map-landmark').exists()).toBe(false);
    expect(wrapper.find('[data-town-node="city_west"]').exists()).toBe(true);
    await wrapper.get('.map-painted-image').trigger('error'); await flushFrame();
    expect(wrapper.find('[data-town-node="city_west"]').exists()).toBe(true);
  });

  it('drops resampled art the new chapter no longer shows, even when it needs nothing new', async () => {
    vi.stubGlobal('fetch', overlayFetch());
    sprites.can = true;
    sprites.batch = async (jobs) => ({ made: new Map(jobs.map(job => [job.key, 'data:image/png;' + job.key])), failed: new Set() });
    const tiered: WorldMapRuntimeDefinition = { ...map, nodes: map.nodes.map((row) => row.id === 'city_east'
      ? { ...row, tier: 'capital' as const, marker: 'city_prefecture' as const }
      : { ...row, tier: 'minor' as const, marker: 'city_county' as const }) };
    const { wrapper, store } = setup();
    store.replaceProjection({ worldmapStatic: { map: tiered, mapTextureUrl: 'assets/default/map/world/test.webp' } } as UiProjection);
    await loadImage(wrapper);
    // city_west has a vignette; the capital and the county are two more sprites.
    await vi.waitFor(() => expect(debug().state().sprites).toBe(3));
    const smaller: WorldMapRuntimeDefinition = { ...tiered, revision: 'c'.repeat(64),
      nodes: tiered.nodes.map(row => ({ ...row, open: row.id === 'city_home' })) };
    store.replaceProjection({ worldmapStatic: { map: smaller, mapTextureUrl: 'assets/default/map/world/test.webp' } } as UiProjection);
    await flushFrame();
    await vi.waitFor(() => expect(debug().state().sprites).toBe(1));
    expect(wrapper.get('[data-town-node="city_home"]').element.getAttribute('style')).toContain('data:image/png;');
  });
});

describe('WorldMapPage click areas follow the painted stacking', () => {
  it('stacks overlapping click areas south over north like the art, not by label priority', async () => {
    // A minor town just north of a major one: the major town's art is painted on top, so it must win the click.
    const dense: WorldMapRuntimeDefinition = { ...map, nodes: [
      { ...node('city_north', '常州', [300, 230]), tier: 'minor' as const, marker: 'city_county' as const },
      { ...node('city_south', '无锡', [302, 232]), tier: 'major' as const, marker: 'city_prefecture' as const },
      { ...node('city_home', '大理', [256, 192]), tier: 'major' as const, marker: 'city_prefecture' as const }] };
    const { wrapper, store } = setup();
    store.replaceProjection({ worldmapStatic: { map: dense, mapTextureUrl: 'assets/default/map/world/test.webp' } } as UiProjection);
    await loadImage(wrapper);
    const order = wrapper.findAll('.map-town').map(art => art.attributes('data-town-node'));
    expect(order.indexOf('city_south')).toBeGreaterThan(order.indexOf('city_north'));
    const z = (id: string) => Number((wrapper.get(`[data-node-id="${id}"] .city-hit`).element as HTMLElement).style.zIndex);
    expect(z('city_south')).toBeGreaterThan(z('city_north'));
    // Label priority still puts the major town's name first.
    const badges = wrapper.findAll('.map-city-badge').map(badge => badge.attributes('data-node-id'));
    expect(badges.indexOf('city_south')).toBeLessThan(badges.indexOf('city_north'));
  });

  it('drops cached sprites when the new base image never becomes usable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ image: 'atlas.webp', width: 128, height: 128,
      markers: { city_county: { x: 0, y: 0, w: 128, h: 128, anchor: [64, 64] } } }) }));
    sprites.can = true;
    sprites.batch = async (jobs) => ({ made: new Map(jobs.map(job => [job.key, 'data:image/png;' + job.key])), failed: new Set() });
    const { wrapper, store } = setup(); await loadImage(wrapper);
    await vi.waitFor(() => expect(debug().state().sprites).toBeGreaterThan(0));
    store.replaceProjection({ worldmapStatic: { map, mapTextureUrl: '/broken.webp' } } as UiProjection);
    await nextTick(); await wrapper.get('.map-painted-image').trigger('error'); await flushFrame();
    await vi.waitFor(() => expect(debug().state().sprites).toBe(0));
  });
});

describe('WorldMapPage chapter change clears sect focus', () => {
  it('does not carry a selected or hovered seat into the next chapter, even with the same seat id', async () => {
    const seat = { id: 'sect_east', name: '东岳派', siteName: '东岳山门', kind: 'headquarters', point: [345, 186] as [number, number],
      status: 'O' as const, marker: 'sect' as const, cityId: 'city_east' };
    const pinia = createPinia(); const store = useUiStore(pinia);
    store.replaceProjection({ worldmapStatic: { map: { ...map, sects: [seat] },
      mapTextureUrl: 'assets/default/map/world/test.webp' } } as UiProjection);
    const controller = { worldmap: shallowRef<WorldMapProjection | null>(initial),
      settings: shallowRef({ reducedMotion: true }), busy: shallowRef(false),
      worldMapCommand: vi.fn().mockResolvedValue(undefined) } as unknown as GameController;
    const wrapper = mount(WorldMapPage, { attachTo: document.body, props: { controller }, global: { plugins: [pinia] } });
    wrappers.push(wrapper);
    await loadImage(wrapper);
    await wrapper.get('[data-node-id="sect_east"]').trigger('pointerenter');
    await wrapper.get('[data-node-id="sect_east"]').trigger('click'); await flushFrame();
    expect(wrapper.get('[data-node-id="sect_east"]').classes()).toEqual(expect.arrayContaining(['selected', 'hovered']));
    store.replaceProjection({ worldmapStatic: { map: { ...map, revision: 'd'.repeat(64), sects: [seat] },
      mapTextureUrl: 'assets/default/map/world/test.webp' } } as UiProjection);
    await flushFrame();
    const badge = wrapper.get('[data-node-id="sect_east"]');
    expect(badge.classes()).not.toContain('selected'); expect(badge.classes()).not.toContain('hovered');
    expect(wrapper.get('.worldmap-panel').text()).not.toContain('门派驻地');
  });
});
