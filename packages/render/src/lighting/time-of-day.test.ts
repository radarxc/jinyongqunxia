import { describe, expect, it } from 'vitest';
import {
  createTimeOfDayFrame,
  evaluateTimeOfDay,
  sunAzimuthOffsetDeg,
  TIME_OF_DAY_KEYFRAMES,
} from './time-of-day';
import type { RgbColor } from './time-of-day';

function expectHex(color: RgbColor, hex: number): void {
  expect(color.r).toBeCloseTo(((hex >> 16) & 255) / 255, 10);
  expect(color.g).toBeCloseTo(((hex >> 8) & 255) / 255, 10);
  expect(color.b).toBeCloseTo((hex & 255) / 255, 10);
}

describe('time of day', () => {
  it('returns every authored keyframe exactly', () => {
    const frame = createTimeOfDayFrame();
    for (const keyframe of TIME_OF_DAY_KEYFRAMES) {
      evaluateTimeOfDay(keyframe.hour, frame);
      expect(frame).toMatchObject({
        hours: keyframe.hour,
        elevationDeg: keyframe.elevationDeg,
        lightIntensity: keyframe.lightIntensity,
        hemiIntensity: keyframe.hemiIntensity,
        lampIntensity: keyframe.lampIntensity,
        lutFrom: keyframe.lut,
        lutMix: 0,
      });
      const next =
        TIME_OF_DAY_KEYFRAMES[
          (TIME_OF_DAY_KEYFRAMES.indexOf(keyframe) + 1) % TIME_OF_DAY_KEYFRAMES.length
        ]!;
      expect(frame.lutTo).toBe(next.lut);
      expectHex(frame.lightColor, keyframe.lightColor);
      expectHex(frame.skyColor, keyframe.skyColor);
      expectHex(frame.groundColor, keyframe.groundColor);
      expectHex(frame.fogColor, keyframe.fogColor);
    }
  });

  it('wraps across midnight and interpolates the 20:00 to 00:00 segment', () => {
    const midnight = evaluateTimeOfDay(0, createTimeOfDayFrame());
    expect(evaluateTimeOfDay(24, createTimeOfDayFrame())).toEqual(midnight);
    expect(evaluateTimeOfDay(-24, createTimeOfDayFrame())).toEqual(midnight);
    const late = evaluateTimeOfDay(22, createTimeOfDayFrame());
    expect(late.hours).toBe(22);
    expect(late.elevationDeg).toBe(32.5);
    expect(late.lightIntensity).toBeCloseTo(0.275);
    expect(late.lutFrom).toBe('night');
    expect(late.lutTo).toBe('night');
  });

  it('keeps the sun at 110, 80 and 50 degrees relative to the camera', () => {
    expect(sunAzimuthOffsetDeg(0)).toBe(110);
    expect(sunAzimuthOffsetDeg(0.5)).toBeCloseTo(80, 10);
    expect(sunAzimuthOffsetDeg(1)).toBe(50);
  });
});
