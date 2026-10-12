// eslint-disable-next-line no-restricted-imports -- Test-only RegionMap base64 fixture.
import { Buffer } from 'node:buffer';
import { floorDivInt } from '@tianshu/shared';
import type { RegionMap, TerrainId } from '../../region-types';

export interface FixtureCell {
  readonly q: number;
  readonly r: number;
  readonly terrain?: number;
  readonly height?: number;
  readonly blocked?: boolean;
  readonly building?: number;
}

export function fixtureMap(
  id: string,
  width: number,
  height: number,
  cells: readonly FixtureCell[],
  terrainTable: readonly TerrainId[] = ['tr_pingdi', 'tr_shibi', 'tr_shenshui', 'tr_shengu'],
  ramps: readonly { readonly index: number; readonly dir: 0 | 1 | 2 | 3 | 4 | 5 }[] = [],
): RegionMap {
  const chunkColumns = (width + 31) >> 5;
  const chunkRows = (height + 31) >> 5;
  const layers = Array.from({ length: chunkColumns * chunkRows }, () => ({
    valid: new Uint8Array(128),
    terrain: new Uint8Array(1024),
    heights: new Uint8Array(1024),
    blocked: new Uint8Array(128),
    building: new Uint8Array(1024),
  }));
  for (const cell of cells) {
    const chunk = layers[(cell.r >> 5) * chunkColumns + (cell.q >> 5)]!;
    const index = (cell.r & 31) * 32 + (cell.q & 31);
    chunk.valid[index >> 3] = chunk.valid[index >> 3]! | (1 << (index & 7));
    chunk.terrain[index] = cell.terrain ?? 0;
    chunk.heights[index] = cell.height ?? 0;
    if (cell.blocked) chunk.blocked[index >> 3] = chunk.blocked[index >> 3]! | (1 << (index & 7));
    chunk.building[index] = cell.building ?? 0;
  }
  const encode = (bytes: Uint8Array) => Buffer.from(bytes).toString('base64');
  const chunks = layers.map((chunk, chunkIndex) => ({
    q: chunkIndex % chunkColumns,
    r: floorDivInt(chunkIndex, chunkColumns),
    width: 32 as const,
    height: 32 as const,
    valid: encode(chunk.valid),
    terrainEncoding: 'u8' as const,
    terrain: encode(chunk.terrain),
    heights: encode(chunk.heights),
    blocked: encode(chunk.blocked),
    building: encode(chunk.building),
    ramps: chunkIndex === 0 ? [...ramps] : [],
    water: [],
    precomputedAo: null,
    decos: [],
    objects: [],
  }));
  return {
    schemaVersion: 'region-map.v1',
    id,
    regionId: 'rg_explore_fixture',
    chapterScope: ['ch00_yuenv'],
    eraLayer: 'ch00',
    bounds: { qMin: 0, qMax: width - 1, rMin: 0, rMax: height - 1 },
    chunkSize: 32,
    terrainTable: [...terrainTable],
    chunks,
    objects: [],
    playerSpawns: [],
    adjacentRegions: [],
    eraPatchRefs: [],
    backdropAssetKey: null,
  };
}

export function rectangle(width: number, height: number): FixtureCell[] {
  const cells: FixtureCell[] = [];
  for (let r = 0; r < height; r += 1) for (let q = 0; q < width; q += 1) cells.push({ q, r });
  return cells;
}
