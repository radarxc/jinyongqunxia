import { access, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { tiledProjectBytes } from '../src/build/tiled-project';

async function main(): Promise<void> {
  const { values } = parseArgs({ options: { check: { type: 'boolean' } }, strict: true });
  const path = resolve(import.meta.dirname, '../../../content/tiled/tianshu.tiled-project');
  const expected = tiledProjectBytes();
  if (values.check === true) {
    try { await access(path); } catch { throw new TypeError(`TILED_PROJECT_DRIFT:${path}:missing`); }
    const actual = await readFile(path);
    if (!actual.equals(expected)) throw new TypeError(`TILED_PROJECT_DRIFT:${path}`);
    console.log('tiled project: generated property types are current');
  } else {
    await writeFile(path, expected);
    console.log(`tiled project: wrote ${path}`);
  }
}
void main();
