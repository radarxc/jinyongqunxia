import { readFileSync, readdirSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MeshBufferBuilder } from '../mesher/core/buffer';
import { hashMesh } from '../mesher/core/hash';
import {
  INTERIOR_SURFACE_FLAG,
  NIGHT_GLOW_FLAG,
  PROP_AO,
  PROP_ARRAY_FLAG,
  PROP_DEFINITIONS,
  PROP_LAYER,
  WALL_CORNER_AO,
  bakedLampByte,
  buildInterior,
  propContext,
  propByIndex,
} from '../mesher/fixtures';
import { mulberry32 } from '../mesher/core/rng';
import { MINI_BUILDING_PLANS, MINI_BUILD_KIT } from '../testing/mini-plans';
import type { BuildingPlanView, FixtureView, MeshPayload, Yaw4 } from '../types';

function emitProp(index: number, lod: 0 | 1, variant = 0, yaw: Yaw4 = 0): MeshPayload {
  const definition = propByIndex(index);
  const writer = new MeshBufferBuilder();
  definition.recipe(definition.wMm, definition.dMm, definition.hMm, variant, lod, {
    writer,
    placement: { originMm: [0, 0, 0], yaw, unit: 7, localGroundMm: 0, lamps: [] },
  });
  return writer.finish();
}
function extents(mesh: MeshPayload) {
  return {
    w: (mesh.bounds[3]! - mesh.bounds[0]!) * 1000,
    d: (mesh.bounds[5]! - mesh.bounds[2]!) * 1000,
    h: (mesh.bounds[4]! - mesh.bounds[1]!) * 1000,
  };
}
function triangles(mesh: MeshPayload): number {
  return mesh.index.length / 3;
}
function positions(mesh: MeshPayload): readonly [number, number, number][] {
  return Array.from({ length: mesh.position.length / 3 }, (_, index) => [
    mesh.position[index * 3]! * 1000,
    mesh.position[index * 3 + 1]! * 1000,
    mesh.position[index * 3 + 2]! * 1000,
  ]);
}
const DATA_FIXTURE_SOURCE = new URL(
  '../../../../data/src/build/town-plan/fixtures.ts',
  import.meta.url,
);

