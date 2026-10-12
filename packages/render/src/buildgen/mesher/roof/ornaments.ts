import type { MeshWriter, Yaw4 } from '../../types';
import {
  prism,
  transformNormal,
  transformPoint,
  type PrimitiveMaterial,
  type Vec3,
} from '../core/prims';

/** tech/16 §3: hall chiwei rise 900–1300 mm above the main-ridge top (mid value). */
export const HALL_CHIWEI_HEIGHT_MM = 1_100;
/** tech/16 §3: Dali square upturned ends stand 550 mm on top of the main ridge. */
export const DALI_SQUARE_END_HEIGHT_MM = 550;

export function assertChiweiHeight(heightMm: number): void {
  if (!(heightMm >= 900 && heightMm <= 1_300))
    throw new RangeError('BUILDGEN_ROOF_INVALID_CHIWEI_HEIGHT');
}

export interface OrnamentTransform {
  readonly origin?: Vec3 | undefined;
  readonly yaw?: Yaw4 | undefined;
  readonly material?: PrimitiveMaterial | undefined;
}

function normalize(vector: Vec3): Vec3 {
  const length = Math.hypot(vector[0], vector[1], vector[2]);
  return length > 0 ? [vector[0] / length, vector[1] / length, vector[2] / length] : [0, 1, 0];
}
function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function subtract(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function triangle(
  writer: MeshWriter,
  points: readonly [Vec3, Vec3, Vec3],
  options: OrnamentTransform,
): void {
  const transformed = points.map((point) =>
    transformPoint(point, { origin: options.origin, yaw: options.yaw }),
  ) as [Vec3, Vec3, Vec3];
  const normal = transformNormal(
    normalize(cross(subtract(points[1], points[0]), subtract(points[2], points[0]))),
    options.yaw,
  );
  const base = writer.vertexCount;
  for (const [index, point] of transformed.entries())
    writer.addVertex({
      ...options.material,
      position: point,
      normal,
      uv: [index === 1 ? 1 : 0, index === 2 ? 1 : 0],
      localHeightCm: Math.max(
        0,
        Math.round((point[1] - (options.material?.localGroundM ?? 0)) * 100),
      ),
    });
  writer.addTriangle(base, base + 1, base + 2);
}
function chiweiRing(center: Vec3, halfX: number, halfZ: number): readonly [Vec3, Vec3, Vec3, Vec3] {
  return [
    [center[0] - halfX, center[1], center[2] - halfZ],
    [center[0] + halfX, center[1], center[2] - halfZ],
    [center[0] + halfX, center[1], center[2] + halfZ],
    [center[0] - halfX, center[1], center[2] + halfZ],
  ];
}
function closeChiweiRing(
  writer: MeshWriter,
  ring: readonly [number, number, number, number],
  reverse: boolean,
): void {
  const order = reverse ? ([0, 2, 1, 0, 3, 2] as const) : ([0, 1, 2, 0, 2, 3] as const);
  writer.addTriangle(ring[order[0]], ring[order[1]], ring[order[2]]);
  writer.addTriangle(ring[order[3]], ring[order[4]], ring[order[5]]);
}
function joinChiweiRings(
  writer: MeshWriter,
  low: readonly [number, number, number, number],
  high: readonly [number, number, number, number],
): void {
  for (let edge = 0; edge < 4; edge += 1) {
    const next = (edge + 1) % 4;
    writer.addTriangle(low[edge]!, low[next]!, high[next]!);
    writer.addTriangle(low[edge]!, high[next]!, high[edge]!);
  }
}
function writeTetrahedron(
  writer: MeshWriter,
  points: readonly [Vec3, Vec3, Vec3, Vec3],
  options: OrnamentTransform,
): void {
  for (const face of [
    [0, 2, 1],
    [0, 1, 3],
    [1, 2, 3],
    [2, 0, 3],
  ] as const)
    triangle(writer, [points[face[0]], points[face[1]], points[face[2]]], options);
}

/** Faceted hall chiwei pair: 80 triangles at LOD0, 24 at LOD1. */
export function writeChiweiPair(
  writer: MeshWriter,
  ridgeEnds: readonly [Vec3, Vec3],
  topY: number,
  lod: 0 | 1,
  options: OrnamentTransform = {},
): void {
  for (const [endIndex, end] of ridgeEnds.entries()) {
    const direction = endIndex === 0 ? -1 : 1;
    const baseY = end[1];
    const height = Math.max(0.12, topY - baseY);
    const ringCount = lod === 1 ? 2 : 5;
    const points = Array.from({ length: ringCount }, (_, index) => {
      const t = index / (ringCount - 1);
      return chiweiRing(
        [end[0] + direction * (0.08 + t * 0.24), baseY + height * t, end[2]],
        0.055 * (1 - t * 0.35),
        0.16 * (1 - t * 0.65),
      );
    });
    const rings = points.map(
      (ring) =>
        ring.map((point, index) => {
          const world = transformPoint(point, { origin: options.origin, yaw: options.yaw });
          return writer.addVertex({
            ...options.material,
            position: world,
            normal: transformNormal(normalize(subtract(point, end)), options.yaw),
            uv: [index % 2, point[1] - baseY],
            localHeightCm: Math.max(
              0,
              Math.round((world[1] - (options.material?.localGroundM ?? 0)) * 100),
            ),
          });
        }) as [number, number, number, number],
    );
    closeChiweiRing(writer, rings[0]!, true);
    for (let ring = 0; ring < rings.length - 1; ring += 1)
      joinChiweiRings(writer, rings[ring]!, rings[ring + 1]!);
    closeChiweiRing(writer, rings.at(-1)!, false);
    if (lod === 0) {
      const centreX = end[0] + direction * 0.31;
      const centreY = baseY + height * 0.62;
      writeTetrahedron(
        writer,
        [
          [centreX, centreY - 0.045, end[2] - 0.05],
          [centreX, centreY - 0.045, end[2] + 0.05],
          [centreX + direction * 0.09, centreY - 0.045, end[2]],
          [centreX + direction * 0.025, centreY + 0.07, end[2]],
        ],
        options,
      );
    }
  }
}

/** Dali 550 mm square upturned ends standing on `ridgeEnds` (the main-ridge top). */
export function writeDaliSquareEnds(
  writer: MeshWriter,
  ridgeEnds: readonly [Vec3, Vec3],
  options: OrnamentTransform = {},
): void {
  for (const [index, end] of ridgeEnds.entries()) {
    const centerX = end[0] + (index === 0 ? -0.08 : 0.08);
    prism(writer, {
      center: [centerX, end[1] + DALI_SQUARE_END_HEIGHT_MM / 2_000, end[2]],
      radiusM: 0.18,
      heightM: DALI_SQUARE_END_HEIGHT_MM / 1_000,
      sides: 4,
      ...options.material,
      origin: options.origin,
      yaw: options.yaw,
    });
  }
}

/** Tiered shared finial for cuanjian; its returned top is exactly base + height. */
export function writeRoofFinial(
  writer: MeshWriter,
  center: Vec3,
  heightMm: number,
  lod: 0 | 1,
  options: OrnamentTransform = {},
): void {
  if (!(heightMm >= 600 && heightMm <= 1_200))
    throw new RangeError('BUILDGEN_ROOF_INVALID_FINIAL_HEIGHT');
  const height = heightMm / 1000;
  const sides = lod === 1 ? 6 : 10;
  prism(writer, {
    center: [center[0], center[1] + height * 0.18, center[2]],
    radiusM: Math.min(0.42, height * 0.34),
    heightM: height * 0.36,
    sides,
    ...options.material,
    origin: options.origin,
    yaw: options.yaw,
  });
  prism(writer, {
    center: [center[0], center[1] + height * 0.68, center[2]],
    radiusM: Math.min(0.22, height * 0.18),
    heightM: height * 0.64,
    sides,
    ...options.material,
    origin: options.origin,
    yaw: options.yaw,
  });
}
