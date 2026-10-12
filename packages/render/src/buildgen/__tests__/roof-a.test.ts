import { describe, expect, it } from 'vitest';
import { MeshBufferBuilder } from '../mesher/core/buffer';
import { hashMesh } from '../mesher/core/hash';
import { inspectInv1 } from '../mesher/core/inspect';
import { roofMesherFor } from '../mesher/roof';
import { gableRoofHeightAt, writeXuanshanRoof, writeYingshanRoof } from '../mesher/roof/gable';
import {
  dripHeightMm,
  profileHeightAt,
  qingJujia,
  roofProfileHeightAt,
  songZhe,
  songZheAt,
} from '../mesher/roof/profile';
import {
  cornerUStations,
  roofPatchTSegments,
  roofPatchTStations,
  sampleRoofPatch,
  writeRoofPatch,
} from '../mesher/roof/patch';
import { writeRidge } from '../mesher/roof/ridge';
import { writeRoofShell } from '../mesher/roof/shell';
import { MINI_BUILDING_PLANS, MINI_BUILD_KIT } from '../testing/mini-plans';
import { ROOF_STYLE, type BuildingPlanView, type RecipeSink } from '../types';

function emptySink(roof = new MeshBufferBuilder()): RecipeSink {
  return {
    roof,
    shell: new MeshBufferBuilder(),
    doors: [],
    signs: [],
    hangingProps: [],
    partUnits: [],
  };
}
function meshRoof(plan: BuildingPlanView, unit = 0, lod: 0 | 1 = 0) {
  const sink = emptySink();
  roofMesherFor(plan.roof[0])(plan, unit, sink, { kit: MINI_BUILD_KIT, lod });
  return (sink.roof as MeshBufferBuilder).finish();
}
function triangleCount(plan: BuildingPlanView, lod: 0 | 1): number {
  return meshRoof(plan, 0, lod).index.length / 3;
}
function yValues(mesh: ReturnType<typeof meshRoof>): number[] {
  const values: number[] = [];
  for (let index = 1; index < mesh.position.length; index += 3) values.push(mesh.position[index]!);
  return values;
}
function layers(mesh: ReturnType<typeof meshRoof>): number[] {
  return Array.from(mesh.mat.filter((_, index) => index % 4 === 0));
}
function mulberry32(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}
function randomInt(random: () => number, minimum: number, maximum: number): number {
  return minimum + Math.floor(random() * (maximum - minimum + 1));
}
function localXBounds(
  mesh: ReturnType<typeof meshRoof>,
  centreX: number,
): readonly [number, number] {
  const xs = Array.from(
    mesh.position.filter((_, index) => index % 3 === 0),
    (x) => x - centreX,
  );
  return [Math.min(...xs), Math.max(...xs)];
}
function verticesOnLine(
  mesh: ReturnType<typeof meshRoof>,
  axis: 0 | 2,
  coordinate: number,
  height: number,
  layer: number,
): number {
  let count = 0;
  for (let vertex = 0; vertex < mesh.position.length / 3; vertex += 1) {
    if (mesh.mat[vertex * 4] !== layer) continue;
    if (Math.abs(mesh.position[vertex * 3 + axis]! - coordinate) > 0.000_001) continue;
    if (Math.abs(mesh.position[vertex * 3 + 1]! - height) > 0.000_001) continue;
    count += 1;
  }
  return count;
}

