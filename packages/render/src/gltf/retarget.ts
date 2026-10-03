import { Matrix4, Quaternion, Vector3, type Object3D } from 'three';
import type { RigClip, RigClipEventType } from '../rig/clip';
import { CLIP_BONES } from '../rig/clip';
import { createClipPlayer, type ClipPlayer } from '../rig/clip-player';
import { PILOT_AIM_BONES, detectPilotSkeleton, indexPilotNodes, type PilotSkeletonKind } from './mapping';

export interface PilotRetargetOptions {
  readonly rate?: number; readonly speedMps?: number; readonly onEvent?: (event: RigClipEventType) => void;
}
export interface PilotRetargeter {
  readonly kind: PilotSkeletonKind; readonly player: ClipPlayer; readonly mappedBones: readonly string[];
  readonly maxDirectionErrorDeg: number; update(dtSeconds: number): void; setFacingYawDeg(value: number): void; stop(): void; dispose(): void;
}
export interface PilotAimBinding {
  readonly track: number; readonly name: string; readonly driver: Object3D; readonly start: Object3D; readonly end: Object3D;
  readonly restLocal: Quaternion; readonly restDirectionParent: Vector3;
}

const parentInverse = new Matrix4(); const parentWorld = new Quaternion();
const worldStart = new Vector3(); const worldEnd = new Vector3(); const desiredWorld = new Vector3(); const clipWorld = new Vector3();
const desiredParent = new Vector3(); const currentParent = new Vector3(); const delta = new Quaternion(); const startParent = new Vector3(); const endParent = new Vector3();
const targetRotation = new Quaternion();

function first(nodes: ReadonlyMap<string, Object3D>, names: readonly string[]): Object3D | undefined {
  for (const name of names) { const node = nodes.get(name); if (node) return node; } return undefined;
}
function trackIndex(name: string): number { return CLIP_BONES.indexOf(name as (typeof CLIP_BONES)[number]); }
function clipDirection(clip: RigClip, frame: number, track: number, target: Vector3): Vector3 {
  const offset = (frame * CLIP_BONES.length + track) * 3;
  return target.set(clip.directionI16[offset] ?? 0, clip.directionI16[offset + 1] ?? 0, clip.directionI16[offset + 2] ?? 0).normalize();
}

export function aimBoneInParentSpace(binding: PilotAimBinding, targetWorldDirection: Vector3, blend = 1): number {
  const parent = binding.driver.parent; if (!parent) return 180;
  parent.getWorldQuaternion(parentWorld); desiredParent.copy(targetWorldDirection).applyQuaternion(parentWorld.invert()).normalize();
  currentParent.copy(binding.restDirectionParent).applyQuaternion(binding.restLocal).normalize();
  if (currentParent.lengthSq() < 1e-12 || desiredParent.lengthSq() < 1e-12) return 180;
  delta.setFromUnitVectors(currentParent, desiredParent); targetRotation.copy(delta).multiply(binding.restLocal);
  binding.driver.quaternion.copy(binding.restLocal).slerp(targetRotation, Math.min(1, Math.max(0, blend)));
  binding.driver.updateMatrixWorld(true); binding.start.getWorldPosition(worldStart); binding.end.getWorldPosition(worldEnd);
  currentParent.copy(worldEnd).sub(worldStart).normalize();
  return Math.acos(Math.min(1, Math.max(-1, currentParent.dot(targetWorldDirection)))) * 180 / Math.PI;
}

function bindings(root: Object3D, kind: PilotSkeletonKind): PilotAimBinding[] {
  const nodes = indexPilotNodes(root); const result: PilotAimBinding[] = []; root.updateMatrixWorld(true);
  for (const [name, names] of Object.entries(PILOT_AIM_BONES[kind])) {
    const driver = first(nodes, names.driver); const start = names.start ? first(nodes, names.start) : driver;
    const end = first(nodes, names.end); const track = trackIndex(name);
    if (!driver || !start || !end || !driver.parent || track < 0) continue;
    driver.parent.updateMatrixWorld(true); start.getWorldPosition(worldStart); end.getWorldPosition(worldEnd);
    parentInverse.copy(driver.parent.matrixWorld).invert();
    startParent.copy(worldStart).applyMatrix4(parentInverse); endParent.copy(worldEnd).applyMatrix4(parentInverse);
    const restLocal = driver.quaternion.clone();
    delta.copy(restLocal).invert(); const restDirectionParent = endParent.sub(startParent).applyQuaternion(delta).normalize().clone();
    result.push({ track, name, driver, start, end, restLocal, restDirectionParent });
  }
  return result;
}

export function createPilotRetargeter(root: Object3D, clip: RigClip, options: PilotRetargetOptions = {}): PilotRetargeter {
  const nodes = indexPilotNodes(root); const kind = detectPilotSkeleton(nodes);
  if (!kind) throw new Error('PILOT_RETARGET_SKELETON_UNMAPPED');
  const mapped = bindings(root, kind); if (mapped.length < 10) throw new Error(`PILOT_RETARGET_BONES:${mapped.length}`);
  const player = createClipPlayer(clip, { facingYawDeg: 180, movement: clip.nativeSpeedMmps > 0,
    speedMps: options.speedMps ?? clip.nativeSpeedMmps / 1_000,
    ...(options.rate === undefined ? {} : { rate: options.rate }),
    ...(options.onEvent === undefined ? {} : { onEvent: options.onEvent }) });
  let maxDirectionErrorDeg = 0; let disposed = false; let activeBlend = -1;
  let previousFrame = -1; let previousBlend = -1;
  const targetDirection = (binding: PilotAimBinding): Vector3 => {
    const raw = clipDirection(clip, player.frame, binding.track, clipWorld); const yaw = player.facingYawDeg * Math.PI / 180;
    return desiredWorld.set(raw.x * Math.cos(yaw) + raw.z * Math.sin(yaw), raw.y, -raw.x * Math.sin(yaw) + raw.z * Math.cos(yaw)).normalize();
  };
  const apply = (): void => {
    if (player.frame === previousFrame && player.blend === previousBlend) return;
    previousFrame = player.frame; previousBlend = player.blend; maxDirectionErrorDeg = 0;
    activeBlend = player.blend;
    for (const binding of mapped) maxDirectionErrorDeg = Math.max(
      maxDirectionErrorDeg, aimBoneInParentSpace(binding, targetDirection(binding), activeBlend),
    );
  };
  apply();
  return {
    kind, player, mappedBones: mapped.map(binding => binding.name), get maxDirectionErrorDeg() { return maxDirectionErrorDeg; },
    update(dtSeconds) { if (!disposed) { player.update(dtSeconds); apply(); } },
    setFacingYawDeg(value) { player.setFacingYawDeg(value + 180); previousFrame = -1; apply(); }, stop: () => player.stop(),
    dispose() { if (disposed) return; disposed = true; for (const binding of mapped) binding.driver.quaternion.copy(binding.restLocal); root.updateMatrixWorld(true); },
  };
}
