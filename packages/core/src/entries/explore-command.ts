import { registerExploreTick } from '../world/explore/tick-hook';
import { advanceExploreWalk } from '../world/explore/tick';

registerExploreTick(advanceExploreWalk);

export { exploreHandler, exploreRegionHandler as regionHandler } from '../command/explore-handler';
export { advanceExploreWalk } from '../world/explore/tick';
export { HEX_STEP_MM, MAX_WALK_PATH, PACE_MM_PER_TICK } from '../world/explore/types';
export type { ExploreCommand, ExploreWalkState, Pace, SceneMemoryEntry,
  TravelTarget } from '../world/explore/types';
