import { ceilDivInt, floorDivInt } from '@tianshu/shared';
import { layoutCompound } from './compound';
import type { DraftPart, DraftRoom } from './compound';
import {
  GATE_CLEAR_WIDTH_MM,
  GATEHOUSE_EAVE_MM,
  GATEHOUSE_RIDGE_MM,
  PART_BRACKETS,
} from './compound/parts';
import { planDimensions, resolvePlanRecipe } from './dims';
import {
  entranceSide,
  localToWorldQuarter,
  planningRectCentreMm,
  yawFromEntranceSide,
} from './frame';
import { defaultInteriorPlanner } from './interiors/solver';
import type { InteriorPlanner } from './plan-hall';
import { PartKind, RoofStyle, townPlanNotImplemented } from './types';
import type {
  BuildKitRecipe,
  CompiledBuildKit,
  FixtureTuple,
  LayoutBuildingInput,
  PartTuple,
  PlanningFrame,
  RectMm,
  TownBuildingPlan,
  Yaw4,
} from './types';

const CELL_MM = 1_000;
const SIGN_STYLE: Readonly<Record<string, number>> = { plaque: 0, flag: 1 };
const ROOF_STYLE: Readonly<Record<string, RoofStyle>> = {
  none: RoofStyle.None,
  yingshan: RoofStyle.Yingshan,
  xuanshan: RoofStyle.Xuanshan,
  xieshan: RoofStyle.Xieshan,
  wudian: RoofStyle.Wudian,
  cuanjian: RoofStyle.Cuanjian,
  juanpeng: RoofStyle.Juanpeng,
  flat: RoofStyle.Flat,
  dome: RoofStyle.Dome,
  canopy: RoofStyle.Canopy,
};

function addYaw(a: Yaw4, b: Yaw4): Yaw4 {
  const sum = a + b;
  return (sum >= 4 ? sum - 4 : sum) as Yaw4;
}

function rotateRect(rect: RectMm, yaw: Yaw4, cx: number, cz: number): RectMm {
  const points = [
    localToWorldQuarter(rect[0], rect[1], yaw),
    localToWorldQuarter(rect[0], rect[3], yaw),
    localToWorldQuarter(rect[2], rect[1], yaw),
    localToWorldQuarter(rect[2], rect[3], yaw),
  ];
  let x0 = points[0]![0];
  let x1 = x0;
  let z0 = points[0]![1];
  let z1 = z0;
  for (const point of points) {
    if (point[0] < x0) x0 = point[0];
    if (point[0] > x1) x1 = point[0];
    if (point[1] < z0) z0 = point[1];
    if (point[1] > z1) z1 = point[1];
  }
  return [x0 + cx, z0 + cz, x1 + cx, z1 + cz];
}

function entranceOffsetMm(input: LayoutBuildingInput, side: number): number {
  const along =
    side === 0 || side === 2
      ? input.entranceCell[0] - input.originCell[0]
      : input.entranceCell[1] - input.originCell[1];
  const span = side === 0 || side === 2 ? input.sizeCells[0] : input.sizeCells[1];
  const unsigned = (along * 2 + 1 - span) * 500;
  return side === 1 || side === 2 ? -unsigned : unsigned;
}

function roofStyle(recipe: BuildKitRecipe): RoofStyle {
  const key = recipe.roof ?? 'xuanshan';
  const value = ROOF_STYLE[key];
  if (value === undefined) throw new TypeError(`TOWN_PLAN_UNKNOWN_ROOF:${key}`);
  return value;
}

function signage(input: LayoutBuildingInput, recipe: BuildKitRecipe): TownBuildingPlan['signage'] {
  if (recipe.signage === undefined || input.signTextKey === undefined) return null;
  const style = SIGN_STYLE[recipe.signage];
  if (style === undefined) throw new TypeError(`TOWN_PLAN_UNKNOWN_SIGNAGE:${recipe.signage}`);
  return [input.signTextKey, style];
}

function syntheticInput(input: LayoutBuildingInput, part: DraftPart): LayoutBuildingInput {
  const w = ceilDivInt(part.wMm, CELL_MM);
  const d = ceilDivInt(part.dMm, CELL_MM);
  return { ...input, originCell: [0, 0], sizeCells: [w, d], entranceCell: [floorDivInt(w, 2), -1] };
}

function hallSizeInput(input: LayoutBuildingInput, part: DraftPart): LayoutBuildingInput {
  return { ...syntheticInput(input, part), type: 'bld_kit_song_dali_temple_hall' };
}

function dimensionInput(input: LayoutBuildingInput, part: DraftPart): LayoutBuildingInput {
  return part.kind === PartKind.Hall && (part.flags & PART_BRACKETS) !== 0
    ? hallSizeInput(input, part)
    : syntheticInput(input, part);
}

