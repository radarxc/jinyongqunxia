import { z } from 'zod';
import { ChapterIdSchema, LocalKeySchema } from './primitives';
import { GateExprSchema } from './gate-expr';

export const FACILITY_KINDS = [
  'shop', 'inn', 'tavern', 'teahouse', 'clinic', 'escort', 'casino',
  'school', 'relay', 'manor', 'stall', 'temple', 'office', 'residence',
] as const;

export const FacilityKindSchema = z.enum(FACILITY_KINDS);
export const FacilityLayoutKeySchema = z.string()
  .regex(/^city_[a-z0-9]+(?:_[a-z0-9]+)*__ch(?:0[0-9]|1[0-5])$/u);
const BuildingIdSchema = z.string().regex(/^bi_[a-z0-9]+(?:_[a-z0-9]+)*$/u);
const TextKeySchema = z.string().regex(/^[a-z][A-Za-z0-9]*(?:[.-][A-Za-z0-9_]+|_[A-Za-z0-9_]+)+$/u);
const StoryIdSchema = z.string().regex(/^(?:story|ink)_[a-z0-9_]+$/u);
const EntryKeySchema = z.string().regex(/^[A-Za-z_][A-Za-z0-9_.]*$/u);
const MinuteSchema = z.number().int().safe().min(0).max(1439);
const withRegistryId = <T extends object>(value: T, id: string): T => {
  Object.defineProperty(value, 'id', { value: id, enumerable: false });
  return value;
};

export const TownFacilitySchema = z.strictObject({
  key: LocalKeySchema,
  kind: FacilityKindSchema,
  sub: LocalKeySchema.nullable(),
  buildingId: BuildingIdSchema,
  nameKey: TextKeySchema,
  shop: z.strictObject({
    templateRef: LocalKeySchema,
    kind: z.enum(['normal', 'famous', 'blackMarket']),
  }).nullable(),
  roles: z.array(LocalKeySchema).min(1),
  hours: z.strictObject({ open: MinuteSchema, close: MinuteSchema }).nullable().optional(),
});

export const TownFacilitiesSchema = z.strictObject({
  schemaVersion: z.literal('town-facilities.v1'),
  layoutKey: FacilityLayoutKeySchema,
  facilities: z.array(TownFacilitySchema),
}).superRefine((value, context) => {
  const keys = new Set<string>();
  const buildings = new Set<string>();
  for (const [index, facility] of value.facilities.entries()) {
    if (keys.has(facility.key)) context.addIssue({
      code: 'custom', path: ['facilities', index, 'key'], message: 'facility keys must be unique',
    });
    if (buildings.has(facility.buildingId)) context.addIssue({
      code: 'custom', path: ['facilities', index, 'buildingId'],
      message: 'facility building IDs must be unique',
    });
    keys.add(facility.key);
    buildings.add(facility.buildingId);
  }
}).transform((value) => withRegistryId(value, value.layoutKey));

export const FacilityDialogueBindingSchema = z.strictObject({
  chapter: z.union([ChapterIdSchema, z.literal('common')]),
  kind: FacilityKindSchema,
  sub: LocalKeySchema.optional(),
  roleKey: LocalKeySchema,
  storyId: StoryIdSchema,
  entryKey: EntryKeySchema,
  condition: GateExprSchema.optional(),
});

export const FacilityDialogueSchema = z.strictObject({
  schemaVersion: z.literal('facility-dialogue.v1'),
  bindings: z.array(FacilityDialogueBindingSchema),
}).superRefine((value, context) => {
  const identities = new Set<string>();
  for (const [index, binding] of value.bindings.entries()) {
    const identity = [binding.chapter, binding.kind, binding.sub ?? '', binding.roleKey].join('/');
    if (identities.has(identity)) context.addIssue({
      code: 'custom', path: ['bindings', index], message: 'facility dialogue bindings must be unique',
    });
    identities.add(identity);
  }
}).transform((value) => withRegistryId(value, 'facility_dialogue'));

export type FacilityKind = z.output<typeof FacilityKindSchema>;
export type TownFacility = z.output<typeof TownFacilitySchema>;
export type TownFacilitiesDef = z.output<typeof TownFacilitiesSchema>;
export type FacilityDialogueBinding = z.output<typeof FacilityDialogueBindingSchema>;
export type FacilityDialogueDef = z.output<typeof FacilityDialogueSchema>;