describe('roof profiles', () => {
  it('matches the tech/16 §3 Dali shop Song fold and drip/ridge goldens within 1 mm', () => {
    const profile = songZhe(3_300, 866, 2);
    expect(profile[1]).toBeCloseTo(346.4, 8);
    expect(profileHeightAt(profile, 0.5)).toBeCloseTo(346.4, 8);
    expect(dripHeightMm(3_350, 800)).toBe(3_070);
    const shop = MINI_BUILDING_PLANS[0]!;
    expect(shop.roof[1]).toBe(3_070);
    expect(shop.roof[2]).toBe(4_566);
  });

  it('matches the tech/16 §3 temple purlin and slope goldens within 1 mm', () => {
    const run = 4_100;
    const heights = songZhe(run, 2_733, 3);
    expect(heights[0]).toBeCloseTo(2_733, 0);
    expect(heights[1]).toBeCloseTo(1_549, 0);
    expect(heights[2]).toBeCloseTo(638, 0);
    expect(heights[3]).toBe(0);
    const eaveToRidge = [...heights].reverse();
    const slopes = eaveToRidge
      .slice(1)
      .map((height, index) => (height - eaveToRidge[index]!) / (run / 3));
    expect(Math.abs(slopes[0]! - 0.467)).toBeLessThanOrEqual(0.001);
    expect(Math.abs(slopes[1]! - 0.667)).toBeLessThanOrEqual(0.001);
    expect(Math.abs(slopes[2]! - 0.866)).toBeLessThanOrEqual(0.001);

    const uneven = songZheAt([0, 1_000, 3_000], 900);
    expect(roofProfileHeightAt(uneven, 2 / 3)).toBeCloseTo(510, 8);
  });

  it('accumulates Qing jujia from eave to ridge and returns ridge to eave', () => {
    expect(qingJujia([1_000, 1_000, 1_000, 1_000], [0.5, 0.65, 0.75, 0.9])).toEqual([
      2_800, 1_900, 1_150, 500, 0,
    ]);
  });

  it('calculates the four tech/16 §3 drip and ridge goldens through the roof profile', () => {
    const cases = [
      [3_350, 800, 3_300, 866, 2, 350, 3_070, 4_566],
      [3_150, 700, 3_500, 918.75, 2, 350.25, 2_910, 4_419],
      [6_450, 900, 6_200, 1_674, 3, 423, 6_130, 8_547],
      [5_100, 1_412.5, 4_100, 2_733, 3, 650, 4_575, 8_483],
    ] as const;
    for (const [bearer, projection, run, rise, steps, ridge, drip, top] of cases) {
      const profile = songZhe(run, rise, steps);
      expect(dripHeightMm(bearer, projection)).toBeCloseTo(drip, 8);
      expect(bearer + profile[0]! + ridge).toBeCloseTo(top, 8);
    }
  });

  it('has strictly increasing slopes from eave toward ridge', () => {
    for (const [run, rise, steps] of [
      [3_300, 866, 2],
      [5_000, 3_383, 4],
    ] as const) {
      const ridgeToEave = songZhe(run, rise, steps);
      const eaveToRidge = [...ridgeToEave].reverse();
      const slopes = eaveToRidge
        .slice(1)
        .map((height, index) => (height - eaveToRidge[index]!) / (run / steps));
      expect(slopes.every((slope, index) => index === 0 || slope > slopes[index - 1]!)).toBe(true);
    }
  });

  it('keeps random legal eave tails continuous and monotone with fixed-seed mulberry32', () => {
    const random = mulberry32(0x524f4f46);
    for (let trial = 0; trial < 40; trial += 1) {
      const steps = randomInt(random, 2, 4);
      const projectionM = randomInt(random, 700, 1_400) / 1000;
      const runMm = randomInt(random, steps * 1_100, steps * 1_500);
      const riseMm = randomInt(random, Math.ceil(runMm * 0.28), Math.floor(runMm * 0.5));
      const halfDepthM = projectionM + runMm / 1000;
      const profile = songZhe(runMm, riseMm, steps);
      const join = projectionM / halfDepthM;
      const height = (t: number) => gableRoofHeightAt(t, halfDepthM, projectionM, 3, profile);
      expect(Math.abs(height(join - 0.000_001) - height(join + 0.000_001))).toBeLessThan(0.001);
      const segments = randomInt(random, 8, 32);
      const samples = Array.from({ length: segments + 1 }, (_, index) => height(index / segments));
      expect(samples.every((value, index) => index === 0 || value > samples[index - 1]!)).toBe(
        true,
      );
    }
  });
});

