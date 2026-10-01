import { ceilDivInt, floorDivInt } from '@tianshu/shared';
import type { GameClock } from './models';

export const TICKS_PER_MINUTE = 10;
export const TICKS_PER_HOUR = 600;
export const TICKS_PER_SHICHEN = 1200;
export const TICKS_PER_DAY = 14400;
export const DAYS_PER_MONTH = 30;
export const MONTHS_PER_YEAR = 12;
export const TICKS_PER_MONTH = TICKS_PER_DAY * DAYS_PER_MONTH;
export const TICKS_PER_YEAR = TICKS_PER_MONTH * MONTHS_PER_YEAR;
export const MEDITATION_TICKS = TICKS_PER_HOUR;
export const INN_REST_TICKS = 8 * TICKS_PER_HOUR;
const MAO_START_MINUTE = 5 * 60;
const ZI_START_MINUTE = 23 * 60;

export type ClockBoundaryKind = 'shichen' | 'day' | 'month' | 'year';
export interface ClockBoundaryEvent { readonly t: 'world/timeBoundary'; readonly atTick: number; readonly kind: ClockBoundaryKind; readonly periodIndex: number; }
export interface AdvanceClockResult { readonly clock: GameClock; readonly events: readonly ClockBoundaryEvent[]; }

function assertTicks(ticks: number): void {
  if (!Number.isSafeInteger(ticks) || ticks < 0) throw new TypeError('CLOCK_TICKS');
}
export function createGameClock(epochId: string, epochYear: number, elapsedTicks = 0): GameClock {
  assertTicks(elapsedTicks);
  const dayIndex = floorDivInt(elapsedTicks, TICKS_PER_DAY);
  const monthIndex = floorDivInt(dayIndex, DAYS_PER_MONTH);
  const yearOffset = floorDivInt(monthIndex, MONTHS_PER_YEAR);
  const minuteOfDay = floorDivInt(elapsedTicks, TICKS_PER_MINUTE) % 1440;
  const slotInDay = floorDivInt((minuteOfDay - ZI_START_MINUTE + 1440) % 1440, 120);
  return { epochId, calendarSpecId: 'calendar_30x12', epochYear, elapsedTicks,
    shichenIndex: floorDivInt(elapsedTicks + TICKS_PER_HOUR, TICKS_PER_SHICHEN),
    dayIndex, monthIndex, yearOffset, slotInDay };
}

export function advanceGameClock(clock: GameClock, ticks: number): AdvanceClockResult {
  assertTicks(ticks);
  const end = clock.elapsedTicks + ticks;
  assertTicks(end);
  const periods: readonly [ClockBoundaryKind, number][] = [
    ['day', TICKS_PER_DAY],
    ['month', TICKS_PER_MONTH], ['year', TICKS_PER_YEAR],
  ];
  const rank: Readonly<Record<ClockBoundaryKind, number>> = { shichen: 0, day: 1, month: 2, year: 3 };
  const events: ClockBoundaryEvent[] = [];
  const firstShichen = floorDivInt(clock.elapsedTicks + TICKS_PER_HOUR, TICKS_PER_SHICHEN) + 1;
  const lastShichen = floorDivInt(end + TICKS_PER_HOUR, TICKS_PER_SHICHEN);
  for (let index = firstShichen; index <= lastShichen; index += 1)
    events.push({ t: 'world/timeBoundary', atTick: index * TICKS_PER_SHICHEN - TICKS_PER_HOUR, kind: 'shichen', periodIndex: index });
  for (const [kind, period] of periods) {
    const first = floorDivInt(clock.elapsedTicks, period) + 1;
    const last = floorDivInt(end, period);
    for (let index = first; index <= last; index += 1) events.push({ t: 'world/timeBoundary', atTick: index * period, kind, periodIndex: index });
  }
  events.sort((left, right) => left.atTick - right.atTick || rank[left.kind] - rank[right.kind]);
  return { clock: createGameClock(clock.epochId, clock.epochYear, end), events };
}

export function advanceMeditation(clock: GameClock): AdvanceClockResult {
  return advanceGameClock(clock, MEDITATION_TICKS);
}
export function advanceTravel(clock: GameClock, minutes: number): AdvanceClockResult {
  if (!Number.isSafeInteger(minutes) || minutes < 0) throw new TypeError('CLOCK_MINUTES');
  const hours = ceilDivInt(minutes, 60);
  return advanceGameClock(clock, hours * TICKS_PER_HOUR);
}
export function advanceBattle(clock: GameClock): AdvanceClockResult {
  return { clock, events: [] };
}
export function advanceInnRest(clock: GameClock): AdvanceClockResult {
  const minuteOfDay = floorDivInt(clock.elapsedTicks, TICKS_PER_MINUTE) % 1440;
  const isNight = minuteOfDay >= 19 * 60 || minuteOfDay < MAO_START_MINUTE;
  let untilMao = MAO_START_MINUTE - minuteOfDay;
  if (untilMao <= 0) untilMao += 1440;
  const ticks = isNight ? Math.max(INN_REST_TICKS, untilMao * TICKS_PER_MINUTE) : INN_REST_TICKS;
  return advanceGameClock(clock, ticks);
}
