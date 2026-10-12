import type { MeshWriter, VertexInput, Yaw4 } from '../../types';

export type Vec2 = readonly [number, number];
export type Vec3 = readonly [number, number, number];
export interface QuarterTransform {
  readonly origin?: Vec3 | undefined;
  readonly yaw?: Yaw4 | undefined;
}
export interface PrimitiveMaterial {
  readonly layer?: number | undefined;
  readonly ao?: number | undefined;
  readonly flags?: number | undefined;
  readonly facade?: number | undefined;
  readonly unit?: number | undefined;
  readonly localGroundM?: number | undefined;
  readonly tint?: readonly [number, number, number, number] | undefined;
}
export interface BoxOptions extends QuarterTransform, PrimitiveMaterial {
  readonly center: Vec3;
  readonly size: Vec3;
  readonly facadeBySide?: boolean;
}
export interface PrismOptions extends QuarterTransform, PrimitiveMaterial {
  readonly center: Vec3;
  readonly radiusM: number;
  readonly heightM: number;
  readonly sides: number;
}

export function transformPoint(point: Vec3, transform: QuarterTransform = {}): Vec3 {
  const [x, y, z] = point;
  const [ox, oy, oz] = transform.origin ?? [0, 0, 0];
  switch (transform.yaw ?? 0) {
    case 0:
      return [ox + x, oy + y, oz + z];
    case 1:
      return [ox - z, oy + y, oz + x];
    case 2:
      return [ox - x, oy + y, oz - z];
    case 3:
      return [ox + z, oy + y, oz - x];
  }
}
export function transformNormal(normal: Vec3, yaw: Yaw4 = 0): Vec3 {
  return transformPoint(normal, { yaw });
}
function subtract(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function length(vector: Vec3): number {
  return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1] + vector[2] * vector[2]);
}
function normalize(vector: Vec3): Vec3 {
  const magnitude = length(vector);
  if (magnitude <= Number.EPSILON) throw new RangeError('BUILDGEN_DEGENERATE_PRIMITIVE');
  return [vector[0] / magnitude, vector[1] / magnitude, vector[2] / magnitude];
}
function vertex(point: Vec3, normal: Vec3, uv: Vec2, material: PrimitiveMaterial): VertexInput {
  return {
    position: point,
    normal,
    uv,
    layer: material.layer,
    ao: material.ao,
    flags: material.flags,
    facade: material.facade,
    unit: material.unit,
    localHeightCm: Math.max(0, Math.round((point[1] - (material.localGroundM ?? 0)) * 100)),
    tint: material.tint,
  };
}

function transformAll<T extends readonly Vec3[]>(points: T, transform: QuarterTransform): T {
  if (transform.origin === undefined && (transform.yaw ?? 0) === 0) return points;
  return points.map((point) => transformPoint(point, transform)) as unknown as T;
}

/**
 * Points must be counter-clockwise when viewed from the desired outward side. Points are local
 * coordinates; `transform` applies the same quarter-turn + origin as `box` / `prism` before
 * writing (normals follow because a quarter turn is a proper rotation).
 */
export function quad(
  writer: MeshWriter,
  localPoints: readonly [Vec3, Vec3, Vec3, Vec3],
  material: PrimitiveMaterial = {},
  transform: QuarterTransform = {},
): void {
  const points = transformAll(localPoints, transform);
  const edgeU = subtract(points[1], points[0]);
  const edgeV = subtract(points[3], points[0]);
  const normal = normalize(cross(edgeU, subtract(points[2], points[0])));
  const u = length(edgeU);
  const v = length(edgeV);
  const base = writer.vertexCount;
  writer.addVertex(vertex(points[0], normal, [0, 0], material));
  writer.addVertex(vertex(points[1], normal, [u, 0], material));
  writer.addVertex(vertex(points[2], normal, [u, v], material));
  writer.addVertex(vertex(points[3], normal, [0, v], material));
  writer.addTriangle(base, base + 1, base + 2);
  writer.addTriangle(base, base + 2, base + 3);
}

