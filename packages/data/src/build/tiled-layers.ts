import type { TiledCompileContext, TiledLayer, TiledTile, TiledTileset } from './tiled-types';
import { mapError } from './tiled-types';
import { propertyRecord } from './tiled-properties';

const FLIP_MASK = 0xf0000000;
const GID_MASK = 0x0fffffff;

export interface TileLayers {
  readonly terrain: readonly number[];
  readonly terrainPointer: string;
  readonly height: readonly number[];
  readonly heightPointer: string;
  readonly deco: readonly number[];
  readonly decoPointer: string;
  readonly nav?: readonly number[];
  readonly objects: TiledLayer;
}
export interface ResolvedTile {
  readonly tileset: TiledTileset;
  readonly tile?: TiledTile;
  readonly localId: number;
}

function decodeBase64(
  context: TiledCompileContext,
  layer: TiledLayer,
  pointer: string,
  cells: number,
): number[] {
  if (layer.compression !== undefined && layer.compression !== '')
    throw mapError(
      context,
      'TS-CONTENT-MAP-018',
      'compressed tile layers are forbidden',
      `${pointer}/compression`,
    );
  if (typeof layer.data !== 'string')
    throw mapError(
      context,
      'TS-CONTENT-MAP-018',
      'base64 layer data must be a string',
      `${pointer}/data`,
    );
  const encoded = layer.data.replace(/\s/gu, '');
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u.test(encoded))
    throw mapError(context, 'TS-CONTENT-MAP-018', 'invalid base64 tile layer', `${pointer}/data`);
  const bytes = Buffer.from(encoded, 'base64');
  if (bytes.byteLength !== cells * 4)
    throw mapError(
      context,
      'TS-CONTENT-MAP-018',
      'base64 tile layer byte length mismatch',
      `${pointer}/data`,
    );
  return Array.from({ length: cells }, (_, index) => bytes.readUInt32LE(index * 4));
}

function tileData(
  context: TiledCompileContext,
  layer: TiledLayer,
  pointer: string,
  cells: number,
): number[] {
  if (layer.width !== context.map.width || layer.height !== context.map.height)
    throw mapError(
      context,
      'TS-CONTENT-MAP-018',
      'tile layer dimensions must match the map',
      pointer,
    );
  if (layer.encoding === 'base64') return decodeBase64(context, layer, pointer, cells);
  if (layer.compression !== undefined && layer.compression !== '')
    throw mapError(
      context,
      'TS-CONTENT-MAP-018',
      'compressed tile layers are forbidden',
      `${pointer}/compression`,
    );
  if (layer.encoding !== undefined && layer.encoding !== 'csv')
    throw mapError(
      context,
      'TS-CONTENT-MAP-018',
      'only CSV or uncompressed base64 layers are accepted',
      `${pointer}/encoding`,
    );
  if (
    !Array.isArray(layer.data) ||
    layer.data.length !== cells ||
    layer.data.some(
      (gid) => !Number.isSafeInteger(gid) || (gid as number) < 0 || (gid as number) > 0xffffffff,
    )
  )
    throw mapError(
      context,
      'TS-CONTENT-MAP-018',
      'CSV layer must contain one uint32 GID per cell',
      `${pointer}/data`,
    );
  return layer.data as number[];
}

export function stripGidFlags(context: TiledCompileContext, gid: number, pointer: string): number {
  const unsigned = gid >>> 0;
  if ((unsigned & FLIP_MASK) !== 0)
    throw mapError(
      context,
      'TS-CONTENT-MAP-005',
      `flipped or rotated GID ${unsigned} is forbidden`,
      pointer,
    );
  return unsigned & GID_MASK;
}

export function resolveTile(
  context: TiledCompileContext,
  gid: number,
  pointer: string,
): ResolvedTile {
  const clean = stripGidFlags(context, gid, pointer);
  if (clean === 0) throw mapError(context, 'TS-CONTENT-MAP-004', 'empty GID has no tile', pointer);
  const reference = [...context.tilesets].reverse().find((entry) => clean >= entry.firstgid);
  if (reference === undefined)
    throw mapError(context, 'TS-CONTENT-MAP-004', `unresolved GID ${clean}`, pointer);
  const localId = clean - reference.firstgid;
  const count = reference.tileset.tilecount;
  if (count !== undefined && (!Number.isSafeInteger(count) || localId >= count))
    throw mapError(context, 'TS-CONTENT-MAP-004', `GID ${clean} exceeds tileset`, pointer);
  const tile = reference.tileset.tiles?.find((entry) => entry.id === localId);
  return { tileset: reference.tileset, localId, ...(tile === undefined ? {} : { tile }) };
}

export function tileProperties(
  context: TiledCompileContext,
  gid: number,
  pointer: string,
): Record<string, unknown> {
  const resolved = resolveTile(context, gid, pointer);
  return propertyRecord(context, resolved.tile?.properties, pointer);
}

export function readLayers(context: TiledCompileContext): TileLayers {
  const layers = context.map.layers;
  if (!Array.isArray(layers))
    throw mapError(context, 'TS-CONTENT-MAP-018', 'layers are required', '/layers');
  const allowed = new Set(['terrain', 'height', 'deco', 'objects', 'nav']);
  const grouped = new Map<string, { layer: TiledLayer; pointer: string }[]>();
  layers.forEach((layer, index) => {
    if (!allowed.has(layer.name))
      throw mapError(
        context,
        'TS-CONTENT-MAP-018',
        `unknown layer ${layer.name}`,
        `/layers/${index}/name`,
      );
    const entries = grouped.get(layer.name) ?? [];
    entries.push({ layer, pointer: `/layers/${index}` });
    grouped.set(layer.name, entries);
  });
  for (const name of ['terrain', 'height', 'deco', 'objects'])
    if (grouped.get(name)?.length !== 1)
      throw mapError(
        context,
        'TS-CONTENT-MAP-018',
        `${name} layer must occur exactly once`,
        '/layers',
      );
  if ((grouped.get('nav')?.length ?? 0) > 1)
    throw mapError(context, 'TS-CONTENT-MAP-018', 'nav layer must be unique', '/layers');
  for (const name of ['terrain', 'height', 'deco', 'nav']) {
    const entry = grouped.get(name)?.[0];
    if (entry !== undefined && entry.layer.type !== 'tilelayer')
      throw mapError(
        context,
        'TS-CONTENT-MAP-018',
        `${name} must be a tile layer`,
        `${entry.pointer}/type`,
      );
  }
  const objectEntry = grouped.get('objects')![0]!;
  if (objectEntry.layer.type !== 'objectgroup')
    throw mapError(
      context,
      'TS-CONTENT-MAP-018',
      'objects must be an object layer',
      `${objectEntry.pointer}/type`,
    );
  const cells = context.map.width! * context.map.height!;
  const data = (name: string): readonly number[] => {
    const entry = grouped.get(name)![0]!;
    return tileData(context, entry.layer, entry.pointer, cells);
  };
  const navEntry = grouped.get('nav')?.[0];
  return {
    terrain: data('terrain'),
    terrainPointer: grouped.get('terrain')![0]!.pointer,
    height: data('height'),
    heightPointer: grouped.get('height')![0]!.pointer,
    deco: data('deco'),
    decoPointer: grouped.get('deco')![0]!.pointer,
    objects: objectEntry.layer,
    ...(navEntry === undefined
      ? {}
      : { nav: tileData(context, navEntry.layer, navEntry.pointer, cells) }),
  };
}
