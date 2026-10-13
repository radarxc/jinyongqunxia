import { readFileSync } from 'node:fs';
import { floorDivInt } from '@tianshu/shared';
import { describe, expect, it } from 'vitest';
import { resolvePlanRecipe } from '../dims';
import {
  GATE_CLEAR_HEIGHT_MM,
  GATE_CLEAR_WIDTH_MM,
  GATEHOUSE_EAVE_MM,
  GATEHOUSE_RIDGE_MM,
  PART_BRACKETS,
  PART_ENTERABLE,
  PART_GATE_OPENING,
  PART_SECOND_ENTRY,
  PART_STABLE,
  partDoorWidthMm,
} from '../compound';
import { hexCentreMm, planningPointMm, worldToLocalQuarter } from '../frame';
import { isInteriorHexWalkable, reachableInteriorHexes } from '../interiors/hexes';
import { emptyInteriorPlanner, planBuilding, planBuildingDiagnostics } from '../plan-hall';
import { testBuildKit } from '../testing';
import { PartKind } from '../types';
import type {
  CompiledBuildKit,
  LayoutBuildingInput,
  PartTuple,
  PlanningFrame,
  RectMm,
  TownBuildingPlan,
  Yaw4,
} from '../types';

const SONG = testBuildKit(
  readFileSync(
    new URL('../../../../../../content/town/buildkits/song_dali.yaml', import.meta.url),
    'utf8',
  ),
);
const XIYU = testBuildKit(
  readFileSync(
    new URL('../../../../../../content/town/buildkits/xiyu.yaml', import.meta.url),
    'utf8',
  ),
);
interface PilotFile {
  readonly scenes: readonly {
    readonly sceneId: string;
    readonly kitId: string;
    readonly variant?: string;
    readonly frame: PlanningFrame;
    readonly buildings: readonly LayoutBuildingInput[];
  }[];
}
const PILOTS = JSON.parse(
  readFileSync(new URL('../testing/pilot-buildings.json', import.meta.url), 'utf8'),
) as PilotFile;
const FRAME: PlanningFrame = { heightCells: 160, originXMm: 0, originZMm: 0 };
const SIZES = [
  [12, 10],
  [16, 12],
  [20, 16],
  [24, 20],
] as const;
const ROOM_FLAGS = PART_ENTERABLE;

function planCompoundCase(
  source: LayoutBuildingInput,
  kit: CompiledBuildKit,
  seed: number,
  frame: PlanningFrame = FRAME,
  variant?: string,
): TownBuildingPlan {
  return planBuilding(source, kit, seed, frame, {
    ...(variant === undefined ? {} : { variant }),
  });
}

function entranceFor(source: LayoutBuildingInput, side: number): readonly [number, number] {
  const [x, z] = source.originCell;
  const [w, d] = source.sizeCells;
  if (side === 0) return [x + floorDivInt(w, 2), z - 1];
  if (side === 1) return [x - 1, z + floorDivInt(d, 2)];
  if (side === 2) return [x + floorDivInt(w, 2), z + d];
  return [x + w, z + floorDivInt(d, 2)];
}

function withEntranceSide(source: LayoutBuildingInput, side: number): LayoutBuildingInput {
  return { ...source, entranceCell: entranceFor(source, side) };
}

function input(
  size: readonly [number, number],
  side: number,
  type = 'bld_kit_song_dali_courtyard',
): LayoutBuildingInput {
  const [w, d] = size;
  const doors = [
    [floorDivInt(w, 2), -1],
    [-1, floorDivInt(d, 2)],
    [floorDivInt(w, 2), d],
    [w, floorDivInt(d, 2)],
  ] as const;
  return {
    id: `bi_compound_${w}_${d}_${side}`,
    type,
    originCell: [0, 0],
    sizeCells: size,
    entranceCell: doors[side]!,
    enterable: true,
    baseYMm: 0,
  };
}

function partRect(part: PartTuple): RectMm {
  const odd = part[5] === 1 || part[5] === 3;
  const w = odd ? part[4] : part[3];
  const d = odd ? part[3] : part[4];
  const x0 = part[1] - floorDivInt(w, 2);
  const z0 = part[2] - floorDivInt(d, 2);
  return [x0, z0, x0 + w, z0 + d];
}

