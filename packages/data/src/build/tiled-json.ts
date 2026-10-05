export interface ParsedJson { readonly value: unknown; readonly offsets: ReadonlyMap<string, number>; }

export class JsonSourceError extends SyntaxError {
  constructor(message: string, readonly offset: number) { super(message); }
}

const escapePointer = (value: string): string => value.replaceAll('~', '~0').replaceAll('/', '~1');

export function parseJsonWithPointers(text: string): ParsedJson {
  let cursor = 0; const offsets = new Map<string, number>();
  const fail = (message: string): never => { throw new JsonSourceError(message, cursor); };
  const whitespace = (): void => { while (/\s/u.test(text[cursor] ?? '')) cursor += 1; };
  const string = (): string => {
    const start = cursor;
    if (text[cursor] !== '"') fail('expected string');
    cursor += 1;
    while (cursor < text.length) {
      const char = text[cursor++];
      if (char === '"') {
        try { return JSON.parse(text.slice(start, cursor)) as string; }
        catch { throw new JsonSourceError('invalid string escape', start); }
      }
      if (char === '\\') {
        const escaped = text[cursor++];
        if (escaped === 'u') {
          if (!/^[0-9A-Fa-f]{4}$/u.test(text.slice(cursor, cursor + 4))) fail('invalid unicode escape');
          cursor += 4;
        } else if (!'"\\/bfnrt'.includes(escaped ?? '')) fail('invalid string escape');
      } else if (char === undefined || char.charCodeAt(0) < 0x20) fail('invalid string character');
    }
    throw new JsonSourceError('unterminated string', start);
  };
  const number = (): number => {
    const match = text.slice(cursor).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/u);
    if (match === null) fail('invalid number');
    cursor += match![0].length; const value = Number(match![0]);
    if (!Number.isFinite(value)) fail('non-finite number');
    return value;
  };
  const value = (pointer: string): unknown => {
    whitespace(); offsets.set(pointer, cursor); const char = text[cursor];
    if (char === '"') return string();
    if (char === '-' || /\d/u.test(char ?? '')) return number();
    if (text.startsWith('true', cursor)) { cursor += 4; return true; }
    if (text.startsWith('false', cursor)) { cursor += 5; return false; }
    if (text.startsWith('null', cursor)) { cursor += 4; return null; }
    if (char === '[') {
      cursor += 1; whitespace(); const result: unknown[] = [];
      if (text[cursor] === ']') { cursor += 1; return result; }
      while (true) {
        result.push(value(`${pointer}/${result.length}`)); whitespace();
        if (text[cursor] === ']') { cursor += 1; return result; }
        if (text[cursor] !== ',') fail('expected array comma');
        cursor += 1; whitespace();
      }
    }
    if (char === '{') {
      cursor += 1; whitespace(); const result: Record<string, unknown> = {};
      if (text[cursor] === '}') { cursor += 1; return result; }
      while (true) {
        const keyOffset = cursor; const key = string(); whitespace();
        if (Object.hasOwn(result, key)) throw new JsonSourceError(`duplicate key ${key}`, keyOffset);
        if (text[cursor] !== ':') fail('expected object colon');
        cursor += 1; result[key] = value(`${pointer}/${escapePointer(key)}`); whitespace();
        if (text[cursor] === '}') { cursor += 1; return result; }
        if (text[cursor] !== ',') fail('expected object comma');
        cursor += 1; whitespace();
      }
    }
    return fail('expected JSON value');
  };
  const result = value(''); whitespace();
  if (cursor !== text.length) fail('trailing JSON content');
  return { value: result, offsets };
}

export function sourcePosition(text: string, offset: number): { line: number; column: number } {
  let line = 1; let lineStart = 0;
  for (let index = 0; index < offset; index += 1) if (text[index] === '\n') {
    line += 1; lineStart = index + 1;
  }
  return { line, column: offset - lineStart + 1 };
}
