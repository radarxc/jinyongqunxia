import type { JsonValue } from '@tianshu/shared';
import { GateExprSchema, QinggongGateObjectSchema, type RegionObject } from '../schemas';
import type { TiledCompileContext, TiledObject } from './tiled-types';
import { mapError } from './tiled-types';
import { assertOnlyProperties, booleanProperty, intProperty, jsonProperty, listProperty,
  numberProperty, objectClass, propertyRecord, stringProperty } from './tiled-properties';

const CLASSES = new Set(['NpcSpawn', 'PlayerSpawn', 'EnemyZone', 'Door', 'Trigger',
  'QinggongGate', 'Chest', 'CameraHint', 'BattleArena', 'Building', 'Light']);
const cell = (q: number, r: number, heightAt: (q: number, r: number) => number) =>
  ({ q, r, h: heightAt(q, r) });

function coordinates(context: TiledCompileContext, object: TiledObject, pointer: string,
  heightAt: (q: number, r: number) => number): { q: number; r: number; h: number }[] {
  if (object.gid !== undefined || object.text !== undefined || object.rotation !== undefined && object.rotation !== 0 ||
      object.polyline !== undefined) throw mapError(context, 'TS-CONTENT-MAP-010', 'unsupported object geometry or rotation', pointer);
  const tileWidth = context.map.tilewidth!; const tileHeight = context.map.tileheight!;
  const x = object.x; const y = object.y;
  if (typeof x !== 'number' || typeof y !== 'number' || x % tileWidth !== 0 || y % tileHeight !== 0)
    throw mapError(context, 'TS-CONTENT-MAP-010', 'object anchor must lie on a tile grid point', pointer);
  if (object.polygon !== undefined) {
    const result = object.polygon.map((point, index) => {
      const absoluteX = x + point.x; const absoluteY = y + point.y;
      if (absoluteX % tileWidth !== 0 || absoluteY % tileHeight !== 0)
        throw mapError(context, 'TS-CONTENT-MAP-010', 'polygon point must lie on tile grid', `${pointer}/polygon/${index}`);
      return cell(absoluteX / tileWidth, absoluteY / tileHeight, heightAt);
    });
    return result.length === 0 ? [cell(x / tileWidth, y / tileHeight, heightAt)] : result;
  }
  const width = object.width ?? 0; const height = object.height ?? 0;
  if (width % tileWidth !== 0 || height % tileHeight !== 0)
    throw mapError(context, 'TS-CONTENT-MAP-010', 'object rectangle must align to tiles', pointer);
  const columns = Math.max(1, width / tileWidth); const rows = Math.max(1, height / tileHeight);
  return Array.from({ length: columns * rows }, (_, index) =>
    cell(x / tileWidth + index % columns, y / tileHeight + Math.floor(index / columns), heightAt));
}

const rect = (properties: Record<string, unknown>, prefix: string, fallback: RegionObject['cells']) => ({
  q: typeof properties[`${prefix}Q`] === 'number' ? properties[`${prefix}Q`] as number : fallback[0]!.q,
  r: typeof properties[`${prefix}R`] === 'number' ? properties[`${prefix}R`] as number : fallback[0]!.r,
  width: typeof properties[`${prefix}Width`] === 'number' ? properties[`${prefix}Width`] as number : 1,
  height: typeof properties[`${prefix}Height`] === 'number' ? properties[`${prefix}Height`] as number : 1,
});
const idOf = (context: TiledCompileContext, object: TiledObject, properties: Record<string, unknown>, pointer: string): string =>
  stringProperty(context, properties, 'id', `${pointer}/properties`, false) ?? object.name ?? `object_${object.id ?? 0}`;

