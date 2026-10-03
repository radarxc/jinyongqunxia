import type { RigSide } from './types';

export const CLIP_JOINTS = [
  'pelvis', 'chest', 'neck', 'head', 'shoulder_L', 'elbow_L', 'wrist_L', 'grip_L',
  'shoulder_R', 'elbow_R', 'wrist_R', 'grip_R', 'hip_L', 'knee_L', 'ankle_L',
  'toe_L', 'hip_R', 'knee_R', 'ankle_R', 'toe_R',
] as const;
export const CLIP_BONES = [
  'torso', 'head', 'shoulder_span', 'hip_span', 'upper_arm_L', 'upper_arm_R',
  'forearm_L', 'forearm_R', 'hand_L', 'hand_R', 'thigh_L', 'thigh_R',
  'shin_L', 'shin_R', 'foot_L', 'foot_R',
] as const;
export type RigClipEventType = 'hit' | 'end';
export interface RigClipEvent { readonly frame: number; readonly type: RigClipEventType }
export interface RigClip {
  readonly schema: 'tianshu-clip.v1'; readonly id: string;
  readonly skeleton: 'tianshu_humanoid.v1'; readonly fps: 12 | 30;
  readonly frameCount: number; readonly durationMs: number; readonly loop: boolean;
  readonly nativeSpeedMmps: number; readonly mainHand: RigSide;
  readonly source: { readonly pack: string; readonly animation: string; readonly license: string; readonly url: string; readonly sha256: string };
  readonly events: readonly RigClipEvent[];
  readonly viewHints: { readonly yawAssistMaxCdeg: number; readonly minForeshortenBp: 4500; readonly nearSide: 'L'; readonly anatomicalSides: true };
  readonly restJointMm: Int32Array; readonly directionI16: Int16Array;
  readonly lengthRatioU16: Uint16Array; readonly rootMmI16: Int16Array;
  readonly facingYawCdegI16: Int16Array; readonly weaponTipDirectionI16: Int16Array;
  readonly weaponHand: RigSide; readonly weaponGripJoint: 'grip_L' | 'grip_R';
}

export enum RigClipErrorCode {
  Schema = 'RIG_CLIP_SCHEMA', Skeleton = 'RIG_CLIP_SKELETON', License = 'RIG_CLIP_LICENSE',
  Field = 'RIG_CLIP_FIELD', Base64 = 'RIG_CLIP_BASE64', TrackLength = 'RIG_CLIP_TRACK_LENGTH',
  Event = 'RIG_CLIP_EVENT', DuplicateId = 'RIG_CLIP_DUPLICATE_ID', UnknownId = 'RIG_CLIP_UNKNOWN_ID',
}
export class RigClipError extends Error {
  constructor(readonly code: RigClipErrorCode, detail: string) { super(`${code}:${detail}`); this.name = 'RigClipError'; }
}

type JsonObject = Record<string, unknown>;
const LICENSES = new Set(['CC0-1.0', 'CMU-commercial', 'CC-BY-4.0']);
const ID = /^clip_[a-z0-9]+(?:_[a-z0-9]+)*$/;
const BASE64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const SHA256 = /^[0-9a-f]{64}$/;
const VERSION = /^[0-9]+[.][0-9]+[.][0-9]+$/;
const registry = new Map<string, RigClip>();
const validatedClips = new WeakSet<object>();

function fail(code: RigClipErrorCode, detail: string): never { throw new RigClipError(code, detail); }
function object(value: unknown, field: string): JsonObject {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(RigClipErrorCode.Field, field);
  return value as JsonObject;
}
function exact(value: JsonObject, keys: readonly string[], field: string): void {
  const actual = Object.keys(value).sort(); const expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) fail(RigClipErrorCode.Field, field);
}
function integer(value: unknown, field: string, minimum: number, maximum = Number.MAX_SAFE_INTEGER): number {
  if (!Number.isInteger(value) || (value as number) < minimum || (value as number) > maximum) fail(RigClipErrorCode.Field, field);
  return value as number;
}
function text(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) fail(RigClipErrorCode.Field, field);
  return value;
}
function decodeBase64(value: unknown, field: string, values: number, signed: boolean): Int16Array | Uint16Array {
  if (typeof value !== 'string' || !BASE64.test(value)) fail(RigClipErrorCode.Base64, field);
  const padding = value.endsWith('==') ? 2 : value.endsWith('=') ? 1 : 0;
  const byteLength = value.length / 4 * 3 - padding;
  if (byteLength !== values * 2) fail(RigClipErrorCode.TrackLength, field);
  let binary: string;
  try { binary = atob(value); } catch { return fail(RigClipErrorCode.Base64, field); }
  if (binary.length !== byteLength) fail(RigClipErrorCode.TrackLength, field);
  const output = signed ? new Int16Array(values) : new Uint16Array(values);
  for (let index = 0; index < values; index += 1) {
    const raw = binary.charCodeAt(index * 2) | binary.charCodeAt(index * 2 + 1) << 8;
    output[index] = signed && raw >= 0x8000 ? raw - 0x1_0000 : raw;
  }
  return output;
}
function canonicalArray(value: unknown, expected: readonly string[], field: string): void {
  if (!Array.isArray(value) || value.length !== expected.length ||
      value.some((item, index) => item !== expected[index])) fail(RigClipErrorCode.Field, field);
}