describe('programmatic fixture catalogue', () => {
  it('registers all 43 stable indices and rejects pending indices', () => {
    expect(PROP_DEFINITIONS.map((definition) => [definition.idx, definition.name])).toHaveLength(
      43,
    );
    expect(PROP_DEFINITIONS.map((definition) => definition.idx)).toEqual(
      Array.from({ length: 43 }, (_, index) => index),
    );
    expect(() => propByIndex(43)).toThrow('BUILDGEN_PROP_PENDING:43');
  });

  it('matches the data fixture catalogue source for stable identity, size and blocking', () => {
    const source = readFileSync(DATA_FIXTURE_SOURCE, 'utf8');
    const rows = [
      ...source.matchAll(
        /fixture[(]([0-9]+), '([^']+)', ([0-9_]+), ([0-9_]+), ([0-9_]+)(?:, ([01]))?/g,
      ),
    ].map(([, idx, name, w, d, h, blocks]) => [
      Number(idx),
      name,
      Number(w!.replaceAll('_', '')),
      Number(d!.replaceAll('_', '')),
      Number(h!.replaceAll('_', '')),
      Number(blocks ?? 1),
    ]);
    expect(
      PROP_DEFINITIONS.map(({ idx, name, wMm, dMm, hMm, blocks }) => [
        idx,
        name,
        wMm,
        dMm,
        hMm,
        blocks,
      ]),
    ).toEqual(rows);
  });

  for (const definition of PROP_DEFINITIONS)
    for (const lod of [0, 1] as const)
      it(`${definition.idx} ${definition.name} LOD${lod}: bounds, flags and budget`, () => {
        const mesh = emitProp(definition.idx, lod);
        const budget = definition.triangleBudget[lod];
        expect(triangles(mesh)).toBeLessThanOrEqual(budget);
        if (budget === 0) {
          expect(mesh.index).toHaveLength(0);
          return;
        }
        const size = extents(mesh);
        expect(size.w).toBeCloseTo(definition.wMm, -1);
        expect(size.d).toBeCloseTo(definition.dMm, -1);
        expect(size.h).toBeCloseTo(definition.hMm, -1);
        for (let vertex = 0; vertex < mesh.position.length / 3; vertex += 1) {
          expect(mesh.mat[vertex * 4 + 2]! & INTERIOR_SURFACE_FLAG).not.toBe(0);
          expect(mesh.mat[vertex * 4 + 2]! & PROP_ARRAY_FLAG).not.toBe(0);
          expect(mesh.mat[vertex * 4]!).toBeGreaterThanOrEqual(0);
          expect(mesh.mat[vertex * 4]!).toBeLessThanOrEqual(7);
        }
      });

  it('swaps nominal width/depth exactly under quarter turns', () => {
    for (const definition of PROP_DEFINITIONS.filter((item) => item.triangleBudget[0] > 0))
      for (const yaw of [0, 1, 2, 3] as const) {
        const size = extents(emitProp(definition.idx, 0, 0, yaw));
        expect(size.w).toBeCloseTo(yaw % 2 === 0 ? definition.wMm : definition.dMm, -1);
        expect(size.d).toBeCloseTo(yaw % 2 === 0 ? definition.dMm : definition.wMm, -1);
      }
  });

  it('fixed-seed mulberry32 samples bounds, yaw, LOD and variants', () => {
    const rng = mulberry32(0x5052_4f50);
    for (let sample = 0; sample < 128; sample += 1) {
      const definition = PROP_DEFINITIONS[rng.rangeInt(0, PROP_DEFINITIONS.length)]!;
      const lod = rng.rangeInt(0, 2) as 0 | 1;
      const yaw = rng.rangeInt(0, 4) as Yaw4;
      const variant = rng.nextU32();
      const mesh = emitProp(definition.idx, lod, variant, yaw);
      expect(triangles(mesh)).toBeLessThanOrEqual(definition.triangleBudget[lod]);
      if (mesh.position.length === 0) continue;
      const size = extents(mesh);
      const expectedW = yaw % 2 === 0 ? definition.wMm : definition.dMm;
      const expectedD = yaw % 2 === 0 ? definition.dMm : definition.wMm;
      expect(Math.abs(size.w - expectedW), definition.name).toBeLessThanOrEqual(expectedW * 0.02);
      expect(Math.abs(size.d - expectedD), definition.name).toBeLessThanOrEqual(expectedD * 0.02);
      expect(Math.abs(size.h - definition.hMm), definition.name).toBeLessThanOrEqual(
        definition.hMm * 0.02,
      );
    }
  });

  it('keeps blocking geometry within its fixture rectangle and non-blocking geometry legal', () => {
    for (const definition of PROP_DEFINITIONS) {
      const mesh = emitProp(definition.idx, 0);
      if (mesh.position.length === 0) continue;
      if (definition.blocks === 1) {
        expect(mesh.bounds[0]).toBeGreaterThanOrEqual(-definition.wMm / 2000 - 0.01);
        expect(mesh.bounds[3]).toBeLessThanOrEqual(definition.wMm / 2000 + 0.01);
        expect(mesh.bounds[2]).toBeGreaterThanOrEqual(-definition.dMm / 2000 - 0.01);
        expect(mesh.bounds[5]).toBeLessThanOrEqual(definition.dMm / 2000 + 0.01);
      } else {
        const heightMm = (mesh.bounds[4]! - mesh.bounds[1]!) * 1000;
        expect(heightMm <= 250 || mesh.bounds[1]! * 1000 >= 2_200).toBe(true);
      }
    }
  });

  it('matches the frozen per-prop triangle snapshot', () => {
    expect(
      PROP_DEFINITIONS.map((definition) => [
        definition.idx,
        definition.name,
        triangles(emitProp(definition.idx, 0)),
        triangles(emitProp(definition.idx, 1)),
      ]),
    ).toMatchInlineSnapshot(`
      [
        [
          0,
          "counter",
          48,
          12,
        ],
        [
          1,
          "barred_high_counter",
          120,
          60,
        ],
        [
          2,
          "shelf_4",
          96,
          24,
        ],
        [
          3,
          "apothecary_cabinet",
          168,
          24,
        ],
        [
          4,
          "cloth_rack",
          108,
          12,
        ],
        [
          5,
          "bookcase",
          144,
          60,
        ],
        [
          6,
          "reading_table",
          60,
          24,
        ],
        [
          7,
          "square_table",
          60,
          24,
        ],
        [
          8,
          "bench",
          36,
          12,
        ],
        [
          9,
          "stool",
          24,
          12,
        ],
        [
          10,
          "armchair",
          96,
          12,
        ],
        [
          11,
          "altar_table",
          60,
          24,
        ],
        [
          12,
          "bed",
          60,
          24,
        ],
        [
          13,
          "chest",
          24,
          12,
        ],
        [
          14,
          "stairs_14",
          312,
          124,
        ],
        [
          15,
          "forge",
          38,
          36,
        ],
        [
          16,
          "bellows",
          36,
          24,
        ],
        [
          17,
          "anvil_stump",
          44,
          32,
        ],
        [
          18,
          "quench_trough",
          60,
          12,
        ],
        [
          19,
          "weapon_rack",
          208,
          48,
        ],
        [
          20,
          "tool_rack",
          72,
          36,
        ],
        [
          21,
          "workbench",
          60,
          24,
        ],
        [
          22,
          "barrel",
          48,
          12,
        ],
        [
          23,
          "crate",
          12,
          12,
        ],
        [
          24,
          "sack",
          24,
          12,
        ],
        [
          25,
          "wine_jar",
          64,
          12,
        ],
        [
          26,
          "jar_group",
          48,
          24,
        ],
        [
          27,
          "basket",
          32,
          16,
        ],
        [
          28,
          "hay_bale",
          12,
          12,
        ],
        [
          29,
          "manger",
          12,
          12,
        ],
        [
          30,
          "buddha_altar",
          48,
          24,
        ],
        [
          31,
          "statue",
          204,
          12,
        ],
        [
          32,
          "incense_burner",
          68,
          12,
        ],
        [
          33,
          "cushion",
          12,
          12,
        ],
        [
          34,
          "screen",
          36,
          12,
        ],
        [
          35,
          "dais",
          12,
          12,
        ],
        [
          36,
          "gambling_table",
          60,
          24,
        ],
        [
          37,
          "wooden_dummy",
          80,
          12,
        ],
        [
          38,
          "flag_rack",
          26,
          12,
        ],
        [
          39,
          "counter_clutter",
          60,
          0,
        ],
        [
          40,
          "lantern",
          48,
          12,
        ],
        [
          41,
          "hanging_goods",
          36,
          0,
        ],
        [
          42,
          "storyteller_table",
          60,
          24,
        ],
      ]
    `);
  });

  it('is deterministic and changes geometry across variants', () => {
    for (const definition of PROP_DEFINITIONS)
      expect(hashMesh(emitProp(definition.idx, 0, 7))).toBe(
        hashMesh(emitProp(definition.idx, 0, 7)),
      );
    for (const definition of PROP_DEFINITIONS)
      expect(hashMesh(emitProp(definition.idx, 0, 0)), definition.name).not.toBe(
        hashMesh(emitProp(definition.idx, 0, 1)),
      );
  });

  it('uses the frozen eight-layer prop order', () => {
    expect(PROP_LAYER).toEqual({
      woodFurniture: 0,
      woodRough: 1,
      ceramicGlaze: 2,
      iron: 3,
      clothBolt: 4,
      paperBooks: 5,
      strawBasket: 6,
      medicineDrawers: 7,
    });
  });

  it('models fourteen treads along 3 m with two stringers and continuous handrails', () => {
    const mesh = emitProp(14, 0);
    const points = positions(mesh);
    const treadLevels = new Set(
      points
        .filter(
          (point, index) =>
            mesh.normal[index * 4 + 1]! > 100 && Math.abs(point[2]) > 440 && point[1] < 2_000,
        )
        .map((point) => Math.round(point[1])),
    );
    expect(treadLevels.size).toBe(14);
    for (const side of [-1, 1]) {
      expect(points.some(([x, y, z]) => x < -1_400 && y < 100 && z * side > 350)).toBe(true);
      expect(points.some(([x, y, z]) => x > 1_400 && y > 2_600 && z * side > 350)).toBe(true);
    }
  });

  it('gives six weapon lanes distinct iron silhouettes', () => {
    const mesh = emitProp(19, 0);
    const iron = positions(mesh).filter((_, index) => mesh.mat[index * 4] === PROP_LAYER.iron);
    const centres = Array.from({ length: 6 }, (_, index) => -608 + index * 243.2);
    const widths = centres.map((centre) => {
      const lane = iron.filter(([x]) => Math.abs(x - centre) < 115);
      expect(lane.length).toBeGreaterThan(0);
      return Math.round(Math.max(...lane.map(([x]) => x)) - Math.min(...lane.map(([x]) => x)));
    });
    expect(new Set(widths).size).toBeGreaterThanOrEqual(4);
  });

  it('recesses apothecary drawers and uses the medicine layer at both LODs', () => {
    const detailed = emitProp(3, 0);
    const coarse = emitProp(3, 1);
    const detailedZ = positions(detailed)
      .filter((_, index) => detailed.mat[index * 4] === PROP_LAYER.medicineDrawers)
      .map((point) => point[2]);
    expect(Math.min(...detailedZ)).toBeGreaterThanOrEqual(-225.01);
    expect(Math.max(...detailedZ) - Math.min(...detailedZ)).toBeGreaterThanOrEqual(20);
    expect(Array.from(coarse.mat.filter((_, index) => index % 4 === 0))).toContain(
      PROP_LAYER.medicineDrawers,
    );
  });

  it('marks lantern paper with named night glow and keeps every variant in nominal height', () => {
    for (const lod of [0, 1] as const)
      for (const variant of [0, 1, 2, 3]) {
        const mesh = emitProp(40, lod, variant);
        expect(extents(mesh).h).toBeCloseTo(propByIndex(40).hMm, -1);
        const paperFlags = Array.from({ length: mesh.position.length / 3 }, (_, index) =>
          mesh.mat[index * 4] === PROP_LAYER.paperBooks ? mesh.mat[index * 4 + 2]! : 0,
        );
        expect(paperFlags.some((flags) => (flags & NIGHT_GLOW_FLAG) !== 0)).toBe(true);
        if (variant & 1) {
          const points = positions(mesh);
          const paperTop = Math.max(
            ...points
              .filter((_, index) => mesh.mat[index * 4] === PROP_LAYER.paperBooks)
              .map((point) => point[1]),
          );
          expect(paperTop).toBeGreaterThanOrEqual(2_678);
          expect(paperTop).toBeLessThanOrEqual(2_681);
          expect(
            points.some(([x, y, z]) => y > paperTop && Math.abs(x) <= 11 && Math.abs(z) <= 11),
          ).toBe(true);
        }
      }
  });

  it('writes the documented furniture AO byte', () => {
    for (const definition of PROP_DEFINITIONS) {
      const mesh = emitProp(definition.idx, 0);
      for (let vertex = 0; vertex < mesh.position.length / 3; vertex += 1)
        expect(mesh.mat[vertex * 4 + 1]).toBe(PROP_AO);
    }
  });
});

