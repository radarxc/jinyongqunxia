import { StorageError, StorageErrorCode } from './errors';

const MAGIC = [0x54, 0x53, 0x44, 0x42] as const; // TSDB
const FORMAT_VERSION = 1;
const PREFIX_BYTES = 12;
const ENTRY_PREFIX_BYTES = 12;
const MAX_HEADER_BYTES = 64 * 1024;
const MAX_ENTRY_BYTES = 32 * 1024 * 1024;
const MAX_ARCHIVE_BYTES = 256 * 1024 * 1024;
const MAX_ENTRIES = 100_000;

export const ArchiveEntryKind = {
  Save: 1,
  WorldSnapshot: 2,
  WorldDelta: 3,
  Content: 4,
  Setting: 5,
} as const;

export type ArchiveEntryKind = (typeof ArchiveEntryKind)[keyof typeof ArchiveEntryKind];

export interface ArchiveEntry {
  readonly kind: ArchiveEntryKind;
  readonly header: unknown;
  readonly body: Uint8Array;
}

function fail(message: string): never {
  throw new StorageError(StorageErrorCode.ImportFailed, message);
}

function assertLength(value: number, limit: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0 || value > limit) {
    fail(`${label} exceeds its limit`);
  }
}

export function encodeArchive(entries: readonly ArchiveEntry[]): Uint8Array {
  assertLength(entries.length, MAX_ENTRIES, 'Archive entry count');
  const encoder = new TextEncoder();
  const encoded = entries.map((entry) => {
    const header = encoder.encode(JSON.stringify(entry.header));
    assertLength(header.byteLength, MAX_HEADER_BYTES, 'Archive header');
    assertLength(entry.body.byteLength, MAX_ENTRY_BYTES, 'Archive entry');
    return { ...entry, header };
  });
  const total = encoded.reduce(
    (size, entry) => size + ENTRY_PREFIX_BYTES + entry.header.byteLength + entry.body.byteLength,
    PREFIX_BYTES,
  );
  assertLength(total, MAX_ARCHIVE_BYTES, 'Archive');

  const output = new Uint8Array(total);
  output.set(MAGIC, 0);
  output[4] = FORMAT_VERSION;
  const view = new DataView(output.buffer);
  view.setUint32(8, entries.length, true);
  let offset = PREFIX_BYTES;
  for (const entry of encoded) {
    output[offset] = entry.kind;
    view.setUint32(offset + 4, entry.header.byteLength, true);
    view.setUint32(offset + 8, entry.body.byteLength, true);
    offset += ENTRY_PREFIX_BYTES;
    output.set(entry.header, offset);
    offset += entry.header.byteLength;
    output.set(entry.body, offset);
    offset += entry.body.byteLength;
  }
  return output;
}

export function decodeArchive(payload: Uint8Array): readonly ArchiveEntry[] {
  assertLength(payload.byteLength, MAX_ARCHIVE_BYTES, 'Archive');
  if (payload.byteLength < PREFIX_BYTES || MAGIC.some((value, index) => payload[index] !== value)) {
    return fail('Archive magic is invalid');
  }
  if (payload[4] !== FORMAT_VERSION || payload[5] !== 0 || payload[6] !== 0 || payload[7] !== 0) {
    return fail('Archive format version or flags are unsupported');
  }
  const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
  const count = view.getUint32(8, true);
  assertLength(count, MAX_ENTRIES, 'Archive entry count');
  const decoder = new TextDecoder('utf-8', { fatal: true });
  const entries: ArchiveEntry[] = [];
  let offset = PREFIX_BYTES;
  for (let index = 0; index < count; index += 1) {
    if (offset + ENTRY_PREFIX_BYTES > payload.byteLength) return fail('Archive entry is truncated');
    const kind = payload[offset] as ArchiveEntryKind;
    if (!Object.values(ArchiveEntryKind).includes(kind))
      return fail('Archive entry kind is invalid');
    const headerLength = view.getUint32(offset + 4, true);
    const bodyLength = view.getUint32(offset + 8, true);
    assertLength(headerLength, MAX_HEADER_BYTES, 'Archive header');
    assertLength(bodyLength, MAX_ENTRY_BYTES, 'Archive entry');
    offset += ENTRY_PREFIX_BYTES;
    const end = offset + headerLength + bodyLength;
    if (end > payload.byteLength) return fail('Archive entry body is truncated');
    let header: unknown;
    try {
      header = JSON.parse(decoder.decode(payload.subarray(offset, offset + headerLength)));
    } catch (error) {
      throw new StorageError(StorageErrorCode.ImportFailed, 'Archive header is invalid', error);
    }
    offset += headerLength;
    entries.push({ kind, header, body: payload.slice(offset, offset + bodyLength) });
    offset += bodyLength;
  }
  if (offset !== payload.byteLength) return fail('Archive has trailing bytes');
  return entries;
}
