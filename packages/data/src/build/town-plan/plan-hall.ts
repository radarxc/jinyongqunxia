import { parseBuildingType } from './archetype';
import {
  entranceSide, planningPointMm, planningRectCentreMm, yawFromEntranceSide,
} from './frame';
import { RoofStyle } from './types';
import type { CompiledBuildKit, LayoutBuildingInput, PlanningFrame, TownBuildingPlan } from './types';

const CELL_MM = 1_000;
const FLOOR_INSET_MM = 300;

export function planBuilding(
  input: LayoutBuildingInput, kit: CompiledBuildKit, seed: number, frame: PlanningFrame,
): TownBuildingPlan {
  const parsed = parseBuildingType(input.type);
  if (input.sizeCells[0] <= 0 || input.sizeCells[1] <= 0) {
    throw new RangeError('TOWN_PLAN_INVALID_SIZE');
  }
  const side = entranceSide(input.originCell, input.sizeCells, input.entranceCell);
  const yaw = yawFromEntranceSide(side);
  const [cxMm, czMm] = planningRectCentreMm(frame, input.originCell, input.sizeCells);
  const [gridWMm, gridDMm] = [input.sizeCells[0] * CELL_MM, input.sizeCells[1] * CELL_MM];
  const wMm = yaw === 0 || yaw === 2 ? gridWMm : gridDMm;
  const dMm = yaw === 0 || yaw === 2 ? gridDMm : gridWMm;
  const [x0, z1] = planningPointMm(frame, input.originCell[0], input.originCell[1]);
  const x1 = x0 + gridWMm;
  const z0 = z1 - gridDMm;
  const floors = input.enterable
    ? [[x0 + FLOOR_INSET_MM, z0 + FLOOR_INSET_MM,
      x1 - FLOOR_INSET_MM, z1 - FLOOR_INSET_MM] as const]
    : [];

  return {
    id: input.id,
    archetype: 'landmark' in parsed ? parsed.landmark : parsed.archetype,
    kit: kit.id,
    seed,
    footprint: [cxMm, czMm, wMm, dMm],
    yaw,
    storeys: 1,
    roof: [RoofStyle.Xuanshan, 3_000, 4_500],
    entrances: [[0, 0, 1_400]],
    enterable: input.enterable,
    elev: [input.baseYMm, 150],
    floors,
    floorY: input.enterable ? [150] : [],
    fixtures: [],
    signage: null,
    facility: input.facility ?? 'none',
  };
}
