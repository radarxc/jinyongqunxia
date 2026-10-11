import type { MeshWriter } from '../../types';
import {
  quad,
  transformPoint,
  type PrimitiveMaterial,
  type QuarterTransform,
  type Vec3,
} from './prims';

export interface WallOpening {
  readonly x0: number;
  readonly x1: number;
  readonly y0: number;
  readonly y1: number;
}
export interface OpeningWallOptions extends QuarterTransform, PrimitiveMaterial {
  readonly lengthM: number;
  readonly y0M: number;
  readonly y1M: number;
  readonly thicknessM: number;
  readonly openings: readonly WallOpening[];
}

function sortedUnique(values: readonly number[]): number[] {
  return [...new Set(values)].sort((left, right) => left - right);
}
function validate(options: OpeningWallOptions): void {
  if (!(options.lengthM > 0) || !(options.y1M > options.y0M) || !(options.thicknessM > 0))
    throw new RangeError('BUILDGEN_INVALID_WALL');
  for (const opening of options.openings) {
    if (
      !(opening.x0 < opening.x1) ||
      !(opening.y0 < opening.y1) ||
      opening.x0 < 0 ||
      opening.x1 > options.lengthM ||
      opening.y0 < options.y0M ||
      opening.y1 > options.y1M
    )
      throw new RangeError('BUILDGEN_INVALID_OPENING');
  }
}

/** Emits exactly the boundary of wall-minus-openings; no CSG and no internal strip faces. */
export function wallWithOpenings(writer: MeshWriter, options: OpeningWallOptions): void {
  validate(options);
  const xs = sortedUnique([
    0,
    options.lengthM,
    ...options.openings.flatMap((item) => [item.x0, item.x1]),
  ]);
  const ys = sortedUnique([
    options.y0M,
    options.y1M,
    ...options.openings.flatMap((item) => [item.y0, item.y1]),
  ]);
  const solid: boolean[][] = Array.from({ length: xs.length - 1 }, () =>
    Array<boolean>(ys.length - 1),
  );
  for (let xIndex = 0; xIndex < xs.length - 1; xIndex += 1)
    for (let yIndex = 0; yIndex < ys.length - 1; yIndex += 1) {
      const x = (xs[xIndex]! + xs[xIndex + 1]!) / 2;
      const y = (ys[yIndex]! + ys[yIndex + 1]!) / 2;
      solid[xIndex]![yIndex] = !options.openings.some(
        (opening) => x > opening.x0 && x < opening.x1 && y > opening.y0 && y < opening.y1,
      );
    }
  const z0 = -options.thicknessM / 2;
  const z1 = options.thicknessM / 2;
  const world = (point: Vec3): Vec3 => transformPoint(point, options);
  const emit = (points: [Vec3, Vec3, Vec3, Vec3], facade = options.facade): void =>
    quad(writer, points.map(world) as [Vec3, Vec3, Vec3, Vec3], { ...options, facade });
  const yaw = options.yaw ?? 0;
  const wallFacade = options.facade ?? 1 << yaw;

  for (let xIndex = 0; xIndex < xs.length - 1; xIndex += 1)
    for (let yIndex = 0; yIndex < ys.length - 1; yIndex += 1) {
      if (!solid[xIndex]![yIndex]) continue;
      const x0 = xs[xIndex]!;
      const x1 = xs[xIndex + 1]!;
      const y0 = ys[yIndex]!;
      const y1 = ys[yIndex + 1]!;
      emit(
        [
          [x0, y0, z1],
          [x1, y0, z1],
          [x1, y1, z1],
          [x0, y1, z1],
        ],
        wallFacade,
      );
      emit(
        [
          [x1, y0, z0],
          [x0, y0, z0],
          [x0, y1, z0],
          [x1, y1, z0],
        ],
        wallFacade,
      );
      if (xIndex === 0 || !solid[xIndex - 1]![yIndex])
        emit(
          [
            [x0, y0, z0],
            [x0, y0, z1],
            [x0, y1, z1],
            [x0, y1, z0],
          ],
          wallFacade,
        );
      if (xIndex === solid.length - 1 || !solid[xIndex + 1]![yIndex])
        emit(
          [
            [x1, y0, z1],
            [x1, y0, z0],
            [x1, y1, z0],
            [x1, y1, z1],
          ],
          wallFacade,
        );
      if (yIndex === 0 || !solid[xIndex]![yIndex - 1])
        emit(
          [
            [x0, y0, z0],
            [x1, y0, z0],
            [x1, y0, z1],
            [x0, y0, z1],
          ],
          wallFacade,
        );
      if (yIndex === ys.length - 2 || !solid[xIndex]![yIndex + 1])
        emit(
          [
            [x0, y1, z1],
            [x1, y1, z1],
            [x1, y1, z0],
            [x0, y1, z0],
          ],
          wallFacade,
        );
    }
}
