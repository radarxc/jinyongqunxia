import { z } from 'zod';
import { ChapterIdSchema, EventIdSchema, FlagIdSchema, ItemIdSchema, JsonValueSchema, LocalKeySchema, NpcIdSchema } from './primitives';
import { EventActionSchema } from './event-actions';
import { GateExprSchema, type GateExpr } from './region-map';
import { TimeWindowSchema } from './time-window';

export const ShopDefSchema = z.strictObject({
  schemaVersion: z.literal('shop.v1'), key: LocalKeySchema, name: z.string().min(1),
  chapterId: ChapterIdSchema, keeperNpcId: NpcIdSchema.optional(),
  supply: z.array(z.strictObject({
    itemId: ItemIdSchema, maxGrade: z.number().int().min(1).max(12),
    baseStock: z.number().int().nonnegative(), restockEveryDays: z.number().int().positive(),
    restockAmount: z.number().int().nonnegative(), priceBp: z.number().int().positive(),
    condition: z.record(z.string(), JsonValueSchema).optional(),
  })),
});

export type EventGateExpr = GateExpr | { flag: z.output<typeof FlagIdSchema> } |
  { all: EventGateExpr[] } | { any: EventGateExpr[] } | { not: EventGateExpr };
export const EventGateExprSchema: z.ZodType<EventGateExpr> = z.lazy(() => z.union([
  GateExprSchema,
  z.strictObject({ flag: FlagIdSchema }),
  z.strictObject({ all: z.array(EventGateExprSchema).min(1) }),
  z.strictObject({ any: z.array(EventGateExprSchema).min(1) }),
  z.strictObject({ not: EventGateExprSchema }),
]));

export const EventDefSchema = z.strictObject({
  schemaVersion: z.literal('event.v1'), id: EventIdSchema, chapterId: ChapterIdSchema,
  event: z.string().regex(new RegExp('^[a-z][a-zA-Z0-9]*(?:/[a-z][a-zA-Z0-9]*)+$')),
  once: z.boolean(), timeWindow: TimeWindowSchema.optional(),
  condition: z.strictObject({
    sceneId: z.string().min(1).optional(), anchorId: z.string().min(1).optional(),
    sourceEvent: z.string().regex(/^[a-z][a-zA-Z0-9]*(?:\/[a-z][a-zA-Z0-9]*)+$/).optional(),
    chapterId: ChapterIdSchema.optional(), gate: EventGateExprSchema.optional(),
  }).refine((value) => Object.keys(value).length > 0, 'condition cannot be empty').optional(),
  actions: z.array(EventActionSchema).min(1),
});

const WorldItemSchema = z.strictObject({
  instanceKey: z.string().regex(/^[a-z][a-z0-9_]*$/), itemId: ItemIdSchema,
  count: z.number().int().positive(), locationId: z.string().min(1),
  collectible: z.boolean(), condition: z.record(z.string(), JsonValueSchema).optional(),
});
export const BookWorldDefSchema = z.strictObject({
  schemaVersion: z.literal('book-world.v1'), id: ChapterIdSchema, chapterId: ChapterIdSchema,
  epochId: z.string().regex(/^epoch_[a-z0-9_]+$/), epochYear: z.number().int(),
  worldTier: z.enum(['HIGH', 'MID', 'LOW']), mainStoryLine: z.literal('main'),
  sideStoryLines: z.array(z.string().regex(/^side_[a-z0-9_]+$/)),
  globalItems: z.array(WorldItemSchema), collectibleLocations: z.array(WorldItemSchema),
  shopKeys: z.array(LocalKeySchema), eventIds: z.array(EventIdSchema),
}).refine((value) => value.id === value.chapterId, { path: ['id'], message: 'book world id equals chapterId' });

export type ShopDef = z.output<typeof ShopDefSchema>;
export type EventDef = z.output<typeof EventDefSchema>;
export type BookWorldDef = z.output<typeof BookWorldDefSchema>;
