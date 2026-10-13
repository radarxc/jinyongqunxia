import { HEX_DIRECTIONS, hexKey, qinggongTier, type HexCoord, type HexDir } from '../../hex';
import type { GameState } from '../../state';
import type { MountedRegionState, RegionMap, RegionObject, RegionRuntimeContent } from '../region-types';
import { findPath, findPathToAny, forEachExploreEdge, type ExploreOccupied,
  type ExplorePath } from './astar';
import { EXPLORE_STANDABLE, EXPLORE_VALID, exploreNodeAt, exploreNodeQ, exploreNodeR,
  getExploreGraph, type ExploreGraph } from './graph';
import { snapExploreTarget } from './snap';
import { exploreDynamicRevision, type TravelTarget } from './types';

const CONTENT_INDEX = new WeakMap<RegionRuntimeContent, Map<string, RegionMap>>();
const OBJECT_INDEX = new WeakMap<RegionMap, Map<string, RegionObject>>();
const TRIGGER_BUCKETS = new WeakMap<RegionMap, ReadonlyMap<string, readonly TriggerObject[]>>();
const CONTEXTS = new WeakMap<MountedRegionState, MutableExploreWalkContext>();
let mapIndexBuilds = 0;
let objectIndexBuilds = 0;
let occupancyBuilds = 0;
type TriggerObject = Extract<RegionObject, { class: 'Trigger' }>;

export interface ExploreWalkContext {
  readonly map: RegionMap; readonly graph: ExploreGraph; readonly objects: ReadonlyMap<string, RegionObject>;
  readonly occupied: ExploreOccupied; readonly start: number;
}
interface MutableExploreWalkContext extends ExploreWalkContext {
  map: RegionMap; graph: ExploreGraph; objects: ReadonlyMap<string, RegionObject>;
  occupied: Uint8Array; start: number; entityIds: string[]; entityFlags: Uint8Array;
}

export const exploreMapIndexBuildCount = () => mapIndexBuilds;
export const exploreObjectIndexBuildCount = () => objectIndexBuilds;
export const exploreOccupancyBuildCount = () => occupancyBuilds;

function mapIndex(content: RegionRuntimeContent): Map<string, RegionMap> {
  let result = CONTENT_INDEX.get(content);
  if (result) return result;
  result = new Map(content.maps.map((map) => [map.id, map]));
  mapIndexBuilds += 1;
  CONTENT_INDEX.set(content, result);
  return result;
}

export function exploreMap(content: RegionRuntimeContent, sceneId: string): RegionMap | undefined {
  return mapIndex(content).get(sceneId);
}

export function exploreObjectIndex(map: RegionMap): ReadonlyMap<string, RegionObject> {
  let result = OBJECT_INDEX.get(map);
  if (result) return result;
  result = new Map([...map.objects, ...map.chunks.flatMap((chunk) => chunk.objects)]
    .map((object) => [object.id, object]));
  objectIndexBuilds += 1;
  OBJECT_INDEX.set(map, result);
  return result;
}

