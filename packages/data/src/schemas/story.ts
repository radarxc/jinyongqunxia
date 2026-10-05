import { z } from 'zod';
import { ChapterIdSchema, EraLayerSchema, JsonValueSchema, NpcIdSchema, QuestIdSchema, SceneIdSchema } from './primitives';
import { QuestEffectSchema } from './quest';
import { TimeWindowSchema } from './time-window';
export { TimeWindowSchema, type TimeWindow } from './time-window';

const NodeIdSchema = z.string().regex(/^n_[a-z0-9_]+$/);
const LineIdSchema = z.string().regex(/^(?:main|side_[a-z0-9_]+)$/);
export const StoryConditionExpressionSchema = z.record(z.string(), JsonValueSchema)
  .refine((value) => Object.keys(value).length > 0, 'condition cannot be empty');
const CommonNodeSchema = z.strictObject({
  id: NodeIdSchema, titleKey: z.string().min(1), completeOn: z.string().min(1),
  timeWindow: TimeWindowSchema.optional(), once: z.boolean().optional(), sourceRef: z.string().min(1),
});
const ActorPayloadSchema = z.strictObject({
  npcId: NpcIdSchema,
  sceneId: SceneIdSchema,
  anchor: z.string().regex(/^[a-z][a-z0-9_]*$/),
  eraLayer: EraLayerSchema,
});
const ChoicePayloadSchema = z.strictObject({
  decisionId: z.string().regex(/^dc_[a-z0-9_]+$/),
  options: z.array(z.strictObject({
    key: z.string().regex(/^[a-z][a-z0-9_]*$/), textKey: z.string().min(1),
    when: StoryConditionExpressionSchema.optional(),
  })).min(2),
}).refine((value) => new Set(value.options.map((option) => option.key)).size === value.options.length, {
  path: ['options'], message: 'choice option keys must be unique',
});
export const StoryNodeSchema = z.discriminatedUnion('type', [
  CommonNodeSchema.extend({ type: z.literal('spawn'), payload: ActorPayloadSchema }),
  CommonNodeSchema.extend({ type: z.literal('despawn'), payload: ActorPayloadSchema.extend({ reason: z.string().min(1) }) }),
  CommonNodeSchema.extend({ type: z.literal('dialogue'), payload: z.union([z.strictObject({ ink: z.strictObject({ storyId: z.string().min(1), knot: z.string().min(1) }) }), z.strictObject({ inlineLines: z.array(z.strictObject({ speakerId: z.string().regex(/^(?:npc_[a-z0-9_]+|player|narrator)$/), textKey: z.string().min(1) })).min(1) })]) }),
  CommonNodeSchema.extend({ type: z.literal('quest'), payload: z.union([z.strictObject({ questId: QuestIdSchema }), z.strictObject({ inlineEvent: z.strictObject({ eventKey: z.string().regex(/^[a-z][a-z0-9_]*$/), actions: z.array(QuestEffectSchema).min(1) }) })]) }),
  CommonNodeSchema.extend({ type: z.literal('choice'), payload: ChoicePayloadSchema }),
  CommonNodeSchema.extend({ type: z.literal('condition'), payload: z.strictObject({ expression: StoryConditionExpressionSchema }) }),
  CommonNodeSchema.extend({ type: z.literal('merge'), payload: z.strictObject({ mergeKey: z.string().regex(/^[a-z][a-z0-9_]*$/) }) }),
  CommonNodeSchema.extend({ type: z.literal('end'), payload: z.strictObject({ endingTags: z.array(z.string()).min(1) }) }),
]);

const CommonEdgeSchema = z.strictObject({
  id: z.string().regex(/^e_[a-z0-9_]+$/),
  from: NodeIdSchema,
  to: NodeIdSchema,
  priority: z.number().int().min(0).max(1000),
});
export const StoryEdgeSchema = z.discriminatedUnion('trigger', [
  CommonEdgeSchema.extend({ trigger: z.literal('auto') }),
  CommonEdgeSchema.extend({ trigger: z.literal('condition'), condition: StoryConditionExpressionSchema }),
  CommonEdgeSchema.extend({ trigger: z.literal('choice'), choiceKey: z.string().regex(/^[a-z][a-z0-9_]*$/) }),
  CommonEdgeSchema.extend({ trigger: z.literal('timeout') }),
]);

export const StoryLineShapeSchema = z.strictObject({
  schemaVersion: z.literal('story.v1'),
  chapterId: ChapterIdSchema,
  lineId: LineIdSchema,
  kind: z.enum(['main', 'side']),
  titleKey: z.string().min(1),
  eraLayer: EraLayerSchema,
  startNodeId: NodeIdSchema,
  trigger: z.strictObject({
    condition: StoryConditionExpressionSchema.optional(),
    timeWindow: TimeWindowSchema.optional(),
  })
    .refine((value) => value.condition !== undefined || value.timeWindow !== undefined, 'trigger cannot be empty').optional(),
  sideHooks: z.array(z.strictObject({
    lineId: z.string().regex(/^side_[a-z0-9_]+$/),
    atNodeId: NodeIdSchema,
    when: StoryConditionExpressionSchema,
    optional: z.boolean().optional(),
  })),
  nodes: z.array(StoryNodeSchema).min(1), edges: z.array(StoryEdgeSchema),
  source: z.strictObject({ document: z.string().min(1), anchors: z.array(z.string()).min(1), note: z.string().optional() }),
});

export type StoryNode = z.output<typeof StoryNodeSchema>;
export type StoryEdge = z.output<typeof StoryEdgeSchema>;
