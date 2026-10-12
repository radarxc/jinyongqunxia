import * as Comlink from '../../../../packages/platform/node_modules/comlink/dist/esm/comlink.js';
import { createProjectionMainThreadHost, createProjectionWorkerHost } from '@tianshu/platform/host';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PriceTableSchema, ShopTemplateSchema, TownFacilitiesSchema } from '@tianshu/data/schemas';
import { describe, expect, it } from 'vitest';
import type { GameContent } from './content';
import type { GameRemote } from './contracts';
import { createPreviewSession } from './bootstrap';
import { createGameSession } from './session';
import { fixtureContent } from './test-fixture';

function shopContent(): GameContent {
  const base = fixtureContent();
  const kinds = ['weapon', 'armor', 'offhand', 'hidden', 'accessory', 'ammo', 'pill', 'tonic',
    'poison', 'antidote', 'food', 'dish', 'wine', 'material', 'tool', 'manual', 'page', 'recipe',
    'quest', 'token', 'curio', 'mount', 'collectible', 'system'];
  return { ...base, chapters: [{ schemaVersion: 'book-world.v1', id: 'ch01_tianlong',
    eraLayerId: 'ch01', gameYear: { start: 1093, end: 1094, approx: true }, worldTier: 'LOW',
    levelCap: 20, layerCap: 9, foreignSuppression: 4, startTick: 0, countsRealLevel: true,
    wake: { regionId: 'rg_yunnan', sceneId: 'city_dali', spawnId: 'fixture' } }],
    shopTemplates: [ShopTemplateSchema.parse({ schemaVersion: 'shop-template.v1',
      key: 'shop_tpl_yaopu', nameKey: 'shop.template.yaopu.name', facilitySub: 'yaopu',
      supply: [{ itemId: 'it_jinchuangyao', maxGrade: 3, baseStock: 8,
        restockEveryDays: 3, restockAmount: 4, priceBp: 10_000 }] })],
    priceTables: [PriceTableSchema.parse({ schemaVersion: 'price-table.v1',
      categories: [{ id: 'healing_pill', byGrade: Array(12).fill(200) }],
      itemKindToCategory: Object.fromEntries(kinds.map((kind) => [kind, 'healing_pill'])) })],
    townFacilities: [TownFacilitiesSchema.parse({ schemaVersion: 'town-facilities.v1',
      layoutKey: 'city_dali__ch01', facilities: [{ key: 'yaopu_01', kind: 'shop',
        sub: 'yaopu', buildingId: 'bi_0023', nameKey: 'town.city_dali__ch01.yaopu_01.name',
        shop: { templateRef: 'shop_tpl_yaopu', kind: 'normal' }, roles: ['keeper'] }] })],
  };
}
function insideShop(content: GameContent) {
  const opening = createPreviewSession(content); const town = content.towns![0]!;
  return { ...opening, party: { ...opening.party, money: 10_000 },
    chapter: { ...opening.chapter, town: { version: 1 as const, sceneId: town.sceneId, townRevision: town.revision,
      point: [-10, 78] as const, buildingId: 'bi_0023', buildingPhase: 'inside' as const } } };
}
function workerTransport(remote: GameRemote) {
  const channel = new MessageChannel();
  Comlink.expose(remote, channel.port1);
  const worker = Object.assign(channel.port2, { terminate: () => {
    channel.port1.close(); channel.port2.close();
  } }) as unknown as Worker;
  return createProjectionWorkerHost(worker);
}

