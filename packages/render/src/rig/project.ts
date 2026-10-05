import { CLIP_BONES, CLIP_JOINTS, type RigClip } from './clip';
import { RIG_PARTS, type PartPoseBuffer, type RigBoneLengthKey, type RigPart, type RigSet, type RigView } from './types';

const DEG = Math.PI / 180; const SCALE = 1 / 32767; const MM = 1 / 1000;
const BONE_JOINTS = [
  [0, 2], [2, 3], [4, 8], [12, 16], [4, 5], [8, 9], [5, 6], [9, 10],
  [6, 7], [10, 11], [12, 13], [16, 17], [13, 14], [17, 18], [14, 15], [18, 19],
] as const;
const MIRRORED_BONE = new Uint8Array([0, 1, 2, 3, 5, 4, 7, 6, 9, 8, 11, 10, 13, 12, 15, 14]);
const BONE_LENGTH_KEYS: readonly (RigBoneLengthKey | undefined)[] = [
  'torso', 'head', undefined, undefined, 'upper_arm', 'upper_arm', 'forearm', 'forearm',
  'hand', 'hand', 'thigh', 'thigh', 'shin', 'shin', 'foot', 'foot',
];
const PART_BONE: Readonly<Record<RigPart, number>> = {
  head: 1, hair_or_headgear: 1, torso: 0, pelvis_skirt: 0, upper_arm_L: 4, upper_arm_R: 5,
  forearm_L: 6, forearm_R: 7, hand_L: 8, hand_R: 9, thigh_L: 10, thigh_R: 11,
  shin_L: 12, shin_R: 13, foot_L: 14, foot_R: 15,
};
const VIEW_YAWS = new Float32Array([45, -45, 135, -135, 90, -90]);
const VIEW_NAMES: readonly RigView[] = ['front34', 'front34', 'back34', 'back34', 'side', 'side'];
const GENERIC_WIDTHS = new Float32Array([.32, .37, .52, .48, .2, .2, .18, .18, .14, .14, .22, .22, .19, .19, .27, .27]);
// Preallocated working set covering common eight-direction, mirror and hysteresis variants.
const PROJECTION_CACHE_SIZE = 8 * 2 * 2;

interface ProjectionSnapshot {
  valid: boolean; frame: number; facingYawDeg: number; mirrored: boolean; weaponZ: number; weaponVisible: boolean;
  readonly inputViews: Int8Array; readonly currentViews: Int8Array; readonly positions: Float32Array;
  readonly viewIndices: Uint8Array; readonly mirrors: Uint8Array; readonly affines: Float32Array;
  readonly depths: Float32Array; readonly weaponAffine: Float32Array;
}
interface ProjectionCache { readonly entries: readonly ProjectionSnapshot[]; next: number }
interface ClipProjectionCaches { generic?: ProjectionCache; readonly rigSets: WeakMap<RigSet, ProjectionCache> }
const projectionCaches = new WeakMap<RigClip, ClipProjectionCaches>();
const stateCaches = new WeakMap<ClipProjection, ProjectionCache>();

export interface ClipProjection {
  readonly output: PartPoseBuffer; readonly positions: Float32Array; readonly restLengths: Float32Array;
  readonly partMetrics: Float32Array;
  readonly currentViews: Int8Array; frame: number; facingYawDeg: number; mirrored: boolean;
}
function angularDistance(left: number, right: number): number { return Math.abs((left - right + 540) % 360 - 180); }
function viewType(index: number): 0 | 1 | 2 { return (index < 2 ? 0 : index < 4 ? 2 : 1) as 0 | 1 | 2; }
export function createPartPoseBuffer(): PartPoseBuffer {
  const viewIndices = new Uint8Array(RIG_PARTS.length); const mirrors = new Uint8Array(RIG_PARTS.length);
  const affines = new Float32Array(RIG_PARTS.length * 6); const depths = new Float32Array(RIG_PARTS.length);
  const poses = RIG_PARTS.map((_, index) => ({ viewIndex: 0 as const, mirrored: false,
    affine: affines.subarray(index * 6, index * 6 + 6), z: 0 })) as Array<{ viewIndex: 0 | 1 | 2; mirrored: boolean; affine: Float32Array; z: number }>;
  return { poses, viewIndices, mirrors, affines, depths, weaponAffine: new Float32Array(6), weaponZ: 0, weaponVisible: false };
}