function partRoof(
  part: DraftPart,
  input: LayoutBuildingInput,
  kit: CompiledBuildKit,
  recipe: BuildKitRecipe,
): readonly [RoofStyle, number, number, number] {
  if (part.kind === PartKind.Yard) return [RoofStyle.None, 0, 0, 0];
  if (part.kind === PartKind.Enclosure || part.kind === PartKind.ScreenWall) {
    const h = kit.walls.enclosure.h ?? 2_400;
    return [RoofStyle.None, h, h, 0];
  }
  if (part.kind === PartKind.Trellis) return [RoofStyle.None, 2_300, 2_300, 0];
  if (part.kind === PartKind.Gallery) return [RoofStyle.Canopy, 2_300, 2_500, 0];
  if (part.kind === PartKind.Gatehouse)
    return [RoofStyle.Xuanshan, GATEHOUSE_EAVE_MM, GATEHOUSE_RIDGE_MM, 150];
  const dims = planDimensions(dimensionInput(input, part), kit);
  return [roofStyle(recipe), dims.eaveMm, dims.ridgeMm, dims.platformMm];
}

function tupleFor(
  part: DraftPart,
  input: LayoutBuildingInput,
  kit: CompiledBuildKit,
  recipe: BuildKitRecipe,
  planYaw: Yaw4,
  cx: number,
  cz: number,
): PartTuple {
  const [x, z] = localToWorldQuarter(part.cxMm, part.czMm, planYaw);
  const [style, eave, ridge, platform] = partRoof(part, input, kit, recipe);
  return [
    part.kind,
    x + cx,
    z + cz,
    part.wMm,
    part.dMm,
    addYaw(part.yaw, planYaw),
    1,
    style,
    eave,
    ridge,
    platform,
    part.flags,
  ];
}

function roomShell(
  base: TownBuildingPlan,
  room: DraftRoom,
  part: DraftPart,
  floor: RectMm,
  input: LayoutBuildingInput,
  facility: TownBuildingPlan['facility'],
): TownBuildingPlan {
  const roomInput = syntheticInput(input, part);
  return {
    ...base,
    id: `${input.id}_part_${room.partIndex}`,
    facility,
    footprint: [part.cxMm, part.czMm, part.wMm, part.dMm],
    yaw: part.yaw,
    entrances: [[0, 0, room.doorWidthMm]],
    floors: [floor],
    floorY: [base.elev[1]],
    fixtures: [],
    signage: null,
    enterable: roomInput.enterable && input.enterable,
    seed: base.seed ^ ((room.partIndex + 1) * 0x9e3779b1),
    archetype: base.archetype,
    elev: [base.elev[0], base.elev[1]],
    roof: base.roof,
    storeys: 1,
    kit: base.kit,
  };
}

function fallbackStation(part: DraftPart, facility: TownBuildingPlan['facility']): FixtureTuple {
  const idx =
    facility === 'temple'
      ? 205
      : facility === 'office'
        ? 206
        : facility === 'escort'
          ? 211
          : facility === 'stable'
            ? 206
            : 210;
  const local = localToWorldQuarter(0, floorDivInt(part.dMm, 4), part.yaw);
  return [idx, part.cxMm + local[0], part.czMm + local[1], 0, 0, part.yaw, 0];
}

function roomInterior(
  base: TownBuildingPlan,
  room: DraftRoom,
  part: DraftPart,
  input: LayoutBuildingInput,
  kit: CompiledBuildKit,
  recipe: BuildKitRecipe,
  interior: InteriorPlanner,
): readonly [readonly RectMm[], readonly number[], readonly FixtureTuple[]] {
  const front = kit.walls.front.t;
  const side = kit.walls.gable.t;
  const back = kit.walls.back.t;
  const halfW = floorDivInt(part.wMm, 2);
  const halfD = floorDivInt(part.dMm, 2);
  const centredFloor: RectMm = [
    -halfW + side,
    -halfD + back,
    part.wMm - halfW - side,
    part.dMm - halfD - front,
  ];
  const localFloor = rotateRect(centredFloor, part.yaw, part.cxMm, part.czMm);
  const facility = room.facility;
  const platform = planDimensions(dimensionInput(input, part), kit).platformMm;
  const shell = roomShell(
    { ...base, elev: [base.elev[0], platform] },
    room,
    part,
    localFloor,
    input,
    facility,
  );
  const result = interior({ plan: shell, input: syntheticInput(input, part), kit, recipe });
  const fixtures = result.fixtures.some((item) => item[0] >= 200)
    ? result.fixtures
    : [...result.fixtures, fallbackStation(part, facility)];
  return [result.floors, result.floorY, fixtures];
}

