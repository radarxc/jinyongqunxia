import { describe, expect, it } from 'vitest';
import { MeshBufferBuilder } from '../mesher/core/buffer';
import { hashMesh } from '../mesher/core/hash';
import { inspectInv1 } from '../mesher/core/inspect';
import { transformPoint, type Vec3 } from '../mesher/core/prims';
import { columnLayout } from '../mesher/parts/columns';
import {
  createWorldCornerDeformer,
  insetWingCorner,
  wingTWeight,
  wingUWeight,
} from '../mesher/roof/corner';
import { roofMesherFor } from '../mesher/roof';
import { writeDomeRoof } from '../mesher/roof/dome';
import { gableRoofHeightAt } from '../mesher/roof/gable';
import { hipRidgeHalfM, writeWudianRoof } from '../mesher/roof/hip';
import { writePyramidRoof } from '../mesher/roof/pyramid';
import { cornerUStations, roofPatchTStations } from '../mesher/roof/patch';
import { songZhe } from '../mesher/roof/profile';
import { ROLLED_RIDGE_RADIUS_M, rolledRoofHeightAt, writeRolledRoof } from '../mesher/roof/rolled';
import { XIESHAN_HIP_END_T, writeXieshanRoof } from '../mesher/roof/xieshan';
import { generateCells } from '../mesher/generate';
import { MINI_BUILDING_PLANS, MINI_BUILD_KIT } from '../testing/mini-plans';
import {
  ROOF_STYLE,
  type BuildingPlanView,
  type BuildKitView,
  type MeshPayload,
  type RecipeSink,
} from '../types';

const PRODUCTION_RIDGE_KIT: BuildKitView = {
  ...MINI_BUILD_KIT,
  id: 'song_dali',
  ridge: { h: 550, ends: 'dali_square', hallEnds: 'chiwei' },
  archetypes: {
    ...MINI_BUILD_KIT.archetypes,
    casino: { recipe: 'hall', size: 'middle' },
    temple_hall: { recipe: 'hall', size: 'hall', brackets: true },
    palace_hall: { recipe: 'hall', size: 'hall', brackets: true },
  },
};
function productionPlan(archetype: 'casino' | 'temple_hall' | 'palace_hall'): BuildingPlanView {
  if (archetype === 'casino')
    return {
      ...MINI_BUILDING_PLANS[4]!,
      id: 'roof_b_song_dali_middle_xieshan',
      archetype,
      footprint: [0, 0, 9_000, 7_000],
      roof: [ROOF_STYLE.Xieshan, 3_230, 5_277],
      elev: [0, 300],
      floorY: [300],
      floors: [[-4_000, -3_000, 4_000, 3_000]],
      facility: 'casino',
    };
  return {
    ...MINI_BUILDING_PLANS[4]!,
    id: `roof_b_song_dali_${archetype}`,
    archetype,
    roof: [archetype === 'palace_hall' ? ROOF_STYLE.Wudian : ROOF_STYLE.Xieshan, 4_575, 8_483],
    facility: archetype === 'palace_hall' ? 'office' : 'temple',
  };
}

