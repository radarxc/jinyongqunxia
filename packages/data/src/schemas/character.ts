import { z } from 'zod';
import {
  ChapterIdSchema, CharacterTemplateIdSchema, CityIdSchema, GradeSchema, LayerSchema,
  NpcIdSchema, QuestIdSchema, SectIdSchema, SkillIdSchema, SourceRefSchema,
} from './primitives';

export const AgeBandSchema = z.enum(['child', 'youth', 'young_adult', 'prime', 'mature', 'elder', 'venerable']);
const YearValueSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('exact'), year: z.number().int(), basis: z.enum(['historical', 'textual']), ref: z.string().min(1) }),
  z.strictObject({ kind: z.literal('range'), from: z.number().int(), to: z.number().int(), basis: z.literal('inferred'), note: z.string().min(1) }),
  z.strictObject({ kind: z.literal('circa'), year: z.number().int(), tolerance: z.number().int().nonnegative(), basis: z.literal('inferred'), note: z.string().min(1) }),
  z.strictObject({ kind: z.literal('unknown'), ageBand: AgeBandSchema.optional(), note: z.string().min(1) }),
]);
const TaskNodeRefSchema = z.string().regex(/^q_[a-z0-9_]+#[a-z0-9_]+$/);
const RecruitmentSchema = z.discriminatedUnion('difficulty', [
  z.strictObject({ difficulty: z.enum(['D1', 'D2', 'D3']), questRef: QuestIdSchema.nullable(), contractRef: z.string().optional(), gateRef: TaskNodeRefSchema.nullable(), windowKeys: z.array(z.string()) }),
  z.strictObject({ difficulty: z.literal('D4'), questRef: QuestIdSchema, gateRef: TaskNodeRefSchema, valueGateRefs: z.array(TaskNodeRefSchema).min(1), windowKeys: z.array(z.string()).min(1) }),
  z.strictObject({ difficulty: z.literal('D5'), questRef: QuestIdSchema, gateRef: TaskNodeRefSchema, valueGateRefs: z.array(TaskNodeRefSchema).min(1), mainlineGateRef: TaskNodeRefSchema, windowKeys: z.array(z.string()).min(1), canonicalConsequenceRef: TaskNodeRefSchema, fallbackAllianceRef: TaskNodeRefSchema.nullable(), lockWarningRef: TaskNodeRefSchema, fateRuleRef: TaskNodeRefSchema.nullable() }),
]);
const SkillBuildSchema = z.strictObject({ skillId: SkillIdSchema, trueLayer: LayerSchema });
const FullBuildSchema = z.strictObject({
  pipeline: z.literal('full'),
  templateRole: z.enum(['tmpl_normal', 'tmpl_elite', 'tmpl_head', 'tmpl_boss']),
  cultivationBand: z.number().int().min(1).max(70),
  portrayal: z.string().min(1),
  skills: z.array(SkillBuildSchema),
  unregisteredSkills: z.array(z.strictObject({ name: z.string().min(1), note: z.literal('待对应图鉴收录（不预建 ID）') })),
});
const TemplateBuildSchema = z.strictObject({ pipeline: z.literal('template'), templateId: CharacterTemplateIdSchema, ageBand: AgeBandSchema, archetype: z.string().optional(), seedPolicy: z.literal('stable_per_save') });

export const NpcAppearanceSchema = z
  .strictObject({
    key: z.string().regex(/^[a-z][a-z0-9_]*$/), chapterId: ChapterIdSchema,
    years: z.strictObject({ from: z.number().int(), to: z.number().int(), approx: z.boolean() }),
    displayName: z.string().min(1), presenceMode: z.enum(['living', 'reference']),
    combatEligible: z.boolean(), ageBand: AgeBandSchema,
    sects: z.array(z.strictObject({ sectId: SectIdSchema, rank: z.enum(['L1', 'L2', 'L3', 'L4', 'L5']).nullable(), relation: z.string().min(1) })),
    location: z.strictObject({ cityId: CityIdSchema.nullable(), placeKey: z.string().nullable() }),
    contentLayer: z.enum(['mainline', 'sect', 'facility', 'commoner']),
    recruitment: RecruitmentSchema, build: z.union([FullBuildSchema, TemplateBuildSchema]),
    ai: z.strictObject({ tier: z.enum(['ai_basic', 'ai_adept', 'ai_expert', 'ai_master']), personality: z.string().regex(/^pers_[a-z0-9_]+$/) }),
  })
  .refine((value) => !(value.combatEligible && (value.presenceMode === 'reference' || value.ageBand === 'child')), { path: ['combatEligible'], message: 'reference and child appearances cannot fight' });

export const NpcDefSchema = z.strictObject({
  schemaVersion: z.literal('npc.v1'), id: NpcIdSchema,
  identity: z.strictObject({ name: z.string().min(1), aliases: z.array(z.string()), origin: z.enum(['fictional', 'historical_fictionalized', 'expanded', 'generated']), sourceWorks: z.array(z.string()).min(1) }),
  lifespan: z.strictObject({ born: YearValueSchema, died: YearValueSchema.nullable(), explicitAliveAt: z.array(z.strictObject({ chapterId: ChapterIdSchema, from: z.number().int(), to: z.number().int(), source: z.string().min(1) })).optional(), canonicalDied: YearValueSchema.optional() }),
  appearances: z.array(NpcAppearanceSchema).min(1),
  recruitment: z.strictObject({ everRecruitable: z.boolean(), allianceOnly: z.boolean(), hardConflictWith: z.array(NpcIdSchema), softConflictWith: z.array(NpcIdSchema) }),
  bonds: z.strictObject({ tags: z.array(z.string()), comboCandidateRefs: z.array(z.string()) }),
  crossBook: z.strictObject({ enabled: z.boolean(), reunionQuestByChapter: z.record(ChapterIdSchema, QuestIdSchema), legacy: z.strictObject({ skillRefs: z.array(SkillIdSchema), itemRefs: z.array(z.string().regex(/^(?:it|eq)_[a-z0-9_]+$/)), heirNpcRefs: z.array(NpcIdSchema) }) }),
  sources: z.array(SourceRefSchema).min(1),
});

export const CharacterTemplateSchema = z.strictObject({
  schemaVersion: z.literal('character-template.v1'), id: CharacterTemplateIdSchema,
  role: z.enum(['normal', 'elite', 'head', 'boss']),
  innate: z.record(z.enum(['con', 'str', 'agi', 'wis', 'wil', 'luk', 'cha']), z.number().int().min(1).max(100)),
  cultivationBand: z.strictObject({ min: z.number().int().min(1).max(70), max: z.number().int().min(1).max(70), derived: z.literal(true) }),
  skillSeeds: z.array(z.strictObject({ skillId: SkillIdSchema, grade: GradeSchema, trueLayer: LayerSchema })),
}).refine((value) => value.cultivationBand.min <= value.cultivationBand.max, {
  path: ['cultivationBand'], message: 'cultivation band must be ordered',
});

export type NpcDef = z.output<typeof NpcDefSchema>;
export type CharacterTemplate = z.output<typeof CharacterTemplateSchema>;
