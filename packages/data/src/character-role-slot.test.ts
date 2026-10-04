import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadContent } from './content-index';
import { NpcDefSchema, RoleSlotDefSchema } from './schemas';

const root = resolve(import.meta.dirname, '../../..');
const read = async (path: string) => ({ path, text: await readFile(resolve(root, path), 'utf8') });
const npc = {
  schemaVersion: 'npc.v1', id: 'npc_fixture',
  identity: { name: '测试人物', aliases: [], origin: 'expanded', sourceWorks: ['原创扩展'] },
  lifespan: { born: { kind: 'unknown', ageBand: 'prime', note: '测试' }, died: null },
  appearances: [{ key: 'fixture', chapterId: 'ch00_yuenv',
    years: { from: -482, to: -482, approx: true }, displayName: '测试人物',
    presenceMode: 'living', combatEligible: false, ageBand: 'prime', sects: [],
    location: { cityId: null, placeKey: null }, contentLayer: 'mainline',
    recruitment: null, build: { pipeline: 'full', templateRole: 'tmpl_normal',
      cultivationBand: 1, portrayal: 'fixture', skills: [], unregisteredSkills: [] },
    ai: { tier: 'ai_basic', personality: 'pers_jinshen' } }],
  recruitment: { everRecruitable: false, allianceOnly: false, hardConflictWith: [],
    softConflictWith: [] },
  bonds: { tags: [], comboCandidateRefs: [] },
  crossBook: { enabled: false, reunionQuestByChapter: {},
    legacy: { skillRefs: [], itemRefs: [], heirNpcRefs: [] } },
  sources: [{ kind: 'expanded', locator: '测试' }],
} as const;

describe('NPC species and role-slot contracts', () => {
  it('defaults omitted species to human and requires a human ageBand', () => {
    expect(NpcDefSchema.parse(npc).identity.species).toBe('human');
    const missingAge = structuredClone(npc) as unknown as Record<string, unknown>;
    delete (missingAge['appearances'] as Record<string, unknown>[])[0]!['ageBand'];
    expect(() => NpcDefSchema.parse(missingAge)).toThrow();
    (missingAge['appearances'] as Record<string, unknown>[])[0]!['ageBand'] = null;
    expect(() => NpcDefSchema.parse(missingAge)).toThrow('NPC_HUMAN_AGE_BAND_REQUIRED');
  });

  it('requires non-human ageBand null and rejects human age metadata in lifespan', () => {
    const animal = structuredClone(npc) as unknown as Record<string, unknown>;
    (animal['identity'] as Record<string, unknown>)['species'] = 'animal';
    expect(() => NpcDefSchema.parse(animal)).toThrow('NPC_NON_HUMAN_AGE_BAND_NULL');
    (animal['appearances'] as Record<string, unknown>[])[0]!['ageBand'] = null;
    expect(() => NpcDefSchema.parse(animal)).toThrow('NPC_NON_HUMAN_AGE_PIPELINE');
    delete ((animal['lifespan'] as Record<string, unknown>)['born'] as Record<string, unknown>)['ageBand'];
    expect(NpcDefSchema.parse(animal).appearances[0]!.ageBand).toBeNull();
  });

  it('validates role-slot shape, display key, path and template reference', async () => {
    const files = await Promise.all([
      read('content/chapters/ch00_yuenv/roles/templates/tmpl_normal.yaml'),
      read('content/chapters/ch00_yuenv/roles/role_road_swordsman.yaml'),
    ]);
    const registry = loadContent(files);
    expect(registry.roleSlotsForChapter('ch00_yuenv').map((row) => row.slotId))
      .toEqual(['role_road_swordsman']);
    expect(registry.require('roleSlot', 'role_road_swordsman'))
      .toBe(registry.roleSlots[0]);
    expect(() => loadContent([files[1]!])).toThrow('characterTemplate:tmpl_normal');
    const parsed = RoleSlotDefSchema.parse(JSON.parse(JSON.stringify(registry.roleSlots[0])));
    expect(() => RoleSlotDefSchema.parse({ ...parsed, dreamTier: 3 })).toThrow();
    expect(() => RoleSlotDefSchema.parse({ ...parsed, count: 0 })).toThrow();
    expect(() => RoleSlotDefSchema.parse({ ...parsed, seed: { ...parsed.seed,
      tuple: ['runId', 'chapterId', 'templateId', 'spawnOrdinal', 'spawnKey'] } })).toThrow();
    expect(() => RoleSlotDefSchema.parse({ ...parsed, displayRoleKey: 'role.wrong.name' }))
      .toThrow('ROLE_SLOT_DISPLAY_KEY');
  });
});
