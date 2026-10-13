import { describe, expect, it } from 'vitest';
import { calculateShopBuyPrice, calculateShopSellPrice, resolveReferencePrice }
  from './shop-pricing';
import { shopContent } from './__fixtures__/shop-fixture';

describe('shop pricing', () => {
  it('QST-T21 resolves the 46,851.2-wen reference and buys for 44,977 wen', () => {
    const pricing = { referencePrice: 46_851, charisma: 50, speech: 40 };
    expect(calculateShopBuyPrice(pricing, 10_000, 'normal')).toBe(44_977);
  });

  it('QST-T22 sells the same item for 19,912 wen', () => {
    const pricing = { referencePrice: 46_851, charisma: 50, speech: 40 };
    expect(calculateShopSellPrice(pricing, 10_000, 'normal')).toBe(19_912);
  });

  it('resolves auto prices by item kind and grade and keeps numeric prices', () => {
    const table = shopContent().priceTables![0]!;
    expect(resolveReferencePrice({ price: 'auto', kind: 'material', grade: 5 }, table))
      .toBe(46_851);
    expect(resolveReferencePrice({ price: 123, kind: 'material', grade: 5 }, table)).toBe(123);
    expect(resolveReferencePrice({ price: null, kind: 'material', grade: 5 }, table)).toBeNull();
  });

  it('treats a zero auto-table cell as unavailable but keeps numeric zero', () => {
    const table = shopContent().priceTables![0]!;
    expect(resolveReferencePrice({ price: 'auto', kind: 'material', grade: 1 }, table)).toBeNull();
    expect(resolveReferencePrice({ price: 0, kind: 'material', grade: 1 }, table)).toBe(0);
  });
});
