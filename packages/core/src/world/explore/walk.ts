import type { HexCoord } from '../../hex';
import type { GameState } from '../../state';
import type { RegionRuntimeContent } from '../region-types';
import { MAX_WALK_PATH, type ExploreTravelPreview,
  type ExploreWalkState, type Pace, type TravelTarget } from './types';
import { exploreWalkContext, pathCoordinates, searchExploreTarget,
  type ExploreWalkContext } from './walk-validate';

export interface PreparedExploreTravel {
  readonly walk: ExploreWalkState; readonly cost: number; readonly destination: HexCoord;
}

function futureStart(state: Readonly<GameState>, context: ExploreWalkContext): {
  readonly node: number; readonly prefix: readonly HexCoord[]; readonly progressMm: number;
} {
  const walk = state.world.navigation.mountedRegion?.walk;
  if (walk && walk.progressMm > 0 && walk.path[1]) {
    const next = walk.path[1];
    const node = context.graph === undefined ? -1 :
      (next.r - context.graph.rMin) * context.graph.width + next.q - context.graph.qMin;
    if (node >= 0 && node < context.graph.nodeCount)
      return { node, prefix: [walk.path[0]!, next], progressMm: walk.progressMm };
  }
  return { node: context.start, prefix: [], progressMm: 0 };
}

export function prepareExploreTravel(state: Readonly<GameState>, content: RegionRuntimeContent,
  target: TravelTarget, pace: Pace | undefined, thenInteract = false): PreparedExploreTravel | null {
  const context = exploreWalkContext(state, content);
  if (!context) return null;
  const future = futureStart(state, context);
  const searched = searchExploreTarget(context, target, thenInteract, future.node);
  if (!searched) return null;
  const suffix = pathCoordinates(context.graph, searched.result.path);
  const path = future.prefix.length === 0 ? suffix : [...future.prefix, ...suffix.slice(1)];
  if (path.length === 0 || path.length > MAX_WALK_PATH) return null;
  const chosenPace = pace ?? (path.length - 1 > 8 ? 'run' : 'walk');
  return { cost: searched.result.cost, destination: path[path.length - 1]!,
    walk: { path, progressMm: future.progressMm, pace: chosenPace, steer: null,
      goal: searched.goal } };
}

export function previewTravel(state: Readonly<GameState>, content: RegionRuntimeContent,
  target: TravelTarget): ExploreTravelPreview | null {
  const context = exploreWalkContext(state, content);
  if (!context) return null;
  const future = futureStart(state, context);
  const searched = searchExploreTarget(context, target, false, future.node);
  if (!searched) return null;
  const suffix = pathCoordinates(context.graph, searched.result.path);
  const path = future.prefix.length === 0 ? suffix : [...future.prefix, ...suffix.slice(1)];
  return { path: path.slice(0, 64), cost: searched.result.cost,
    destination: path[path.length - 1]! };
}
