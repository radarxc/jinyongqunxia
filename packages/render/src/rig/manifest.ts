import { CanvasTexture, DataTexture, LinearFilter, RGBAFormat, SRGBColorSpace, type Texture } from 'three';
import { createPlaceholderRigManifest } from './placeholder';
import { RIG_BONE_LENGTH_KEYS, RIG_NEAR_SIDE, RIG_SOURCE_PARTS, RIG_VIEWS, type AtlasCell, type RigManifest, type RigManifestPart, type RigSet } from './types';

export type RigManifestInput = RigManifest | { readonly manifestUrl: string; readonly runtimePpm?: number };
interface LoadedImage { readonly part: RigManifestPart; readonly image?: CanvasImageSource }
const EQUIPMENT_PLACEHOLDERS = [
  { key: 'placeholder/weapon_R', width: 36, height: 256 },
  { key: 'placeholder/weapon_L', width: 36, height: 256 },
  { key: 'placeholder/pauldron_R', width: 60, height: 48 },
  { key: 'placeholder/pauldron_L', width: 60, height: 48 },
  { key: 'placeholder/cape', width: 154, height: 244 },
] as const;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`RIG_MANIFEST_INVALID:${message}`);
}

export function validateRigManifest(manifest: RigManifest): void {
  assert(manifest.schema === 'tianshu-rig.v1', 'schema');
  assert(/^[a-z][a-z0-9_-]*$/.test(manifest.set), 'set');
  assert(manifest.ppm === 256 && Number.isFinite(manifest.heightM), 'scale');
  assert(manifest.skeleton === undefined || manifest.skeleton === 'tianshu_humanoid.v1', 'skeleton');
  if (manifest.boneLengthsM !== undefined) {
    const keys = Object.keys(manifest.boneLengthsM);
    assert(keys.every((key) => RIG_BONE_LENGTH_KEYS.includes(key as (typeof RIG_BONE_LENGTH_KEYS)[number])), 'bone-length-key');
    assert(keys.every((key) => { const value = manifest.boneLengthsM?.[key as keyof typeof manifest.boneLengthsM]; return Number.isFinite(value) && (value ?? 0) > 0; }), 'bone-length-value');
  }
  assert(manifest.nearSide === RIG_NEAR_SIDE, 'near-side');
  assert(manifest.views.length === 3 && new Set(manifest.views).size === 3 && RIG_VIEWS.every((view) => manifest.views.includes(view)), 'views');
  const paletteEntries = Object.entries(manifest.palette);
  assert(paletteEntries.length >= 3 && paletteEntries.length <= 8 && paletteEntries.every(([, value]) => /^#[0-9a-f]{6}$/i.test(value)), 'palette');
  const seen = new Set<string>();
  for (const part of manifest.parts) {
    const key = `${part.view}/${part.id}`;
    assert(RIG_VIEWS.includes(part.view), `${key}:view`);
    assert(RIG_SOURCE_PARTS.includes(part.id), `${key}:part`);
    assert(!seen.has(key), `${key}:duplicate`);
    assert(part.size[0] > 0 && part.size[1] > 0, `${key}:size`);
    assert(!part.file.startsWith('/') && !part.file.split('/').includes('..'), `${key}:file`);
    assert(part.pivot[0] >= -1 && part.pivot[0] <= part.size[0], `${key}:pivot-x`);
    assert(part.pivot[1] >= -1 && part.pivot[1] <= part.size[1], `${key}:pivot-y`);
    const rest = part.restAngle ?? 0;
    assert(Number.isFinite(rest) && rest >= -180 && rest < 180, `${key}:rest-angle`);
    assert(Number.isFinite(part.zOrder) && part.zOrder >= -2 && part.zOrder <= 15.5, `${key}:z`);
    if (part.jointSource !== undefined) {
      assert(!part.jointSource.startsWith('/') && !part.jointSource.split('/').includes('..'), `${key}:joint-source`);
    }
    if (part.sourceOrigin !== undefined) {
      assert(part.sourceOrigin.length === 2 && part.sourceOrigin.every(Number.isFinite), `${key}:source-origin`);
    }
    for (const [joint, point] of Object.entries(part.childJoint)) {
      assert(point[0] >= -1 && point[0] <= part.size[0] && point[1] >= -1 && point[1] <= part.size[1], `${key}:${joint}`);
    }
    seen.add(key);
  }
  assert(seen.size === RIG_VIEWS.length * RIG_SOURCE_PARTS.length, 'part-count');
  for (const view of RIG_VIEWS) for (const id of RIG_SOURCE_PARTS) assert(seen.has(`${view}/${id}`), `${view}/${id}:missing`);
}

async function resolveManifest(input: RigManifestInput): Promise<{ manifest: RigManifest; runtimePpm: number }> {
  if ('manifestUrl' in input) {
    const response = await fetch(input.manifestUrl);
    if (!response.ok) throw new Error(`RIG_MANIFEST_LOAD:${response.status}`);
    const manifest = (await response.json()) as RigManifest;
    return { manifest: { ...manifest, baseUrl: new URL('.', input.manifestUrl).href }, runtimePpm: input.runtimePpm ?? 96 };
  }
  return { manifest: input, runtimePpm: 96 };
}

async function loadPart(part: RigManifestPart, baseUrl?: string): Promise<LoadedImage> {
  if (!baseUrl || typeof createImageBitmap !== 'function') return { part };
  let response: Response;
  try {
    response = await fetch(new URL(part.file, baseUrl));
  } catch {
    return { part };
  }
  if (!response.ok) return { part };
  let image: ImageBitmap;
  try { image = await createImageBitmap(await response.blob()); } catch { return { part }; }
  if (image.width !== part.size[0] || image.height !== part.size[1]) { image.close(); throw new Error(`RIG_PART_SIZE:${part.view}/${part.id}`); }
  return { part, image };
}

function pack(images: readonly LoadedImage[]): { cells: Map<string, AtlasCell>; width: number; height: number } {
  const padding = 2;
  const width = 2048;
  let x = padding, y = padding, rowHeight = 0;
  const raw: Array<{ key: string; x: number; y: number; width: number; height: number }> = [];
  for (const { part } of images) {
    const [cellWidth, cellHeight] = part.size;
    if (x + cellWidth + padding > width) { x = padding; y += rowHeight + padding; rowHeight = 0; }
    raw.push({ key: `${part.view}/${part.id}`, x, y, width: cellWidth, height: cellHeight });
    x += cellWidth + padding; rowHeight = Math.max(rowHeight, cellHeight);
  }
  for (const placeholder of EQUIPMENT_PLACEHOLDERS) {
    if (x + placeholder.width + padding > width) { x = padding; y += rowHeight + padding; rowHeight = 0; }
    raw.push({ ...placeholder, x, y }); x += placeholder.width + padding; rowHeight = Math.max(rowHeight, placeholder.height);
  }
  const height = Math.max(2, 2 ** Math.ceil(Math.log2(y + rowHeight + padding)));
  const cells = new Map<string, AtlasCell>();
  for (const cell of raw) cells.set(cell.key, { ...cell, u0: cell.x / width, v0: cell.y / height, du: cell.width / width, dv: cell.height / height });
  return { cells, width, height };
}

function hexToCss(hex: string | undefined, fallback: string): string {
  return /^#[0-9a-f]{6}$/i.test(hex ?? '') ? (hex as string) : fallback;
}

function createAtlasTexture(images: readonly LoadedImage[], cells: ReadonlyMap<string, AtlasCell>, width: number, height: number, palette: RigManifest['palette']): Texture {
  if (typeof document === 'undefined') {
    const bytes = new Uint8Array(width * height * 4);
    for (let offset = 0; offset < bytes.length; offset += 4) {
      bytes[offset] = 107; bytes[offset + 1] = 81; bytes[offset + 2] = 65; bytes[offset + 3] = 255;
    }
    const texture = new DataTexture(bytes, width, height, RGBAFormat);
    texture.needsUpdate = true;
    return texture;
  }
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('RIG_ATLAS_CANVAS_UNAVAILABLE');
  for (const loaded of images) {
    const cell = cells.get(`${loaded.part.view}/${loaded.part.id}`);
    if (!cell) continue;
    if (loaded.image) {
      context.drawImage(loaded.image, cell.x, cell.y, cell.width, cell.height);
      continue;
    }
    const tintKey = loaded.part.tintable || 'skin';
    context.fillStyle = hexToCss(palette[tintKey], '#6b5141');
    context.strokeStyle = '#241b18';
    context.lineWidth = 4;
    context.fillRect(cell.x + 3, cell.y + 3, cell.width - 6, cell.height - 6);
    context.strokeRect(cell.x + 3, cell.y + 3, cell.width - 6, cell.height - 6);
    context.fillStyle = 'rgba(255,255,255,.35)';
    context.fillRect(cell.x + cell.width * 0.28, cell.y + cell.height * 0.2, cell.width * 0.12, cell.height * 0.5);
  }
  for (const placeholder of EQUIPMENT_PLACEHOLDERS) {
    const cell = cells.get(placeholder.key); if (!cell) continue;
    context.fillStyle = placeholder.key.includes('cape') ? '#6d3340' : placeholder.key.includes('weapon') ? '#a99c85' : '#7e6651';
    context.strokeStyle = '#241b18'; context.lineWidth = 4;
    context.fillRect(cell.x + 3, cell.y + 3, cell.width - 6, cell.height - 6); context.strokeRect(cell.x + 3, cell.y + 3, cell.width - 6, cell.height - 6);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter; texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

export async function loadRigSet(input: RigManifestInput = createPlaceholderRigManifest()): Promise<RigSet> {
  const { manifest, runtimePpm } = await resolveManifest(input);
  validateRigManifest(manifest);
  const images = await Promise.all(manifest.parts.map((part) => loadPart(part, manifest.baseUrl)));
  const atlas = pack(images);
  const texture = createAtlasTexture(images, atlas.cells, atlas.width, atlas.height, manifest.palette);
  let disposed = false;
  return {
    manifest, texture, cells: atlas.cells, runtimePpm, atlasWidth: atlas.width, atlasHeight: atlas.height,
    placeholderCount: images.reduce((count, image) => count + (image.image ? 0 : 1), 0),
    dispose() { if (!disposed) { disposed = true; texture.dispose(); } },
  };
}
