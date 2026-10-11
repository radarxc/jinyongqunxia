import { describe, expect, it } from 'vitest';
import { planBuilding } from '../plan-hall';
import { RoofStyle } from '../types';
import type { CompiledBuildKit, LayoutBuildingInput, PlanningFrame } from '../types';

const KIT: CompiledBuildKit = {
  schemaVersion: 'buildkit-runtime.v1', id: 'song_dali', archetypes: {}, landmarks: {},
};
const FRAME: PlanningFrame = { heightCells: 80, originXMm: 0, originZMm: 0 };
const BASE: LayoutBuildingInput = {
  id: 'bi_0001',
  type: 'bld_kit_song_dali_shop',
  originCell: [10, 20],
  sizeCells: [6, 5],
  entranceCell: [13, 19],
  enterable: true,
  baseYMm: 400,
  facility: 'general_store',
};

describe('p0 box planBuilding fallback', () => {
  it('builds the specified deterministic south-facing box', () => {
    expect(planBuilding(BASE, KIT, 0xfedcba98, FRAME)).toEqual({
      id: 'bi_0001', archetype: 'shop', kit: 'song_dali', seed: 0xfedcba98,
      footprint: [13_000, 57_500, 6_000, 5_000],
      yaw: 0, storeys: 1, roof: [RoofStyle.Xuanshan, 3_000, 4_500],
      entrances: [[0, 0, 1_400]], enterable: true, elev: [400, 150],
      floors: [[10_300, 55_300, 15_700, 59_700]], floorY: [150], fixtures: [],
      signage: null, facility: 'general_store',
    });
  });

  it.each([
    { entranceCell: [13, 19], yaw: 0, footprint: [6_000, 5_000] },
    { entranceCell: [9, 22], yaw: 1, footprint: [5_000, 6_000] },
    { entranceCell: [13, 25], yaw: 2, footprint: [6_000, 5_000] },
    { entranceCell: [16, 22], yaw: 3, footprint: [5_000, 6_000] },
  ] as const)('derives yaw $yaw from the entrance edge', ({ entranceCell, yaw, footprint }) => {
    const plan = planBuilding({ ...BASE, entranceCell }, KIT, 7, FRAME);
    expect(plan.yaw).toBe(yaw);
    expect(plan.footprint.slice(2)).toEqual(footprint);
  });

  it('keeps every floor rectangle inside the world footprint bounds', () => {
    for (const entranceCell of [[13, 25], [9, 22], [13, 19], [16, 22]] as const) {
      const plan = planBuilding({ ...BASE, entranceCell }, KIT, 7, FRAME);
      const [cx, cz, localW, localD] = plan.footprint;
      const worldW = plan.yaw === 0 || plan.yaw === 2 ? localW : localD;
      const worldD = plan.yaw === 0 || plan.yaw === 2 ? localD : localW;
      for (const [x0, z0, x1, z1] of plan.floors) {
        expect(x0).toBeGreaterThanOrEqual(cx - worldW / 2);
        expect(x1).toBeLessThanOrEqual(cx + worldW / 2);
        expect(z0).toBeGreaterThanOrEqual(cz - worldD / 2);
        expect(z1).toBeLessThanOrEqual(cz + worldD / 2);
      }
    }
  });

  it('emits no floor for a non-enterable building and defaults facility to none', () => {
    const input: LayoutBuildingInput = {
      id: BASE.id, type: BASE.type, originCell: BASE.originCell, sizeCells: BASE.sizeCells,
      entranceCell: BASE.entranceCell, enterable: false, baseYMm: BASE.baseYMm,
    };
    const plan = planBuilding(input, KIT, 9, FRAME);
    expect(plan.floors).toEqual([]);
    expect(plan.floorY).toEqual([]);
    expect(plan.facility).toBe('none');
  });

  it('rejects an empty footprint', () => {
    expect(() => planBuilding({ ...BASE, sizeCells: [0, 5] }, KIT, 9, FRAME))
      .toThrow('TOWN_PLAN_INVALID_SIZE');
  });
});
