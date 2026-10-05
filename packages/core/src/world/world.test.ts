import { describe, expect, it } from 'vitest';
import { createGameClock, TICKS_PER_DAY, TICKS_PER_HOUR, TICKS_PER_MONTH,
  TICKS_PER_SHICHEN, TICKS_PER_YEAR } from '../state';
import { advanceBattleTicks, meditateShichen, sleepAtInn, travelByDistance } from '.';

describe('world time advancement', () => {
  it('advances meditation by shichen and keeps battle time separate', () => {
    const clock = createGameClock('epoch_ch01', 1093);
    expect(meditateShichen(clock, 3).result.clock.elapsedTicks).toBe(3 * TICKS_PER_SHICHEN);
    expect(advanceBattleTicks(clock, 999).result.clock).toBe(clock);
  });

  it('rounds adjusted travel duration upward without losing fractional distance', () => {
    const clock = createGameClock('epoch_ch01', 1093);
    expect(travelByDistance(clock, { distanceLi: 1, liPerShichen: 2, speedBp: 20_000 })
      .result.clock.elapsedTicks).toBe(TICKS_PER_SHICHEN);
    expect(travelByDistance(clock, { distanceLi: 3, liPerShichen: 1, speedBp: 20_000 })
      .result.clock.elapsedTicks).toBe(2 * TICKS_PER_SHICHEN);
  });

  it('rests eight hours by day and until morning when that is later', () => {
    const daytime = createGameClock('epoch_ch01', 1093, 10 * TICKS_PER_HOUR);
    const night = createGameClock('epoch_ch01', 1093, 22 * TICKS_PER_HOUR);
    expect(sleepAtInn(daytime).result.clock.elapsedTicks).toBe(18 * TICKS_PER_HOUR);
    expect(sleepAtInn(night).result.clock.elapsedTicks).toBe(30 * TICKS_PER_HOUR);
  });

  it('rejects invalid duration and distance inputs', () => {
    const clock = createGameClock('epoch_ch01', 1093);
    expect(() => meditateShichen(clock, 0)).toThrow('MEDITATION_SHICHEN');
    expect(() => advanceBattleTicks(clock, -1)).toThrow('BATTLE_TICKS');
    expect(() => travelByDistance(clock, { distanceLi: 1, liPerShichen: 0 })).toThrow('TRAVEL_SPEED');
  });

  it('emits every crossed calendar boundary in deterministic order', () => {
    const clock = createGameClock('epoch_ch01', 1093, TICKS_PER_YEAR - 1);
    const advanced = meditateShichen(clock, 1).result;
    expect(advanced.events.filter(({ atTick }) => atTick === TICKS_PER_YEAR)
      .map(({ kind }) => kind)).toEqual(['day', 'month', 'year']);
    expect(TICKS_PER_MONTH).toBe(30 * TICKS_PER_DAY);
  });
});
