import { z } from 'zod';
import { EncounterIdSchema, FlagIdSchema, ItemIdSchema, JsonValueSchema, QuestIdSchema,
  SceneIdSchema, SkillIdSchema } from './primitives';

export type EventActionKind = 'state' | 'presentation' | 'infrastructure';
export interface InkOpcodeSpec {
  readonly required: Readonly<Record<string, RegExp>>;
  readonly optional?: Readonly<Record<string, RegExp>>;
}

const id = (prefix: string): RegExp => new RegExp(`^${prefix}[a-z0-9]+(?:_[a-z0-9]+)*$`, 'u');
const positive = /^[1-9][0-9]*$/u;
const local = /^[a-z][A-Za-z0-9_]*$/u;
const textKey = /^[A-Za-z0-9]+(?:[._][A-Za-z0-9]+)*$/u;
const storyId = /^(?:story|ink)_[a-z0-9_]+$/u;
const knot = /^[A-Za-z_][A-Za-z0-9_.]*$/u;
const bool = /^(?:true|false)$/u;

const action = <const Op extends string, Shape extends z.ZodRawShape>(
  op: Op, kind: EventActionKind, shape: Shape, ink?: InkOpcodeSpec,
) => ({ op, kind, schema: z.strictObject({ op: z.literal(op), ...shape }), ink });
const showText = { op: 'ui/showText', kind: 'presentation', schema: z.union([
  z.strictObject({ op: z.literal('ui/showText'), textKey: z.string().regex(textKey) }),
  z.strictObject({ op: z.literal('ui/showText'), text: z.string().min(1) }),
]), ink: { required: { textKey } } } as const;
const vfxPayload = z.discriminatedUnion('schema', [
  z.strictObject({ schema: z.literal('tianshu-vfx-catalog.v1'),
    palette: z.record(z.string(), z.string()), effects: z.record(z.string(), JsonValueSchema),
    emitters: z.record(z.string(), JsonValueSchema) }),
  z.strictObject({ schema: z.literal('tianshu-vfx-runtime.v1'),
    files: z.array(z.string().min(1)) }),
  z.strictObject({ schema: z.literal('tianshu-vfx-bindings.v1'),
    bindings: z.array(JsonValueSchema) }),
]);

/** One registry owns both EventDef validation and Ink #ts opcode validation. */
export const EVENT_ACTION_REGISTRY = [
  action('quest/advance', 'state', { quest: QuestIdSchema,
    stage: z.string().regex(/^st_[a-z0-9_]+$/) },
  { required: { quest: id('q_'), stage: id('st_') } }),
  action('party/giveItem', 'state', { item: ItemIdSchema, count: z.number().int().positive() },
    { required: { item: /^(?:it|eq|prop)_[a-z0-9_]+$/u, count: positive } }),
  action('party/takeItem', 'state', { item: ItemIdSchema, count: z.number().int().positive() },
    { required: { item: /^(?:it|eq|prop)_[a-z0-9_]+$/u, count: positive } }),
  action('party/restore', 'state', { mode: z.literal('full_once') },
    { required: { mode: /^full_once$/u } }),
  action('flag/set', 'state', { flagId: FlagIdSchema, value: z.boolean().default(true) },
    { required: { flagId: id('fl_') }, optional: { value: bool } }),
  action('world/openEntrance', 'state', { entranceId: z.string().regex(/^ent_[a-z0-9_]+$/) },
    { required: { entranceId: id('ent_') } }),
  action('save/autosave', 'state', { reason: z.string().regex(local) },
    { required: { reason: local } }),
  action('battle/start', 'presentation', { encounter: EncounterIdSchema },
    { required: { encounter: id('enc_') } }),
  action('tutorial/mark', 'presentation', { tutorial: z.string().regex(local),
    state: z.enum(['completed', 'skipped', 'pending']) },
  { required: { tutorial: local, state: /^(?:completed|skipped|pending)$/u } }),
  action('story/requestTransmission', 'presentation', { skill: SkillIdSchema,
    source: z.string().regex(local) }, { required: { skill: id('sk_'), source: local } }),
  action('ui/openAllocation', 'presentation', { mode: z.enum(['manual', 'balanced', 'default']) },
    { required: { mode: /^(?:manual|balanced|default)$/u } }),
  action('ui/showTitleCard', 'presentation', { card: z.string().regex(local) },
    { required: { card: local } }),
  action('dialogue/speaker', 'presentation', {
    speaker: z.string().regex(/^(?:npc_[a-z0-9_]+|player|narrator|book_spirit)$/),
  }, { required: { speaker: /^(?:npc_[a-z0-9_]+|player|narrator|book_spirit)$/u } }),
  action('dialogue/start', 'presentation', { storyId: z.string().regex(storyId),
    knot: z.string().regex(knot), presentation: z.string().regex(local).optional(),
    skippable: z.boolean().optional(), durationSeconds: z.number().int().positive().optional() },
  { required: { storyId, knot }, optional: { presentation: local, skippable: bool,
    durationSeconds: positive } }),
  showText,
  action('ui/revealText', 'presentation', { textKey: z.string().regex(textKey) },
    { required: { textKey } }),
  action('ui/observeOnly', 'presentation', { startsQuest: z.boolean().optional(),
    givesItem: z.boolean().optional() },
  { required: {}, optional: { startsQuest: bool, givesItem: bool } }),
  action('world/loadScene', 'presentation', { regionId: z.string().regex(/^rg_[a-z0-9_]+$/),
    sceneId: SceneIdSchema, spawnId: z.string().regex(/^[a-z][a-z0-9_]*$/) },
  { required: { regionId: id('rg_'), sceneId: id('sc_'), spawnId: local } }),
  action('rig/loadClipMap', 'infrastructure', { payload: z.strictObject({
    schema: z.literal('tianshu-clip-map.v1'), clips: z.record(z.string(), JsonValueSchema),
  }) }),
  action('vfx/loadRuntimeData', 'infrastructure', {
    id: z.string().regex(/^vfx_[a-z0-9_]+$/), payload: vfxPayload,
  }),
] as const;

type ActionSchema = (typeof EVENT_ACTION_REGISTRY)[number]['schema'];
export type EventAction = z.output<ActionSchema>;
export type EventPresentationAction = Extract<EventAction, { readonly op:
  'battle/start' | 'tutorial/mark' | 'story/requestTransmission' | 'ui/openAllocation' |
  'ui/showTitleCard' | 'dialogue/speaker' | 'dialogue/start' | 'ui/showText' |
  'ui/revealText' | 'ui/observeOnly' | 'world/loadScene' }>;
export const EventActionSchema: z.ZodType<EventAction> = z.union(
  EVENT_ACTION_REGISTRY.map((entry) => entry.schema) as unknown as [ActionSchema, ActionSchema],
);
export const EVENT_ACTION_NAMES = Object.freeze(EVENT_ACTION_REGISTRY.map((entry) => entry.op));
export const INK_OPCODE_REGISTRY: Readonly<Record<string, InkOpcodeSpec>> = Object.freeze(
  Object.fromEntries(EVENT_ACTION_REGISTRY.flatMap((entry) =>
    entry.ink === undefined ? [] : [[entry.op, entry.ink]])),
);
export const EVENT_PRESENTATION_ACTION_NAMES = Object.freeze(new Set(
  EVENT_ACTION_REGISTRY.filter((entry) => entry.kind === 'presentation').map((entry) => entry.op),
));
