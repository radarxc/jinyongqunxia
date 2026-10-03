import type { RegionMap, RegionObject, TerrainId } from './region-types';
import type { HexDir, HexPathCell } from '../hex';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const TERRAIN_IDS: ReadonlySet<string> = new Set([
  'tr_pingdi', 'tr_caodi', 'tr_huacong', 'tr_zhulin', 'tr_milin', 'tr_jingji',
  'tr_suishi', 'tr_shadi', 'tr_liusha', 'tr_nizhao', 'tr_duzhao', 'tr_jiaotu',
  'tr_taijie', 'tr_qianshui', 'tr_shenshui', 'tr_jiliu', 'tr_pubu', 'tr_dajiang',
  'tr_bingmian', 'tr_baobing', 'tr_xuedi', 'tr_shenxue', 'tr_bingku', 'tr_qiaobi',
  'tr_xuanya', 'tr_shengu', 'tr_wuding', 'tr_gaoqiang', 'tr_shushao',
  'tr_tiesuoqiao', 'tr_dumuqiao', 'tr_zhandao', 'tr_yunhaizhandao', 'tr_chengqiang',
  'tr_gongdianwuji', 'tr_chuanjiaban', 'tr_shinei', 'tr_dongku', 'tr_shizhen',
  'tr_jiguan', 'tr_mushi', 'tr_migong', 'tr_shibi', 'tr_huoyan', 'tr_rongyan',
  'tr_qinghuacong', 'tr_sheku', 'tr_liubai',
]);
const BLOCKED = new Set<TerrainId>(['tr_shengu', 'tr_shibi', 'tr_rongyan', 'tr_liubai']);
const DANGEROUS = new Set<TerrainId>(['tr_liusha', 'tr_duzhao', 'tr_huoyan']);
const NARROW = new Set<TerrainId>(['tr_tiesuoqiao', 'tr_dumuqiao', 'tr_zhandao',
  'tr_yunhaizhandao', 'tr_dongku']);
const COST_TWO = new Set<TerrainId>(['tr_huacong', 'tr_zhulin', 'tr_milin', 'tr_suishi',
  'tr_shadi', 'tr_qianshui', 'tr_tiesuoqiao', 'tr_dumuqiao', 'tr_shizhen',
  'tr_qinghuacong', 'tr_sheku', 'tr_huoyan']);
const COST_THREE = new Set<TerrainId>(['tr_jingji', 'tr_liusha', 'tr_nizhao',
  'tr_duzhao', 'tr_shenxue']);
const TIER_TWO = new Set<TerrainId>(['tr_wuding', 'tr_gaoqiang', 'tr_gongdianwuji']);
const TIER_THREE = new Set<TerrainId>(['tr_shenshui', 'tr_shushao']);

export interface RegionCell extends HexPathCell { readonly terrainId: TerrainId }
export interface RegionDecodedMap {
  readonly cells: readonly RegionCell[]; readonly objects: readonly RegionObject[];
  readonly ramps: ReadonlySet<string>;
}

export function isRegionTerrainId(value: string): value is TerrainId {
  return TERRAIN_IDS.has(value);
}

function decodeBase64(value: string): Uint8Array {
  if (value.length % 4 !== 0) throw new TypeError('REGION_BASE64');
  const padding = value.endsWith('==') ? 2 : value.endsWith('=') ? 1 : 0;
  const output = new Uint8Array((value.length >> 2) * 3 - padding); let cursor = 0;
  for (let index = 0; index < value.length; index += 4) {
    const a = ALPHABET.indexOf(value[index]!); const b = ALPHABET.indexOf(value[index + 1]!);
    const c = value[index + 2] === '=' ? 0 : ALPHABET.indexOf(value[index + 2]!);
    const d = value[index + 3] === '=' ? 0 : ALPHABET.indexOf(value[index + 3]!);
    if (a < 0 || b < 0 || c < 0 || d < 0) throw new TypeError('REGION_BASE64');
    const word = a << 18 | b << 12 | c << 6 | d;
    if (cursor < output.length) output[cursor++] = word >> 16 & 255;
    if (cursor < output.length) output[cursor++] = word >> 8 & 255;
    if (cursor < output.length) output[cursor++] = word & 255;
  }
  return output;
}
const validAt = (bytes: Uint8Array, index: number): boolean =>
  (bytes[index >> 3]! & 1 << (index & 7)) !== 0;
