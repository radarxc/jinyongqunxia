import type { CoreContent } from '../../command';
import { createGameClock, createNewGameState, type GameState } from '../../state';
import { TownFacilitiesSchema, type ItemDef, type WorldMapRuntimeDefinition }
  from '@tianshu/data/schemas';

export const SHOP_KEY = 'city_dali__ch01/yaopu_01';
export const ITEM_AUTO = 'it_shop_auto';
export const ITEM_FIXED = 'it_shop_fixed';
export const ITEM_NULL = 'it_shop_null';
export const ITEM_ZERO_AUTO = 'it_shop_zero_auto';
const entry = { sceneId: 'city_dali', townSpec: null, templateYear: null, gateId: null,
  spawn: null, accessNote: 'shop fixture' };
const worldMap: WorldMapRuntimeDefinition = {
  version: 'worldmap.v1', revision: '0'.repeat(64), chapterId: 'ch01_tianlong', era: 'ch01',
  eraBand: 'northern_song', name: '店铺测试地图', years: [1093, 1093], mapReferenceYear: 1093,
  grid: { width: 2, height: 2 }, travel: { liPerHour: 10, stepLi: 10 },
  startNodeId: 'city_dali', nodes: [{ id: 'city_dali', name: '大理', kind: 'town',
    point: [0, 0], regionId: 'rg_fixture', eras: ['ch01'], open: true,
    levelRange: [50, 50], levelNote: 'fixture', entry }], roads: [],
  terrain: { land: [], rivers: [], mountains: [] },
};

const generic = (id: string, price: 'auto' | number | null, stack = 99, grade = 5): ItemDef => ({
  schemaVersion: 'item.v1' as const, id, name: id, kind: 'material' as const,
  sub: 'ingredient', grade, stack,
  chapters: 'any', origin: 'expanded', price, flags: [],
  assets: { icon: `items/${id}.webp` }, text: { desc: id },
  extension: { type: 'material' as const, value: { family: 'wood', resourceRef: 'res_fixture',
    materialGrade: 5, rare: false } },
});

export function shopContent(): CoreContent {
  const facilities = TownFacilitiesSchema.parse({ schemaVersion: 'town-facilities.v1',
    layoutKey: 'city_dali__ch01', facilities: [{ key: 'yaopu_01', kind: 'shop',
      sub: 'yaopu', buildingId: 'bi_0001',
      nameKey: 'town.city_dali__ch01.yaopu_01.name',
      shop: { templateRef: 'shop_tpl_yaopu', kind: 'normal' }, roles: ['keeper'] }] });
  return {
    items: [generic(ITEM_AUTO, 'auto'), generic(ITEM_FIXED, 1_000, 3),
      generic(ITEM_NULL, null), generic(ITEM_ZERO_AUTO, 'auto', 99, 1)],
    chapters: [{ schemaVersion: 'book-world.v1', id: 'ch01_tianlong', eraLayerId: 'ch01',
      gameYear: { start: 1093, end: 1093, approx: false }, worldTier: 'HIGH',
      levelCap: 50, layerCap: 10, foreignSuppression: 0, startTick: 0, countsRealLevel: true,
      wake: { regionId: 'rg_fixture', sceneId: 'sc_fixture', spawnId: 'spawn' } }],
    worldMaps: [worldMap],
    shopTemplates: [{ schemaVersion: 'shop-template.v1', key: 'shop_tpl_yaopu',
      nameKey: 'shop.template.yaopu.name', facilitySub: 'yaopu', supply: [
        { itemId: ITEM_AUTO, maxGrade: 6, baseStock: 2, restockEveryDays: 3,
          restockAmount: 2, priceBp: 10_000 },
        { itemId: ITEM_FIXED, maxGrade: 6, baseStock: 2, restockEveryDays: 3,
          restockAmount: 2, priceBp: 10_000 },
        { itemId: ITEM_NULL, maxGrade: 6, baseStock: 2, restockEveryDays: 3,
          restockAmount: 2, priceBp: 10_000 },
        { itemId: ITEM_ZERO_AUTO, maxGrade: 6, baseStock: 2, restockEveryDays: 3,
          restockAmount: 2, priceBp: 10_000 },
      ] }],
    priceTables: [{ schemaVersion: 'price-table.v1', categories: [{ id: 'general',
      byGrade: [0, 200, 300, 400, 46_851, 600, 700, 800, 900, 1_000, 1_100, 1_200] }],
      itemKindToCategory: { weapon: 'general', armor: 'general', offhand: 'general',
        hidden: 'general', accessory: 'general', ammo: 'general', pill: 'general',
        tonic: 'general', poison: 'general', antidote: 'general', food: 'general',
        dish: 'general', wine: 'general', material: 'general', tool: 'general',
        manual: 'general', page: 'general', recipe: 'general', quest: 'general',
        token: 'general', curio: 'general', mount: 'general', collectible: 'general',
        system: 'general' } }],
    townFacilities: [facilities],
  };
}

export function shopState(overrides: { readonly money?: number; readonly day?: number;
  readonly inside?: boolean; readonly buildingId?: string; readonly inventory?:
    readonly { readonly itemId: string; readonly count: number }[] } = {}): GameState {
  const base = createNewGameState({ masterSeed: 123, difficulty: 'diff_jianghu',
    identity: { name: '甲', gender: 'unspecified', appearance: 'appearance_default',
      pronoun: '你', originId: 'origin_wenshiguan' } });
  const day = overrides.day ?? 0;
  const inside = overrides.inside ?? true;
  const clock = createGameClock('epoch_ch01', 1093, day * 14_400);
  return { ...base, chapter: { ...base.chapter, chapterId: 'ch01_tianlong',
    eraLayerId: 'ch01', worldTier: 'HIGH', worldYear: 1093, clock,
    story: { chapterId: 'ch01_tianlong', lines: [] }, town: { version: 1,
      townRevision: 'a'.repeat(64), sceneId: 'city_dali', point: [0, 0],
      buildingId: inside ? overrides.buildingId ?? 'bi_0001' : null,
      buildingPhase: inside ? 'inside' : 'outside' } },
    world: { ...base.world, navigation: { ...base.world.navigation, locationId: 'city_dali' } },
    party: { ...base.party, money: overrides.money ?? 1_000_000,
      inventory: { stacks: overrides.inventory ?? [] } } };
}
