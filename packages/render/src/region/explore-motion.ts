import type { ExploreWalkView, RegionBounds, RegionHexPoint } from './types';

export const HEX_STEP_MM = 1_155;
export const WORLD_TICK_MS = 100;
export const CAMERA_SPRING_OMEGA = 10;
export const CAMERA_LOOK_AHEAD_M = 0.8;
export const CAMERA_DEAD_ZONE_RATIO = 0.2;
export const CAMERA_BOUNDS_INSET_M = 3;
export const MAX_TURN_RAD_PER_SECOND = Math.PI * 3;
const SQRT3_RADIUS = (Math.sqrt(3) * 2) / 3;

export interface GroundPoint {
  x: number;
  z: number;
}
export interface WalkSample extends GroundPoint {
  yawRad: number;
  moving: boolean;
  segment: number;
  portion: number;
}
export interface CameraSpringState extends GroundPoint {
  vx: number;
  vz: number;
}
export interface CameraFollowFrame {
  readonly yawDeg: number;
  readonly halfWidth: number;
  readonly halfHeight: number;
}

export function regionHexGround(point: RegionHexPoint, out: GroundPoint): GroundPoint {
  out.x = SQRT3_RADIUS * (point.q + point.r / 2);
  out.z = point.r;
  return out;
}

export function sampleWalk(
  walk: ExploreWalkView,
  timeMs: number,
  worldTickAtMs: number,
  out: WalkSample,
): WalkSample {
  const last = walk.path.length - 1;
  if (last < 0) {
    out.x = 0;
    out.z = 0;
    out.yawRad = 0;
    out.moving = false;
    out.segment = 0;
    out.portion = 0;
    return out;
  }
  const elapsedTicks = Math.min(1, Math.max(0, timeMs - worldTickAtMs) / WORLD_TICK_MS);
  const stepMm = walk.stepMm > 0 ? walk.stepMm : HEX_STEP_MM;
  const currentMm = Math.max(0, walk.progressMm + walk.mmPerTick * elapsedTicks);
  let distanceMm =
    currentMm <= stepMm ? (currentMm / stepMm) * HEX_STEP_MM : HEX_STEP_MM + currentMm - stepMm;
  const maxMm = last * HEX_STEP_MM;
  distanceMm = Math.min(distanceMm, maxMm);
  const segment = Math.min(last - 1, Math.floor(distanceMm / HEX_STEP_MM));
  if (segment < 0) {
    regionHexGround(walk.path[0]!, out);
    out.yawRad = 0;
    out.moving = false;
    out.segment = 0;
    out.portion = 0;
    return out;
  }
  const portion = Math.min(1, Math.max(0, (distanceMm - segment * HEX_STEP_MM) / HEX_STEP_MM));
  const from = walk.path[segment]!;
  const to = walk.path[segment + 1]!;
  const fromX = SQRT3_RADIUS * (from.q + from.r / 2);
  const fromZ = from.r;
  const toX = SQRT3_RADIUS * (to.q + to.r / 2);
  const toZ = to.r;
  out.x = fromX + (toX - fromX) * portion;
  out.z = fromZ + (toZ - fromZ) * portion;
  out.yawRad = Math.atan2(toX - fromX, toZ - fromZ);
  out.moving = distanceMm < maxMm && walk.mmPerTick > 0;
  out.segment = segment;
  out.portion = portion;
  return out;
}

export function advanceFacing(current: number, desired: number, dt: number): number {
  let difference = desired - current;
  while (difference > Math.PI) difference -= Math.PI * 2;
  while (difference < -Math.PI) difference += Math.PI * 2;
  const maximum = MAX_TURN_RAD_PER_SECOND * Math.max(0, dt);
  return current + Math.max(-maximum, Math.min(maximum, difference));
}

export function cameraBasis(yawDeg: number, out: Float32Array): void {
  const yaw = (yawDeg * Math.PI) / 180;
  const backX = Math.cos(yaw);
  const backZ = Math.sin(yaw);
  out[0] = backZ;
  out[1] = -backX;
  out[2] = -backX;
  out[3] = -backZ;
}