function sink(): RecipeSink {
  return {
    roof: new MeshBufferBuilder(),
    shell: new MeshBufferBuilder(),
    doors: [],
    signs: [],
    hangingProps: [],
    partUnits: [],
  };
}
function plan(
  style: number,
  widthMm = 10_000,
  depthMm = 8_000,
  archetype = 'temple_hall',
): BuildingPlanView {
  return {
    ...MINI_BUILDING_PLANS[4]!,
    id: `roof_b_${style}_${widthMm}_${depthMm}`,
    archetype,
    footprint: [0, 0, widthMm, depthMm],
    yaw: 0,
    roof: [style, 4_000, 7_200],
  };
}
function finish(build: (target: RecipeSink) => void): MeshPayload {
  const target = sink();
  build(target);
  return (target.roof as MeshBufferBuilder).finish();
}
function dispatched(source: BuildingPlanView, lod: 0 | 1 = 0): MeshPayload {
  return finish((target) =>
    roofMesherFor(source.roof[0])(source, 1, target, { kit: MINI_BUILD_KIT, lod }),
  );
}
function measuredDispatchedWing(
  source: BuildingPlanView,
  kit: BuildKitView,
): readonly [liftMm: number, outsetMm: number] {
  const mesh = finish((target) =>
    roofMesherFor(source.roof[0])(source, 1, target, { kit, lod: 0 }),
  );
  const dripY = (source.elev[0] + source.elev[1] + source.roof[1]) / 1_000;
  const tile = vertices(mesh, 0);
  const corner = tile.reduce((best, point) =>
    point[0] + point[2] > best[0] + best[2] ? point : best,
  );
  const frontCentre = tile
    .filter(([x, y, z]) => Math.abs(x) < 1e-5 && Math.abs(y - dripY) < 1e-5 && z > 0)
    .reduce((best, point) => (point[2] > best[2] ? point : best));
  return [(corner[1] - dripY) * 1_000, (corner[2] - frontCentre[2]) * Math.SQRT2 * 1_000];
}
function vertices(
  mesh: MeshPayload,
  layer?: number,
): readonly (readonly [number, number, number])[] {
  const result: Array<readonly [number, number, number]> = [];
  for (let vertex = 0; vertex < mesh.position.length / 3; vertex += 1) {
    if (layer !== undefined && mesh.mat[vertex * 4] !== layer) continue;
    result.push([
      mesh.position[vertex * 3]!,
      mesh.position[vertex * 3 + 1]!,
      mesh.position[vertex * 3 + 2]!,
    ]);
  }
  return result;
}
function trianglesOnLayer(mesh: MeshPayload, layer: number): number {
  let count = 0;
  for (let offset = 0; offset < mesh.index.length; offset += 3)
    if (mesh.mat[mesh.index[offset]! * 4] === layer) count += 1;
  return count;
}
function effectiveTrianglesOnLayer(mesh: MeshPayload, layer: number): number {
  let count = 0;
  for (let offset = 0; offset < mesh.index.length; offset += 3) {
    const ids = [mesh.index[offset]!, mesh.index[offset + 1]!, mesh.index[offset + 2]!];
    if (ids.some((id) => mesh.mat[id * 4] !== layer)) continue;
    const [a, b, c] = ids.map(
      (id) =>
        [mesh.position[id * 3]!, mesh.position[id * 3 + 1]!, mesh.position[id * 3 + 2]!] as Vec3,
    ) as [Vec3, Vec3, Vec3];
    const ab: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const ac: Vec3 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    if (
      Math.hypot(
        ab[1] * ac[2] - ab[2] * ac[1],
        ab[2] * ac[0] - ab[0] * ac[2],
        ab[0] * ac[1] - ab[1] * ac[0],
      ) > 1e-9
    )
      count += 1;
  }
  return count;
}
function key(point: readonly [number, number, number]): string {
  return point.map((value) => Math.round(value * 1_000)).join('/');
}
function sortedPositionHash(mesh: MeshPayload, mirrorZ = false, layer?: number): string {
  return vertices(mesh, layer)
    .map(([x, y, z]) => key([x, y, mirrorZ ? -z : z]))
    .sort()
    .join('|');
}
function pointOnLine(start: Vec3, end: Vec3, t: number): Vec3 {
  return [
    start[0] + (end[0] - start[0]) * t,
    start[1] + (end[1] - start[1]) * t,
    start[2] + (end[2] - start[2]) * t,
  ];
}
function openPositionEdges(mesh: MeshPayload): number {
  const counts = new Map<string, number>();
  for (let offset = 0; offset < mesh.index.length; offset += 3)
    for (const [left, right] of [
      [0, 1],
      [1, 2],
      [2, 0],
    ] as const) {
      const point = (side: number): Vec3 => {
        const vertex = mesh.index[offset + side]!;
        return [
          mesh.position[vertex * 3]!,
          mesh.position[vertex * 3 + 1]!,
          mesh.position[vertex * 3 + 2]!,
        ];
      };
      const edge = [key(point(left)), key(point(right))].sort().join('|');
      counts.set(edge, (counts.get(edge) ?? 0) + 1);
    }
  return [...counts.values()].filter((count) => count === 1).length;
}
interface TileFaceBoundary {
  readonly points: readonly Vec3[];
  readonly segments: readonly (readonly [Vec3, Vec3])[];
}
function tileFaceBoundaries(mesh: MeshPayload, omitVertex = -1): readonly TileFaceBoundary[] {
  const parent = Array.from({ length: mesh.position.length / 3 }, (_, index) => index);
  const find = (value: number): number =>
    parent[value] === value ? value : (parent[value] = find(parent[value]!));
  const join = (a: number, b: number): void => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[rb] = ra;
  };
  const triangles: number[][] = [];
  for (let offset = 0; offset < mesh.index.length; offset += 3) {
    const ids = [mesh.index[offset]!, mesh.index[offset + 1]!, mesh.index[offset + 2]!];
    if (ids.some((id) => mesh.mat[id * 4] !== 0)) continue;
    const kept = ids.filter((id) => id !== omitVertex);
    for (let index = 1; index < kept.length; index += 1) join(kept[0]!, kept[index]!);
    triangles.push(kept);
  }
  const edges = new Map<string, { count: number; vertices: readonly [number, number] }>();
  for (const ids of triangles)
    for (let index = 0; index < ids.length; index += 1) {
      const a = ids[index]!;
      const b = ids[(index + 1) % ids.length]!;
      if (a === b) continue;
      const vertices = (a < b ? [a, b] : [b, a]) as readonly [number, number];
      const edgeKey = `${vertices[0]}/${vertices[1]}`;
      const edge = edges.get(edgeKey);
      edges.set(edgeKey, { count: (edge?.count ?? 0) + 1, vertices });
    }
  const groups = new Map<number, Array<readonly [number, number]>>();
  for (const edge of edges.values()) {
    if (edge.count !== 1) continue;
    const root = find(edge.vertices[0]);
    const group = groups.get(root) ?? [];
    group.push(edge.vertices);
    groups.set(root, group);
  }
  const point = (vertex: number): Vec3 => [
    mesh.position[vertex * 3]!,
    mesh.position[vertex * 3 + 1]!,
    mesh.position[vertex * 3 + 2]!,
  ];
  return [...groups.values()].map((segments) => ({
    points: [...new Set(segments.flat())].map(point),
    segments: segments.map(([a, b]) => [point(a), point(b)]),
  }));
}
function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}
function tileComponentGaps(mesh: MeshPayload, point: Vec3, omitApex: boolean): readonly number[] {
  let apexVertex = -1;
  if (omitApex)
    for (let vertex = 0; vertex < mesh.position.length / 3; vertex += 1)
      if (
        mesh.mat[vertex * 4] === 0 &&
        (apexVertex < 0 || mesh.position[vertex * 3 + 1]! > mesh.position[apexVertex * 3 + 1]!)
      )
        apexVertex = vertex;
  return tileFaceBoundaries(mesh, apexVertex)
    .map((component) =>
      Math.min(...component.points.map((candidate) => distance(candidate, point))),
    )
    .sort((a, b) => a - b);
}
interface PyramidFaceStations {
  readonly u: readonly number[];
  readonly eaveLengthMm: number;
}
function pyramidFaceUStations(mesh: MeshPayload): readonly PyramidFaceStations[] {
  const tile = Array.from({ length: mesh.position.length / 3 }, (_, index) => index).filter(
    (index) => mesh.mat[index * 4] === 0,
  );
  const apex = tile.reduce((best, index) =>
    mesh.position[index * 3 + 1]! > mesh.position[best * 3 + 1]! ? index : best,
  );
  const parent = tile.map((_, index) => index);
  const slot = new Map(tile.map((vertex, index) => [vertex, index]));
  const find = (value: number): number =>
    parent[value] === value ? value : (parent[value] = find(parent[value]!));
  const join = (left: number, right: number): void => {
    const a = find(slot.get(left)!);
    const b = find(slot.get(right)!);
    if (a !== b) parent[b] = a;
  };
  for (let offset = 0; offset < mesh.index.length; offset += 3) {
    const ids = [mesh.index[offset]!, mesh.index[offset + 1]!, mesh.index[offset + 2]!].filter(
      (id) => id !== apex && mesh.mat[id * 4] === 0,
    );
    for (let index = 1; index < ids.length; index += 1) join(ids[0]!, ids[index]!);
  }
  const groups = new Map<number, number[]>();
  for (const vertex of tile.filter((value) => value !== apex)) {
    const group = groups.get(find(slot.get(vertex)!)) ?? [];
    group.push(vertex);
    groups.set(find(slot.get(vertex)!), group);
  }
  return [...groups.values()].map((vertices) => {
    const eave = vertices.filter((id) => Math.abs(mesh.uv[id * 2 + 1]!) < 1e-8);
    const u = [...new Set(eave.map((id) => mesh.uv[id * 2]!))].sort((a, b) => a - b);
    const endpoint = (target: number): Vec3 => {
      const id = eave.find((value) => Math.abs(mesh.uv[value * 2]! - target) < 1e-8)!;
      return [mesh.position[id * 3]!, mesh.position[id * 3 + 1]!, mesh.position[id * 3 + 2]!];
    };
    return { u, eaveLengthMm: distance(endpoint(0), endpoint(1)) * 1_000 };
  });
}
function ridgeCenterGap(mesh: MeshPayload, point: Vec3): number {
  const candidates = vertices(mesh, 1).filter(
    (candidate) => Math.abs(candidate[1] - point[1]) <= 0.001 && distance(candidate, point) <= 0.2,
  );
  let best = Number.POSITIVE_INFINITY;
  for (let left = 0; left < candidates.length; left += 1)
    for (let right = left + 1; right < candidates.length; right += 1) {
      const midpoint: Vec3 = [
        (candidates[left]![0] + candidates[right]![0]) / 2,
        (candidates[left]![1] + candidates[right]![1]) / 2,
        (candidates[left]![2] + candidates[right]![2]) / 2,
      ];
      best = Math.min(best, distance(midpoint, point));
    }
  return best;
}
function mixPoint(start: Vec3, end: Vec3, t: number): Vec3 {
  return [start[0] + (end[0] - start[0]) * t, 0, start[2] + (end[2] - start[2]) * t];
}
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b_79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 0x1_0000_0000;
  };
}
interface ExpectedHipStation {
  readonly point: Vec3;
  readonly t: number;
}
function expectedHipSeams(
  source: BuildingPlanView,
  liftMm: number,
  outsetMm: number,
  yaw: BuildingPlanView['yaw'],
  lod: 0 | 1,
): readonly ExpectedHipStation[] {
  const width = source.footprint[2];
  const depth = source.footprint[3];
  const x = width / 2_000 - 0.04;
  const z = depth / 2_000 - 0.04;
  const corners: readonly Vec3[] = [
    [-x, 0, -z],
    [x, 0, -z],
    [x, 0, z],
    [-x, 0, z],
  ];
  const inset = corners.map((corner) => insetWingCorner(corner, outsetMm));
  const r =
    source.roof[0] === ROOF_STYLE.Xieshan
      ? Math.min(x - 0.1, Math.max(hipRidgeHalfM(x * 2, z * 2, 'song_zhe'), x - 0.9))
      : hipRidgeHalfM(x * 2, z * 2, 'song_zhe');
  const eaveProjection = 0.8;
  const structuralRun = z - eaveProjection;
  const steps = Math.max(2, Math.ceil(structuralRun / 1.4));
  const tail = eaveProjection / z;
  const stations =
    source.roof[0] === ROOF_STYLE.Cuanjian
      ? lod === 1
        ? [0, 0.35, 0.7]
        : [0, 0.175, 0.35, 0.675]
      : [
          ...roofPatchTStations(steps, tail, lod),
          ...(source.roof[0] === ROOF_STYLE.Xieshan ? [0.45] : []),
        ].filter(
          (t, index, all) =>
            t <= (source.roof[0] === ROOF_STYLE.Xieshan ? 0.45 : 1) && all.indexOf(t) === index,
        );
  const baseY = (source.elev[0] + source.elev[1]) / 1_000;
  const dripY = baseY + source.roof[1] / 1_000;
  const ridgeY = baseY + source.roof[2] / 1_000 - 0.32;
  const eaveY = dripY + eaveProjection * 0.4 - 0.04;
  const heights = songZhe(structuralRun * 1_000, (ridgeY - eaveY) * 1_000, steps);
  const heightAt = (t: number) => gableRoofHeightAt(t, z, eaveProjection, dripY, heights);
  const apexY = baseY + source.roof[2] / 1_000 - Math.max(0.6, Math.min(1.2, width / 10_000));
  return corners.flatMap((corner, index) => {
    const ridge: Vec3 =
      source.roof[0] === ROOF_STYLE.Cuanjian
        ? [0, apexY, 0]
        : [Math.sign(corner[0]) * r, ridgeY, 0];
    const deform = createWorldCornerDeformer({
      liftMm,
      outsetMm,
      eaveLine: [inset[index]!, inset[index]!],
      corners: [corner, corner],
      hipPointAt: () => inset[index]!,
    });
    return stations.map((t) => {
      const horizontalT =
        source.roof[0] === ROOF_STYLE.Xieshan ? Math.min(1, t / XIESHAN_HIP_END_T) : t;
      const linear = mixPoint(inset[index]!, ridge, t);
      const mixed: Vec3 = [
        source.roof[0] === ROOF_STYLE.Xieshan
          ? inset[index]![0] + (ridge[0] - inset[index]![0]) * horizontalT
          : linear[0],
        source.roof[0] === ROOF_STYLE.Cuanjian ? dripY + (apexY - dripY) * t : heightAt(t),
        linear[2],
      ];
      return { point: transformPoint(deform({ u: 0, t, point: mixed }), { yaw }), t };
    });
  });
}

