import {
  BufferGeometry, DataArrayTexture, DataTexture, DoubleSide, Float32BufferAttribute, GLSL3, Mesh,
  MeshStandardMaterial, NearestFilter, RGBAFormat, ShaderMaterial, SRGBColorSpace,
  UnsignedByteType, Vector3,
} from 'three';
import type { RegionChunkView, RegionHexPoint, RegionStaticView } from './types';

export const REGION_CHUNK_SIZE = 32;
export const REGION_CHUNK_CELLS = 1_024;
export const REGION_HEX_RADIUS = 2 / 3;
export const REGION_HEIGHT_STEP = 1;
export const REGION_INITIAL_CHUNK_RADIUS = 1;
export const REGION_UPLOADS_PER_FRAME = 2;
const SQRT3 = Math.sqrt(3);
const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
export const REGION_HEX_DIRECTIONS = [
  [1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1],
] as const;

export interface DecodedRegionChunk {
  readonly valid: Uint8Array; readonly terrain: Uint16Array; readonly heights: Uint8Array;
  readonly ao: Uint8Array; readonly ramps: Int8Array; readonly cellCount: number;
}
export interface RegionTerrainChunk {
  readonly key: string; readonly q: number; readonly r: number; readonly mesh: Mesh;
  readonly waterMesh: Mesh | null;
  readonly cellByTriangle: readonly RegionHexPoint[]; readonly cellCount: number;
  readonly triangleCount: number; readonly indexTexture: DataTexture; restore(): void; dispose(): void;
}
export interface RegionTerrainMaterial {
  readonly material: ShaderMaterial; readonly albedo: DataArrayTexture;
  readonly ownsAlbedo: boolean; restore(): void; dispose(): void;
}

export function regionHexWorld(q: number, r: number, height: number, out: Vector3): Vector3 {
  return out.set(SQRT3 * REGION_HEX_RADIUS * (q + r / 2), height * REGION_HEIGHT_STEP, r);
}
export function regionCellKey(q: number, r: number): string { return `${q},${r}`; }
export function decodeRegionBase64(value: string): Uint8Array {
  if (value.length % 4 !== 0) throw new TypeError('REGION_BASE64');
  const padding = value.endsWith('==') ? 2 : value.endsWith('=') ? 1 : 0;
  const bytes = new Uint8Array((value.length >> 2) * 3 - padding); let cursor = 0;
  for (let index = 0; index < value.length; index += 4) {
    const a = BASE64.indexOf(value[index]!); const b = BASE64.indexOf(value[index + 1]!);
    const c = value[index + 2] === '=' ? 0 : BASE64.indexOf(value[index + 2]!);
    const d = value[index + 3] === '=' ? 0 : BASE64.indexOf(value[index + 3]!);
    if (a < 0 || b < 0 || c < 0 || d < 0) throw new TypeError('REGION_BASE64');
    const word = a << 18 | b << 12 | c << 6 | d;
    if (cursor < bytes.length) bytes[cursor++] = word >> 16 & 255;
    if (cursor < bytes.length) bytes[cursor++] = word >> 8 & 255;
    if (cursor < bytes.length) bytes[cursor++] = word & 255;
  }
  return bytes;
}
function validAt(valid: Uint8Array, index: number): boolean {
  return (valid[index >> 3]! & 1 << (index & 7)) !== 0;
}
export function decodeRegionChunk(chunk: RegionChunkView): DecodedRegionChunk {
  const valid = decodeRegionBase64(chunk.valid); const rawTerrain = decodeRegionBase64(chunk.terrain);
  const heights = decodeRegionBase64(chunk.heights);
  const expected = chunk.terrainEncoding === 'u8' ? REGION_CHUNK_CELLS : REGION_CHUNK_CELLS * 2;
  if (valid.length !== 128 || heights.length !== REGION_CHUNK_CELLS || rawTerrain.length !== expected)
    throw new TypeError('REGION_MAP_BYTES');
  const terrain = new Uint16Array(REGION_CHUNK_CELLS); const ramps = new Int8Array(REGION_CHUNK_CELLS);
  ramps.fill(-1); for (const ramp of chunk.ramps) ramps[ramp.index] = ramp.dir;
  let cellCount = 0;
  for (let index = 0; index < REGION_CHUNK_CELLS; index += 1) {
    terrain[index] = chunk.terrainEncoding === 'u8' ? rawTerrain[index]!
      : rawTerrain[index * 2]! | rawTerrain[index * 2 + 1]! << 8;
    if (validAt(valid, index)) cellCount += 1;
  }
  const ao = chunk.precomputedAo === null ? new Uint8Array(REGION_CHUNK_CELLS).fill(255)
    : decodeRegionBase64(chunk.precomputedAo);
  if (ao.length !== REGION_CHUNK_CELLS) throw new TypeError('REGION_AO_BYTES');
  return { valid, terrain, heights, ao, ramps, cellCount };
}

