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
interface AllocationDifference { readonly functionName: string; readonly bytes: number }
interface SteadyAllocationResult {
  readonly steady: boolean;
  readonly cleanWindows: readonly number[];
  readonly lastDirtyWindow: number | undefined;
  readonly lastDirtyDifferences: readonly AllocationDifference[];
}
const allocationWindowFrames = 600;
const maximumAllocationWindows = 10;
const requiredCleanAllocationWindows = 3;

function addSampledBytesByFunction(node: HeapSampleNode, result: Map<string, number>): void {
  const name = node.callFrame.functionName || '<anonymous>';
  result.set(name, (result.get(name) ?? 0) + node.selfSize);
  for (const child of node.children) addSampledBytesByFunction(child, result);
}
function sampledSubtreeBytesByFunction(
  node: HeapSampleNode, matches: (node: HeapSampleNode) => boolean,
): ReadonlyMap<string, number> {
  const result = new Map<string, number>();
  if (matches(node)) { addSampledBytesByFunction(node, result); return result; }
  for (const child of node.children) {
    const childResult = sampledSubtreeBytesByFunction(child, matches);
    for (const [name, bytes] of childResult) result.set(name, (result.get(name) ?? 0) + bytes);
  }
  return result;
}
function allocationDifferences(
  before: ReadonlyMap<string, number>, after: ReadonlyMap<string, number>,
): readonly AllocationDifference[] {
  const names = new Set([...before.keys(), ...after.keys()]);
  return [...names].map(functionName => ({
    functionName, bytes: (after.get(functionName) ?? 0) - (before.get(functionName) ?? 0),
  })).filter(value => value.bytes !== 0).sort((left, right) => right.bytes - left.bytes
    || left.functionName.localeCompare(right.functionName));
}
function totalSampledBytes(values: ReadonlyMap<string, number>): number {
  let total = 0;
  for (const bytes of values.values()) total += bytes;
  return total;
}
async function sampleUntilAllocationSteady(
  session: Session, runWindow: () => void, matches: (node: HeapSampleNode) => boolean,
): Promise<SteadyAllocationResult> {
  let previous = await session.post('HeapProfiler.getSamplingProfile');
  let cleanStreak: number[] = []; let lastDirtyWindow: number | undefined;
  let lastDirtyDifferences: readonly AllocationDifference[] = [];
  for (let window = 1; window <= maximumAllocationWindows; window += 1) {
    await Promise.resolve().then(runWindow);
    const current = await session.post('HeapProfiler.getSamplingProfile');
    const beforeBytes = sampledSubtreeBytesByFunction(previous.profile.head, matches);
    const afterBytes = sampledSubtreeBytesByFunction(current.profile.head, matches);
    const differences = allocationDifferences(beforeBytes, afterBytes);
    if (totalSampledBytes(afterBytes) === totalSampledBytes(beforeBytes)) {
      cleanStreak = [...cleanStreak, window];
      if (cleanStreak.length === requiredCleanAllocationWindows) {
        return { steady: true, cleanWindows: cleanStreak, lastDirtyWindow, lastDirtyDifferences };
      }
    } else {
      cleanStreak = []; lastDirtyWindow = window; lastDirtyDifferences = differences;
    }
    previous = current;
  }
  return { steady: false, cleanWindows: cleanStreak, lastDirtyWindow, lastDirtyDifferences };
}
function allocationFailure(result: SteadyAllocationResult): string {
  const detail = result.lastDirtyDifferences
    .map(value => `${value.functionName}=${value.bytes > 0 ? '+' : ''}${value.bytes} B`).join(', ');
  return `no ${requiredCleanAllocationWindows} consecutive clean windows within `
    + `${maximumAllocationWindows}; last dirty window ${result.lastDirtyWindow ?? 'none'}: ${detail || 'none'}`;
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
    regions: { ids: { torso: 0, handR: 1, head: 2 }, jointToRegion: {}, file: 'r' },
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
      loader: fakeLoader({ body: body.gltf, prop: prop.gltf, 'head.glb': prop.gltf }) });
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
      loader: fakeLoader({ body: body.gltf, prop: prop.gltf, 'head.glb': prop.gltf }) });
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
      loader: fakeLoader({ body: body.gltf, prop: prop.gltf, 'head.glb': prop.gltf }) });
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
      loader: fakeLoader({ body: body.gltf, prop: prop.gltf, 'head.glb': prop.gltf }) });
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
    const steady = await sampleUntilAllocationSteady(session, () => {
      for (let index = 0; index < allocationWindowFrames; index += 1) actor.update(1 / 60);
    }, node => node.callFrame.functionName === 'update'
      && node.callFrame.url.includes('/dressup/actor.ts'));
    const after = await session.post('HeapProfiler.getSamplingProfile');
    await session.post('HeapProfiler.stopSampling'); session.disconnect();
    expect(sampledBytes(after.profile.head,
      node => node.callFrame.functionName === 'shortLivedAllocationProbe'))
      .toBeGreaterThan(0);
    process.stdout.write(`actor allocation clean windows: ${steady.cleanWindows.join(',')}\n`);
    expect(steady.steady, allocationFailure(steady)).toBe(true);
    expect(actor.root).toBe(root); expect(actor.skeleton).toBe(skeleton); expect(actor.stats()).toBe(stats);
    expect(skeleton.boneMatrices).toBe(matrices); expect(root.getObjectByName('dressupSocket:gripR')).toBe(socket);
    expect(stats.boneTextureUploads).toBe(1);
    actor.dispose(); expect(stats).toEqual({ drawCalls: 0, triangles: 0, boneTextureUploads: 0,
      bodyLayers: [], hideMaps: [], layerTextureBytes: 0 });
  });

  it('rejects an update that allocates and retains a typed array every frame', async () => {
    const retained: Float32Array[] = [];
    function fakeUpdate(): void { retained.push(new Float32Array(4)); }
    const session = new Session(); session.connect();
    await session.post('HeapProfiler.enable');
    await session.post('HeapProfiler.startSampling', { samplingInterval: 1 });
    await session.post('HeapProfiler.collectGarbage');
    const steady = await sampleUntilAllocationSteady(session, function allocatingUpdateWindow() {
      for (let index = 0; index < allocationWindowFrames; index += 1) fakeUpdate();
    }, node => node.callFrame.functionName === 'allocatingUpdateWindow'
      && node.callFrame.url.includes('/dressup/actor-runtime.test.ts'));
    await session.post('HeapProfiler.stopSampling'); session.disconnect();
    process.stdout.write(`fake update last dirty: ${steady.lastDirtyWindow}; `
      + `${steady.lastDirtyDifferences.map(value => `${value.functionName}:${value.bytes}`).join(',')}\n`);
    expect(retained).toHaveLength(allocationWindowFrames * maximumAllocationWindows);
    expect(steady.steady).toBe(false);
    expect(steady.cleanWindows).toEqual([]);
    expect(steady.lastDirtyWindow).toBe(maximumAllocationWindows);
    expect(steady.lastDirtyDifferences.some(value => value.bytes > 0)).toBe(true);
  }, 15_000);

  it('overrides the equipped hand finger pose after the mixer update', async () => {
    const body = bodyGltf(); const prop = propGltf();
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(fixtureFrame()))));
    const actor = await createDressupActor({ bodyUrl: 'body', frameUrl: 'frame', heightM: 1,
      loader: fakeLoader({ body: body.gltf, prop: prop.gltf, 'head.glb': prop.gltf }) });
    await actor.equip({ kind: 'prop', id: 'sword', url: 'prop', fit: {
      schema: 'tianshu-dressup-fit.v1', kind: 'prop', id: 'sword', socket: 'gripR',
    } });
    actor.playClip('idle', 0); actor.update(.25);
    const finger = actor.skeleton.getBoneByName('RightHandIndex1')!;
    expect(finger.quaternion.toArray()).toEqual([0, 0, .70710678, .70710678]);
    actor.dispose();
  });

  it('binds one head to the shared skeleton, multiplies body tint, and supports detached setHead', async () => {
    const body = bodyGltf(); const first = bodyGltf(); const second = bodyGltf();
    first.mesh.name = 'firstHead'; second.mesh.name = 'secondHead';
    const bind = new Matrix4().makeTranslation(0, .25, 0);
    first.mesh.bindMatrix.copy(bind);
    const disposed = vi.spyOn(first.mesh.geometry, 'dispose');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(fixtureFrame()))));
    const actor = await createDressupActor({ bodyUrl: 'body', frameUrl: 'frame', heightM: 1,
      loader: fakeLoader({ body: body.gltf, first: first.gltf, second: second.gltf }) });
    const inverses = actor.skeleton.boneInverses.map(matrix => matrix.toArray());
    const material = (actor.root.getObjectByName('body') as SkinnedMesh).material as MeshBasicMaterial;
    const original = material.color.clone();
    await actor.equip({ kind: 'head', id: 'npc_first', url: 'first', fit: {
      schema: 'tianshu-dressup-fit.v1', kind: 'head', id: 'npc_first',
      hideRegions: ['head'], neverHide: ['handR'], skinTint: [.6, .7, .8],
    } });
    expect(first.mesh.skeleton).toBe(actor.skeleton); expect(first.mesh.bindMatrix.equals(bind)).toBe(true);
    expect(actor.skeleton.boneInverses.map(matrix => matrix.toArray())).toEqual(inverses);
    expect(material.color.toArray()).toEqual([original.r * .6, original.g * .7, original.b * .8]);
    const shader = { uniforms: {} as Record<string, { value: unknown }>,
      vertexShader: '#include <common>\n#include <begin_vertex>',
      fragmentShader: '#include <common>\n#include <alphatest_fragment>' };
    material.onBeforeCompile(shader as never, {} as never);
    expect(shader.uniforms['uHideMask']!.value).toBe(4);
    const { setHead } = actor;
    await setHead('second', { skinTint: '#cca080' });
    expect(actor.root.getObjectByName('firstHead')).toBeUndefined();
    expect(second.mesh.skeleton).toBe(actor.skeleton); expect(disposed).toHaveBeenCalledOnce();
    expect(actor.stats().drawCalls).toBe(2);
    await setHead(null);
    expect(material.color.equals(original)).toBe(true); expect(shader.uniforms['uHideMask']!.value).toBe(0);
    expect(actor.stats().drawCalls).toBe(1); actor.dispose();
  });
});
