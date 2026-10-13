import { floorDivInt } from '@tianshu/shared';
import { PartKind } from '../types';
import type { FacilityKind, RectMm, Yaw4 } from '../types';

export const PART_ENTERABLE = 1;
export const PART_COPING = 2;
export const PART_BRACKETS = 4;
export const PART_ADOBE = 8;
export const PART_GATE_OPENING = 16;
export const PART_FRONT_PORCH = 32;
export const PART_STABLE = 64;
export const PART_SECOND_ENTRY = 128;
export const PART_DOOR_WIDTH_FACTOR = 256;
export const GATE_CLEAR_WIDTH_MM = 1_600;
export const GATE_CLEAR_HEIGHT_MM = 2_400;
export const GATEHOUSE_EAVE_MM = 3_000;
export const GATEHOUSE_RIDGE_MM = 4_500;

export function flagsWithDoorWidth(flags: number, widthMm: number): number {
  return flags + widthMm * PART_DOOR_WIDTH_FACTOR;
}

export function partDoorWidthMm(flags: number): number {
  return floorDivInt(flags, PART_DOOR_WIDTH_FACTOR);
}

export interface DraftPart {
  readonly kind: PartKind;
  readonly cxMm: number;
  readonly czMm: number;
  readonly wMm: number;
  readonly dMm: number;
  readonly yaw: Yaw4;
  readonly flags: number;
}

export interface DraftRoom {
  readonly partIndex: number;
  readonly facility: FacilityKind;
  readonly doorWidthMm: number;
}

export interface CompoundDraft {
  readonly parts: readonly DraftPart[];
  readonly floors: readonly RectMm[];
  readonly rooms: readonly DraftRoom[];
}

export interface LayoutContext {
  readonly bounds: RectMm;
  readonly wallMm: number;
  readonly gateOffsetMm: number;
  readonly facility: FacilityKind;
  readonly screenWall: boolean;
  readonly adobe: boolean;
  readonly southHall: boolean;
}

export interface CourtOptions {
  readonly wings?: 0 | 1 | 2;
  readonly mainFacility?: FacilityKind;
  readonly hallFlags?: number;
  readonly forecourtGapMm?: number;
  readonly hallSideGapMm?: number;
}

export function clampInt(value: number, low: number, high: number): number {
  if (value < low) return low;
  return value > high ? high : value;
}

export function centreRect(rect: RectMm): readonly [number, number] {
  return [floorDivInt(rect[0] + rect[2], 2), floorDivInt(rect[1] + rect[3], 2)];
}

export function draftPart(kind: PartKind, rect: RectMm, yaw: Yaw4, flags = 0): DraftPart {
  const [cxMm, czMm] = centreRect(rect);
  const worldW = rect[2] - rect[0];
  const worldD = rect[3] - rect[1];
  const odd = yaw === 1 || yaw === 3;
  return {
    kind,
    cxMm,
    czMm,
    wMm: odd ? worldD : worldW,
    dMm: odd ? worldW : worldD,
    yaw,
    flags,
  };
}

export function partBounds(part: DraftPart): RectMm {
  const odd = part.yaw === 1 || part.yaw === 3;
  const worldW = odd ? part.dMm : part.wMm;
  const worldD = odd ? part.wMm : part.dMm;
  const x0 = part.cxMm - floorDivInt(worldW, 2);
  const z0 = part.czMm - floorDivInt(worldD, 2);
  return [x0, z0, x0 + worldW, z0 + worldD];
}

function pushRect(target: RectMm[], rect: RectMm): void {
  if (rect[0] < rect[2] && rect[1] < rect[3]) target.push(rect);
}

export function floorsThroughGate(
  floors: readonly RectMm[],
  gate: DraftPart,
  openingMm: number,
): RectMm[] {
  const gateRect = partBounds(gate);
  const doorX0 = gate.cxMm - floorDivInt(openingMm, 2);
  const doorX1 = doorX0 + openingMm;
  const result: RectMm[] = [];
  for (const floor of floors) {
    if (
      floor[2] <= gateRect[0] ||
      floor[0] >= gateRect[2] ||
      floor[3] <= gateRect[1] ||
      floor[1] >= gateRect[3]
    ) {
      result.push(floor);
      continue;
    }
    pushRect(result, [floor[0], floor[1], floor[2], gateRect[1]]);
    pushRect(result, [floor[0], gateRect[3], floor[2], floor[3]]);
    pushRect(result, [doorX0, gateRect[1], doorX1, gateRect[3]]);
  }
  return result;
}

function roundDown100(value: number): number {
  return floorDivInt(value, 100) * 100;
}

