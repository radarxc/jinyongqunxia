import { StorageError, StorageErrorCode } from './errors';
import type { Sha256Hex } from './types';

const SHA256_HEX = /^[0-9a-f]{64}$/;

export function assertSha256Hex(value: string): asserts value is Sha256Hex {
  if (!SHA256_HEX.test(value)) {
    throw new StorageError(StorageErrorCode.InvalidArgument, 'Hash must be lowercase SHA-256 hex');
  }
}

export async function sha256Hex(bytes: Uint8Array): Promise<Sha256Hex> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new StorageError(StorageErrorCode.Unavailable, 'Web Crypto SHA-256 is unavailable');
  }
  const input = Uint8Array.from(bytes);
  const digest = await subtle.digest('SHA-256', input);
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, '0')).join(
    '',
  );
}

export async function verifyHash(
  bytes: Uint8Array,
  expected: Sha256Hex,
  label: string,
): Promise<void> {
  assertSha256Hex(expected);
  const actual = await sha256Hex(bytes);
  if (actual !== expected) {
    throw new StorageError(
      StorageErrorCode.HashMismatch,
      `${label} hash mismatch: expected ${expected}, received ${actual}`,
    );
  }
}