export function terrainPlaceholderColor(terrainId: string): number {
  switch (terrainId) {
    case 'tr_caodi': case 'tr_huacong': case 'tr_qinghuacong': return 0x74845a;
    case 'tr_zhulin': case 'tr_milin': case 'tr_jingji': return 0x465d42;
    case 'tr_shadi': case 'tr_liusha': return 0xb79b69;
    case 'tr_nizhao': case 'tr_duzhao': case 'tr_jiaotu': return 0x72634c;
    case 'tr_qianshui': case 'tr_jiliu': case 'tr_pubu': return 0x6d9694;
    case 'tr_shenshui': case 'tr_dajiang': return 0x355f71;
    case 'tr_bingmian': case 'tr_baobing': return 0xa8c0c0;
    case 'tr_xuedi': case 'tr_shenxue': case 'tr_bingku': return 0xd4d1bd;
    case 'tr_qiaobi': case 'tr_xuanya': case 'tr_shengu': return 0x5e554b;
    case 'tr_gaoqiang': case 'tr_chengqiang': case 'tr_gongdianwuji': return 0x766a5b;
    case 'tr_tiesuoqiao': case 'tr_dumuqiao': case 'tr_zhandao':
    case 'tr_yunhaizhandao': case 'tr_chuanjiaban': return 0x856e50;
    case 'tr_shinei': case 'tr_dongku': case 'tr_migong': return 0x625a50;
    case 'tr_shizhen': case 'tr_jiguan': case 'tr_mushi': case 'tr_shibi': return 0x747168;
    case 'tr_huoyan': case 'tr_rongyan': return 0xa73b27;
    case 'tr_liubai': return 0xd8d0bb;
    case 'tr_wuding': return 0x758083;
    case 'tr_shushao': return 0x6b5948;
    case 'tr_suishi': case 'tr_taijie': return 0x837966;
    default: return 0x9a8d68;
  }
}
export function createTerrainPlaceholderArray(terrainTable: readonly string[]): DataArrayTexture {
  const depth = Math.max(1, terrainTable.length); const pixels = new Uint8Array(depth * 4);
  for (let layer = 0; layer < depth; layer += 1) {
    const color = terrainPlaceholderColor(terrainTable[layer] ?? 'tr_pingdi');
    pixels[layer * 4] = color >> 16; pixels[layer * 4 + 1] = color >> 8 & 255;
    pixels[layer * 4 + 2] = color & 255; pixels[layer * 4 + 3] = 255;
  }
  const texture = new DataArrayTexture(pixels, 1, 1, depth); texture.colorSpace = SRGBColorSpace;
  texture.minFilter = NearestFilter; texture.magFilter = NearestFilter; texture.needsUpdate = true;
  return texture;
}

