import type { Vec3 } from '../core/prims';
import type { RoofPatchDeformer } from './patch';

export const WING_T_LIMIT = 0.35;

export interface WingDimensions {
  readonly liftMm: number;
  readonly outsetMm: number;
}
export interface WorldCornerDeformerOptions extends WingDimensions {
  /** Undeformed points on the common plan-local eave boundary. */
  readonly eaveLine: readonly [Vec3, Vec3];
  /** Nominal world corners shared by every roof face meeting the hip. */
  readonly corners: readonly [Vec3, Vec3];
  /** World-space shared hip positions for both edge ends at the supplied hip parameter. */
  readonly hipPointAt?: ((end: 0 | 1, hipT: number) => Vec3) | undefined;
  /** Unit outward angle bisectors. Rectangular eaves can omit these. */
  readonly cornerDirections?: readonly [readonly [number, number], readonly [number, number]];
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/** Cubic Hermite transition with zero slope at both ends. */
export function smoothstep(value: number): number {
  const x = clamp01(value);
  return x * x * (3 - 2 * x);
}

/** Eave-end weight: only the outer third at either end is affected. */
export function wingUWeight(edgeFraction: number): number {
  const u = clamp01(edgeFraction);
  if (u < 1 / 3) return smoothstep(1 - u * 3);
  if (u > 2 / 3) return smoothstep((u - 2 / 3) * 3);
  return 0;
}

/** Hip weight shared by both faces; the cutoff is exactly t = 0.35. */
export function wingTWeight(hipT: number): number {
  if (!(hipT >= 0) || hipT >= WING_T_LIMIT) return 0;
  const remaining = 1 - hipT / WING_T_LIMIT;
  return remaining * remaining;
}

function normalizedDirection(direction: readonly [number, number]): readonly [number, number] {
  const length = Math.hypot(direction[0], direction[1]);
  if (!(length > 0)) throw new RangeError('BUILDGEN_ROOF_INVALID_CORNER');
  return [direction[0] / length, direction[1] / length];
}
function worldEdgeFraction(point: Vec3, start: Vec3, end: Vec3): number {
  const dx = end[0] - start[0];
  const dz = end[2] - start[2];
  const lengthSquared = dx * dx + dz * dz;
  if (lengthSquared <= Number.EPSILON) return 0;
  return clamp01(((point[0] - start[0]) * dx + (point[2] - start[2]) * dz) / lengthSquared);
}

/** A rectangle's corner bisector is independent of its aspect ratio. */
export function rectangularCornerDirection(corner: Vec3): readonly [number, number] {
  if (corner[0] === 0 || corner[2] === 0) throw new RangeError('BUILDGEN_ROOF_INVALID_CORNER');
  return normalizedDirection([Math.sign(corner[0]), Math.sign(corner[2])]);
}

/** Moves a nominal corner inward so its fully deformed position lands on that nominal corner. */
export function insetWingCorner(
  corner: Vec3,
  outsetMm: number,
  direction: readonly [number, number] = rectangularCornerDirection(corner),
): Vec3 {
  if (!(outsetMm >= 0) || !Number.isFinite(outsetMm))
    throw new RangeError('BUILDGEN_ROOF_INVALID_WING_OUTSET');
  const [dx, dz] = normalizedDirection(direction);
  const inset = outsetMm / 1000;
  return [corner[0] - dx * inset, corner[1], corner[2] - dz * inset];
}

/**
 * Deforms from shared nominal corners and hip t. Adjacent faces pass the same corner at their
 * shared endpoint, so neither face-local orientation nor tessellation can open the hip seam.
 */
export function createWorldCornerDeformer(options: WorldCornerDeformerOptions): RoofPatchDeformer {
  if (!(options.liftMm >= 0) || !Number.isFinite(options.liftMm))
    throw new RangeError('BUILDGEN_ROOF_INVALID_WING_LIFT');
  if (!(options.outsetMm >= 0) || !Number.isFinite(options.outsetMm))
    throw new RangeError('BUILDGEN_ROOF_INVALID_WING_OUTSET');
  return ({ t, point }) => {
    const start = options.hipPointAt?.(0, t) ?? options.eaveLine[0];
    const end = options.hipPointAt?.(1, t) ?? options.eaveLine[1];
    const edgeFraction = worldEdgeFraction(point, start, end);
    const wu = wingUWeight(edgeFraction);
    const wt = wingTWeight(t);
    const weight = wu * wt;
    if (weight === 0) return point;
    const cornerIndex = edgeFraction <= 0.5 ? 0 : 1;
    const corner = options.corners[cornerIndex];
    const [dx, dz] = normalizedDirection(
      options.cornerDirections?.[cornerIndex] ?? rectangularCornerDirection(corner),
    );
    return [
      point[0] + dx * (options.outsetMm / 1000) * weight,
      point[1] + (options.liftMm / 1000) * weight,
      point[2] + dz * (options.outsetMm / 1000) * weight,
    ];
  };
}
