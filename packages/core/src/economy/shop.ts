import { BP_SCALE, clampInt, compareCodePoints, floorDivInt } from '@tianshu/shared';
import type { ShopDef } from '@tianshu/data/schemas';
import type { GameClock, ShopState, ShopStockState } from '../state';
import { InventoryRuntime, type InventoryItemDef } from './inventory';
import type {
  EconomyEvent, ShopContext, ShopOffer, ShopPricing, ShopRestockResult,
  ShopTransactionInput, ShopTransactionResult, WorldTier,
} from './types';

export type ShopConditionEvaluator = (
  condition: Readonly<Record<string, unknown>>, context: ShopContext,
) => boolean;

const TIER_CAP: Readonly<Record<WorldTier, Readonly<Record<ShopContext['shopKind'], number>>>> = {
  HIGH: { normal: 6, famous: 7, blackMarket: 7 },
  MID: { normal: 5, famous: 6, blackMarket: 7 },
  LOW: { normal: 4, famous: 5, blackMarket: 6 },
};
const SHOP_BP: Readonly<Record<ShopContext['shopKind'], number>> = {
  normal: BP_SCALE, famous: 9000, blackMarket: 12500,
};
const OUTLET_BP: Readonly<Record<ShopContext['shopKind'], number>> = {
  normal: BP_SCALE, famous: BP_SCALE, blackMarket: 8000,
};

function positiveInt(value: number, code: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) throw new TypeError(code);
}

/** Integer form of floor(1.5 + (townLevel - 1) * 11 / 49). */
export function mainGradeForTown(townLevel: number): number {
  if (!Number.isSafeInteger(townLevel) || townLevel < 1 || townLevel > 50)
    throw new RangeError('SHOP_TOWN_LEVEL');
  return clampInt(floorDivInt(147 + 22 * (townLevel - 1), 98), 1, 12);
}

export function shopGradeCap(context: ShopContext): number {
  return Math.min(TIER_CAP[context.worldTier][context.shopKind],
    mainGradeForTown(context.townLevel));
}

function floorBigInt(numerator: bigint, denominator: bigint): bigint {
  let quotient = 0n;
  let remainder = numerator;
  let divisor = denominator;
  let unit = 1n;
  while ((divisor << 1n) <= remainder) { divisor <<= 1n; unit <<= 1n; }
  while (unit > 0n) {
    if (divisor <= remainder) { remainder -= divisor; quotient += unit; }
    divisor >>= 1n; unit >>= 1n;
  }
  return quotient;
}

/** Multiply every basis-point factor exactly, then round half-up to the nearest 10 wen. */
function roundBpProductToTen(value: number, factors: readonly number[]): number {
  let numerator = BigInt(value);
  let denominator = 1n;
  for (const factor of factors) {
    if (!Number.isSafeInteger(factor) || factor < 0) throw new RangeError('SHOP_PRICE_BP');
    numerator *= BigInt(factor);
    denominator *= BigInt(BP_SCALE);
  }
  const result = Number(floorBigInt(numerator + 5n * denominator, 10n * denominator) * 10n);
  if (!Number.isSafeInteger(result)) throw new RangeError('SHOP_PRICE_OVERFLOW');
  return result;
}

function validatePricing(pricing: ShopPricing): void {
  if (!Number.isSafeInteger(pricing.referencePrice) || pricing.referencePrice < 0)
    throw new RangeError('SHOP_REFERENCE_PRICE');
  if (!Number.isSafeInteger(pricing.charisma) || pricing.charisma < 0 || pricing.charisma > 100
    || !Number.isSafeInteger(pricing.speech) || pricing.speech < 0 || pricing.speech > 100)
    throw new RangeError('SHOP_NEGOTIATION_RANGE');
}

export function calculateBuyPrice(
  pricing: ShopPricing, supplyPriceBp: number, shopKind: ShopContext['shopKind'],
): number {
  validatePricing(pricing);
  return roundBpProductToTen(pricing.referencePrice, [
    11500 - 30 * pricing.charisma, 10000 - 10 * pricing.speech,
    pricing.shopBp ?? SHOP_BP[shopKind], pricing.chapterPriceBp ?? BP_SCALE,
    pricing.marketBp ?? BP_SCALE, supplyPriceBp,
  ]);
}

