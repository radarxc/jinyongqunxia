import { cp, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { RoleSlotDefSchema } from '../schemas';
import { buildContent } from './pipeline';

const root = resolve(import.meta.dirname, '../../../..');
let fixtureRoot: string;
const fixturePaths = [
  'content/common/items/it_jinchuangyao.yaml',
  'content/common/skills/sk_yuenvjian.yaml',
  'content/items/it_aqing_qingcha.yaml',
  'content/items/it_tao.yaml',
  'content/chapters/ch00_yuenv/npcs/npc_aqing.yaml',
  'content/chapters/ch00_yuenv/npcs/npc_baiyuan.yaml',
  'content/chapters/ch00_yuenv/npcs/npc_fanli.yaml',
  'content/chapters/ch00_yuenv/props/prop_bamboo_staff.yaml',
  'content/chapters/ch00_yuenv/quests/q_00_main_c_01.yaml',
  'content/chapters/ch00_yuenv/quests/q_00_main_c_02.yaml',
  'content/chapters/ch00_yuenv/quests/q_00_main_c_03.yaml',
  'content/chapters/ch00_yuenv/quests/q_00_main_c_04.yaml',
  'content/chapters/ch00_yuenv/roles/templates/tmpl_normal.yaml',
  'content/chapters/ch00_yuenv/roles/role_road_swordsman.yaml',
  'content/chapters/ch00_yuenv/roles/role_wu_swordsman.yaml',
  'content/chapters/ch00_yuenv/roles/role_yue_soldier.yaml',
];

describe('role slots in chapter packs', () => {
  beforeAll(async () => {
    fixtureRoot = await mkdtemp(join(tmpdir(), 'tianshu-role-slot-'));
    for (const path of fixturePaths) {
      const destination = resolve(fixtureRoot, path);
      await mkdir(dirname(destination), { recursive: true });
      await cp(resolve(root, path), destination);
    }
  });
  afterAll(async () => rm(fixtureRoot, { recursive: true, force: true }));

  it('publishes and loads the promoted NPC and role-slot chapter content', async () => {
    const result = await buildContent({
      rootDir: fixtureRoot, write: false, chapter: 'ch00_yuenv',
    });
    expect(result.diagnostics.filter((row) => row.severity === 'error')).toEqual([]);
    const chapter = result.chapters[0]!;
    const leaf = chapter.leaves.find((row) => row.logicalName === 'ch00.rules.roles.json');
    expect(leaf).toMatchObject({ kind: 'rules', load: 'chapter' });
    if (leaf === undefined || !Array.isArray(leaf.value))
      throw new TypeError('CH00_ROLE_SLOTS_MISSING');
    const slots = leaf.value.map((row) => {
      if (typeof row !== 'object' || row === null || Array.isArray(row) ||
          row['kind'] !== 'roleSlot' || row['id'] !== row['value']['slotId'])
        throw new TypeError('CH00_ROLE_SLOT_ENVELOPE_INVALID');
      return RoleSlotDefSchema.parse(row['value']);
    });
    expect(slots).toHaveLength(3);
    expect(slots.map((slot) => slot.count)
      .reduce((sum, count) => sum + count, 0)).toBe(6);
    expect(slots.map((slot) => slot.slotId)).toEqual([
      'role_road_swordsman', 'role_wu_swordsman', 'role_yue_soldier',
    ]);
    const base = chapter.leaves.find(
      (row) => row.logicalName === 'ch00.rules.base.json',
    );
    if (base === undefined || !Array.isArray(base.value)) throw new TypeError('CH00_BASE_MISSING');
    const npcRows = base.value.filter((row) => typeof row === 'object' && row !== null &&
      !Array.isArray(row) && row['kind'] === 'npc').map((row) =>
      row as Record<string, unknown>);
    expect(npcRows.map((row) => row['id'])).toEqual([
      'npc_aqing', 'npc_baiyuan', 'npc_fanli',
    ]);
    const baiyuan = npcRows.find((row) => row['id'] === 'npc_baiyuan')!['value'] as
      Record<string, unknown>;
    expect((baiyuan['identity'] as Record<string, unknown>)['species']).toBe('animal');
    expect(((baiyuan['appearances'] as Record<string, unknown>[])[0])!['ageBand']).toBeNull();
    const questSubjects = Object.fromEntries(base.value.filter((row) =>
      typeof row === 'object' && row !== null && !Array.isArray(row) && row['kind'] === 'quest')
      .map((row) => { const envelope = row as Record<string, unknown>;
        return [envelope['id'], (envelope['value'] as Record<string, unknown>)['subjectNpcIds']]; }));
    expect(questSubjects).toMatchObject({
      q_00_main_c_01: ['npc_aqing'],
      q_00_main_c_02: ['npc_aqing', 'npc_baiyuan'],
      q_00_main_c_03: ['npc_aqing', 'npc_fanli'],
      q_00_main_c_04: ['npc_aqing'],
    });
  }, 10_000);
});
