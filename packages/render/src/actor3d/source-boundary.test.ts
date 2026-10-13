import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('actor3d pure source boundaries', () => {
  it('does not import three from gait, stature, or catalog', () => {
    for (const name of ['gait.ts', 'stature.ts', 'catalog.ts']) {
      const source = readFileSync(new URL(name, import.meta.url), 'utf8');
      expect(source, name).not.toMatch(/from\s+['"]three(?:['/]?)/u);
    }
  });
});
