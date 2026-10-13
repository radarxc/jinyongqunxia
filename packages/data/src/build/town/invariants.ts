import { canonicalJson, compareCodePoints, floorDivInt, type JsonValue } from '@tianshu/shared';
import type { RegionMap } from '../../schemas/region-map';
import { HEX_DIRECTIONS, hexDistance } from './frame';
import { canTraverseBuildingEdge, isInteriorCell } from './geometry';
import type { CellState, TownDiagnostic, TownWork } from './types';

const issue = (code: string, message: string): TownDiagnostic => ({
  code,
  severity: 'warning',
  message,
});
export function checkI1(work: TownWork): readonly TownDiagnostic[] {
  const ids = work.doors.map(({ buildingId }) => buildingId);
  const cells = work.doors.map(({ outside }) => outside.key);
  const expected = work.plans.filter(({ enterable }) => enterable).map(({ id }) => id);
  return ids.length === expected.length &&
    new Set(ids).size === ids.length &&
    new Set(cells).size === cells.length &&
    expected.every((id) => ids.filter((actual) => actual === id).length === 1)
    ? []
    : [issue('I1', 'each enterable building must have exactly one unique door cell')];
}
function reachable(work: TownWork): Set<string> {
  const spawn = work.objects.find(({ id }) => id === work.primarySpawnId);
  if (spawn === undefined) return new Set();
  const start = work.cells.get(`${spawn.q},${spawn.r}`);
  if (start === undefined) return new Set();
  const seen = new Set([start.key]);
  const queue: CellState[] = [start];
  while (queue.length > 0) {
    const cell = queue.shift()!;
    for (const [dq, dr] of HEX_DIRECTIONS) {
      const next = work.cells.get(`${cell.q + dq},${cell.r + dr}`);
      if (
        next === undefined ||
        seen.has(next.key) ||
        !canTraverseBuildingEdge(cell, next, work.plans)
      )
        continue;
      seen.add(next.key);
      queue.push(next);
    }
  }
  return seen;
}
export function checkI2(work: TownWork): readonly TownDiagnostic[] {
  const seen = reachable(work);
  const unreachable = work.plans.flatMap((plan) =>
    [...work.cells.values()]
      .filter((cell) => isInteriorCell(plan, cell) && !seen.has(cell.key))
      .map(() => plan.id),
  );
  return unreachable.length === 0
    ? []
    : [
        issue(
          'I2',
          `unreachable interiors: ${[...new Set(unreachable)].sort(compareCodePoints).join(',')}`,
        ),
      ];
}
function roundCube(
  qNumerator: number,
  rNumerator: number,
  denominator: number,
): { q: number; r: number } {
  const q0 = floorDivInt(qNumerator, denominator);
  const r0 = floorDivInt(rNumerator, denominator);
  const candidates = [
    { q: q0, r: r0 },
    { q: q0 + 1, r: r0 },
    { q: q0, r: r0 + 1 },
    { q: q0 + 1, r: r0 + 1 },
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
    if (
      error < bestError ||
      (error === bestError &&
        (candidate.r < best.r || (candidate.r === best.r && candidate.q < best.q)))
    ) {
      best = candidate;
      bestError = error;
    }
  }
  return best;
}
function sightLine(
  a: { readonly q: number; readonly r: number },
  b: { readonly q: number; readonly r: number },
): string[] {
  const distance = hexDistance(a, b);
  const result: string[] = [];
  for (let step = 1; step < distance; step += 1) {
    const cell = roundCube(
      a.q * (distance - step) + b.q * step,
      a.r * (distance - step) + b.r * step,
      distance,
    );
    result.push(`${cell.q},${cell.r}`);
  }
  return result;
}
export function hasLineOfSight(
  work: TownWork,
  a: { readonly q: number; readonly r: number },
  b: { readonly q: number; readonly r: number },
): boolean {
  return sightLine(a, b).every((key) => {
    const cell = work.cells.get(key);
    return cell !== undefined && cell.terrain !== 'tr_shibi';
  });
}
export function checkI3(work: TownWork, map: RegionMap): readonly TownDiagnostic[] {
  const objects = work.objects;
  const failed = map.town!.facilities.filter((facility) => {
    return !facility.serviceCells.some((cell) =>
      objects.some(
        (object) =>
          object.class === 'FacilityNpc' &&
          object.facilityKey === facility.key &&
          hexDistance(cell, object) <= object.interactRange &&
          work.cells.get(`${cell.q},${cell.r}`)?.blocked === false &&
          hasLineOfSight(work, cell, object),
      ),
    );
  });
  return failed.length === 0
    ? []
    : [
        issue(
          'I3',
          `facility has no visible service cell: ${failed.map(({ key }) => key).join(',')}`,
        ),
      ];
}
export function checkI4(work: TownWork): readonly TownDiagnostic[] {
  const spawns = new Set(
    work.objects.filter(({ class: kind }) => kind === 'PlayerSpawn').map(({ id }) => id),
  );
  const failed = work.objects.filter(
    (object) => object.class === 'Exit' && !spawns.has(object.spawnId),
  );
  return failed.length === 0
    ? []
    : [issue('I4', `unresolved exit spawn: ${failed.map(({ id }) => id).join(',')}`)];
}
export function checkI5(map: RegionMap): readonly TownDiagnostic[] {
  const slots = (map.bounds.qMax + 1) * (map.bounds.rMax + 1);
  const bytes = Buffer.byteLength(canonicalJson(map as unknown as JsonValue));
  return slots <= 256 * 256 && bytes <= 300 * 1_024
    ? []
    : [issue('I5', `scene budget exceeded: ${slots} slots, ${bytes} bytes`)];
}
export function checkI6(map: RegionMap, repeated: RegionMap): readonly TownDiagnostic[] {
  const first = canonicalJson(map as unknown as JsonValue);
  const second = canonicalJson(repeated as unknown as JsonValue);
  return first === second
    ? []
    : [issue('I6', 'same input did not produce byte-identical canonical JSON')];
}
export const TOWN_INVARIANTS = [checkI1, checkI2, checkI3, checkI4, checkI5, checkI6] as const;
