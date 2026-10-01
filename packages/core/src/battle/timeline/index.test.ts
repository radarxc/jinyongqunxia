import { describe, expect, it } from 'vitest';
import { createRng } from '../../rng';
import { createGatherState, type MeridianFlowCommandContext } from '../meridian-flow';
import {
  acuteQiGather, createOpeningOrder, nextTimelineEntry, settleTimelineAction, type TimelineState,
  type TimelineUnit,
} from './index';

function unit(overrides: Partial<TimelineUnit> & Pick<TimelineUnit, 'id' | 'unitIndex'>): TimelineUnit {
  return { side: 'enemy', agi: 50, qinggong: 50, openingQinggong: 50, openingPriority: 0,
    spd: 100, ct: 0, ctFrozen: false, pendingShift: 0, active: true, ...overrides };
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

  it('does not consume RNG in rejected acute gathering', () => {
    const battleRng = createRng([1, 2, 3, 4]);
    const before = battleRng.snapshot();
    const rawContext: unknown = { battleRng, gather: createGatherState(100), flow: {} };
    const context = rawContext as MeridianFlowCommandContext;
    expect(acuteQiGather(unit({ id: 'u', unitIndex: 0 }), context, 'route').accepted).toBe(false);
    expect(battleRng.snapshot()).toEqual(before);
  });
});
