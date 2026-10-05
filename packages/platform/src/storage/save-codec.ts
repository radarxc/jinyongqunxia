import { StorageError, StorageErrorCode } from './errors';
import { sha256Hex } from './hash';
import { assertSlot } from './records';
import type { SaveJson } from './save-migrations';
import { canonicalJson, type JsonValue } from '@tianshu/shared';

export const TSAV_CONTAINER_VERSION = 1;
export const TSAV_MAX_HEADER_BYTES = 64 * 1024;
export const TSAV_MAX_PAYLOAD_BYTES = 32 * 1024 * 1024;
const PREFIX_BYTES = 12;
const MAGIC = Uint8Array.of(0x54, 0x53, 0x41, 0x56);
const SHA256 = /^[0-9a-f]{64}$/;
const BUILD_ID = /^\d{8}-\d{4}-[0-9a-z]+$/;
const DEVICE_ID = /^dev_[0-9A-HJKMNP-TV-Z]{26}$/i;
const LINEAGE_ID = /^ln_[0-9A-HJKMNP-TV-Z]{26}$/i;
const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const THUMBNAIL_PREFIX = 'data:image/webp;base64,';
const MAX_THUMBNAIL_BYTES = 12 * 1024;

export interface SaveHeaderSummary {
  readonly chapterId: string;
  readonly act: number;
  readonly regionId: string;
  readonly locationName: string;
  readonly lr: number;
  readonly ld: number;
  readonly yuyun: number;
  readonly tianshuCount: number;
  readonly fateCount: number;
  readonly difficulty: 'diff_jianghu' | 'diff_xiake' | 'diff_zongshi' | 'diff_tianjie';
  readonly tianjieLevel?: number;
  readonly rules: readonly string[];
  readonly playTimeSec: number;
  readonly rollbackCount: number;
  readonly debugTainted: boolean;
  readonly partyNames: readonly string[];
  readonly thumbnail?: string;
}
export interface SaveHeader {
  readonly format: 'tianshu-save';
  readonly slotId: string;
  readonly saveSchema: number;
  readonly contentHash: string;
  readonly appBuild: string;
  readonly savedAt: string;
  readonly deviceId: string;
  readonly baseRev: number;
  readonly lineageId: string;
  readonly zhoumu: number;
  readonly summary: SaveHeaderSummary;
  readonly sizes: { readonly raw: number; readonly gz: number };
  readonly payloadSha256: string;
  readonly bodySha256: string;
  readonly origin?: 'play' | 'import' | 'restore' | 'migration';
}
export type SaveHeaderInput = Omit<SaveHeader, 'sizes' | 'payloadSha256' | 'bodySha256'>;
export interface PackedSave {
  readonly header: SaveHeader;
  readonly bytes: Uint8Array;
  readonly payload: Uint8Array;
}
export interface UnpackedSave {
  readonly header: SaveHeader;
  readonly state: SaveJson;
  readonly payload: Uint8Array;
}
export interface JsonSaveEnvelope {
  readonly format: 'tianshu-save-json';
  readonly version: 1;
  readonly header: SaveHeader;
  readonly state: SaveJson;
}

function fail(code: StorageErrorCode, message: string, cause?: unknown): never {
  throw new StorageError(code, message, cause);
}
function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return fail(StorageErrorCode.TsavInvalidHeader, `${label} must be an object`);
  }
  return value as Record<string, unknown>;
}
function exactKeys(
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[],
  label: string,
): void {
  const allowed = new Set([...required, ...optional]);
  if (
    required.some((key) => !(key in value)) ||
    Object.keys(value).some((key) => !allowed.has(key))
  ) {
    fail(StorageErrorCode.TsavInvalidHeader, label + ' fields are invalid');
  }
}
function integer(value: unknown, label: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) {
    return fail(StorageErrorCode.TsavInvalidHeader, `${label} must be a non-negative integer`);
  }
  return value as number;
}
function text(value: unknown, label: string, allowEmpty = false): string {
  if (typeof value !== 'string' || (!allowEmpty && value.length === 0)) {
    return fail(StorageErrorCode.TsavInvalidHeader, `${label} must be a string`);
  }
  return value;
}
function stringArray(value: unknown, label: string, max = Infinity): readonly string[] {
  if (
    !Array.isArray(value) ||
    value.length > max ||
    value.some((entry) => typeof entry !== 'string')
  ) {
    return fail(StorageErrorCode.TsavInvalidHeader, `${label} must be a string array`);
  }
  return value;
}
function optionalInteger(value: unknown, label: string): void {
  if (value !== undefined) integer(value, label);
}
function optionalText(value: unknown, label: string): void {
  if (value !== undefined) text(value, label);
}

