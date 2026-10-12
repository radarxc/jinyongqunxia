import { describe, expect, it } from 'vitest';
import { fnv1a32, SALT, seedFor, splitmix32 } from '../rng';

describe('town plan deterministic random streams', () => {
  it.each([
    ['', 0x811c9dc5],
    ['a', 0xe40c292c],
    ['hello', 0x4f9f2cab],
    ['foobar', 0xbf9cf968],
  ])('matches the FNV-1a vector for %j', (text, expected) => {
    expect(fnv1a32(text)).toBe(expected);
  });

  it('derives the building seed from scene/id', () => {
    expect(seedFor('sc_01_town_dali', 'bi_0001'))
      .toBe(fnv1a32('sc_01_town_dali/bi_0001'));
  });

  it('keeps named substreams deterministic and distinct', () => {
    const seed = 0x12345678;
    const streams = Object.values(SALT).map((salt) => splitmix32(seed ^ salt));
    expect(streams).toEqual(Object.values(SALT).map((salt) => splitmix32(seed ^ salt)));
    expect(new Set(streams).size).toBe(streams.length);
  });
});
