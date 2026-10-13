import type { BuildingPlanView, MeshWriter } from '../../types';
import { box } from '../core/prims';
import { hallOrigin, hallSizeM } from './platform';

export interface JoistOptions {
  readonly writer: MeshWriter;
  readonly plan: BuildingPlanView;
  readonly unit: number;
  readonly undersideM: number;
  readonly spacingMm: number;
  readonly overhangMm: number;
  readonly layer: number;
  readonly localGroundM: number;
  readonly lod?: 0 | 1;
  readonly boundsM?: readonly [left: number, back: number, right: number, front: number];
}

function stations(spanM: number, spacingMm: number): number[] {
  const spacing = spacingMm / 1000;
  const count = Math.max(1, Math.floor(spanM / spacing));
  const centre = (count * spacing) / 2;
  return Array.from({ length: count + 1 }, (_, index) => index * spacing - centre);
}

/** Poplar ends on all four faces, embedded 120 mm then projecting the full kit overhang. */
export function emitJoistEnds(options: JoistOptions): void {
  if (!(options.spacingMm >= 300) || !(options.overhangMm >= 100))
    throw new RangeError('BUILDGEN_ADOBE_INVALID_JOISTS');
  const [width, depth] = hallSizeM(options.plan);
  const [left, back, right, front] = options.boundsM ?? [
    -width / 2,
    -depth / 2,
    width / 2,
    depth / 2,
  ];
  const radius = 0.075;
  const reach = options.overhangMm / 1000;
  const embed = 0.12;
  const common = {
    origin: hallOrigin(options.plan),
    yaw: options.plan.yaw,
    unit: options.unit,
    localGroundM: options.localGroundM,
    layer: options.layer,
    ao: 190,
  } as const;
  const spacing = options.lod === 1 ? options.spacingMm * 2 : options.spacingMm;
  for (const x of stations(right - left - radius * 2, spacing))
    for (const side of [-1, 1] as const)
      box(options.writer, {
        ...common,
        center: [
          (left + right) / 2 + x,
          options.undersideM - radius,
          side < 0 ? back - (reach - embed) / 2 : front + (reach - embed) / 2,
        ],
        size: [radius * 2, radius * 2, reach + embed],
      });
  for (const z of stations(front - back - radius * 2, spacing))
    for (const side of [-1, 1] as const)
      box(options.writer, {
        ...common,
        center: [
          side < 0 ? left - (reach - embed) / 2 : right + (reach - embed) / 2,
          options.undersideM - radius,
          (back + front) / 2 + z,
        ],
        size: [reach + embed, radius * 2, radius * 2],
      });
}

/** One timber waterspout per facade, running from the wall skin to the outer drip edge. */
export function emitWaterspout(options: Omit<JoistOptions, 'spacingMm'>): void {
  const [width, depth] = hallSizeM(options.plan);
  const [left, back, right, front] = options.boundsM ?? [
    -width / 2,
    -depth / 2,
    width / 2,
    depth / 2,
  ];
  const reach = options.overhangMm / 1000;
  const common = {
    origin: hallOrigin(options.plan),
    yaw: options.plan.yaw,
    unit: options.unit,
    localGroundM: options.localGroundM,
    layer: options.layer,
    ao: 180,
  } as const;
  for (const [center, size] of [
    [
      [0, options.undersideM + 0.08, back - reach / 2],
      [0.22, 0.12, reach],
    ],
    [
      [left - reach / 2, options.undersideM + 0.08, 0],
      [reach, 0.12, 0.22],
    ],
    [
      [0, options.undersideM + 0.08, front + reach / 2],
      [0.22, 0.12, reach],
    ],
    [
      [right + reach / 2, options.undersideM + 0.08, 0],
      [reach, 0.12, 0.22],
    ],
  ] as const)
    box(options.writer, { ...common, center, size });
}
