import { describe, expect, it } from 'vitest';
import { FIXTURE_KIND_BY_NAME, localToWorldQuarter } from '../town-plan';
import { cellCentreMm, hexDistance } from './frame';
import { compileTownScene } from './index';
import { boxPlanner } from './__fixtures__/box-planner';
import { pilot } from './test-helpers';

describe('compiler injection and facilities', () => {
  it(
    'accepts a custom planner that makes every building non-enterable',
    { timeout: 30_000 },
    () => {
      const { input, kit } = pilot('dali10');
      const result = compileTownScene(
        { ...input, facilities: { ...input.facilities, facilities: [] } },
        {
          kit,
          planBuilding: (building, currentKit, seed, frame) => {
            const plan = boxPlanner(building, currentKit, seed, frame);
            return { ...plan, enterable: false, entrances: [], floors: [], floorY: [] };
          },
        },
      );
      expect(result.map.town?.buildings.every(({ enterable }) => !enterable)).toBe(true);
      expect(
        result.map.chunks
          .flatMap(({ objects }) => objects)
          .some(({ class: kind }) => kind === 'Building'),
      ).toBe(true);
    },
  );

  it(
    'turns stn_keeper into range-2 FacilityNpc and uses stn_customer service cells',
    { timeout: 30_000 },
    () => {
      const keeper = FIXTURE_KIND_BY_NAME.get('stn_keeper')!;
      const customer = FIXTURE_KIND_BY_NAME.get('stn_customer')!;
      const pilotCase = pilot('dali01');
      const facility = pilotCase.input.facilities.facilities[0]!;
      const input = {
        ...pilotCase.input,
        facilities: { ...pilotCase.input.facilities, facilities: [facility] },
      };
      const { kit } = pilotCase;
      const stationPoints = new Map<string, readonly [number, number]>();
      const result = compileTownScene(input, {
        kit,
        planBuilding: (building, currentKit, seed, frame) => {
          const plan = boxPlanner(building, currentKit, seed, frame);
          if (building.id !== facility.buildingId) return plan;
          const keeperZ = -Math.trunc(plan.footprint[3] / 2) + 100;
          const [dx, dz] = localToWorldQuarter(0, keeperZ, plan.yaw);
          stationPoints.set(building.id, [plan.footprint[0] + dx, plan.footprint[1] + dz]);
          return {
            ...plan,
            fixtures: [
              [keeper.idx, 0, keeperZ, 0, 0, 0, 0],
              [customer.idx, 0, 0, 0, 0, 0, 0],
            ],
          };
        },
      });
      const { map } = result;
      const npcs = map.chunks
        .flatMap(({ objects }) => objects)
        .filter((object) => object.class === 'FacilityNpc');
      expect(npcs.length).toBe(facility.roles.length);
      expect(npcs.every(({ interactRange }) => interactRange === 2)).toBe(true);
      expect(map.town?.facilities.every(({ serviceCells }) => serviceCells.length > 0)).toBe(true);
      expect(result.diagnostics.some(({ code }) => code === 'TOWN_FACILITY_STATION_FALLBACK')).toBe(
        false,
      );
      const plans = new Map(map.town?.buildings.map((plan) => [plan.id, plan]));
      for (const npc of npcs) {
        const facility = map.town!.facilities.find(({ key }) => key === npc.facilityKey)!;
        const plan = plans.get(facility.buildingId)!;
        const station = plan.fixtures.find(([index]) => index === keeper.idx)!;
        expect(station).toBeDefined();
        const expectedPoint = stationPoints.get(plan.id)!;
        const npcPoint = cellCentreMm({
          rawQ: npc.q + input.layout.runtime_partition.q_min,
          rawR: npc.r + input.layout.runtime_partition.r_min,
        });
        const dx = npcPoint[0] - expectedPoint[0];
        const dz = npcPoint[1] - expectedPoint[1];
        const npcDistance = dx * dx + dz * dz;
        const interior = plan.floors.some(
          ([x0, z0, x1, z1]) =>
            expectedPoint[0] >= x0 &&
            expectedPoint[0] < x1 &&
            expectedPoint[1] >= z0 &&
            expectedPoint[1] < z1,
        );
        expect(interior).toBe(false);
        expect(npcDistance).toBeLessThan(1_000_000);
        expect(
          facility.serviceCells.some((cell) => hexDistance(cell, npc) <= npc.interactRange),
        ).toBe(true);
      }
    },
  );
});