describe('wing-corner deformation', () => {
  it('routes all three kit size tiers through formal roof dispatch', () => {
    const cases = [
      ['vernacular', 'roof_b_vernacular', 'residence', 180, 120],
      ['middle', 'roof_b_middle', 'inn', 300, 220],
      ['hall', 'roof_b_hall', 'temple', 480, 360],
    ] as const;
    const kit: BuildKitView = {
      ...MINI_BUILD_KIT,
      archetypes: {
        ...MINI_BUILD_KIT.archetypes,
        ...Object.fromEntries(
          cases.map(([size, archetype]) => [archetype, { recipe: 'hall', size }]),
        ),
      },
    };
    for (const [, archetype, facility, liftMm, outsetMm] of cases) {
      const source = {
        ...plan(ROOF_STYLE.Wudian, 10_000, 8_000, archetype),
        facility,
      } as BuildingPlanView;
      const measured = measuredDispatchedWing(source, kit);
      expect(measured[0], archetype).toBeCloseTo(liftMm, 0);
      expect(measured[1], archetype).toBeCloseTo(outsetMm, 0);
    }
  });

  it('matches every kit lift/outset at the corner and is zero from t = 0.35', () => {
    for (const [liftMm, outsetMm] of [
      [180, 120],
      [300, 220],
      [480, 360],
    ] as const) {
      const nominal = [4.96, 4, 3.96] as const;
      const inset = insetWingCorner(nominal, outsetMm);
      const deform = createWorldCornerDeformer({
        liftMm,
        outsetMm,
        eaveLine: [inset, [-inset[0], 4, inset[2]]],
        corners: [nominal, [-nominal[0], 4, nominal[2]]],
      });
      const corner = deform({ u: 0, t: 0, point: inset });
      expect((corner[1] - inset[1]) * 1_000).toBeCloseTo(liftMm, 8);
      expect(Math.hypot(corner[0] - inset[0], corner[2] - inset[2]) * 1_000).toBeCloseTo(
        outsetMm,
        8,
      );
      expect(
        Math.hypot(corner[0] - nominal[0], corner[2] - nominal[2]) * 1_000,
      ).toBeLessThanOrEqual(5);
      expect(corner[0] - inset[0]).toBeCloseTo(corner[2] - inset[2], 8);
      expect(deform({ u: 0, t: 0.35, point: inset })).toEqual(inset);
    }
    expect(wingUWeight(0)).toBe(1);
    expect(wingUWeight(0.5)).toBe(0);
    expect(wingTWeight(0.349)).toBeGreaterThan(0);
    expect(wingTWeight(0.35)).toBe(0);
  });
  it('derives the end weight from world edge and hip positions instead of caller-local u', () => {
    const eave: readonly [Vec3, Vec3] = [
      [-4, 4, 3],
      [4, 4, 3],
    ];
    const hips: readonly [Vec3, Vec3] = [
      [-1, 7, 0],
      [1, 7, 0],
    ];
    const deform = createWorldCornerDeformer({
      liftMm: 300,
      outsetMm: 220,
      eaveLine: eave,
      corners: eave,
      hipPointAt: (end, t) => pointOnLine(eave[end], hips[end], t),
    });
    const t = 0.2;
    const shared = pointOnLine(eave[0], hips[0], t);
    expect(deform({ u: 1, t, point: shared })).toEqual(deform({ u: 0, t, point: shared }));
  });
});

