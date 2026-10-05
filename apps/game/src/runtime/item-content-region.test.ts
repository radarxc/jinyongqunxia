import { Buffer } from 'node:buffer';
import { describe, expect, it } from 'vitest';
import { compileInk, createManifest, emitLeaves } from '@tianshu/data/build';
import type { ContentSource } from '@tianshu/data';
import type { RegionObject } from '@tianshu/data/schemas';
import { createNewGameState } from '@tianshu/core';
import type { JsonValue } from '@tianshu/shared';
import { loadRegionContent } from './item-content';
import { regionFixtureMap } from './region-test-fixture';
import { createGameSession } from './session';
import { fixtureContent } from './test-fixture';

const bindings = [{ kind: 'regionGate', id: 'gate_00_fixture', value: {
  schemaVersion: 'region-gate.v1', gateId: 'gate_00_fixture', chapter: 'ch00_yuenv',
  expression: { item: 'it_jinchuangyao' }, lockedTextKey: 'fixture.gate.locked',
} }, { kind: 'regionDialogue', id: 'sc_00_zhulin/npc_fixture', value: {
  schemaVersion: 'region-dialogue.v1', chapter: 'ch00_yuenv', sceneId: 'sc_00_zhulin',
  anchorId: 'npc_fixture', storyId: 'story_fixture', entryKey: 'opening',
} }, { kind: 'regionDialogue', id: 'sc_00_zhulin/silent_fixture', value: {
  schemaVersion: 'region-dialogue.v1', chapter: 'ch00_yuenv', sceneId: 'sc_00_zhulin',
  anchorId: 'silent_fixture', noDialogue: true,
} }, { kind: 'regionLoot', id: 'loot_00_fixture', value: {
  schemaVersion: 'region-loot.v1', lootRef: 'loot_00_fixture', chapter: 'ch00_yuenv',
  items: [{ itemId: 'it_jinchuangyao', count: 2 }],
} }] as unknown as JsonValue;

function interactiveMap() {
  const map = regionFixtureMap();
  const valid = new Uint8Array(128);
  for (const [q, r] of [[1, 0], [0, 1], [1, 1], [2, 1]] as const) {
    const index = r * 32 + q; valid[index >> 3] = valid[index >> 3]! | 1 << (index & 7);
  }
  const at = (id: string, q: number, r: number) => ({ id, q, r, h: 0, cells: [{ q, r, h: 0 }] });
  const objects: RegionObject[] = [
    { ...at('npc_fixture', 1, 0), class: 'NpcSpawn', npcId: 'npc_fixture' },
    { ...at('chest_fixture', 0, 1), class: 'Chest', lootRef: 'loot_00_fixture' },
    { ...at('bookfall', 1, 1), class: 'PlayerSpawn', facing: 0, safe: true, entry: true },
    { ...at('door_fixture', 2, 1), class: 'Door', mode: 'door', pairId: 'door_back',
      oneWay: false, targetRegionId: 'rg_fixture', targetSceneId: 'sc_00_zhulin',
      targetSpawnId: 'bookfall', lockedBy: 'gate_00_fixture' },
  ];
  return { ...map, chunks: [{ ...map.chunks[0]!, valid: Buffer.from(valid).toString('base64'),
    objects }], playerSpawns: ['bookfall'] };
}

async function source(region = 'rg_fixture', mapValue: JsonValue = [interactiveMap()] as unknown as JsonValue,
  bindingValue: JsonValue = { schemaVersion: 'region-bindings-leaf.v1', chapter: 'ch00_yuenv',
    regionId: 'rg_fixture', entries: bindings }): Promise<{
  source: ContentSource; reads: string[] }> {
  const chapter = 'ch00_yuenv';
  const leaves = await emitLeaves([
    { logicalName: 'ch00.rules.region.fixture.json', kind: 'rules', load: 'region',
      region, value: mapValue },
    { logicalName: 'ch00.rules.region.fixture.bindings.json', kind: 'rules', load: 'region',
      region, value: bindingValue },
  ]);
  const manifest = await createManifest(chapter, 'a'.repeat(64), leaves, []);
  const values = new Map<string, unknown>([[chapter + '/manifest.json', manifest],
    ...leaves.map((leaf): [string, unknown] => [chapter + '/' + leaf.logicalName, leaf.value])]);
  const reads: string[] = [];
  return { reads, source: { readJson: async (path) => { reads.push(path); return values.get(path); } } };
}