function createProjectionCache(): ProjectionCache {
  const entries = Array.from({ length: PROJECTION_CACHE_SIZE }, (): ProjectionSnapshot => ({
    valid: false, frame: -1, facingYawDeg: 0, mirrored: false, weaponZ: 0, weaponVisible: false,
    inputViews: new Int8Array(RIG_PARTS.length), currentViews: new Int8Array(RIG_PARTS.length),
    positions: new Float32Array(CLIP_JOINTS.length * 3), viewIndices: new Uint8Array(RIG_PARTS.length),
    mirrors: new Uint8Array(RIG_PARTS.length), affines: new Float32Array(RIG_PARTS.length * 6),
    depths: new Float32Array(RIG_PARTS.length), weaponAffine: new Float32Array(6),
  }));
  return { entries, next: 0 };
}

function projectionCacheFor(clip: RigClip, rigSet: RigSet | undefined): ProjectionCache {
  let caches = projectionCaches.get(clip);
  if (!caches) { caches = { rigSets: new WeakMap<RigSet, ProjectionCache>() }; projectionCaches.set(clip, caches); }
  if (!rigSet) return caches.generic ??= createProjectionCache();
  let cache = caches.rigSets.get(rigSet);
  if (!cache) { cache = createProjectionCache(); caches.rigSets.set(rigSet, cache); }
  return cache;
}

function viewsEqual(left: Int8Array, right: Int8Array): boolean {
  for (let index = 0; index < left.length; index += 1) if (left[index] !== right[index]) return false;
  return true;
}

function restoreSnapshot(state: ClipProjection, snapshot: ProjectionSnapshot): void {
  state.positions.set(snapshot.positions); state.currentViews.set(snapshot.currentViews);
  state.output.viewIndices.set(snapshot.viewIndices); state.output.mirrors.set(snapshot.mirrors);
  state.output.affines.set(snapshot.affines); state.output.depths.set(snapshot.depths);
  state.output.weaponAffine.set(snapshot.weaponAffine); state.output.weaponZ = snapshot.weaponZ;
  state.output.weaponVisible = snapshot.weaponVisible;
  for (let part = 0; part < RIG_PARTS.length; part += 1) {
    const pose = state.output.poses[part] as { viewIndex: 0 | 1 | 2; mirrored: boolean; z: number };
    pose.viewIndex = state.output.viewIndices[part] as 0 | 1 | 2;
    pose.mirrored = state.output.mirrors[part] === 1; pose.z = state.output.depths[part]!;
  }
}

function saveSnapshot(state: ClipProjection, snapshot: ProjectionSnapshot): void {
  snapshot.valid = true; snapshot.frame = state.frame; snapshot.facingYawDeg = state.facingYawDeg; snapshot.mirrored = state.mirrored;
  snapshot.currentViews.set(state.currentViews); snapshot.positions.set(state.positions);
  snapshot.viewIndices.set(state.output.viewIndices); snapshot.mirrors.set(state.output.mirrors);
  snapshot.affines.set(state.output.affines); snapshot.depths.set(state.output.depths);
  snapshot.weaponAffine.set(state.output.weaponAffine); snapshot.weaponZ = state.output.weaponZ;
  snapshot.weaponVisible = state.output.weaponVisible;
}

