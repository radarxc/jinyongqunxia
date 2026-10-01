import { z } from 'zod';

const namedId = (prefix: string) =>
  z.string().regex(new RegExp(`^${prefix}[a-z0-9]+(?:_[a-z0-9]+)*$`));

export const SafeIntegerSchema = z.number().int().safe();
export const NonNegativeIntegerSchema = SafeIntegerSchema.min(0);
export const PositiveIntegerSchema = SafeIntegerSchema.min(1);
export const BasisPointsSchema = SafeIntegerSchema.min(0);
export const GradeSchema = SafeIntegerSchema.min(1).max(12);
export const LayerSchema = SafeIntegerSchema.min(1).max(10);
export const StrengthLayerSchema = SafeIntegerSchema.min(1).max(9);

export const ChapterIdSchema = z
  .string()
  .regex(/^ch(?:0[0-9]|1[0-5])_[a-z0-9]+(?:_[a-z0-9]+)*$/);
export const EraLayerSchema = z.string().regex(/^ch(?:0[0-9]|1[0-5])$/);
export const SkillIdSchema = namedId('sk_');
export const NpcIdSchema = namedId('npc_');
export const ItemIdSchema = z.string().regex(/^(?:it|eq)_[a-z0-9]+(?:_[a-z0-9]+)*$/);
export const MeridianIdSchema = namedId('mer_').refine(
  (id) => !['mer_ren', 'mer_du', 'mer_chong', 'mer_dai'].includes(id),
  'legacy short meridian IDs are read-only migration inputs',
);
export const AcupointIdSchema = namedId('ap_');
export const EventIdSchema = namedId('ev_');
export const QuestIdSchema = namedId('q_');
export const SceneIdSchema = z.string().regex(/^sc_[a-z0-9]+(?:_[a-z0-9]+)*$/);
export const SectIdSchema = namedId('sect_');
export const CityIdSchema = namedId('city_');
export const LocalKeySchema = z.string().regex(/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/);
export const CharacterTemplateIdSchema = z
  .string()
  .regex(/^tmpl_(?:normal|elite|head|boss|[a-z0-9]+(?:_[a-z0-9]+)*)$/);

export const SourceRefSchema = z.strictObject({
  kind: z.enum(['novel', 'history', 'repository', 'expanded']),
  work: z.string().min(1).optional(),
  locator: z.string().min(1),
  url: z.url().optional(),
  accessed: z.string().min(1).optional(),
});

export const JsonValueSchema: z.ZodType<
  null | boolean | number | string | readonly unknown[] | Readonly<Record<string, unknown>>
> = z.lazy(() =>
  z.union([
    z.null(),
    z.boolean(),
    z.number().finite(),
    z.string(),
    z.array(JsonValueSchema),
    z.record(z.string(), JsonValueSchema),
  ]),
);

export const ContentManifestSchema = z.strictObject({
  schemaVersion: z.literal(1),
  chapterId: ChapterIdSchema,
  contentHash: z.string().regex(/^[a-f0-9]{64}$/),
  files: z.array(z.string()),
});

export type Grade = z.output<typeof GradeSchema>;
