import type { WorldMapRuntimeDefinition } from '@tianshu/data/schemas';
import { floorDivInt, type JsonValue } from '@tianshu/shared';
import { canEnterNormalCityGate, checkUniformExposure } from '../economy';
import { EventAnchorRegistry } from '../event';
import { advanceTravel, type GameState } from '../state';
import { RoadPathfinder } from './worldmap-pathfinder';
import { createSceneEntry, worldMapPositionForJourney } from './worldmap-state';
import type { WorldMapCommand, WorldMapContext, WorldMapFact, WorldMapState } from './worldmap-types';

export interface WorldMapDispatchResult {
  readonly state: GameState; readonly events: readonly WorldMapFact[];
}
export interface WorldMapRuntime {
  dispatch(state: GameState, command: WorldMapCommand): WorldMapDispatchResult;
}

/** Core-owned transaction with immutable indexes and a preallocated A* workspace. */
export function createWorldMapRuntime(context: WorldMapContext): WorldMapRuntime {
  const map = context.map;
  const paths = new RoadPathfinder(map);
  const registry = new EventAnchorRegistry(context.anchors ?? []);
  const roads = new Map(map.roads.map((road) => [road.key, road]));
  const nodes = new Map(map.nodes.map((node) => [node.id, node]));

  const dispatch = (state: GameState, command: WorldMapCommand): WorldMapDispatchResult => {
    const original = state.chapter.worldMap;
    if (!original || state.chapter.chapterId !== map.chapterId) throw new Error('MAP_UNAVAILABLE');
    let next = original; let game = state; const events: WorldMapFact[] = [];
    const fact = (t: string, payload: Record<string, JsonValue> = {}) =>
      events.push({ t, ...payload });

  const enter = (): void => {
    if (next.journey || next.position.kind !== 'node') throw new Error('MAP_STILL_TRAVELLING');
    const node = nodes.get(next.position.nodeId)!;
    if (!node.open || !node.eras.includes(map.era)) throw new Error('MAP_NODE_CLOSED');
    if (node.kind === 'town') {
      const exposure = checkUniformExposure({ equipment: game.party.equipment,
        rules: context.equipmentRules, wearerId: game.profile.protagonist?.characterId ?? 'npc_zhujue',
        identityTags: context.identityTags, locationId: node.id, time: game.meta.worldTick,
        lawState: next.law });
      next = { ...next, law: exposure.lawState };
      for (const event of exposure.events)
        fact('world/uniformExposed', event as unknown as Record<string, JsonValue>);
      if (!canEnterNormalCityGate(next.law)) {
        next = { ...next, scene: null, lastMessage: '城门守卫拦下了你：通缉尚未解除。' };
        fact('worldmap/gateBlocked', { nodeId: node.id, wantedLevel: next.law.wantedLevel });
        return;
      }
    }
    const entry = createSceneEntry(map, node.id);
    next = { ...next, scene: entry, lastMessage: '' };
    fact('worldmap/sceneRequested', entry as unknown as Record<string, JsonValue>);
    for (const anchor of registry.query(entry.sceneId, 'map-enter'))
      fact('worldmap/anchorRequested',
        { anchorId: anchor.id, lineId: anchor.lineId, nodeId: anchor.nodeId });
  };

  if (command.t === 'worldmap/travel') {
    if (next.scene || next.journey?.status === 'encounter') throw new Error('MAP_SCENE_BUSY');
    const path = paths.fromPosition(next.position, command.nodeId);
    if (!path) throw new Error('MAP_UNREACHABLE');
    if (path.totalLi === 0) { next = { ...next, journey: null }; enter(); }
    else {
      const journey = { id: next.nextJourneyId, destination: command.nodeId, legs: path.legs,
        legIndex: 0, offsetLi: path.offsetLi, travelledLi: 0, totalLi: path.totalLi,
        status: 'walking' as const };
      next = { ...next, nextJourneyId: next.nextJourneyId + 1, journey,
        position: worldMapPositionForJourney(journey), lastMessage: '' };
      fact('worldmap/journeyStarted',
        { journeyId: journey.id, destination: command.nodeId, distanceLi: path.totalLi });
    }
  } else if (command.t === 'worldmap/step') {
    const journey = next.journey;
    if (!journey || journey.status !== 'walking' || journey.id !== command.journeyId ||
        journey.travelledLi !== command.expectedTravelledLi) throw new Error('MAP_STEP_STALE');
    const leg = journey.legs[journey.legIndex]!; const road = roads.get(leg.roadKey)!;
    const distance = Math.min(map.travel.stepLi, road.distanceLi - journey.offsetLi);
    const minutes = floorDivInt(distance * 60, map.travel.liPerHour);
    const advanced = advanceTravel(game.chapter.clock, minutes);
    game = { ...game, meta: { ...game.meta, worldTick: advanced.clock.elapsedTicks },
      chapter: { ...game.chapter, clock: advanced.clock,
        worldYear: advanced.clock.epochYear + advanced.clock.yearOffset } };
    for (const event of advanced.events) fact(event.t, event as unknown as Record<string, JsonValue>);
    let legIndex = journey.legIndex; let offsetLi = journey.offsetLi + distance;
    const travelledLi = journey.travelledLi + distance; const atEnd = offsetLi === road.distanceLi;
    if (atEnd) { legIndex += 1; offsetLi = 0; }
    const finished = legIndex === journey.legs.length;
    const progress = { ...journey, legIndex, offsetLi, travelledLi };
    next = { ...next, journey: finished ? null : progress,
      position: atEnd ? { kind: 'node', nodeId: leg.to } : worldMapPositionForJourney(progress),
      lastMessage: '' };
    fact('worldmap/travelAdvanced', { journeyId: journey.id, distanceLi: distance, travelledLi });
    const found = registry.query(road.routeId ?? road.key, 'approach');
    fact('worldmap/encounterProbe', { roadKey: road.key, journeyId: journey.id, travelledLi,
      anchorIds: found.map((anchor) => anchor.id), worldTick: game.meta.worldTick });
    const encounter = context.ports?.encounter?.({ chapterId: map.chapterId, roadKey: road.key,
      journeyId: journey.id, distanceLi: travelledLi, worldTick: game.meta.worldTick, anchors: found });
    if (encounter) {
      next = { ...next, journey: { ...progress, status: 'encounter' },
        lastMessage: '途中遇到变故，行程已暂停。' };
      fact('worldmap/encounterRequested', { ...encounter, journeyId: journey.id });
    } else if (finished) {
      fact('worldmap/journeyCompleted', { nodeId: leg.to, journeyId: journey.id }); enter();
    }
  } else if (command.t === 'worldmap/cancel') {
    if (!next.journey || next.journey.status === 'encounter') throw new Error('MAP_NOT_WALKING');
    const journeyId = next.journey.id;
    next = { ...next, journey: { ...next.journey, status: 'paused' },
      lastMessage: '已停步，可继续或另选目的地。' };
    fact('worldmap/journeyPaused', { journeyId });
  } else if (command.t === 'worldmap/resume') {
    if (!next.journey || !['paused', 'encounter'].includes(next.journey.status))
      throw new Error('MAP_NOT_PAUSED');
    const journey = next.journey;
    if (journey.travelledLi === journey.totalLi) {
      next = { ...next, journey: null, lastMessage: '' };
      fact('worldmap/journeyCompleted', { nodeId: journey.destination, journeyId: journey.id }); enter();
    } else {
      next = { ...next, journey: { ...journey, status: 'walking' }, lastMessage: '' };
      fact('worldmap/journeyResumed', { journeyId: journey.id });
    }
  } else if (command.t === 'worldmap/enter') {
    if (next.scene) throw new Error('MAP_SCENE_BUSY');
    enter();
  } else if (command.t === 'worldmap/leave') {
    if (!next.scene) throw new Error('MAP_NOT_IN_SCENE');
    fact('worldmap/sceneLeft', { nodeId: next.scene.nodeId });
    next = { ...next, scene: null, lastMessage: '' };
  }
  if (events.length === 0) throw new Error('MAP_COMMAND_UNKNOWN');
  return { state: { ...game, chapter: { ...game.chapter, worldMap: next } }, events };
  };
  return { dispatch };
}

export function worldMapLocation(state: WorldMapState, map: WorldMapRuntimeDefinition): string {
  if (state.scene) return state.scene.name;
  const position = state.position;
  if (position.kind === 'road') return '江湖 · 旅途中';
  return map.nodes.find((node) => node.id === position.nodeId)?.name ?? '江湖';
}