describe('hip, xieshan and cuanjian topology', () => {
  it('joins the 0.40 eave tail to the structural profile after the 40 mm fly-rafter lift', () => {
    const source = plan(ROOF_STYLE.Wudian, 12_000, 10_000, 'temple_hall');
    const dripY = (source.elev[0] + source.elev[1] + source.roof[1]) / 1_000;
    for (const style of [ROOF_STYLE.Wudian, ROOF_STYLE.Xieshan]) {
      const mesh = dispatched({ ...source, roof: [style, source.roof[1], source.roof[2]] });
      const insetAtCentre = (MINI_BUILD_KIT.dims.hall.lift[1] / 1_000) * Math.SQRT1_2;
      const halfDepth = source.footprint[3] / 2_000 - 0.04 - insetAtCentre;
      const tail = MINI_BUILD_KIT.dims.hall.eave / 1_000 / (halfDepth + insetAtCentre);
      const joinZ = halfDepth * (1 - tail);
      const joinHeights = vertices(mesh, 0)
        .filter(([x, , z]) => Math.abs(x) <= 0.001 && Math.abs(Math.abs(z) - joinZ) <= 0.001)
        .map(([, y]) => y);
      expect(joinHeights.length).toBeGreaterThan(0);
      expect(Math.min(...joinHeights)).toBeCloseTo(
        dripY + (0.4 * MINI_BUILD_KIT.dims.hall.eave - 40) / 1_000,
        3,
      );
    }
  });

  it('uses exact W-D ridges and keeps each xieshan gable in one vertical plane', () => {
    expect(hipRidgeHalfM(8, 8, 'song_zhe') * 2).toBe(0);
    expect(hipRidgeHalfM(10, 8, 'song_zhe') * 2).toBeCloseTo(2, 8);
    expect(hipRidgeHalfM(10, 8, 'qing_jujia') * 2).toBeCloseTo(2.8, 8);
    const mesh = dispatched(plan(ROOF_STYLE.Xieshan));
    const gable = vertices(mesh, 6);
    expect(gable.length).toBeGreaterThan(0);
    expect(new Set(gable.map(([x]) => Math.round(Math.abs(x) * 1_000)))).toHaveLength(1);
    const source = productionPlan('palace_hall');
    const layout = columnLayout(source, PRODUCTION_RIDGE_KIT);
    const expectedLength = layout.xM.at(-1)! - layout.xM[0]! - (layout.zM.at(-1)! - layout.zM[0]!);
    const wudian = finish((target) =>
      roofMesherFor(ROOF_STYLE.Wudian)(source, 0, target, { kit: PRODUCTION_RIDGE_KIT }),
    );
    const ridgeVertices = vertices(wudian, 1).filter(
      ([, y, z]) => Math.abs(z) <= 0.2 && y >= source.roof[2] / 1_000 - 0.55,
    );
    const centres = [-1, 1].map((sign) => {
      const end = source.footprint[0] / 1_000 + sign * (expectedLength / 2);
      const cap = ridgeVertices.filter(([x]) => Math.abs(x - end) <= 0.001);
      expect(cap.length).toBeGreaterThan(1);
      return cap.reduce((sum, [x]) => sum + x, 0) / cap.length;
    });
    expect(centres[1]! - centres[0]!).toBeCloseTo(expectedLength, 5);
  });

  it('keeps every shared hip seam within 1 mm for four footprints and three lifts', () => {
    const footprints = [
      [6_000, 5_000],
      [8_000, 8_000],
      [10_000, 8_000],
      [12_000, 10_000],
    ] as const;
    const random = seededRandom(0x1140_0003);
    let maximum = 0;
    let ridgeMaximum = 0;
    for (const [width, depth] of footprints)
      for (const [liftMm, outsetMm] of [
        [180, 120],
        [300, 220],
        [480, 360],
      ] as const) {
        for (const style of [ROOF_STYLE.Wudian, ROOF_STYLE.Xieshan, ROOF_STYLE.Cuanjian]) {
          const source = plan(
            style,
            width,
            depth,
            style === ROOF_STYLE.Cuanjian ? 'bld_lm_pagoda' : 'temple_hall',
          );
          const yaw = Math.floor(random() * 4) as BuildingPlanView['yaw'];
          const lod = (random() < 0.5 ? 0 : 1) as 0 | 1;
          const rotated = { ...source, yaw };
          const mesh = finish((target) => {
            const common = { plan: rotated, unit: 19, sink: target, liftMm, outsetMm, lod };
            if (style === ROOF_STYLE.Wudian) writeWudianRoof({ ...common, ridgeHeightMm: 320 });
            else if (style === ROOF_STYLE.Xieshan)
              writeXieshanRoof({ ...common, ridgeHeightMm: 320 });
            else writePyramidRoof(common);
          });
          for (const expected of expectedHipSeams(rotated, liftMm, outsetMm, yaw, lod)) {
            const gaps = tileComponentGaps(mesh, expected.point, style === ROOF_STYLE.Cuanjian);
            expect(
              gaps.filter((gap) => gap <= 0.001).length,
              `two-slope-seam:${style}:${width}x${depth}:${liftMm}/${outsetMm}:t=${expected.t}`,
            ).toBeGreaterThanOrEqual(2);
            maximum = Math.max(maximum, gaps[0]!, gaps[1]!);
            if (expected.t >= 0.05)
              ridgeMaximum = Math.max(ridgeMaximum, ridgeCenterGap(mesh, expected.point));
          }
        }
      }
    expect(maximum).toBeLessThanOrEqual(0.001);
    expect(ridgeMaximum).toBeLessThanOrEqual(0.001);
  });

  it('stitches xieshan tile, boarding, gable, bargeboard and boji at t = 0.45', () => {
    const source = plan(ROOF_STYLE.Xieshan);
    const liftMm = 480;
    const outsetMm = 360;
    const mesh = finish((target) =>
      writeXieshanRoof({
        plan: source,
        unit: 3,
        sink: target,
        liftMm,
        outsetMm,
        ridgeHeightMm: 320,
      }),
    );
    const stations = expectedHipSeams(source, liftMm, outsetMm, 0, 0).filter(
      ({ t }) => t === XIESHAN_HIP_END_T,
    );
    expect(stations).toHaveLength(4);
    for (const { point } of stations) {
      expect(
        vertices(mesh, 0).filter((candidate) => distance(candidate, point) <= 0.001).length,
      ).toBeGreaterThanOrEqual(2);
      const underside: Vec3 = [point[0], point[1] - 0.18, point[2]];
      expect(
        vertices(mesh, 2).filter((candidate) => distance(candidate, underside) <= 0.001).length,
      ).toBeGreaterThanOrEqual(2);
      expect(
        vertices(mesh, 6).filter((candidate) => distance(candidate, underside) <= 0.001).length,
      ).toBeGreaterThanOrEqual(2);
      expect(ridgeCenterGap(mesh, point)).toBeLessThanOrEqual(0.001);
    }
  });

  it('has one shared cuanjian tile apex and mirrors wudian/xieshan front-to-back', () => {
    const pyramidMesh = dispatched(plan(ROOF_STYLE.Cuanjian, 8_000, 8_000, 'bld_lm_pagoda'));
    const apexY = 7.3;
    expect(vertices(pyramidMesh, 0).filter(([, y]) => Math.abs(y - apexY) < 0.001)).toHaveLength(1);
    for (const style of [ROOF_STYLE.Wudian, ROOF_STYLE.Xieshan]) {
      const mesh = dispatched(plan(style));
      const layers = new Set(
        Array.from(mesh.mat).filter((_, index) => index % 4 === 0 && mesh.mat[index] !== 0),
      );
      expect(
        Object.fromEntries(
          [...layers].map((layer) => [
            layer,
            sortedPositionHash(mesh, true, layer) === sortedPositionHash(mesh, false, layer),
          ]),
        ),
        `layer mirror:${style}`,
      ).toEqual(Object.fromEntries([...layers].map((layer) => [layer, true])));
      expect(sortedPositionHash(mesh, true), `complete mirror:${style}`).toBe(
        sortedPositionHash(mesh, false),
      );
    }
  });

  it('closes every wudian eave with a 120 mm fascia', () => {
    const source = plan(ROOF_STYLE.Wudian);
    const mesh = dispatched(source);
    const base = (source.elev[0] + source.elev[1]) / 1_000;
    const drip = base + source.roof[1] / 1_000;
    const fasciaBottom = drip - 0.12;
    expect(
      vertices(mesh, 2).filter(([, y]) => Math.abs(y - fasciaBottom) <= 0.001).length,
    ).toBeGreaterThanOrEqual(8);
  });

  it('dispatches 4/6/8 slopes from the recipe and removes wing lift at t = 0.35', () => {
    for (const [archetype, recipe, expected] of [
      ['pavilion', 'hall', 4],
      ['pavilion_hex', 'hall', 6],
      ['bld_lm_ch01_chongshengsi_pagoda_small', 'pagoda_oct', 8],
    ] as const) {
      const source = plan(ROOF_STYLE.Cuanjian, 8_000, 8_000, archetype);
      const kit = {
        ...MINI_BUILD_KIT,
        archetypes: { ...MINI_BUILD_KIT.archetypes, [archetype]: { recipe } },
        landmarks: { ...MINI_BUILD_KIT.landmarks, [archetype]: { recipe } },
      };
      const mesh = finish((target) =>
        roofMesherFor(ROOF_STYLE.Cuanjian)(source, 7, target, { kit, lod: 0 }),
      );
      expect(tileFaceBoundaries(mesh, 0)).toHaveLength(expected);
    }
    const source = plan(ROOF_STYLE.Cuanjian, 8_000, 8_000, 'pavilion');
    const mesh = finish((target) =>
      writePyramidRoof({ plan: source, unit: 7, sink: target, liftMm: 480, outsetMm: 360 }),
    );
    const inset = -3.96 + 0.36 / Math.SQRT2;
    const expected: Vec3 = [inset * 0.65, 4.9 + (7.3 - 4.9) * 0.35, inset * 0.65];
    expect(
      vertices(mesh, 0).some(
        (point) =>
          Math.hypot(point[0] - expected[0], point[1] - expected[1], point[2] - expected[2]) <=
          0.001,
      ),
    ).toBe(true);
  });

  it('keeps the one-metre baseline and three local stations per pyramid corner at both LODs', () => {
    for (const sides of [4, 6, 8] as const)
      for (const lod of [0, 1] as const) {
        const source = plan(ROOF_STYLE.Cuanjian, 8_000, 8_000, `pyramid_${sides}`);
        const mesh = finish((target) =>
          writePyramidRoof({
            plan: source,
            unit: 7,
            sink: target,
            liftMm: 0,
            outsetMm: 0,
            sides,
            lod,
          }),
        );
        const faces = pyramidFaceUStations(mesh);
        expect(faces, `${sides}-side LOD${lod}`).toHaveLength(sides);
        for (const face of faces) {
          const expected = cornerUStations(
            face.eaveLengthMm,
            Math.min(face.eaveLengthMm / 2, Math.max(1, face.eaveLengthMm / 3)),
            3,
          );
          expect(face.u, `${sides}-side LOD${lod}: ${face.eaveLengthMm} mm`).toHaveLength(
            expected.length,
          );
          expected.forEach((station, index) =>
            expect(face.u[index], `${sides}-side LOD${lod} station ${index}`).toBeCloseTo(
              station,
              6,
            ),
          );
          expect(face.u.length).toBeGreaterThanOrEqual(Math.ceil(face.eaveLengthMm / 1_000) + 1);
        }
      }
  });
});

