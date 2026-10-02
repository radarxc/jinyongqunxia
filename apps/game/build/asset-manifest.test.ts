import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { publishVfxRuntime } from './asset-manifest';

describe('game build asset publishing', () => {
  it('publishes only paths named by the generated VFX manifest', async () => {
    const root = await mkdtemp(join(tmpdir(), 'tianshu-vfx-'));
    await mkdir(join(root, 'content/vfx'), { recursive: true });
    await mkdir(join(root, 'assets/default/vfx/test'), { recursive: true });
    await writeFile(join(root, 'assets/default/vfx/test/source_sheet.png'), 'atlas');
    await writeFile(join(root, 'content/vfx/runtime-files.json'), JSON.stringify({
      schemaVersion: 'event.v1', actions: [{ payload: { schema: 'tianshu-vfx-runtime.v1',
        files: ['assets/default/vfx/test/source_sheet.png'] } }],
    }));
    expect(await publishVfxRuntime(root, true)).toBe(1);
    expect(await readFile(join(root, 'apps/game/public/assets/default/vfx/test/source_sheet.png'), 'utf8')).toBe('atlas');
  });
});
