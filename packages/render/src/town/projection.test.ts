import { describe, expect, it } from 'vitest';
import { Ray, Vector3 } from 'three';
import { createTownHeightPicker, planningCellCenterToTownWorld, planningToTownPixels, planningToTownWorld,
  townCameraOffset, townHexToWorld, townWorldToHex, townWorldToPlanningCell } from './projection';

describe('town 45 degree projection', () => {
  it('matches the offline renderer formula including elevation displacement', () => {
    expect(planningToTownPixels(10, 20, 96)).toEqual([960, 1376]);
    expect(planningToTownPixels(10, 20, 96, 100)[0]).toBe(960);
    expect(planningToTownPixels(10, 20, 96, 100)[1]).toBeCloseTo(1376 - 16 * Math.sqrt(6));
    expect(planningToTownWorld(10, 20, 96, 0, new Vector3()).toArray()).toEqual([10, 0, 76]);
  });

  it('round trips every sampled planning-cell centre on flat ground', () => {
    const out = new Vector3();
    for (const point of [[0, 0], [10, 20], [95, 95]] as const) {
      planningCellCenterToTownWorld(point, 96, 0, out);
      expect(townWorldToPlanningCell(out.x, out.z, 96)).toEqual(point);
    }
  });

  it('maps runtime axial points through the documented world-to-planning conversion', () => {
    const actual = townHexToWorld([0, 6], 96, 0, new Vector3());
    expect(actual.x).toBeCloseTo(2 * Math.sqrt(3));
    expect(actual.z).toBeCloseTo(6);
    expect(townWorldToHex(actual.x, actual.z)).toEqual([0, 6]);
  });

  it('cube-rounds axial picks on both sides of a hex border', () => {
    const left = townHexToWorld([2, 3], 96, 0, new Vector3());
    const right = townHexToWorld([3, 3], 96, 0, new Vector3());
    expect(townWorldToHex(left.x * 0.51 + right.x * 0.49, 3)).toEqual([2, 3]);
    expect(townWorldToHex(left.x * 0.49 + right.x * 0.51, 3)).toEqual([3, 3]);
  });

  it('picks the authored elevated hex instead of the camera-target plane', () => {
    const point = townHexToWorld([3, 3], 96, 100, new Vector3());
    const origin = point.clone().add(townCameraOffset(42, new Vector3()));
    const ray = new Ray(origin, point.clone().sub(origin).normalize());
    const pick = createTownHeightPicker([[2, 3, 0, 'flat'], [3, 3, 100, 'ramp']]);
    expect(pick(ray, new Vector3())).toEqual([3, 3]);
    const miss = createTownHeightPicker([[2, 3, 0, 'flat']]);
    expect(miss(ray, new Vector3())).toBeNull();
  });

  it('uses an exact 30 degree camera elevation at yaw 45', () => {
    const offset = townCameraOffset(42, new Vector3());
    const horizontal = Math.hypot(offset.x, offset.z);
    expect(Math.atan2(offset.y, horizontal) * 180 / Math.PI).toBeCloseTo(30);
    expect(offset.x).toBe(offset.z);
  });
});
