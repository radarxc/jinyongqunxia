import { z } from 'zod';
import { ChapterIdSchema, EraLayerSchema, LocalKeySchema,
  NonNegativeIntegerSchema, SceneIdSchema } from './primitives';

const RegionIdSchema = z.string().regex(/^rg_[a-z0-9]+(?:_[a-z0-9]+)*$/);

export const ChapterDefSchema = z.strictObject({
  schemaVersion: z.literal('book-world.v1'),
  id: ChapterIdSchema,
  eraLayerId: EraLayerSchema,
  gameYear: z.strictObject({
    start: z.number().int().safe(),
    end: z.number().int().safe(),
    approx: z.boolean(),
  }),
  worldTier: z.enum(['HIGH', 'MID', 'LOW']),
  levelCap: z.number().int().min(1).max(70),
  layerCap: z.number().int().min(1).max(10),
  foreignSuppression: z.number().int().min(0).max(12),
  startTick: NonNegativeIntegerSchema,
  countsRealLevel: z.boolean(),
  wake: z.strictObject({
    regionId: RegionIdSchema,
    sceneId: SceneIdSchema,
    spawnId: LocalKeySchema,
  }),
}).superRefine((value, context) => {
  if (value.gameYear.end < value.gameYear.start) context.addIssue({
    code: 'custom', path: ['gameYear', 'end'], message: 'gameYear.end precedes start',
  });
  if (!value.id.startsWith(`${value.eraLayerId}_`)) context.addIssue({
    code: 'custom', path: ['eraLayerId'], message: 'eraLayerId must match chapter token',
  });
});

export type ChapterDef = z.output<typeof ChapterDefSchema>;
