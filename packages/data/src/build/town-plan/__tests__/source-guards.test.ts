import { readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = new URL('..', import.meta.url);
const FORBIDDEN = /Math\.(?:sin|cos|tan|sqrt|pow|random|atan)|Date/;

function sourceFiles(path: URL): URL[] {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, path);
    if (entry.name === '__tests__') return [];
    if (entry.isDirectory()) return sourceFiles(child);
    return extname(entry.name) === '.ts' ? [child] : [];
  });
}

describe('town planner source guards', () => {
  it('contains none of the forbidden nondeterministic or real-valued APIs', () => {
    for (const file of sourceFiles(ROOT)) {
      const source = readFileSync(file, 'utf8');
      expect(source, join(file.pathname)).not.toMatch(FORBIDDEN);
    }
  });
});
