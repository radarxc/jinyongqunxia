import { describe, expect, it } from 'vitest';
import { hexDirToRig, hexDirWorldYaw, spriteDir, type HexDir } from './facing';
import { cameraBack, ISO_CAMERA_SPEC, IsoCameraRotation } from './iso-camera';

const directions = [0, 1, 2, 3, 4, 5] as const satisfies readonly HexDir[];

describe('camera facing', () => {
  it('uses the core HexDir world angles and all four camera presets', () => {
    expect(directions.map(hexDirWorldYaw)).toEqual([0, 300, 240, 180, 120, 60]);
    expect(directions.map((dir) => hexDirToRig(dir, 45))).toEqual([7, 6, 4, 3, 2, 0]);
    expect(directions.map((dir) => hexDirToRig(dir, 135))).toEqual([5, 4, 2, 1, 0, 6]);
    expect(directions.map((dir) => hexDirToRig(dir, 225))).toEqual([3, 2, 0, 7, 6, 4]);
    expect(directions.map((dir) => hexDirToRig(dir, 315))).toEqual([1, 0, 6, 5, 4, 2]);
  });

  it('takes the clockwise octant at half steps and wraps through zero', () => {
    expect(spriteDir(22.499, 0)).toBe(0);
    expect(spriteDir(22.5, 0)).toBe(1);
    expect(spriteDir(-22.501, 0)).toBe(7);
    expect(spriteDir(-22.5, 0)).toBe(0);
    expect(spriteDir(359.999, 0)).toBe(0);
    expect(spriteDir(0, 359.999)).toBe(0);
  });

  it('matches the existing pitch-30 yaw-45 battle camera direction', () => {
    const back = cameraBack(45);
    expect(back.x).toBeCloseTo(Math.sqrt(3 / 8), 10);
    expect(back.y).toBeCloseTo(0.5, 10);
    expect(back.z).toBeCloseTo(Math.sqrt(3 / 8), 10);
  });
});

describe('IsoCameraRotation', () => {
  it('takes exactly the configured 350 ms and uses cubic midpoint easing', async () => {
    const rotation = new IsoCameraRotation();
    const completed = rotation.rotate(1);
    rotation.update(10);
    rotation.update(10 + ISO_CAMERA_SPEC.rotationMs / 2);
    expect(rotation.yawDeg).toBe(90);
    expect(rotation.rotating).toBe(true);
    rotation.update(10 + ISO_CAMERA_SPEC.rotationMs - 1);
    expect(rotation.rotating).toBe(true);
    rotation.update(10 + ISO_CAMERA_SPEC.rotationMs);
    await completed;
    expect(rotation.yawDeg).toBe(135);
    expect(rotation.rotating).toBe(false);
  });

  it('snaps to a preset when reduced motion is enabled', async () => {
    const rotation = new IsoCameraRotation();
    await rotation.rotate(-1, true);
    expect(rotation.yawDeg).toBe(315);
    expect(rotation.rotating).toBe(false);
  });
});
