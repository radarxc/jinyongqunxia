import { access, copyFile, mkdir, readFile, readdir, rm } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { parseYamlFile } from '@tianshu/data/tooling';
import type { Plugin } from 'vite';

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function manifestsIn(directory: string): Promise<string[]> {
  if (!(await exists(directory))) return [];
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? manifestsIn(join(directory, entry.name))
        : Promise.resolve(entry.name === 'manifest.yaml' ? [join(directory, entry.name)] : []),
    ),
  );
  return nested.flat().sort();
}

function declaredFiles(row: Record<string, unknown>): string[] {
  const files = new Set<string>();
  const visit = (value: unknown, key?: string): void => {
    if (key === 'file' && typeof value === 'string') files.add(value);
    if (key === 'files' && value && typeof value === 'object' && !Array.isArray(value))
      for (const file of Object.keys(value)) files.add(file);
    if (value && typeof value === 'object')
      for (const [childKey, child] of Object.entries(value)) visit(child, childKey);
  };
  visit(row);
  return [...files].sort();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function manifestRows(parsed: unknown): Record<string, unknown>[] {
  if (Array.isArray(parsed)) return parsed.filter(isRecord);
  if (
    !isRecord(parsed) ||
    parsed['schemaVersion'] !== 'buildkit-layers.v1' ||
    parsed['status'] === 'rejected'
  )
    return [];
  return ['layers', 'strips'].flatMap((key) => {
    const rows = parsed[key];
    return Array.isArray(rows) ? rows.filter(isRecord) : [];
  });
}

async function copyManifestEntries(sourceRoot: string, outputRoot: string): Promise<number> {
  let copied = 0;
  for (const manifest of await manifestsIn(sourceRoot)) {
    const parsed = parseYamlFile({ path: manifest, text: await readFile(manifest, 'utf8') });
    for (const row of manifestRows(parsed)) {
      if (row['status'] === 'rejected') continue;
      for (const file of declaredFiles(row)) {
        const source = resolve(dirname(manifest), file);
        if (!source.startsWith(sourceRoot + '/') || !(await exists(source))) {
          if (!source.startsWith(sourceRoot + '/'))
            throw new Error(`TOWN_ASSET_OUTSIDE_ROOT:${file}`);
          console.warn(`TOWN_ASSET_SOURCE_MISSING:${relative(sourceRoot, source)}`);
          continue;
        }
        const output = join(outputRoot, relative(sourceRoot, source));
        await mkdir(dirname(output), { recursive: true });
        await copyFile(source, output);
        copied += 1;
      }
    }
  }
  return copied;
}

export async function publishTownAssets(root: string): Promise<number> {
  const buildkit = join(root, 'assets/default/buildkit');
  const model3d = join(root, 'assets/default/model3d');
  let copied = 0;
  if (await exists(buildkit)) {
    const output = join(root, 'apps/game/public/assets/default/buildkit');
    await rm(output, { recursive: true, force: true });
    copied += await copyManifestEntries(buildkit, output);
  }
  if (await exists(model3d)) {
    const entries = await readdir(model3d, { withFileTypes: true });
    for (const entry of entries
      .filter((item) => item.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name))) {
      const town = join(model3d, entry.name, 'town');
      if (!(await exists(town))) continue;
      const output = join(root, 'apps/game/public/assets/default/model3d', entry.name, 'town');
      await rm(output, { recursive: true, force: true });
      copied += await copyManifestEntries(town, output);
    }
  }
  return copied;
}

export function townAssetsPlugin(root = resolve(import.meta.dirname, '../../..')): Plugin {
  return {
    name: 'tianshu-town-assets',
    apply: 'build',
    async buildStart() {
      await publishTownAssets(root);
    },
  };
}
