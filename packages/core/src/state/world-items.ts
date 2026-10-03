import { compareCodePoints } from '@tianshu/shared';
import type { ShopDef } from '@tianshu/data/schemas';
import type { ShopState, WorldItems } from './models';

interface LegacyWorldItemRow {
  readonly instanceKey: string; readonly itemId: string; readonly count: number;
  readonly locationId: string; readonly collectible: boolean;
}
interface LegacyWorldItemsDef {
  readonly globalItems: readonly LegacyWorldItemRow[];
  readonly collectibleLocations: readonly LegacyWorldItemRow[];
}

/** Retained for old callers; ChapterDef no longer owns item-placement content. */
export function createWorldItems(world: LegacyWorldItemsDef): WorldItems {
  const rows = [...world.globalItems, ...world.collectibleLocations];
  if (new Set(rows.map((row) => row.instanceKey)).size !== rows.length) throw new TypeError('WORLD_ITEM_INSTANCE_DUPLICATE');
  const entries = rows.map((row) => ({ ...row, pickedUp: false }));
  entries.sort((left, right) => compareCodePoints(left.instanceKey, right.instanceKey));
  return { entries };
}

export function createShopState(shop: ShopDef): ShopState {
  const stock = shop.supply.map((row) => ({ itemId: row.itemId, count: row.baseStock, lastRestockDay: 0 }));
  stock.sort((left, right) => compareCodePoints(left.itemId, right.itemId));
  return { shopKey: shop.key, stock };
}
