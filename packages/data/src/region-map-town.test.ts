import { readdir, readFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compileTiledMap } from './build/tiled';
import { MapEntrySchema } from './schemas/world-map';
import { RegionMapSchema } from './schemas/region-map';

const bytes = (length: number, fill = 0): Uint8Array => new Uint8Array(length).fill(fill);
const base64 = (value: Uint8Array): string => Buffer.from(value).toString('base64');
const cell = (q: number, r = 0) => ({ q, r, h: 0 });
const buildingPlan = (id: string, centerX: number) => ({
  id, archetype: 'shop', kit: 'song_dali', seed: 1,
  footprint: [centerX, 1000, 4000, 4000], yaw: 0, storeys: 1,
  roof: [2, 800, 400], entrances: [[0, 0, 1400]], enterable: true,
  elev: [0, 150], floors: [[centerX - 1000, 0, centerX + 1000, 2000]],
  floorY: [150], fixtures: [[200, centerX, 1000, 0, 0, 2, 0]],
  signage: null, facility: 'shop',
});

function townMap() {
  const valid = bytes(128, 0xff);
  const blocked = bytes(128); blocked[0] = 1 << 6;
  const building = bytes(1024); building[2] = 1; building[5] = 2;
  const surface = bytes(1024); surface[3] = 1;
  const objects = [
    { id: 'spawn_main', class: 'PlayerSpawn', q: 0, r: 0, h: 0, cells: [cell(0)],
      safe: true, entry: true },
    { id: 'bi_a', class: 'Building', q: 1, r: 0, h: 0, cells: [cell(1)],
      footprint: { q: 2, r: 0, width: 3, height: 3 },
      interiorRect: { q: 3, r: 1, width: 1, height: 1 }, roofGroup: 'roof_a',
      cutawayWalls: [0], enterable: true, facilityKey: 'yaopu_01', nameKey: 'town.bi_a' },
    { id: 'keeper', class: 'FacilityNpc', q: 2, r: 0, h: 0, cells: [cell(2)],
      facilityKey: 'yaopu_01', roleKey: 'keeper', facing: 3, interactRange: 2,
      appearance: { template: 'tpl_f_medium', outfit: 'outfit_shop', seed: 7 } },
    { id: 'exit_south', class: 'Exit', q: 3, r: 0, h: 0, cells: [cell(3)],
      gateId: 'south', spawnId: 'spawn_main', side: 'south', nameKey: 'town.exit.south' },
    { id: 'bi_b', class: 'Building', q: 4, r: 0, h: 0, cells: [cell(4)],
      footprint: { q: 5, r: 0, width: 3, height: 3 },
      interiorRect: { q: 6, r: 1, width: 1, height: 1 }, roofGroup: 'roof_b',
      cutawayWalls: [0], enterable: true },
    { id: 'meditation', class: 'MeditationSpot', q: 5, r: 0, h: 0, cells: [cell(5)],
      buildingId: 'bi_b', riskBaseBp: 250, quality: 2 },
  ];
  return {
    schemaVersion: 'region-map.v1', id: 'sc_01_town_dali', regionId: 'rg_dali',
    chapterScope: ['ch01_tianlong'], eraLayer: 'ch01',
    bounds: { qMin: 0, qMax: 31, rMin: 0, rMax: 31 }, chunkSize: 32,
    terrainTable: ['tr_pingdi'], surfaceTable: ['brick_floor', 'stone_slab'],
    chunks: [{ q: 0, r: 0, width: 32, height: 32, valid: base64(valid),
      terrainEncoding: 'u8', terrain: base64(bytes(1024)), heights: base64(bytes(1024)),
      surface: base64(surface), blocked: base64(blocked), building: base64(building),
      ramps: [], water: [], precomputedAo: null, decos: [], objects }],
    objects: [], playerSpawns: ['spawn_main'], adjacentRegions: [], eraPatchRefs: [],
    backdropAssetKey: null,
    town: {
      schemaVersion: 'town-scene.v1', cityId: 'city_dali', layoutKey: 'city_dali__ch01',
      displayNameKey: 'town.city_dali.name', historicalYear: 1093, visualKit: 'song_dali',
      kitRef: 'buildkit/song_dali', signAtlasRef: null,
      source: { source: 'docs/design/town/city_dali__ch01.yaml',
        layout: 'assets/default/town/city_dali__ch01/layout.yaml', sha256: '0'.repeat(64) },
      frame: { axialOrigin: { q: 0, r: 0 }, planningM: [32, 32] },
      facilities: [{ key: 'yaopu_01', kind: 'shop', sub: 'yaopu', buildingId: 'bi_a',
        nameKey: 'town.facility.yaopu', shop: { instanceKey: 'city_dali__ch01/yaopu_01',
          templateRef: 'shop_yaopu', kind: 'normal' }, roles: ['keeper'],
        serviceCells: [{ q: 2, r: 0 }], hours: { open: 480, close: 1080 } }],
      buildings: [buildingPlan('bi_a', 1000), buildingPlan('bi_b', 6000)], walls: [],
    },
  };
}