function common(context: TiledCompileContext, object: TiledObject, properties: Record<string, unknown>,
  pointer: string, heightAt: (q: number, r: number) => number) {
  const cells = coordinates(context, object, pointer, heightAt); const first = cells[0]!;
  return { id: idOf(context, object, properties, pointer), q: first.q, r: first.r, h: first.h, cells };
}
function gateIntent(context: TiledCompileContext, properties: Record<string, unknown>, pointer: string) {
  if (properties['requiresQigong'] === undefined && properties['gateIntent'] === undefined) return undefined;
  const requiresQigong = typeof properties['requiresQigong'] === 'number' ? properties['requiresQigong'] : 0;
  const intent = typeof properties['gateIntent'] === 'string' ? properties['gateIntent'] : 'side';
  if (!Number.isInteger(requiresQigong) || requiresQigong < 0 || requiresQigong > 5 ||
      !['main', 'side', 'secret', 'hidden'].includes(intent))
    throw mapError(context, 'TS-CONTENT-MAP-009', 'gateIntent is invalid', `${pointer}/properties`);
  return { requiresQigong, intent: intent as 'main' | 'side' | 'secret' | 'hidden' };
}

const baseAllowed = ['id'];
const assert = (context: TiledCompileContext, properties: Record<string, unknown>, names: readonly string[], pointer: string) =>
  assertOnlyProperties(context, properties, [...baseAllowed, ...names], `${pointer}/properties`);
const hexProperty = (context: TiledCompileContext, properties: Record<string, unknown>, prefix: string,
  pointer: string) => ({
    q: intProperty(context, properties, `${prefix}Q`, pointer),
    r: intProperty(context, properties, `${prefix}R`, pointer),
  });
function gateAlternatives(context: TiledCompileContext, properties: Record<string, unknown>, pointer: string) {
  const input = jsonProperty(context, properties, 'alt', pointer, []);
  if (!Array.isArray(input))
    throw mapError(context, 'TS-CONTENT-MAP-014', 'alt must be a JSON array', pointer);
  const parsed = GateExprSchema.array().safeParse(input);
  if (!parsed.success)
    throw mapError(context, 'TS-CONTENT-MAP-014', `invalid alt: ${parsed.error.issues[0]!.message}`, pointer);
  return parsed.data;
}

export function convertObject(context: TiledCompileContext, object: TiledObject, pointer: string,
  heightAt: (q: number, r: number) => number): RegionObject {
  const kind = objectClass(context, object, `${pointer}/type`);
  if (!CLASSES.has(kind)) throw mapError(context, 'TS-CONTENT-MAP-009', `unknown object class ${kind}`, `${pointer}/type`);
  const properties = propertyRecord(context, object.properties, `${pointer}/properties`);
  const base = common(context, object, properties, pointer, heightAt);
  const textKey = stringProperty(context, properties, 'textKey', `${pointer}/properties`, false);
  const facing = properties['facing'] === undefined ? undefined : intProperty(context, properties, 'facing', `${pointer}/properties`, 0, 5);
  if (kind === 'NpcSpawn') { assert(context, properties, ['npcId', 'facing', 'textKey', 'requiresQigong', 'gateIntent'], pointer);
    return { ...base, class: kind, npcId: stringProperty(context, properties, 'npcId', pointer)!,
      ...(facing === undefined ? {} : { facing }), ...(textKey === undefined ? {} : { textKey }),
      ...(gateIntent(context, properties, pointer) === undefined ? {} : { gateIntent: gateIntent(context, properties, pointer) }) }; }
  if (kind === 'PlayerSpawn') { assert(context, properties, ['facing', 'safe', 'entry'], pointer);
    return { ...base, class: kind, ...(facing === undefined ? {} : { facing }),
      safe: booleanProperty(context, properties, 'safe', pointer, false),
      entry: booleanProperty(context, properties, 'entry', pointer, true) }; }
  if (kind === 'EnemyZone') { assert(context, properties, ['encounterId', 'spawnPointId', 'requiresQigong', 'gateIntent'], pointer);
    const spawnPointId = stringProperty(context, properties, 'spawnPointId', pointer, false);
    return { ...base, class: kind, encounterId: stringProperty(context, properties, 'encounterId', pointer)!,
      ...(spawnPointId === undefined ? {} : { spawnPointId }),
      ...(gateIntent(context, properties, pointer) === undefined ? {} : { gateIntent: gateIntent(context, properties, pointer) }) }; }
  return convertObjectTail(context, kind, base, properties, textKey, pointer);
}

