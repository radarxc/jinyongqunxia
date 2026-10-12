import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { minimapToWorld, worldToMinimap } from '../../explore/minimap-math';
import type { MinimapMarker } from '../../explore/minimap-painter';
import TxMinimap from './TxMinimap.vue';
import { TX_MINIMAP_STRINGS } from './TxMinimap.strings';
import daliMetadata from '../../../../../assets/default/town-minimap/city_dali__ch01.json';

const initialInnerWidth = window.innerWidth;
const initialDevicePixelRatio = window.devicePixelRatio;
const marker: MinimapMarker = { id: 'inn', kind: 'facility', x: 8.8, z: 0, icon: '客', label: '客栈',
  target: { kind: 'building', buildingId: 'bi_inn' } };
const base = { bitmap: document.createElement('canvas'), minX: -100, minZ: -100, metresPerPx: 1 };
function props(overrides: Record<string, unknown> = {}) {
  return { base, player: { x: 0, z: 0, headingRad: 0 }, basis: null, viewQuad: null,
    markers: [marker] as readonly MinimapMarker[], path: null, destination: null, northUp: true,
    expanded: false, sizePx: 200, zoomPxPerMetre: 80, ...overrides };
}
function rect(width: number, height: number): DOMRect {
  return { x: 0, y: 0, left: 0, top: 0, width, height, right: width, bottom: height,
    toJSON: () => undefined };
}
function setCanvasRect(canvas: HTMLCanvasElement): void {
  canvas.getBoundingClientRect = () => {
    const parent = canvas.parentElement as HTMLElement;
    const width = Number.parseFloat(parent.style.width);
    const height = Number.parseFloat(parent.style.height);
    return rect(width, height);
  };
}
function setProductionBoxRects(disk: HTMLElement, canvas: HTMLCanvasElement,
  width: number, height: number): void {
  disk.getBoundingClientRect = () => rect(width + 4, height + 4);
  canvas.getBoundingClientRect = () => rect(width, height);
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
afterEach(() => {
  vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); document.body.innerHTML = '';
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: initialInnerWidth });
  Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: initialDevicePixelRatio });
});

