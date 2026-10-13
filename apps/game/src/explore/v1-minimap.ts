import type { TownCommand, TownPoint } from '@tianshu/core';
import type { FacilityKind } from '@tianshu/data/schemas';
import type { TownRuntimeView, TownScene, TownSceneProjection } from '@tianshu/render/town';
import { townHexToWorld, townWorldToHex } from '@tianshu/render/town';
import type { MinimapTravelTarget } from '@tianshu/ui/components/explore/TxMinimap.vue';
import { V1_MINIMAP_STRINGS as strings } from './v1-minimap.strings';
import { facilityPresentation } from './v1-context-actions';

export const V1_MINIMAP_METRES_PER_PX = 0.25;
export const V1_MINIMAP_MAX_SIDE_PX = 640;
export const V1_TOWN_CAMERA_YAW_DEG = 45;
export const V1_MINIMAP_COLORS = {
  courtyard: [211, 194, 158, 255], road: [183, 151, 105, 255],
  water: [91, 143, 156, 255], building: [91, 75, 55, 255],
  facility: [175, 63, 42, 255],
} as const;
const V1_PLAYER_HEADINGS = [5 * Math.PI / 6, 2 * Math.PI / 3, Math.PI / 2, Math.PI / 6,
  11 * Math.PI / 6, 5 * Math.PI / 3, 3 * Math.PI / 2, 7 * Math.PI / 6] as const;

export interface V1MinimapBitmap {
  readonly width: number; readonly height: number; readonly minX: number; readonly minZ: number;
  readonly metresPerPx: number; readonly pixels: Uint8ClampedArray;
}
export interface V1MinimapMarker {
  readonly id: string; readonly kind: 'facility' | 'shop' | 'inn' | 'temple' | 'pagoda'
    | 'gate' | 'office' | 'npc' | 'meditation';
  readonly x: number; readonly z: number; readonly icon: string; readonly label: string;
  /** Painted markers keep the authored building so assembly can route into enterable ones. */
  readonly buildingId?: string;
  readonly target: { readonly kind: 'anchor'; readonly anchorId: string }
    | { readonly kind: 'building'; readonly buildingId: string }
    | { readonly kind: 'point'; readonly x: number; readonly z: number };
}
export interface TownMinimapMetadata {
  readonly schemaVersion: 'town-minimap.v1';
  readonly image: { readonly file: string; readonly width: number; readonly height: number };
  readonly transform: { readonly scale: number; readonly topPaddingPx: number;
    readonly gridWidth: number; readonly gridHeight: number; readonly tileWidthPx: 64; readonly tileHeightPx: 32 };
  readonly south: readonly [number, number];
  readonly markers: readonly { readonly id: string; readonly kind: 'shop' | 'inn' | 'temple'
    | 'pagoda' | 'gate' | 'office'; readonly glyph: string; readonly name: string;
    readonly buildingId?: string; readonly px: readonly [number, number];
    readonly entrance?: readonly [number, number] }[];
}
export interface V1PaintedMinimap { readonly metadata: TownMinimapMetadata; readonly bitmap: ImageBitmap }
export interface V1FacilityMarkerProjection {
  readonly key: string; readonly kind: FacilityKind; readonly name?: string;
  readonly buildingId?: string;
}

const scratchWorld = { x: 0, y: 0, z: 0, set(x: number, y: number, z: number) {
  this.x = x; this.y = y; this.z = z; return this;
} };
export function createV1CameraBasis(yawDeg = V1_TOWN_CAMERA_YAW_DEG): Float32Array {
  const yaw = yawDeg * Math.PI / 180;
  const rightX = Math.sin(yaw); const rightZ = -Math.cos(yaw);
  const upX = -Math.cos(yaw); const upZ = -Math.sin(yaw);
  return new Float32Array([rightX, rightZ, upX, upZ]);
}

export function v1TownPointToWorld(point: TownPoint, gridHeight: number): readonly [number, number] {
  const world = townHexToWorld(point, gridHeight, 0, scratchWorld as never);
  return [world.x, world.z];
}