describe('parameterized roof patch', () => {
  const options = {
    eaveLine: [
      [-3, 3, 2.5],
      [3, 3, 2.5],
    ],
    ridgeLine: [
      [-3, 4.5, 0],
      [3, 4.5, 0],
    ],
    heightAt: (t: number) => 3 + t * t * 1.5,
    tSegments: 6,
  } as const;

  it('uses ceil(length / 1m) u segments and caller-specified t refinement', () => {
    const patch = sampleRoofPatch(options);
    expect(patch.columns).toBe(7);
    expect(patch.rows).toBe(7);
    expect(patch.points).toHaveLength(49);
  });

  it('never lets a caller reduce the one-metre u baseline', () => {
    const patch = sampleRoofPatch({ ...options, uSegments: 2 });
    expect(patch.columns - 1).toBe(Math.ceil(6));
    expect(patch.uStations).toEqual([0, 1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6, 1]);
  });

  it('builds explicit wing-corner stations at both ends while preserving shared edges', () => {
    const stations = cornerUStations(6_000, 1_800, 3);
    expect(stations[0]).toBe(0);
    expect(stations.at(-1)).toBe(1);
    expect(stations.filter((u) => u > 0 && u < 0.3)).toHaveLength(4);
    expect(stations.filter((u) => u > 0.7 && u < 1)).toHaveLength(4);
    expect(
      stations.every(
        (u, index) =>
          index === 0 || (u > stations[index - 1]! && (u - stations[index - 1]!) * 6 <= 1),
      ),
    ).toBe(true);
    const a = sampleRoofPatch({ ...options, uStations: stations });
    const b = sampleRoofPatch({
      ...options,
      eaveLine: [options.eaveLine[1], [9, 3, 2.5]],
      ridgeLine: [options.ridgeLine[1], [9, 4.5, 0]],
      uStations: stations,
    });
    for (let row = 0; row < a.rows; row += 1) {
      const left = a.points[row * a.columns + a.columns - 1]!;
      const right = b.points[row * b.columns]!;
      expect(
        Math.hypot(left[0] - right[0], left[1] - right[1], left[2] - right[2]),
      ).toBeLessThanOrEqual(0.001);
    }
  });

  it('rejects malformed or wider-than-one-metre explicit u stations', () => {
    expect(() => sampleRoofPatch({ ...options, uStations: [0, 0.5, 0.5, 1] })).toThrow(
      'BUILDGEN_ROOF_INVALID_U_STATIONS',
    );
    expect(() => sampleRoofPatch({ ...options, uStations: [0, 0.2, 1] })).toThrow(
      'BUILDGEN_ROOF_U_STATION_GAP',
    );
  });

  it('reserves two t segments per fold step plus two eave-tail segments at LOD0 and one each at LOD1', () => {
    // Coordinator ruling 10-11: LOD1 thins t (eave → ridge) only; u stays >= ceil(eave / 1 m).
    expect(roofPatchTSegments(4, 0)).toBe(10);
    expect(roofPatchTSegments(4, 1)).toBe(5);
    expect(roofPatchTStations(2, 0.25)).toEqual([0, 0.125, 0.25, 0.4375, 0.625, 0.8125, 1]);
    expect(roofPatchTStations(2, 0.25, 1)).toEqual([0, 0.25, 0.625, 1]);
  });

  it('places rows at the eave join and every structural purlin', () => {
    const tStations = roofPatchTStations(3, 0.2);
    const patch = sampleRoofPatch({ ...options, tSegments: 8, tStations });
    expect(patch.tStations).toEqual(tStations);
    expect(patch.tStations.filter((_, index) => index % 2 === 0)).toEqual([
      0, 0.2, 0.4666666666666667, 0.7333333333333334, 1,
    ]);
  });

  it('keeps adjacent patches on a shared edge within 1 mm', () => {
    const a = sampleRoofPatch(options);
    const b = sampleRoofPatch({
      ...options,
      eaveLine: [options.eaveLine[1], [9, 3, 2.5]],
      ridgeLine: [options.ridgeLine[1], [9, 4.5, 0]],
    });
    for (let row = 0; row < a.rows; row += 1) {
      const left = a.points[row * a.columns + a.columns - 1]!;
      const right = b.points[row * b.columns]!;
      expect(
        Math.hypot(left[0] - right[0], left[1] - right[1], left[2] - right[2]),
      ).toBeLessThanOrEqual(0.001);
    }
  });

  it('writes metre u and slope-arc v coordinates', () => {
    const writer = new MeshBufferBuilder();
    writeRoofPatch(writer, options);
    const mesh = writer.finish();
    expect(mesh.uv[(options.tSegments + 1) * 2 - 2]).toBeCloseTo(6, 6);
    expect(Math.max(...mesh.uv.filter((_, index) => index % 2 === 1))).toBeGreaterThan(2.9);
  });
});

