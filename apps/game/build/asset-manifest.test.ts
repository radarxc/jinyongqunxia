import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { publishVfxRuntime, readAssetManifest } from './asset-manifest';

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

describe('asset manifest projection', () => {
  it('keeps accepted keys when source images are sparse and only skips copying', async () => {
    const root = await mkdtemp(join(tmpdir(), 'tianshu-assets-'));
    const directory = join(root, 'assets/default/item/food');
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, 'manifest.yaml'), `- id: it_present
  status: candidate
  icons:
    - file: icons/it_present_64.png
- id: it_missing
  status: approved
  icons:
    - file: icons/it_missing_64.png
- id: it_rejected
  status: rejected
  icons:
    - file: icons/it_rejected_64.png
`);
    await mkdir(join(directory, 'icons'), { recursive: true });
    await writeFile(join(directory, 'icons/it_present_64.png'), 'present');
    const warnings: string[] = []; const original = console.warn;
    console.warn = (message) => warnings.push(String(message));
    try {
      const projected = await readAssetManifest(root, true);
      expect(projected).toEqual({
        it_present: { icon: 'assets/default/item/food/icons/it_present_64.png' },
        it_missing: { icon: 'assets/default/item/food/icons/it_missing_64.png' },
      });
      expect(warnings).toEqual(['ASSET_SOURCE_MISSING:item/food/icons/it_missing_64.png']);
      expect(await readFile(join(root,
        'apps/game/public/assets/default/item/food/icons/it_present_64.png'), 'utf8'))
        .toBe('present');
    } finally { console.warn = original; }
  });
});
