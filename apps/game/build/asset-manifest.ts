import { createHash } from 'node:crypto';
import { access, copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { parseYamlFile } from '@tianshu/data/tooling';
import type { TownRuntimeDefinition } from '@tianshu/data/schemas';
import type { GameContent } from '../src/runtime/content';
import { recordCopiedAssetReference, type CopiedAssetReferenceMap } from './copied-assets';

export async function filesIn(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory()
    ? filesIn(join(directory, entry.name)) : Promise.resolve([join(directory, entry.name)])));
  return nested.flat().sort();
}

async function copyAvailableAsset(root: string, source: string, absolute: string,
  assetPath: string): Promise<boolean> {
  try { await access(absolute); } catch {
    console.warn(`ASSET_SOURCE_MISSING:${relative(source, absolute)}`);
    return false;
  }
  const output = join(root, 'apps/game/public', assetPath);
  try {
    const [srcStat, outStat] = await Promise.all([stat(absolute), stat(output)]);
    if (srcStat.size === outStat.size && srcStat.mtimeMs <= outStat.mtimeMs) {
      return true;
    }
  } catch {
    // needs copy
  }
  await mkdir(dirname(output), { recursive: true });
  await copyFile(absolute, output);
  return true;
}

/** Manifest availability is included in the DTO, avoiding known-missing image requests. */
async function copyTownAssets(root: string, source: string, copy: boolean,
  towns: readonly TownRuntimeDefinition[], copied?: Set<string>,
  references?: CopiedAssetReferenceMap): Promise<void> {
  if (!copy) return;
  const files = new Set<string>();
  for (const town of towns) for (const atlas of [town.assets.tile, town.assets.building]) {
    const directory = resolve(root, '.' + atlas.baseUrl);
    if (!directory.startsWith(source + '/')) throw new Error('ASSET_OUTSIDE_ROOT');
    for (const entry of atlas.entries) files.add(resolve(directory, entry.file));
  }
  for (const absolute of [...files].sort()) {
    if (!absolute.startsWith(source + '/')) throw new Error('ASSET_OUTSIDE_ROOT');
    const assetPath = 'assets/default/' + relative(source, absolute);
    if (!await copyAvailableAsset(root, source, absolute, assetPath)) continue;
    copied?.add(assetPath);
    recordCopiedAssetReference(references, assetPath, assetPath);
    recordCopiedAssetReference(references, `/${assetPath}`, assetPath);
  }
  for (const town of towns) for (const atlas of [town.assets.tile, town.assets.building])
    for (const entry of atlas.entries) {
      const assetPath = `assets/default/${relative(source, resolve(root, '.' + atlas.baseUrl, entry.file))}`;
      for (const key of [entry.id, entry.file, `${atlas.baseUrl}${entry.file}`])
        recordCopiedAssetReference(references, key, assetPath);
    }
}

export async function readAssetManifest(root: string, copy: boolean,
  towns: readonly TownRuntimeDefinition[] = [], copied?: Set<string>,
  references?: CopiedAssetReferenceMap): Promise<NonNullable<GameContent['assets']>> {
  const source = join(root, 'assets/default');
  const result: Record<string, { icon?: string; portrait?: string; map?: string }> = {};
  const consumed = ['/item/', '/character/', '/portrait/', '/baseline/map/', '/map/world/'];
  for (const path of (await filesIn(source)).filter((file) =>
    file.endsWith('/manifest.yaml') && consumed.some((segment) => file.includes(segment)))) {
    const rows = parseYamlFile({ path, text: await readFile(path, 'utf8') });
    if (!Array.isArray(rows)) continue;
    for (const row of rows as Record<string, unknown>[]) {
      if (row['status'] === 'rejected' || typeof row['id'] !== 'string') continue;
      const icons = Array.isArray(row['icons']) ? (row['icons'] as { file?: string }[]) : [];
      const preferredIcon =
        icons.find((icon) => icon.file?.endsWith('_64.png'))?.file ??
        icons.find((icon) => icon.file?.endsWith('_128.png'))?.file ??
        icons[0]?.file;
      const itemFile = path.includes('/item/') ? preferredIcon : undefined;
      const images = itemFile ? [{ file: itemFile, key: 'icon' as const }] : [];
      const portrait = path.includes('/portrait/') && typeof row['file'] === 'string'
        ? [{ file: row['file'], key: 'portrait' as const }] : [];
      const maps = path.includes('/map/') &&
        (row['id'].startsWith('ref_map_jianghu__') || row['id'].startsWith('map_world_')) && typeof row['file'] === 'string'
        ? [{ file: row['file'], key: 'map' as const }] : [];
      for (const image of [...images, ...portrait, ...maps]) {
        const absolute = resolve(dirname(path), image.file);
        if (!absolute.startsWith(source + '/')) throw new Error('ASSET_OUTSIDE_ROOT');
        const assetPath = 'assets/default/' + relative(source, absolute);
        result[row['id']] = { ...result[row['id']], [image.key]: assetPath };
        if (!copy) continue;
        if (!await copyAvailableAsset(root, source, absolute, assetPath)) continue;
        copied?.add(assetPath);
        recordCopiedAssetReference(references, row['id'], assetPath);
        recordCopiedAssetReference(references, image.file, assetPath);
        recordCopiedAssetReference(references, assetPath, assetPath);
        recordCopiedAssetReference(references, `/${assetPath}`, assetPath);
      }
    }
  }
  await copyTownAssets(root, source, copy, towns, copied, references);
  await publishMapOverlays(root, copy, copied, references);
  if (copy) {
    const portraits: Record<string, string> = {};
    for (const [id, entry] of Object.entries(result))
      if (entry.portrait && copied?.has(entry.portrait) !== false) portraits[id] = `/${entry.portrait}`;
    const output = join(root, 'apps/game/public/assets/default/portrait/index.json');
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, JSON.stringify(portraits));
  }
  return result;
}

