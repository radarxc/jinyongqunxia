import { describe, expect, it } from 'vitest';
import { MeshBufferBuilder } from '../mesher/core/buffer';
import { hashCell } from '../mesher/core/hash';
import {
  decodeHangingProps,
  inspectInv1,
  inspectInv2,
  inspectInv3,
  inspectInv4,
  inspectInv5,
} from '../mesher/core/inspect';
import { generateCells } from '../mesher/generate';
import { emitAwning } from '../mesher/parts/awning';
import { emitBalcony } from '../mesher/parts/balcony';
import { emitPentEave } from '../mesher/parts/pent-eave';
import { STALL_COUNTER_HEIGHT_M } from '../mesher/recipes/stall';
import { storeyedColumnLayout } from '../mesher/recipes/storeyed';
import { MINI_BUILDING_PLANS, MINI_BUILD_KIT } from '../testing/mini-plans';
import {
  ROOF_STYLE,
  type BuildingPlanView,
  type BuildKitView,
  type MeshPayload,
  type Yaw4,
} from '../types';

const LAYERS = [
  'tile_roof',
  'ridge_tiles',
  'eave_soffit',
  'timber_lacquer',
  'timber_raw',
  'plaster_lime',
  'earth_plaster',
  'stone_rubble',
  'stone_dressed',
  'brick_grey',
  'lattice_window',
  'door_planks',
  'floor_pavers',
  'floor_wood',
  'painted_band',
  'cloth_awning',
];
const KIT: BuildKitView = {
  ...MINI_BUILD_KIT,
  layers: MINI_BUILD_KIT.layers.map((layer, index) => ({ ...layer, id: LAYERS[index]! })),
  archetypes: {
    ...MINI_BUILD_KIT.archetypes,
    inn: { recipe: 'storeyed', size: 'middle', roof: 'xieshan', balcony: true },
    shop_2f: { recipe: 'storeyed', size: 'middle', roof: 'xieshan', balcony: true },
    market_stall: { recipe: 'stall', roof: 'canopy' },
  },
};
const INN = MINI_BUILDING_PLANS.find((plan) => plan.archetype === 'inn')!;
const STALL_SOURCE = MINI_BUILDING_PLANS.find((plan) => plan.archetype === 'market_stall')!;
const BUDGET = { inn: [6_500, 3_000], shop_2f: [5_000, 2_400], stall: [600, 300] } as const;
function yawPlan(source: BuildingPlanView, yaw: Yaw4): BuildingPlanView {
  const floor = source.floors[0];
  if (!floor)
    return { ...source, footprint: [0, 0, source.footprint[2], source.footprint[3]], yaw };
  const sourceW = floor[2] - floor[0];
  const sourceD = floor[3] - floor[1];
  const [localW, localD] = source.yaw % 2 === 0 ? [sourceW, sourceD] : [sourceD, sourceW];
  const [worldW, worldD] = yaw % 2 === 0 ? [localW, localD] : [localD, localW];
  return {
    ...source,
    id: `${source.id}_y${yaw}`,
    footprint: [0, 0, source.footprint[2], source.footprint[3]],
    yaw,
    floors: [[-worldW / 2, -worldD / 2, worldW / 2, worldD / 2]],
  };
}
function inn(yaw: Yaw4): BuildingPlanView {
  const plan = yawPlan(INN, yaw);
  // Exact p2 output for song_dali 10x8: floorRect(9000 bay span, 6100 roof run).
  const [localW, localD] = [8_650, 5_900];
  const [worldW, worldD] = yaw % 2 === 0 ? [localW, localD] : [localD, localW];
  const [cx, cz] = plan.footprint;
  return {
    ...plan,
    floors: [[cx - worldW / 2, cz - worldD / 2, cx + worldW / 2, cz + worldD / 2]],
  };
}
/** Same shape as the p2 planner's stall output (plan-hall.ts): no floors, entrances or fixtures. */
function stall(yaw: Yaw4): BuildingPlanView {
  return {
    ...yawPlan(STALL_SOURCE, yaw),
    roof: [ROOF_STYLE.Canopy, 2_300, 2_300],
    enterable: false,
    floors: [],
    floorY: [],
    entrances: [],
    fixtures: [],
  };
}
/** Schema-legal stn_vendor station (town-plan fixtures.ts id 204): zero extent, non-blocking. */
const VENDOR_STATION = [204, 0, -500, 0, 0, 0, 0] as const;
function shop(yaw: Yaw4): BuildingPlanView {
  const source = inn(yaw);
  const [cx, cz] = source.footprint;
  // Exact p2 output for song_dali 7x5: 6000 bay span and 3100 roof run.
  const [worldW, worldD] = yaw % 2 === 0 ? [5_650, 2_900] : [2_900, 5_650];
  return {
    ...source,
    id: `mini_shop_2f_y${yaw}`,
    archetype: 'shop_2f',
    footprint: [cx, cz, 7_000, 5_000],
    roof: [ROOF_STYLE.Xieshan, 6_130, 7_737],
    floors: [[cx - worldW / 2, cz - worldD / 2, cx + worldW / 2, cz + worldD / 2]],
    facility: 'general_store',
  };
}
function triangles(mesh: MeshPayload): number {
  return mesh.index.length / 3;
}
function yValues(mesh: MeshPayload): number[] {
  return Array.from(mesh.position.filter((_, index) => index % 3 === 1));
}
function localVertex(
  plan: BuildingPlanView,
  mesh: MeshPayload,
  vertex: number,
): readonly [number, number, number] {
  const dx = mesh.position[vertex * 3]! - plan.footprint[0] / 1000;
  const y = mesh.position[vertex * 3 + 1]!;
  const dz = mesh.position[vertex * 3 + 2]! - plan.footprint[1] / 1000;
  const [x, z] = [
    [dx, dz],
    [dz, -dx],
    [-dx, -dz],
    [-dz, dx],
  ][plan.yaw]! as [number, number];
  return [x, y, z] as const;
}
function hasLocalVertex(
  mesh: MeshPayload,
  plan: BuildingPlanView,
  expected: readonly [number, number, number],
  tolerance = 0.011,
): boolean {
  for (let vertex = 0; vertex < mesh.position.length / 3; vertex += 1) {
    const actual = localVertex(plan, mesh, vertex);
    if (
      Math.abs(actual[0] - expected[0]) <= tolerance &&
      Math.abs(actual[1] - expected[1]) <= tolerance &&
      Math.abs(actual[2] - expected[2]) <= tolerance
    )
      return true;
  }
  return false;
}
function largeVerticalTriangles(mesh: MeshPayload) {
  const result: {
    horizontalM: number;
    verticalM: number;
    facade: number;
    centerX: number;
    centerZ: number;
    minY: number;
    maxY: number;
  }[] = [];
  for (let offset = 0; offset < mesh.index.length; offset += 3) {
    const vertices = Array.from(mesh.index.slice(offset, offset + 3));
    const points = vertices.map((vertex) => [
      mesh.position[vertex * 3]!,
      mesh.position[vertex * 3 + 1]!,
      mesh.position[vertex * 3 + 2]!,
    ]);
    const xs = points.map((point) => point[0]!);
    const ys = points.map((point) => point[1]!);
    const zs = points.map((point) => point[2]!);
    const horizontalM = Math.hypot(
      Math.max(...xs) - Math.min(...xs),
      Math.max(...zs) - Math.min(...zs),
    );
    const verticalM = Math.max(...ys) - Math.min(...ys);
    const normalY = Math.abs(mesh.normal[vertices[0]! * 4 + 1]! / 127);
    if (normalY < 0.1 && horizontalM > 0.5 && verticalM > 1.2)
      result.push({
        horizontalM,
        verticalM,
        facade: mesh.mat[vertices[0]! * 4 + 3]!,
        centerX: xs.reduce((sum, value) => sum + value, 0) / 3,
        centerZ: zs.reduce((sum, value) => sum + value, 0) / 3,
        minY: Math.min(...ys),
        maxY: Math.max(...ys),
      });
  }
  return result;
}
function upperRoofTriangles(mesh: MeshPayload, layer: number, aboveY: number) {
  const result: { nx: number; ny: number; nz: number }[] = [];
  for (let offset = 0; offset < mesh.index.length; offset += 3) {
    const vertices = Array.from(mesh.index.slice(offset, offset + 3));
    if (vertices.some((vertex) => mesh.mat[vertex * 4] !== layer)) continue;
    if (vertices.some((vertex) => mesh.position[vertex * 3 + 1]! <= aboveY)) continue;
    const [a, b, c] = vertices.map((vertex) => [
      mesh.position[vertex * 3]!,
      mesh.position[vertex * 3 + 1]!,
      mesh.position[vertex * 3 + 2]!,
    ]) as [number[], number[], number[]];
    const u = [b[0]! - a[0]!, b[1]! - a[1]!, b[2]! - a[2]!];
    const v = [c[0]! - a[0]!, c[1]! - a[1]!, c[2]! - a[2]!];
    const n = [
      u[1]! * v[2]! - u[2]! * v[1]!,
      u[2]! * v[0]! - u[0]! * v[2]!,
      u[0]! * v[1]! - u[1]! * v[0]!,
    ];
    const length = Math.hypot(n[0]!, n[1]!, n[2]!);
    if (length > 1e-9) result.push({ nx: n[0]! / length, ny: n[1]! / length, nz: n[2]! / length });
  }
  return result;
}
/** A real xieshan, not a solid box: ridge top, tile ridge foot, sloped faces in 4 directions, gables. */
function expectRealXieshan(
  roof: MeshPayload,
  base: number,
  ridgeM: number,
  ridgeBodyM: number,
): void {
  const ys = (layer: number) =>
    Array.from({ length: roof.position.length / 3 }, (_, vertex) => vertex)
      .filter((vertex) => roof.mat[vertex * 4] === layer)
      .map((vertex) => roof.position[vertex * 3 + 1]!);
  // Ridge layer reaches roof[2]; the tile surface stops at the ridge foot below the ridge body.
  expect(Math.abs(Math.max(...ys(1)) - (base + ridgeM))).toBeLessThanOrEqual(0.01);
  expect(Math.max(...ys(0))).toBeCloseTo(base + ridgeM - ridgeBodyM, 3);
  // Upper tile faces slope (a box only has ny = 0 or ±1) and face four horizontal directions.
  const sloped = upperRoofTriangles(roof, 0, base + 6.2).filter(
    ({ ny }) => Math.abs(ny) > 0.3 && Math.abs(ny) < 0.95,
  );
  expect(sloped.length).toBeGreaterThan(8);
  const directions = new Set(
    sloped.map(({ nx, nz }) =>
      Math.abs(nx) > Math.abs(nz) ? (nx > 0 ? 'x+' : 'x-') : nz > 0 ? 'z+' : 'z-',
    ),
  );
  expect(directions.size).toBe(4);
  // Xieshan gables (收山): vertical gable boards on the gable layer above the upper eave.
  const gables = upperRoofTriangles(roof, 6, base + 6.2).filter(({ ny }) => Math.abs(ny) < 0.1);
  expect(gables.length).toBeGreaterThan(0);
}
function diagnostics(plan: BuildingPlanView, lod: 0 | 1) {
  const cell = generateCells([plan], KIT, lod, 32)[0]!;
  return {
    cell,
    all: [
      ...inspectInv1(cell.shell, [plan], decodeHangingProps(cell.hanging, 'shell')),
      ...inspectInv1(cell.roof, [plan], decodeHangingProps(cell.hanging, 'roof')),
      ...inspectInv2(cell.shell, [plan]),
      ...inspectInv3(cell.shell, [plan], KIT),
      ...inspectInv3(cell.roof, [plan], KIT),
      ...inspectInv4(cell.roof, [plan]),
      ...inspectInv5(cell.shell, cell.roof, [plan], cell.units, KIT),
    ],
  };
}

