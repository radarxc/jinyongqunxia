import { compareCodePoints } from '@tianshu/shared';
import type { RegionObject, TownSceneFacility } from '../../schemas/region-map';
import { FIXTURE_KIND_BY_NAME, localToWorldQuarter } from '../town-plan';
import { HEX_DIRECTIONS, cellCentreMm, hexDistance } from './frame';
import { isInteriorCell } from './geometry';
import type { CellState, TownWork } from './types';

function stationPoint(
  plan: TownWork['plans'][number],
  role: string,
): readonly [number, number] | undefined {
  const fixture = FIXTURE_KIND_BY_NAME.get(`stn_${role.replace(/_[0-9]+$/u, '')}`);
  if (fixture === undefined) return undefined;
  const tuple = plan.fixtures.find(([index]) => index === fixture.idx);
  if (tuple === undefined) return undefined;
  const [dx, dz] = localToWorldQuarter(tuple[1], tuple[2], plan.yaw);
  return [plan.footprint[0] + dx, plan.footprint[1] + dz];
}
function nearest(
  cells: readonly CellState[],
  point: readonly [number, number],
): CellState | undefined {
  return [...cells].sort((a, b) => {
    const [ax, az] = cellCentreMm(a);
    const [bx, bz] = cellCentreMm(b);
    const adx = ax - point[0];
    const adz = az - point[1];
    const bdx = bx - point[0];
    const bdz = bz - point[1];
    return adx * adx + adz * adz - bdx * bdx - bdz * bdz || a.r - b.r || a.q - b.q;
  })[0];
}
function npcObject(facilityKey: string, role: string, cell: CellState, seed: number): RegionObject {
  return {
    id: `npc_${facilityKey}_${role}`,
    class: 'FacilityNpc',
    q: cell.q,
    r: cell.r,
    h: cell.height,
    cells: [{ q: cell.q, r: cell.r, h: cell.height }],
    facilityKey,
    roleKey: role,
    facing: 0,
    interactRange: 2,
    appearance: { template: 'tpl_m_medium', outfit: 'outfit_shop', seed },
  };
}

export function compileFacilities(work: TownWork): TownSceneFacility[] {
  const result: TownSceneFacility[] = [];
  const source = [...work.input.facilities.facilities].sort((a, b) =>
    compareCodePoints(a.key, b.key),
  );
  for (const facility of source) {
    const plan = work.plans.find(({ id }) => id === facility.buildingId);
    if (plan === undefined)
      throw new Error(`TOWN_COMPILE_FACILITY_BUILDING:${facility.buildingId}`);
    const door = work.doors.find(({ buildingId }) => buildingId === plan.id);
    const candidates = [...work.cells.values()].filter(
      (cell) =>
        !cell.blocked && (plan.enterable ? isInteriorCell(plan, cell) : cell.building === 0),
    );
    const planIndex = work.plans.indexOf(plan) + 1;
    const stationCells = [...work.cells.values()].filter((cell) => cell.building === planIndex);
    const npcCells: CellState[] = [];
    for (const [roleIndex, role] of facility.roles.entries()) {
      const point = stationPoint(plan, role) ?? stationPoint(plan, 'keeper');
      const cell =
        point === undefined
          ? (door?.inside ??
            door?.outside ??
            nearest(candidates, [plan.footprint[0], plan.footprint[1]]))
          : nearest(stationCells, point);
      if (cell === undefined)
        throw new Error(`TOWN_COMPILE_FACILITY_STATION:${facility.key}:${role}`);
      npcCells.push(cell);
      work.objects.push(npcObject(facility.key, role, cell, (plan.seed + roleIndex) >>> 0));
      if (point === undefined)
        work.diagnostics.push({
          code: 'TOWN_FACILITY_STATION_FALLBACK',
          severity: 'info',
          message: `${facility.key}/${role} uses the door-side fallback station`,
          buildingIds: [plan.id],
        });
    }
    const customer = stationPoint(plan, 'customer');
    const serviceCandidates = candidates.filter((cell) =>
      npcCells.some((npc) => hexDistance(cell, npc) <= 2),
    );
    const service =
      customer === undefined ? serviceCandidates[0] : nearest(serviceCandidates, customer);
    if (service === undefined) throw new Error(`TOWN_COMPILE_FACILITY_SERVICE:${facility.key}`);
    const serviceKeys = new Set([
      service.key,
      ...HEX_DIRECTIONS.map(([dq, dr]) => `${service.q + dq},${service.r + dr}`),
    ]);
    const serviceCells =
      customer === undefined
        ? [service]
        : serviceCandidates
            .filter(({ key }) => serviceKeys.has(key))
            .sort((a, b) => a.r - b.r || a.q - b.q);
    result.push({
      key: facility.key,
      kind: facility.kind,
      sub: facility.sub,
      buildingId: facility.buildingId,
      nameKey: facility.nameKey,
      shop:
        facility.shop === null
          ? null
          : {
              instanceKey: `${work.input.source.layoutKey}/${facility.key}`,
              ...facility.shop,
            },
      roles: facility.roles,
      serviceCells: serviceCells.map(({ q, r }) => ({ q, r })),
      hours: facility.hours ?? null,
    });
  }
  return result;
}
