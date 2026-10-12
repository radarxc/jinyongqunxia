import type { CoreContent } from '../command';
import { currentTownLayoutKey } from '../dialogue/facility';
import type { GameState } from '../state';
import { resolveShop } from './shop-query';

const FIXTURE_LAYOUTS = new WeakMap<CoreContent, ReadonlyMap<string, string | undefined>>();

function soleFixtureLayout(content: CoreContent, sceneId: string): string | undefined {
  if (content.towns !== undefined) return undefined;
  const cached = FIXTURE_LAYOUTS.get(content);
  if (cached?.has(sceneId)) return cached.get(sceneId);
  const prefix = `${sceneId}__`;
  const layouts = content.townFacilities?.filter((entry) => entry.layoutKey.startsWith(prefix));
  const layoutKey = layouts?.length === 1 ? layouts[0]!.layoutKey : undefined;
  const next = new Map(cached);
  next.set(sceneId, layoutKey);
  FIXTURE_LAYOUTS.set(content, next);
  return layoutKey;
}

export function isShopHereV1(
  state: Readonly<GameState>,
  content: CoreContent,
  shopKey: string,
): boolean {
  const town = state.chapter.town;
  if (town === null || town.buildingPhase !== 'inside') return false;
  const shop = resolveShop(state, content, shopKey);
  // Some isolated v1 fixtures predate the towns catalog; keep only their unambiguous layout.
  const layoutKey =
    currentTownLayoutKey(state, content, town.sceneId) ?? soleFixtureLayout(content, town.sceneId);
  return shop !== null && shop.buildingId === town.buildingId && shop.layoutKey === layoutKey;
}

/** Engine-version dispatch seam. ENG-town2-explore-facility extends this switch with v2 geometry. */
export function locateShop(
  state: Readonly<GameState>,
  content: CoreContent,
  shopKey: string,
): boolean {
  const version = state.chapter.town?.version;
  return version === 1 && isShopHereV1(state, content, shopKey);
}
