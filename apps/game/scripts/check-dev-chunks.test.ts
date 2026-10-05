import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { assertNoDevelopmentOnlyArtifacts, checkProductionBuild } from './check-dev-chunks.mjs';

const productionManifest = {
  'index.html': { file: 'assets/entry-abc.js', isEntry: true },
  'src/pages/TownPage.vue': { file: 'assets/TownPage-def.js', isDynamicEntry: true },
};

async function writeBuild(
  root: string,
  assetFiles: readonly string[],
  manifest = productionManifest,
): Promise<string> {
  const dist = join(root, 'dist');
  await mkdir(join(dist, 'assets'), { recursive: true });
  await mkdir(join(dist, '.vite'), { recursive: true });
  for (const file of assetFiles) {
    const path = join(dist, 'assets', file);
    await mkdir(join(path, '..'), { recursive: true });
    await writeFile(path, 'export {};');
  }
  await writeFile(join(dist, '.vite/manifest.json'), JSON.stringify(manifest));
  return dist;
}

describe('production development-only artifact check', () => {
  it('accepts a normal production asset list and manifest', () => {
    expect(() =>
      assertNoDevelopmentOnlyArtifacts(
        ['entry-abc.js', 'rig-def.js', 'TownPage-ghi.js'],
        productionManifest,
      ),
    ).not.toThrow();
  });

  it.each([
    {
      label: 'rig demo chunk',
      assets: ['entry-abc.js', 'rig-demo-stale.js'],
      manifest: productionManifest,
      offender: 'assets/rig-demo-stale.js',
    },
    {
      label: 'development-only manifest entry',
      assets: ['entry-abc.js'],
      manifest: {
        ...productionManifest,
        'src/dev-only-tools.ts': { file: 'assets/tools-xyz.js', isDynamicEntry: true },
      },
      offender: 'manifest:src/dev-only-tools.ts',
    },
  ])('rejects a $label', ({ assets, manifest, offender }) => {
    expect(() => assertNoDevelopmentOnlyArtifacts(assets, manifest)).toThrow(
      `PRODUCTION_DEV_ONLY_ARTIFACTS:${offender}`,
    );
  });

  it('fails when dist is missing', async () => {
    const root = await mkdtemp(join(tmpdir(), 'tianshu-dev-chunks-missing-'));
    await expect(checkProductionBuild(join(root, 'dist'))).rejects.toThrow(
      'PRODUCTION_DIST_MISSING',
    );
  });

  it('fails when the Vite manifest is missing', async () => {
    const root = await mkdtemp(join(tmpdir(), 'tianshu-dev-chunks-manifest-'));
    const dist = join(root, 'dist');
    await mkdir(join(dist, 'assets'), { recursive: true });
    await expect(checkProductionBuild(dist)).rejects.toThrow(
      'PRODUCTION_MANIFEST_MISSING_OR_INVALID',
    );
  });

  it('rejects a stale rig demo chunk found in the build directory', async () => {
    const root = await mkdtemp(join(tmpdir(), 'tianshu-dev-chunks-stale-'));
    const dist = await writeBuild(root, ['entry-abc.js', 'rig-demo-stale.js']);
    await expect(checkProductionBuild(dist)).rejects.toThrow(
      'PRODUCTION_DEV_ONLY_ARTIFACTS:assets/rig-demo-stale.js',
    );
  });

  it('checks the files and manifest from one provided build directory', async () => {
    const root = await mkdtemp(join(tmpdir(), 'tianshu-dev-chunks-build-'));
    const dist = await writeBuild(root, ['entry-abc.js', 'TownPage-def.js']);
    await expect(checkProductionBuild(dist)).resolves.toEqual({
      assetCount: 2,
      manifestEntryCount: 2,
    });
  });
});
