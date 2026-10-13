import { describe, expect, it } from 'vitest';
import { createStaticActorCatalog, pickLod } from './catalog';
import type { ActorAssetSet, ActorLook, ActorRole } from './types';

function asset(name: string): ActorAssetSet {
  return {
    kind: 'glb',
    lod: [
      { url: `${name}/lod0.glb`, triangles: 25_000, textureSize: 1024 },
      { url: `${name}/lod1.glb`, triangles: 9_000, textureSize: 512 },
    ],
    clipsUrl: `${name}/clips.glb`, statureMu: 1, nativeHps: { walk: 0.612, run: 2.143 },
  };
}
function look(template: string, role: ActorRole = 'npc'): ActorLook {
  return { template, role, heightM: 1.81, outfit: 'default', seed: 1 };
}
function entry(template: string, role: ActorRole, name: string) {
  return { template, role, ...asset(name) };
}

describe('static actor3d catalog', () => {
  it('resolves an exact template and role', () => {
    const expected = entry('npc_named', 'named', 'named');
    const catalog = createStaticActorCatalog([
      entry('npc_named', 'npc', 'npc'), expected,
    ]);
    expect(catalog.resolve(look('npc_named', 'named'))).toBe(expected);
  });

  it('falls back an unknown tpl_m template to the generic male NPC', () => {
    const male = asset('male');
    const catalog = createStaticActorCatalog({ npc: { npc_generic_m: male } });
    expect(catalog.resolve(look('tpl_m_unpublished', 'player'))).toBe(male);
  });

  it('falls back tpl_f and throws the required code when no fallback can resolve', () => {
    const female = asset('female');
    const catalog = createStaticActorCatalog({ npc: { npc_generic_f: female } });
    expect(catalog.resolve(look('tpl_f_tall'))).toBe(female);
    expect(() => catalog.resolve(look('npc_missing'))).toThrow('ACTOR_TEMPLATE_UNKNOWN');
  });

  it('rejects duplicate template and role entries deterministically', () => {
    expect(() => createStaticActorCatalog([
      entry('npc_x', 'npc', 'a'), entry('npc_x', 'npc', 'b'),
    ])).toThrow('ACTOR_CATALOG_DUPLICATE');
  });
});

describe('actor3d LOD budgets', () => {
  it('uses LOD1 for every low-tier role', () => {
    for (const role of ['player', 'npc', 'named'] as const) expect(pickLod(role, 'low', 0)).toBe(1);
  });

  it('reserves the sole mid-tier full-detail slot for the player', () => {
    expect(pickLod('player', 'mid', 0)).toBe(0);
    expect(pickLod('npc', 'mid', 0)).toBe(1);
    expect(pickLod('named', 'mid', 0)).toBe(1);
  });

  it('reserves player plus two/five non-player slots for high and ultra', () => {
    expect([0, 1, 2].map(used => pickLod('npc', 'high', used))).toEqual([0, 0, 1]);
    expect([0, 4, 5].map(used => pickLod('named', 'ultra', used))).toEqual([0, 0, 1]);
  });

  it('keeps the player at LOD0 regardless of actor iteration order', () => {
    expect(pickLod('player', 'high', 0)).toBe(0);
    expect(pickLod('player', 'high', 2)).toBe(0);
    expect(pickLod('player', 'ultra', 0)).toBe(0);
    expect(pickLod('player', 'ultra', 5)).toBe(0);
  });
});