function sourceFor(part: RigPart, mirrored: boolean): string {
  if (part.startsWith('thigh_')) return 'thigh_shared';
  if (part.startsWith('shin_')) return 'shin_shared';
  if (part.startsWith('foot_')) return 'foot_shared';
  if (mirrored && part.endsWith('_L')) return `${part.slice(0, -2)}_R`;
  if (mirrored && part.endsWith('_R')) return `${part.slice(0, -2)}_L`;
  return part;
}
function createPartMetrics(rigSet: RigSet | undefined): Float32Array {
  const output = new Float32Array(6 * RIG_PARTS.length * 4);
  for (let view = 0; view < 6; view += 1) for (let part = 0; part < RIG_PARTS.length; part += 1) {
    const offset = (view * RIG_PARTS.length + part) * 4; const partName = RIG_PARTS[part]!;
    const manifest = rigSet?.manifest.parts.find((entry) => entry.view === VIEW_NAMES[view] && entry.id === sourceFor(partName, view % 2 === 1));
    const ppm = rigSet?.manifest.ppm ?? 256; const width = manifest ? manifest.size[0] / ppm : GENERIC_WIDTHS[part]!;
    const height = manifest ? manifest.size[1] / ppm : Math.max(.1, GENERIC_WIDTHS[part]! * 2);
    output[offset] = width; output[offset + 1] = height;
    output[offset + 2] = manifest ? (manifest.pivot[0] / ppm) : width * .5;
    output[offset + 3] = manifest ? (manifest.pivot[1] / ppm) : height * .15;
  }
  return output;
}
export function createClipProjection(clip: RigClip, rigSet?: RigSet): ClipProjection {
  const restLengths = new Float32Array(CLIP_BONES.length);
  const bodyScale = rigSet ? rigSet.manifest.heightM / 1.7 : 1;
  for (let bone = 0; bone < BONE_JOINTS.length; bone += 1) {
    const [start, end] = BONE_JOINTS[bone]!; const a = start * 3; const b = end * 3;
    const sourceLength = Math.hypot(clip.restJointMm[b]! - clip.restJointMm[a]!,
      clip.restJointMm[b + 1]! - clip.restJointMm[a + 1]!, clip.restJointMm[b + 2]! - clip.restJointMm[a + 2]!) * MM;
    const key = BONE_LENGTH_KEYS[bone];
    restLengths[bone] = key === undefined ? sourceLength * bodyScale : rigSet?.manifest.boneLengthsM?.[key] ?? sourceLength * bodyScale;
  }
  const currentViews = new Int8Array(RIG_PARTS.length); currentViews.fill(-1);
  const state = { output: createPartPoseBuffer(), positions: new Float32Array(CLIP_JOINTS.length * 3), restLengths, partMetrics: createPartMetrics(rigSet),
    currentViews, frame: 0, facingYawDeg: 0, mirrored: false };
  stateCaches.set(state, projectionCacheFor(clip, rigSet)); return state;
}
export function resetClipProjection(state: ClipProjection): void {
  state.currentViews.fill(-1); state.frame = 0;
}

