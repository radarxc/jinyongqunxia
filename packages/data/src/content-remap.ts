import type { JsonValue } from '@tianshu/shared';

export interface ContentIdRemap { readonly from: string; readonly to: string; }

/** Pure post-schema-migration fixup. Values are matched exactly; prose substrings are untouched. */
export function fixupContentRefs<T extends JsonValue>(
  value: T, remaps: readonly ContentIdRemap[],
): T {
  const lookup = new Map(remaps.map(({ from, to }) => [from, to]));
  const visit = (entry: JsonValue): JsonValue => {
    if (typeof entry === 'string') return lookup.get(entry) ?? entry;
    if (entry === null || typeof entry === 'boolean' || typeof entry === 'number') return entry;
    if (Array.isArray(entry)) return entry.map(visit);
    return Object.fromEntries(Object.entries(entry).map(([key, child]) => [key, visit(child)]));
  };
  return visit(value) as T;
}
