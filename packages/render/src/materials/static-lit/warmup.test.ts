import type { Mesh, Object3D, ShaderMaterial, Texture, WebGLRenderer } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { MINI_BUILD_KIT } from '../../buildgen/testing/mini-plans';
import type { RenderQualitySource } from '../../quality/tiers';
import { createStaticLitMaterial } from './material';
import { createStateTexture, PlaceholderLayerTextureSource } from './textures';
import { warmStaticLitMaterials } from './warmup';

const quality = {
  tier: 'high',
  renderScale: 1,
  effectivePixelRatio: (value: number) => value,
} satisfies RenderQualitySource;

describe('static-lit warmup', () => {
  it('falls back to synchronous compile when compileAsync is unavailable', async () => {
    const layers = await new PlaceholderLayerTextureSource().load(MINI_BUILD_KIT, quality);
    const state = createStateTexture(1);
    const make = (roofFade = false, depthOnly = false) =>
      createStaticLitMaterial({
        layers: layers.texture,
        state: state.texture,
        unitTop: state.texture,
        repeatM: layers.repeatM,
        roofFade,
        depthOnly,
      });
    const materials = [make(), make(true), make(false, true)] as const;
    let keys: string[] = [];
    const compile = vi.fn((scene: Object3D) => {
      keys = scene.children.map((child) =>
        ((child as Mesh).material as ShaderMaterial).customProgramCacheKey(),
      );
    });
    const renderer = {
      compile,
      initTexture: vi.fn<(texture: Texture) => void>(),
    } as unknown as WebGLRenderer;
    await warmStaticLitMaterials(renderer, ...materials);
    expect(compile).toHaveBeenCalledTimes(1);
    expect(keys).toHaveLength(3);
    for (const material of materials) material.dispose();
    state.texture.dispose();
    layers.texture.dispose();
  });
});
