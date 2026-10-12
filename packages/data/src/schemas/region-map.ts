import { z } from 'zod';
import { GateExprSchema, GateGeometryValueSchema } from './gate-expr';
import { TownSceneSchema } from './town-scene';

export const REGION_CHUNK_SIZE = 32 as const;
export const REGION_CHUNK_CELLS = REGION_CHUNK_SIZE * REGION_CHUNK_SIZE;

const BASE64_PATTERN = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u;
function decodeBase64(value: string): Uint8Array | undefined {
  if (!BASE64_PATTERN.test(value)) return undefined;
  try {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  } catch {
    return undefined;
  }
}
const bitIsSet = (bytes: Uint8Array, index: number): boolean =>
  (bytes[index >> 3]! & (1 << (index & 7))) !== 0;
const terrainAt = (bytes: Uint8Array, encoding: 'u8' | 'u16le', index: number): number =>
  encoding === 'u8' ? bytes[index]! : bytes[index * 2]! | (bytes[index * 2 + 1]! << 8);
const objectOrder = (
  left: { readonly r: number; readonly q: number; readonly id: string },
  right: { readonly r: number; readonly q: number; readonly id: string },
): number => left.r - right.r || left.q - right.q || (left.id < right.id ? -1 : left.id > right.id ? 1 : 0);
const isSorted = <T>(values: readonly T[], compare: (left: T, right: T) => number): boolean =>
  values.every((value, index) => index === 0 || compare(values[index - 1]!, value) <= 0);
const hasUniqueSortedIndexes = (values: readonly { readonly index: number }[]): boolean =>
  new Set(values.map((entry) => entry.index)).size === values.length &&
  isSorted(values, (left, right) => left.index - right.index);

export const TERRAIN_IDS = [
  'tr_pingdi',
  'tr_caodi',
  'tr_huacong',
  'tr_zhulin',
  'tr_milin',
  'tr_jingji',
  'tr_suishi',
  'tr_shadi',
  'tr_liusha',
  'tr_nizhao',
  'tr_duzhao',
  'tr_jiaotu',
  'tr_taijie',
  'tr_qianshui',
  'tr_shenshui',
  'tr_jiliu',
  'tr_pubu',
  'tr_dajiang',
  'tr_bingmian',
  'tr_baobing',
  'tr_xuedi',
  'tr_shenxue',
  'tr_bingku',
  'tr_qiaobi',
  'tr_xuanya',
  'tr_shengu',
  'tr_wuding',
  'tr_gaoqiang',
  'tr_shushao',
  'tr_tiesuoqiao',
  'tr_dumuqiao',
  'tr_zhandao',
  'tr_yunhaizhandao',
  'tr_chengqiang',
  'tr_gongdianwuji',
  'tr_chuanjiaban',
  'tr_shinei',
  'tr_dongku',
  'tr_shizhen',
  'tr_jiguan',
  'tr_mushi',
  'tr_migong',
  'tr_shibi',
  'tr_huoyan',
  'tr_rongyan',
  'tr_qinghuacong',
  'tr_sheku',
  'tr_liubai',
] as const;
export const SURFACE_IDS = [
  'rammed_earth', 'dirt_road', 'stone_slab', 'grey_brick', 'grass', 'water',
  'bridge_deck', 'plinth', 'wood_floor', 'brick_floor', 'threshold', 'wall_top',
] as const;

export const TerrainIdSchema = z.enum(TERRAIN_IDS);
export const SurfaceIdSchema = z.enum(SURFACE_IDS);
export const RegionIdSchema = z.string().regex(/^rg_[a-z0-9]+(?:_[a-z0-9]+)*$/);
export const RegionGateIdSchema = z.string().regex(
  /^gate_(?:0[0-9]|1[0-5])_[a-z0-9]+(?:_[a-z0-9]+)*$/,
  'must be a Canon gate_<NN>_<name> ID',
);
export const RegionSceneIdSchema = z
  .string()
  .regex(/^sc_(?:0[0-9]|1[0-5])_[a-z0-9]+(?:_[a-z0-9]+)*$/);