/** Pixel size from a PNG / WebP / JPEG header; null when the format is not recognised. */
export function imageSize(bytes: Uint8Array): { width: number; height: number } | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const ascii = (start: number, length: number) => String.fromCharCode(...bytes.subarray(start, start + length));
  if (bytes.length >= 24 && ascii(1, 3) === 'PNG' && ascii(12, 4) === 'IHDR')
    return { width: view.getUint32(16), height: view.getUint32(20) };
  if (bytes.length >= 30 && ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') {
    const chunk = ascii(12, 4);
    if (chunk === 'VP8X') return { width: 1 + (bytes[24]! | bytes[25]! << 8 | bytes[26]! << 16),
      height: 1 + (bytes[27]! | bytes[28]! << 8 | bytes[29]! << 16) };
    if (chunk === 'VP8L') {
      const bits = view.getUint32(21, true);
      return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >>> 14) & 0x3fff) };
    }
    if (chunk === 'VP8 ') return { width: view.getUint16(26, true) & 0x3fff, height: view.getUint16(28, true) & 0x3fff };
    return null;
  }
  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    for (let offset = 2; offset + 9 < bytes.length;) {
      if (bytes[offset] !== 0xff) { offset += 1; continue; }
      const marker = bytes[offset + 1]!;
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc)
        return { width: view.getUint16(offset + 7), height: view.getUint16(offset + 5) };
      offset += 2 + view.getUint16(offset + 2);
    }
  }
  return null;
}

/** Every image file hero.json names (walk / run / idle of each variant); null when it is missing or unreadable. */
async function heroImageNames(path: string): Promise<string[] | null> {
  let value: unknown;
  try { value = JSON.parse(await readFile(path, 'utf8')); } catch { return null; }
  const variants = (value as { variants?: unknown } | null)?.variants;
  if (!variants || typeof variants !== 'object') return null;
  const names: string[] = [];
  for (const variant of Object.values(variants as Record<string, unknown>))
    for (const clip of ['walk', 'run', 'idle']) {
      const image = ((variant as Record<string, unknown> | null)?.[clip] as { image?: unknown } | undefined)?.image;
      if (typeof image === 'string') names.push(image);
    }
  return names;
}

/** Landmark row published to the world-map page (docs/tech/13 §5.3). */
export interface MapLandmarkIndexRow {
  readonly id: string; readonly node: string; readonly chapters: readonly string[]; readonly url: string;
  readonly anchor: readonly [number, number]; readonly footprintGrid: number;
  readonly width: number; readonly height: number;
}

/**
 * Copy the marker atlas, the hero's walk / run strips and era landmark vignettes, and write the landmark
 * index the page loads once. Optional directories: absent manifests publish an empty index so the page
 * simply draws icons (and the standee hero).
 */