export function advanceCameraSpring(
  state: CameraSpringState,
  targetX: number,
  targetZ: number,
  dt: number,
): void {
  let remaining = Math.max(0, dt);
  const omega = CAMERA_SPRING_OMEGA;
  while (remaining > 0) {
    const step = Math.min(1 / 60, remaining);
    state.vx += (-2 * omega * state.vx - omega * omega * (state.x - targetX)) * step;
    state.vz += (-2 * omega * state.vz - omega * omega * (state.z - targetZ)) * step;
    state.x += state.vx * step;
    state.z += state.vz * step;
    remaining -= step;
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  if (minimum > maximum) return (minimum + maximum) / 2;
  return Math.max(minimum, Math.min(maximum, value));
}

export function regionWorldBounds(bounds: RegionBounds, out: Float32Array): void {
  const corners = [
    [bounds.qMin, bounds.rMin],
    [bounds.qMax, bounds.rMin],
    [bounds.qMax, bounds.rMax],
    [bounds.qMin, bounds.rMax],
  ] as const;
  let minX = Infinity;
  let maxX = -Infinity;
  for (let index = 0; index < corners.length; index += 1) {
    const corner = corners[index]!;
    const x = SQRT3_RADIUS * (corner[0] + corner[1] / 2);
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
  }
  out[0] = minX - SQRT3_RADIUS / 2;
  out[1] = bounds.rMin - 2 / 3;
  out[2] = maxX + SQRT3_RADIUS / 2;
  out[3] = bounds.rMax + 2 / 3;
}

export function clampCameraTarget(bounds: Float32Array, out: GroundPoint): void {
  out.x = clamp(out.x, bounds[0]! + CAMERA_BOUNDS_INSET_M, bounds[2]! - CAMERA_BOUNDS_INSET_M);
  out.z = clamp(out.z, bounds[1]! + CAMERA_BOUNDS_INSET_M, bounds[3]! - CAMERA_BOUNDS_INSET_M);
}

/** Moves the desired focus only after the followed point leaves the central 20% rectangle. */
export function applyCameraDeadZone(
  state: CameraSpringState,
  followed: GroundPoint,
  frame: CameraFollowFrame,
  out: GroundPoint,
): void {
  const basis = (frame.yawDeg * Math.PI) / 180;
  const rightX = Math.sin(basis);
  const rightZ = -Math.cos(basis);
  const upX = -Math.cos(basis);
  const upZ = -Math.sin(basis);
  const dx = followed.x - state.x;
  const dz = followed.z - state.z;
  const horizontal = dx * rightX + dz * rightZ;
  const vertical = dx * upX + dz * upZ;
  const limitX = frame.halfWidth * CAMERA_DEAD_ZONE_RATIO;
  // A ground displacement projects to screen vertical with sin(pitch)=0.5.
  const limitUp = (frame.halfHeight * CAMERA_DEAD_ZONE_RATIO) / 0.5;
  const excessX = Math.max(
    -Math.max(0, Math.abs(horizontal) - limitX),
    Math.min(Math.max(0, Math.abs(horizontal) - limitX), horizontal),
  );
  const excessUp = Math.max(
    -Math.max(0, Math.abs(vertical) - limitUp),
    Math.min(Math.max(0, Math.abs(vertical) - limitUp), vertical),
  );
  out.x = state.x + rightX * excessX + upX * excessUp;
  out.z = state.z + rightZ * excessX + upZ * excessUp;
}

export function applyLookAhead(target: GroundPoint, yawRad: number, moving: boolean): void {
  if (!moving) return;
  target.x += Math.sin(yawRad) * CAMERA_LOOK_AHEAD_M;
  target.z += Math.cos(yawRad) * CAMERA_LOOK_AHEAD_M;
}

export function groundViewQuad(
  center: GroundPoint,
  yawDeg: number,
  halfWidth: number,
  halfHeight: number,
  out: Float32Array,
): void {
  const yaw = (yawDeg * Math.PI) / 180;
  const rightX = Math.sin(yaw);
  const rightZ = -Math.cos(yaw);
  const upX = -Math.cos(yaw);
  const upZ = -Math.sin(yaw);
  const groundUp = halfHeight / 0.5;
  const rightHalfX = rightX * halfWidth;
  const rightHalfZ = rightZ * halfWidth;
  const upHalfX = upX * groundUp;
  const upHalfZ = upZ * groundUp;
  out[0] = center.x - rightHalfX + upHalfX;
  out[1] = center.z - rightHalfZ + upHalfZ;
  out[2] = center.x + rightHalfX + upHalfX;
  out[3] = center.z + rightHalfZ + upHalfZ;
  out[4] = center.x + rightHalfX - upHalfX;
  out[5] = center.z + rightHalfZ - upHalfZ;
  out[6] = center.x - rightHalfX - upHalfX;
  out[7] = center.z - rightHalfZ - upHalfZ;
}
