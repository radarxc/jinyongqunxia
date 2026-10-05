import { z } from 'zod';
import {
  ChapterIdSchema, GradeSchema, JsonValueSchema, LayerSchema, MeridianIdSchema,
  NonNegativeIntegerSchema, SkillIdSchema,
} from './primitives';

const LayerCurveSchema = z
  .tuple([
    z.number().int().min(4000).max(14000), z.number().int().min(4000).max(14000),
    z.number().int().min(4000).max(14000), z.number().int().min(4000).max(14000),
    z.number().int().min(4000).max(14000), z.number().int().min(4000).max(14000),
    z.number().int().min(4000).max(14000), z.number().int().min(4000).max(14000),
    z.number().int().min(4000).max(14000),
  ])
  .refine((values) => values.every((value, index) => index === 0 || value >= values[index - 1]!), 'layerCurveBp must be nondecreasing');

export const InnerDefSchema = z.strictObject({
  contribution: z.strictObject({
    hpMaxPct: z.number().int(),
    mpMaxPct: z.number().int(),
    mpRegenMilli: z.number().int(),
  }),
  meridians: z.array(MeridianIdSchema),
  breathProfileRef: z.string().regex(/^txp_[a-z0-9_]+$/),
  innerGuard: z.strictObject({ enabled: z.boolean(), reflectBp: z.number().int().min(0).max(2000).optional() }),
  baseQiPerTick: z.number().int().min(4).max(32),
  baseQiSpeedBp: z.number().int().min(5000).max(16000),
  layerCurveBp: LayerCurveSchema,
  fluxTrainBase: z.number().int().min(1).max(8),
  fluxTrainHardCap: z.strictObject({ acupoint: z.literal(64), meridian: z.literal(96) }),
  bridge: z.boolean().optional(),
  natureFollowAux: z.boolean().optional(),
  auxOverrideBp: z.number().int().min(0).max(10000).optional(),
});

const MartialCategorySchema = z.enum([
  'inner', 'unarmed', 'weapon', 'movement', 'hidden', 'misc', 'story_art',
]);
const MartialLayerSchema = z.strictObject({
  n: LayerSchema,
  unlock: z.array(z.string().regex(/^(?:mv|ps)_[a-z0-9_]+$/)),
});
const LearnSourceSchema = z.strictObject({
  type: z.enum(['master', 'manual', 'observe', 'qiyu', 'puzzle', 'combo', 'pages',
    'fragment', 'fused', 'inherit', 'legacy_fragment', 'legacy_synthesis',
    'tutorial_projection']),
  chapter: ChapterIdSchema.optional(),
  ref: z.string().min(1).optional(),
  maxLayer: LayerSchema,
  note: z.string().min(1).optional(),
});