export function validateSaveHeader(value: unknown): SaveHeader {
  const header = object(value, 'header');
  exactKeys(
    header,
    [
      'format',
      'slotId',
      'saveSchema',
      'contentHash',
      'appBuild',
      'savedAt',
      'deviceId',
      'baseRev',
      'lineageId',
      'zhoumu',
      'summary',
      'sizes',
      'payloadSha256',
      'bodySha256',
    ],
    ['origin'],
    'header',
  );
  if (header['format'] !== 'tianshu-save')
    fail(StorageErrorCode.TsavInvalidHeader, 'format is invalid');
  const sizes = object(header['sizes'], 'sizes');
  const summary = object(header['summary'], 'summary');
  exactKeys(sizes, ['raw', 'gz'], [], 'sizes');
  exactKeys(
    summary,
    [
      'chapterId',
      'act',
      'regionId',
      'locationName',
      'lr',
      'ld',
      'yuyun',
      'tianshuCount',
      'fateCount',
      'difficulty',
      'rules',
      'playTimeSec',
      'rollbackCount',
      'debugTainted',
      'partyNames',
    ],
    ['tianjieLevel', 'thumbnail'],
    'summary',
  );
  const raw = integer(sizes['raw'], 'sizes.raw');
  const gz = integer(sizes['gz'], 'sizes.gz');
  if (raw === 0 || raw > TSAV_MAX_PAYLOAD_BYTES || gz === 0 || gz > TSAV_MAX_PAYLOAD_BYTES)
    fail(StorageErrorCode.TsavInvalidSize, 'save size is invalid');
  for (const field of ['payloadSha256', 'bodySha256'] as const) {
    if (typeof header[field] !== 'string' || !SHA256.test(header[field]))
      fail(StorageErrorCode.TsavInvalidHeader, `${field} is invalid`);
  }
  const difficulty = text(summary['difficulty'], 'summary.difficulty');
  if (!['diff_jianghu', 'diff_xiake', 'diff_zongshi', 'diff_tianjie'].includes(difficulty))
    fail(StorageErrorCode.TsavInvalidHeader, 'summary.difficulty is invalid');
  const result = header as unknown as SaveHeader;
  text(result.slotId, 'slotId');
  integer(result.saveSchema, 'saveSchema');
  text(result.contentHash, 'contentHash');
  text(result.appBuild, 'appBuild');
  text(result.savedAt, 'savedAt');
  text(result.deviceId, 'deviceId');
  integer(result.baseRev, 'baseRev');
  text(result.lineageId, 'lineageId');
  integer(result.zhoumu, 'zhoumu');
  text(result.summary.chapterId, 'summary.chapterId');
  integer(result.summary.act, 'summary.act');
  text(result.summary.regionId, 'summary.regionId', true);
  text(result.summary.locationName, 'summary.locationName');
  for (const field of [
    'lr',
    'ld',
    'yuyun',
    'tianshuCount',
    'fateCount',
    'playTimeSec',
    'rollbackCount',
  ] as const)
    integer(result.summary[field], `summary.${field}`);
  if (typeof result.summary.debugTainted !== 'boolean')
    fail(StorageErrorCode.TsavInvalidHeader, 'debugTainted is invalid');
  stringArray(result.summary.rules, 'summary.rules');
  stringArray(result.summary.partyNames, 'summary.partyNames', 6);
  optionalInteger(result.summary.tianjieLevel, 'summary.tianjieLevel');
  optionalText(result.summary.thumbnail, 'summary.thumbnail');
  try {
    assertSlot(result.slotId);
  } catch (error) {
    fail(StorageErrorCode.TsavInvalidHeader, 'slotId is invalid', error);
  }
  if (
    result.saveSchema < 1 ||
    result.zhoumu < 1 ||
    !SHA256.test(result.contentHash) ||
    !BUILD_ID.test(result.appBuild) ||
    !DEVICE_ID.test(result.deviceId) ||
    !LINEAGE_ID.test(result.lineageId) ||
    !ISO_TIMESTAMP.test(result.savedAt) ||
    Number.isNaN(Date.parse(result.savedAt))
  ) {
    fail(StorageErrorCode.TsavInvalidHeader, 'header identifier or timestamp is invalid');
  }
  if (
    result.summary.thumbnail &&
    (!result.summary.thumbnail.startsWith(THUMBNAIL_PREFIX) ||
      (() => {
        const data = result.summary.thumbnail!.slice(THUMBNAIL_PREFIX.length);
        if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(data))
          return true;
        return (data.length / 4) * 3 - (data.endsWith('==') ? 2 : data.endsWith('=') ? 1 : 0) > MAX_THUMBNAIL_BYTES;
      })())
  ) {
    fail(StorageErrorCode.TsavInvalidHeader, 'summary.thumbnail is invalid');
  }
  if (
    result.origin !== undefined &&
    !['play', 'import', 'restore', 'migration'].includes(result.origin)
  )
    fail(StorageErrorCode.TsavInvalidHeader, 'origin is invalid');
  return result;
}

