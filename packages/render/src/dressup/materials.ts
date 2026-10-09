import { Color, LinearFilter, MeshBasicMaterial, NoColorSpace, Texture, TextureLoader,
  type IUniform, type Material, type MaterialParameters,
  type SkinnedMesh, type WebGLProgramParametersWithUniforms } from 'three';
import { DressupError, type DressupHideMapCompositor } from './types';

const REGION_CACHE_KEY = 'tianshu-dressup-region-hidemap-v3';
const regionUniforms = new WeakMap<Material, IUniform<number>>();
const hideMapUniforms = new WeakMap<Material, IUniform<Texture | null>>();
const hideMapOnUniforms = new WeakMap<Material, IUniform<boolean>>();

type TexturedMaterial = Material & {
  readonly map?: Texture | null;
  readonly color?: Color;
};

export function toUnlit(material: Material): MeshBasicMaterial {
  const source = material as TexturedMaterial;
  const parameters: MaterialParameters & { map?: Texture | null; color?: Color } = {
    map: source.map ?? null,
    color: source.color ?? new Color(0xffffff),
    side: source.side,
    opacity: source.opacity ?? 1,
    transparent: source.transparent ?? false,
    alphaTest: source.alphaTest ?? 0,
    toneMapped: false,
  };
  const result = new MeshBasicMaterial(parameters);
  result.name = material.name;
  material.dispose();
  return result;
}

function insertOnce(source: string, marker: string, value: string): string {
  if (!source.includes(marker)) throw new Error(`DRESSUP_SHADER_MARKER:${marker}`);
  return source.replace(marker, `${marker}\n${value}`);
}

export function injectRegionMask(material: Material, initialMask = 0): void {
  const existing = regionUniforms.get(material);
  if (existing) { existing.value = initialMask >>> 0; return; }
  const uniform: IUniform<number> = { value: initialMask >>> 0 };
  const texUniform: IUniform<Texture | null> = { value: null };
  const onUniform: IUniform<boolean> = { value: false };

  const inject = (shader: WebGLProgramParametersWithUniforms): void => {
    // Raw UVs are required even on untextured materials and in the depth pass.
    shader.vertexShader = '#define USE_UV\n' + shader.vertexShader;
    shader.fragmentShader = '#define USE_UV\n' + shader.fragmentShader;
    shader.uniforms['uHideMask'] = uniform;
    shader.uniforms['uHideMap'] = texUniform;
    shader.uniforms['uHideMapOn'] = onUniform;
    shader.vertexShader = insertOnce(shader.vertexShader, '#include <common>',
      'attribute float _region;\nflat varying uint vRegion;');
    shader.vertexShader = insertOnce(shader.vertexShader, '#include <begin_vertex>',
      'vRegion = uint(_region + 0.5);');
    shader.fragmentShader = insertOnce(shader.fragmentShader, '#include <common>',
      'uniform uint uHideMask;\nuniform sampler2D uHideMap;\nuniform bool uHideMapOn;\nflat varying uint vRegion;');
    shader.fragmentShader = insertOnce(shader.fragmentShader, '#include <alphatest_fragment>',
      'if ((uHideMask & (1u << vRegion)) != 0u) discard;\nif (uHideMapOn && texture2D(uHideMap, vUv).r > 0.5) discard;');
  };

  material.onBeforeCompile = inject;
  material.customProgramCacheKey = () => REGION_CACHE_KEY;
  regionUniforms.set(material, uniform);
  hideMapUniforms.set(material, texUniform);
  hideMapOnUniforms.set(material, onUniform);
  material.needsUpdate = true;
}

export function setRegionHideMask(material: Material, mask: number): void {
  const uniform = regionUniforms.get(material);
  if (!uniform) injectRegionMask(material);
  regionUniforms.get(material)!.value = mask >>> 0;
}

export function setHideMap(material: Material, map: Texture | null, enabled: boolean): void {
  const texUniform = hideMapUniforms.get(material);
  if (!texUniform) injectRegionMask(material);
  hideMapUniforms.get(material)!.value = map;
  hideMapOnUniforms.get(material)!.value = enabled && map !== null;
}

export function prepareBodyRegionMesh(mesh: SkinnedMesh, initialMask = 0): void {
  if (!mesh.geometry.attributes['_region']) {
    throw new Error(`${DressupError.RegionAttributeMissing}:${mesh.name || '<unnamed>'}`);
  }
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  for (const material of materials) injectRegionMask(material, initialMask);
  if (mesh.customDepthMaterial) injectRegionMask(mesh.customDepthMaterial, initialMask);
  // The body is unlit; disabling cast shadows also prevents a depth pass from ignoring the mask.
  mesh.castShadow = false;
}

type SizedImage = CanvasImageSource & { readonly width: number; readonly height: number };

export async function loadDressupImage(url: string): Promise<{ image: SizedImage; close(): void }> {
  if (typeof createImageBitmap === 'function' && typeof fetch === 'function') {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`DRESSUP_LAYER_HTTP_${response.status}`);
    const image = await createImageBitmap(await response.blob(), {
      colorSpaceConversion: 'none', premultiplyAlpha: 'none',
    });
    return { image, close: () => image.close() };
  }
  const texture = await new TextureLoader().loadAsync(url);
  return { image: texture.image as SizedImage, close: () => texture.dispose() };
}

export function createDressupCanvas(width: number, height: number): OffscreenCanvas | HTMLCanvasElement {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(width, height);
  if (typeof document === 'undefined') throw new Error('DRESSUP_CANVAS_UNAVAILABLE');
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  return canvas;
}

export function configureHideMapTexture(texture: Texture): void {
  texture.colorSpace = NoColorSpace; texture.flipY = false;
  texture.magFilter = LinearFilter; texture.minFilter = LinearFilter;
  texture.generateMipmaps = false; texture.needsUpdate = true;
}

export const defaultHideMapCompositor: DressupHideMapCompositor = {
  async composite(maps) {
    const loaded: Awaited<ReturnType<typeof loadDressupImage>>[] = [];
    try {
      for (const map of maps) loaded.push(await loadDressupImage(map.url));
      const size = Math.max(...loaded.map(({ image }) => Math.max(image.width, image.height)));
      if (!Number.isInteger(size) || size <= 0) throw new Error('DRESSUP_HIDE_MAP_SIZE_INVALID');
      const canvas = createDressupCanvas(size, size);
      const context = canvas.getContext('2d');
      if (!context) throw new Error('DRESSUP_CANVAS_CONTEXT_UNAVAILABLE');
      context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'low';
      const union = context.createImageData(size, size);
      for (const { image } of loaded) {
        context.clearRect(0, 0, size, size);
        context.drawImage(image, 0, 0, size, size);
        const pixels = context.getImageData(0, 0, size, size).data;
        for (let i = 0; i < pixels.length; i += 4) {
          const value = Math.max(union.data[i]!, pixels[i]!);
          union.data[i] = value; union.data[i + 1] = value; union.data[i + 2] = value;
          union.data[i + 3] = 255;
        }
      }
      context.putImageData(union, 0, 0);
      const texture = new Texture(canvas); configureHideMapTexture(texture); return texture;
    } finally { for (const image of loaded) image.close(); }
  },
};
