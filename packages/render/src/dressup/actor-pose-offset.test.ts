import { Session } from 'node:inspector/promises';
import {
  AnimationClip, Bone, BufferGeometry, Float32BufferAttribute, Group, Matrix4, MeshBasicMaterial,
  Object3D, Quaternion, QuaternionKeyframeTrack, Skeleton, SkinnedMesh, Uint16BufferAttribute, Vector3,
} from 'three';
import type { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDressupActor } from './actor';
import { clearDressupSkeletonFrameCache } from './skeleton-frame';
import type { DressupActor, DressupEquipSpec, DressupSkeletonFrame } from './types';

const JOINTS = ['Hips', 'Spine', 'LeftShoulder', 'LeftArm', 'LeftForeArm',
  'RightShoulder', 'RightArm', 'RightForeArm'] as const;

function fixtureFrame(joints: readonly string[] = JOINTS): DressupSkeletonFrame {
  return {
    schema: 'tianshu-dressup-skeleton.v1', source: { file: 'body.glb', sha256: 'x' }, unit: 'mu',
    heightMu: 1, defaultHeightM: 1.65, mPerMu: 1.65,
    joints: joints.map(name => `mixamorig:${name}`), parents: joints.map(() => -1),
    bindWorld: {}, restPose: { armAngleDeg: 25, forearmAngleDeg: 25 },
    measures: { headWidthMu: .1, headDepthMu: .1, headCircumferenceMu: .3,
      headTopMu: [0, 1, 0], shoulderSkinWidthMu: .2, chestWidthMu: .2, waistWidthMu: .15,
      hipWidthMu: .18, handLengthMu: { L: .1, R: .1 }, handThicknessMu: { L: .02, R: .02 },
      footLengthMu: .12 }, neckRing: { localYMu: 0, centerMu: [0, 0, 0],
      radiusMu: { x: .03, z: .03 }, samples: 0, profile: [], lipOffsetMu: 0, sha256: 'r' },
    skullProfile: { file: 's', stepMu: .005, sha256: 's' }, sockets: {},
    regions: { ids: { torso: 0, head: 1 }, jointToRegion: {}, file: 'r' }, fingerPose: { fist: {} },
  };
}

/** A tilted armature → hips → spine → shoulder → arm → forearm chain, so the abduction axis must be
 *  carried through non-trivial parent rotations; the idle clip animates spine and both arms. */
function rigGltf(name: string): GLTF {
  const bones = new Map<string, Bone>();
  for (const joint of JOINTS) { const bone = new Bone(); bone.name = `mixamorig${joint}`; bones.set(joint, bone); }
  const at = (joint: string): Bone => bones.get(joint)!;
  const armature = new Object3D(); armature.name = 'Armature'; armature.rotation.set(.3, .5, 0);
  armature.add(at('Hips')); at('Hips').position.set(0, .9, 0); at('Hips').rotation.set(.2, 0, .1);
  at('Hips').add(at('Spine')); at('Spine').position.set(0, .2, 0);
  for (const [side, x] of [['Left', 1], ['Right', -1]] as const) {
    at('Spine').add(at(`${side}Shoulder`)); at(`${side}Shoulder`).position.set(.06 * x, .25, 0);
    at(`${side}Shoulder`).add(at(`${side}Arm`)); at(`${side}Arm`).position.set(.08 * x, 0, 0);
    at(`${side}Arm`).add(at(`${side}ForeArm`)); at(`${side}ForeArm`).position.set(0, -.25, 0);
  }
  armature.updateMatrixWorld(true);
  const ordered = JOINTS.map(at);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0], 3));
  geometry.setAttribute('skinIndex', new Uint16BufferAttribute([0, 0, 0, 0, 3, 0, 0, 0, 6, 0, 0, 0], 4));
  geometry.setAttribute('skinWeight', new Float32BufferAttribute([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], 4));
  geometry.setAttribute('_region', new Float32BufferAttribute([0, 0, 0], 1));
  const mesh = new SkinnedMesh(geometry, new MeshBasicMaterial()); mesh.name = name;
  mesh.bind(new Skeleton(ordered, ordered.map(bone => bone.matrixWorld.clone().invert())), new Matrix4());
  const scene = new Group(); scene.add(armature, mesh);
  const turn = (axis: Vector3, angle: number): number[] => new Quaternion().setFromAxisAngle(axis, angle).toArray();
  const clip = new AnimationClip('idle', 1, [
    new QuaternionKeyframeTrack('mixamorigSpine.quaternion', [0, 1],
      [...turn(new Vector3(0, 1, 0), 0), ...turn(new Vector3(0, 1, 0), .6)]),
    new QuaternionKeyframeTrack('mixamorigLeftArm.quaternion', [0, 1],
      [...turn(new Vector3(1, 0, 0), -.4), ...turn(new Vector3(1, 0, 0), .5)]),
    new QuaternionKeyframeTrack('mixamorigRightArm.quaternion', [0, 1],
      [...turn(new Vector3(1, 0, 0), .4), ...turn(new Vector3(1, 0, 0), -.5)]),
  ]);
  return { scene, scenes: [scene], animations: [clip], cameras: [], asset: {} } as unknown as GLTF;
}

