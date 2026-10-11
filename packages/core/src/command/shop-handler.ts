import type { CommandHandler } from '.';
import type { ShopCommand } from '../economy/shop-types';

function busy(state: Parameters<CommandHandler<ShopCommand>['validate']>[0]): boolean {
  return state.dialogue !== null || state.battle !== null ||
    state.world.navigation.pendingMount !== null;
}

/** Kernel seam replaced by ENG-town2-shop-core. */
export const shopHandler: CommandHandler<ShopCommand> = {
  validate: (state) => busy(state) ? 'REGION_INTERACTION_BUSY' : 'SHOP_UNKNOWN',
  apply: () => { throw new TypeError('SHOP_HANDLER_INVARIANT'); },
};