export async function publishMapOverlays(root: string, copy: boolean, copied?: Set<string>,
  references?: CopiedAssetReferenceMap): Promise<readonly MapLandmarkIndexRow[]> {
  const source = join(root, 'assets/default');
  const publish = async (absolute: string): Promise<string | null> => {
    if (!absolute.startsWith(source + '/')) throw new Error('ASSET_OUTSIDE_ROOT');
    const assetPath = 'assets/default/' + relative(source, absolute);
    if (!copy) return assetPath;
    if (!await copyAvailableAsset(root, source, absolute, assetPath)) return null;
    copied?.add(assetPath);
    recordCopiedAssetReference(references, assetPath, assetPath);
    recordCopiedAssetReference(references, `/${assetPath}`, assetPath);
    return assetPath;
  };
  const rowsOf = async (path: string): Promise<Record<string, unknown>[]> => {
    try { await access(path); } catch { return []; }
    const rows = parseYamlFile({ path, text: await readFile(path, 'utf8') });
    return Array.isArray(rows) ? rows as Record<string, unknown>[] : [];
  };
  const markers = join(source, 'map/markers');
  for (const row of await rowsOf(join(markers, 'manifest.yaml'))) {
    if (row['status'] === 'rejected' || typeof row['file'] !== 'string') continue;
    await publish(resolve(markers, row['file']));
    await publish(join(markers, 'atlas.json'));
  }
  // The hero pack (AR-116) is all or nothing: hero.json is published only when every strip it names was
  // accepted and copied. The generated directory is rebuilt each time, so nothing stale reaches dist.
  const hero = join(source, 'map/hero');
  if (copy) await rm(join(root, 'apps/game/public/assets/default/map/hero'), { recursive: true, force: true });
  const heroCopied = new Set<string>();
  for (const row of await rowsOf(join(hero, 'manifest.yaml'))) {
    if (row['status'] === 'rejected' || typeof row['file'] !== 'string') continue;
    const absolute = resolve(hero, row['file']);
    // A strip that no longer matches its manifest hash belongs to another pack batch: keep it out.
    if (typeof row['sha256'] === 'string') {
      let bytes: Uint8Array;
      try { bytes = await readFile(absolute); } catch { continue; }
      if (createHash('sha256').update(bytes).digest('hex') !== row['sha256']) {
        console.warn(`MAP_HERO_STALE:${row['file']}`); continue;
      }
    }
    if (await publish(absolute)) heroCopied.add(row['file']);
  }
  const heroNames = await heroImageNames(join(hero, 'hero.json'));
  if (heroNames && heroNames.length > 0 && heroNames.every(name => heroCopied.has(name)))
    await publish(join(hero, 'hero.json'));
  else if (heroCopied.size > 0) console.warn('MAP_HERO_INCOMPLETE: hero.json not published; the page keeps the standee');
  const landmarks = join(source, 'map/landmark');
  const index: MapLandmarkIndexRow[] = [];
  for (const row of await rowsOf(join(landmarks, 'manifest.yaml'))) {
    if (row['status'] === 'rejected' || typeof row['id'] !== 'string' || typeof row['file'] !== 'string') continue;
    const size = typeof row['size'] === 'string' ? /^(\d+)x(\d+)$/.exec(row['size']) : null;
    const anchor = row['anchor']; const chapters = row['chapters'];
    const footprint = row['footprint_grid'];
    if (!size || typeof row['node'] !== 'string' || typeof footprint !== 'number' ||
        !Number.isFinite(footprint) || footprint <= 0 || !Array.isArray(anchor) || anchor.length !== 2 ||
        !anchor.every((v) => typeof v === 'number' && Number.isFinite(v)) ||
        !Array.isArray(chapters) || !chapters.every((v) => typeof v === 'string'))
      throw new Error(`MAP_LANDMARK_ROW_INVALID:${row['id']}`);
    const absolute = resolve(landmarks, row['file']);
    let bytes: Uint8Array;
    try { bytes = await readFile(absolute); } catch { console.warn(`ASSET_SOURCE_MISSING:${relative(source, absolute)}`); continue; }
    // The page sizes vignettes from real pixels; a stale manifest `size` fails the build instead.
    const actual = imageSize(bytes);
    if (!actual) throw new Error(`MAP_LANDMARK_IMAGE_UNREADABLE:${row['id']}`);
    if (actual.width !== Number(size[1]) || actual.height !== Number(size[2]))
      throw new Error(`MAP_LANDMARK_SIZE_MISMATCH:${row['id']}:${actual.width}x${actual.height}`);
    const [ax, ay] = anchor as [number, number];
    if (ax < 0 || ax > actual.width || ay < 0 || ay > actual.height)
      throw new Error(`MAP_LANDMARK_ANCHOR_OUTSIDE:${row['id']}:${ax},${ay}`);
    const assetPath = await publish(absolute);
    if (!assetPath) continue;
    index.push({ id: row['id'], node: row['node'], chapters: chapters as string[], url: `/${assetPath}`,
      anchor: [anchor[0] as number, anchor[1] as number], footprintGrid: row['footprint_grid'],
      width: actual.width, height: actual.height });
  }
  index.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  if (copy) {
    const output = join(root, 'apps/game/public/assets/default/map/landmark/index.json');
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, JSON.stringify(index));
  }
  return index;
}

interface VfxRuntimeManifest { readonly schema: 'tianshu-vfx-runtime.v1'; readonly files: readonly string[] }
interface VfxRuntimeDocument {
  readonly schemaVersion: 'event.v1';
  readonly actions: readonly { readonly payload?: VfxRuntimeManifest }[];
}

/** Copy only exporter-approved VFX runtime files; source YAML and demo HTML stay outside public. */
export async function publishVfxRuntime(root: string, copy: boolean, copied?: Set<string>,
  references?: CopiedAssetReferenceMap): Promise<number> {
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
    copied?.add(relativePath);
    recordCopiedAssetReference(references, relativePath, relativePath);
    recordCopiedAssetReference(references, `/${relativePath}`, relativePath);
  }
  return count;
}
