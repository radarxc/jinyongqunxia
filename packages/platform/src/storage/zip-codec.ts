import { StorageError, StorageErrorCode } from './errors';

const LOCAL = 0x04034b50;
const CENTRAL = 0x02014b50;
const END = 0x06054b50;
const UTF8 = 0x0800;
const MAX_FILES = 65_535;
const MAX_ARCHIVE = 256 * 1024 * 1024;
const MAX_FILE = 32 * 1024 * 1024 + 64 * 1024 + 12;
const CRC_TABLE = Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let bit = 0; bit < 8; bit += 1) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  return crc >>> 0;
});

export interface ZipEntry {
  readonly name: string;
  readonly bytes: Uint8Array;
}

function fail(message: string): never {
  throw new StorageError(StorageErrorCode.ImportFailed, message);
}
function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff]! ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function safeName(name: string): void {
  if (
    !name ||
    name.startsWith('/') ||
    name.includes('\\') ||
    name.split('/').some((part) => !part || part === '.' || part === '..')
  ) {
    fail('ZIP entry name is unsafe');
  }
}
function assertUint32(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0 || value > 0xffffffff)
    fail(`${label} exceeds ZIP32`);
}

/** Minimal deterministic ZIP32 writer: method 0 (store), UTF-8 names, no data descriptors. */
export function encodeZip(entries: readonly ZipEntry[]): Uint8Array {
  if (
    entries.length > MAX_FILES ||
    new Set(entries.map(({ name }) => name)).size !== entries.length
  )
    fail('ZIP has too many or duplicate entries');
  const encoder = new TextEncoder();
  const prepared = entries.map((entry) => {
    safeName(entry.name);
    const name = encoder.encode(entry.name);
    if (name.byteLength > 0xffff || entry.bytes.byteLength > MAX_FILE)
      fail('ZIP entry exceeds its limit');
    return { ...entry, name, crc: crc32(entry.bytes) };
  });
  const localSize = prepared.reduce(
    (sum, row) => sum + 30 + row.name.byteLength + row.bytes.byteLength,
    0,
  );
  const centralSize = prepared.reduce((sum, row) => sum + 46 + row.name.byteLength, 0);
  const total = localSize + centralSize + 22;
  if (total > MAX_ARCHIVE) fail('ZIP archive exceeds its limit');
  const output = new Uint8Array(total);
  const view = new DataView(output.buffer);
  let offset = 0;
  const offsets: number[] = [];
  for (const row of prepared) {
    offsets.push(offset);
    view.setUint32(offset, LOCAL, true);
    view.setUint16(offset + 4, 20, true);
    view.setUint16(offset + 6, UTF8, true);
    view.setUint16(offset + 8, 0, true);
    view.setUint16(offset + 10, 0, true);
    view.setUint16(offset + 12, 0x21, true);
    view.setUint32(offset + 14, row.crc, true);
    view.setUint32(offset + 18, row.bytes.byteLength, true);
    view.setUint32(offset + 22, row.bytes.byteLength, true);
    view.setUint16(offset + 26, row.name.byteLength, true);
    view.setUint16(offset + 28, 0, true);
    offset += 30;
    output.set(row.name, offset);
    offset += row.name.byteLength;
    output.set(row.bytes, offset);
    offset += row.bytes.byteLength;
  }
  const centralOffset = offset;
  prepared.forEach((row, index) => {
    view.setUint32(offset, CENTRAL, true);
    view.setUint16(offset + 4, 20, true);
    view.setUint16(offset + 6, 20, true);
    view.setUint16(offset + 8, UTF8, true);
    view.setUint16(offset + 10, 0, true);
    view.setUint16(offset + 12, 0, true);
    view.setUint16(offset + 14, 0x21, true);
    view.setUint32(offset + 16, row.crc, true);
    view.setUint32(offset + 20, row.bytes.byteLength, true);
    view.setUint32(offset + 24, row.bytes.byteLength, true);
    view.setUint16(offset + 28, row.name.byteLength, true);
    view.setUint16(offset + 30, 0, true);
    view.setUint16(offset + 32, 0, true);
    view.setUint32(offset + 42, offsets[index]!, true);
    offset += 46;
    output.set(row.name, offset);
    offset += row.name.byteLength;
  });
  view.setUint32(offset, END, true);
  view.setUint16(offset + 8, prepared.length, true);
  view.setUint16(offset + 10, prepared.length, true);
  view.setUint32(offset + 12, centralSize, true);
  view.setUint32(offset + 16, centralOffset, true);
  return output;
}

