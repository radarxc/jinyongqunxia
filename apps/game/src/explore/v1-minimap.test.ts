// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import type { TownRuntimeView, TownSceneProjection } from '@tianshu/render/town';
import { townHexToWorld } from '@tianshu/render/town';
import { minimapToWorld, worldToMinimap } from '../../../../packages/ui/src/explore/minimap-math';
import { townDirection } from '../pages/town-input';
import { createV1AssembledMinimapMarkers, createV1CameraBasis, createV1MinimapMarkers,
  generateV1MinimapBitmap,
  dispatchV1MinimapTravel, V1_MINIMAP_COLORS, v1PlayerHeadingRad, v1TravelCommand,
  createPaintedMinimapMarkers, loadV1PaintedMinimap, loadV1PaintedMinimapWithFallback,
  loadV1ActiveTaskNpcIds, v1ActiveTaskNpcIds, v1MinimapPixelToTownPoint,
  v1PlanningPointToMinimapPixel, v1TownPointToMinimapPixel, v1WorldToImageMatrix,
  v1WorldToTownPoint, writeV1ViewQuad } from './v1-minimap';
import daliMetadata from '../../../../assets/default/town-minimap/city_dali__ch01.json';
import daliRuntime from '../../../../content/town/ch01/city_dali.json';

function fixture(): TownRuntimeView {
  return { cityId: 'city_test', displayName: '试镇', grid: { width: 3, height: 2, chunkCells: 2 },
    assets: { tile: { baseUrl: '/', entries: [] }, building: { baseUrl: '/', entries: [] } },
    groundPalette: [
      { ground: 'rammed_earth', overlay: null, elevationCm: 0, walkable: false },
      { ground: 'dirt_road', overlay: null, elevationCm: 0, walkable: true },
      { ground: 'water', overlay: null, elevationCm: 0, walkable: false },
    ], groundRuns: [[0, 2, 0], [2, 2, 1], [4, 2, 2]], edgeTiles: [],
    navigation: { nodes: [[0, 0, 0, 'flat']] }, buildings: [
      { id: 'bi_house', origin: [0, 0], size: [1, 1], rotationDeg: 0, assetId: 'house',
        entrances: [[0, 0]], enterable: true, interiorKind: 'residence' },
      { id: 'bi_shop', origin: [2, 1], size: [1, 1], rotationDeg: 0, assetId: 'shop',
        entrances: [[2, 1]], enterable: true, interiorKind: 'shop' },
    ] };
}
const projection: TownSceneProjection = { actor: { point: [0, 0], walking: false, equipment: {} },
  npcs: [], anchors: [{ id: 'an_meditate', kind: 'meditation', point: [1, 0], label: '静坐' }],
  activeBuildingId: null, buildingPhase: 'outside' };
function pixel(bitmap: ReturnType<typeof generateV1MinimapBitmap>, x: number, z: number): number[] {
  const px = Math.floor(x / bitmap.metresPerPx); const py = Math.floor(z / bitmap.metresPerPx);
  return Array.from(bitmap.pixels.slice((py * bitmap.width + px) * 4, (py * bitmap.width + px) * 4 + 4));
}

describe('v1 minimap bitmap', () => {
  it('rasterizes courtyard, road, water, building and facility colors at 0.25 m/px', () => {
    const bitmap = generateV1MinimapBitmap(fixture());
    expect(bitmap).toMatchObject({ width: 12, height: 8, minX: 0, minZ: 0, metresPerPx: 0.25 });
    expect(pixel(bitmap, 1.25, 1.25)).toEqual(V1_MINIMAP_COLORS.courtyard);
    expect(pixel(bitmap, 2.25, 1.25)).toEqual(V1_MINIMAP_COLORS.road);
    expect(pixel(bitmap, 1.25, 0.25)).toEqual(V1_MINIMAP_COLORS.water);
    expect(pixel(bitmap, 0.25, 1.25)).toEqual(V1_MINIMAP_COLORS.building);
    expect(pixel(bitmap, 2.25, 0.25)).toEqual(V1_MINIMAP_COLORS.facility);
  });

  it('is byte-for-byte deterministic and caps the long side at 640 px', () => {
    const first = generateV1MinimapBitmap(fixture()); const second = generateV1MinimapBitmap(fixture());
    expect(first.pixels).toEqual(second.pixels);
    const wide = { ...fixture(), grid: { width: 200, height: 2, chunkCells: 2 },
      groundRuns: [[0, 400, 0]] as const, buildings: [] };
    expect(generateV1MinimapBitmap(wide).width).toBe(640);
  });
});

