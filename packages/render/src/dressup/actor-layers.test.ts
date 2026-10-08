import {
  Bone, BufferGeometry, Float32BufferAttribute, Group, LinearFilter, Matrix4,
  MeshBasicMaterial, NearestFilter, RepeatWrapping, Skeleton, SkinnedMesh, SRGBColorSpace, Texture,
  Uint16BufferAttribute,
} from 'three';
import type { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDressupActor } from './actor';
import { clearDressupSkeletonFrameCache } from './skeleton-frame';
import type { DressupLayerCompositor, DressupSkeletonFrame } from './types';

function frame(): DressupSkeletonFrame {
  return {
    schema: 'tianshu-dressup-skeleton.v1', source: { file: 'body.glb', sha256: 'x' },
    unit: 'mu', heightMu: 1, defaultHeightM: 1.65, mPerMu: 1.65, joints: ['hip'], parents: [-1],
    bindWorld: { hip: new Array(16).fill(0) }, restPose: { armAngleDeg: 25, forearmAngleDeg: 25 },
    measures: { headWidthMu: .1, headDepthMu: .1, headCircumferenceMu: .3, headTopMu: [0, 1, 0],
      shoulderSkinWidthMu: .2, chestWidthMu: .2, waistWidthMu: .15, hipWidthMu: .18,
      handLengthMu: { L: .1, R: .1 }, handThicknessMu: { L: .02, R: .02 }, footLengthMu: .12 },
    neckRing: { localYMu: 0, centerMu: [0, 0, 0], radiusMu: { x: .03, z: .03 }, samples: 0,
      profile: [], lipOffsetMu: 0, sha256: 'r' },
    skullProfile: { file: 's', stepMu: .005, sha256: 's' }, sockets: {},
    regions: { ids: { torso: 0 }, jointToRegion: {}, file: 'r' }, fingerPose: { fist: {} },
  };
}
function body(base: Texture): GLTF {
  const hip = new Bone(); hip.name = 'hip';
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0], 3));
  geometry.setAttribute('skinIndex', new Uint16BufferAttribute(new Array(12).fill(0), 4));
  geometry.setAttribute('skinWeight', new Float32BufferAttribute([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], 4));
  geometry.setAttribute('_region', new Float32BufferAttribute([0, 0, 0], 1));
  const mesh = new SkinnedMesh(geometry, new MeshBasicMaterial({ map: base })); mesh.name = 'body';
  mesh.bind(new Skeleton([hip], [new Matrix4()]), new Matrix4());
  const scene = new Group(); scene.add(hip, mesh);
  return { scene, scenes: [scene], animations: [], cameras: [], asset: {} } as unknown as GLTF;
}
function loader(value: GLTF): GLTFLoader {
  return { loadAsync: vi.fn(async () => value) } as unknown as GLTFLoader;
}
function texture(width = 8, height = 4): Texture {
  return new Texture({ width, height } as TexImageSource);
}
function materialMap(actor: Awaited<ReturnType<typeof createDressupActor>>): Texture | null {
  return (actor.root.getObjectByName('body') as SkinnedMesh).material instanceof MeshBasicMaterial
    ? ((actor.root.getObjectByName('body') as SkinnedMesh).material as MeshBasicMaterial).map : null;
}
async function actor(base: Texture, compositor: DressupLayerCompositor) {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(frame()))));
  return createDressupActor({ bodyUrl: 'body', frameUrl: 'frame', heightM: 1,
    loader: loader(body(base)), compositor });
}
afterEach(() => { clearDressupSkeletonFrameCache(); vi.unstubAllGlobals(); });