describe('rolled and dome roofs', () => {
  it('keeps the 350 mm rolled crown C1-continuous within a 12 degree normal angle', () => {
    const halfDepth = 3.96;
    const crown = 7.2;
    const drip = 4.9;
    const join = ROLLED_RIDGE_RADIUS_M / Math.SQRT2;
    const sampleSlope = (z: number, epsilon = 0.0001) =>
      (rolledRoofHeightAt(z + epsilon, halfDepth, drip, crown) -
        rolledRoofHeightAt(z - epsilon, halfDepth, drip, crown)) /
      (epsilon * 2);
    const leftSlope = sampleSlope(join - 0.0002);
    const rightSlope = sampleSlope(join + 0.0002);
    const angle = (Math.abs(Math.atan(leftSlope) - Math.atan(rightSlope)) * 180) / Math.PI;
    expect(angle).toBeLessThanOrEqual(12);
    expect(rolledRoofHeightAt(0, halfDepth, drip, crown)).toBeCloseTo(crown, 8);
    expect(rolledRoofHeightAt(halfDepth, halfDepth, drip, crown)).toBeCloseTo(drip, 8);
    const mesh = finish((target) =>
      writeRolledRoof({
        plan: plan(ROOF_STYLE.Juanpeng),
        unit: 0,
        sink: target,
      }),
    );
    expect(new Set(Array.from(mesh.mat.filter((_, index) => index % 4 === 0)))).toEqual(
      new Set([0, 2]),
    );
    const ridgeNormals: Array<readonly [number, Vec3]> = [];
    for (let offset = 0; offset < mesh.index.length; offset += 3) {
      const ids = [mesh.index[offset]!, mesh.index[offset + 1]!, mesh.index[offset + 2]!];
      if (ids.some((id) => mesh.mat[id * 4] !== 0)) continue;
      const points = ids.map(
        (id) =>
          [mesh.position[id * 3]!, mesh.position[id * 3 + 1]!, mesh.position[id * 3 + 2]!] as Vec3,
      );
      if (!points.some((point) => Math.abs(point[2]) < 1e-6)) continue;
      const u = points[1]!.map((value, axis) => value - points[0]![axis]!) as unknown as Vec3;
      const v = points[2]!.map((value, axis) => value - points[0]![axis]!) as unknown as Vec3;
      let normal: Vec3 = [
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0],
      ];
      const length = Math.hypot(...normal);
      normal = normal.map((value) => value / length) as unknown as Vec3;
      if (normal[1] < 0) normal = normal.map((value) => -value) as unknown as Vec3;
      ridgeNormals.push([points.reduce((sum, point) => sum + point[2], 0) / 3, normal]);
    }
    const front = ridgeNormals.find(([z]) => z > 0)![1];
    const back = ridgeNormals.find(([z]) => z < 0)![1];
    const dot = front.reduce((sum, value, axis) => sum + value * back[axis]!, 0);
    expect((Math.acos(Math.max(-1, Math.min(1, dot))) * 180) / Math.PI).toBeLessThanOrEqual(12);
  });

  it('uses 12x6 / 8x4 dome tessellation and leaves variants to the planner', () => {
    const source = plan(ROOF_STYLE.Dome, 8_000, 8_000);
    const lod0 = finish((target) => writeDomeRoof({ plan: source, unit: 0, sink: target, lod: 0 }));
    const lod1 = finish((target) => writeDomeRoof({ plan: source, unit: 0, sink: target, lod: 1 }));
    expect(lod0.index.length / 3).toBe(2 * 12 * (2 * 6));
    expect(lod1.index.length / 3).toBe(2 * 8 * (2 * 4));
    expect(openPositionEdges(lod0)).toBe(0);
    expect(openPositionEdges(lod1)).toBe(0);
    const target = sink();
    expect(() =>
      roofMesherFor(ROOF_STYLE.Dome)(source, 0, target, {
        kit: {
          ...MINI_BUILD_KIT,
          variantSets: { tang_buddhist: { forbid: ['dome', 'pointed_arch'] } },
        },
      }),
    ).not.toThrow();
    expect((target.roof as MeshBufferBuilder).finish().index.length).toBeGreaterThan(0);
  });
});

