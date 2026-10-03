import { describe, expect, it } from 'vitest';
import { applyItemText, projectItem } from '../selectors/items';
import { ItemTextCache, ITEM_TEXT_PLACEHOLDER, loadGameContent } from './item-content';
import { fixtureContent, fixtureItemPack } from './test-fixture';

describe('item content leaves', () => {
  it('loads verified rules without reading text and preserves rule behavior', async () => {
    const fixture = await fixtureItemPack();
    const inline = fixtureContent();
    const loaded = await loadGameContent(inline, fixture.source, 'ch01_tianlong');
    expect(loaded.contentHash).toBe(fixture.manifest.contentHash);
    expect(loaded.items.map((item) => item.id)).toEqual(inline.items.map((item) => item.id));
    expect(loaded.items.every((item) => item.text === undefined)).toBe(true);
    expect(loaded.items).toEqual(inline.items.map((item) => {
      const rule = { ...item }; delete rule.text; return rule;
    }));
    expect(fixture.reads).toEqual(['ch01_tianlong/manifest.json',
      'ch01_tianlong/common.rules.items.json']);
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
