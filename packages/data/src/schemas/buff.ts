import { z } from 'zod';
import { GradeSchema } from './primitives';

const BuffIdSchema = z.string().regex(/^bf_[a-z0-9]+(?:_[a-z0-9]+)*$/);
const FamilyIdSchema = z.string().regex(/^fam_[a-z0-9]+(?:_[a-z0-9]+)*$/);
const ExprSchema = z.string().min(1);

const DurationSchema = z.strictObject({
  type: z.literal('turns'),
  value: z.number().int().positive(),
  fresh: z.enum(['skipFirst', 'countNow']).optional(),
});

const StackSchema = z.strictObject({
  rule: z.literal('refresh'),
  key: z.literal('def').optional(),
});

const DispelSchema = z.strictObject({
  dispellable: z.boolean(),
  types: z.array(z.enum([
    'circulate', 'acupoint', 'medicine', 'antidote', 'skill', 'purge', 'special',
    'rest', 'bookSleep',
  ])).optional(),
});

const ModStatSchema = z.strictObject({
  op: z.literal('modStat'),
  stat: z.enum(['hit', 'parry', 'defOut', 'effRes']),
  kind: z.literal('pct'),
  value: ExprSchema,
});

const RecoveryModSchema = z.strictObject({
  op: z.literal('modRecovery'),
  valueBp: z.number().int().min(0).max(10_000),
  consume: z.literal('nextMove'),
});

const UiSchema = z.strictObject({
  icon: z.string().regex(/^buff\/[a-z0-9-]+$/),
  frame: z.literal('auto'),
  showStacks: z.boolean().optional(),
  showTimer: z.boolean().optional(),
  sortGroup: z.string().regex(/^[a-z][a-z0-9_]*$/),
  hudPin: z.boolean().optional(),
});

const TextSchema = z.strictObject({
  desc: z.string().min(1),
  short: z.string().min(1).max(12),
  log: z.string().min(1),
  lore: z.string().min(1).optional(),
});

export const BuffDefSchema = z.strictObject({
  schemaVersion: z.literal('buff.v1'),
  id: BuffIdSchema,
  name: z.string().min(1),
  category: z.enum(['stat', 'effect', 'mechanic']),
  polarity: z.enum(['buff', 'debuff']),
  grade: z.union([z.literal('inherit'), GradeSchema]),
  gradeRange: z.tuple([GradeSchema, GradeSchema]),
  tags: z.array(z.enum(['cc', 'weaken'])).min(1),
  subTags: z.array(z.string().regex(/^[a-z][a-z0-9]*(?:\.[A-Za-z][A-Za-z0-9]*)+$/)).optional(),
  family: FamilyIdSchema.optional(),
  resistAttr: z.enum(['resCC']).nullable().optional(),
  duration: DurationSchema,
  stack: StackSchema,
  dispel: DispelSchema,
  priority: z.number().int().min(0).max(999),
  params: z.record(z.string().regex(/^[a-z][A-Za-z0-9]*$/), ExprSchema).optional(),
  mods: z.array(z.union([ModStatSchema, RecoveryModSchema])).min(1),
  ui: UiSchema,
  text: TextSchema,
  origin: z.enum(['canon', 'expanded', 'canonExpanded']),
  canonRef: z.string().min(1).optional(),
}).superRefine((value, context) => {
  if (value.gradeRange[0] > value.gradeRange[1])
    context.addIssue({ code: 'custom', path: ['gradeRange'], message: 'grade range min must not exceed max' });
  if (value.category === 'stat' && value.family === undefined)
    context.addIssue({ code: 'custom', path: ['family'], message: 'stat buffs require family' });
  if (!value.dispel.dispellable && (value.dispel.types?.length ?? 0) > 0)
    context.addIssue({ code: 'custom', path: ['dispel', 'types'], message: 'non-dispellable buffs cannot list dispel types' });
});

export type BuffDef = z.output<typeof BuffDefSchema>;
