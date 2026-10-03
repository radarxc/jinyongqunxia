import { z } from 'zod';
import {
  AcupointIdSchema, ChapterIdSchema, GradeSchema, ItemIdSchema, JsonValueSchema,
  MeridianIdSchema, NpcIdSchema, QuestIdSchema, SkillIdSchema,
} from './primitives';

export const ItemKindSchema = z.enum([
  'weapon', 'armor', 'offhand', 'hidden', 'accessory', 'ammo', 'pill', 'tonic', 'poison', 'antidote',
  'food', 'dish', 'wine', 'material', 'tool', 'manual', 'page', 'recipe', 'quest', 'token', 'curio', 'mount', 'collectible', 'system',
]);
export const EquipmentSlotSchema = z.enum(['mainHand', 'offHand', 'head', 'body', 'innerBody', 'hands', 'shoulder', 'cape', 'waist', 'feet', 'accessory']);
export const MeridianAidSchema = z.strictObject({
  rateBp: z.number().int().nonnegative(),
  successBp: z.number().int().nonnegative(),
  costReduceBp: z.number().int().nonnegative(),
  hours: z.number().int().positive(),
  meridians: z.array(MeridianIdSchema).min(1).optional(),
});
const MeridianTemperIncrementsSchema = z.strictObject({
  gradeUp: z.number().int().min(0).max(3),
  strengthXp: z.number().int().min(0).max(5000),
  fluxFlat: z.number().int().min(0).max(16),
});
export const MeridianTemperEffectSchema = z.discriminatedUnion('targetKind', [
  MeridianTemperIncrementsSchema.extend({
    targetKind: z.literal('meridian'), targetRef: MeridianIdSchema,
  }),
  MeridianTemperIncrementsSchema.extend({
    targetKind: z.literal('acupoint'), targetRef: AcupointIdSchema,
  }),
]).refine((value) => value.gradeUp > 0 || value.strengthXp > 0 || value.fluxFlat > 0, {
  message: 'a meridian temper effect needs a positive increment',
});

export const UseSpecSchema = z.strictObject({
  context: z.enum(['battle', 'field', 'both']),
  action: z.enum(['consume', 'throw', 'apply', 'eat', 'drink', 'load', 'dose']),
  target: z.enum(['self', 'ally', 'enemy', 'area']),
  effects: z.array(z.strictObject({ op: z.string().regex(/^[a-z][a-zA-Z0-9_]*$/), params: z.record(z.string(), JsonValueSchema) })),
  range: z.number().int().nonnegative().optional(),
  rangeTemplate: z.string().regex(/^[a-z][a-zA-Z0-9_]*$/).optional(),
  battleLimit: z.strictObject({
    perBattle: z.number().int().positive(), cooldown: z.number().int().nonnegative(),
  }).optional(),
  fieldTime: z.number().int().nonnegative().optional(),
  persistGrade: z.boolean().optional(),
  meridianAid: MeridianAidSchema.optional(),
  meridianTemper: MeridianTemperEffectSchema.optional(),
}).refine((value) => value.meridianAid === undefined || value.meridianTemper === undefined, {
  path: ['meridianTemper'], message: 'temporary aid and permanent temper are mutually exclusive',
});

const ArtIdSchema = z.enum(['med', 'poi', 'antidote', 'forge', 'alchemy', 'formation', 'music', 'art', 'chess', 'speech']);
const ProjectionIntegerSchema = z.number().int().min(0);
const ProjectionReferenceIdSchema = z.string().regex(/^[a-z][a-z0-9_]*$/);
export const AttributeProjectionV2Schema = z.strictObject({
  version: z.literal(2),
  atk: ProjectionIntegerSchema.optional(),
  hardness: ProjectionIntegerSchema.optional(),
  qiAffinity: ProjectionIntegerSchema.optional(),
  qiEffect: ProjectionReferenceIdSchema.optional(),
  def: ProjectionIntegerSchema.optional(),
  reflect: ProjectionIntegerSchema.optional(),
  antiHidden: ProjectionIntegerSchema.optional(),
  agi: ProjectionIntegerSchema.optional(),
  block: ProjectionIntegerSchema.optional(),
  luck: ProjectionIntegerSchema.optional(),
  poison: ProjectionIntegerSchema.optional(),
  antiPoison: ProjectionIntegerSchema.optional(),
  restoreQi: ProjectionIntegerSchema.optional(),
  qiCultivation: ProjectionIntegerSchema.optional(),
  con: ProjectionIntegerSchema.optional(),
  healInner: ProjectionIntegerSchema.optional(),
  healOuter: ProjectionIntegerSchema.optional(),
  stamina: ProjectionIntegerSchema.optional(),
  skillRef: SkillIdSchema.optional(),
  readWis: ProjectionIntegerSchema.max(100).optional(),
  readBre: ProjectionIntegerSchema.max(100).optional(),
  maxLayer: z.number().int().positive().optional(),
  cultivation: ProjectionIntegerSchema.optional(),
  unlockRef: ProjectionReferenceIdSchema.optional(),
  artRef: ArtIdSchema.optional(),
  artReq: ProjectionIntegerSchema.max(100).optional(),
  travel: ProjectionIntegerSchema.optional(),
  ruleRef: ProjectionReferenceIdSchema.optional(),
});
const AttributeProjectionExtensionShape = {
  attributes: AttributeProjectionV2Schema.optional(),
};