describe('shop session query transport', () => {
  it('returns the same read-only ShopView through main-thread and Worker boundaries', async () => {
    const content = shopContent(); const opening = insideShop(content);
    const main = createProjectionMainThreadHost(createGameSession(content, opening));
    const worker = workerTransport(createGameSession(content, opening));
    const command = { t: 'shop/query' as const, shopKey: 'city_dali__ch01/yaopu_01' };
    const before = await main.snapshot();
    const [local, remote] = await Promise.all([main.dispatch(command), worker.dispatch(command)]);
    expect(remote).toEqual(local);
    expect(local.changes.shopQuery).toMatchObject({ money: 10_000, nameKey:
      'town.city_dali__ch01.yaopu_01.name', offers: [{ itemId: 'it_jinchuangyao', stock: 8 }] });
    expect(local.changes.shopItems).toMatchObject([{ id: 'it_jinchuangyao', name: '金创药',
      count: 3 }]);
    expect(await main.snapshot()).toEqual(before);
    main.dispose(); worker.dispose();
  });

  it('projects facility and dirties only hud plus inventory after a trade', async () => {
    const content = shopContent(); const session = createGameSession(content, insideShop(content));
    const initial = await session.query();
    expect(initial.town?.facility).toEqual({ key: 'yaopu_01', kind: 'shop',
      nameKey: 'town.city_dali__ch01.yaopu_01.name', shopKey: 'city_dali__ch01/yaopu_01' });
    const queried = await session.dispatch({ t: 'shop/query', shopKey: 'city_dali__ch01/yaopu_01' });
    const offer = queried.changes.shopQuery!.offers[0]!;
    const bought = await session.dispatch({ t: 'shop/buy', shopKey: 'city_dali__ch01/yaopu_01',
      itemId: offer.itemId, count: 1, expectedUnitPrice: offer.unitBuyPrice });
    expect(bought.accepted).toBe(true);
    expect(Object.keys(bought.changes).sort()).toEqual(['coreVersion', 'hud', 'inventory',
      'status', 'title', 'worldPaused', 'worldTick'].sort());
    const after = await session.snapshot();
    expect(after.party.money).toBe(10_000 - offer.unitBuyPrice);
    expect(after.chapter.shops[0]?.stock[0]?.count).toBe(7);
    const inventoryCount = after.party.inventory.stacks.find((row) =>
      row.itemId === offer.itemId)?.count;
    const restored = createGameSession(content, structuredClone(after));
    const loaded = await restored.snapshot();
    expect(loaded.party.money).toBe(after.party.money);
    expect(loaded.party.inventory.stacks.find((row) => row.itemId === offer.itemId)?.count)
      .toBe(inventoryCount);
    expect(loaded.chapter.shops[0]?.stock[0]?.count).toBe(7);
  });

  it('rejects an actual stale price and exposes the new core price on requery', async () => {
    const content = shopContent(); const session = createGameSession(content, insideShop(content));
    const first = await session.dispatch({ t: 'shop/query',
      shopKey: 'city_dali__ch01/yaopu_01' });
    const oldPrice = first.changes.shopQuery!.offers[0]!.unitBuyPrice;
    const snapshot = await session.snapshot(); const protagonist = snapshot.profile.protagonist!;
    await session.restore({ ...snapshot, profile: { ...snapshot.profile, protagonist: {
      ...protagonist, innate: { ...protagonist.innate, cha: 0 },
    } } });
    const stale = await session.dispatch({ t: 'shop/buy',
      shopKey: 'city_dali__ch01/yaopu_01', itemId: 'it_jinchuangyao', count: 1,
      expectedUnitPrice: oldPrice });
    expect(stale).toMatchObject({ accepted: false, error: 'SHOP_PRICE_STALE' });
    const refreshed = await session.dispatch({ t: 'shop/query',
      shopKey: 'city_dali__ch01/yaopu_01' });
    expect(oldPrice).toBe(200);
    expect(refreshed.changes.shopQuery!.offers[0]!.unitBuyPrice).toBe(230);
  });

  it('keeps shop economy modules outside the session static import closure', () => {
    const source = readFileSync(resolve(process.cwd(), 'apps/game/src/runtime/session.ts'), 'utf8');
    expect(source).not.toMatch(/^import (?!type)[^;]*@tianshu\/core\/shop-command/mu);
    expect(source).not.toMatch(/from ['"][^'"]*economy\/shop/u);
    expect(source).toContain("import('@tianshu/core/shop-command')");
  });
});
