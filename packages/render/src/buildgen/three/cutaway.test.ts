import { describe, expect, it } from 'vitest';
import {
  cutFacadeMask,
  facadeFacesCamera,
  focusOcclusionAmount,
  FACADE_E,
  FACADE_N,
  FACADE_S,
  FACADE_W,
} from './cutaway';

describe('cutFacadeMask', () => {
  it.each([
    [45, FACADE_S | FACADE_E],
    [135, FACADE_S | FACADE_W],
    [225, FACADE_N | FACADE_W],
    [315, FACADE_N | FACADE_E],
  ] as const)('maps yaw %s to the two camera-facing facades', (yaw, expected) => {
    expect(cutFacadeMask(yaw)).toBe(expected);
  });

  it('matches the shader dot-product predicate throughout a 45 to 135 degree turn', () => {
    for (let yaw = 45; yaw <= 135; yaw += 0.25) {
      let mirrored = 0;
      for (const bit of [FACADE_S, FACADE_W, FACADE_N, FACADE_E])
        if (facadeFacesCamera(bit, yaw)) mirrored |= bit;
      expect(cutFacadeMask(yaw)).toBe(mirrored);
    }
  });
});

describe('focus occlusion mirror', () => {
  it('cuts only nearer geometry and feathers the outer 0.3 m', () => {
    const focus = [0, 1, 0] as const;
    expect(focusOcclusionAmount([1, 1.6, 1], focus, 45, 1.8, 1)).toBe(1);
    expect(focusOcclusionAmount([-1, 0.4, -1], focus, 45, 1.8, 1)).toBe(0);
    const edge = focusOcclusionAmount([1.534, 1.3, -0.8], focus, 45, 1.8, 0.5);
    expect(edge).toBeGreaterThan(0);
    expect(edge).toBeLessThan(0.5);
    expect(focusOcclusionAmount([2.026, 1.5, -0.802], focus, 45, 1.8, 1)).toBe(0);
  });
});
