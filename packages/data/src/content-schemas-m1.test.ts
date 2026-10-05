import { describe, expect, it } from 'vitest';
import { loadContent } from './tooling';
import {
  compileBattleMove, ItemDefSchema, MartialArtDefSchema, MoveDefSchema, QuestDefSchema,
  type MoveDef,
} from './schemas';

const move = {
  schemaVersion: 'move.v1', id: 'mv_fixture_strike', name: '测试招', skillId: 'sk_fixture',
  unlock: 1, kind: 'attack', ultimate: false, target: 'enemy',
  range: { min: 1, max: 2 }, shape: { tpl: 'aoe_single' }, delivery: 'melee',
  hTol: 2, powerBp: 11_000, referencePowerBp: 10_000, wInBp: 4000,
  mpCost: 50, recovery: 1000, hitZone: 'body', friendlyFire: 'none',
  meridianRouteRef: 'mfr_fixture_strike',
} as const;
const skill = {
  schemaVersion: 'martial-art.v1', id: 'sk_fixture', name: '测试武学', aliases: [],
  category: 'weapon', subType: 'sword', grade: 3, origin: 'expanded', sect: null,
  sourceChapters: ['ch00_yuenv'], nature: 'neutral', wOutBp: 6000, wInBp: 4000,
  requirements: {}, maxLayer: 9, layers: [{ n: 1, unlock: ['mv_fixture_strike'] }],
  moveIds: ['mv_fixture_strike'], learnSources: [{
    type: 'tutorial_projection', chapter: 'ch00_yuenv', ref: 'fx_demo', maxLayer: 9,
  }], tags: [], description: '测试。',
} as const;
const prop = {
  schemaVersion: 'item.v1', id: 'prop_bamboo_staff', name: '竹棒', kind: 'tool',
  sub: 'teaching', grade: null, stack: 1, chapters: ['ch00_yuenv'], origin: 'expanded',
  price: null, flags: [], chapterBound: true, assets: { icon: 'item/bamboo-staff' },
  text: { desc: '章内教学道具。' }, extension: { type: 'generic', value: {} },
} as const;
const buff = {
  schemaVersion: 'buff.v1', id: 'bf_fixture', name: '测试效果', category: 'stat',
  polarity: 'debuff', grade: 'inherit', gradeRange: [1, 12], tags: ['weaken'],
  family: 'fam_fixture', resistAttr: null, duration: { type: 'turns', value: 2 },
  stack: { rule: 'refresh', key: 'def' }, dispel: { dispellable: true, types: ['medicine'] },
  priority: 150, mods: [{ op: 'modStat', stat: 'effRes', kind: 'pct', value: '-0.05 * G' }],
  ui: { icon: 'buff/fixture', frame: 'auto', showTimer: true, sortGroup: 'weaken' },
  text: { short: '测试', desc: '测试。', log: '测试。' }, origin: 'expanded',
} as const;

const quest = {
  schemaVersion: 'quest.v1', id: 'q_00_main_c_01', kind: 'main',
  chapterId: 'ch00_yuenv', titleKey: 'quest.ch00.c01.title', subjectNpcIds: [],
  routeTone: 'neutral', startStageId: 'st_open', flagIds: ['fl_00_ready'],
  encounterIds: ['enc_00_zhulin'],
  stages: [{
    id: 'st_open', objectiveKeys: ['quest.ch00.c01.objective'],
    objectives: [{ type: 'confirmFlag', flagId: 'fl_00_ready', is: true }],
    transitions: [{ id: 'edge_done', priority: 10,
      when: { flag: { id: 'fl_00_ready', is: true } }, to: 'st_done', branchKey: 'ready' }],
    effects: [{ id: 'fx_battle', op: 'battle/start', encounterId: 'enc_00_zhulin' }],
  }, {
    id: 'st_done', objectiveKeys: [], objectives: [], transitions: [],
    effects: [{ id: 'fx_prop', op: 'reward/item', itemId: 'prop_bamboo_staff', count: 1 }],
    terminal: 'completed', endingKey: 'found_aqing',
  }],
  tracking: { defaultTracked: true, revealPolicy: 'known_only' },
  source: { origin: 'expanded', note: 'fixture' },
} as const;

