const frozenJson = new WeakSet<object>();
const appendLengths = new WeakMap<readonly unknown[], { json: number; commands: number }>();

/** Only recursively frozen canonical JSON can bypass repeated tree traversal. */
export function isVerifiedFrozenJson(value: object): boolean { return frozenJson.has(value); }
export function markVerifiedFrozenJson(value: object): void {
  if (Object.isFrozen(value) && Object.values(value).every((child: unknown) =>
    child === null || typeof child !== 'object' || frozenJson.has(child))) frozenJson.add(value);
}
export function freezeJsonTree<T>(value: T): T {
  if (value === null || typeof value !== 'object' || frozenJson.has(value)) return value;
  for (const child of Object.values(value)) freezeJsonTree(child);
  Object.freeze(value); return value;
}
export function trackAppendOnlyJson(value: readonly unknown[]): void {
  if (appendLengths.has(value)) return;
  for (const row of value) freezeJsonTree(row);
  appendLengths.set(value, { json: 0, commands: 0 });
}
export function verifiedAppendLength(value: readonly unknown[], kind: 'json' | 'commands' = 'json'): number {
  return Math.min(appendLengths.get(value)?.[kind] ?? 0, value.length);
}
export function completeAppendValidation(value: readonly unknown[], kind: 'json' | 'commands' = 'json'): void {
  const lengths = appendLengths.get(value);
  if (!lengths) return;
  if (kind === 'commands') { lengths.commands = Math.min(lengths.json, value.length); return; }
  while (lengths.json < value.length) {
    const row = value[lengths.json];
    if (row !== null && typeof row === 'object' && !frozenJson.has(row)) break;
    lengths.json += 1;
  }
}
export function invalidateAppendValidation(value: object): void {
  if (Array.isArray(value)) appendLengths.delete(value);
}