export function calculateSellPrice(
  pricing: ShopPricing, supplyPriceBp: number, shopKind: ShopContext['shopKind'],
): number {
  validatePricing(pricing);
  return roundBpProductToTen(pricing.referencePrice, [3500 + 15 * pricing.charisma,
    pricing.outletBp ?? OUTLET_BP[shopKind], pricing.marketBp ?? BP_SCALE,
    pricing.saturationBp ?? BP_SCALE, supplyPriceBp,
  ]);
}

export class ShopRuntime {
  readonly #def: ShopDef;
  readonly #context: ShopContext;
  readonly #condition: ShopConditionEvaluator | undefined;
  readonly #items = new Map<string, InventoryItemDef>();
  readonly #supply = new Map<string, ShopDef['supply'][number]>();
  readonly #stock = new Map<string, ShopStockState>();

  constructor(definition: ShopDef, state: ShopState, items: readonly InventoryItemDef[],
    context: ShopContext, condition?: ShopConditionEvaluator) {
    if (definition.key !== state.shopKey) throw new TypeError('SHOP_STATE_KEY');
    if (definition.chapterId !== context.chapterId) throw new RangeError('SHOP_CHAPTER');
    this.#def = definition; this.#context = context; this.#condition = condition;
    for (const item of items) {
      if (this.#items.has(item.id)) throw new TypeError('SHOP_ITEM_DEF_DUPLICATE');
      this.#items.set(item.id, item);
    }
    for (const row of definition.supply) {
      if (this.#supply.has(row.itemId)) throw new TypeError('SHOP_SUPPLY_DUPLICATE');
      if (!this.#items.has(row.itemId)) throw new RangeError('SHOP_ITEM_UNKNOWN');
      this.#supply.set(row.itemId, row);
    }
    for (const row of state.stock) {
      if (this.#stock.has(row.itemId)) throw new TypeError('SHOP_STOCK_DUPLICATE');
      if (!this.#supply.has(row.itemId) || !Number.isSafeInteger(row.count) || row.count < 0
        || !Number.isSafeInteger(row.lastRestockDay) || row.lastRestockDay < 0)
        throw new TypeError('SHOP_STOCK_INVALID');
      this.#stock.set(row.itemId, { ...row });
    }
    if (this.#stock.size !== this.#supply.size) throw new TypeError('SHOP_STOCK_MISSING');
  }

  private available(itemId: string): boolean {
    const row = this.#supply.get(itemId);
    const item = this.#items.get(itemId);
    if (row === undefined || item === undefined || item.grade === null
      || item.grade > row.maxGrade || item.grade > shopGradeCap(this.#context)) return false;
    return row.condition === undefined || (this.#condition?.(row.condition, this.#context) ?? false);
  }

  restock(clock: GameClock): ShopRestockResult {
    if (!Number.isSafeInteger(clock.dayIndex) || clock.dayIndex < 0)
      throw new RangeError('SHOP_CLOCK_DAY');
    const updates: [string, ShopStockState][] = [];
    for (const [itemId, stock] of this.#stock) {
      const supply = this.#supply.get(itemId)!;
      if (clock.dayIndex < stock.lastRestockDay) throw new RangeError('SHOP_CLOCK_REWIND');
      const periods = floorDivInt(clock.dayIndex - stock.lastRestockDay, supply.restockEveryDays);
      if (periods <= 0) continue;
      const amount = periods * supply.restockAmount;
      if (!Number.isSafeInteger(amount)) throw new RangeError('SHOP_STOCK_OVERFLOW');
      const lastRestockDay = stock.lastRestockDay + periods * supply.restockEveryDays;
      if (!Number.isSafeInteger(lastRestockDay)) throw new RangeError('SHOP_STOCK_OVERFLOW');
      updates.push([itemId, { itemId, count: Math.max(stock.count,
        Math.min(supply.baseStock, stock.count + amount)), lastRestockDay }]);
    }
    for (const [itemId, stock] of updates) this.#stock.set(itemId, stock);
    const events: EconomyEvent[] = updates.length > 0
      ? [{ t: 'economy/shopRestocked', shopKey: this.#def.key, dayIndex: clock.dayIndex }] : [];
    return { shop: this.snapshot(), events };
  }

  offer(itemId: string, pricing: ShopPricing, clock: GameClock): ShopOffer | undefined {
    this.restock(clock);
    if (!this.available(itemId)) return undefined;
    const stock = this.#stock.get(itemId)!;
    const supply = this.#supply.get(itemId)!;
    return { itemId, count: stock.count,
      unitBuyPrice: calculateBuyPrice(pricing, supply.priceBp, this.#context.shopKind),
      maxGrade: Math.min(supply.maxGrade, shopGradeCap(this.#context)),
      nextRestockDay: stock.lastRestockDay + supply.restockEveryDays };
  }

  buy(input: ShopTransactionInput): ShopTransactionResult {
    positiveInt(input.count, 'SHOP_TRANSACTION_COUNT');
    this.restock(input.clock);
    if (!this.available(input.itemId)) throw new RangeError('SHOP_ITEM_UNAVAILABLE');
    const stock = this.#stock.get(input.itemId)!;
    if (stock.count < input.count) throw new RangeError('SHOP_STOCK_INSUFFICIENT');
    const supply = this.#supply.get(input.itemId)!;
    const unit = calculateBuyPrice(input.pricing, supply.priceBp, this.#context.shopKind);
    const total = unit * input.count;
    if (!Number.isSafeInteger(total) || input.money < total) throw new RangeError('SHOP_MONEY_INSUFFICIENT');
    const inventory = new InventoryRuntime(input.inventory, [...this.#items.values()]);
    inventory.add(input.itemId, input.count);
    this.#stock.set(input.itemId, { ...stock, count: stock.count - input.count });
    const event: EconomyEvent = { t: 'economy/shopBought', shopKey: this.#def.key,
      itemId: input.itemId, count: input.count, totalPrice: total };
    return { shop: this.snapshot(), inventory: inventory.snapshot(), money: input.money - total,
      events: [event] };
  }

  sell(input: ShopTransactionInput): ShopTransactionResult {
    positiveInt(input.count, 'SHOP_TRANSACTION_COUNT');
    this.restock(input.clock);
    if (!this.available(input.itemId)) throw new RangeError('SHOP_ITEM_UNAVAILABLE');
    const supply = this.#supply.get(input.itemId)!;
    const unit = calculateSellPrice(input.pricing, supply.priceBp, this.#context.shopKind);
    const total = unit * input.count;
    if (!Number.isSafeInteger(total) || !Number.isSafeInteger(input.money + total))
      throw new RangeError('SHOP_MONEY_OVERFLOW');
    const inventory = new InventoryRuntime(input.inventory, [...this.#items.values()]);
    inventory.remove(input.itemId, input.count);
    const stock = this.#stock.get(input.itemId)!;
    if (!Number.isSafeInteger(stock.count + input.count)) throw new RangeError('SHOP_STOCK_OVERFLOW');
    this.#stock.set(input.itemId, { ...stock, count: stock.count + input.count });
    const event: EconomyEvent = { t: 'economy/shopSold', shopKey: this.#def.key,
      itemId: input.itemId, count: input.count, totalPrice: total };
    return { shop: this.snapshot(), inventory: inventory.snapshot(), money: input.money + total,
      events: [event] };
  }

  snapshot(): ShopState {
    const stock = [...this.#stock.values()].map((entry) => ({ ...entry }));
    stock.sort((left, right) => compareCodePoints(left.itemId, right.itemId));
    return { shopKey: this.#def.key, stock };
  }
}

export function restockShop(
  definition: ShopDef, state: ShopState, items: readonly InventoryItemDef[],
  context: ShopContext, clock: GameClock, condition?: ShopConditionEvaluator,
): ShopRestockResult {
  return new ShopRuntime(definition, state, items, context, condition).restock(clock);
}