describe('M1 content schemas', () => {
  it('accepts MoveDef and rejects malformed geometry or range', () => {
    expect(MoveDefSchema.parse(move).id).toBe('mv_fixture_strike');
    expect(() => MoveDefSchema.parse({ ...move, range: { min: 3, max: 2 } })).toThrow();
    expect(() => MoveDefSchema.parse({ ...move, shape: { tpl: 'aoe_disk', r: -1 } })).toThrow();
  });

  it('compiles MoveDef to BattleMove fields without settlement logic', () => {
    const compiled = compileBattleMove(MoveDefSchema.parse({ ...move, ultimate: true,
      rageCost: 100, acupointStrike: { level: 3 }, targetAcupoint: {
        mode: 'fixed', acupointRef: 'ap_fixture',
      } }) as MoveDef);
    expect(compiled).toMatchObject({ id: move.id, powerBp: 11_000, range: move.range,
      shape: move.shape, ultimate: true, acupointStrike: true, sealLevel: 3,
      targetAcupoint: 'ap_fixture' });
  });

  it('validates optional on-hit fields while preserving legacy moves', () => {
    expect(MoveDefSchema.safeParse(move).success).toBe(true);
    const enhanced = MoveDefSchema.parse({ ...move, parryable: false, onHit: {
      applyBuffs: [{ buffId: 'bf_fixture', chanceBp: 4_000, turns: 2 }],
      displace: { kind: 'knockback', cells: 1 },
    } });
    expect(compileBattleMove(enhanced, { skillId: 'sk_fixture', effGrade: 9 }))
      .toMatchObject({ skillId: 'sk_fixture', sourceGrade: 9, parryable: false, onHit: {
      applyBuffs: [{ buffId: 'bf_fixture', chanceBp: 4_000, turns: 2 }],
      displace: { kind: 'knockback', cells: 1 },
    } });
    expect(() => compileBattleMove(enhanced)).toThrow('BATTLE_MOVE_SOURCE_GRADE_REQUIRED');
    for (const onHit of [
      { applyBuffs: [{ buffId: 'bf_fixture', chanceBp: -1, turns: 1 }] },
      { applyBuffs: [{ buffId: 'bf_fixture', chanceBp: 10_001, turns: 1 }] },
      { applyBuffs: [{ buffId: 'bf_fixture', chanceBp: 1, turns: 0 }] },
      { displace: { kind: 'knockback', cells: 0 } },
    ]) expect(MoveDefSchema.safeParse({ ...move, onHit }).success).toBe(false);
  });

  it('accepts the q_00 exception and rejects invalid quest graphs', () => {
    for (const suffix of ['01', '02', '03', '04']) {
      expect(QuestDefSchema.parse({ ...quest, id: `q_00_main_c_${suffix}` }).id)
        .toBe(`q_00_main_c_${suffix}`);
    }
    for (const id of ['q_00_main_c_05', 'q_00_main_c_99', 'q_00_main_z_01']) {
      expect(() => QuestDefSchema.parse({ ...quest, id })).toThrow();
    }
    expect(() => QuestDefSchema.parse({ ...quest, stages: [quest.stages[1]] })).toThrow();
    expect(() => QuestDefSchema.parse({ ...quest,
      stages: [{ ...quest.stages[0], transitions: [{
        ...quest.stages[0].transitions[0], to: 'st_missing',
      }] }, quest.stages[1]] })).toThrow();
  });

  it('accepts story_art, teaching projections, and chapter-bound props', () => {
    expect(MartialArtDefSchema.parse(skill).learnSources[0]?.type)
      .toBe('tutorial_projection');
    expect(MartialArtDefSchema.safeParse({ ...skill, id: 'sk_changshengjue',
      category: 'story_art', moveIds: [], layers: [] }).success).toBe(true);
    expect(MartialArtDefSchema.safeParse({ ...skill, category: 'story_art' }).success)
      .toBe(false);
    expect(ItemDefSchema.parse(prop).chapterBound).toBe(true);
    expect(ItemDefSchema.safeParse({ ...prop, chapterBound: false }).success).toBe(false);
    expect(ItemDefSchema.safeParse({ ...prop, id: 'it_bamboo_staff',
      chapterBound: true }).success).toBe(false);
  });

  it('links martial arts to moves and quests to declared references', () => {
    const yaml = (value: unknown): string => JSON.stringify(value);
    expect(loadContent([
      { path: 'skill.yaml', text: yaml(skill) }, { path: 'move.yaml', text: yaml(move) },
      { path: 'prop.yaml', text: yaml(prop) }, { path: 'quest.yaml', text: yaml(quest) },
    ]).quests).toHaveLength(1);
    expect(() => loadContent([
      { path: 'skill.yaml', text: yaml({ ...skill, moveIds: ['mv_missing'] }) },
      { path: 'move.yaml', text: yaml(move) },
    ])).toThrow('CONTENT_REF:skill.yaml:move:mv_missing');
    expect(() => loadContent([
      { path: 'skill.yaml', text: yaml(skill) }, { path: 'move.yaml', text: yaml(move) },
      { path: 'prop.yaml', text: yaml(prop) },
      { path: 'quest.yaml', text: yaml({ ...quest, flagIds: ['fl_00_other'] }) },
    ])).toThrow('CONTENT_REF:quest.yaml:flag:fl_00_ready');
    expect(() => loadContent([
      { path: 'skill.yaml', text: yaml(skill) }, { path: 'move.yaml', text: yaml(move) },
      { path: 'prop.yaml', text: yaml(prop) },
      { path: 'quest.yaml', text: yaml({ ...quest, encounterIds: ['enc_00_other'] }) },
    ])).toThrow('CONTENT_REF:quest.yaml:encounter:enc_00_zhulin');
    expect(() => loadContent([
      { path: 'skill.yaml', text: yaml(skill) }, { path: 'move.yaml', text: yaml(move) },
      { path: 'quest.yaml', text: yaml(quest) },
    ])).toThrow('CONTENT_REF:quest.yaml:item:prop_bamboo_staff');
    expect(() => loadContent([
      { path: 'skill.yaml', text: yaml(skill) }, { path: 'move.yaml', text: yaml(move) },
      { path: 'prop.yaml', text: yaml(prop) },
      { path: 'quest.yaml', text: yaml({ ...quest, subjectNpcIds: ['npc_missing'] }) },
    ])).toThrow('CONTENT_REF:quest.yaml:npc:npc_missing');
    const dialogueQuest = { ...quest, stages: [{ ...quest.stages[0],
      objectives: [{ type: 'dialogue', storyId: 'story_ch00_main', knot: 'opening' }] },
    quest.stages[1]] };
    expect(() => loadContent([
      { path: 'skill.yaml', text: yaml(skill) }, { path: 'move.yaml', text: yaml(move) },
      { path: 'prop.yaml', text: yaml(prop) },
      { path: 'quest.yaml', text: yaml(dialogueQuest) },
    ])).toThrow('CONTENT_REF:quest.yaml:storyKnot:story_ch00_main:opening');
  });

  it('requires every on-hit Buff reference to be registered with a precise diagnostic', () => {
    const yaml = (value: unknown): string => JSON.stringify(value);
    const enhanced = { ...move, onHit: { applyBuffs: [
      { buffId: 'bf_missing', chanceBp: 3_000, turns: 1 },
    ] } };
    expect(() => loadContent([
      { path: 'skill.yaml', text: yaml(skill) },
      { path: 'moves/mv_fixture_strike.yaml', text: yaml(enhanced) },
      { path: 'buff.yaml', text: yaml(buff) },
    ])).toThrow('CONTENT_REF:moves/mv_fixture_strike.yaml:move:mv_fixture_strike:buff:bf_missing');
    expect(loadContent([
      { path: 'skill.yaml', text: yaml(skill) },
      { path: 'move.yaml', text: yaml({ ...enhanced, onHit: { applyBuffs: [
        { buffId: 'bf_fixture', chanceBp: 3_000, turns: 1 },
      ] } }) }, { path: 'buff.yaml', text: yaml(buff) },
    ]).buffs).toHaveLength(1);
  });
});