function validateSource(value: unknown): RigClip['source'] {
  const source = object(value, 'source'); exact(source, ['pack', 'animation', 'license', 'url', 'sha256'], 'source');
  const pack = text(source['pack'], 'source.pack'); const animation = text(source['animation'], 'source.animation');
  const license = source['license'];
  if (typeof license !== 'string' || !LICENSES.has(license)) fail(RigClipErrorCode.License, String(license));
  const url = text(source['url'], 'source.url'); const sha256 = text(source['sha256'], 'source.sha256');
  if (!/^https?:\/\//.test(url) || !SHA256.test(sha256)) fail(RigClipErrorCode.Field, 'source');
  return { pack, animation, license, url, sha256 };
}

function validateEvents(value: unknown, frameCount: number): readonly RigClipEvent[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 2) fail(RigClipErrorCode.Event, 'count');
  const result: RigClipEvent[] = []; const seen = new Set<string>(); let ends = 0; let hits = 0;
  for (const item of value) {
    const event = object(item, 'events[]'); exact(event, ['frame', 'type'], 'events[]');
    const frame = integer(event['frame'], 'events[].frame', 0, frameCount - 1); const type = event['type'];
    if (type !== 'hit' && type !== 'end') fail(RigClipErrorCode.Event, 'type');
    const key = `${frame}:${type}`; if (seen.has(key)) fail(RigClipErrorCode.Event, 'duplicate'); seen.add(key);
    if (type === 'end') ends += 1; else hits += 1; result.push({ frame, type });
  }
  if (ends !== 1 || hits > 1) fail(RigClipErrorCode.Event, 'cardinality');
  return result.sort((left, right) => left.frame - right.frame);
}

function validateRestPose(value: unknown): Int32Array {
  const rest = object(value, 'restPose'); exact(rest, ['jointOrder', 'jointMm'], 'restPose');
  canonicalArray(rest['jointOrder'], CLIP_JOINTS, 'restPose.jointOrder');
  if (!Array.isArray(rest['jointMm']) || rest['jointMm'].length !== CLIP_JOINTS.length) fail(RigClipErrorCode.Field, 'restPose.jointMm');
  const output = new Int32Array(CLIP_JOINTS.length * 3);
  for (let joint = 0; joint < CLIP_JOINTS.length; joint += 1) {
    const point = rest['jointMm'][joint];
    if (!Array.isArray(point) || point.length !== 3) fail(RigClipErrorCode.Field, `restPose.jointMm[${joint}]`);
    for (let axis = 0; axis < 3; axis += 1) output[joint * 3 + axis] = integer(point[axis], `restPose.jointMm[${joint}]`, -2_147_483_648, 2_147_483_647);
  }
  return output;
}

