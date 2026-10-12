import { readFileSync } from 'node:fs';
import { floorDivInt } from '@tianshu/shared';
import { describe, expect, it } from 'vitest';
import { TownBuildingPlanSchema } from '../../../schemas/town-scene';
import { planDimensions, resolvePlanRecipe } from '../dims';
import { planDoors } from '../doors';
import {
  doorClearanceFor, emptyInteriorPlanner, planBuilding, planBuildingDiagnostics,
} from '../index';
import type { InteriorPlanner, PlanBuildingOptions } from '../index';
import { testBuildKit } from '../testing';
import { RoofStyle } from '../types';
import type { CompiledBuildKit, LayoutBuildingInput, PlanningFrame, TownBuildingPlan } from '../types';

const FRAME: PlanningFrame = { heightCells: 160, originXMm: 0, originZMm: 0 };
const EMPTY_INTERIOR = { interior: emptyInteriorPlanner } as const;
const SONG = testBuildKit(readFileSync(
  new URL('../../../../../../content/town/buildkits/song_dali.yaml', import.meta.url), 'utf8',
));
const XIYU = testBuildKit(readFileSync(
  new URL('../../../../../../content/town/buildkits/xiyu.yaml', import.meta.url), 'utf8',
));
interface PilotFile { readonly scenes: readonly {
  readonly kitId: string; readonly variant?: string; readonly frame: PlanningFrame;
  readonly buildings: readonly LayoutBuildingInput[];
}[] }
const PILOTS = JSON.parse(readFileSync(
  new URL('../testing/pilot-buildings.json', import.meta.url), 'utf8',
)) as PilotFile;

function input(
  type: string, sizeCells: readonly [number, number], side = 0, enterable = true,
): LayoutBuildingInput {
  const [w, h] = sizeCells;
  const entrances = [[floor(w, 2), -1], [-1, floor(h, 2)],
    [floor(w, 2), h], [w, floor(h, 2)]] as const;
  return {
    id: `bi_${w}_${h}_${side}`, type, originCell: [0, 0], sizeCells,
    entranceCell: entrances[side]!, enterable, baseYMm: 0,
  };
}

function floor(value: number, divisor: number): number {
  return floorDivInt(value, divisor);
}

function expectMm(actual: number, expected: number): void {
  expect(actual).toBeGreaterThanOrEqual(expected - 1);
  expect(actual).toBeLessThanOrEqual(expected + 1);
}

function worldBounds(plan: TownBuildingPlan): readonly [number, number, number, number] {
  const worldW = plan.yaw === 0 || plan.yaw === 2 ? plan.footprint[2] : plan.footprint[3];
  const worldD = plan.yaw === 0 || plan.yaw === 2 ? plan.footprint[3] : plan.footprint[2];
  return [plan.footprint[0] - floor(worldW, 2), plan.footprint[1] - floor(worldD, 2),
    plan.footprint[0] + worldW - floor(worldW, 2),
    plan.footprint[1] + worldD - floor(worldD, 2)];
}

function expectPlanInvariants(plan: TownBuildingPlan, kit: CompiledBuildKit): void {
  expect(plan.floorY).toHaveLength(plan.floors.length);
  if (plan.enterable) {
    expect(plan.entrances.length).toBeGreaterThan(0);
    for (const entrance of plan.entrances) expect(entrance[2]).toBeGreaterThanOrEqual(1_200);
  }
  const [x0, z0, x1, z1] = worldBounds(plan);
  const recipe = kit.archetypes[plan.archetype] ?? kit.landmarks[plan.archetype];
  const wall = recipe !== undefined && 'recipe' in recipe && recipe.recipe === 'compound'
    ? 300 : Math.max(kit.walls.front.t, kit.walls.back.t, kit.walls.gable.t);
  for (const floorRect of plan.floors) {
    expect(floorRect[0]).toBeGreaterThanOrEqual(x0 + wall);
    expect(floorRect[1]).toBeGreaterThanOrEqual(z0 + wall);
    expect(floorRect[2]).toBeLessThanOrEqual(x1 - wall);
    expect(floorRect[3]).toBeLessThanOrEqual(z1 - wall);
  }
  expect(JSON.stringify(plan).length).toBeLessThanOrEqual(700);
}

function expectDoorHeight(source: LayoutBuildingInput, kit: CompiledBuildKit): void {
  if (!source.enterable) return;
  const [, recipe] = resolvePlanRecipe(source, kit);
  const dims = planDimensions(source, kit);
  const centre = dims.bayWidthsMm[floor(dims.bayWidthsMm.length, 2)]!;
  const doors = planDoors(source, [0, 0, dims.widthMm, dims.depthMm],
    kit, recipe, centre, dims.platformMm);
  expect(doors.clearHeightMm).toBeGreaterThanOrEqual(2_100);
}

