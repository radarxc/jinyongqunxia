import { compareCodePoints } from '@tianshu/shared';
import type { ItemDef, PriceTableDef, ShopDef, ShopTemplateDef, TownFacility,
  WorldMapRuntimeDefinition } from '@tianshu/data/schemas';
import type { CoreContent } from '../command';
import type { GameState, ShopState } from '../state';
import { ShopRuntime } from './shop';
import { calculateShopBuyPrice, calculateShopSellPrice, pricingForItem } from './shop-pricing';
import type { ResolvedShop, ShopView } from './shop-types';

interface IndexedFacility { readonly layoutKey: string; readonly facility: TownFacility }
interface ShopContentIndex {
  readonly items: ReadonlyMap<string, ItemDef>;
  readonly templates: ReadonlyMap<string, ShopTemplateDef>;
  readonly facilities: ReadonlyMap<string, IndexedFacility>;
  readonly chapters: ReadonlyMap<string, NonNullable<CoreContent['chapters']>[number]>;
  readonly maps: ReadonlyMap<string, WorldMapRuntimeDefinition>;
  readonly nodes: ReadonlyMap<string, ReadonlyMap<string, WorldMapRuntimeDefinition['nodes'][number]>>;
  readonly priceTable: PriceTableDef | undefined;
}
const CONTENT_INDEXES = new WeakMap<CoreContent, ShopContentIndex>();
const SHOP_STATE_INDEXES = new WeakMap<readonly ShopState[], ReadonlyMap<string, ShopState>>();

function uniqueMap<T>(values: readonly T[], key: (value: T) => string, code: string): Map<string, T> {
  const result = new Map<string, T>();
  for (const value of values) {
    const id = key(value);
    if (result.has(id)) throw new TypeError(code);
    result.set(id, value);
  }
  return result;
}

function shopInstanceKey(layoutKey: string, facility: TownFacility): string {
  const shop = facility.shop as { readonly instanceKey?: string } | null;
  return shop?.instanceKey ?? `${layoutKey}/${facility.key}`;
}

function contentIndex(content: CoreContent): ShopContentIndex {
  const cached = CONTENT_INDEXES.get(content);
  if (cached !== undefined) return cached;
  const tables = content.priceTables ?? [];
  if (tables.length > 1) throw new TypeError('SHOP_PRICE_TABLE');
  const facilities = new Map<string, IndexedFacility>();
  for (const layout of content.townFacilities ?? [])
    for (const facility of layout.facilities) {
      if (facility.shop === null) continue;
      const instanceKey = shopInstanceKey(layout.layoutKey, facility);
      if (facilities.has(instanceKey)) throw new TypeError('SHOP_INSTANCE_DUPLICATE');
      facilities.set(instanceKey, { layoutKey: layout.layoutKey, facility });
    }
  const maps = uniqueMap(content.worldMaps ?? [], (entry) => entry.chapterId, 'SHOP_MAP_DUPLICATE');
  const nodes = new Map<string, ReadonlyMap<string, WorldMapRuntimeDefinition['nodes'][number]>>();
  for (const [chapterId, map] of maps)
    nodes.set(chapterId, uniqueMap(map.nodes, (entry) => entry.id, 'SHOP_MAP_NODE_DUPLICATE'));
  const index: ShopContentIndex = {
    items: uniqueMap(content.items ?? [], (entry) => entry.id, 'SHOP_ITEM_DEF_DUPLICATE'),
    templates: uniqueMap(content.shopTemplates ?? [], (entry) => entry.key,
      'SHOP_TEMPLATE_DUPLICATE'),
    facilities, chapters: uniqueMap(content.chapters ?? [], (entry) => entry.id,
      'SHOP_CHAPTER_DUPLICATE'), maps, nodes, priceTable: tables[0]!,
  };
  CONTENT_INDEXES.set(content, index);
  return index;
}

function currentTownLevel(state: Readonly<GameState>, index: ShopContentIndex): number {
  const nodeId = state.chapter.worldMap?.scene?.nodeId ??
    (state.chapter.worldMap?.position.kind === 'node'
      ? state.chapter.worldMap.position.nodeId : state.world.navigation.locationId);
  const range = index.nodes.get(state.chapter.chapterId)?.get(nodeId)?.levelRange;
  if (range === undefined || range === null) throw new TypeError('SHOP_TOWN_LEVEL');
  return range[0];
}

function storedShop(shops: readonly ShopState[], shopKey: string): ShopState | undefined {
  let index = SHOP_STATE_INDEXES.get(shops);
  if (index === undefined) {
    index = uniqueMap(shops, (entry) => entry.shopKey, 'SHOP_STATE_DUPLICATE');
    SHOP_STATE_INDEXES.set(shops, index);
  }
  return index.get(shopKey);
}

function initialState(template: ShopTemplateDef, instanceKey: string, dayIndex: number): ShopState {
  const stock = template.supply.map((row) => ({ itemId: row.itemId,
    count: row.baseStock, lastRestockDay: dayIndex }));
  stock.sort((left, right) => compareCodePoints(left.itemId, right.itemId));
  return { shopKey: instanceKey, stock };
}

function shopDefinition(
  template: ShopTemplateDef, instanceKey: string, chapterId: string,
): ShopDef {
  return { schemaVersion: 'shop.v1', key: instanceKey, name: template.nameKey, chapterId,
    supply: template.supply };
}

