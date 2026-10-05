import { CanvasTexture, DynamicDrawUsage, Group, InstancedBufferAttribute, InstancedMesh,
  LinearFilter, Matrix4, PlaneGeometry, Quaternion, SRGBColorSpace, ShaderMaterial, Texture,
  Vector3 } from 'three';
import { planningCellCenterToTownWorld, planningToTownWorld, townBillboardQuaternion,
  TOWN_PIXELS_PER_WORLD, TOWN_VERTICAL_PIXELS_PER_WORLD } from './projection';
import type { TownAssetEntry, TownRuntimeView } from './types';

interface AtlasCell { readonly u0: number; readonly v0: number; readonly du: number; readonly dv: number }
export interface TownAtlas { readonly texture: Texture; readonly cells: ReadonlyMap<string, AtlasCell>;
  readonly ownedImages: readonly ImageBitmap[]; dispose(): void }
export interface TownGeometry {
  readonly group: Group; readonly groundChunks: readonly InstancedMesh[]; readonly buildings: InstancedMesh;
  readonly interiors: InstancedMesh; readonly buildingIds: readonly string[]; readonly groundInstances: number;
  readonly edgeInstances: number; readonly buildingInstances: number; readonly staticDrawCalls: number;
  setBuildingFocus(id: string | null, opacity: number): void; dispose(): void;
}

interface LoadedAsset { readonly entry: TownAssetEntry; readonly image?: ImageBitmap }
async function loadImage(entry: TownAssetEntry, baseUrl: string): Promise<LoadedAsset> {
  if (typeof createImageBitmap !== 'function') return { entry };
  try {
    const response = await fetch(new URL(entry.file, new URL(baseUrl, location.href)));
    if (!response.ok) return { entry };
    return { entry, image: await createImageBitmap(await response.blob()) };
  } catch { return { entry }; }
}
function placeholderColor(kind: string): string {
  if (kind === 'water') return '#6e9eaa';
  if (kind === 'grass') return '#8b9d74';
  if (kind.includes('brick') || kind.includes('stone')) return '#a4a69c';
  if (kind === 'building') return '#76664f';
  return '#aa9878';
}

export async function loadTownAtlas(source: TownRuntimeView['assets']['tile']): Promise<TownAtlas> {
  const loaded = await Promise.all(source.entries.map((entry) => loadImage(entry, source.baseUrl)));
  const padding = 2; const maxWidth = 4096; let x = padding; let y = padding; let rowHeight = 0; let usedWidth = 0;
  const packed: Array<LoadedAsset & { x: number; y: number; width: number; height: number }> = [];
  for (const asset of loaded) {
    const sourceWidth = asset.entry.width ?? asset.image?.width ?? 64;
    const sourceHeight = asset.entry.height ?? asset.image?.height ?? 32;
    const downscale = Math.min(1, 1024 / Math.max(sourceWidth, sourceHeight));
    const width = Math.max(1, Math.round(sourceWidth * downscale));
    const height = Math.max(1, Math.round(sourceHeight * downscale));
    if (x + width + padding > maxWidth) { x = padding; y += rowHeight + padding; rowHeight = 0; }
    packed.push({ ...asset, x, y, width, height }); x += width + padding;
    usedWidth = Math.max(usedWidth, x); rowHeight = Math.max(rowHeight, height);
  }
  const atlasWidth = Math.max(2, 2 ** Math.ceil(Math.log2(Math.max(2, usedWidth))));
  const atlasHeight = Math.max(2, 2 ** Math.ceil(Math.log2(y + rowHeight + padding)));
  const cells = new Map<string, AtlasCell>(); let texture: Texture;
  if (typeof document === 'undefined') texture = new Texture();
  else {
    const canvas = document.createElement('canvas'); canvas.width = atlasWidth; canvas.height = atlasHeight;
    const context = canvas.getContext('2d'); if (!context) throw new Error('TOWN_ATLAS_CANVAS_UNAVAILABLE');
    for (const asset of packed) {
      context.fillStyle = placeholderColor(asset.entry.kind);
      context.fillRect(asset.x, asset.y, asset.width, asset.height);
      if (asset.image) context.drawImage(asset.image, asset.x, asset.y, asset.width, asset.height);
    }
    texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace;
    texture.minFilter = LinearFilter; texture.magFilter = LinearFilter; texture.generateMipmaps = true;
  }
  for (const asset of packed) cells.set(asset.entry.id, { u0: asset.x / atlasWidth,
    v0: asset.y / atlasHeight, du: asset.width / atlasWidth, dv: asset.height / atlasHeight });
  let disposed = false;
  return { texture, cells, ownedImages: loaded.flatMap((asset) => asset.image ? [asset.image] : []),
    dispose() { if (disposed) return; disposed = true; texture.dispose();
      for (const asset of loaded) asset.image?.close(); } };
}

