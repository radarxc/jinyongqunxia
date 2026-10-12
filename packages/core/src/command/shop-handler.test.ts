import { describe, expect, it } from 'vitest';
import { canonicalJson, type JsonValue } from '@tianshu/shared';
import { createCoreFromState } from '../api';
import { createGameClock, type GameState } from '../state';
import { dispatchCommand, type CommandHandler } from '.';
import { queryShop } from '../economy/shop-query';
import { ITEM_AUTO, ITEM_FIXED, ITEM_NULL, ITEM_ZERO_AUTO, SHOP_KEY, shopContent, shopState }
  from '../economy/__fixtures__/shop-fixture';
import type { ShopCommand } from '../economy/shop-types';
import { shopHandler } from './shop-handler';

const buy = (itemId = ITEM_AUTO, count = 1, expectedUnitPrice = 46_851): ShopCommand =>
  ({ t: 'shop/buy', shopKey: SHOP_KEY, itemId, count, expectedUnitPrice });
const sell = (itemId = ITEM_AUTO, count = 1, expectedUnitPrice = 19_912): ShopCommand =>
  ({ t: 'shop/sell', shopKey: SHOP_KEY, itemId, count, expectedUnitPrice });
const reason = (state: GameState, command: ShopCommand) =>
  shopHandler.validate(state, command, shopContent());
const hash = (state: GameState) => canonicalJson(state as unknown as JsonValue);

describe('shopHandler validation', () => {
  it('rejects unknown, not-here, unavailable, stock, money, stale, capacity, and busy', () => {
    expect(reason(shopState(), { ...buy(), shopKey: 'shop_city_dali__ch01_missing' }))
      .toBe('SHOP_UNKNOWN');
    expect(reason(shopState({ inside: false }), buy())).toBe('SHOP_NOT_HERE');
    expect(reason(shopState({ buildingId: 'bi_other' }), buy())).toBe('SHOP_NOT_HERE');
    expect(reason(shopState(), buy(ITEM_NULL))).toBe('SHOP_ITEM_UNAVAILABLE');
    expect(reason(shopState(), buy(ITEM_ZERO_AUTO, 1, 0))).toBe('SHOP_ITEM_UNAVAILABLE');
    expect(reason(shopState({ inventory: [{ itemId: ITEM_ZERO_AUTO, count: 1 }] }),
      sell(ITEM_ZERO_AUTO, 1, 0))).toBe('SHOP_ITEM_UNAVAILABLE');
    expect(reason(shopState(), buy(ITEM_AUTO, 3))).toBe('SHOP_STOCK_INSUFFICIENT');
    expect(reason(shopState({ money: 1 }), buy())).toBe('SHOP_MONEY_INSUFFICIENT');
    expect(reason(shopState(), buy(ITEM_AUTO, 1, 46_850))).toBe('SHOP_PRICE_STALE');
    expect(reason(shopState({ inventory: [{ itemId: ITEM_FIXED, count: 3 }] }),
      buy(ITEM_FIXED, 1, 1_000))).toBe('SHOP_INVENTORY_FULL');
    expect(reason({ ...shopState(), battle: {} as GameState['battle'] }, buy()))
      .toBe('REGION_INTERACTION_BUSY');
  });

  it('requires a positive integer count and rejects selling beyond ownership', () => {
    expect(() => reason(shopState(), buy(ITEM_AUTO, 0))).toThrow('SHOP_TRANSACTION_COUNT');
    expect(() => reason(shopState(), buy(ITEM_AUTO, 1.5))).toThrow('SHOP_TRANSACTION_COUNT');
    expect(reason(shopState(), sell())).toBe('SHOP_ITEM_UNAVAILABLE');
  });

  it('keeps money and stock overflow as internal errors', () => {
    expect(() => reason(shopState({ money: Number.MAX_SAFE_INTEGER,
      inventory: [{ itemId: ITEM_AUTO, count: 1 }] }), sell()))
      .toThrow('SHOP_MONEY_OVERFLOW');
    const state = shopState({ inventory: [{ itemId: ITEM_AUTO, count: 1 }] });
    const rows = shopContent().shopTemplates![0]!.supply.map((entry) => ({ itemId: entry.itemId,
      count: entry.itemId === ITEM_AUTO ? Number.MAX_SAFE_INTEGER : entry.baseStock,
      lastRestockDay: 0 }));
    const full = { ...state, chapter: { ...state.chapter, shops: [{ shopKey: SHOP_KEY,
      stock: rows }] } };
    expect(() => reason(full, sell())).toThrow('SHOP_STOCK_OVERFLOW');
    const costly = { ...full, party: { ...full.party, inventory: { stacks: [] },
      money: Number.MAX_SAFE_INTEGER } };
    expect(() => reason(costly, buy(ITEM_AUTO, Number.MAX_SAFE_INTEGER)))
      .toThrow('SHOP_MONEY_OVERFLOW');
  });

  it('reuses the content index instead of rescanning any content catalog', () => {
    const base = shopContent();
    let catalogReads = 0;
    const watch = <T>(rows: readonly T[]): readonly T[] => new Proxy(rows, {
      get(target, property, receiver) {
      if (typeof property === 'string' && /^[0-9]+$/u.test(property)) catalogReads += 1;
      return Reflect.get(target, property, receiver) as unknown;
    } });
    const content = { ...base, items: watch(base.items!),
      shopTemplates: watch(base.shopTemplates!), townFacilities: watch(base.townFacilities!) };
    const state = shopState();
    expect(shopHandler.validate(state, buy(), content)).toBeNull();
    catalogReads = 0;
    expect(shopHandler.validate(state, buy(), content)).toBeNull();
    expect(queryShop(state, content, SHOP_KEY).offers[0]?.itemId).toBe(ITEM_AUTO);
    expect(catalogReads).toBe(0);
  });
});

