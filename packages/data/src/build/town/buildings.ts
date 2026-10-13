import { compareCodePoints } from '@tianshu/shared';
import { TownBuildingPlanSchema } from '../../schemas/region-map';
import {
  seedFor,
  type FacilityKind as PlanFacilityKind,
  type LayoutBuildingInput,
} from '../town-plan';
import { cellCentreMm } from './frame';
import { isFloorPoint, isInteriorPoint, pointInFootprint } from './geometry';
import type {
  LayoutBuilding,
  PlanBuildingFn,
  TownCompileInput,
  TownDiagnostic,
  TownWork,
} from './types';

const NON_ENTERABLE = ['market_stall', 'pagoda', 'wharf', 'palace_gate'];
const FACILITY_PLAN: Readonly<Record<string, PlanFacilityKind>> = {
  yaopu: 'pharmacy',
  zahuo: 'general_store',
  tiejiang: 'smithy',
  chengyi: 'cloth',
  mashi: 'stable',
  shitan: 'stall_food',
  kedian: 'inn',
  shushi: 'books',
  buzhuang: 'cloth',
  dangpu: 'pawnshop',
  qianzhuang: 'bank',
  shop: 'general_store',
  inn: 'inn',
  tavern: 'tavern',
  teahouse: 'teahouse',
  clinic: 'pharmacy',
  escort: 'escort',
  casino: 'casino',
  school: 'school',
  relay: 'stable',
  manor: 'residence',
  stall: 'stall_goods',
  temple: 'temple',
  office: 'office',
  residence: 'residence',
};
function layoutInput(building: LayoutBuilding, input: TownCompileInput): LayoutBuildingInput {
  const facility = input.facilities.facilities.find(({ buildingId }) => buildingId === building.id);
  const entrance = building.entrance_cells[0];
  if (entrance === undefined) throw new TypeError(`TOWN_COMPILE_ENTRANCE_MISSING:${building.id}`);
  return {
    id: building.id,
    type: building.type,
    originCell: [building.origin.x, building.origin.z],
    sizeCells: [building.size.w, building.size.h],
    entranceCell: [entrance.x, entrance.z],
    enterable: !NON_ENTERABLE.some((token) => building.type.includes(token)),
    baseYMm: 0,
    ...(facility === undefined
      ? {}
      : {
          facility:
            FACILITY_PLAN[facility.sub ?? facility.kind] ??
            FACILITY_PLAN[facility.kind] ??
            'residence',
          signTextKey: facility.nameKey,
        }),
  };
}

export function compileBuildings(work: TownWork, planner: PlanBuildingFn): void {
  const rows = [...work.input.layout.buildings].sort((a, b) => compareCodePoints(a.id, b.id));
  for (const [index, building] of rows.entries()) {
    const requested = TownBuildingPlanSchema.parse(
      planner(
        layoutInput(building, work.input),
        work.deps.kit,
        seedFor(work.sceneId, building.id),
        work.frame,
      ),
    );
    const plan =
      requested.enterable && requested.floors.length === 0
        ? { ...requested, enterable: false, entrances: [], floorY: [] }
        : requested;
    work.plans.push(plan);
    const occupied = [...work.cells.values()].filter((cell) => {
      const [x, z] = cellCentreMm(cell);
      return pointInFootprint(plan, x, z);
    });
    for (const cell of occupied) {
      const [x, z] = cellCentreMm(cell);
      const floor = isFloorPoint(plan, x, z);
      const walkable = isInteriorPoint(plan, x, z);
      cell.building = index + 1;
      cell.terrain = floor ? 'tr_shinei' : 'tr_shibi';
      cell.surface = floor ? 'wood_floor' : 'plinth';
      cell.blocked = !walkable;
    }
  }
}

export function buildingDiagnostic(
  code: string,
  message: string,
  ...ids: string[]
): TownDiagnostic {
  return { code, severity: 'warning', message, buildingIds: ids.sort(compareCodePoints) };
}
