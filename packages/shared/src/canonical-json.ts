export type JsonPrimitive = boolean | null | number | string;
export type JsonValue =
  JsonPrimitive | readonly JsonValue[] | { readonly [key: string]: JsonValue };

export function compareCodePoints(left: string, right: string): number {
  const a = Array.from(left);
  const b = Array.from(right);
  const limit = Math.min(a.length, b.length);
  for (let index = 0; index < limit; index += 1) {
    const difference = a[index]!.codePointAt(0)! - b[index]!.codePointAt(0)!;
    if (difference !== 0) return difference;
  }
  return a.length - b.length;
}

function assertValidString(value: string): void {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!Number.isFinite(next) || next < 0xdc00 || next > 0xdfff) {
        throw new TypeError('LONE_SURROGATE');
      }
      index += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      throw new TypeError('LONE_SURROGATE');
    }
  }
}

function encode(value: JsonValue, seen: Set<object>): string {
  if (value === null || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('NON_FINITE_NUMBER');
    return Object.is(value, -0) ? '0' : JSON.stringify(value);
  }
  if (typeof value === 'string') {
    assertValidString(value);
    return JSON.stringify(value);
  }
  if (seen.has(value)) throw new TypeError('CYCLIC_JSON');
  seen.add(value);
  let output: string;
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      if (!(index in value)) throw new TypeError('SPARSE_ARRAY');
    }
    output = `[${value.map((entry) => encode(entry, seen)).join(',')}]`;
  } else {
    const object = value as { readonly [key: string]: JsonValue };
    const keys = Object.keys(object).sort(compareCodePoints);
    const entries = [];
    for (const key of keys) {
      assertValidString(key);
      const entry = object[key];
      if (entry === undefined) throw new TypeError('UNDEFINED_JSON');
      entries.push(`${JSON.stringify(key)}:${encode(entry, seen)}`);
    }
    output = `{${entries.join(',')}}`;
  }
  seen.delete(value);
  return output;
}

export function canonicalJson(value: JsonValue): string {
  return encode(value, new Set<object>());
}
