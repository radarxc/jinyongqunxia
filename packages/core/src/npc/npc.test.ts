import { describe, expect, it } from 'vitest';
import { EMPTY_NPC_WORLD, despawnNpc, queryNpcPresence, setNpcRelationship, spawnNpc } from '.';

describe('NPC world state', () => {
  it('spawns idempotently and rejects a conflicting duplicate projection', () => {
    const dali = { npcId: 'npc_duanyu', eraLayer: 'ch01', sceneId: 'sc_01_dali',
      anchor: 'gate', sourceLineId: 'main', sourceNodeId: 'n_spawn' };
    const state = spawnNpc(EMPTY_NPC_WORLD, dali);
    expect(spawnNpc(state, dali)).toEqual(state);
    expect(() => spawnNpc(state, { ...dali, sceneId: 'sc_01_wuliangyidao' }))
      .toThrow('NPC_PRESENCE_CONFLICT');
    expect(queryNpcPresence(despawnNpc(state, dali.npcId, dali.eraLayer),
      dali.npcId, dali.eraLayer)).toBeUndefined();
  });

  it('applies relationship deltas and clamps each scale', () => {
    let state = setNpcRelationship(EMPTY_NPC_WORLD, 'npc_duanyu',
      { affinity: 80, bond: 90, resentment: 10 });
    state = setNpcRelationship(state, 'npc_duanyu',
      { affinity: 30, bond: 20, resentment: -20 });
    expect(state.relationships).toEqual([{ npcId: 'npc_duanyu',
      affinity: 100, bond: 100, resentment: 0 }]);
  });
});