describe('storeyed recipe', () => {
  for (const yaw of [0, 1, 2, 3] as const)
    for (const lod of [0, 1] as const)
      it(`10x8 inn yaw ${yaw} LOD${lod}: invariants, heights and budget`, () => {
        const plan = inn(yaw);
        const floor = plan.floors[0]!;
        const [floorW, floorD] = [floor[2] - floor[0], floor[3] - floor[1]];
        expect(yaw % 2 === 0 ? [floorW, floorD] : [floorD, floorW]).toEqual([8_650, 5_900]);
        const { cell, all } = diagnostics(plan, lod);
        expect(all).toEqual([]);
        const base = (plan.elev[0] + plan.elev[1]) / 1000;
        expect(yValues(cell.roof).some((y) => Math.abs(y - (base + 6.13)) <= 0.01)).toBe(true);
        expectRealXieshan(cell.roof, base, 8.547, 0.45);
        const firstCeilingM = base + KIT.dims.middle.column / 1000 + 0.35;
        expect(Math.max(...yValues(cell.shell))).toBeLessThanOrEqual(firstCeilingM + 0.01);
        expect(triangles(cell.shell) + triangles(cell.roof)).toBeLessThanOrEqual(BUDGET.inn[lod]);
        expect(hashCell(generateCells([plan], KIT, lod, 32)[0]!)).toBe(hashCell(cell));
      });

  it('measures a 0.45-pitch waist eave and 1000 mm pingzuo rail', () => {
    const plan = inn(0);
    const pent = new MeshBufferBuilder();
    const waist = emitPentEave({
      writer: pent,
      plan,
      unit: 0,
      kit: KIT,
      bearerM: 3.85,
      projectionM: 0.9,
    });
    expect(waist.bottomM).toBeCloseTo(3.285, 6);
    expect(waist.bottomM - 0.3).toBeGreaterThanOrEqual(2.4);
    const balcony = new MeshBufferBuilder();
    emitBalcony({ writer: balcony, plan, unit: 0, kit: KIT, floorM: 4.05, lod: 0 });
    expect(Math.max(...yValues(balcony.finish())) - 4.05).toBeCloseTo(1, 5);
  });

  for (const yaw of [0, 1, 2, 3] as const)
    it(`yaw ${yaw}: waist drip is 700-900 mm beyond the actual column lines`, () => {
      const plan = inn(yaw);
      const layout = storeyedColumnLayout(plan, KIT);
      const mesh = new MeshBufferBuilder();
      const measure = emitPentEave({
        writer: mesh,
        plan,
        unit: 0,
        kit: KIT,
        bearerM: 3.85,
        innerHalfWidthM: Math.max(...layout.xM.map(Math.abs)),
        innerHalfDepthM: Math.max(...layout.zM.map(Math.abs)),
      });
      const local = Array.from({ length: mesh.vertexCount }, (_, vertex) =>
        localVertex(plan, mesh.finish(), vertex),
      );
      const dripX = Math.max(...local.map(([x]) => Math.abs(x)));
      const dripZ = Math.max(...local.map(([, , z]) => Math.abs(z)));
      expect(dripX - Math.max(...layout.xM.map(Math.abs))).toBeCloseTo(measure.projectionXM, 5);
      expect(dripZ - Math.max(...layout.zM.map(Math.abs))).toBeCloseTo(measure.projectionZM, 5);
      expect(measure.projectionXM).toBeGreaterThanOrEqual(0.7);
      expect(measure.projectionXM).toBeLessThanOrEqual(0.9);
      expect(measure.projectionZM).toBeGreaterThanOrEqual(0.7);
      expect(measure.projectionZM).toBeLessThanOrEqual(0.9);
    });

  it('preserves the kit column diameter and all first-storey wall thicknesses', () => {
    const plan = inn(0);
    expect(storeyedColumnLayout(inn(0), KIT).diameterM).toBeCloseTo(3.2 / 11, 6);
    expect(storeyedColumnLayout(inn(0), KIT).diameterM).toBeGreaterThanOrEqual(0.26);
    expect(storeyedColumnLayout(inn(0), KIT).diameterM).toBeLessThanOrEqual(0.3);
    expect([KIT.walls.front.t, KIT.walls.back.t, KIT.walls.gable.t]).toEqual([120, 300, 350]);
    const shell = generateCells([plan], KIT, 0, 32)[0]!.shell;
    const span = (
      axis: 0 | 2,
      facade: number,
      layer: number,
      select: (point: readonly [number, number, number]) => boolean,
    ) => {
      const values: number[] = [];
      for (let vertex = 0; vertex < shell.position.length / 3; vertex += 1) {
        const point = localVertex(plan, shell, vertex);
        const flags = shell.mat[vertex * 4 + 2]!;
        if (
          flags === 1 &&
          shell.mat[vertex * 4] === layer &&
          shell.mat[vertex * 4 + 3] === facade &&
          select(point)
        )
          values.push(point[axis]);
      }
      return Math.max(...values) - Math.min(...values);
    };
    const timber = KIT.layers.findIndex(({ id }) => id === 'timber_raw');
    const earth = KIT.layers.findIndex(({ id }) => id === 'earth_plaster');
    expect(
      span(2, 1, timber, ([x, y, z]) => Math.abs(x) > 1 && y > 1.2 && y < 2 && z > 3.5),
    ).toBeCloseTo(0.12, 5);
    expect(
      span(2, 4, earth, ([x, y, z]) => Math.abs(x) > 3 && y > 1.2 && y < 2 && z < -3.5),
    ).toBeCloseTo(0.3, 5);
    expect(
      span(0, 2, earth, ([x, y, z]) => x < -4.5 && y > 1.2 && y < 2 && Math.abs(z) > 2.5),
    ).toBeCloseTo(0.35, 5);
  });

  it('leaves a real pingzuo gap and has lattice instead of a solid upper front wall', () => {
    const plan = inn(0);
    const roof = generateCells([plan], KIT, 0, 32)[0]!.roof;
    const latticeLayer = KIT.layers.findIndex(({ id }) => id === 'lattice_window');
    const latticeZ: number[] = [];
    const railZ: number[] = [];
    for (let vertex = 0; vertex < roof.position.length / 3; vertex += 1) {
      const [, y, z] = localVertex(plan, roof, vertex);
      if (roof.mat[vertex * 4] === latticeLayer && y > 4.5 && y < 6.3) latticeZ.push(z);
      if (y > 4.58 && y < 5.06 && z > 3.7) railZ.push(z);
    }
    expect(Math.max(...latticeZ)).toBeLessThan(Math.min(...railZ) - 0.6);
    const upperFrontWalls = largeVerticalTriangles(roof).filter((triangle) => {
      const [, , z] = localVertex(
        plan,
        { ...roof, position: new Float32Array([triangle.centerX, 0, triangle.centerZ]) },
        0,
      );
      return triangle.minY >= 4 && z > 3 && z < 3.35;
    });
    expect(upperFrontWalls).toEqual([]);
  });

  it('keeps the same plan byte-stable', () => {
    const plan = inn(3);
    expect(hashCell(generateCells([plan], KIT, 0, 32)[0]!)).toBe(
      hashCell(generateCells([plan], KIT, 0, 32)[0]!),
    );
  });

  for (const yaw of [0, 1, 2, 3] as const)
    for (const lod of [0, 1] as const)
      it(`7x5 two-storey shop yaw ${yaw} LOD${lod}: p2 heights and budget`, () => {
        const plan = shop(yaw);
        const floor = plan.floors[0]!;
        const [floorW, floorD] = [floor[2] - floor[0], floor[3] - floor[1]];
        expect(yaw % 2 === 0 ? [floorW, floorD] : [floorD, floorW]).toEqual([5_650, 2_900]);
        const { cell, all } = diagnostics(plan, lod);
        expect(all).toEqual([]);
        const base = (plan.elev[0] + plan.elev[1]) / 1000;
        expect(yValues(cell.roof).some((y) => Math.abs(y - (base + 6.13)) <= 0.01)).toBe(true);
        expect(yValues(cell.roof).some((y) => Math.abs(y - (base + 7.737)) <= 0.01)).toBe(true);
        expect(triangles(cell.shell) + triangles(cell.roof)).toBeLessThanOrEqual(
          BUDGET.shop_2f[lod],
        );
        expect(hashCell(generateCells([plan], KIT, lod, 32)[0]!)).toBe(hashCell(cell));
      });

  it('puts a third storey wholly in the roof batch', () => {
    const plan: BuildingPlanView = {
      ...inn(1),
      id: 'mini_inn_3f',
      storeys: 3,
      roof: [ROOF_STYLE.Xieshan, 8_830, 11_247],
    };
    const { cell, all } = diagnostics(plan, 1);
    expect(all).toEqual([]);
    expect(Math.max(...yValues(cell.shell))).toBeLessThanOrEqual(3.86);
    // roof[2] is the main-ridge top; the Dali square ends stand 550 mm on top of it.
    const layerYs = (layer: number) =>
      Array.from({ length: cell.roof.position.length / 3 }, (_, vertex) => vertex)
        .filter((vertex) => cell.roof.mat[vertex * 4] === layer)
        .map((vertex) => cell.roof.position[vertex * 3 + 1]!);
    expect(Math.abs(Math.max(...layerYs(1)) - 11.547)).toBeLessThanOrEqual(0.01);
    expect(Math.max(...layerYs(0))).toBeCloseTo(11.547 - 0.45, 3);
    expect(Math.min(...layerYs(3))).toBeCloseTo(11.547, 3);
    expect(Math.max(...layerYs(3))).toBeCloseTo(11.547 + 0.55, 3);
  });
});

