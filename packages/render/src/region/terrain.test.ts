import { describe, expect, it } from 'vitest';
import { Vector3 } from 'three';
import { createRegionTerrainChunk, prepareRegionTerrain, regionHexWorld,
  terrainPlaceholderColor } from './terrain';
import { regionStaticFixture } from './test-fixture';

describe('region terrain chunks', () => {
  it('decodes 32 by 32 chunk slots into pointy-top geometry and terrain indices', () => {
    const source = regionStaticFixture(2, 1); const prepared = prepareRegionTerrain(source);
    expect(prepared.cells.get('0,0')).toMatchObject({ height: 0, layer: 0, slot: 0 });
    expect(prepared.cells.get('1,0')).toMatchObject({ height: 2, layer: 1, slot: 1 });
    const chunk = createRegionTerrainChunk(source, source.chunks[0]!, prepared);
    expect(chunk).toMatchObject({ q: 0, r: 0, cellCount: 2 });
    expect(chunk.cellByTriangle).toContainEqual({ q: 0, r: 0 });
    expect(chunk.cellByTriangle).toContainEqual({ q: 1, r: 0 });
    expect(chunk.mesh.geometry.getAttribute('position').count).toBeGreaterThan(36);
    const bytes = chunk.indexTexture.image.data;
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect((bytes as Uint8Array)[0]).toBe(0);
    expect((bytes as Uint8Array)[4]).toBe(1);
    const point = regionHexWorld(1, 0, 2, new Vector3());
    expect(point.x).toBeCloseTo(Math.sqrt(3) * 2 / 3);
    expect(point.y).toBe(2); expect(point.z).toBe(0);
    chunk.dispose();
  });

  it('keeps stable placeholder families until production texture layers arrive', () => {
    expect(terrainPlaceholderColor('tr_caodi')).toBe(0x74845a);
    expect(terrainPlaceholderColor('tr_shenshui')).toBe(0x355f71);
    expect(terrainPlaceholderColor('tr_xuanya')).toBe(0x5e554b);
    expect(terrainPlaceholderColor('tr_unknown')).toBe(0x9a8d68);
  });

  it('places authored water below the cell surface and honours ramp vertices', () => {
    const base = regionStaticFixture(2, 1); const source = base.chunks[0]!;
    const view = { ...base, chunks: [{ ...source, ramps: [{ index: 0, dir: 0 }],
      water: [{ index: 1, kind: 'deep' as const, flowDir: null, shoreDistance: null }] }] };
    const prepared = prepareRegionTerrain(view);
    const chunk = createRegionTerrainChunk(view, view.chunks[0]!, prepared);
    const terrainY = chunk.mesh.geometry.getAttribute('position');
    const ys = Array.from({ length: terrainY.count }, (_, index) => terrainY.getY(index));
    expect(Math.min(...ys)).toBeLessThan(0); expect(Math.max(...ys)).toBe(2);
    const waterY = chunk.waterMesh!.geometry.getAttribute('position');
    expect(waterY.getY(0)).toBeCloseTo(1.85);
    chunk.dispose();
  });
});