describe('shopHandler transactions', () => {
  it('creates the shop only on first trade and emits the authoritative result', () => {
    const state = shopState();
    expect(queryShop(state, shopContent(), SHOP_KEY).offers[0]?.stock).toBe(2);
    expect(state.chapter.shops).toEqual([]);
    const core = createCoreFromState(state, shopContent());
    const result = core.dispatch(buy());
    expect(result).toMatchObject({ ok: true, events: [{ t: 'economy/shopBought',
      payload: { shopKey: SHOP_KEY, itemId: ITEM_AUTO, count: 1, totalPrice: 46_851 } }] });
    expect(core.snapshot()).toMatchObject({ party: { money: 953_149,
      inventory: { stacks: [{ itemId: ITEM_AUTO, count: 1 }] } }, chapter: { shops: [{
        shopKey: SHOP_KEY, stock: expect.arrayContaining([
          { itemId: ITEM_AUTO, count: 1, lastRestockDay: 0 },
        ]) }] } });
  });

  it('restocks on day three without consuming any RNG stream', () => {
    const content = shopContent();
    const core = createCoreFromState(shopState(), content);
    const initialRng = core.snapshot().meta.rng;
    expect(core.dispatch(buy(ITEM_AUTO, 2))).toMatchObject({ ok: true });
    const empty = core.snapshot();
    const atDay = (day: number): GameState => ({ ...empty,
      meta: { ...empty.meta, worldTick: day * 14_400 }, chapter: { ...empty.chapter,
        clock: createGameClock('epoch_ch01', 1093, day * 14_400) } });
    expect(queryShop(atDay(2), content, SHOP_KEY).offers[0]?.stock).toBe(0);
    expect(queryShop(atDay(3), content, SHOP_KEY).offers[0]?.stock).toBe(2);
    const restocked = createCoreFromState(atDay(3), content);
    expect(restocked.dispatch(buy())).toMatchObject({ ok: true });
    expect(restocked.snapshot().chapter.shops[0]?.stock.find(
      (row) => row.itemId === ITEM_AUTO)).toEqual(
      { itemId: ITEM_AUTO, count: 1, lastRestockDay: 3 });
    expect(restocked.snapshot().meta.rng).toEqual(initialRng);
  });

  it('rolls back money, inventory, and stock when an injected fault follows apply', () => {
    const state = shopState(); const before = hash(state);
    const failing: CommandHandler<ShopCommand> = { validate: shopHandler.validate,
      apply(tx, command) {
        let inventoryWritten = false;
        const injected = new Proxy(tx, { get(target, property, receiver) {
          if (property !== 'set') return Reflect.get(target, property, receiver) as unknown;
          return (path: readonly (string | number)[], value: unknown) => {
            if (inventoryWritten) throw new Error('INJECT_AFTER_INVENTORY');
            target.set(path, value);
            if (path[0] === 'party' && path[1] === 'inventory') inventoryWritten = true;
          };
        } });
        shopHandler.apply(injected, command);
      } };
    expect(() => dispatchCommand(state, buy(), shopContent(),
      { 'shop/buy': failing as CommandHandler }))
      .toThrow('INJECT_AFTER_INVENTORY');
    expect(hash(state)).toBe(before);
  });

  it('produces identical hashes from identical states and commands', () => {
    const first = createCoreFromState(shopState(), shopContent());
    const second = createCoreFromState(shopState(), shopContent());
    expect(first.dispatch(buy())).toEqual(second.dispatch(buy()));
    expect(first.canonicalStateJson()).toBe(second.canonicalStateJson());
  });

  it('conserves item counts across sell then buyback and applies the price spread', () => {
    const core = createCoreFromState(shopState({ money: 100_000,
      inventory: [{ itemId: ITEM_AUTO, count: 1 }] }), shopContent());
    const sold = core.dispatch(sell());
    expect(sold.ok).toBe(true);
    if (!sold.ok) throw new Error('EXPECTED_SHOP_SELL_SUCCESS');
    expect(sold.events).toHaveLength(1);
    const soldEvent = sold.events[0]!;
    expect(soldEvent.t).toBe('economy/shopSold');
    expect(soldEvent.payload).toEqual(
      { shopKey: SHOP_KEY, itemId: ITEM_AUTO, count: 1, totalPrice: 19_912 });
    expect(core.snapshot()).toMatchObject({ party: { money: 119_912, inventory: { stacks: [] } } });
    expect(core.dispatch(buy())).toMatchObject({ ok: true });
    const state = core.snapshot();
    expect(state.party).toMatchObject({ money: 73_061,
      inventory: { stacks: [{ itemId: ITEM_AUTO, count: 1 }] } });
    const stock = state.chapter.shops[0]!.stock.find((entry) => entry.itemId === ITEM_AUTO);
    expect(stock?.count).toBe(2);
    expect(46_851 - 19_912).toBe(26_939);
  });
});
