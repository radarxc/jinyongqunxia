import { describe, expect, it, vi } from 'vitest';
import type { TownRuntimeView, TownSceneProjection } from '@tianshu/render/town';
import { townHexToWorld } from '@tianshu/render/town';
import { minimapToWorld, worldToMinimap } from '../../../../packages/ui/src/explore/minimap-math';
import { townDirection } from '../pages/town-input';
import { createV1CameraBasis, createV1MinimapMarkers, generateV1MinimapBitmap,
  dispatchV1MinimapTravel, V1_MINIMAP_COLORS, v1PlayerHeadingRad, v1TravelCommand,
  v1WorldToTownPoint, writeV1ViewQuad } from './v1-minimap';

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
    expect(createV1MinimapMarkers(namedTown, npcProjection, names).map(marker => marker.label))
      .toEqual(['四方药铺', '木婉清', '路人']);
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
