import { z } from 'zod';
import { FacilityKindSchema, type FacilityKind } from './facility';
import { CityIdSchema, LocalKeySchema, SafeIntegerSchema } from './primitives';

const MmSchema = SafeIntegerSchema;
const NonNegativeMmSchema = MmSchema.min(0);
const PositiveMmSchema = MmSchema.min(1);
const Uint32Schema = SafeIntegerSchema.min(0).max(0xffff_ffff);
const LocalIdSchema = LocalKeySchema;
const TextKeySchema = z.string().regex(/^[a-z][A-Za-z0-9]*(?:[._-][A-Za-z0-9]+)+$/u);
const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/u);
const MinuteSchema = SafeIntegerSchema.min(0).max(1439);

// Keep one runtime FacilityKind definition while preserving this schema's output type.
const TownFacilityKindSchema: z.ZodType<FacilityKind> = z.lazy(() => FacilityKindSchema);
export const PlanFacilityKindSchema = z.enum([
  'none', 'residence', 'general_store', 'cloth', 'books', 'pharmacy', 'inn', 'tavern',
  'teahouse', 'smithy', 'pawnshop', 'bank', 'escort', 'school', 'temple', 'office',
  'casino', 'stable', 'storehouse', 'guardhouse', 'stall_goods', 'stall_food',
]);

export const VisualKitSchema = z.string().regex(
  /^(?:tang|song_dali|song_southern|song_north|liao_jin_north|yuan|ming|qing_early|xiyu|tubo)(?::[a-z][a-z0-9_]+)?$/u,
);
export const RectMmSchema = z.tuple([MmSchema, MmSchema, MmSchema, MmSchema])
  .refine(([x0, z0, x1, z1]) => x0 < x1 && z0 < z1, 'RectMm must be a non-empty half-open rectangle');
const Yaw4Schema = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]);
const StoreysSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);
const RoofStyleSchema = z.union([
  z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4),
  z.literal(5), z.literal(6), z.literal(7), z.literal(8), z.literal(9),
]);
const EntranceTupleSchema = z.tuple([Yaw4Schema, MmSchema, PositiveMmSchema]);
const FixtureTupleSchema = z.tuple([
  NonNegativeMmSchema, MmSchema, MmSchema, NonNegativeMmSchema, NonNegativeMmSchema,
  Yaw4Schema, z.union([z.literal(0), z.literal(1)]),
]).superRefine(([fixtureIdx, , , width, depth, , blocks], context) => {
  if (fixtureIdx >= 200 && (width !== 0 || depth !== 0 || blocks !== 0))
    context.addIssue({
      code: 'custom', message: 'station fixtures must have zero extent and must not block',
    });
});
const PartTupleSchema = z.tuple([
  SafeIntegerSchema.min(0).max(7), MmSchema, MmSchema, PositiveMmSchema, PositiveMmSchema,
  Yaw4Schema, StoreysSchema, RoofStyleSchema,
  NonNegativeMmSchema, NonNegativeMmSchema, NonNegativeMmSchema, Uint32Schema,
]);

