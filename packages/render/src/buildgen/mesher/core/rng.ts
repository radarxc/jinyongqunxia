/**
 * Same frozen salts as the planner (packages/data/src/build/town-plan/rng.ts `SALT`, tech/16 §4.1):
 * a plan seed must derive identical variant / interior / props / visual substreams on both sides.
 */
export const BUILDGEN_RNG_SALTS = {
  variant: 0x6d2b_79f5,
  interior: 0x1b56_c4e9,
  props: 0x85eb_ca6b,
  visual: 0xc2b2_ae35,
} as const;

export function splitmix32(seed: number): number {
  let value = (seed + 0x9e3779b9) | 0;
  value = Math.imul(value ^ (value >>> 16), 0x21f0aaad);
  value = Math.imul(value ^ (value >>> 15), 0x735a2d97);
  return (value ^ (value >>> 15)) >>> 0;
}
export function buildgenSubstream(seed: number, salt: number): number {
  return splitmix32((seed ^ salt) >>> 0);
}
export interface Rng32 {
  nextU32(): number;
  rangeInt(minInclusive: number, maxExclusive: number): number;
}
export function mulberry32(seed: number): Rng32 {
  let state = seed >>> 0;
  const nextU32 = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return (value ^ (value >>> 14)) >>> 0;
  };
  return {
    nextU32,
    rangeInt: (min, max) => {
      if (!Number.isInteger(min) || !Number.isInteger(max) || max <= min)
        throw new RangeError('BUILDGEN_INVALID_RANGE');
      const span = max - min;
      if (span > 0x1_0000_0000) throw new RangeError('BUILDGEN_RANGE_TOO_WIDE');
      const rejectBelow = (0x1_0000_0000 - span) % span;
      let sample = nextU32();
      while (sample < rejectBelow) sample = nextU32();
      return min + (sample % span);
    },
  };
}
