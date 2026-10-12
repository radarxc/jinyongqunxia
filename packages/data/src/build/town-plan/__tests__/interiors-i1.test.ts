import { readFileSync } from 'node:fs';
import { floorDivInt } from '@tianshu/shared';
import { describe, expect, it } from 'vitest';
import { fixtureKindByName } from '../fixtures';
import { hexCentreMm, localToWorldQuarter, worldToLocalQuarter } from '../frame';
import { isInteriorHexWalkable, reachableInteriorHexes } from '../interiors/hexes';
import { interiorPassageDepthMm, solveInterior, solvePlanInterior } from '../interiors/solver';
import { TAVERN_AISLE_MM, TAVERN_GRID_MM } from '../interiors/tavern';
import { emptyInteriorPlanner, planBuilding } from '../plan-hall';
import { testBuildKit } from '../testing';
import type { InteriorSolveResult } from '../interiors/solver';
import type { FacilityKind, FixtureTuple, RectMm, Yaw4 } from '../types';

const FACILITIES = [
  'general_store',
  'pharmacy',
  'inn',
  'tavern',
  'residence',
  'smithy',
  'stall_goods',
] as const satisfies readonly FacilityKind[];
const ROOMS = [
  [4_400, 3_100],
  [5_300, 3_300],
  [6_800, 4_600],
  [8_800, 6_400],
] as const;
const OFFSETS = [-173, 0, 219] as const;
const DOOR_OFFSETS = [-1_950, -1_200, 0, 1_200, 1_950] as const;
const MIN: Readonly<Record<(typeof FACILITIES)[number], readonly [number, number]>> = {
  general_store: [3_600, 2_800],
  pharmacy: [3_600, 3_000],
  inn: [6_000, 4_600],
  tavern: [6_000, 4_600],
  residence: [3_600, 2_800],
  smithy: [4_400, 3_100],
  stall_goods: [2_600, 1_600],
};
const YAWS = [0, 1, 2, 3] as const;

function mulberry32(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value + 0x6d2b79f5) | 0;
    let word = Math.imul(value ^ (value >>> 15), 1 | value);
    word ^= word + Math.imul(word ^ (word >>> 7), 61 | word);
    return (word ^ (word >>> 14)) >>> 0;
  };
}

function room(width: number, depth: number, yaw: Yaw4, delta: number): RectMm {
  const worldW = yaw === 0 || yaw === 2 ? width : depth;
  const worldD = yaw === 0 || yaw === 2 ? depth : width;
  const x0 = delta - floorDivInt(worldW, 2);
  const z0 = -delta - floorDivInt(worldD, 2);
  return [x0, z0, x0 + worldW, z0 + worldD];
}
function solve(
  facility: FacilityKind,
  width: number,
  depth: number,
  yaw: Yaw4 = 0,
  delta = 0,
  seed = 7,
  doorOffsetMm = 0,
): InteriorSolveResult {
  return solveInterior({
    room: room(width, depth, yaw, delta),
    facility,
    doorOffsetMm,
    doorWidthMm: 1_400,
    seed,
    yaw,
  });
}
function bounds(item: FixtureTuple): RectMm {
  const odd = item[5] === 1 || item[5] === 3;
  const width = odd ? item[4] : item[3];
  const depth = odd ? item[3] : item[4];
  const x0 = item[1] - floorDivInt(width, 2);
  const z0 = item[2] - floorDivInt(depth, 2);
  return [x0, z0, x0 + width, z0 + depth];
}
function overlaps(a: RectMm, b: RectMm): boolean {
  return a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
}
function contains(outer: RectMm, inner: RectMm): boolean {
  return (
    inner[0] >= outer[0] && inner[1] >= outer[1] && inner[2] <= outer[2] && inner[3] <= outer[3]
  );
}
function pointInFixture(x: number, z: number, item: FixtureTuple): boolean {
  const rect = bounds(item);
  return x >= rect[0] && x < rect[2] && z >= rect[1] && z < rect[3];
}
function clearOfFixture(x: number, z: number, item: FixtureTuple): boolean {
  if (item[6] === 0 || item[3] === 0 || item[4] === 0) return true;
  const rect = bounds(item);
  const dx = x < rect[0] ? rect[0] - x : x > rect[2] ? x - rect[2] : 0;
  const dz = z < rect[1] ? rect[1] - z : z > rect[3] ? z - rect[3] : 0;
  return dx * dx + dz * dz >= 250 * 250;
}
function walkableHexes(floors: readonly RectMm[], fixtures: readonly FixtureTuple[]) {
  const output: { q: number; r: number }[] = [];
  for (let q = -12; q <= 12; q += 1)
    for (let r = -10; r <= 10; r += 1) {
      const hex = { q, r };
      if (isInteriorHexWalkable(floors, fixtures, hex)) output.push(hex);
    }
  return output;
}
function nearestHex(
  floors: readonly RectMm[],
  fixtures: readonly FixtureTuple[],
  x: number,
  z: number,
) {
  const candidates = walkableHexes(floors, fixtures);
  let best = candidates[0];
  let bestDistance = Number.MAX_SAFE_INTEGER;
  for (const hex of candidates) {
    const centre = hexCentreMm(hex.q, hex.r);
    const distance =
      (centre[0] > x ? centre[0] - x : x - centre[0]) +
      (centre[1] > z ? centre[1] - z : z - centre[1]);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = hex;
    }
  }
  return best;
}
function entrancePoint(
  depth: number,
  yaw: Yaw4,
  delta: number,
  doorOffsetMm: number,
): readonly [number, number] {
  const local = localToWorldQuarter(doorOffsetMm, floorDivInt(depth, 2) - 300, yaw);
  return [delta + local[0], -delta + local[1]];
}
function passageRect(
  facility: FacilityKind,
  depth: number,
  yaw: Yaw4,
  delta: number,
  doorOffsetMm: number,
): RectMm {
  const local: RectMm = [
    doorOffsetMm - 900,
    floorDivInt(depth, 2) - interiorPassageDepthMm(facility, depth),
    doorOffsetMm + 900,
    floorDivInt(depth, 2),
  ];
  const corners = [
    localToWorldQuarter(local[0], local[1], yaw),
    localToWorldQuarter(local[0], local[3], yaw),
    localToWorldQuarter(local[2], local[1], yaw),
    localToWorldQuarter(local[2], local[3], yaw),
  ];
  const xs = corners.map((point) => point[0] + delta);
  const zs = corners.map((point) => point[1] - delta);
  return [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)];
}
function pointInFloors(x: number, z: number, floors: readonly RectMm[]): boolean {
  return floors.some((floor) => x >= floor[0] && x < floor[2] && z >= floor[1] && z < floor[3]);
}
function squaredDistance(x0: number, z0: number, x1: number, z1: number): number {
  const dx = x1 - x0;
  const dz = z1 - z0;
  return dx * dx + dz * dz;
}

