import { floorDivInt } from '@tianshu/shared';
import { hexCentreMm, localToWorldQuarter } from '../frame';
import type { FixtureTuple, RectMm } from '../types';
import { isInteriorHexWalkable, reachableInteriorHexes } from './hexes';
import type { InteriorTemplateInput, InteriorTemplateResult } from './solver';

/** tech/16 §8.3 tavern: tables on a 2.4 m lattice, at least 900 mm clear between table sets. */
export const TAVERN_GRID_MM = 2_400;
export const TAVERN_AISLE_MM = 900;
const TABLE_MM = 1_000;
const STAGE_W_MM = 1_500;
const STAGE_D_MM = 1_000;
const WALL_MARGIN_MM = 300;
const GUEST_OFFSET_MM = 800;
const FIXTURE_CLEARANCE_MM = 250;
const APPROACH_MM = 1_200;
const MAX_TABLES = 6;

const fixture = (
  idx: number,
  cx: number,
  cz: number,
  w: number,
  d: number,
  yaw: 0 | 1 | 2 | 3 = 0,
  blocks: 0 | 1 = 1,
): FixtureTuple => [idx, cx, cz, w, d, yaw, blocks];

function rectOf(cx: number, cz: number, width: number, depth: number): RectMm {
  const halfW = floorDivInt(width, 2);
  const halfD = floorDivInt(depth, 2);
  return [cx - halfW, cz - halfD, cx + width - halfW, cz + depth - halfD];
}
function overlaps(a: RectMm, b: RectMm): boolean {
  return a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
}
function inside(room: RectMm, rect: RectMm): boolean {
  return (
    rect[0] >= room[0] + WALL_MARGIN_MM &&
    rect[2] <= room[2] - WALL_MARGIN_MM &&
    rect[1] >= room[1] &&
    rect[3] <= room[3] - WALL_MARGIN_MM
  );
}
function pointInRect(x: number, z: number, rect: RectMm): boolean {
  return x >= rect[0] && x < rect[2] && z >= rect[1] && z < rect[3];
}
function clearOfFixture(x: number, z: number, item: FixtureTuple): boolean {
  if (item[6] === 0 || item[3] === 0 || item[4] === 0) return true;
  const rect = rectOf(item[1], item[2], item[3], item[4]);
  const dx = x < rect[0] ? rect[0] - x : x > rect[2] ? x - rect[2] : 0;
  const dz = z < rect[1] ? rect[1] - z : z > rect[3] ? z - rect[3] : 0;
  return dx * dx + dz * dz >= FIXTURE_CLEARANCE_MM * FIXTURE_CLEARANCE_MM;
}
function guestStations(
  table: FixtureTuple,
  room: RectMm,
  walkway: RectMm,
  keeperAisle: RectMm,
  fixtures: readonly FixtureTuple[],
): FixtureTuple[] {
  const candidates = [
    [table[1] - GUEST_OFFSET_MM, table[2], 3],
    [table[1] + GUEST_OFFSET_MM, table[2], 1],
    [table[1], table[2] + GUEST_OFFSET_MM, 2],
    [table[1], table[2] - GUEST_OFFSET_MM, 0],
  ] as const;
  const result: FixtureTuple[] = [];
  for (const [x, z, yaw] of candidates) {
    const insideFloor =
      x >= room[0] + WALL_MARGIN_MM &&
      x <= room[2] - WALL_MARGIN_MM &&
      z >= room[1] + WALL_MARGIN_MM &&
      z <= room[3] - WALL_MARGIN_MM &&
      !pointInRect(x, z, keeperAisle);
    if (
      insideFloor &&
      !pointInRect(x, z, walkway) &&
      fixtures.every((item) => clearOfFixture(x, z, item))
    ) {
      result.push(fixture(212, x, z, 0, 0, yaw, 0));
      if (result.length === 2) break;
    }
  }
  return result;
}
function rotateRect(rect: RectMm, yaw: 0 | 1 | 2 | 3, cx: number, cz: number): RectMm {
  const corners = [
    localToWorldQuarter(rect[0], rect[1], yaw),
    localToWorldQuarter(rect[0], rect[3], yaw),
    localToWorldQuarter(rect[2], rect[1], yaw),
    localToWorldQuarter(rect[2], rect[3], yaw),
  ];
  let x0 = corners[0]![0];
  let x1 = x0;
  let z0 = corners[0]![1];
  let z1 = z0;
  for (const point of corners) {
    if (point[0] < x0) x0 = point[0];
    if (point[0] > x1) x1 = point[0];
    if (point[1] < z0) z0 = point[1];
    if (point[1] > z1) z1 = point[1];
  }
  return [x0 + cx, z0 + cz, x1 + cx, z1 + cz];
}
function rotateFixture(
  item: FixtureTuple,
  yaw: 0 | 1 | 2 | 3,
  cx: number,
  cz: number,
): FixtureTuple {
  const point = localToWorldQuarter(item[1], item[2], yaw);
  const sum = item[5] + yaw;
  return [
    item[0],
    point[0] + cx,
    point[1] + cz,
    item[3],
    item[4],
    (sum >= 4 ? sum - 4 : sum) as 0 | 1 | 2 | 3,
    item[6],
  ];
}
function tavernFloors(room: RectMm, aisle: RectMm): readonly RectMm[] {
  const candidates: readonly RectMm[] = [
    [room[0], aisle[3], room[2], room[3]],
    [room[0], room[1], aisle[0], aisle[3]],
    [aisle[2], room[1], room[2], aisle[3]],
  ];
  return candidates.filter((rect) => rect[0] < rect[2] && rect[1] < rect[3]);
}
function layoutApproachable(
  input: InteriorTemplateInput,
  localFloors: readonly RectMm[],
  blockers: readonly FixtureTuple[],
  seats: readonly FixtureTuple[],
): boolean {
  const yaw = input.yaw ?? 0;
  const centre = input.worldCentreMm ?? [0, 0];
  const floors = localFloors.map((rect) => rotateRect(rect, yaw, centre[0], centre[1]));
  const fixtures = blockers.map((item) => rotateFixture(item, yaw, centre[0], centre[1]));
  const entry = localToWorldQuarter(0, input.room[3] - 300, yaw);
  let start: { q: number; r: number } | undefined;
  let startDistance = Number.MAX_SAFE_INTEGER;
  let minX = floors[0]![0];
  let maxX = floors[0]![2];
  let minZ = floors[0]![1];
  let maxZ = floors[0]![3];
  for (const floor of floors) {
    if (floor[0] < minX) minX = floor[0];
    if (floor[2] > maxX) maxX = floor[2];
    if (floor[1] < minZ) minZ = floor[1];
    if (floor[3] > maxZ) maxZ = floor[3];
  }
  for (let r = floorDivInt(minZ, 1_000) - 2; r <= floorDivInt(maxZ, 1_000) + 2; r += 1) {
    const qMin = floorDivInt(100 * minX - 57_735 * r, 115_470) - 2;
    const qMax = floorDivInt(100 * maxX - 57_735 * r, 115_470) + 2;
    for (let q = qMin; q <= qMax; q += 1) {
      const hex = { q, r };
      if (!isInteriorHexWalkable(floors, fixtures, hex)) continue;
      const point = hexCentreMm(q, r);
      const dx = point[0] - centre[0] - entry[0];
      const dz = point[1] - centre[1] - entry[1];
      if (dx * dx + dz * dz < startDistance) {
        start = hex;
        startDistance = dx * dx + dz * dz;
      }
    }
  }
  if (start === undefined) return false;
  const reached = reachableInteriorHexes(floors, fixtures, start);
  return seats.every((seat) => {
    const point = localToWorldQuarter(seat[1], seat[2], yaw);
    return reached.some((hex) => {
      const centreHex = hexCentreMm(hex.q, hex.r);
      const dx = centreHex[0] - centre[0] - point[0];
      const dz = centreHex[1] - centre[1] - point[1];
      return dx * dx + dz * dz <= APPROACH_MM * APPROACH_MM;
    });
  });
}
/**
 * Lattice slots in front of the counter: the first row leaves at least a 900 mm aisle in front of the
 * counter, then rows and columns step 2.4 m (1.4 m clear between 1 m table sets). Slots that
 * leave the room or touch the main walkway (the door passage widened back to the counter front)
 * are skipped. The column origin is the room centre, or a side wall when that fits more tables
 * (a 6.0 m room has none on the centred lattice). Ordered back to front, then left to right.
 */