const BaseItemSchema = z.strictObject({
  schemaVersion: z.literal('item.v1'), id: ItemIdSchema, name: z.string().min(1),
  kind: ItemKindSchema, sub: z.string().regex(/^[a-z][a-zA-Z0-9_]*$/).nullable(),
  grade: GradeSchema.nullable(), stack: z.number().int().min(1).max(999),
  chapters: z.union([z.literal('any'), z.array(ChapterIdSchema).min(1)]),
  origin: z.enum(['canon', 'expanded', 'canonExpanded']), canonRef: z.string().min(1).optional(),
  price: z.union([z.literal('auto'), z.number().int().nonnegative(), z.null()]),
  flags: z.array(z.string().regex(/^[a-z][a-zA-Z0-9_]*$/)),
  chapterBound: z.boolean().optional(),
  use: UseSpecSchema.optional(),
  assets: z.strictObject({ icon: z.string().min(1), model: z.string().min(1).optional(), sfx: z.string().min(1).optional() }),
  text: z.strictObject({ desc: z.string().min(1), lore: z.string().min(1).optional(), short: z.string().min(1).optional() }),
});
const EquipExtensionSchema = z.strictObject({
  ...AttributeProjectionExtensionShape,
  slot: EquipmentSlotSchema,
  cat: z.enum(['sword', 'blade', 'staff', 'spear', 'whip', 'exotic', 'hidden', 'unarmed']).optional(),
  hiddenKind: z.enum(['needle', 'dart', 'ball', 'awl', 'bolt', 'powder', 'gun', 'bow']).optional(),
  hands: z.union([z.literal(1), z.literal(2), z.literal('pair')]).optional(),
  tags: z.array(z.string()), armorWeight: z.enum(['light', 'medium', 'heavy']).optional(),
  matFamily: z.enum(['metal', 'fabric', 'leather', 'wood', 'jade']),
  divine: z.boolean(), catalogTian: z.boolean(), uniqueEquipped: z.boolean(),
});
const MaterialExtensionSchema = z.strictObject({
  ...AttributeProjectionExtensionShape,
  family: z.string().regex(/^[a-z][a-zA-Z0-9_]*$/),
  resourceRef: z.string().regex(/^res_[a-z0-9_]+$/),
  materialGrade: GradeSchema, rare: z.boolean(),
  herbFamily: z.string().regex(/^[a-z][a-zA-Z0-9_]*$/).optional(),
  ageYears: z.number().int().nonnegative().optional(),
  ingredientKind: z.enum(['grain', 'meat', 'fish', 'vegetable', 'fruit', 'spice', 'rare']).optional(),
});
const ManualExtensionSchema = z.strictObject({
  ...AttributeProjectionExtensionShape,
  skill: SkillIdSchema, maxLayer: z.number().int().min(1).max(10),
  variant: z.enum(['full', 'partial', 'copy', 'original']),
  readMul: z.number().positive(), attuneFor: z.array(ChapterIdSchema).optional(),
});
const PageExtensionSchema = z.strictObject({ ...AttributeProjectionExtensionShape, skill: SkillIdSchema, pagesTotal: z.number().int().positive() });
const RecipeExtensionSchema = z.strictObject({
  ...AttributeProjectionExtensionShape,
  teaches: z.string().regex(/^rc_[a-z0-9_]+$/),
  craft: z.enum(['forge', 'alchemy', 'poison', 'cook', 'inscribe']),
  req: z.strictObject({ art: ArtIdSchema, minimum: z.number().int().min(0).max(100) }),
});
const QuestExtensionSchema = z.strictObject({
  ...AttributeProjectionExtensionShape, quest: QuestIdSchema.optional(),
  opens: z.array(z.string()), recognizedBy: z.array(NpcIdSchema),
});
const CurioExtensionSchema = z.strictObject({
  ...AttributeProjectionExtensionShape,
  rule: z.string().regex(/^[a-z][a-zA-Z0-9_.]*$/), consumable: z.boolean(),
});
const MountExtensionSchema = z.strictObject({
  ...AttributeProjectionExtensionShape,
  travelMul: z.number().positive().max(1), staMul: z.number().positive().max(1),
  terrains: z.array(z.string().regex(/^[a-z][a-zA-Z0-9_]*$/)).min(1), stable: z.boolean(),
});
const CollectibleExtensionSchema = z.strictObject({
  study: z.strictObject({ art: ArtIdSchema, value: z.number().int().positive() }).optional(),
  giftTo: z.array(z.strictObject({ npcId: NpcIdSchema, affinity: z.number().int().positive() })),
  appraise: z.strictObject({ art: ArtIdSchema, dc: z.number().int().min(0).max(100) }).optional(),
});

