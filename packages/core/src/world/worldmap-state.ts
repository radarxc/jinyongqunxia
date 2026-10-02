import type { MapPoint, WorldMapRuntimeDefinition } from '@tianshu/data/schemas';
import { floorDivInt } from '@tianshu/shared';
import type { MapJourney, MapPosition, RoadLeg, SceneEntry,
  WorldMapProjection, WorldMapState } from './worldmap-types';

export function createInitialWorldMapState(map: WorldMapRuntimeDefinition): WorldMapState {
  return { version: 1, mapRevision: map.revision,
    position: { kind: 'node', nodeId: map.startNodeId }, journey: null, nextJourneyId: 1,
    scene: null, law: { wantedLevel: 0, normalCityGateBlocked: false }, lastMessage: '' };
}
function requireState(condition: unknown): asserts condition {
  if (!condition) throw new Error('SAVE_WORLDMAP_INVALID');
}
function compareIds(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function validateWorldMapState(
  state: WorldMapState, map: WorldMapRuntimeDefinition,
): WorldMapState {
  requireState(state.version === 1 && state.mapRevision === map.revision);
  const integer = (value: number) => Number.isSafeInteger(value) && value >= 0;
  const node = (id: string) => map.nodes.find((entry) => entry.id === id && entry.open);
  const leg = (value: RoadLeg) => {
    const road = map.roads.find((entry) => entry.key === value.roadKey);
    requireState(road && ((road.start === value.from && road.end === value.to) ||
      (road.end === value.from && road.start === value.to)));
    return road;
  };
  requireState(integer(state.law.wantedLevel) &&
    typeof state.law.normalCityGateBlocked === 'boolean');
  requireState(typeof state.lastMessage === 'string' && integer(state.nextJourneyId) &&
    state.nextJourneyId > 0);
  const position = state.position;
  if (position.kind === 'node') requireState(node(position.nodeId));
  else requireState(integer(position.offsetLi) && position.offsetLi > 0 &&
    position.offsetLi < leg(position.leg).distanceLi);
  const journey = state.journey;
  if (journey) {
    requireState(integer(journey.id) && journey.id > 0 && journey.id < state.nextJourneyId &&
      node(journey.destination));
    requireState(journey.legs.length > 0 && journey.legs.length <= map.roads.length + 1);
    const completedEncounter = journey.status === 'encounter' &&
      journey.legIndex === journey.legs.length && journey.offsetLi === 0 &&
      journey.travelledLi === journey.totalLi;
    requireState(integer(journey.legIndex) &&
      (journey.legIndex < journey.legs.length || completedEncounter));
    requireState(integer(journey.offsetLi) && integer(journey.travelledLi) &&
      integer(journey.totalLi) && journey.totalLi >= journey.travelledLi &&
      ['walking', 'paused', 'encounter'].includes(journey.status));
    let remaining = -journey.offsetLi;
    for (let index = 0; index < journey.legs.length; index += 1) {
      const road = leg(journey.legs[index]!);
      if (index > 0) requireState(journey.legs[index - 1]!.to === journey.legs[index]!.from);
      if (index >= journey.legIndex) remaining += road.distanceLi;
    }
    const current = journey.legs[journey.legIndex];
    requireState(remaining === journey.totalLi - journey.travelledLi);
    requireState(journey.legs.at(-1)!.to === journey.destination);
    if (completedEncounter)
      requireState(position.kind === 'node' && position.nodeId === journey.destination);
    else if (journey.offsetLi === 0)
      requireState(position.kind === 'node' && position.nodeId === current!.from);
    else requireState(position.kind === 'road' && position.offsetLi === journey.offsetLi &&
      journey.offsetLi < leg(current!).distanceLi &&
      position.leg.roadKey === current!.roadKey && position.leg.from === current!.from &&
      position.leg.to === current!.to);
  }
  if (state.scene) {
    const entry = node(state.scene.nodeId);
    requireState(entry && !journey && position.kind === 'node' && position.nodeId === entry.id);
    requireState(JSON.stringify(state.scene) === JSON.stringify(createSceneEntry(map, entry.id)));
  }
  return state;
}

export function createSceneEntry(map: WorldMapRuntimeDefinition, nodeId: string): SceneEntry {
  const node = map.nodes.find((entry) => entry.id === nodeId)!;
  return { ...node.entry, kind: node.kind, nodeId: node.id, name: node.name,
    chapterId: map.chapterId, era: map.era, returnNodeId: node.id };
}

export function worldMapPoint(map: WorldMapRuntimeDefinition, position: MapPosition): MapPoint {
  if (position.kind === 'node') return map.nodes.find((node) => node.id === position.nodeId)!.point;
  const road = map.roads.find((entry) => entry.key === position.leg.roadKey)!;
  const from = map.nodes.find((node) => node.id === position.leg.from)!.point;
  const to = map.nodes.find((node) => node.id === position.leg.to)!.point;
  return [from[0] + floorDivInt((to[0] - from[0]) * position.offsetLi, road.distanceLi),
    from[1] + floorDivInt((to[1] - from[1]) * position.offsetLi, road.distanceLi)];
}

const componentCache = new WeakMap<WorldMapRuntimeDefinition, ReadonlyMap<string, readonly string[]>>();
function mapComponents(map: WorldMapRuntimeDefinition): ReadonlyMap<string, readonly string[]> {
  const cached = componentCache.get(map);
  if (cached) return cached;
  const adjacent = new Map(map.nodes.map((node) => [node.id, [] as string[]]));
  for (const road of map.roads) {
    adjacent.get(road.start)!.push(road.end); adjacent.get(road.end)!.push(road.start);
  }
  const components = new Map<string, readonly string[]>();
  for (const node of map.nodes) {
    if (components.has(node.id)) continue;
    const queue = [node.id]; const reached = new Set(queue);
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      for (const next of adjacent.get(queue[cursor]!)!) {
        if (!reached.has(next)) { reached.add(next); queue.push(next); }
      }
    }
    const sorted = [...reached].sort(compareIds);
    for (const id of sorted) components.set(id, sorted);
  }
  componentCache.set(map, components);
  return components;
}

export function reachableWorldMapNodeIds(
  map: WorldMapRuntimeDefinition, position: MapPosition,
): readonly string[] {
  const nodeId = position.kind === 'node' ? position.nodeId : position.leg.from;
  return mapComponents(map).get(nodeId) ?? [];
}

export function projectWorldMap(
  map: WorldMapRuntimeDefinition, state: WorldMapState, mapTextureUrl: string | null,
): WorldMapProjection {
  return { map, mapTextureUrl, point: worldMapPoint(map, state.position),
    reachableNodeIds: reachableWorldMapNodeIds(map, state.position),
    positionNodeId: state.position.kind === 'node' ? state.position.nodeId : null,
    journey: state.journey, scene: state.scene, law: state.law, lastMessage: state.lastMessage };
}

export function worldMapPositionForJourney(journey: MapJourney): MapPosition {
  const leg = journey.legs[journey.legIndex];
  if (!leg) return { kind: 'node', nodeId: journey.destination };
  return journey.offsetLi === 0 ? { kind: 'node', nodeId: leg.from }
    : { kind: 'road', leg, offsetLi: journey.offsetLi };
}