function footprintRect(plan: TownBuildingPlan): RectMm {
  const odd = plan.yaw === 1 || plan.yaw === 3;
  const w = odd ? plan.footprint[3] : plan.footprint[2];
  const d = odd ? plan.footprint[2] : plan.footprint[3];
  const x0 = plan.footprint[0] - floorDivInt(w, 2);
  const z0 = plan.footprint[1] - floorDivInt(d, 2);
  return [x0, z0, x0 + w, z0 + d];
}

function overlaps(a: RectMm, b: RectMm): boolean {
  return a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
}

function frontVector(yaw: Yaw4): readonly [number, number] {
  if (yaw === 0) return [0, 1];
  if (yaw === 1) return [-1, 0];
  if (yaw === 2) return [0, -1];
  return [1, 0];
}

function expectRoomDoorsFaceYard(plan: TownBuildingPlan): void {
  const yards = (plan.parts ?? []).filter((part) => part[0] === PartKind.Yard);
  expect(yards.length).toBeGreaterThan(0);
  for (const room of (plan.parts ?? []).filter(
    (part) => part[0] === PartKind.Hall || part[0] === PartKind.Wing,
  )) {
    expect((room[11] & PART_ENTERABLE) !== 0).toBe(true);
    expect(partDoorWidthMm(room[11])).toBeGreaterThanOrEqual(1_200);
    const nearest = yards.reduce(
      (best, yard) => {
        const dx = yard[1] - room[1];
        const dz = yard[2] - room[2];
        const distance = dx * dx + dz * dz;
        return distance < best.distance ? { dx, dz, distance } : best;
      },
      { dx: 0, dz: 0, distance: Number.MAX_SAFE_INTEGER },
    );
    const front = frontVector(room[5]);
    expect(nearest.dx * front[0] + nearest.dz * front[1]).toBeGreaterThan(0);
  }
}

function localPartCentre(plan: TownBuildingPlan, part: PartTuple): readonly [number, number] {
  return worldToLocalQuarter(part[1] - plan.footprint[0], part[2] - plan.footprint[1], plan.yaw);
}

function expectGeometry(plan: TownBuildingPlan, wallMm: number): void {
  const parts = plan.parts ?? [];
  expect(parts.length).toBeLessThanOrEqual(12);
  const bounds = footprintRect(plan);
  for (const part of parts) {
    const rect = partRect(part);
    expect(rect[0]).toBeGreaterThanOrEqual(bounds[0]);
    expect(rect[1]).toBeGreaterThanOrEqual(bounds[1]);
    expect(rect[2]).toBeLessThanOrEqual(bounds[2]);
    expect(rect[3]).toBeLessThanOrEqual(bounds[3]);
  }
  const solids = parts.filter((part) => part[0] !== PartKind.Enclosure);
  for (let left = 0; left < solids.length; left += 1)
    for (let right = left + 1; right < solids.length; right += 1)
      expect(
        overlaps(partRect(solids[left]!), partRect(solids[right]!)),
        `part overlap ${left}:${right}`,
      ).toBe(false);
  const gate = parts.find((part) => part[0] === PartKind.Gatehouse);
  expect(gate).toBeDefined();
  const gateCentre = localPartCentre(plan, gate!);
  expect(gateCentre[1] + floorDivInt(gate![4], 2)).toBe(floorDivInt(plan.footprint[3], 2) - wallMm);
  const localOffset = plan.entrances[0]?.[1] ?? 0;
  expect(gateCentre[0] === 0 ? 0 : gateCentre[0]).toBe(localOffset === 0 ? 0 : localOffset);
  expect(plan.entrances[0]![2]).toBeGreaterThanOrEqual(1_200);
  expect(gate?.[8]).toBe(GATEHOUSE_EAVE_MM);
  expect(gate?.[9]).toBe(GATEHOUSE_RIDGE_MM);
  expect((gate?.[11] ?? 0) & PART_GATE_OPENING).toBe(PART_GATE_OPENING);
  expect(partDoorWidthMm(gate?.[11] ?? 0)).toBe(GATE_CLEAR_WIDTH_MM);
  expectRoomDoorsFaceYard(plan);
}

function pointInRect(x: number, z: number, rect: RectMm): boolean {
  return x >= rect[0] && x < rect[2] && z >= rect[1] && z < rect[3];
}