function approachFloors(
  yard: RectMm,
  gateX: number,
  gateBack: number,
  innerFront: number,
  screen?: RectMm,
  halfPassage = 1_200,
): RectMm[] {
  if (screen === undefined) {
    return [
      [yard[0], yard[1], yard[2], gateBack],
      [gateX - halfPassage, gateBack, gateX + halfPassage, innerFront],
    ];
  }
  return [
    [yard[0], yard[1], yard[2], screen[1]],
    [yard[0], screen[3], yard[2], yard[3]],
    [yard[0], screen[1] - 300, screen[0], screen[3] + 300],
    [screen[2], screen[1] - 300, yard[2], screen[3] + 300],
    [yard[0], screen[3], yard[2], gateBack + 300],
    [gateX - halfPassage, gateBack - 300, gateX + halfPassage, innerFront],
  ];
}

function southHallFloors(
  yard: RectMm,
  hall: RectMm,
  gateX: number,
  gateBack: number,
  outsideFront: number,
  halfPassage: number,
  screen?: RectMm,
): RectMm[] {
  const sidePassage = 1_200;
  const yardFloors =
    screen === undefined
      ? [yard]
      : [
          [yard[0], yard[1], yard[2], screen[1]] as const,
          [yard[0], screen[3], yard[2], yard[3]] as const,
          [yard[0], screen[1] - 300, screen[0], screen[3] + 300] as const,
          [screen[2], screen[1] - 300, yard[2], screen[3] + 300] as const,
        ];
  return [
    ...yardFloors,
    [gateX - halfPassage, gateBack, gateX + halfPassage, outsideFront],
    [hall[0] - sidePassage, hall[3], hall[2] + sidePassage, gateBack + 300],
    [hall[0] - sidePassage, yard[3] - 800, hall[0] + 600, hall[3] + 800],
    [hall[2] - 600, yard[3] - 800, hall[2] + sidePassage, hall[3] + 800],
  ];
}

