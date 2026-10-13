import {
  AnimationClip, AnimationMixer, Bone, BufferGeometry, Float32BufferAttribute, Frustum, Group, Matrix4,
  Mesh, MeshBasicMaterial, NumberKeyframeTrack, OrthographicCamera, Quaternion,
  QuaternionKeyframeTrack, Skeleton, SkinnedMesh, Uint16BufferAttribute, Vector3,
  VectorKeyframeTrack,
} from 'three';
import type { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDressupActor } from './actor';
import { DressupCullingBounds } from './culling';
import { clearDressupSkeletonFrameCache } from './skeleton-frame';
import type { DressupSkeletonFrame } from './types';

type CullingCase = readonly [boneCount: number, values: readonly number[]];

function normalizedWeights(values: readonly number[], offset: number): number[] {
  const result = values.slice(offset, offset + 4).map(value => Math.max(0, value));
  const sum = result.reduce((total, value) => total + value, 0);
  if (sum === 0) result[0] = 1;
  else for (let index = 0; index < result.length; index += 1) result[index]! /= sum;
  return result;
}

/** 固定种子的 mulberry32：属性用例可复现、离线运行；仓库未声明 fast-check，本任务不加依赖（协调者裁定）。 */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** 1–4 骨 × 40 个 [-200, 200] 整数（÷100 后作平移、旋转角、顶点、权重、绑定矩阵与缩放），先列边界再随机。 */
function propertyCases(count: number, seed: number): CullingCase[] {
  const random = mulberry32(seed);
  const integer = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
  const edges: CullingCase[] = [
    [1, new Array<number>(40).fill(0)], [4, new Array<number>(40).fill(200)],
    [4, new Array<number>(40).fill(-200)], [2, Array.from({ length: 40 }, (_, index) => (index % 2 ? 200 : -200))],
  ];
  const randoms = Array.from({ length: count - edges.length }, (): CullingCase => [
    integer(1, 4), Array.from({ length: 40 }, () => integer(-200, 200)),
  ]);
  return [...edges, ...randoms];
}

function propertyScene(testCase: CullingCase): {
  root: Group; mesh: SkinnedMesh; clip: AnimationClip; times: readonly number[];
} {
  const [boneCount, encoded] = testCase;
  const values = encoded.map(value => value / 100);
  const root = new Group(); const bones: Bone[] = []; const tracks = [];
  for (let index = 0; index < boneCount; index += 1) {
    const bone = new Bone(); bone.name = `bone${index}`;
    bone.position.set(values[index]!, values[index + 4]!, values[index + 8]!);
    root.add(bone); bones.push(bone);
    const end = new Vector3(values[index + 12]!, values[index + 16]!, values[index + 20]!);
    tracks.push(new VectorKeyframeTrack(`${bone.name}.position`, [0, .5, 1], [
      bone.position.x, bone.position.y, bone.position.z, end.x, end.y, end.z,
      bone.position.x, bone.position.y, bone.position.z,
    ]));
    const angle = values[index + 24]!; const q = new Quaternion().setFromAxisAngle(
      new Vector3(1, 2, 3).normalize(), angle,
    );
    tracks.push(new QuaternionKeyframeTrack(`${bone.name}.quaternion`, [0, .5, 1], [
      0, 0, 0, 1, q.x, q.y, q.z, q.w, 0, 0, 0, 1,
    ]));
  }
  root.updateMatrixWorld(true);
  const inverses = bones.map(bone => bone.matrixWorld.clone().invert());
  const geometry = new BufferGeometry(); const positions: number[] = [];
  const indices: number[] = []; const weights: number[] = [];
  for (let vertex = 0; vertex < 4; vertex += 1) {
    positions.push(values[28 + vertex * 3]!, values[29 + vertex * 3]!, values[30 + vertex * 3]!);
    const skinWeights = normalizedWeights(values, vertex * 4);
    for (let item = 0; item < 4; item += 1) {
      indices.push(item % boneCount); weights.push(skinWeights[item]!);
    }
  }
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('skinIndex', new Uint16BufferAttribute(indices, 4));
  geometry.setAttribute('skinWeight', new Float32BufferAttribute(weights, 4));
  const mesh = new SkinnedMesh(geometry, new MeshBasicMaterial());
  const bindMatrix = new Matrix4().compose(
    new Vector3(.25 + Math.abs(values[1]!), values[2]!, values[3]!),
    new Quaternion().setFromAxisAngle(new Vector3(2, 1, 3).normalize(), .2 + Math.abs(values[4]!)),
    new Vector3(1, 1, 1),
  );
  mesh.bind(new Skeleton(bones, inverses), bindMatrix);
  root.add(mesh); root.scale.setScalar(1.25 + Math.abs(values[0]!));
  root.updateMatrixWorld(true);
  return { root, mesh, clip: new AnimationClip('random', 1, tracks),
    times: Array.from({ length: 25 }, (_, index) => index / 24) };
}