function expectPartFloorY(plan: TownBuildingPlan): void {
  for (const room of (plan.parts ?? []).filter(
    (part) => part[0] === PartKind.Hall || part[0] === PartKind.Wing,
  )) {
    const bounds = partRect(room);
    const levels = new Set<number>();
    plan.floors.forEach((floor, index) => {
      const inside =
        pointInRect(floor[0], floor[1], bounds) && floor[2] <= bounds[2] && floor[3] <= bounds[3];
      if (inside) levels.add(plan.floorY[index]!);
    });
    expect(levels.size).toBe(1);
    expect([...levels]).toEqual([room[10]]);
  }
}

function hexFor(x: number, z: number): { q: number; r: number } {
  const r = floorDivInt(z, 1_000);
  const q = floorDivInt(100 * x - 57_735 * r, 115_470);
  let best = { q, r };
  let bestDistance = Number.MAX_SAFE_INTEGER;
  for (let dr = -2; dr <= 2; dr += 1)
    for (let dq = -2; dq <= 2; dq += 1) {
      const candidate = { q: q + dq, r: r + dr };
      const centre = hexCentreMm(candidate.q, candidate.r);
      const dx = centre[0] - x;
      const dz = centre[1] - z;
      const distance = dx * dx + dz * dz;
      if (distance < bestDistance) {
        best = candidate;
        bestDistance = distance;
      }
    }
  return best;
}

function expectStationsReachable(
  plan: TownBuildingPlan,
  source: LayoutBuildingInput,
  frame: PlanningFrame,
): number {
  expect(plan.floorY).toHaveLength(plan.floors.length);
  const walkable: { q: number; r: number }[] = [];
  const bounds = footprintRect(plan);
  const r0 = floorDivInt(bounds[1], 1_000) - 2;
  const r1 = floorDivInt(bounds[3], 1_000) + 2;
  for (let r = r0; r <= r1; r += 1) {
    const q0 = floorDivInt(100 * bounds[0] - 57_735 * r, 115_470) - 2;
    const q1 = floorDivInt(100 * bounds[2] - 57_735 * r, 115_470) + 2;
    for (let q = q0; q <= q1; q += 1) {
      const cell = { q, r };
      if (isInteriorHexWalkable(plan.floors, plan.fixtures, cell)) walkable.push(cell);
    }
  }
  expect(walkable.length).toBeGreaterThan(0);
  const entranceCorner = planningPointMm(frame, source.entranceCell[0], source.entranceCell[1]);
  const gate = plan.parts?.find(
    (part) => part[0] === PartKind.Gatehouse && (part[11] & PART_SECOND_ENTRY) === 0,
  );
  expect(gate).toBeDefined();
  const start = hexFor(entranceCorner[0] + 500, entranceCorner[1] - 500);
  const outside: RectMm = [
    entranceCorner[0] - 1_000,
    entranceCorner[1] - 2_000,
    entranceCorner[0] + 2_000,
    entranceCorner[1] + 1_000,
  ];
  const bridge: RectMm = [gate![1] - 1_200, gate![2] - 1_200, gate![1] + 1_200, gate![2] + 1_200];
  const routeFloors = [...plan.floors, bridge, outside];
  expect(isInteriorHexWalkable(routeFloors, plan.fixtures, start)).toBe(true);
  const reached = new Set(
    reachableInteriorHexes(routeFloors, plan.fixtures, start).map((cell) => `${cell.q},${cell.r}`),
  );
  const stations = plan.fixtures.filter((item) => item[0] >= 200);
  expect(stations.length).toBeGreaterThan(0);
  for (const station of stations) {
    const nearest = walkable.reduce(
      (best, cell) => {
        const centre = hexCentreMm(cell.q, cell.r);
        const dx = centre[0] - station[1];
        const dz = centre[1] - station[2];
        const distance = dx * dx + dz * dz;
        return distance < best.distance ? { cell, distance } : best;
      },
      { cell: walkable[0]!, distance: Number.MAX_SAFE_INTEGER },
    );
    expect(
      nearest.distance,
      `station-distance=${station[0]}@${station[1]},${station[2]}`,
    ).toBeLessThanOrEqual(1_200 * 1_200);
    expect(
      reached.has(`${nearest.cell.q},${nearest.cell.r}`),
      `station=${station[0]}@${station[1]},${station[2]} start=${start.q},${start.r} nearest=` +
        `${nearest.cell.q},${nearest.cell.r} reached=${reached.size}`,
    ).toBe(true);
  }
  return reached.size;
}

