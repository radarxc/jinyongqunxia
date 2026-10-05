import { ceilDivInt } from '@tianshu/shared';
import {
  advanceGameClock, advanceInnRest, type AdvanceClockResult, type GameClock,
  TICKS_PER_HOUR, TICKS_PER_SHICHEN,
} from '../state';

export * from './worldmap-pathfinder';
export * from './worldmap-runtime';
export * from './worldmap-state';
export * from './worldmap-types';
export * from './town-runtime';
export * from './region-types';
export * from './region-codec';
export * from './region-gates';
export * from './region-runtime';

export type TimeAdvanceReason = 'inn-rest' | 'meditation' | 'travel' | 'battle' | 'story';
export interface TimeAdvance {
  readonly reason: TimeAdvanceReason; readonly result: AdvanceClockResult;
}
export interface TravelByDistance {
  readonly distanceLi: number; readonly liPerShichen: number;
  readonly speedBp?: number;
}

function positiveInteger(value: number, code: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) throw new TypeError(code);
}
export function sleepAtInn(clock: GameClock): TimeAdvance {
  return { reason: 'inn-rest', result: advanceInnRest(clock) };
}
export function meditateShichen(clock: GameClock, shichen: number): TimeAdvance {
  positiveInteger(shichen, 'MEDITATION_SHICHEN');
  return { reason: 'meditation',
    result: advanceGameClock(clock, shichen * TICKS_PER_SHICHEN) };
}
export function travelByDistance(clock: GameClock, input: TravelByDistance): TimeAdvance {
  positiveInteger(input.distanceLi, 'TRAVEL_DISTANCE');
  positiveInteger(input.liPerShichen, 'TRAVEL_SPEED');
  const speedBp = input.speedBp ?? 10_000;
  positiveInteger(speedBp, 'TRAVEL_SPEED_BP');
  const dividend = input.distanceLi * 10_000;
  const divisor = speedBp * input.liPerShichen;
  if (!Number.isSafeInteger(dividend) || !Number.isSafeInteger(divisor))
    throw new TypeError('TRAVEL_OVERFLOW');
  const shichen = Math.max(1, ceilDivInt(dividend, divisor));
  return { reason: 'travel', result: advanceGameClock(clock, shichen * TICKS_PER_SHICHEN) };
}
export function travelByMinutes(clock: GameClock, minutes: number): TimeAdvance {
  if (!Number.isSafeInteger(minutes) || minutes < 0) throw new TypeError('TRAVEL_MINUTES');
  const ticks = minutes === 0 ? 0 : Math.max(TICKS_PER_HOUR,
    ceilDivInt(minutes, 60) * TICKS_PER_HOUR);
  return { reason: 'travel', result: advanceGameClock(clock, ticks) };
}
export function advanceBattleTicks(clock: GameClock, battleTicks: number): TimeAdvance {
  if (!Number.isSafeInteger(battleTicks) || battleTicks < 0) throw new TypeError('BATTLE_TICKS');
  return { reason: 'battle', result: { clock, events: [] } };
}
