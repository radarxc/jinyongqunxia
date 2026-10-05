function assertSafeInteger(value: number): void {
  if (!Number.isSafeInteger(value)) throw new RangeError('INT_DIV_INTEGER_REQUIRED');
}

function operands(dividend: number, divisor: number): readonly [bigint, bigint] {
  assertSafeInteger(dividend);
  assertSafeInteger(divisor);
  if (divisor === 0) throw new RangeError('INT_DIV_ZERO');
  return [BigInt(dividend), BigInt(divisor)];
}

/** Exact mathematical floor for safe-integer operands. */
export function floorDivInt(dividend: number, divisor: number): number {
  const [numerator, denominator] = operands(dividend, divisor);
  let quotient = numerator / denominator;
  const remainder = numerator % denominator;
  if (remainder !== 0n && (remainder < 0n) !== (denominator < 0n)) quotient -= 1n;
  return Number(quotient);
}

/** Exact mathematical ceiling for safe-integer operands. */
export function ceilDivInt(dividend: number, divisor: number): number {
  const [numerator, denominator] = operands(dividend, divisor);
  let quotient = numerator / denominator;
  const remainder = numerator % denominator;
  if (remainder !== 0n && (remainder < 0n) === (denominator < 0n)) quotient += 1n;
  return Number(quotient);
}
