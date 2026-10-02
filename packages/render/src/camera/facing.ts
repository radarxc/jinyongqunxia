import type { Dir8 } from '../rig/types';

export type HexDir = 0 | 1 | 2 | 3 | 4 | 5;
const HEX_WORLD_YAW = [0, 300, 240, 180, 120, 60] as const;

export function spriteDir(facingYawDeg: number, cameraYawDeg: number): Dir8 {
  const relative = (((facingYawDeg - cameraYawDeg) % 360) + 360) % 360;
  return (Math.floor(relative / 45 + 0.5) % 8) as Dir8;
}

export function hexDirWorldYaw(direction: HexDir): number {
  if (!Number.isInteger(direction) || direction < 0 || direction > 5)
    throw new RangeError('HEX_DIR');
  return HEX_WORLD_YAW[direction];
}

export function hexDirToRig(direction: HexDir, cameraYawDeg = 45): Dir8 {
  return spriteDir(hexDirWorldYaw(direction), cameraYawDeg);
}