export function v1WorldToTownPoint(x: number, z: number): TownPoint {
  return townWorldToHex(x, z);
}
export function v1WorldToImageMatrix(metadata: TownMinimapMetadata):
readonly [number, number, number, number, number, number] {
  const scale = metadata.transform.scale; const height = metadata.transform.gridHeight;
  return [32 * scale, 16 * scale, -32 * scale, 16 * scale,
    32 * height * scale, metadata.transform.topPaddingPx];
}

export function v1TownPointToMinimapPixel(point: TownPoint, metadata: TownMinimapMetadata): readonly [number, number] {
  const [x, z] = v1TownPointToWorld(point, metadata.transform.gridHeight);
  const [a, b, c, d, e, f] = v1WorldToImageMatrix(metadata);
  return [a * x + c * z + e, b * x + d * z + f];
}

/** Projects a building-plan point through the same runtime affine as the painted town. */
export function v1PlanningPointToMinimapPixel(
  x: number, z: number, metadata: TownMinimapMetadata,
): readonly [number, number] {
  const [a, b, c, d, e, f] = v1WorldToImageMatrix(metadata);
  const worldZ = metadata.transform.gridHeight - z;
  return [a * x + c * worldZ + e, b * x + d * worldZ + f];
}

export function v1MinimapPixelToTownPoint(px: number, py: number, metadata: TownMinimapMetadata): TownPoint {
  const [a, b, c, d, e, f] = v1WorldToImageMatrix(metadata);
  const determinant = a * d - b * c;
  const x = (d * (px - e) - c * (py - f)) / determinant;
  const z = (-b * (px - e) + a * (py - f)) / determinant;
  return v1WorldToTownPoint(x, z);
}

function isTownMinimapMetadata(value: unknown): value is TownMinimapMetadata {
  if (!value || typeof value !== 'object') return false;
  const row = value as Partial<TownMinimapMetadata>;
  return row.schemaVersion === 'town-minimap.v1' && typeof row.image?.file === 'string'
    && Number.isFinite(row.image.width) && Number.isFinite(row.image.height)
    && Number.isFinite(row.transform?.scale) && Number.isFinite(row.transform?.gridHeight)
    && row.transform?.tileWidthPx === 64 && row.transform.tileHeightPx === 32
    && Array.isArray(row.south) && row.south.length === 2 && Array.isArray(row.markers);
}

const warnedLayouts = new Set<string>();
/**
 * Minimap layout key for a v1 town runtime: the compiled town records its design spec
 * (`source.spec` = docs/design/town/<layoutKey>.yaml), which stays correct when a chapter reuses
 * another chapter's town (e.g. ch10 Dali served from the ch01 Dali runtime); otherwise fall back
 * to `<cityId>__<chapterId>`.
 */
export function v1MinimapLayoutKey(definition: {
  readonly cityId: string; readonly chapterId?: unknown; readonly source?: unknown;
}): string {
  const source = definition.source as { readonly spec?: unknown } | undefined;
  const spec = typeof source?.spec === 'string' ? source.spec : '';
  const match = /([a-z][a-z0-9_]*__ch\d{2})\.ya?ml$/u.exec(spec);
  if (match) return match[1]!;
  const chapterId = typeof definition.chapterId === 'string' ? definition.chapterId : 'ch01';
  return `${definition.cityId}__${chapterId}`;
}

export async function loadV1PaintedMinimap(
  layoutKey: string, baseUrl: string,
  fetcher: typeof fetch = fetch, decoder: (blob: Blob) => Promise<ImageBitmap> = createImageBitmap,
): Promise<V1PaintedMinimap | null> {
  try {
    const metadataUrl = `${baseUrl.replace(/\/+$/, '')}/${layoutKey}.json`;
    const response = await fetcher(metadataUrl);
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    const value: unknown = await response.json();
    if (!isTownMinimapMetadata(value)) throw new Error('TOWN_MINIMAP_SCHEMA');
    const imageUrl = new URL(value.image.file, new URL(metadataUrl, globalThis.location?.href ?? 'http://local/')).href;
    const imageResponse = await fetcher(imageUrl);
    if (!imageResponse.ok) throw new Error(`HTTP_${imageResponse.status}`);
    return { metadata: value, bitmap: await decoder(await imageResponse.blob()) };
  } catch (error) {
    if (import.meta.env.DEV && !warnedLayouts.has(layoutKey)) {
      warnedLayouts.add(layoutKey);
      console.warn(`TOWN_MINIMAP_FALLBACK:${layoutKey}`, error);
    }
    return null;
  }
}

