import type { BuildingPlanView, RecipeSink } from '../../types';
import {
  quad,
  transformNormal,
  transformPoint,
  type PrimitiveMaterial,
  type Vec3,
} from '../core/prims';
import { createWorldCornerDeformer, insetWingCorner, type WingDimensions } from './corner';
import { writeRoofFinial } from './ornaments';
import { cornerUStations } from './patch';
import { writeRidge } from './ridge';

export interface PyramidRoofOptions extends WingDimensions {
  readonly plan: BuildingPlanView;
  readonly unit: number;
  readonly sink: Pick<RecipeSink, 'roof'>;
  readonly sides?: 4 | 6 | 8 | undefined;
  readonly finialHeightMm?: number | undefined;
  readonly layer?: number | undefined;
  readonly soffitLayer?: number | undefined;
  readonly ornamentLayer?: number | undefined;
  readonly ridgeLayer?: number | undefined;
  readonly shellThicknessMm?: number | undefined;
  readonly lod?: 0 | 1 | undefined;
}

function material(plan: BuildingPlanView, unit: number, layer: number): PrimitiveMaterial {
  return { layer, unit, localGroundM: (plan.elev[0] + (plan.floorY[0] ?? 0)) / 1000 };
}
function pointOnEave(
  index: number,
  sides: number,
  halfWidth: number,
  halfDepth: number,
  y: number,
): Vec3 {
  if (sides === 4) {
    const corners = [
      [-halfWidth, y, -halfDepth],
      [halfWidth, y, -halfDepth],
      [halfWidth, y, halfDepth],
      [-halfWidth, y, halfDepth],
    ] as const;
    return corners[index]!;
  }
  const angle = -Math.PI + (Math.PI * 2 * index) / sides;
  const scale = 1 / Math.max(Math.abs(Math.cos(angle)), Math.abs(Math.sin(angle)));
  return [Math.cos(angle) * halfWidth * scale, y, Math.sin(angle) * halfDepth * scale];
}
function subtract(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function normal(a: Vec3, b: Vec3, c: Vec3): Vec3 {
  const u = subtract(b, a);
  const v = subtract(c, a);
  let result: Vec3 = [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0],
  ];
  if (result[1] < 0) result = [-result[0], -result[1], -result[2]];
  const length = Math.hypot(...result);
  return length > 0 ? [result[0] / length, result[1] / length, result[2] / length] : [0, 1, 0];
}
function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}
function mix(a: Vec3, b: Vec3, amount: number): Vec3 {
  return [
    a[0] + (b[0] - a[0]) * amount,
    a[1] + (b[1] - a[1]) * amount,
    a[2] + (b[2] - a[2]) * amount,
  ];
}
function cornerDirections(points: readonly Vec3[]): readonly (readonly [number, number])[] {
  return points.map((point, index) => {
    const previous = points[(index + points.length - 1) % points.length]!;
    const next = points[(index + 1) % points.length]!;
    const incomingLength = Math.hypot(point[0] - previous[0], point[2] - previous[2]);
    const outgoingLength = Math.hypot(next[0] - point[0], next[2] - point[2]);
    const incoming = [
      (point[2] - previous[2]) / incomingLength,
      -(point[0] - previous[0]) / incomingLength,
    ] as const;
    const outgoing = [
      (next[2] - point[2]) / outgoingLength,
      -(next[0] - point[0]) / outgoingLength,
    ] as const;
    const length = Math.hypot(incoming[0] + outgoing[0], incoming[1] + outgoing[1]);
    return [(incoming[0] + outgoing[0]) / length, (incoming[1] + outgoing[1]) / length] as const;
  });
}
function addVertex(
  writer: RecipeSink['roof'],
  point: Vec3,
  surfaceNormal: Vec3,
  plan: BuildingPlanView,
  mat: PrimitiveMaterial,
  uv: readonly [number, number],
): number {
  const position = transformPoint(point, {
    origin: [plan.footprint[0] / 1000, 0, plan.footprint[1] / 1000],
    yaw: plan.yaw,
  });
  return writer.addVertex({
    ...mat,
    position,
    normal: transformNormal(surfaceNormal, plan.yaw),
    uv,
    localHeightCm: Math.max(0, Math.round((position[1] - (mat.localGroundM ?? 0)) * 100)),
  });
}

