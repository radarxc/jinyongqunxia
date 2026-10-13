import type { BuildingPlanView, MeshWriter } from '../../types';
import { box } from '../core/prims';
import { hallOrigin, hallSizeM } from './platform';

export interface ParapetOptions {
  readonly writer: MeshWriter;
  readonly plan: BuildingPlanView;
  readonly unit: number;
  readonly deckTopM: number;
  readonly heightMm: number;
  readonly wallLayer: number;
  readonly copingLayer: number;
  readonly localGroundM: number;
  readonly boundsM?: readonly [left: number, back: number, right: number, front: number];
  readonly lod?: 0 | 1;
}

/** Four solid adobe parapets plus a fired coping course; the top is exactly deck + height. */
export function emitParapet(options: ParapetOptions): void {
  if (!(options.heightMm >= 300 && options.heightMm <= 900))
    throw new RangeError('BUILDGEN_ADOBE_INVALID_PARAPET');
  const [width, depth] = hallSizeM(options.plan);
  const [left, back, right, front] = options.boundsM ?? [
    -width / 2,
    -depth / 2,
    width / 2,
    depth / 2,
  ];
  const height = options.heightMm / 1000;
  const thickness = 0.2;
  const common = {
    origin: hallOrigin(options.plan),
    yaw: options.plan.yaw,
    unit: options.unit,
    localGroundM: options.localGroundM,
    ao: 220,
  } as const;
  const runs = [
    [(left + right) / 2, front - thickness / 2, right - left, thickness],
    [(left + right) / 2, back + thickness / 2, right - left, thickness],
    [left + thickness / 2, (back + front) / 2, thickness, front - back - thickness * 2],
    [right - thickness / 2, (back + front) / 2, thickness, front - back - thickness * 2],
  ] as const;
  for (const [x, z, w, d] of runs) {
    box(options.writer, {
      ...common,
      center: [x, options.deckTopM + height / 2, z],
      size: [w, height, d],
      layer: options.wallLayer,
    });
    if (options.lod === 1) continue;
    box(options.writer, {
      ...common,
      center: [x, options.deckTopM + height - 0.025, z],
      size: [w, 0.05, d],
      layer: options.copingLayer,
      ao: 235,
    });
  }
}