export function baseCourt(context: LayoutContext, options: CourtOptions = {}): CompoundDraft {
  const { bounds, wallMm } = context;
  const inner: RectMm = [
    bounds[0] + wallMm,
    bounds[1] + wallMm,
    bounds[2] - wallMm,
    bounds[3] - wallMm,
  ];
  const innerW = inner[2] - inner[0];
  const innerD = inner[3] - inner[1];
  const widthWings = innerW >= 9_000 ? 2 : innerW >= 6_000 ? 1 : 0;
  const wingCount =
    options.wings ?? (context.adobe && (innerW < 9_000 || innerD < 9_000) ? 0 : widthWings);
  const wingDepth = clampInt(
    floorDivInt(innerW * 1_800, 10_000),
    context.adobe ? 2_800 : 1_800,
    context.adobe ? 3_000 : 2_400,
  );
  const hallD = roundDown100(clampInt(floorDivInt(innerD * 3_600, 10_000), 2_600, 4_000));
  const hallGap = context.southHall ? 1_200 : (options.hallSideGapMm ?? 300);
  const hallLimit =
    innerW -
    (wingCount === 2 ? (wingDepth + hallGap) * 2 : wingCount === 1 ? wingDepth + hallGap * 2 : 800);
  const hallMinimum = hallLimit < 3_600 ? hallLimit : 3_600;
  const hallW = roundDown100(clampInt(floorDivInt(innerW * 7_000, 10_000), hallMinimum, hallLimit));
  const hallX0 = floorDivInt(inner[0] + inner[2] - hallW, 2);
  let hall: RectMm = [hallX0, inner[1] + 200, hallX0 + hallW, inner[1] + 200 + hallD];
  const gateW = clampInt(2_400, GATE_CLEAR_WIDTH_MM, innerW - 600);
  const gateX = clampInt(
    context.gateOffsetMm,
    inner[0] + floorDivInt(gateW, 2),
    inner[2] - floorDivInt(gateW, 2),
  );
  const gate: RectMm = [
    gateX - floorDivInt(gateW, 2),
    inner[3] - 1_600,
    gateX + gateW - floorDivInt(gateW, 2),
    inner[3],
  ];
  if (context.southHall) {
    const hallZ1 = gate[1] - 1_200;
    hall = [hallX0, hallZ1 - hallD, hallX0 + hallW, hallZ1];
  }
  const wingGap = hallGap;
  const yardX0 = inner[0] + (wingCount >= 1 ? wingDepth + wingGap : 300);
  const yardX1 = inner[2] - (wingCount === 2 ? wingDepth + wingGap : 300);
  const yardZ0 = context.southHall ? inner[1] + 300 : hall[3] + (options.forecourtGapMm ?? 400);
  const gateBack = gate[1];
  const openYardEnd = context.southHall ? hall[1] - 400 : gateBack;
  const screen =
    context.screenWall && openYardEnd - yardZ0 >= 1_600
      ? ([gateX - 800, openYardEnd - 1_400, gateX + 800, openYardEnd - 1_100] as const)
      : undefined;
  const fullYard: RectMm = [yardX0, yardZ0, yardX1, openYardEnd];
  const yard: RectMm = screen === undefined ? fullYard : [yardX0, yardZ0, yardX1, screen[1]];
  const commonFlags = context.adobe ? PART_ADOBE : 0;
  const parts: DraftPart[] = [
    draftPart(PartKind.Enclosure, inner, 0, PART_COPING | commonFlags),
    draftPart(
      PartKind.Gatehouse,
      gate,
      0,
      flagsWithDoorWidth(PART_GATE_OPENING | commonFlags, GATE_CLEAR_WIDTH_MM),
    ),
    draftPart(
      PartKind.Hall,
      hall,
      context.southHall ? 2 : 0,
      flagsWithDoorWidth(PART_ENTERABLE | commonFlags | (options.hallFlags ?? 0), 1_400),
    ),
  ];
  const rooms: DraftRoom[] = [
    { partIndex: 2, facility: options.mainFacility ?? context.facility, doorWidthMm: 1_400 },
  ];
  const wingZ1 = gateBack - 400;
  if (wingCount >= 1) {
    const left: RectMm = [inner[0] + 200, yardZ0, inner[0] + 200 + wingDepth, wingZ1];
    parts.push(
      draftPart(PartKind.Wing, left, 3, flagsWithDoorWidth(PART_ENTERABLE | commonFlags, 1_200)),
    );
    rooms.push({ partIndex: parts.length - 1, facility: context.facility, doorWidthMm: 1_200 });
  }
  if (wingCount === 2) {
    const right: RectMm = [inner[2] - 200 - wingDepth, yardZ0, inner[2] - 200, wingZ1];
    parts.push(
      draftPart(PartKind.Wing, right, 1, flagsWithDoorWidth(PART_ENTERABLE | commonFlags, 1_200)),
    );
    rooms.push({ partIndex: parts.length - 1, facility: context.facility, doorWidthMm: 1_200 });
  }
  parts.push(draftPart(PartKind.Yard, yard, 0));
  if (screen !== undefined) parts.push(draftPart(PartKind.ScreenWall, screen, 0, commonFlags));
  const halfPassage = context.adobe ? 1_500 : 1_200;
  const floors = context.southHall
    ? southHallFloors(fullYard, hall, gateX, gateBack, bounds[3] - wallMm, halfPassage, screen)
    : approachFloors(fullYard, gateX, gateBack, bounds[3] - wallMm, screen, halfPassage);
  const hallDoorZ = context.southHall ? hall[1] : hall[3];
  const yardDoorZ = context.southHall ? fullYard[3] : fullYard[1];
  floors.push([
    floorDivInt(hall[0] + hall[2], 2) - 1_200,
    hallDoorZ < yardDoorZ ? hallDoorZ - 1_000 : yardDoorZ - 1_000,
    floorDivInt(hall[0] + hall[2], 2) + 1_200,
    hallDoorZ < yardDoorZ ? yardDoorZ + 1_000 : hallDoorZ + 1_000,
  ]);
  if (wingCount >= 1) {
    const left = partBounds(parts[3]!);
    const doorZ = floorDivInt(left[1] + left[3], 2);
    const doorHalf = context.adobe ? 1_500 : 1_000;
    const yardOverlap = context.adobe ? 1_500 : 500;
    floors.push([left[2] - 500, doorZ - doorHalf, yard[0] + yardOverlap, doorZ + doorHalf]);
  }
  if (wingCount === 2) {
    const right = partBounds(parts[4]!);
    const doorZ = floorDivInt(right[1] + right[3], 2);
    const doorHalf = context.adobe ? 1_500 : 1_000;
    const yardOverlap = context.adobe ? 1_500 : 500;
    floors.push([yard[2] - yardOverlap, doorZ - doorHalf, right[0] + 500, doorZ + doorHalf]);
  }
  return { parts, floors, rooms };
}

export function addPart(
  draft: CompoundDraft,
  part: DraftPart,
  room?: Omit<DraftRoom, 'partIndex'>,
): CompoundDraft {
  const parts = [...draft.parts, part];
  const rooms =
    room === undefined ? draft.rooms : [...draft.rooms, { ...room, partIndex: parts.length - 1 }];
  return { ...draft, parts, rooms };
}

export function yardBounds(draft: CompoundDraft): RectMm {
  const yard = draft.parts.find((part) => part.kind === PartKind.Yard);
  if (yard === undefined) throw new TypeError('TOWN_PLAN_COMPOUND_YARD_MISSING');
  return partBounds(yard);
}

export function hallBounds(draft: CompoundDraft): RectMm {
  const hall = draft.parts.find((part) => part.kind === PartKind.Hall);
  if (hall === undefined) throw new TypeError('TOWN_PLAN_COMPOUND_HALL_MISSING');
  return partBounds(hall);
}
