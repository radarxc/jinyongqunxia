import { describe, expect, it } from 'vitest';
import { formatWen, maxAffordable } from './money';

describe('formatWen', () => {
  it.each([
    [0, '0 文'],
    [999, '999 文'],
    [1000, '1 两'],
    [44_977, '44 两 977 文'],
  ])('formats %i wen as %s', (wen, expected) => {
    expect(formatWen(wen)).toBe(expected);
  });

  it('rejects negative and non-integer amounts', () => {
    expect(() => formatWen(-1)).toThrow(RangeError);
    expect(() => formatWen(1.5)).toThrow(RangeError);
  });
});

describe('maxAffordable', () => {
  it('is bounded by both whole-unit affordability and stock', () => {
    expect(maxAffordable(999, 1000, 8)).toBe(0);
    expect(maxAffordable(2500, 1000, 8)).toBe(2);
    expect(maxAffordable(20_000, 1000, 3)).toBe(3);
    expect(maxAffordable(20_000, 1000, 0)).toBe(0);
  });

  it('rejects invalid money, price and stock values', () => {
    expect(() => maxAffordable(-1, 1, 1)).toThrow(RangeError);
    expect(() => maxAffordable(1, 0, 1)).toThrow(RangeError);
    expect(() => maxAffordable(1, 1, -1)).toThrow(RangeError);
  });
});
