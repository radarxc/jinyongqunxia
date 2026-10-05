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
  /** Exact content asset key or URL -> copied runtime URLs. Additive to format 1. */
  readonly references?: Readonly<Record<string, readonly string[]>>;
}

export type CopiedAssetReferenceMap = Map<string, Set<string>>;

export function copiedAssetAliases(path: string): string[] {
  const url = path.startsWith('/') ? path : `/${path}`;
  return [url, url.slice(1)];
}

export function recordCopiedAssetReference(
  references: CopiedAssetReferenceMap | undefined,
  reference: string,
  relativePath: string,
): void {
  if (!references || reference.length === 0) return;
  const url = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  const urls = references.get(reference) ?? new Set<string>();
  urls.add(url); references.set(reference, urls);
}

export async function writeCopiedAssetManifest(
  root: string,
  relativePaths: readonly string[],
  output = join(root, 'apps/game/dist/offline/copied-assets.json'),
  sourceReferences?: ReadonlyMap<string, ReadonlySet<string>>,
): Promise<CopiedAssetManifest> {
  const files: CopiedAssetEntry[] = [];
  const paths = [...new Set(relativePaths)].sort();
  for (const relativePath of paths) {
    if (relativePath.startsWith('/') || relativePath.split('/').includes('..'))
      throw new TypeError('COPIED_ASSET_PATH_INVALID');
    const bytes = await readFile(resolve(root, 'apps/game/public', relativePath));
    files.push({ url: `/${relativePath}`, bytes: bytes.byteLength,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      kind: relativePath.startsWith('content/vfx/') || relativePath.includes('/vfx/')
        ? 'vfx' : 'asset' });
  }
  const copiedUrls = new Set(files.map(file => file.url));
  const references = new Map<string, Set<string>>();
  for (const relativePath of paths) {
    for (const alias of copiedAssetAliases(relativePath))
      recordCopiedAssetReference(references, alias, relativePath);
  }
  for (const [reference, urls] of sourceReferences ?? []) for (const url of urls) {
    if (copiedUrls.has(url)) recordCopiedAssetReference(references, reference, url);
  }
  const referenceObject = Object.fromEntries([...references].sort(([left], [right]) =>
    left < right ? -1 : left > right ? 1 : 0).map(([reference, urls]) =>
    [reference, [...urls].sort()]));
  const manifest: CopiedAssetManifest = { format: 1, files, references: referenceObject };
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(manifest) + '\n');
  return manifest;
}