function sampleVertices(
  root: Group, mesh: SkinnedMesh, clip: AnimationClip, times: readonly number[],
): Vector3[] {
  const result: Vector3[] = []; const point = new Vector3();
  const mixer = new AnimationMixer(root); const action = mixer.clipAction(clip); action.play();
  for (const time of times) {
    action.time = time; mixer.update(0); root.updateMatrixWorld(true);
    const position = mesh.geometry.getAttribute('position');
    for (let index = 0; index < position.count; index += 1) {
      result.push(mesh.getVertexPosition(index, point).clone());
    }
  }
  action.stop(); mixer.stopAllAction(); mixer.uncacheRoot(root); root.updateMatrixWorld(true);
  return result;
}

function skinnedScene(): { root: Group; bone: Bone; mesh: SkinnedMesh; clip: AnimationClip } {
  const bone = new Bone(); bone.name = 'hip';
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute([
    -.1, -.1, 0, .1, -.1, 0, 0, .1, 0,
  ], 3));
  geometry.setAttribute('skinIndex', new Uint16BufferAttribute(new Array(12).fill(0), 4));
  geometry.setAttribute('skinWeight', new Float32BufferAttribute([
    1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0,
  ], 4));
  geometry.setAttribute('_region', new Float32BufferAttribute([0, 0, 0], 1));
  const mesh = new SkinnedMesh(geometry, new MeshBasicMaterial());
  mesh.name = 'skin'; mesh.bind(new Skeleton([bone], [new Matrix4()]), new Matrix4());
  const root = new Group(); root.add(bone, mesh); root.updateMatrixWorld(true);
  const clip = new AnimationClip('run', 1, [
    new NumberKeyframeTrack('hip.position[x]', [0, 1], [0, 10]),
  ]);
  return { root, bone, mesh, clip };
}

function frustumAt(x: number): Frustum {
  const camera = new OrthographicCamera(-.2, .2, .2, -.2, .1, 4);
  camera.position.set(x, 0, 2); camera.lookAt(x, 0, 0);
  camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
  return new Frustum().setFromProjectionMatrix(
    new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse),
  );
}

function frame(): DressupSkeletonFrame {
  return {
    schema: 'tianshu-dressup-skeleton.v1', source: { file: 'body.glb', sha256: 'cull' },
    unit: 'mu', heightMu: 1, defaultHeightM: 1, mPerMu: 1, joints: ['hip'], parents: [-1],
    bindWorld: { hip: new Array(16).fill(0) }, restPose: { armAngleDeg: 25, forearmAngleDeg: 25 },
    measures: { headWidthMu: .1, headDepthMu: .1, headCircumferenceMu: .3,
      headTopMu: [0, 1, 0], shoulderSkinWidthMu: .2, chestWidthMu: .2, waistWidthMu: .15,
      hipWidthMu: .18, handLengthMu: { L: .1, R: .1 }, handThicknessMu: { L: .02, R: .02 },
      footLengthMu: .12 },
    neckRing: { localYMu: 0, centerMu: [0, 0, 0], radiusMu: { x: .03, z: .03 },
      samples: 0, profile: [], lipOffsetMu: 0, sha256: 'ring' },
    skullProfile: { file: 'skull', stepMu: .005, sha256: 'skull' },
    sockets: { gripR: { bone: 'hip', pos: [0, 0, 0], quat: [0, 0, 0, 1] } },
    regions: { ids: { torso: 0 }, jointToRegion: {}, file: 'regions' },
    fingerPose: { fist: {} },
  };
}

function asGltf(value: ReturnType<typeof skinnedScene>): GLTF {
  return { scene: value.root, scenes: [value.root], animations: [value.clip], cameras: [],
    asset: {} } as unknown as GLTF;
}

afterEach(() => { clearDressupSkeletonFrameCache(); vi.unstubAllGlobals(); });

