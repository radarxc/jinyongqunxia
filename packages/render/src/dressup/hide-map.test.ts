import { Bone, BufferGeometry, Float32BufferAttribute, Group, LinearFilter, Matrix4,
  MeshBasicMaterial, MeshDepthMaterial, NoColorSpace, Skeleton, SkinnedMesh, Texture,
  Uint16BufferAttribute, type Material } from 'three';
import type { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDressupActor } from './actor';
import { defaultHideMapCompositor } from './materials';
import { clearDressupSkeletonFrameCache } from './skeleton-frame';
import type { DressupActorOptions, DressupEquipSpec, DressupHideMapCompositor } from './types';

function body(): GLTF {
  const hip = new Bone(); hip.name = 'hip';
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0], 3));
  geometry.setAttribute('skinIndex', new Uint16BufferAttribute(new Array(12).fill(0), 4));
  geometry.setAttribute('skinWeight', new Float32BufferAttribute([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], 4));
  geometry.setAttribute('_region', new Float32BufferAttribute([0, 0, 0], 1));
  const mesh = new SkinnedMesh(geometry, new MeshBasicMaterial({
    map: new Texture({ width: 2048, height: 2048 } as TexImageSource),
  }));
  mesh.name = 'body'; mesh.customDepthMaterial = new MeshDepthMaterial();
  mesh.bind(new Skeleton([hip], [new Matrix4()]), new Matrix4());
  const scene = new Group(); scene.add(hip, mesh);
  return { scene, scenes: [scene], animations: [], cameras: [], asset: {} } as unknown as GLTF;
}
async function actor(options: Partial<DressupActorOptions> = {}) {
  const frame = { schema: 'tianshu-dressup-skeleton.v1', heightMu: 1, joints: ['hip'], parents: [-1],
    sockets: {}, regions: { ids: { torso: 0 }, jointToRegion: {}, file: 'r' }, fingerPose: { fist: {} } };
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(frame))));
  return createDressupActor({ bodyUrl: '/templates/medium/body.glb', frameUrl: 'frame', heightM: 1,
    loader: { loadAsync: vi.fn(async () => body()) } as unknown as GLTFLoader, ...options });
}
function garment(id: string, file = id + '.png', size = 1024): DressupEquipSpec {
  return { kind: 'garment', id, url: '/garments/' + id + '.glb',
    fit: { schema: 'tianshu-dressup-fit.v1', kind: 'garment', id, hideMask: { file, size } } };
}
function uniforms(material: Material) {
  const shader = { uniforms: {} as Record<string, { value: unknown }>,
    vertexShader: '#include <common>\n#include <begin_vertex>',
    fragmentShader: '#include <common>\n#include <alphatest_fragment>' };
  material.onBeforeCompile(shader as never, {} as never); return shader.uniforms;
}
function compositor() {
  const textures: Texture[] = [];
  const composite = vi.fn(async () => {
    const texture = new Texture({ width: 1024, height: 1024 } as TexImageSource);
    vi.spyOn(texture, 'dispose'); textures.push(texture); return texture;
  });
  return { composite, textures };
}
afterEach(() => { clearDressupSkeletonFrameCache(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('hide map lifecycle', () => {
  it('unions sorted masks independently of baseColor and updates both shader passes', async () => {
    const masks = compositor(); const layers = { composite: vi.fn() };
    const value = await actor({ hideMapCompositor: masks, compositor: layers });
    const mesh = value.root.getObjectByName('body') as SkinnedMesh;
    const shaders = [uniforms(mesh.material as Material), uniforms(mesh.customDepthMaterial!)];
    for (const shader of shaders) expect(shader['uHideMapOn']!.value).toBe(false);
    await value.equip(garment('z')); await value.equip(garment('a', 'a.png', 512));
    expect(masks.composite).toHaveBeenCalledTimes(2); expect(layers.composite).not.toHaveBeenCalled();
    expect(masks.composite).toHaveBeenLastCalledWith([
      { id: 'a', url: 'http://localhost/garments/a.png', size: 512 },
      { id: 'z', url: 'http://localhost/garments/z.png', size: 1024 },
    ]);
    expect(value.stats()).toMatchObject({ hideMaps: ['a', 'z'], hideMapSize: 1024, drawCalls: 3 });
    for (const shader of shaders) {
      expect(shader['uHideMap']!.value).toBe(masks.textures[1]);
      expect(shader['uHideMapOn']!.value).toBe(true);
    }
    value.setHideMapEnabled(false); value.setHideMask(['torso']);
    for (const shader of shaders) {
      expect(shader['uHideMapOn']!.value).toBe(false); expect(shader['uHideMask']!.value).toBe(1);
    }
    value.setHideMapEnabled(true); value.unequip('a');
    await vi.waitFor(() => expect(shaders[0]!['uHideMap']!.value).toBe(masks.textures[2]));
    value.unequip('z');
    for (const shader of shaders) expect(shader['uHideMapOn']!.value).toBe(false);
    expect(value.stats().hideMaps).toEqual([]); expect(value.stats().hideMapSize).toBeUndefined();
    value.dispose();
    for (const texture of masks.textures) expect(texture.dispose).toHaveBeenCalledOnce();
  });

  it('shares leases across actors but separates template, URL and size changes', async () => {
    const masks = compositor();
    const first = await actor({ hideMapCompositor: masks });
    const second = await actor({ hideMapCompositor: masks });
    await Promise.all([first.equip(garment('coat')), second.equip(garment('coat'))]);
    expect(masks.composite).toHaveBeenCalledOnce(); first.dispose();
    expect(masks.textures[0]!.dispose).not.toHaveBeenCalled();
    const small = await actor({ hideMapCompositor: masks, templateId: 'small' });
    await small.equip(garment('coat')); expect(masks.composite).toHaveBeenCalledTimes(2);
    await second.equip(garment('coat', 'new.png')); expect(masks.composite).toHaveBeenCalledTimes(3);
    await second.equip(garment('coat', 'new.png', 512)); expect(masks.composite).toHaveBeenCalledTimes(4);
    second.dispose(); small.dispose();
    for (const texture of masks.textures) expect(texture.dispose).toHaveBeenCalledOnce();
  });

  it('reports synchronous unequip background failures and retries with masking disabled', async () => {
    const masks = compositor(); const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const value = await actor({ hideMapCompositor: masks });
    await value.equip(garment('coat')); await value.equip(garment('cape'));
    masks.composite.mockRejectedValueOnce(new Error('MASK_NETWORK_FAILED'));
    value.unequip('cape');
    await vi.waitFor(() => expect(value.stats().hideMapError).toBe('MASK_NETWORK_FAILED'));
    expect(warn).toHaveBeenCalledWith('DRESSUP_HIDE_MAP_FAILED', 'MASK_NETWORK_FAILED');
    expect(value.stats().hideMapSize).toBeUndefined();
    await value.equip(garment('coat'));
    expect(value.stats().hideMapError).toBeUndefined(); expect(value.stats().hideMapSize).toBe(1024);
    value.dispose();
  });

  it('releases stale or disposed pending results and preserves a newer request', async () => {
    const pending: { texture: Texture; resolve(texture: Texture): void }[] = [];
    const masks: DressupHideMapCompositor = { composite: vi.fn(() => new Promise<Texture>(resolve => {
      const texture = new Texture({ width: 1, height: 1 } as TexImageSource);
      vi.spyOn(texture, 'dispose'); pending.push({ texture, resolve });
    })) };
    const value = await actor({ hideMapCompositor: masks });
    const old = value.equip(garment('coat'));
    await vi.waitFor(() => expect(pending).toHaveLength(1));
    const next = value.equip(garment('cape'));
    await vi.waitFor(() => expect(pending).toHaveLength(2));
    pending[1]!.resolve(pending[1]!.texture); await next;
    pending[0]!.resolve(pending[0]!.texture); await old;
    expect(pending[0]!.texture.dispose).toHaveBeenCalledOnce();
    expect(value.stats()).toMatchObject({ hideMaps: ['cape', 'coat'], hideMapSize: 1 });
    const last = value.equip(garment('gloves'));
    await vi.waitFor(() => expect(pending).toHaveLength(3));
    value.dispose(); pending[2]!.resolve(pending[2]!.texture); await last;
    for (const item of pending) expect(item.texture.dispose).toHaveBeenCalledOnce();
    expect(value.stats().hideMaps).toEqual([]);
  });
});

// In-memory Canvas adapter: exercises production sizing/max logic with bilinear image scaling.
interface MaskImage { width: number; height: number; pixel(x: number, y: number): number; close(): void }
class MaskCanvas {
  image?: MaskImage; pixels?: { data: Uint8ClampedArray };
  imageSmoothingEnabled = false; imageSmoothingQuality = '';
  constructor(readonly width: number, readonly height: number) {}
  getContext() { return this; }
  clearRect() { delete this.image; }
  drawImage(image: MaskImage, _x: number, _y: number, width: number, height: number) {
    expect([width, height]).toEqual([this.width, this.height]);
    expect(this.imageSmoothingEnabled).toBe(true); this.image = image;
  }
  createImageData() { return { data: new Uint8ClampedArray(this.width * this.height * 4) }; }
  getImageData() {
    const result = this.createImageData(); const image = this.image!;
    for (let y = 0; y < this.height; y += 1) for (let x = 0; x < this.width; x += 1) {
      const sx = Math.max(0, Math.min(image.width - 1, (x + .5) * image.width / this.width - .5));
      const sy = Math.max(0, Math.min(image.height - 1, (y + .5) * image.height / this.height - .5));
      const x0 = Math.floor(sx); const y0 = Math.floor(sy);
      const x1 = Math.min(x0 + 1, image.width - 1); const y1 = Math.min(y0 + 1, image.height - 1);
      const fx = sx - x0; const fy = sy - y0;
      const a = image.pixel(x0, y0) * (1 - fx) + image.pixel(x1, y0) * fx;
      const b = image.pixel(x0, y1) * (1 - fx) + image.pixel(x1, y1) * fx;
      const offset = (y * this.width + x) * 4;
      result.data[offset] = a * (1 - fy) + b * fy; result.data[offset + 3] = 255;
    }
    return result;
  }
  putImageData(pixels: { data: Uint8ClampedArray }) { this.pixels = pixels; }
}

it('composites 1024 and 512 masks over a 2048 body as a 1024 NoColorSpace max union', async () => {
  const value = await actor();
  const images: MaskImage[] = [
    { width: 1024, height: 1024, pixel: x => x < 512 ? 96 : 0, close: vi.fn() },
    { width: 512, height: 512, pixel: (_x, y) => y < 256 ? 64 : 255, close: vi.fn() },
  ];
  vi.stubGlobal('OffscreenCanvas', MaskCanvas);
  vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValueOnce(images[0])
    .mockResolvedValueOnce(images[0]).mockResolvedValueOnce(images[1]));
  await value.equip(garment('a')); await value.equip(garment('b', 'b.png', 512));
  const material = (value.root.getObjectByName('body') as SkinnedMesh).material as MeshBasicMaterial;
  expect((material.map!.image as { width: number }).width).toBe(2048);
  const texture = uniforms(material)['uHideMap']!.value as Texture;
  const canvas = texture.image as MaskCanvas;
  expect([canvas.width, canvas.height]).toEqual([1024, 1024]);
  const pixel = (x: number, y: number) => canvas.pixels!.data[(y * 1024 + x) * 4];
  expect([pixel(0, 0), pixel(1023, 0), pixel(0, 1023), pixel(1023, 1023)])
    .toEqual([96, 64, 255, 255]);
  expect(pixel(1023, 511)).toBe(112); expect(pixel(1023, 512)).toBe(207);
  expect(texture).toMatchObject({ colorSpace: NoColorSpace, flipY: false,
    minFilter: LinearFilter, magFilter: LinearFilter, generateMipmaps: false });
  expect(images[0]!.close).toHaveBeenCalledTimes(2); expect(images[1]!.close).toHaveBeenCalledOnce();
  value.dispose();
});

it('closes decoded mask images when a later image cannot load', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response('mask')));
  const close = vi.fn();
  vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValueOnce({ width: 1, height: 1, close })
    .mockRejectedValueOnce(new Error('INVALID_PNG')));
  await expect(defaultHideMapCompositor.composite([{ id: 'a', url: 'a' }, { id: 'b', url: 'b' }]))
    .rejects.toThrow('INVALID_PNG');
  expect(close).toHaveBeenCalledOnce();
});
