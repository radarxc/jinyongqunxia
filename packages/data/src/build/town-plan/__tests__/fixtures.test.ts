import { describe, expect, it } from 'vitest';
import { FIXTURE_KINDS, fixtureKindByName } from '../fixtures';

describe('town fixture catalogue', () => {
  it('assigns stable unique indexes and names to all 43 props', () => {
    const props = FIXTURE_KINDS.filter(({ idx }) => idx < 200);
    expect(props).toHaveLength(43);
    expect(new Set(FIXTURE_KINDS.map(({ idx }) => idx)).size).toBe(FIXTURE_KINDS.length);
    expect(new Set(FIXTURE_KINDS.map(({ name }) => name)).size).toBe(FIXTURE_KINDS.length);
    expect(props.map(({ idx }) => idx)).toEqual(Array.from({ length: 43 }, (_, idx) => idx));
  });

  it('marks low clutter at no more than 250 mm high', () => {
    for (const kind of FIXTURE_KINDS) {
      if (kind.lowClutter) expect(kind.hMm).toBeLessThanOrEqual(250);
    }
  });

  it('encodes stations at indexes 200+ with no footprint or blocking', () => {
    const stations = FIXTURE_KINDS.filter(({ idx }) => idx >= 200);
    expect(stations.map(({ name }) => name)).toEqual(expect.arrayContaining([
      'stn_keeper', 'stn_customer', 'stn_clerk', 'stn_waiter', 'stn_vendor',
      'stn_monk', 'stn_guard', 'stn_dealer',
    ]));
    for (const kind of stations) {
      expect(kind).toMatchObject({ wMm: 0, dMm: 0, hMm: 0, blocks: 0, station: kind.name });
    }
  });

  it('looks up by stable name and rejects unknown names', () => {
    expect(fixtureKindByName('counter').idx).toBe(0);
    expect(fixtureKindByName('stn_keeper').idx).toBe(200);
    expect(() => fixtureKindByName('missing')).toThrow('TOWN_PLAN_UNKNOWN_FIXTURE:missing');
  });
});
