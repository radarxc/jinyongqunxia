import { describe, expect, it } from 'vitest';
import { compileInk } from './build/ink';
import { splitLeaf } from './build/leaves';
import { RegionBindingLeafSchema } from './schemas';
import { loadContent, parseContentFile } from './tooling';

const gate = (expression = '{flag: fl_10_opened}') => `schemaVersion: region-gate.v1
gateId: gate_10_fengshi_dongmen
chapter: ch10_baima
expression: ${expression}
lockedTextKey: ch10.coldEntry.interact.eastGateLocked
note: authoring only
`;
const dialogue = (entryKey = 'opening') => `schemaVersion: region-dialogue.v1
chapter: ch10_baima
sceneId: sc_10_fixture
anchorId: npc_fixture
storyId: story_binding_fixture
entryKey: ${entryKey}
condition: {flag: fl_10_opened}
`;
const noDialogue = `schemaVersion: region-dialogue.v1
chapter: ch10_baima
sceneId: sc_10_fixture
anchorId: silent_fixture
noDialogue: true
`;
const loot = (itemId = 'it_fixture') => `schemaVersion: region-loot.v1
lootRef: loot_10_fixture
chapter: ch10_baima
items:
  - {itemId: ${itemId}, count: 2}
`;
const item = `schemaVersion: item.v1
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
const file = (folder: string, name: string, text: string) => ({
  path: `content/chapters/ch10_baima/bindings/${folder}/${name}.yaml`, text,
});

async function ink() {
  return compileInk(`=== opening ===
#ts:flag/set flagId=fl_10_opened value=true
正文。
-> END`, `schemaVersion: inkmeta.v1
storyId: story_binding_fixture
chapter: ch10_baima
entryKnots: [opening]
readFlags: []
commands: [flag/set]
npcs: []
`, 'content/story/ch10/story_binding_fixture.ink');
}

describe('region binding content', () => {
  it('parses strict gate, dialogue, no-dialogue, and loot records', () => {
    expect(parseContentFile(file('gates', 'gate', gate()))).toMatchObject({
      kind: 'regionGate', value: { gateId: 'gate_10_fengshi_dongmen' },
    });
    expect(parseContentFile(file('dialogues', 'talk', dialogue()))).toMatchObject({
      kind: 'regionDialogue', value: { entryKey: 'opening' },
    });
    expect(parseContentFile(file('dialogues', 'silent', noDialogue))).toMatchObject({
      kind: 'regionDialogue', value: { noDialogue: true },
    });
    expect(parseContentFile(file('loot', 'chest', loot()))).toMatchObject({
      kind: 'regionLoot', value: { items: [{ itemId: 'it_fixture', count: 2 }] },
    });
  });

  it('rejects invalid IDs, counts, unknown fields, and ambiguous dialogue branches', () => {
    expect(() => parseContentFile(file('gates', 'gate', gate().replace(
      'gate_10_fengshi_dongmen', 'q_10_main_c_01')))).toThrow();
    expect(() => parseContentFile(file('loot', 'chest', loot().replace('count: 2', 'count: 0'))))
      .toThrow();
    expect(() => parseContentFile(file('gates', 'gate', gate() + 'extra: true\n'))).toThrow();
    expect(() => parseContentFile(file('dialogues', 'mixed', dialogue() + 'noDialogue: true\n'))).toThrow();
  });

  it('requires the canonical binding directory, kind folder, and matching chapter', () => {
    expect(() => loadContent([{ path: 'content/common/gate.yaml', text: gate() }]))
      .toThrow('CONTENT_BINDING_PATH:content/common/gate.yaml');
    expect(() => loadContent([file('loot', 'gate', gate())]))
      .toThrow('CONTENT_BINDING_KIND:content/chapters/ch10_baima/bindings/loot/gate.yaml');
    expect(() => loadContent([file('gates', 'gate', gate().replace(
      'chapter: ch10_baima', 'chapter: ch01_tianlong'))]))
      .toThrow('CONTENT_BINDING_CHAPTER:content/chapters/ch10_baima/bindings/gates/gate.yaml');
  });

  it('keeps every oversized binding leaf shard independently parseable', () => {
    const entries = Array.from({ length: 8 }, (_, index) => ({ kind: 'regionDialogue',
      id: `sc_10_fixture/npc_${index}`, value: { schemaVersion: 'region-dialogue.v1',
        chapter: 'ch10_baima', sceneId: 'sc_10_fixture', anchorId: `npc_${index}`,
        noDialogue: true } }));
    const parts = splitLeaf({ logicalName: 'ch10.rules.rg-fixture.bindings.json',
      kind: 'rules', load: 'region', region: 'rg_fixture', value: {
        schemaVersion: 'region-bindings-leaf.v1', chapter: 'ch10_baima',
        regionId: 'rg_fixture', entries } }, 500);
    expect(parts.length).toBeGreaterThan(1);
    expect(parts.every((part) => RegionBindingLeafSchema.safeParse(part.value).success)).toBe(true);
  });

  it('resolves item, Ink story, entry knot, and Ink-produced flag references', async () => {
    const compiled = await ink();
    const registry = loadContent([file('gates', 'gate', gate()),
      file('dialogues', 'talk', dialogue()), file('dialogues', 'silent', noDialogue),
      file('loot', 'chest', loot()), { path: 'content/items/it_fixture.yaml', text: item }],
    { inks: [compiled] });
    expect(registry.regionGates).toHaveLength(1);
    expect(registry.regionDialogues).toHaveLength(2);
    expect(registry.regionLoot).toHaveLength(1);
  });

  it.each([
    ['quest', gate('{quest: q_10_main_c_01, state: active}'), 'CONTENT_REF:', 'quest:q_10_main_c_01'],
    ['flag', gate('{flag: fl_10_missing}'), 'CONTENT_REF:', 'flag:fl_10_missing'],
    ['item', loot('it_missing'), 'CONTENT_REF:', 'item:it_missing'],
    ['story', dialogue().replace('story_binding_fixture', 'story_missing'),
      'CONTENT_REF:', 'inkStory:story_missing'],
    ['knot', dialogue('missing'), 'CONTENT_REF:', 'inkKnot:story_binding_fixture:missing'],
  ])('rejects an unregistered %s reference', async (_name, source, prefix, detail) => {
    const compiled = await ink();
    const folder = source.startsWith('schemaVersion: region-gate') ? 'gates' :
      source.startsWith('schemaVersion: region-loot') ? 'loot' : 'dialogues';
    expect(() => loadContent([file(folder, 'broken', source),
      { path: 'content/items/it_fixture.yaml', text: item }], { inks: [compiled] }))
      .toThrow(`${prefix}content/chapters/ch10_baima/bindings/${folder}/broken.yaml:${detail}`);
  });
});
