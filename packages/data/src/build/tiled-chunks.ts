import { compareCodePoints, type JsonValue } from '@tianshu/shared';
import {
  REGION_CHUNK_CELLS,
  REGION_CHUNK_SIZE,
  TERRAIN_IDS,
  type RegionObject,
  type TerrainId,
} from '../schemas';
import type { TiledCompileContext } from './tiled-types';
import { mapError } from './tiled-types';
import { stripGidFlags, tileProperties, type TileLayers } from './tiled-layers';

export interface CellData {
  readonly valid: boolean;
  readonly terrain?: TerrainId;
  readonly height?: number;
  readonly deco?: string;
  readonly rampDir?: number;
  readonly water?: { kind: string; flowDir: number | null; shoreDistance: number | null };
}
export interface ChunkResult {
  readonly chunks: readonly JsonValue[];
  readonly baseObjects: readonly RegionObject[];
  readonly terrainTable: readonly TerrainId[];
}

const base64 = (bytes: Uint8Array): string => Buffer.from(bytes).toString('base64');
const bitset = (indices: readonly number[]): string => {
  const bytes = new Uint8Array(REGION_CHUNK_CELLS / 8);
  for (const index of indices) bytes[index >> 3] = bytes[index >> 3]! | (1 << (index & 7));
  return base64(bytes);
};
const waterKind = (terrain: TerrainId): string | null => {
  if (terrain === 'tr_qianshui') return 'shallow';
  if (terrain === 'tr_shenshui' || terrain === 'tr_pubu') return 'deep';
  if (terrain === 'tr_jiliu') return 'flowing';
  if (terrain === 'tr_dajiang') return 'bigwater';
  return null;
};

function terrainCell(context: TiledCompileContext, layers: TileLayers, index: number): CellData {
  const terrainPointer = `${layers.terrainPointer}/data/${index}`;
  const heightPointer = `${layers.heightPointer}/data/${index}`;
  const decoPointer = `${layers.decoPointer}/data/${index}`;
  const terrainGid = stripGidFlags(context, layers.terrain[index]!, terrainPointer);
  const heightGid = stripGidFlags(context, layers.height[index]!, heightPointer);
  if ((terrainGid === 0) !== (heightGid === 0))
    throw mapError(
      context,
      'TS-CONTENT-MAP-006',
      'terrain and height must both exist or both be empty',
      terrainPointer,
    );
  if (terrainGid === 0) return { valid: false };
  const terrainProps = tileProperties(context, terrainGid, terrainPointer);
  const terrain = terrainProps['terrainId'];
  if (typeof terrain !== 'string' || !TERRAIN_IDS.includes(terrain as TerrainId))
    throw mapError(
      context,
      'TS-CONTENT-MAP-007',
      `unknown terrain ${String(terrain)}`,
      terrainPointer,
    );
  const heightProps = tileProperties(context, heightGid, heightPointer);
  const height = heightProps['height'];
  if (!Number.isInteger(height) || (height as number) < 0 || (height as number) > 10)
    throw mapError(
      context,
      'TS-CONTENT-MAP-006',
      'height tile must define height 0..10',
      heightPointer,
    );
  const ramp = terrainProps['ramp'] === true;
  const rampDir = terrainProps['rampDir'];
  if (ramp && (!Number.isInteger(rampDir) || (rampDir as number) < 0 || (rampDir as number) > 5))
    throw mapError(
      context,
      'TS-CONTENT-MAP-008',
      'ramp terrain requires rampDir 0..5',
      terrainPointer,
    );
  const kind = waterKind(terrain as TerrainId);
  const flowDir = terrainProps['flowDir'];
  if (
    kind === 'flowing' &&
    (!Number.isInteger(flowDir) || (flowDir as number) < 0 || (flowDir as number) > 5)
  )
    throw mapError(
      context,
      'TS-CONTENT-MAP-008',
      'flowing water requires flowDir 0..5',
      terrainPointer,
    );
  const decoGid = stripGidFlags(context, layers.deco[index]!, decoPointer);
  let deco: string | undefined;
  if (decoGid !== 0) {
    const decoId = tileProperties(context, decoGid, decoPointer)['decoId'];
    if (typeof decoId !== 'string' || !/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/u.test(decoId))
      throw mapError(
        context,
        'TS-CONTENT-MAP-004',
        'decoration tile requires a valid decoId',
        decoPointer,
      );
    deco = decoId;
  }
  return {
    valid: true,
    terrain: terrain as TerrainId,
    height: height as number,
    ...(deco === undefined ? {} : { deco }),
    ...(ramp ? { rampDir: rampDir as number } : {}),
    ...(kind === null
      ? {}
      : {
          water: {
            kind,
            flowDir: Number.isInteger(flowDir) ? (flowDir as number) : null,
            shoreDistance: Number.isInteger(terrainProps['shoreDistance'])
              ? (terrainProps['shoreDistance'] as number)
              : null,
          },
        }),
  };
}

