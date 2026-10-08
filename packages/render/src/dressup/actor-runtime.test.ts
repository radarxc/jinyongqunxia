import { Session } from 'node:inspector/promises';
import {
  AnimationClip, Bone, BufferGeometry, Float32BufferAttribute, Group, Matrix4,
  Mesh, MeshBasicMaterial, MeshStandardMaterial, NumberKeyframeTrack, QuaternionKeyframeTrack,
  Skeleton, SkinnedMesh, Texture, Uint16BufferAttribute,
} from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDressupActor } from './actor';
import { clearDressupSkeletonFrameCache } from './skeleton-frame';
import type { DressupSkeletonFrame } from './types';

interface HeapSampleNode {
  readonly selfSize: number;
  readonly callFrame: { readonly functionName: string; readonly url: string };
  readonly children: readonly HeapSampleNode[];
}
function sampledBytes(node: HeapSampleNode, matches: (node: HeapSampleNode) => boolean): number {
  let total = matches(node) ? node.selfSize : 0;
  for (const child of node.children) total += sampledBytes(child, matches);
  return total;
}
function sampledSubtreeBytes(
  node: HeapSampleNode, matches: (node: HeapSampleNode) => boolean,
): number {
  if (matches(node)) return sampledBytes(node, () => true);
  let total = 0;
  for (const child of node.children) total += sampledSubtreeBytes(child, matches);
  return total;
}
function shortLivedAllocationProbe(): number {
  const values: object[] = [];
  for (let index = 0; index < 10_000; index += 1) {
    values.push({ index, payload: new Uint8Array(16) });
  }
  return values.length;
}

function fixtureFrame(): DressupSkeletonFrame {
  return {
    schema: 'tianshu-dressup-skeleton.v1', source: { file: 'body.glb', sha256: 'x' }, unit: 'mu',
    heightMu: 1, defaultHeightM: 1.65, mPerMu: 1.65,
    joints: ['hip', 'hand', 'RightHandIndex1'], parents: [-1, 0, 1],
    bindWorld: { hip: new Array(16).fill(0), hand: new Array(16).fill(0),
      RightHandIndex1: new Array(16).fill(0) },
    restPose: { armAngleDeg: 25, forearmAngleDeg: 25 },
    measures: { headWidthMu: .1, headDepthMu: .1, headCircumferenceMu: .3,
      headTopMu: [0, 1, 0], shoulderSkinWidthMu: .2, chestWidthMu: .2, waistWidthMu: .15,
      hipWidthMu: .18, handLengthMu: { L: .1, R: .1 }, handThicknessMu: { L: .02, R: .02 },
      footLengthMu: .12 }, neckRing: { localYMu: 0, centerMu: [0, 0, 0],
      radiusMu: { x: .03, z: .03 }, samples: 0, profile: [], lipOffsetMu: 0, sha256: 'r' },
    skullProfile: { file: 's', stepMu: .005, sha256: 's' },
    sockets: { gripR: { bone: 'hand', pos: [.1, .2, .3], quat: [0, 0, 0, 1] } },
    regions: { ids: { torso: 0, handR: 1 }, jointToRegion: {}, file: 'r' },
    fingerPose: { fist: { RightHandIndex1: [0, 0, .70710678, .70710678] } },
  };
}
function bodyGltf(): { gltf: GLTF; mesh: SkinnedMesh; hip: Bone; hand: Bone } {
  const hip = new Bone(); hip.name = 'hip'; const hand = new Bone(); hand.name = 'hand';
  const finger = new Bone(); finger.name = 'RightHandIndex1';
  hand.position.set(0, 1, 0); hand.add(finger); hip.add(hand); hip.updateMatrixWorld(true);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0], 3));
  geometry.setAttribute('skinIndex', new Uint16BufferAttribute([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 4));
  geometry.setAttribute('skinWeight', new Float32BufferAttribute([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], 4));
  geometry.setAttribute('_region', new Float32BufferAttribute([0, 0, 0], 1));
  const mesh = new SkinnedMesh(geometry, new MeshBasicMaterial());
  mesh.name = 'body'; mesh.bind(new Skeleton([hip, hand, finger],
    [new Matrix4(), new Matrix4(), new Matrix4()]), new Matrix4());
  const scene = new Group(); scene.add(hip, mesh);
  const clip = new AnimationClip('idle', 1, [
    new NumberKeyframeTrack('.position[x]', [0, 1], [0, 0]),
    new QuaternionKeyframeTrack('RightHandIndex1.quaternion', [0, 1], [0, 0, 0, 1, 0, 0, 0, 1]),
  ]);
  return { gltf: { scene, scenes: [scene], animations: [clip], cameras: [], asset: {} } as unknown as GLTF,
    mesh, hip, hand };
}
function propGltf(): { gltf: GLTF; mesh: Mesh } {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0], 3));
  const mesh = new Mesh(geometry, new MeshBasicMaterial()); const scene = new Group(); scene.add(mesh);
  return { gltf: { scene, scenes: [scene], animations: [], cameras: [], asset: {} } as unknown as GLTF, mesh };
}
function fakeLoader(values: Readonly<Record<string, GLTF>>): GLTFLoader {
  return { loadAsync: vi.fn(async (url: string) => values[url]!) } as unknown as GLTFLoader;
}
afterEach(() => { clearDressupSkeletonFrameCache(); vi.unstubAllGlobals(); });

