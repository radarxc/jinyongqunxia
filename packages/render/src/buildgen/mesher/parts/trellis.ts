import type { BuildingPlanView, MeshWriter } from '../../types';
import { box } from '../core/prims';
import { hallOrigin } from './platform';

export interface TrellisOptions {
  readonly writer: MeshWriter;
  readonly plan: BuildingPlanView;
  readonly unit: number;
  readonly center: readonly [number, number];
  readonly size: readonly [number, number];
  readonly clearanceMm: number;
  readonly layer: number;
  readonly localGroundM: number;
  readonly lod: 0 | 1;
}

function beams(span: number, step: number): number[] {
  const count = Math.max(2, Math.ceil(span / step));
  return Array.from({ length: count + 1 }, (_, index) => -span / 2 + (span * index) / count);
}

/** Solid timber grape trellis. Its posts and overhead grid all belong to the roof fade batch. */
export function emitTrellis(options: TrellisOptions): void {
  if (options.clearanceMm < 2_300) throw new RangeError('BUILDGEN_ADOBE_INVALID_TRELLIS');
  const [cx, cz] = options.center;
  const [width, depth] = options.size;
  const clearance = options.clearanceMm / 1000;
  const post = 0.1;
  const beam = options.lod === 0 ? 0.07 : 0.09;
  const common = {
    origin: hallOrigin(options.plan),
    yaw: options.plan.yaw,
    unit: options.unit,
    localGroundM: options.localGroundM,
    layer: options.layer,
    ao: 195,
  } as const;
  for (const x of [-width / 2 + post / 2, width / 2 - post / 2])
    for (const z of [-depth / 2 + post / 2, depth / 2 - post / 2])
      box(options.writer, {
        ...common,
        center: [cx + x, options.localGroundM + clearance / 2, cz + z],
        size: [post, clearance, post],
      });
  const step = options.lod === 0 ? 0.6 : 1.2;
  for (const x of beams(width - post, step))
    box(options.writer, {
      ...common,
      center: [cx + x, options.localGroundM + clearance + beam / 2, cz],
      size: [beam, beam, depth],
    });
  for (const z of beams(depth - post, step))
    box(options.writer, {
      ...common,
      center: [cx, options.localGroundM + clearance + beam, cz + z],
      size: [width, beam, beam],
    });
}