export function readCells(context: TiledCompileContext, layers: TileLayers): readonly CellData[] {
  return Array.from({ length: context.map.width! * context.map.height! }, (_, index) =>
    terrainCell(context, layers, index),
  );
}

const objectSort = (left: RegionObject, right: RegionObject): number =>
  left.r - right.r || left.q - right.q || compareCodePoints(left.id, right.id);

export function buildChunks(
  context: TiledCompileContext,
  cells: readonly CellData[],
  objects: readonly RegionObject[],
): ChunkResult {
  const width = context.map.width!;
  const height = context.map.height!;
  const terrainTable = [
    ...new Set(cells.flatMap((entry) => (entry.terrain === undefined ? [] : [entry.terrain]))),
  ].sort(compareCodePoints);
  const terrainIndex = new Map(terrainTable.map((terrain, index) => [terrain, index]));
  const baseObjects = objects
    .filter((object) => {
      const chunks = new Set(
        object.cells.map((entry) => `${Math.floor(entry.q / 32)},${Math.floor(entry.r / 32)}`),
      );
      return chunks.size !== 1;
    })
    .sort(objectSort);
  const chunks: JsonValue[] = [];
  for (let chunkR = 0; chunkR < Math.ceil(height / 32); chunkR += 1)
    for (let chunkQ = 0; chunkQ < Math.ceil(width / 32); chunkQ += 1)
      chunks.push(
        chunk(
          context,
          cells,
          objects.filter(
            (object) =>
              !baseObjects.includes(object) &&
              Math.floor(object.q / 32) === chunkQ &&
              Math.floor(object.r / 32) === chunkR,
          ),
          terrainIndex,
          chunkQ,
          chunkR,
        ),
      );
  return { chunks, baseObjects, terrainTable };
}

function chunk(
  context: TiledCompileContext,
  cells: readonly CellData[],
  objects: readonly RegionObject[],
  terrainIndex: ReadonlyMap<TerrainId, number>,
  chunkQ: number,
  chunkR: number,
): JsonValue {
  const terrainBytes =
    terrainIndex.size <= 256
      ? new Uint8Array(REGION_CHUNK_CELLS)
      : new Uint8Array(REGION_CHUNK_CELLS * 2);
  const heights = new Uint8Array(REGION_CHUNK_CELLS);
  const valid: number[] = [];
  const ramps: JsonValue[] = [];
  const water: JsonValue[] = [];
  const decos: JsonValue[] = [];
  for (let localR = 0; localR < REGION_CHUNK_SIZE; localR += 1)
    for (let localQ = 0; localQ < REGION_CHUNK_SIZE; localQ += 1) {
      const q = chunkQ * 32 + localQ;
      const r = chunkR * 32 + localR;
      const local = localR * 32 + localQ;
      const source = r * context.map.width! + q;
      const value = q < context.map.width! && r < context.map.height! ? cells[source] : undefined;
      if (value?.valid !== true) continue;
      valid.push(local);
      heights[local] = value.height!;
      const index = terrainIndex.get(value.terrain!)!;
      if (terrainIndex.size <= 256) terrainBytes[local] = index;
      else {
        terrainBytes[local * 2] = index & 255;
        terrainBytes[local * 2 + 1] = index >> 8;
      }
      if (value.rampDir !== undefined) ramps.push({ index: local, dir: value.rampDir });
      if (value.water !== undefined) water.push({ index: local, ...value.water });
      if (value.deco !== undefined) decos.push({ id: value.deco, index: local });
    }
  return {
    q: chunkQ,
    r: chunkR,
    width: REGION_CHUNK_SIZE,
    height: REGION_CHUNK_SIZE,
    valid: bitset(valid),
    terrainEncoding: terrainIndex.size <= 256 ? 'u8' : 'u16le',
    terrain: base64(terrainBytes),
    heights: base64(heights),
    ramps,
    water,
    precomputedAo: null,
    decos,
    objects: [...objects].sort(objectSort) as unknown as JsonValue,
  };
}
