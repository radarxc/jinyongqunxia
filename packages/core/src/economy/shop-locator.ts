import type { CoreContent } from '../command';
import type { GameState } from '../state';
import { resolveShop } from './shop-query';

export function isShopHereV1(
  state: Readonly<GameState>, content: CoreContent, shopKey: string,
): boolean {
  const town = state.chapter.town;
  if (town === null || town.buildingPhase !== 'inside') return false;
  const shop = resolveShop(state, content, shopKey);
  return shop !== null && shop.buildingId === town.buildingId &&
    shop.layoutKey === `${town.sceneId}__${state.chapter.eraLayerId}`;
}

/** Engine-version dispatch seam. ENG-town2-explore-facility extends this switch with v2 geometry. */
export function locateShop(
  state: Readonly<GameState>, content: CoreContent, shopKey: string,
): boolean {
  const version = state.chapter.town?.version;
  return version === 1 && isShopHereV1(state, content, shopKey);
}