export const ItemDefSchema = BaseItemSchema.extend({
  extension: z.union([
    z.strictObject({ type: z.literal('equipment'), value: EquipExtensionSchema }),
    z.strictObject({ type: z.literal('material'), value: MaterialExtensionSchema }),
    z.strictObject({ type: z.literal('manual'), value: ManualExtensionSchema }),
    z.strictObject({ type: z.literal('page'), value: PageExtensionSchema }),
    z.strictObject({ type: z.literal('recipe'), value: RecipeExtensionSchema }),
    z.strictObject({ type: z.literal('quest'), value: QuestExtensionSchema }),
    z.strictObject({ type: z.literal('curio'), value: CurioExtensionSchema }),
    z.strictObject({ type: z.literal('mount'), value: MountExtensionSchema }),
    z.strictObject({ type: z.literal('collectible'), value: CollectibleExtensionSchema }),
    z.strictObject({ type: z.literal('generic'), value: z.strictObject({ ...AttributeProjectionExtensionShape }) }),
  ]),
}).superRefine((value, context) => {
  const equipment = ['weapon', 'armor', 'offhand', 'hidden', 'accessory'].includes(value.kind);
  if (equipment !== (value.extension.type === 'equipment')) context.addIssue({ code: 'custom', path: ['extension'], message: 'equipment kinds require the equipment extension' });
  const specialized: Readonly<Partial<Record<
    z.output<typeof ItemKindSchema>,
    'material' | 'manual' | 'page' | 'recipe' | 'quest' | 'curio' | 'mount' | 'collectible'
  >>> = {
    material: 'material', manual: 'manual', page: 'page', recipe: 'recipe', quest: 'quest',
    token: 'quest', curio: 'curio', mount: 'mount', collectible: 'collectible',
  };
  const expected = specialized[value.kind];
  if (expected !== undefined && value.extension.type !== expected) context.addIssue({
    code: 'custom', path: ['extension'], message: `${value.kind} items require the ${expected} extension`,
  });
  if (expected === undefined && !equipment && value.extension.type !== 'generic') context.addIssue({
    code: 'custom', path: ['extension'], message: `${value.kind} items require the generic extension`,
  });
  if (value.id.startsWith('eq_') !== equipment) context.addIssue({ code: 'custom', path: ['id'], message: 'equipment IDs use eq_; other items use it_' });
  if (value.id.startsWith('prop_') !== (value.chapterBound === true))
    context.addIssue({ code: 'custom', path: ['chapterBound'],
      message: 'prop_ items must be chapter-bound, and only prop_ items may set chapterBound' });
  if (value.id.startsWith('prop_') && (value.chapters === 'any' || value.chapters.length !== 1))
    context.addIssue({ code: 'custom', path: ['chapters'],
      message: 'chapter-bound props belong to exactly one chapter' });
  if (value.origin !== 'expanded' && value.canonRef === undefined) context.addIssue({ code: 'custom', path: ['canonRef'], message: 'canon content needs a source note' });
  const consumable = ['ammo', 'pill', 'tonic', 'poison', 'antidote', 'food', 'dish', 'wine'].includes(value.kind);
  if (consumable && value.use === undefined) context.addIssue({ code: 'custom', path: ['use'], message: 'consumable categories require use' });
  if (!consumable && value.use !== undefined) context.addIssue({ code: 'custom', path: ['use'], message: 'use is only valid for consumable categories' });
});

export type ItemDef = z.output<typeof ItemDefSchema>;
export type AttributeProjectionV2 = z.output<typeof AttributeProjectionV2Schema>;
