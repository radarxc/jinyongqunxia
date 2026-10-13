import type { MeshWriter } from '../../types';
import {
  extrudeAlong,
  type PrimitiveMaterial,
  type QuarterTransform,
  type Vec3,
} from '../core/prims';

export type RidgeKind = 'main' | 'vertical';
export interface RidgeOptions extends QuarterTransform {
  readonly path: readonly Vec3[];
  readonly kind: RidgeKind;
  readonly heightMm?: number | undefined;
  readonly widthMm?: number | undefined;
  readonly daliSquareEnd?: boolean | undefined;
  readonly material?: PrimitiveMaterial | undefined;
}

function inRange(value: number, minimum: number, maximum: number, code: string): number {
  if (!(value >= minimum && value <= maximum)) throw new RangeError(code);
  return value;
}

/** Sweeps a closed trapezoid along a main/vertical ridge polyline in metres. */
export function writeRidge(writer: MeshWriter, options: RidgeOptions): void {
  const defaults = options.kind === 'main' ? [350, 300] : [300, 250];
  const [minimum, maximum] = options.kind === 'main' ? [300, 400] : [250, 350];
  const heightMm = inRange(
    options.heightMm ?? defaults[0]!,
    minimum,
    maximum,
    'BUILDGEN_ROOF_INVALID_RIDGE_HEIGHT',
  );
  const widthMm = options.widthMm ?? defaults[1]!;
  if (!(widthMm > 0)) throw new RangeError('BUILDGEN_ROOF_INVALID_RIDGE_WIDTH');
  const halfBottom = widthMm / 2000;
  const halfTop = halfBottom * 0.62;
  const height = heightMm / 1000;
  extrudeAlong(
    writer,
    options.path,
    [
      [-halfBottom, 0],
      [halfBottom, 0],
      [halfTop, height],
      [-halfTop, height],
    ],
    options.material,
    { origin: options.origin, yaw: options.yaw },
  );
  if (options.kind === 'main' && options.daliSquareEnd) {
    const endHeight = 0.55;
    const endProfile = [
      [-halfBottom, 0],
      [halfBottom, 0],
      [halfTop, endHeight],
      [-halfTop, endHeight],
    ] as const;
    for (const end of [0, options.path.length - 1]) {
      const point = options.path[end]!;
      const neighbour = options.path[end === 0 ? 1 : end - 1]!;
      const dx = neighbour[0] - point[0];
      const dz = neighbour[2] - point[2];
      const length = Math.sqrt(dx * dx + dz * dz);
      if (length <= 0.25) continue;
      const ornamentBaseY = point[1];
      const ornamentEnd: Vec3 = [point[0], ornamentBaseY, point[2]];
      const inward: Vec3 = [
        point[0] + (dx / length) * 0.25,
        ornamentBaseY,
        point[2] + (dz / length) * 0.25,
      ];
      extrudeAlong(
        writer,
        end === 0 ? [ornamentEnd, inward] : [inward, ornamentEnd],
        endProfile,
        options.material,
        { origin: options.origin, yaw: options.yaw },
      );
    }
  }
}