type Base = ReturnType<typeof common>;
function convertObjectTail(context: TiledCompileContext, kind: string, base: Base,
  properties: Record<string, unknown>, textKey: string | undefined, pointer: string): RegionObject {
  if (kind === 'Door') { assert(context, properties, ['mode', 'pairId', 'oneWay', 'targetRegionId',
    'targetSceneId', 'targetSpawnId', 'textKey', 'lockedBy', 'returnDoorId'], pointer);
    const lockedBy = stringProperty(context, properties, 'lockedBy', pointer, false);
    const returnDoorId = stringProperty(context, properties, 'returnDoorId', pointer, false);
    return { ...base, class: kind, mode: stringProperty(context, properties, 'mode', pointer)! as 'door' | 'portal',
      pairId: stringProperty(context, properties, 'pairId', pointer)!,
      oneWay: booleanProperty(context, properties, 'oneWay', pointer, false),
      targetRegionId: stringProperty(context, properties, 'targetRegionId', pointer)!,
      targetSceneId: stringProperty(context, properties, 'targetSceneId', pointer)!,
      targetSpawnId: stringProperty(context, properties, 'targetSpawnId', pointer)!,
      ...(textKey === undefined ? {} : { textKey }), ...(lockedBy === undefined ? {} : { lockedBy }),
      ...(returnDoorId === undefined ? {} : { returnDoorId }) };
  }
  if (kind === 'Trigger') { assert(context, properties, ['eventId', 'action', 'textKey', 'once', 'autosave', 'safe'], pointer);
    const eventId = stringProperty(context, properties, 'eventId', pointer, false);
    const action = stringProperty(context, properties, 'action', pointer, false);
    return { ...base, class: kind, ...(eventId === undefined ? {} : { eventId }),
      ...(action === undefined ? {} : { action }), ...(textKey === undefined ? {} : { textKey }),
      once: booleanProperty(context, properties, 'once', pointer, false),
      autosave: booleanProperty(context, properties, 'autosave', pointer, false),
      safe: booleanProperty(context, properties, 'safe', pointer, false) };
  }
  if (kind === 'QinggongGate') { assert(context, properties, ['kind', 'tier', 'fromQ', 'fromR',
    'toRegion', 'toScene', 'toQ', 'toR', 'height', 'width', 'run', 'stages', 'intent',
    'reveal', 'alt', 'earliest', 'oneWay', 'returnDoorId', 'hintTextKey'], pointer);
    const earliest = properties['earliest'] === null ? null : numberProperty(context, properties, 'earliest', pointer, 0);
    const returnDoorId = properties['returnDoorId'] === null ? null :
      stringProperty(context, properties, 'returnDoorId', pointer, false) ?? null;
    const value = { ...base, class: kind, kind: stringProperty(context, properties, 'kind', pointer)!,
      tier: intProperty(context, properties, 'tier', pointer, 1, 5),
      from: hexProperty(context, properties, 'from', pointer),
      to: { region: stringProperty(context, properties, 'toRegion', pointer)!,
        scene: stringProperty(context, properties, 'toScene', pointer)!,
        cell: hexProperty(context, properties, 'to', pointer) },
      height: intProperty(context, properties, 'height', pointer, 0),
      width: intProperty(context, properties, 'width', pointer, 0),
      run: intProperty(context, properties, 'run', pointer, 0),
      stages: intProperty(context, properties, 'stages', pointer, 0),
      intent: stringProperty(context, properties, 'intent', pointer)!,
      reveal: stringProperty(context, properties, 'reveal', pointer)!,
      alt: gateAlternatives(context, properties, pointer), earliest,
      oneWay: booleanProperty(context, properties, 'oneWay', pointer, false), returnDoorId,
      hintTextKey: stringProperty(context, properties, 'hintTextKey', pointer)! };
    const parsed = QinggongGateObjectSchema.safeParse(value);
    if (!parsed.success)
      throw mapError(context, 'TS-CONTENT-MAP-014', parsed.error.issues[0]!.message, pointer);
    return parsed.data;
  }
  if (kind === 'Chest') { assert(context, properties, ['lootRef', 'textKey', 'requiresQigong', 'gateIntent'], pointer);
    return { ...base, class: kind, lootRef: stringProperty(context, properties, 'lootRef', pointer)!,
      ...(textKey === undefined ? {} : { textKey }),
      ...(gateIntent(context, properties, pointer) === undefined ? {} : { gateIntent: gateIntent(context, properties, pointer) }) }; }
  if (kind === 'CameraHint') { assert(context, properties, ['yawDeg', 'zoom', 'allowRotation',
    'boundsQ', 'boundsR', 'boundsWidth', 'boundsHeight'], pointer);
    return { ...base, class: kind, yawDeg: intProperty(context, properties, 'yawDeg', pointer, 0, 315) as never,
      zoom: numberProperty(context, properties, 'zoom', pointer, 0),
      allowRotation: booleanProperty(context, properties, 'allowRotation', pointer),
      bounds: rect(properties, 'bounds', base.cells) }; }
  if (kind === 'BattleArena') { assert(context, properties, ['encounterId', 'playerCapacity', 'enemyCapacity', 'narrow'], pointer);
    const encounterId = stringProperty(context, properties, 'encounterId', pointer, false);
    return { ...base, class: kind, ...(encounterId === undefined ? {} : { encounterId }),
      playerCapacity: intProperty(context, properties, 'playerCapacity', pointer, 1),
      enemyCapacity: intProperty(context, properties, 'enemyCapacity', pointer, 1),
      narrow: booleanProperty(context, properties, 'narrow', pointer, false) }; }
  return convertVisualObject(context, kind, base, properties, pointer);
}