describe('seven integer interior templates', () => {
  it('covers room sizes, four yaws, and three sub-grid offsets without illegal geometry', () => {
    let skipped = 0;
    let exercised = 0;
    for (const facility of FACILITIES)
      for (const [width, depth] of ROOMS) {
        if (width < MIN[facility][0] || depth < MIN[facility][1]) {
          skipped += 1;
          continue;
        }
        for (const yaw of YAWS)
          for (const delta of OFFSETS) {
            exercised += 1;
            const original = room(width, depth, yaw, delta);
            const solved = solve(facility, width, depth, yaw, delta);
            const physical = solved.fixtures.filter((item) => item[3] > 0 && item[4] > 0);
            for (const item of physical)
              expect(
                contains(original, bounds(item)),
                `${facility} ${width}x${depth} yaw=${yaw} item=${item[0]}`,
              ).toBe(true);
            const blockers = physical.filter((item) => item[6] === 1);
            for (let a = 0; a < blockers.length; a += 1)
              for (let b = a + 1; b < blockers.length; b += 1) {
                expect(
                  overlaps(bounds(blockers[a]!), bounds(blockers[b]!)),
                  `${facility} overlap ${blockers[a]![0]}/${blockers[b]![0]}`,
                ).toBe(false);
              }
            if (facility === 'stall_goods') {
              expect(solved.floors).toEqual([]);
              expect(solved.fixtures.find((item) => item[0] === 204)?.[5]).toBe(yaw);
              continue;
            }
            const passage = passageRect(facility, depth, yaw, delta, 0);
            for (const item of blockers)
              expect(
                overlaps(bounds(item), passage),
                `${facility} door passage yaw=${yaw} delta=${delta} item=${item[0]}`,
              ).toBe(false);
            const staffIdx =
              facility === 'residence' ? undefined : facility === 'smithy' ? 209 : 200;
            if (staffIdx !== undefined) {
              const staff = solved.fixtures.find((item) => item[0] === staffIdx)!;
              expect(staff[5], `${facility} staff facing yaw=${yaw}`).toBe(yaw);
              if (staffIdx === 200) {
                expect(
                  solved.floors.some(
                    (floor) =>
                      staff[1] >= floor[0] &&
                      staff[1] < floor[2] &&
                      staff[2] >= floor[1] &&
                      staff[2] < floor[3],
                  ),
                ).toBe(false);
                const counter = solved.fixtures.find((item) => item[0] === 0)!;
                const localDelta = worldToLocalQuarter(
                  staff[1] - counter[1],
                  staff[2] - counter[2],
                  yaw,
                );
                expect(localDelta[1], `${facility} keeper behind counter yaw=${yaw}`).toBeLessThan(
                  0,
                );
                const halfWidth = floorDivInt(counter[3], 2);
                const rear = -floorDivInt(counter[4], 2);
                for (const dx of [-halfWidth + 1, 0, halfWidth - 1])
                  for (const dz of [rear - 1, rear - 799]) {
                    const offset = localToWorldQuarter(dx, dz, yaw);
                    const x = counter[1] + offset[0];
                    const z = counter[2] + offset[1];
                    expect(
                      solved.floors.some(
                        (floor) => x >= floor[0] && x < floor[2] && z >= floor[1] && z < floor[3],
                      ),
                      `${facility} keeper aisle yaw=${yaw} delta=${delta} dx=${dx} dz=${dz}`,
                    ).toBe(false);
                  }
              }
            }
            const customer = solved.fixtures.find((item) => item[0] === 201);
            if (customer !== undefined) {
              expect(
                solved.floors.some(
                  (floor) =>
                    customer[1] >= floor[0] &&
                    customer[1] < floor[2] &&
                    customer[2] >= floor[1] &&
                    customer[2] < floor[3],
                ),
              ).toBe(true);
              const entry = entrancePoint(depth, yaw, delta, 0);
              const entranceHex = nearestHex(solved.floors, solved.fixtures, entry[0], entry[1]);
              const customerHex = nearestHex(
                solved.floors,
                solved.fixtures,
                customer[1],
                customer[2],
              );
              expect(entranceHex).toBeDefined();
              expect(customerHex).toBeDefined();
              const reached = reachableInteriorHexes(solved.floors, solved.fixtures, entranceHex!);
              expect(
                reached,
                `${facility} entrance/customer yaw=${yaw} delta=${delta}`,
              ).toContainEqual(customerHex);
              // tech/16 §8.2 rule 5: the customer zone (door side of the counter front face) holds at
              // least two C6 cells reachable from the entrance.
              const counter = solved.fixtures.find((item) => item[0] === 0);
              const customerRegion = reached.filter((hex) => {
                if (counter === undefined) return true;
                const [hx, hz] = hexCentreMm(hex.q, hex.r);
                const local = worldToLocalQuarter(hx - counter[1], hz - counter[2], yaw);
                return local[1] >= counter[4] - floorDivInt(counter[4], 2);
              });
              expect(
                customerRegion.length,
                `${facility} ${width}x${depth} customer region yaw=${yaw} delta=${delta}`,
              ).toBeGreaterThanOrEqual(2);
            }
          }
      }
    expect({ skipped, exercised }).toEqual({ skipped: 4, exercised: 288 });
  });

  it('keeps the door passage clear of blocking furniture', () => {
    for (const facility of FACILITIES)
      for (const [width, depth] of ROOMS) {
        if (width < MIN[facility][0] || depth < MIN[facility][1]) continue;
        for (const yaw of YAWS)
          for (const delta of OFFSETS)
            for (const doorOffset of DOOR_OFFSETS) {
              const limit = floorDivInt(width - 1_400, 2);
              if (doorOffset < -limit || doorOffset > limit) continue;
              const solved = solve(facility, width, depth, yaw, delta, 7, doorOffset);
              const passage = passageRect(facility, depth, yaw, delta, doorOffset);
              if (facility === 'stall_goods') {
                expect(solved.floors).toEqual([]);
                continue;
              }
              for (const item of solved.fixtures.filter((entry) => entry[6] === 1)) {
                expect(
                  overlaps(bounds(item), passage),
                  `${facility} ${width}x${depth} yaw=${yaw} delta=${delta} door=${doorOffset} item=${item[0]}`,
                ).toBe(false);
              }
            }
      }
  });

  it('keeps inn stair mirrors and smithy side fixtures clear of an offset passage', () => {
    for (const facility of ['inn', 'smithy'] as const)
      for (const seed of [0, 1]) {
        const solved = solve(facility, 6_800, 4_600, 0, 0, seed, -1_200);
        const passage = passageRect(facility, 4_600, 0, 0, -1_200);
        for (const item of solved.fixtures.filter((entry) => entry[6] === 1)) {
          expect(overlaps(bounds(item), passage), `${facility} seed=${seed} item=${item[0]}`).toBe(
            false,
          );
        }
      }
    const tavern = solve('tavern', 6_800, 4_600, 0, 0, 7, -1_200);
    for (const item of tavern.fixtures.filter((entry) => entry[6] === 1)) {
      expect(overlaps(bounds(item), [-2_100, 900, 900, 2_300]), `tavern item=${item[0]}`).toBe(
        false,
      );
    }
  });

  it('passes a non-zero entrance offset from planBuilding into the default interior solver', () => {
    const kit = testBuildKit(
      readFileSync(
        new URL('../../../../../../content/town/buildkits/song_dali.yaml', import.meta.url),
        'utf8',
      ),
    );
    const input = {
      id: 'b_offset',
      type: 'bld_kit_song_dali_restaurant',
      originCell: [0, 0],
      sizeCells: [9, 7],
      entranceCell: [1, -1],
      enterable: true,
      baseYMm: 0,
    } as const;
    const frame = { heightCells: 160, originXMm: 0, originZMm: 0 } as const;
    const plan = planBuilding(input, kit, 7, frame);
    const empty = planBuilding(input, kit, 7, frame, { interior: emptyInteriorPlanner });
    expect(plan.entrances[0]?.[1]).not.toBe(0);
    const solved = solvePlanInterior(empty);
    expect(plan.fixtures).toEqual(solved.fixtures);
    const roomRect = empty.floors[0]!;
    const centreX = floorDivInt(roomRect[0] + roomRect[2], 2);
    const centreZ = floorDivInt(roomRect[1] + roomRect[3], 2);
    const entrance = empty.entrances[0]!;
    const halfDoor = floorDivInt(entrance[2], 2);
    const localPassage: RectMm = [
      entrance[1] - halfDoor - 200,
      floorDivInt(empty.footprint[3], 2) - 1_400,
      entrance[1] + halfDoor + 200,
      floorDivInt(empty.footprint[3], 2),
    ];
    const passage: RectMm = [
      localPassage[0] + centreX,
      localPassage[1] + centreZ,
      localPassage[2] + centreX,
      localPassage[3] + centreZ,
    ];
    for (const item of plan.fixtures.filter((entry) => entry[6] === 1)) {
      expect(overlaps(bounds(item), passage), `integrated fixture=${item[0]}`).toBe(false);
    }
  });

  it('removes shop keeper aisles from floors and faces keeper toward the door', () => {
    for (const facility of ['general_store', 'pharmacy', 'inn', 'tavern'] as const) {
      const solved = solve(facility, 8_800, 6_400);
      const keeper = solved.fixtures.find((item) => item[0] === 200)!;
      expect(keeper[5]).toBe(0);
      expect(
        solved.floors.some(
          (floor) =>
            keeper[1] >= floor[0] &&
            keeper[1] < floor[2] &&
            keeper[2] >= floor[1] &&
            keeper[2] < floor[3],
        ),
      ).toBe(false);
    }
  });

  it('checks 96 fixed-seed mulberry32 geometry samples', () => {
    const next = mulberry32(0x1a7e2101);
    for (let index = 0; index < 96; index += 1) {
      const facility = FACILITIES[next() % FACILITIES.length]!;
      const minimum = MIN[facility];
      const width = minimum[0] + 2 * (next() % floorDivInt(8_800 - minimum[0], 2));
      const depth = minimum[1] + 2 * (next() % floorDivInt(6_400 - minimum[1], 2));
      const yaw = (next() % 4) as Yaw4;
      const delta = (next() % 501) - 250;
      const original = room(width, depth, yaw, delta);
      const solved = solve(facility, width, depth, yaw, delta, next());
      const blockers = solved.fixtures.filter((item) => item[6] === 1);
      for (const item of blockers)
        expect(
          contains(original, bounds(item)),
          `sample=${index} ${facility} ${width}x${depth} yaw=${yaw} delta=${delta} item=${item[0]}`,
        ).toBe(true);
      for (let a = 0; a < blockers.length; a += 1)
        for (let b = a + 1; b < blockers.length; b += 1) {
          expect(
            overlaps(bounds(blockers[a]!), bounds(blockers[b]!)),
            `sample=${index} ${facility} ${width}x${depth} fixtures=${blockers[a]![0]}/${blockers[b]![0]}`,
          ).toBe(false);
        }
      if (facility !== 'stall_goods')
        for (const item of blockers) {
          expect(
            overlaps(bounds(item), passageRect(facility, depth, yaw, delta, 0)),
            `sample=${index} ${facility} ${width}x${depth} yaw=${yaw} delta=${delta} passage item=${item[0]}`,
          ).toBe(false);
        }
    }
  });
});