export const RegionChapterScopeSchema = z.union([
  z.literal('all'),
  z.string().regex(/^ch(?:0[0-9]|1[0-5])_[a-z0-9]+(?:_[a-z0-9]+)*$/),
]);
export const RegionEraLayerSchema = z.union([
  z.literal('base'),
  z.string().regex(/^ch(?:0[0-9]|1[0-5])$/),
]);
export const HexDirectionSchema = z.number().int().min(0).max(5).meta({ title: 'HexDirection' });
const GateIntentValueSchema = z
  .enum(['main', 'side', 'secret', 'hidden'])
  .meta({ title: 'GateIntent' });
const DoorModeSchema = z.enum(['door', 'portal']).meta({ title: 'DoorMode' });
const QinggongKindSchema = z
  .enum([
    'leap',
    'climb',
    'waterwalk',
    'rapids',
    'bigwater',
    'treetop',
    'gap',
    'cloud',
    'snow',
    'squeeze',
    'swim',
    'dive',
    'device',
  ])
  .meta({ title: 'QinggongKind' });
const GateRevealSchema = z.enum(['always', 'near10', 'never']).meta({ title: 'GateReveal' });
const LocalIdSchema = z.string().regex(/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/);
const ContentRefSchema = z.string().regex(/^[a-z][a-z0-9]*(?:_[a-z0-9]+)+$/);
// Same text-key grammar as town-facilities.v1: layout keys such as city_dali__ch01 carry `__`.
const TextKeySchema = z.string().regex(/^[a-z][A-Za-z0-9]*(?:[.-][A-Za-z0-9_]+|_[A-Za-z0-9_]+)+$/u);