/** TownPage loading seam: a missing painted map always schedules the real grid fallback. */
export async function loadV1PaintedMinimapWithFallback(
  layoutKey: string, baseUrl: string, fallback: () => void,
  fetcher: typeof fetch = fetch, decoder: (blob: Blob) => Promise<ImageBitmap> = createImageBitmap,
  active: () => boolean = () => true,
): Promise<V1PaintedMinimap | null> {
  const painted = await loadV1PaintedMinimap(layoutKey, baseUrl, fetcher, decoder);
  if (painted === null && active()) fallback();
  return painted;
}

interface V1QuestStatus { readonly id: string; readonly status: string }
interface V1QuestSubjects { readonly id: string; readonly subjectNpcIds: readonly string[] }
export function v1ActiveTaskNpcIds(
  quests: readonly V1QuestStatus[], definitions: readonly V1QuestSubjects[],
): ReadonlySet<string> {
  const active = new Set(quests.filter(row => row.status === 'active').map(row => row.id));
  return new Set(definitions.filter(row => active.has(row.id)).flatMap(row => row.subjectNpcIds));
}

export async function loadV1ActiveTaskNpcIds(
  chapterId: string, quests: readonly V1QuestStatus[], baseUrl = '/content',
  fetcher: typeof fetch = fetch,
): Promise<ReadonlySet<string>> {
  const root = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const manifestResponse = await fetcher(`${root}/${chapterId}/manifest.json`);
  if (!manifestResponse.ok) return new Set();
  const manifest = await manifestResponse.json() as { leaves?: readonly { kind?: string; load?: string;
    logicalName?: string }[] };
  const leaves = manifest.leaves?.filter(row => row.kind === 'rules' && row.load === 'chapter'
    && row.logicalName?.includes('.rules.base')) ?? [];
  const definitions: V1QuestSubjects[] = [];
  for (const leaf of leaves) {
    const response = await fetcher(`${root}/${chapterId}/${leaf.logicalName!}`);
    if (!response.ok) continue;
    const rows = await response.json() as readonly { kind?: string; value?: unknown }[];
    for (const row of rows) {
      const value = row.value as Partial<V1QuestSubjects> | undefined;
      if (row.kind === 'quest' && typeof value?.id === 'string' && Array.isArray(value.subjectNpcIds))
        definitions.push({ id: value.id, subjectNpcIds: value.subjectNpcIds.filter(
          (id): id is string => typeof id === 'string') });
    }
  }
  return v1ActiveTaskNpcIds(quests, definitions);
}

export function createPaintedMinimapMarkers(metadata: TownMinimapMetadata): readonly V1MinimapMarker[] {
  const [a, b, c, d, e, f] = v1WorldToImageMatrix(metadata);
  const determinant = a * d - b * c;
  const imageToWorld = (point: readonly [number, number]): readonly [number, number] => [
    (d * (point[0] - e) - c * (point[1] - f)) / determinant,
    (-b * (point[0] - e) + a * (point[1] - f)) / determinant,
  ];
  return metadata.markers.map(row => {
    const [x, z] = imageToWorld(row.px);
    // Painted markers start as navigation points at the authored entrance (also valid for
    // non-enterable stalls and landmarks); assembly routes enterable buildings explicitly.
    const [tx, tz] = imageToWorld(row.entrance ?? row.px);
    const target = { kind: 'point' as const, x: tx, z: tz };
    return { id: row.id, kind: row.kind, x, z, icon: row.glyph, label: row.name, target,
      ...(row.buildingId ? { buildingId: row.buildingId } : {}) };
  });
}

export function v1PlayerHeadingRad(direction: number | undefined): number {
  return V1_PLAYER_HEADINGS[direction ?? 0] ?? V1_PLAYER_HEADINGS[0];
}

