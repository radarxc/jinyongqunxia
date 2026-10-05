import { describe, expect, it } from 'vitest';
import { loadContent, parseContentFile, parseSerializedContent, serializeContentEntry } from './tooling';
import { splitContentEntry } from './build/split-fields';
import { INK_OPCODE_REGISTRY } from './schemas/event-actions';

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
  it('classifies encounter rules and participant content references', () => {
    const encounter = {
      schemaVersion: 'encounter.v1', id: 'enc_fixture', chapterId: 'ch00_yuenv',
      kind: 'spar', arena: { kind: 'inline', topology: 'hex-pointy', anchorId: 'fixture',
        cells: [{ q: 0, r: 0, height: 0, moveCost: 1 },
          { q: 1, r: 0, height: 0, moveCost: 1 }] },
      participants: [{ unitRef: 'hero', source: { kind: 'character', characterRef: 'protagonist' },
        side: 'player', control: 'player', spawnId: 'hero', placement: { pos: { q: 0, r: 0 }, facing: 0 } },
      { unitRef: 'ape', source: { kind: 'npc', npcId: 'npc_fixture' }, side: 'enemy',
        control: 'ai', spawnId: 'ape', placement: { pos: { q: 1, r: 0 }, facing: 3 } }],
      outcome: { win: [{ kind: 'unitDown', unitRef: 'ape' }],
        lose: [{ kind: 'unitDown', unitRef: 'hero' }], draw: [],
        onDefeat: 'continue', concede: 'advance' },
      rules: { mode: 'spar', noAuto: true, noRetreat: true, noItems: true,
        mercyAllowed: true, lethalIntent: false, friendlyFire: false, roundLimit: 2,
        boss: false, retry: false, skippable: true }, beats: [],
      difficulty: { localDifficulty: 1, enemyStatBp: 9000, modes: {
        diff_jianghu: { hpBp: 8000, attackBp: 8000 },
        diff_xiake: { hpBp: 10000, attackBp: 10000 },
        diff_zongshi: { hpBp: 12000, attackBp: 11200 },
      } },
    };
    const entry = parseContentFile({ path: 'encounter.yaml', text: JSON.stringify(encounter) });
    expect(entry.kind).toBe('encounter');
    expect(splitContentEntry(entry).contentRefs).toEqual(['ch00_yuenv', 'npc_fixture']);
  });

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

  it('routes world map registration events through the strict map schema', () => {
    const registration = { schemaVersion: 'event.v1', id: 'ev_01_ditu',
      chapterId: 'ch01_tianlong', event: 'world/mapRegistered', once: false,
      actions: [{ op: 'mountWorldMap', map: { version: 'worldmap.v1' } }] };
    expect(() => parseSerializedContent('event', JSON.stringify(registration)))
      .toThrow();
  });

  it('accepts registered EventDef actions and rejects unknown or malformed actions', () => {
    const event = { schemaVersion: 'event.v1', id: 'ev_fixture',
      chapterId: 'ch01_tianlong', event: 'world/fixture', once: true,
      condition: { sceneId: 'sc_fixture', anchorId: 'fixture', gate: { all: [
        { flag: 'fl_fixture_ready' }, { not: { flag: 'fl_fixture_blocked' } },
      ] } },
      actions: [{ op: 'flag/set', flagId: 'fl_fixture', value: true }] };
    expect(parseSerializedContent('event', JSON.stringify(event)).value).toEqual(event);
    expect(() => parseSerializedContent('event', JSON.stringify({ ...event,
      actions: [{ op: 'flag/unknown', flagId: 'fl_fixture' }] }))).toThrow();
    expect(() => parseSerializedContent('event', JSON.stringify({ ...event,
      actions: [{ op: 'party/giveItem', item: 'it_fixture', count: 0 }] }))).toThrow();
    expect(() => parseSerializedContent('event', JSON.stringify({ ...event,
      condition: { gate: { flag: 'fx_not_a_persistent_flag' } } }))).toThrow();
    expect(() => parseSerializedContent('event', JSON.stringify({ ...event,
      condition: { gate: { all: [] } } }))).toThrow();
  });

  it('keeps infrastructure EventDef actions strict and outside the Ink opcode surface', () => {
    const base = { schemaVersion: 'event.v1', id: 'ev_fixture',
      chapterId: 'ch01_tianlong', event: 'render/fixture', once: false };
    const rig = { ...base, actions: [{ op: 'rig/loadClipMap', payload: {
      schema: 'tianshu-clip-map.v1', clips: { idle: { clipId: 'clip_idle' } },
    } }] };
    const vfx = { ...base, actions: [{ id: 'vfx_fixture', op: 'vfx/loadRuntimeData', payload: {
      schema: 'tianshu-vfx-runtime.v1', files: ['assets/fixture.png'],
    } }] };
    expect(parseSerializedContent('event', JSON.stringify(rig)).value).toEqual(rig);
    expect(parseSerializedContent('event', JSON.stringify(vfx)).value).toEqual(vfx);
    expect(INK_OPCODE_REGISTRY).not.toHaveProperty('rig/loadClipMap');
    expect(INK_OPCODE_REGISTRY).not.toHaveProperty('vfx/loadRuntimeData');
    expect(() => parseSerializedContent('event', JSON.stringify({ ...vfx,
      actions: [{ ...vfx.actions[0], extra: true }] }))).toThrow();
    expect(() => parseSerializedContent('event', JSON.stringify({ ...vfx,
      actions: [{ ...vfx.actions[0], payload: { schema: 'tianshu-vfx-unknown.v1' } }] })))
      .toThrow();
  });

  it('identifies generated town runtime content by chapter and city', () => {
    const town = { schemaVersion: 'town-runtime.v1', revision: '0'.repeat(64),
      cityId: 'city_test', chapterId: 'ch01', sceneId: 'city_test', displayName: '测试镇',
      historicalYear: 1093, eraKit: 'song_dali', source: { spec: 'spec', layout: 'layout',
        sha256: '1'.repeat(64) }, grid: { width: 1, height: 1, cellM: 1, chunkCells: 32 },
      projection: { tilePx: [64, 32], pitchDeg: 30, yawDeg: 45, elevationCmPerM: 100 },
      assets: { tile: { baseUrl: '/', manifest: 'tile', entries: [] },
        building: { baseUrl: '/', manifest: 'building', entries: [] } },
      groundPalette: [{ ground: 'earth', overlay: null, elevationCm: 0, walkable: true }],
      groundRuns: [[0, 1, 0]], edgeTiles: [], waterRuns: [], bridgeRuns: [],
      navigation: { neighborOrder: 'axial-rq-v1', maxStepCm: 50,
        nodes: [[0, 0, 0, 'flat']], spawn: [0, 0] }, buildings: [], anchors: [] };
    const registry = loadContent([{ path: 'town.json', text: JSON.stringify(town) }]);
    expect(registry.get('town', 'ch01/city_test')).toBe(registry.towns[0]);
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