describe('C6 integer hex walking', () => {
  it('BFS reaches a customer-side target from an entrance-side start', () => {
    const floors: readonly RectMm[] = [[-2_800, -2_300, 2_800, 2_300]];
    const fixtures: readonly FixtureTuple[] = [[0, 0, -900, 2_000, 550, 0, 1]];
    const reached = reachableInteriorHexes(floors, fixtures, { q: 0, r: 1 });
    expect(reached).toContainEqual({ q: 0, r: 2 });
    expect(reached.length).toBeGreaterThanOrEqual(2);
  });

  it('requires edge midpoints to remain in the floor union', () => {
    const separated: readonly RectMm[] = [
      [-700, -300, 700, 300],
      [300, 700, 2_000, 1_300],
    ];
    expect(isInteriorHexWalkable(separated, [], { q: 0, r: 0 })).toBe(true);
    expect(isInteriorHexWalkable(separated, [], { q: 0, r: 1 })).toBe(true);
    expect(reachableInteriorHexes(separated, [], { q: 0, r: 0 })).not.toContainEqual({
      q: 0,
      r: 1,
    });
  });

  it('accepts exact 250 mm clearance symmetrically on all four floor edges', () => {
    const exact: readonly RectMm[][] = [
      [[-250, -500, 1_000, 500]],
      [[-1_000, -500, 250, 500]],
      [[-500, -250, 500, 1_000]],
      [[-500, -1_000, 500, 250]],
    ];
    for (const floors of exact)
      expect(isInteriorHexWalkable(floors, [], { q: 0, r: 0 })).toBe(true);
    expect(isInteriorHexWalkable([[-249, -500, 251, 500]], [], { q: 0, r: 0 })).toBe(false);
    expect(isInteriorHexWalkable([[-251, -500, 249, 500]], [], { q: 0, r: 0 })).toBe(false);
    expect(isInteriorHexWalkable([[-500, -249, 500, 251]], [], { q: 0, r: 0 })).toBe(false);
    expect(isInteriorHexWalkable([[-500, -251, 500, 249]], [], { q: 0, r: 0 })).toBe(false);
  });

  it('rejects a point within 250 mm of a concave floor-union corner', () => {
    const concave: readonly RectMm[] = [
      [-1_000, -1_000, 1_000, 100],
      [-1_000, 100, 100, 1_000],
    ];
    expect(isInteriorHexWalkable(concave, [], { q: 0, r: 0 })).toBe(false);
  });

  it('does not block a hex for clutter at or below 250 mm', () => {
    const floors: readonly RectMm[] = [[-1_000, -1_000, 1_000, 1_000]];
    const low: FixtureTuple = [33, 0, 0, 500, 500, 0, 1];
    const high: FixtureTuple = [23, 0, 0, 500, 500, 0, 1];
    expect(fixtureKindByName('cushion').hMm).toBeLessThanOrEqual(250);
    expect(isInteriorHexWalkable(floors, [low], { q: 0, r: 0 })).toBe(true);
    expect(isInteriorHexWalkable(floors, [high], { q: 0, r: 0 })).toBe(false);
  });

  it('keeps exact 250 mm fixture clearance symmetric on every side', () => {
    const floors: readonly RectMm[] = [[-3_000, -3_000, 3_000, 3_000]];
    const exact: readonly FixtureTuple[] = [
      [23, -550, 0, 600, 600, 0, 1],
      [23, 550, 0, 600, 600, 0, 1],
      [23, 0, -550, 600, 600, 0, 1],
      [23, 0, 550, 600, 600, 0, 1],
    ];
    for (const item of exact)
      expect(isInteriorHexWalkable(floors, [item], { q: 0, r: 0 })).toBe(true);
    expect(isInteriorHexWalkable(floors, [[23, 549, 0, 600, 600, 0, 1]], { q: 0, r: 0 })).toBe(
      false,
    );
  });
});