function setPoint(points: Float32Array, target: number, source: number, dx: number, dy: number, dz: number): void {
  const at = target * 3; const from = source * 3; points[at] = points[from]! + dx;
  points[at + 1] = points[from + 1]! + dy; points[at + 2] = points[from + 2]! + dz;
}
function writeBone(clip: RigClip, state: ClipProjection, frame: number, bone: number, start: number, end: number, cosYaw: number, sinYaw: number): void {
  const sourceBone = state.mirrored ? MIRRORED_BONE[bone]! : bone;
  const value = (frame * CLIP_BONES.length + sourceBone) * 3;
  let x = clip.directionI16[value]! * SCALE; const y = clip.directionI16[value + 1]! * SCALE;
  let z = clip.directionI16[value + 2]! * SCALE;
  if (state.mirrored) x = -x;
  const rotatedX = cosYaw * x + sinYaw * z; z = -sinYaw * x + cosYaw * z; x = rotatedX;
  const size = Math.hypot(x, y, z); const length = state.restLengths[bone]! * clip.lengthRatioU16[frame * CLIP_BONES.length + sourceBone]! * SCALE;
  const multiplier = size < 1e-12 ? 0 : length / size; setPoint(state.positions, end, start, x * multiplier, y * multiplier, z * multiplier);
}
function writeSpan(clip: RigClip, state: ClipProjection, frame: number, bone: number, centre: number, left: number, right: number, cosYaw: number, sinYaw: number): void {
  const value = (frame * CLIP_BONES.length + bone) * 3; let x = clip.directionI16[value]! * SCALE;
  let y = clip.directionI16[value + 1]! * SCALE; let z = clip.directionI16[value + 2]! * SCALE;
  if (state.mirrored) { y = -y; z = -z; }
  const rx = cosYaw * x + sinYaw * z; z = -sinYaw * x + cosYaw * z; x = rx; const size = Math.hypot(x, y, z);
  const half = size < 1e-12 ? 0 : state.restLengths[bone]! * clip.lengthRatioU16[frame * CLIP_BONES.length + bone]! * SCALE / size * .5;
  setPoint(state.positions, left, centre, -x * half, -y * half, -z * half);
  setPoint(state.positions, right, centre, x * half, y * half, z * half);
}
function solvePoints(clip: RigClip, state: ClipProjection, frame: number): void {
  const points = state.positions; const root = frame * 3; const rest = clip.restJointMm;
  let rootX = (rest[0]! + clip.rootMmI16[root]!) * MM; const rootY = (rest[1]! + clip.rootMmI16[root + 1]!) * MM;
  let rootZ = (rest[2]! + clip.rootMmI16[root + 2]!) * MM; if (state.mirrored) rootX = -rootX;
  const yaw = state.facingYawDeg * DEG; const cos = Math.cos(yaw); const sin = Math.sin(yaw);
  const rotatedX = cos * rootX + sin * rootZ; rootZ = -sin * rootX + cos * rootZ; rootX = rotatedX;
  points[0] = rootX; points[1] = rootY; points[2] = rootZ;
  writeBone(clip, state, frame, 0, 0, 2, cos, sin); writeBone(clip, state, frame, 1, 2, 3, cos, sin);
  writeSpan(clip, state, frame, 2, 2, 4, 8, cos, sin); writeSpan(clip, state, frame, 3, 0, 12, 16, cos, sin);
  for (let bone = 4; bone < BONE_JOINTS.length; bone += 1) {
    const [start, end] = BONE_JOINTS[bone]!; writeBone(clip, state, frame, bone, start, end, cos, sin);
  }
}
function chooseView(yaw: number, previous: number): number {
  let best = 0; let distance = Infinity;
  for (let index = 0; index < VIEW_YAWS.length; index += 1) {
    const next = angularDistance(yaw, VIEW_YAWS[index]!);
    if (next < distance || next === distance && index < best) { best = index; distance = next; }
  }
  return previous < 0 || distance + 10 < angularDistance(yaw, VIEW_YAWS[previous]!) ? best : previous;
}
function smoothedTrackYaw(clip: RigClip, frame: number, track: number, facing: number, mirrored: boolean): number {
  const centre = clip.facingYawCdegI16[frame * 3 + track]! / 100; let total = 0; let count = 0;
  for (let index = Math.max(0, frame - 1); index <= Math.min(clip.frameCount - 1, frame + 1); index += 1) {
    const value = clip.facingYawCdegI16[index * 3 + track]! / 100; total += centre + (value - centre + 540) % 360 - 180; count += 1;
  }
  const yaw = total / count; return (mirrored ? -yaw : yaw) - facing;
}
function writePart(clip: RigClip, state: ClipProjection, part: number, chestYaw: number, pelvisYaw: number, headYaw: number): void {
  const bone = PART_BONE[RIG_PARTS[part]!]; const [start, end] = BONE_JOINTS[bone]!; const points = state.positions;
  const a = start * 3; const b = end * 3; const dx = points[b]! - points[a]!; const dy = points[b + 1]! - points[a + 1]!;
  const dz = points[b + 2]! - points[a + 2]!; const length3 = Math.max(1e-12, Math.hypot(dx, dy, dz));
  const projected = Math.hypot(dx, dy); let along = Math.max(clip.viewHints.minForeshortenBp / 10_000, projected / length3);
  let yaw = chestYaw;
  if (RIG_PARTS[part] === 'head' || RIG_PARTS[part] === 'hair_or_headgear') yaw = headYaw;
  else if (RIG_PARTS[part] === 'pelvis_skirt' || part >= 10) yaw = pelvisYaw;
  const view = chooseView(yaw, state.currentViews[part]!); state.currentViews[part] = view;
  const mirrored = view % 2 === 1; const viewIndex = viewType(view); const metric = (view * RIG_PARTS.length + part) * 4;
  const width = state.partMetrics[metric]!; const height = state.partMetrics[metric + 1]!;
  const pivotX = mirrored ? width - state.partMetrics[metric + 2]! : state.partMetrics[metric + 2]!;
  const pivotY = state.partMetrics[metric + 3]!; const angle = projected < 1e-12 ? 0 : Math.atan2(-dx, dy);
  let across = 1;
  if (part === 2 || part === 3) {
    const span = BONE_JOINTS[part === 2 ? 2 : 3]!; const spanDx = points[span[1] * 3]! - points[span[0] * 3]!;
    const spanDy = points[span[1] * 3 + 1]! - points[span[0] * 3 + 1]!;
    across = Math.min(1.4, Math.max(.6, Math.hypot(spanDx, spanDy) / Math.max(state.restLengths[part === 2 ? 2 : 3]!, 1e-12)));
    along = Math.min(1.4, Math.max(.45, along));
  }
  const cos = Math.cos(angle); const sin = Math.sin(angle); const affine = state.output.poses[part]!.affine;
  const scaledWidth = width * across; const scaledHeight = height * along;
  const offsetX = scaledWidth * .5 - pivotX * across; const offsetY = pivotY * along - scaledHeight * .5;
  affine[0] = cos * scaledWidth; affine[1] = sin * scaledHeight; affine[2] = points[a]! + cos * offsetX + sin * offsetY;
  affine[3] = -sin * scaledWidth; affine[4] = cos * scaledHeight; affine[5] = points[a + 1]! - sin * offsetX + cos * offsetY;
  const depth = Math.min(15.4, Math.max(-1.9, 8 + (points[a + 2]! + points[b + 2]!) * 2)); const pose = state.output.poses[part] as { viewIndex: 0 | 1 | 2; mirrored: boolean; z: number };
  pose.viewIndex = viewIndex; pose.mirrored = mirrored; pose.z = depth; state.output.viewIndices[part] = viewIndex;
  state.output.mirrors[part] = mirrored ? 1 : 0; state.output.depths[part] = depth;
}
function writeWeapon(clip: RigClip, state: ClipProjection): void {
  const direction = clip.weaponTipDirectionI16; const at = state.frame * 3; let x = direction[at]! * SCALE;
  const y = direction[at + 1]! * SCALE; let z = direction[at + 2]! * SCALE; if (state.mirrored) x = -x;
  const yaw = state.facingYawDeg * DEG; const cosYaw = Math.cos(yaw); const sinYaw = Math.sin(yaw);
  const rx = cosYaw * x + sinYaw * z; z = -sinYaw * x + cosYaw * z; x = rx; const size = Math.max(1e-12, Math.hypot(x, y, z));
  const projected = Math.hypot(x, y); const scale = Math.max(.45, projected / size); const angle = projected < 1e-12 ? 0 : Math.atan2(-x, y);
  const grip = CLIP_JOINTS.indexOf(clip.weaponGripJoint); const affine = state.output.weaponAffine;
  affine[0] = Math.cos(angle) * .14; affine[1] = Math.sin(angle) * scale; affine[2] = state.positions[grip * 3]!;
  affine[3] = -Math.sin(angle) * .14; affine[4] = Math.cos(angle) * scale; affine[5] = state.positions[grip * 3 + 1]!;
  state.output.weaponZ = Math.min(15.4, Math.max(-1.9, 8 + state.positions[grip * 3 + 2]! * 4)); state.output.weaponVisible = true;
}

