import { compareCodePoints, type JsonValue } from '@tianshu/shared';
import {
  RegionMapPropertiesSchema,
  RegionMapSchema,
  type RegionMapProperties,
  type RegionObject,
} from '../schemas';
import { buildChunks, readCells } from './tiled-chunks';
import { readLayers } from './tiled-layers';
import { loadTiledContext } from './tiled-load';
import { convertObject } from './tiled-objects';
import { listProperty, propertyRecord, stringProperty } from './tiled-properties';
import type { CompiledRegionMap, RegionMapSource, TiledCompileContext } from './tiled-types';
import { TiledDiagnosticError, mapError, sourceSpan } from './tiled-types';
import type { Diagnostic } from './types';
import { validateMapObjects } from './tiled-validate';

function validateMapHeader(context: TiledCompileContext): void {
  const map = context.map;
  if (map.orientation !== 'orthogonal')
    throw mapError(context, 'TS-CONTENT-MAP-002', 'orientation must be orthogonal', '/orientation');
  if (map.infinite !== false)
    throw mapError(context, 'TS-CONTENT-MAP-002', 'map must explicitly be finite', '/infinite');
  for (const [name, value] of [
    ['width', map.width],
    ['height', map.height],
    ['tilewidth', map.tilewidth],
    ['tileheight', map.tileheight],
  ] as const)
    if (!Number.isSafeInteger(value) || value! <= 0)
      throw mapError(
        context,
        'TS-CONTENT-MAP-002',
        `${name} must be a positive integer`,
        `/${name}`,
      );
  if (map.width! > 256 || map.height! > 256)
    throw mapError(context, 'TS-CONTENT-MAP-015', 'scene dimensions exceed 256', '/width');
}

function mapProperties(context: TiledCompileContext): RegionMapProperties {
  const raw = propertyRecord(context, context.map.properties, '/properties');
  const value = {
    schemaVersion: stringProperty(context, raw, 'schemaVersion', '/properties'),
    regionId: stringProperty(context, raw, 'regionId', '/properties'),
    sceneId: stringProperty(context, raw, 'sceneId', '/properties'),
    chapterScope: [...listProperty(context, raw, 'chapterScope', '/properties')],
    eraLayer: stringProperty(context, raw, 'eraLayer', '/properties'),
    eraPatchRefs: [...listProperty(context, raw, 'eraPatchRefs', '/properties', [])],
    backdropAssetKey:
      raw['backdropAssetKey'] === null || raw['backdropAssetKey'] === ''
        ? null
        : (stringProperty(context, raw, 'backdropAssetKey', '/properties', false) ?? null),
  };
  const parsed = RegionMapPropertiesSchema.safeParse(value);
  if (!parsed.success)
    throw mapError(context, 'TS-CONTENT-MAP-009', parsed.error.issues[0]!.message, '/properties');
  const match = context.source.path.match(
    new RegExp('^content/world/regions/(rg_[^/]+)/(sc_[^/]+)[.]tmj$'),
  );
  if (match === null || parsed.data.regionId !== match[1] || parsed.data.sceneId !== match[2])
    throw mapError(
      context,
      'TS-CONTENT-MAP-016',
      'regionId/sceneId must match the source path',
      '/properties',
    );
  return parsed.data;
}

const sortObjects = (objects: readonly RegionObject[]): RegionObject[] =>
  [...objects].sort(
    (left, right) => left.r - right.r || left.q - right.q || compareCodePoints(left.id, right.id),
  );

