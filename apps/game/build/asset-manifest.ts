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
