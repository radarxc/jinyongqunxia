import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildContent, splitContentEntry } from '@tianshu/data/build';
import { parseContentFile } from '@tianshu/data/tooling';
import { mapFromRegistration } from '@tianshu/data/schemas';
import { describe, expect, it } from 'vitest';
import { applyItemText, projectItem } from '../selectors/items';
import { ItemTextCache, ITEM_TEXT_PLACEHOLDER, loadGameContent } from './item-content';
import { createGameSession } from './session';
import { fixtureContent, fixtureItemPack } from './test-fixture';

describe('item content leaves', () => {
  it('loads the real compiled ch10 DTO and creates the preview session', async () => {
    const rootDir = resolve(import.meta.dirname, '../../../..');
    const result = await buildContent({ rootDir, chapter: 'ch10_baima', write: false });
    expect(result.diagnostics.filter((entry) => entry.severity === 'error')).toEqual([]);
    const built = result.chapters[0]!;
    const values = new Map<string, unknown>([[`ch10_baima/manifest.json`, built.manifest],
      ...built.leaves.map((leaf): [string, unknown] =>
        [`ch10_baima/${leaf.logicalName}`, leaf.value])]);
    const mapPath = 'content/world/ch10/map.yaml';
    const mapEntry = parseContentFile({ path: mapPath,
      text: await readFile(resolve(rootDir, mapPath), 'utf8') });
    const mapText = splitContentEntry(mapEntry).text;
    const sourceMap = mapFromRegistration(mapEntry.value);
    const loaded = await loadGameContent(fixtureContent(), { readJson: async (path) =>
      values.get(path) }, 'ch10_baima', async () => ({ assets: {}, mapText }));
    expect(loaded.npcs.map((npc) => npc.identity.name)).toEqual(['李文秀', '无名驿卒', '沈青禾']);
    const map = loaded.worldMaps?.[0];
    const dali = map?.nodes.find((node) => node.id === 'city_dali');
    expect(map).toMatchObject({ chapterId: 'ch10_baima', era: 'ch10', name: '白马啸西风' });
    expect(dali).toMatchObject({ name: '大理府', levelNote: '尚无区域强度配置',
      entry: { accessNote: '城门进入；内部场景由 ENG-09 装配' } });
    expect(map?.nodes.map(({ name, levelNote, entry, accessNote }) =>
      ({ name, levelNote, entry: entry.accessNote, accessNote })))
      .toEqual(sourceMap.nodes.map(({ name, levelNote, entry, accessNote }) =>
        ({ name, levelNote, entry: entry.accessNote, accessNote })));
    await expect(loadGameContent(fixtureContent(), { readJson: async (path) =>
      values.get(path) }, 'ch10_baima', async () => ({ assets: {}, mapText: {} })))
      .rejects.toThrow('ITEM_RULES_UNAVAILABLE:CONTENT_TEXT_REF_MISSING:' +
        'event.ev_10_ditu.actions.0.map.nodes.0.name');
    const session = createGameSession(loaded, undefined, undefined, { demo: true });
    expect((await session.snapshot())).toMatchObject({ meta: { debugTainted: true },
      chapter: { chapterId: 'ch10_baima' } });
  }, 15_000);

  it('loads compiled chapter DTOs and only the NPC display text', async () => {
    const fixture = await fixtureItemPack();
    const inline = fixtureContent();
    const loaded = await loadGameContent(inline, fixture.source, 'ch01_tianlong');
    expect(loaded.contentHash).toBe(fixture.manifest.contentHash);
    expect(loaded.items.map((item) => item.id)).toEqual(inline.items.map((item) => item.id));
    expect(loaded.items.every((item) => item.text === undefined)).toBe(true);
    expect(loaded.items).toEqual(inline.items.map((item) => {
      const rule = { ...item }; delete rule.text; return rule;
    }));
    expect(loaded.events).toEqual([{ schemaVersion: 'event.v1', id: 'ev_ch01_fixture',
      chapterId: 'ch01_tianlong', event: 'fixture/chapterLoaded', once: true,
      actions: [{ op: 'ui/showText', textKey: 'fixture.ch01_tianlong.event' }] }]);
    expect(loaded.npcs.map((npc) => npc.identity.name)).toEqual(['段誉', '钟灵', '萧峰']);
    expect(loaded.npcs.every((npc) => npc.identity.sourceWorks === undefined &&
      npc.sources === undefined)).toBe(true);
    expect(loaded.worldMaps?.[0]).toMatchObject({ chapterId: 'ch01_tianlong', era: 'ch01' });
    expect(loaded.worldMaps?.[0]?.nodes[0]).toMatchObject({ name: '完颜部聚落 / 生女真地（待考）',
      levelNote: '尚无区域强度配置',
      entry: { accessNote: '城门进入；内部场景由 ENG-09 装配' } });
    expect(fixture.reads).toEqual(['ch01_tianlong/manifest.json',
      'ch01_tianlong/ch01.rules.base.json',
      'ch01_tianlong/ch01.text.zh-Hans.base.json',
      'ch01_tianlong/common.rules.items.json',
      'ch01_tianlong/world.rules.era.ch01.json']);
  });

  it('rejects a tampered rule leaf with a recoverable error code', async () => {
    const fixture = await fixtureItemPack();
    fixture.values.set('ch01_tianlong/common.rules.items.json', []);
    await expect(loadGameContent(fixtureContent(), fixture.source, 'ch01_tianlong'))
      .rejects.toThrow('ITEM_RULES_UNAVAILABLE:CHAPTER_PACK_LEAF_HASH_MISMATCH');
  });

  it('loads item text once, caches it, and replaces only display fields', async () => {
    const fixture = await fixtureItemPack();
    const cache = new ItemTextCache(fixture.source, 'ch01_tianlong');
    const rule = { ...fixtureContent().items[1]! }; delete rule.text;
    const placeholder = projectItem(rule, 2, undefined, cache);
    expect(placeholder.name).toBe('金创药');
    expect(placeholder.description).toBe(ITEM_TEXT_PLACEHOLDER);
    expect(cache.get(rule.id)).toBeUndefined();
    const first = cache.load(); const repeated = cache.load();
    expect(repeated).toBe(first);
    await first; await cache.load();
    const projected = applyItemText(placeholder, cache);
    expect(projected.description).not.toBe(ITEM_TEXT_PLACEHOLDER);
    expect(projected.name).toBe(placeholder.name);
    expect(fixture.reads).toEqual(['ch01_tianlong/manifest.json',
      'ch01_tianlong/common.text.zh-Hans.items.json']);
  });
});
