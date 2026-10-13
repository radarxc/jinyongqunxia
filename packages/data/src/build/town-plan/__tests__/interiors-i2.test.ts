import { readFileSync } from 'node:fs';
import { floorDivInt } from '@tianshu/shared';
import { describe, expect, it } from 'vitest';
import { fixtureKindByName } from '../fixtures';
import { hexCentreMm, localToWorldQuarter } from '../frame';
import { isInteriorHexWalkable, reachableInteriorHexes } from '../interiors/hexes';
import { ESCORT_CENTRAL_AISLE_MM } from '../interiors/escort';
import { interiorPassageDepthMm, solveInterior } from '../interiors/solver';
import { planBuilding } from '../plan-hall';
import { testBuildKit } from '../testing';
import type { InteriorSolveResult } from '../interiors/solver';
import type { FacilityKind, FixtureTuple, RectMm, Yaw4 } from '../types';

const FACILITIES = [
  'cloth',
  'books',
  'pawnshop',
  'bank',
  'escort',
  'school',
  'temple',
  'office',
  'casino',
  'stable',
  'storehouse',
  'guardhouse',
] as const satisfies readonly FacilityKind[];
const ROOMS = [
  [4_400, 3_100],
  [5_300, 3_300],
  [6_800, 4_600],
  [8_800, 6_400],
] as const;
const MIN: Readonly<Record<(typeof FACILITIES)[number], readonly [number, number]>> = {
  cloth: [3_600, 2_800],
  books: [3_600, 2_800],
  pawnshop: [4_400, 3_100],
  bank: [4_400, 3_100],
  escort: [6_000, 4_600],
  school: [6_000, 4_600],
  temple: [3_000, 2_400],
  office: [8_000, 6_000],
  casino: [6_000, 4_600],
  stable: [3_600, 2_800],
  storehouse: [3_600, 2_800],
  guardhouse: [3_600, 2_800],
};
const YAWS = [0, 1, 2, 3] as const;
const OFFSETS = [-173, 0, 219] as const;

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
): InteriorSolveResult {
  return solveInterior({
    room: room(width, depth, yaw, delta),
    facility,
    doorOffsetMm: 0,
    doorWidthMm: 1_400,
    seed: 7,
    yaw,
    extendedTemplates: true,
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
function passage(depth: number, yaw: Yaw4, delta: number, facility: FacilityKind): RectMm {
  const local: RectMm = [
    -900,
    floorDivInt(depth, 2) - interiorPassageDepthMm(facility, depth),
    900,
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
  let distance = Number.MAX_SAFE_INTEGER;
  for (const hex of candidates) {
    const centre = hexCentreMm(hex.q, hex.r);
    const next =
      (centre[0] > x ? centre[0] - x : x - centre[0]) +
      (centre[1] > z ? centre[1] - z : z - centre[1]);
    if (next < distance) {
      best = hex;
      distance = next;
    }
  }
  return best;
}
function pointInFloors(x: number, z: number, floors: readonly RectMm[]): boolean {
  return floors.some((floor) => x >= floor[0] && x < floor[2] && z >= floor[1] && z < floor[3]);
}
function entry(depth: number, yaw: Yaw4, delta: number): readonly [number, number] {
  const local = localToWorldQuarter(0, floorDivInt(depth, 2) - 300, yaw);
  return [delta + local[0], -delta + local[1]];
}

describe('twelve integer interior templates', () => {
  it('enables extended templates through the production planBuilding path', () => {
    const kit = testBuildKit(
      readFileSync(
        new URL('../../../../../../content/town/buildkits/song_dali.yaml', import.meta.url),
        'utf8',
      ),
    );
    const plan = planBuilding(
      {
        id: 'bi_temple',
        type: 'bld_kit_song_dali_temple_hall',
        originCell: [0, 0],
        sizeCells: [11, 9],
        entranceCell: [5, -1],
        enterable: true,
        baseYMm: 0,
      },
      kit,
      7,
      { heightCells: 20, originXMm: 0, originZMm: 0 },
    );
    expect(plan.facility).toBe('temple');
    expect(plan.fixtures.map((item) => item[0])).toContain(30);
  });

  it('covers four rooms, four yaws, and three offsets with explicit minimum degradation', () => {
    let full = 0;
    let degraded = 0;
    for (const facility of FACILITIES)
      for (const [width, depth] of ROOMS)
        for (const yaw of YAWS)
          for (const delta of OFFSETS) {
            const solved = solve(facility, width, depth, yaw, delta);
            if (width < MIN[facility][0] || depth < MIN[facility][1]) {
              degraded += 1;
              expect(solved.diagnostics.length, `${facility} ${width}x${depth}`).toBeGreaterThan(0);
              continue;
            }
            full += 1;
            expect(solved.diagnostics).toEqual([]);
            const roomRect = room(width, depth, yaw, delta);
            const physical = solved.fixtures.filter((item) => item[3] > 0 && item[4] > 0);
            for (const item of physical)
              expect(contains(roomRect, bounds(item)), `${facility} fixture ${item[0]}`).toBe(true);
            const blockers = physical.filter((item) => item[6] === 1);
            for (let a = 0; a < blockers.length; a += 1)
              for (let b = a + 1; b < blockers.length; b += 1)
                expect(
                  overlaps(bounds(blockers[a]!), bounds(blockers[b]!)),
                  `${facility} overlap ${blockers[a]![0]}/${blockers[b]![0]}`,
                ).toBe(false);
            const doorPassage = passage(depth, yaw, delta, facility);
            for (const item of blockers)
              expect(overlaps(bounds(item), doorPassage), `${facility} passage ${item[0]}`).toBe(
                false,
              );
          }
    expect({ full, degraded }).toEqual({ full: 468, degraded: 108 });
  });

  it('keeps visitor stations reachable and counter staff outside floors', () => {
    const counterFacilities = ['cloth', 'books', 'pawnshop', 'bank', 'casino'] as const;
    for (const facility of FACILITIES)
      for (const [width, depth] of ROOMS) {
        if (width < MIN[facility][0] || depth < MIN[facility][1]) continue;
        for (const yaw of YAWS)
          for (const delta of OFFSETS) {
            const solved = solve(facility, width, depth, yaw, delta);
            const customer = solved.fixtures.find((item) => item[0] === 201)!;
            expect(pointInFloors(customer[1], customer[2], solved.floors), facility).toBe(true);
            const door = entry(depth, yaw, delta);
            const start = nearestHex(solved.floors, solved.fixtures, door[0], door[1]);
            const target = nearestHex(solved.floors, solved.fixtures, customer[1], customer[2]);
            expect(start, `${facility} start`).toBeDefined();
            expect(target, `${facility} target`).toBeDefined();
            expect(
              reachableInteriorHexes(solved.floors, solved.fixtures, start!),
              `${facility} reach`,
            ).toContainEqual(target);
            if (counterFacilities.includes(facility as (typeof counterFacilities)[number])) {
              const staff = solved.fixtures.find((item) =>
                facility === 'bank' || facility === 'casino' ? item[0] === 202 : item[0] === 200,
              )!;
              expect(pointInFloors(staff[1], staff[2], solved.floors), facility).toBe(false);
            }
          }
      }
  });
});

describe('facility-specific contracts', () => {
  it('keeps the pawnshop counter 1350 high with an 800 gate and keeper platform plus 300', () => {
    const solved = solve('pawnshop', 4_400, 3_100);
    const high = solved.fixtures.filter((item) => item[0] === 1);
    expect(fixtureKindByName('barred_high_counter').hMm).toBeGreaterThanOrEqual(1_300);
    expect(high).toHaveLength(2);
    expect(high.reduce((sum, item) => sum + item[3], 0)).toBe(3_600);
    expect(4_400 - high.reduce((sum, item) => sum + item[3], 0)).toBe(800);
    const platform = solved.fixtures.find((item) => item[0] === 42)!;
    const keeper = solved.fixtures.find((item) => item[0] === 200)!;
    expect(fixtureKindByName('storyteller_table').hMm).toBe(300);
    expect([platform[1], platform[2]]).toEqual([keeper[1], keeper[2]]);
  });

  it('centres the half-width temple altar within 100 mm and keeps cushions low', () => {
    for (const [width, depth] of ROOMS) {
      const solved = solve('temple', width, depth);
      const altar = solved.fixtures.find((item) => item[0] === 30)!;
      expect(Math.abs(altar[1])).toBeLessThanOrEqual(100);
      expect(altar[3]).toBe(floorDivInt(width, 2));
      expect(solved.fixtures.find((item) => item[0] === 31)).toBeDefined();
      for (const cushion of solved.fixtures.filter((item) => item[0] === 33)) {
        expect(fixtureKindByName('cushion').hMm).toBeLessThanOrEqual(120);
        expect(cushion[6]).toBe(0);
      }
    }
  });

  it('leaves the escort hall central aisle at least 1600 mm wide', () => {
    const solved = solve('escort', 6_800, 4_600);
    expect(ESCORT_CENTRAL_AISLE_MM).toBe(1_600);
    for (const item of solved.fixtures.filter((entry) => entry[6] === 1)) {
      const rect = bounds(item);
      if (rect[2] <= 0) expect(-rect[2]).toBeGreaterThanOrEqual(800);
      if (rect[0] >= 0) expect(rect[0]).toBeGreaterThanOrEqual(800);
    }
  });

  it('places one officer and exactly four runners in a full courtroom', () => {
    const solved = solve('office', 8_800, 6_400);
    expect(solved.fixtures.filter((item) => item[0] === 210)).toHaveLength(1);
    expect(solved.fixtures.filter((item) => item[0] === 206)).toHaveLength(4);
  });

  it('assigns exactly one dealer per gambling table', () => {
    for (const [width, depth, count] of [
      [6_800, 4_600, 2],
      [8_800, 6_400, 3],
    ] as const) {
      const solved = solve('casino', width, depth);
      expect(solved.fixtures.filter((item) => item[0] === 36)).toHaveLength(count);
      expect(solved.fixtures.filter((item) => item[0] === 207)).toHaveLength(count);
    }
  });

  it('is byte deterministic for every template and room', () => {
    for (const facility of FACILITIES)
      for (const [width, depth] of ROOMS)
        expect(JSON.stringify(solve(facility, width, depth))).toBe(
          JSON.stringify(solve(facility, width, depth)),
        );
  });

  it('stays deterministic across 96 fixed-seed generated cases', () => {
    const random = mulberry32(0x1a2b3c4d);
    for (let index = 0; index < 96; index += 1) {
      const facility = FACILITIES[random() % FACILITIES.length]!;
      const roomSize = ROOMS[random() % ROOMS.length]!;
      const yaw = YAWS[random() % YAWS.length]!;
      const delta = OFFSETS[random() % OFFSETS.length]!;
      const first = solve(facility, roomSize[0], roomSize[1], yaw, delta);
      const second = solve(facility, roomSize[0], roomSize[1], yaw, delta);
      expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    }
  });

  it('keeps all i2 sources free of arithmetic slash and forbidden APIs', () => {
    for (const name of [
      'cloth',
      'books',
      'pawnshop',
      'bank',
      'escort',
      'school',
      'temple',
      'office',
      'casino',
      'stable',
      'storehouse',
      'guardhouse',
    ]) {
      const source = readFileSync(new URL(`../interiors/${name}.ts`, import.meta.url), 'utf8');
      expect(source, name).not.toMatch(new RegExp('Math[.]|new Date|sqrt|pow|random|atan', 'u'));
      expect(source, name).not.toMatch(new RegExp(' [/] ', 'u'));
    }
    const source = readFileSync(new URL('./interiors-i2.test.ts', import.meta.url), 'utf8');
    expect(source).not.toMatch(new RegExp(' [/] ', 'u'));
  });
});