export function projectClipFrame(clip: RigClip, state: ClipProjection, frame: number, facingYawDeg: number, mirror = false): PartPoseBuffer {
  state.frame = Math.min(clip.frameCount - 1, Math.max(0, Math.trunc(frame))); state.facingYawDeg = Number.isFinite(facingYawDeg) ? facingYawDeg : 0; state.mirrored = mirror;
  let cache = stateCaches.get(state);
  if (!cache) { cache = createProjectionCache(); stateCaches.set(state, cache); }
  for (let index = 0; index < cache.entries.length; index += 1) {
    const cached = cache.entries[index]!;
    if (cached.valid && cached.frame === state.frame && Object.is(cached.facingYawDeg, state.facingYawDeg) &&
        cached.mirrored === mirror && viewsEqual(cached.inputViews, state.currentViews)) {
      restoreSnapshot(state, cached); return state.output;
    }
  }
  const snapshot = cache.entries[cache.next]!; cache.next = (cache.next + 1) % cache.entries.length;
  snapshot.inputViews.set(state.currentViews);
  solvePoints(clip, state, state.frame);
  const pelvisYaw = smoothedTrackYaw(clip, state.frame, 0, state.facingYawDeg, state.mirrored);
  const chestYaw = smoothedTrackYaw(clip, state.frame, 1, state.facingYawDeg, state.mirrored);
  const headYaw = smoothedTrackYaw(clip, state.frame, 2, state.facingYawDeg, state.mirrored);
  for (let part = 0; part < RIG_PARTS.length; part += 1) writePart(clip, state, part, chestYaw, pelvisYaw, headYaw);
  writeWeapon(clip, state);
  saveSnapshot(state, snapshot);
  return state.output;
}
export function isClipMainHandFar(clip: RigClip, state: ClipProjection): boolean {
  const hand = clip.mainHand === 'L' ? 7 : 11; const points = state.positions;
  return points[hand * 3 + 2]! < (points[2]! + points[8]!) * .5;
}

export function roundHalfAway(value: number): number { return value >= 0 ? Math.floor(value + .5) : Math.ceil(value - .5); }
