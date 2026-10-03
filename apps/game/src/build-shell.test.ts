import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('production shell build', () => {
  it('keeps the rig demo behind a statically removable DEV branch', async () => {
    const source = await readFile(resolve(import.meta.dirname, 'main.ts'), 'utf8');
    expect(source).toMatch(/import.meta.env.DEV && .*rig-demo/);
    const assets = await readdir(resolve(import.meta.dirname, '../dist/assets')).catch(() => []);
    expect(assets.filter(name => name.startsWith('rig-demo-'))).toEqual([]);
  });
});
