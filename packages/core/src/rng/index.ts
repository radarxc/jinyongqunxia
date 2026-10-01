import { clampInt } from '@tianshu/shared';

export const RNG_STREAMS = ['battle', 'loot', 'world', 'ai', 'qiyu'] as const;
export const RNG_PROTOCOL = 2;
export type RngStreamName = (typeof RNG_STREAMS)[number];
export type RngState = readonly [number, number, number, number];
type MutableRngState = [number, number, number, number];

export interface Rng {
  nextU32(): number;
  snapshot(): RngState;
}

export function seedStream(master: number, stream: RngStreamName): RngState {
  let hash = master >>> 0;
  for (let index = 0; index < stream.length; index += 1) {
    hash = Math.imul(hash ^ stream.charCodeAt(index), 0x9e3779b1) >>> 0;
  }
  const splitmix32 = (): number => {
    hash = (hash + 0x9e3779b9) >>> 0;
    let mixed = hash;
    mixed = Math.imul(mixed ^ (mixed >>> 16), 0x85ebca6b) >>> 0;
    mixed = Math.imul(mixed ^ (mixed >>> 13), 0xc2b2ae35) >>> 0;
    return (mixed ^ (mixed >>> 16)) >>> 0;
  };
  return [splitmix32(), splitmix32(), splitmix32(), splitmix32()];
}

export function createRng(initialState: RngState): Rng {
  const state: MutableRngState = [...initialState];
  return {
    nextU32(): number {
      const result = (((state[0] + state[1]) >>> 0) + state[3]) >>> 0;
      state[3] = (state[3] + 1) >>> 0;
      state[0] = (state[1] ^ (state[1] >>> 9)) >>> 0;
      state[1] = (state[2] + (state[2] << 3)) >>> 0;
      state[2] = ((state[2] << 21) | (state[2] >>> 11)) >>> 0;
      state[2] = (state[2] + result) >>> 0;
      return result;
    },
    snapshot: () => [...state],
  };
}

function assertSafeInt(value: number): void {
  if (!Number.isSafeInteger(value)) throw new RangeError('RNG_INT');
}

function multiplyHighU32(left: number, right: number): number {
  // Each half-word product is below 2^32; carry sums stay exact safe integers.
  const leftLow = left & 0xffff;
  const leftHigh = left >>> 16;
  const rightLow = right & 0xffff;
  const rightHigh = right >>> 16;
  const lowProduct = Math.imul(leftLow, rightLow) >>> 0;
  const highLowProduct = Math.imul(leftHigh, rightLow) >>> 0;
  const lowHighProduct = Math.imul(leftLow, rightHigh) >>> 0;
  const highProduct = Math.imul(leftHigh, rightHigh) >>> 0;
  const middleCarry = (lowProduct >>> 16) + (highLowProduct & 0xffff) + (lowHighProduct & 0xffff);

  return highProduct + (highLowProduct >>> 16) + (lowHighProduct >>> 16) + (middleCarry >>> 16);
}

export function intInclusive(rng: Rng, low: number, high: number): number {
  assertSafeInt(low);
  assertSafeInt(high);
  if (high < low) throw new RangeError('RNG_RANGE');
  const span = high - low + 1;
  if (!Number.isSafeInteger(span) || span < 1 || span > 0x1_0000_0000) {
    throw new RangeError('RNG_SPAN');
  }
  const sample = rng.nextU32();
  return low + (span === 0x1_0000_0000 ? sample : multiplyHighU32(sample, span));
}

export function chanceBp(rng: Rng, chance: number): boolean {
  const bp = clampInt(chance, 0, 10_000);
  return rng.nextU32() % 10_000 < bp;
}
