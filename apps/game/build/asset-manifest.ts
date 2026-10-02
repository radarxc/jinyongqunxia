import { access, copyFile, mkdir, readFile, readdir } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { parseYamlFile } from '@tianshu/data/tooling';
import type { GameContent } from '../src/runtime/content';

export async function filesIn(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory()
    ? filesIn(join(directory, entry.name)) : Promise.resolve([join(directory, entry.name)])));
  return nested.flat().sort();
}

/** Manifest availability is included in the DTO, avoiding known-missing image requests. */
export async function readAssetManifest(root: string, copy: boolean): Promise<NonNullable<GameContent['assets']>> {
  const source = join(root, 'assets/default');
  const result: Record<string, { icon?: string; portrait?: string; map?: string }> = {};
  const consumed = ['/item/', '/character/', '/portrait/', '/baseline/map/'];
  for (const path of (await filesIn(source)).filter((file) =>
    file.endsWith('/manifest.yaml') && consumed.some((segment) => file.includes(segment)))) {
    const rows = parseYamlFile({ path, text: await readFile(path, 'utf8') });
    if (!Array.isArray(rows)) continue;
    for (const row of rows as Record<string, unknown>[]) {
      if (row['status'] === 'rejected' || typeof row['id'] !== 'string') continue;
      const icons = Array.isArray(row['icons']) ? row['icons'] as { file?: string }[] : [];
      const images = icons.filter((icon) => icon.file?.endsWith('_64.png')).map((icon) => ({ file: icon.file!, key: 'icon' as const }));
      const portrait = path.includes('/portrait/') && typeof row['file'] === 'string'
        ? [{ file: row['file'], key: 'portrait' as const }] : [];
      const maps = path.includes('/map/') && row['id'].startsWith('ref_map_jianghu__') && typeof row['file'] === 'string'
        ? [{ file: row['file'], key: 'map' as const }] : [];
      for (const image of [...images, ...portrait, ...maps]) {
        const absolute = resolve(dirname(path), image.file);
        if (!absolute.startsWith(source + '/')) throw new Error('ASSET_OUTSIDE_ROOT');
        try { await access(absolute); } catch { continue; }
        const assetPath = 'assets/default/' + relative(source, absolute);
        result[row['id']] = { ...result[row['id']], [image.key]: assetPath };
        if (!copy) continue;
        const output = join(root, 'apps/game/public', assetPath);
        await mkdir(dirname(output), { recursive: true }); await copyFile(absolute, output);
      }
    }
  }
  return result;
}

interface VfxRuntimeManifest { readonly schema: 'tianshu-vfx-runtime.v1'; readonly files: readonly string[] }
interface VfxRuntimeDocument {
  readonly schemaVersion: 'event.v1';
  readonly actions: readonly { readonly payload?: VfxRuntimeManifest }[];
}

/** Copy only exporter-approved VFX runtime files; source YAML and demo HTML stay outside public. */
export async function publishVfxRuntime(root: string, copy: boolean): Promise<number> {
  const manifestPath = join(root, 'content/vfx/runtime-files.json');
  const document = JSON.parse(await readFile(manifestPath, 'utf8')) as VfxRuntimeDocument;
  const value = document.actions[0]?.payload;
  if (document.schemaVersion !== 'event.v1') throw new Error('VFX_RUNTIME_DOCUMENT_INVALID');
  if (!value || value.schema !== 'tianshu-vfx-runtime.v1' || !Array.isArray(value.files))
    throw new Error('VFX_RUNTIME_MANIFEST_INVALID');
  const allowed = [resolve(root, 'assets/default') + '/', resolve(root, 'content/vfx') + '/'];
  let count = 0;
  for (const relativePath of value.files) {
    if (typeof relativePath !== 'string' || relativePath.startsWith('/') || relativePath.split('/').includes('..'))
      throw new Error('VFX_RUNTIME_PATH_INVALID');
    const source = resolve(root, relativePath);
    if (!allowed.some(prefix => source.startsWith(prefix))) throw new Error('VFX_RUNTIME_OUTSIDE_ROOT');
    await access(source); count += 1;
    if (!copy) continue;
    const output = join(root, 'apps/game/public', relativePath);
    await mkdir(dirname(output), { recursive: true }); await copyFile(source, output);
  }
  return count;
}
