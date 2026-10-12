import type { CommandHandler } from '.';
import { regionHandler as legacyRegionHandler } from './region-handler';
import type { RegionCommand } from '../world/region-types';

/**
 * Schema-4 adapter: the shared legacy region handler plus `walk = null` on mount. It lives outside
 * the explore family so `@tianshu/core/explore-command` does not pull the v1 region, story and Ink
 * closure into the `core-explore` lazy chunk (tech/15 §10); v1 region commands load it through
 * `@tianshu/core/region-command`.
 */
export const exploreRegionHandler: CommandHandler<RegionCommand> = {
  validate: legacyRegionHandler.validate,
  apply(tx, command) {
    legacyRegionHandler.apply(tx, command);
    if (command.t !== 'world/mountRegion') return;
    const mounted = tx.state.world.navigation.mountedRegion;
    if (!mounted) throw new TypeError('REGION_MOUNT_INVARIANT');
    tx.set(['world', 'navigation', 'mountedRegion', 'walk'], null);
  },
};
