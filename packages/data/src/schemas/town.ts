import { z } from 'zod';

const Int = z.number().int().safe();
const NonNegativeInt = Int.min(0);
const GridPoint = z.tuple([Int, Int]);
const AssetEntrySchema = z.strictObject({
  id: z.string().min(1), file: z.string().min(1), kind: z.string().min(1),
  width: z.number().int().positive().nullable(), height: z.number().int().positive().nullable(),
  anchor: z.tuple([z.number().finite(), z.number().finite()]).nullable(),
  footprintWidthPx: z.number().positive().nullable(),
});
const AssetAtlasSchema = z.strictObject({
  baseUrl: z.string().min(1), manifest: z.string().min(1),
  entries: z.array(AssetEntrySchema),
});
const CellRunSchema = z.tuple([NonNegativeInt, z.number().int().positive(), NonNegativeInt]);
const IndexRunSchema = z.tuple([NonNegativeInt, z.number().int().positive()]);
const EdgeTileSchema = z.tuple([NonNegativeInt, z.enum(['road_edge', 'riverbank']),
  NonNegativeInt.max(255)]);

export const TownGroundPaletteSchema = z.strictObject({
  ground: z.string().min(1), overlay: z.string().nullable(), elevationCm: Int,
  walkable: z.boolean(),
});
export const TownNavigationNodeSchema = z.tuple([
  Int, Int, Int, z.enum(['flat', 'ramp', 'stairs']),
]);
export const TownBuildingSchema = z.strictObject({
  id: z.string().regex(/^bi_[0-9]{4}$/), type: z.string().regex(/^bld_[a-z0-9_]+$/),
  origin: GridPoint, size: z.tuple([z.number().int().positive(), z.number().int().positive()]),
  rotationDeg: z.union([z.literal(0), z.literal(90), z.literal(180), z.literal(270)]),
  entrances: z.array(GridPoint).min(1), businessRef: z.string().nullable(), poi: z.string().nullable(),
  enterable: z.boolean(), interiorKind: z.enum(['shop', 'inn', 'temple', 'residence', 'other']),
  assetId: z.string().min(1),
});
export const TownAnchorSlotSchema = z.strictObject({
  id: z.string().regex(/^anchor_[a-z0-9_]+$/), kind: z.enum(['building', 'meditation']),
  point: GridPoint, buildingId: z.string().regex(/^bi_[0-9]{4}$/).nullable(),
  ref: z.string().nullable(), riskBaseBp: NonNegativeInt.max(10_000).nullable(),
});

export const TownEraKitSchema = z.enum([
  'tang', 'song_dali', 'song_southern', 'yuan', 'ming', 'qing_early', 'xiyu', 'tubo',
]);

export const TownRuntimeSchema = z.strictObject({
  schemaVersion: z.literal('town-runtime.v1'), revision: z.string().regex(/^[a-f0-9]{64}$/),
  cityId: z.string().regex(/^city_[a-z0-9_]+$/), chapterId: z.string().regex(/^ch(?:0[1-9]|1[0-4])$/),
  sceneId: z.string().min(1), displayName: z.string().min(1), historicalYear: z.number().int(),
  eraKit: TownEraKitSchema,
  source: z.strictObject({ spec: z.string().min(1), layout: z.string().min(1), sha256: z.string().regex(/^[a-f0-9]{64}$/) }),
  grid: z.strictObject({ width: z.number().int().positive(), height: z.number().int().positive(),
    cellM: z.literal(1), chunkCells: z.number().int().positive() }),
  projection: z.strictObject({ tilePx: z.tuple([z.literal(64), z.literal(32)]),
    pitchDeg: z.literal(30), yawDeg: z.literal(45), elevationCmPerM: z.literal(100) }),
  assets: z.strictObject({ tile: AssetAtlasSchema, building: AssetAtlasSchema }),
  groundPalette: z.array(TownGroundPaletteSchema).min(1), groundRuns: z.array(CellRunSchema).min(1),
  edgeTiles: z.array(EdgeTileSchema),
  waterRuns: z.array(IndexRunSchema), bridgeRuns: z.array(IndexRunSchema),
  navigation: z.strictObject({ neighborOrder: z.literal('axial-rq-v1'), maxStepCm: z.number().int().positive(),
    nodes: z.array(TownNavigationNodeSchema).min(1), spawn: GridPoint }),
  buildings: z.array(TownBuildingSchema), anchors: z.array(TownAnchorSlotSchema),
}).superRefine((town, context) => {
  const cells = town.grid.width * town.grid.height;
  let cursor = 0;
  for (const [start, length, palette] of town.groundRuns) {
    if (start !== cursor || start + length > cells || palette >= town.groundPalette.length)
      context.addIssue({ code: 'custom', path: ['groundRuns'], message: 'ground RLE must exactly cover the grid' });
    cursor = start + length;
  }
  if (cursor !== cells) context.addIssue({ code: 'custom', path: ['groundRuns'], message: 'ground RLE incomplete' });
  for (const [cell, , mask] of town.edgeTiles) if (cell >= cells || mask === 255)
    context.addIssue({ code: 'custom', path: ['edgeTiles'], message: 'edge tile index or mask invalid' });
  const nodeKeys = new Set(town.navigation.nodes.map(([q, r]) => `${q},${r}`));
  if (nodeKeys.size !== town.navigation.nodes.length || !nodeKeys.has(town.navigation.spawn.join(',')))
    context.addIssue({ code: 'custom', path: ['navigation'], message: 'navigation nodes or spawn invalid' });
  for (const building of town.buildings) for (const entrance of building.entrances)
    if (!nodeKeys.has(entrance.join(','))) context.addIssue({ code: 'custom', path: ['buildings'], message: 'entrance must be walkable' });
});

export type TownRuntimeDefinition = z.output<typeof TownRuntimeSchema>;
export type TownBuilding = z.output<typeof TownBuildingSchema>;
export type TownAnchorSlot = z.output<typeof TownAnchorSlotSchema>;