function colorForGround(town: TownRuntimeView, paletteIndex: number): readonly number[] {
  const palette = town.groundPalette[paletteIndex];
  if (palette?.ground.includes('water')) return V1_MINIMAP_COLORS.water;
  if (palette?.ground.includes('road') || palette?.overlay?.includes('road'))
    return V1_MINIMAP_COLORS.road;
  return V1_MINIMAP_COLORS.courtyard;
}
function isFacility(kind: TownRuntimeView['buildings'][number]['interiorKind']): boolean {
  return kind === 'shop' || kind === 'inn' || kind === 'temple';
}
function paintRect(pixels: Uint8ClampedArray, width: number, height: number,
  minX: number, minZ: number, maxX: number, maxZ: number, metresPerPx: number, color: readonly number[]): void {
  const left = Math.max(0, Math.floor(minX / metresPerPx));
  const top = Math.max(0, Math.floor(minZ / metresPerPx));
  const right = Math.min(width, Math.ceil(maxX / metresPerPx));
  const bottom = Math.min(height, Math.ceil(maxZ / metresPerPx));
  for (let y = top; y < bottom; y += 1) for (let x = left; x < right; x += 1) {
    const index = (y * width + x) * 4; pixels[index] = color[0]!; pixels[index + 1] = color[1]!;
    pixels[index + 2] = color[2]!; pixels[index + 3] = color[3]!;
  }
}

/** Pure, deterministic rasterizer. The returned bitmap is north-up and begins at world (0, 0). */
export function generateV1MinimapBitmap(town: TownRuntimeView): V1MinimapBitmap {
  const requiredMpp = Math.max(town.grid.width, town.grid.height) / V1_MINIMAP_MAX_SIDE_PX;
  const metresPerPx = Math.max(V1_MINIMAP_METRES_PER_PX, requiredMpp);
  const width = Math.ceil(town.grid.width / metresPerPx);
  const height = Math.ceil(town.grid.height / metresPerPx);
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (const [start, length, paletteIndex] of town.groundRuns) {
    const color = colorForGround(town, paletteIndex);
    for (let cell = start; cell < start + length; cell += 1) {
      const x = cell % town.grid.width; const authoredZ = Math.floor(cell / town.grid.width);
      const worldZ = town.grid.height - authoredZ - 1;
      paintRect(pixels, width, height, x, worldZ, x + 1, worldZ + 1, metresPerPx, color);
    }
  }
  for (const building of town.buildings) {
    const minZ = town.grid.height - building.origin[1] - building.size[1];
    paintRect(pixels, width, height, building.origin[0], minZ,
      building.origin[0] + building.size[0], minZ + building.size[1], metresPerPx,
      isFacility(building.interiorKind) ? V1_MINIMAP_COLORS.facility : V1_MINIMAP_COLORS.building);
  }
  return { width, height, minX: 0, minZ: 0, metresPerPx, pixels };
}

function facilityLabel(building: TownRuntimeView['buildings'][number]): string {
  if (building.poi) return building.poi;
  if (building.interiorKind === 'shop') return strings.shop;
  if (building.interiorKind === 'inn') return strings.inn;
  if (building.interiorKind === 'temple') return strings.temple;
  return strings.other;
}

export function createV1MinimapMarkers(
  town: TownRuntimeView, projection: TownSceneProjection,
  characterNames: ReadonlyMap<string, string> = new Map(),
  taskNpcIds: ReadonlySet<string> = new Set(),
): readonly V1MinimapMarker[] {
  const markers: V1MinimapMarker[] = [];
  for (const building of town.buildings) {
    const entrance = building.entrances[0];
    if (!entrance || !isFacility(building.interiorKind)) continue;
    const [x, z] = v1TownPointToWorld(entrance, town.grid.height);
    const kind = building.interiorKind === 'shop' || building.interiorKind === 'inn'
      || building.interiorKind === 'temple' ? building.interiorKind : 'other';
    markers.push({ id: `facility-${building.id}`, kind: 'facility', x, z,
      icon: strings.icons[kind], label: facilityLabel(building),
      target: { kind: 'building', buildingId: building.id } });
  }
  for (const anchor of projection.anchors) {
    if (anchor.active === false || anchor.kind === 'building' || anchor.kind === 'location') continue;
    if (anchor.kind === 'npc' && !taskNpcIds.has(anchor.npcId ?? '')) continue;
    const [x, z] = v1TownPointToWorld(anchor.point, town.grid.height);
    const label = anchor.kind === 'npc'
      ? characterNames.get(anchor.npcId ?? '') ?? strings.passerby
      : anchor.label;
    markers.push({ id: anchor.id, kind: anchor.kind === 'npc' ? 'npc' : 'meditation', x, z,
      icon: anchor.kind === 'npc' ? strings.icons.npc : strings.icons.meditation,
      label, target: { kind: 'anchor', anchorId: anchor.id } });
  }
  return markers;
}