describe('v1 minimap adapter', () => {
  it('independently matches real runtime building centres and entrances to offline markers', () => {
    const metadata = daliMetadata as never;
    for (const markerId of ['yaopu_01', 'lm_chongsheng_pagoda_center']) {
      const row = daliMetadata.markers.find(item => item.id === markerId)!;
      const building = daliRuntime.buildings.find(item => item.id === row.buildingId)!;
      const originX = building.origin[0]!; const originZ = building.origin[1]!;
      const width = building.size[0]!; const height = building.size[1]!;
      const centre = v1PlanningPointToMinimapPixel(
        originX + width / 2, originZ + height / 2, metadata);
      expect(centre[0]).toBeCloseTo(row.px[0]!, 0);
      expect(centre[1]).toBeCloseTo(row.px[1]!, 0);
      const entrance = v1TownPointToMinimapPixel(building.entrances[0] as never, metadata);
      expect(entrance[0]).toBeCloseTo(row.entrance![0]!, 0);
      expect(entrance[1]).toBeCloseTo(row.entrance![1]!, 0);
    }
  });

  it('round trips an empty painted-map click back to the same town cell', () => {
    const metadata = daliMetadata as never; const source = [12, 64] as const;
    const pixel = v1TownPointToMinimapPixel(source, metadata);
    expect(v1MinimapPixelToTownPoint(pixel[0], pixel[1], metadata)).toEqual(source);
    expect(v1WorldToImageMatrix(metadata)).toHaveLength(6);
  });

  it('loads v1 painted metadata and returns null for a missing town fallback', async () => {
    const bitmap = {} as ImageBitmap; const decoder = vi.fn(async () => bitmap);
    const okFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => daliMetadata })
      .mockResolvedValueOnce({ ok: true, blob: async () => new Blob(['image']) });
    await expect(loadV1PaintedMinimap('city_dali__ch01', '/assets', okFetch, decoder))
      .resolves.toEqual({ metadata: daliMetadata, bitmap });
    expect(createPaintedMinimapMarkers(daliMetadata as never)[0]).toMatchObject({
      label: '苍山药肆', target: { kind: 'point' },
    });
    const missing = vi.fn(async () => ({ ok: false, status: 404 }));
    await expect(loadV1PaintedMinimap('city_missing__ch01', '/assets', missing as never, decoder))
      .resolves.toBeNull();
  });

  it('builds the abstract bitmap fallback and warns only once for one missing layout', async () => {
    const missing = vi.fn(async () => ({ ok: false, status: 404 }));
    const fallback = vi.fn(() => generateV1MinimapBitmap(fixture()));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const key = 'city_missing_warn_once__ch01';
    const decoder = vi.fn(async () => ({} as ImageBitmap));
    await loadV1PaintedMinimapWithFallback(key, '/assets', fallback, missing as never, decoder);
    await loadV1PaintedMinimapWithFallback(key, '/assets', fallback, missing as never, decoder);
    expect(fallback).toHaveBeenCalledTimes(2);
    expect(fallback.mock.results[0]!.value).toMatchObject({ width: 12, height: 8 });
    expect(warn.mock.calls.filter(([message]) => String(message).includes(key))).toHaveLength(1);
    await loadV1PaintedMinimapWithFallback(
      `${key}_stale`, '/assets', fallback, missing as never, decoder, () => false);
    expect(fallback).toHaveBeenCalledTimes(2);
  });

  it('loads active quest subjects and shows only task-related NPC markers', async () => {
    const rows = [{ kind: 'quest', value: { id: 'q_active', subjectNpcIds: ['npc_known'] } },
      { kind: 'quest', value: { id: 'q_done', subjectNpcIds: ['npc_unknown'] } }];
    const fetcher = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ leaves: [
        { kind: 'rules', load: 'chapter', logicalName: 'ch01.rules.base.json' }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => rows });
    const quests = [{ id: 'q_active', status: 'active' }, { id: 'q_done', status: 'completed' }];
    const ids = await loadV1ActiveTaskNpcIds('ch01_tianlong', quests, '/content', fetcher as never);
    expect([...ids]).toEqual(['npc_known']);
    expect([...v1ActiveTaskNpcIds(quests, rows.map(row => row.value))]).toEqual(['npc_known']);
    const scene: TownSceneProjection = { ...projection, anchors: [
      { id: 'an_known', kind: 'npc', point: [0, 0], label: '交谈', npcId: 'npc_known' },
      { id: 'an_other', kind: 'npc', point: [1, 0], label: '交谈', npcId: 'npc_unknown' },
    ] };
    expect(createV1MinimapMarkers(fixture(), scene, new Map(), ids)
      .filter(marker => marker.kind === 'npc').map(marker => marker.id)).toEqual(['an_known']);
    const painted = createPaintedMinimapMarkers(daliMetadata as never);
    const assembled = createV1AssembledMinimapMarkers(fixture(), scene, painted, new Map(), ids);
    expect(assembled.filter(marker => marker.kind === 'npc').map(marker => marker.id))
      .toEqual(['an_known']);
    expect(assembled.some(marker => marker.label === '苍山药肆')).toBe(true);
  });

  it('creates a unit orthogonal 45 degree camera basis', () => {
    const basis = createV1CameraBasis(); const [rx, rz, ux, uz] = basis;
    expect(Math.hypot(rx!, rz!)).toBeCloseTo(1, 6);
    expect(Math.hypot(ux!, uz!)).toBeCloseTo(1, 6);
    expect(rx! * ux! + rz! * uz!).toBeCloseTo(0, 6);
    expect(rx! * uz! - rz! * ux!).toBeCloseTo(-1, 6);
    expect(Array.from(basis)).toEqual([expect.closeTo(Math.SQRT1_2, 6),
      expect.closeTo(-Math.SQRT1_2, 6), expect.closeTo(-Math.SQRT1_2, 6),
      expect.closeTo(-Math.SQRT1_2, 6)]);
  });

  it.each([
    ['yaopu_01', 'bi_0023'],
    ['mashi_01', 'bi_0010'],
    ['shitan_01', 'bi_0011'],
    ['lm_chongsheng_pagoda_center', 'bi_0001'],
  ])('sends painted marker %s to its real entrance without a buildingId', (markerId, buildingId) => {
    const marker = createPaintedMinimapMarkers(daliMetadata as never)
      .find(entry => entry.id === markerId)!;
    const building = daliRuntime.buildings.find(entry => entry.id === buildingId)!;
    expect(marker.target.kind).toBe('point');
    expect(v1TravelCommand(marker.target, daliRuntime as never, projection)).toEqual({
      t: 'town/move', destination: building.entrances[0],
    });
    expect(v1TravelCommand(marker.target, daliRuntime as never, projection)).not.toHaveProperty('buildingId');
  });

  it('matches all six movement directions to their rendered world vectors', () => {
    const deltas = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]] as const;
    const world = { x: 0, y: 0, z: 0, set(x: number, y: number, z: number) {
      this.x = x; this.y = y; this.z = z; return this;
    } };
    for (const delta of deltas) {
      townHexToWorld(delta, 10, 0, world as never);
      const expected = (Math.atan2(world.x, -world.z) + Math.PI * 2) % (Math.PI * 2);
      const direction = townDirection([0, 0], delta);
      expect(v1PlayerHeadingRad(direction)).toBeCloseTo(expected, 6);
    }
    expect(v1PlayerHeadingRad(2)).toBeCloseTo(Math.PI / 2, 6);
  });

  it('maps point travel and facility markers to town/move without deciding reachability', () => {
    expect(v1TravelCommand({ kind: 'point', x: 1.8, z: 1.1 }, fixture(), projection))
      .toEqual({ t: 'town/move', destination: [1, 1] });
    const marker = createV1MinimapMarkers(fixture(), projection)[0]!;
    expect(marker).toMatchObject({ kind: 'facility', target: { kind: 'building', buildingId: 'bi_shop' } });
    expect(v1TravelCommand(marker.target, fixture(), projection)).toEqual({
      t: 'town/move', destination: [2, 1], buildingId: 'bi_shop',
    });
  });

  it('uses facility poi names, category fallbacks, character names, and passerby fallback', () => {
    const base = fixture();
    const namedTown = { ...base, buildings: base.buildings.map(building =>
      building.id === 'bi_shop' ? { ...building, poi: '四方药铺' } : building) };
    const npcProjection: TownSceneProjection = { ...projection, anchors: [
      { id: 'anchor_known', kind: 'npc', point: [0, 0], label: '交谈', npcId: 'npc_known' },
      { id: 'anchor_unknown', kind: 'npc', point: [1, 0], label: '交谈', npcId: 'npc_unknown' },
    ] };
    const names = new Map([['npc_known', '木婉清']]);
    expect(createV1MinimapMarkers(namedTown, npcProjection, names, new Set(['npc_known', 'npc_unknown']))
      .map(marker => marker.label))
      .toEqual(['四方药铺', '木婉清', '路人']);
    expect(createV1MinimapMarkers(namedTown, npcProjection, names).map(marker => marker.label))
      .toEqual(['四方药铺']);
    expect(createV1MinimapMarkers(base, projection)[0]!.label).toBe('店铺');
  });

  it.each([false, true])('dispatches the same canvas point through townCommand when northUp=%s', (northUp) => {
    const basis = createV1CameraBasis(); const view = { centerX: 8, centerZ: 4, metresPerPx: 0.25,
      sizePx: 200, northUp, basis };
    const world = new Float32Array(2); minimapToWorld(130, 70, view, world);
    const canvas = new Float32Array(2); worldToMinimap(world[0]!, world[1]!, view, canvas);
    expect(Array.from(canvas)).toEqual([130, 70]);
    const controller = { townCommand: vi.fn() };
    expect(dispatchV1MinimapTravel({ kind: 'point', x: world[0]!, z: world[1]! },
      fixture(), projection, controller.townCommand)).toBe(true);
    expect(controller.townCommand).toHaveBeenCalledWith({
      t: 'town/move', destination: v1WorldToTownPoint(world[0]!, world[1]!),
    });
  });

  it('updates 600 frames through one output buffer without using allocating picks', () => {
    const out = new Float32Array(8);
    const writeViewGroundQuad = vi.fn((received: Float32Array) => {
      received.set([0, 0, 2, 0, 2, 2, 0, 2]); return true;
    });
    const pickPoint = vi.fn();
    const scene = { writeViewGroundQuad, pickPoint };
    for (let frame = 0; frame < 600; frame += 1)
      expect(writeV1ViewQuad(scene as never, out)).toBe(true);
    expect(writeViewGroundQuad).toHaveBeenCalledTimes(600);
    expect(writeViewGroundQuad.mock.calls.every(([received]) => received === out)).toBe(true);
    expect(pickPoint).not.toHaveBeenCalled();
    expect(Array.from(out)).toEqual([0, 0, 2, 0, 2, 2, 0, 2]);
  });
});
