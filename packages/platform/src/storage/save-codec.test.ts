import { describe, expect, it } from 'vitest';
import {
  decodeJsonSave,
  encodeJsonSave,
  packSaveJson,
  packTsav,
  parseTsav,
  sha256Hex,
  StorageErrorCode,
  TSAV_MAX_PAYLOAD_BYTES,
  unpackTsav,
  type SaveHeader,
  type SaveHeaderInput,
  type SaveJson,
} from './index';

const encoder = new TextEncoder();
const state: SaveJson = { z: [3, 2, 1], a: { worldTick: 7 } };
const input: SaveHeaderInput = {
  format: 'tianshu-save',
  slotId: 'save_manual_01',
  saveSchema: 1,
  contentHash: 'a'.repeat(64),
  appBuild: '20261001-1200-abcdef0',
  savedAt: '2026-10-01T19:00:00.000Z',
  deviceId: 'dev_00000000000000000000000000',
  baseRev: 0,
  lineageId: 'ln_00000000000000000000000000',
  zhoumu: 1,
  summary: {
    chapterId: 'ch01_tianlong',
    act: 1,
    regionId: 'rg_dali',
    locationName: '无量山',
    lr: 1,
    ld: 1,
    yuyun: 0,
    tianshuCount: 0,
    fateCount: 0,
    difficulty: 'diff_jianghu',
    rules: [],
    playTimeSec: 60,
    rollbackCount: 0,
    debugTainted: false,
    partyNames: ['主角'],
  },
  origin: 'play',
};

function rebuild(header: SaveHeader, body: Uint8Array): Uint8Array {
  const headerBytes = encoder.encode(JSON.stringify(header));
  const output = new Uint8Array(12 + headerBytes.length + body.length);
  output.set([84, 83, 65, 86, 1, 1]);
  new DataView(output.buffer).setUint32(8, headerBytes.length, true);
  output.set(headerBytes, 12);
  output.set(body, 12 + headerBytes.length);
  return output;
}