function worldSideFacade(localSide: number, yaw: Yaw4): number {
  return 1 << ((localSide + yaw) % 4);
}
export function box(writer: MeshWriter, options: BoxOptions): void {
  const [cx, cy, cz] = options.center;
  const [width, height, depth] = options.size;
  if (width <= 0 || height <= 0 || depth <= 0) throw new RangeError('BUILDGEN_INVALID_BOX_SIZE');
  const x0 = cx - width / 2;
  const x1 = cx + width / 2;
  const y0 = cy - height / 2;
  const y1 = cy + height / 2;
  const z0 = cz - depth / 2;
  const z1 = cz + depth / 2;
  const transform = { origin: options.origin, yaw: options.yaw } satisfies QuarterTransform;
  const face = (points: [Vec3, Vec3, Vec3, Vec3], localSide?: number): void => {
    const world = points.map((point) => transformPoint(point, transform)) as unknown as [
      Vec3,
      Vec3,
      Vec3,
      Vec3,
    ];
    quad(writer, world, {
      ...options,
      facade:
        options.facadeBySide && localSide !== undefined
          ? worldSideFacade(localSide, options.yaw ?? 0)
          : options.facade,
    });
  };
  face(
    [
      [x0, y0, z1],
      [x1, y0, z1],
      [x1, y1, z1],
      [x0, y1, z1],
    ],
    0,
  );
  face(
    [
      [x0, y0, z0],
      [x0, y0, z1],
      [x0, y1, z1],
      [x0, y1, z0],
    ],
    1,
  );
  face(
    [
      [x1, y0, z0],
      [x0, y0, z0],
      [x0, y1, z0],
      [x1, y1, z0],
    ],
    2,
  );
  face(
    [
      [x1, y0, z1],
      [x1, y0, z0],
      [x1, y1, z0],
      [x1, y1, z1],
    ],
    3,
  );
  face([
    [x0, y1, z1],
    [x1, y1, z1],
    [x1, y1, z0],
    [x0, y1, z0],
  ]);
  face([
    [x0, y0, z0],
    [x1, y0, z0],
    [x1, y0, z1],
    [x0, y0, z1],
  ]);
}

export function prism(writer: MeshWriter, options: PrismOptions): void {
  if (
    !Number.isInteger(options.sides) ||
    options.sides < 3 ||
    options.radiusM <= 0 ||
    options.heightM <= 0
  )
    throw new RangeError('BUILDGEN_INVALID_PRISM');
  const [cx, cy, cz] = options.center;
  const half = options.heightM / 2;
  const ring: Vec3[] = [];
  for (let index = 0; index < options.sides; index += 1) {
    const angle = (Math.PI * 2 * index) / options.sides;
    ring.push([
      cx + Math.sin(angle) * options.radiusM,
      cy - half,
      cz + Math.cos(angle) * options.radiusM,
    ]);
  }
  const transform = { origin: options.origin, yaw: options.yaw } satisfies QuarterTransform;
  for (let index = 0; index < ring.length; index += 1) {
    const next = (index + 1) % ring.length;
    const lowA = ring[index]!;
    const lowB = ring[next]!;
    const highA: Vec3 = [lowA[0], cy + half, lowA[2]];
    const highB: Vec3 = [lowB[0], cy + half, lowB[2]];
    const world = [lowA, lowB, highB, highA].map((point) => transformPoint(point, transform));
    quad(writer, world as [Vec3, Vec3, Vec3, Vec3], options);
  }
  const bottom = transformPoint([cx, cy - half, cz], transform);
  const top = transformPoint([cx, cy + half, cz], transform);
  for (let index = 0; index < ring.length; index += 1) {
    const next = (index + 1) % ring.length;
    const bottomPoints = [
      bottom,
      transformPoint(ring[next]!, transform),
      transformPoint(ring[index]!, transform),
    ];
    const topPoints = [
      top,
      transformPoint([ring[index]![0], cy + half, ring[index]![2]], transform),
      transformPoint([ring[next]![0], cy + half, ring[next]![2]], transform),
    ];
    triangle(writer, bottomPoints as [Vec3, Vec3, Vec3], options);
    triangle(writer, topPoints as [Vec3, Vec3, Vec3], options);
  }
}

