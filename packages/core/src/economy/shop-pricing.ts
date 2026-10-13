import type { ItemDef, PriceTableDef } from '@tianshu/data/schemas';
import type { GameState } from '../state';
import type { ShopPricing } from './types';
import type { ShopKind } from './types';
import { floorDivInt } from '@tianshu/shared';
import { calculateBuyPrice, calculateSellPrice } from './shop';

type PriceItem = Pick<ItemDef, 'grade' | 'kind' | 'price'>;

export function resolveReferencePrice(item: PriceItem, table: PriceTableDef): number | null {
  if (item.price === null) return null;
  if (typeof item.price === 'number') return item.price;
  if (item.grade === null) return null;
  const categoryId = table.itemKindToCategory[item.kind];
  if (categoryId === undefined) throw new TypeError('SHOP_PRICE_CATEGORY');
  const category = table.categories.find((entry) => entry.id === categoryId);
  if (category === undefined) throw new TypeError('SHOP_PRICE_CATEGORY');
  const price = category.byGrade[item.grade - 1];
  if (price === undefined || !Number.isSafeInteger(price) || price < 0)
    throw new TypeError('SHOP_PRICE_GRADE');
  return price === 0 ? null : price;
}

function protagonistSpeech(state: Readonly<GameState>): number {
  const protagonist = state.profile.protagonist as
    (NonNullable<GameState['profile']['protagonist']> & { readonly speech?: number }) | null;
  const value = protagonist?.speech ?? 0;
  if (!Number.isSafeInteger(value) || value < 0 || value > 100)
    throw new RangeError('SHOP_NEGOTIATION_RANGE');
  return value;
}

export function pricingForItem(
  state: Readonly<GameState>, item: PriceItem, table: PriceTableDef,
): ShopPricing | null {
  const referencePrice = resolveReferencePrice(item, table);
  if (referencePrice === null) return null;
  const charisma = state.profile.protagonist?.innate.cha ?? 0;
  return { referencePrice, charisma, speech: protagonistSpeech(state) };
}

function shopRuntimePricing(pricing: ShopPricing): ShopPricing {
  const referencePrice = pricing.referencePrice * 10;
  if (!Number.isSafeInteger(referencePrice)) throw new RangeError('SHOP_PRICE_OVERFLOW');
  return { ...pricing, referencePrice };
}

/** Reuses the legacy round-to-ten calculation at deci-wen scale to obtain integer-wen prices. */
export function calculateShopBuyPrice(
  pricing: ShopPricing, supplyPriceBp: number, shopKind: ShopKind,
): number {
  return floorDivInt(calculateBuyPrice(shopRuntimePricing(pricing), supplyPriceBp, shopKind), 10);
}

/** Reuses the legacy round-to-ten calculation at deci-wen scale to obtain integer-wen prices. */
export function calculateShopSellPrice(
  pricing: ShopPricing, supplyPriceBp: number, shopKind: ShopKind,
): number {
  return floorDivInt(calculateSellPrice(shopRuntimePricing(pricing), supplyPriceBp, shopKind), 10);
}