describe('dressup actor runtime', () => {
  it('attaches a prop as bone world * socket local * grip adjustment after animation', async () => {
    const body = bodyGltf(); const prop = propGltf();
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(fixtureFrame()))));
    const actor = await createDressupActor({ bodyUrl: 'body', frameUrl: 'frame', heightM: 1,
      loader: fakeLoader({ body: body.gltf, prop: prop.gltf }) });
    await actor.equip({ kind: 'prop', id: 'sword', url: 'prop', fit: {
      schema: 'tianshu-dressup-fit.v1', kind: 'prop', id: 'sword', socket: 'gripR',
      gripAdjust: { pos: [0, .5, 0], quat: [0, 0, 0, 1] },
    } });
    const hand = actor.skeleton.getBoneByName('hand')!; hand.rotation.z = .4; actor.update(1 / 60);
    const attached = actor.root.getObjectByName('dressupEquip:sword')!;
    const expected = hand.matrixWorld.clone().multiply(
      new Matrix4().makeTranslation(.1, .2, .3),
    ).multiply(new Matrix4().makeTranslation(0, .5, 0));
    attached.matrixWorld.elements.forEach((value, index) => {
      expect(value).toBeCloseTo(expected.elements[index]!, 6);
    });
    actor.dispose();
  });

  it('unions equipment masks, excludes every neverHide region, and restores on unequip', async () => {
    const body = bodyGltf(); const prop = propGltf();
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(fixtureFrame()))));
    const actor = await createDressupActor({ bodyUrl: 'body', frameUrl: 'frame', heightM: 1,
      loader: fakeLoader({ body: body.gltf, prop: prop.gltf }) });
    await actor.equip({ kind: 'prop', id: 'sword', url: 'prop', fit: {
      schema: 'tianshu-dressup-fit.v1', kind: 'prop', id: 'sword', socket: 'gripR',
      hideRegions: ['torso', 'handR'], neverHide: ['handR'],
    } });
    actor.setHideMask(['handR']);
    const material = (actor.root.getObjectByName('body') as SkinnedMesh).material as MeshBasicMaterial;
    const shader = { uniforms: {}, vertexShader: '#include <common>\n#include <begin_vertex>',
      fragmentShader: '#include <common>\n#include <alphatest_fragment>' };
    material.onBeforeCompile(shader as never, {} as never);
    expect((shader.uniforms as { uHideMask: { value: number } }).uHideMask.value).toBe(1);
    expect(actor.stats()).toMatchObject({ drawCalls: 2, triangles: 2, boneTextureUploads: 1 });
    actor.setHideMask(['handR']);
    expect(actor.stats()).toMatchObject({ drawCalls: 2, triangles: 2 });
    actor.unequip('sword');
    expect((shader.uniforms as { uHideMask: { value: number } }).uHideMask.value).toBe(2);
    expect(actor.stats()).toMatchObject({ drawCalls: 1, triangles: 1 });
    actor.dispose();
  });

  it('owns and disposes PBR textures discarded by unlit conversion exactly once', async () => {
    const body = bodyGltf(); const prop = propGltf();
    const bodyTextures = [new Texture(), new Texture(), new Texture(), new Texture()];
    const propTextures = [new Texture(), new Texture(), new Texture(), new Texture()];
    body.mesh.material = new MeshStandardMaterial({ map: bodyTextures[0]!, normalMap: bodyTextures[1]!,
      roughnessMap: bodyTextures[2]!, metalnessMap: bodyTextures[3]! });
    prop.mesh.material = new MeshStandardMaterial({ map: propTextures[0]!, normalMap: propTextures[1]!,
      roughnessMap: propTextures[2]!, metalnessMap: propTextures[3]! });
    const bodyDisposes = bodyTextures.map(texture => vi.spyOn(texture, 'dispose'));
    const propDisposes = propTextures.map(texture => vi.spyOn(texture, 'dispose'));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(fixtureFrame()))));
    const actor = await createDressupActor({ bodyUrl: 'body', frameUrl: 'frame', heightM: 1,
      loader: fakeLoader({ body: body.gltf, prop: prop.gltf }) });
    await actor.equip({ kind: 'prop', id: 'sword', url: 'prop', fit: {
      schema: 'tianshu-dressup-fit.v1', kind: 'prop', id: 'sword', socket: 'gripR',
    } });
    actor.unequip('sword');
    for (const dispose of propDisposes) expect(dispose).toHaveBeenCalledOnce();
    for (const dispose of bodyDisposes) expect(dispose).not.toHaveBeenCalled();
    actor.dispose();
    for (const dispose of bodyDisposes) expect(dispose).toHaveBeenCalledOnce();
    for (const dispose of propDisposes) expect(dispose).toHaveBeenCalledOnce();
  });

  it('scales child rest positions only, enforces 0.97..1.03, and never changes bone scale', async () => {
    const body = bodyGltf();
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(fixtureFrame()))));
    const actor = await createDressupActor({ bodyUrl: 'body', frameUrl: 'frame', heightM: 1,
      loader: fakeLoader({ body: body.gltf }) });
    const hand = actor.skeleton.getBoneByName('hand')!;
    actor.setBoneLength({ hand: 1.03 });
    expect(hand.position.y).toBeCloseTo(1.03, 8); expect(hand.scale.toArray()).toEqual([1, 1, 1]);
    expect(() => actor.setBoneLength({ hand: 1.031 })).toThrow('DRESSUP_BONE_LENGTH_RANGE');
    expect(() => actor.setBoneLength({ missing: 1 })).toThrow('DRESSUP_BONE_UNKNOWN');
    actor.update(0); expect(() => actor.setBoneLength({ hand: 1 })).toThrow('DRESSUP_BONE_LENGTH_LATE');
    actor.dispose();
  });

  it('samples no steady update allocations with animation, held fingers, and a socket', async () => {
    const body = bodyGltf(); const prop = propGltf();
    body.gltf.animations[0]!.duration = 10_000;
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(fixtureFrame()))));
    const actor = await createDressupActor({ bodyUrl: 'body', frameUrl: 'frame', heightM: 1,
      loader: fakeLoader({ body: body.gltf, prop: prop.gltf }) });
    await expect(actor.setHead('head.glb', { skinTint: '#cca080' })).resolves.toBeUndefined();
    await actor.equip({ kind: 'prop', id: 'sword', url: 'prop', fit: {
      schema: 'tianshu-dressup-fit.v1', kind: 'prop', id: 'sword', socket: 'gripR',
    } });
    actor.playClip('idle', 0);
    for (let index = 0; index < 10_000; index += 1) actor.update(1 / 60);
    const root = actor.root; const skeleton = actor.skeleton;
    const stats = actor.stats(); const matrices = skeleton.boneMatrices; const socket = root.getObjectByName('dressupSocket:gripR');
    const session = new Session(); session.connect();
    await session.post('HeapProfiler.enable');
    await session.post('HeapProfiler.startSampling', { samplingInterval: 1 });
    expect(shortLivedAllocationProbe()).toBe(10_000);
    await session.post('HeapProfiler.collectGarbage');
    for (let index = 0; index < 600; index += 1) actor.update(1 / 60);
    const before = await session.post('HeapProfiler.getSamplingProfile');
    for (let index = 0; index < 600; index += 1) actor.update(1 / 60);
    const after = await session.post('HeapProfiler.getSamplingProfile');
    await session.post('HeapProfiler.stopSampling'); session.disconnect();
    expect(sampledBytes(after.profile.head,
      node => node.callFrame.functionName === 'shortLivedAllocationProbe'))
      .toBeGreaterThan(0);
    const updateBytes = (profile: HeapSampleNode): number => sampledSubtreeBytes(profile,
      node => node.callFrame.functionName === 'update'
        && node.callFrame.url.includes('/dressup/actor.ts'));
    expect(updateBytes(after.profile.head)).toBe(updateBytes(before.profile.head));
    expect(actor.root).toBe(root); expect(actor.skeleton).toBe(skeleton); expect(actor.stats()).toBe(stats);
    expect(skeleton.boneMatrices).toBe(matrices); expect(root.getObjectByName('dressupSocket:gripR')).toBe(socket);
    expect(stats.boneTextureUploads).toBe(1);
    actor.dispose(); expect(stats).toEqual({ drawCalls: 0, triangles: 0, boneTextureUploads: 0,
      bodyLayers: [], layerTextureBytes: 0 });
  });

  it('overrides the equipped hand finger pose after the mixer update', async () => {
    const body = bodyGltf(); const prop = propGltf();
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(fixtureFrame()))));
    const actor = await createDressupActor({ bodyUrl: 'body', frameUrl: 'frame', heightM: 1,
      loader: fakeLoader({ body: body.gltf, prop: prop.gltf }) });
    await actor.equip({ kind: 'prop', id: 'sword', url: 'prop', fit: {
      schema: 'tianshu-dressup-fit.v1', kind: 'prop', id: 'sword', socket: 'gripR',
    } });
    actor.playClip('idle', 0); actor.update(.25);
    const finger = actor.skeleton.getBoneByName('RightHandIndex1')!;
    expect(finger.quaternion.toArray()).toEqual([0, 0, .70710678, .70710678]);
    actor.dispose();
  });
});
