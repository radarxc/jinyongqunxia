import { z } from 'zod';
import {
  ChapterIdSchema, EncounterIdSchema, FlagIdSchema, ItemIdSchema, NpcIdSchema,
  QuestIdSchema, SectIdSchema, SkillIdSchema,
} from './primitives';

const LocalIdSchema = z.string().regex(/^(?:st|edge|fx|chk)_[a-z0-9_]+$/);
const StageIdSchema = z.string().regex(/^st_[a-z0-9_]+$/);
const StoryIdSchema = z.string().regex(/^(?:story|ink)_[a-z0-9_]+$/);
const KnotSchema = z.string().regex(/^[A-Za-z_][A-Za-z0-9_.]*$/);
const ConditionLeafSchema = z.union([
  z.strictObject({ flag: z.strictObject({ id: FlagIdSchema, is: z.boolean() }) }),
  z.strictObject({ quest: z.strictObject({
    id: QuestIdSchema, state: z.enum(['inactive', 'active', 'completed', 'failed']),
    stage: StageIdSchema.optional(),
  }) }),
  z.strictObject({ hasItem: z.strictObject({ id: ItemIdSchema, count: z.number().int().positive() }) }),
  z.strictObject({ sect: z.strictObject({
    id: SectIdSchema, status: z.enum(['none', 'member', 'expelled', 'betrayed']),
    rankAtLeast: z.number().int().min(1).max(5).optional(),
    contributionAtLeast: z.number().int().min(0).optional(),
  }) }),
  z.strictObject({ compare: z.strictObject({
    left: z.strictObject({ stat: z.enum(['level', 'morality', 'fame', 'fameTotal']) }),
    op: z.enum(['eq', 'ne', 'lt', 'le', 'gt', 'ge']), right: z.number().int(),
  }) }),
  z.strictObject({ npc: z.strictObject({
    id: NpcIdSchema, state: z.enum(['alive', 'dead', 'unknown']).optional(),
    affinityAtLeast: z.number().int().min(-100).max(100).optional(),
    bondAtLeast: z.number().int().min(0).max(100).optional(),
  }) }),
]);
export type QuestCondition = z.input<typeof ConditionLeafSchema> | {
  readonly all: readonly QuestCondition[];
} | { readonly any: readonly QuestCondition[] } | { readonly not: QuestCondition };
export const QuestConditionSchema: z.ZodType<QuestCondition> = z.lazy(() => z.union([
  ConditionLeafSchema,
  z.strictObject({ all: z.array(QuestConditionSchema).min(1) }),
  z.strictObject({ any: z.array(QuestConditionSchema).min(1) }),
  z.strictObject({ not: QuestConditionSchema }),
]));

const CommonEffectSchema = { id: LocalIdSchema };
export const QuestEffectSchema = z.discriminatedUnion('op', [
  z.strictObject({ ...CommonEffectSchema, op: z.enum(['flag/set', 'flag/clear']), flagId: FlagIdSchema }),
  z.strictObject({ ...CommonEffectSchema, op: z.literal('battle/start'),
    encounterId: EncounterIdSchema, allyControl: z.enum(['ai', 'player']).optional() }),
  z.strictObject({ ...CommonEffectSchema, op: z.literal('reward/item'),
    itemId: ItemIdSchema, count: z.number().int().positive() }),
  z.strictObject({ ...CommonEffectSchema, op: z.literal('learnSource/unlock'),
    skillId: SkillIdSchema, sourceRef: z.string().min(1) }),
  z.strictObject({ ...CommonEffectSchema, op: z.literal('dialogue/start'),
    storyId: StoryIdSchema, knot: KnotSchema }),
  z.strictObject({ ...CommonEffectSchema, op: z.literal('reward/exp'),
    expKind: z.string().regex(/^[a-z][a-z0-9_]*$/),
    levelRef: z.literal('recommended'), multiplier: z.number().positive().optional() }),
  z.strictObject({ ...CommonEffectSchema, op: z.enum(['reward/fame', 'reward/morality']),
    delta: z.number().int(), reasonCode: z.string().regex(/^[a-z][a-z0-9_]*$/) }),
  z.strictObject({ ...CommonEffectSchema, op: z.literal('sect/claimRank'), sectId: SectIdSchema }),
  z.strictObject({ ...CommonEffectSchema, op: z.literal('quest/advance'),
    questId: QuestIdSchema, toStage: StageIdSchema }),
]);

const ObjectiveSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('dialogue'), storyId: StoryIdSchema, knot: KnotSchema }),
  z.strictObject({ type: z.literal('battle'), encounterId: EncounterIdSchema }),
  z.strictObject({ type: z.literal('confirmFlag'), flagId: FlagIdSchema, is: z.boolean() }),
  z.strictObject({ type: z.literal('collectItem'), itemId: ItemIdSchema,
    count: z.number().int().positive() }),
  z.strictObject({ type: z.literal('spar'), targetRef: NpcIdSchema, nonLethal: z.literal(true) }),
]);
const TransitionSchema = z.strictObject({
  id: LocalIdSchema, priority: z.number().int().min(0).max(1000),
  when: QuestConditionSchema, to: StageIdSchema,
  branchKey: z.string().regex(/^[a-z][a-z0-9_]*$/),
});
const StageSchema = z.strictObject({
  id: StageIdSchema, objectiveKeys: z.array(z.string().min(1)),
  objectives: z.array(ObjectiveSchema), transitions: z.array(TransitionSchema),
  effects: z.array(QuestEffectSchema),
  terminal: z.enum(['completed', 'failed']).optional(),
  endingKey: z.string().regex(/^[a-z][a-z0-9_]*$/).optional(),
}).superRefine((value, context) => {
  if ((value.terminal === undefined) !== (value.endingKey === undefined))
    context.addIssue({ code: 'custom', path: ['endingKey'], message: 'terminal and endingKey must be paired' });
  if (value.terminal !== undefined && value.transitions.length > 0)
    context.addIssue({ code: 'custom', path: ['transitions'], message: 'terminal stages cannot transition' });
});

export const QuestDefSchema = z.strictObject({
  schemaVersion: z.literal('quest.v1'), fixture: z.boolean().optional(),
  id: QuestIdSchema, kind: z.enum(['main', 'side', 'faction', 'bond', 'qiyu']),
  chapterId: ChapterIdSchema, titleKey: z.string().min(1),
  ownerSectId: SectIdSchema.optional(), subjectNpcIds: z.array(NpcIdSchema),
  routeTone: z.enum(['righteous', 'neutral', 'evil']), recommendedLevel: z.number().int().positive().optional(),
  startStageId: StageIdSchema, flagIds: z.array(FlagIdSchema),
  encounterIds: z.array(EncounterIdSchema), offerWhen: QuestConditionSchema.optional(),
  showWhen: QuestConditionSchema.optional(), stages: z.array(StageSchema).min(1),
  tracking: z.strictObject({ defaultTracked: z.boolean(),
    targetRef: z.string().min(1).optional(), revealPolicy: z.enum(['known_only', 'all']) }),
  source: z.strictObject({ origin: z.enum(['canon', 'expanded', 'canonExpanded']),
    note: z.string().min(1).optional() }),
}).superRefine((value, context) => {
  if (value.kind !== value.id.split('_')[2])
    context.addIssue({ code: 'custom', path: ['kind'], message: 'quest kind must match ID' });
  for (const [path, values] of [['flagIds', value.flagIds], ['encounterIds', value.encounterIds]] as const)
    if (new Set(values).size !== values.length)
      context.addIssue({ code: 'custom', path: [path], message: `${path} must be unique` });
  const stages = new Map(value.stages.map((stage) => [stage.id, stage]));
  if (stages.size !== value.stages.length)
    context.addIssue({ code: 'custom', path: ['stages'], message: 'stage IDs must be unique' });
  if (!stages.has(value.startStageId))
    context.addIssue({ code: 'custom', path: ['startStageId'], message: 'start stage must exist' });
  const seenLocalIds = new Set<string>();
  for (const stage of value.stages) {
    for (const entry of [...stage.transitions, ...stage.effects]) {
      if (seenLocalIds.has(entry.id))
        context.addIssue({ code: 'custom', path: ['stages'], message: `duplicate local ID ${entry.id}` });
      seenLocalIds.add(entry.id);
    }
    for (const edge of stage.transitions) if (!stages.has(edge.to))
      context.addIssue({ code: 'custom', path: ['stages'], message: `unknown stage ${edge.to}` });
  }
  const reachable = new Set<string>(); const pending = [value.startStageId];
  while (pending.length > 0) {
    const id = pending.pop()!;
    if (reachable.has(id)) continue;
    reachable.add(id);
    for (const edge of stages.get(id)?.transitions ?? []) pending.push(edge.to);
  }
  if (reachable.size !== stages.size)
    context.addIssue({ code: 'custom', path: ['stages'], message: 'all stages must be reachable' });
  if (!value.stages.some((stage) => stage.terminal !== undefined))
    context.addIssue({ code: 'custom', path: ['stages'], message: 'quest needs a terminal stage' });
});

export type QuestDef = z.output<typeof QuestDefSchema>;
