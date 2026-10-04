import { describe, expect, it } from 'vitest';
import type { JsonValue } from '@tianshu/shared';
import type { ContentRegistry } from '../content-index';
import type { RegionObject } from '../schemas';
import type { CompiledRegionMap } from './tiled-types';
import { validateRegionBindingMaps } from './region-bindings';

const base = (id: string, q: number) => ({ id, q, r: 0, h: 0, cells: [{ q, r: 0, h: 0 }] });
const objects: readonly RegionObject[] = [
  { ...base('door_locked', 0), class: 'Door', mode: 'door', pairId: 'door_back',
    oneWay: false, targetRegionId: 'rg_fixture', targetSceneId: 'sc_10_fixture',
    targetSpawnId: 'entry', lockedBy: 'gate_10_fixture' },
  { ...base('npc_talking', 1), class: 'NpcSpawn', npcId: 'npc_fixture' },
  { ...base('npc_silent', 2), class: 'NpcSpawn', npcId: 'npc_fixture' },
  { ...base('chest_reward', 3), class: 'Chest', lootRef: 'loot_10_fixture' },
];
function map(rows = objects): CompiledRegionMap {
  return { map: {} as JsonValue, diagnostics: [], chapterScopes: ['ch10_baima'],
    regionId: 'rg_fixture', sceneId: 'sc_10_fixture', objects: rows, backdropAssetKey: null,
    source: { path: 'content/world/regions/rg_fixture/sc_10_fixture.tmj', absolutePath: '/fixture',
      text: JSON.stringify({ objects: rows.map((row) => ({ name: row.id })) }, null, 2) } };
}
const entry = (folder: string, kind: string, name: string, value: unknown) => ({
  path: `content/chapters/ch10_baima/bindings/${folder}/${name}.yaml`, kind, value,
});
function registry(overrides: { gate?: boolean; talk?: boolean; silent?: boolean; loot?: boolean } = {}): ContentRegistry {
  const enabled = { gate: true, talk: true, silent: true, loot: true, ...overrides };
  const entries = [
    entry('gates', 'regionGate', 'declaration', { schemaVersion: 'region-gate.v1',
      gateId: 'gate_10_declaration', chapter: 'ch10_baima', expression: { flag: 'fl_fixture' },
      lockedTextKey: 'fixture.gate.locked' }),
    ...(enabled.gate ? [entry('gates', 'regionGate', 'gate', { schemaVersion: 'region-gate.v1',
      gateId: 'gate_10_fixture', chapter: 'ch10_baima', expression: { flag: 'fl_fixture' },
      lockedTextKey: 'fixture.gate.locked' })] : []),
    ...(enabled.talk ? [entry('dialogues', 'regionDialogue', 'talk', {
      schemaVersion: 'region-dialogue.v1', chapter: 'ch10_baima', sceneId: 'sc_10_fixture',
      anchorId: 'npc_talking', storyId: 'story_fixture', entryKey: 'opening' })] : []),
    ...(enabled.silent ? [entry('dialogues', 'regionDialogue', 'silent', {
      schemaVersion: 'region-dialogue.v1', chapter: 'ch10_baima', sceneId: 'sc_10_fixture',
      anchorId: 'npc_silent', noDialogue: true })] : []),
    ...(enabled.loot ? [entry('loot', 'regionLoot', 'loot', { schemaVersion: 'region-loot.v1',
      lootRef: 'loot_10_fixture', chapter: 'ch10_baima',
      items: [{ itemId: 'it_fixture', count: 1 }] })] : []),
  ];
  return { entries, regionGates: entries.filter((row) => row.kind === 'regionGate').map((row) => row.value),
    regionDialogues: entries.filter((row) => row.kind === 'regionDialogue').map((row) => row.value),
    regionLoot: entries.filter((row) => row.kind === 'regionLoot').map((row) => row.value),
  } as unknown as ContentRegistry;
}

describe('region map binding closure', () => {
  it('accepts registered gates, dialogues, explicit no-dialogue anchors, and loot', () => {
    expect(validateRegionBindingMaps([map()], registry())).toEqual([]);
  });

  it('reports each unregistered map reference with file, object ID, and supplied value', () => {
    const diagnostics = validateRegionBindingMaps([map()], registry({ gate: false, talk: false,
      silent: false, loot: false }));
    expect(diagnostics).toHaveLength(4);
    expect(diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'TS-CONTENT-MAP-019', message: expect.stringContaining(
        'door_locked lockedBy gate_10_fixture') }),
      expect.objectContaining({ code: 'TS-CONTENT-MAP-019', message: expect.stringContaining(
        'npc_talking dialogue binding') }),
      expect.objectContaining({ code: 'TS-CONTENT-MAP-019', message: expect.stringContaining(
        'chest_reward lootRef loot_10_fixture') }),
    ]));
    expect(diagnostics.every((row) => row.primary.file.endsWith('sc_10_fixture.tmj'))).toBe(true);
  });

  it('reports dialogue bindings whose scene or anchor is absent from the map', () => {
    const broken = registry();
    const dialogue = broken.entries.find((row) => row.kind === 'regionDialogue')!;
    const changed = { ...broken, entries: broken.entries.map((row) => row === dialogue ? { ...row,
      value: { ...(row.value as object), anchorId: 'npc_missing' } } : row),
      regionDialogues: broken.regionDialogues.map((row, index) => index === 0 ? { ...(row as object),
        anchorId: 'npc_missing' } : row) } as ContentRegistry;
    expect(validateRegionBindingMaps([map()], changed)).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'TS-CONTENT-MAP-019', primary: {
        file: expect.stringContaining('/bindings/dialogues/'), line: 1, column: 1,
        endLine: 1, endColumn: 1 }, message: expect.stringContaining('npc_missing') }),
    ]));
  });
});
