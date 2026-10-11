import type { FacilityKind } from '@tianshu/data/schemas';

export type ShopCommand =
  | { readonly t: 'shop/buy'; readonly shopKey: string; readonly itemId: string;
      readonly count: number; readonly expectedUnitPrice: number }
  | { readonly t: 'shop/sell'; readonly shopKey: string; readonly itemId: string;
      readonly count: number; readonly expectedUnitPrice: number };

export type ShopRejectReason =
  | 'SHOP_UNKNOWN' | 'SHOP_NOT_HERE' | 'SHOP_CLOSED' | 'SHOP_ITEM_UNAVAILABLE'
  | 'SHOP_STOCK_INSUFFICIENT' | 'SHOP_MONEY_INSUFFICIENT' | 'SHOP_PRICE_STALE'
  | 'SHOP_INVENTORY_FULL' | 'SHOP_BUSY';

export interface ShopView {
  readonly instanceKey: string; readonly nameKey: string; readonly facilityKind: FacilityKind;
  readonly money: number; readonly nextRestockDay: number;
  readonly offers: readonly { readonly itemId: string; readonly stock: number;
    readonly unitBuyPrice: number; readonly maxGrade: number;
    readonly reason: null | 'SHOP_STOCK_INSUFFICIENT' | 'SHOP_MONEY_INSUFFICIENT' }[];
  readonly buys: readonly { readonly itemId: string; readonly owned: number;
    readonly unitSellPrice: number }[];
}
