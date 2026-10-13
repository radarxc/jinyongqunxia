import { cameraBack } from '../../camera/iso-camera';

/** World facade bits shared with aMat.w: S, W, N, E. */
export const FACADE_S = 1 << 0;
export const FACADE_W = 1 << 1;
export const FACADE_N = 1 << 2;
export const FACADE_E = 1 << 3;

const back = { x: 0, y: 0, z: 0 };
const FACADE_NORMALS = [
  [0, 1],
  [-1, 0],
  [0, -1],
  [1, 0],
] as const;

/** Mirrors the shader's `dot(facadeNormal, cameraBackXZ) > .2` test, including moving yaw. */
export function facadeFacesCamera(facadeBit: number, yawDeg: number): boolean {
  cameraBack(yawDeg, back);
  for (let index = 0; index < FACADE_NORMALS.length; index += 1) {
    if ((facadeBit & (1 << index)) === 0) continue;
    const normal = FACADE_NORMALS[index]!;
    if (normal[0] * back.x + normal[1] * back.z > 0.2) return true;
  }
  return false;
}

export function cutFacadeMask(yawDeg: number): number {
  if (!Number.isFinite(yawDeg)) return 0;
  let result = 0;
  for (let bit = 1; bit <= FACADE_E; bit <<= 1) if (facadeFacesCamera(bit, yawDeg)) result |= bit;
  return result;
}

/** JS mirror of the shader focus-depth, radius and 0.3 m feather predicate. */
export function focusOcclusionAmount(
  fragment: readonly [number, number, number],
  focus: readonly [number, number, number],
  yawDeg: number,
  radiusM: number,
  fade: number,
): number {
  cameraBack(yawDeg, back);
  const dx = fragment[0] - focus[0],
    dy = fragment[1] - focus[1],
    dz = fragment[2] - focus[2];
  const depth = dx * back.x + dy * back.y + dz * back.z;
  if (depth <= 0.5 || !(radiusM > 0) || !(fade > 0)) return 0;
  const screenM = Math.sqrt(Math.max(0, dx * dx + dy * dy + dz * dz - depth * depth));
  if (screenM >= radiusM) return 0;
  const inner = Math.max(0, radiusM - 0.3);
  const edge = screenM <= inner ? 1 : 1 - (screenM - inner) / Math.max(0.000_001, radiusM - inner);
  const smoothEdge = edge * edge * (3 - 2 * edge);
  return Math.min(1, Math.max(0, fade)) * smoothEdge;
}
