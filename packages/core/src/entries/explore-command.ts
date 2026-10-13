import { registerExploreTick } from '../world/explore/tick-hook';
import { advanceExploreWalk } from '../world/explore/tick';

registerExploreTick(advanceExploreWalk);

export { exploreHandler } from '../command/explore-handler';
export { advanceExploreWalk } from '../world/explore/tick';
export { previewTravel } from '../world/explore/walk';
export { reconcileMountedScene } from '../world/explore/reconcile';
export { HEX_STEP_MM, MAX_WALK_PATH, PACE_MM_PER_TICK } from '../world/explore/types';
export type { ExploreCommand, ExploreWalkState, Pace, SceneMemoryEntry,
  TravelTarget, ExploreTravelPreview } from '../world/explore/types';
