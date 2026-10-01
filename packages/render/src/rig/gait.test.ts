import { describe, expect, it } from 'vitest';
import { gaitPeriod, motionModeForSpeed, quantizePoseTime, resolveDirection, sampleGait, stableIdlePhase } from './gait';
import type { WeightClass } from './types';

type Vector = readonly [WeightClass, number, ...number[]];
const WALK: readonly Vector[] = [
  ['light', 0, 1.6, 1.6, 4, 18.7, 4.4, -4.4, 1.1, 1.1, 27.8, 19, -0.027],
  ['light', .25, 24.4, -27.5, 35.1, 4, 7.9, -7.9, -20.5, 18.3, 26.6, 20.2, .031],
  ['light', .5, 1.6, 1.6, 18.7, 4, -4.4, 4.4, 1.1, 1.1, 19, 27.8, -.027],
  ['light', .75, -27.5, 24.4, 4, 35.1, -7.9, 7.9, 18.3, -20.5, 20.2, 26.6, .023],
  ['medium', 0, 1.4, 1.4, 4, 17.6, 4, -4, 1, 1, 27, 19, -.025],
  ['medium', .25, 22.6, -25.4, 32.8, 4, 7.4, -7.4, -19, 17, 25.9, 20.1, .029],
  ['medium', .5, 1.4, 1.4, 17.6, 4, -4, 4, 1, 1, 19, 27, -.025],
  ['medium', .75, -25.4, 22.6, 4, 32.8, -7.4, 7.4, 17, -19, 20.1, 25.9, .021],
  ['heavy', 0, 1.1, 1.1, 4, 14.6, 3.2, -3.2, .8, .8, 25.1, 18.7, -.02],
  ['heavy', .25, 17.6, -19.8, 26.5, 4, 5.7, -5.7, -14.8, 13.2, 24.2, 19.6, .022],
  ['heavy', .5, 1.1, 1.1, 14.6, 4, -3.2, 3.2, .8, .8, 18.7, 25.1, -.02],
  ['heavy', .75, -19.8, 17.6, 4, 26.5, -5.7, 5.7, 13.2, -14.8, 19.6, 24.2, .017],
];
const RUN: readonly Vector[] = [
  ['light', 0, 2.7, 2.7, 10, 37.7, 7.3, -7.3, 1.8, 1.8, 69.7, 59.2, -.059],
  ['light', .25, 42.6, -48.1, 68.6, 10, 13.2, -13.2, -34.2, 30.6, 68.3, 60.7, .068],
  ['light', .5, 2.7, 2.7, 37.7, 10, -7.3, 7.3, 1.8, 1.8, 59.2, 69.7, -.059],
  ['light', .75, -48.1, 42.6, 10, 68.6, -13.2, 13.2, 30.6, -34.2, 60.7, 68.3, .05],
  ['medium', 0, 2.5, 2.5, 10, 35.7, 6.7, -6.7, 1.7, 1.7, 68.9, 59.1, -.055],
  ['medium', .25, 39.5, -44.5, 64.3, 10, 12.3, -12.3, -31.7, 28.3, 67.5, 60.5, .063],
  ['medium', .5, 2.5, 2.5, 35.7, 10, -6.7, 6.7, 1.7, 1.7, 59.1, 68.9, -.055],
  ['medium', .75, -44.5, 39.5, 10, 64.3, -12.3, 12.3, 28.3, -31.7, 60.5, 67.5, .047],
  ['heavy', 0, 2, 2, 10, 30, 5.3, -5.3, 1.3, 1.3, 66.5, 58.9, -.043],
  ['heavy', .25, 30.8, -34.7, 52.3, 10, 9.6, -9.6, -24.7, 22.1, 65.4, 59.9, .049],
  ['heavy', .5, 2, 2, 30, 10, -5.3, 5.3, 1.3, 1.3, 58.9, 66.5, -.043],
  ['heavy', .75, -34.7, 30.8, 10, 52.3, -9.6, 9.6, 22.1, -24.7, 59.9, 65.4, .036],
];

describe('sampleGait', () => {
  it.each([['walk', WALK], ['run', RUN]] as const)('matches all %s DES-rig vectors', (mode, vectors) => {
    for (const [weight, phase, ...expected] of vectors) {
      const pose = sampleGait(mode, weight, phase);
      const actual = [pose.hipL, pose.hipR, pose.kneeL, pose.kneeR, pose.ankleL, pose.ankleR, pose.shoulderL, pose.shoulderR, pose.elbowL, pose.elbowR, pose.bodyY];
      actual.forEach((value, index) => expect(Math.abs(value - expected[index]!)).toBeLessThanOrEqual(index === 10 ? .0005 : .15));
    }
  });

  it('applies speed hysteresis, period clamps, one-beat-two quantization and stable idle offsets', () => {
    expect(motionModeForSpeed(1.95, 'run')).toBe('run'); expect(motionModeForSpeed(2.05, 'walk')).toBe('walk');
    expect(gaitPeriod('walk', 1.4, 'medium')).toBeCloseTo(1); expect(gaitPeriod('run', 99, 'light')).toBe(.38);
    expect(quantizePoseTime(.099, 12)).toBeCloseTo(1 / 12); expect(quantizePoseTime(.099, 0)).toBe(.099);
    expect(stableIdlePhase(42)).toBe(stableIdlePhase(42)); expect(stableIdlePhase(42)).not.toBe(stableIdlePhase(43));
  });

  it('maps three source views to eight directions while retaining north/south mirror history', () => {
    expect([0, 1, 2, 3, 4, 5, 6, 7].map((dir) => resolveDirection(dir as 0, true))).toEqual([
      { view: 'front34', mirrored: true }, { view: 'front34', mirrored: false }, { view: 'side', mirrored: false },
      { view: 'back34', mirrored: false }, { view: 'back34', mirrored: true }, { view: 'back34', mirrored: true },
      { view: 'side', mirrored: true }, { view: 'front34', mirrored: true },
    ]);
  });
});