export const RegionHexSchema = z.strictObject({
  q: z.number().int().safe(),
  r: z.number().int().safe(),
  h: z.number().int().min(0).max(10),
});
export const RegionHexPosSchema = z.strictObject({
  q: z.number().int().safe(),
  r: z.number().int().safe(),
});
export const RegionRectSchema = z.strictObject({
  q: z.number().int().safe(),
  r: z.number().int().safe(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});
export const RegionMapPropertiesSchema = z
  .strictObject({
    schemaVersion: z.literal('region-map.v1'),
    regionId: RegionIdSchema,
    sceneId: RegionSceneIdSchema,
    chapterScope: z.array(RegionChapterScopeSchema).min(1),
    eraLayer: RegionEraLayerSchema,
    eraPatchRefs: z.array(z.string().min(1)),
    backdropAssetKey: z.string().min(1).nullable(),
  })
  .meta({ title: 'RegionMapProperties' });

const ObjectBase = {
  id: LocalIdSchema,
  q: z.number().int().safe(),
  r: z.number().int().safe(),
  h: z.number().int().min(0).max(10),
  cells: z.array(RegionHexSchema).min(1),
};
const Facing = HexDirectionSchema.optional();
const GateIntentSchema = z
  .strictObject({
    requiresQigong: z.number().int().min(0).max(5),
    intent: GateIntentValueSchema,
  })
  .optional();

export const NpcSpawnObjectSchema = z.strictObject({
  ...ObjectBase,
  class: z.literal('NpcSpawn'),
  npcId: z.string().regex(/^npc_[a-z0-9]+(?:_[a-z0-9]+)*$/),
  facing: Facing,
  textKey: TextKeySchema.optional(),
  gateIntent: GateIntentSchema,
});
export const PlayerSpawnObjectSchema = z.strictObject({
  ...ObjectBase,
  class: z.literal('PlayerSpawn'),
  facing: Facing,
  safe: z.boolean(),
  entry: z.boolean(),
});
export const EnemyZoneObjectSchema = z.strictObject({
  ...ObjectBase,
  class: z.literal('EnemyZone'),
  encounterId: z.string().regex(/^enc_[a-z0-9]+(?:_[a-z0-9]+)*$/),
  spawnPointId: LocalIdSchema.optional(),
  gateIntent: GateIntentSchema,
});
export const DoorObjectSchema = z.strictObject({
  ...ObjectBase,
  class: z.literal('Door'),
  mode: DoorModeSchema,
  pairId: LocalIdSchema,
  oneWay: z.boolean(),
  targetRegionId: RegionIdSchema,
  targetSceneId: RegionSceneIdSchema,
  targetSpawnId: LocalIdSchema,
  textKey: TextKeySchema.optional(),
  lockedBy: RegionGateIdSchema.optional(),
  returnDoorId: LocalIdSchema.optional(),
});
export const TriggerObjectSchema = z.strictObject({
  ...ObjectBase,
  class: z.literal('Trigger'),
  eventId: ContentRefSchema.optional(),
  action: z.string().regex(/^[a-z][a-z0-9]*(?:\/[a-z][A-Za-z0-9]*)+$/u).optional(),
  textKey: TextKeySchema.optional(),
  once: z.boolean(),
  autosave: z.boolean(),
  safe: z.boolean(),
});

export const QinggongGateObjectSchema = z
  .strictObject({
    ...ObjectBase,
    id: RegionGateIdSchema,
    class: z.literal('QinggongGate'),
    kind: QinggongKindSchema,
    tier: z.number().int().min(1).max(5),
    from: RegionHexPosSchema,
    to: z.strictObject({
      region: RegionIdSchema,
      scene: RegionSceneIdSchema,
      cell: RegionHexPosSchema,
    }),
    height: GateGeometryValueSchema,
    width: GateGeometryValueSchema,
    run: GateGeometryValueSchema,
    stages: GateGeometryValueSchema,
    intent: GateIntentValueSchema,
    reveal: GateRevealSchema,
    alt: z.array(GateExprSchema),
    earliest: z.number().min(0).max(1).nullable(),
    oneWay: z.boolean(),
    returnDoorId: LocalIdSchema.nullable(),
    hintTextKey: TextKeySchema,
  })
  .superRefine((gate, context) => {
    if (gate.from.q !== gate.q || gate.from.r !== gate.r)
      context.addIssue({
        code: 'custom',
        path: ['from'],
        message: 'gate anchor must equal from',
      });
    if (gate.intent === 'main' && gate.alt.length === 0)
      context.addIssue({
        code: 'custom',
        path: ['alt'],
        message: 'main gate requires an alternative',
      });
    if (gate.intent === 'main' && gate.earliest === null)
      context.addIssue({
        code: 'custom',
        path: ['earliest'],
        message: 'main gate requires earliest progress',
      });
    const expectedReveal = gate.intent === 'hidden' ? 'never' :
      gate.intent === 'secret' ? 'near10' : 'always';
    if (gate.reveal !== expectedReveal)
      context.addIssue({
        code: 'custom',
        path: ['reveal'],
        message: `${gate.intent} gate requires reveal=${expectedReveal}`,
      });
    if (gate.oneWay && gate.returnDoorId === null)
      context.addIssue({
        code: 'custom',
        path: ['returnDoorId'],
        message: 'one-way gate requires a return',
      });
  });
export const ChestObjectSchema = z.strictObject({
  ...ObjectBase,
  class: z.literal('Chest'),
  lootRef: ContentRefSchema,
  textKey: TextKeySchema.optional(),
  gateIntent: GateIntentSchema,
});
export const CameraHintObjectSchema = z.strictObject({
  ...ObjectBase,
  class: z.literal('CameraHint'),
  yawDeg: z.union([
    z.literal(0),
    z.literal(45),
    z.literal(90),
    z.literal(135),
    z.literal(180),
    z.literal(225),
    z.literal(270),
    z.literal(315),
  ]),
  zoom: z.number().positive(),
  allowRotation: z.boolean(),
  bounds: RegionRectSchema,
});
export const BattleArenaObjectSchema = z.strictObject({
  ...ObjectBase,
  class: z.literal('BattleArena'),
  encounterId: z
    .string()
    .regex(/^enc_[a-z0-9]+(?:_[a-z0-9]+)*$/)
    .optional(),
  playerCapacity: z.number().int().positive(),
  enemyCapacity: z.number().int().positive(),
  narrow: z.boolean(),
});
const TiledBuildingObjectSchema = z.strictObject({
  ...ObjectBase,
  class: z.literal('Building'),
  footprint: RegionRectSchema,
  interiorRect: RegionRectSchema,
  roofGroup: LocalIdSchema,
  cutawayWalls: z.array(HexDirectionSchema),
});
export const BuildingObjectSchema = TiledBuildingObjectSchema.extend({
  enterable: z.boolean().optional(),
  facilityKey: LocalIdSchema.optional(),
  nameKey: TextKeySchema.optional(),
}).superRefine((building, context) => {
  if (building.enterable && building.cells.length === 0)
    context.addIssue({ code: 'custom', path: ['cells'], message: 'enterable building requires a door cell' });
  if (building.enterable) {
    const first = building.cells[0]!;
    const inFootprint = first.q >= building.footprint.q && first.r >= building.footprint.r &&
      first.q < building.footprint.q + building.footprint.width &&
      first.r < building.footprint.r + building.footprint.height;
    if (inFootprint) context.addIssue({
      code: 'custom', path: ['cells', 0],
      message: 'first door cell must be outside the building footprint',
    });
  }
});
export const FacilityNpcObjectSchema = z.strictObject({
  ...ObjectBase,
  class: z.literal('FacilityNpc'),
  facilityKey: LocalIdSchema,
  roleKey: LocalIdSchema,
  facing: HexDirectionSchema,
  interactRange: z.number().int().min(1).max(3),
  appearance: z.strictObject({
    template: z.enum([
      'tpl_f_small', 'tpl_f_medium', 'tpl_f_tall',
      'tpl_m_lean', 'tpl_m_medium', 'tpl_m_bulk',
    ]),
    outfit: LocalIdSchema,
    seed: z.number().int().min(0).max(0xffff_ffff),
  }),
});
export const ExitObjectSchema = z.strictObject({
  ...ObjectBase,
  class: z.literal('Exit'),
  gateId: LocalIdSchema,
  spawnId: LocalIdSchema,
  side: z.enum(['north', 'east', 'south', 'west']),
  nameKey: TextKeySchema,
});
export const MeditationSpotObjectSchema = z.strictObject({
  ...ObjectBase,
  class: z.literal('MeditationSpot'),
  buildingId: LocalIdSchema.nullable(),
  riskBaseBp: z.number().int().min(0).max(10_000),
  quality: z.number().int().min(0).max(2),
});
export const LightObjectSchema = z.strictObject({
  ...ObjectBase,
  class: z.literal('Light'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  radius: z.number().positive(),
  intensity: z.number().min(0),
  mountHeight: z.number().min(0),
  schedule: z.string().min(1),
  flicker: z.boolean(),
});
const TiledRegionObjectSchema = z.discriminatedUnion('class', [
  NpcSpawnObjectSchema,
  PlayerSpawnObjectSchema,
  EnemyZoneObjectSchema,
  DoorObjectSchema,
  TriggerObjectSchema,
  QinggongGateObjectSchema,
  ChestObjectSchema,
  CameraHintObjectSchema,
  BattleArenaObjectSchema,
  TiledBuildingObjectSchema,
  LightObjectSchema,
]);

export const RegionObjectSchema = z.discriminatedUnion('class', [
  NpcSpawnObjectSchema,
  PlayerSpawnObjectSchema,
  EnemyZoneObjectSchema,
  DoorObjectSchema,
  TriggerObjectSchema,
  QinggongGateObjectSchema,
  ChestObjectSchema,
  CameraHintObjectSchema,
  BattleArenaObjectSchema,
  BuildingObjectSchema,
  FacilityNpcObjectSchema,
  ExitObjectSchema,
  MeditationSpotObjectSchema,
  LightObjectSchema,
]).meta({ oneOf: z.toJSONSchema(TiledRegionObjectSchema, { io: 'input' }).oneOf });

export const RegionRampSchema = z.strictObject({
  index: z
    .number()
    .int()
    .min(0)
    .max(REGION_CHUNK_CELLS - 1),
  dir: HexDirectionSchema,
});
export const RegionWaterSchema = z.strictObject({
  index: z
    .number()
    .int()
    .min(0)
    .max(REGION_CHUNK_CELLS - 1),
  kind: z.enum(['shallow', 'deep', 'flowing', 'bigwater']),
  flowDir: HexDirectionSchema.nullable(),
  shoreDistance: z.number().int().nonnegative().nullable(),
});
export const RegionMapChunkSchema = z
  .strictObject({
    q: z.number().int().nonnegative(),
    r: z.number().int().nonnegative(),
    width: z.literal(REGION_CHUNK_SIZE),
    height: z.literal(REGION_CHUNK_SIZE),
    valid: z.string().min(1),
    terrainEncoding: z.enum(['u8', 'u16le']),
    terrain: z.string().min(1),
    heights: z.string().min(1),
    surface: z.string().min(1).optional(),
    blocked: z.string().min(1).optional(),
    building: z.string().min(1).optional(),
    ramps: z.array(RegionRampSchema),
    water: z.array(RegionWaterSchema),
    precomputedAo: z.string().min(1).nullable(),
    decos: z.array(
      z.strictObject({
        id: LocalIdSchema,
        index: z.number().int().min(0).max(REGION_CHUNK_CELLS - 1),
      }),
    ),
    objects: z.array(RegionObjectSchema),
  })
  .superRefine((chunk, context) => {
    const valid = decodeBase64(chunk.valid);
    const terrain = decodeBase64(chunk.terrain);
    const heights = decodeBase64(chunk.heights);
    const surface = chunk.surface === undefined ? undefined : decodeBase64(chunk.surface);
    const blocked = chunk.blocked === undefined ? undefined : decodeBase64(chunk.blocked);
    const building = chunk.building === undefined ? undefined : decodeBase64(chunk.building);
    if (valid?.byteLength !== REGION_CHUNK_CELLS / 8)
      context.addIssue({ code: 'custom', path: ['valid'], message: 'valid bitmap must be 128 bytes' });
    const expectedTerrain = REGION_CHUNK_CELLS * (chunk.terrainEncoding === 'u8' ? 1 : 2);
    if (terrain?.byteLength !== expectedTerrain)
      context.addIssue({ code: 'custom', path: ['terrain'], message: 'terrain byte length mismatch' });
    if (heights?.byteLength !== REGION_CHUNK_CELLS)
      context.addIssue({ code: 'custom', path: ['heights'], message: 'heights must be 1024 bytes' });
    if (chunk.surface !== undefined && surface?.byteLength !== REGION_CHUNK_CELLS)
      context.addIssue({ code: 'custom', path: ['surface'], message: 'surface must be 1024 bytes' });
    if (chunk.blocked !== undefined && blocked?.byteLength !== REGION_CHUNK_CELLS / 8)
      context.addIssue({ code: 'custom', path: ['blocked'], message: 'blocked bitmap must be 128 bytes' });
    if (chunk.building !== undefined && building?.byteLength !== REGION_CHUNK_CELLS)
      context.addIssue({ code: 'custom', path: ['building'], message: 'building must be 1024 bytes' });
    if (chunk.precomputedAo !== null && decodeBase64(chunk.precomputedAo) === undefined)
      context.addIssue({ code: 'custom', path: ['precomputedAo'], message: 'AO must be base64' });
    const indexed = [...chunk.ramps, ...chunk.water, ...chunk.decos];
    if (valid !== undefined && indexed.some((entry) => !bitIsSet(valid, entry.index)))
      context.addIssue({ code: 'custom', path: ['valid'], message: 'metadata indexes an invalid slot' });
    for (const [name, values] of [
      ['ramps', chunk.ramps],
      ['water', chunk.water],
      ['decos', chunk.decos],
    ] as const)
      if (!hasUniqueSortedIndexes(values))
        context.addIssue({ code: 'custom', path: [name], message: `${name} must be unique and sorted` });
    if (valid !== undefined && terrain !== undefined && heights !== undefined)
      for (let index = 0; index < REGION_CHUNK_CELLS; index += 1) {
        const isValid = bitIsSet(valid, index);
        const terrainIndex = terrainAt(terrain, chunk.terrainEncoding, index);
        if (isValid && heights[index]! > 10)
          context.addIssue({ code: 'custom', path: ['heights'], message: 'valid height exceeds 10' });
        if (!isValid && (terrainIndex !== 0 || heights[index] !== 0))
          context.addIssue({ code: 'custom', path: ['valid'], message: 'invalid slots must be zeroed' });
        if (!isValid && blocked !== undefined && bitIsSet(blocked, index))
          context.addIssue({ code: 'custom', path: ['blocked'], message: 'blocked slot must be valid' });
        if (!isValid && (surface?.[index] !== undefined && surface[index] !== 0 ||
            building?.[index] !== undefined && building[index] !== 0))
          context.addIssue({
            code: 'custom', path: ['valid'], message: 'invalid optional layer slots must be zeroed',
          });
      }
    if (!isSorted(chunk.objects, objectOrder))
      context.addIssue({ code: 'custom', path: ['objects'], message: 'chunk objects must be sorted' });
  });

export const RegionMapSchema = z
  .strictObject({
    schemaVersion: z.literal('region-map.v1'),
    id: RegionSceneIdSchema,
    regionId: RegionIdSchema,
    chapterScope: z.array(RegionChapterScopeSchema).min(1),
    eraLayer: RegionEraLayerSchema,
    bounds: z.strictObject({
      qMin: z.number().int(),
      qMax: z.number().int(),
      rMin: z.number().int(),
      rMax: z.number().int(),
    }),
    chunkSize: z.literal(REGION_CHUNK_SIZE),
    terrainTable: z.array(TerrainIdSchema).min(1),
    surfaceTable: z.array(SurfaceIdSchema).optional(),
    town: TownSceneSchema.optional(),
    chunks: z.array(RegionMapChunkSchema).min(1),
    objects: z.array(RegionObjectSchema),
    playerSpawns: z.array(LocalIdSchema).min(1),
    adjacentRegions: z.array(RegionIdSchema),
    eraPatchRefs: z.array(z.string().min(1)),
    backdropAssetKey: z.string().min(1).nullable(),
  })
  .superRefine((map, context) => {
    if (map.bounds.qMin > map.bounds.qMax || map.bounds.rMin > map.bounds.rMax)
      context.addIssue({ code: 'custom', path: ['bounds'], message: 'bounds must be ordered' });
    if (map.bounds.qMin !== 0 || map.bounds.rMin !== 0 || map.bounds.qMax >= 256 || map.bounds.rMax >= 256)
      context.addIssue({ code: 'custom', path: ['bounds'], message: 'scene bounds must be 0-based and at most 256x256' });
    if (new Set(map.terrainTable).size !== map.terrainTable.length ||
        !isSorted(map.terrainTable, (left, right) => left < right ? -1 : left > right ? 1 : 0))
      context.addIssue({ code: 'custom', path: ['terrainTable'], message: 'terrain table must be unique and sorted' });
    if (map.surfaceTable !== undefined &&
        (new Set(map.surfaceTable).size !== map.surfaceTable.length ||
        !isSorted(map.surfaceTable, (left, right) => left < right ? -1 : left > right ? 1 : 0)))
      context.addIssue({
        code: 'custom', path: ['surfaceTable'], message: 'surface table must be unique and sorted',
      });
    const columns = Math.ceil((map.bounds.qMax + 1) / REGION_CHUNK_SIZE);
    const rows = Math.ceil((map.bounds.rMax + 1) / REGION_CHUNK_SIZE);
    const expectedChunkKeys = Array.from(
      { length: columns * rows },
      (_, index) => `${index % columns},${Math.floor(index / columns)}`,
    );
    const expectedChunks = new Set(expectedChunkKeys);
    const chunkKeys = map.chunks.map((chunk) => `${chunk.q},${chunk.r}`);
    if (new Set(chunkKeys).size !== chunkKeys.length || chunkKeys.some((key) => !expectedChunks.delete(key)) ||
        expectedChunks.size > 0 || JSON.stringify(chunkKeys) !== JSON.stringify(expectedChunkKeys))
      context.addIssue({ code: 'custom', path: ['chunks'], message: 'chunk grid must cover scene exactly once' });
    const objects = [...map.objects, ...map.chunks.flatMap((chunk) => chunk.objects)];
    const buildings = objects.filter((object) => object.class === 'Building')
      .sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0);
    const ids = objects.map((object) => object.id);
    if (new Set(ids).size !== ids.length)
      context.addIssue({ code: 'custom', path: ['objects'], message: 'object IDs must be unique' });
    const spawnIds = new Set(
      objects.filter((object) => object.class === 'PlayerSpawn').map((object) => object.id),
    );
    if (objects.some((object) => object.class === 'Exit' && !spawnIds.has(object.spawnId)))
      context.addIssue({
        code: 'custom', path: ['objects'], message: 'exit spawnId must reference a PlayerSpawn',
      });
    const doorCells = buildings.filter((building) => building.enterable).flatMap((building) =>
      building.cells.map((cell) => `${cell.q},${cell.r}`));
    if (new Set(doorCells).size !== doorCells.length)
      context.addIssue({
        code: 'custom', path: ['objects'], message: 'enterable building door cells must be unique',
      });
    if (map.town !== undefined) {
      const buildingIds = new Set(buildings.map((building) => building.id));
      const plannedIds = map.town.buildings.map((building) => building.id);
      if (JSON.stringify(plannedIds) !== JSON.stringify(buildings.map((building) => building.id)))
        context.addIssue({
          code: 'custom', path: ['town', 'buildings'],
          message: 'town building plans must match Building object ID order',
        });
      if (map.town.facilities.some((facility) => !buildingIds.has(facility.buildingId)))
        context.addIssue({
          code: 'custom', path: ['town', 'facilities'],
          message: 'town facility buildingId must reference a Building',
        });
      const facilityKeys = new Set(map.town.facilities.map((facility) => facility.key));
      if (objects.some((object) =>
        object.class === 'FacilityNpc' && !facilityKeys.has(object.facilityKey)))
        context.addIssue({
          code: 'custom', path: ['objects'],
          message: 'FacilityNpc facilityKey must reference a town facility',
        });
    } else if (objects.some((object) => object.class === 'FacilityNpc'))
      context.addIssue({
        code: 'custom', path: ['town'], message: 'FacilityNpc requires town scene data',
      });
    if (map.playerSpawns.some((id) => !spawnIds.has(id)))
      context.addIssue({
        code: 'custom',
        path: ['playerSpawns'],
        message: 'spawn index is not closed',
      });
    const expectedSpawns = objects
      .filter((object) => object.class === 'PlayerSpawn')
      .sort(objectOrder)
      .map((object) => object.id);
    if (!isSorted(map.objects, objectOrder) || JSON.stringify(map.playerSpawns) !== JSON.stringify(expectedSpawns) ||
        new Set(map.adjacentRegions).size !== map.adjacentRegions.length ||
        !isSorted(map.adjacentRegions, (left, right) => left < right ? -1 : left > right ? 1 : 0))
      context.addIssue({ code: 'custom', path: ['objects'], message: 'map indexes must be sorted' });
    const chunkData = new Map(map.chunks.map((chunk) => [`${chunk.q},${chunk.r}`, {
      valid: decodeBase64(chunk.valid),
      heights: decodeBase64(chunk.heights),
    }]));
    for (const chunk of map.chunks) {
      if (chunk.objects.some((object) => object.cells.some((cell) =>
          Math.floor(cell.q / 32) !== chunk.q || Math.floor(cell.r / 32) !== chunk.r)))
        context.addIssue({ code: 'custom', path: ['chunks'], message: 'chunk object belongs to another chunk' });
      const valid = decodeBase64(chunk.valid);
      const terrain = decodeBase64(chunk.terrain);
      const surface = chunk.surface === undefined ? undefined : decodeBase64(chunk.surface);
      const building = chunk.building === undefined ? undefined : decodeBase64(chunk.building);
      if (valid !== undefined && terrain !== undefined)
        for (let index = 0; index < REGION_CHUNK_CELLS; index += 1) {
          if (!bitIsSet(valid, index)) continue;
          const terrainIndex = terrainAt(terrain, chunk.terrainEncoding, index);
          if (terrainIndex >= map.terrainTable.length)
            context.addIssue({ code: 'custom', path: ['chunks'], message: 'terrain index is outside terrain table' });
          if (surface !== undefined && (map.surfaceTable === undefined ||
              surface[index]! >= map.surfaceTable.length))
            context.addIssue({
              code: 'custom', path: ['chunks'], message: 'surface index is outside surface table',
            });
          if (building !== undefined && building[index]! > buildings.length)
            context.addIssue({
              code: 'custom', path: ['chunks'], message: 'building index is outside Building objects',
            });
          const q = chunk.q * 32 + index % 32;
          const r = chunk.r * 32 + Math.floor(index / 32);
          if (q > map.bounds.qMax || r > map.bounds.rMax)
            context.addIssue({ code: 'custom', path: ['chunks'], message: 'valid slot is outside scene bounds' });
        }
    }
    if (objects.some((object) => object.cells.some((cell) => cell.q < 0 || cell.r < 0 ||
        cell.q > map.bounds.qMax || cell.r > map.bounds.rMax)))
      context.addIssue({ code: 'custom', path: ['objects'], message: 'object cell is outside scene bounds' });
    for (const object of objects) {
      const first = object.cells[0]!;
      if (object.q !== first.q || object.r !== first.r || object.h !== first.h ||
          new Set(object.cells.map((cell) => `${cell.q},${cell.r}`)).size !== object.cells.length)
        context.addIssue({ code: 'custom', path: ['objects'], message: 'object anchor or cells are invalid' });
      for (const cell of object.cells) {
        const data = chunkData.get(`${Math.floor(cell.q / 32)},${Math.floor(cell.r / 32)}`);
        const index = (cell.r % 32) * 32 + cell.q % 32;
        if (data?.valid === undefined || data.heights === undefined || !bitIsSet(data.valid, index) ||
            data.heights[index] !== cell.h)
          context.addIssue({ code: 'custom', path: ['objects'], message: 'object cell is not valid terrain' });
      }
    }
    for (const object of map.objects) {
      const owners = new Set(object.cells.map((cell) => `${Math.floor(cell.q / 32)},${Math.floor(cell.r / 32)}`));
      if (owners.size < 2)
        context.addIssue({ code: 'custom', path: ['objects'], message: 'base objects must cross chunks' });
    }
  });

export type TerrainId = z.output<typeof TerrainIdSchema>;
export type SurfaceId = z.output<typeof SurfaceIdSchema>;
export type RegionMapProperties = z.output<typeof RegionMapPropertiesSchema>;
export type RegionMap = z.output<typeof RegionMapSchema>;
export type RegionMapChunk = z.output<typeof RegionMapChunkSchema>;
export type RegionObject = z.output<typeof RegionObjectSchema>;
export { GateExprSchema, QinggongActionSchema } from './gate-expr';
export type { GateExpr } from './gate-expr';
export {
  TownBuildingPlanSchema, TownSceneFacilitySchema, TownSceneSchema, TownWallSchema, VisualKitSchema,
} from './town-scene';
export type {
  RectMm, TownBuildingPlan, TownScene, TownSceneFacility, TownWall,
} from './town-scene';
