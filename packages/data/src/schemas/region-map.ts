import { z } from 'zod';
import { ItemIdSchema, QuestIdSchema, SectIdSchema } from './primitives';

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

export const TerrainIdSchema = z.enum(TERRAIN_IDS);
export const RegionIdSchema = z.string().regex(/^rg_[a-z0-9]+(?:_[a-z0-9]+)*$/);
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
const TextKeySchema = z.string().regex(/^[a-z][A-Za-z0-9]*(?:[._-][A-Za-z0-9]+)+$/);

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
  lockedBy: ContentRefSchema.optional(),
  returnDoorId: LocalIdSchema.optional(),
});
export const TriggerObjectSchema = z.strictObject({
  ...ObjectBase,
  class: z.literal('Trigger'),
  eventId: ContentRefSchema.optional(),
  action: z.string().regex(new RegExp('^[a-z][a-z0-9]*(?:/[a-z0-9]+)+$')).optional(),
  textKey: TextKeySchema.optional(),
  once: z.boolean(),
  autosave: z.boolean(),
  safe: z.boolean(),
});

export const QinggongActionSchema = z.enum([
  'sprint', 'scramble', 'leap', 'wallkick', 'drop', 'climb', 'roofwalk',
  'waterwalk', 'rapidswalk', 'bigwaterwalk', 'treetop', 'trackless', 'glide',
  'cloudwalk', 'carry', 'swim', 'dive', 'squeeze',
]);
const GateGeometryValueSchema = z.number().int().safe().nonnegative();
const GateAtomSchema = z.union([
  z.strictObject({
    qg: z.number().int().min(1).max(5),
    action: QinggongActionSchema.optional(),
    height: GateGeometryValueSchema.optional(),
    width: GateGeometryValueSchema.optional(),
    run: GateGeometryValueSchema.optional(),
    stages: GateGeometryValueSchema.optional(),
  }),
  z.strictObject({ item: ItemIdSchema, consume: z.boolean().optional() }),
  z.strictObject({ fame: z.number().int().min(0).max(9999) }),
  z.strictObject({ morality: z.tuple([
    z.number().int().min(-100).max(100),
    z.number().int().min(-100).max(100),
  ]) })
    .refine((value) => value.morality[0] <= value.morality[1], 'morality range must be ordered'),
  z.strictObject({ sect: SectIdSchema, rank: z.number().int().min(1).max(5).optional() }),
  z.strictObject({ status: LocalIdSchema }),
  z.strictObject({
    shichen: z.enum(['zi', 'chou', 'yin', 'mao', 'chen', 'si', 'wu', 'wei',
      'shen', 'you', 'xu', 'hai']).optional(),
    day: z.number().int().positive().optional(),
    festival: LocalIdSchema.optional(),
    weather: z.enum(['clear', 'cloudy', 'rain', 'storm', 'snow', 'blizzard', 'fog',
      'sandstorm']).optional(),
    season: z.enum(['spring', 'summer', 'autumn', 'winter']).optional(),
  }).refine((value) => Object.keys(value).length > 0, 'time condition must not be empty'),
  z.strictObject({
    quest: QuestIdSchema,
    state: z.enum(['inactive', 'active', 'completed', 'failed']),
  }),
  z.strictObject({ act: z.number().int().positive() }),
  z.strictObject({ formation: z.number().int().min(0).max(100) }),
  z.strictObject({
    check: z.strictObject({
      skill: z.enum(['music', 'chess', 'art', 'speech', 'med', 'poi', 'antidote', 'forge']),
      dc: z.number().int().min(0).max(100),
    }),
  }),
  z.strictObject({
    swim: z.number().int().min(0).max(3),
    dive: z.number().int().safe().nonnegative().optional(),
  }),
  z.strictObject({
    beast: z.number().int().min(1).max(12),
    kind: LocalIdSchema,
  }),
  z.strictObject({ mount: z.enum(['horse', 'camel']) }),
  z.strictObject({ boat: z.enum(['small', 'sea']) }),
  z.strictObject({ light: z.literal(true) }),
  z.strictObject({ special: LocalIdSchema }),
  z.strictObject({ device: LocalIdSchema, operator: LocalIdSchema.optional() }),
  z.strictObject({ str: z.number().int().safe().nonnegative() }),
  z.strictObject({ companion: z.strictObject({ qgMin: z.number().int().min(1).max(5) }) }),
  z.strictObject({ buff: z.string().regex(/^bf_[a-z0-9]+(?:_[a-z0-9]+)*$/) }),
]);
export type GateExpr = z.output<typeof GateAtomSchema> | { all: GateExpr[] } |
  { any: GateExpr[] } | { not: GateExpr };
export const GateExprSchema: z.ZodType<GateExpr> = z.lazy(() => z.union([
  GateAtomSchema,
  z.strictObject({ all: z.array(GateExprSchema).min(1) }),
  z.strictObject({ any: z.array(GateExprSchema).min(1) }),
  z.strictObject({ not: GateExprSchema }),
]));

export const QinggongGateObjectSchema = z
  .strictObject({
    ...ObjectBase,
    id: z.string().regex(/^gate_(?:0[0-9]|1[0-5])_[a-z0-9]+(?:_[a-z0-9]+)*$/),
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
export const BuildingObjectSchema = z.strictObject({
  ...ObjectBase,
  class: z.literal('Building'),
  footprint: RegionRectSchema,
  interiorRect: RegionRectSchema,
  roofGroup: LocalIdSchema,
  cutawayWalls: z.array(HexDirectionSchema),
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
  LightObjectSchema,
]);

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
    if (valid?.byteLength !== REGION_CHUNK_CELLS / 8)
      context.addIssue({ code: 'custom', path: ['valid'], message: 'valid bitmap must be 128 bytes' });
    const expectedTerrain = REGION_CHUNK_CELLS * (chunk.terrainEncoding === 'u8' ? 1 : 2);
    if (terrain?.byteLength !== expectedTerrain)
      context.addIssue({ code: 'custom', path: ['terrain'], message: 'terrain byte length mismatch' });
    if (heights?.byteLength !== REGION_CHUNK_CELLS)
      context.addIssue({ code: 'custom', path: ['heights'], message: 'heights must be 1024 bytes' });
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
    const ids = objects.map((object) => object.id);
    if (new Set(ids).size !== ids.length)
      context.addIssue({ code: 'custom', path: ['objects'], message: 'object IDs must be unique' });
    const spawnIds = new Set(
      objects.filter((object) => object.class === 'PlayerSpawn').map((object) => object.id),
    );
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
      if (valid !== undefined && terrain !== undefined)
        for (let index = 0; index < REGION_CHUNK_CELLS; index += 1) {
          if (!bitIsSet(valid, index)) continue;
          const terrainIndex = terrainAt(terrain, chunk.terrainEncoding, index);
          if (terrainIndex >= map.terrainTable.length)
            context.addIssue({ code: 'custom', path: ['chunks'], message: 'terrain index is outside terrain table' });
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
export type RegionMapProperties = z.output<typeof RegionMapPropertiesSchema>;
export type RegionMap = z.output<typeof RegionMapSchema>;
export type RegionMapChunk = z.output<typeof RegionMapChunkSchema>;
export type RegionObject = z.output<typeof RegionObjectSchema>;
