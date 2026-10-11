import { describe, expect, it } from 'vitest';
import { MeshBufferBuilder } from './mesher/core/buffer';
import { hashMesh } from './mesher/core/hash';
import { BUILDGEN_RNG_SALTS, buildgenSubstream, mulberry32, splitmix32 } from './mesher/core/rng';

function meshAt(x: number) {
  const builder = new MeshBufferBuilder();
  builder.addVertex({ position: [x, 0, 0], normal: [0, 1, 0] });
  return builder.finish();
}
describe('buildgen deterministic helpers', () => {
  it('hashes identical input equally and notices one changed vertex', () => {
    expect(hashMesh(meshAt(1))).toBe(hashMesh(meshAt(1)));
    expect(hashMesh(meshAt(1))).not.toBe(hashMesh(meshAt(1.001)));
  });
  it('quantizes positions to 0.1 mm before FNV-1a', () => {
    expect(hashMesh(meshAt(1.000_001))).toBe(hashMesh(meshAt(1.000_004)));
    expect(hashMesh(meshAt(1.000_001))).not.toBe(hashMesh(meshAt(1.000_06)));
  });
  it('derives the same named substreams as the planner (frozen salts, tech/16 §4.1)', () => {
    expect(BUILDGEN_RNG_SALTS).toEqual({
      variant: 0x6d2b_79f5,
      interior: 0x1b56_c4e9,
      props: 0x85eb_ca6b,
      visual: 0xc2b2_ae35,
    });
    // Golden vectors computed with packages/data/src/build/town-plan/rng.ts:
    // splitmix32(seed ^ SALT[name]); 0x842ebb67 = seedFor('sc_01_town_dali', 'bi_0001').
    const vectors = {
      0x1234_5678: {
        variant: 0x95d0_c47f,
        interior: 0x6086_8e78,
        props: 0x465d_fe4c,
        visual: 0x38c1_341b,
      },
      0x842e_bb67: {
        variant: 0x1b2e_0ba6,
        interior: 0x1070_3924,
        props: 0x8bb2_9be2,
        visual: 0x5cba_175b,
      },
    } as const;
    for (const [seed, expected] of Object.entries(vectors))
      for (const [name, value] of Object.entries(expected))
        expect(
          buildgenSubstream(
            Number(seed),
            BUILDGEN_RNG_SALTS[name as keyof typeof BUILDGEN_RNG_SALTS],
          ),
        ).toBe(value);
  });
  it('uses independent reproducible splitmix32/mulberry32 substreams', () => {
    expect(splitmix32(123)).toBe(splitmix32(123));
    const variant = buildgenSubstream(123, BUILDGEN_RNG_SALTS.variant);
    expect(variant).not.toBe(buildgenSubstream(123, BUILDGEN_RNG_SALTS.props));
    const left = mulberry32(variant);
    const right = mulberry32(variant);
    expect([left.nextU32(), left.nextU32(), left.rangeInt(3, 10)]).toEqual([
      right.nextU32(),
      right.nextU32(),
      right.rangeInt(3, 10),
    ]);
  });
  it('maps fixed vectors into integer ranges without floating-point random values', () => {
    const rng = mulberry32(123);
    expect([rng.nextU32(), rng.nextU32(), rng.nextU32()]).toEqual([
      3_381_219_976, 766_838_775, 2_127_363_934,
    ]);
    const left = mulberry32(123);
    const right = mulberry32(123);
    const leftValues = Array.from({ length: 1_000 }, () => left.rangeInt(-3, 4));
    expect(leftValues.every((value) => Number.isInteger(value) && value >= -3 && value < 4)).toBe(
      true,
    );
    expect(leftValues).toEqual(Array.from({ length: 1_000 }, () => right.rangeInt(-3, 4)));
  });
});
