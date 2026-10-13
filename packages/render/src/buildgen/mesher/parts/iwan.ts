import type { BuildingPlanView, RecipeSink } from '../../types';
import { box, prism } from '../core/prims';
import { hallOrigin, hallSizeM } from './platform';

export interface IwanOptions {
  readonly sink: Pick<RecipeSink, 'shell' | 'roof'>;
  readonly plan: BuildingPlanView;
  readonly unit: number;
  readonly floorM: number;
  readonly depthMm: number;
  readonly clearHeightMm: number;
  readonly columnCount: 2 | 3 | 4;
  readonly timberLayer: number;
  readonly roofLayer: number;
  readonly lod: 0 | 1;
  readonly wallFrontM?: number;
}

/** Flat-roofed front iwan. Columns remain shell; its overhead canopy fades with the roof. */
export function emitIwan(options: IwanOptions): void {
  if (options.depthMm < 1_500 || options.depthMm > 2_400 || options.clearHeightMm < 2_300)
    throw new RangeError('BUILDGEN_ADOBE_INVALID_IWAN');
  const [width, depth] = hallSizeM(options.plan);
  const porchDepth = options.depthMm / 1000;
  const clearHeight = options.clearHeightMm / 1000;
  const roofThickness = 0.16;
  const porchWidth = Math.max(1.8, width - 0.9);
  const frontZ = depth / 2 - 0.14;
  const wallFront = options.wallFrontM ?? frontZ - porchDepth;
  const actualDepth = frontZ - wallFront;
  if (actualDepth < 1.5 || actualDepth > 2.4)
    throw new RangeError('BUILDGEN_ADOBE_INVALID_IWAN_POSITION');
  const origin = hallOrigin(options.plan);
  const common = {
    origin,
    yaw: options.plan.yaw,
    unit: options.unit,
    localGroundM: options.floorM,
  } as const;
  const count = options.columnCount;
  for (let index = 0; index < count; index += 1) {
    const x = -porchWidth / 2 + (porchWidth * index) / (count - 1);
    prism(options.sink.shell, {
      ...common,
      center: [x, options.floorM + clearHeight / 2, frontZ],
      radiusM: options.lod === 0 ? 0.12 : 0.11,
      heightM: clearHeight,
      sides: options.lod === 0 ? 8 : 6,
      layer: options.timberLayer,
      ao: 205,
      facade: 1 << options.plan.yaw,
    });
  }
  box(options.sink.roof, {
    ...common,
    center: [0, options.floorM + clearHeight + roofThickness / 2, (wallFront + frontZ) / 2],
    size: [porchWidth + 0.3, roofThickness, actualDepth],
    layer: options.roofLayer,
    ao: 215,
  });
  box(options.sink.roof, {
    ...common,
    center: [0, options.floorM + clearHeight + 0.08, frontZ],
    size: [porchWidth + 0.2, 0.16, 0.18],
    layer: options.timberLayer,
    ao: 190,
  });
}