export async function compileTiledMap(source: RegionMapSource): Promise<CompiledRegionMap> {
  try {
    const context = await loadTiledContext(source);
    validateMapHeader(context);
    const diagnostics: Diagnostic[] = [];
    if (context.map.width! > 160 || context.map.height! > 160)
      diagnostics.push({
        code: 'TS-CONTENT-MAP-015',
        severity: 'warning',
        message: 'scene exceeds the 160x160 normal authoring size',
        primary: sourceSpan(source.path, source.text, context.offsets, '/width'),
      });
    const properties = mapProperties(context);
    const layers = readLayers(context);
    const cells = readCells(context, layers);
    const width = context.map.width!;
    const heightAt = (q: number, r: number): number => {
      if (
        !Number.isSafeInteger(q) ||
        !Number.isSafeInteger(r) ||
        q < 0 ||
        r < 0 ||
        q >= width ||
        r >= context.map.height!
      )
        throw mapError(
          context,
          'TS-CONTENT-MAP-010',
          `cell ${q},${r} is outside the map`,
          '/layers',
        );
      const value = cells[r * width + q];
      if (value?.valid !== true)
        throw mapError(context, 'TS-CONTENT-MAP-010', `cell ${q},${r} is empty`, '/layers');
      return value.height!;
    };
    const objects = (layers.objects.objects ?? []).map((object, index) =>
      convertObject(
        context,
        object,
        `/layers/${context.map.layers!.indexOf(layers.objects)}/objects/${index}`,
        heightAt,
      ),
    );
    validateMapObjects(context, cells, objects);
    const grouped = buildChunks(context, cells, objects);
    const adjacentRegions = [
      ...new Set(
        objects
          .flatMap((object) => object.class === 'Door' ? [object.targetRegionId] :
            object.class === 'QinggongGate' ? [object.to.region] : [])
          .filter((id) => id !== properties.regionId),
      ),
    ].sort(compareCodePoints);
    const value = {
      schemaVersion: 'region-map.v1',
      id: properties.sceneId,
      regionId: properties.regionId,
      chapterScope: properties.chapterScope,
      eraLayer: properties.eraLayer,
      bounds: { qMin: 0, qMax: width - 1, rMin: 0, rMax: context.map.height! - 1 },
      chunkSize: 32,
      terrainTable: grouped.terrainTable,
      chunks: grouped.chunks,
      objects: grouped.baseObjects,
      playerSpawns: sortObjects(objects.filter((object) => object.class === 'PlayerSpawn')).map(
        (spawn) => spawn.id,
      ),
      adjacentRegions,
      eraPatchRefs: properties.eraPatchRefs,
      backdropAssetKey: properties.backdropAssetKey,
    };
    const parsed = RegionMapSchema.safeParse(value);
    if (!parsed.success)
      throw mapError(context, 'TS-CONTENT-MAP-017', parsed.error.issues[0]!.message, '/');
    return {
      map: parsed.data as unknown as JsonValue,
      diagnostics,
      chapterScopes: properties.chapterScope,
      regionId: properties.regionId,
      sceneId: properties.sceneId,
      backdropAssetKey: properties.backdropAssetKey,
      objects,
      source,
    };
  } catch (error) {
    if (error instanceof TiledDiagnosticError)
      return {
        map: null,
        diagnostics: [error.diagnostic],
        chapterScopes: [],
        regionId: '',
        sceneId: '',
        backdropAssetKey: null,
        objects: [],
        source,
      };
    throw error;
  }
}

export async function validateTiledMaps(
  sources: readonly RegionMapSource[],
): Promise<readonly Diagnostic[]> {
  const compiled = [];
  for (const source of sources) compiled.push(await compileTiledMap(source));
  const diagnostics = [...compiled.flatMap((entry) => entry.diagnostics)];
  diagnostics.push(...validateCompiledTiledMaps(compiled));
  return diagnostics.sort(
    (left, right) =>
      compareCodePoints(left.primary.file, right.primary.file) ||
      left.primary.line - right.primary.line ||
      left.primary.column - right.primary.column ||
      compareCodePoints(left.code, right.code),
  );
}

