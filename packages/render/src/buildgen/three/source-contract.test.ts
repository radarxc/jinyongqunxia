import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

function sources(directory: string): string {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return sources(path);
      return entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')
        ? readFileSync(path, 'utf8')
        : '';
    })
    .join('\n');
}
describe('building rendering source contract', () => {
  it('avoids runtime shader patching, multi-draw batches and program invalidation', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const source = sources(here) + sources(join(here, '../../materials/static-lit'));
    for (const forbidden of [
      ['on', 'Before', 'Compile'].join(''),
      ['Batched', 'Mesh'].join(''),
      ['needs', 'Update', ' = ', 'true'].join(''),
    ])
      expect(source).not.toContain(forbidden);
  });
});
