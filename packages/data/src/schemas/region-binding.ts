import { z } from 'zod';
import { ChapterIdSchema, FlagIdSchema, ItemIdSchema } from './primitives';
import { GateExprSchema, RegionGateIdSchema, RegionIdSchema, RegionSceneIdSchema,
  type GateExpr } from './region-map';

const LocalAnchorIdSchema = z.string().regex(/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/);
const StoryIdSchema = z.string().regex(/^(?:story|ink)_[a-z0-9_]+$/);
const EntryKeySchema = z.string().regex(/^[A-Za-z_][A-Za-z0-9_.]*$/);
const TextKeySchema = z.string().regex(/^[a-z][A-Za-z0-9]*(?:[._-][A-Za-z0-9]+)+$/);
const LootRefSchema = z.string().regex(/^loot_[a-z0-9]+(?:_[a-z0-9]+)*$/);

export type RegionGateExpr = GateExpr | { readonly flag: string } |
  { readonly all: readonly RegionGateExpr[] } | { readonly any: readonly RegionGateExpr[] } |
  { readonly not: RegionGateExpr };
export const RegionGateExprSchema: z.ZodType<RegionGateExpr> = z.lazy(() => z.union([
  GateExprSchema,
  z.strictObject({ flag: FlagIdSchema }),
  z.strictObject({ all: z.array(RegionGateExprSchema).min(1) }),
  z.strictObject({ any: z.array(RegionGateExprSchema).min(1) }),
  z.strictObject({ not: RegionGateExprSchema }),
]));

export const RegionGateBindingSchema = z.strictObject({
  schemaVersion: z.literal('region-gate.v1'),
  gateId: RegionGateIdSchema,
  chapter: ChapterIdSchema,
  expression: RegionGateExprSchema,
  lockedTextKey: TextKeySchema,
  note: z.string().min(1).optional(),
});

export const RegionDialogueBindingSchema = z.strictObject({
  schemaVersion: z.literal('region-dialogue.v1'),
  chapter: ChapterIdSchema,
  sceneId: RegionSceneIdSchema,
  anchorId: LocalAnchorIdSchema,
  storyId: StoryIdSchema.optional(),
  entryKey: EntryKeySchema.optional(),
  condition: RegionGateExprSchema.optional(),
  noDialogue: z.literal(true).optional(),
}).superRefine((value, context) => {
  const bound = value.storyId !== undefined && value.entryKey !== undefined;
  const partial = (value.storyId === undefined) !== (value.entryKey === undefined);
  if (partial || bound === (value.noDialogue === true))
    context.addIssue({ code: 'custom', path: ['storyId'],
      message: 'provide storyId + entryKey, or noDialogue: true, exclusively' });
  if (value.noDialogue === true && value.condition !== undefined)
    context.addIssue({ code: 'custom', path: ['condition'],
      message: 'noDialogue annotations cannot have a condition' });
});

export const RegionLootBindingSchema = z.strictObject({
  schemaVersion: z.literal('region-loot.v1'),
  lootRef: LootRefSchema,
  chapter: ChapterIdSchema,
  items: z.array(z.strictObject({
    itemId: ItemIdSchema,
    count: z.number().int().positive(),
  })).min(1),
}).superRefine((value, context) => {
  const ids = value.items.map((item) => item.itemId);
  if (new Set(ids).size !== ids.length)
    context.addIssue({ code: 'custom', path: ['items'], message: 'item IDs must be unique' });
});

export const RegionBindingEnvelopeSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('regionGate'), id: RegionGateIdSchema,
    value: RegionGateBindingSchema }),
  z.strictObject({ kind: z.literal('regionDialogue'), id: z.string().min(1),
    value: RegionDialogueBindingSchema }),
  z.strictObject({ kind: z.literal('regionLoot'), id: LootRefSchema,
    value: RegionLootBindingSchema }),
]);

export const RegionBindingLeafSchema = z.strictObject({
  schemaVersion: z.literal('region-bindings-leaf.v1'),
  chapter: ChapterIdSchema,
  regionId: RegionIdSchema,
  entries: z.array(RegionBindingEnvelopeSchema),
}).superRefine((leaf, context) => {
  const identities = new Set<string>();
  for (const [index, entry] of leaf.entries.entries()) {
    const expected = entry.kind === 'regionGate' ? entry.value.gateId :
      entry.kind === 'regionLoot' ? entry.value.lootRef :
      `${entry.value.sceneId}/${entry.value.anchorId}`;
    if (entry.id !== expected) context.addIssue({ code: 'custom',
      path: ['entries', index, 'id'], message: `binding envelope ID must be ${expected}` });
    if (entry.value.chapter !== leaf.chapter) context.addIssue({ code: 'custom',
      path: ['entries', index, 'value', 'chapter'], message: 'binding chapter must match leaf' });
    const identity = `${entry.kind}:${entry.id}`;
    if (identities.has(identity)) context.addIssue({ code: 'custom',
      path: ['entries', index, 'id'], message: 'binding envelope IDs must be unique' });
    identities.add(identity);
  }
});

export type RegionGateBindingDef = z.output<typeof RegionGateBindingSchema>;
export type RegionDialogueBindingDef = z.output<typeof RegionDialogueBindingSchema>;
export type RegionLootBindingDef = z.output<typeof RegionLootBindingSchema>;
export type RegionBindingEnvelope = z.output<typeof RegionBindingEnvelopeSchema>;
export type RegionBindingLeaf = z.output<typeof RegionBindingLeafSchema>;
