export interface RigClipMapEntry {
  readonly clipId: string; readonly rate: number; readonly movement: boolean;
  readonly nearHandWeapon: boolean; readonly yawAssistMaxDeg: number;
}
export type RigClipMap = Readonly<Record<string, RigClipMapEntry>>;
interface ClipMapDocument {
  readonly schemaVersion: 'event.v1'; readonly actions: readonly { readonly payload?: unknown }[];
}

function fail(detail: string): never { throw new Error(`RIG_CLIP_MAP_INVALID:${detail}`); }
function object(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(field);
  return value as Record<string, unknown>;
}
export function loadRigClipMap(value: unknown): RigClipMap {
  const document = object(value, 'document') as unknown as ClipMapDocument;
  const payload = document.schemaVersion === 'event.v1' ? document.actions?.[0]?.payload : value;
  const root = object(payload, 'payload');
  if (root['schema'] !== 'tianshu-clip-map.v1') fail('schema'); const entries = object(root['clips'], 'clips');
  const output = Object.create(null) as Record<string, RigClipMapEntry>;
  for (const [key, raw] of Object.entries(entries)) {
    if (!/^[a-z][a-z0-9_]*$/.test(key)) fail(`key:${key}`); const item = object(raw, key);
    const fields = Object.keys(item).sort().join(',');
    if (fields !== 'clipId,movement,nearHandWeapon,rate,yawAssistMaxDeg') fail(`fields:${key}`);
    const clipId = item['clipId']; const rate = item['rate']; const movement = item['movement'];
    const nearHandWeapon = item['nearHandWeapon']; const yawAssistMaxDeg = item['yawAssistMaxDeg'];
    if (typeof clipId !== 'string' || !/^clip_[a-z0-9]+(?:_[a-z0-9]+)*$/.test(clipId) ||
        typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0 ||
        typeof movement !== 'boolean' || typeof nearHandWeapon !== 'boolean' ||
        typeof yawAssistMaxDeg !== 'number' || !Number.isFinite(yawAssistMaxDeg) || Math.abs(yawAssistMaxDeg) > 30) fail(`entry:${key}`);
    output[key] = { clipId, rate, movement, nearHandWeapon, yawAssistMaxDeg };
  }
  if (Object.keys(output).length === 0) fail('empty'); return Object.freeze(output);
}
export function resolveRigClipKey(map: RigClipMap, key: string): RigClipMapEntry {
  if (!Object.prototype.hasOwnProperty.call(map, key)) throw new Error(`RIG_CLIP_MAP_UNKNOWN_KEY:${key}`);
  return map[key]!;
}