function fakeLoader(values: Readonly<Record<string, GLTF>>): GLTFLoader {
  return { loadAsync: vi.fn(async (url: string) => values[url]!) } as unknown as GLTFLoader;
}

function garment(id: string, poseOffset?: unknown, kind: DressupEquipSpec['kind'] = 'garment'): DressupEquipSpec {
  return { kind, id, url: id, fit: {
    schema: 'tianshu-dressup-fit.v1', kind, id, ...(poseOffset === undefined ? {} : { poseOffset }),
  } as DressupEquipSpec['fit'] };
}

async function createActor(frame = fixtureFrame()): Promise<DressupActor> {
  clearDressupSkeletonFrameCache();
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(frame))));
  return createDressupActor({ bodyUrl: 'body', frameUrl: 'frame', heightM: 1.7,
    loader: fakeLoader({ body: rigGltf('body'), coat: rigGltf('coat'), robe: rigGltf('robe'),
      head: rigGltf('head'), bad: rigGltf('bad') }) });
}

/** Model-space (glTF scene space) world matrices: the space validate.py samples in. */
function modelMatrices(actor: DressupActor): Map<string, Matrix4> {
  const hips = actor.skeleton.getBoneByName('mixamorigHips')!;
  const modelRoot = hips.parent!.parent!;
  actor.root.updateMatrixWorld(true);
  const inverse = modelRoot.matrixWorld.clone().invert();
  return new Map(JOINTS.map(joint => [joint,
    inverse.clone().multiply(actor.skeleton.getBoneByName(`mixamorig${joint}`)!.matrixWorld)]));
}

/** validate.apply_arm_abduction: T(p) · Rz(±θ) · T(−p) about the animated shoulder pivot p. */
function abducted(matrix: Matrix4, pivot: Vector3, degrees: number): Matrix4 {
  return new Matrix4().makeTranslation(pivot.x, pivot.y, pivot.z)
    .multiply(new Matrix4().makeRotationZ(degrees * Math.PI / 180))
    .multiply(new Matrix4().makeTranslation(-pivot.x, -pivot.y, -pivot.z)).multiply(matrix);
}

function expectMatrixClose(actual: Matrix4, expected: Matrix4): void {
  actual.elements.forEach((value, index) => expect(value).toBeCloseTo(expected.elements[index]!, 6));
}

afterEach(() => { clearDressupSkeletonFrameCache(); vi.unstubAllGlobals(); });

