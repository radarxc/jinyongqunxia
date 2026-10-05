import { readFile } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { JsonSourceError, parseJsonWithPointers, sourcePosition } from './tiled-json';
import type {
  LoadedTileset,
  RegionMapSource,
  TiledCompileContext,
  TiledMap,
  TiledTileset,
} from './tiled-types';
import { TiledDiagnosticError, mapError } from './tiled-types';

const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function parseFailure(source: RegionMapSource, error: unknown): TiledDiagnosticError {
  const offset = error instanceof JsonSourceError ? error.offset : 0;
  const position = sourcePosition(source.text, offset);
  return new TiledDiagnosticError({
    code: 'TS-CONTENT-MAP-001',
    severity: 'error',
    message: error instanceof Error ? error.message : String(error),
    primary: {
      file: source.path,
      line: position.line,
      column: position.column,
      endLine: position.line,
      endColumn: position.column + 1,
    },
  });
}

function safeExternalPath(source: RegionMapSource, relative: string): string {
  if (extname(relative).toLowerCase() !== '.tsj')
    throw new TypeError(`TS-CONTENT-MAP-004:external tileset must be JSON .tsj:${relative}`);
  const resolved = resolve(dirname(source.absolutePath), relative);
  const contentRoot = resolve(dirname(source.absolutePath), '..', '..', '..');
  const tiledRoot = resolve(contentRoot, 'tiled');
  if (!resolved.startsWith(tiledRoot + sep))
    throw new TypeError(`TS-CONTENT-MAP-004:tileset path escapes content/tiled:${relative}`);
  return resolved;
}

async function loadTilesets(
  source: RegionMapSource,
  map: TiledMap,
  context: Pick<TiledCompileContext, 'source' | 'offsets'>,
): Promise<readonly LoadedTileset[]> {
  if (!Array.isArray(map.tilesets) || map.tilesets.length === 0)
    throw mapError(context, 'TS-CONTENT-MAP-004', 'at least one tileset is required', '/tilesets');
  const loaded: LoadedTileset[] = [];
  for (let index = 0; index < map.tilesets.length; index += 1) {
    const reference = map.tilesets[index]!;
    const pointer = `/tilesets/${index}`;
    if (!Number.isSafeInteger(reference.firstgid) || reference.firstgid < 1)
      throw mapError(
        context,
        'TS-CONTENT-MAP-004',
        'firstgid must be a positive integer',
        `${pointer}/firstgid`,
      );
    let tileset: unknown = reference;
    if (typeof reference.source === 'string') {
      let text: string;
      try {
        text = await readFile(safeExternalPath(source, reference.source), 'utf8');
      } catch (error) {
        if (error instanceof TypeError)
          throw mapError(context, 'TS-CONTENT-MAP-004', error.message, `${pointer}/source`);
        throw mapError(
          context,
          'TS-CONTENT-MAP-004',
          `cannot read tileset ${reference.source}`,
          `${pointer}/source`,
        );
      }
      try {
        tileset = parseJsonWithPointers(text).value;
      } catch {
        throw mapError(
          context,
          'TS-CONTENT-MAP-004',
          `invalid tileset JSON ${reference.source}`,
          `${pointer}/source`,
        );
      }
    }
    if (!object(tileset))
      throw mapError(context, 'TS-CONTENT-MAP-004', 'tileset must be an object', pointer);
    loaded.push({
      firstgid: reference.firstgid,
      sourcePointer: pointer,
      tileset: tileset as TiledTileset,
    });
  }
  loaded.sort((left, right) => left.firstgid - right.firstgid);
  if (loaded.some((entry, index) => index > 0 && entry.firstgid === loaded[index - 1]!.firstgid))
    throw mapError(
      context,
      'TS-CONTENT-MAP-004',
      'tileset firstgid values must be unique',
      '/tilesets',
    );
  return loaded;
}

export async function loadTiledContext(source: RegionMapSource): Promise<TiledCompileContext> {
  let parsed;
  try {
    parsed = parseJsonWithPointers(source.text);
  } catch (error) {
    throw parseFailure(source, error);
  }
  if (!object(parsed.value))
    throw parseFailure(source, new JsonSourceError('map root must be an object', 0));
  const map = parsed.value as TiledMap;
  const partial = { source, offsets: parsed.offsets };
  const tilesets = await loadTilesets(source, map, partial);
  return { source, map, offsets: parsed.offsets, tilesets };
}
