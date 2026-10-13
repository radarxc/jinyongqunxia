import {
  entranceSide,
  planningPointMm,
  planningRectCentreMm,
  yawFromEntranceSide,
} from '../../town-plan/frame';
import { parseBuildingType } from '../../town-plan/archetype';
import { RoofStyle } from '../../town-plan/types';
import type {
  CompiledBuildKit,
  LayoutBuildingInput,
  PlanningFrame,
  TownBuildingPlan,
} from '../../town-plan/types';

/** Frozen p0 box planner used only by compiler golden tests. */
export function boxPlanner(
  input: LayoutBuildingInput,
  kit: CompiledBuildKit,
  seed: number,
  frame: PlanningFrame,
): TownBuildingPlan {
  const side = entranceSide(input.originCell, input.sizeCells, input.entranceCell);
  const yaw = yawFromEntranceSide(side);
  const parsed = parseBuildingType(input.type);
  const archetype = 'landmark' in parsed ? parsed.landmark : parsed.archetype;
  const [cx, cz] = planningRectCentreMm(frame, input.originCell, input.sizeCells);
  const [x0, z1] = planningPointMm(frame, input.originCell[0], input.originCell[1]);
  const x1 = x0 + input.sizeCells[0] * 1_000;
  const z0 = z1 - input.sizeCells[1] * 1_000;
  const enterable =
    input.enterable && !input.type.includes('market_stall') && !input.type.includes('pagoda');
  const width = (yaw & 1) === 0 ? input.sizeCells[0] * 1_000 : input.sizeCells[1] * 1_000;
  const depth = (yaw & 1) === 0 ? input.sizeCells[1] * 1_000 : input.sizeCells[0] * 1_000;
  return {
    id: input.id,
    archetype,
    kit: kit.id,
    seed,
    footprint: [cx, cz, width, depth],
    yaw,
    storeys: 1,
    roof: [RoofStyle.Xuanshan, 3_000, 4_500],
    entrances: enterable ? [[0, 0, 1_400]] : [],
    enterable,
    elev: [input.baseYMm, 150],
    floors: enterable ? [[x0 + 300, z0 + 300, x1 - 300, z1 - 300]] : [],
    floorY: enterable ? [150] : [],
    fixtures: [],
    signage: null,
    facility: input.facility ?? 'none',
  };
}
