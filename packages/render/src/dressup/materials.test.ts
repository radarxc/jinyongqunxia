import { BufferGeometry, Float32BufferAttribute, FrontSide, MeshBasicMaterial,
  MeshDepthMaterial, MeshStandardMaterial, ShaderLib, SkinnedMesh, Texture } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { injectRegionMask, prepareBodyRegionMesh, setHideMap, setRegionHideMask, toUnlit } from './materials';

describe('dressup materials', () => {
  it('converts PBR to unlit, preserves surface inputs, and disposes the source', () => {
    const map = new Texture();
    const source = new MeshStandardMaterial({ color: 0x336699, map, side: FrontSide, transparent: true });
    const dispose = vi.spyOn(source, 'dispose');
    const result = toUnlit(source);
    expect(result).toBeInstanceOf(MeshBasicMaterial);
    expect(result.map).toBe(map); expect(result.color.getHex()).toBe(0x336699);
    expect(result.side).toBe(FrontSide); expect(result.transparent).toBe(true);
    expect(result.toneMapped).toBe(false); expect(dispose).toHaveBeenCalledOnce();
    result.dispose(); map.dispose();
  });

  it('injects the exact uint region shader once with a stable cache key', () => {
    const material = new MeshBasicMaterial(); injectRegionMask(material, 5);
    const shader = { uniforms: {} as Record<string, { value: unknown }>, vertexShader: '#include <common>\n#include <begin_vertex>',
      fragmentShader: '#include <common>\n#include <alphatest_fragment>' };
    material.onBeforeCompile(shader as never, {} as never);
    expect(shader.vertexShader).toContain('attribute float _region;');
    expect(shader.vertexShader).toContain('flat varying uint vRegion;');
    expect(shader.vertexShader).toContain('vRegion = uint(_region + 0.5);');
    expect(shader.fragmentShader).toContain('uniform uint uHideMask;');
    expect(shader.fragmentShader).toContain('(uHideMask & (1u << vRegion))');
    expect(shader.uniforms['uHideMask']!.value).toBe(5);
    expect(shader.uniforms).toHaveProperty('uHideMap');
    expect(shader.uniforms).toHaveProperty('uHideMapOn');
    expect(shader.uniforms['uHideMapOn']!.value).toBe(false);
    expect(shader.fragmentShader).toContain('texture2D(uHideMap, vUv).r > 0.5');
    expect(shader.vertexShader).toContain('#define USE_UV');
    const key = material.customProgramCacheKey();
    setRegionHideMask(material, 0x80000000);
    expect(shader.uniforms['uHideMask']!.value).toBe(0x80000000); expect(material.customProgramCacheKey()).toBe(key);
    material.dispose();
  });

  it('injects actual basic and depth shaders and toggles maps independently of region masks', () => {
    for (const [material, source] of [[new MeshBasicMaterial(), ShaderLib.basic],
      [new MeshDepthMaterial(), ShaderLib.depth]] as const) {
      const texture = new Texture();
      setHideMap(material, texture, true); setRegionHideMask(material, 8);
      const shader = { uniforms: {} as Record<string, { value: unknown }>,
        vertexShader: source.vertexShader, fragmentShader: source.fragmentShader };
      material.onBeforeCompile(shader as never, {} as never);
      expect(shader.uniforms['uHideMap']!.value).toBe(texture);
      expect(shader.uniforms['uHideMapOn']!.value).toBe(true);
      const key = material.customProgramCacheKey();
      setHideMap(material, texture, false);
      expect(shader.uniforms['uHideMapOn']!.value).toBe(false);
      setHideMap(material, null, true);
      expect(shader.uniforms['uHideMapOn']!.value).toBe(false);
      expect(shader.uniforms['uHideMask']!.value).toBe(8);
      expect(material.customProgramCacheKey()).toBe(key); material.dispose(); texture.dispose();
    }
  });

  it('requires _region on body meshes and disables the unmasked shadow pass', () => {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0], 3));
    const mesh = new SkinnedMesh(geometry, new MeshBasicMaterial()); mesh.castShadow = true;
    expect(() => prepareBodyRegionMesh(mesh)).toThrow('DRESSUP_REGION_ATTRIBUTE_MISSING');
    geometry.setAttribute('_region', new Float32BufferAttribute([0], 1));
    prepareBodyRegionMesh(mesh); expect(mesh.castShadow).toBe(false);
    mesh.material.dispose(); geometry.dispose();
  });
});
