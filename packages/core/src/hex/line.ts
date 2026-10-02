import { floorDivInt } from '@tianshu/shared';
import { hexDistance, hexKey, type HexCoord } from './index';

export type HexLosKind = 'none' | 'partial' | 'full';
export type HexDelivery = 'melee' | 'ranged' | 'projectile' | 'sonic' | 'self';

export interface HexLosCell extends HexCoord {
  readonly height: number;
  readonly canopy: number;
  readonly los: HexLosKind;
  readonly occupied: boolean;
}

export interface LineOfSightResult {
  readonly ok: boolean;
  readonly hitPenalty: number;
  readonly partial: number;
  readonly blocker: HexCoord | null;
}

function compareHex(left: HexCoord, right: HexCoord): number {
  return left.r - right.r || left.q - right.q;
}

function roundCube(qNumerator: number, rNumerator: number, denominator: number): HexCoord {
  const q0 = floorDivInt(qNumerator, denominator);
  const r0 = floorDivInt(rNumerator, denominator);
  const candidates = [
    { q: q0, r: r0 }, { q: q0 + 1, r: r0 },
    { q: q0, r: r0 + 1 }, { q: q0 + 1, r: r0 + 1 },
  ];
  let best = candidates[0]!;
  let bestError = Number.MAX_SAFE_INTEGER;
  for (const candidate of candidates) {
    const sNumerator = -qNumerator - rNumerator;
    const s = -candidate.q - candidate.r;
    const dq = candidate.q * denominator - qNumerator;
    const dr = candidate.r * denominator - rNumerator;
    const ds = s * denominator - sNumerator;
    const error = dq * dq + dr * dr + ds * ds;
    if (error < bestError || (error === bestError && compareHex(candidate, best) < 0)) {
      best = candidate;
      bestError = error;
    }
  }
  return best;
}

function directedLine(a: HexCoord, b: HexCoord): HexCoord[] {
  const distance = hexDistance(a, b);
  const result: HexCoord[] = [];
  for (let step = 1; step < distance; step += 1) {
    result.push(roundCube(
      a.q * (distance - step) + b.q * step,
      a.r * (distance - step) + b.r * step,
      distance,
    ));
  }
  return result;
}

/** Integer cube interpolation, excluding endpoints and symmetric as a cell set. */
export function hexLineBetween(a: HexCoord, b: HexCoord): HexCoord[] {
  if (hexDistance(a, b) <= 1) return [];
  return directedLine(a, b);
}

export function lineOfSight(input: {
  readonly from: HexLosCell;
  readonly to: HexLosCell;
  readonly delivery: HexDelivery;
  readonly cells: readonly HexLosCell[];
  readonly hTol?: number;
}): LineOfSightResult {
  const heightDelta = Math.abs(input.from.height - input.to.height);
  if (input.delivery === 'sonic' || input.delivery === 'self') {
    return { ok: true, hitPenalty: 0, partial: 0, blocker: null };
  }
  if (input.delivery === 'melee') return {
    ok: heightDelta <= (input.hTol ?? 2), hitPenalty: 0, partial: 0,
    blocker: heightDelta <= (input.hTol ?? 2) ? null : input.to,
  };
  const distance = hexDistance(input.from, input.to);
  const byKey = new Map(input.cells.map((cell) => [hexKey(cell), cell]));
  const eyeA = input.from.height + 1;
  const eyeT = input.to.height + 1;
  let partial = 0;
  const line = hexLineBetween(input.from, input.to);
  for (let index = 0; index < line.length; index += 1) {
    const position = line[index]!;
    const cell = byKey.get(hexKey(position));
    if (cell === undefined) return { ok: false, hitPenalty: 0, partial, blocker: position };
    const step = index + 1;
    const lineHeightN = eyeA * (distance - step) + eyeT * step;
    if (cell.los === 'full' || cell.height * distance - lineHeightN >= 2 * distance
      || (input.delivery === 'projectile' && cell.occupied)) {
      return { ok: false, hitPenalty: 0, partial, blocker: position };
    }
    if (cell.los === 'partial'
      && (cell.height + cell.canopy) * distance - lineHeightN >= 0) partial += 1;
  }
  if (input.delivery === 'projectile' && partial >= 2) {
    return { ok: false, hitPenalty: 0, partial, blocker: line[line.length - 1] ?? null };
  }
  return { ok: true, hitPenalty: -10 * Math.min(partial, 2), partial, blocker: null };
}
