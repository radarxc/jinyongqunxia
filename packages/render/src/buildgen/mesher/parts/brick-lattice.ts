import type { BuildingPlanView, MeshWriter } from '../../types';
import { box } from '../core/prims';
import { hallOrigin } from './platform';

export interface BrickLatticeOptions {
  readonly writer: MeshWriter;
  readonly plan: BuildingPlanView;
  readonly unit: number;
  readonly widthM: number;
  readonly heightM: number;
  readonly baseM: number;
  readonly zM: number;
  readonly thicknessM: number;
  readonly layer: number;
  readonly localGroundM: number;
  readonly lod: 0 | 1;
}

/** Opaque fired-brick bars with real holes; no alpha-tested surface is emitted. */
export function emitBrickLattice(options: BrickLatticeOptions): void {
  const brick = options.lod === 0 ? 0.11 : 0.16;
  const horizontalRows = options.lod === 0 ? 4 : 3;
  const verticalColumns = options.lod === 0 ? 7 : 4;
  const common = {
    origin: hallOrigin(options.plan),
    yaw: options.plan.yaw,
    unit: options.unit,
    localGroundM: options.localGroundM,
    layer: options.layer,
    ao: 210,
    facade: 1 << options.plan.yaw,
  } as const;
  for (let row = 0; row <= horizontalRows; row += 1)
    box(options.writer, {
      ...common,
      center: [0, options.baseM + (options.heightM * row) / horizontalRows, options.zM],
      size: [options.widthM, brick, options.thicknessM],
    });
  for (let column = 0; column <= verticalColumns; column += 1)
    box(options.writer, {
      ...common,
      center: [
        -options.widthM / 2 + (options.widthM * column) / verticalColumns,
        options.baseM + options.heightM / 2,
        options.zM,
      ],
      size: [brick, options.heightM, options.thicknessM],
    });
}
