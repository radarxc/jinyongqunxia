import { floorDivInt } from '@tianshu/shared';

export interface HexCoord { readonly q: number; readonly r: number }
export type HexDir = 0 | 1 | 2 | 3 | 4 | 5;
export type HexAim12 = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export type HexAim =
  | { readonly dirCount: 6; readonly dir: HexDir }
  | { readonly dirCount: 12; readonly dir: HexAim12 };

export const HEX_DIRECTIONS = [
  { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
  { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 },
] as const satisfies readonly HexCoord[];

function assertCoord(value: HexCoord): void {
  if (!Number.isSafeInteger(value.q) || !Number.isSafeInteger(value.r)) {
    throw new RangeError('HEX_COORD_INTEGER');
  }
}

function assertRadius(radius: number): void {
  if (!Number.isSafeInteger(radius) || radius < 0 || radius > 64) {
    throw new RangeError('HEX_RADIUS');
  }
}

export const hexKey = (value: HexCoord): string => `${value.q},${value.r}`;
export const hexAdd = (left: HexCoord, right: HexCoord): HexCoord =>
  ({ q: left.q + right.q, r: left.r + right.r });
export const hexScale = (value: HexCoord, scale: number): HexCoord =>
  ({ q: value.q * scale, r: value.r * scale });

export function hexNeighbor(origin: HexCoord, direction: HexDir): HexCoord {
  return hexAdd(origin, HEX_DIRECTIONS[direction]);
}

export function hexDistance(left: HexCoord, right: HexCoord): number {
  assertCoord(left); assertCoord(right);
  const dq = left.q - right.q;
  const dr = left.r - right.r;
  return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));
}

function compareRelative(left: HexCoord, right: HexCoord): number {
  const distance = hexDistance({ q: 0, r: 0 }, left) - hexDistance({ q: 0, r: 0 }, right);
  return distance !== 0 ? distance : left.r - right.r || left.q - right.q;
}

function buildDisk(radius: number): readonly HexCoord[] {
  const result: HexCoord[] = [];
  for (let q = -radius; q <= radius; q += 1) {
    const low = Math.max(-radius, -q - radius);
    const high = Math.min(radius, -q + radius);
    for (let r = low; r <= high; r += 1) result.push({ q, r });
  }
  return Object.freeze(result.sort(compareRelative));
}

const PRECOMPUTED_DISKS = Array.from({ length: 7 }, (_, radius) => buildDisk(radius));

function relativeDisk(radius: number): readonly HexCoord[] {
  assertRadius(radius);
  return PRECOMPUTED_DISKS[radius] ?? buildDisk(radius);
}

function translate(origin: HexCoord, relative: readonly HexCoord[]): HexCoord[] {
  const result = new Array<HexCoord>(relative.length);
  for (let index = 0; index < relative.length; index += 1) {
    const cell = relative[index]!;
    result[index] = { q: origin.q + cell.q, r: origin.r + cell.r };
  }
  return result;
}

export function hexDisk(origin: HexCoord, radius: number): HexCoord[] {
  assertCoord(origin);
  return translate(origin, relativeDisk(radius));
}

export function hexRing(origin: HexCoord, radius: number): HexCoord[] {
  assertRadius(radius);
  const disk = relativeDisk(radius);
  const ring = disk.filter((cell) => hexDistance({ q: 0, r: 0 }, cell) === radius);
  return translate(origin, ring);
}

export function hexLine(origin: HexCoord, direction: HexDir, length: number): HexCoord[] {
  assertCoord(origin); assertRadius(length);
  const vector = HEX_DIRECTIONS[direction];
  const result = new Array<HexCoord>(length);
  for (let step = 1; step <= length; step += 1) {
    result[step - 1] = { q: origin.q + vector.q * step, r: origin.r + vector.r * step };
  }
  return result;
}

function aimVector(aim: HexAim): HexCoord {
  if (aim.dirCount === 6) return HEX_DIRECTIONS[aim.dir];
  const base = floorDivInt(aim.dir, 2) as HexDir;
  if (aim.dir % 2 === 0) return HEX_DIRECTIONS[base];
  return hexAdd(HEX_DIRECTIONS[base], HEX_DIRECTIONS[((base + 1) % 6) as HexDir]);
}

export function hexCone(
  origin: HexCoord, radius: number, angle: 60 | 120, aim: HexAim,
): HexCoord[] {
  const facing = aimVector(aim);
  const fx = 2 * facing.q + facing.r;
  const result: HexCoord[] = [];
  for (const cell of relativeDisk(radius)) {
    if (cell.q === 0 && cell.r === 0) continue;
    const x = 2 * cell.q + cell.r;
    const dot = x * fx + 3 * cell.r * facing.r;
    const cross = x * facing.r - cell.r * fx;
    if (dot <= 0) continue;
    const inside = angle === 60
      ? 9 * cross * cross <= dot * dot
      : cross * cross <= dot * dot;
    if (inside) result.push({ q: origin.q + cell.q, r: origin.r + cell.r });
  }
  return result;
}