describe('degradation, formulae, seeds and pending templates', () => {
  it('degrades a narrow 3.2 by 3.1 store in order while retaining counter and keeper', () => {
    const solved = solve('general_store', 3_200, 3_100);
    expect(solved.diagnostics.map((item) => item.code)).toContain('INTERIOR_DEGRADED');
    expect(solved.fixtures.some((item) => item[0] === 0)).toBe(true);
    expect(solved.fixtures.some((item) => item[0] === 200)).toBe(true);
    expect(solved.fixtures.some((item) => item[0] === 41)).toBe(false);
    expect(solved.fixtures.filter((item) => item[0] === 2)).toHaveLength(1);
  });

  it('falls back to a back-wall keeper when a store is shallower than 2.8 m (ruling 2026-10-12)', () => {
    // Below the 2.8 m template minimum the keeper stands at the back wall without a counter.
    const solved = solve('general_store', 3_000, 2_400);
    expect(solved.fixtures.map((item) => item[0])).toEqual([200]);
    expect(solved.diagnostics[0]?.code).toBe('INTERIOR_ROOM_BELOW_MINIMUM');
  });

  it('falls back below the degradation envelope and marks i2 facilities pending', () => {
    const tiny = solve('general_store', 2_500, 2_000);
    expect(tiny.fixtures.map((item) => item[0])).toEqual([200]);
    expect(tiny.diagnostics[0]?.code).toBe('INTERIOR_ROOM_BELOW_MINIMUM');
    const pending = solve('temple', 4_400, 3_100);
    expect(pending.fixtures).toEqual([]);
    expect(pending.diagnostics[0]?.code).toBe('INTERIOR_TEMPLATE_PENDING');
  });

  it('places the 4.4 by 3.1 pharmacy cabinet full-width and counter on the formula line', () => {
    const solved = solve('pharmacy', 4_400, 3_100);
    expect(solved.fixtures.find((item) => item[0] === 3)).toEqual([3, 0, -1_325, 4_400, 450, 0, 1]);
    const counter = solved.fixtures.find((item) => item[0] === 0)!;
    expect(counter[2]).toBe(-125);
    expect(counter[2]).toBe(-1_550 + 450 + 800 + floorDivInt(counter[4], 2));
  });

  it.each([
    // [width, depth, back shelf, passage depth] per the 2026-10-12 coordinator ruling.
    [4_400, 3_100, 300, 1_400],
    [5_300, 3_300, 400, 1_400],
    [3_600, 2_800, 300, 1_150],
  ] as const)(
    'keeps the %i by %i store aisle at 800 and counter at 550 (shelf %i, passage %i)',
    (width, depth, shelf, passageDepth) => {
      const solved = solve('general_store', width, depth);
      const counter = solved.fixtures.find((item) => item[0] === 0)!;
      const backShelf = solved.fixtures.find((item) => item[0] === 2 && item[3] === width)!;
      const roomBack = -floorDivInt(depth, 2);
      expect(backShelf[4]).toBe(shelf);
      expect(counter[4]).toBe(550);
      const counterRear = counter[2] - floorDivInt(counter[4], 2);
      const counterFront = counterRear + counter[4];
      expect(counterRear - (roomBack + shelf)).toBe(800);
      expect(interiorPassageDepthMm('general_store', depth)).toBe(passageDepth);
      expect(counterFront).toBeLessThanOrEqual(depth - floorDivInt(depth, 2) - passageDepth);
    },
  );

  it('keeps each inn table and two adjacent full-size stools within 1600 by 1600', () => {
    for (const [width, depth] of [
      [6_800, 4_600],
      [8_800, 6_400],
    ] as const) {
      const solved = solve('inn', width, depth);
      const stools = solved.fixtures.filter((item) => item[0] === 9);
      for (const table of solved.fixtures.filter((item) => item[0] === 7)) {
        const adjacent = stools.filter(
          (stool) => Math.abs(stool[1] - table[1]) + Math.abs(stool[2] - table[2]) === 700,
        );
        expect(adjacent, `${width}x${depth} table ${table[1]},${table[2]}`).toHaveLength(2);
        const extents = [table, ...adjacent].map(bounds);
        const x0 = Math.min(...extents.map((rect) => rect[0]));
        const z0 = Math.min(...extents.map((rect) => rect[1]));
        const x1 = Math.max(...extents.map((rect) => rect[2]));
        const z1 = Math.max(...extents.map((rect) => rect[3]));
        expect(x1 - x0).toBeLessThanOrEqual(1_600);
        expect(z1 - z0).toBeLessThanOrEqual(1_600);
      }
    }
  });

  it('keeps tavern tables on the 2.4 m lattice with 900 mm between sets and off the walkway', () => {
    for (const [width, depth, minTables] of [
      [6_000, 4_600, 1],
      [6_800, 4_600, 2],
      [8_800, 6_400, 3],
    ] as const)
      for (const yaw of YAWS)
        for (const delta of OFFSETS) {
          const solved = solve('tavern', width, depth, yaw, delta);
          const tables = solved.fixtures.filter((item) => item[0] === 7);
          const stage = solved.fixtures.filter((item) => item[0] === 42);
          const label = `tavern ${width}x${depth} yaw=${yaw} delta=${delta}`;
          expect(tables.length, label).toBeGreaterThanOrEqual(minTables);
          for (const a of tables)
            for (const b of tables) {
              expect(Math.abs(a[1] - b[1]) % TAVERN_GRID_MM, `${label} grid x`).toBe(0);
              expect(Math.abs(a[2] - b[2]) % TAVERN_GRID_MM, `${label} grid z`).toBe(0);
            }
          const sets = [...tables, ...stage];
          for (let i = 0; i < sets.length; i += 1)
            for (let j = i + 1; j < sets.length; j += 1) {
              const a = bounds(sets[i]!);
              const b = bounds(sets[j]!);
              const gap = Math.max(b[0] - a[2], a[0] - b[2], b[1] - a[3], a[1] - b[3]);
              expect(gap, `${label} gap ${sets[i]![0]}/${sets[j]![0]}`).toBeGreaterThanOrEqual(
                TAVERN_AISLE_MM,
              );
            }
          if (depth >= 6_000) expect(stage, `${label} stage`).toHaveLength(1);
          // Main walkway: the door passage widened back to the counter front face.
          const counter = solved.fixtures.find((item) => item[0] === 0)!;
          const passage = passageRect('tavern', depth, yaw, delta, 0);
          for (const item of sets) {
            const [cx, cz] = [item[1], item[2]];
            // Tables and the stage are placed with local yaw 0, so item[3] runs across the room and
            // item[4] runs front to back in the door-facing frame.
            const local = worldToLocalQuarter(cx - counter[1], cz - counter[2], yaw);
            const counterFront = counter[4] - floorDivInt(counter[4], 2);
            expect(
              local[1] - floorDivInt(item[4], 2) - counterFront,
              `${label} counter-front aisle ${item[0]}`,
            ).toBeGreaterThanOrEqual(TAVERN_AISLE_MM);
            expect(overlaps(bounds(item), passage), `${label} passage ${item[0]}`).toBe(false);
            const across = worldToLocalQuarter(
              cx - floorDivInt(passage[0] + passage[2], 2),
              cz - floorDivInt(passage[1] + passage[3], 2),
              yaw,
            )[0];
            expect(
              Math.abs(across) - floorDivInt(item[3], 2),
              `${label} walkway ${item[0]}`,
            ).toBeGreaterThanOrEqual(900);
          }
        }
  });

  it('keeps the first two geometrically legal guest stations approachable within 1200 mm', () => {
    const inaccessible: string[] = [];
    for (const [width, depth] of [
      [6_000, 4_600],
      [6_800, 4_600],
      [8_800, 6_400],
    ] as const)
      for (const yaw of YAWS)
        for (const delta of OFFSETS) {
          const solved = solve('tavern', width, depth, yaw, delta);
          const tables = solved.fixtures.filter((item) => item[0] === 7);
          const guests = solved.fixtures.filter((item) => item[0] === 212);
          const counter = solved.fixtures.find((item) => item[0] === 0)!;
          const blockers = solved.fixtures.filter((item) => item[6] === 1);
          const roomRect = room(width, depth, yaw, delta);
          const entry = entrancePoint(depth, yaw, delta, 0);
          const start = nearestHex(solved.floors, solved.fixtures, entry[0], entry[1]);
          const reached = reachableInteriorHexes(solved.floors, solved.fixtures, start!);
          const label = `tavern guests ${width}x${depth} yaw=${yaw} delta=${delta}`;
          for (const table of tables) {
            const seats = guests.filter(
              (guest) => Math.abs(guest[1] - table[1]) + Math.abs(guest[2] - table[2]) === 800,
            );
            const candidates = (
              [
                [-800, 0, 3],
                [800, 0, 1],
                [0, 800, 2],
                [0, -800, 0],
              ] as const
            )
              .map(([x, z, localYaw]) => {
                const offset = localToWorldQuarter(x, z, yaw);
                return [table[1] + offset[0], table[2] + offset[1], (localYaw + yaw) % 4] as const;
              })
              .filter(([x, z]) => {
                const local = worldToLocalQuarter(x - counter[1], z - counter[2], yaw);
                return (
                  pointInFloors(x, z, solved.floors) &&
                  x >= roomRect[0] + 300 &&
                  x <= roomRect[2] - 300 &&
                  z >= roomRect[1] + 300 &&
                  z <= roomRect[3] - 300 &&
                  !(local[0] >= -900 && local[0] < 900 && local[1] >= 275) &&
                  blockers.every((item) => clearOfFixture(x, z, item))
                );
              });
            expect(seats.length, label).toBe(Math.min(2, candidates.length));
            expect(
              seats.map((seat) => [seat[1], seat[2], seat[5]]),
              label,
            ).toEqual(candidates.slice(0, 2));
            for (const seat of seats) {
              expect(pointInFixture(seat[1], seat[2], table), label).toBe(false);
              const toward = worldToLocalQuarter(table[1] - seat[1], table[2] - seat[2], yaw);
              const localYaw = toward[0] > 0 ? 3 : toward[0] < 0 ? 1 : toward[1] > 0 ? 0 : 2;
              expect(seat[5], `${label} guest faces table`).toBe((localYaw + yaw) % 4);
              const local = worldToLocalQuarter(seat[1] - counter[1], seat[2] - counter[2], yaw);
              expect(local[0] >= -900 && local[0] < 900 && local[1] >= 275, label).toBe(false);
              const nearestReached = Math.min(
                ...reached.map((hex) => {
                  const centre = hexCentreMm(hex.q, hex.r);
                  return squaredDistance(seat[1], seat[2], centre[0], centre[1]);
                }),
              );
              if (nearestReached > 1_200 * 1_200)
                inaccessible.push(`${label} guest=${seat[1]},${seat[2]} d2=${nearestReached}`);
            }
          }
        }
    expect(inaccessible).toEqual([]);
  });

  it('is byte deterministic and uses the interior seed to mirror the inn stair', () => {
    expect(JSON.stringify(solve('inn', 8_800, 6_400, 0, 0, 17))).toBe(
      JSON.stringify(solve('inn', 8_800, 6_400, 0, 0, 17)),
    );
    const left = solve('inn', 8_800, 6_400, 0, 0, 0).fixtures.find((item) => item[0] === 14)!;
    const right = solve('inn', 8_800, 6_400, 0, 0, 1).fixtures.find((item) => item[0] === 14)!;
    expect(left[1]).toBe(-right[1]);
  });
});