const VERTEX = `attribute vec4 townUvRect; attribute vec4 townClipRect; attribute float townOpacity;
varying vec2 vUv; varying vec2 vLocalUv; varying vec4 vClip; varying float vOpacity;
void main(){ vUv=townUvRect.xy+uv*townUvRect.zw; vLocalUv=uv; vClip=townClipRect;
vOpacity=townOpacity; gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0); }`;
const FRAGMENT = `uniform sampler2D map; varying vec2 vUv; varying vec2 vLocalUv;
varying vec4 vClip; varying float vOpacity;
void main(){ if(vLocalUv.x<vClip.x||vLocalUv.y<vClip.y||vLocalUv.x>vClip.z||vLocalUv.y>vClip.w) discard;
vec4 texel=texture2D(map,vUv); float alpha=texel.a*vOpacity;
if(alpha<0.025) discard; gl_FragColor=vec4(texel.rgb*alpha,alpha); }`;
function material(texture: Texture, depthWrite = true): ShaderMaterial {
  return new ShaderMaterial({ uniforms: { map: { value: texture } }, vertexShader: VERTEX,
    fragmentShader: FRAGMENT, transparent: true, depthWrite, depthTest: true });
}
function configure(mesh: InstancedMesh, cells: Float32Array, opacity: Float32Array, dynamic = false,
  clips?: Float32Array): void {
  mesh.geometry.setAttribute('townUvRect', new InstancedBufferAttribute(cells, 4));
  const fullClips = clips ?? new Float32Array(mesh.count * 4);
  if (!clips) for (let index = 0; index < mesh.count; index += 1)
    fullClips.set([0, 0, 1, 1], index * 4);
  mesh.geometry.setAttribute('townClipRect', new InstancedBufferAttribute(fullClips, 4));
  const alpha = new InstancedBufferAttribute(opacity, 1);
  if (dynamic) alpha.setUsage(DynamicDrawUsage);
  mesh.geometry.setAttribute('townOpacity', alpha);
  mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere(); mesh.computeBoundingBox();
}
function byKind(town: TownRuntimeView, kind: string): TownAssetEntry | undefined {
  return town.assets.tile.entries.find((entry) => entry.kind === kind);
}
function edgeAsset(town: TownRuntimeView, kind: string, direction: string): TownAssetEntry | undefined {
  return town.assets.tile.entries.find((entry) => entry.kind === kind && entry.id.endsWith(`__${direction}`));
}
function atlasUv(atlas: TownAtlas, asset: TownAssetEntry | undefined): readonly number[] {
  const uv = asset ? atlas.cells.get(asset.id) : undefined;
  if (!uv) return [0, 0, 1, 1];
  return [uv.u0, uv.v0 + uv.dv, uv.du, -uv.dv];
}
function groundPaletteIndices(town: TownRuntimeView): Uint16Array {
  const result = new Uint16Array(town.grid.width * town.grid.height);
  for (const [start, length, palette] of town.groundRuns) result.fill(palette, start, start + length);
  return result;
}
const EDGE_PIECES = [['ne', 1, 4, 2], ['se', 4, 16, 8], ['sw', 16, 64, 32],
  ['nw', 64, 1, 128]] as const;
const EDGE_TIPS = { ne: [60, 14, 64, 18], se: [30, 30, 34, 32],
  sw: [0, 14, 4, 18], nw: [30, 0, 34, 2] } as const;
interface TownEdgePiece { readonly direction: string;
  readonly crop?: readonly [number, number, number, number] }
export function townEdgePieces(mask: number): readonly TownEdgePiece[] {
  const result: TownEdgePiece[] = []; const covered = new Set<number>();
  for (const [name, first, second] of EDGE_PIECES) if (!(mask & first) && !(mask & second) &&
      !covered.has(first) && !covered.has(second)) { result.push({ direction: name });
    covered.add(first); covered.add(second); }
  for (const [direction, bit] of [['n', 1], ['e', 4], ['s', 16], ['w', 64]] as const)
    if (!(mask & bit) && !covered.has(bit)) result.push({ direction });
  for (const [name, first, second, diagonal] of EDGE_PIECES)
    if (mask & first && mask & second && !(mask & diagonal))
      result.push({ direction: name, crop: EDGE_TIPS[name] });
  return result;
}
export function townEdgeDirections(mask: number): readonly string[] {
  return townEdgePieces(mask).map((piece) => piece.direction);
}
interface GroundInstance { readonly cell: number; readonly asset: TownAssetEntry | undefined; readonly lift: number;
  readonly crop?: readonly [number, number, number, number] }
