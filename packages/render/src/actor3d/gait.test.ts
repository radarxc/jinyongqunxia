import { describe, expect, it } from 'vitest';
import {
  CATCH_UP_MULTIPLIER_MAX, DEFAULT_NATIVE_HPS, MAX_TURN_RAD_PER_SECOND, catchUpMultiplier,
  gaitPlaybackRate, gaitTimeScale, selectGait, stepActorYaw,
} from './gait';

const degrees = (value: number): number => value * 180 / Math.PI;
const radians = (value: number): number => value * Math.PI / 180;
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}
function shortestDelta(from: number, to: number): number {
  let delta = (to - from) % (Math.PI * 2);
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
}

describe('actor3d gait playback', () => {
  it('matches the twelve-cell playback-rate table in tech/16 section 9.4', () => {
    const heights = [1.58, 1.66, 1.72, 1.76, 1.81, 1.86];
    const expectedWalk = [1.40, 1.33, 1.28, 1.25, 1.22, 1.19];
    const expectedRun = [1.33, 1.27, 1.22, 1.19, 1.16, 1.13];
    for (let index = 0; index < heights.length; index += 1) {
      expect(Math.abs(gaitTimeScale(1.35, heights[index]!, DEFAULT_NATIVE_HPS.walk)
        - expectedWalk[index]!)).toBeLessThanOrEqual(0.01);
      expect(Math.abs(gaitTimeScale(4.5, heights[index]!, DEFAULT_NATIVE_HPS.run)
        - expectedRun[index]!)).toBeLessThanOrEqual(0.01);
    }
  });

  it('clamps extremely slow and fast playback to 0.80 and 1.45', () => {
    expect(gaitTimeScale(0, 1.81, DEFAULT_NATIVE_HPS.walk)).toBe(0.8);
    expect(gaitTimeScale(100, 1.81, DEFAULT_NATIVE_HPS.run)).toBe(1.45);
  });

  it('keeps walk/run hysteresis between 2.2 and 2.6 metres per second', () => {
    expect(selectGait(1, 2.4)).toBe(1);
    expect(selectGait(2, 2.4)).toBe(2);
    expect(selectGait(1, 2.61)).toBe(2);
    expect(selectGait(2, 2.19)).toBe(1);
    expect(selectGait(2, 0.049)).toBe(0);
  });

  it('multiplies movement and playback only when lag exceeds 0.5 metres', () => {
    const base = gaitTimeScale(1.35, 1.81, DEFAULT_NATIVE_HPS.walk);
    expect(catchUpMultiplier(0.4)).toBe(1);
    expect(gaitPlaybackRate(1.35, 1.81, DEFAULT_NATIVE_HPS.walk, 0.4)).toBe(base);
    const catchUp = catchUpMultiplier(0.6);
    expect(catchUp).toBeGreaterThan(1);
    expect(catchUp).toBeLessThanOrEqual(CATCH_UP_MULTIPLIER_MAX);
    expect(gaitPlaybackRate(1.35, 1.81, DEFAULT_NATIVE_HPS.walk, 0.6))
      .toBeCloseTo(base * catchUp, 12);
  });
});

describe('actor3d turning', () => {
  it('uses the 540 degree per second physical limit to finish 180 degrees in one third second', () => {
    const dt = 1 / 60;
    let yaw = 0;
    for (let frame = 0; frame < 20; frame += 1) {
      const previous = yaw;
      yaw = stepActorYaw(yaw, Math.PI, dt);
      expect(Math.abs(yaw - previous) / dt).toBeLessThanOrEqual(MAX_TURN_RAD_PER_SECOND + 1e-12);
      expect(Math.abs(yaw - previous) / dt).toBeCloseTo(MAX_TURN_RAD_PER_SECOND, 10);
    }
    expect(yaw).toBeCloseTo(Math.PI, 12);
  });

  it('takes the twenty-degree shortest arc from 350 to 10 degrees', () => {
    const result = stepActorYaw(radians(350), radians(10), 1);
    expect(degrees(result - radians(350))).toBeCloseTo(20, 12);
  });

  it('smoothly eases consecutive frame speeds near the target', () => {
    const dt = 1 / 60;
    const target = radians(15);
    const first = stepActorYaw(0, target, dt);
    const second = stepActorYaw(first, target, dt);
    const firstSpeed = first / dt;
    const secondSpeed = (second - first) / dt;
    expect(firstSpeed).toBeGreaterThan(secondSpeed);
    expect(firstSpeed).toBeLessThan(MAX_TURN_RAD_PER_SECOND);
    expect(secondSpeed).toBeGreaterThan(0);
    expect(second).toBeCloseTo(target, 12);
  });

  it('does not move when delta time is non-positive', () => {
    expect(stepActorYaw(1, 2, -1)).toBe(1);
    expect(stepActorYaw(1, 2, 0)).toBe(1);
  });

  it('keeps fixed-seed angle samples on the shortest arc and under the turn-rate cap', () => {
    const random = mulberry32(0x41435433);
    for (let sample = 0; sample < 512; sample += 1) {
      const current = (random() * 8 - 4) * Math.PI;
      const target = (random() * 8 - 4) * Math.PI;
      const dt = random() / 15;
      const before = shortestDelta(current, target);
      const next = stepActorYaw(current, target, dt);
      const step = next - current;
      expect(Math.abs(step)).toBeLessThanOrEqual(MAX_TURN_RAD_PER_SECOND * dt + 1e-12);
      expect(Math.sign(step)).toBe(before === 0 ? 0 : Math.sign(before));
      expect(Math.abs(shortestDelta(next, target))).toBeLessThanOrEqual(Math.abs(before) + 1e-12);
    }
  });
});
