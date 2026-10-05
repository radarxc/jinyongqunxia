import { parseYamlFile } from '../content-registry';
export { fixupContentRefs } from '../content-remap';
import type { IdRemap } from '../schemas';

const namespace = (id: string): string => {
  const separator = id.indexOf('_');
  if (separator <= 0) throw new TypeError(`REMAP_ID:${id}`);
  return id.slice(0, separator + 1);
};

export function validateIdRemaps(value: unknown, definedIds: ReadonlySet<string>): readonly IdRemap[] {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new TypeError('REMAP_DOCUMENT');
  const document = value as Record<string, unknown>;
  if (document['schemaVersion'] !== 'id-remaps.v1' || !Array.isArray(document['remaps']) ||
      Object.keys(document).some((key) => !['schemaVersion', 'remaps'].includes(key))) throw new TypeError('REMAP_DOCUMENT');
  const direct = new Map<string, string>(); const records: IdRemap[] = [];
  for (const raw of document['remaps']) {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw new TypeError('REMAP_ENTRY');
    const item = raw as Record<string, unknown>;
    if (Array.isArray(item['to'])) throw new TypeError(`REMAP_ONE_TO_MANY:${String(item['from'])}`);
    if (Object.keys(item).some((key) => !['from', 'to', 'since', 'reason'].includes(key)) ||
        typeof item['from'] !== 'string' || typeof item['to'] !== 'string' ||
        typeof item['since'] !== 'string' || !/^[a-f0-9]{64}$/u.test(item['since']) ||
        typeof item['reason'] !== 'string' || item['reason'].length === 0) throw new TypeError('REMAP_ENTRY');
    if (direct.has(item['from'])) throw new TypeError(`REMAP_FROM_DUPLICATE:${item['from']}`);
    if (definedIds.has(item['from'])) throw new TypeError(`REMAP_FROM_DEFINED:${item['from']}`);
    if (namespace(item['from']) !== namespace(item['to'])) throw new TypeError(`REMAP_NAMESPACE:${item['from']}:${item['to']}`);
    direct.set(item['from'], item['to']); records.push(item as unknown as IdRemap);
  }
  const flattened = records.map((item) => {
    const seen = new Set([item.from]); let target = item.to;
    while (direct.has(target)) { if (seen.has(target)) throw new TypeError(`REMAP_CYCLE:${item.from}`); seen.add(target); target = direct.get(target)!; }
    if (!definedIds.has(target)) throw new TypeError(`REMAP_TARGET_MISSING:${item.from}:${target}`);
    return { ...item, to: target };
  });
  return flattened;
}

export function parseIdRemaps(text: string, path: string, definedIds: ReadonlySet<string>): readonly IdRemap[] {
  return validateIdRemaps(parseYamlFile({ path, text }), definedIds);
}

export interface PathRemap { readonly from: string; readonly to: string; readonly since: string; readonly reason: string; }
export function validatePathRemaps(value: unknown): readonly PathRemap[] {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new TypeError('PATH_REMAP_DOCUMENT');
  const doc = value as Record<string, unknown>;
  if (doc['schemaVersion'] !== 'path-remaps.v1' || !Array.isArray(doc['remaps']) ||
      Object.keys(doc).some((key) => !['schemaVersion', 'remaps'].includes(key)))
    throw new TypeError('PATH_REMAP_DOCUMENT');
  const seen = new Set<string>();
  return doc['remaps'].map((raw) => {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw new TypeError('PATH_REMAP_ENTRY');
    const item = raw as Record<string, unknown>;
    if (Object.keys(item).some((key) => !['from', 'to', 'since', 'reason'].includes(key)) ||
        typeof item['from'] !== 'string' || typeof item['to'] !== 'string' ||
        typeof item['since'] !== 'string' || !/^[a-f0-9]{64}$/u.test(item['since']) ||
        typeof item['reason'] !== 'string' || item['reason'].length === 0 ||
        !item['from'].startsWith('content/') || !item['to'].startsWith('content/chapters/') ||
        item['from'].includes('..') || item['to'].includes('..') || item['from'] === item['to'])
      throw new TypeError('PATH_REMAP_ENTRY');
    if (seen.has(item['from'])) throw new TypeError(`PATH_REMAP_FROM_DUPLICATE:${item['from']}`);
    seen.add(item['from']); return item as unknown as PathRemap;
  });
}

export function applyPathRemaps<T extends { readonly path: string }>(
  sources: readonly T[], remaps: readonly PathRemap[],
): { readonly sources: readonly T[]; readonly applied: readonly PathRemap[] } {
  const byFrom = new Map(remaps.map((remap) => [remap.from, remap]));
  const applied: PathRemap[] = []; const paths = new Set<string>();
  const normalized = sources.map((source) => {
    const remap = byFrom.get(source.path);
    const path = remap?.to ?? source.path;
    if (paths.has(path)) throw new TypeError(`PATH_REMAP_COLLISION:${path}`);
    paths.add(path);
    if (remap !== undefined) applied.push(remap);
    return remap === undefined ? source : { ...source, path };
  });
  return { sources: normalized, applied };
}
