import { sha256Hex } from './hash';
import type { OfflineClosure, OfflineFile, OfflineFileKind } from './types';

export function assertOfflineClosure(value: unknown): asserts value is OfflineClosure {
  const closure = value as OfflineClosure | null;
  if (!closure || closure.format !== 1 || !/^ch\d{2}_[a-z0-9_]+$/u.test(closure.chapter) ||
      !/^[a-f0-9]{64}$/u.test(closure.releaseHash) || !Array.isArray(closure.files) || !closure.totals)
    throw new TypeError('OFFLINE_CLOSURE_INVALID');
  const urls = new Set<string>(); let total = 0;
  const byKind: Record<OfflineFileKind, number> = { manifest: 0, content: 0, asset: 0, vfx: 0 };
  for (const file of closure.files as OfflineFile[]) {
    if (!file || !/^\/(?:content|assets\/default)\/[A-Za-z0-9_./-]+$/u.test(file.url) ||
        file.url.split('/').some(part => part === '..' || part === '.') || urls.has(file.url) ||
        !Number.isSafeInteger(file.bytes) || file.bytes < 0 || file.bytes > 8 * 1024 * 1024 ||
        !/^[a-f0-9]{64}$/u.test(file.sha256) || !Object.hasOwn(byKind, file.kind))
      throw new TypeError('OFFLINE_FILE_METADATA_INVALID');
    urls.add(file.url); total += file.bytes; byKind[file.kind] += file.bytes;
  }
  if (total !== closure.totals.bytes || closure.files.length !== closure.totals.files ||
      !Number.isSafeInteger(closure.totals.enterBytes) || closure.totals.enterBytes < 0 || closure.totals.enterBytes > total ||
      Object.entries(byKind).some(([kind, bytes]) => closure.totals.byKind?.[kind as OfflineFileKind] !== bytes))
    throw new TypeError('OFFLINE_TOTALS_INVALID');
}

export async function parseOfflineClosure(value: unknown): Promise<OfflineClosure> {
  assertOfflineClosure(value);
  const source = JSON.stringify(value.files.map(({ url, bytes, sha256, kind }) => ({ url, bytes, sha256, kind }))) + '\n';
  if (await sha256Hex(new TextEncoder().encode(source).buffer) !== value.releaseHash)
    throw new TypeError('OFFLINE_CLOSURE_HASH_MISMATCH');
  return value;
}