export function exploreTriggersAt(map: RegionMap, at: HexCoord): readonly TriggerObject[] {
  let buckets = TRIGGER_BUCKETS.get(map);
  if (!buckets) {
    const mutable = new Map<string, TriggerObject[]>();
    for (const object of exploreObjectIndex(map).values()) {
      if (object.class !== 'Trigger') continue;
      for (const cell of object.cells) {
        const key = hexKey(cell); const bucket = mutable.get(key);
        if (bucket) bucket.push(object);
        else mutable.set(key, [object]);
      }
    }
    for (const bucket of mutable.values()) bucket.sort((left, right) =>
      left.r - right.r || left.q - right.q ||
      (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
    buckets = mutable; TRIGGER_BUCKETS.set(map, buckets);
  }
  return buckets.get(hexKey(at)) ?? [];
}

function refreshOccupancy(context: MutableExploreWalkContext, mounted: MountedRegionState): void {
  let changed = context.entityIds.length !== mounted.entities.length;
  if (!changed)
    for (let index = 0; index < mounted.entities.length; index += 1) {
      const entity = mounted.entities[index]!;
      if (context.entityIds[index] !== entity.anchorId ||
          context.entityFlags[index] !== Number(entity.active)) { changed = true; break; }
    }
  if (!changed) return;
  context.occupied.fill(0);
  if (context.entityIds.length !== mounted.entities.length) {
    context.entityIds = new Array<string>(mounted.entities.length);
    context.entityFlags = new Uint8Array(mounted.entities.length);
  }
  for (let index = 0; index < mounted.entities.length; index += 1) {
    const entity = mounted.entities[index]!;
    context.entityIds[index] = entity.anchorId;
    context.entityFlags[index] = Number(entity.active);
  }
  for (const object of context.objects.values()) {
    if (object.class !== 'NpcSpawn' && object.class !== 'FacilityNpc') continue;
    const entity = mounted.entities.find((value) => value.anchorId === object.id);
    if (entity?.active === false) continue;
    const node = exploreNodeAt(context.graph, object.q, object.r);
    if (node >= 0) context.occupied[node] = 1;
  }
  occupancyBuilds += 1;
}

export function exploreWalkContext(state: Readonly<GameState>,
  content: RegionRuntimeContent): ExploreWalkContext | null {
  const mounted = state.world.navigation.mountedRegion;
  if (!mounted) return null;
  const map = exploreMap(content, state.world.navigation.locationId);
  if (!map || map.regionId !== mounted.regionId) return null;
  const graph = getExploreGraph(map, qinggongTier(content.gateFacts.qinggong),
    content.gateFacts.swim ?? 0, mounted.dynamicTiles, exploreDynamicRevision(mounted.dynamicTiles));
  const objects = exploreObjectIndex(map);
  let context = CONTEXTS.get(mounted);
  if (!context || context.map !== map || context.graph !== graph) {
    context = { map, graph, objects, occupied: new Uint8Array(graph.nodeCount), start: -1,
      entityIds: [], entityFlags: new Uint8Array(0) };
    CONTEXTS.set(mounted, context);
  }
  refreshOccupancy(context, mounted);
  context.start = exploreNodeAt(graph, mounted.playerHex.q, mounted.playerHex.r);
  return context;
}

export function interactRange(object: RegionObject): number {
  if (object.class === 'FacilityNpc') return object.interactRange;
  if (object.class === 'MeditationSpot') return 0;
  return 1;
}

export function targetExists(context: ExploreWalkContext, target: TravelTarget): boolean {
  if (target.kind === 'hex') return Number.isSafeInteger(target.hex.q) &&
    Number.isSafeInteger(target.hex.r);
  const object = context.objects.get(target.kind === 'anchor' ? target.anchorId : target.buildingId);
  return object !== undefined && (target.kind === 'anchor' || object.class === 'Building');
}

export interface ExploreSearchResult {
  readonly result: ExplorePath; readonly goal:
    | { readonly kind: 'hex' }
    | { readonly kind: 'anchor'; readonly anchorId: string; readonly interact: boolean }
    | { readonly kind: 'building'; readonly buildingId: string };
}

function buildingTarget(object: Extract<RegionObject, { class: 'Building' }>): HexCoord {
  const cell = object.cells[0]!;
  return { q: cell.q, r: cell.r };
}

/** Executes exactly one A* call. Hex snapping itself only consults cached connectivity. */
export function searchExploreTarget(context: ExploreWalkContext, target: TravelTarget,
  thenInteract = false, start = context.start): ExploreSearchResult | null {
  if (start < 0 || start >= context.graph.nodeCount) return null;
  if (target.kind === 'hex') {
    const snapped = snapExploreTarget(context.graph, start, target.hex, context.occupied);
    if (snapped === 'REGION_PATH_BLOCKED') {
      findPath(context.graph, start, -1, context.occupied);
      return null;
    }
    const result = findPath(context.graph, start, snapped, context.occupied);
    return result ? { result, goal: { kind: 'hex' } } : null;
  }
  const object = context.objects.get(target.kind === 'anchor' ? target.anchorId : target.buildingId);
  if (!object) return null;
  const anchor = object.class === 'Building' ? buildingTarget(object) : { q: object.q, r: object.r };
  const range = object.class === 'Building' ? 0 : interactRange(object);
  const result = findPathToAny(context.graph, start, anchor, range, context.occupied);
  if (!result) return null;
  return target.kind === 'anchor'
    ? { result, goal: { kind: 'anchor', anchorId: target.anchorId, interact: thenInteract } }
    : { result, goal: { kind: 'building', buildingId: target.buildingId } };
}

export function pathCoordinates(graph: ExploreGraph, path: Int32Array): HexCoord[] {
  const result = new Array<HexCoord>(path.length);
  for (let index = 0; index < path.length; index += 1)
    result[index] = { q: exploreNodeQ(graph, path[index]!), r: exploreNodeR(graph, path[index]!) };
  return result;
}

export function directionBetweenAdjacent(from: HexCoord, to: HexCoord): HexDir | null {
  const distance = Math.max(Math.abs(to.q - from.q), Math.abs(to.r - from.r),
    Math.abs(to.q + to.r - from.q - from.r));
  if (distance === 0) return null;
  for (let index = 0; index < 6; index += 1) {
    const step = HEX_DIRECTIONS[index]!;
    if (from.q + step.q * distance === to.q && from.r + step.r * distance === to.r)
      return index as HexDir;
  }
  return null;
}

export function directExploreStep(context: ExploreWalkContext, from: HexCoord, to: HexCoord):
  { readonly node: number; readonly moveCost: number; readonly direction: HexDir } | null {
  const fromNode = exploreNodeAt(context.graph, from.q, from.r);
  const toNode = exploreNodeAt(context.graph, to.q, to.r);
  const direction = directionBetweenAdjacent(from, to);
  if (fromNode < 0 || toNode < 0 || direction === null || context.occupied instanceof Uint8Array &&
      context.occupied[toNode] !== 0) return null;
  let moveCost = -1;
  forEachExploreEdge(context.graph, fromNode, (target, cost) => {
    if (target === toNode) moveCost = cost;
  });
  return moveCost < 0 ? null : { node: toNode, moveCost: context.graph.moveCosts[toNode]!, direction };
}

export function nodeStandable(graph: ExploreGraph, node: number): boolean {
  return node >= 0 && node < graph.nodeCount &&
    (graph.flags[node]! & (EXPLORE_VALID | EXPLORE_STANDABLE)) ===
      (EXPLORE_VALID | EXPLORE_STANDABLE);
}
