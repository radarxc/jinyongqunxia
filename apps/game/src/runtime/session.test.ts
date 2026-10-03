import { describe, expect, it } from 'vitest';
import { createBattleDemo } from '../battle/demo';
import { createGameSession } from './session';
import { createPreviewSession } from './bootstrap';
import { fixtureContent } from './test-fixture';
import { createNewGameState, FIRST_SLEEP_RULE } from '@tianshu/core';
import { regionFixtureMap } from './region-test-fixture';

describe('Worker session command adapter', () => {
  const content = fixtureContent();
  const sleepPlan = { id: '00000000-0000-4000-8000-000000000017',
    from: 'ch00_yuenv', to: 'ch10_baima', targetTier: 'LOW' as const,
    sleepEventId: 'slp_first_changbai', skills: { martial: [], inner: [] },
    convert: { forget: [], dissipate: [] }, equips: [],
    sleepAlloc: Object.fromEntries(FIRST_SLEEP_RULE.keys.map((key) => [key, 50])),
    acknowledged: [], allocationSource: 'balanced' as const,
    allocationRuleVersion: FIRST_SLEEP_RULE.version };
  function withAmbush(invalid = false, riskBaseBp = 10_000): typeof content {
    const demo = createBattleDemo('town'); const hero = 'npc_zhujue'; const enemy = 'npc_attacker';
    const definition = content.towns![0]!;
    return { ...content, towns: [{ ...definition, anchors: definition.anchors.map((anchor) =>
      anchor.id === 'anchor_meditation_bi_0021' ? { ...anchor, riskBaseBp } : anchor) }],
      meditationEncounters: [{ sceneId: 'city_dali', anchorId: 'anchor_meditation_bi_0021',
        attackerId: enemy, setup: { encounterId: 'enc_town_meditation_test',
          setupId: 'town-ambush-test', seed: 7, sourceSnapshotHash: '0'.repeat(64),
          participants: demo.setup.participants.map((row, index) => ({ ...row,
            unitRef: index === 0 ? hero : enemy })), meditationUnitRefs: [hero] },
        launch: { seeds: demo.seeds.map((row, index) => ({ ...row, id: index === 0 ? hero : enemy })),
          cells: invalid ? [] : demo.cells, markers: demo.markers.map((row, index) => ({ ...row,
            id: index === 0 ? hero : enemy })), moves: demo.moves, title: '打坐遇袭', preview: true } }] };
  }
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
    expect((await core.snapshot()).party).toEqual(original.party);
  });
  it('uses ENG-06 recovery, persists the ledger, and refreshes only affected projections', async () => {
    const initial = createPreviewSession(content);
    const protagonist = initial.profile.protagonist!;
    const core = createGameSession(content, { ...initial, profile: { ...initial.profile, protagonist: {
      ...protagonist, resources: { hp: 100, mp: 100 },
    }, companions: [] } });
    const update = await core.dispatch({ t: 'inventory/use', itemId: 'it_jinchuangyao', targetId: protagonist.characterId });
    expect(update.accepted).toBe(true);
    expect(update.changes.hud?.hp.current).toBe(117); // 100 + floor(342 * 500 / 10000)
    expect(update.changes.inventory?.find((item) => item.id === 'it_jinchuangyao')?.count).toBe(2);
    expect(update.changes.equipment).toBeUndefined();
    expect((await core.snapshot()).profile.protagonist?.resources.hp).toBe(117);
  });
  it('rejects partial unsupported effects and an invalid restore without touching the active state', async () => {
    const core = createGameSession(content); const before = await core.snapshot();
    expect((await core.dispatch({ t: 'inventory/use', itemId: 'it_dahuandan', targetId: 'npc_zhujue' })).accepted).toBe(false);
    expect(await core.snapshot()).toEqual(before);
    const corrupted = { ...before, meta: { ...before.meta, rngProtocol: 999 } };
    await expect(core.restore(corrupted)).rejects.toThrow('SAVE_PROTOCOL_UNSUPPORTED');
    expect(await core.snapshot()).toEqual(before);
    await core.dispatch({ t: 'world/tick' }); await core.restore(before);
    expect(await core.snapshot()).toEqual(before);
  });
  it('exposes the allocation query only after settlement and removes it after wake', async () => {
    const source = { ...content, contentHash: 'a'.repeat(64), chapters: [{
      schemaVersion: 'book-world.v1' as const, id: 'ch00_yuenv', eraLayerId: 'ch00',
      gameYear: { start: -482, end: -482, approx: true }, worldTier: 'LOW' as const,
      levelCap: 10, layerCap: 9, foreignSuppression: 4, startTick: 0, countsRealLevel: false,
      wake: { regionId: 'rg_jiangnan_taihu', sceneId: 'sc_00_zhulin', spawnId: 'bookfall' },
    }] };
    const target = { ...content, contentHash: 'b'.repeat(64), chapters: [{
      schemaVersion: 'book-world.v1' as const, id: 'ch10_baima', eraLayerId: 'ch10',
      gameYear: { start: 702, end: 703, approx: true }, worldTier: 'LOW' as const,
      levelCap: 20, layerCap: 8, foreignSuppression: 4, startTick: 0, countsRealLevel: true,
      wake: { regionId: 'rg_xiyu_beijiang', sceneId: 'sc_10_fengshi_feiyi',
        spawnId: 'cold_open' },
    }] };
    const state = createNewGameState({ masterSeed: 7, contentHash: source.contentHash,
      identity: { name: '沈砚', gender: 'female', appearance: 'hero_f01', pronoun: '她',
        originId: 'origin_wenshiguan' }, difficulty: 'diff_xiake', chapter: source.chapters[0]! });
    const core = createGameSession(source, state, undefined, { demo: false,
      preloadChapter: async () => target, preloadRegion: async () => [] });
    expect((await core.query()).firstSleepAllocation).toBeNull();
    await core.dispatch({ t: 'quest/choose', questId: 'dc_00_01', optionId: 'skip' });
    const settled = await core.dispatch({ t: 'quest/choose', questId: 'dc_00_01',
      optionId: 'skip', phase: 'settle', completionNodeId: 'n_skip_complete' });
    expect(settled.changes.firstSleepAllocation).toMatchObject({
      ruleVersion: 'first-sleep.v1', requiredTotal: 300, lockedKeys: ['luk', 'cha'] });
    const woke = await core.dispatch({ t: 'chapter/bookSleep', plan: sleepPlan });
    expect(woke.accepted).toBe(true); expect(woke.changes.firstSleepAllocation).toBeNull();
    expect((await core.snapshot()).world.navigation.pendingMount).toEqual(target.chapters[0]!.wake);
  });
  it('does not create battle-use counters when a field item has no chapter cap', async () => {
    const core = createGameSession(content);
    const result = await core.dispatch({ t: 'inventory/use', itemId: 'it_jinchuangyao', targetId: 'npc_zhujue' });
    expect(result.accepted).toBe(true);
    expect((await core.snapshot()).chapter.itemChapterUses).toEqual({});
  });
  it('rejects foreign preview mode, wrong-slot equipment and malformed use state atomically', async () => {
    const core = createGameSession(content); const original = await core.snapshot();
    await expect(core.restore({ ...original, meta: { ...original.meta, debugTainted: false } })).rejects.toThrow('SAVE_MODE_INVALID');
    const badEquipment = { ...original, party: { ...original.party,
      equipment: { entries: original.party.equipment.entries.map((entry) => entry.slot === 'feet'
        ? { ...entry, itemId: 'eq_qinggangjian' } : entry) } } };
    await expect(core.restore(badEquipment)).rejects.toThrow('SAVE_EQUIPMENT_INVALID');
    const badCounters = { ...original, chapter: { ...original.chapter, itemChapterUses: [] } } as unknown as typeof original;
    await expect(core.restore(badCounters)).rejects.toThrow('STATE_SHAPE');
    expect(await core.snapshot()).toEqual(original);
  });
  it('keeps the published world event compatible with ENG-02 subscribers', async () => {
    const core = createGameSession(content); const before = await core.snapshot();
    const result = await core.dispatch({ t: 'world/tick' });
    expect(result.events[0]).toEqual({ t: 'world/ticked', seq: before.meta.nextEventSeq,
      stateVersion: before.meta.stateVersion + 1, causeId: `${before.meta.stateVersion + 1}:${before.meta.nextRuntimeOrdinal}`,
      parentSeq: null, payload: { worldTick: before.meta.worldTick + 1 } });
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
  it('forwards map commands to core and stores no writable app sidecar', async () => {
    const core = createGameSession(content);
    const before = await core.snapshot();
    expect(before.chapter.worldMap?.position).toEqual({ kind: 'node', nodeId: 'city_dali' });
    expect(before).not.toHaveProperty('worldmap');
    const result = await core.dispatch({ t: 'worldmap/enter' });
    expect(result.accepted).toBe(true);
    expect(result.events.some((event) => event.t === 'worldmap/sceneRequested')).toBe(true);
    const after = await core.snapshot();
    expect(after).not.toHaveProperty('worldmap');
    expect(after.chapter.worldMap?.scene).toMatchObject({
      kind: 'town', nodeId: 'city_dali', gateId: 'south_gate',
    });
    expect(after.chapter.town).toMatchObject({ sceneId: 'city_dali', point: [5, 88],
      buildingId: null, buildingPhase: 'outside' });
    expect(result.changes.townRuntime?.cityId).toBe('city_dali');
  });

  it('loads a town definition on demand before committing world-map entry', async () => {
    const definition = content.towns![0]!; const withoutTowns = Object.fromEntries(
      Object.entries(content).filter(([key]) => key !== 'towns')) as typeof content;
    const loads: string[] = [];
    const core = createGameSession(withoutTowns, createPreviewSession(withoutTowns), async (sceneId) => {
      loads.push(sceneId); return sceneId === definition.sceneId ? definition : null;
    });
    const entered = await core.dispatch({ t: 'worldmap/enter' });
    expect(entered.accepted).toBe(true); expect(loads).toEqual(['city_dali']);
    expect(entered.changes.townRuntime?.sceneId).toBe('city_dali');
  });

  it('preloads a RegionMap before mount and sends static geometry only for the mount patch', async () => {
    const map = regionFixtureMap(); const initial = createNewGameState({ masterSeed: 7,
      identity: { name: '沈砚', gender: 'female', appearance: 'hero_f01', pronoun: '她',
        originId: 'origin_wenshiguan' }, difficulty: 'diff_xiake' });
    const loads: string[] = [];
    const core = createGameSession(content, initial, undefined, { demo: false,
      preloadRegion: async (chapterId, regionId) => {
        loads.push(chapterId + '/' + regionId); return [map];
      } });
    const mounted = await core.dispatch({ t: 'world/mountRegion', regionId: 'rg_fixture',
      sceneId: 'sc_00_zhulin', spawnId: 'bookfall' });
    expect(mounted.accepted).toBe(true); expect(loads).toEqual(['ch00_yuenv/rg_fixture']);
    expect(mounted.changes.regionStatic).toMatchObject({ sceneId: 'sc_00_zhulin',
      regionId: 'rg_fixture' });
    const walked = await core.dispatch({ t: 'world/walkTo', hex: { q: 1, r: 0 } });
    expect(walked.accepted).toBe(true); expect(walked.changes).not.toHaveProperty('regionStatic');
    expect(walked.changes.region).toMatchObject({ playerHex: { q: 1, r: 0 }, facing: 0 });
    expect((await core.query()).regionStatic).toMatchObject({ sceneId: 'sc_00_zhulin' });
    const beforePreview = await core.snapshot();
    const preview = await core.dispatch({ t: 'world/previewRegionPath', hex: { q: 2, r: 0 } });
    expect(preview).toMatchObject({ accepted: true, events: [], changes: {
      regionPathPreview: { ok: true, preview: { destination: { q: 2, r: 0 }, cost: 1 } },
    } });
    expect(await core.snapshot()).toEqual(beforePreview);
    const moved = await core.dispatch({ t: 'world/walkTo', hex: { q: 2, r: 0 } });
    expect(moved.changes.regionPathPreview).toBeNull();
  });

  it('keeps state unchanged when region preload fails or supplies a mismatched package', async () => {
    const initial = createNewGameState({ masterSeed: 7,
      identity: { name: '沈砚', gender: 'female', appearance: 'hero_f01', pronoun: '她',
        originId: 'origin_wenshiguan' }, difficulty: 'diff_xiake' });
    const loaders = [
      { loader: async () => { throw new Error('offline'); }, error: 'REGION_UNAVAILABLE' },
      { loader: async () => [{ ...regionFixtureMap(), regionId: 'rg_other' }],
        error: 'REGION_CONTENT_MISMATCH' },
    ] as const;
    for (const row of loaders) {
      const core = createGameSession(content, initial, undefined, { demo: false,
        preloadRegion: row.loader }); const before = await core.snapshot();
      const update = await core.dispatch({ t: 'world/mountRegion', regionId: 'rg_fixture',
        sceneId: 'sc_00_zhulin', spawnId: 'bookfall' });
      expect(update).toMatchObject({ accepted: false, error: row.error, changes: {}, events: [] });
      expect(await core.snapshot()).toEqual(before);
    }
    let validLoads = 0;
    const badSpawn = createGameSession(content, initial, undefined, { demo: false,
      preloadRegion: async () => { validLoads += 1; return [regionFixtureMap()]; } });
    const before = await badSpawn.snapshot();
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const update = await badSpawn.dispatch({ t: 'world/mountRegion', regionId: 'rg_fixture',
        sceneId: 'sc_00_zhulin', spawnId: 'missing_spawn' });
      expect(update).toMatchObject({ accepted: false, error: 'REGION_SPAWN_UNKNOWN',
        changes: {}, events: [] });
      expect(await badSpawn.snapshot()).toEqual(before);
    }
    expect(validLoads).toBe(2);
  });

  it('maps lazy subsystem failures to stable recoverable codes without committing state', async () => {
    const initial = createNewGameState({ masterSeed: 7,
      identity: { name: '沈砚', gender: 'female', appearance: 'hero_f01', pronoun: '她',
        originId: 'origin_wenshiguan' }, difficulty: 'diff_xiake' });
    const before = structuredClone(initial);
    const battle = createGameSession(content, initial, undefined, { demo: false,
      subsystemLoaders: { battle: async () => { throw new Error('network'); } } });
    await expect(battle.dispatch({ t: 'battle/enter', launch: createBattleDemo('world') }))
      .rejects.toThrow('BATTLE_SUBSYSTEM_UNAVAILABLE');
    expect(await battle.snapshot()).toEqual(before);

    const region = createGameSession({ ...content, regionMaps: [regionFixtureMap()] }, initial,
      undefined, { demo: false, subsystemLoaders: { region: async () => {
        throw new Error('network');
      } } });
    await expect(region.dispatch({ t: 'world/previewRegionPath', hex: { q: 1, r: 0 } }))
      .rejects.toThrow('REGION_SUBSYSTEM_UNAVAILABLE');
    expect(await region.snapshot()).toEqual(before);

    const dialogue = createGameSession(content, initial, undefined, { demo: false,
      subsystemLoaders: { dialogueProjection: async () => { throw new Error('network'); } } });
    await expect(dialogue.query()).rejects.toThrow('DIALOGUE_SUBSYSTEM_UNAVAILABLE');
    expect(await dialogue.snapshot()).toEqual(before);
  });

  it('preloads mounted RegionMap content before restoring a save and preserves state on failure', async () => {
    const map = regionFixtureMap(); const initial = createNewGameState({ masterSeed: 7,
      identity: { name: '沈砚', gender: 'female', appearance: 'hero_f01', pronoun: '她',
        originId: 'origin_wenshiguan' }, difficulty: 'diff_xiake' });
    const source = createGameSession({ ...content, regionMaps: [map] }, initial, undefined,
      { demo: false });
    await source.dispatch({ t: 'world/mountRegion', regionId: 'rg_fixture',
      sceneId: 'sc_00_zhulin', spawnId: 'bookfall' });
    const saved = await source.snapshot(); const loads: string[] = [];
    const restored = createGameSession(content, initial, undefined, { demo: false,
      preloadRegion: async (chapterId, regionId) => {
        loads.push(chapterId + '/' + regionId); return [map];
      } });
    const update = await restored.restore(saved);
    expect(loads).toEqual(['ch00_yuenv/rg_fixture']);
    expect(await restored.snapshot()).toEqual(saved);
    expect(update.changes.regionStatic).toMatchObject({ sceneId: 'sc_00_zhulin' });

    const unavailable = createGameSession(content, initial, undefined, { demo: false,
      preloadRegion: async () => { throw new Error('offline'); } });
    const before = await unavailable.snapshot();
    await expect(unavailable.restore(saved)).rejects.toThrow('REGION_UNAVAILABLE');
    expect(await unavailable.snapshot()).toEqual(before);

    let stagedLoads = 0;
    const staged = createGameSession(content, initial, undefined, { demo: false,
      preloadRegion: async () => { stagedLoads += 1; return [map]; } });
    const invalid = { ...saved, party: { ...saved.party, inventory: {
      ...saved.party.inventory, stacks: [{ itemId: 'it_missing', count: 1 }],
    } } };
    await expect(staged.validate(invalid)).rejects.toThrow('INVENTORY_ITEM_UNKNOWN');
    await expect(staged.restore(invalid)).rejects.toThrow('INVENTORY_ITEM_UNKNOWN');
    const mounted = await staged.dispatch({ t: 'world/mountRegion', regionId: 'rg_fixture',
      sceneId: 'sc_00_zhulin', spawnId: 'bookfall' });
    expect(mounted.accepted).toBe(true);
    expect(stagedLoads).toBe(3);
  });

  it('moves through core, resolves location anchors, and enters a selected shared door', async () => {
    const local = { ...content, townEventAnchors: [{ id: 'anchor_test_enter', kind: 'location' as const,
      sceneId: 'city_dali', trigger: 'enter' as const, lineId: 'sl_test', nodeId: 'arrive',
      point: { q: 6, r: 88 } }] };
    const core = createGameSession(local); await core.dispatch({ t: 'worldmap/enter' });
    const moved = await core.dispatch({ t: 'town/move', destination: [6, 88] });
    expect(moved.accepted).toBe(true);
    expect(moved.changes.town?.scene.actor.point).toEqual([6, 88]);
    expect(moved.changes.town?.movementPath).toEqual([[5, 88], [6, 88]]);
    expect(moved.events.some((event) => event.t === 'town/anchorRequested')).toBe(true);
    const entering = await core.dispatch({ t: 'town/move', destination: [-10, 78],
      buildingId: 'bi_0020' });
    expect(entering.changes.town?.scene).toMatchObject({
      activeBuildingId: 'bi_0020', buildingPhase: 'fading-in' });
    await core.dispatch({ t: 'town/settle-building' });
    const shop = await core.dispatch({ t: 'town/interact' });
    expect(shop.events.some((event) => event.t === 'town/shopRequested')).toBe(true);
    await core.dispatch({ t: 'town/exit-building' });
    await core.dispatch({ t: 'town/settle-building' });
    expect((await core.snapshot()).chapter.town?.buildingPhase).toBe('outside');
  });

  it('forwards safe meditation and projects the core transaction', async () => {
    const initial = createPreviewSession(content); const protagonist = initial.profile.protagonist!;
    const injured = { ...initial, profile: { ...initial.profile,
      protagonist: { ...protagonist, resources: { hp: 1, mp: 1 } } } };
    const core = createGameSession(content, injured); await core.dispatch({ t: 'worldmap/enter' });
    await core.dispatch({ t: 'town/move', destination: [-2, 78], buildingId: 'bi_0021' });
    await core.dispatch({ t: 'town/settle-building' });
    const before = await core.snapshot();
    const result = await core.dispatch({ t: 'town/meditate',
      anchorId: 'anchor_meditation_bi_0021', plannedTicks: 600 });
    const after = await core.snapshot();
    expect(result.accepted).toBe(true); expect(result.changes.battle).toBeUndefined();
    expect(result.events.some((event) => event.t === 'town/meditationCompleted')).toBe(true);
    expect(result.changes.hud?.hp.current).toBe(after.profile.protagonist?.resources.hp);
    expect(after.meta.stateVersion).toBe(before.meta.stateVersion + 1);
  });

  it('assembles the battle page from a core meditation-ambush result', async () => {
    const core = createGameSession(withAmbush());
    await core.dispatch({ t: 'worldmap/enter' });
    await core.dispatch({ t: 'town/move', destination: [-2, 78], buildingId: 'bi_0021' });
    await core.dispatch({ t: 'town/settle-building' });
    const command = { t: 'town/meditate' as const, anchorId: 'anchor_meditation_bi_0021', plannedTicks: 600 };
    const result = await core.dispatch(command);
    expect(result.accepted).toBe(true);
    expect(result.changes.battle?.info?.setup).toMatchObject({ entry: { kind: 'meditationAmbush',
      meditationInterrupted: true }, start: { initiativeSide: 'enemy', initialEffects: [{
        unitRef: 'npc_zhujue', buffRef: 'bf_chaqi', remainingOwnActions: 3 }] } });
    expect(() => core.snapshot()).toThrow('BATTLE_SAVE_UNAVAILABLE');
  });

  it('rolls back the town state and RNG when an ambush launch is invalid', async () => {
    const core = createGameSession(withAmbush(true)); await core.dispatch({ t: 'worldmap/enter' });
    await core.dispatch({ t: 'town/move', destination: [-2, 78], buildingId: 'bi_0021' });
    await core.dispatch({ t: 'town/settle-building' }); const before = await core.snapshot();
    const result = await core.dispatch({ t: 'town/meditate',
      anchorId: 'anchor_meditation_bi_0021', plannedTicks: 600 });
    expect(result).toMatchObject({ accepted: false, error: 'BATTLE_LAUNCH_INVALID' });
    expect(await core.snapshot()).toEqual(before); expect((await core.query()).battle).toBeNull();
  });
});