const TERRAIN_VERTEX = `
in float slotIndex; in float neighborLayer; in float edgeWeight; in float faceShade;
flat out float vSlot; flat out float vNeighborLayer; out float vEdge; out float vShade; out vec3 vWorld;
void main() {
  vSlot=slotIndex; vNeighborLayer=neighborLayer; vEdge=edgeWeight; vShade=faceShade;
  vec4 world=modelMatrix*vec4(position,1.0); vWorld=world.xyz;
  gl_Position=projectionMatrix*viewMatrix*world;
}`;
const TERRAIN_FRAGMENT = `
precision highp float; precision highp sampler2DArray;
uniform sampler2DArray terrainAlbedo; uniform sampler2D terrainIndex;
flat in float vSlot; flat in float vNeighborLayer; in float vEdge; in float vShade; in vec3 vWorld;
out vec4 outColor;
void main() {
  int slot=int(vSlot+.5); ivec2 cell=ivec2(slot%32,slot/32);
  vec4 data=texelFetch(terrainIndex,cell,0); float layer=floor(data.r*255.0+.5);
  vec2 uv=fract(vWorld.xz*.5+data.g);
  vec3 primary=texture(terrainAlbedo,vec3(uv,layer)).rgb;
  vec3 neighbor=texture(terrainAlbedo,vec3(uv,vNeighborLayer)).rgb;
  float noise=fract(sin(dot(vWorld.xz,vec2(12.9898,78.233)))*43758.5453)-.5;
  float bleed=smoothstep(.72,1.02,vEdge+noise*.14)*step(.5,abs(layer-vNeighborLayer));
  vec3 color=mix(primary,neighbor,bleed*.42)*mix(.55,1.0,vShade)*mix(.72,1.0,data.b);
  color=mix(color,vec3(.93,.73,.25),data.a*.42); outColor=vec4(color,1.0);
}`;
export function createRegionTerrainMaterial(terrainTable: readonly string[], indexTexture: DataTexture,
  suppliedAlbedo?: DataArrayTexture): RegionTerrainMaterial {
  const albedo = suppliedAlbedo ?? createTerrainPlaceholderArray(terrainTable);
  const material = new ShaderMaterial({ glslVersion: GLSL3,
    uniforms: { terrainAlbedo: { value: albedo }, terrainIndex: { value: indexTexture } },
    vertexShader: TERRAIN_VERTEX, fragmentShader: TERRAIN_FRAGMENT,
  });
  return { material, albedo, ownsAlbedo: suppliedAlbedo === undefined,
    restore() { indexTexture.needsUpdate = true; albedo.needsUpdate = true; material.needsUpdate = true; },
    dispose() { material.dispose(); if (suppliedAlbedo === undefined) albedo.dispose(); },
  };
}

interface TerrainCell {
  readonly q: number; readonly r: number; readonly height: number; readonly layer: number;
  readonly ao: number; readonly ramp: number; readonly slot: number; readonly chunkKey: string;
}
export interface PreparedRegionTerrain {
  readonly decoded: ReadonlyMap<string, DecodedRegionChunk>;
  readonly cells: ReadonlyMap<string, TerrainCell>; readonly minimumHeight: number;
}
export function prepareRegionTerrain(view: RegionStaticView): PreparedRegionTerrain {
  const decoded = new Map<string, DecodedRegionChunk>(); const cells = new Map<string, TerrainCell>();
  let minimumHeight = 10;
  for (const chunk of view.chunks) {
    const key = regionCellKey(chunk.q, chunk.r); const data = decodeRegionChunk(chunk); decoded.set(key, data);
    for (let slot = 0; slot < REGION_CHUNK_CELLS; slot += 1) {
      if (!validAt(data.valid, slot)) continue;
      const q = chunk.q * REGION_CHUNK_SIZE + slot % REGION_CHUNK_SIZE;
      const r = chunk.r * REGION_CHUNK_SIZE + (slot >> 5); const height = data.heights[slot]!;
      cells.set(regionCellKey(q, r), { q, r, height, layer: data.terrain[slot]!,
        ao: data.ao[slot]!, ramp: data.ramps[slot]!, slot, chunkKey: key });
      minimumHeight = Math.min(minimumHeight, height);
    }
  }
  return { decoded, cells, minimumHeight };
}

