import { z } from 'zod';

const EraSchema = z.string().regex(/^ch(?:0[1-9]|1[0-4])$/);
const MapNodeIdSchema = z.string().regex(/^(?:city|rs|poi)_[a-z0-9_]+$/);
const CoordinateSchema = z.number().int().min(0).max(4096);
export const MapPointSchema = z.tuple([CoordinateSchema, CoordinateSchema]);

const MapEntrySchema = z.strictObject({
  sceneId: z.string().min(1),
  townSpec: z.string().regex(/^docs\/design\/town\/city_[a-z0-9]+__ch[0-9]{2}\.yaml$/).nullable(),
  templateYear: z.number().int().min(1).max(9999).nullable(),
  gateId: z.string().min(1).nullable(),
  spawn: MapPointSchema.nullable(),
  accessNote: z.string(),
});

export const WorldMapNodeSchema = z.strictObject({
  id: MapNodeIdSchema, name: z.string().min(1), kind: z.enum(['town', 'ruin']),
  point: MapPointSchema, regionId: z.string().regex(/^rg_[a-z0-9_]+$/),
  eras: z.array(EraSchema), open: z.boolean(),
  levelRange: z.tuple([z.number().int().min(1).max(100),
    z.number().int().min(1).max(100)]).nullable(),
  levelNote: z.string(), entry: MapEntrySchema, coordinateNote: z.string(),
  accessNote: z.string().optional(),
});

export const WorldMapRoadSchema = z.strictObject({
  key: z.string().min(1), routeId: z.string().min(1).nullable(),
  start: MapNodeIdSchema, end: MapNodeIdSchema, distanceLi: z.number().int().positive(),
  points: z.array(MapPointSchema).min(2).max(4096),
  sourceHours: z.number().int().positive(), kind: z.string().min(1),
  eras: z.array(EraSchema), note: z.string(),
});

interface GraphMap {
  readonly era: string; readonly startNodeId: string; readonly travel: { readonly liPerHour: number };
  readonly nodes: readonly z.output<typeof WorldMapNodeSchema>[];
  readonly roads: readonly z.output<typeof WorldMapRoadSchema>[];
}
function validateGraph(map: GraphMap, context: z.RefinementCtx): void {
  const nodes = new Map<string, GraphMap['nodes'][number]>();
  for (const node of map.nodes) {
    if (nodes.has(node.id)) context.addIssue({ code: 'custom', path: ['nodes'], message: 'duplicate node id' });
    nodes.set(node.id, node);
    if (node.open !== node.eras.includes(map.era)) context.addIssue({ code: 'custom', path: ['nodes'], message: 'node era mismatch' });
    if (node.levelRange && node.levelRange[0] > node.levelRange[1])
      context.addIssue({ code: 'custom', path: ['nodes'], message: 'level range order' });
  }
  if (!nodes.get(map.startNodeId)?.open) context.addIssue({ code: 'custom', path: ['startNodeId'], message: 'start node closed' });
  const keys = new Set<string>();
  for (const road of map.roads) {
    if (keys.has(road.key)) context.addIssue({ code: 'custom', path: ['roads'], message: 'duplicate road key' });
    keys.add(road.key);
    const start = nodes.get(road.start); const end = nodes.get(road.end);
    if (!start?.open || !end?.open || road.start === road.end || !road.eras.includes(map.era))
      context.addIssue({ code: 'custom', path: ['roads'], message: 'road endpoint or era invalid' });
    if (road.distanceLi !== road.sourceHours * map.travel.liPerHour)
      context.addIssue({ code: 'custom', path: ['roads'], message: 'road distance mismatch' });
    if (start && !samePoint(road.points[0], start.point) || end && !samePoint(road.points.at(-1), end.point))
      context.addIssue({ code: 'custom', path: ['roads'], message: 'road geometry mismatch' });
  }
}
function samePoint(left: readonly number[] | undefined, right: readonly number[]): boolean {
  return left !== undefined && left[0] === right[0] && left[1] === right[1];
}

const TerrainLineSchema = z.array(MapPointSchema).min(2).max(16_384);
export const WorldMapDefinitionSchema = z.strictObject({
  version: z.literal('worldmap.v1'), revision: z.string().regex(/^[a-f0-9]{64}$/),
  chapterId: z.string().regex(/^ch(?:0[1-9]|1[0-4])_[a-z0-9_]+$/),
  era: EraSchema, eraBand: z.string().min(1), name: z.string().min(1),
  years: z.tuple([z.number().int().min(1).max(9999), z.number().int().min(1).max(9999)]),
  mapReferenceYear: z.number().int().min(1).max(9999),
  grid: z.strictObject({ width: z.number().int().min(1).max(4096),
    height: z.number().int().min(1).max(4096), projection: z.string().min(1) }),
  travel: z.strictObject({ liPerHour: z.number().int().min(1).max(10_000),
    stepLi: z.number().int().min(1).max(10_000), note: z.string() }),
  startNodeId: MapNodeIdSchema, nodes: z.array(WorldMapNodeSchema).min(1).max(4096),
  roads: z.array(WorldMapRoadSchema).max(16_384),
  terrain: z.strictObject({ land: z.array(TerrainLineSchema.min(3)).max(4096),
    rivers: z.array(TerrainLineSchema).max(4096), mountains: z.array(TerrainLineSchema).max(4096) }),
  sources: z.array(z.string()),
}).superRefine((map, context) => {
  if (map.era !== map.chapterId.slice(0, 4)) context.addIssue({ code: 'custom', path: ['era'], message: 'chapter era mismatch' });
  if (map.years[0] > map.years[1]) context.addIssue({ code: 'custom', path: ['years'], message: 'year range order' });
  if (map.travel.stepLi !== map.travel.liPerHour) context.addIssue({ code: 'custom', path: ['travel'], message: 'one-hour step required' });
  validateGraph(map, context);
});

export type MapPoint = z.output<typeof MapPointSchema>;
export type MapEntry = z.output<typeof MapEntrySchema>;
export type MapNode = z.output<typeof WorldMapNodeSchema>;
export type MapRoad = z.output<typeof WorldMapRoadSchema>;
export type WorldMapDefinition = z.output<typeof WorldMapDefinitionSchema>;
export type WorldMapRuntimeDefinition = Omit<WorldMapDefinition,
  'grid' | 'travel' | 'nodes' | 'roads' | 'sources'> & {
  readonly grid: Pick<WorldMapDefinition['grid'], 'width' | 'height'>;
  readonly travel: Pick<WorldMapDefinition['travel'], 'liPerHour' | 'stepLi'>;
  readonly nodes: readonly Omit<MapNode, 'coordinateNote'>[];
  readonly roads: readonly Omit<MapRoad, 'note'>[];
};

export const WorldMapRegistrationSchema = z.strictObject({
  schemaVersion: z.literal('event.v1'), id: z.string().regex(/^ev_[0-9]{2}_ditu$/),
  chapterId: z.string(), event: z.literal('world/mapRegistered'), once: z.boolean(),
  actions: z.tuple([z.strictObject({ op: z.literal('mountWorldMap'), map: WorldMapDefinitionSchema })]),
}).superRefine((value, context) => {
  const map = value.actions[0].map;
  if (value.chapterId !== map.chapterId || value.id !== `ev_${map.era.slice(2)}_ditu`)
    context.addIssue({ code: 'custom', path: ['id'], message: 'registration identity mismatch' });
});

export function mapFromRegistration(value: unknown): WorldMapDefinition {
  return WorldMapRegistrationSchema.parse(value).actions[0].map;
}