/**
 * A painted marker whose authored building is enterable in this runtime travels into that building
 * explicitly: v1 layouts can share one door cell between two buildings (Dali bi_0020 casino and
 * bi_0023 pharmacy), and a bare point move enters whichever building core lists first. Stalls,
 * landmarks and gates stay plain navigation points.
 */
function enterablePaintedTarget(marker: V1MinimapMarker, town: TownRuntimeView): V1MinimapMarker {
  if (marker.buildingId === undefined || marker.target.kind !== 'point') return marker;
  const building = town.buildings.find(entry => entry.id === marker.buildingId);
  return building?.enterable === true && building.entrances.length > 0
    ? { ...marker, target: { kind: 'building', buildingId: building.id } } : marker;
}

export function createV1AssembledMinimapMarkers(
  town: TownRuntimeView, projection: TownSceneProjection,
  painted: readonly V1MinimapMarker[] | null,
  characterNames: ReadonlyMap<string, string> = new Map(),
  taskNpcIds: ReadonlySet<string> = new Set(),
  facility: V1FacilityMarkerProjection | null = null,
): readonly V1MinimapMarker[] {
  const runtime = createV1MinimapMarkers(town, projection, characterNames, taskNpcIds);
  const assembled = painted === null ? runtime : [
    ...painted.map(marker => enterablePaintedTarget(marker, town)),
    ...runtime.filter(marker => marker.kind === 'npc'),
  ];
  if (!facility) return assembled;
  const presentation = facilityPresentation(facility.kind, facility.name);
  return assembled.map(marker => marker.id === facility.key ||
    (marker.target.kind === 'building' && marker.target.buildingId === facility.buildingId)
    ? { ...marker, kind: 'facility' as const, ...presentation } : marker);
}

export function v1TravelCommand(
  target: MinimapTravelTarget, town: TownRuntimeView, projection: TownSceneProjection,
): TownCommand | null {
  if (target.kind === 'point')
    return { t: 'town/move', destination: v1WorldToTownPoint(target.x, target.z) };
  if (target.kind === 'building') {
    const building = town.buildings.find(entry => entry.id === target.buildingId);
    const destination = building?.entrances[0];
    return destination ? { t: 'town/move', destination, buildingId: building.id } : null;
  }
  const anchor = projection.anchors.find(entry => entry.id === target.anchorId);
  return anchor ? { t: 'town/move', destination: anchor.point,
    ...(anchor.kind === 'building' && anchor.buildingId ? { buildingId: anchor.buildingId } : {}) } : null;
}

/** Assembly seam: converts a minimap event to one command intent and leaves validation to core. */
export function dispatchV1MinimapTravel(
  target: MinimapTravelTarget, town: TownRuntimeView, projection: TownSceneProjection,
  send: (command: TownCommand) => unknown,
): boolean {
  const command = v1TravelCommand(target, town, projection);
  if (!command) return false;
  void send(command);
  return true;
}

export function writeV1Path(
  path: readonly TownPoint[] | undefined, gridHeight: number, out?: Float32Array,
): Float32Array | null {
  if (!path || path.length < 2) return null;
  const result = out?.length === path.length * 2 ? out : new Float32Array(path.length * 2);
  for (let index = 0; index < path.length; index += 1) {
    const [x, z] = v1TownPointToWorld(path[index]!, gridHeight);
    result[index * 2] = x; result[index * 2 + 1] = z;
  }
  return result;
}

export function writeV1ViewQuad(
  scene: TownScene, out: Float32Array,
): boolean {
  return scene.writeViewGroundQuad(out);
}