async function gzip(payload: Uint8Array): Promise<Uint8Array> {
  if (typeof CompressionStream === 'undefined')
    return fail(StorageErrorCode.Unavailable, 'CompressionStream gzip is unavailable');
  try {
    const input = Uint8Array.from(payload);
    const stream = new Blob([input.buffer]).stream().pipeThrough(new CompressionStream('gzip'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  } catch (error) {
    return fail(StorageErrorCode.TsavDecompression, 'gzip compression failed', error);
  }
}

async function gunzipBounded(body: Uint8Array, declared: number): Promise<Uint8Array> {
  if (typeof DecompressionStream === 'undefined')
    return fail(StorageErrorCode.Unavailable, 'DecompressionStream gzip is unavailable');
  const chunks: Uint8Array[] = [];
  let length = 0;
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  try {
    const input = Uint8Array.from(body);
    reader = new Blob([input.buffer])
      .stream()
      .pipeThrough(new DecompressionStream('gzip'))
      .getReader();
    while (true) {
      const item = await reader.read();
      if (item.done) break;
      length += item.value.byteLength;
      if (length > TSAV_MAX_PAYLOAD_BYTES || length > declared) {
        await reader.cancel();
        return fail(StorageErrorCode.TsavInvalidSize, 'decompressed payload exceeds its limit');
      }
      chunks.push(item.value);
    }
  } catch (error) {
    if (error instanceof StorageError) throw error;
    return fail(StorageErrorCode.TsavDecompression, 'gzip payload is corrupt', error);
  } finally {
    reader?.releaseLock();
  }
  const payload = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    payload.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return payload;
}

export async function packTsav(payload: Uint8Array, input: SaveHeaderInput): Promise<PackedSave> {
  if (payload.byteLength === 0 || payload.byteLength > TSAV_MAX_PAYLOAD_BYTES)
    return fail(StorageErrorCode.TsavInvalidSize, 'payload size is invalid');
  const stablePayload = Uint8Array.from(payload);
  const body = await gzip(stablePayload);
  const header: SaveHeader = validateSaveHeader({
    ...input,
    sizes: { raw: stablePayload.byteLength, gz: body.byteLength },
    payloadSha256: await sha256Hex(stablePayload),
    bodySha256: await sha256Hex(body),
  });
  const headerBytes = new TextEncoder().encode(JSON.stringify(header));
  if (headerBytes.byteLength === 0 || headerBytes.byteLength > TSAV_MAX_HEADER_BYTES)
    return fail(StorageErrorCode.TsavInvalidSize, 'header exceeds 64 KiB');
  if (body.byteLength === 0 || body.byteLength > 0xffffffff)
    return fail(StorageErrorCode.TsavInvalidSize, 'gzip body size is invalid');
  const bytes = new Uint8Array(PREFIX_BYTES + headerBytes.byteLength + body.byteLength);
  bytes.set(MAGIC);
  bytes[4] = TSAV_CONTAINER_VERSION;
  bytes[5] = 0b01;
  new DataView(bytes.buffer).setUint32(8, headerBytes.byteLength, true);
  bytes.set(headerBytes, PREFIX_BYTES);
  bytes.set(body, PREFIX_BYTES + headerBytes.byteLength);
  return { header, bytes, payload: stablePayload };
}

export async function packSaveJson(state: SaveJson, input: SaveHeaderInput): Promise<PackedSave> {
  return packTsav(new TextEncoder().encode(canonicalJson(state as JsonValue)), input);
}

export function parseTsav(bytes: Uint8Array): { header: SaveHeader; body: Uint8Array } {
  if (bytes.byteLength < PREFIX_BYTES)
    return fail(StorageErrorCode.TsavTruncated, 'TSAV is truncated');
  if (MAGIC.some((value, index) => bytes[index] !== value))
    return fail(StorageErrorCode.TsavBadMagic, 'TSAV magic is invalid');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes[4] !== TSAV_CONTAINER_VERSION)
    return fail(StorageErrorCode.TsavUnsupportedContainer, 'TSAV version is unsupported');
  if (bytes[5] !== 0b01 || view.getUint16(6, true) !== 0)
    return fail(StorageErrorCode.TsavUnsupportedFlags, 'TSAV flags are unsupported');
  const length = view.getUint32(8, true);
  if (length === 0 || length > TSAV_MAX_HEADER_BYTES || PREFIX_BYTES + length >= bytes.byteLength)
    return fail(StorageErrorCode.TsavInvalidSize, 'TSAV header length is invalid');
  let parsed: unknown;
  try {
    const raw = new TextDecoder('utf-8', { fatal: true }).decode(
      bytes.subarray(PREFIX_BYTES, PREFIX_BYTES + length),
    );
    parsed = JSON.parse(raw);
  } catch (error) {
    return fail(StorageErrorCode.TsavInvalidHeader, 'TSAV header JSON is invalid', error);
  }
  return { header: validateSaveHeader(parsed), body: bytes.slice(PREFIX_BYTES + length) };
}

export async function unpackTsav(bytes: Uint8Array): Promise<UnpackedSave> {
  const { header, body } = parseTsav(bytes);
  if (body.byteLength !== header.sizes.gz)
    return fail(StorageErrorCode.TsavInvalidSize, 'gzip size does not match header');
  if ((await sha256Hex(body)) !== header.bodySha256)
    return fail(StorageErrorCode.TsavBodyChecksum, 'gzip body checksum mismatch');
  const payload = await gunzipBounded(body, header.sizes.raw);
  if (payload.byteLength !== header.sizes.raw)
    return fail(StorageErrorCode.TsavInvalidSize, 'payload size does not match header');
  if ((await sha256Hex(payload)) !== header.payloadSha256)
    return fail(StorageErrorCode.TsavPayloadChecksum, 'payload checksum mismatch');
  try {
    const state = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(payload)) as SaveJson;
    return { header, state, payload };
  } catch (error) {
    return fail(StorageErrorCode.TsavInvalidJson, 'payload JSON is invalid', error);
  }
}

