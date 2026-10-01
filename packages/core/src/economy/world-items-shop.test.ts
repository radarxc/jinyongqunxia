import type { ShopDef } from '@tianshu/data/schemas';
import { describe, expect, it } from 'vitest';
import { createGameClock } from '../state';
import { ShopRuntime, calculateBuyPrice, calculateSellPrice, mainGradeForTown } from './shop';
import { WorldItemsRuntime } from './world-items';

const ITEMS = [
  { id: 'it_food', kind: 'food', grade: 3, stack: 20 },
  { id: 'eq_rare', kind: 'weapon', grade: 7, stack: 1 },
] as const;

describe('WorldItemsRuntime', () => {
  const state = { entries: [
    { instanceKey: 'wi_hidden', itemId: 'it_food', count: 2,
      locationId: 'scene_market#chest', collectible: true, pickedUp: false },
    { instanceKey: 'wi_open', itemId: 'it_food', count: 1,
      locationId: 'scene_market#stall', collectible: false, pickedUp: false },
  ] };
  const rules = [
    { instanceKey: 'wi_hidden', sceneId: 'scene_market', anchorId: 'chest',
      visibleFromTick: 100, visibleUntilTick: 200, requiredFlags: ['quest_open'],
      forbiddenFlags: ['quest_closed'] },
    { instanceKey: 'wi_open', sceneId: 'scene_market', anchorId: 'stall' },
  ] as const;

  it('queries a scene bucket with time and flag visibility in stable order', () => {
    const runtime = new WorldItemsRuntime(state, rules);
    expect(runtime.queryScene('scene_market', { worldTick: 99, flags: ['quest_open'] })
      .map((item) => item.instanceKey)).toEqual(['wi_open']);
    expect(runtime.queryScene('scene_market', { worldTick: 100, flags: ['quest_open'] })
      .map((item) => item.instanceKey)).toEqual(['wi_hidden', 'wi_open']);
    expect(runtime.get('wi_hidden', { worldTick: 150, flags: ['quest_open', 'quest_closed'] }))
      .toBeUndefined();
  });

  it('atomically picks up a visible item and persists its collected state', () => {
    const runtime = new WorldItemsRuntime(state, rules);
    const result = runtime.pickup('wi_hidden', { worldTick: 150, flags: ['quest_open'] },
      { stacks: [] }, ITEMS);
    expect(result.inventory.stacks).toEqual([{ itemId: 'it_food', count: 2 }]);
    expect(result.worldItems.entries.find((item) => item.instanceKey === 'wi_hidden')?.pickedUp)
      .toBe(true);
    expect(result.event).toEqual({ t: 'economy/worldItemPickedUp',
      instanceKey: 'wi_hidden', itemId: 'it_food' });
    expect(() => runtime.pickup('wi_hidden', { worldTick: 150, flags: ['quest_open'] },
      { stacks: [] }, ITEMS)).toThrow('WORLD_ITEM_NOT_AVAILABLE');
  });
});

function shopDef(): ShopDef {
  return { schemaVersion: 'shop.v1', key: 'shop_fixture', name: '测试商铺',
    chapterId: 'ch01_tianlong', supply: [
      { itemId: 'it_food', maxGrade: 6, baseStock: 5, restockEveryDays: 3,
        restockAmount: 2, priceBp: 10_000 },
      { itemId: 'eq_rare', maxGrade: 7, baseStock: 1, restockEveryDays: 10,
        restockAmount: 1, priceBp: 12_000 },
    ] };
}

describe('ShopRuntime', () => {
  const context = { chapterId: 'ch01_tianlong', worldTier: 'HIGH' as const,
    shopKind: 'normal' as const, townLevel: 20, flags: [] };
  const initial = { shopKey: 'shop_fixture', stock: [
    { itemId: 'it_food', count: 1, lastRestockDay: 0 },
    { itemId: 'eq_rare', count: 0, lastRestockDay: 0 },
  ] };

  it('restocks only complete GameClock periods and advances the restock cursor', () => {
    const runtime = new ShopRuntime(shopDef(), initial, ITEMS, context);
    expect(runtime.restock(createGameClock('epoch_fixture', 1000, 2 * 14_400)).events)
      .toEqual([]);
    const daySix = runtime.restock(createGameClock('epoch_fixture', 1000, 6 * 14_400));
    expect(daySix.shop.stock).toEqual([
      { itemId: 'eq_rare', count: 0, lastRestockDay: 0 },
      { itemId: 'it_food', count: 5, lastRestockDay: 6 },
    ]);
    expect(daySix.events).toEqual([
      { t: 'economy/shopRestocked', shopKey: 'shop_fixture', dayIndex: 6 },
    ]);
  });

  it('buys and sells with deterministic integer pricing and inventory transfer', () => {
    const runtime = new ShopRuntime(shopDef(), initial, ITEMS, context);
    const clock = createGameClock('epoch_fixture', 1000);
    const pricing = { referencePrice: 100, charisma: 0, speech: 0 };
    expect(calculateBuyPrice(pricing, 10_000, 'normal')).toBe(120);
    expect(calculateSellPrice(pricing, 10_000, 'normal')).toBe(40);
    expect(calculateBuyPrice({ ...pricing, referencePrice: 4, shopBp: 9_000,
      chapterPriceBp: 11_300, marketBp: 8_700 }, 12_300, 'normal')).toBe(10);
    const bought = runtime.buy({ itemId: 'it_food', count: 1, inventory: { stacks: [] },
      money: 200, pricing, clock });
    expect(bought).toMatchObject({ money: 80,
      inventory: { stacks: [{ itemId: 'it_food', count: 1 }] } });
    expect(bought.shop.stock.find((row) => row.itemId === 'it_food')?.count).toBe(0);
    const sold = new ShopRuntime(shopDef(), bought.shop, ITEMS, context).sell({
      itemId: 'it_food', count: 1, inventory: bought.inventory, money: bought.money,
      pricing, clock,
    });
    expect(sold).toMatchObject({ money: 120, inventory: { stacks: [] } });
    expect(sold.shop.stock.find((row) => row.itemId === 'it_food')?.count).toBe(1);
  });

  it('enforces world, outlet and town grade caps', () => {
    expect([1, 20, 50].map(mainGradeForTown)).toEqual([1, 5, 12]);
    const runtime = new ShopRuntime(shopDef(), initial, ITEMS, context);
    expect(runtime.offer('eq_rare', { referencePrice: 100, charisma: 0, speech: 0 },
      createGameClock('epoch_fixture', 1000))).toBeUndefined();
  });
});
