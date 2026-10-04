import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, posix, resolve } from 'node:path';
import { copiedAssetAliases, type CopiedAssetManifest } from './copied-assets';

type OfflineFileKind = 'manifest' | 'content' | 'asset' | 'vfx';
interface OfflineFile { readonly url: string; readonly bytes: number; readonly sha256: string;
  readonly kind: OfflineFileKind }
export interface OfflineClosure { readonly format: 1; readonly chapter: string; readonly releaseHash: string;
  readonly files: readonly OfflineFile[]; readonly totals: { readonly files: number; readonly bytes: number;
    readonly enterBytes: number; readonly byKind: Readonly<Record<OfflineFileKind, number>> } }

export const MAX_OFFLINE_FILE_BYTES = 8 * 1024 * 1024;
export const MAX_ENTER_BYTES = 60 * 1024 * 1024;
const compareUrl = (left: { readonly url: string }, right: { readonly url: string }): number =>
  left.url < right.url ? -1 : left.url > right.url ? 1 : 0;

export function enforceEnterBudget(chapter: string, bytes: number, warn?: (message: string) => void): void {
  if (bytes <= MAX_ENTER_BYTES) return;
  const message = `OFFLINE_ENTER_TOO_LARGE:${chapter}:${bytes}`;
  if (chapter.startsWith('ch00_')) warn?.(message);
  else throw new Error(message);
}

interface ContentLeaf { readonly logicalName: string; readonly rawBytes: number;
  readonly sha256: string; readonly load: 'resident' | 'chapter' | 'region'; readonly region?: string }
interface ContentManifest { readonly chapter: string; readonly releaseHash: string;
  readonly leaves: readonly ContentLeaf[] }
export interface EnterTrace {
  readonly openingRegion: string | null;
  readonly contentUrls: readonly string[];
  readonly assetUrls: readonly string[];
  readonly manifestUrls: readonly string[];
}
export interface ClosureBuildOptions {
  readonly publicDir: string; readonly outDir: string; readonly chapter?: string;
  readonly warn?: (message: string) => void;
}

function stableJson(value: unknown): string { return JSON.stringify(value) + '\n'; }
function walkValues(value: unknown, visit: (value: string) => void): void {
  if (typeof value === 'string') { visit(value); return; }
  if (Array.isArray(value)) { for (const child of value) walkValues(child, visit); return; }
  if (typeof value === 'object' && value !== null)
    for (const child of Object.values(value)) walkValues(child, visit);
}
function walkObjects(value: unknown, visit: (value: Readonly<Record<string, unknown>>) => void): void {
  if (Array.isArray(value)) { for (const child of value) walkObjects(child, visit); return; }
  if (typeof value !== 'object' || value === null) return;
  const object = value as Readonly<Record<string, unknown>>; visit(object);
  for (const child of Object.values(object)) walkObjects(child, visit);
}
function openingRegion(chapter: string, values: readonly unknown[]): string | null {
  const wakeRegions = new Set<string>(); const mapRegions = new Set<string>();
  for (const value of values) walkObjects(value, object => {
    const wake = object['wake'];
    if (object['schemaVersion'] === 'book-world.v1' && object['id'] === chapter &&
        typeof wake === 'object' && wake !== null) {
      const region = (wake as Readonly<Record<string, unknown>>)['regionId'];
      if (typeof region === 'string') wakeRegions.add(region);
    }
    const nodes = object['nodes']; const startNodeId = object['startNodeId'];
    if (object['chapterId'] === chapter && typeof startNodeId === 'string' && Array.isArray(nodes)) {
      const start = nodes.find(node => typeof node === 'object' && node !== null &&
        (node as Readonly<Record<string, unknown>>)['id'] === startNodeId) as Readonly<Record<string, unknown>> | undefined;
      if (typeof start?.['regionId'] === 'string') mapRegions.add(start['regionId']);
    }
  });
  const candidates = wakeRegions.size > 0 ? wakeRegions : mapRegions;
  if (candidates.size > 1) throw new Error(`OFFLINE_OPENING_REGION_AMBIGUOUS:${chapter}`);
  return [...candidates][0] ?? null;
}

/** Pure content-reference walk used by the build and fixture tests. */
export function traceEnterUrls(
  manifest: ContentManifest,
  leafValues: Readonly<Record<string, unknown>>,
  copied: CopiedAssetManifest,
): EnterTrace {
  const baseLeaves = manifest.leaves.filter(leaf => leaf.load !== 'region');
  const baseValues = baseLeaves.map(leaf => leafValues[leaf.logicalName]);
  const region = openingRegion(manifest.chapter, baseValues);
  const selectedLeaves = manifest.leaves.filter(leaf => leaf.load !== 'region' ||
    (region !== null && leaf.region === region));
  const references = new Map<string, Set<string>>();
  const add = (reference: string, url: string): void => {
    const urls = references.get(reference) ?? new Set<string>(); urls.add(url); references.set(reference, urls);
  };
  for (const file of copied.files) for (const alias of copiedAssetAliases(file.url)) add(alias, file.url);
  for (const [reference, urls] of Object.entries(copied.references ?? {}))
    for (const url of urls) add(reference, url);
  const assetUrls = new Set<string>();
  for (const leaf of selectedLeaves) walkValues(leafValues[leaf.logicalName], reference => {
    for (const url of references.get(reference) ?? []) assetUrls.add(url);
  });
  return { openingRegion: region,
    contentUrls: selectedLeaves.map(leaf => posix.join('/content', manifest.chapter, leaf.logicalName)).sort(),
    assetUrls: [...assetUrls].sort(),
    manifestUrls: ['/content/index.json', posix.join('/content', manifest.chapter, 'manifest.json')].sort() };
}
function classify(url: string): OfflineFileKind {
  if (url === '/content/index.json' || url.endsWith('/manifest.json')) return 'manifest';
  if (url.startsWith('/content/vfx/') || url.includes('/vfx/')) return 'vfx';
  return url.startsWith('/content/') ? 'content' : 'asset';
}
function totalByKind(files: readonly OfflineFile[]): Record<OfflineFileKind, number> {
  const totals = { manifest: 0, content: 0, asset: 0, vfx: 0 };
  for (const file of files) totals[file.kind] += file.bytes;
  return totals;
}
async function fileEntry(path: string, url: string): Promise<OfflineFile> {
  const bytes = await readFile(path);
  return { url, bytes: bytes.byteLength, sha256: createHash('sha256').update(bytes).digest('hex'),
    kind: classify(url) };
}

