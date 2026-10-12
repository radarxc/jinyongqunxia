import type { TownCommand, TownPoint } from '@tianshu/core';
import type { TownRuntimeView, TownScene, TownSceneProjection } from '@tianshu/render/town';
import { townHexToWorld, townWorldToHex } from '@tianshu/render/town';
import type { MinimapTravelTarget } from '@tianshu/ui/components/explore/TxMinimap.vue';
import { V1_MINIMAP_STRINGS as strings } from './v1-minimap.strings';

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
  readonly id: string; readonly kind: 'facility' | 'npc' | 'meditation';
  readonly x: number; readonly z: number; readonly icon: string; readonly label: string;
  readonly target: { readonly kind: 'anchor'; readonly anchorId: string }
    | { readonly kind: 'building'; readonly buildingId: string };
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
