import type { BuildKitView, CityWallView, Recipe, RecipeSink } from '../../types';
import { extrudeAlong, type PrimitiveMaterial, type Vec2, type Vec3 } from '../core/prims';
import { kitLayer } from '../parts/platform';

interface PathPoint {
  readonly distanceM: number;
  readonly point: Vec3;
}
interface Range {
  readonly fromM: number;
  readonly toM: number;
}

function sourcePoints(wall: CityWallView): Vec3[] {
  if (wall.points.length < 2) throw new RangeError('BUILDGEN_INVALID_CITYWALL_PATH');
  const points = wall.points.map(([x, z]) => [x / 1_000, 0, z / 1_000] as Vec3);
  if (wall.closed) {
    const gate = wall.gates[0];
    const segment = gate?.seg ?? 0;
    if (segment < 0 || segment >= points.length)
      throw new RangeError('BUILDGEN_INVALID_CITYWALL_GATE_SEGMENT');
    const start = points[segment]!;
    const end = points[(segment + 1) % points.length]!;
    const length = Math.hypot(end[0] - start[0], end[2] - start[2]);
    if (!(length > 0)) throw new RangeError('BUILDGEN_DEGENERATE_CITYWALL_SEGMENT');
    const amount = gate ? gate.offsetMm / 1_000 / length : 0.5;
    if (!(amount >= 0 && amount <= 1))
      throw new RangeError('BUILDGEN_INVALID_CITYWALL_GATE_OFFSET');
    const split: Vec3 = [
      start[0] + (end[0] - start[0]) * amount,
      0,
      start[2] + (end[2] - start[2]) * amount,
    ];
    return [split, ...points.slice(segment + 1), ...points.slice(0, segment + 1), split];
  }
  return points;
}
function stations(points: readonly Vec3[]): PathPoint[] {
  const result: PathPoint[] = [{ distanceM: 0, point: points[0]! }];
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1]!;
    const current = points[index]!;
    const length = Math.hypot(current[0] - previous[0], current[2] - previous[2]);
    if (!(length > 0)) throw new RangeError('BUILDGEN_DEGENERATE_CITYWALL_SEGMENT');
    result.push({ distanceM: result.at(-1)!.distanceM + length, point: current });
  }
  return result;
}
function pointAt(path: readonly PathPoint[], distanceM: number): Vec3 {
  const total = path.at(-1)!.distanceM;
  const distance = Math.max(0, Math.min(total, distanceM));
  const upper = path.findIndex((entry) => entry.distanceM >= distance);
  if (upper <= 0) return path[0]!.point;
  const before = path[upper - 1]!;
  const after = path[upper]!;
  const amount = (distance - before.distanceM) / (after.distanceM - before.distanceM);
  return [
    before.point[0] + (after.point[0] - before.point[0]) * amount,
    0,
    before.point[2] + (after.point[2] - before.point[2]) * amount,
  ];
}
function subpath(path: readonly PathPoint[], fromM: number, toM: number): Vec3[] {
  return [
    pointAt(path, fromM),
    ...path
      .filter((entry) => entry.distanceM > fromM && entry.distanceM < toM)
      .map((entry) => entry.point),
    pointAt(path, toM),
  ];
}
function gateCuts(wall: CityWallView, path: readonly PathPoint[]): Range[] {
  const totalM = path.at(-1)!.distanceM;
  return wall.gates
    .flatMap((gate): Range[] => {
      const segmentCount = wall.closed ? wall.points.length : wall.points.length - 1;
      if (gate.seg < 0 || gate.seg >= segmentCount)
        throw new RangeError('BUILDGEN_INVALID_CITYWALL_GATE_SEGMENT');
      const [x0, z0] = wall.points[gate.seg]!;
      const [x1, z1] = wall.points[(gate.seg + 1) % wall.points.length]!;
      const segmentM = Math.hypot(x1 - x0, z1 - z0) / 1_000;
      if (!(gate.offsetMm >= 0 && gate.offsetMm / 1_000 <= segmentM))
        throw new RangeError('BUILDGEN_INVALID_CITYWALL_GATE_OFFSET');
      const amount = gate.offsetMm / 1_000 / segmentM;
      const centerPoint: Vec3 = [
        x0 / 1_000 + ((x1 - x0) / 1_000) * amount,
        0,
        z0 / 1_000 + ((z1 - z0) / 1_000) * amount,
      ];
      const at = path.findIndex(
        ({ point }, index) =>
          index < path.length - 1 &&
          Math.abs(
            Math.hypot(centerPoint[0] - point[0], centerPoint[2] - point[2]) +
              Math.hypot(
                path[index + 1]!.point[0] - centerPoint[0],
                path[index + 1]!.point[2] - centerPoint[2],
              ) -
              (path[index + 1]!.distanceM - path[index]!.distanceM),
          ) < 1e-6,
      );
      if (at < 0) throw new RangeError('BUILDGEN_CITYWALL_GATE_OFF_PATH');
      const center =
        path[at]!.distanceM +
        Math.hypot(centerPoint[0] - path[at]!.point[0], centerPoint[2] - path[at]!.point[2]);
      const fromM = center - gate.widthMm / 2_000;
      const toM = center + gate.widthMm / 2_000;
      if (wall.closed && fromM < 0)
        return [
          { fromM: 0, toM },
          { fromM: totalM + fromM, toM: totalM },
        ];
      if (wall.closed && toM > totalM)
        return [
          { fromM, toM: totalM },
          { fromM: 0, toM: toM - totalM },
        ];
      return [{ fromM: Math.max(0, fromM), toM: Math.min(totalM, toM) }];
    })
    .filter((range) => range.toM > range.fromM)
    .sort((left, right) => left.fromM - right.fromM);
}
function solidRanges(totalM: number, cuts: readonly Range[]): Range[] {
  const result: Range[] = [];
  let cursor = 0;
  for (const cut of cuts) {
    if (cut.fromM > cursor) result.push({ fromM: cursor, toM: cut.fromM });
    cursor = Math.max(cursor, cut.toM);
  }
  if (cursor < totalM) result.push({ fromM: cursor, toM: totalM });
  return result;
}
function profile(widthM: number, heightM: number): readonly Vec2[] {
  return [
    [-widthM / 2, 0],
    [widthM / 2, 0],
    [widthM / 2, heightM],
    [-widthM / 2, heightM],
  ];
}
function outwardSign(wall: CityWallView): 1 | -1 {
  if (!wall.closed) return 1;
  let twiceArea = 0;
  for (let index = 0; index < wall.points.length; index += 1) {
    const current = wall.points[index]!;
    const next = wall.points[(index + 1) % wall.points.length]!;
    twiceArea += current[0] * next[1] - next[0] * current[1];
  }
  return twiceArea >= 0 ? 1 : -1;
}

