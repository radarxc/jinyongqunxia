import { compareCodePoints } from '@tianshu/shared';
import type {
  RegionMap,
  RegionMapChunk,
  RegionObject,
  SurfaceId,
  TerrainId,
  TownSceneFacility,
  TownWall,
} from '../../schemas/region-map';
import type { TownWork } from './types';

const base64 = (bytes: Uint8Array): string => Buffer.from(bytes).toString('base64');
const objectOrder = (a: RegionObject, b: RegionObject): number =>
  a.r - b.r || a.q - b.q || compareCodePoints(a.id, b.id);
const terrainOrder = (a: TerrainId, b: TerrainId): number => compareCodePoints(a, b);
const surfaceOrder = (a: SurfaceId, b: SurfaceId): number => compareCodePoints(a, b);
const CHAPTER_SCOPE: Readonly<Record<string, string>> = {
  ch00: 'ch00_yuenv',
  ch01: 'ch01_tianlong',
  ch02: 'ch02_shediao',
  ch03: 'ch03_shendiao',
  ch04: 'ch04_yitian',
  ch05: 'ch05_xiaoao',
  ch06: 'ch06_xiake',
  ch07: 'ch07_bixue',
  ch08: 'ch08_luding',
  ch09: 'ch09_liancheng',
  ch10: 'ch10_baima',
  ch11: 'ch11_yuanyang',
  ch12: 'ch12_shujian',
  ch13: 'ch13_feihu',
  ch14: 'ch14_xueshan',
};
function setBit(bytes: Uint8Array, index: number): void {
  bytes[index >> 3] = bytes[index >> 3]! | (1 << (index & 7));
}

function emitChunk(
  cq: number,
  cr: number,
  work: TownWork,
  terrainTable: readonly TerrainId[],
  surfaceTable: readonly SurfaceId[],
  decos: ReadonlyMap<string, readonly { readonly id: string; readonly index: number }[]>,
): RegionMapChunk {
  const valid = new Uint8Array(128);
  const terrain = new Uint8Array(1024);
  const heights = new Uint8Array(1024);
  const surface = new Uint8Array(1024);
  const blocked = new Uint8Array(128);
  const building = new Uint8Array(1024);
  const water: RegionMapChunk['water'] = [];
  const objects = work.objects
    .filter((object) => Math.floor(object.q / 32) === cq && Math.floor(object.r / 32) === cr)
    .sort(objectOrder);
  for (const cell of work.cells.values()) {
    if (Math.floor(cell.q / 32) !== cq || Math.floor(cell.r / 32) !== cr) continue;
    const index = (cell.r % 32) * 32 + (cell.q % 32);
    setBit(valid, index);
    terrain[index] = terrainTable.indexOf(cell.terrain);
    heights[index] = cell.height;
    surface[index] = surfaceTable.indexOf(cell.surface);
    building[index] = cell.building;
    if (cell.blocked) setBit(blocked, index);
    if (cell.terrain === 'tr_shenshui')
      water.push({ index, kind: 'deep', flowDir: null, shoreDistance: null });
  }
  return {
    q: cq,
    r: cr,
    width: 32,
    height: 32,
    valid: base64(valid),
    terrainEncoding: 'u8',
    terrain: base64(terrain),
    heights: base64(heights),
    surface: base64(surface),
    blocked: base64(blocked),
    building: base64(building),
    ramps: [],
    water,
    precomputedAo: null,
    decos: [...(decos.get(`${cq},${cr}`) ?? [])],
    objects,
  };
}

export function emitTownMap(
  work: TownWork,
  facilities: readonly TownSceneFacility[],
  walls: readonly TownWall[],
  decos: ReadonlyMap<string, readonly { readonly id: string; readonly index: number }[]>,
): RegionMap {
  const terrainTable = [...new Set([...work.cells.values()].map(({ terrain }) => terrain))].sort(
    terrainOrder,
  );
  const surfaceTable = [...new Set([...work.cells.values()].map(({ surface }) => surface))].sort(
    surfaceOrder,
  );
  const width = work.input.layout.runtime_partition.q_slot_count;
  const height = work.input.layout.runtime_partition.r_slot_count;
  const chunks: RegionMapChunk[] = [];
  for (let cr = 0; cr < Math.ceil(height / 32); cr += 1)
    for (let cq = 0; cq < Math.ceil(width / 32); cq += 1)
      chunks.push(emitChunk(cq, cr, work, terrainTable, surfaceTable, decos));
  const chapter = work.input.source.chapter;
  const chapterScope = CHAPTER_SCOPE[chapter];
  if (chapterScope === undefined) throw new Error(`TOWN_COMPILE_CHAPTER_SCOPE:${chapter}`);
  return {
    schemaVersion: 'region-map.v1',
    id: work.sceneId,
    regionId: `rg_town_${work.input.source.cityId.slice(5)}`,
    chapterScope: [chapterScope],
    eraLayer: chapter,
    bounds: { qMin: 0, qMax: width - 1, rMin: 0, rMax: height - 1 },
    chunkSize: 32,
    terrainTable,
    surfaceTable,
    chunks,
    objects: [],
    playerSpawns: work.objects
      .filter((object) => object.class === 'PlayerSpawn')
      .sort(objectOrder)
      .map(({ id }) => id),
    adjacentRegions: [],
    eraPatchRefs: [],
    backdropAssetKey: null,
    town: {
      schemaVersion: 'town-scene.v1',
      cityId: work.input.source.cityId,
      layoutKey: work.input.source.layoutKey,
      displayNameKey: work.input.source.displayNameKey,
      historicalYear: work.input.source.historicalYear,
      visualKit: work.input.source.visualKit,
      kitRef: work.deps.kit.id,
      signAtlasRef: null,
      source: {
        source: work.input.sourcePath,
        layout: work.input.source.layout.path,
        sha256: work.input.source.layout.sha256,
      },
      frame: {
        axialOrigin: {
          q: work.input.layout.runtime_partition.q_min,
          r: work.input.layout.runtime_partition.r_min,
        },
        planningM: [work.input.layout.grid.width, work.input.layout.grid.height],
      },
      facilities: [...facilities],
      buildings: [...work.plans],
      walls: [...walls],
    },
  };
}