function expectDoor(
  source: LayoutBuildingInput, kit: CompiledBuildKit, width: number,
  clearHeightMm: number, thresholdMm: number,
): void {
  const [, recipe] = resolvePlanRecipe(source, kit);
  const dims = planDimensions(source, kit);
  const centre = dims.bayWidthsMm[floor(dims.bayWidthsMm.length, 2)]!;
  const doors = planDoors(source, [0, 0, dims.widthMm, dims.depthMm],
    kit, recipe, centre, dims.platformMm);
  expect(doors).toMatchObject({
    entrances: [[0, 0, width]], clearHeightMm, thresholdMm,
  });
}

describe('tech/16 section 3 golden buildings', () => {
  it('plans the 6 by 5 Dali shop', () => {
    const source = input('bld_kit_song_dali_shop', [6, 5]);
    const dims = planDimensions(source, SONG);
    const plan = planBuilding(source, SONG, 1, FRAME, EMPTY_INTERIOR);
    expect(dims.bayWidthsMm).toEqual([4_750]);
    expectMm(plan.roof[1], 3_070);
    expectMm(plan.roof[2], 4_566);
    expect(plan.entrances).toEqual([[0, 0, 3_200]]);
    expectDoor(source, SONG, 3_200, 2_700, 120);
    expect(plan.floors[0]![2] - plan.floors[0]![0]).toBe(4_400);
    expect(plan.floors[0]![3] - plan.floors[0]![1]).toBe(3_100);
  });

  it('plans the 6 by 5 Dali residence', () => {
    const source = input('bld_kit_song_dali_house', [6, 5]);
    const dims = planDimensions(source, SONG);
    const plan = planBuilding(source, SONG, 2, FRAME, EMPTY_INTERIOR);
    expect(dims.bayWidthsMm).toEqual([1_724, 2_102, 1_724]);
    expect(plan.entrances).toEqual([[0, 0, 1_400]]);
    expectDoor(source, SONG, 1_400, 2_150, 120);
    expectMm(plan.roof[1], 2_910);
    expectMm(plan.roof[2], 4_419);
    expect(plan.floors[0]![2] - plan.floors[0]![0]).toBe(5_200);
    expect(plan.floors[0]![3] - plan.floors[0]![1]).toBe(3_200);
  });

  it('plans the 10 by 8 two-storey inn', () => {
    const source = input('bld_kit_song_dali_inn', [10, 8]);
    const plan = planBuilding(source, SONG, 3, FRAME, EMPTY_INTERIOR);
    expect(plan.storeys).toBe(2);
    expect(plan.entrances).toEqual([[0, 0, 1_500]]);
    expectDoor(source, SONG, 1_500, 2_350, 150);
    expectMm(plan.roof[1], 6_130);
    expectMm(plan.roof[2], 8_547);
  });

  it('plans the 12 by 10 bracketed temple hall', () => {
    const source = input('bld_kit_song_dali_temple_hall', [12, 10]);
    const plan = planBuilding(source, SONG, 4, FRAME, EMPTY_INTERIOR);
    expect(plan.entrances).toEqual([[0, 0, 2_000]]);
    expectDoor(source, SONG, 2_000, 3_000, 200);
    expectMm(plan.roof[1], 4_575);
    expectMm(plan.roof[2], 8_483);
  });
});