describe('compound synthetic geometry', () => {
  it('always dispatches compound through the public default path', () => {
    const source = input([12, 10], 0);
    const defaultPlan = planBuilding(source, SONG, 7, FRAME);
    const emptyPlan = planBuilding(source, SONG, 7, FRAME, { interior: emptyInteriorPlanner });
    expect(defaultPlan.parts?.length).toBeGreaterThan(4);
    expect(emptyPlan.parts?.length).toBeGreaterThan(4);
    expect(planBuildingDiagnostics(source, SONG)).toEqual([]);
  });

  it.each(SIZES)('plans %d by %d on all four entrance edges', (w, d) => {
    for (let side = 0; side < 4; side += 1) {
      const plan = planCompoundCase(input([w, d], side), SONG, 0x51515151);
      expectGeometry(plan, SONG.walls.enclosure.t);
      expectPartFloorY(plan);
      expectStationsReachable(plan, input([w, d], side), FRAME);
      expect(JSON.stringify(planCompoundCase(input([w, d], side), SONG, 0x51515151))).toBe(
        JSON.stringify(plan),
      );
    }
  });

  it('keeps the preferred main hall facing south when the entrance is north', () => {
    const plan = planCompoundCase(input([16, 12], 2), SONG, 1);
    const hall = plan.parts?.find((part) => part[0] === PartKind.Hall);
    expect(hall?.[5]).toBe(0);
    expect(hall?.[2]).toBeLessThan(plan.footprint[1]);
    expectRoomDoorsFaceYard(plan);
  });
});

