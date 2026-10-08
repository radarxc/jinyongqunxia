import { Color, MeshBasicMaterial, type IUniform, type Material, type MaterialParameters,
  type SkinnedMesh, type Texture, type WebGLProgramParametersWithUniforms } from 'three';
import { DressupError } from './types';

const REGION_CACHE_KEY = 'tianshu-dressup-region-v1';
const regionUniforms = new WeakMap<Material, IUniform<number>>();

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

export function injectRegionMask(material: Material, initialMask = 0): IUniform<number> {
  const existing = regionUniforms.get(material);
  if (existing) { existing.value = initialMask >>> 0; return existing; }
  const uniform: IUniform<number> = { value: initialMask >>> 0 };
  material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms): void => {
    shader.uniforms['uHideMask'] = uniform;
    shader.vertexShader = insertOnce(shader.vertexShader, '#include <common>',
      'attribute float _region;\nflat varying uint vRegion;');
    shader.vertexShader = insertOnce(shader.vertexShader, '#include <begin_vertex>',
      'vRegion = uint(_region + 0.5);');
    shader.fragmentShader = insertOnce(shader.fragmentShader, '#include <common>',
      'uniform uint uHideMask;\nflat varying uint vRegion;');
    shader.fragmentShader = insertOnce(shader.fragmentShader, '#include <alphatest_fragment>',
      'if ((uHideMask & (1u << vRegion)) != 0u) discard;');
  };
  material.customProgramCacheKey = () => REGION_CACHE_KEY;
  regionUniforms.set(material, uniform);
  material.needsUpdate = true;
  return uniform;
}

export function setRegionHideMask(material: Material, mask: number): void {
  const uniform = regionUniforms.get(material) ?? injectRegionMask(material);
  uniform.value = mask >>> 0;
}

export function prepareBodyRegionMesh(mesh: SkinnedMesh, initialMask = 0): void {
  if (!mesh.geometry.attributes['_region']) {
    throw new Error(`${DressupError.RegionAttributeMissing}:${mesh.name || '<unnamed>'}`);
  }
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  for (const material of materials) injectRegionMask(material, initialMask);
  // The body is unlit; disabling cast shadows also prevents a depth pass from ignoring the mask.
  mesh.castShadow = false;
}