function makeIndexTexture(data: DecodedRegionChunk): { texture: DataTexture; bytes: Uint8Array } {
  const bytes = new Uint8Array(REGION_CHUNK_CELLS * 4);
  for (let slot = 0; slot < REGION_CHUNK_CELLS; slot += 1) {
    bytes[slot * 4] = Math.min(255, data.terrain[slot]!);
    bytes[slot * 4 + 1] = slot * 73 & 255; bytes[slot * 4 + 2] = data.ao[slot]!;
  }
  const texture = new DataTexture(bytes, REGION_CHUNK_SIZE, REGION_CHUNK_SIZE,
    RGBAFormat, UnsignedByteType);
  texture.minFilter = NearestFilter; texture.magFilter = NearestFilter; texture.generateMipmaps = false;
  texture.needsUpdate = true; return { texture, bytes };
}

function corner(q: number, r: number, edge: number, height: number, out: Vector3): Vector3 {
  regionHexWorld(q, r, height, out); const angle = (30 + edge * 60) * Math.PI / 180;
  out.x += Math.cos(angle) * REGION_HEX_RADIUS; out.z += Math.sin(angle) * REGION_HEX_RADIUS;
  return out;
}
function rampHeight(cell: TerrainCell, point: Vector3): number {
  if (cell.ramp < 0) return cell.height;
  const centerX = SQRT3 * REGION_HEX_RADIUS * (cell.q + cell.r / 2);
  const centerZ = cell.r; const angle = -cell.ramp * Math.PI / 3;
  const along = (point.x - centerX) * Math.cos(angle) + (point.z - centerZ) * Math.sin(angle);
  return cell.height + Math.max(-.5, Math.min(.5, along / (SQRT3 * REGION_HEX_RADIUS)));
}
function appendVertex(positions: number[], slots: number[], neighbors: number[], edges: number[],
  shades: number[], point: Vector3, slot: number, neighborLayer: number, edge: number, shade: number): void {
  positions.push(point.x, point.y, point.z); slots.push(slot); neighbors.push(neighborLayer);
  edges.push(edge); shades.push(shade);
}
function appendTriangle(mapping: RegionHexPoint[], cell: TerrainCell): void {
  mapping.push({ q: cell.q, r: cell.r });
}
export function createRegionTerrainChunk(view: RegionStaticView, chunk: RegionChunkView,
  prepared: PreparedRegionTerrain, suppliedAlbedo?: DataArrayTexture): RegionTerrainChunk {
  const key = regionCellKey(chunk.q, chunk.r); const data = prepared.decoded.get(key);
  if (!data) throw new TypeError('REGION_CHUNK_MISSING');
  const indexed = makeIndexTexture(data); const terrainMaterial = createRegionTerrainMaterial(
    view.terrainTable, indexed.texture, suppliedAlbedo);
  const positions: number[] = []; const slots: number[] = []; const neighbors: number[] = [];
  const edges: number[] = []; const shades: number[] = []; const cellByTriangle: RegionHexPoint[] = [];
  const center = new Vector3(); const a = new Vector3(); const b = new Vector3();
  const lowA = new Vector3(); const lowB = new Vector3();
  for (const cell of prepared.cells.values()) {
    if (cell.chunkKey !== key) continue; regionHexWorld(cell.q, cell.r, cell.height, center);
    center.y = rampHeight(cell, center);
    for (let edge = 0; edge < 6; edge += 1) {
      corner(cell.q, cell.r, edge, cell.height, a); corner(cell.q, cell.r, (edge + 1) % 6, cell.height, b);
      a.y = rampHeight(cell, a); b.y = rampHeight(cell, b);
      const direction = REGION_HEX_DIRECTIONS[5 - edge]!;
      const neighbor = prepared.cells.get(regionCellKey(cell.q + direction[0], cell.r + direction[1]));
      const neighborLayer = neighbor?.layer ?? cell.layer;
      appendVertex(positions, slots, neighbors, edges, shades, center, cell.slot, neighborLayer, 0, 1);
      appendVertex(positions, slots, neighbors, edges, shades, a, cell.slot, neighborLayer, 1, 1);
      appendVertex(positions, slots, neighbors, edges, shades, b, cell.slot, neighborLayer, 1, 1);
      appendTriangle(cellByTriangle, cell);
      const lower = neighbor ? neighbor.height : prepared.minimumHeight - 1;
      if (lower >= Math.min(a.y, b.y)) continue;
      lowA.copy(a).setY(lower); lowB.copy(b).setY(lower);
      for (const point of [a, lowA, lowB, a, lowB, b])
        appendVertex(positions, slots, neighbors, edges, shades, point, cell.slot, cell.layer, 1, .7);
      appendTriangle(cellByTriangle, cell); appendTriangle(cellByTriangle, cell);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('slotIndex', new Float32BufferAttribute(slots, 1));
  geometry.setAttribute('neighborLayer', new Float32BufferAttribute(neighbors, 1));
  geometry.setAttribute('edgeWeight', new Float32BufferAttribute(edges, 1));
  geometry.setAttribute('faceShade', new Float32BufferAttribute(shades, 1));
  geometry.computeVertexNormals(); geometry.computeBoundingBox(); geometry.computeBoundingSphere();
  const mesh = new Mesh(geometry, terrainMaterial.material); mesh.name = `region-terrain-${key}`;
  const waterPositions: number[] = []; const waterCenter = new Vector3();
  for (const water of chunk.water) {
    if (!validAt(data.valid, water.index)) continue;
    const q = chunk.q * REGION_CHUNK_SIZE + water.index % REGION_CHUNK_SIZE;
    const r = chunk.r * REGION_CHUNK_SIZE + (water.index >> 5);
    regionHexWorld(q, r, data.heights[water.index]!, waterCenter); waterCenter.y -= .15;
    for (let edge = 0; edge < 6; edge += 1) {
      corner(q, r, edge, data.heights[water.index]!, a).setY(waterCenter.y);
      corner(q, r, (edge + 1) % 6, data.heights[water.index]!, b).setY(waterCenter.y);
      waterPositions.push(waterCenter.x, waterCenter.y, waterCenter.z, a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  let waterMesh: Mesh | null = null;
  if (waterPositions.length) {
    const waterGeometry = new BufferGeometry();
    waterGeometry.setAttribute('position', new Float32BufferAttribute(waterPositions, 3));
    waterGeometry.computeVertexNormals(); waterGeometry.computeBoundingBox(); waterGeometry.computeBoundingSphere();
    waterMesh = new Mesh(waterGeometry, new MeshStandardMaterial({ color: 0x618b94, transparent: true,
      opacity: .72, roughness: .42, side: DoubleSide, depthWrite: false }));
    waterMesh.name = `region-water-${key}`; waterMesh.renderOrder = 12;
  }
  return { key, q: chunk.q, r: chunk.r, mesh, waterMesh, cellByTriangle, cellCount: data.cellCount,
    triangleCount: positions.length / 9, indexTexture: indexed.texture,
    restore() { indexed.texture.needsUpdate = true; terrainMaterial.restore(); },
    dispose() { geometry.dispose(); indexed.texture.dispose(); terrainMaterial.dispose();
      waterMesh?.geometry.dispose(); (waterMesh?.material as MeshStandardMaterial | undefined)?.dispose(); },
  };
}

export function setRegionTerrainHighlight(chunk: RegionTerrainChunk, slots: readonly number[]): void {
  const bytes = chunk.indexTexture.image.data;
  if (!(bytes instanceof Uint8Array)) return;
  for (let index = 3; index < bytes.length; index += 4) bytes[index] = 0;
  for (const slot of slots) if (slot >= 0 && slot < REGION_CHUNK_CELLS) bytes[slot * 4 + 3] = 255;
  chunk.indexTexture.needsUpdate = true;
}