function mapHasValidCell(map: JsonValue, q: number, r: number): boolean {
  if (map === null || Array.isArray(map) || typeof map !== 'object') return false;
  const record = map as Readonly<Record<string, JsonValue>>;
  const chunks = record['chunks'];
  if (!Array.isArray(chunks)) return false;
  const chunkQ = Math.floor(q / 32); const chunkR = Math.floor(r / 32);
  const chunk = chunks.find((entry) => entry !== null && !Array.isArray(entry) &&
    typeof entry === 'object' && entry['q'] === chunkQ && entry['r'] === chunkR);
  if (chunk === null || Array.isArray(chunk) || typeof chunk !== 'object' ||
      typeof chunk['valid'] !== 'string') return false;
  try {
    const bytes = Uint8Array.from(atob(chunk['valid']), (character) => character.charCodeAt(0));
    const index = (r % 32) * 32 + q % 32;
    return (bytes[index >> 3]! & (1 << (index & 7))) !== 0;
  } catch { return false; }
}

export function validateCompiledTiledMaps(
  maps: readonly CompiledRegionMap[],
): Diagnostic[] {
  const diagnostics = [];
  const validMaps = maps.filter(
    (map) => !map.diagnostics.some((diagnostic) => diagnostic.severity === 'error'),
  );
  const byScene = new Map(
    validMaps
      .map((map) => [`${map.regionId}/${map.sceneId}`, map]),
  );
  for (const map of validMaps)
    for (const door of map.objects.filter((object) => object.class === 'Door')) {
      const target = byScene.get(`${door.targetRegionId}/${door.targetSceneId}`);
      if (target === undefined) {
        diagnostics.push({
          code: 'TS-CONTENT-MAP-012',
          severity: 'error' as const,
          message: `${door.id} target scene is missing`,
          primary: { file: map.source.path, line: 1, column: 1, endLine: 1, endColumn: 1 },
        });
        continue;
      }
      const pair = target.objects.find(
        (object) => object.class === 'Door' && object.id === door.pairId,
      );
      const spawn = target.objects.find(
        (object) => object.class === 'PlayerSpawn' && object.id === door.targetSpawnId,
      );
      const returnDoor =
        door.returnDoorId === undefined
          ? undefined
          : target.objects.find(
              (object) => object.class === 'Door' && object.id === door.returnDoorId,
            );
      if (
        pair?.class !== 'Door' ||
        (pair.id === door.id && target === map) ||
        spawn?.class !== 'PlayerSpawn' ||
        (door.oneWay &&
          (returnDoor?.class !== 'Door' ||
            returnDoor.targetRegionId !== map.regionId ||
            returnDoor.targetSceneId !== map.sceneId)) ||
        (!door.oneWay &&
          (pair.targetRegionId !== map.regionId ||
            pair.targetSceneId !== map.sceneId ||
            pair.pairId !== door.id))
      )
        diagnostics.push({
          code: 'TS-CONTENT-MAP-012',
          severity: 'error' as const,
          message: `${door.id} transfer pair or spawn is not closed`,
          primary: { file: map.source.path, line: 1, column: 1, endLine: 1, endColumn: 1 },
        });
    }
  for (const map of validMaps)
    for (const gate of map.objects.filter((object) => object.class === 'QinggongGate')) {
      const target = byScene.get(`${gate.to.region}/${gate.to.scene}`);
      const returnDoor = gate.returnDoorId === null ? undefined : target?.objects.find(
        (object) => object.class === 'Door' && object.id === gate.returnDoorId,
      );
      if (
        target === undefined ||
        gate.to.cell.q < 0 ||
        gate.to.cell.r < 0 ||
        !mapHasValidCell(target.map, gate.to.cell.q, gate.to.cell.r) ||
        (gate.oneWay && (returnDoor?.class !== 'Door' ||
          returnDoor.targetRegionId !== map.regionId ||
          returnDoor.targetSceneId !== map.sceneId))
      )
        diagnostics.push({
          code: 'TS-CONTENT-MAP-014',
          severity: 'error' as const,
          message: `${gate.id} target scene or cell is missing`,
          primary: { file: map.source.path, line: 1, column: 1, endLine: 1, endColumn: 1 },
        });
    }
  return diagnostics;
}
