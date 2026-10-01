import { describe, expect, it } from 'vitest';
import { EventAnchorRegistry } from '.';

describe('EventAnchorRegistry', () => {
  it('uses scene buckets, stable order, and trigger filtering', () => {
    const registry = new EventAnchorRegistry([
      { id: 'anchor_z', kind: 'location', sceneId: 'sc_01_dali', trigger: 'enter',
        lineId: 'main', nodeId: 'n_enter', point: { q: 1, r: 2 }, radius: 2 },
      { id: 'anchor_a', kind: 'npc', sceneId: 'sc_01_dali', trigger: 'interact',
        lineId: 'main', nodeId: 'n_talk', npcId: 'npc_duanyu' },
      { id: 'anchor_other', kind: 'location', sceneId: 'sc_01_wuliangyidao',
        trigger: 'map-enter', lineId: 'main', nodeId: 'n_arrive', point: { q: 0, r: 0 } },
    ]);
    expect(registry.queryScene('sc_01_dali').map(({ id }) => id)).toEqual(['anchor_a', 'anchor_z']);
    expect(registry.query('sc_01_dali', 'enter').map(({ id }) => id)).toEqual(['anchor_z']);
    expect(registry.match({ kind: 'npc', sceneId: 'sc_01_dali', trigger: 'interact',
      npcId: 'npc_duanyu' }).map(({ id }) => id)).toEqual(['anchor_a']);
    expect(registry.match({ kind: 'location', sceneId: 'sc_01_dali', trigger: 'enter',
      point: { q: 3, r: 1 } }).map(({ id }) => id)).toEqual(['anchor_z']);
    expect(registry.match({ kind: 'location', sceneId: 'sc_01_dali', trigger: 'enter',
      point: { q: 4, r: 1 } })).toEqual([]);
    expect(registry.queryScene('sc_missing')).toEqual([]);
  });

  it('rejects duplicate and malformed anchors', () => {
    const npc = { id: 'anchor_npc', kind: 'npc', sceneId: 'sc_01_dali',
      trigger: 'interact', lineId: 'main', nodeId: 'n_talk', npcId: 'npc_duanyu' } as const;
    expect(() => new EventAnchorRegistry([npc, npc])).toThrow('ANCHOR_DUPLICATE');
    expect(() => new EventAnchorRegistry([{ ...npc, npcId: undefined } as unknown as typeof npc]))
      .toThrow('ANCHOR_NPC');
    expect(() => new EventAnchorRegistry([{ ...npc, kind: 'location',
      npcId: undefined } as unknown as typeof npc]))
      .toThrow('ANCHOR_POINT');
  });
});