export function resolveShop(
  state: Readonly<GameState>, content: CoreContent, shopKey: string,
): ResolvedShop | null {
  const index = contentIndex(content);
  const found = index.facilities.get(shopKey);
  if (found === undefined) return null;
  const { layoutKey, facility } = found;
  const template = index.templates.get(facility.shop!.templateRef);
  if (template === undefined) throw new TypeError('SHOP_TEMPLATE_UNKNOWN');
  const stored = storedShop(state.chapter.shops, shopKey);
  const chapter = index.chapters.get(state.chapter.chapterId);
  if (chapter === undefined) throw new TypeError('SHOP_CHAPTER_CONTENT');
  const worldTier = chapter.worldTier;
  const context = { chapterId: state.chapter.chapterId, worldTier,
    shopKind: facility.shop!.kind, townLevel: currentTownLevel(state, index), flags: [] };
  return { instanceKey: shopKey, nameKey: facility.nameKey, facilityKind: facility.kind,
    layoutKey, buildingId: facility.buildingId,
    definition: shopDefinition(template, shopKey, state.chapter.chapterId), context,
    state: stored ?? initialState(template, shopKey, state.chapter.clock.dayIndex),
    persisted: stored !== undefined };
}

export function shopItem(content: CoreContent, itemId: string): ItemDef | undefined {
  return contentIndex(content).items.get(itemId);
}

export function shopPricing(
  state: Readonly<GameState>, content: CoreContent, item: ItemDef,
) {
  const table = contentIndex(content).priceTable;
  if (table === undefined) throw new TypeError('SHOP_PRICE_TABLE');
  return pricingForItem(state, item, table);
}

export function shopItems(
  content: CoreContent, shop: ResolvedShop, inventoryItemIds: readonly string[] = [],
): readonly ItemDef[] {
  const index = contentIndex(content);
  const ids = new Set(shop.definition.supply.map((row) => row.itemId));
  for (const itemId of inventoryItemIds) ids.add(itemId);
  return [...ids].map((itemId) => {
    const item = index.items.get(itemId);
    if (item === undefined) throw new TypeError('SHOP_ITEM_UNKNOWN');
    return item;
  });
}

function restocked(
  state: Readonly<GameState>, content: CoreContent, shop: ResolvedShop,
): ShopState {
  return new ShopRuntime(shop.definition, shop.state, shopItems(content, shop), shop.context)
    .restock(state.chapter.clock).shop;
}

export function materializeShop(
  state: Readonly<GameState>, content: CoreContent, shopKey: string,
): ResolvedShop | null {
  const shop = resolveShop(state, content, shopKey);
  return shop === null ? null : { ...shop, state: restocked(state, content, shop) };
}

export function queryShop(
  state: Readonly<GameState>, content: CoreContent, shopKey: string,
): ShopView {
  const shop = materializeShop(state, content, shopKey);
  if (shop === null) throw new RangeError('SHOP_UNKNOWN');
  const stock = new Map(shop.state.stock.map((entry) => [entry.itemId, entry]));
  const supplies = new Map(shop.definition.supply.map((entry) => [entry.itemId, entry]));
  const offers: ShopView['offers'][number][] = [];
  let nextRestockDay = Number.MAX_SAFE_INTEGER;
  for (const supply of shop.definition.supply) {
    const stored = stock.get(supply.itemId);
    if (stored !== undefined) nextRestockDay = Math.min(nextRestockDay,
      stored.lastRestockDay + supply.restockEveryDays);
  }
  for (const supply of shop.definition.supply) {
    const item = shopItem(content, supply.itemId);
    if (item === undefined) throw new TypeError('SHOP_ITEM_UNKNOWN');
    const pricing = shopPricing(state, content, item);
    if (pricing === null) continue;
    const rowState = stock.get(item.id);
    if (rowState === undefined) throw new TypeError('SHOP_STOCK_MISSING');
    const runtime = new ShopRuntime({ ...shop.definition, supply: [supply] },
      { shopKey: shop.instanceKey, stock: [rowState] }, [item], shop.context);
    const offer = runtime.offer(item.id, pricing, state.chapter.clock);
    if (offer === undefined) continue;
    const total = calculateShopBuyPrice(pricing, supply.priceBp, shop.context.shopKind);
    offers.push({ itemId: item.id, stock: stock.get(item.id)?.count ?? 0,
      unitBuyPrice: total, maxGrade: offer.maxGrade,
      reason: offer.count <= 0 ? 'SHOP_STOCK_INSUFFICIENT'
        : state.party.money < total ? 'SHOP_MONEY_INSUFFICIENT' : null });
  }
  const supplied = new Set(offers.map((entry) => entry.itemId));
  const buys: ShopView['buys'][number][] = [];
  for (const stack of state.party.inventory.stacks) {
    if (!supplied.has(stack.itemId)) continue;
    const item = shopItem(content, stack.itemId)!;
    const pricing = shopPricing(state, content, item);
    const supply = supplies.get(stack.itemId);
    if (pricing !== null && supply !== undefined) buys.push({ itemId: stack.itemId, owned: stack.count,
      unitSellPrice: calculateShopSellPrice(pricing, supply.priceBp, shop.context.shopKind) });
  }
  offers.sort((left, right) => compareCodePoints(left.itemId, right.itemId));
  buys.sort((left, right) => compareCodePoints(left.itemId, right.itemId));
  return { instanceKey: shop.instanceKey, nameKey: shop.nameKey,
    facilityKind: shop.facilityKind, money: state.party.money,
    nextRestockDay: nextRestockDay === Number.MAX_SAFE_INTEGER
      ? state.chapter.clock.dayIndex : nextRestockDay, offers, buys };
}