export function decodeZip(bytes: Uint8Array): readonly ZipEntry[] {
  if (bytes.byteLength < 22 || bytes.byteLength > MAX_ARCHIVE) fail('ZIP size is invalid');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let end = bytes.byteLength - 22;
  const minimum = Math.max(0, bytes.byteLength - 22 - 0xffff);
  while (end >= minimum && view.getUint32(end, true) !== END) end -= 1;
  if (end < minimum) fail('ZIP end record is missing');
  if (
    view.getUint16(end + 4, true) !== 0 ||
    view.getUint16(end + 6, true) !== 0 ||
    view.getUint16(end + 20, true) !== 0 ||
    end + 22 !== bytes.byteLength
  )
    fail('ZIP features are unsupported');
  const count = view.getUint16(end + 10, true);
  if (count !== view.getUint16(end + 8, true) || count > MAX_FILES)
    fail('ZIP entry count is invalid');
  const centralSize = view.getUint32(end + 12, true);
  const centralOffset = view.getUint32(end + 16, true);
  assertUint32(centralOffset + centralSize, 'ZIP directory');
  if (centralOffset + centralSize !== end) fail('ZIP central directory is invalid');
  const decoder = new TextDecoder('utf-8', { fatal: true });
  const entries: ZipEntry[] = [];
  const names = new Set<string>();
  let offset = centralOffset;
  for (let index = 0; index < count; index += 1) {
    if (offset + 46 > end || view.getUint32(offset, true) !== CENTRAL)
      fail('ZIP central entry is truncated');
    const flags = view.getUint16(offset + 8, true);
    const method = view.getUint16(offset + 10, true);
    if (flags !== UTF8 || method !== 0) fail('ZIP entry compression or flags are unsupported');
    const expectedCrc = view.getUint32(offset + 16, true);
    const compressed = view.getUint32(offset + 20, true);
    const size = view.getUint32(offset + 24, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localOffset = view.getUint32(offset + 42, true);
    if (
      compressed !== size ||
      size > MAX_FILE ||
      offset + 46 + nameLength + extraLength + commentLength > end
    )
      fail('ZIP entry size is invalid');
    let name: string;
    try {
      name = decoder.decode(bytes.subarray(offset + 46, offset + 46 + nameLength));
    } catch (error) {
      throw new StorageError(StorageErrorCode.ImportFailed, 'ZIP name is invalid UTF-8', error);
    }
    safeName(name);
    if (names.has(name)) fail('ZIP has duplicate entries');
    names.add(name);
    if (localOffset + 30 > centralOffset || view.getUint32(localOffset, true) !== LOCAL)
      fail('ZIP local entry is invalid');
    if (
      view.getUint16(localOffset + 6, true) !== UTF8 ||
      view.getUint16(localOffset + 8, true) !== 0 ||
      view.getUint16(localOffset + 10, true) !== 0 ||
      view.getUint16(localOffset + 12, true) !== 0x21
    )
      fail('ZIP local flags are unsupported');
    if (
      view.getUint32(localOffset + 14, true) !== expectedCrc ||
      view.getUint32(localOffset + 18, true) !== compressed ||
      view.getUint32(localOffset + 22, true) !== size
    )
      fail('ZIP local entry is inconsistent');
    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const start = localOffset + 30 + localNameLength + localExtraLength;
    const finish = start + size;
    if (
      finish > centralOffset ||
      decoder.decode(bytes.subarray(localOffset + 30, localOffset + 30 + localNameLength)) !== name
    )
      fail('ZIP local entry is inconsistent');
    const data = bytes.slice(start, finish);
    if (crc32(data) !== expectedCrc) fail('ZIP entry CRC32 mismatch');
    entries.push({ name, bytes: data });
    offset += 46 + nameLength + extraLength + commentLength;
  }
  if (offset !== end) fail('ZIP directory has trailing data');
  return entries;
}