describe('roof shell and ridges', () => {
  it('adds lower boarding, 120 mm eave fascia, and 250 mm bargeboards', () => {
    const writer = new MeshBufferBuilder();
    writeRoofShell(writer, {
      eaveLine: [
        [-1, 3, 1],
        [1, 3, 1],
      ],
      ridgeLine: [
        [-1, 4, 0],
        [1, 4, 0],
      ],
      heightAt: (t) => 3 + t,
      uSegments: 2,
      tSegments: 2,
      thicknessMm: 180,
      closeVerges: true,
      bargeboardMm: 250,
    });
    const mesh = writer.finish();
    expect(Math.min(...yValues(mesh))).toBeCloseTo(2.57, 6);
    expect(mesh.index.length / 3).toBe(36);
  });

  it('extrudes main/vertical trapezoids and optional 550 mm Dali square ends', () => {
    const ordinary = new MeshBufferBuilder();
    writeRidge(ordinary, {
      path: [
        [-1, 4, 0],
        [1, 4, 0],
      ],
      kind: 'main',
    });
    expect(ordinary.finish().bounds[4]).toBeCloseTo(4.35, 6);
    const dali = new MeshBufferBuilder();
    writeRidge(dali, {
      path: [
        [-1, 4, 0],
        [1, 4, 0],
      ],
      kind: 'main',
      daliSquareEnd: true,
    });
    const daliMesh = dali.finish();
    expect(daliMesh.bounds[4]).toBeCloseTo(4.55, 6);
    expect(daliMesh.bounds[4]! - daliMesh.bounds[1]!).toBeCloseTo(0.55, 6);
    const vertical = new MeshBufferBuilder();
    writeRidge(vertical, {
      path: [
        [0, 3, 1],
        [0, 4, 0],
      ],
      kind: 'vertical',
      heightMm: 250,
    });
    expect(vertical.finish().position.length).toBeGreaterThan(0);
  });
});

