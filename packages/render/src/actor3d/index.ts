import type { ActorPort, ActorPortOptions } from './types';

export type {
  ActorAssetSet, ActorCatalog, ActorEquipment, ActorGait, ActorLodAsset, ActorLook, ActorPort,
  ActorPortOptions, ActorRole, ActorStats,
} from './types';
export type { StaticActorCatalogEntries, StaticActorCatalogEntry } from './catalog';
export {
  GENERIC_FEMALE_ACTOR_TEMPLATE, GENERIC_MALE_ACTOR_TEMPLATE, createStaticActorCatalog, pickLod,
} from './catalog';
export {
  CATCH_UP_LAG_M, CATCH_UP_MULTIPLIER_MAX, DEFAULT_NATIVE_HPS, GAIT_IDLE_THRESHOLD_MPS,
  GAIT_RUN_ENTER_MPS, GAIT_RUN_EXIT_MPS, GAIT_TIME_SCALE_MAX, GAIT_TIME_SCALE_MIN,
  MAX_TURN_RAD_PER_SECOND, catchUpMultiplier, gaitPlaybackRate, gaitTimeScale, selectGait,
  stepActorYaw,
} from './gait';
export { ACTOR_HEIGHT_MAX_M, ACTOR_HEIGHT_MIN_M, actorScale } from './stature';

/** Runtime ownership, loading, picking, and disposal arrive in ENG-actor3d-a2-port. */
export function createActorPort(_options: ActorPortOptions): ActorPort {
  throw new Error('ACTOR3D_NOT_IMPLEMENTED');
}