describe('stall recipe', () => {
  for (const yaw of [0, 1, 2, 3] as const)
    for (const lod of [0, 1] as const)
      it(`open stall yaw ${yaw} LOD${lod}: no walls, clearance and budget`, () => {
        const plan = stall(yaw);
        const { cell, all } = diagnostics(plan, lod);
        expect(all).toEqual([]);
        expect(largeVerticalTriangles(cell.shell)).toEqual([]);
        expect(cell.shell.mat.every((value, index) => index % 4 !== 3 || value === 0)).toBe(true);
        expect(cell.shell.index.length).toBeGreaterThan(0);
        expect(triangles(cell.shell) + triangles(cell.roof)).toBeLessThanOrEqual(BUDGET.stall[lod]);
        expect(Math.max(...yValues(cell.shell).filter((y) => y <= 1))).toBeCloseTo(0.99, 2);
      });

  it('uses the exact 850 mm counter and a 3% cloth sag above 2250 mm', () => {
    expect(STALL_COUNTER_HEIGHT_M).toBe(0.85);
    const plan = stall(0);
    const shell = generateCells([plan], KIT, 0, 32)[0]!.shell;
    const verticalSpans: number[] = [];
    for (let offset = 0; offset < shell.index.length; offset += 3) {
      const vertices = Array.from(shell.index.slice(offset, offset + 3));
      if (vertices.some((vertex) => (shell.mat[vertex * 4 + 2]! & (1 << 5)) === 0)) continue;
      const ys = vertices.map((vertex) => shell.position[vertex * 3 + 1]!);
      verticalSpans.push(Math.max(...ys) - Math.min(...ys));
    }
    expect(verticalSpans.some((span) => Math.abs(span - 0.85) <= 0.005)).toBe(true);
    const writer = new MeshBufferBuilder();
    const measure = emitAwning({ writer, plan, unit: 0, lod: 0, layer: 15 });
    expect(measure.sagM).toBeCloseTo((plan.footprint[3] / 1000 - 0.08) * 0.03, 6);
    expect(measure.lowerEdgeM - plan.elev[0] / 1000).toBeGreaterThanOrEqual(2.25);
    expect(measure.frontM).toBeCloseTo(2.3076, 4);
    expect(measure.backM).toBeCloseTo(2.3076, 4);
  });

  for (const yaw of [0, 1, 2, 3] as const)
    it(`yaw ${yaw}: all four posts meet their corresponding canopy edge`, () => {
      const plan = stall(yaw);
      const cell = generateCells([plan], KIT, 0, 32)[0]!;
      const width = plan.footprint[2] / 1000 - 0.08;
      const depth = plan.footprint[3] / 1000 - 0.08;
      const edgeM = 2.3076;
      for (const x of [-width / 2 + 0.05, width / 2 - 0.05])
        for (const [z, height] of [
          [-depth / 2 + 0.05, edgeM],
          [depth / 2 - 0.05, edgeM],
        ] as const) {
          expect(
            [-0.05, 0.05].some((dx) =>
              [-0.05, 0.05].some((dz) =>
                hasLocalVertex(cell.shell, plan, [x + dx, height, z + dz], 0.001),
              ),
            ),
          ).toBe(true);
          expect(
            hasLocalVertex(
              cell.roof,
              plan,
              [(Math.sign(x) * width) / 2, height, (Math.sign(z) * depth) / 2],
              0.001,
            ),
          ).toBe(true);
        }
    });

  for (const yaw of [0, 1, 2, 3] as const)
    for (const lod of [0, 1] as const)
      it(`planner-shaped floorless, fixtureless stall yaw ${yaw} LOD${lod} meshes cleanly`, () => {
        const plan = stall(yaw);
        expect([plan.floors, plan.floorY, plan.entrances, plan.fixtures]).toEqual([[], [], [], []]);
        const cell = generateCells([plan], KIT, lod, 32)[0]!;
        expect(cell.shell.index.length).toBeGreaterThan(0);
        expect(cell.roof.index.length).toBeGreaterThan(0);
        expect(inspectInv3(cell.shell, [plan], KIT)).toEqual([]);
        expect(inspectInv3(cell.roof, [plan], KIT)).toEqual([]);
      });

  for (const lod of [0, 1] as const)
    it(`a legal stn_vendor station does not change the LOD${lod} mesh`, () => {
      const withStation = { ...stall(0), fixtures: [VENDOR_STATION] };
      const { all } = diagnostics(withStation, lod);
      expect(all).toEqual([]);
      expect(hashCell(generateCells([withStation], KIT, lod, 32)[0]!)).toBe(
        hashCell(generateCells([stall(0)], KIT, lod, 32)[0]!),
      );
    });

  for (const yaw of [0, 1, 2, 3] as const)
    it(`yaw ${yaw}: small xuanshan posts meet the 2300 mm drip edge`, () => {
      const plan = { ...stall(yaw), roof: [ROOF_STYLE.Xuanshan, 2_300, 3_100] as const };
      const kit: BuildKitView = {
        ...KIT,
        dims: {
          ...KIT.dims,
          vernacular: { ...KIT.dims.vernacular, rise: 3_000, eave: 400, verge: 400 },
        },
        archetypes: {
          ...KIT.archetypes,
          market_stall: { recipe: 'stall', size: 'vernacular', roof: 'xuanshan' },
        },
      };
      const cell = generateCells([plan], kit, 1, 32)[0]!;
      const roofX = plan.footprint[2] / 2000 - 0.04 - 0.6 + 0.4;
      const roofZ = plan.footprint[3] / 2000 - 0.05;
      for (const x of [-roofX, roofX])
        for (const z of [-roofZ, roofZ]) {
          expect(hasLocalVertex(cell.roof, plan, [x, 2.3, z], 0.001)).toBe(true);
          expect(hasLocalVertex(cell.shell, plan, [x, 2.3, z], 0.001)).toBe(true);
        }
      expect(inspectInv1(cell.roof, [plan])).toEqual([]);
    });

  it('honours the archetype roof choice when plan metadata is stale', () => {
    const plan = { ...stall(0), roof: [ROOF_STYLE.Canopy, 2_300, 3_100] as const };
    const kit: BuildKitView = {
      ...KIT,
      dims: {
        ...KIT.dims,
        vernacular: { ...KIT.dims.vernacular, rise: 3_000, eave: 400, verge: 400 },
      },
      archetypes: {
        ...KIT.archetypes,
        market_stall: { recipe: 'stall', size: 'vernacular', roof: 'xuanshan' },
      },
    };
    const cell = generateCells([plan], kit, 1, 32)[0]!;
    expect(triangles(cell.roof)).toBeGreaterThan(12);
  });

  it.each([
    [{ enterable: true }, 'BUILDGEN_STALL_MUST_NOT_BE_ENTERABLE'],
    [{ floors: [[-1, -1, 1, 1]] as const }, 'BUILDGEN_STALL_MUST_NOT_HAVE_FLOORS'],
    [{ floorY: [0] as const }, 'BUILDGEN_STALL_MUST_NOT_HAVE_FLOORS'],
  ] as const)('rejects invalid stall metadata %j', (patch, message) => {
    expect(() => generateCells([{ ...stall(0), ...patch }], KIT, 0, 32)).toThrow(message);
  });
});