export function loadRigClip(value: unknown): RigClip {
  const input = object(value, 'clip');
  exact(input, ['durationMs', 'events', 'fps', 'frameCount', 'id', 'importer', 'loop', 'mainHand',
    'nativeSpeedMmps', 'restPose', 'rootMotion', 'schema', 'skeleton', 'source', 'tracks',
    'unmappedSourceJoints', 'viewHints', 'weapon'], 'clip');
  if (input['schema'] !== 'tianshu-clip.v1') fail(RigClipErrorCode.Schema, 'schema');
  if (input['skeleton'] !== 'tianshu_humanoid.v1') fail(RigClipErrorCode.Skeleton, 'skeleton');
  const id = text(input['id'], 'id'); if (!ID.test(id)) fail(RigClipErrorCode.Field, 'id');
  const frameCount = integer(input['frameCount'], 'frameCount', 1);
  const fps = input['fps']; if (fps !== 12 && fps !== 30) fail(RigClipErrorCode.Field, 'fps');
  const durationMs = integer(input['durationMs'], 'durationMs', 0);
  if (typeof input['loop'] !== 'boolean' || input['rootMotion'] !== 'inPlace') fail(RigClipErrorCode.Field, 'playback');
  const mainHand = input['mainHand']; if (mainHand !== 'L' && mainHand !== 'R') fail(RigClipErrorCode.Field, 'mainHand');
  const nativeSpeedMmps = integer(input['nativeSpeedMmps'], 'nativeSpeedMmps', 0, 20_000);
  const importer = object(input['importer'], 'importer'); exact(importer, ['mapping', 'version'], 'importer');
  if (!VERSION.test(text(importer['version'], 'importer.version')) ||
      (importer['mapping'] !== 'ue66' && importer['mapping'] !== 'rigify53')) fail(RigClipErrorCode.Field, 'importer');
  if (!Array.isArray(input['unmappedSourceJoints']) ||
      new Set(input['unmappedSourceJoints']).size !== input['unmappedSourceJoints'].length ||
      input['unmappedSourceJoints'].some((item) => typeof item !== 'string')) fail(RigClipErrorCode.Field, 'unmappedSourceJoints');

  const hints = object(input['viewHints'], 'viewHints'); exact(hints, ['anatomicalSides', 'minForeshortenBp', 'nearSide', 'yawAssistMaxCdeg'], 'viewHints');
  const yawAssistMaxCdeg = integer(hints['yawAssistMaxCdeg'], 'viewHints.yawAssistMaxCdeg', 0, 3000);
  if (hints['minForeshortenBp'] !== 4500 || hints['nearSide'] !== 'L' || hints['anatomicalSides'] !== true) fail(RigClipErrorCode.Field, 'viewHints');
  const restJointMm = validateRestPose(input['restPose']);
  const tracks = object(input['tracks'], 'tracks');
  exact(tracks, ['bones', 'directionI16', 'encoding', 'facingYawCdegI16', 'lengthRatioU16', 'rootMmI16'], 'tracks');
  if (tracks['encoding'] !== 'base64-le') fail(RigClipErrorCode.Field, 'tracks.encoding');
  canonicalArray(tracks['bones'], CLIP_BONES, 'tracks.bones'); const boneValues = frameCount * CLIP_BONES.length;
  const directionI16 = decodeBase64(tracks['directionI16'], 'tracks.directionI16', boneValues * 3, true) as Int16Array;
  const lengthRatioU16 = decodeBase64(tracks['lengthRatioU16'], 'tracks.lengthRatioU16', boneValues, false) as Uint16Array;
  const rootMmI16 = decodeBase64(tracks['rootMmI16'], 'tracks.rootMmI16', frameCount * 3, true) as Int16Array;
  const yaw = object(tracks['facingYawCdegI16'], 'tracks.facingYawCdegI16'); exact(yaw, ['chest', 'head', 'pelvis'], 'tracks.facingYawCdegI16');
  const facingYawCdegI16 = new Int16Array(frameCount * 3);
  for (const [track, offset] of [['pelvis', 0], ['chest', 1], ['head', 2]] as const) {
    const decoded = decodeBase64(yaw[track], `tracks.facingYawCdegI16.${track}`, frameCount, true);
    for (let frame = 0; frame < frameCount; frame += 1) facingYawCdegI16[frame * 3 + offset] = decoded[frame]!;
  }
  const weapon = object(input['weapon'], 'weapon'); exact(weapon, ['gripJoint', 'hand', 'tipDirectionI16'], 'weapon');
  const weaponHand = weapon['hand']; const weaponGripJoint = weapon['gripJoint'];
  if ((weaponHand !== 'L' && weaponHand !== 'R') || weaponHand !== mainHand ||
      weaponGripJoint !== `grip_${weaponHand}`) fail(RigClipErrorCode.Field, 'weapon');
  const weaponTipDirectionI16 = decodeBase64(weapon['tipDirectionI16'], 'weapon.tipDirectionI16', frameCount * 3, true) as Int16Array;
  const clip: RigClip = { schema: 'tianshu-clip.v1', id, skeleton: 'tianshu_humanoid.v1', fps, frameCount, durationMs,
    loop: input['loop'], nativeSpeedMmps, mainHand, source: validateSource(input['source']), events: validateEvents(input['events'], frameCount),
    viewHints: { yawAssistMaxCdeg, minForeshortenBp: 4500, nearSide: 'L', anatomicalSides: true }, restJointMm,
    directionI16, lengthRatioU16, rootMmI16, facingYawCdegI16, weaponTipDirectionI16, weaponHand,
    weaponGripJoint: weaponGripJoint as 'grip_L' | 'grip_R' };
  validatedClips.add(clip); return clip;
}

export function registerRigClip(value: unknown): RigClip {
  const clip = isValidatedRigClip(value) ? value : loadRigClip(value);
  const previous = registry.get(clip.id);
  if (previous && previous !== clip) fail(RigClipErrorCode.DuplicateId, clip.id);
  registry.set(clip.id, clip); return clip;
}
export function getRigClip(id: string): RigClip | undefined { return registry.get(id); }
export function requireRigClip(id: string): RigClip { return registry.get(id) ?? fail(RigClipErrorCode.UnknownId, id); }
export function clearRigClipRegistry(): void { registry.clear(); }
function isValidatedRigClip(value: unknown): value is RigClip {
  return typeof value === 'object' && value !== null && validatedClips.has(value);
}
