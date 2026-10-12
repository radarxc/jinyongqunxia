import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { BuildingPlanView, BuildKitView, MeshPayload, Yaw4 } from '../types';
import { generateCells } from '../mesher/generate';
import { MeshBufferBuilder } from '../mesher/core/buffer';
import { hashCell } from '../mesher/core/hash';
import { box, transformPoint } from '../mesher/core/prims';
import {
  decodeHangingProps,
  inspectInv1,
  inspectInv2,
  inspectInv3,
  inspectInv4,
  inspectInv5,
} from '../mesher/core/inspect';
import { MINI_BUILDING_PLANS, MINI_BUILD_KIT } from '../testing/mini-plans';
import { columnLayout } from '../mesher/parts/columns';
import { hallHeights } from '../mesher/parts/beams';
import { hallEntrances, hallWallOpenings } from '../mesher/parts/walls';
import { emitSteps } from '../mesher/parts/steps';
import { hallSizeM } from '../mesher/parts/platform';

const HALL_PLANS = MINI_BUILDING_PLANS.filter((plan) =>
  ['shop', 'house', 'temple_hall'].includes(plan.archetype),
);
const LAYER_IDS = [
  'tile_roof', 'ridge_tiles', 'stone_rubble', 'stone_dressed', 'timber_raw',
  'timber_painted', 'earth_plaster', 'interior_dark', 'plaster_lime', 'signage',
  'lantern', 'unused_11', 'unused_12', 'unused_13', 'painted_band', 'unused_15',
];
const HALL_KIT: BuildKitView = {
  ...MINI_BUILD_KIT,
  layers: MINI_BUILD_KIT.layers.map((layer, index) => ({ ...layer, id: LAYER_IDS[index]! })),
  archetypes: {
    ...MINI_BUILD_KIT.archetypes,
    shop: { recipe: 'hall', size: 'shop', front: 'shopfront' },
    house: { recipe: 'hall', size: 'vernacular' },
    temple_hall: { recipe: 'hall', size: 'hall', brackets: true },
  },
};
const BUDGET = {
  shop: [3_000, 1_400],
  house: [2_500, 1_200],
  temple_hall: [9_000, 4_000],
} as const;

function yawPlan(source: BuildingPlanView, yaw: Yaw4): BuildingPlanView {
  const [width, depth] = source.footprint.slice(2);
  const sourceFloor = source.floors[0]!;
  const sourceWorldW = sourceFloor[2] - sourceFloor[0];
  const sourceWorldD = sourceFloor[3] - sourceFloor[1];
  const [interiorWidth, interiorDepth] = source.yaw % 2 === 0
    ? [sourceWorldW, sourceWorldD] : [sourceWorldD, sourceWorldW];
  const worldW = yaw % 2 === 0 ? interiorWidth : interiorDepth;
  const worldD = yaw % 2 === 0 ? interiorDepth : interiorWidth;
  return {
    ...source,
    id: `${source.id}_test_y${yaw}`,
    footprint: [0, 0, width!, depth!],
    yaw,
    floors: [[-worldW / 2, -worldD / 2, worldW / 2, worldD / 2]],
  };
}
function diagnostics(plan: BuildingPlanView, lod: 0 | 1) {
  const cell = generateCells([plan], HALL_KIT, lod, 16)[0]!;
  return {
    cell,
    all: [
      ...inspectInv1(cell.shell, [plan], decodeHangingProps(cell.hanging, 'shell')),
      ...inspectInv1(cell.roof, [plan], decodeHangingProps(cell.hanging, 'roof')),
      ...inspectInv2(cell.shell, [plan]),
      ...inspectInv3(cell.shell, [plan], HALL_KIT),
      ...inspectInv3(cell.roof, [plan], HALL_KIT),
      ...inspectInv4(cell.roof, [plan]),
      ...inspectInv5(cell.shell, cell.roof, [plan], cell.units, HALL_KIT),
    ],
  };
}
function openings(plan: BuildingPlanView) {
  const writer = new MeshBufferBuilder();
  const context = { writer, plan, unit: 0, localGroundM: (plan.elev[0] + plan.elev[1]) / 1000 };
  const layout = columnLayout(plan, HALL_KIT);
  return hallWallOpenings(context, HALL_KIT, layout, hallHeights(context, HALL_KIT));
}
function triangles(mesh: MeshPayload): number {
  return mesh.index.length / 3;
}
function localPoint(plan: BuildingPlanView, worldX: number, worldZ: number) {
  const x = worldX - plan.footprint[0] / 1000; const z = worldZ - plan.footprint[1] / 1000;
  if (plan.yaw === 0) return [x, z] as const;
  if (plan.yaw === 1) return [z, -x] as const;
  if (plan.yaw === 2) return [-x, -z] as const;
  return [-z, x] as const;
}
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b_79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 0x1_0000_0000;
  };
}
function triangleCountForLayer(mesh: MeshPayload, layer: number): number {
  let count = 0;
  for (let offset = 0; offset < mesh.index.length; offset += 3)
    if (mesh.mat[mesh.index[offset]! * 4] === layer) count += 1;
  return count;
}
function verticesForLayer(mesh: MeshPayload, layer: number): number[] {
  const result: number[] = [];
  for (let vertex = 0; vertex < mesh.position.length / 3; vertex += 1)
    if (mesh.mat[vertex * 4] === layer) result.push(vertex);
  return result;
}