function convertVisualObject(context: TiledCompileContext, kind: string, base: Base,
  properties: Record<string, unknown>, pointer: string): RegionObject {
  if (kind === 'Building') { assert(context, properties, ['footprintQ', 'footprintR', 'footprintWidth',
    'footprintHeight', 'interiorQ', 'interiorR', 'interiorWidth', 'interiorHeight', 'roofGroup', 'cutawayWalls'], pointer);
    return { ...base, class: kind, footprint: rect(properties, 'footprint', base.cells),
      interiorRect: rect(properties, 'interior', base.cells),
      roofGroup: stringProperty(context, properties, 'roofGroup', pointer)!,
      cutawayWalls: listProperty(context, properties, 'cutawayWalls', pointer, [])
        .map((entry) => Number(entry)) as (0 | 1 | 2 | 3 | 4 | 5)[] };
  }
  if (kind === 'Light') { assert(context, properties, ['color', 'radius', 'intensity', 'mountHeight', 'schedule', 'flicker'], pointer);
    const inputColor = stringProperty(context, properties, 'color', pointer)!;
    const color = /^#[0-9A-Fa-f]{6}$/u.test(inputColor) ? inputColor.toLowerCase()
      : /^#ff[0-9A-Fa-f]{6}$/iu.test(inputColor) ? `#${inputColor.slice(3).toLowerCase()}`
      : undefined;
    if (color === undefined)
      throw mapError(context, 'TS-CONTENT-MAP-009',
        'color must be opaque Tiled #AARRGGBB or runtime #RRGGBB', `${pointer}/properties`);
    return { ...base, class: kind, color,
      radius: numberProperty(context, properties, 'radius', pointer, 0),
      intensity: numberProperty(context, properties, 'intensity', pointer, 0),
      mountHeight: numberProperty(context, properties, 'mountHeight', pointer, 0),
      schedule: stringProperty(context, properties, 'schedule', pointer)!,
      flicker: booleanProperty(context, properties, 'flicker', pointer, false) };
  }
  throw mapError(context, 'TS-CONTENT-MAP-009', `unknown object class ${kind}`, pointer);
}

export function objectJson(value: RegionObject): JsonValue { return value as unknown as JsonValue; }
