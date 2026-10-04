import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { canonicalBytes, hashValue } from './hash';
import { compileInk, decodeInkTag } from './ink';
import { emitLeaves, MAX_LEAF_BYTES, packSizeDiagnostics, splitLeaf } from './leaves';
import { createManifest, manifestBytes } from './manifest';
import { buildContent } from './pipeline';
import type { BuildLeaf } from './types';
import type { JsonValue } from '@tianshu/shared';

const meta = `schemaVersion: inkmeta.v1
storyId: story_fixture
chapter: ch01_tianlong
entryKnots: [wake]
readFlags: []
commands: []
npcs: []
`;
const ink = (branch: string) => `=== wake ===
Welcome.
+ [Go]
  -> ${branch}
=== ${branch} ===
Done.
-> END`;
const leaf = (name: string, kind: 'rules' | 'text', value: BuildLeaf['value']): BuildLeaf =>
  ({ logicalName: name, kind, load: 'chapter', value, ...(kind === 'text' ? { locale: 'zh-Hans' } : {}) });

describe('content build hashing and Ink', () => {
  it('preserves evaluation strings while extracting visible and choice text', async () => {
    const fixture = resolve(import.meta.dirname, '__fixtures__/ink-external-args/story_external_args');
    const [source, fixtureMeta] = await Promise.all([
      readFile(`${fixture}.ink`, 'utf8'),
      readFile(`${fixture}.inkmeta.yaml`, 'utf8'),
    ]);
    const compiled = await compileInk(source, fixtureMeta, `${fixture}.ink`);
    const calls: Array<{ name: string; argument: string; negated: boolean }> = [];
    const stringLiterals: string[] = [];
    const visit = (value: JsonValue): void => {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item === 'str' && typeof value[index + 1] === 'string' &&
              value[index + 1]!.startsWith('^') && value[index + 2] === '/str') {
            stringLiterals.push(value[index + 1]!.slice(1));
          }
          if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
            const name = item['x()'];
            const encodedArgument = value[index - 2];
            if (typeof name === 'string' && value[index - 3] === 'str' &&
                typeof encodedArgument === 'string' && encodedArgument.startsWith('^') &&
                value[index - 1] === '/str') {
              calls.push({ name, argument: encodedArgument.slice(1), negated: value[index + 1] === '!' });
            }
          }
          visit(item);
        });
      } else if (typeof value === 'object' && value !== null) {
        Object.values(value).forEach(visit);
      }
    };
    visit(JSON.parse(compiled.storyJson) as JsonValue);

    expect(calls).toEqual([
      { name: 'get_flag', argument: 'fl_fixture_shared', negated: false },
      { name: 'has_item', argument: 'it_fixture_tao', negated: false },
      { name: 'has_item', argument: 'it_fixture_tao', negated: true },
      { name: 'quest_stage', argument: 'q_fixture_main', negated: false },
      { name: 'affinity', argument: 'npc_fixture_friend', negated: false },
    ]);
    expect(stringLiterals).toContain('initial_value');
    expect(stringLiterals.filter((value) => value === 'state_original')).toHaveLength(2);
    expect(compiled.storyJson).toContain('^ink.story_external_args.text.0000');
    expect(compiled.storyJson).toContain('^ink.story_external_args.text.0007');
    expect(compiled.storyJson).not.toContain('^Visible introduction.');
    expect(compiled.storyJson).not.toContain('^Continue.');
    expect(compiled.text).toEqual({
      'ink.story_external_args.text.0000': 'Visible introduction.',
      'ink.story_external_args.text.0001': 'fl_fixture_shared',
      'ink.story_external_args.text.0002': 'Has peach.',
      'ink.story_external_args.text.0003': 'No peach.',
      'ink.story_external_args.text.0004': 'Quest ready.',
      'ink.story_external_args.text.0005': 'Friendly.',
      'ink.story_external_args.text.0006': 'Comparison kept.',
      'ink.story_external_args.text.0007': 'Continue.',
    });
  });

  it('isolates rule, text, and Ink structure hashes', async () => {
    const first = await compileInk(ink('done'), meta, 'story_fixture.ink');
    const changed = await compileInk(ink('other'), meta, 'story_fixture.ink');
    const structureA = first.structure as unknown as JsonValue;
    const structureB = changed.structure as unknown as JsonValue;
    const ruleA = await emitLeaves([leaf('ch01.rules.base.json', 'rules', [{ damage: 1 }, structureA])]);
    const ruleB = await emitLeaves([leaf('ch01.rules.base.json', 'rules', [{ damage: 2 }, structureA])]);
    const ruleC = await emitLeaves([leaf('ch01.rules.base.json', 'rules', [{ damage: 1 }, structureB])]);
    const textA = await emitLeaves([leaf('ch01.text.zh-Hans.base.json', 'text', { name: '甲' })]);
    const textB = await emitLeaves([leaf('ch01.text.zh-Hans.base.json', 'text', { name: '乙' })]);
    const make = (rules: Awaited<ReturnType<typeof emitLeaves>>, text: Awaited<ReturnType<typeof emitLeaves>>) =>
      createManifest('ch01_tianlong', 'a'.repeat(64), [...rules, ...text], []);
    const [a, b, c, d] = await Promise.all([make(ruleA, textA), make(ruleB, textA), make(ruleA, textB), make(ruleC, textA)]);
    expect(b.contentHash).not.toBe(a.contentHash); expect(b.textHashes).toEqual(a.textHashes);
    expect(c.contentHash).toBe(a.contentHash); expect(c.textHashes).not.toEqual(a.textHashes);
    expect(changed.structure.storyHash).not.toBe(first.structure.storyHash); expect(d.contentHash).not.toBe(a.contentHash);
  });

  it('keeps Ink structure stable when only visible text changes', async () => {
    const first = await compileInk(ink('done'), meta, 'story_fixture.ink');
    const changed = await compileInk(ink('done').replace('Welcome.', 'Bienvenue.')
      .replace('[Go]', '[Proceed]'), meta, 'story_fixture.ink');
    expect(changed.structure.storyHash).toBe(first.structure.storyHash);
    expect(changed.storyJson).toBe(first.storyJson);
    expect(changed.text).not.toEqual(first.text);
  });

  it('changes Ink structure when a choice target changes', async () => {
    const source = `=== wake ===\n+ [Go]\n  -> first\n=== first ===\nDone.\n-> END\n=== second ===\nDone.\n-> END`;
    const first = await compileInk(source, meta, 'story_fixture.ink');
    const changed = await compileInk(source.replace('-> first', '-> second'), meta,
      'story_fixture.ink');
    expect(changed.structure.storyHash).not.toBe(first.structure.storyHash);
    expect(changed.structure.choices).not.toEqual(first.structure.choices);
  });

  it('retains string constants inside compiled Ink', async () => {
    const source = `VAR greeting = "hello"\n=== wake ===\n{greeting}\n-> END`;
    const compiled = await compileInk(source, meta, 'story_fixture.ink');
    expect(compiled.storyJson).toContain('^hello');
    expect(Object.values(compiled.text)).not.toContain('hello');
    expect(compiled.structure.variables).toContain('greeting="hello"');
  });

  it('changes Ink structure when expression flow changes', async () => {
    const first = await compileInk(`VAR score = 1\n=== wake ===\n{score}\n-> END`,
      meta, 'story_fixture.ink');
    const changed = await compileInk(`VAR score = 2\n=== wake ===\n{score + 1}\n-> END`,
      meta, 'story_fixture.ink');
    expect(changed.structure.storyHash).not.toBe(first.structure.storyHash);
  });

  it('rejects missing entries and non-whitelisted externals', async () => {
    await expect(compileInk(ink('done'), meta.replace('[wake]', '[missing]'), 'story_fixture.ink'))
      .rejects.toThrow('INK_ENTRY_UNKNOWN');
    await expect(compileInk(`EXTERNAL mutate_state()\n${ink('done')}`, meta, 'story_fixture.ink'))
      .rejects.toThrow('INK_EXTERNAL_UNKNOWN');
  });

  it('is byte deterministic and splits oversized leaves', async () => {
    const source = leaf('ch01.text.zh-Hans.base.json', 'text',
      Object.fromEntries(Array.from({ length: 8 }, (_, index) => [`k${index}`, '文'.repeat(20)])));
    const parts = splitLeaf(source, 100);
    expect(parts.length).toBeGreaterThan(1);
    expect(parts.every((part) => canonicalBytes(part.value).byteLength <= 100)).toBe(true);
    const emitted = await emitLeaves([source], 100);
    expect(emitted.every((part) => part.bytes.byteLength <= 100)).toBe(true);
    const a = await createManifest('ch01_tianlong', 'a'.repeat(64), emitted, []);
    const b = await createManifest('ch01_tianlong', 'a'.repeat(64), await emitLeaves([source], 100), []);
    expect(manifestBytes(a)).toEqual(manifestBytes(b));
    expect(emitted.map((part) => part.logicalName)).toEqual(
      emitted.map((_, index) => `ch01.text.zh-Hans.base.p${String(index).padStart(3, '0')}.json`));
  });

  it('publishes item rules and text as independent logical leaves', async () => {
    const options = {
      rootDir: resolve(import.meta.dirname, '__fixtures__/item-leaves'),
      write: false,
      chapter: 'ch01_tianlong',
      maxLeafBytes: 512,
    } as const;
    const [built, rebuilt] = await Promise.all([buildContent(options), buildContent(options)]);
    expect(built.diagnostics.filter((row) => row.severity === 'error')).toEqual([]);
    expect(built.entryCount).toBe(6);
    const chapter = built.chapters[0]!;
    const itemRules = chapter.leaves.filter((row) =>
      /^common\.rules\.items(?:\.p\d{3})?\.json$/u.test(row.logicalName),
    );
    const itemText = chapter.leaves.filter((row) =>
      /^common\.text\.zh-Hans\.items(?:\.p\d{3})?\.json$/u.test(row.logicalName),
    );
    expect(itemRules.map((row) => row.logicalName)).toEqual([
      'common.rules.items.p000.json',
      'common.rules.items.p001.json',
      'common.rules.items.p002.json',
    ]);
    expect(itemText.map((row) => row.logicalName)).toEqual([
      'common.text.zh-Hans.items.p000.json',
      'common.text.zh-Hans.items.p001.json',
    ]);
    const rows = itemRules.flatMap((row) => row.value as JsonValue[]);
    expect(rows.map((row) => (row as Record<string, JsonValue>)['id'])).toEqual([
      'it_fixture_amber',
      'it_fixture_jade',
      'it_fixture_pearl',
    ]);
    expect(
      rows.every((row) => {
        const envelope = row as Record<string, JsonValue>;
        const value = envelope['value'] as Record<string, JsonValue>;
        return (
          envelope['kind'] === 'item' &&
          typeof value['name'] === 'string' &&
          value['text'] === undefined
        );
      }),
    ).toBe(true);
    const base = chapter.leaves.find((row) => row.logicalName === 'common.rules.base.json')!;
    expect(
      (base.value as JsonValue[]).some(
        (row) => (row as Record<string, JsonValue>)['kind'] === 'item',
      ),
    ).toBe(false);
    expect(Object.keys(Object.assign({}, ...itemText.map((row) => row.value)))).toEqual([
      'item.it_fixture_amber.text.desc',
      'item.it_fixture_jade.text.desc',
      'item.it_fixture_pearl.text.desc',
    ]);
    expect(chapter.manifest.contentHash).toBe(
      'f8117e53e4dffeac4dff614caff4c1bd47f93e5b2fa3678be7ff4768ccbc3322',
    );
    expect(chapter.manifest.textHashes['zh-Hans']).toBe(
      '495e4b26265461024bdc52368b27884bd94c70ca4d089b4f3d97ac8f8874fe76',
    );
    expect(rebuilt.chapters[0]!.manifest).toEqual(chapter.manifest);
  });

  it('splits 889-item rule and text fixtures below 256 KiB in order', () => {
    const ids = Array.from({ length: 889 }, (_, index) => `it_fixture_${String(index).padStart(4, '0')}`);
    const rules = splitLeaf(leaf('common.rules.items.json', 'rules', ids.map((id) => ({
      kind: 'item', id, value: { id, name: `物品${id}`, padding: 'r'.repeat(420) },
    }))));
    const text = splitLeaf(leaf('common.text.zh-Hans.items.json', 'text',
      Object.fromEntries(ids.map((id) => [`item.${id}.text.desc`, '文'.repeat(160)]))));
    expect(rules.length).toBeGreaterThan(1);
    expect(text.length).toBeGreaterThan(1);
    expect([...rules, ...text].every((part) =>
      canonicalBytes(part.value).byteLength <= MAX_LEAF_BYTES)).toBe(true);
    expect(rules.map((part) => part.logicalName)).toEqual(rules.map((_, index) =>
      `common.rules.items.p${String(index).padStart(3, '0')}.json`));
    expect(text.map((part) => part.logicalName)).toEqual(text.map((_, index) =>
      `common.text.zh-Hans.items.p${String(index).padStart(3, '0')}.json`));
  });

  it('rejects a single object entry beyond the leaf limit', () => {
    expect(() => splitLeaf(leaf('ch01.text.zh-Hans.base.json', 'text',
      { oversized: '文'.repeat(100) }), 100)).toThrow('CONTENT_LEAF_ENTRY_TOO_LARGE');
  });

  it('binds id remaps into contentHash and emits them in stable order', async () => {
    const rules = await emitLeaves([leaf('ch01.rules.base.json', 'rules', [])]);
    const first = await createManifest('ch01_tianlong', 'a'.repeat(64), rules, [
      { from: 'it_z', to: 'it_new', since: 'b'.repeat(64), reason: 'test' },
      { from: 'it_a', to: 'it_new', since: 'b'.repeat(64), reason: 'test' },
    ]);
    const changed = await createManifest('ch01_tianlong', 'a'.repeat(64), rules, [
      { from: 'it_z', to: 'it_other', since: 'b'.repeat(64), reason: 'test' },
      { from: 'it_a', to: 'it_new', since: 'b'.repeat(64), reason: 'test' },
    ]);
    expect(first.idRemaps.map((row) => row.from)).toEqual(['it_a', 'it_z']);
    expect(changed.contentHash).not.toBe(first.contentHash);
    const unsigned = { ...first } as Partial<typeof first>;
    delete unsigned.releaseHash;
    expect(first.releaseHash).toBe(await hashValue(unsigned as unknown as JsonValue));
  });

  it('enforces both pack size gates', () => {
    const fake = (gzipBytes: number) => [{ ...leaf('ch01.rules.base.json', 'rules', []),
      bytes: new Uint8Array(), sha256: 'a'.repeat(64), gzipBytes }];
    expect(packSizeDiagnostics('ch01_tianlong', fake(1280 * 1024))[0]).toMatchObject(
      { code: 'CONTENT_PACK_LARGE', severity: 'warning' });
    expect(packSizeDiagnostics('ch01_tianlong', fake(1536 * 1024 + 1))[0]).toMatchObject(
      { code: 'CONTENT_PACK_TOO_LARGE', severity: 'error' });
  });

  it('rejects unknown, duplicate, free-JSON, and missing Ink tag arguments', () => {
    expect(() => decodeInkTag('ts:nope x=1')).toThrow('INK_TAG_OPCODE');
    expect(() => decodeInkTag('ts:battle/start encounter=a encounter=b')).toThrow('INK_TAG_DUPLICATE');
    expect(() => decodeInkTag('ts:battle/start encounter={a}')).toThrow('INK_TAG_FORMAT');
    expect(() => decodeInkTag('ts:battle/start')).toThrow('INK_TAG_MISSING');
    expect(decodeInkTag('ts:flag/set flagId=fl_example')).toEqual(
      { opcode: 'flag/set', args: { flagId: 'fl_example' } });
    expect(() => decodeInkTag('ts:battle/start encounter=(dynamic)')).toThrow('INK_TAG_PARAM');
  });

  it.each([
    ['quest/advance quest=q_00_main_c_01 stage=st_close', 'quest/advance quest=bad stage=st_close'],
    ['party/giveItem item=prop_bamboo_staff count=1', 'party/giveItem item=prop_bamboo_staff count=0'],
    ['party/takeItem item=it_tao count=1', 'party/takeItem item=it_tao count=many'],
    ['battle/start encounter=enc_00_zhulin', 'battle/start encounter=battle_00'],
    ['flag/set flagId=fl_00_ready value=true', 'flag/set flagId=fl_00_ready value=yes'],
    ['world/openEntrance entrance=ent_00_east', 'world/openEntrance entrance=east'],
    ['tutorial/mark tutorial=initial_battle state=completed', 'tutorial/mark tutorial=initial_battle state=done'],
    ['story/requestTransmission skill=sk_changshengjue source=aqing', 'story/requestTransmission skill=bad source=aqing'],
    ['ui/openAllocation mode=manual', 'ui/openAllocation mode=random'],
    ['ui/showTitleCard card=baima_volume_one', 'ui/showTitleCard card=1'],
    ['save/autosave reason=chapter_entry', 'save/autosave reason=chapter-entry'],
    ['dialogue/speaker speaker=npc_aqing', 'dialogue/speaker speaker=aqing'],
  ])('validates Ink opcode arguments: %s', (valid, invalid) => {
    expect(decodeInkTag(`ts:${valid}`).opcode).toBe(valid.split(' ')[0]);
    expect(() => decodeInkTag(`ts:${invalid}`)).toThrow('INK_TAG_PARAM');
  });

  it('hashes canonical structured preimages without delimiters', async () => {
    await expect(hashValue(['a', ['b', 'c']])).resolves.toMatch(/^[a-f0-9]{64}$/u);
  });
});
