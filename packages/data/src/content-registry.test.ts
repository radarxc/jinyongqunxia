import { describe, expect, it } from 'vitest';
import { loadContent, parseContentFile, parseSerializedContent, serializeContentEntry } from './tooling';

const itemYaml = `
schemaVersion: item.v1
id: it_fixture
name: 夹具
kind: material
sub: ingredient
grade: 1
stack: 9
chapters: any
origin: expanded
price: auto
flags: []
assets: {icon: items/fixture.webp}
text: {desc: 测试夹具。}
extension:
  type: material
  value: {family: wood, resourceRef: res_fixture, materialGrade: 1, rare: false}
`;

describe('content registry', () => {
  it('round-trips a parsed schema entry without changing its value', () => {
    const entry = parseContentFile({ path: 'fixture.yaml', text: itemYaml });
    const reparsed = parseSerializedContent(entry.kind, serializeContentEntry(entry));
    expect(reparsed.value).toEqual(entry.value);
  });

  it('rejects YAML aliases, duplicate keys, and unknown schema versions', () => {
    expect(() => parseContentFile({
      path: 'alias.yaml',
      text: 'schemaVersion: item.v1\nid: &id it_fixture\nname: *id\n',
    })).toThrow();
    expect(() => parseContentFile({
      path: 'duplicate.yaml',
      text: 'schemaVersion: item.v1\nschemaVersion: item.v1\n',
    })).toThrow();
    expect(() => parseContentFile({
      path: 'unknown.yaml',
      text: 'schemaVersion: unknown.v1\n',
    })).toThrow('CONTENT_SCHEMA_VERSION');
  });

  it('builds a detached frozen registry with O(1) identity lookup', () => {
    const file = { path: 'fixture.yaml', text: itemYaml };
    const registry = loadContent([file]);
    expect(registry.get('item', 'it_fixture')).toBe(registry.items[0]);
    expect(registry.require('item', 'it_fixture')).toBe(registry.items[0]);
    expect(Object.isFrozen(registry)).toBe(true);
    expect(Object.isFrozen(registry.items)).toBe(true);
    expect(Object.isFrozen(registry.items[0])).toBe(true);
  });

  it('rejects duplicate global IDs and broken shop references', () => {
    expect(() => loadContent([
      { path: 'a.yaml', text: itemYaml },
      { path: 'b.yaml', text: itemYaml.replace('kind: material', 'kind: tool')
        .replace('type: material\n  value: {family: wood, resourceRef: res_fixture, materialGrade: 1, rare: false}', 'type: generic\n  value: {}') },
    ])).toThrow('CONTENT_DUPLICATE');
    expect(() => loadContent([{
      path: 'shop.yaml',
      text: `schemaVersion: shop.v1\nkey: fixture\nname: 夹具铺\nchapterId: ch01_tianlong\nsupply:\n  - {itemId: it_missing, maxGrade: 1, baseStock: 1, restockEveryDays: 1, restockAmount: 1, priceBp: 10000}\n`,
    }])).toThrow('CONTENT_REF');
  });
});
