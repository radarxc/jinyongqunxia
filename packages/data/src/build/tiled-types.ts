import type { JsonValue } from '@tianshu/shared';
import type { RegionObject } from '../schemas';
import type { Diagnostic, SourceSpan } from './types';

export interface TiledProperty { readonly name: string; readonly type?: string; readonly value: unknown; }
export interface TiledTile { readonly id: number; readonly properties?: readonly TiledProperty[]; }
export interface TiledTileset {
  readonly name?: string; readonly tilecount?: number; readonly tiles?: readonly TiledTile[];
}
export interface TiledTilesetRef extends Partial<TiledTileset> { readonly firstgid: number; readonly source?: string; }
export interface TiledLayer {
  readonly id?: number; readonly name: string; readonly type: string; readonly width?: number;
  readonly height?: number; readonly encoding?: string; readonly compression?: string;
  readonly data?: unknown; readonly objects?: readonly TiledObject[];
}
export interface TiledPoint { readonly x: number; readonly y: number; }
export interface TiledObject {
  readonly id?: number; readonly name?: string; readonly type?: string; readonly class?: string;
  readonly x?: number; readonly y?: number; readonly width?: number; readonly height?: number;
  readonly rotation?: number; readonly point?: boolean; readonly polygon?: readonly TiledPoint[];
  readonly polyline?: readonly TiledPoint[]; readonly properties?: readonly TiledProperty[];
  readonly text?: unknown; readonly gid?: number;
}
export interface TiledMap {
  readonly type?: string; readonly version?: string | number; readonly orientation?: string;
  readonly infinite?: boolean; readonly width?: number; readonly height?: number;
  readonly tilewidth?: number; readonly tileheight?: number; readonly layers?: readonly TiledLayer[];
  readonly tilesets?: readonly TiledTilesetRef[]; readonly properties?: readonly TiledProperty[];
}
export interface RegionMapSource { readonly path: string; readonly absolutePath: string; readonly text: string; }
export interface LoadedTileset {
  readonly firstgid: number; readonly sourcePointer: string; readonly tileset: TiledTileset;
}
export interface TiledCompileContext {
  readonly source: RegionMapSource; readonly map: TiledMap; readonly offsets: ReadonlyMap<string, number>;
  readonly tilesets: readonly LoadedTileset[];
}
export interface CompiledRegionMap {
  readonly map: JsonValue; readonly diagnostics: readonly Diagnostic[]; readonly chapterScopes: readonly string[];
  readonly regionId: string; readonly sceneId: string; readonly backdropAssetKey: string | null;
  readonly objects: readonly RegionObject[];
  readonly source: RegionMapSource;
}

export class TiledDiagnosticError extends TypeError {
  constructor(readonly diagnostic: Diagnostic) { super(`${diagnostic.code}:${diagnostic.message}`); }
}

export function sourceSpan(file: string, text: string, offsets: ReadonlyMap<string, number>,
  pointer: string): SourceSpan {
  const offset = offsets.get(pointer) ?? offsets.get('') ?? 0; let line = 1; let start = 0;
  for (let index = 0; index < offset; index += 1) if (text[index] === '\n') { line += 1; start = index + 1; }
  const column = offset - start + 1;
  return { file, line, column, endLine: line, endColumn: column + 1 };
}

export function mapError(context: Pick<TiledCompileContext, 'source' | 'offsets'>, code: string,
  message: string, pointer = ''): TiledDiagnosticError {
  return new TiledDiagnosticError({ code, severity: 'error', message: `${message} (${pointer || '/'})`,
    primary: sourceSpan(context.source.path, context.source.text, context.offsets, pointer) });
}
