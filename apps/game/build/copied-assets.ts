import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

export interface CopiedAssetEntry {
  readonly url: string;
  readonly bytes: number;
  readonly sha256: string;
  readonly kind: 'asset' | 'vfx';
}

export interface CopiedAssetManifest {
  readonly format: 1;
  readonly files: readonly CopiedAssetEntry[];
}

export async function writeCopiedAssetManifest(
  root: string,
  relativePaths: readonly string[],
  output = join(root, 'apps/game/dist/offline/copied-assets.json'),
): Promise<CopiedAssetManifest> {
  const files: CopiedAssetEntry[] = [];
  for (const relativePath of [...new Set(relativePaths)].sort()) {
    if (relativePath.startsWith('/') || relativePath.split('/').includes('..'))
      throw new TypeError('COPIED_ASSET_PATH_INVALID');
    const bytes = await readFile(resolve(root, 'apps/game/public', relativePath));
    files.push({ url: `/${relativePath}`, bytes: bytes.byteLength,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      kind: relativePath.startsWith('content/vfx/') || relativePath.includes('/vfx/')
        ? 'vfx' : 'asset' });
  }
  const manifest: CopiedAssetManifest = { format: 1, files };
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(manifest) + '\n');
  return manifest;
}