describe('TSAV v1 codec', () => {
  it('round-trips canonical JSON and keeps payload hashes deterministic', async () => {
    const first = await packSaveJson(state, input);
    const second = await packSaveJson({ a: { worldTick: 7 }, z: [3, 2, 1] }, input);
    expect([...first.bytes.subarray(0, 8)]).toEqual([84, 83, 65, 86, 1, 1, 0, 0]);
    expect(first.header.payloadSha256).toBe(second.header.payloadSha256);
    expect(first.payload).toEqual(second.payload);
    await expect(unpackTsav(first.bytes)).resolves.toMatchObject({ state, header: input });

    const json = await encodeJsonSave(first.header, state);
    await expect(decodeJsonSave(json)).resolves.toMatchObject({ state, header: first.header });
  });

  it.each([
    ['truncated', (bytes: Uint8Array) => bytes.slice(0, 11), StorageErrorCode.TsavTruncated],
    [
      'magic',
      (bytes: Uint8Array) => {
        const copy = bytes.slice();
        copy[0] = 0;
        return copy;
      },
      StorageErrorCode.TsavBadMagic,
    ],
    [
      'version',
      (bytes: Uint8Array) => {
        const copy = bytes.slice();
        copy[4] = 2;
        return copy;
      },
      StorageErrorCode.TsavUnsupportedContainer,
    ],
    [
      'flags',
      (bytes: Uint8Array) => {
        const copy = bytes.slice();
        copy[5] = 3;
        return copy;
      },
      StorageErrorCode.TsavUnsupportedFlags,
    ],
    [
      'reserved',
      (bytes: Uint8Array) => {
        const copy = bytes.slice();
        copy[6] = 1;
        return copy;
      },
      StorageErrorCode.TsavUnsupportedFlags,
    ],
    [
      'header length',
      (bytes: Uint8Array) => {
        const copy = bytes.slice();
        new DataView(copy.buffer).setUint32(8, 0, true);
        return copy;
      },
      StorageErrorCode.TsavInvalidSize,
    ],
    [
      'header JSON',
      (bytes: Uint8Array) => {
        const copy = bytes.slice();
        copy[12] = 0xff;
        return copy;
      },
      StorageErrorCode.TsavInvalidHeader,
    ],
  ])('reports enum errors for a tampered %s', async (_label, mutate, code) => {
    const packed = await packSaveJson(state, input);
    await expect(unpackTsav(mutate(packed.bytes))).rejects.toMatchObject({ code });
  });

  it('distinguishes body, gzip, payload, JSON, and declared-size failures', async () => {
    const packed = await packSaveJson(state, input);
    const bodyTampered = packed.bytes.slice();
    bodyTampered[bodyTampered.length - 1]! ^= 0xff;
    await expect(unpackTsav(bodyTampered)).rejects.toMatchObject({
      code: StorageErrorCode.TsavBodyChecksum,
    });

    const parsed = parseTsav(packed.bytes);
    const brokenBody = parsed.body.slice();
    brokenBody[brokenBody.length - 1]! ^= 0xff;
    const gzipHeader = { ...packed.header, bodySha256: await sha256Hex(brokenBody) };
    await expect(unpackTsav(rebuild(gzipHeader, brokenBody))).rejects.toMatchObject({
      code: StorageErrorCode.TsavDecompression,
    });

    const wrongPayload = { ...packed.header, payloadSha256: '0'.repeat(64) };
    await expect(unpackTsav(rebuild(wrongPayload, parsed.body))).rejects.toMatchObject({
      code: StorageErrorCode.TsavPayloadChecksum,
    });

    const invalidJson = await packTsav(encoder.encode('{'), input);
    await expect(unpackTsav(invalidJson.bytes)).rejects.toMatchObject({
      code: StorageErrorCode.TsavInvalidJson,
    });

    const undersized = { ...packed.header, sizes: { ...packed.header.sizes, raw: 1 } };
    await expect(unpackTsav(rebuild(undersized, parsed.body))).rejects.toMatchObject({
      code: StorageErrorCode.TsavInvalidSize,
    });
  });

  it('enforces the 32 MiB payload and 64 KiB header-declared bounds', async () => {
    await expect(packTsav(new Uint8Array(TSAV_MAX_PAYLOAD_BYTES + 1), input)).rejects.toMatchObject(
      { code: StorageErrorCode.TsavInvalidSize },
    );
    const packed = await packSaveJson(state, input);
    const tooLarge = {
      ...packed.header,
      sizes: { ...packed.header.sizes, raw: TSAV_MAX_PAYLOAD_BYTES + 1 },
    };
    expect(() => parseTsav(rebuild(tooLarge, parseTsav(packed.bytes).body))).toThrow(
      expect.objectContaining({ code: StorageErrorCode.TsavInvalidSize }),
    );
  });

  it('strictly validates required header identifiers and optional fields', async () => {
    const cases: SaveHeaderInput[] = [
      { ...input, contentHash: 'not-a-hash' },
      { ...input, appBuild: 'development' },
      { ...input, deviceId: 'dev_bad' },
      { ...input, lineageId: 'ln_bad' },
      { ...input, savedAt: 'not-a-date' },
      { ...input, origin: 'other' as never },
      { ...input, summary: { ...input.summary, tianjieLevel: -1 } },
      { ...input, summary: { ...input.summary, thumbnail: 'data:image/png;base64,AA==' } },
      { ...input, summary: { ...input.summary, thumbnail: 'data:image/webp;base64,***' } },
      { ...input, summary: { ...input.summary, thumbnail: `data:image/webp;base64,${'A'.repeat(16_388)}` } },
    ];
    for (const invalid of cases) {
      await expect(packSaveJson(state, invalid)).rejects.toMatchObject({
        code: StorageErrorCode.TsavInvalidHeader,
      });
    }
  });
});