export const TownSceneFacilitySchema = z.strictObject({
  key: LocalIdSchema,
  kind: TownFacilityKindSchema,
  sub: LocalIdSchema.nullable(),
  buildingId: LocalIdSchema,
  nameKey: TextKeySchema,
  shop: z.strictObject({
    instanceKey: z.string().regex(
      /^city_[a-z0-9]+(?:_[a-z0-9]+)*__ch(?:0[0-9]|1[0-5])\/[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/u,
    ),
    templateRef: LocalIdSchema,
    kind: z.enum(['normal', 'famous', 'blackMarket']),
  }).nullable(),
  roles: z.array(LocalIdSchema).min(1),
  serviceCells: z.array(z.strictObject({ q: SafeIntegerSchema, r: SafeIntegerSchema })).min(1),
  hours: z.strictObject({ open: MinuteSchema, close: MinuteSchema }).nullable(),
});

export const TownWallSchema = z.strictObject({
  id: LocalIdSchema,
  points: z.array(z.tuple([MmSchema, MmSchema])).min(2),
  closed: z.boolean(),
  heightMm: PositiveMmSchema,
  thicknessMm: PositiveMmSchema,
  gates: z.array(z.strictObject({
    seg: SafeIntegerSchema.min(0),
    offsetMm: NonNegativeMmSchema,
    widthMm: PositiveMmSchema,
    kind: z.enum(['gate', 'water']),
  })),
});

const TownBuildingPlanValueSchema = z.strictObject({
  id: LocalIdSchema,
  archetype: z.string().min(1),
  kit: z.string().min(1),
  seed: Uint32Schema,
  footprint: z.tuple([MmSchema, MmSchema, PositiveMmSchema, PositiveMmSchema]),
  yaw: Yaw4Schema,
  storeys: StoreysSchema,
  roof: z.tuple([RoofStyleSchema, NonNegativeMmSchema, NonNegativeMmSchema]),
  entrances: z.array(EntranceTupleSchema),
  enterable: z.boolean(),
  elev: z.tuple([MmSchema, NonNegativeMmSchema]),
  floors: z.array(RectMmSchema),
  floorY: z.array(MmSchema),
  fixtures: z.array(FixtureTupleSchema),
  parts: z.array(PartTupleSchema).optional(),
  finial: z.enum(['tang_stupa']).optional(),
  signage: z.tuple([TextKeySchema, SafeIntegerSchema.min(0)]).nullable(),
  facility: PlanFacilityKindSchema,
}).superRefine((building, context) => {
  if (building.floors.length !== building.floorY.length)
    context.addIssue({
      code: 'custom', path: ['floorY'], message: 'floors and floorY must have equal length',
    });
  const [centerX, centerZ, localWidth, localDepth] = building.footprint;
  const width = building.yaw % 2 === 0 ? localWidth : localDepth;
  const depth = building.yaw % 2 === 0 ? localDepth : localWidth;
  const twiceMinX = centerX * 2 - width;
  const twiceMaxX = centerX * 2 + width;
  const twiceMinZ = centerZ * 2 - depth;
  const twiceMaxZ = centerZ * 2 + depth;
  for (const [index, [x0, z0, x1, z1]] of building.floors.entries())
    if (x0 * 2 < twiceMinX || x1 * 2 > twiceMaxX ||
        z0 * 2 < twiceMinZ || z1 * 2 > twiceMaxZ)
      context.addIssue({
        code: 'custom', path: ['floors', index], message: 'floor rectangle must be inside footprint',
      });
});

type TownBuildingPlanValue = z.output<typeof TownBuildingPlanValueSchema>;
type ExactTownBuildingPlan = Omit<TownBuildingPlanValue, 'parts' | 'finial'> & {
  readonly parts?: Exclude<TownBuildingPlanValue['parts'], undefined>;
  readonly finial?: Exclude<TownBuildingPlanValue['finial'], undefined>;
};

/** Normalize Zod optional keys for exactOptionalPropertyTypes consumers such as render. */
export const TownBuildingPlanSchema = TownBuildingPlanValueSchema.transform((value) => {
  const { parts, finial, ...required } = value;
  return {
    ...required,
    ...(parts === undefined ? {} : { parts }),
    ...(finial === undefined ? {} : { finial }),
  } satisfies ExactTownBuildingPlan;
});

export const TownSceneSchema = z.strictObject({
  schemaVersion: z.literal('town-scene.v1'),
  cityId: CityIdSchema,
  layoutKey: z.string().regex(/^city_[a-z0-9]+(?:_[a-z0-9]+)*__ch(?:0[0-9]|1[0-5])$/u),
  displayNameKey: TextKeySchema,
  historicalYear: SafeIntegerSchema,
  visualKit: VisualKitSchema,
  kitRef: z.string().min(1),
  signAtlasRef: z.string().min(1).nullable(),
  source: z.strictObject({
    source: z.string().min(1),
    layout: z.string().min(1),
    sha256: Sha256Schema,
  }),
  frame: z.strictObject({
    axialOrigin: z.strictObject({ q: SafeIntegerSchema, r: SafeIntegerSchema }),
    planningM: z.tuple([SafeIntegerSchema.min(1), SafeIntegerSchema.min(1)]),
  }),
  facilities: z.array(TownSceneFacilitySchema),
  buildings: z.array(TownBuildingPlanSchema),
  walls: z.array(TownWallSchema),
}).superRefine((town, context) => {
  for (const [path, values] of [
    ['facilities', town.facilities.map((facility) => facility.key)],
    ['buildings', town.buildings.map((building) => building.id)],
    ['walls', town.walls.map((wall) => wall.id)],
  ] as const)
    if (new Set(values).size !== values.length)
      context.addIssue({ code: 'custom', path: [path], message: `${path} IDs must be unique` });
});

export type RectMm = z.output<typeof RectMmSchema>;
export type TownSceneFacility = z.output<typeof TownSceneFacilitySchema>;
export type TownWall = z.output<typeof TownWallSchema>;
export type TownBuildingPlan = z.output<typeof TownBuildingPlanSchema>;
export type TownScene = z.output<typeof TownSceneSchema>;