/** n triangular slopes share exactly one upper apex vertex. */
export function writePyramidRoof(options: PyramidRoofOptions): void {
  const { plan, sink, unit } = options;
  const sides = options.sides ?? 4;
  if (![4, 6, 8].includes(sides)) throw new RangeError('BUILDGEN_ROOF_INVALID_PYRAMID_SIDES');
  const finialHeightMm =
    options.finialHeightMm ?? Math.max(600, Math.min(1_200, Math.round(plan.footprint[2] * 0.1)));
  const baseY = (plan.elev[0] + plan.elev[1]) / 1000;
  const dripY = baseY + plan.roof[1] / 1000;
  const topY = baseY + plan.roof[2] / 1000;
  const apexY = topY - finialHeightMm / 1000;
  if (!(apexY > dripY)) throw new RangeError('BUILDGEN_ROOF_INVALID_PYRAMID_HEIGHT');
  const halfWidth = plan.footprint[2] / 2000 - 0.04;
  const halfDepth = plan.footprint[3] / 2000 - 0.04;
  const nominal = Array.from({ length: sides }, (_, index) =>
    pointOnEave(index, sides, halfWidth, halfDepth, dripY),
  );
  const directions = cornerDirections(nominal);
  const inset = nominal.map((point, index) =>
    insetWingCorner(point, options.outsetMm, directions[index]),
  );
  const origin: Vec3 = [plan.footprint[0] / 1000, 0, plan.footprint[1] / 1000];
  const yaw = plan.yaw;
  const tile = material(plan, unit, options.layer ?? 0);
  const underside = material(plan, unit, options.soffitLayer ?? 2);
  const ridgeMaterial = material(plan, unit, options.ridgeLayer ?? 1);
  const transform = { origin, yaw } as const;
  const localApex: Vec3 = [0, apexY, 0];
  const apexIndex = addVertex(sink.roof, localApex, [0, 1, 0], plan, tile, [0.5, 1]);
  const thickness = (options.shellThicknessMm ?? 180) / 1000;
  const undersideApex: Vec3 = [0, apexY - thickness, 0];
  const undersideApexIndex = addVertex(
    sink.roof,
    undersideApex,
    [0, -1, 0],
    plan,
    underside,
    [0.5, 1],
  );
  const tStations = options.lod === 1 ? [0, 0.35, 0.7, 1] : [0, 0.175, 0.35, 0.675, 1];
  for (let face = 0; face < sides; face += 1) {
    const next = (face + 1) % sides;
    const deform = createWorldCornerDeformer({
      liftMm: options.liftMm,
      outsetMm: options.outsetMm,
      eaveLine: [inset[face]!, inset[next]!],
      corners: [nominal[face]!, nominal[next]!],
      cornerDirections: [directions[face]!, directions[next]!],
      hipPointAt: (end, t) => mix(inset[end === 0 ? face : next]!, localApex, t),
    });
    const eaveLengthMm = distance(inset[face]!, inset[next]!) * 1_000;
    const columns = cornerUStations(
      eaveLengthMm,
      Math.min(eaveLengthMm / 2, Math.max(1, eaveLengthMm / 3)),
      3,
    );
    const surfaceNormal = normal(inset[face]!, inset[next]!, localApex);
    const rows = tStations.slice(0, -1).map((t) =>
      columns.map((u) => {
        const eave = mix(inset[face]!, inset[next]!, u);
        return deform({ u, t, point: mix(eave, localApex, t) });
      }),
    );
    const topRows = rows.map((row, rowIndex) =>
      row.map((point, column) =>
        addVertex(sink.roof, point, surfaceNormal, plan, tile, [
          columns[column]!,
          tStations[rowIndex]!,
        ]),
      ),
    );
    const lowerRows = rows.map((row, rowIndex) =>
      row.map((point, column) =>
        addVertex(
          sink.roof,
          [point[0], point[1] - thickness, point[2]],
          [-surfaceNormal[0], -surfaceNormal[1], -surfaceNormal[2]],
          plan,
          underside,
          [columns[column]!, tStations[rowIndex]!],
        ),
      ),
    );
    for (let row = 0; row < topRows.length - 1; row += 1)
      for (let column = 0; column < columns.length - 1; column += 1) {
        const a = topRows[row]![column]!;
        const b = topRows[row]![column + 1]!;
        const c = topRows[row + 1]![column + 1]!;
        const d = topRows[row + 1]![column]!;
        sink.roof.addTriangle(a, b, c);
        sink.roof.addTriangle(a, c, d);
        const la = lowerRows[row]![column]!;
        const lb = lowerRows[row]![column + 1]!;
        const lc = lowerRows[row + 1]![column + 1]!;
        const ld = lowerRows[row + 1]![column]!;
        sink.roof.addTriangle(lc, lb, la);
        sink.roof.addTriangle(ld, lc, la);
      }
    const lastTop = topRows.at(-1)!;
    const lastLower = lowerRows.at(-1)!;
    for (let column = 0; column < columns.length - 1; column += 1) {
      sink.roof.addTriangle(lastTop[column]!, lastTop[column + 1]!, apexIndex);
      sink.roof.addTriangle(lastLower[column + 1]!, lastLower[column]!, undersideApexIndex);
    }
    const eaveTop = rows[0]!;
    for (let column = 0; column < columns.length - 1; column += 1)
      quad(
        sink.roof,
        [
          transformPoint(eaveTop[column]!, transform),
          transformPoint(
            [eaveTop[column]![0], eaveTop[column]![1] - 0.12, eaveTop[column]![2]],
            transform,
          ),
          transformPoint(
            [eaveTop[column + 1]![0], eaveTop[column + 1]![1] - 0.12, eaveTop[column + 1]![2]],
            transform,
          ),
          transformPoint(eaveTop[column + 1]!, transform),
        ],
        underside,
      );
    const hipStations = [0.05, ...tStations.filter((station) => station > 0.05)];
    writeRidge(sink.roof, {
      path: hipStations.map((t) => deform({ u: 0, t, point: mix(inset[face]!, localApex, t) })),
      kind: 'vertical',
      heightMm: 250,
      material: ridgeMaterial,
      origin,
      yaw,
    });
  }
  writeRoofFinial(sink.roof, [0, apexY, 0], finialHeightMm, options.lod ?? 0, {
    origin,
    yaw,
    material: material(plan, unit, options.ornamentLayer ?? 3),
  });
}
