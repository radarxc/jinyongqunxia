import { describe, expect, it } from 'vitest';
import { chanceBp, createCore, createRng, intInclusive, seedStream } from './index';

describe('deterministic RNG protocol', () => {
  it.each([
    [
      'battle',
      [410886986, 3948248343, 382199180, 4192204983],
      [4256373016, 2986861133, 4029091281, 3160275602],
    ],
    [
      'loot',
      [4115970839, 3352329225, 1349892310, 292111708],
      [3465444476, 2906675482, 433035362, 4145665435],
    ],
    [
      'world',
      [3203807750, 1498997830, 4207607716, 3767632768],
      [4175471052, 187222137, 190563775, 801057572],
    ],
    [
      'ai',
      [3247949964, 3666686332, 38919984, 3728629043],
      [2053330747, 3456085448, 1453962039, 622417602],
    ],
    [
      'qiyu',
      [1852199331, 2694540512, 859364783, 1535345410],
      [1787117957, 3377360768, 1273374054, 1195569528],
    ],
  ] as const)('matches the seed-1 %s vector', (stream, initial, expected) => {
    expect(seedStream(1, stream)).toEqual(initial);
    const rng = createRng(initial);
    expect(expected.map(() => rng.nextU32())).toEqual(expected);
  });

  it('consumes exactly one word for inclusive ranges and chance endpoints', () => {
    const first = createRng([1, 2, 3, 4]);
    expect(intInclusive(first, 7, 7)).toBe(7);
    const afterRange = first.snapshot();
    const zero = createRng([1, 2, 3, 4]);
    expect(chanceBp(zero, 0)).toBe(false);
    expect(zero.snapshot()).toEqual(afterRange);
    const certain = createRng([1, 2, 3, 4]);
    expect(chanceBp(certain, 10_000)).toBe(true);
    expect(certain.snapshot()).toEqual(afterRange);
  });

  it('rejects unsafe or inverted integer ranges before consuming RNG', () => {
    const rng = createRng([1, 2, 3, 4]);
    expect(() => intInclusive(rng, 2, 1)).toThrow('RNG_RANGE');
    expect(() => intInclusive(rng, 0.5, 1)).toThrow('RNG_INT');
    expect(() => intInclusive(rng, 0, 0x1_0000_0000)).toThrow('RNG_SPAN');
    expect(rng.snapshot()).toEqual([1, 2, 3, 4]);
  });
});

describe('createCore', () => {
  it('advances one deterministic tick and returns detached snapshots', () => {
    const core = createCore(1);
    const first = core.tick();
    const second = core.tick();
    expect(first).toMatchObject({ accepted: true, events: [{ seq: 1, worldTick: 1 }] });
    expect(second).toMatchObject({ accepted: true, events: [{ seq: 2, worldTick: 2 }] });
    const snapshot = core.snapshot() as unknown as { meta: { rng: { battle: number[] } } };
    snapshot.meta.rng.battle[0] = 0;
    expect(core.snapshot().meta.rng.battle[0]).toBe(410886986);
  });
});