function latticeSlots(
  input: InteriorTemplateInput,
  counterFront: number,
  walkway: RectMm,
): readonly (readonly [number, number])[][] {
  const half = floorDivInt(TABLE_MM, 2);
  const origins = [
    0,
    input.room[0] + WALL_MARGIN_MM + half,
    input.room[2] - WALL_MARGIN_MM - half,
  ] as const;
  const columns = floorDivInt(input.widthMm, TAVERN_GRID_MM) + 1;
  const layouts: (readonly [number, number])[][] = [];
  for (let rowShift = 0; rowShift <= 900; rowShift += 100)
    for (const origin of origins) {
      const slots: (readonly [number, number])[] = [];
      for (
        let z = counterFront + TAVERN_AISLE_MM + half + rowShift;
        z + half <= input.room[3] - WALL_MARGIN_MM;
        z += TAVERN_GRID_MM
      ) {
        for (let column = -columns; column <= columns; column += 1) {
          const x = origin + column * TAVERN_GRID_MM;
          const rect = rectOf(x, z, TABLE_MM, TABLE_MM);
          if (inside(input.room, rect) && !overlaps(rect, walkway)) slots.push([x, z]);
        }
      }
      layouts.push(slots);
    }
  const max = layouts.reduce((value, slots) => (slots.length > value ? slots.length : value), 0);
  return layouts.filter((slots) => slots.length === max);
}
function furnishLayout(
  input: InteriorTemplateInput,
  slots: readonly (readonly [number, number])[],
  baseFixtures: readonly FixtureTuple[],
  walkway: RectMm,
  keeperAisle: RectMm,
): { readonly fixtures: readonly FixtureTuple[]; readonly approachable: boolean } {
  let stageSlot = -1;
  if (input.degrade < 1 && input.depthMm >= 6_000 && slots.length >= 2)
    for (let index = slots.length - 1; index >= 0 && stageSlot < 0; index -= 1) {
      const rect = rectOf(slots[index]![0], slots[index]![1], STAGE_W_MM, STAGE_D_MM);
      if (inside(input.room, rect) && !overlaps(rect, walkway)) stageSlot = index;
    }
  const fixtures = [...baseFixtures];
  const tables: FixtureTuple[] = [];
  const tableLimit = input.degrade > 0 ? 2 : MAX_TABLES;
  for (let index = 0; index < slots.length && tables.length < tableLimit; index += 1) {
    if (index === stageSlot) continue;
    const table = fixture(7, slots[index]![0], slots[index]![1], TABLE_MM, TABLE_MM);
    tables.push(table);
    fixtures.push(table);
  }
  if (stageSlot >= 0)
    fixtures.push(fixture(42, slots[stageSlot]![0], slots[stageSlot]![1], STAGE_W_MM, STAGE_D_MM));
  const blockers = fixtures.filter((item) => item[6] === 1);
  const seats = tables.flatMap((table) =>
    guestStations(table, input.room, walkway, keeperAisle, blockers),
  );
  fixtures.push(...seats);
  return {
    fixtures,
    approachable: layoutApproachable(input, tavernFloors(input.room, keeperAisle), blockers, seats),
  };
}
export function planTavern(input: InteriorTemplateInput): InteriorTemplateResult {
  const counterW = input.widthMm < 4_000 ? input.widthMm - 400 : 2_400;
  const counterZ = input.room[1] + 1_075;
  const counterRear = counterZ - 275;
  const counterFront = counterZ + 275;
  const baseFixtures: FixtureTuple[] = [
    fixture(0, 0, counterZ, counterW, 550),
    fixture(26, input.room[0] + 600, input.room[1] + 350, 1_200, 700),
    fixture(200, 0, floorDivInt(input.room[1] + counterRear, 2), 0, 0, 0, 0),
    fixture(201, 0, counterFront + 600, 0, 0, 2, 0),
  ];
  const walkway: RectMm = [input.passage[0], counterFront, input.passage[2], input.room[3]];
  const keeperAisle: RectMm = [
    -floorDivInt(counterW, 2),
    input.room[1],
    counterW - floorDivInt(counterW, 2),
    counterRear,
  ];
  const layouts = latticeSlots(input, counterFront, walkway);
  let fixtures: FixtureTuple[] = [];
  let fallback: readonly FixtureTuple[] = baseFixtures;
  for (const slots of layouts) {
    const furnished = furnishLayout(input, slots, baseFixtures, walkway, keeperAisle);
    fallback = furnished.fixtures;
    const centredDoor = floorDivInt(input.passage[0] + input.passage[2], 2) === 0;
    if (!centredDoor || furnished.approachable) {
      fixtures = [...furnished.fixtures];
      break;
    }
  }
  if (fixtures.length === 0) fixtures = [...fallback];
  // Waiter stands in the aisle in front of the counter, beside the main walkway.
  if (input.degrade < 3) {
    const left = walkway[0] - floorDivInt(TAVERN_AISLE_MM, 2);
    const x = left - 300 >= input.room[0] ? left : walkway[2] + floorDivInt(TAVERN_AISLE_MM, 2);
    fixtures.push(fixture(203, x, counterFront + floorDivInt(TAVERN_AISLE_MM, 2), 0, 0, 2, 0));
  }
  return { fixtures, excluded: keeperAisle[3] > keeperAisle[1] ? [keeperAisle] : [] };
}
