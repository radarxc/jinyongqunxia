import { describe, expect, it, vi } from 'vitest';
import type { DataTexture } from 'three';
import type * as Three from 'three';

const shaderSources = vi.hoisted(() => [] as string[]);
vi.mock('three', async importOriginal => {
  const actual = await importOriginal<typeof Three>();
  return { ...actual, ShaderMaterial: class extends actual.ShaderMaterial {
    constructor(parameters: Three.ShaderMaterialParameters) {
      super(parameters); shaderSources.push(parameters.fragmentShader ?? '');
    }
  } };
});
import { HexLayer } from './hex-layer';

describe('hex layer highlights', () => {
  it('updates a compact RGBA8 data texture without large fragment uniform arrays', () => {
    const layer = new HexLayer([
      { q: 0, r: 0, height: 0, terrain: 'tr_pingdi', label: '甲', color: 0x111111 },
      { q: 1, r: 0, height: 0, terrain: 'tr_pingdi', label: '乙', color: 0x222222 },
    ]);
    const geometry = layer.mesh.geometry;
    layer.setHighlights({ selected: '0,0', ready: '1,0', reachable: ['1,0'], area: ['0,0'] });
    expect(layer.mesh.geometry).toBe(geometry);
    expect(layer.material.fragmentShader).not.toMatch(/uniform\s+float\s+\w+\s*\[\s*400\s*]/);
    expect(shaderSources.at(-1)).toContain('uniform sampler2D highlights');
    expect(layer.material.vertexShader).not.toContain('flat varying int');
    expect(shaderSources.at(-1)).not.toMatch(/uniform\s+\w+\s+\w+\s*\[\s*\d+\s*]/);
    const texture = layer.material.uniforms['highlights']?.value as DataTexture;
    expect(texture.image.width).toBe(400);
    expect(texture.image.height).toBe(1);
    expect(Array.from(texture.image.data!.slice(0, 8))).toEqual([0, 255, 0, 255, 255, 0, 255, 0]);
    const bytes = texture.image.data;
    const previousVersion = texture.version;
    layer.restore();
    expect(texture.image.data).toBe(bytes);
    expect(texture.version).toBeGreaterThan(previousVersion);
    layer.dispose();
  });
});
