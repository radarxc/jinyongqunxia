import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { minimapToWorld } from '../../explore/minimap-math';
import type { MinimapMarker } from '../../explore/minimap-painter';
import TxMinimap from './TxMinimap.vue';
import { TX_MINIMAP_STRINGS } from './TxMinimap.strings';

const marker: MinimapMarker = { id: 'inn', kind: 'facility', x: 44, z: 0, icon: '客', label: '客栈',
  target: { kind: 'building', buildingId: 'bi_inn' } };
const base = { bitmap: document.createElement('canvas'), minX: -100, minZ: -100, metresPerPx: 1 };
function props(overrides: Record<string, unknown> = {}) {
  return { base, player: { x: 0, z: 0, headingRad: 0 }, basis: null, viewQuad: null,
    markers: [marker] as readonly MinimapMarker[], path: null, destination: null, northUp: true,
    expanded: false, sizePx: 200, ...overrides };
}
function setCanvasRect(canvas: HTMLCanvasElement): void {
  canvas.getBoundingClientRect = () => {
    const size = Number(canvas.getAttribute('width'));
    return { x: 0, y: 0, left: 0, top: 0, width: size, height: size, right: size, bottom: size,
      toJSON: () => undefined };
  };
}
function pointer(canvas: HTMLCanvasElement, type: string, x: number, y: number, pointerType = 'mouse'): void {
  canvas.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: x, clientY: y, pointerType }));
}
function recordingContext() {
  return { fillStyle: '', strokeStyle: '', lineWidth: 1, globalAlpha: 1, font: '',
    textAlign: 'start', textBaseline: 'alphabetic', beginPath: vi.fn(), moveTo: vi.fn(),
    lineTo: vi.fn(), arc: vi.fn(), fill: vi.fn(), stroke: vi.fn(), drawImage: vi.fn(),
    setTransform: vi.fn(), save: vi.fn(), restore: vi.fn(), fillText: vi.fn(), clearRect: vi.fn() };
}
afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); document.body.innerHTML = ''; });

describe('TxMinimap travel interaction', () => {
  it('emits the same empty-ground world point as minimapToWorld', () => {
    const wrapper = mount(TxMinimap, { props: props() });
    const canvas = wrapper.get('canvas.map-interactive').element as HTMLCanvasElement; setCanvasRect(canvas);
    pointer(canvas, 'pointerup', 170, 150);
    const expected = new Float32Array(2);
    minimapToWorld(170, 150, { centerX: 0, centerZ: 0, metresPerPx: 1, sizePx: 200,
      northUp: true, basis: null }, expected);
    expect(wrapper.emitted('travel')).toEqual([[{ kind: 'point', x: expected[0], z: expected[1] }]]);
  });

  it('emits marker.target when the marker is hit', () => {
    const wrapper = mount(TxMinimap, { props: props() });
    const canvas = wrapper.get('canvas.map-interactive').element as HTMLCanvasElement; setCanvasRect(canvas);
    pointer(canvas, 'pointerup', 144, 100);
    expect(wrapper.emitted('travel')).toEqual([[marker.target]]);
  });

  it('uses a 60px touch radius beyond the 44px mouse radius', () => {
    const touchMarker = { ...marker, x: 55 };
    const mouse = mount(TxMinimap, { props: props({ markers: [touchMarker] }) });
    const mouseCanvas = mouse.get('canvas.map-interactive').element as HTMLCanvasElement; setCanvasRect(mouseCanvas);
    pointer(mouseCanvas, 'pointerup', 100, 100, 'mouse');
    expect((mouse.emitted('travel')![0]![0] as { kind: string }).kind).toBe('point');
    const touch = mount(TxMinimap, { props: props({ markers: [touchMarker] }) });
    const touchCanvas = touch.get('canvas.map-interactive').element as HTMLCanvasElement; setCanvasRect(touchCanvas);
    pointer(touchCanvas, 'pointerup', 100, 100, 'touch');
    expect(touch.emitted('travel')).toEqual([[touchMarker.target]]);
  });

  it('keeps dwell timing across same-marker movement and restarts on marker change', () => {
    vi.useFakeTimers();
    const otherMarker: MinimapMarker = { ...marker, id: 'gate', x: -44, label: '城门',
      target: { kind: 'anchor', anchorId: 'an_gate' } };
    const wrapper = mount(TxMinimap, { props: props({ markers: [marker, otherMarker] }) });
    const canvas = wrapper.get('canvas.map-interactive').element as HTMLCanvasElement; setCanvasRect(canvas);
    pointer(canvas, 'pointermove', 144, 100); vi.advanceTimersByTime(299);
    expect(wrapper.emitted('dwell')).toBeUndefined();
    pointer(canvas, 'pointermove', 144, 100);
    vi.advanceTimersByTime(1); expect(wrapper.emitted('dwell')).toEqual([[marker.target]]);
    expect(wrapper.emitted('hover')).toEqual([[marker.target]]);
    pointer(canvas, 'pointermove', 56, 100); vi.advanceTimersByTime(299);
    expect(wrapper.emitted('dwell')).toEqual([[marker.target]]);
    vi.advanceTimersByTime(1);
    expect(wrapper.emitted('dwell')).toEqual([[marker.target], [otherMarker.target]]);
    expect(wrapper.emitted('hover')).toEqual([[marker.target], [otherMarker.target]]);
    pointer(canvas, 'pointerleave', 0, 0);
    expect(wrapper.emitted('hover')).toEqual([[marker.target], [otherMarker.target], [null]]);
  });
});

