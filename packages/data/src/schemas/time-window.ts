import { z } from 'zod';
import { QuestIdSchema } from './primitives';

const NodeIdSchema = z.string().regex(/^n_[a-z0-9_]+$/);
const LineIdSchema = z.string().regex(/^(?:main|side_[a-z0-9_]+)$/);
const OnMissSchema = z.discriminatedUnion('policy', [
  z.strictObject({ policy: z.literal('expire') }),
  z.strictObject({ policy: z.literal('defer'), deferByMinutes: z.number().int().positive(),
    maxDefers: z.number().int().min(1).max(9) }),
  z.strictObject({ policy: z.literal('alternate'), targetNodeId: NodeIdSchema }),
]);
const CalendarDateTimeSchema = z.strictObject({ year: z.number().int(),
  month: z.number().int().min(1).max(12), day: z.number().int().min(1).max(30),
  hour: z.number().int().min(0).max(23), minute: z.number().int().min(0).max(59) });
const TimeAnchorSchema = z.discriminatedUnion('event', [
  z.strictObject({ event: z.literal('story/nodeCompleted'),
    lineId: LineIdSchema.optional(), nodeId: NodeIdSchema }),
  z.strictObject({ event: z.literal('quest/accepted'), questId: QuestIdSchema }),
  z.strictObject({ event: z.literal('quest/succeeded'), questId: QuestIdSchema }),
  z.strictObject({ event: z.literal('quest/failed'), questId: QuestIdSchema }),
]);
function calendarOrdinal(value: z.output<typeof CalendarDateTimeSchema>): number {
  return ((((value.year * 12 + value.month - 1) * 30 + value.day - 1) * 24 + value.hour) * 60) +
    value.minute;
}
export const TimeWindowSchema = z.discriminatedUnion('mode', [
  z.strictObject({ mode: z.literal('absolute'), epochId: z.string().min(1),
    opensAt: CalendarDateTimeSchema, closesAt: CalendarDateTimeSchema, onMiss: OnMissSchema })
    .refine((value) => calendarOrdinal(value.opensAt) < calendarOrdinal(value.closesAt),
      { path: ['closesAt'], message: 'window must be non-empty' }),
  z.strictObject({ mode: z.literal('relative'), anchor: TimeAnchorSchema,
    opensAfterMinutes: z.number().int().nonnegative(), closesAfterMinutes: z.number().int().positive(),
    onMiss: OnMissSchema }).refine((value) => value.opensAfterMinutes < value.closesAfterMinutes,
      { path: ['closesAfterMinutes'], message: 'window must be non-empty' }),
]);

export type TimeWindow = z.output<typeof TimeWindowSchema>;
