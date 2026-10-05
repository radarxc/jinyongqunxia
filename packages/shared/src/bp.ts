export const BP_SCALE = 10_000;

function assertSafeInteger(value: number, code: string): void {
  if (!Number.isSafeInteger(value)) throw new RangeError(code);
}

export function clampInt(value: number, min: number, max: number): number {
  assertSafeInteger(value, 'INT_REQUIRED');
  assertSafeInteger(min, 'INT_REQUIRED');
  assertSafeInteger(max, 'INT_REQUIRED');
  if (min > max) throw new RangeError('INVALID_RANGE');
  return Math.min(max, Math.max(min, value));
}

export function mulDivFloor(value: number, multiplier: number, divisor: number): number {
  assertSafeInteger(value, 'INT_REQUIRED');
  assertSafeInteger(multiplier, 'INT_REQUIRED');
  assertSafeInteger(divisor, 'INT_REQUIRED');
  if (value < 0 || multiplier < 0 || divisor <= 0) throw new RangeError('MULDIV_DOMAIN');
  const result = Number((BigInt(value) * BigInt(multiplier)) / BigInt(divisor));
  if (!Number.isSafeInteger(result)) throw new RangeError('INT_OVERFLOW');
  return result;
}

export const mulBpFloor = (value: number, bp: number): number => mulDivFloor(value, bp, BP_SCALE);