const terrainAt = (bytes: Uint8Array, wide: boolean, index: number): number =>
  wide ? bytes[index * 2]! | bytes[index * 2 + 1]! << 8 : bytes[index]!;

export function terrainMoveCost(terrain: TerrainId, tier: number): number {
  if (tier >= 4 && ['tr_shadi', 'tr_liusha', 'tr_nizhao', 'tr_duzhao', 'tr_xuedi',
    'tr_shenxue'].includes(terrain)) return 1;
  if (tier >= 3 && terrain === 'tr_tiesuoqiao') return 1;
  return COST_THREE.has(terrain) ? 3 : COST_TWO.has(terrain) ? 2 : 1;
}
export function terrainStandable(terrain: TerrainId, tier: number, swim: number): boolean {
  if (BLOCKED.has(terrain) || terrain === 'tr_pubu' || terrain === 'tr_dajiang') return false;
  if (terrain === 'tr_jiliu') return tier >= 4 || swim >= 3;
  if (terrain === 'tr_shenshui') return tier >= 3 || swim >= 1;
  if (terrain === 'tr_yunhaizhandao') return tier >= 5;
  if (TIER_THREE.has(terrain)) return tier >= 3;
  if (TIER_TWO.has(terrain)) return tier >= 2;
  return true;
}

export function decodeRegionMap(map: RegionMap, tier: number, swim: number): RegionDecodedMap {
  if (map.schemaVersion !== 'region-map.v1') throw new TypeError('REGION_MAP_SCHEMA');
  const cells: RegionCell[] = []; const ramps = new Set<string>();
  for (const chunk of map.chunks) {
    const valid = decodeBase64(chunk.valid); const terrain = decodeBase64(chunk.terrain);
    const heights = decodeBase64(chunk.heights);
    if (valid.length !== 128 || heights.length !== 1024 ||
        terrain.length !== (chunk.terrainEncoding === 'u8' ? 1024 : 2048))
      throw new TypeError('REGION_MAP_BYTES');
    for (const ramp of chunk.ramps) {
      const q = chunk.q * 32 + ramp.index % 32;
      const r = chunk.r * 32 + (ramp.index >> 5);
      ramps.add(`${q},${r},${ramp.dir}`);
    }
    for (let index = 0; index < 1024; index += 1) {
      if (!validAt(valid, index)) continue;
      const q = chunk.q * 32 + index % 32; const r = chunk.r * 32 + (index >> 5);
      const terrainId = map.terrainTable[terrainAt(terrain, chunk.terrainEncoding === 'u16le', index)];
      if (!terrainId) throw new TypeError('REGION_TERRAIN_INDEX');
      cells.push({ q, r, height: heights[index]!, moveCost: terrainMoveCost(terrainId, tier),
        standable: terrainStandable(terrainId, tier, swim), narrow: NARROW.has(terrainId),
        dangerous: DANGEROUS.has(terrainId), terrainId });
    }
  }
  cells.sort((left, right) => left.r - right.r || left.q - right.q);
  const objects = [...map.objects, ...map.chunks.flatMap((chunk) => chunk.objects)]
    .sort((left, right) => left.r - right.r || left.q - right.q ||
      (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
  return { cells, objects, ramps };
}

export function rampAllows(ramps: ReadonlySet<string>, from: RegionCell, to: RegionCell,
  direction: HexDir): boolean {
  if (from.height === to.height) return true;
  const reverse = ((direction + 3) % 6) as HexDir;
  return ramps.has(`${from.q},${from.r},${direction}`) ||
    ramps.has(`${to.q},${to.r},${reverse}`);
}