describe('simple roof dispatch and payload', () => {
  const simple = MINI_BUILDING_PLANS.filter((plan) =>
    [ROOF_STYLE.Yingshan, ROOF_STYLE.Xuanshan, ROOF_STYLE.Flat, ROOF_STYLE.Canopy].includes(
      plan.roof[0] as never,
    ),
  );

  it('keeps drip and ridge-top heights on the plan goldens within 10 mm', () => {
    for (const plan of simple) {
      const mesh = meshRoof(plan);
      const ys = yValues(mesh);
      const base = (plan.elev[0] + plan.elev[1]) / 1000;
      expect(
        Math.min(...ys.filter((value) => value >= base + plan.roof[1] / 1000 - 0.01)),
      ).toBeCloseTo(base + plan.roof[1] / 1000, 2);
      const ridgeTop = base + plan.roof[2] / 1000;
      expect(ys.some((value) => Math.abs(value - ridgeTop) <= 0.01)).toBe(true);
    }
  });

  it('measures the shop structural rise, purlin and concave slopes from finished vertices', () => {
    const shop = simple.find((plan) => plan.roof[0] === ROOF_STYLE.Xuanshan)!;
    const mesh = meshRoof(shop);
    const columns = 7;
    const yAtRow = (row: number) => mesh.position[(row * columns + 3) * 3 + 1]!;
    const zAtRow = (row: number) => mesh.position[(row * columns + 3) * 3 + 2]!;
    const base = (shop.elev[0] + shop.elev[1]) / 1000;
    expect((yAtRow(6) - yAtRow(2)) * 1000).toBeCloseTo(866.25, 1);
    expect((yAtRow(4) - yAtRow(2)) * 1000).toBeCloseTo(346.5, 0);
    expect((yAtRow(0) - base) * 1000).toBeCloseTo(3_070, 0);
    expect(yValues(mesh).some((value) => Math.abs(value * 1000 - base * 1000 - 4_566) <= 1)).toBe(
      true,
    );
    const lowSlope = (yAtRow(4) - yAtRow(2)) / Math.abs(zAtRow(4) - zAtRow(2));
    const highSlope = (yAtRow(6) - yAtRow(4)) / Math.abs(zAtRow(6) - zAtRow(4));
    expect(lowSlope).toBeCloseTo(0.42, 2);
    expect(highSlope).toBeCloseTo(0.63, 2);
  });

  it('changes xuanshan verge and raises 550 mm Dali ornaments above the ridge baseline', () => {
    const shop = simple.find((plan) => plan.roof[0] === ROOF_STYLE.Xuanshan)!;
    const withVerge = (vergeMm: number) => {
      const sink = emptySink();
      writeXuanshanRoof({ plan: shop, unit: 9, sink, vergeMm, ridgeHeightMm: 320 });
      return (sink.roof as MeshBufferBuilder).finish();
    };
    const narrow = localXBounds(withVerge(400), shop.footprint[0] / 1000);
    const wide = localXBounds(withVerge(600), shop.footprint[0] / 1000);
    expect(wide[1] - narrow[1]).toBeCloseTo(0.2, 6);
    expect(narrow[0] - wide[0]).toBeCloseTo(0.2, 6);

    const dali = meshRoof(shop);
    const plainSink = emptySink();
    roofMesherFor(shop.roof[0])(shop, 0, plainSink, {
      kit: { ...MINI_BUILD_KIT, ridge: { ...MINI_BUILD_KIT.ridge, ends: 'plain' } },
    });
    const plain = (plainSink.roof as MeshBufferBuilder).finish();
    expect(hashMesh(dali)).not.toBe(hashMesh(plain));
    const ordinaryTop = (shop.elev[0] + shop.elev[1] + shop.roof[2]) / 1000;
    expect(Math.max(...yValues(plain))).toBeCloseTo(ordinaryTop, 2);
    const tileRidge = Math.max(...yValues(dali).filter((_, vertex) => dali.mat[vertex * 4] === 0));
    expect(Math.max(...yValues(dali)) - tileRidge).toBeCloseTo(0.55, 6);
  });

  it('sags the canopy centre by exactly 3% of its span and keeps the lower edge >=2250 mm', () => {
    const stall = simple.find((plan) => plan.roof[0] === ROOF_STYLE.Canopy)!;
    const mesh = meshRoof(stall);
    const base = (stall.elev[0] + stall.elev[1]) / 1000;
    const depth = stall.footprint[3] / 1000 - 0.08;
    const expectedCentre = base + (stall.roof[1] + stall.roof[2]) / 2000 - depth * 0.03;
    const columns = Math.ceil(stall.footprint[2] / 1000 - 0.08) + 1;
    const centreRow = Math.round(Math.max(4, Math.ceil(depth)) / 2);
    expect(mesh.position[centreRow * columns * 3 + 1]).toBeCloseTo(expectedCentre, 3);
    expect(Math.min(...yValues(mesh))).toBeGreaterThanOrEqual(stall.elev[0] / 1000 + 2.25);
  });

  it('assigns kit layers to tiles, ridge, soffit, barge/gable, coping and cloth', () => {
    const byStyle = new Map(simple.map((plan) => [plan.roof[0], new Set(layers(meshRoof(plan)))]));
    expect(byStyle.get(ROOF_STYLE.Xuanshan)).toEqual(new Set([0, 1, 2, 4]));
    expect(byStyle.get(ROOF_STYLE.Yingshan)).toEqual(new Set([0, 1, 2, 4, 6]));
    expect(byStyle.get(ROOF_STYLE.Flat)).toEqual(new Set([0, 1, 2]));
    expect(byStyle.get(ROOF_STYLE.Canopy)).toEqual(new Set([15]));
  });

  it('keeps every segmented hard-gable top vertex at or below the roof underside', () => {
    const source = simple.find((plan) => plan.roof[0] === ROOF_STYLE.Yingshan)!;
    const plan = { ...source, footprint: [0, 0, 6_000, 5_000], yaw: 0 } as const;
    const sink = emptySink();
    writeYingshanRoof({
      plan,
      unit: 0,
      sink,
      steps: 2,
      eaveProjectionMm: 700,
      structuralRiseMm: 945,
      shellThicknessMm: 180,
    });
    const mesh = (sink.roof as MeshBufferBuilder).finish();
    const dripY = (plan.elev[0] + plan.elev[1] + plan.roof[1]) / 1000;
    const profile = songZhe(3_500, 945, 2);
    let gableVertices = 0;
    for (let vertex = 0; vertex < mesh.position.length / 3; vertex += 1) {
      if (mesh.mat[vertex * 4] !== 6) continue;
      gableVertices += 1;
      const z = mesh.position[vertex * 3 + 2]!;
      const y = mesh.position[vertex * 3 + 1]!;
      const t = 1 - Math.abs(z) / 2.45;
      expect(y).toBeLessThanOrEqual(gableRoofHeightAt(t, 2.45, 0.7, dripY, profile) - 0.179);
    }
    expect(gableVertices).toBeGreaterThan(6);
  });

  it('writes two mirrored hard-gable chitou inside INV-1 with the requested unit', () => {
    const source = simple.find((plan) => plan.roof[0] === ROOF_STYLE.Yingshan)!;
    const plan = { ...source, footprint: [0, 0, 6_000, 5_000], yaw: 0 } as const;
    const sink = emptySink();
    writeYingshanRoof({ plan, unit: 0, sink, shellThicknessMm: 180 });
    const mesh = (sink.roof as MeshBufferBuilder).finish();
    const halfWidth = plan.footprint[2] / 2000 - 0.04;
    const halfDepth = plan.footprint[3] / 2000 - 0.05;
    const points: Array<readonly [number, number, number]> = [];
    for (let vertex = 0; vertex < mesh.position.length / 3; vertex += 1) {
      if (mesh.mat[vertex * 4] !== 6) continue;
      const x = mesh.position[vertex * 3]!;
      const y = mesh.position[vertex * 3 + 1]!;
      const z = mesh.position[vertex * 3 + 2]!;
      if (Math.abs(x) < halfWidth - 0.001 && z > halfDepth - 0.301) {
        points.push([x, y, z]);
        expect(mesh.unit[vertex * 2]).toBe(0);
      }
    }
    expect(points.some(([x]) => x < 0)).toBe(true);
    expect(points.some(([x]) => x > 0)).toBe(true);
    for (const [x, y, z] of points)
      expect(
        points.some(
          (point) => Math.abs(point[0] + x) < 0.000_001 && point[1] === y && point[2] === z,
        ),
      ).toBe(true);
    expect(inspectInv1(mesh, [plan])).toEqual([]);
  });

  it('keeps every drip edge at least 40 mm inside the footprint (INV-1)', () => {
    for (const plan of simple) expect(inspectInv1(meshRoof(plan), [plan])).toEqual([]);
  });

  it('keeps xuanshan LOD0/LOD1 at least one u segment per actual eave metre', () => {
    const plan = simple.find((item) => item.roof[0] === ROOF_STYLE.Xuanshan)!;
    const eaveLength = plan.footprint[2] / 1000 - 2 * (0.6 - 0.5) - 0.08;
    for (const lod of [0, 1] as const) {
      const mesh = meshRoof(plan, 0, lod);
      const columns = verticesOnLine(
        mesh,
        2,
        plan.footprint[1] / 1000 + plan.footprint[3] / 2000 - 0.05,
        (plan.elev[0] + plan.elev[1] + plan.roof[1]) / 1000,
        0,
      );
      expect(columns - 1).toBeGreaterThanOrEqual(Math.ceil(eaveLength));
    }
  });

  it('keeps yingshan LOD0/LOD1 at least one u segment per actual eave metre', () => {
    const plan = simple.find((item) => item.roof[0] === ROOF_STYLE.Yingshan)!;
    const eaveLength = plan.footprint[2] / 1000 - 0.08;
    for (const lod of [0, 1] as const) {
      const mesh = meshRoof(plan, 0, lod);
      const columns = verticesOnLine(
        mesh,
        0,
        plan.footprint[0] / 1000 - plan.footprint[3] / 2000 + 0.05,
        (plan.elev[0] + plan.elev[1] + plan.roof[1]) / 1000,
        0,
      );
      expect(columns - 1).toBeGreaterThanOrEqual(Math.ceil(eaveLength));
    }
  });

  it('keeps canopy LOD0/LOD1 at least one u segment per actual eave metre', () => {
    const plan = simple.find((item) => item.roof[0] === ROOF_STYLE.Canopy)!;
    const eaveLength = plan.footprint[2] / 1000 - 0.08;
    for (const lod of [0, 1] as const) {
      const mesh = meshRoof(plan, 0, lod);
      const columns = verticesOnLine(
        mesh,
        0,
        plan.footprint[0] / 1000 + plan.footprint[3] / 2000 - 0.04,
        (plan.elev[0] + plan.elev[1] + plan.roof[1]) / 1000,
        15,
      );
      expect(columns - 1).toBeGreaterThanOrEqual(Math.ceil(eaveLength));
    }
  });

  it('keeps each simple roof below its tech/16 §6.5 building budget', () => {
    const budgets: Record<string, readonly [number, number]> = {
      mini_shop_y0: [3_000, 1_400],
      mini_house_y1: [2_500, 1_200],
      mini_stall_y3: [600, 300],
      mini_xiyu_y1: [1_800, 900],
    };
    for (const plan of simple) {
      expect(triangleCount(plan, 0)).toBeLessThanOrEqual(budgets[plan.id]![0]);
      expect(triangleCount(plan, 1)).toBeLessThanOrEqual(budgets[plan.id]![1]);
    }
  });

  it('keeps deterministic LOD0/LOD1 triangle counts for the four simple roofs', () => {
    const expected: Record<string, readonly [number, number]> = {
      mini_shop_y0: [444, 252],
      mini_house_y1: [444, 264],
      mini_stall_y3: [24, 12],
      mini_xiyu_y1: [120, 120],
    };
    for (const plan of simple)
      expect([triangleCount(plan, 0), triangleCount(plan, 1)]).toEqual(expected[plan.id]);
  });

  it('writes all vertices to the roof buffer with the requested unit and stable hash', () => {
    for (const plan of simple) {
      const sink = emptySink();
      roofMesherFor(plan.roof[0])(plan, 37, sink, { kit: MINI_BUILD_KIT, lod: 0 });
      const shell = (sink.shell as MeshBufferBuilder).finish();
      const roof = (sink.roof as MeshBufferBuilder).finish();
      expect(shell.position).toHaveLength(0);
      expect(roof.position.length).toBeGreaterThan(0);
      expect(Array.from(roof.unit.filter((_, index) => index % 2 === 0))).toEqual(
        new Array(roof.position.length / 3).fill(37),
      );
      expect(hashMesh(roof)).toBe(hashMesh(meshRoof(plan, 37)));
    }
  });

  it('holds geometry invariants across fixed-seed random spans, steps, yaw and subdivision', () => {
    const random = mulberry32(0x41524f4f);
    const source = simple.find((plan) => plan.roof[0] === ROOF_STYLE.Xuanshan)!;
    for (let trial = 0; trial < 24; trial += 1) {
      const steps = randomInt(random, 2, 4);
      const yaw = randomInt(random, 0, 3) as 0 | 1 | 2 | 3;
      const lod = randomInt(random, 0, 1) as 0 | 1;
      const widthMm = randomInt(random, 5_000, 10_000);
      const depthMm = randomInt(random, 5_000, 9_000);
      const projectionMm = randomInt(random, 700, 1_000);
      const vergeMm = randomInt(random, 400, 600);
      const runMm = depthMm - 100 - projectionMm * 2;
      const riseMm = Math.round(runMm * (0.3 + random() * 0.15));
      const dripMm = 3_000;
      const ridgeMm = dripMm + projectionMm * 0.4 - 40 + riseMm + 320;
      const plan = {
        ...source,
        id: `random_roof_${trial}`,
        yaw,
        footprint: [0, 0, widthMm, depthMm],
        roof: [ROOF_STYLE.Xuanshan, dripMm, ridgeMm],
      } satisfies BuildingPlanView;
      const build = () => {
        const sink = emptySink();
        writeXuanshanRoof({
          plan,
          unit: 0,
          sink,
          steps,
          vergeMm,
          eaveProjectionMm: projectionMm,
          structuralRiseMm: riseMm,
          ridgeHeightMm: 320,
          lod,
        });
        return (sink.roof as MeshBufferBuilder).finish();
      };
      const mesh = build();
      expect(inspectInv1(mesh, [plan])).toEqual([]);
      expect(
        Array.from(mesh.unit.filter((_, index) => index % 2 === 0)).every((unit) => unit === 0),
      ).toBe(true);
      expect(hashMesh(mesh)).toBe(hashMesh(build()));
      const profile = songZhe(runMm, riseMm, steps);
      const heightAt = (t: number) =>
        gableRoofHeightAt(t, depthMm / 2000 - 0.04, projectionMm / 1000, 3, profile);
      const patchOptions = {
        eaveLine: [
          [-2, 3, 2],
          [0, 3, 2],
        ],
        ridgeLine: [
          [-2, 4, 0],
          [0, 4, 0],
        ],
        heightAt,
        tSegments: roofPatchTSegments(steps, lod),
      } as const;
      const left = sampleRoofPatch(patchOptions);
      const right = sampleRoofPatch({
        ...patchOptions,
        eaveLine: [
          [0, 3, 2],
          [3, 3, 2],
        ],
        ridgeLine: [
          [0, 4, 0],
          [3, 4, 0],
        ],
      });
      for (let row = 0; row < left.rows; row += 1) {
        const a = left.points[row * left.columns + left.columns - 1]!;
        const b = right.points[row * right.columns]!;
        expect(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])).toBeLessThanOrEqual(0.001);
      }
      const slopes = [...profile]
        .reverse()
        .slice(1)
        .map((h, index, values) => (h - (index === 0 ? 0 : values[index - 1]!)) / (runMm / steps));
      expect(slopes.every((slope, index) => index === 0 || slope > slopes[index - 1]!)).toBe(true);
    }
  });

  it('selects the Qing jujia curve from the build kit profile', () => {
    const house = simple.find((plan) => plan.roof[0] === ROOF_STYLE.Yingshan)!;
    const sink = emptySink();
    roofMesherFor(house.roof[0])(house, 0, sink, {
      kit: { ...MINI_BUILD_KIT, profile: 'qing_jujia' },
      lod: 0,
    });
    expect(hashMesh((sink.roof as MeshBufferBuilder).finish())).not.toBe(hashMesh(meshRoof(house)));
  });

  it('dispatches every r3 style to a non-empty roof mesh and rejects unknown styles explicitly', () => {
    for (const style of [
      ROOF_STYLE.Xieshan,
      ROOF_STYLE.Wudian,
      ROOF_STYLE.Cuanjian,
      ROOF_STYLE.Juanpeng,
      ROOF_STYLE.Dome,
    ]) {
      const source = { ...MINI_BUILDING_PLANS[0]!, roof: [style, 3_070, 4_566] as const };
      const sink = emptySink();
      roofMesherFor(style)(source, 0, sink);
      expect((sink.roof as MeshBufferBuilder).finish().index.length).toBeGreaterThan(0);
    }
    expect(() => roofMesherFor(99)).toThrow('BUILDGEN_UNKNOWN_ROOF_STYLE:99');
  });
});
