const HASH = /^[a-f0-9]{64}$/u;

export async function sha256Hex(bytes: ArrayBuffer): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  return Array.from(digest, value => value.toString(16).padStart(2, '0')).join('');
}

export async function verifyBytes(
  bytes: ArrayBuffer,
  expectedBytes: number,
  expectedHash: string,
): Promise<'valid' | 'bytes' | 'hash'> {
  if (!Number.isSafeInteger(expectedBytes) || expectedBytes < 0 || !HASH.test(expectedHash))
    throw new TypeError('OFFLINE_FILE_METADATA_INVALID');
  if (bytes.byteLength !== expectedBytes) return 'bytes';
  return await sha256Hex(bytes) === expectedHash ? 'valid' : 'hash';
}
