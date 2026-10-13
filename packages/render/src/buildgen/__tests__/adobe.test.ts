import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
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
import { emitBrickLattice } from '../mesher/parts/brick-lattice';
import { emitIwan } from '../mesher/parts/iwan';
import { emitTrellis } from '../mesher/parts/trellis';
import { emitAdobeWithCounts } from '../mesher/recipes/adobe';
import {
  ROOF_STYLE,
  type BuildingPlanView,
  type BuildKitView,
  type MeshPayload,
  type RecipeSink,
  type Yaw4,
} from '../types';

interface PlannerModule {
  compileKit(source: string): BuildKitView;
  emptyInteriorPlanner(context: { plan: BuildingPlanView }): {
    fixtures: BuildingPlanView['fixtures'];
    floors: BuildingPlanView['floors'];
    floorY: BuildingPlanView['floorY'];
  };
  planBuilding(
    input: {
      id: string;
      type: string;
      originCell: readonly [number, number];
      sizeCells: readonly [number, number];
      entranceCell: readonly [number, number];
      enterable: boolean;
      baseYMm: number;
    },
    kit: BuildKitView,
    seed: number,
    frame: { heightCells: number; originXMm: number; originZMm: number },
    options?: { variant?: string; interior?: PlannerModule['emptyInteriorPlanner'] },
  ): BuildingPlanView;
}
const plannerUrl = new URL('../../../../data/src/build/town-plan/index.ts', import.meta.url).href;
const planner = (await import(/* @vite-ignore */ plannerUrl)) as unknown as PlannerModule;
const KIT_SOURCE = readFileSync(
  new URL('../../../../../content/town/buildkits/xiyu.yaml', import.meta.url),
  'utf8',
);
const KIT = planner.compileKit(KIT_SOURCE);

const LAYERS = [
  'mud_roof',
  'parapet_coping',
  'joist_soffit',
  'timber_carved',
  'timber_raw',
  'mud_plaster_ochre',
  'mud_plaster_limewash',
  'brick_fired',
  'adobe_brick',
  'brick_lattice',
  'lattice_wood',
  'door_carved',
  'floor_earth',
  'carpet_kilim',
  'dome_plaster',
  'canvas_awning',
];
const FRAME = { heightCells: 160, originXMm: 0, originZMm: 0 } as const;
function planned(
  archetype: string,
  size: readonly [number, number],
  side: Yaw4,
  variant?: string,
): BuildingPlanView {
  const entrances = [
    [Math.floor(size[0] / 2), -1],
    [-1, Math.floor(size[1] / 2)],
    [Math.floor(size[0] / 2), size[1]],
    [size[0], Math.floor(size[1] / 2)],
  ] as const;
  const entrance = entrances[side];
  return planner.planBuilding(
    {
      id: `xiyu_${archetype}_${side}`,
      type: `bld_kit_song_dali_${archetype}`,
      originCell: [0, 0],
      sizeCells: size,
      entranceCell: entrance,
      enterable: true,
      baseYMm: 0,
    },
    KIT,
    0x51a7c0de,
    FRAME,
    { ...(variant ? { variant } : {}), interior: planner.emptyInteriorPlanner },
  );
}
const SOURCE = planned('house', [6, 5], 0);