describe('finished hall and middle profiles (tech/16 §3 goldens)', () => {
  // 12 x 10 temple hall with brackets: eave purlin 5100 above the platform, ridge 8483,
  // hall ridge body 650, so the ridge foot is 7833 and the Song purlins sit 2733/1549/638/0
  // above the eave purlin.
  const TEMPLE_PURLINS_MM = [0, 638, 1549, 2733] as const;
  for (const style of [ROOF_STYLE.Xieshan, ROOF_STYLE.Wudian] as const)
    for (const lod of [0, 1] as const)
      it(`${style === ROOF_STYLE.Xieshan ? 'xieshan' : 'wudian'} temple LOD${lod}: ridge foot −650 mm and 2733/1549/638/0 purlins`, () => {
        const source = {
          ...productionPlan('temple_hall'),
          footprint: [0, 0, 12_000, 10_000] as const,
          yaw: 0 as const,
          roof: [style, 4_575, 8_483] as const,
        };
        const mesh = finish((target) =>
          roofMesherFor(style)(source, 1, target, { kit: PRODUCTION_RIDGE_KIT, lod }),
        );
        const base = (source.elev[0] + source.elev[1]) / 1_000;
        const tile = vertices(mesh, 0);
        expect(Math.max(...tile.map(([, y]) => y))).toBeCloseTo(base + 7.833, 3);
        const hall = PRODUCTION_RIDGE_KIT.dims.hall;
        const halfDepth = source.footprint[3] / 2_000 - 0.04;
        const tail = (hall.eave - 450) / 1_000 / halfDepth;
        const eaveAtCentre = halfDepth - (hall.lift[1] / 1_000) * Math.SQRT1_2;
        for (const [index, heightMm] of TEMPLE_PURLINS_MM.entries()) {
          const t = tail + (1 - tail) * (index / 3);
          const z = eaveAtCentre * (1 - t);
          const heights = tile
            .filter(([x, , pz]) => Math.abs(x) <= 0.001 && Math.abs(pz - z) <= 0.002)
            .map(([, y]) => y);
          expect(heights.length, `purlin ${index} at z=${z.toFixed(3)}`).toBeGreaterThan(0);
          expect(Math.max(...heights)).toBeCloseTo(base + (5_100 + heightMm) / 1_000, 3);
        }
        const ridgeYs = vertices(mesh, 1).map(([, y]) => y);
        expect(Math.abs(Math.max(...ridgeYs) - (base + 8.483))).toBeLessThanOrEqual(0.01);
        expect(Math.max(...vertices(mesh, 3).map(([, y]) => y))).toBeCloseTo(base + 8.483 + 1.1, 3);
      });

  for (const lod of [0, 1] as const)
    it(`two-storey middle inn LOD${lod}: 450 mm main-ridge body under the 8547 ridge`, () => {
      const inn = MINI_BUILDING_PLANS.find((candidate) => candidate.archetype === 'inn')!;
      const source = { ...inn, footprint: [0, 0, 10_000, 8_000] as const, yaw: 0 as const };
      expect(source.storeys).toBe(2);
      const mesh = finish((target) =>
        roofMesherFor(ROOF_STYLE.Xieshan)(source, 1, target, { kit: PRODUCTION_RIDGE_KIT, lod }),
      );
      const base = (source.elev[0] + source.elev[1]) / 1_000;
      expect(Math.max(...vertices(mesh, 0).map(([, y]) => y))).toBeCloseTo(base + 8.547 - 0.45, 3);
      expect(
        Math.abs(Math.max(...vertices(mesh, 1).map(([, y]) => y)) - (base + 8.547)),
      ).toBeLessThanOrEqual(0.01);
    });

  it('rejects chiwei heights outside the tech/16 900–1300 mm range', () => {
    const source = productionPlan('temple_hall');
    for (const ornamentHeightMm of [899, 1_301])
      expect(() =>
        finish((target) =>
          writeXieshanRoof({
            plan: source,
            unit: 1,
            sink: target,
            liftMm: 0,
            outsetMm: 0,
            ornamentHeightMm,
            ridgeEnds: 'chiwei',
          }),
        ),
      ).toThrow('BUILDGEN_ROOF_INVALID_CHIWEI_HEIGHT');
  });
});

