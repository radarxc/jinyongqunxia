import { Matrix4, Vector3 } from 'three';
import type { Quaternion, Ray } from 'three';
import type { TownPoint } from './types';

export const TOWN_TILE_WIDTH = 64;
export const TOWN_TILE_HEIGHT = 32;
export const TOWN_PIXELS_PER_WORLD = 32 * Math.sqrt(2);
export const TOWN_VERTICAL_PIXELS_PER_WORLD = 16 * Math.sqrt(6);
const HEX_RADIUS = 2 / 3;
const CAMERA_HEIGHT_RATIO = Math.sqrt(2 / 3);
const CAMERA_EYE = new Vector3(1, CAMERA_HEIGHT_RATIO, 1);
const CAMERA_TARGET = new Vector3();
const CAMERA_UP = new Vector3(0, 1, 0);

/** Exact CSS-pixel transform used by tools/town/render_town.py at scale=1. */
export function planningToTownPixels(
  x: number, z: number, gridHeight: number, elevationCm = 0,
): TownPoint {
  const elevationM = elevationCm / 100;
  return [32 * (x + z), 16 * (gridHeight + x - z) - 16 * Math.sqrt(6) * elevationM];
}

/** Planning coordinates become the tech/02 world axes before the camera projects them. */
export function planningToTownWorld(
  x: number, z: number, gridHeight: number, elevationCm: number, out: Vector3,
): Vector3 {
  return out.set(x, elevationCm / 100, gridHeight - z);
}

export function planningCellCenterToTownWorld(
  point: TownPoint, gridHeight: number, elevationCm: number, out: Vector3,
): Vector3 {
  return planningToTownWorld(point[0] + 0.5, point[1] + 0.5, gridHeight, elevationCm, out);
}

/** Inverse world-axis transform, used only after a render-layer ray/ground intersection. */
export function townWorldToPlanningCell(
  worldX: number, worldZ: number, gridHeight: number,
): TownPoint | null {
  const x = Math.floor(worldX); const z = Math.floor(gridHeight - worldZ);
  return x < 0 || z < 0 ? null : [x, z];
}

/** Runtime axial point to the same world metre system sampled by the offline generator. */
export function townHexToWorld(
  point: TownPoint, gridHeight: number, elevationCm: number, out: Vector3,
): Vector3 {
  const worldX = Math.sqrt(3) * HEX_RADIUS * (point[0] + point[1] / 2);
  const worldZ = point[1];
  return out.set(worldX, elevationCm / 100, worldZ);
}

/** Nearest axial cell for a ray hit. Cube rounding keeps all six borders symmetric. */
export function townWorldToHex(worldX: number, worldZ: number): TownPoint {
  const fractionalR = worldZ;
  const fractionalQ = worldX * Math.sqrt(3) / 2 - fractionalR / 2;
  let q = Math.round(fractionalQ); let r = Math.round(fractionalR);
  const s = Math.round(-fractionalQ - fractionalR);
  const qError = Math.abs(q - fractionalQ); const rError = Math.abs(r - fractionalR);
  const sError = Math.abs(s + fractionalQ + fractionalR);
  if (qError > rError && qError > sError) q = -r - s;
  else if (rError > sError) r = -q - s;
  return [q, r];
}

/** Build once per scene; each click tests the authored height planes without scanning every cell. */
export function createTownHeightPicker(
  nodes: readonly (readonly [number, number, number, string])[],
): (ray: Ray, hit: Vector3) => TownPoint | null {
  const heights = [...new Set(nodes.map((node) => node[2]))];
  const byPoint = new Map(nodes.map((node) => [`${node[0]},${node[1]}`, node[2]]));
  return (ray, hit) => {
    if (Math.abs(ray.direction.y) < 1e-9) return null;
    let bestDistance = Number.POSITIVE_INFINITY; let best: TownPoint | null = null;
    for (const elevationCm of heights) {
      const distance = (elevationCm / 100 - ray.origin.y) / ray.direction.y;
      if (distance < 0 || distance >= bestDistance) continue;
      ray.at(distance, hit); const point = townWorldToHex(hit.x, hit.z);
      if (byPoint.get(`${point[0]},${point[1]}`) !== elevationCm) continue;
      bestDistance = distance; best = point;
    }
    return best;
  };
}

/** 45-degree yaw and exact 30-degree elevation used by the offline renderer. */
export function townCameraOffset(distance: number, out: Vector3): Vector3 {
  return out.set(distance, distance * CAMERA_HEIGHT_RATIO, distance);
}

/** Rotation for sprites authored in screen space with their top pointing upward. */
export function townBillboardQuaternion(out: Quaternion): Quaternion {
  return out.setFromRotationMatrix(new Matrix4().lookAt(CAMERA_EYE, CAMERA_TARGET, CAMERA_UP));
}

export function elevationAtHex(
  nodes: readonly (readonly [number, number, number, string])[], point: TownPoint,
): number {
  for (const node of nodes) if (node[0] === point[0] && node[1] === point[1]) return node[2];
  return 0;
}