describe('TxMinimap presentation and accessibility', () => {
  it('does not redraw either canvas when hover only changes the tooltip', async () => {
    const baseContext = recordingContext(); const overlayContext = recordingContext();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
      return (this.classList.contains('map-interactive') ? overlayContext : baseContext) as never;
    });
    const wrapper = mount(TxMinimap, { props: props() });
    const canvas = wrapper.get('canvas.map-interactive').element as HTMLCanvasElement; setCanvasRect(canvas);
    const baseClears = baseContext.clearRect.mock.calls.length;
    const overlayClears = overlayContext.clearRect.mock.calls.length;
    pointer(canvas, 'pointermove', 144, 100); await nextTick();
    expect(wrapper.get('.marker-tooltip').text()).toContain(marker.label);
    expect(baseContext.clearRect).toHaveBeenCalledTimes(baseClears);
    expect(overlayContext.clearRect).toHaveBeenCalledTimes(overlayClears);
  });

  it('redraws both canvases and compass after in-place basis mutation', async () => {
    const callbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      callbacks.push(callback); return callbacks.length;
    });
    const baseContext = recordingContext(); const overlayContext = recordingContext();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
      return (this.classList.contains('map-interactive') ? overlayContext : baseContext) as never;
    });
    const basis = new Float32Array([1, 0, 0, -1]);
    const wrapper = mount(TxMinimap, { props: props({ northUp: false, basis }) });
    const beforeCompass = wrapper.get('.compass').attributes('style');
    const baseClears = baseContext.clearRect.mock.calls.length;
    const overlayClears = overlayContext.clearRect.mock.calls.length;
    basis.set([0, 1, 1, 0]); callbacks.shift()!(0); await nextTick();
    expect(baseContext.clearRect).toHaveBeenCalledTimes(baseClears + 1);
    expect(overlayContext.clearRect).toHaveBeenCalledTimes(overlayClears + 1);
    expect(wrapper.get('.compass').attributes('style')).not.toBe(beforeCompass);
  });

  it('redraws only the overlay after in-place viewQuad mutation', async () => {
    const callbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      callbacks.push(callback); return callbacks.length;
    });
    const baseContext = recordingContext(); const overlayContext = recordingContext();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
      return (this.classList.contains('map-interactive') ? overlayContext : baseContext) as never;
    });
    const basis = new Float32Array([1, 0, 0, -1]);
    const viewQuad = new Float32Array([-10, -10, 10, -10, 10, 10, -10, 10]);
    mount(TxMinimap, { props: props({ northUp: true, basis, viewQuad }) });
    const baseClears = baseContext.clearRect.mock.calls.length;
    const overlayClears = overlayContext.clearRect.mock.calls.length;
    const overlayMoves = overlayContext.moveTo.mock.calls.length;
    viewQuad.set([-20, -30, 20, -30, 20, 30, -20, 30]);
    callbacks.shift()!(0); await nextTick();
    expect(baseContext.clearRect).toHaveBeenCalledTimes(baseClears);
    expect(overlayContext.clearRect).toHaveBeenCalledTimes(overlayClears + 1);
    expect(overlayContext.moveTo.mock.calls[overlayMoves]).toEqual([80, 70]);
  });

  it('forces north-up while expanded and exposes a keyboard facility list', () => {
    const basis = new Float32Array([0, 1, 1, 0]);
    const wrapper = mount(TxMinimap, { props: props({ northUp: false, expanded: true, basis }) });
    expect(wrapper.classes()).toContain('expanded');
    expect(wrapper.get('.compass').attributes('style')).toContain('rotate(0rad)');
    const facility = wrapper.get('.facility-list button');
    expect(facility.text()).toContain(marker.label);
    return facility.trigger('keydown', { key: 'Enter' }).then(async () => {
      expect(wrapper.emitted('travel')).toEqual([[marker.target]]);
      await facility.trigger('click'); expect(wrapper.emitted('travel')).toHaveLength(2);
    });
  });

  it('renders control and legend copy from the minimap strings module', () => {
    const wrapper = mount(TxMinimap, { props: props({ expanded: true }) });
    expect(wrapper.get('[aria-label="' + TX_MINIMAP_STRINGS.collapse + '"]').text())
      .toBe(TX_MINIMAP_STRINGS.collapseShort);
    expect(wrapper.get('[aria-label="' + TX_MINIMAP_STRINGS.cameraUp + '"]').text())
      .toBe(TX_MINIMAP_STRINGS.northShort);
    expect(wrapper.findAll('.legend li').map(item => item.text()))
      .toEqual([...TX_MINIMAP_STRINGS.legendItems]);
  });

  it('renders every marker in a focusable role=list fallback', async () => {
    const second = { ...marker, id: 'gate', kind: 'exit' as const, label: '城门',
      target: { kind: 'anchor' as const, anchorId: 'an_gate' } };
    const wrapper = mount(TxMinimap, { props: props({ markers: [marker, second] }) });
    const list = wrapper.get('[role=list]'); expect(list.findAll('button')).toHaveLength(2);
    await list.findAll('button')[1]!.trigger('keydown', { key: ' ' });
    expect(wrapper.emitted('travel')).toEqual([[second.target]]);
  });

  it('emits every outer control intent and keeps its input projections unchanged', async () => {
    const path = new Float32Array([0, 0, 1, 1]);
    const inputProps = props({ path,
      viewQuad: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]) });
    const beforeMarker = JSON.stringify(marker); const beforePath = Array.from(path);
    const wrapper = mount(TxMinimap, { props: inputProps });
    await wrapper.get('[aria-label="放大小地图"]').trigger('click');
    await wrapper.get('[aria-label="缩小小地图"]').trigger('click');
    await wrapper.get('[aria-label="展开全城图（M）"]').trigger('click');
    await wrapper.get('[aria-label="切换为跟随镜头"]').trigger('click');
    expect(wrapper.emitted('zoom')).toEqual([[1], [-1]]);
    expect(wrapper.emitted('toggleExpanded')).toHaveLength(1);
    expect(wrapper.emitted('toggleNorthUp')).toHaveLength(1);
    expect(JSON.stringify(marker)).toBe(beforeMarker);
    expect(Array.from(path)).toEqual(beforePath);
  });

  it('safely skips drawing when happy-dom returns a null canvas context', () => {
    expect(() => mount(TxMinimap, { props: props() })).not.toThrow();
  });
});