describe('region content preload', () => {
  it('loads maps and all runtime bindings from only the selected region leaves', async () => {
    const fixture = await source();
    await expect(loadRegionContent(fixture.source, 'ch00_yuenv', 'rg_fixture')).resolves.toEqual({
      maps: [interactiveMap()],
      gates: [{ gateId: 'gate_00_fixture', expression: { item: 'it_jinchuangyao' } }],
      dialogues: [{ sceneId: 'sc_00_zhulin', anchorId: 'npc_fixture',
        storyId: 'story_fixture', entryKey: 'opening' }],
      loot: [{ lootRef: 'loot_00_fixture',
        items: [{ itemId: 'it_jinchuangyao', count: 2 }] }],
    });
    expect(fixture.reads).toEqual(['ch00_yuenv/manifest.json',
      'ch00_yuenv/ch00.rules.region.fixture.bindings.json',
      'ch00_yuenv/ch00.rules.region.fixture.json']);
  });

  it('drives gate, NPC dialogue, and chest behavior from one loaded chapter leaf', async () => {
    const compiled = await compileInk('=== opening ===\n正文。\n-> END', `schemaVersion: inkmeta.v1
storyId: story_fixture
chapter: ch00_yuenv
entryKnots: [opening]
readFlags: []
commands: []
npcs: []
`, 'story_fixture.ink');
    const fixture = await source();
    const loaded = await loadRegionContent(fixture.source, 'ch00_yuenv', 'rg_fixture');
    const base = fixtureContent();
    const content = { ...base, inkStories: [{ storyId: compiled.storyId,
      storyHash: compiled.structure.storyHash, storyJson: compiled.storyJson }] };
    const state = createNewGameState({ masterSeed: 7, identity: { name: '沈砚', gender: 'female',
      appearance: 'hero_f01', pronoun: '她', originId: 'origin_wenshiguan' },
    difficulty: 'diff_xiake' });
    const session = createGameSession(content, state, undefined, { demo: false,
      preloadRegion: async () => loaded });
    expect((await session.dispatch({ t: 'world/mountRegion', regionId: 'rg_fixture',
      sceneId: 'sc_00_zhulin', spawnId: 'bookfall' })).accepted).toBe(true);
    expect((await session.dispatch({ t: 'world/interact', anchorId: 'door_fixture' })).error)
      .toBe('REGION_GATE_ITEM');
    const talked = await session.dispatch({ t: 'world/interact', anchorId: 'npc_fixture' });
    expect(talked).toMatchObject({ accepted: true, events: [{ t: 'dialogue/started',
      payload: { storyId: 'story_fixture', entryKey: 'opening' } }] });
    await session.dispatch({ t: 'dialogue/continue' });
    const opened = await session.dispatch({ t: 'world/interact', anchorId: 'chest_fixture' });
    expect(opened.events[0]).toMatchObject({ t: 'world/chestOpened', payload: {
      items: [{ itemId: 'it_jinchuangyao', count: 2 }] } });
    expect((await session.snapshot()).party.inventory.stacks).toContainEqual({
      itemId: 'it_jinchuangyao', count: 2 });
    expect((await session.dispatch({ t: 'world/interact', anchorId: 'door_fixture' })).events[0])
      .toMatchObject({ t: 'world/autosaveRequested' });
  });

  it('rejects missing, malformed, and cross-region leaves without treating bindings as empty', async () => {
    const missing = await source('rg_other');
    await expect(loadRegionContent(missing.source, 'ch00_yuenv', 'rg_fixture'))
      .rejects.toThrow('REGION_RULES_UNAVAILABLE:CONTENT_REGION_LEAF_MISSING');
    const malformed = await source('rg_fixture',
      [{ ...regionFixtureMap(), schemaVersion: 'bad' }] as unknown as JsonValue);
    await expect(loadRegionContent(malformed.source, 'ch00_yuenv', 'rg_fixture'))
      .rejects.toThrow('REGION_RULES_UNAVAILABLE');
    const malformedBindings = await source('rg_fixture', undefined, {
      schemaVersion: 'region-bindings-leaf.v1', chapter: 'ch00_yuenv', regionId: 'rg_fixture',
      entries: [{ kind: 'regionGate',
        id: 'gate_00_fixture', value: { schemaVersion: 'region-gate.v1' } }],
    } as unknown as JsonValue);
    await expect(loadRegionContent(malformedBindings.source, 'ch00_yuenv', 'rg_fixture'))
      .rejects.toThrow('REGION_RULES_UNAVAILABLE');
  });
});