describe('recipe dispatch', () => {
  it('makes stalls closed and floorless', () => {
    const plan = planBuilding(input('bld_kit_song_dali_market_stall', [3, 2]), SONG, 5, FRAME);
    expect(plan).toMatchObject({ enterable: false, floors: [], floorY: [], entrances: [] });
    expect(plan.roof[0]).toBe(RoofStyle.Canopy);
  });

  it('uses flat roof top and parapet for Xiyu adobe', () => {
    const plan = planBuilding(input('bld_kit_song_dali_house', [6, 5]), XIYU, 6, FRAME);
    expect(plan.roof).toEqual([RoofStyle.Flat, 3_500, 3_950]);
  });

  it('gives only a tang_buddhist temple the Tang stupa finial', () => {
    const source = input('bld_kit_song_dali_temple_hall', [12, 10]);
    const base = planBuilding(source, XIYU, 7, FRAME);
    const tang = planBuilding(source, XIYU, 7, FRAME, { variant: 'tang_buddhist' });
    expect(base).not.toHaveProperty('finial');
    expect(tang.roof[0]).toBe(RoofStyle.Cuanjian);
    expect(tang.finial).toBe('tang_stupa');
    const domeKit: CompiledBuildKit = { ...XIYU, archetypes: { ...XIYU.archetypes,
      temple_hall: { ...XIYU.archetypes['temple_hall']!, roof: 'dome' } } };
    expect(planBuilding(source, domeKit, 7, FRAME).roof[0]).toBe(RoofStyle.Dome);
    const converted = planBuilding(source, domeKit, 7, FRAME, { variant: 'tang_buddhist' });
    expect(converted.roof[0]).toBe(RoofStyle.Cuanjian);
    expect(converted.finial).toBe('tang_stupa');
  });

  it('keeps ordinary tang_buddhist residences and shops free of Buddhist finials', () => {
    const house = input('bld_kit_song_dali_house', [6, 5]);
    const shop = input('bld_kit_song_dali_shop', [6, 5]);
    expect(planBuilding(house, XIYU, 7, FRAME, { variant: 'tang_buddhist' }))
      .not.toHaveProperty('finial');
    expect(planBuilding(shop, XIYU, 7, FRAME, { variant: 'tang_buddhist' }))
      .not.toHaveProperty('finial');
  });

  it('replaces a forbidden official dome without adding a Buddhist finial', () => {
    const office = input('bld_kit_song_dali_palace_hall', [12, 10]);
    const domeKit: CompiledBuildKit = { ...XIYU, archetypes: { ...XIYU.archetypes,
      palace_hall: { ...XIYU.archetypes['palace_hall']!, roof: 'dome' } } };
    const plan = planBuilding(office, domeKit, 7, FRAME, { variant: 'tang_buddhist' });
    expect(plan.roof[0]).toBe(RoofStyle.Cuanjian);
    expect(plan).not.toHaveProperty('finial');
  });

  it('keeps compound on its p0 box and reports the hand-off diagnostic', () => {
    const source = input('bld_kit_song_dali_courtyard', [10, 8]);
    const plan = planBuilding(source, SONG, 8, FRAME);
    expect(plan.roof).toEqual([RoofStyle.Xuanshan, 3_000, 4_500]);
    expect(plan.floors[0]![2] - plan.floors[0]![0]).toBe(9_400);
    expect(plan.floors[0]![3] - plan.floors[0]![1]).toBe(7_400);
    expect(planBuildingDiagnostics(source, SONG)).toEqual([{
      code: 'PLAN_COMPOUND_PENDING',
      message: 'compound keeps the p0 box plan until ENG-buildgen-p3-compound',
      path: source.id,
    }]);
  });
});

describe('pilot and synthetic coverage', () => {
  it('plans all three pilot layouts deterministically inside each footprint', () => {
    for (const scene of PILOTS.scenes) {
      const kit = scene.kitId === 'xiyu' ? XIYU : SONG;
      for (const building of scene.buildings) {
        const options: PlanBuildingOptions = scene.variant === undefined ? EMPTY_INTERIOR
          : { variant: scene.variant, interior: emptyInteriorPlanner };
        const first = planBuilding(building, kit, 0x51a7c0de, scene.frame, options);
        const second = planBuilding(building, kit, 0x51a7c0de, scene.frame, options);
        expect(JSON.stringify(first)).toBe(JSON.stringify(second));
        expect(TownBuildingPlanSchema.parse(first)).toEqual(first);
        expectPlanInvariants(first, kit);
        if (!building.type.includes('pagoda')) expectDoorHeight(building, kit);
      }
    }
  });

  it.each([
    [6, 5], [7, 5], [7, 6], [8, 6], [9, 7], [10, 8], [12, 9],
    [12, 10], [13, 10], [14, 11], [3, 2], [4, 3], [5, 4],
  ] as const)('keeps synthetic %d by %d plans valid on four entrance sides', (w, h) => {
    for (let side = 0; side < 4; side += 1) {
      const source = input('bld_kit_song_dali_house', [w, h], side);
      const plan = planBuilding(source, SONG, 9, FRAME, EMPTY_INTERIOR);
      expectPlanInvariants(plan, SONG);
      expectDoorHeight(source, SONG);
      expect(plan.entrances[0]![2]).toBeGreaterThanOrEqual(1_200);
    }
  });

  it('keeps a 6 by 5 shop interior at least 4.2 by 2.9 metres', () => {
    const plan = planBuilding(
      input('bld_kit_song_dali_shop', [6, 5]), SONG, 10, FRAME, EMPTY_INTERIOR,
    );
    const room = plan.floors[0]!;
    expect(room[2] - room[0]).toBeGreaterThanOrEqual(4_200);
    expect(room[3] - room[1]).toBeGreaterThanOrEqual(2_900);
  });

  it('derives clear floor bounds from each kit wall thickness', () => {
    const source = input('bld_kit_song_dali_house', [6, 5]);
    const base = planBuilding(source, SONG, 10, FRAME, EMPTY_INTERIOR).floors[0]!;
    const thickKit: CompiledBuildKit = { ...SONG, walls: { ...SONG.walls,
      gable: { ...SONG.walls.gable, t: 550 },
      back: { ...SONG.walls.back, t: 550 },
      front: { ...SONG.walls.front, t: 250 },
    } };
    const thick = planBuilding(source, thickKit, 10, FRAME, EMPTY_INTERIOR).floors[0]!;
    expect([base[2] - base[0], base[3] - base[1]]).toEqual([5_200, 3_200]);
    expect([thick[2] - thick[0], thick[3] - thick[1]]).toEqual([4_900, 3_000]);
  });
});

