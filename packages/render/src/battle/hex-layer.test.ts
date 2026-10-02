import { describe, expect, it } from 'vitest';
import { HexLayer } from './hex-layer';

describe('hex layer highlights', () => {
  it('updates uniform membership without replacing geometry', () => {
    const layer = new HexLayer([
      { q: 0, r: 0, height: 0, terrain: 'tr_pingdi', label: '甲', color: 0x111111 },
      { q: 1, r: 0, height: 0, terrain: 'tr_pingdi', label: '乙', color: 0x222222 },
    ]);
    const geometry = layer.mesh.geometry;
    layer.setHighlights({ selected: '0,0', ready: '1,0', reachable: ['1,0'], area: ['0,0'] });
    expect(layer.mesh.geometry).toBe(geometry);
    expect(layer.material.uniforms['selected']?.value).toBe(0);
    expect(layer.material.uniforms['ready']?.value).toBe(1);
    expect(layer.material.uniforms['reachable']?.value).toEqual(new Float32Array([0, 1, ...Array(398).fill(0)]));
    expect(layer.material.uniforms['area']?.value).toEqual(new Float32Array([1, 0, ...Array(398).fill(0)]));
    layer.dispose();
  });
});
