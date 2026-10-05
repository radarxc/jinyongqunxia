import { z } from 'zod';
import {
  AcupointIdSchema, GradeSchema, MeridianIdSchema, NonNegativeIntegerSchema,
  PositiveIntegerSchema, StrengthLayerSchema,
} from './primitives';

export const MeridianNatureSchema = z.enum(['yin', 'yang', 'harmony']);

const RewardBaseSchema = z.strictObject({
  modifierId: z.string().regex(/^[a-z][a-z0-9_]*$/),
  stat: z.string().min(1),
});
export const MeridianRewardSchema = z.discriminatedUnion('op', [
  RewardBaseSchema.extend({ op: z.literal('flat'), valueMilli: z.number().int() }),
  RewardBaseSchema.extend({ op: z.literal('pct'), valueBp: z.number().int() }),
  RewardBaseSchema.extend({ op: z.literal('pp'), valueMilliPp: z.number().int() }),
]);

export const MeridianDefSchema = z.strictObject({
  schemaVersion: z.literal('meridian.v1'),
  id: MeridianIdSchema,
  name: z.string().min(1),
  family: z.enum(['regular12', 'extra8']),
  nature: MeridianNatureSchema,
  difficultyTier: z.number().int().min(1).max(6),
  direction: z.string().min(1),
  organRelation: z.string().min(1),
  acupoints: z.array(AcupointIdSchema).min(6).max(12),
  unlock: z.strictObject({
    minMainInnerLayer: z.number().int().min(1).max(10),
    requiresAnyCompletedMeridian: z.boolean().optional(),
    requiresMilestones: z.array(z.string().regex(/^zt_[a-z0-9_]+$/)).optional(),
  }),
  completionRewards: z.array(MeridianRewardSchema),
}).refine((value) => new Set(value.acupoints).size === value.acupoints.length, {
  path: ['acupoints'], message: 'acupoints must be unique',
});

export const AcupointDefSchema = z.strictObject({
  schemaVersion: z.literal('acupoint.v2'),
  id: AcupointIdSchema,
  name: z.string().min(1),
  gameMeridian: MeridianIdSchema,
  standardCode: z.string().min(1),
  standardMeridian: MeridianIdSchema,
  routeKind: z.enum(['native', 'intersect', 'borrowed']),
  sequence: PositiveIntegerSchema,
  lengthUnit: z.number().int().min(1).max(12),
  barrierH: PositiveIntegerSchema,
  baseRewards: z.array(MeridianRewardSchema),
  passiveBuffs: z.array(z.string().regex(/^bf_[a-z0-9_]+$/)),
  sourceRef: z.string().min(1),
});

export const MeridianPermanentStatSchema = z.strictObject({
  grade: GradeSchema,
  strengthLayer: StrengthLayerSchema,
  strengthXp: NonNegativeIntegerSchema,
  fluxCap: PositiveIntegerSchema,
});
const AttemptSchema = z.strictObject({
  progressH: NonNegativeIntegerSchema,
  attemptOrdinal: NonNegativeIntegerSchema,
});
export const MeridianProgressSchema = z
  .strictObject({
    schemaVersion: z.literal(2),
    opened: z.array(AcupointIdSchema),
    meridianStats: z.record(MeridianIdSchema, MeridianPermanentStatSchema),
    acupointStats: z.record(AcupointIdSchema, MeridianPermanentStatSchema),
    targets: z.record(AcupointIdSchema, AttemptSchema),
    turnCompleted: z.number().int().min(0).max(9),
    turnTarget: z.string().regex(/^zt_[a-z0-9_]+$/).optional(),
    turnState: AttemptSchema.optional(),
    lastAppliedMigration: NonNegativeIntegerSchema,
  })
  .superRefine((value, context) => {
    for (const [id, stat] of Object.entries(value.meridianStats)) {
      if (stat.fluxCap > 96) context.addIssue({ code: 'custom', path: ['meridianStats', id, 'fluxCap'], message: '经脉通量上限为 96' });
    }
    for (const [id, stat] of Object.entries(value.acupointStats)) {
      if (stat.fluxCap > 64) context.addIssue({ code: 'custom', path: ['acupointStats', id, 'fluxCap'], message: '穴位通量上限为 64' });
    }
    if (new Set(value.opened).size !== value.opened.length) context.addIssue({ code: 'custom', path: ['opened'], message: '已开穴不得重复' });
    const opened = new Set(value.opened);
    const statIds = Object.keys(value.acupointStats);
    if (value.opened.some((id) => !(id in value.acupointStats)) || statIds.some((id) => !opened.has(id)))
      context.addIssue({ code: 'custom', path: ['acupointStats'], message: '已开穴与穴位永久强度项必须一一对应' });
    if (Object.keys(value.targets).some((id) => opened.has(id)))
      context.addIssue({ code: 'custom', path: ['targets'], message: '已开穴不得保留未完成目标' });
    if ((value.turnTarget === undefined) !== (value.turnState === undefined))
      context.addIssue({ code: 'custom', path: ['turnState'], message: '九转目标与进度必须成对' });
  });

export type MeridianDef = z.output<typeof MeridianDefSchema>;
export type AcupointDef = z.output<typeof AcupointDefSchema>;
export type MeridianProgress = z.output<typeof MeridianProgressSchema>;
