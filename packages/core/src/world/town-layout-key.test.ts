import { describe, expect, it } from 'vitest';
import { townLayoutKey } from './town-layout-key';

describe('town layout key', () => {
  it('names the authored layout from the compiled design spec', () => {
    expect(
      townLayoutKey({
        cityId: 'city_dali',
        chapterId: 'ch01',
        source: { spec: 'docs/design/town/city_dali__ch01.yaml' },
      }),
    ).toBe('city_dali__ch01');
  });

  it('keeps the authored layout when a borrowed runtime is re-identified', () => {
    // The dev build serves ch10 Dali from the ch01 runtime, rewriting cityId and chapterId only.
    expect(
      townLayoutKey({
        cityId: 'city_dali',
        chapterId: 'ch10',
        source: { spec: 'docs/design/town/city_dali__ch01.yaml' },
      }),
    ).toBe('city_dali__ch01');
  });

  it.each([
    ['without a source', { cityId: 'city_bus_a', chapterId: 'ch01' }],
    [
      'with a fixture spec',
      { cityId: 'city_bus_a', chapterId: 'ch01', source: { spec: 'fixture' } },
    ],
    [
      'with a spec that is not a layout file',
      { cityId: 'city_bus_a', chapterId: 'ch01', source: { spec: 'docs/design/town/schema.yaml' } },
    ],
  ] as const)('falls back to cityId__chapterId %s', (_name, town) => {
    expect(townLayoutKey(town)).toBe('city_bus_a__ch01');
  });
});