describe('doors and interior seam', () => {
  it.each([
    ['song_dali shopfront', SONG, 3_200, 2_700, 120],
    ['xiyu carved_shopfront', XIYU, 3_200, 2_700, 100],
  ] as const)('uses exact %s shop clearance', (_name, kit, width, height, threshold) => {
    const source = input('bld_kit_song_dali_shop', [6, 5]);
    expect(planBuilding(source, kit, 10, FRAME, EMPTY_INTERIOR).entrances)
      .toEqual([[0, 0, width]]);
    expectDoor(source, kit, width, height, threshold);
  });

  it('keeps a non-enterable residence single door decorative', () => {
    const plan = planBuilding(
      input('bld_kit_song_dali_house', [6, 5], 0, false), SONG, 11, FRAME, EMPTY_INTERIOR,
    );
    expect(plan).toMatchObject({ enterable: false, entrances: [[0, 0, 900]], floors: [] });
  });

  it('keeps the Xiyu 1200 mm double door enterable and raises the hall threshold', () => {
    const residence = input('bld_kit_song_dali_house', [6, 5]);
    const [, houseRecipe] = resolvePlanRecipe(residence, XIYU);
    expect(planDoors(residence, [0, 0, 6_000, 5_000], XIYU, houseRecipe).entrances)
      .toEqual([[0, 0, 1_200]]);
    const temple = input('bld_kit_song_dali_temple_hall', [12, 10]);
    const [, templeRecipe] = resolvePlanRecipe(temple, SONG);
    expect(planDoors(temple, [0, 0, 12_000, 10_000], SONG, templeRecipe).thresholdMm)
      .toBe(200);
    expect(doorClearanceFor(SONG, 'hall')).toEqual({
      clearHeightMm: 3_000, thresholdMm: 200,
    });
  });

  it('uses a layout offset only when it is over one metre from the middle bay', () => {
    const near = { ...input('bld_kit_song_dali_house', [6, 5]), entranceCell: [3, -1] } as const;
    const far = { ...near, entranceCell: [5, -1] } as const;
    expect(planBuilding(near, SONG, 12, FRAME, EMPTY_INTERIOR).entrances[0]![1]).toBe(0);
    expect(planBuilding(far, SONG, 12, FRAME, EMPTY_INTERIOR).entrances[0]![1]).toBe(2_300);
  });

  it('lets InteriorPlanner replace fixtures, floors, and floorY together', () => {
    const source = input('bld_kit_song_dali_house', [6, 5]);
    const defaultPlanner: InteriorPlanner = emptyInteriorPlanner;
    const defaultOptions: PlanBuildingOptions = { interior: defaultPlanner };
    expect(planBuilding(source, SONG, 13, FRAME, defaultOptions).fixtures).toEqual([]);
    expect(planBuilding(source, SONG, 13, FRAME, EMPTY_INTERIOR).fixtures).toEqual([]);
    const fixture = [0, 0, 0, 1_000, 500, 0, 1] as const;
    const plan = planBuilding(source, SONG, 13, FRAME, { interior: ({ plan: draft }) => {
      const [x0, z0, x1, z1] = draft.floors[0]!;
      const split = floor(x0 + x1, 2);
      return { fixtures: [fixture], floors: [[x0, z0, split, z1], [split, z0, x1, z1]],
        floorY: [draft.floorY[0]!, draft.floorY[0]!] };
    } });
    expect(plan.fixtures).toEqual([fixture]);
    expect(plan.floors).toHaveLength(2);
    expect(plan.floorY).toEqual([300, 300]);
  });

  it('falls back to the archetype facility and emits requested signage', () => {
    const source = { ...input('bld_kit_song_dali_inn', [10, 8]),
      signTextKey: 'town.fixture.inn' } as const;
    const plan = planBuilding(source, SONG, 14, FRAME);
    expect(plan.facility).toBe('inn');
    expect(plan.signage).toEqual(['town.fixture.inn', 0]);
  });
});

describe('integer source guard', () => {
  it('does not use division or forbidden real-valued and nondeterministic APIs', () => {
    for (const name of ['dims.ts', 'doors.ts', 'plan-hall.ts']) {
      const source = readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
      expect(source).not.toMatch(/Math\.|new Date|\bsqrt\b|\bpow\b|\brandom\b|\batan\b/);
      expect(source).not.toMatch(new RegExp(' [/] ', 'u'));
    }
  });
});
