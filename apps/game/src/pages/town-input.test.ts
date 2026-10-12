import { describe, expect, it } from 'vitest';
import { vi } from 'vitest';
import { createZoomController, TOWN_ZOOM_OPTIONS } from '../input/zoom';
import { createActionMap } from '../input/action-map';
import { createAreaMapController } from '../explore/area-map-control';
import { applyTownWheel, townAnchorIntent, townDirection, townStep } from './town-input';

describe('town input command adapter', () => {
  it('maps keyboard directions without deciding whether the target is walkable', () => {
    expect(townStep([4, 7], 'ArrowRight')).toEqual([5, 7]);
    expect(townStep([4, 7], 'q')).toEqual([3, 8]);
    expect(townStep([4, 7], 'Enter')).toBeNull();
  });

  it('maps all six axial steps to rig directions', () => {
    expect([[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]]
      .map((delta) => townDirection([0, 0], delta as [number, number])))
      .toEqual([2, 3, 4, 6, 7, 0]);
  });

  it('turns picked anchors into core commands only when interaction is local', () => {
    expect(townAnchorIntent({ id: 'anchor_npc_test', kind: 'npc', point: [1, 2],
      label: '交谈', npcId: 'npc_test' }, [1, 2])).toEqual({
      t: 'town/interact', npcId: 'npc_test',
    });
    expect(townAnchorIntent({ id: 'anchor_meditation_test', kind: 'meditation',
      point: [1, 2], label: '打坐' }, [1, 2])).toEqual({
      t: 'town/meditate', anchorId: 'anchor_meditation_test', plannedTicks: 600,
    });
    expect(townAnchorIntent({ id: 'anchor_building_bi_0001', kind: 'building',
      point: [3, 4], label: '进入', buildingId: 'bi_0001' }, [1, 2])).toEqual({
      t: 'town/move', destination: [3, 4], buildingId: 'bi_0001',
    });
  });

  it('normalizes pixel and line wheel deltas, clamps 40–112, and preserves modified browser zoom', () => {
    const zoom = createZoomController(TOWN_ZOOM_OPTIONS); const preventDefault = vi.fn();
    const event = (deltaY: number, deltaMode: number, ctrlKey = false) => ({
      deltaX: 0, deltaY, deltaMode, ctrlKey, metaKey: false, altKey: false, preventDefault,
    });
    expect(applyTownWheel(event(8, 0), zoom)).toBe(true); expect(zoom.value()).toBe(79);
    expect(applyTownWheel(event(1, 1), zoom)).toBe(true); expect(zoom.value()).toBe(77);
    expect(applyTownWheel(event(10_000, 0), zoom)).toBe(true); expect(zoom.value()).toBe(40);
    expect(applyTownWheel(event(-10_000, 0), zoom)).toBe(true); expect(zoom.value()).toBe(112);
    expect(applyTownWheel(event(8, 0, true), zoom)).toBe(false); expect(zoom.value()).toBe(112);
    expect(preventDefault).toHaveBeenCalledTimes(4);
  });

  it('routes every town zoom key while preserving browser and editable input', () => {
    const map = createActionMap(); const zoom = createZoomController(TOWN_ZOOM_OPTIONS);
    map.pushContext('explore', { zoomIn: () => { zoom.stepIn(); },
      zoomOut: () => { zoom.stepOut(); }, zoomReset: () => { zoom.reset(); } });
    const key = (code: string, overrides = {}) => ({ code, key: '', down: true, repeat: false,
      shift: false, ctrl: false, alt: false, meta: false, composing: false, editableTarget: false,
      ...overrides });
    expect(map.handle(key('Equal'))).toBe(true); expect(zoom.value()).toBe(96);
    zoom.set(80); expect(map.handle(key('Equal', { shift: true, key: '+' }))).toBe(true);
    expect(zoom.value()).toBe(96);
    zoom.set(80); expect(map.handle(key('NumpadAdd'))).toBe(true); expect(zoom.value()).toBe(96);
    zoom.set(80); expect(map.handle(key('Minus'))).toBe(true); expect(zoom.value()).toBe(64);
    zoom.set(80); expect(map.handle(key('NumpadSubtract'))).toBe(true); expect(zoom.value()).toBe(64);
    zoom.set(48); expect(map.handle(key('Digit0'))).toBe(true); expect(zoom.value()).toBe(80);
    zoom.set(48); expect(map.handle(key('Numpad0'))).toBe(true); expect(zoom.value()).toBe(80);
    expect(map.handle(key('Equal', { ctrl: true }))).toBe(false); expect(zoom.value()).toBe(80);
    expect(map.handle(key('Equal', { editableTarget: true }))).toBe(false);
    expect(map.handle(key('Equal', { composing: true }))).toBe(false);
  });

  it('opens the city map with M and lets areaMap consume Escape to close it', () => {
    const map = createActionMap(); let open = false; let holds = 0; let releases = 0;
    const areaMap = createAreaMapController({
      isOpen: () => open, setOpen: value => { open = value; },
      holdWorldTicks: () => { holds += 1; let released = false; return () => {
        if (!released) { released = true; holds -= 1; releases += 1; }
      }; },
      acquireContext: close => map.pushContext('areaMap', { back: close, toggleAreaMap: close }),
    });
    map.pushContext('explore', { toggleAreaMap: areaMap.toggle });
    const edge = (code: string) => ({ code, key: '', down: true, repeat: false, shift: false,
      ctrl: false, alt: false, meta: false, composing: false, editableTarget: false });
    expect(map.handle(edge('KeyM'))).toBe(true); expect(open).toBe(true); expect(holds).toBe(1);
    expect(map.handle(edge('Escape'))).toBe(true); expect(open).toBe(false); expect(holds).toBe(0);
    areaMap.set(false); expect(releases).toBe(1);
    expect(map.handle(edge('KeyM'))).toBe(true); expect(open).toBe(true);
    areaMap.dispose(); expect(open).toBe(false); expect(holds).toBe(0); expect(releases).toBe(2);
  });
});