describe('compact output and source guard', () => {
  it('measures the 6 by 5 shop interior payload against the 700 byte target', () => {
    const solved = solve('general_store', 4_400, 3_100);
    const payload = { floors: solved.floors, fixtures: solved.fixtures };
    expect(JSON.stringify(payload).length).toBeLessThanOrEqual(700);
  });

  it('keeps a complete 6 by 5 shop plan within 700 bytes', () => {
    const kit = testBuildKit(
      readFileSync(
        new URL('../../../../../../content/town/buildkits/song_dali.yaml', import.meta.url),
        'utf8',
      ),
    );
    const plan = planBuilding(
      {
        id: 'b',
        type: 'bld_kit_song_dali_shop',
        originCell: [0, 0],
        sizeCells: [6, 5],
        entranceCell: [3, -1],
        enterable: true,
        baseYMm: 0,
      },
      kit,
      10,
      { heightCells: 160, originXMm: 0, originZMm: 0 },
    );
    const bytes = JSON.stringify(plan).length;
    expect(bytes).toBeLessThanOrEqual(700);
  });

  it('keeps the complete default furnished plan byte deterministic', () => {
    const kit = testBuildKit(
      readFileSync(
        new URL('../../../../../../content/town/buildkits/song_dali.yaml', import.meta.url),
        'utf8',
      ),
    );
    const input = {
      id: 'b_deterministic',
      type: 'bld_kit_song_dali_shop',
      originCell: [2, 3],
      sizeCells: [6, 5],
      entranceCell: [4, 2],
      enterable: true,
      baseYMm: 0,
    } as const;
    const frame = { heightCells: 160, originXMm: 0, originZMm: 0 } as const;
    expect(JSON.stringify(planBuilding(input, kit, 10, frame))).toBe(
      JSON.stringify(planBuilding(input, kit, 10, frame)),
    );
  });

  it('keeps other complete furnished building plans within 1600 bytes', () => {
    const kit = testBuildKit(
      readFileSync(
        new URL('../../../../../../content/town/buildkits/song_dali.yaml', import.meta.url),
        'utf8',
      ),
    );
    const sizes = [
      [6, 5],
      [7, 5],
      [9, 7],
      [11, 8],
    ] as const;
    const frame = { heightCells: 160, originXMm: 0, originZMm: 0 } as const;
    for (const facility of FACILITIES)
      for (let roomIndex = 0; roomIndex < ROOMS.length; roomIndex += 1) {
        const [width, depth] = ROOMS[roomIndex]!;
        if (width === 4_400 && depth === 3_100 && facility === 'general_store') continue;
        if (width < MIN[facility][0] || depth < MIN[facility][1]) continue;
        const size = sizes[roomIndex]!;
        const stall = facility === 'stall_goods';
        const plan = planBuilding(
          {
            id: `b_${facility}_${roomIndex}`,
            type: stall ? 'bld_kit_song_dali_market_stall' : 'bld_kit_song_dali_shop',
            originCell: [0, 0],
            sizeCells: size,
            entranceCell: [floorDivInt(size[0], 2), -1],
            enterable: !stall,
            baseYMm: 0,
            facility,
          },
          kit,
          10,
          frame,
        );
        expect(plan.fixtures.length, `${facility} ${width}x${depth} fixtures`).toBeGreaterThan(0);
        const bytes = JSON.stringify(plan).length;
        expect(bytes, `${facility} ${width}x${depth}`).toBeLessThanOrEqual(1_600);
      }
  });

  it('keeps every i1 implementation free of arithmetic slash and forbidden APIs', () => {
    const names = [
      'solver',
      'hexes',
      'general-store',
      'pharmacy',
      'inn',
      'tavern',
      'residence',
      'smithy',
      'stall',
    ];
    for (const name of names) {
      const source = readFileSync(new URL(`../interiors/${name}.ts`, import.meta.url), 'utf8');
      expect(source, name).not.toMatch(/Math\.|new Date|\bsqrt\b|\bpow\b|\brandom\b|\batan\b/);
      expect(source, name).not.toMatch(new RegExp(' [/] ', 'u'));
    }
    const testSource = readFileSync(new URL('./interiors-i1.test.ts', import.meta.url), 'utf8');
    expect(testSource, 'interiors-i1.test').not.toMatch(new RegExp(' [/] ', 'u'));
  });

  it('wires the populated interior solver as planBuilding default', () => {
    const source = readFileSync(new URL('../plan-hall.ts', import.meta.url), 'utf8');
    expect(source).toContain('options.interior ?? defaultInteriorPlanner');
  });

  it('populates a non-enterable stall through the default planner', () => {
    const kit = testBuildKit(
      readFileSync(
        new URL('../../../../../../content/town/buildkits/song_dali.yaml', import.meta.url),
        'utf8',
      ),
    );
    const plan = planBuilding(
      {
        id: 'bi_stall',
        type: 'bld_kit_song_dali_market_stall',
        originCell: [0, 0],
        sizeCells: [3, 2],
        entranceCell: [1, -1],
        enterable: false,
        baseYMm: 0,
      },
      kit,
      9,
      { heightCells: 20, originXMm: 0, originZMm: 0 },
    );
    expect(plan.floors).toEqual([]);
    expect(plan.fixtures.map((item) => item[0])).toContain(204);
    expect(plan.fixtures.map((item) => item[0])).toContain(201);
  });

  it('anchors generated grid centres to frame hexCentreMm', () => {
    expect(hexCentreMm(0, 0)).toEqual([0, 0]);
    expect(hexCentreMm(1, 0)).toEqual([1_155, 0]);
  });
});