describe('dressup garment poseOffset (arm abduction)', () => {
  it('turns both arm subtrees outward about model +Z at the shoulder pivot after the mixer update', async () => {
    const actor = await createActor();
    actor.playClip('idle', 0); actor.update(.3);
    const before = modelMatrices(actor);
    await actor.equip(garment('coat', { armAbductionDeg: 4 }));
    await actor.equip(garment('robe', { armAbductionDeg: 6 }));
    await actor.equip(garment('head', { armAbductionDeg: 15 }, 'head'));
    expect(actor.stats().armAbductionDeg).toBe(6);
    actor.update(0);
    const after = modelMatrices(actor);
    for (const [side, sign] of [['Left', 1], ['Right', -1]] as const) {
      const pivot = new Vector3().setFromMatrixPosition(before.get(`${side}Arm`)!);
      for (const joint of [`${side}Arm`, `${side}ForeArm`]) {
        expectMatrixClose(after.get(joint)!, abducted(before.get(joint)!, pivot, sign * 6));
      }
      const hand = new Vector3().setFromMatrixPosition(after.get(`${side}ForeArm`)!);
      const rest = new Vector3().setFromMatrixPosition(before.get(`${side}ForeArm`)!);
      expect(Math.abs(hand.x)).toBeGreaterThan(Math.abs(rest.x));
    }
    for (const joint of ['Hips', 'Spine', 'LeftShoulder', 'RightShoulder']) {
      expectMatrixClose(after.get(joint)!, before.get(joint)!);
    }
    actor.unequip('robe'); expect(actor.stats().armAbductionDeg).toBe(4);
    actor.unequip('coat'); expect(actor.stats().armAbductionDeg).toBeUndefined();
    actor.update(0);
    const restored = modelMatrices(actor);
    for (const joint of JOINTS) expectMatrixClose(restored.get(joint)!, before.get(joint)!);
    actor.dispose();
  });

  it('never accumulates on frames without a mixer write and restores the rest pose on unequip', async () => {
    const actor = await createActor();
    const arm = actor.skeleton.getBoneByName('mixamorigLeftArm')!;
    const rest = arm.quaternion.clone();
    await actor.equip(garment('robe', { armAbductionDeg: 6 }));
    actor.update(1 / 60); const first = arm.quaternion.clone();
    for (let index = 0; index < 120; index += 1) actor.update(1 / 60);
    expect(arm.quaternion.equals(first)).toBe(true);
    expect(arm.quaternion.angleTo(rest)).toBeCloseTo(6 * Math.PI / 180, 6);
    actor.unequip('robe'); actor.update(1 / 60);
    expect(arm.quaternion.equals(rest)).toBe(true);
    actor.dispose(); expect(actor.stats().armAbductionDeg).toBeUndefined();
  });

  it('rejects declarations outside 0..20 degrees and missing arm bones; ignores heads and absent fields', async () => {
    const actor = await createActor();
    for (const value of [-1, 20.5, Number.NaN, '6']) {
      await expect(actor.equip(garment('bad', { armAbductionDeg: value }))).rejects
        .toThrow('DRESSUP_POSE_OFFSET_RANGE:bad');
    }
    await actor.equip(garment('coat', {}));
    await actor.equip(garment('head', { armAbductionDeg: 99 }, 'head'));
    expect(actor.stats().armAbductionDeg).toBeUndefined();
    actor.dispose();
    const armless = await createActor(fixtureFrame(JOINTS.filter(joint => !joint.endsWith('Arm'))));
    await expect(armless.equip(garment('robe', { armAbductionDeg: 6 }))).rejects.toThrow('DRESSUP_BONE_UNKNOWN');
    await armless.equip(garment('coat', { armAbductionDeg: 0 }));
    armless.dispose();
  });

  it('keeps the steady update allocation-free while the abduction is active', async () => {
    const actor = await createActor();
    await actor.equip(garment('robe', { armAbductionDeg: 6 }));
    actor.playClip('idle', 0);
    for (let index = 0; index < 5_000; index += 1) actor.update(1 / 60);
    const session = new Session(); session.connect();
    await session.post('HeapProfiler.enable');
    // Count objects the GC already reclaimed too: a per-frame temporary is exactly what must not appear.
    await session.post('HeapProfiler.startSampling', { samplingInterval: 64,
      includeObjectsCollectedByMajorGC: true, includeObjectsCollectedByMinorGC: true });
    await session.post('HeapProfiler.collectGarbage');
    const windows: number[] = []; let cleanStreak = 0;
    let previous = await session.post('HeapProfiler.getSamplingProfile');
    // Same steady-state criterion as actor-runtime.test.ts: a one-off JIT transition right after sampling starts
    // may show up in the first window under load, so require 3 consecutive clean windows within 10.
    for (let window = 0; window < 10 && cleanStreak < 3; window += 1) {
      for (let index = 0; index < 600; index += 1) actor.update(1 / 60);
      const current = await session.post('HeapProfiler.getSamplingProfile');
      const bytes = abductionBytes(current.profile.head) - abductionBytes(previous.profile.head);
      windows.push(bytes); cleanStreak = bytes === 0 ? cleanStreak + 1 : 0;
      previous = current;
    }
    await session.post('HeapProfiler.stopSampling'); session.disconnect();
    // three's mixer / matrix update allocate on their own (pre-existing); the abduction pass must add nothing.
    expect(cleanStreak, `sampled abduction bytes per window: ${windows.join(',')}`).toBe(3);
    actor.dispose();
  }, 20_000);
});

interface HeapSampleNode {
  readonly selfSize: number;
  readonly callFrame: { readonly functionName: string; readonly url: string };
  readonly children: readonly HeapSampleNode[];
}
/** Bytes sampled (live or already collected) inside the actor.ts abduction pass and its callees. */
function abductionBytes(node: HeapSampleNode, inside = false): number {
  const entering = inside || (node.callFrame.functionName === 'apply'
    && node.callFrame.url.includes('/dressup/actor.ts'));
  let total = entering ? node.selfSize : 0;
  for (const child of node.children) total += abductionBytes(child, entering);
  return total;
}
