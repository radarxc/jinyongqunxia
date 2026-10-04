import { z } from 'zod';
import {
  ChapterIdSchema, CharacterTemplateIdSchema, EncounterIdSchema, PositiveIntegerSchema,
  QuestIdSchema,
} from './primitives';

export const RoleSlotIdSchema = z
  .string()
  .regex(/^role_[a-z0-9]+(?:_[a-z0-9]+)*$/);

export const DreamTierSchema = z.union([z.literal(1), z.literal(2)]);

export const RoleSlotSeedSchema = z.strictObject({
  strategy: z.literal('stable_per_save'),
  tuple: z.tuple([
    z.literal('runId'),
    z.literal('chapterId'),
    z.literal('templateId'),
    z.literal('spawnKey'),
    z.literal('spawnOrdinal'),
  ]),
});

export const RoleSlotDefSchema = z.strictObject({
  schemaVersion: z.literal('role-slot.v1'),
  slotId: RoleSlotIdSchema,
  chapter: ChapterIdSchema,
  templateId: CharacterTemplateIdSchema,
  count: PositiveIntegerSchema,
  dreamTier: DreamTierSchema,
  seed: RoleSlotSeedSchema,
  displayRoleKey: z.string().regex(/^role\.role_[a-z0-9_]+\.name$/).optional(),
  consumerRefs: z.array(z.union([QuestIdSchema, EncounterIdSchema])).default([]),
}).superRefine((value, context) => {
  if (value.displayRoleKey !== undefined &&
      value.displayRoleKey !== `role.${value.slotId}.name`) context.addIssue({
    code: 'custom', path: ['displayRoleKey'],
    message: 'ROLE_SLOT_DISPLAY_KEY: displayRoleKey must match slotId',
  });
  if (new Set(value.consumerRefs).size !== value.consumerRefs.length) context.addIssue({
    code: 'custom', path: ['consumerRefs'], message: 'ROLE_SLOT_CONSUMER_DUPLICATE',
  });
});

export type RoleSlotDef = z.output<typeof RoleSlotDefSchema>;
