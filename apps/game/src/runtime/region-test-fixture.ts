import { Buffer } from 'node:buffer';
import type { RegionMap, RegionObject } from '@tianshu/data/schemas';

const cell = (q: number, r: number) => ({ q, r, h: 0 });
const base = (id: string, q: number, r: number) => ({ id, q, r, h: 0, cells: [cell(q, r)] });
const spawn = (id: string, q: number, r: number): RegionObject =>
  ({ ...base(id, q, r), class: 'PlayerSpawn', facing: 0, safe: true, entry: true });

export function regionFixtureMap(): RegionMap {
  const valid = new Uint8Array(128); const terrain = new Uint8Array(1024);
  const heights = new Uint8Array(1024);
  for (const [q, r] of [[0, 0], [1, 0], [2, 0]] as const) {
    const index = r * 32 + q; valid[index >> 3] = valid[index >> 3]! | 1 << (index & 7);
  }
  const objects: RegionObject[] = [spawn('bookfall', 0, 0),
    { ...base('door_exit', 2, 0), class: 'Door', mode: 'door', pairId: 'door_back',
      oneWay: false, targetRegionId: 'rg_fixture', targetSceneId: 'sc_00_next',
      targetSpawnId: 'entry_next' }];
  return { schemaVersion: 'region-map.v1', id: 'sc_00_zhulin', regionId: 'rg_fixture',
    chapterScope: ['ch00_yuenv'], eraLayer: 'ch00', bounds: { qMin: 0, qMax: 31,
      rMin: 0, rMax: 31 }, chunkSize: 32, terrainTable: ['tr_pingdi'],
    chunks: [{ q: 0, r: 0, width: 32, height: 32,
      valid: Buffer.from(valid).toString('base64'), terrainEncoding: 'u8',
      terrain: Buffer.from(terrain).toString('base64'), heights: Buffer.from(heights).toString('base64'),
      ramps: [], water: [], precomputedAo: null, decos: [], objects }], objects: [],
    playerSpawns: ['bookfall'], adjacentRegions: [], eraPatchRefs: [], backdropAssetKey: null };
}