function triangle(
  writer: MeshWriter,
  points: readonly [Vec3, Vec3, Vec3],
  material: PrimitiveMaterial,
): void {
  const normal = normalize(cross(subtract(points[1], points[0]), subtract(points[2], points[0])));
  const base = writer.vertexCount;
  const u = length(subtract(points[1], points[0]));
  const v = length(subtract(points[2], points[0]));
  writer.addVertex(vertex(points[0], normal, [0, 0], material));
  writer.addVertex(vertex(points[1], normal, [u, 0], material));
  writer.addVertex(vertex(points[2], normal, [0, v], material));
  writer.addTriangle(base, base + 1, base + 2);
}
function extrusionSections(polyline: readonly Vec3[], profile: readonly Vec2[]): readonly Vec3[][] {
  const rights: Vec2[] = [];
  for (let segment = 0; segment < polyline.length - 1; segment += 1) {
    const start = polyline[segment]!;
    const end = polyline[segment + 1]!;
    const dx = end[0] - start[0];
    const dz = end[2] - start[2];
    const magnitude = Math.sqrt(dx * dx + dz * dz);
    if (magnitude <= Number.EPSILON) throw new RangeError('BUILDGEN_DEGENERATE_POLYLINE');
    rights.push([dz / magnitude, -dx / magnitude]);
  }
  return polyline.map((origin, index) => {
    const before = rights[Math.max(0, index - 1)]!;
    const after = rights[Math.min(rights.length - 1, index)]!;
    const sumX = before[0] + after[0];
    const sumZ = before[1] + after[1];
    const sumLength = Math.sqrt(sumX * sumX + sumZ * sumZ);
    if (sumLength <= Number.EPSILON) throw new RangeError('BUILDGEN_REVERSING_POLYLINE');
    const miterX = sumX / sumLength;
    const miterZ = sumZ / sumLength;
    const denominator = miterX * before[0] + miterZ * before[1];
    if (denominator <= Number.EPSILON) throw new RangeError('BUILDGEN_INVALID_POLYLINE_JOIN');
    return profile.map(([lateral, vertical]) => {
      const offset = lateral / denominator;
      return [
        origin[0] + miterX * offset,
        origin[1] + vertical,
        origin[2] + miterZ * offset,
      ] as Vec3;
    });
  });
}

/**
 * Sweeps a closed [lateral metres, vertical metres] profile along an XZ polyline given in local
 * coordinates; `transform` applies the same quarter-turn + origin as `box` / `prism`.
 */
export function extrudeAlong(
  writer: MeshWriter,
  polyline: readonly Vec3[],
  profile: readonly Vec2[],
  material: PrimitiveMaterial = {},
  transform: QuarterTransform = {},
): void {
  if (polyline.length < 2 || profile.length < 3) throw new RangeError('BUILDGEN_INVALID_EXTRUSION');
  let signedArea = 0;
  for (let edge = 0; edge < profile.length; edge += 1) {
    const next = (edge + 1) % profile.length;
    signedArea += profile[edge]![0] * profile[next]![1] - profile[next]![0] * profile[edge]![1];
  }
  if (Math.abs(signedArea) <= Number.EPSILON) throw new RangeError('BUILDGEN_DEGENERATE_PROFILE');
  const counterClockwise = signedArea > 0;
  // Miters are solved in the local frame, then every section point goes through the same
  // quarter-turn, so joints stay shared after the transform.
  const sections = extrusionSections(polyline, profile).map((section) =>
    transformAll(section, transform),
  );
  for (let segment = 0; segment < polyline.length - 1; segment += 1) {
    const start = sections[segment]!;
    const end = sections[segment + 1]!;
    for (let edge = 0; edge < profile.length; edge += 1) {
      const next = (edge + 1) % profile.length;
      const currentStart = start[edge]!;
      const currentEnd = end[edge]!;
      const nextStart = start[next]!;
      const nextEnd = end[next]!;
      quad(
        writer,
        counterClockwise
          ? [nextStart, nextEnd, currentEnd, currentStart]
          : [currentStart, currentEnd, nextEnd, nextStart],
        material,
      );
    }
    if (segment === 0)
      for (let edge = 1; edge < profile.length - 1; edge += 1) {
        const points = [
          start[0]!,
          start[edge + (counterClockwise ? 1 : 0)]!,
          start[edge + (counterClockwise ? 0 : 1)]!,
        ] as [Vec3, Vec3, Vec3];
        triangle(writer, points, material);
      }
    if (segment === polyline.length - 2)
      for (let edge = 1; edge < profile.length - 1; edge += 1) {
        const points = [
          end[0]!,
          end[edge + (counterClockwise ? 0 : 1)]!,
          end[edge + (counterClockwise ? 1 : 0)]!,
        ] as [Vec3, Vec3, Vec3];
        triangle(writer, points, material);
      }
  }
}
