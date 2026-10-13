import { hexDistance, type HexCoord } from '../../hex';
import type { GameState } from '../../state';
import type { RegionRuntimeContent } from '../region-types';
import { exploreNodeAt } from './graph';
import { directExploreStep, exploreWalkContext, nodeStandable } from './walk-validate';

export interface ReconciledMountedScene {
  readonly state: GameState; readonly relocated: boolean;
}

function unmount(state: Readonly<GameState>): GameState {
  const worldMap = state.chapter.worldMap;
  const returnNodeId = worldMap?.scene?.returnNodeId ?? state.world.navigation.locationId;
  const nextMap = worldMap?.scene ? { ...worldMap, scene: null,
    position: { kind: 'node' as const, nodeId: returnNodeId }, lastMessage: '' } : worldMap;
  return { ...state, chapter: { ...state.chapter, worldMap: nextMap }, world: { ...state.world,
    navigation: { ...state.world.navigation, locationId: returnNodeId,
      selectedDestinationId: null, pendingMount: null, mountedRegion: null } } };
}

function nearestStandable(state: Readonly<GameState>, content: RegionRuntimeContent): HexCoord | null {
  const mounted = state.world.navigation.mountedRegion;
  const context = exploreWalkContext(state, content);
  if (!mounted || !context) return null;
  const maximum = context.graph.width + context.graph.height;
  for (let radius = 1; radius <= maximum; radius += 1)
    for (let r = mounted.playerHex.r - radius; r <= mounted.playerHex.r + radius; r += 1)
      for (let q = mounted.playerHex.q - radius; q <= mounted.playerHex.q + radius; q += 1) {
        const point = { q, r };
        if (hexDistance(mounted.playerHex, point) !== radius) continue;
        const node = exploreNodeAt(context.graph, q, r);
        const occupied = context.occupied instanceof Uint8Array && context.occupied[node] !== 0;
        if (nodeStandable(context.graph, node) && !occupied) return point;
      }
  const spawn = context.objects.get(mounted.spawnId);
  return spawn?.class === 'PlayerSpawn' ? { q: spawn.q, r: spawn.r } : null;
}

function walkValid(state: Readonly<GameState>, content: RegionRuntimeContent): boolean {
  const mounted = state.world.navigation.mountedRegion;
  const walk = mounted?.walk;
  const context = exploreWalkContext(state, content);
  if (!mounted || !walk || !context) return walk === null;
  if (walk.path[0]?.q !== mounted.playerHex.q || walk.path[0]?.r !== mounted.playerHex.r) return false;
  for (let index = 1; index < walk.path.length; index += 1)
    if (!directExploreStep(context, walk.path[index - 1]!, walk.path[index]!)) return false;
  return true;
}

/** Pure load-boundary repair for content revisions; the caller owns publishing the returned state. */
export function reconcileMountedScene(state: Readonly<GameState>,
  content: RegionRuntimeContent): ReconciledMountedScene {
  const mounted = state.world.navigation.mountedRegion;
  if (!mounted) return { state: state as GameState, relocated: false };
  const map = content.maps.find((entry) => entry.id === state.world.navigation.locationId &&
    entry.regionId === mounted.regionId);
  if (!map) return { state: unmount(state), relocated: true };
  const context = exploreWalkContext(state, content);
  const playerNode = context ? exploreNodeAt(context.graph, mounted.playerHex.q, mounted.playerHex.r) : -1;
  if (!context || !nodeStandable(context.graph, playerNode)) {
    const playerHex = nearestStandable(state, content);
    if (!playerHex) return { state: unmount(state), relocated: true };
    const nextMounted = { ...mounted, playerHex, walk: null };
    return { state: { ...state, world: { ...state.world, navigation: { ...state.world.navigation,
      mountedRegion: nextMounted } } } as GameState, relocated: true };
  }
  if (walkValid(state, content)) return { state: state as GameState, relocated: false };
  return { state: { ...state, world: { ...state.world, navigation: { ...state.world.navigation,
    mountedRegion: { ...mounted, walk: null } } } } as GameState, relocated: false };
}
