import { describe, expect, it } from 'vitest';
import { createGameSession } from './session';
import { createPreviewSession } from './bootstrap';
import { fixtureContent } from './test-fixture';

describe('Worker session command adapter', () => {
  const content = fixtureContent();
  it('delegates equip and unequip atomically, preserves counts and rejects the wrong slot', async () => {
    const core = createGameSession(content);
    const original = await core.snapshot();
    const rejected = await core.dispatch({ t: 'inventory/equip', itemId: 'eq_qinggangjian', slot: 'feet' });
    expect(rejected.accepted).toBe(false); expect(rejected.events).toEqual([]);
    expect(await core.snapshot()).toEqual(original);
    const equipped = await core.dispatch({ t: 'inventory/equip', itemId: 'eq_qinggangjian', slot: 'mainHand' });
    expect(equipped.accepted).toBe(true); expect(equipped.changes.characters).toBeUndefined();
    expect(equipped.changes.equipment?.[0]?.item?.id).toBe('eq_qinggangjian');
    expect(equipped.changes.inventory?.some((item) => item.id === 'eq_qinggangjian')).toBe(false);
    await core.dispatch({ t: 'inventory/unequip', slot: 'mainHand' });
    expect((await core.snapshot()).state.party).toEqual(original.state.party);
  });
  it('uses ENG-06 recovery, persists the ledger, and refreshes only affected projections', async () => {
    const initial = createPreviewSession(content);
    const protagonist = initial.state.profile.protagonist!;
    const core = createGameSession(content, { ...initial, state: { ...initial.state, profile: { protagonist: {
      ...protagonist, resources: { hp: 100, mp: 100 },
    }, companions: [] } } });
    const update = await core.dispatch({ t: 'inventory/use', itemId: 'it_jinchuangyao', targetId: protagonist.characterId });
    expect(update.accepted).toBe(true);
    expect(update.changes.hud?.hp.current).toBe(117); // 100 + floor(342 * 500 / 10000)
    expect(update.changes.inventory?.find((item) => item.id === 'it_jinchuangyao')?.count).toBe(2);
    expect(update.changes.equipment).toBeUndefined();
    expect((await core.snapshot()).itemTargets[protagonist.characterId]?.hp).toBe(117);
  });
  it('rejects partial unsupported effects and an invalid restore without touching the active state', async () => {
    const core = createGameSession(content); const before = await core.snapshot();
    expect((await core.dispatch({ t: 'inventory/use', itemId: 'it_dahuandan', targetId: 'npc_zhujue' })).accepted).toBe(false);
    expect(await core.snapshot()).toEqual(before);
    const corrupted = { ...before, state: { ...before.state, meta: { ...before.state.meta, rngProtocol: 999 } } };
    expect(() => core.restore(corrupted)).toThrow('SAVE_VERSION_UNSUPPORTED');
    expect(await core.snapshot()).toEqual(before);
    await core.dispatch({ t: 'world/tick' }); await core.restore(before);
    expect(await core.snapshot()).toEqual(before);
  });
  it('does not apply the previous battle cap to field use and retains that battle ledger', async () => {
    const initial = createPreviewSession(content);
    const core = createGameSession(content, { ...initial, usage: { battleUses: { it_jinchuangyao: 999 }, chapterUses: {} } });
    const result = await core.dispatch({ t: 'inventory/use', itemId: 'it_jinchuangyao', targetId: 'npc_zhujue' });
    expect(result.accepted).toBe(true);
    expect((await core.snapshot()).usage.battleUses['it_jinchuangyao']).toBe(999);
  });
  it('rejects foreign preview mode, wrong-slot equipment and malformed use state atomically', async () => {
    const core = createGameSession(content); const original = await core.snapshot();
    expect(() => core.restore({ ...original, preview: false })).toThrow('SAVE_MODE_INVALID');
    const badEquipment = { ...original, state: { ...original.state, party: { ...original.state.party,
      equipment: { entries: original.state.party.equipment.entries.map((entry) => entry.slot === 'feet'
        ? { ...entry, itemId: 'eq_qinggangjian' } : entry) } } } };
    expect(() => core.restore(badEquipment)).toThrow('SAVE_EQUIPMENT_INVALID');
    const badCounters = { ...original, usage: { ...original.usage, battleUses: [] } } as unknown as typeof original;
    expect(() => core.restore(badCounters)).toThrow('SAVE_USAGE_INVALID');
    expect(await core.snapshot()).toEqual(original);
  });
  it('keeps the published world event compatible with ENG-02 subscribers', async () => {
    const core = createGameSession(content); const before = await core.snapshot();
    const result = await core.dispatch({ t: 'world/tick' });
    expect(result.events[0]).toEqual({ t: 'world/ticked', seq: before.state.meta.nextEventSeq,
      stateVersion: before.state.meta.stateVersion + 1, worldTick: before.state.meta.worldTick + 1 });
  });
  it('owns one battle, blocks journey writes and returns to the frozen source scene', async () => {
    const core = createGameSession(content);
    const entered = await core.dispatch({ t: 'battle/demo', source: 'town' });
    expect(entered.accepted).toBe(true); expect(entered.changes.battle?.info?.setup.returnContext.sceneRef).toBe('town');
    expect(entered.events[0]).toMatchObject({ t: 'battle/setupResolved',
      payload: { setupId: 'setup-fixture', participants: ['hero', 'enemy_0'] } });
    expect((await core.dispatch({ t: 'world/tick' })).error).toBe('BATTLE_BUSY');
    expect(() => core.snapshot()).toThrow('BATTLE_SAVE_UNAVAILABLE');
    let battle = (await core.query()).battle!; await core.dispatch({ t: 'battle/auto', enabled: true });
    while (!battle.result) {
      const update = await core.dispatch({ t: 'battle/step', revision: battle.revision });
      battle = { ...battle, ...update.changes.battle!, units: update.changes.battle?.units.length
        ? battle.units.map(unit => update.changes.battle!.units.find(next => next.id === unit.id) ?? unit) : battle.units };
    }
    const returned = await core.dispatch({ t: 'battle/leave' });
    expect(returned).toMatchObject({ accepted: true, changes: { battle: null },
      events: [{ t: 'battle/returned', payload: { sceneRef: 'town' } }] });
    expect((await core.query()).battle).toBeNull();
  });
});
