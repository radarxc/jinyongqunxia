import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ROOF_STYLE,
  type BuildingPlanView,
  type CityWallView,
  type MeshPayload,
  type Recipe,
  type RecipeSink,
} from '../types';
import { MeshBufferBuilder } from '../mesher/core/buffer';
import { hashMesh } from '../mesher/core/hash';
import { triangleOverlapsBox } from '../mesher/core/inspect';
import { writeCityWall } from '../mesher/recipes/citywall';
import { gateOpeningDimensions, gateRecipe } from '../mesher/recipes/gate';
import {
  DENSE_CORNER_LIFT_MM,
  DENSE_EAVE_COUNT,
  DENSE_FINIAL_MM,
  DENSE_FIRST_STOREY_MM,
  DENSE_PLATFORM_MM,
  denseWidthAtBp,
  denseWidthBp,
  pagodaDenseRecipe,
} from '../mesher/recipes/pagoda-dense';
import { OCT_FINIAL_MM, pagodaOctRecipe } from '../mesher/recipes/pagoda-oct';
import { MINI_BUILD_KIT } from '../testing/mini-plans';

const SOURCE = readFileSync('content/town/buildkits/song_dali.yaml', 'utf8');
const DENSE_SOURCE = SOURCE.match(
  /bld_lm_ch01_chongshengsi_pagoda: [{] recipe: pagoda_dense, eaves: ([0-9]+), heightM: ([0-9]+)/,
)!;
const OCT_SOURCE = SOURCE.match(
  /bld_lm_ch01_chongshengsi_pagoda_small: [{] recipe: pagoda_oct,.*eaves: ([0-9]+), heightM: ([0-9]+)/,
)!;
const WALL_LINE = SOURCE.split('\n').find((line) => line.startsWith('cityWall:'))!;
const WALL_VALUES = [...WALL_LINE.matchAll(/[0-9]+/g)].map((match) => Number(match[0]));
const WALL_OPENING = WALL_LINE.match(/opening: ([a-z_]+)/)![1]!;
const denseEaves = Number(DENSE_SOURCE[1]);
const denseHeightM = Number(DENSE_SOURCE[2]);
const octEaves = Number(OCT_SOURCE[1]);
const octHeightM = Number(OCT_SOURCE[2]);
const KIT = {
  ...MINI_BUILD_KIT,
  layers: MINI_BUILD_KIT.layers.map((layer, index) => ({
    ...layer,
    id:
      [
        'tile_roof',
        'ridge_tiles',
        'stone_rubble',
        'stone_dressed',
        'timber_raw',
        'timber_painted',
        'earth_plaster',
        'interior_dark',
        'plaster_lime',
      ][index] ?? layer.id,
  })),
  archetypes: { ...MINI_BUILD_KIT.archetypes, city_gate: { recipe: 'gate' as const } },
  landmarks: {
    bld_lm_ch01_chongshengsi_pagoda: {
      recipe: 'pagoda_dense' as const,
      eaves: denseEaves,
      heightM: denseHeightM,
    },
    bld_lm_ch01_chongshengsi_pagoda_small: {
      recipe: 'pagoda_oct' as const,
      eaves: octEaves,
      heightM: octHeightM,
    },
  },
  cityWall: {
    h: WALL_VALUES[0]!,
    top: WALL_VALUES[1]!,
    batter: WALL_VALUES[2]!,
    merlon: [WALL_VALUES[3]!, WALL_VALUES[4]!, WALL_VALUES[5]!] as const,
    gate: { opening: WALL_OPENING, w: WALL_VALUES[6]!, h: WALL_VALUES[7]! },
  },
};

function plan(
  archetype: string,
  widthMm: number,
  depthMm: number,
  heightM: number,
): BuildingPlanView {
  return {
    id: `special_${archetype}`,
    archetype,
    kit: KIT.id,
    seed: 0x71a5,
    footprint: [0, 0, widthMm, depthMm],
    yaw: 0,
    storeys: 1,
    roof: [ROOF_STYLE.Cuanjian, heightM * 1_000, heightM * 1_000],
    entrances: [],
    enterable: false,
    elev: [0, 1_200],
    floors: [],
    floorY: [],
    fixtures: [],
    signage: null,
    facility: 'none',
  };
}
function sink(): RecipeSink {
  return {
    shell: new MeshBufferBuilder(),
    roof: new MeshBufferBuilder(),
    doors: [],
    signs: [],
    hangingProps: [],
    partUnits: [],
  };
}
function finish(target: RecipeSink): readonly [MeshPayload, MeshPayload] {
  return [
    (target.shell as MeshBufferBuilder).finish(),
    (target.roof as MeshBufferBuilder).finish(),
  ];
}
function render(recipe: Recipe, source: BuildingPlanView, lod: 0 | 1, unit = 7) {
  const target = sink();
  recipe(source, unit, KIT, lod, target);
  return finish(target);
}
function triangles(meshes: readonly MeshPayload[]): number {
  return meshes.reduce((sum, mesh) => sum + mesh.index.length / 3, 0);
}
function bounds(meshes: readonly MeshPayload[]) {
  return {
    minY: Math.min(
      ...meshes.filter((mesh) => mesh.position.length > 0).map((mesh) => mesh.bounds[1]!),
    ),
    maxY: Math.max(
      ...meshes.filter((mesh) => mesh.position.length > 0).map((mesh) => mesh.bounds[4]!),
    ),
  };
}
function positionsAt(mesh: MeshPayload, y: number, tolerance = 0.000_1) {
  const result: [number, number, number][] = [];
  for (let index = 0; index < mesh.position.length; index += 3)
    if (Math.abs(mesh.position[index + 1]! - y) <= tolerance)
      result.push([mesh.position[index]!, mesh.position[index + 1]!, mesh.position[index + 2]!]);
  return result;
}
function triangleTouchesBox(
  mesh: MeshPayload,
  min: readonly [number, number, number],
  max: readonly [number, number, number],
): boolean {
  const center = [0, 1, 2].map((axis) => (min[axis]! + max[axis]!) / 2) as [number, number, number];
  const half = [0, 1, 2].map((axis) => (max[axis]! - min[axis]!) / 2) as [number, number, number];
  for (let offset = 0; offset < mesh.index.length; offset += 3) {
    const points = [0, 1, 2].map((corner) => {
      const vertex = mesh.index[offset + corner]! * 3;
      return [
        mesh.position[vertex]!,
        mesh.position[vertex + 1]!,
        mesh.position[vertex + 2]!,
      ] as const;
    });
    if (triangleOverlapsBox(center, half, points)) return true;
  }
  return false;
}
function boundaryEdgesByPosition(mesh: MeshPayload): string[] {
  const counts = new Map<string, number>();
  const key = (vertex: number) => {
    const p = vertex * 3;
    return [mesh.position[p]!, mesh.position[p + 1]!, mesh.position[p + 2]!]
      .map((value) => Math.round(value * 1_000))
      .join('/');
  };
  for (let offset = 0; offset < mesh.index.length; offset += 3) {
    const triangle = [mesh.index[offset]!, mesh.index[offset + 1]!, mesh.index[offset + 2]!];
    for (const [a, b] of [
      [triangle[0]!, triangle[1]!],
      [triangle[1]!, triangle[2]!],
      [triangle[2]!, triangle[0]!],
    ] as const) {
      const ends = [key(a), key(b)].sort();
      const edge = `${ends[0]}|${ends[1]}`;
      counts.set(edge, (counts.get(edge) ?? 0) + 1);
    }
  }
  return [...counts].filter((entry) => entry[1] === 1).map((entry) => entry[0]);
}
function denseEaveLevels(mesh: MeshPayload): number[] {
  const levels = new Set<number>();
  for (let offset = 0; offset < mesh.index.length; offset += 3) {
    const heights = [0, 1, 2].map((corner) => mesh.position[mesh.index[offset + corner]! * 3 + 1]!);
    const riseMm = (Math.max(...heights) - Math.min(...heights)) * 1_000;
    const upward = [0, 1, 2].every(
      (corner) => mesh.normal[mesh.index[offset + corner]! * 4 + 1]! > 0,
    );
    if (upward && Math.abs(riseMm - DENSE_CORNER_LIFT_MM) <= 0.1)
      levels.add(Math.round(Math.min(...heights) * 1_000));
  }
  return [...levels].sort((a, b) => a - b);
}
function tallSectionTrianglesNear(mesh: MeshPayload, x: number, z: number): number {
  let count = 0;
  for (let offset = 0; offset < mesh.index.length; offset += 3) {
    const points = [0, 1, 2].map((corner) => {
      const at = mesh.index[offset + corner]! * 3;
      return [mesh.position[at]!, mesh.position[at + 1]!, mesh.position[at + 2]!] as const;
    });
    const projectedArea = Math.abs(
      (points[1]![0] - points[0]![0]) * (points[2]![2] - points[0]![2]) -
        (points[2]![0] - points[0]![0]) * (points[1]![2] - points[0]![2]),
    );
    const height =
      Math.max(...points.map((point) => point[1])) - Math.min(...points.map((point) => point[1]));
    const nearby = points.every((point) => Math.hypot(point[0] - x, point[2] - z) < 4);
    if (projectedArea < 1e-6 && height > 5 && nearby) count += 1;
  }
  return count;
}
type Edge3 = readonly [readonly [number, number, number], readonly [number, number, number]];
function seamEdges(
  mesh: MeshPayload,
  accept: (point: Edge3[number], vertex: number) => boolean,
): Edge3[] {
  const result = new Map<string, Edge3>();
  for (let offset = 0; offset < mesh.index.length; offset += 3) {
    const vertices = [0, 1, 2].map((corner) => {
      const at = mesh.index[offset + corner]! * 3;
      return [mesh.position[at]!, mesh.position[at + 1]!, mesh.position[at + 2]!] as const;
    });
    for (const [a, b] of [
      [0, 1],
      [1, 2],
      [2, 0],
    ] as const) {
      const edge = [vertices[a]!, vertices[b]!] as const;
      if (!accept(edge[0], mesh.index[offset + a]!) || !accept(edge[1], mesh.index[offset + b]!))
        continue;
      const ends = edge.map((point) => point.map((value) => Math.round(value * 1e6)).join('/'));
      result.set(ends.slice().sort().join('|'), edge);
    }
  }
  return [...result.values()];
}
function edgeGap(left: Edge3, right: Edge3): number {
  const distance = (a: Edge3[number], b: Edge3[number]) =>
    Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  return Math.min(
    Math.max(distance(left[0], right[0]), distance(left[1], right[1])),
    Math.max(distance(left[0], right[1]), distance(left[1], right[0])),
  );
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

describe('special pagoda recipes', () => {
  it('密檐塔: total height, 16 rings, bp taper, 80 mm lift and both LOD budgets', () => {
    const source = plan('bld_lm_ch01_chongshengsi_pagoda', 7_000, 7_000, denseHeightM);
    for (const lod of [0, 1] as const) {
      const meshes = render(pagodaDenseRecipe, source, lod);
      const measured = bounds(meshes);
      expect(measured.maxY - measured.minY).toBeCloseTo(denseHeightM, 2);
      expect(triangles(meshes)).toBeLessThanOrEqual(lod === 0 ? 6_000 : 3_000);
      expect(
        new Set(Array.from(meshes[1].unit).filter((_value, index) => index % 2 === 0)),
      ).toEqual(new Set([7]));
    }
    const values = Array.from({ length: denseEaves }, (_, index) =>
      denseWidthBp(index, denseEaves),
    );
    expect(denseWidthAtBp(7_000)).toBe(10_600);
    expect(
      Array.from({ length: 3_001 }, (_, index) => denseWidthAtBp(7_000 + index)).every(
        (value, index, all) => index === 0 || value <= all[index - 1]!,
      ),
    ).toBe(true);
    const aboveSeventy = values.slice(Math.ceil((denseEaves - 1) * 0.7));
    expect(
      aboveSeventy.every((value, index) => index === 0 || value <= aboveSeventy[index - 1]!),
    ).toBe(true);
    expect(values.at(-1)).toBe(6_200);
    const [, roof] = render(pagodaDenseRecipe, source, 0);
    const firstEave = (DENSE_PLATFORM_MM + DENSE_FIRST_STOREY_MM) / 1_000;
    const heights = positionsAt(roof, firstEave + DENSE_CORNER_LIFT_MM / 1_000);
    expect(heights.length).toBeGreaterThanOrEqual(8);
    const firstRingTop: number[] = [];
    for (let index = 1; index < roof.position.length; index += 3) {
      const y = roof.position[index]!;
      if (y >= firstEave - 0.001 && y <= firstEave + 0.1) firstRingTop.push(y);
    }
    expect((Math.max(...firstRingTop) - Math.min(...firstRingTop)) * 1_000).toBeCloseTo(
      DENSE_CORNER_LIFT_MM,
      1,
    );
    const eaveLevels = denseEaveLevels(roof);
    expect(eaveLevels).toHaveLength(DENSE_EAVE_COUNT);
    expect(eaveLevels[0]).toBe(Math.round(firstEave * 1_000));
    expect(eaveLevels.at(-1)).toBe(Math.round((denseHeightM - DENSE_FINIAL_MM / 1_000) * 1_000));
  });

  it('八角塔: kit layer count and total height within 1%', () => {
    const source = plan('bld_lm_ch01_chongshengsi_pagoda_small', 5_000, 5_000, octHeightM);
    for (const lod of [0, 1] as const) {
      const meshes = render(pagodaOctRecipe, source, lod);
      expect(bounds(meshes).maxY - bounds(meshes).minY).toBeCloseTo(octHeightM, 2);
      expect(triangles(meshes)).toBeLessThanOrEqual(lod === 0 ? 4_000 : 2_000);
    }
    const [, roof] = render(pagodaOctRecipe, source, 0);
    const bodyBottom = Math.min(0.8, octHeightM * 0.06);
    const topRing = octHeightM - OCT_FINIAL_MM / 1_000;
    const expected = Array.from(
      { length: octEaves },
      (_, index) => bodyBottom + ((topRing - bodyBottom) * index) / (octEaves - 1),
    );
    expect(expected.every((height) => positionsAt(roof, height).length >= 8)).toBe(true);
  });
});

function wallMesh(wall: CityWallView, lod: 0 | 1): MeshPayload {
  const target = sink();
  writeCityWall(wall, 11, KIT, lod, target);
  return finish(target)[0];
}
describe('city wall recipe', () => {
  it('城墙: L-shaped and seven-sided closed mitres have no boundary at corner sections', () => {
    const shapes: CityWallView[] = [
      {
        id: 'l_wall',
        points: [
          [0, 0],
          [12_000, 0],
          [12_000, 9_000],
        ],
        closed: false,
        heightMm: KIT.cityWall.h,
        thicknessMm: KIT.cityWall.top,
        gates: [],
      },
      {
        id: 'seven_wall',
        points: [
          [0, 0],
          [12_000, 0],
          [18_000, 7_000],
          [15_000, 16_000],
          [5_000, 20_000],
          [-5_000, 15_000],
          [-7_000, 6_000],
        ],
        closed: true,
        heightMm: KIT.cityWall.h,
        thicknessMm: KIT.cityWall.top,
        gates: [],
      },
    ];
    for (const shape of shapes) {
      const mesh = wallMesh(shape, 0);
      const boundaries = boundaryEdgesByPosition(mesh);
      for (const [xMm, zMm] of shape.points.slice(1, shape.closed ? undefined : -1)) {
        const atCorner = boundaries.filter((edge) =>
          edge.split('|').some((end) => {
            const [x, , z] = end.split('/').map(Number);
            return Math.hypot(x! - xMm, z! - zMm) < 8_000;
          }),
        );
        expect(atCorner, `${shape.id}@${xMm}/${zMm}`).toHaveLength(0);
      }
    }
  });

  it('城墙: merlon spacing, gate gap and triangles per 10 m satisfy kit values', () => {
    const wall: CityWallView = {
      id: 'straight_gate',
      points: [
        [0, 0],
        [30_000, 0],
      ],
      closed: false,
      heightMm: KIT.cityWall.h,
      thicknessMm: KIT.cityWall.top,
      gates: [{ seg: 0, offsetMm: 15_000, widthMm: KIT.cityWall.gate.w, kind: 'gate' }],
    };
    for (const lod of [0, 1] as const) {
      const mesh = wallMesh(wall, lod);
      expect(
        triangleTouchesBox(mesh, [12.76, 0.001, -3], [17.24, KIT.cityWall.h / 1_000 - 0.001, 3]),
      ).toBe(false);
      expect((mesh.index.length / 3 / 30) * 10).toBeLessThanOrEqual(lod === 0 ? 300 : 150);
    }
    const mesh = wallMesh({ ...wall, gates: [] }, 0);
    const top = KIT.cityWall.h / 1_000 + KIT.cityWall.merlon[2] / 1_000;
    const xs = [...new Set(positionsAt(mesh, top).map(([x]) => Math.round(x * 1_000)))].sort(
      (a, b) => a - b,
    );
    const centres: number[] = [];
    for (let index = 0; index < xs.length; index += 2)
      if (xs[index + 1] !== undefined) centres.push((xs[index]! + xs[index + 1]!) / 2);
    expect(
      centres
        .slice(1)
        .every((value, index) => Math.abs(value - centres[index]! - KIT.cityWall.merlon[0]) <= 1),
    ).toBe(true);
  });

  it('城墙: runtime thickness overrides the kit top width', () => {
    const thicknessMm = 2_800;
    const mesh = wallMesh(
      {
        id: 'runtime_thickness',
        points: [
          [0, 0],
          [10_000, 0],
        ],
        closed: false,
        heightMm: KIT.cityWall.h,
        thicknessMm,
        gates: [],
      },
      0,
    );
    const bottom = positionsAt(mesh, 0);
    const widthMm =
      (Math.max(...bottom.map((point) => point[2])) -
        Math.min(...bottom.map((point) => point[2]))) *
      1_000;
    const expectedMm = thicknessMm + (2 * KIT.cityWall.h * KIT.cityWall.batter) / 10_000;
    const kitWidthMm = KIT.cityWall.top + (2 * KIT.cityWall.h * KIT.cityWall.batter) / 10_000;
    expect(widthMm).toBeCloseTo(expectedMm, 1);
    expect(widthMm).not.toBeCloseTo(kitWidthMm, 1);
  });

  it('城墙: closed seven-sided wall with a non-first-segment gate keeps the first mitre', () => {
    const wall: CityWallView = {
      id: 'seven_gate',
      closed: true,
      heightMm: KIT.cityWall.h,
      thicknessMm: KIT.cityWall.top,
      points: [
        [0, 0],
        [12_000, 0],
        [18_000, 7_000],
        [15_000, 16_000],
        [5_000, 20_000],
        [-5_000, 15_000],
        [-7_000, 6_000],
      ],
      gates: [{ seg: 3, offsetMm: 5_000, widthMm: KIT.cityWall.gate.w, kind: 'gate' }],
    };
    const mesh = wallMesh(wall, 0);
    expect(tallSectionTrianglesNear(mesh, 0, 0)).toBe(0);
    expect(boundaryEdgesByPosition(mesh)).toHaveLength(0);
  });

  it('城墙: fixed-seed L paths preserve mitred joints across varied leg lengths', () => {
    const random = mulberry32(0x71a5_0114);
    for (let sample = 0; sample < 12; sample += 1) {
      const first = 20_000 + Math.floor(random() * 10_000);
      const second = 20_000 + Math.floor(random() * 10_000);
      const wall: CityWallView = {
        id: `property_l_${sample}`,
        points: [
          [0, 0],
          [first, 0],
          [first, second],
        ],
        closed: false,
        heightMm: KIT.cityWall.h,
        thicknessMm: KIT.cityWall.top,
        gates: [],
      };
      const boundary = boundaryEdgesByPosition(wallMesh(wall, 1));
      expect(
        boundary.some((edge) =>
          edge.split('|').every((end) => {
            const [x, , z] = end.split('/').map(Number);
            return Math.hypot(x! - first, z!) < 8_000;
          }),
        ),
      ).toBe(false);
    }
  });
});

describe('gate recipe', () => {
  const gatePlan = plan('city_gate', 12_000, 8_000, 12);
  it('城门: trapezoid opening meets clearance and contains zero triangles', () => {
    const opening = gateOpeningDimensions(gatePlan, KIT.cityWall.gate);
    const crossing = new MeshBufferBuilder();
    for (const position of [
      [-8, 1, 0],
      [8, 1, 0],
      [8, 9, 0],
    ] as const)
      crossing.addVertex({ position, normal: [0, 0, 1] });
    crossing.addTriangle(0, 1, 2);
    expect(triangleTouchesBox(crossing.finish(), [-2, 0.5, -0.1], [2, 2, 0.1])).toBe(true);
    expect(opening.topWidthM).toBeGreaterThanOrEqual(4.5);
    expect(opening.heightM).toBeGreaterThanOrEqual(5);
    for (const lod of [0, 1] as const) {
      const meshes = render(gateRecipe, gatePlan, lod);
      expect(
        triangleTouchesBox(
          meshes[0],
          [-opening.topWidthM / 2 + 0.01, 0.01, -3.9],
          [opening.topWidthM / 2 - 0.01, opening.heightM - 0.01, 3.9],
        ),
      ).toBe(false);
      expect(triangles(meshes)).toBeLessThanOrEqual(lod === 0 ? 8_000 : 3_500);
    }
  });

  it('城门: xieshan gatehouse starts on the platform within 1 mm', () => {
    const [shell, roof] = render(gateRecipe, gatePlan, 0);
    const platformTop = KIT.cityWall.h / 1_000;
    const seamY = platformTop + 2.8;
    const timberLayer = KIT.layers.findIndex((layer) => layer.id === 'timber_painted');
    expect(positionsAt(shell, platformTop, 0.001).length).toBeGreaterThan(0);
    const roofEdges = seamEdges(
      roof,
      (point, vertex) =>
        point[1] >= seamY - 0.001 &&
        point[1] <= seamY + KIT.dims.hall.lift[0] / 1_000 + 0.001 &&
        roof.normal[vertex * 4 + 1]! > 0 &&
        roof.mat[vertex * 4] === 0 &&
        Math.abs(roof.uv[vertex * 2 + 1]!) <= 0.000_001,
    );
    const shellEdges = seamEdges(
      shell,
      (point, vertex) =>
        point[1] >= seamY - 0.001 &&
        point[1] <= seamY + 0.5 &&
        shell.mat[vertex * 4] === timberLayer,
    );
    expect(roofEdges.length).toBeGreaterThan(0);
    expect(shellEdges.length).toBeGreaterThan(0);
    const gapsMm = roofEdges.map(
      (roofEdge) =>
        Math.min(...shellEdges.map((shellEdge) => edgeGap(roofEdge, shellEdge))) * 1_000,
    );
    expect(Math.max(...gapsMm)).toBeLessThanOrEqual(1);
  });
});

it('special recipes keep identical mesh hashes for identical inputs', () => {
  const cases = [
    [pagodaDenseRecipe, plan('bld_lm_ch01_chongshengsi_pagoda', 7_000, 7_000, denseHeightM)],
    [pagodaOctRecipe, plan('bld_lm_ch01_chongshengsi_pagoda_small', 5_000, 5_000, octHeightM)],
    [gateRecipe, plan('city_gate', 12_000, 8_000, 12)],
  ] as const;
  for (const [recipe, source] of cases) {
    const first = render(recipe, source, 0);
    const second = render(recipe, source, 0);
    expect(first.map((mesh) => hashMesh(mesh))).toEqual(second.map((mesh) => hashMesh(mesh)));
  }
  const wall: CityWallView = {
    id: 'hash_wall',
    points: [
      [0, 0],
      [10_000, 0],
      [10_000, 8_000],
    ],
    closed: false,
    heightMm: KIT.cityWall.h,
    thicknessMm: KIT.cityWall.top,
    gates: [],
  };
  expect(hashMesh(wallMesh(wall, 0))).toBe(hashMesh(wallMesh(wall, 0)));
});