function writeRange(
  sink: RecipeSink,
  path: readonly PathPoint[],
  range: Range,
  crossSection: readonly Vec2[],
  material: PrimitiveMaterial,
): void {
  if (range.toM - range.fromM > 0.001)
    extrudeAlong(sink.shell, subpath(path, range.fromM, range.toM), crossSection, material);
}

/** Detailed city defence mesh. Kept separate because CityWallView is not a BuildingPlanView. */
export function writeCityWall(
  wall: CityWallView,
  unit: number,
  kit: BuildKitView,
  lod: 0 | 1,
  sink: RecipeSink,
): void {
  const points = sourcePoints(wall);
  const path = stations(points);
  const totalM = path.at(-1)!.distanceM;
  const cuts = gateCuts(wall, path);
  const solids = solidRanges(totalM, cuts);
  const heightM = wall.heightMm / 1_000;
  const topWidthM = wall.thicknessMm / 1_000;
  if (!(topWidthM > 0)) throw new RangeError('BUILDGEN_INVALID_CITYWALL_THICKNESS');
  const bottomWidthM = topWidthM + (2 * heightM * kit.cityWall.batter) / 10_000;
  const outside = outwardSign(wall);
  const common: PrimitiveMaterial = {
    layer: kitLayer(kit, 'citywall', 'stone_rubble', 'earth_plaster'),
    ao: 220,
    unit,
    localGroundM: 0,
  };
  const wallProfile: readonly Vec2[] = [
    [-bottomWidthM / 2, 0],
    [bottomWidthM / 2, 0],
    [topWidthM / 2, heightM],
    [-topWidthM / 2, heightM],
  ];
  for (const range of solids) writeRange(sink, path, range, wallProfile, common);

  const parapetWidthM = 0.35;
  const parapetHeightM = 1;
  const innerEdge = (-outside * topWidthM) / 2;
  const innerProfile: readonly Vec2[] = profile(parapetWidthM, parapetHeightM).map(
    ([lateral, vertical]) => [
      innerEdge + (outside * parapetWidthM) / 2 + lateral,
      heightM + vertical,
    ],
  );
  for (const range of solids) writeRange(sink, path, range, innerProfile, common);

  const [spacingMm, widthMm, merlonHeightMm] = kit.cityWall.merlon;
  const spacingM = spacingMm / 1_000;
  const merlonWidthM = widthMm / 1_000;
  const merlonDepthM = 0.5;
  const outerEdge = (outside * topWidthM) / 2;
  const merlonProfile: readonly Vec2[] = profile(merlonDepthM, merlonHeightMm / 1_000).map(
    ([lateral, vertical]) => [
      outerEdge - (outside * merlonDepthM) / 2 + lateral,
      heightM + vertical,
    ],
  );
  for (let centreM = spacingM / 2; centreM < totalM; centreM += spacingM) {
    const range = { fromM: centreM - merlonWidthM / 2, toM: centreM + merlonWidthM / 2 };
    if (range.fromM < 0 || range.toM > totalM) continue;
    if (cuts.some((cut) => range.fromM < cut.toM && range.toM > cut.fromM)) continue;
    writeRange(sink, path, range, merlonProfile, common);
  }
  void lod;
}

/** Registered fallback for rectangular wall plans; production CityWallView calls writeCityWall. */
export const citywallRecipe: Recipe = (plan, unit, kit, lod, sink) => {
  const halfW = plan.footprint[2] / 2;
  const halfD = plan.footprint[3] / 2;
  const wall: CityWallView = {
    id: plan.id,
    closed: true,
    heightMm: kit.cityWall.h,
    thicknessMm: kit.cityWall.top,
    gates: [],
    points: [
      [plan.footprint[0] - halfW, plan.footprint[1] - halfD],
      [plan.footprint[0] + halfW, plan.footprint[1] - halfD],
      [plan.footprint[0] + halfW, plan.footprint[1] + halfD],
      [plan.footprint[0] - halfW, plan.footprint[1] + halfD],
    ],
  };
  writeCityWall(wall, unit, kit, lod, sink);
};