describe('dressup body texture layers', () => {
  it('composites by explicit order then input order and preserves base sampling settings', async () => {
    const base = texture(); base.wrapS = RepeatWrapping; base.magFilter = NearestFilter;
    base.minFilter = LinearFilter; base.anisotropy = 7; base.generateMipmaps = false;
    const result = texture(); const calls: string[][] = [];
    const value = await actor(base, { async composite(_base, layers) {
      calls.push(layers.map(layer => layer.id)); return result;
    } });
    await value.setBodyLayers([
      { id: 'late', url: 'late.png', order: 10 }, { id: 'first', url: 'first.png', order: 0 },
      { id: 'middle', url: 'middle.png' },
    ]);
    expect(calls).toEqual([['first', 'middle', 'late']]); expect(materialMap(value)).toBe(result);
    expect(result).toMatchObject({ colorSpace: SRGBColorSpace, flipY: false,
      wrapS: RepeatWrapping, magFilter: NearestFilter,
      minFilter: LinearFilter, anisotropy: 7, generateMipmaps: false });
    expect(value.stats()).toMatchObject({ bodyLayers: ['first', 'middle', 'late'], layerTextureBytes: 128 });
    value.dispose();
  });

  it('shares a cached id sequence and disposes it after the last actor releases it', async () => {
    const base = texture(); const result = texture(); const dispose = vi.spyOn(result, 'dispose');
    const compositor = { composite: vi.fn(async () => result) };
    const first = await actor(base, compositor); const second = await actor(base, compositor);
    const layers = [{ id: 'shared', url: 'shared.png' }] as const;
    await Promise.all([first.setBodyLayers(layers), second.setBodyLayers(layers)]);
    expect(compositor.composite).toHaveBeenCalledOnce(); expect(materialMap(first)).toBe(materialMap(second));
    first.dispose(); expect(dispose).not.toHaveBeenCalled(); second.dispose(); expect(dispose).toHaveBeenCalledOnce();
  });

  it('restores the original base texture for an empty list', async () => {
    const base = texture(); const result = texture(); const dispose = vi.spyOn(result, 'dispose');
    const value = await actor(base, { async composite() { return result; } });
    await value.setBodyLayers([{ id: 'coat', url: 'coat.png' }]);
    await value.setBodyLayers([]);
    expect(materialMap(value)).toBe(base); expect(value.stats()).toMatchObject({ bodyLayers: [], layerTextureBytes: 0 });
    expect(dispose).toHaveBeenCalledOnce(); value.dispose();
  });

  it('keeps only the last concurrent request and releases the stale result', async () => {
    const base = texture(); const slow = texture(); const fast = texture();
    const slowDispose = vi.spyOn(slow, 'dispose'); const resolvers = new Map<string, () => void>();
    const value = await actor(base, { async composite(_base, layers) {
      await new Promise<void>(resolve => { resolvers.set(layers[0]!.id, resolve); });
      return layers[0]!.id === 'slow' ? slow : fast;
    } });
    const oldRequest = value.setBodyLayers([{ id: 'slow', url: 'slow.png' }]);
    const newRequest = value.setBodyLayers([{ id: 'fast', url: 'fast.png' }]);
    resolvers.get('fast')!(); await newRequest;
    resolvers.get('slow')!(); await oldRequest;
    expect(materialMap(value)).toBe(fast); expect(value.stats().bodyLayers).toEqual(['fast']);
    expect(slowDispose).toHaveBeenCalledOnce(); value.dispose();
  });

  it('releases a pending composition when disposed without leaking its texture', async () => {
    const base = texture(); const result = texture(); const dispose = vi.spyOn(result, 'dispose');
    let resolve!: () => void;
    const value = await actor(base, { async composite() {
      await new Promise<void>(done => { resolve = done; }); return result;
    } });
    const pending = value.setBodyLayers([{ id: 'pending', url: 'pending.png' }]);
    value.dispose(); resolve(); await pending;
    expect(dispose).toHaveBeenCalledOnce();
    expect(value.stats()).toEqual({ drawCalls: 0, triangles: 0, boneTextureUploads: 0,
      bodyLayers: [], layerTextureBytes: 0 });
  });
});
