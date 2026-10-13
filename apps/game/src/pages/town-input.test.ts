import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { vi } from 'vitest';
import { createZoomController, TOWN_ZOOM_OPTIONS } from '../input/zoom';
import { createActionMap } from '../input/action-map';
import { createAreaMapController } from '../explore/area-map-control';
import { createV1ContextActions } from '../explore/v1-context-actions';
import { dispatchV1MinimapTravel } from '../explore/v1-minimap';
import { applyTownWheel, TOWN_MOVE_STEP_MS, townAnchorIntent, townDirection, townStep } from './town-input';
import type { TownRuntimeView, TownSceneProjection } from '@tianshu/render/town';

const sourceRoot = resolve(process.cwd(), 'apps/game/src');
function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : entry.name.match(/\.(?:ts|vue)$/u) ? [path] : [];
  });
}

describe('town input command adapter', () => {
  it('removes every v1 mock shop, dialogue, fallback timer, panel, help and asset marker', () => {
    const files = [resolve(sourceRoot, 'pages/TownPage.vue'), ...sourceFiles(resolve(sourceRoot, 'explore'))];
    const source = files.map(path => readFileSync(path, 'utf8')).join('\n');
    const markers = [['shop', 'Items'], ['player', 'Silver'], ['12', '80'], ['active', 'Dialogue'],
      ['showShop', 'Modal'], ['市肆', '采买'], ['与同行', '交谈'], ['打开', '店铺'], ['town-', 'panel'],
      ['town-', 'help'], ['set', 'Interval'], ['/img/li', '.webp'], ['/img/li_cutout', '.png'],
      ['/img/hero_cutout', '.png'], ['town-street-', 'dialogue'],
      ['data-testid="town-', 'stats"']].map(parts => parts.join(''));
    for (const marker of markers)
      expect(source, marker).not.toContain(marker);
  });

  it('maps keyboard directions without deciding whether the target is walkable', () => {
    expect(townStep([4, 7], 'ArrowRight')).toEqual([5, 7]);
    expect(townStep([4, 7], 'q')).toEqual([3, 8]);
    expect(townStep([4, 7], 'Enter')).toBeNull();
  });

  it('keeps the same 140 ms walking cadence when reduced motion is enabled or disabled', () => {
    expect([false, true].map(() => TOWN_MOVE_STEP_MS)).toEqual([140, 140]);
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

  it('keeps zoom keys and minimap click travel working after mock UI removal', () => {
    const map = createActionMap(); const zoom = createZoomController(TOWN_ZOOM_OPTIONS);
    map.pushContext('explore', { zoomIn: () => { zoom.stepIn(); } });
    expect(map.handle({ code: 'Equal', key: '+', down: true, repeat: false, shift: true,
      ctrl: false, alt: false, meta: false, composing: false, editableTarget: false })).toBe(true);
    expect(zoom.value()).toBe(96);
    const runtime: TownRuntimeView = { cityId: 'city_smoke', displayName: '试镇',
      grid: { width: 3, height: 2, chunkCells: 2 }, assets: {
        tile: { baseUrl: '/', entries: [] }, building: { baseUrl: '/', entries: [] } },
      groundPalette: [], groundRuns: [], edgeTiles: [], navigation: { nodes: [] }, buildings: [] };
    const scene: TownSceneProjection = { actor: { point: [0, 0], walking: false, equipment: {} },
      npcs: [], anchors: [], activeBuildingId: null, buildingPhase: 'outside' };
    const send = vi.fn();
    expect(dispatchV1MinimapTravel({ kind: 'point', x: 1.8, z: 1.1 }, runtime, scene, send)).toBe(true);
    expect(send).toHaveBeenCalledWith({ t: 'town/move', destination: [1, 1] });
  });

  it('maps anchors plus a projected facility to at most three context verbs and one F action', () => {
    const actions = createV1ContextActions({ actor: [1, 2], inside: true, canLeave: true, busy: false,
      facility: { key: 'yaopu_01', kind: 'shop', nameKey: 'town.test.yaopu.name', shopKey: 'test/yaopu' },
      facilityName: '苍山药肆', anchors: [
        { id: 'npc_a', kind: 'npc', point: [1, 2], label: '与路人交谈', npcId: 'npc_a' },
        { id: 'rest', kind: 'meditation', point: [1, 2], label: '在蒲团打坐' },
        { id: 'inspect', kind: 'location', point: [1, 2], label: '查看壁画' },
      ] });
    expect(actions).toHaveLength(3);
    expect(actions.map(row => row.verb)).toEqual(['交谈', '交谈', '出门']);
    expect(actions.map(row => row.hotkey)).toEqual(['F', '', '']);
    expect(actions[0]).toMatchObject({ label: '与苍山药肆店员交谈',
      intent: { kind: 'town', command: { t: 'town/interact' } } });
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