describe('dressup skinned frustum culling', () => {
  it('property: encloses random skinned poses and their vertex-focused frusta', () => {
    const cases = propertyCases(100, 0xb6c011);
    expect(new Set(cases.map(([boneCount]) => boneCount))).toEqual(new Set([1, 2, 3, 4]));
    cases.forEach((testCase, index) => {
      const scene = propertyScene(testCase);
      const expected = sampleVertices(scene.root, scene.mesh, scene.clip, scene.times);
      const bounds = new DressupCullingBounds(scene.root, scene.root, [scene.clip]);
      bounds.add(scene.root);
      expect(scene.mesh.boundingSphere, `case ${index}`).not.toBeNull();
      for (const localPoint of expected) {
        expect(scene.mesh.boundingSphere!.containsPoint(localPoint), `case ${index}`).toBe(true);
        const point = localPoint.clone().applyMatrix4(scene.mesh.matrixWorld);
        const camera = new OrthographicCamera(-.01, .01, .01, -.01, .01, 4);
        camera.position.copy(point).addScalar(1); camera.lookAt(point);
        camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
        const frustum = new Frustum().setFromProjectionMatrix(
          new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse),
        );
        expect(frustum.intersectsObject(scene.mesh), `case ${index}`).toBe(true);
      }
      scene.mesh.geometry.dispose(); (scene.mesh.material as MeshBasicMaterial).dispose();
    });
  }, 30_000);

  it('keeps an animated mesh visible where the stale bind-pose sphere was culled', () => {
    const value = skinnedScene();
    value.mesh.geometry.translate(5, 0, 0); value.mesh.position.x = 2;
    value.root.updateMatrixWorld(true); value.mesh.bind(value.mesh.skeleton, value.mesh.matrixWorld);
    const frustum = frustumAt(17);
    expect(frustumAt(7).intersectsObject(value.mesh)).toBe(true);
    expect(value.mesh.boundingSphere).not.toBeNull();
    value.bone.position.x = 10; value.root.updateMatrixWorld(true);
    expect(frustum.intersectsObject(value.mesh)).toBe(false);

    value.bone.position.x = 0; value.root.updateMatrixWorld(true);
    const bounds = new DressupCullingBounds(value.root, value.root, [value.clip]);
    bounds.add(value.root);
    value.bone.position.x = 10; value.root.updateMatrixWorld(true);
    expect(frustum.intersectsObject(value.mesh)).toBe(true);
  });

  it('covers the actor body and newly equipped skins at a run sample', async () => {
    const body = skinnedScene(); const garment = skinnedScene(); const prop = skinnedScene();
    const values: Record<string, GLTF> = {
      body: asGltf(body), garment: asGltf(garment), prop: asGltf(prop),
    };
    const loader = { loadAsync: async (url: string) => values[url]! } as unknown as GLTFLoader;
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(frame()))));
    const actor = await createDressupActor({ bodyUrl: 'body', frameUrl: 'frame',
      heightM: 2, loader });
    await actor.equip({ kind: 'garment', id: 'coat', url: 'garment', fit: {
      schema: 'tianshu-dressup-fit.v1', kind: 'garment', id: 'coat',
    } });
    await actor.equip({ kind: 'prop', id: 'fan', url: 'prop', fit: {
      schema: 'tianshu-dressup-fit.v1', kind: 'prop', id: 'fan', socket: 'gripR',
    } });
    actor.playClip('run', 0); actor.update(.5);
    const meshes: SkinnedMesh[] = [];
    actor.root.traverse(node => { if (node instanceof SkinnedMesh) meshes.push(node); });
    expect(meshes).toHaveLength(3);
    expect(meshes.every(mesh => mesh.boundingSphere !== null)).toBe(true);
    expect(meshes.every(mesh => mesh.frustumCulled)).toBe(true);
    expect(meshes.every(mesh => frustumAt(10).intersectsObject(mesh))).toBe(true);
    for (const id of ['coat', 'fan']) {
      const equipped = actor.root.getObjectByName(`dressupEquip:${id}`)!;
      expect(equipped.getObjectByName('skin')).toBeInstanceOf(SkinnedMesh);
    }
    actor.dispose();
  });

  it('leaves a rigid socket prop on its own geometry culling path', () => {
    const value = skinnedScene(); const rigid = new Mesh(
      value.mesh.geometry.clone(), new MeshBasicMaterial(),
    );
    value.root.add(rigid);
    const bounds = new DressupCullingBounds(value.root, value.root, [value.clip]);
    bounds.add(value.root);
    expect(rigid.frustumCulled).toBe(true);
    expect(rigid.geometry.boundingSphere).toBeNull();
  });
});