function rotateFixture(item: FixtureTuple, yaw: Yaw4, cx: number, cz: number): FixtureTuple {
  const [x, z] = localToWorldQuarter(item[1], item[2], yaw);
  return [item[0], x + cx, z + cz, item[3], item[4], addYaw(item[5], yaw), item[6]];
}

function variantRoof(
  style: RoofStyle,
  facility: TownBuildingPlan['facility'],
  variant: string | undefined,
): RoofStyle {
  if (variant !== 'tang_buddhist' || style !== RoofStyle.Dome) return style;
  return facility === 'office' || facility === 'temple' ? RoofStyle.Cuanjian : RoofStyle.Flat;
}

/** Deterministic pure-integer compound planner. The draft frame is door-facing local space. */
export function planCompound(
  input: LayoutBuildingInput,
  kit: CompiledBuildKit,
  seed: number,
  frame: PlanningFrame,
  interior: InteriorPlanner = defaultInteriorPlanner,
  variant?: string,
): TownBuildingPlan {
  if (input.type === undefined || kit.archetypes === undefined) {
    return townPlanNotImplemented('planCompound');
  }
  const [archetype, recipe] = resolvePlanRecipe(input, kit);
  if ('unsupported' in recipe || recipe.recipe !== 'compound') {
    throw new TypeError('TOWN_PLAN_NOT_COMPOUND');
  }
  const side = entranceSide(input.originCell, input.sizeCells, input.entranceCell);
  const yaw = yawFromEntranceSide(side);
  const worldWidth = input.sizeCells[0] * CELL_MM;
  const worldDepth = input.sizeCells[1] * CELL_MM;
  const localWidth = side === 0 || side === 2 ? worldWidth : worldDepth;
  const localDepth = side === 0 || side === 2 ? worldDepth : worldWidth;
  const halfW = floorDivInt(localWidth, 2);
  const halfD = floorDivInt(localDepth, 2);
  const bounds: RectMm = [-halfW, -halfD, localWidth - halfW, localDepth - halfD];
  const facility = input.facility ?? recipe.facility ?? 'residence';
  const draft = layoutCompound(recipe.layout ?? 'hall_wing_gate', {
    bounds,
    wallMm: kit.walls.enclosure.t,
    gateOffsetMm: entranceOffsetMm(input, side),
    facility,
    screenWall: recipe.screenWall === true && localDepth >= 5_000,
    adobe: kit.style === 'adobe',
    southHall: kit.preferSouthHall === true && side === 2,
  });
  if (draft.parts.length > 12) throw new RangeError('TOWN_PLAN_COMPOUND_PART_LIMIT');
  const [cx, cz] = planningRectCentreMm(frame, input.originCell, input.sizeCells);
  const selected = variantRoof(roofStyle(recipe), facility, variant);
  const base: TownBuildingPlan = {
    id: input.id,
    archetype,
    kit: kit.id,
    seed,
    footprint: [cx, cz, localWidth, localDepth],
    yaw,
    storeys: 1,
    roof: [selected, 0, 0],
    entrances: [[0, entranceOffsetMm(input, side), GATE_CLEAR_WIDTH_MM]],
    enterable: input.enterable,
    elev: [input.baseYMm, 0],
    floors: [],
    floorY: [],
    fixtures: [],
    signage: signage(input, recipe),
    facility,
  };
  const localFloors: RectMm[] = [...draft.floors];
  const localFloorY: number[] = draft.floors.map(() => 0);
  const localFixtures: FixtureTuple[] = [];
  for (const room of draft.rooms) {
    const part = draft.parts[room.partIndex];
    if (part === undefined) throw new RangeError('TOWN_PLAN_COMPOUND_ROOM_PART_MISSING');
    const [floors, floorY, fixtures] = roomInterior(base, room, part, input, kit, recipe, interior);
    localFloors.push(...floors);
    localFloorY.push(...floorY);
    localFixtures.push(...fixtures);
  }
  const parts = draft.parts.map((part) => tupleFor(part, input, kit, recipe, yaw, cx, cz));
  const floors = localFloors.map((rect) => rotateRect(rect, yaw, cx, cz));
  const fixtures = localFixtures.map((item) => rotateFixture(item, yaw, cx, cz));
  const gate = parts.find((part) => part[0] === PartKind.Gatehouse);
  const roof = gate === undefined ? base.roof : ([gate[7], gate[8], gate[9]] as const);
  const finial =
    variant === 'tang_buddhist' && facility === 'temple' ? { finial: 'tang_stupa' as const } : {};
  return { ...base, roof, floors, floorY: localFloorY, fixtures, parts, ...finial };
}
