import { describe, expect, it } from 'vitest';
import { ceilDivInt } from '@tianshu/shared';
import {
  createOpeningOrder, nextTimelineEntry, settleTimelineAction, type TimelineState,
  type TimelineUnit,
} from './index';

function unit(overrides: Partial<TimelineUnit> & Pick<TimelineUnit, 'id' | 'unitIndex'>): TimelineUnit {
  return { side: 'enemy', agi: 50, qinggong: 50, openingQinggong: 50, openingPriority: 0,
    spd: 100, ct: 0, ctFrozen: false, pendingShift: 0, active: true, ...overrides };
}
function singleUnitState(spd: number): TimelineState {
  return { tick: 0, units: [unit({ id: 'actor', unitIndex: 0, spd })], openingOrder: [],
    timedEvents: [], env: null };
}

describe('battle timeline', () => {
  it('freezes opening order with every documented tie-break', () => {
    const units = [
      unit({ id: 'slow', unitIndex: 3, openingQinggong: 60, spd: 90 }),
      unit({ id: 'enemy', unitIndex: 2, side: 'enemy', openingQinggong: 60, spd: 100 }),
      unit({ id: 'player', unitIndex: 1, side: 'player', openingQinggong: 60, spd: 100 }),
      unit({ id: 'fast', unitIndex: 4, openingQinggong: 70, spd: 80 }),
    ];
    expect(createOpeningOrder(units, 'enemy')).toEqual(['fast', 'enemy', 'player', 'slow']);
  });

  it('serves opening slots without advancing time', () => {
    const state: TimelineState = { tick: 0, units: [unit({ id: 'a', unitIndex: 1 })],
      openingOrder: ['a'], timedEvents: [], env: null };
    expect(nextTimelineEntry(state)).toEqual({ kind: 'unit', unitId: 'a' });
    expect(state.tick).toBe(0);
  });

  it('advances by the minimum integer delta then applies normal ready tie-breaks', () => {
    const state: TimelineState = { tick: 0, units: [
      unit({ id: 'a', unitIndex: 1, side: 'player', spd: 90, ct: 920 }),
      unit({ id: 'b', unitIndex: 2, side: 'enemy', spd: 100, ct: 910 }),
    ], openingOrder: [], timedEvents: [], env: null };
    expect(nextTimelineEntry(state)).toEqual({ kind: 'unit', unitId: 'b' });
    expect(state.tick).toBe(1);
    expect(state.units.map(({ ct }) => ct)).toEqual([1010, 1010]);
  });

  it('clamps speed below 30 for both waiting and CT gain', () => {
    const state = singleUnitState(10);
    expect(nextTimelineEntry(state)).toEqual({ kind: 'unit', unitId: 'actor' });
    expect(state).toMatchObject({ tick: 34, units: [{ spd: 10, ct: 1020 }] });
  });

  it('clamps speed above 300 for both waiting and CT gain', () => {
    const state = singleUnitState(400);
    expect(nextTimelineEntry(state)).toEqual({ kind: 'unit', unitId: 'actor' });
    expect(state).toMatchObject({ tick: 4, units: [{ spd: 400, ct: 1200 }] });
  });

  it.each([
    { label: 'zero', spd: 0, tick: 34, ct: 1020 },
    { label: 'negative', spd: -120, tick: 34, ct: 1020 },
    { label: 'maximum safe integer', spd: Number.MAX_SAFE_INTEGER, tick: 4, ct: 1200 },
  ])('handles $label raw speed without losing the source value', ({ spd, tick, ct }) => {
    const state = singleUnitState(spd);
    expect(nextTimelineEntry(state)).toEqual({ kind: 'unit', unitId: 'actor' });
    expect(state).toMatchObject({ tick, units: [{ spd, ct }] });
  });

  it('keeps serialized results byte-identical for every speed from 30 through 300', () => {
    const actual = []; const expected = [];
    for (let spd = 30; spd <= 300; spd += 1) {
      const state = singleUnitState(spd);
      const entry = nextTimelineEntry(state);
      actual.push({ entry, state });
      const expectedState = singleUnitState(spd);
      const delta = ceilDivInt(1000, spd);
      expectedState.tick = delta;
      expectedState.units[0]!.ct = Math.min(1299, spd * delta);
      expected.push({ entry: { kind: 'unit', unitId: 'actor' }, state: expectedState });
    }
    expect(JSON.stringify(actual)).toBe(JSON.stringify(expected));
  });

  it('rejects a timeline step that cannot advance tick safely', () => {
    const state = singleUnitState(100);
    state.tick = Number.MAX_SAFE_INTEGER - 5;
    expect(() => nextTimelineEntry(state)).toThrowError('INVALID_TIMELINE_DELTA');
    expect(state).toMatchObject({ tick: Number.MAX_SAFE_INTEGER - 5, units: [{ ct: 0 }] });
  });

  it('orders due timed events before environment and units', () => {
    const state: TimelineState = { tick: 5, units: [unit({ id: 'a', unitIndex: 1, ct: 1100 })],
      openingOrder: [], timedEvents: [{ id: 'later-order', atTick: 5, order: 2 },
        { id: 'first', atTick: 5, order: 1 }], env: { ct: 1200 } };
    expect(nextTimelineEntry(state)).toEqual({ kind: 'event', eventId: 'first' });
    state.timedEvents.splice(0, 2);
    expect(nextTimelineEntry(state)).toEqual({ kind: 'environment' });
  });

  it('returns stalled without writing a non-finite value', () => {
    const frozen = unit({ id: 'a', unitIndex: 1, ctFrozen: true });
    const state: TimelineState = { tick: 12, units: [frozen], openingOrder: [],
      timedEvents: [], env: null };
    expect(nextTimelineEntry(state)).toEqual({ kind: 'stalled' });
    expect(state).toMatchObject({ tick: 12, units: [{ ct: 0 }] });
  });

  it('settles recovery with half-up rounding, flow debt and pending shift', () => {
    const actor = unit({ id: 'a', unitIndex: 1, ct: 1120, pendingShift: -80 });
    expect(settleTimelineAction(actor, 901, 500, 30, 5)).toBe(981);
    expect(actor.ct).toBe(59);
    expect(actor.pendingShift).toBe(0);
  });
});