describe('TxMinimap travel interaction', () => {
  it('emits the same empty-ground world point as minimapToWorld', () => {
    const wrapper = mount(TxMinimap, { props: props() });
    const canvas = wrapper.get('canvas.map-interactive').element as HTMLCanvasElement; setCanvasRect(canvas);
    pointer(canvas, 'pointerup', 170, 150);
    const expected = new Float32Array(2);
    minimapToWorld(170, 150, { centerX: 0, centerZ: 0, metresPerPx: 0.2, sizePx: 200,
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
    const touchMarker = { ...marker, x: 11 };
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
    const otherMarker: MinimapMarker = { ...marker, id: 'gate', x: -8.8, label: '城门',
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
  it('emits continuous slider, keyboard and plus/minus zoom through one value source', async () => {
    const wrapper = mount(TxMinimap, { props: props({ zoomPxPerMetre: 64 }) });
    const slider = wrapper.get('input[role=slider], input[type=range]');
    expect(slider.attributes()).toMatchObject({ min: '40', max: '112', 'aria-valuenow': '64' });
    await slider.setValue('91');
    expect(wrapper.emitted('setZoom')).toEqual([[91]]);
    await wrapper.setProps({ zoomPxPerMetre: 91 });
    await slider.trigger('keydown', { key: 'ArrowUp' });
    expect(wrapper.emitted('setZoom')).toEqual([[91], [92]]);
    await wrapper.get('[aria-label="放大主画面"]').trigger('click');
    await wrapper.get('[aria-label="缩小主画面"]').trigger('click');
    expect(wrapper.emitted('zoom')).toEqual([[1], [-1]]);
    await wrapper.setProps({ zoomPxPerMetre: 96 });
    expect(slider.attributes('aria-valuenow')).toBe('96');
  });

  it('considers nearest three names and every expanded marker while dropping collisions', async () => {
    const markers = Array.from({ length: 5 }, (_, index): MinimapMarker => ({ ...marker,
      id: `place-${index}`, label: `地点${index}`, x: index * 10,
      target: { kind: 'building', buildingId: `bi_${index}` } }));
    const wrapper = mount(TxMinimap, { props: props({ markers }) });
    await nextTick();
    expect(wrapper.findAll('.marker-name').map(item => item.text()))
      .toEqual(expect.arrayContaining(['地点0', '地点1']));
    await wrapper.findAll('[role=list] button')[4]!.trigger('focus');
    expect(wrapper.findAll('[role=list] button')[4]!.text()).toContain('地点4');
    await wrapper.setProps({ expanded: true });
    expect(wrapper.findAll('[role=list] button')).toHaveLength(5);
  });

  it('uses one 132px coordinate space for canvases, marker labels and pointer hits', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 800 });
    const wrapper = mount(TxMinimap, { props: props() });
    await nextTick();
    const canvases = wrapper.findAll('canvas');
    expect(canvases.map(item => item.attributes('width'))).toEqual(['132', '132']);
    expect(wrapper.get('.map-disk').attributes('style')).toContain('width: 132px');
    expect(wrapper.get('.marker-name').attributes('style')).toContain('left: 63px');
    const canvas = wrapper.get('canvas.map-interactive').element as HTMLCanvasElement;
    setCanvasRect(canvas); pointer(canvas, 'pointerup', 110, 66);
    expect(wrapper.emitted('travel')).toEqual([[marker.target]]);
  });

  it('uses the bordered desktop content box for DPR 2 and keeps clicks in CSS pixels', async () => {
    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 2 });
    const wrapper = mount(TxMinimap, { props: props() }); await nextTick();
    const disk = wrapper.get<HTMLElement>('.map-disk').element;
    const canvases = wrapper.findAll<HTMLCanvasElement>('canvas');
    for (const layer of canvases) setProductionBoxRects(disk, layer.element, 200, 200);
    const canvas = wrapper.get('canvas.map-interactive').element as HTMLCanvasElement;
    expect(disk.style.boxSizing).toBe('content-box');
    expect(disk.getBoundingClientRect().width).toBe(204);
    for (const layer of canvases) {
      expect(layer.element.width).toBe(layer.element.getBoundingClientRect().width * 2);
      expect(layer.element.height).toBe(layer.element.getBoundingClientRect().height * 2);
    }
    pointer(canvas, 'pointerup', 170, 150);
    const expected = new Float32Array(2);
    minimapToWorld(170, 150, { centerX: 0, centerZ: 0, metresPerPx: 0.2, sizePx: 200,
      northUp: true, basis: null }, expected);
    expect(wrapper.emitted('travel')).toEqual([[{ kind: 'point', x: expected[0], z: expected[1] }]]);
  });

  it('rebuilds backing pixels when the screen DPR changes', async () => {
    const callbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      callbacks.push(callback); return callbacks.length;
    });
    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 1 });
    const wrapper = mount(TxMinimap, { props: props() });
    expect(wrapper.get('canvas').attributes('width')).toBe('200');
    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 2 });
    callbacks.shift()!(0); await nextTick();
    expect(wrapper.get('canvas').attributes('width')).toBe('400');
  });

  it('keeps squeezed names in the accessible list and excludes non-facilities from facilities', () => {
    const npc: MinimapMarker = { id: 'npc-task', kind: 'npc', x: 2, z: 3, icon: '任',
      label: '任务人物', target: { kind: 'anchor', anchorId: 'anchor_npc_task' } };
    const quest = { ...npc, id: 'quest', kind: 'quest' as const, label: '任务地' };
    const meditation = { ...npc, id: 'meditation', kind: 'meditation' as const, label: '静坐处' };
    const wrapper = mount(TxMinimap, {
      props: props({ markers: [marker, npc, quest, meditation], expanded: true }),
    });
    expect(wrapper.findAll('[role=list] button').map(item => item.text()))
      .toEqual(expect.arrayContaining([expect.stringContaining('任务人物'), expect.stringContaining('任务地'),
        expect.stringContaining('静坐处')]));
    expect(wrapper.findAll('.facility-list button').map(item => item.text()))
      .toEqual(['客客栈']);
  });

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

  it('resolves themed marker ring colours before painting the canvas', () => {
    const baseContext = recordingContext(); const overlayContext = recordingContext();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
      return (this.classList.contains('map-interactive') ? overlayContext : baseContext) as never;
    });
    vi.stubGlobal('getComputedStyle', () => ({
      getPropertyValue: (name: string) => name === '--tx-minimap-marker-inn' ? '#135790' : '',
    }));
    mount(TxMinimap, { props: props({ player: null, viewQuad: null, path: null, destination: null,
      markers: [{ ...marker, kind: 'inn' }] }) });
    expect(overlayContext.strokeStyle).toBe('#135790');
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
    const beforeCompass = wrapper.get('.spoon').attributes('style');
    const baseClears = baseContext.clearRect.mock.calls.length;
    const overlayClears = overlayContext.clearRect.mock.calls.length;
    basis.set([0, 1, 1, 0]); callbacks.shift()!(0); await nextTick();
    expect(baseContext.clearRect).toHaveBeenCalledTimes(baseClears + 1);
    expect(overlayContext.clearRect).toHaveBeenCalledTimes(overlayClears + 1);
    expect(wrapper.get('.spoon').attributes('style')).not.toBe(beforeCompass);
  });

  it('repositions abstract-map labels with badges when north-up changes', async () => {
    const basis = new Float32Array([0, 1, 1, 0]);
    const wrapper = mount(TxMinimap, { props: props({ northUp: false, basis }) });
    await nextTick();
    const assertPosition = (northUp: boolean): void => {
      const projected = new Float32Array(2);
      worldToMinimap(marker.x, marker.z, { centerX: 0, centerZ: 0, metresPerPx: 0.2, sizePx: 200,
        northUp, basis }, projected);
      const label = wrapper.get('[data-marker-id="inn"]').element as HTMLElement;
      const left = Number.parseFloat(label.style.left); const top = Number.parseFloat(label.style.top);
      const width = Number.parseFloat(label.style.width); const height = Number.parseFloat(label.style.height);
      expect(left).toBeCloseTo(projected[0]! + 13);
      expect(top).toBeCloseTo(projected[1]! - 10);
      const overlapsBadge = left < projected[0]! + 10 && left + width > projected[0]! - 10
        && top < projected[1]! + 10 && top + height > projected[1]! - 10;
      expect(overlapsBadge).toBe(false);
    };
    assertPosition(false);
    await wrapper.setProps({ northUp: true }); await nextTick(); await nextTick();
    assertPosition(true);
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
    expect(overlayContext.moveTo.mock.calls[overlayMoves]).toEqual([0, -50]);
  });

  it('keeps painted-map transform and read-only sinan identical across north-up values', async () => {
    const basis = new Float32Array([0, 1, 1, 0]);
    const baseContext = recordingContext(); const overlayContext = recordingContext();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
      return (this.classList.contains('map-interactive') ? overlayContext : baseContext) as never;
    });
    const painted = { ...base, worldToImage: [8, 4, -8, 4, 768, 130] as const,
      south: [-0.89442719, 0.4472136] as const };
    const wrapper = mount(TxMinimap, { props: props({ base: painted, northUp: false,
      expanded: true, basis }) });
    await nextTick();
    expect(wrapper.classes()).toContain('expanded');
    const cameraMatrix = baseContext.setTransform.mock.calls.at(-1);
    const cameraSinan = wrapper.get('.spoon').attributes('style');
    await wrapper.setProps({ northUp: true }); await nextTick();
    expect(baseContext.setTransform.mock.calls.at(-1)).toEqual(cameraMatrix);
    expect(wrapper.get('.spoon').attributes('style')).toBe(cameraSinan);
    const sinan = wrapper.get('[aria-label="司南：勺柄指南（缩影按镜头视角绘制）"]');
    expect(sinan.attributes('aria-pressed')).toBeUndefined();
    await sinan.trigger('click'); expect(wrapper.emitted('toggleNorthUp')).toBeUndefined();
    const facility = wrapper.get('.facility-list button');
    expect(facility.text()).toContain(marker.label);
    await facility.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('travel')).toEqual([[marker.target]]);
    await facility.trigger('click'); expect(wrapper.emitted('travel')).toHaveLength(2);
  });

  it('uses a DPR 2 rectangular contain viewport for the expanded painted map below the HUD', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 2 });
    const painted = { ...base, bitmap: Object.assign(document.createElement('canvas'),
      { width: 1536, height: 899 }), worldToImage: [8, 4, -8, 4, 768, 130.75] as const,
      south: [-0.89442719, 0.4472136] as const };
    const wrapper = mount(TxMinimap, { props: props({ base: painted, expanded: true }) });
    await nextTick();
    expect(wrapper.classes()).toContain('expanded-painted');
    const disk = wrapper.get<HTMLElement>('.map-disk');
    expect(disk.attributes('style')).toContain('width: 936px');
    expect(disk.attributes('style')).toContain('height: 640px');
    const canvases = wrapper.findAll<HTMLCanvasElement>('canvas');
    for (const layer of canvases) {
      setProductionBoxRects(disk.element, layer.element, 936, 640);
      expect(layer.element.width).toBe(layer.element.getBoundingClientRect().width * 2);
      expect(layer.element.height).toBe(layer.element.getBoundingClientRect().height * 2);
    }
  });

  it('hides squeezed Dali label text but retains it in the facility list', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
    const matrix = [8, 4, -8, 4, 768, 130.75] as const;
    const markers = daliMetadata.markers.map((row): MinimapMarker => {
      const [pixelX, pixelY] = row.px;
      const imageX = pixelX! - matrix[4]; const imageY = pixelY! - matrix[5];
      const x = (matrix[3] * imageX - matrix[2] * imageY) / 64;
      const z = (-matrix[1] * imageX + matrix[0] * imageY) / 64;
      return { id: row.id, kind: row.kind as MinimapMarker['kind'], x, z, icon: row.glyph,
        label: row.name, target: { kind: 'point', x, z } };
    });
    const painted = { ...base, bitmap: Object.assign(document.createElement('canvas'),
      { width: daliMetadata.image.width, height: daliMetadata.image.height }),
    worldToImage: matrix, south: [daliMetadata.south[0]!, daliMetadata.south[1]!] as const };
    const wrapper = mount(TxMinimap, { props: props({ base: painted, markers, expanded: true }) });
    await nextTick();
    expect(wrapper.findAll('.marker-name')).toHaveLength(15);
    expect(wrapper.find('[data-marker-id="mashi_01"]').exists()).toBe(false);
    expect(wrapper.findAll('.facility-list button').map(item => item.text()))
      .toEqual(expect.arrayContaining([expect.stringContaining('苍洱马市')]));
  });

  it('renders control and legend copy from the minimap strings module', () => {
    const wrapper = mount(TxMinimap, { props: props({ expanded: true }) });
    expect(wrapper.get('[aria-label="' + TX_MINIMAP_STRINGS.collapse + '"]').text())
      .toBe(TX_MINIMAP_STRINGS.mapShort);
    expect(wrapper.findAll('.legend li').map(item => item.text()))
      .toEqual([...TX_MINIMAP_STRINGS.legendItems]);
  });

  it('keeps a 38px stamp face inside the shared accessible control hit target', () => {
    const wrapper = mount(TxMinimap, { props: props() });
    const stamp = wrapper.get('.map-stamp');
    expect(stamp.get('.map-stamp-face').text()).toBe(TX_MINIMAP_STRINGS.mapShort);
    expect(stamp.attributes('style')).toContain('min-width: 44px');
    expect(stamp.attributes('style')).toContain('min-height: 44px');
    expect(stamp.get('.map-stamp-face').attributes('style')).toContain('width: 38px');
  });

  it('reserves the complete 44px desktop zoom controls outside the map disk', () => {
    const wrapper = mount(TxMinimap, { props: props() });
    expect(wrapper.get('.map-column').attributes('style')).toContain('padding-right: 54px');
    const buttons = wrapper.get('.zoom-bar').findAll('button');
    expect(buttons).toHaveLength(2);
    expect(buttons.every(button => button.attributes('style')?.includes('min-width: 44px'))).toBe(true);
  });

  it('expands the stamp hit target to 60px for coarse pointers', async () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList);
    const wrapper = mount(TxMinimap, { props: props() });
    await nextTick();
    expect(wrapper.get('.map-column').attributes('style')).toContain('padding-right: 62px');
    const zoomButtons = wrapper.get('.zoom-bar').findAll('button');
    expect(zoomButtons).toHaveLength(2);
    expect(zoomButtons.every(button => button.attributes('style')?.includes('min-width: 60px'))).toBe(true);
    expect(wrapper.get('.map-stamp').attributes('style')).toContain('min-width: 60px');
    expect(wrapper.get('.map-stamp-face').attributes('style')).toContain('width: 38px');
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
    await wrapper.get('[aria-label="放大主画面"]').trigger('click');
    await wrapper.get('[aria-label="缩小主画面"]').trigger('click');
    await wrapper.get('[aria-label="展开全城图（M）"]').trigger('click');
    await wrapper.get('[aria-label="司南：勺柄指南"]').trigger('click');
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