export async function encodeJsonSave(header: SaveHeader, state: SaveJson): Promise<Uint8Array> {
  validateSaveHeader(header);
  const payload = new TextEncoder().encode(canonicalJson(state as JsonValue));
  if (payload.byteLength !== header.sizes.raw)
    return fail(StorageErrorCode.TsavInvalidSize, 'JSON payload size does not match header');
  if ((await sha256Hex(payload)) !== header.payloadSha256)
    return fail(StorageErrorCode.TsavPayloadChecksum, 'JSON payload checksum mismatch');
  const envelope: JsonSaveEnvelope = { format: 'tianshu-save-json', version: 1, header, state };
  return new TextEncoder().encode(canonicalJson(envelope as unknown as JsonValue));
}

export async function decodeJsonSave(bytes: Uint8Array): Promise<UnpackedSave> {
  if (bytes.byteLength === 0 || bytes.byteLength > TSAV_MAX_PAYLOAD_BYTES + TSAV_MAX_HEADER_BYTES)
    return fail(StorageErrorCode.TsavInvalidSize, 'JSON save exceeds its limit');
  let value: unknown;
  try {
    value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch (error) {
    return fail(StorageErrorCode.TsavInvalidJson, 'save JSON is invalid', error);
  }
  const envelope = object(value, 'JSON save');
  if (envelope['format'] !== 'tianshu-save-json' || envelope['version'] !== 1)
    return fail(StorageErrorCode.TsavInvalidJson, 'JSON save format is unsupported');
  const header = validateSaveHeader(envelope['header']);
  const state = envelope['state'] as SaveJson;
  let payload: Uint8Array;
  try {
    payload = new TextEncoder().encode(canonicalJson(state as JsonValue));
  } catch (error) {
    return fail(StorageErrorCode.TsavInvalidJson, 'save state is not JSON', error);
  }
  if (payload.byteLength !== header.sizes.raw)
    return fail(StorageErrorCode.TsavInvalidSize, 'JSON payload size does not match header');
  if ((await sha256Hex(payload)) !== header.payloadSha256)
    return fail(StorageErrorCode.TsavPayloadChecksum, 'JSON payload checksum mismatch');
  return { header, state, payload };
}
