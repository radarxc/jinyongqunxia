import { describe, expect, it } from 'vitest';
import { worldMapTexture } from './worldmap-texture';

describe('painted world map texture selection', () => {
  it('prefers the current era, then the shared painted map', () => {
    const content = { assets: { map_world_jianghu__ch01: { map: 'era.webp' },
      map_world_jianghu__base01: { map: 'base.webp' } } };
    expect(worldMapTexture(content, 'ch01')).toBe('era.webp');
    expect(worldMapTexture(content, 'ch02')).toBe('base.webp');
  });

  it('uses the fixed painted-map path without falling back to legacy or unrelated maps', () => {
    const fallback = '/assets/default/map/world/map_world_jianghu__base01.webp';
    expect(worldMapTexture({}, 'ch01')).toBe(fallback);
    expect(worldMapTexture({ assets: { map_world_jianghu__ch01: { icon: 'icon.png' },
      ref_map_jianghu__ch01_base01: { map: 'old.png' }, unrelated: { map: 'other.png' } } }, 'ch01')).toBe(fallback);
  });
});