function yawPlan(_source: BuildingPlanView, yaw: Yaw4): BuildingPlanView {
  return { ...planned('house', [6, 5], yaw), id: `xiyu_house_y${yaw}` };
}
function house(yaw: Yaw4, trellis = false): BuildingPlanView {
  const plan = yawPlan(SOURCE, yaw);
  if (!trellis) return plan;
  return {
    ...plan,
    parts: [
      [
        7,
        plan.footprint[0],
        plan.footprint[1],
        2_200,
        1_600,
        yaw,
        1,
        ROOF_STYLE.None,
        0,
        0,
        0,
        0,
      ],
    ],
  };
}
function inn(yaw: Yaw4): BuildingPlanView {
  return planned('inn', [10, 8], yaw);
}
function warehouse(): BuildingPlanView {
  return planned('warehouse', [8, 6], 0);
}
function guardhouse(): BuildingPlanView {
  return planned('guardhouse', [8, 6], 0, 'tang_buddhist');
}
function temple(finial?: 'tang_stupa', style: number = ROOF_STYLE.Cuanjian): BuildingPlanView {
  const plan = planned('temple_hall', [12, 10], 0, finial ? 'tang_buddhist' : undefined);
  return { ...plan, roof: [style, plan.roof[1], plan.roof[2]], ...(finial ? { finial } : {}) };
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
function triangles(cell: ReturnType<typeof generateCells>[number]): number {
  return (cell.shell.index.length + cell.roof.index.length) / 3;
}
function ys(mesh: MeshPayload): number[] {
  return Array.from(
    { length: mesh.position.length / 3 },
    (_, vertex) => mesh.position[vertex * 3 + 1]!,
  );
}
function localPoints(plan: BuildingPlanView, mesh: MeshPayload, layer: number) {
  const result: { x: number; y: number; z: number }[] = [];
  for (let vertex = 0; vertex < mesh.position.length / 3; vertex += 1) {
    if (layer >= 0 && mesh.mat[vertex * 4] !== layer) continue;
    const worldX = mesh.position[vertex * 3]! - plan.footprint[0] / 1000;
    const worldZ = mesh.position[vertex * 3 + 2]! - plan.footprint[1] / 1000;
    const [x, z] =
      plan.yaw === 0
        ? [worldX, worldZ]
        : plan.yaw === 1
          ? [worldZ, -worldX]
          : plan.yaw === 2
            ? [-worldX, -worldZ]
            : [-worldZ, worldX];
    result.push({ x, y: mesh.position[vertex * 3 + 1]!, z });
  }
  return result;
}
function uniqueMm(values: readonly number[]): number[] {
  return values
    .map((value) => Math.round(value * 1_000))
    .filter((value, index, all) => all.indexOf(value) === index)
    .sort((a, b) => a - b);
}
function triangleCoversXY(points: readonly { x: number; y: number }[], x: number, y: number): boolean {
  const cross = (a: (typeof points)[number], b: (typeof points)[number]) =>
    (b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x);
  const signs = [cross(points[0]!, points[1]!), cross(points[1]!, points[2]!), cross(points[2]!, points[0]!)];
  return (signs.every((value) => value >= -0.000_01) || signs.every((value) => value <= 0.000_01)) &&
    signs.some((value) => Math.abs(value) > 0.000_01);
}
function frontSurfaceCovers(
  plan: BuildingPlanView, mesh: MeshPayload, x: number, y: number, layer?: number,
): boolean {
  const points = localPoints(plan, mesh, -1);
  return Array.from({ length: mesh.index.length / 3 }, (_, triangle) => triangle).some((triangle) => {
    const vertices = [0, 1, 2].map((corner) => mesh.index[triangle * 3 + corner]!);
    const corners = vertices.map((vertex) => points[vertex]!);
    return (layer === undefined || vertices.every((vertex) => mesh.mat[vertex * 4] === layer)) &&
      corners.every(({ z }) => z > 1) && triangleCoversXY(corners, x, y);
  });
}
function clusterCount(values: readonly number[], gap: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.reduce(
    (count, value, index) => count + (index === 0 || value - sorted[index - 1]! > gap ? 1 : 0),
    0,
  );
}
function emptySink(): RecipeSink {
  return {
    shell: new MeshBufferBuilder(),
    roof: new MeshBufferBuilder(),
    doors: [],
    signs: [],
    hangingProps: [],
    partUnits: [],
  };
}
function emitted(plan: BuildingPlanView, lod: 0 | 1) {
  const sink = emptySink();
  const counts = emitAdobeWithCounts(plan, 0, KIT, lod, sink);
  return {
    counts,
    shell: (sink.shell as MeshBufferBuilder).finish(),
    roof: (sink.roof as MeshBufferBuilder).finish(),
  };
}

describe('adobe recipe', () => {
  for (const yaw of [0, 1, 2, 3] as const)
    for (const lod of [0, 1] as const)
      it(`西域民居 yaw ${yaw} LOD${lod}: INV-1/2/3/4/5, wall/parapet/joist and budget`, () => {
        const plan = house(yaw);
        const { cell, all } = diagnostics(plan, lod);
        expect(all).toEqual([]);
        expect(triangles(cell)).toBeLessThanOrEqual(lod === 0 ? 1_800 : 900);
        expect(KIT.walls.gable.t).toBe(600);
        expect(KIT.walls.front.t).toBe(450);
        expect(plan.roof[2] - plan.roof[1]).toBe(450);
        const underside = (plan.elev[0] + plan.elev[1] + plan.roof[1]) / 1_000 - 0.2;
        const wallWidth = plan.footprint[2] / 1_000 - 0.98;
        const joists = localPoints(plan, cell.roof, LAYERS.indexOf('timber_raw'))
          .filter(
            ({ x, y, z }) =>
              y >= underside - 0.151 &&
              y <= underside + 0.001 &&
              Math.abs(z) > plan.footprint[3] / 2_000 - 0.489 &&
              Math.abs(x) < wallWidth / 2 + 0.001,
          )
          .map(({ x }) => Math.round(x * 1_000))
          .filter((value, index, values) => values.indexOf(value) === index)
          .sort((a, b) => a - b);
        const centres = joists
          .filter((_, index) => index % 2 === 0)
          .map((value, index) => Math.round((value + joists[index * 2 + 1]!) / 2));
        const spacing = lod === 0 ? 600 : 1_200;
        const count = Math.floor((wallWidth - 0.15) * 1_000 / spacing);
        const expected = Array.from({ length: count + 1 }, (_, index) =>
          index * spacing - (count * spacing) / 2,
        );
        expect(centres).toEqual(expected);
        if (lod === 0)
          expect(centres.slice(1).map((value, index) => value - centres[index]!)).toEqual(
            Array.from({ length: centres.length - 1 }, () => 600),
          );
        expect(KIT.variants['joistSpacingMm']).toBe(600);
      });

  it('measures upper-wall thickness, chamfer vertices, dado bands and parapet from mesh', () => {
    const plan = house(0);
    const { shell, roof } = emitted(plan, 0);
    const wall = localPoints(plan, shell, LAYERS.indexOf('mud_plaster_ochre')).filter(
      ({ y }) => y > 2.5 && y < 3.3,
    );
    expect(uniqueMm(wall.filter(({ x }) => Math.abs(x) < 1.8).map(({ z }) => z))).toEqual(
      expect.arrayContaining([-2_010, -1_410]),
    );
    expect(uniqueMm(wall.filter(({ z }) => Math.abs(z) < 1).map(({ x }) => x))).toEqual(
      expect.arrayContaining([-2_510, -1_910, 1_910, 2_510]),
    );
    expect(uniqueMm(wall.map(({ x }) => x))).toEqual(expect.arrayContaining([-2_410, 2_410]));
    const front = localPoints(plan, shell, LAYERS.indexOf('mud_plaster_limewash')).filter(
      ({ x, y }) => Math.abs(x) < 1.8 && y > 2.5 && y < 3.3,
    );
    expect(uniqueMm(front.map(({ z }) => z))).toEqual(expect.arrayContaining([1_560, 2_010]));
    const dado = localPoints(plan, shell, LAYERS.indexOf('brick_fired'));
    expect(uniqueMm(dado.map(({ y }) => y))).toEqual(expect.arrayContaining([550, 1_050]));
    const ochre = localPoints(plan, shell, LAYERS.indexOf('mud_plaster_ochre'));
    const lime = localPoints(plan, shell, LAYERS.indexOf('mud_plaster_limewash'));
    expect(Math.min(...ochre.filter(({ y }) => y > 0.2).map(({ y }) => y))).toBeCloseTo(1.05, 3);
    expect(Math.min(...lime.filter(({ y }) => y > 0.2).map(({ y }) => y))).toBeCloseTo(0.55, 3);
    const coping = localPoints(plan, roof, LAYERS.indexOf('parapet_coping'));
    const deckTop = (plan.elev[0] + plan.elev[1] + plan.roof[1]) / 1_000;
    expect(Math.max(...coping.map(({ y }) => y)) - deckTop).toBeCloseTo(0.45, 3);
  });

  it('uses high flat-lintel windows and a walkable carved door', () => {
    const plan = house(0);
    const cell = generateCells([plan], KIT, 0, 32)[0]!;
    const lattice = localPoints(plan, cell.shell, LAYERS.indexOf('lattice_wood'));
    expect(Math.min(...lattice.map(({ y }) => y))).toBeGreaterThanOrEqual(1.8);
    const facades = new Set(
      Array.from({ length: cell.shell.position.length / 3 }, (_, vertex) => vertex)
        .filter((vertex) => cell.shell.mat[vertex * 4] === LAYERS.indexOf('lattice_wood'))
        .map((vertex) => cell.shell.mat[vertex * 4 + 3]),
    );
    expect(facades).toEqual(new Set([2, 4, 8]));
    expect(cell.doors).toHaveLength(10);
    expect(cell.doors[6]).toBeGreaterThanOrEqual(1.2);
    expect(cell.doors[7]).toBeGreaterThanOrEqual(2.1);
  });

  it('projects joists and waterspouts 300 mm outside every wall skin', () => {
    const plan = house(0);
    const roof = emitted(plan, 0).roof;
    const timber = localPoints(plan, roof, LAYERS.indexOf('timber_raw'));
    const wall = { left: -2.51, right: 2.51, back: -2.01, front: 2.01 };
    expect(Math.min(...timber.map(({ x }) => x))).toBeCloseTo(wall.left - 0.3, 3);
    expect(Math.max(...timber.map(({ x }) => x))).toBeCloseTo(wall.right + 0.3, 3);
    expect(Math.min(...timber.map(({ z }) => z))).toBeCloseTo(wall.back - 0.3, 3);
    expect(Math.max(...timber.map(({ z }) => z))).toBeCloseTo(wall.front + 0.3, 3);
    const formal = guardhouse();
    const carved = localPoints(formal, emitted(formal, 0).roof, LAYERS.indexOf('timber_carved'));
    expect(Math.min(...carved.map(({ x }) => x))).toBeCloseTo(-formal.footprint[2] / 2_000 + 0.09, 2);
    expect(Math.max(...carved.map(({ z }) => z))).toBeCloseTo(formal.footprint[3] / 2_000 - 0.09, 2);
  });

  it('keeps the grape trellis bottom and iwan clear height at 2300 mm', () => {
    const plan = house(0);
    const trellis = new MeshBufferBuilder();
    emitTrellis({
      writer: trellis,
      plan,
      unit: 0,
      center: [0, 0],
      size: [2.2, 1.6],
      clearanceMm: 2_300,
      layer: 4,
      localGroundM: 0.15,
      lod: 0,
    });
    const trellisMesh = trellis.finish();
    const overhead = Array.from({ length: trellisMesh.position.length / 3 }, (_, index) => index)
      .filter((vertex) => Math.abs(trellisMesh.normal[vertex * 4 + 1]!) > 120)
      .map((vertex) => trellisMesh.position[vertex * 3 + 1]!)
      .filter((y) => y > 2);
    expect(Math.min(...overhead)).toBeCloseTo(2.45, 3);
    const sink = emptySink();
    emitIwan({
      sink,
      plan,
      unit: 0,
      floorM: 0.15,
      depthMm: 1_800,
      clearHeightMm: 2_300,
      columnCount: 3,
      timberLayer: 3,
      roofLayer: 0,
      lod: 0,
    });
    const roof = (sink.roof as MeshBufferBuilder).finish();
    expect(Math.min(...ys(roof))).toBeCloseTo(2.45, 3);
  });

  it('emits a real 1.5-2.4 m front iwan with 2-4 columns and 2300 mm clearance', () => {
    const plan = inn(0);
    const { shell, roof } = emitted(plan, 0);
    const floorM = (plan.elev[0] + plan.floorY[0]!) / 1_000;
    const carved = localPoints(plan, shell, LAYERS.indexOf('timber_carved'));
    const columns = carved.filter(({ y }) => y < floorM + 2.3 && y > floorM);
    expect(clusterCount(columns.map(({ x }) => x), 0.3)).toBe(4);
    const canopy = localPoints(plan, roof, LAYERS.indexOf('mud_roof')).filter(
      ({ y }) => y >= floorM + 2.3 && y <= floorM + 2.46,
    );
    const zs = uniqueMm(canopy.map(({ z }) => z));
    expect((zs.at(-1)! - zs[0]!) / 1_000).toBeGreaterThanOrEqual(1.5);
    expect((zs.at(-1)! - zs[0]!) / 1_000).toBeLessThanOrEqual(2.4);
    expect(Math.min(...canopy.map(({ y }) => y)) - floorM).toBeCloseTo(2.3, 3);
  });

  it('uses the planned trellis part unit in the roof fade batch', () => {
    const plan = house(0, true);
    const cell = generateCells([plan], KIT, 0, 32)[0]!;
    expect(cell.units).toEqual(new Uint16Array([0, 1]));
    expect(Array.from(cell.roof.unit).filter((_, index) => index % 2 === 0)).toContain(1);
    expect(inspectInv5(cell.shell, cell.roof, [plan], cell.units, KIT)).toEqual([]);
  });

  it('emits a solid geometric drying-wall lattice without alpha surfaces', () => {
    const writer = new MeshBufferBuilder();
    emitBrickLattice({
      writer,
      plan: house(0),
      unit: 0,
      widthM: 3,
      heightM: 1.2,
      baseM: 1.3,
      zM: 2.2,
      thicknessM: 0.12,
      layer: 9,
      localGroundM: 0.15,
      lod: 0,
    });
    const mesh = writer.finish();
    expect(mesh.index.length / 3).toBe(156);
    expect(
      Array.from(mesh.mat)
        .filter((_, index) => index % 4 === 0)
        .every((layer) => layer === 9),
    ).toBe(true);
  });

  it('cuts the production warehouse wall behind brick-lattice hole centres', () => {
    const plan = warehouse();
    const shell = emitted(plan, 0).shell;
    const wallLayer = LAYERS.indexOf('mud_plaster_limewash');
    expect(frontSurfaceCovers(plan, shell, 0.3, 2.075, wallLayer)).toBe(false);
    expect(frontSurfaceCovers(plan, shell, 2, 2.075, wallLayer)).toBe(true);
    const lattice = localPoints(plan, shell, LAYERS.indexOf('brick_lattice'));
    expect(lattice.length).toBeGreaterThan(0);
    const latticeVertices = Array.from({ length: shell.position.length / 3 }, (_, vertex) => vertex)
      .filter((vertex) => shell.mat[vertex * 4] === LAYERS.indexOf('brick_lattice'));
    expect(latticeVertices.every((vertex) => shell.mat[vertex * 4 + 2] === 0)).toBe(true);
  });
});

describe('tang_buddhist and deterministic boundary', () => {
  it('has no dome or pointed arch, emits five/three stupa rings and reaches roof top', () => {
    for (const lod of [0, 1] as const) {
      const plan = temple('tang_stupa');
      const { cell, all } = diagnostics(plan, lod);
      expect(all).toEqual([]);
      expect(emitted(plan, lod).counts).toEqual({
        dome: 0,
        pointedArch: 0,
        tangStupa: 1,
        tangStupaBowls: 1,
        tangStupaRings: lod === 0 ? 5 : 3,
        tangStupaJewels: 1,
      });
      expect(Math.max(...ys(cell.roof))).toBeCloseTo(
        (plan.elev[0] + plan.elev[1] + plan.roof[2]) / 1_000,
        2,
      );
      expect(Array.from(cell.roof.mat).filter((_, index) => index % 4 === 0)).not.toContain(
        LAYERS.indexOf('dome_plaster'),
      );
      expect(Math.max(...Array.from(cell.roof.mat).filter((_, index) => index % 4 === 0))).toBeLessThan(
        KIT.layers.length,
      );
    }
  });

  it('allows a dome only for a non-Tang plan and rejects contradictory Tang input', () => {
    const ordinary = temple(undefined, ROOF_STYLE.Dome);
    expect(emitted(ordinary, 0).counts).toMatchObject({
      dome: 1,
      pointedArch: 0,
      tangStupa: 0,
    });
    const dome = generateCells([ordinary], KIT, 0, 32)[0]!.roof;
    const domeVertices = Array.from({ length: dome.position.length / 3 }, (_, vertex) => vertex)
      .filter((vertex) => dome.mat[vertex * 4] === LAYERS.indexOf('dome_plaster'));
    expect(domeVertices.length).toBeGreaterThan(48);
    expect(domeVertices.filter((vertex) => {
      const ny = Math.abs(dome.normal[vertex * 4 + 1]! / 127);
      return ny > 0.26 && ny < 0.97;
    }).length).toBeGreaterThanOrEqual(20);
    const forbidden = temple('tang_stupa', ROOF_STYLE.Dome);
    expect(() => generateCells([forbidden], KIT, 0, 32)).toThrow(
      'BUILDGEN_ADOBE_TANG_FORBIDS_DOME',
    );
  });

  it('reports stable production counts for house, inn and temple and stable hashes', () => {
    const plans = [house(0), inn(0), temple('tang_stupa')];
    const counts = plans.map((plan) =>
      [0, 1].map((lod) => triangles(generateCells([plan], KIT, lod as 0 | 1, 32)[0]!)),
    );
    expect(counts).toEqual([
      [1_484, 788],
      [1_820, 996],
      [2_408, 1_480],
    ]);
    for (const plan of plans)
      for (const lod of [0, 1] as const)
        expect(hashCell(generateCells([plan], KIT, lod, 32)[0]!)).toBe(
          hashCell(generateCells([plan], KIT, lod, 32)[0]!),
        );
  });

  it('uses fixed-seed yaw/size samples without changing hashes', () => {
    const rng = (() => {
      let state = 0x51a7_c0de;
      return () => {
        state = (state + 0x6d2b_79f5) >>> 0;
        let value = state;
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 0x1_0000_0000;
      };
    })();
    for (let sample = 0; sample < 12; sample += 1) {
      const yaw = Math.floor(rng() * 4) as Yaw4;
      const plan = house(yaw);
      expect(hashCell(generateCells([plan], KIT, (sample % 2) as 0 | 1, 32)[0]!)).toBe(
        hashCell(generateCells([plan], KIT, (sample % 2) as 0 | 1, 32)[0]!),
      );
    }
  });

  it('keeps mesher source free of three imports', () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'mesher');
    const pending = [root];
    while (pending.length > 0) {
      const directory = pending.pop()!;
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) pending.push(path);
        else if (entry.name.endsWith('.ts')) {
          const source = readFileSync(path, 'utf8');
          expect(source).not.toContain("from 'three");
          expect(source).not.toContain('from "three');
        }
      }
    }
  });
});
