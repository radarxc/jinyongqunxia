import type { CommandHandler } from '.';
import type { ExploreCommand } from '../world/explore/types';

function busy(state: Parameters<CommandHandler<ExploreCommand>['validate']>[0]): boolean {
  return state.dialogue !== null || state.battle !== null ||
    state.world.navigation.pendingMount !== null;
}
function noWalk(state: Parameters<CommandHandler<ExploreCommand>['validate']>[0],
  command: ExploreCommand): boolean {
  return (command.t === 'world/steer' || command.t === 'world/stop') &&
    (state.world.navigation.mountedRegion?.walk ?? null) === null;
}

/** Kernel seam replaced by ENG-town2-explore-walk and ENG-town2-explore-facility. */
export const exploreHandler: CommandHandler<ExploreCommand> = {
  noop: noWalk,
  validate(state, command) {
    if (busy(state)) return 'REGION_INTERACTION_BUSY';
    if (command.t === 'world/steer' || command.t === 'world/stop')
      return noWalk(state, command) ? null : 'REGION_PATH_BLOCKED';
    return 'REGION_PATH_BLOCKED';
  },
  apply: () => { throw new TypeError('EXPLORE_HANDLER_INVARIANT'); },
};