export async function buildOfflineClosures(options: ClosureBuildOptions): Promise<OfflineClosure[]> {
  const publicDir = resolve(options.publicDir); const outDir = resolve(options.outDir);
  const indexPath = join(publicDir, 'content/index.json');
  const index = JSON.parse(await readFile(indexPath, 'utf8')) as {
    chapters: readonly { chapter: string; manifest: string; releaseHash: string }[] };
  let copied: CopiedAssetManifest = { format: 1, files: [] };
  try { copied = JSON.parse(await readFile(join(outDir, 'offline/copied-assets.json'), 'utf8')) as CopiedAssetManifest; }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  const selected = index.chapters.filter(row => options.chapter === undefined || row.chapter === options.chapter)
    .sort((left, right) => left.chapter < right.chapter ? -1 : left.chapter > right.chapter ? 1 : 0);
  if (options.chapter !== undefined && selected.length === 0) throw new Error(`OFFLINE_CHAPTER_UNKNOWN:${options.chapter}`);
  const closures: OfflineClosure[] = [];
  for (const row of selected) {
    const manifestPath = join(publicDir, 'content', row.manifest);
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as ContentManifest;
    if (manifest.chapter !== row.chapter || manifest.releaseHash !== row.releaseHash)
      throw new Error(`OFFLINE_MANIFEST_MISMATCH:${row.chapter}`);
    const content = await Promise.all(manifest.leaves.map(async leaf => {
      const url = posix.join('/content', manifest.chapter, leaf.logicalName);
      const actual = await fileEntry(join(publicDir, url.slice(1)), url);
      if (actual.bytes !== leaf.rawBytes || actual.sha256 !== leaf.sha256)
        throw new Error(`OFFLINE_CONTENT_HASH_MISMATCH:${url}`);
      return actual;
    }));
    const root = await fileEntry(manifestPath, posix.join('/content', row.manifest));
    const contentIndex = await fileEntry(indexPath, '/content/index.json');
    const unsorted = [...content, root, contentIndex, ...copied.files];
    if (new Set(unsorted.map(file => file.url)).size !== unsorted.length)
      throw new Error(`OFFLINE_FILE_DUPLICATE:${manifest.chapter}`);
    const files = unsorted.sort(compareUrl);
    const oversized = files.find(file => file.bytes > MAX_OFFLINE_FILE_BYTES);
    if (oversized) throw new Error(`OFFLINE_FILE_TOO_LARGE:${oversized.url}:${oversized.bytes}`);
    const leafValues = Object.fromEntries(await Promise.all(manifest.leaves.map(async leaf =>
      [leaf.logicalName, JSON.parse(await readFile(join(publicDir, 'content', manifest.chapter,
        leaf.logicalName), 'utf8')) as unknown])));
    const enter = traceEnterUrls(manifest, leafValues, copied);
    const enterUrls = new Set([...enter.contentUrls, ...enter.assetUrls, ...enter.manifestUrls]);
    const enterBytes = files.filter(file => enterUrls.has(file.url))
      .reduce((sum, file) => sum + file.bytes, 0);
    enforceEnterBudget(manifest.chapter, enterBytes, options.warn);
    const releaseHash = createHash('sha256').update(stableJson(files.map(({ url, bytes, sha256, kind }) =>
      ({ url, bytes, sha256, kind })))).digest('hex');
    closures.push({ format: 1, chapter: manifest.chapter, releaseHash, files,
      totals: { files: files.length, bytes: files.reduce((sum, file) => sum + file.bytes, 0),
        enterBytes, byKind: totalByKind(files) } });
  }
  await mkdir(join(outDir, 'offline'), { recursive: true });
  for (const closure of closures) await writeFile(join(outDir, `offline/closure.${closure.chapter}.json`),
    stableJson(closure));
  const chapters = closures.map(({ chapter, releaseHash }) => ({ chapter, releaseHash }));
  const assetsHash = createHash('sha256').update(stableJson([...copied.files].sort(compareUrl).map(({ url, bytes, sha256 }) =>
    ({ url, bytes, sha256 })))).digest('hex');
  const releaseHash = createHash('sha256').update(stableJson({ chapters, assetsHash })).digest('hex');
  await writeFile(join(outDir, 'version.json'), stableJson({ format: 1, releaseHash, assetsHash, chapters }));
  await writeFile(join(outDir, '_headers'), [
    '/', '  Cache-Control: no-cache', '/index.html', '  Cache-Control: no-cache',
    '/sw.js', '  Cache-Control: no-cache', '/version.json', '  Cache-Control: no-cache',
    '/content/index.json', '  Cache-Control: no-cache', '/offline/*', '  Cache-Control: no-cache', '',
  ].join('\n'));
  return closures;
}
