import { z } from 'zod';
import { ItemIdSchema, LocalKeySchema, QuestIdSchema, SectIdSchema } from './primitives';

export const QinggongActionSchema = z.enum([
  'sprint', 'scramble', 'leap', 'wallkick', 'drop', 'climb', 'roofwalk',
  'waterwalk', 'rapidswalk', 'bigwaterwalk', 'treetop', 'trackless', 'glide',
  'cloudwalk', 'carry', 'swim', 'dive', 'squeeze',
]);
export const GateGeometryValueSchema = z.number().int().safe().nonnegative();
const GateAtomSchema = z.union([
  z.strictObject({
    qg: z.number().int().min(1).max(5),
    action: QinggongActionSchema.optional(),
    height: GateGeometryValueSchema.optional(),
    width: GateGeometryValueSchema.optional(),
    run: GateGeometryValueSchema.optional(),
    stages: GateGeometryValueSchema.optional(),
  }),
  z.strictObject({ item: ItemIdSchema, consume: z.boolean().optional() }),
  z.strictObject({ fame: z.number().int().min(0).max(9999) }),
  z.strictObject({ morality: z.tuple([
    z.number().int().min(-100).max(100),
    z.number().int().min(-100).max(100),
  ]) })
    .refine((value) => value.morality[0] <= value.morality[1], 'morality range must be ordered'),
  z.strictObject({ sect: SectIdSchema, rank: z.number().int().min(1).max(5).optional() }),
  z.strictObject({ status: LocalKeySchema }),
  z.strictObject({
    shichen: z.enum(['zi', 'chou', 'yin', 'mao', 'chen', 'si', 'wu', 'wei',
      'shen', 'you', 'xu', 'hai']).optional(),
    day: z.number().int().positive().optional(),
    festival: LocalKeySchema.optional(),
    weather: z.enum(['clear', 'cloudy', 'rain', 'storm', 'snow', 'blizzard', 'fog',
      'sandstorm']).optional(),
    season: z.enum(['spring', 'summer', 'autumn', 'winter']).optional(),
  }).refine((value) => Object.keys(value).length > 0, 'time condition must not be empty'),
  z.strictObject({
    quest: QuestIdSchema,
    state: z.enum(['inactive', 'active', 'completed', 'failed']),
  }),
  z.strictObject({ act: z.number().int().positive() }),
  z.strictObject({ formation: z.number().int().min(0).max(100) }),
  z.strictObject({
    check: z.strictObject({
      skill: z.enum(['music', 'chess', 'art', 'speech', 'med', 'poi', 'antidote', 'forge']),
      dc: z.number().int().min(0).max(100),
    }),
  }),
  z.strictObject({
    swim: z.number().int().min(0).max(3),
    dive: z.number().int().safe().nonnegative().optional(),
  }),
  z.strictObject({
    beast: z.number().int().min(1).max(12),
    kind: LocalKeySchema,
  }),
  z.strictObject({ mount: z.enum(['horse', 'camel']) }),
  z.strictObject({ boat: z.enum(['small', 'sea']) }),
  z.strictObject({ light: z.literal(true) }),
  z.strictObject({ special: LocalKeySchema }),
  z.strictObject({ device: LocalKeySchema, operator: LocalKeySchema.optional() }),
  z.strictObject({ str: z.number().int().safe().nonnegative() }),
  z.strictObject({ companion: z.strictObject({ qgMin: z.number().int().min(1).max(5) }) }),
  z.strictObject({ buff: z.string().regex(/^bf_[a-z0-9]+(?:_[a-z0-9]+)*$/) }),
]);

export type GateExpr = z.output<typeof GateAtomSchema> | { all: GateExpr[] } |
  { any: GateExpr[] } | { not: GateExpr };
export const GateExprSchema: z.ZodType<GateExpr> = z.lazy(() => z.union([
  GateAtomSchema,
  z.strictObject({ all: z.array(GateExprSchema).min(1) }),
  z.strictObject({ any: z.array(GateExprSchema).min(1) }),
  z.strictObject({ not: GateExprSchema }),
]));