function fixture(index: number, x: number, z: number, yaw: Yaw4 = 0): FixtureView {
  const definition = propByIndex(index);
  return [index, x, z, definition.wMm, definition.dMm, yaw, definition.blocks];
}
function interiorPlan(
  facility: BuildingPlanView['facility'],
  fixtures: readonly FixtureView[],
): BuildingPlanView {
  const source = MINI_BUILDING_PLANS[0]!;
  return {
    ...source,
    id: `interior_${facility}`,
    facility,
    footprint: [0, 0, 8_000, 7_000],
    floors: [[-3_200, -2_600, 3_200, 2_600]],
    fixtures,
  };
}
function built(plan: BuildingPlanView, lod: 0 | 1) {
  const writer = new MeshBufferBuilder();
  const diagnostics: Parameters<typeof buildInterior>[4]['diagnostics'] = [];
  const stats = buildInterior(plan, 9, MINI_BUILD_KIT, lod, { interior: writer, diagnostics });
  return { mesh: writer.finish(), stats, diagnostics };
}

describe('interior assembly and baked lighting', () => {
  const pharmacy = interiorPlan('pharmacy', [
    fixture(3, 0, -1_700),
    fixture(0, 0, -500),
    fixture(8, 0, 1_400),
  ]);
  const inn = interiorPlan('inn', [
    fixture(0, -1_900, -1_800),
    fixture(14, 1_700, -1_000, 1),
    fixture(7, -1_400, 1_200),
    fixture(9, -1_400, 1_800),
  ]);
  const smithy = interiorPlan('smithy', [
    fixture(15, -2_000, -1_500),
    fixture(16, -700, -1_300),
    fixture(17, 600, -1_300),
    fixture(18, 1_600, -1_300),
    fixture(19, 0, 1_700),
  ]);

  for (const buildingYaw of [0, 1, 2, 3] as const)
    it(`uses world fixture coordinates directly at building yaw ${buildingYaw}`, () => {
      const tupleYaw = ((buildingYaw + 1) % 4) as Yaw4;
      const worldX = 11_000 + buildingYaw * 170;
      const worldZ = 22_000 - buildingYaw * 130;
      const plan = {
        ...interiorPlan('pharmacy', [fixture(0, worldX, worldZ, tupleYaw)]),
        id: `world_fixture_y${buildingYaw}`,
        footprint: [10_000, 20_000, 8_000, 7_000] as const,
        yaw: buildingYaw,
        floors: [],
        entrances: [],
      };
      const result = built(plan, 0);
      expect((result.mesh.bounds[0]! + result.mesh.bounds[3]!) * 500).toBeCloseTo(worldX, 1);
      expect((result.mesh.bounds[2]! + result.mesh.bounds[5]!) * 500).toBeCloseTo(worldZ, 1);
      expect(extents(result.mesh).w).toBeCloseTo(tupleYaw % 2 === 0 ? 1_800 : 550, -1);
      expect(extents(result.mesh).d).toBeCloseTo(tupleYaw % 2 === 0 ? 550 : 1_800, -1);
      expect(result.stats.lamps[0]).toMatchObject({ xMm: worldX, zMm: worldZ });
    });

  for (const plan of [pharmacy, inn, smithy])
    for (const lod of [0, 1] as const)
      it(`${plan.facility} LOD${lod}: batch budget, unit and interior flags`, () => {
        const result = built(plan, lod);
        expect(result.stats.triangles).toBeLessThanOrEqual(lod === 0 ? 3_000 : 1_200);
        expect(
          result.diagnostics.some((item) => item.code === 'INTERIOR_TRIANGLE_BUDGET_EXCEEDED'),
        ).toBe(false);
        for (let vertex = 0; vertex < result.mesh.position.length / 3; vertex += 1) {
          expect(result.mesh.unit[vertex * 2]).toBe(9);
          expect(result.mesh.mat[vertex * 4 + 2]! & INTERIOR_SURFACE_FLAG).not.toBe(0);
        }
      });

  for (const buildingYaw of [0, 1, 2, 3] as const)
    it(`keeps forge light at its world fixture for building yaw ${buildingYaw}`, () => {
      const worldX = 12_300 - buildingYaw * 90;
      const worldZ = 18_700 + buildingYaw * 110;
      const plan = {
        ...interiorPlan('smithy', [fixture(15, worldX, worldZ, buildingYaw)]),
        footprint: [10_000, 20_000, 8_000, 7_000] as const,
        yaw: buildingYaw,
        floors: [],
        entrances: [],
      };
      const result = built(plan, 1);
      expect((result.mesh.bounds[0]! + result.mesh.bounds[3]!) * 500).toBeCloseTo(worldX, 1);
      expect((result.mesh.bounds[2]! + result.mesh.bounds[5]!) * 500).toBeCloseTo(worldZ, 1);
      expect(result.stats.lamps[0]).toMatchObject({ xMm: worldX, zMm: worldZ });
    });

  it('bakes maximum light at the lamp, zero at 2.5 m, and monotonic falloff', () => {
    const lamp = [{ xMm: 0, yMm: 0, zMm: 0 }];
    const samples = [0, 500, 1_000, 1_500, 2_000, 2_500, 3_000].map((distance) =>
      bakedLampByte([distance, 0, 0], lamp),
    );
    expect(samples[0]).toBe(255);
    expect(samples[5]).toBe(0);
    expect(samples[6]).toBe(0);
    for (let index = 1; index < samples.length; index += 1)
      expect(samples[index]).toBeLessThanOrEqual(samples[index - 1]!);
  });

  it('bakes only tint alpha and preserves supplied or default RGB', () => {
    const vertex = (
      xMm: number,
      lamps: readonly { xMm: number; yMm: number; zMm: number }[],
      tint?: readonly [number, number, number, number],
    ) => {
      const writer = new MeshBufferBuilder();
      propContext(writer, {
        originMm: [0, 0, 0],
        yaw: 0,
        unit: 9,
        localGroundMm: 0,
        lamps,
      }).writer.addVertex({ position: [xMm / 1_000, 0, 0], normal: [0, 1, 0], tint });
      return writer.finish().tint;
    };
    const lamp = [{ xMm: 0, yMm: 0, zMm: 0 }];
    expect(Array.from(vertex(0, [], [17, 29, 43, 99]))).toEqual([17, 29, 43, 0]);
    expect(Array.from(vertex(0, lamp, [17, 29, 43, 99]))).toEqual([17, 29, 43, 255]);
    expect(Array.from(vertex(3_000, lamp, [17, 29, 43, 99]))).toEqual([17, 29, 43, 0]);
    expect(Array.from(vertex(0, []))).toEqual([255, 255, 255, 0]);
    expect(Array.from(vertex(0, lamp))).toEqual([255, 255, 255, 255]);
    expect(Array.from(vertex(3_000, lamp))).toEqual([255, 255, 255, 0]);
  });

  it('cuts lamp light at the exact 2.5 m sphere in every direction', () => {
    const lamp = [{ xMm: 0, yMm: 0, zMm: 0 }];
    expect(bakedLampByte([2_500, 0, 0], lamp)).toBe(0);
    expect(bakedLampByte([2_499, 0, 0], lamp)).toBeGreaterThan(0);
    expect(bakedLampByte([0, -2_499, 0], lamp)).toBeGreaterThan(0);
    // 3 x 1444^2 = 6,255,408 >= 2500^2: outside although the octahedral estimate is 2257 mm.
    expect(bakedLampByte([1_444, 1_444, 1_444], lamp)).toBe(0);
    expect(bakedLampByte([-1_444, 1_444, -1_444], lamp)).toBe(0);
    for (const direction of [
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, -1],
      [1, 1, 1],
      [-1, 1, 1],
    ] as const) {
      const norm = Math.hypot(...direction);
      let previous = 256;
      for (let distance = 0; distance <= 3_000; distance += 25) {
        const point = direction.map((axis) => Math.round((axis * distance) / norm)) as [
          number,
          number,
          number,
        ];
        const value = bakedLampByte(point, lamp);
        expect(value, `${direction.join(',')} @ ${distance}`).toBeLessThanOrEqual(previous);
        previous = value;
      }
    }
  });

  it('agrees with the squared distance for fixed-seed random 3D lamp offsets', () => {
    const rng = mulberry32(0x4c41_4d50);
    const lamp = [{ xMm: 120, yMm: 2_200, zMm: -340 }];
    let inside = 0;
    let outside = 0;
    for (let sample = 0; sample < 2_000; sample += 1) {
      const offset = [0, 1, 2].map(() => rng.rangeInt(-3_000, 3_001)) as [number, number, number];
      const squared = offset[0] * offset[0] + offset[1] * offset[1] + offset[2] * offset[2];
      const value = bakedLampByte(
        [lamp[0]!.xMm + offset[0], lamp[0]!.yMm + offset[1], lamp[0]!.zMm + offset[2]],
        lamp,
      );
      if (squared >= 2_500 * 2_500) {
        expect(value, offset.join(',')).toBe(0);
        outside += 1;
      } else if (squared <= 2_300 * 2_300) {
        // The estimate overshoots the true distance by at most 8.44 % plus 2 mm of rounding.
        expect(value, offset.join(',')).toBeGreaterThan(0);
        inside += 1;
      }
    }
    expect(inside).toBeGreaterThan(100);
    expect(outside).toBeGreaterThan(100);
  });

  it('puts wood and brick finishes on facilities and writes baked light bytes', () => {
    const kit = {
      ...MINI_BUILD_KIT,
      layers: MINI_BUILD_KIT.layers.map((layer, index) => ({
        ...layer,
        id: index === 14 ? 'floor_wood' : index === 15 ? 'floor_pavers' : layer.id,
      })),
    };
    const floorMesh = (facility: BuildingPlanView['facility']) => {
      const writer = new MeshBufferBuilder();
      buildInterior(interiorPlan(facility, []), 9, kit, 0, { interior: writer, diagnostics: [] });
      return writer.finish();
    };
    const woodFloor = floorMesh('pharmacy');
    const brickFloor = floorMesh('smithy');
    expect(new Set(Array.from(woodFloor.mat.filter((_, index) => index % 4 === 0)))).toEqual(
      new Set([14]),
    );
    expect(new Set(Array.from(brickFloor.mat.filter((_, index) => index % 4 === 0)))).toEqual(
      new Set([15]),
    );
    const wood = built(pharmacy, 0).mesh;
    expect(Math.max(...wood.tint.filter((_, index) => index % 4 === 3))).toBeGreaterThan(0);
    for (let vertex = 0; vertex < wood.position.length / 3; vertex += 1) {
      const flags = wood.mat[vertex * 4 + 2]!;
      expect(wood.mat[vertex * 4 + 1]).toBe(
        (flags & PROP_ARRAY_FLAG) === 0 ? WALL_CORNER_AO : PROP_AO,
      );
    }
  });

  it('downgrades or skips optional props before exceeding the room budget', () => {
    const crowded = interiorPlan('inn', [
      ...Array.from({ length: 9 }, (_, index) => fixture(14, 20_000 + index * 3_200, 30_000)),
      ...Array.from({ length: 20 }, (_, index) => fixture(40, 60_000 + index * 600, 30_000)),
    ]);
    const result = built(crowded, 0);
    expect(result.stats).toMatchObject({
      triangles: 2_996,
      downgraded: 20,
      skipped: 7,
      proxied: 0,
    });
    expect(result.diagnostics.filter((item) => item.code === 'PROP_LOD_DOWNGRADED')).toHaveLength(
      20,
    );
    expect(result.diagnostics.filter((item) => item.code === 'PROP_SKIPPED_BUDGET')).toHaveLength(
      7,
    );
  });

  for (const lod of [0, 1] as const)
    it(`proxies but never skips required props at LOD${lod}`, () => {
      const crowded = interiorPlan(
        'inn',
        Array.from({ length: 10 }, (_, index) =>
          fixture(14, 20_000 + index * 3_200, 30_000, ((index + 1) % 4) as Yaw4),
        ),
      );
      const result = built(crowded, lod);
      const limit = lod === 0 ? 3_000 : 1_200;
      expect(result.stats).toMatchObject({
        triangles: lod === 0 ? 2_832 : 1_140,
        fixtures: 10,
        skipped: 0,
        proxied: 1,
      });
      expect(result.stats.triangles).toBeLessThanOrEqual(limit);
      expect(triangles(result.mesh)).toBe(result.stats.triangles);
      expect(result.mesh.index.length).toBeLessThanOrEqual(limit * 3);
      expect(result.diagnostics).toEqual([
        expect.objectContaining({ code: 'PROP_BLOCKING_PROXY', fixtureIndex: 14 }),
      ]);
      const proxy = positions(result.mesh).filter(([x]) => x >= 19_540 && x <= 20_460);
      expect(proxy).toHaveLength(24);
      expect(Math.min(...proxy.map(([x]) => x))).toBeCloseTo(19_550, 1);
      expect(Math.max(...proxy.map(([x]) => x))).toBeCloseTo(20_450, 1);
      expect(Math.min(...proxy.map(([, , z]) => z))).toBeCloseTo(28_500, 1);
      expect(Math.max(...proxy.map(([, , z]) => z))).toBeCloseTo(31_500, 1);
      expect(
        Math.max(...proxy.map(([, y]) => y)) - Math.min(...proxy.map(([, y]) => y)),
      ).toBeCloseTo(2_700, 1);
    });

  it('throws atomically when blocking proxies still exceed the LOD1 budget', () => {
    const crowded = interiorPlan(
      'inn',
      Array.from({ length: 101 }, (_, index) => fixture(14, 20_000 + index * 3_200, 30_000)),
    );
    const writer = new MeshBufferBuilder();
    const diagnostics: Parameters<typeof buildInterior>[4]['diagnostics'] = [];
    expect(() =>
      buildInterior(crowded, 9, MINI_BUILD_KIT, 1, { interior: writer, diagnostics }),
    ).toThrow('INTERIOR_BUDGET_UNSATISFIABLE');
    expect(writer.vertexCount).toBe(0);
    expect(diagnostics.filter((item) => item.code === 'PROP_BLOCKING_PROXY')).toHaveLength(101);
    expect(diagnostics.at(-1)?.code).toBe('INTERIOR_TRIANGLE_BUDGET_EXCEEDED');
  });

  it('does not import Three anywhere in mesher/fixtures', () => {
    const root = new URL('../mesher/fixtures', import.meta.url);
    const visit = (directory: URL): string[] =>
      readdirSync(directory).flatMap((name) => {
        const candidate = new URL(
          name,
          directory.href.endsWith('/') ? directory : new URL(`${directory.href}/`),
        );
        const file = statSync(candidate).isDirectory() ? new URL(`${candidate.href}/`) : candidate;
        return statSync(file).isDirectory() ? visit(file) : [readFileSync(file, 'utf8')];
      });
    for (const source of visit(root))
      expect(source).not.toMatch(/from\s+['"]three['"]|import\s*\(\s*['"]three['"]\s*\)/);
  });
});