function groundInstances(town: TownRuntimeView): Map<number, GroundInstance[]> {
  const result = new Map<number, GroundInstance[]>(); const palettes = groundPaletteIndices(town);
  const add = (cell: number, asset: TownAssetEntry | undefined, lift: number,
    crop?: readonly [number, number, number, number]): void => {
    const x = cell % town.grid.width; const z = Math.floor(cell / town.grid.width);
    const chunkX = Math.floor(x / town.grid.chunkCells); const chunkZ = Math.floor(z / town.grid.chunkCells);
    const key = chunkZ * Math.ceil(town.grid.width / town.grid.chunkCells) + chunkX;
    const instances = result.get(key) ?? []; instances.push({ cell, asset, lift,
      ...(crop ? { crop } : {}) });
    result.set(key, instances);
  };
  for (let cell = 0; cell < palettes.length; cell += 1) {
    const palette = town.groundPalette[palettes[cell]!]!; add(cell, byKind(town, palette.ground), 0);
    if (palette.overlay) add(cell, town.assets.tile.entries.find((entry) =>
      entry.id === palette.overlay || entry.id.startsWith(`${palette.overlay}__`)), 0.008);
  }
  for (const [cell, kind, mask] of town.edgeTiles) for (const piece of townEdgePieces(mask))
    add(cell, edgeAsset(town, kind, piece.direction), 0.016, piece.crop);
  return result;
}

function createGroundChunks(town: TownRuntimeView, atlas: TownAtlas): readonly InstancedMesh[] {
  const chunks: InstancedMesh[] = []; const matrix = new Matrix4(); const point = new Vector3();
  const rotation = townBillboardQuaternion(new Quaternion());
  const scale = new Vector3(64 / TOWN_PIXELS_PER_WORLD, 32 / TOWN_PIXELS_PER_WORLD, 1);
  const palettes = groundPaletteIndices(town);
  for (const [chunk, instances] of groundInstances(town)) {
    const uv = new Float32Array(instances.length * 4); const clips = new Float32Array(instances.length * 4);
    const alpha = new Float32Array(instances.length); alpha.fill(1);
    const mesh = new InstancedMesh(new PlaneGeometry(1, 1), material(atlas.texture), instances.length);
    mesh.name = `town-ground-chunk-${chunk}`; mesh.renderOrder = 0;
    instances.forEach((instance, index) => {
      const x = instance.cell % town.grid.width; const z = Math.floor(instance.cell / town.grid.width);
      const elevation = town.groundPalette[palettes[instance.cell]!]!.elevationCm;
      planningCellCenterToTownWorld([x, z], town.grid.height, elevation, point); point.y += instance.lift;
      matrix.compose(point, rotation, scale); mesh.setMatrixAt(index, matrix);
      uv.set(atlasUv(atlas, instance.asset), index * 4);
      const [left, top, right, bottom] = instance.crop ?? [0, 0,
        instance.asset?.width ?? 1, instance.asset?.height ?? 1];
      clips.set([left / (instance.asset?.width ?? 1), 1 - bottom / (instance.asset?.height ?? 1),
        right / (instance.asset?.width ?? 1), 1 - top / (instance.asset?.height ?? 1)], index * 4);
    });
    configure(mesh, uv, alpha, false, clips); chunks.push(mesh);
  }
  return chunks;
}

function createBuildingLayer(town: TownRuntimeView, atlas: TownAtlas): {
  mesh: InstancedMesh; ids: string[]; alpha: InstancedBufferAttribute
} {
  const count = town.buildings.length; const uv = new Float32Array(count * 4);
  const values = new Float32Array(count); values.fill(1);
  const mesh = new InstancedMesh(new PlaneGeometry(1, 1), material(atlas.texture), count);
  mesh.name = 'town-building-instances'; mesh.renderOrder = 20;
  const matrix = new Matrix4(); const point = new Vector3(); const rotation = townBillboardQuaternion(new Quaternion());
  const ids: string[] = [];
  town.buildings.forEach((building, index) => {
    const asset = town.assets.building.entries.find((entry) => entry.id === building.assetId);
    const width = asset?.width ?? 64; const height = asset?.height ?? 64;
    const anchor = asset?.anchor ?? [width / 2, height * 0.75];
    const centreX = building.origin[0] + building.size[0] / 2;
    const centreZ = building.origin[1] + building.size[1] / 2;
    planningToTownWorld(centreX, centreZ, town.grid.height, 0, point);
    const footprintPx = 32 * (building.size[0] + building.size[1]);
    const ratio = footprintPx / (asset?.footprintWidthPx ?? footprintPx);
    const rightOffset = (width / 2 - anchor[0]) * ratio / TOWN_PIXELS_PER_WORLD;
    point.x += rightOffset / Math.sqrt(2); point.z -= rightOffset / Math.sqrt(2);
    point.y += (anchor[1] - height / 2) * ratio / TOWN_VERTICAL_PIXELS_PER_WORLD;
    matrix.compose(point, rotation, new Vector3(width * ratio / TOWN_PIXELS_PER_WORLD,
      height * ratio / TOWN_PIXELS_PER_WORLD, 1));
    mesh.setMatrixAt(index, matrix); uv.set(atlasUv(atlas, asset), index * 4); ids.push(building.id);
  });
  configure(mesh, uv, values, true);
  return { mesh, ids, alpha: mesh.geometry.getAttribute('townOpacity') as InstancedBufferAttribute };
}

