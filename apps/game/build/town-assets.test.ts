import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { publishTownAssets, townAssetsPlugin } from './town-assets';

const workspaces: string[] = [];
afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(workspaces.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

async function workspace(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'tianshu-town-assets-'));
  workspaces.push(root);
  return root;
}

async function fixture(): Promise<string> {
  const root = await workspace();
  const kit = join(root, 'assets/default/buildkit/song_dali');
  const town = join(root, 'assets/default/model3d/npc_test/town');
  const minimap = join(root, 'assets/default/town-minimap');
  await Promise.all([
    mkdir(join(kit, 'layers'), { recursive: true }),
    mkdir(town, { recursive: true }),
    mkdir(minimap, { recursive: true }),
  ]);
  await Promise.all([
    writeFile(join(kit, 'layers/foo.png'), 'layer'),
    writeFile(join(kit, 'layers/rejected.png'), 'reject'),
    writeFile(join(kit, 'strip_512.webp'), 'strip-512'),
    writeFile(join(kit, 'strip_256.webp'), 'strip-256'),
    writeFile(join(kit, 'unlisted.png'), 'unlisted'),
    writeFile(join(town, 'lod0.glb'), 'lod0'),
    writeFile(join(town, 'lod1.glb'), 'lod1'),
    writeFile(join(town, 'old.glb'), 'old'),
    writeFile(join(minimap, 'city_test__ch01.webp'), 'painted-town'),
    writeFile(join(minimap, 'city_test__ch01.json'), '{"schemaVersion":"town-minimap.v1"}'),
    writeFile(
      join(kit, 'manifest.yaml'),
      [
        'schemaVersion: buildkit-layers.v1',
        'kit: song_dali',
        'status: candidate',
        'layers:',
        '  - id: foo',
        '    file: layers/foo.png',
        '    status: candidate',
        '  - id: rejected',
        '    file: layers/rejected.png',
        '    status: rejected',
        'strips:',
        '  - id: song_dali_strip_512',
        '    file: strip_512.webp',
        '    status: approved',
        '  - id: song_dali_strip_256',
        '    file: strip_256.webp',
        '    status: candidate',
      ].join('\n'),
    ),
    writeFile(
      join(town, 'manifest.yaml'),
      [
        '- id: npc_test_town',
        '  file: lod0.glb',
        '  lods:',
        '    lod1: { file: lod1.glb }',
        '  status: draft',
        '- id: npc_test_old',
        '  file: old.glb',
        '  status: rejected',
      ].join('\n'),
    ),
    writeFile(
      join(minimap, 'manifest.yaml'),
      [
        '- id: minimap_city_test__ch01',
        '  file: city_test__ch01.webp',
        '  files:',
        '    city_test__ch01.webp: {}',
        '    city_test__ch01.json: {}',
        '  status: candidate',
      ].join('\n'),
    ),
  ]);
  return root;
}

describe('town asset publication', () => {
  it('copies non-rejected buildkit and town model files at their relative paths', async () => {
    const root = await fixture();
    expect(await publishTownAssets(root)).toBe(7);
    const publicRoot = join(root, 'apps/game/public/assets/default');
    await expect(
      readFile(join(publicRoot, 'buildkit/song_dali/layers/foo.png'), 'utf8'),
    ).resolves.toBe('layer');
    await expect(
      readFile(join(publicRoot, 'buildkit/song_dali/strip_512.webp'), 'utf8'),
    ).resolves.toBe('strip-512');
    await expect(
      readFile(join(publicRoot, 'buildkit/song_dali/strip_256.webp'), 'utf8'),
    ).resolves.toBe('strip-256');
    await expect(
      access(join(publicRoot, 'buildkit/song_dali/layers/rejected.png')),
    ).rejects.toThrow();
    await expect(
      access(join(publicRoot, 'buildkit/song_dali/unlisted.png')),
    ).rejects.toThrow();
    await expect(
      access(join(publicRoot, 'buildkit/song_dali/manifest.yaml')),
    ).rejects.toThrow();
    await expect(
      readFile(join(publicRoot, 'model3d/npc_test/town/lod0.glb'), 'utf8'),
    ).resolves.toBe('lod0');
    await expect(
      readFile(join(publicRoot, 'model3d/npc_test/town/lod1.glb'), 'utf8'),
    ).resolves.toBe('lod1');
    await expect(access(join(publicRoot, 'model3d/npc_test/town/old.glb'))).rejects.toThrow();
    await expect(readFile(join(publicRoot, 'town-minimap/city_test__ch01.webp'), 'utf8'))
      .resolves.toBe('painted-town');
    await expect(readFile(join(publicRoot, 'town-minimap/city_test__ch01.json'), 'utf8'))
      .resolves.toContain('town-minimap.v1');
  });

  it('removes stale files before republishing the managed directories', async () => {
    const root = await fixture();
    const stale = join(root, 'apps/game/public/assets/default/model3d/npc_test/town/stale.glb');
    await mkdir(join(stale, '..'), { recursive: true });
    await writeFile(stale, 'stale');
    await publishTownAssets(root);
    await expect(access(stale)).rejects.toThrow();
  });

  it('skips every buildkit entry when the top-level status is rejected', async () => {
    const root = await fixture();
    const manifest = join(root, 'assets/default/buildkit/song_dali/manifest.yaml');
    const text = await readFile(manifest, 'utf8');
    await writeFile(manifest, text.replace('status: candidate', 'status: rejected'));
    expect(await publishTownAssets(root)).toBe(4);
    await expect(
      access(join(root, 'apps/game/public/assets/default/buildkit/song_dali/layers/foo.png')),
    ).rejects.toThrow();
  });

  it('quietly skips absent source directories', async () => {
    const root = await workspace();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await expect(publishTownAssets(root)).resolves.toBe(0);
    expect(warn).not.toHaveBeenCalled();
  });

  it('runs from the Vite buildStart hook', async () => {
    const root = await fixture();
    const plugin = townAssetsPlugin(root);
    await plugin.buildStart?.call({} as never, {} as never);
    await expect(
      readFile(
        join(root, 'apps/game/public/assets/default/buildkit/song_dali/strip_512.webp'),
        'utf8',
      ),
    ).resolves.toBe('strip-512');
  });
});
