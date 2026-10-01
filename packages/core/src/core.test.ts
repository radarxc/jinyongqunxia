/// <reference types="node" />
// eslint-disable-next-line no-restricted-imports -- Test-only SHA-256 oracle; core runtime stays platform-neutral.
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import protocolGolden from './rng/rng-protocol-v2.golden.json';
import {
  chanceBp,
  createCore,
  createRng,
  intInclusive,
  RNG_PROTOCOL,
  RNG_STREAMS,
  seedStream,
  type Rng,
} from './index';

function constantRng(value: number): Rng & { calls(): number } {
  let callCount = 0;
  return {
    nextU32: () => {
      callCount += 1;
      return value;
    },
    snapshot: () => [0, 0, 0, 0],
    calls: () => callCount,
  };
}

describe('deterministic RNG protocol', () => {
  it('uses RNG protocol 2 for integer multiply-high range mapping', () => {
    expect(RNG_PROTOCOL).toBe(protocolGolden.rngProtocol);
  });

  it.each(RNG_STREAMS)('matches the seed-1 %s vector', (stream) => {
    const fixture = protocolGolden.streams[stream];
    const initial = fixture.initialState as [number, number, number, number];
    const expected = fixture.nextU32;
    expect(seedStream(protocolGolden.masterSeed, stream)).toEqual(initial);
    const rng = createRng(initial);
    expect(expected.map(() => rng.nextU32())).toEqual(expected);
  });

  it.each(protocolGolden.intInclusive)(
    'maps sample $sample into [$low, $high] exactly with one word',
    ({ sample, low, high, result }) => {
      const rng = constantRng(sample);
      expect(intInclusive(rng, low, high)).toBe(result);
      expect(rng.calls()).toBe(1);
    },
  );

  it('consumes exactly one word for chance endpoints', () => {
    const first = createRng([1, 2, 3, 4]);
    first.nextU32();
    const afterRange = first.snapshot();
    const zero = createRng([1, 2, 3, 4]);
    expect(chanceBp(zero, 0)).toBe(false);
    expect(zero.snapshot()).toEqual(afterRange);
    const certain = createRng([1, 2, 3, 4]);
    expect(chanceBp(certain, 10_000)).toBe(true);
    expect(certain.snapshot()).toEqual(afterRange);
  });

  it('keeps a 100,000-sample ten-bucket smoke distribution within 2 percent', () => {
    const fixture = protocolGolden.distributionSmoke;
    expect(fixture.stream).toBe('battle');
    const rng = createRng(seedStream(fixture.masterSeed, 'battle'));
    const counts = Array.from({ length: fixture.high - fixture.low + 1 }, () => 0);
    for (let sample = 0; sample < fixture.samples; sample += 1) {
      const bucket = intInclusive(rng, fixture.low, fixture.high);
      const bucketIndex = bucket - fixture.low;
      counts[bucketIndex] = (counts[bucketIndex] ?? 0) + 1;
    }
    expect(counts).toEqual(fixture.counts);
    for (const count of counts) {
      expect(Math.abs(count - fixture.expectedPerBucket)).toBeLessThan(
        fixture.maxDeviationExclusive,
      );
    }
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
    expect(core.snapshot().meta.rngProtocol).toBe(RNG_PROTOCOL);
    const first = core.tick();
    const second = core.tick();
    expect(first).toMatchObject({ accepted: true, events: [{ seq: 1, worldTick: 1 }] });
    expect(second).toMatchObject({ accepted: true, events: [{ seq: 2, worldTick: 2 }] });
    const snapshot = core.snapshot() as unknown as { meta: { rng: { battle: number[] } } };
    snapshot.meta.rng.battle[0] = 0;
    expect(core.snapshot().meta.rng.battle[0]).toBe(410886986);
  });

  it('keeps the canonical GameState SHA-256 fixed for the same command sequence', () => {
    const run = () => {
      const core = createCore(1);
      core.tick();
      core.tick();
      const json = core.canonicalStateJson();
      return { json, hash: createHash('sha256').update(json, 'utf8').digest('hex') };
    };

    const first = run();
    const repeated = run();
    expect(repeated).toEqual(first);
    expect(first.hash).toBe('6c662aaaffac2f217c156daea07a9f7c8998c1ac483595cf81e6291e8845e366');
  });
});