describe('hall recipe body', () => {
  it('matches the tech/16 shop and three-bay house column goldens', () => {
    const shop = columnLayout(yawPlan(HALL_PLANS[0]!, 0), HALL_KIT);
    expect(shop.xM).toEqual([-2.375, 2.375]);
    expect(shop.zM).toEqual([-1.65, 1.65]);
    const house = columnLayout(yawPlan(HALL_PLANS[1]!, 0), HALL_KIT);
    expect(house.xM.map((value, index) => index === 0 ? 0 : Math.round((value - house.xM[index - 1]!) * 1000)))
      .toEqual([0, 1724, 2102, 1724]);
  });
  for (const source of HALL_PLANS)
    for (const yaw of [0, 1, 2, 3] as const)
      for (const lod of [0, 1] as const)
        it(`${source.archetype} yaw ${yaw} LOD${lod}: invariants, columns, platform, door and budget`, () => {
          const plan = yawPlan(source, yaw);
          const { cell, all } = diagnostics(plan, lod);
          expect(all).toEqual([]);
          const layout = columnLayout(plan, HALL_KIT);
          const topY = (plan.elev[0] + plan.elev[1]) / 1000 + layout.heightM;
          const topCentres = new Map<string, number>();
          const centres = layout.xM.flatMap((x) => layout.zM.map((z) => [x, z] as const));
          for (let vertex = 0; vertex < cell.shell.position.length / 3; vertex += 1) {
            if (cell.shell.mat[vertex * 4] !== 4) continue;
            const y = cell.shell.position[vertex * 3 + 1]!;
            if (Math.abs(y - topY) > 0.001 || cell.shell.normal[vertex * 4 + 1]! < 120) continue;
            const [worldX, worldZ] = localPoint(
              plan, cell.shell.position[vertex * 3]!, cell.shell.position[vertex * 3 + 2]!,
            );
            const nearest = centres.findIndex(([x, z]) => {
              const dx = worldX - x; const dz = worldZ - z;
              return dx * dx + dz * dz <= layout.diameterM * layout.diameterM / 3;
            });
            if (nearest >= 0) topCentres.set(String(nearest), (topCentres.get(String(nearest)) ?? 0) + 1);
          }
          const columns = [...topCentres.values()].filter((count) => count >= (lod === 0 ? 8 : 6));
          expect(columns).toHaveLength((layout.bays + 1) * layout.rows);
          const platformTop = cell.shell.position.filter(
            (y, index) => index % 3 === 1 && y <= (plan.elev[0] + plan.elev[1]) / 1000 + 0.001,
          );
          expect(Math.max(...platformTop) - plan.elev[0] / 1000).toBeCloseTo(plan.elev[1] / 1000, 3);
          const clear = openings(plan).filter(
            (item) => item.kind === 'door' || item.kind === 'shopfront',
          );
          expect(clear.length).toBeGreaterThan(0);
          for (const item of clear) {
            expect(item.clearWidthM).toBeGreaterThanOrEqual(1.2);
            expect(item.clearHeightM).toBeGreaterThanOrEqual(2.1);
          }
          if (source.archetype === 'shop') {
            expect(cell.doors).toHaveLength(0);
          } else {
            expect(cell.doors).toHaveLength(10);
            const door = clear.find((item) => item.kind === 'door')!;
            expect(cell.doors[6]).toBeCloseTo(door.clearWidthM, 5);
            expect(cell.doors[7]).toBeCloseTo(door.clearHeightM, 5);
            expect(cell.doors[8]).toBeCloseTo(0.08, 5);
            expect(cell.doors[9]).toBeCloseTo(0.025, 5);
            const world = transformPoint(
              [(door.x0 + door.x1) / 2, door.y0 + door.thresholdM + door.clearHeightM / 2, -0.08],
              { origin: door.origin, yaw: door.yaw },
            );
            for (let axis = 0; axis < 3; axis += 1)
              expect(cell.doors[axis + 2]).toBeCloseTo(world[axis]!, 5);
            expect(cell.doors[5]).toBe(door.yaw);
            const dark = verticesForLayer(cell.shell, 7);
            expect(dark.length).toBeGreaterThan(0);
            expect(new Set(dark.map((vertex) => cell.shell.mat[vertex * 4 + 1]))).toEqual(new Set([105]));
            const thresholdTop = door.y0 + door.thresholdM;
            const thresholdVertices = cell.shell.position.filter((y, index) =>
              index % 3 === 1 &&
              cell.shell.mat[Math.floor(index / 3) * 4] === 3 &&
              Math.abs(y - thresholdTop) <= 0.001,
            );
            expect(thresholdVertices.length).toBeGreaterThanOrEqual(4);
          }
          expect(triangles(cell.shell) + triangles(cell.roof)).toBeLessThanOrEqual(
            BUDGET[source.archetype as keyof typeof BUDGET][lod],
          );
          expect(cell.shell.mat.some((_, index) => index % 4 === 1 && cell.shell.mat[index] === 199)).toBe(true);
          expect(new Set(cell.shell.mat.filter((_, index) => index % 4 === 0))).not.toContain(15);
        });

  it('is hash-stable for every hall input, yaw and LOD', () => {
    for (const source of HALL_PLANS)
      for (const yaw of [0, 1, 2, 3] as const)
        for (const lod of [0, 1] as const) {
          const plan = yawPlan(source, yaw);
          expect(hashCell(generateCells([plan], HALL_KIT, lod, 16)[0]!)).toBe(
            hashCell(generateCells([plan], HALL_KIT, lod, 16)[0]!),
          );
        }
  });

  it('emits 60 LOD0 triangles per bracket group and one LOD1 painted band', () => {
    const plan = yawPlan(HALL_PLANS[2]!, 0);
    const layout = columnLayout(plan, HALL_KIT);
    const groups = (layout.xM.length + layout.bays) * layout.rows;
    const lod0 = generateCells([plan], HALL_KIT, 0, 16)[0]!.shell;
    const lod1 = generateCells([plan], HALL_KIT, 1, 16)[0]!.shell;
    expect(triangleCountForLayer(lod0, 5)).toBe(groups * 60);
    expect(triangleCountForLayer(lod1, 14)).toBe(12 * layout.rows);
  });

  it('preserves legal entrance offsets on four sides and defaults to the middle bay', () => {
    const house = yawPlan(HALL_PLANS[1]!, 0);
    const plan = { ...house, entrances: [[0, 300, 1_200], [1, -300, 1_200], [2, 250, 1_200], [3, -250, 1_200]] as const };
    const actual = openings(plan).filter((item) => item.kind === 'door');
    expect(actual.map((item) => item.side)).toEqual([0, 1, 2, 3]);
    const cell = generateCells([plan], HALL_KIT, 0, 16)[0]!;
    expect(inspectInv1(cell.shell, [plan], decodeHangingProps(cell.hanging, 'shell'))).toEqual([]);
    expect(inspectInv3(cell.shell, [plan], HALL_KIT)).toEqual([]);
    const stepWriter = new MeshBufferBuilder();
    emitSteps(
      { writer: stepWriter, plan, unit: 0, localGroundM: plan.elev[1] / 1000 },
      HALL_KIT, hallEntrances(plan, HALL_KIT),
    );
    const stepMesh = stepWriter.finish();
    const [hallWidth, hallDepth] = hallSizeM(plan);
    for (let vertex = 0; vertex < stepMesh.position.length / 3; vertex += 1) {
      const [x, z] = localPoint(
        plan, stepMesh.position[vertex * 3]!, stepMesh.position[vertex * 3 + 2]!,
      );
      expect(Math.abs(x)).toBeLessThanOrEqual(hallWidth / 2 + 0.000_01);
      expect(Math.abs(z)).toBeLessThanOrEqual(hallDepth / 2 + 0.000_01);
    }
    const fallback = openings({ ...house, entrances: [] }).filter((item) => item.kind === 'door');
    expect(fallback).toHaveLength(1);
    expect((fallback[0]!.x0 + fallback[0]!.x1) / 2).toBeCloseTo(2.96, 5);
    expect(actual.map((item) => (item.x0 + item.x1) / 2)).toEqual([3.26, 2.16, 3.21, 2.21]);
  });

  it('keeps 150 by 300 mm exposed treads and uses final door width plus 600 mm', () => {
    for (const source of [HALL_PLANS[1]!, HALL_PLANS[2]!]) {
      const plan = yawPlan(source, 0);
      const writer = new MeshBufferBuilder();
      const entrances = hallEntrances(plan, HALL_KIT);
      emitSteps({ writer, plan, unit: 0, localGroundM: plan.elev[1] / 1000 }, HALL_KIT, entrances);
      const mesh = writer.finish();
      const expectedWidth = entrances[0]![2] / 1000 + 0.6;
      const xs = Array.from(mesh.position).filter((_, index) => index % 3 === 0);
      const ys = Array.from(mesh.position).filter((_, index) => index % 3 === 1);
      const zs = Array.from(mesh.position).filter((_, index) => index % 3 === 2);
      expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(expectedWidth, 5);
      expect(new Set(ys.map((value) => Math.round(value * 1000))).size).toBe(entrances[0]![2] === 2_000 ? 7 : 3);
      const treadRuns = new Set(zs.map((value) => Math.round(value * 1000)));
      expect([...treadRuns].some((value) => treadRuns.has(value + 300))).toBe(true);
      const topFaces = Array.from({ length: mesh.position.length / 3 }, (_, vertex) => vertex)
        .filter((vertex) => mesh.normal[vertex * 4 + 1] === 127);
      expect(new Set(topFaces.map((vertex) => Math.round(mesh.position[vertex * 3 + 1]! * 1000))).size)
        .toBe(plan.elev[1] / 150);
    }
  });

  it('keeps large-offset entrance flights inside the 40 mm inset footprint on four sides and yaws', () => {
    // 6×5 m house: a 1200 mm door at the far end of its wall would push an unshifted flight past
    // the inset footprint; the flight shifts inward, keeps door + 600 mm and the door keeps its offset.
    for (const yaw of [0, 1, 2, 3] as const)
      for (const side of [0, 1, 2, 3] as const) {
        const offset = side % 2 === 0 ? 2_200 : 1_700;
        const plan = { ...yawPlan(HALL_PLANS[1]!, yaw), entrances: [[side, offset, 1_200]] as const };
        const entrances = hallEntrances(plan, HALL_KIT);
        expect(entrances).toHaveLength(1);
        expect(entrances[0]![1]).toBe(offset);
        const writer = new MeshBufferBuilder();
        emitSteps({ writer, plan, unit: 0, localGroundM: plan.elev[1] / 1000 }, HALL_KIT, entrances);
        const mesh = writer.finish();
        const [hallWidth, hallDepth] = hallSizeM(plan);
        let along0 = Number.POSITIVE_INFINITY; let along1 = Number.NEGATIVE_INFINITY;
        for (let vertex = 0; vertex < mesh.position.length / 3; vertex += 1) {
          const [x, z] = localPoint(plan, mesh.position[vertex * 3]!, mesh.position[vertex * 3 + 2]!);
          expect(Math.abs(x)).toBeLessThanOrEqual(hallWidth / 2 + 0.000_01);
          expect(Math.abs(z)).toBeLessThanOrEqual(hallDepth / 2 + 0.000_01);
          const along = side % 2 === 0 ? x : z;
          along0 = Math.min(along0, along); along1 = Math.max(along1, along);
        }
        expect(along1 - along0).toBeCloseTo(entrances[0]![2] / 1000 + 0.6, 5);
        // Whole-building INV-1 only: such an extreme offset puts the door against the corner post,
        // and keeping doors inside a bay is the planner's job (p2 snaps doors), not the mesher's.
        const cell = generateCells([plan], HALL_KIT, (yaw + side) % 2 as 0 | 1, 16)[0]!;
        expect(inspectInv1(cell.shell, [plan], decodeHangingProps(cell.hanging, 'shell'))).toEqual([]);
      }
  });

  it('records signs and hanging geometry correctly at all four yaws', () => {
    for (const yaw of [0, 1, 2, 3] as const) {
      const plan = { ...yawPlan(HALL_PLANS[0]!, yaw), signage: ['sign_shop', 3] as const };
      const cell = generateCells([plan], HALL_KIT, 0, 16)[0]!;
      expect(cell.signs).toHaveLength(6);
      expect(openings(plan).find((item) => item.kind === 'shopfront')!.y1).toBeCloseTo(2.85, 5);
      const hanging = decodeHangingProps(cell.hanging, 'shell');
      const sign = hanging.find((item) => item.kind === 'sign')!;
      expect(Math.min(...sign.vertices.map((vertex) => cell.shell.position[vertex * 3 + 1]!)))
        .toBeGreaterThanOrEqual(3);
      expect(cell.signs[2]).toBeCloseTo(3, 5);
    }
  });

  it('mulberry32 seed covers dimension, side and offset boundary combinations deterministically', () => {
    const random = mulberry32(0x1140_1140);
    const source = HALL_PLANS[1]!;
    for (let index = 0; index < 16; index += 1) {
      const side = Math.floor(random() * 4) as 0 | 1 | 2 | 3;
      const width = 6_000 + Math.floor(random() * 4_000);
      const depth = 5_400 + Math.floor(random() * 2_600);
      const across = side % 2 === 0 ? width : depth;
      const offset = Math.round((random() * 2 - 1) * Math.min(300, across / 2 - 900));
      const plan = yawPlan({ ...source, footprint: [0, 0, width, depth], entrances: [[side, offset, 1_200]] }, index % 4 as Yaw4);
      const cell = generateCells([plan], HALL_KIT, index % 2 as 0 | 1, 16)[0]!;
      expect(inspectInv1(cell.shell, [plan], decodeHangingProps(cell.hanging, 'shell'))).toEqual([]);
      expect(inspectInv3(cell.shell, [plan], HALL_KIT)).toEqual([]);
    }
  });

  it('INV-2 samples 50 mm triangle centres and exempts blocking fixture rectangles', () => {
    const plan = yawPlan(HALL_PLANS[1]!, 0);
    const writer = new MeshBufferBuilder();
    box(writer, { center: [0, 1.1, 0], size: [0.4, 2, 0.4], unit: 0, flags: 1 << 5 });
    expect(inspectInv2(writer.finish(), [plan]).map((item) => item.code)).toContain(
      'CLEARANCE_BLOCKED',
    );
    const exempt = { ...plan, fixtures: [[0, 0, 0, 500, 500, 0, 1]] as const };
    expect(inspectInv2(writer.finish(), [exempt])).toEqual([]);
    const turned = yawPlan(HALL_PLANS[1]!, 1);
    const turnedWriter = new MeshBufferBuilder();
    box(turnedWriter, { center: [0, 1.1, 1], size: [0.4, 2, 0.4], unit: 0 });
    const turnedExempt = {
      ...turned,
      fixtures: [[0, 1_000, 0, 500, 500, 0, 1]] as const,
    };
    expect(inspectInv2(turnedWriter.finish(), [turnedExempt])).toEqual([]);
  });

  it('INV-2 accepts 120 mm cushions and 150 mm daises as non-blocking furniture', () => {
    const plan = yawPlan(HALL_PLANS[1]!, 0);
    const floor = plan.floorY[0]! / 1000;
    const writer = new MeshBufferBuilder();
    box(writer, { center: [-0.6, floor + 0.06, 0], size: [0.5, 0.12, 0.5], unit: 0, flags: 1 << 5 });
    box(writer, { center: [0.6, floor + 0.075, 0], size: [0.5, 0.15, 0.5], unit: 0, flags: 1 << 5 });
    const furnished = { ...plan, fixtures: [
      [33, -600, 0, 500, 500, 0, 0], [35, 600, 0, 500, 500, 0, 0],
    ] as const };
    expect(inspectInv2(writer.finish(), [furnished])).toEqual([]);
  });

  it('INV-2 does not let a legal cushion rectangle exempt other solids inside it', () => {
    const plan = yawPlan(HALL_PLANS[1]!, 0);
    const floor = plan.floorY[0]! / 1000;
    const furnished = { ...plan, fixtures: [[33, 0, 0, 500, 500, 0, 0]] as const };
    const cushionOnly = new MeshBufferBuilder();
    box(cushionOnly, { center: [0, floor + 0.06, 0], size: [0.5, 0.12, 0.5], unit: 0, flags: 1 << 5 });
    expect(inspectInv2(cushionOnly.finish(), [furnished])).toEqual([]);
    const writer = new MeshBufferBuilder();
    box(writer, { center: [0, floor + 0.06, 0], size: [0.5, 0.12, 0.5], unit: 0, flags: 1 << 5 });
    const cushionTriangles = writer.finish().index.length / 3;
    box(writer, { center: [0, floor + 1.1, 0], size: [0.3, 2, 0.3], unit: 0 });
    const found = inspectInv2(writer.finish(), [furnished]);
    expect(found.map((item) => item.code)).toContain('CLEARANCE_BLOCKED');
    expect(found.every((item) => (item.triangle ?? -1) >= cushionTriangles)).toBe(true);
  });

  it('INV-2 rejects 300 mm non-blocking furniture inside the clearance volume', () => {
    const plan = yawPlan(HALL_PLANS[1]!, 0);
    const writer = new MeshBufferBuilder();
    box(writer, { center: [0, plan.floorY[0]! / 1000 + 0.15, 0], size: [0.5, 0.3, 0.5], unit: 0, flags: 1 << 5 });
    const furnished = { ...plan, fixtures: [[42, 0, 0, 500, 500, 0, 0]] as const };
    expect(inspectInv2(writer.finish(), [furnished]).map((item) => item.code))
      .toContain('CLEARANCE_BLOCKED');
  });

  it('INV-2 accepts hanging furniture at 2200 mm and rejects it below 2200 mm', () => {
    const plan = yawPlan(HALL_PLANS[1]!, 0);
    const floor = plan.floorY[0]! / 1000;
    const inspectHanging = (bottom: number) => {
      const writer = new MeshBufferBuilder();
      box(writer, {
        center: [0, bottom + 0.25, 0], size: [0.5, 0.5, 0.5], unit: 0, flags: 1 << 5,
      });
      const furnished = { ...plan, fixtures: [[41, 0, 0, 500, 500, 0, 0]] as const };
      return inspectInv2(writer.finish(), [furnished]);
    };
    expect(inspectHanging(floor + 2.2)).toEqual([]);
    expect(inspectHanging(floor + 2.199).map((item) => item.code))
      .toContain('CLEARANCE_BLOCKED');
  });

  it('INV-2 cannot be bypassed by facade, partition, interior or compound-part metadata', () => {
    const plan = yawPlan(HALL_PLANS[1]!, 0);
    for (const material of [
      { facade: 1 }, { flags: 1 << 1 }, { flags: 1 << 2 },
    ]) {
      const writer = new MeshBufferBuilder();
      box(writer, { center: [0, 1.1, 0], size: [0.1, 0.1, 0.1], unit: 0, ...material });
      expect(inspectInv2(writer.finish(), [plan]).map((item) => item.code)).toContain('CLEARANCE_BLOCKED');
    }
    const partPlan = { ...plan, floors: [[-1_000, -1_000, 1_000, 1_000]] as const, parts: [[0, 0, 0, 2_000, 2_000, 0, 1, 1, 2_500, 3_000, 0, 0]] as const };
    const part = new MeshBufferBuilder();
    box(part, { center: [0, 1.1, 0], size: [0.1, 0.1, 0.1], unit: 1 });
    expect(inspectInv2(part.finish(), [partPlan]).map((item) => item.code)).toContain('CLEARANCE_BLOCKED');
  });

  it('INV-2 samples the reverse half of every 50 mm barycentric cell', () => {
    const plan = yawPlan(HALL_PLANS[1]!, 0);
    const writer = new MeshBufferBuilder();
    for (const position of [[-3, 1.1, -3], [3, 1.1, -3], [3, 1.1, 3]] as const)
      writer.addVertex({ position, normal: [0, 1, 0], unit: 0 });
    writer.addTriangle(0, 1, 2);
    expect(inspectInv2(writer.finish(), [plan]).map((item) => item.code)).toContain('CLEARANCE_BLOCKED');
  });

  it('INV-4 rejects a roof triangle below floor + 2200 mm', () => {
    const plan = yawPlan(HALL_PLANS[0]!, 0);
    const writer = new MeshBufferBuilder();
    box(writer, { center: [0, 2, 0], size: [1, 0.1, 1], unit: 0 });
    expect(inspectInv4(writer.finish(), [plan]).map((item) => item.code)).toContain(
      'ROOF_BELOW_CLEARANCE',
    );
  });

  it('INV-4 checks a compound part roof and empty INV-2/4 payloads are valid', () => {
    const plan = {
      ...yawPlan(HALL_PLANS[0]!, 0),
      parts: [[0, 0, 0, 2_000, 2_000, 0, 1, 1, 2_500, 3_000, 0, 0]] as const,
    };
    const writer = new MeshBufferBuilder();
    box(writer, { center: [0, 2, 0], size: [1, 0.1, 1], unit: 1 });
    expect(inspectInv4(writer.finish(), [plan]).map((item) => item.code)).toContain(
      'ROOF_BELOW_CLEARANCE',
    );
    const empty = new MeshBufferBuilder().finish();
    expect(inspectInv2(empty, [plan])).toEqual([]);
    expect(inspectInv4(empty, [plan])).toEqual([]);
  });

  it('INV-5 rejects an unrelated double facade mask in the building middle', () => {
    const plan = yawPlan(HALL_PLANS[1]!, 0);
    const shell = new MeshBufferBuilder();
    box(shell, { center: [0, 1.2, 0], size: [0.1, 0.2, 0.1], unit: 0, facade: 0b0011 });
    const roof = generateCells([plan], HALL_KIT, 0, 16)[0]!.roof;
    expect(inspectInv5(shell.finish(), roof, [plan], [0], HALL_KIT).map((item) => item.code))
      .toContain('FACADE_MISMATCH');
  });

  it('emits hard-gable triangles and marks fixture 34 as a partition', () => {
    const house = yawPlan(HALL_PLANS[1]!, 0);
    const plain = generateCells([house], HALL_KIT, 0, 16)[0]!.shell;
    expect(triangles(plain)).toBeGreaterThan(0);
    const partitionPlan = { ...house, fixtures: [[34, 0, 0, 2_400, 300, 0, 1]] as const };
    const partition = generateCells([partitionPlan], HALL_KIT, 0, 16)[0]!.shell;
    expect(partition.mat.some((value, index) => index % 4 === 2 && (value & (1 << 1)) !== 0)).toBe(true);
    const moved = { ...yawPlan(HALL_PLANS[1]!, 1), footprint: [7_000, -4_000, 6_000, 5_000] as const,
      fixtures: [[34, 1_000, 0, 2_400, 300, 1, 1]] as const };
    const movedMesh = generateCells([moved], HALL_KIT, 0, 16)[0]!.shell;
    const partitionVertices = Array.from({ length: movedMesh.position.length / 3 }, (_, index) => index)
      .filter((index) => (movedMesh.mat[index * 4 + 2]! & (1 << 1)) !== 0);
    expect(Math.min(...partitionVertices.map((index) => movedMesh.position[index * 3]!))).toBeCloseTo(5.8, 5);
    expect(Math.max(...partitionVertices.map((index) => movedMesh.position[index * 3 + 2]!))).toBeCloseTo(-2.85, 5);
  });

  it('resolves walls, LOD1 bracket band and structural timber through kit layer ids', () => {
    const temple = yawPlan(HALL_PLANS[2]!, 0);
    const cell = generateCells([temple], HALL_KIT, 1, 16)[0]!.shell;
    const used = new Set(cell.mat.filter((_, index) => index % 4 === 0));
    expect(used).toContain(3);
    expect(used).toContain(4);
    expect(used).toContain(6);
    expect(used).toContain(14);
    expect(used).not.toContain(15);
  });

  it('keeps mesher independent from Three.js', () => {
    const root = join(import.meta.dirname, '..', 'mesher');
    const files: string[] = [];
    const visit = (path: string): void => {
      for (const name of readdirSync(path)) {
        const child = join(path, name);
        if (statSync(child).isDirectory()) visit(child);
        else if (child.endsWith('.ts')) files.push(child);
      }
    };
    visit(root);
    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      expect(source).not.toContain(`from 'three`);
      expect(source).not.toContain(`from "three`);
    }
  });
});
