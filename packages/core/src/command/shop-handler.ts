import type { CommandHandler, CoreContent, CoreTransaction, RejectReason } from '.';
import { compareCodePoints } from '@tianshu/shared';
import type { GameState, ShopState } from '../state';
import { InventoryRuntime } from '../economy/inventory';
import { ShopRuntime } from '../economy/shop';
import { calculateShopBuyPrice, calculateShopSellPrice }
  from '../economy/shop-pricing';
import { locateShop } from '../economy/shop-locator';
import { materializeShop, shopItem, shopItems, shopPricing } from '../economy/shop-query';
import type { ResolvedShop, ShopCommand } from '../economy/shop-types';
import { eventPayload } from './transaction';

interface Prepared {
  readonly shop: ResolvedShop; readonly result: ReturnType<ShopRuntime['buy']>;
}
interface PreparedItem {
  readonly item: NonNullable<ReturnType<typeof shopItem>>;
  readonly supply: ResolvedShop['definition']['supply'][number];
  readonly pricing: NonNullable<ReturnType<typeof shopPricing>>;
}

function busy(state: Readonly<GameState>): boolean {
  return state.dialogue !== null || state.battle !== null ||
    state.world.navigation.pendingMount !== null;
}

function positiveCount(count: number): void {
  if (!Number.isSafeInteger(count) || count <= 0) throw new TypeError('SHOP_TRANSACTION_COUNT');
}

function itemAndPricing(
  state: Readonly<GameState>, content: CoreContent, shop: ResolvedShop, itemId: string,
): PreparedItem | null {
  const item = shopItem(content, itemId);
  const supply = shop.definition.supply.find((entry) => entry.itemId === itemId);
  if (item === undefined || supply === undefined) return null;
  const pricing = shopPricing(state, content, item);
  return pricing === null ? null : { item, supply, pricing };
}

function prepare(
  state: Readonly<GameState>, command: ShopCommand, content: CoreContent,
): Prepared | RejectReason {
  positiveCount(command.count);
  if (busy(state)) return 'REGION_INTERACTION_BUSY';
  const shop = materializeShop(state, content, command.shopKey);
  if (shop === null) return 'SHOP_UNKNOWN';
  if (!locateShop(state, content, command.shopKey)) return 'SHOP_NOT_HERE';
  const found = itemAndPricing(state, content, shop, command.itemId);
  if (found === null) return 'SHOP_ITEM_UNAVAILABLE';
  const inventoryIds = state.party.inventory.stacks.map((entry) => entry.itemId);
  const relevantItems = shopItems(content, shop, inventoryIds);
  const runtime = new ShopRuntime(shop.definition, shop.state, relevantItems, shop.context);
  const offer = runtime.offer(command.itemId, found.pricing, state.chapter.clock);
  if (offer === undefined) return 'SHOP_ITEM_UNAVAILABLE';
  if (command.t === 'shop/buy') {
    if (offer.count < command.count) return 'SHOP_STOCK_INSUFFICIENT';
    const unit = calculateShopBuyPrice(found.pricing, found.supply.priceBp, shop.context.shopKind);
    const total = unit * command.count;
    if (!Number.isSafeInteger(total)) throw new RangeError('SHOP_MONEY_OVERFLOW');
    if (state.party.money < total) return 'SHOP_MONEY_INSUFFICIENT';
    if (command.expectedUnitPrice !== unit) return 'SHOP_PRICE_STALE';
    try {
      const inventory = new InventoryRuntime(state.party.inventory, relevantItems);
      inventory.add(command.itemId, command.count);
    } catch (error) {
      if (error instanceof Error && error.message === 'INVENTORY_STACK_LIMIT')
        return 'SHOP_INVENTORY_FULL';
      throw error;
    }
    const result = runtime.buy({ itemId: command.itemId, count: command.count,
      inventory: state.party.inventory, money: Number.MAX_SAFE_INTEGER, pricing: found.pricing,
      clock: state.chapter.clock });
    return { shop, result: exactResult(result, state.party.money - total, total) };
  }
  const owned = state.party.inventory.stacks.find((entry) => entry.itemId === command.itemId)?.count ?? 0;
  if (owned < command.count) return 'SHOP_ITEM_UNAVAILABLE';
  const unit = calculateShopSellPrice(found.pricing, found.supply.priceBp, shop.context.shopKind);
  if (command.expectedUnitPrice !== unit) return 'SHOP_PRICE_STALE';
  const total = unit * command.count;
  if (!Number.isSafeInteger(total) || !Number.isSafeInteger(state.party.money + total))
    throw new RangeError('SHOP_MONEY_OVERFLOW');
  const result = runtime.sell({ itemId: command.itemId, count: command.count,
    inventory: state.party.inventory, money: 0, pricing: found.pricing,
    clock: state.chapter.clock });
  return { shop, result: exactResult(result, state.party.money + total, total) };
}

function exactResult(result: ReturnType<ShopRuntime['buy']>, money: number, total: number):
ReturnType<ShopRuntime['buy']> {
  return { ...result, money, events: result.events.map((event) =>
    event.t === 'economy/shopBought' || event.t === 'economy/shopSold'
      ? { ...event, totalPrice: total } : event) };
}

function shopStates(shops: readonly ShopState[], next: ShopState): readonly ShopState[] {
  const result = shops.filter((entry) => entry.shopKey !== next.shopKey);
  result.push(next);
  result.sort((left, right) => compareCodePoints(left.shopKey, right.shopKey));
  return result;
}

function applyPrepared(tx: CoreTransaction, prepared: Prepared): void {
  const { result } = prepared;
  tx.set(['party', 'money'], result.money);
  tx.set(['party', 'inventory'], result.inventory);
  tx.set(['chapter', 'shops'], shopStates(tx.state.chapter.shops, result.shop));
  for (const fact of result.events) {
    const { t, ...payload } = fact;
    tx.emit({ t, payload: eventPayload(payload) });
  }
}

export const shopHandler: CommandHandler<ShopCommand> = {
  validate(state, command, content) {
    const result = prepare(state, command, content);
    return typeof result === 'string' ? result : null;
  },
  apply(tx, command) {
    const prepared = prepare(tx.state, command, tx.content);
    const accepted = typeof prepared === 'string' ? tx.abort(prepared) : prepared;
    applyPrepared(tx, accepted);
  },
};
