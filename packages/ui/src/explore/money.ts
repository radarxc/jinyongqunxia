function assertNonNegativeInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative safe integer`);
  }
}

export function formatWen(wen: number): string {
  assertNonNegativeInteger(wen, 'wen');
  const liang = Math.floor(wen / 1000);
  const remainder = wen % 1000;
  if (liang === 0) return `${remainder} 文`;
  return remainder === 0 ? `${liang} 两` : `${liang} 两 ${remainder} 文`;
}

export function maxAffordable(moneyWen: number, unitPriceWen: number, stock: number): number {
  assertNonNegativeInteger(moneyWen, 'moneyWen');
  assertNonNegativeInteger(stock, 'stock');
  if (!Number.isSafeInteger(unitPriceWen) || unitPriceWen <= 0) {
    throw new RangeError('unitPriceWen must be a positive safe integer');
  }
  return Math.min(stock, Math.floor(moneyWen / unitPriceWen));
}
