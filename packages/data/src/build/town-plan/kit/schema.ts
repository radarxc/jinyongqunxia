import { z } from 'zod';

const uint = z.number().int().nonnegative();
const positiveInt = z.number().int().positive();
const bp = uint.max(10_000);
const id = z.string().regex(/^[a-z][a-z0-9_]*$/);
const fieldName = z.string().regex(/^[a-z][A-Za-z0-9_]*$/);

export const buildKitDimsSchema = z.strictObject({
  platform: uint,
  column: positiveInt,
  diaRatio: positiveInt,
  beam: positiveInt,
  eave: uint,
  rise: bp,
  lift: z.tuple([uint, uint]),
  verge: uint.optional(),
  upperStorey: positiveInt.optional(),
});

const doorSchema = z.strictObject({
  clearH: positiveInt, single: positiveInt, double: positiveInt,
  threshold: uint, frame: positiveInt,
});
const windowSchema = z.strictObject({
  sill: uint, head: positiveInt, width: positiveInt, pattern: z.array(id).min(1),
});
const dadoSchema = z.strictObject({ layer: id, h: positiveInt });
const wallFaceSchema = z.strictObject({
  layer: id, t: positiveInt, h: positiveInt.optional(),
  dado: dadoSchema.optional(), coping: id.optional(),
});
const ridgeSchema = z.strictObject({ h: uint, ends: id, hallEnds: id });
const paletteEntrySchema = z.union([
  z.tuple([z.string().regex(/^#[0-9a-f]{6}$/)]),
  z.tuple([z.string().regex(/^#[0-9a-f]{6}$/), z.array(bp).min(1)]),
]);
const layerSchema = z.strictObject({
  id, repeatMm: z.tuple([positiveInt, positiveInt]),
});

const facilitySchema = z.enum([
  'none', 'residence', 'general_store', 'cloth', 'books', 'pharmacy', 'inn',
  'tavern', 'teahouse', 'smithy', 'pawnshop', 'bank', 'escort', 'school',
  'temple', 'office', 'casino', 'stable', 'storehouse', 'guardhouse',
  'stall_goods', 'stall_food',
]);
const recipeSchema = z.enum([
  'hall', 'storeyed', 'stall', 'adobe', 'compound', 'pagoda_dense',
  'pagoda_oct', 'citywall', 'gate',
]);
const sizeSchema = z.enum(['vernacular', 'shop', 'middle', 'hall']);

export const buildKitRecipeSchema = z.strictObject({
  recipe: recipeSchema,
  size: sizeSchema.optional(),
  roof: id.optional(),
  storeys: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  front: id.optional(),
  facility: facilitySchema.optional(),
  signage: id.optional(),
  bays: z.union([z.literal('odd'), positiveInt]).optional(),
  balcony: z.boolean().optional(),
  brackets: z.boolean().optional(),
  layout: id.optional(),
  screenWall: z.boolean().optional(),
  eaves: positiveInt.optional(),
  heightM: positiveInt.optional(),
  material: id.optional(),
});
const aliasSchema = z.strictObject({ alias: id });
const unsupportedSchema = z.strictObject({ unsupported: id });
export const buildKitArchetypeSchema = z.union([
  buildKitRecipeSchema, aliasSchema, unsupportedSchema,
]);

const variantValueSchema = z.union([z.array(id).min(1), uint, z.boolean()]);
const variantSetSchema = z.strictObject({
  forbid: z.array(id).min(1).optional(),
  finial: id.optional(),
});
const cityWallSchema = z.strictObject({
  h: positiveInt, top: positiveInt, batter: bp,
  merlon: z.tuple([positiveInt, positiveInt, positiveInt]),
  gate: z.strictObject({ opening: id, w: positiveInt, h: positiveInt }),
});

export const buildKitSourceSchema = z.strictObject({
  schemaVersion: z.literal('buildkit.v1'),
  id,
  style: z.enum(['timber', 'adobe']),
  profile: z.enum(['song_zhe', 'qing_jujia']),
  dims: z.strictObject({
    vernacular: buildKitDimsSchema, shop: buildKitDimsSchema,
    middle: buildKitDimsSchema, hall: buildKitDimsSchema,
  }),
  door: doorSchema,
  window: windowSchema,
  walls: z.strictObject({
    gable: wallFaceSchema, back: wallFaceSchema,
    front: wallFaceSchema, enclosure: wallFaceSchema,
  }),
  ridge: ridgeSchema,
  palette: z.record(id, paletteEntrySchema),
  layers: z.array(layerSchema).length(16),
  archetypes: z.record(id, buildKitArchetypeSchema),
  variants: z.record(fieldName, variantValueSchema),
  landmarks: z.record(z.string().regex(/^bld_lm_ch[0-9]{2}_[a-z0-9_]+$/), buildKitRecipeSchema),
  cityWall: cityWallSchema,
  variantSets: z.record(id, variantSetSchema).optional(),
  preferSouthHall: z.boolean().optional(),
});
export const cityKitMapSchema = z.record(
  z.string().regex(/^city_[a-z0-9_]+__ch[0-9]{2}$/),
  z.string().regex(/^[a-z][a-z0-9_]*(?::[a-z][a-z0-9_]*)?$/),
);

export type BuildKitSource = z.infer<typeof buildKitSourceSchema>;
export type BuildKitSourceRecipe = z.infer<typeof buildKitRecipeSchema>;
export type BuildKitSourceArchetype = z.infer<typeof buildKitArchetypeSchema>;

export function parseBuildKitSource(source: unknown): BuildKitSource {
  // p0 reserved {} as its explicit stub sentinel; retain that diagnostic for compatibility.
  if (typeof source === 'object' && source !== null && Object.keys(source).length === 0) {
    throw new Error('TOWN_PLAN_NOT_IMPLEMENTED:parseBuildKitSource');
  }
  return buildKitSourceSchema.parse(source);
}

export function parseCityKitMap(source: unknown): Readonly<Record<string, string>> {
  return cityKitMapSchema.parse(source);
}
