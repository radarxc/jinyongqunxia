import { access, copyFile, mkdir, readFile, readdir } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { recordCopiedAssetReference, type CopiedAssetReferenceMap } from './copied-assets';

interface DressupManifestRow {
  file?: string;
  fit?: string;
  report?: string;
  status?: string;
  fits?: DressupManifestRow[];
}

function scalar(value: string): string {
  return value.trim().replace(/^(?:"(.*)"|'(.*)')$/u, '$1$2');
}

function runtimeRows(text: string): readonly DressupManifestRow[] {
  const rows: DressupManifestRow[] = [];
  let row: DressupManifestRow | undefined;
  let inFits = false; let fit: DressupManifestRow | undefined;
  for (const line of text.split(/\r?\n/u)) {
    if (/^- id:\s/u.test(line)) {
      if (row) rows.push(row);
      row = {};
      inFits = false; fit = undefined;
      continue;
    }
    if (!row) continue;
    if (/^ {2}fits:\s*(?:#.*)?$/u.test(line)) { inFits = true; row.fits = []; continue; }
    if (/^ {2}\S/u.test(line)) { inFits = false; fit = undefined; }
    const fitStart = inFits && line.match(/^ {4}[^\s:#][^:#]*:\s*(.*)$/u);
    if (fitStart) {
      fit = {}; row.fits!.push(fit);
      for (const field of fitStart[1]!.matchAll(/(file|fit|report|status):\s*([^,}#]+)/gu))
        fit[field[1] as keyof DressupManifestRow] = scalar(field[2]!);
      continue;
    }
    const fitField = inFits && fit && line.match(/^ {6}(file|fit|report|status):\s*([^#]+?)(?:\s+#.*)?$/u);
    if (fitField) { fit[fitField[1] as keyof DressupManifestRow] = scalar(fitField[2]!); continue; }
    const field = line.match(/^ {2}(file|fit|report|status):\s*([^#]+?)(?:\s+#.*)?$/u);
    if (!field) continue;
    const name = field[1] as keyof DressupManifestRow;
    row[name] = scalar(field[2]!);
  }
  if (row) rows.push(row);
  return rows;
}

async function manifests(directory: string): Promise<string[]> {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(entries.map(async entry => {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) return manifests(path);
      return entry.isFile() && entry.name === 'manifest.yaml' ? [path] : [];
    }));
    return nested.flat().sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

/** Copy non-rejected dressup file/fit/report entries; YAML parsing stays build-time only. */
export async function publishDressupAssets(
  root: string,
  copy: boolean,
  copied?: Set<string>,
  references?: CopiedAssetReferenceMap,
): Promise<string[]> {
  const assetRoot = resolve(root, 'assets/default/model3d/dressup');
  const selected = new Set<string>();
  const byManifest = new Map<string, Set<string>>();
  for (const manifest of await manifests(assetRoot)) {
    const paths = new Set<string>();
    for (const row of runtimeRows(await readFile(manifest, 'utf8'))) {
      const variants = row.status === 'rejected' ? [] : [row, ...(row.fits ?? [])];
      for (const variant of variants) {
        if (variant.status === 'rejected') continue;
        for (const file of [variant.file, variant.fit, variant.report]) {
          if (!file) continue;
          const source = resolve(dirname(manifest), file);
          if (!source.startsWith(dirname(manifest) + sep) || file.split(/[\\/]/u).includes('..'))
            throw new Error('DRESSUP_ASSET_PATH_INVALID');
          await access(source);
          const path = relative(root, source).split(sep).join('/');
          if (!path.startsWith('assets/default/model3d/dressup/'))
            throw new Error('DRESSUP_ASSET_OUTSIDE_ROOT');
          selected.add(path); paths.add(path);
        }
      }
    }
    byManifest.set(relative(root, manifest).split(sep).join('/'), paths);
  }
  for (const path of [...selected].sort()) if (copy) {
    const output = resolve(root, 'apps/game/public', path);
    await mkdir(dirname(output), { recursive: true });
    await copyFile(resolve(root, path), output); copied?.add(path);
  }
  for (const [manifest, paths] of byManifest) for (const path of paths)
    recordCopiedAssetReference(references, manifest, path);
  return [...selected].sort();
}