function createInteriorLayer(town: TownRuntimeView, atlas: TownAtlas): InstancedMesh {
  const entries = town.buildings.filter((building) => building.enterable);
  const uv = new Float32Array(entries.length * 2 * 4); const alpha = new Float32Array(entries.length * 2);
  const mesh = new InstancedMesh(new PlaneGeometry(1, 1), material(atlas.texture, false), entries.length * 2);
  mesh.name = 'town-interior-instances'; mesh.renderOrder = 10; mesh.visible = false;
  const matrix = new Matrix4(); const point = new Vector3(); const rotation = townBillboardQuaternion(new Quaternion());
  entries.forEach((building, buildingIndex) => {
    const ground = byKind(town, 'rammed_earth') ?? town.assets.tile.entries[0];
    const counter = byKind(town, 'stone_slab') ?? ground;
    const centreX = building.origin[0] + building.size[0] / 2;
    const centreZ = building.origin[1] + building.size[1] / 2;
    planningToTownWorld(centreX, centreZ, town.grid.height, 0, point); point.y += 0.025;
    const footprintPixels = 32 * (building.size[0] + building.size[1]);
    matrix.compose(point, rotation, new Vector3(footprintPixels / TOWN_PIXELS_PER_WORLD,
      footprintPixels / 2 / TOWN_PIXELS_PER_WORLD, 1));
    mesh.setMatrixAt(buildingIndex * 2, matrix); uv.set(atlasUv(atlas, ground), buildingIndex * 8);
    point.y += 0.18; point.x += 0.35; point.z -= 0.35;
    matrix.compose(point, rotation, new Vector3(Math.max(1, building.size[0] / 2), 0.42, 1));
    mesh.setMatrixAt(buildingIndex * 2 + 1, matrix); uv.set(atlasUv(atlas, counter), buildingIndex * 8 + 4);
  });
  configure(mesh, uv, alpha, true); return mesh;
}

export function createTownGeometry(town: TownRuntimeView, tileAtlas: TownAtlas,
  buildingAtlas: TownAtlas): TownGeometry {
  const group = new Group(); group.name = 'town-static-geometry';
  const groundChunks = createGroundChunks(town, tileAtlas);
  const buildingLayer = createBuildingLayer(town, buildingAtlas);
  const interiors = createInteriorLayer(town, tileAtlas);
  group.add(...groundChunks, interiors, buildingLayer.mesh);
  const interiorAlpha = interiors.geometry.getAttribute('townOpacity') as InstancedBufferAttribute;
  const enterable = town.buildings.filter((building) => building.enterable);
  let focusId: string | null = null; let focusOpacity = Number.NaN; let disposed = false;
  return { group, groundChunks, buildings: buildingLayer.mesh, interiors,
    buildingIds: buildingLayer.ids, groundInstances: town.grid.width * town.grid.height,
    edgeInstances: town.edgeTiles.reduce((sum, row) => sum + townEdgeDirections(row[2]).length, 0),
    buildingInstances: town.buildings.length,
    staticDrawCalls: groundChunks.length + 2,
    setBuildingFocus(id, opacity) {
      if (id === focusId && opacity === focusOpacity) return;
      focusId = id; focusOpacity = opacity;
      for (let index = 0; index < buildingLayer.ids.length; index += 1)
        buildingLayer.alpha.setX(index, buildingLayer.ids[index] === id ? opacity : 1);
      buildingLayer.alpha.needsUpdate = true;
      let visible = false;
      for (let index = 0; index < enterable.length; index += 1) {
        const active = enterable[index]!.id === id ? 1 : 0;
        interiorAlpha.setX(index * 2, active); interiorAlpha.setX(index * 2 + 1, active);
        visible ||= active === 1;
      }
      interiorAlpha.needsUpdate = true; interiors.visible = visible;
    },
    dispose() {
      if (disposed) return; disposed = true; group.clear();
      for (const mesh of [...groundChunks, interiors, buildingLayer.mesh]) {
        mesh.dispose(); mesh.geometry.dispose(); (mesh.material as ShaderMaterial).dispose();
      }
    },
  };
}
