import { canonicalJson, type JsonValue } from '@tianshu/shared';

const encoder = new TextEncoder();

export function canonicalBytes(value: JsonValue, newline = false): Uint8Array {
  return encoder.encode(canonicalJson(value) + (newline ? '\n' : ''));
}

export async function sha256(bytes: Uint8Array): Promise<string> {
  const stable = Uint8Array.from(bytes);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', stable);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function hashValue(value: JsonValue): Promise<string> {
  return sha256(encoder.encode(canonicalJson(value)));
}