describe('compound archetypes and pilots', () => {
  it.each([
    ['courtyard', 'hall_wing_gate'],
    ['yamen', 'yamen'],
    ['wangfu', 'wangfu'],
    ['manor', 'manor'],
    ['biaoju', 'biaoju'],
  ] as const)('dispatches %s through layout %s', (archetype, layout) => {
    const source = input([20, 16], 0, `bld_kit_song_dali_${archetype}`);
    const [, recipe] = resolvePlanRecipe(source, SONG);
    expect(recipe.layout).toBe(layout);
    const plan = planCompoundCase(source, SONG, 7);
    expectGeometry(plan, SONG.walls.enclosure.t);
    expectPartFloorY(plan);
    expectStationsReachable(plan, source, FRAME);
    const yards = plan.parts?.filter((part) => part[0] === PartKind.Yard) ?? [];
    if (layout === 'wangfu') {
      expect(yards).toHaveLength(2);
      const secondGate = plan.parts?.find((part) => (part[11] & PART_SECOND_ENTRY) !== 0);
      expect(secondGate).toBeDefined();
      expect((secondGate?.[11] ?? 0) & PART_GATE_OPENING).toBe(PART_GATE_OPENING);
      expect(partDoorWidthMm(secondGate?.[11] ?? 0)).toBe(GATE_CLEAR_WIDTH_MM);
    }
    if (layout === 'biaoju') {
      expect(yards).toHaveLength(2);
      expect(plan.parts?.some((part) => (part[11] & PART_STABLE) !== 0)).toBe(true);
    }
  });

  it('gives the Dali court a screen wall without blocking entrance reachability', () => {
    const plan = planCompoundCase(input([12, 10], 0), SONG, 8);
    expect(plan.parts?.some((part) => part[0] === PartKind.ScreenWall)).toBe(true);
    expectStationsReachable(plan, input([12, 10], 0), FRAME);
  });

  it.each([1, 3])('keeps a screen wall in a 10 by 8 east-west entrance court side %d', (side) => {
    const source = input([10, 8], side);
    const plan = planCompoundCase(source, SONG, 8);
    expect(plan.parts?.some((part) => part[0] === PartKind.ScreenWall)).toBe(true);
    expectStationsReachable(plan, source, FRAME);
  });

  it('keeps the gate opening at 1600 by 2400 millimetres', () => {
    const plan = planCompoundCase(input([12, 10], 0), SONG, 8);
    expect(plan.entrances[0]?.[2]).toBe(GATE_CLEAR_WIDTH_MM);
    expect(GATE_CLEAR_WIDTH_MM).toBeGreaterThanOrEqual(1_200);
    expect(GATE_CLEAR_HEIGHT_MM).toBeGreaterThanOrEqual(2_100);
  });

  it('gives a Xiyu court adobe enclosure, front gallery, and grape trellis', () => {
    const plan = planCompoundCase(input([16, 12], 0), XIYU, 9, FRAME, 'tang_buddhist');
    expect(plan.parts?.some((part) => part[0] === PartKind.Gallery)).toBe(true);
    expect(plan.parts?.some((part) => part[0] === PartKind.Trellis)).toBe(true);
    const enclosure = plan.parts?.find((part) => part[0] === PartKind.Enclosure);
    expect(enclosure?.[11] ?? 0).toBeGreaterThanOrEqual(8);
    expectGeometry(plan, XIYU.walls.enclosure.t);
  });

  it.each([
    ['temple', SONG, 'temple'],
    ['xiyu_inn', XIYU, 'inn'],
    ['xiyu_court', XIYU, 'residence'],
  ] as const)('dispatches synthetic %s layout', (layout, baseKit, facility) => {
    const kit: CompiledBuildKit = {
      ...baseKit,
      archetypes: {
        ...baseKit.archetypes,
        courtyard: {
          ...baseKit.archetypes['courtyard']!,
          layout,
          facility,
        },
      },
    };
    const plan = planCompoundCase(input([20, 16], 0), kit, 10);
    expectGeometry(plan, kit.walls.enclosure.t);
    expectStationsReachable(plan, input([20, 16], 0), FRAME);
    if (layout === 'temple') {
      const hall = plan.parts?.find((part) => part[0] === PartKind.Hall);
      expect((hall?.[11] ?? 0) & PART_BRACKETS).toBe(PART_BRACKETS);
      expect(hall?.[10]).toBe(baseKit.dims.hall.platform);
    } else {
      expect(plan.parts?.some((part) => part[0] === PartKind.Trellis)).toBe(true);
    }
  });

  it('plans every pilot compound deterministically and reports serialized bytes', () => {
    const rows: string[] = [];
    for (const scene of PILOTS.scenes) {
      const kit = scene.kitId === 'xiyu' ? XIYU : SONG;
      for (const building of scene.buildings) {
        const [, recipe] = resolvePlanRecipe(building, kit);
        if ('unsupported' in recipe || recipe.recipe !== 'compound') continue;
        for (let side = 0; side < 4; side += 1) {
          const source = withEntranceSide(building, side);
          const plan = planCompoundCase(source, kit, 0x51a7c0de, scene.frame, scene.variant);
          expect(
            JSON.stringify(planCompoundCase(source, kit, 0x51a7c0de, scene.frame, scene.variant)),
          ).toBe(JSON.stringify(plan));
          try {
            expectGeometry(plan, kit.walls.enclosure.t);
            expectPartFloorY(plan);
          } catch (error) {
            throw new Error(`${scene.sceneId}/${building.id}/s${side}: ${String(error)}`);
          }
          let reachable: number;
          try {
            reachable = expectStationsReachable(plan, source, scene.frame);
          } catch (error) {
            throw new Error(`${scene.sceneId}/${building.id}/s${side}: ${String(error)}`);
          }
          expect(
            plan.parts?.filter((part) => (part[11] & ROOM_FLAGS) !== 0).length,
          ).toBeGreaterThan(0);
          rows.push(
            `${scene.sceneId}/${building.id}/s${side}:${plan.parts?.length ?? 0}:` +
              `${reachable}:${JSON.stringify(plan).length}`,
          );
        }
      }
    }
    expect(rows).toHaveLength(56);
    console.info(`[compound-bytes] ${rows.join(',')}`);
  });
});

describe('compound integer source guard', () => {
  it('uses no arithmetic slash or forbidden APIs in every p3 source', () => {
    const files = [
      '../plan-compound.ts',
      '../compound/index.ts',
      '../compound/parts.ts',
      '../compound/residence.ts',
      '../compound/yamen.ts',
      '../compound/wangfu.ts',
      '../compound/manor.ts',
      '../compound/escort.ts',
      '../compound/temple.ts',
      '../compound/xiyu.ts',
    ];
    for (const file of files) {
      const source = readFileSync(new URL(file, import.meta.url), 'utf8');
      expect(source, file).not.toMatch(/Math\.|new Date|\bsqrt\b|\bpow\b|\brandom\b|\batan\b/);
      expect(source, file).not.toMatch(new RegExp(' [/] ', 'u'));
    }
  });
});