export const MartialArtDefSchema = z
  .strictObject({
    schemaVersion: z.literal('martial-art.v1'),
    id: SkillIdSchema,
    name: z.string().min(1),
    aliases: z.array(z.string().min(1)),
    category: MartialCategorySchema,
    subType: z.string().regex(/^[a-z][a-z0-9_]*$/),
    grade: GradeSchema,
    origin: z.enum(['canon', 'expanded', 'canonExpanded']),
    sect: z.string().regex(/^sect_[a-z0-9_]+$/).nullable(),
    lineage: z.string().min(1).optional(),
    sourceChapters: z.array(ChapterIdSchema).min(1),
    canonRef: z.string().min(1).optional(),
    nature: z.enum(['yang', 'yin', 'harmony', 'neutral']),
    wOutBp: z.number().int().min(0).max(10000),
    wInBp: z.number().int().min(0).max(10000),
    requirements: z.record(z.string(), JsonValueSchema),
    maxLayer: LayerSchema,
    inner: InnerDefSchema.optional(),
    layers: z.array(MartialLayerSchema),
    moveIds: z.array(z.string().regex(/^mv_[a-z0-9_]+$/)),
    learnSources: z.array(LearnSourceSchema).min(1),
    tags: z.array(z.string()),
    description: z.string().min(1),
  })
  .superRefine((value, context) => {
    if (value.wOutBp + value.wInBp !== 10000) context.addIssue({ code: 'custom', path: ['wOutBp'], message: 'wOutBp + wInBp must equal 10000' });
    if ((value.category === 'inner') !== (value.inner !== undefined)) context.addIssue({ code: 'custom', path: ['inner'], message: 'inner is required only for inner martial arts' });
    if (value.category === 'inner' && value.nature === 'neutral') context.addIssue({ code: 'custom', path: ['nature'], message: 'inner martial arts cannot be neutral' });
    if (value.category === 'story_art' && value.id !== 'sk_changshengjue')
      context.addIssue({ code: 'custom', path: ['id'], message: 'story_art is reserved for sk_changshengjue' });
    if (value.category === 'story_art' && value.maxLayer !== 9)
      context.addIssue({ code: 'custom', path: ['maxLayer'], message: 'story_art has exactly nine layers' });
    for (const [index, source] of value.learnSources.entries()) {
      if (source.type === 'tutorial_projection' &&
          (source.chapter?.startsWith('ch00_') !== true || source.ref === undefined))
        context.addIssue({ code: 'custom', path: ['learnSources', index],
          message: 'tutorial projections require a ch00 chapter and receipt ref' });
    }
    const layers = value.layers.map((entry) => entry.n);
    if (new Set(layers).size !== layers.length) context.addIssue({ code: 'custom', path: ['layers'], message: 'layer entries must be unique' });
  });

export const SkillInstanceSchema = z
  .strictObject({
    skillId: SkillIdSchema, sourceGrade: GradeSchema, sourceCap: LayerSchema,
    trueLayer: LayerSchema, sxp: NonNegativeIntegerSchema,
    learnedIn: ChapterIdSchema, nativeTo: ChapterIdSchema,
    attunedGrade: GradeSchema.nullable(), attunedIn: ChapterIdSchema.nullable(),
    latentExp: NonNegativeIntegerSchema,
    movesEquipped: z.array(z.string().regex(/^mv_[a-z0-9_]+$/)),
    insight: NonNegativeIntegerSchema, pages: z.array(z.number().int().positive()),
    flags: z.array(z.string().regex(/^[a-z][a-z0-9_]*$/)),
  })
  .superRefine((value, context) => {
    if ((value.attunedGrade === null) !== (value.attunedIn === null))
      context.addIssue({ code: 'custom', path: ['attunedGrade'], message: 'attunement grade and chapter must be paired' });
    if (new Set(value.movesEquipped).size !== value.movesEquipped.length)
      context.addIssue({ code: 'custom', path: ['movesEquipped'], message: 'movesEquipped must be unique' });
    if (new Set(value.pages).size !== value.pages.length)
      context.addIssue({ code: 'custom', path: ['pages'], message: 'pages must be unique' });
    if (new Set(value.flags).size !== value.flags.length)
      context.addIssue({ code: 'custom', path: ['flags'], message: 'flags must be unique' });
  });

export function parseSkillInstanceForDefinition(
  value: unknown, definition: Pick<MartialArtDef, 'id' | 'grade' | 'maxLayer'>,
): SkillInstance {
  const instance = SkillInstanceSchema.parse(value);
  if (instance.skillId !== definition.id) throw new TypeError('SKILL_INSTANCE_ID');
  if (instance.sourceGrade > definition.grade) throw new TypeError('SKILL_INSTANCE_SOURCE_GRADE');
  if (instance.sourceCap > definition.maxLayer || instance.trueLayer > instance.sourceCap)
    throw new TypeError('SKILL_INSTANCE_LAYER_CAP');
  return instance;
}

export type InnerDef = z.output<typeof InnerDefSchema>;
export type MartialArtDef = z.output<typeof MartialArtDefSchema>;
export type SkillInstance = z.output<typeof SkillInstanceSchema>;
