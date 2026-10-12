import { describe, expect, it } from 'vitest';
import { createRegionPathLayer, REGION_PATH_CAPACITY } from './path-layer';

describe('region route layer', () => {
  it('reuses one fixed-capacity dashed ribbon and caps updates at 512 hexes', () => {
    const layer = createRegionPathLayer(() => 0);
    const route = layer.group.getObjectByName('region-preview-route')!;
    const positions = (
      route as unknown as {
        geometry: {
          attributes: { position: { array: Float32Array } };
          drawRange: { count: number };
        };
      }
    ).geometry.attributes.position.array;
    const path = Array.from({ length: 600 }, (_, q) => ({ q, r: 0 }));
    layer.setPreviewPath(path);
    const geometry = (
      route as unknown as {
        geometry: {
          attributes: { position: { array: Float32Array } };
          drawRange: { count: number };
        };
      }
    ).geometry;
    expect(geometry.attributes.position.array).toBe(positions);
    expect(geometry.drawRange.count).toBe((REGION_PATH_CAPACITY - 1) * 12);
    layer.setPreviewPath([{ q: 0, r: 0 }]);
    expect(route.visible).toBe(false);
    layer.dispose();
    layer.dispose();
  });
});
