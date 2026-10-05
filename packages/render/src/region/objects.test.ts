import { describe, expect, it } from 'vitest';
import type { InstancedMesh } from 'three';
import { collectRegionObjects, createRegionObjectLayer } from './objects';
import { prepareRegionTerrain } from './terrain';
import { regionStaticFixture } from './test-fixture';
import type { RegionObjectView } from './types';

const building: RegionObjectView = { id: 'bld_fixture', class: 'Building', q: 0, r: 0, h: 0,
  cells: [{ q: 0, r: 0, h: 0 }], footprint: { q: 0, r: 0, width: 1, height: 1 },
  interiorRect: { q: 0, r: 0, width: 1, height: 1 }, roofGroup: 'fg_fixture' };
const npc: RegionObjectView = { id: 'npc_fixture', class: 'NpcSpawn', q: 1, r: 0, h: 2,
  cells: [{ q: 1, r: 0, h: 2 }], npcId: 'npc_fixture' };

describe('region static objects', () => {
  it('unions top-level and chunk-local objects without duplicating projected entries', () => {
    const base = regionStaticFixture(2, 1);
    const view = { ...base, objects: [building],
      chunks: [{ ...base.chunks[0]!, objects: [building, npc] }] };
    expect(collectRegionObjects(view).map((object) => object.id)).toEqual(['bld_fixture', 'npc_fixture']);
    const layer = createRegionObjectLayer(view, prepareRegionTerrain(view));
    expect(layer.instanceCount).toBe(2);
    layer.dispose();
  });

  it('uses deco visual metadata for shadow and grouped dither fade', () => {
    const base = regionStaticFixture(2, 1);
    const view = { ...base, objects: [building], chunks: [{ ...base.chunks[0]!,
      decos: [{ id: 'deco_fixture', index: 0, occluder: true, castShadow: true,
        roof: true, fadeGroup: 'fg_fixture' }] }] };
    const layer = createRegionObjectLayer(view, prepareRegionTerrain(view));
    const deco = layer.group.getObjectByName('region-deco-instances') as InstancedMesh;
    const roof = layer.group.getObjectByName('region-roof-instances') as InstancedMesh;
    expect(deco.castShadow).toBe(true);
    layer.updateFocus({ q: 0, r: 0 }, 1, true);
    expect(deco.geometry.getAttribute('instanceFade').getX(0)).toBeCloseTo(.12);
    expect(roof.geometry.getAttribute('instanceFade').getX(0)).toBeCloseTo(.12);
    layer.updateFocus({ q: 8, r: 8 }, 1, true);
    expect(deco.geometry.getAttribute('instanceFade').getX(0)).toBe(1);
    expect(roof.geometry.getAttribute('instanceFade').getX(0)).toBe(1);
    layer.dispose();
  });
});
