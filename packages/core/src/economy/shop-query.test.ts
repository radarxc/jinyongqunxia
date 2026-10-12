import { describe, expect, it } from 'vitest';
import { queryShop, resolveShop } from './shop-query';
import { isShopHereV1 } from './shop-locator';
import { freezeJsonTree } from '../state/immutable-json';
import { ITEM_AUTO, ITEM_FIXED, ITEM_NULL, ITEM_ZERO_AUTO, SHOP_KEY, shopContent, shopState }
  from './__fixtures__/shop-fixture';

describe('queryShop', () => {
  it('is read-only on a frozen state and does not persist the lazy shop', () => {
    const state = shopState();
    const frozen = freezeJsonTree(state);
    const view = queryShop(frozen, shopContent(), SHOP_KEY);
    expect(view).toMatchObject({ instanceKey: SHOP_KEY, money: 1_000_000, nextRestockDay: 3 });
    expect(view.offers.map((entry) => entry.itemId)).toEqual([ITEM_AUTO, ITEM_FIXED]);
    expect(view.offers[0]).toMatchObject({ stock: 2, unitBuyPrice: 46_851, maxGrade: 6 });
    expect(state.chapter.shops).toEqual([]);
  });

  it('sorts offers and owned buyback rows by item code point', () => {
    const state = shopState({ inventory: [{ itemId: ITEM_FIXED, count: 2 },
      { itemId: ITEM_AUTO, count: 1 }, { itemId: ITEM_NULL, count: 1 }] });
    const view = queryShop(state, shopContent(), SHOP_KEY);
    expect(view.offers.map((entry) => entry.itemId)).toEqual([ITEM_AUTO, ITEM_FIXED]);
    expect(view.buys.map((entry) => entry.itemId)).toEqual([ITEM_AUTO, ITEM_FIXED]);
    expect(view.buys[0]).toEqual({ itemId: ITEM_AUTO, owned: 1, unitSellPrice: 19_912 });
  });

  it('derives v1 identity and initializes every stock row at the current day', () => {
    const state = shopState({ day: 2 });
    const content = shopContent();
    const shop = resolveShop(state, content, SHOP_KEY);
    expect(isShopHereV1(state, content, SHOP_KEY)).toBe(true);
    expect(shop?.persisted).toBe(false);
    expect(shop?.state.stock).toEqual([
      { itemId: ITEM_AUTO, count: 2, lastRestockDay: 2 },
      { itemId: ITEM_FIXED, count: 2, lastRestockDay: 2 },
      { itemId: ITEM_NULL, count: 2, lastRestockDay: 2 },
      { itemId: ITEM_ZERO_AUTO, count: 2, lastRestockDay: 2 },
    ]);
  });
});
