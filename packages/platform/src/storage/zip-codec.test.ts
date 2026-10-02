import { describe, expect, it } from 'vitest';
import { decodeZip, encodeZip, StorageErrorCode } from './index';

describe('store-only ZIP32 codec', () => {
  it('round-trips deterministic UTF-8 entries without recompression', () => {
    const entries = [
      { name: 'manifest.json', bytes: new TextEncoder().encode('{"version":1}') },
      { name: 'saves/save_manual_01/1.tsav', bytes: Uint8Array.of(1, 2, 3) },
    ];
    const first = encodeZip(entries);
    expect(encodeZip(entries)).toEqual(first);
    expect(decodeZip(first)).toEqual(entries);
    expect(new DataView(first.buffer).getUint16(8, true)).toBe(0);
  });

  it('rejects unsafe, duplicate, compressed, truncated, and CRC-corrupt entries', () => {
    expect(() => encodeZip([{ name: '../save.tsav', bytes: Uint8Array.of(1) }])).toThrow(
      expect.objectContaining({ code: StorageErrorCode.ImportFailed }),
    );
    expect(() =>
      encodeZip([
        { name: 'a', bytes: Uint8Array.of(1) },
        { name: 'a', bytes: Uint8Array.of(2) },
      ]),
    ).toThrow(expect.objectContaining({ code: StorageErrorCode.ImportFailed }));
    const encoded = encodeZip([{ name: 'a', bytes: Uint8Array.of(1, 2, 3) }]);
    expect(() => decodeZip(encoded.slice(0, -1))).toThrow('ZIP end record is missing');
    const compressed = encoded.slice();
    new DataView(compressed.buffer).setUint16(8, 8, true);
    expect(() => decodeZip(compressed)).toThrow('ZIP local flags are unsupported');
    const centralCompressed = encoded.slice();
    const end = centralCompressed.byteLength - 22;
    const central = new DataView(centralCompressed.buffer).getUint32(end + 16, true);
    new DataView(centralCompressed.buffer).setUint16(central + 10, 8, true);
    expect(() => decodeZip(centralCompressed)).toThrow(
      'ZIP entry compression or flags are unsupported',
    );
    const mismatchedLocalMethod = encoded.slice();
    new DataView(mismatchedLocalMethod.buffer).setUint16(8, 8, true);
    new DataView(mismatchedLocalMethod.buffer).setUint16(central + 10, 0, true);
    expect(() => decodeZip(mismatchedLocalMethod)).toThrow('ZIP local flags are unsupported');
    const corrupt = encoded.slice();
    corrupt[31]! ^= 0xff;
    expect(() => decodeZip(corrupt)).toThrow('CRC32 mismatch');
  });
});