describe('payload invariants and budgets', () => {
  it('stands production end ornaments on the main ridge: ridge foot, ridge top, ornament base/top', () => {
    for (const archetype of ['casino', 'temple_hall', 'palace_hall'] as const)
      for (const lod of [0, 1] as const) {
        const source = productionPlan(archetype);
        const cell = generateCells([source], PRODUCTION_RIDGE_KIT, lod, 16)[0]!;
        const base = (source.elev[0] + source.elev[1]) / 1_000;
        const ridgeTop = base + source.roof[2] / 1_000;
        const middle = archetype === 'casino';
        // Planner ridgeBodyMm: hall 650, two storeys 450, otherwise 350 (single-storey middle).
        const ridgeFoot = ridgeTop - (middle ? 0.35 : 0.65);
        const budget = middle ? [6_500, 3_000][lod]! : [9_000, 4_000][lod]!;
        const expectedOrnamentTriangles = middle ? 32 : [80, 24][lod]!;
        const tileYs = vertices(cell.roof, 0).map(([, y]) => y);
        const ridgeYs = vertices(cell.roof, 1).map(([, y]) => y);
        const ornamentYs = vertices(cell.roof, 3).map(([, y]) => y);
        expect(Math.max(...tileYs)).toBeCloseTo(ridgeFoot, 3);
        expect(Math.abs(Math.max(...ridgeYs) - ridgeTop)).toBeLessThanOrEqual(0.01);
        expect(Math.min(...ridgeYs.filter((y) => y > ridgeFoot - 0.001))).toBeCloseTo(ridgeFoot, 3);
        if (middle) {
          // Dali square ends: on the ridge top, 550 mm tall.
          expect(Math.min(...ornamentYs)).toBeCloseTo(ridgeTop, 3);
          expect(Math.max(...ornamentYs)).toBeCloseTo(ridgeTop + 0.55, 3);
        } else {
          // Hall chiwei: from the ridge foot at the ridge end to 1100 mm above the ridge top.
          expect(Math.min(...ornamentYs)).toBeCloseTo(ridgeFoot, 3);
          expect(Math.max(...ornamentYs)).toBeCloseTo(ridgeTop + 1.1, 3);
        }
        expect(Math.max(...ornamentYs)).toBeGreaterThan(Math.max(...ridgeYs) + 0.5);
        expect(trianglesOnLayer(cell.roof, 3)).toBe(expectedOrnamentTriangles);
        expect(effectiveTrianglesOnLayer(cell.roof, 3)).toBe(expectedOrnamentTriangles);
        expect(cell.shell.index.length / 3 + cell.roof.index.length / 3).toBeLessThanOrEqual(
          budget,
        );
        expect(new Set(Array.from(cell.roof.unit).filter((_, index) => index % 2 === 0))).toEqual(
          new Set([0]),
        );
        expect(
          Array.from(cell.roof.unit)
            .filter((_, index) => index % 2 === 1)
            .every((h) => h > 0),
        ).toBe(true);
      }
  });

  it('keeps lift, ornaments and local height on the generateCells hall chain', () => {
    const source = MINI_BUILDING_PLANS[4]!;
    const cell = generateCells([MINI_BUILDING_PLANS[0]!, source], MINI_BUILD_KIT, 0, 16).find(
      (candidate) => candidate.roof.unit.some((value, index) => index % 2 === 0 && value === 1),
    )!;
    const unitOne = Array.from(
      { length: cell.roof.position.length / 3 },
      (_, vertex) => vertex,
    ).filter((vertex) => cell.roof.unit[vertex * 2] === 1);
    expect(unitOne.length).toBeGreaterThan(0);
    expect(unitOne.every((vertex) => cell.roof.unit[vertex * 2 + 1]! > 0)).toBe(true);
    expect(unitOne.some((vertex) => cell.roof.mat[vertex * 4] === 3)).toBe(true);
    const cornerY = unitOne
      .filter((vertex) => cell.roof.mat[vertex * 4] === 0)
      .filter((vertex) => Math.abs(Math.abs(cell.roof.position[vertex * 3]! - 39) - 5.96) < 0.001)
      .filter((vertex) => Math.abs(Math.abs(cell.roof.position[vertex * 3 + 2]!) - 4.96) < 0.001)
      .map((vertex) => cell.roof.position[vertex * 3 + 1]!);
    expect(cornerY).toContainEqual(expect.closeTo(5.955, 3));
  });

  it('keeps plan heights, INV-1, unit id, stable hash and building roof budgets', () => {
    const cases = [
      [plan(ROOF_STYLE.Wudian), 9_000],
      [plan(ROOF_STYLE.Xieshan), 9_000],
      [plan(ROOF_STYLE.Cuanjian, 8_000, 8_000, 'bld_lm_pagoda'), 4_000],
      [plan(ROOF_STYLE.Juanpeng), 9_000],
      [plan(ROOF_STYLE.Dome, 8_000, 8_000), 5_000],
    ] as const;
    for (const [source, lod0Budget] of cases) {
      const lod0 = dispatched(source, 0);
      const lod1 = dispatched(source, 1);
      const base = (source.elev[0] + source.elev[1]) / 1_000;
      const ys = vertices(lod0).map(([, y]) => y);
      expect(ys.some((y) => Math.abs(y - (base + source.roof[1] / 1_000)) <= 0.01)).toBe(true);
      // roof[2] is the ridge top without end ornaments (they stand above it); a cuanjian's
      // finial is its top, so there the whole roof reaches roof[2].
      const capped =
        source.roof[0] === ROOF_STYLE.Cuanjian
          ? vertices(lod0)
          : vertices(lod0).filter((_, vertex) => lod0.mat[vertex * 4] !== 3);
      expect(Math.max(...capped.map(([, y]) => y))).toBeCloseTo(base + source.roof[2] / 1_000, 2);
      expect(inspectInv1(lod0, [source, source])).toEqual([]);
      expect(Array.from(lod0.unit.filter((_, index) => index % 2 === 0))).toEqual(
        new Array(lod0.position.length / 3).fill(1),
      );
      expect(Array.from(lod0.unit.filter((_, index) => index % 2 === 1)).every((h) => h > 0)).toBe(
        true,
      );
      expect(hashMesh(lod0)).toBe(hashMesh(dispatched(source, 0)));
      expect(lod0.index.length / 3).toBeLessThanOrEqual(lod0Budget);
      expect(lod1.index.length / 3).toBeLessThanOrEqual(Math.ceil(lod0Budget * 0.5));
    }
  });
});