async function tiledPaths(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths: string[] = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await tiledPaths(path));
    else if (entry.name.endsWith('.tmj')) paths.push(path);
  }
  return paths.sort();
}

describe('RegionMap town-scene additions', () => {
  it('loads every town schema entry module through native ESM imports', async () => {
    await expect(Promise.all([
      import('./schemas/region-map'), import('./schemas/world-map'),
      import('./schemas/town-scene'), import('./schemas/facility'),
    ])).resolves.toHaveLength(4);
  });

  it('keeps all 65 existing Tiled regions valid', async () => {
    const repository = resolve(import.meta.dirname, '../../..');
    const directory = join(repository, 'content/world/regions');
    const paths = await tiledPaths(directory);
    expect(paths).toHaveLength(65);
    for (const absolutePath of paths) {
      const source = { path: relative(repository, absolutePath), absolutePath,
        text: await readFile(absolutePath, 'utf8') };
      const compiled = await compileTiledMap(source);
      expect(compiled.diagnostics, source.path).toEqual([]);
      expect(RegionMapSchema.safeParse(compiled.map).success, source.path).toBe(true);
    }
  }, 20_000);

  it('accepts the minimal two-building town and MapEntry.scene', () => {
    expect(RegionMapSchema.safeParse(townMap()).success).toBe(true);
    expect(MapEntrySchema.safeParse({ sceneId: 'city_dali', townSpec: null, templateYear: null,
      gateId: null, spawn: null, scene: { regionId: 'rg_dali', sceneId: 'sc_01_town_dali' },
      accessNote: '' }).success).toBe(true);
  });

  it.each([
    ['duplicate door cell', 'enterable building door cells must be unique',
      (map: ReturnType<typeof townMap>) => {
      const objects = map.chunks[0]!.objects;
      const second = objects.find((object) => object.id === 'bi_b')!;
      second.q = 1; second.cells = [cell(1)];
      objects.sort((left, right) => left.r - right.r || left.q - right.q ||
        left.id.localeCompare(right.id));
    }],
    ['unknown Exit.spawnId', 'exit spawnId must reference a PlayerSpawn',
      (map: ReturnType<typeof townMap>) => {
      map.chunks[0]!.objects.find((object) => object.class === 'Exit')!.spawnId = 'spawn_missing';
    }],
    ['optional layer length', 'surface must be 1024 bytes', (map: ReturnType<typeof townMap>) => {
      map.chunks[0]!.surface = base64(bytes(1023));
    }],
    ['building ordinal overflow', 'building index is outside Building objects',
      (map: ReturnType<typeof townMap>) => {
      const layer = Buffer.from(map.chunks[0]!.building, 'base64'); layer[8] = 3;
      map.chunks[0]!.building = layer.toString('base64');
    }],
    ['blocked invalid slot', 'blocked slot must be valid', (map: ReturnType<typeof townMap>) => {
      const valid = Buffer.from(map.chunks[0]!.valid, 'base64'); valid[0] = valid[0]! & ~(1 << 6);
      map.chunks[0]!.valid = valid.toString('base64');
    }],
    ['floor outside footprint', 'floor rectangle must be inside footprint',
      (map: ReturnType<typeof townMap>) => {
      map.town.buildings[0]!.floors = [[-5000, 0, 2000, 2000]];
    }],
    ['unknown FacilityNpc.facilityKey', 'FacilityNpc facilityKey must reference a town facility',
      (map: ReturnType<typeof townMap>) => {
      map.chunks[0]!.objects.find((object) => object.class === 'FacilityNpc')!.facilityKey = 'missing';
    }],
  ])('rejects %s', (_name, message, mutate) => {
    const map = townMap(); mutate(map);
    const result = RegionMapSchema.safeParse(map);
    expect(result.error?.issues.map((issue) => issue.message)).toContain(message);
  });

  it('rejects a first door cell inside footprint but outside interiorRect', () => {
    const map = townMap();
    const building = map.chunks[0]!.objects.find((object) => object.id === 'bi_a')!;
    building.q = 2; building.cells = [cell(2)];
    const result = RegionMapSchema.safeParse(map);
    expect(result.error?.issues.map((issue) => issue.message))
      .toContain('first door cell must be outside the building footprint');
  });
});
