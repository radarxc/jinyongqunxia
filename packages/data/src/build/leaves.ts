import { gzipSync } from 'node:zlib';
import type { JsonValue } from '@tianshu/shared';
import { canonicalBytes, sha256 } from './hash';
import type { BuildLeaf, Diagnostic, EmittedLeaf } from './types';

export const MAX_LEAF_BYTES = 256 * 1024;
export const PACK_WARNING_BYTES = 1280 * 1024;
export const PACK_ERROR_BYTES = 1536 * 1024;

function numberedName(name: string, index: number): string {
  return name.replace(/\.json$/u, `.p${String(index).padStart(3, '0')}.json`);
}
function splitRegionBindingLeaf(leaf: BuildLeaf, maxBytes: number): readonly BuildLeaf[] | undefined {
  const value = leaf.value;
  if (Array.isArray(value) || value === null || typeof value !== 'object') return undefined;
  const record = value as Readonly<Record<string, JsonValue>>;
  if (record['schemaVersion'] !== 'region-bindings-leaf.v1' ||
      typeof record['chapter'] !== 'string' || typeof record['regionId'] !== 'string' ||
      !Array.isArray(record['entries'])) return undefined;
  const base = { schemaVersion: record['schemaVersion'], chapter: record['chapter'],
    regionId: record['regionId'] };
  const parts: JsonValue[][] = []; let current: JsonValue[] = [];
  for (const entry of record['entries']) {
    const candidate = { ...base, entries: [...current, entry] } as JsonValue;
    if (canonicalBytes(candidate).byteLength > maxBytes) {
      if (current.length === 0)
        throw new TypeError(`CONTENT_LEAF_ENTRY_TOO_LARGE:${leaf.logicalName}`);
      parts.push(current); current = [entry];
      if (canonicalBytes({ ...base, entries: current } as JsonValue).byteLength > maxBytes)
        throw new TypeError(`CONTENT_LEAF_ENTRY_TOO_LARGE:${leaf.logicalName}`);
    } else current.push(entry);
  }
  if (current.length > 0) parts.push(current);
  return parts.map((entries, index) => ({ ...leaf, logicalName: numberedName(leaf.logicalName, index),
    value: { ...base, entries } as JsonValue }));
}

export function splitLeaf(leaf: BuildLeaf, maxBytes = MAX_LEAF_BYTES): readonly BuildLeaf[] {
  const bytes = canonicalBytes(leaf.value);
  if (bytes.byteLength <= maxBytes) return [leaf];
  const bindingParts = splitRegionBindingLeaf(leaf, maxBytes);
  if (bindingParts !== undefined) return bindingParts;
  const array = Array.isArray(leaf.value);
  const entries: readonly JsonValue[] = array ? leaf.value : Object.entries(leaf.value as Record<string, JsonValue>)
    .map(([key, value]) => [key, value]);
  const materialize = (value: readonly JsonValue[]): JsonValue =>
    array ? value : Object.fromEntries(value as readonly [string, JsonValue][]);
  const parts: JsonValue[][] = [];
  let current: JsonValue[] = [];
  let currentBytes = 2;
  for (const entry of entries) {
    const singleBytes = canonicalBytes(materialize([entry])).byteLength;
    if (singleBytes > maxBytes)
      throw new TypeError(`CONTENT_LEAF_ENTRY_TOO_LARGE:${leaf.logicalName}`);
    const candidateBytes = currentBytes + singleBytes - 2 + (current.length === 0 ? 0 : 1);
    if (current.length > 0 && candidateBytes > maxBytes) {
      parts.push(current);
      current = [entry];
      currentBytes = singleBytes;
    } else {
      current.push(entry);
      currentBytes = candidateBytes;
    }
  }
  if (current.length > 0) parts.push(current);
  return parts.map((value, index) => ({ ...leaf, logicalName: numberedName(leaf.logicalName, index),
    value: materialize(value) }));
}

export async function emitLeaves(leaves: readonly BuildLeaf[], maxBytes = MAX_LEAF_BYTES): Promise<readonly EmittedLeaf[]> {
  const split = leaves.flatMap((leaf) => splitLeaf(leaf, maxBytes)); const emitted: EmittedLeaf[] = [];
  for (const leaf of split) { const bytes = canonicalBytes(leaf.value); emitted.push({ ...leaf, bytes,
    gzipBytes: gzipSync(bytes, { level: 9 }).byteLength, sha256: await sha256(bytes) }); }
  return emitted;
}

export function packSizeDiagnostics(chapter: string, leaves: readonly EmittedLeaf[]): readonly Diagnostic[] {
  const gzipBytes = leaves.reduce((sum, leaf) => sum + leaf.gzipBytes, 0);
  if (gzipBytes < PACK_WARNING_BYTES) return [];
  return [{ code: gzipBytes > PACK_ERROR_BYTES ? 'CONTENT_PACK_TOO_LARGE' : 'CONTENT_PACK_LARGE',
    severity: gzipBytes > PACK_ERROR_BYTES ? 'error' : 'warning',
    message: `${chapter} gzip leaves total ${gzipBytes} bytes`,
    primary: { file: `dist/content/${chapter}/manifest.json`, line: 1, column: 1, endLine: 1, endColumn: 1 } }];
}
