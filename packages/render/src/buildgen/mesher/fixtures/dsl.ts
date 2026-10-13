import {
  box,
  extrudeAlong,
  prism,
  quad,
  transformPoint,
  type Vec2,
  type Vec3,
} from '../core/prims';
import type { MeshWriter, VertexInput, Yaw4 } from '../../types';
import { PROP_LAYER, type LampPointMm, type PropPlacement } from './types';

export const INTERIOR_SURFACE_FLAG = 1 << 2;
/** Static-lit bit3: paper/fire surfaces contribute night-time emissive light. */
export const NIGHT_GLOW_FLAG = 1 << 3;
export const PROP_ARRAY_FLAG = 1 << 5;
export const PROP_FLAGS = INTERIOR_SURFACE_FLAG | PROP_ARRAY_FLAG;
export const PROP_AO = Math.round(255 * 0.78);
export const WALL_CORNER_AO = Math.round(255 * 0.8);
export const LAMP_RANGE_MM = 2_500;
const LAMP_RANGE_SQUARED_MM = LAMP_RANGE_MM * LAMP_RANGE_MM;

export interface PropContext {
  readonly writer: MeshWriter;
  readonly placement?: PropPlacement;
}
interface ShapeOptions {
  readonly layer?: number;
  readonly ao?: number;
  readonly flags?: number;
}

function mm(value: number): number {
  return value / 1000;
}
function material(context: PropContext, options: ShapeOptions = {}) {
  const placement = context.placement;
  return {
    layer: options.layer ?? PROP_LAYER.woodFurniture,
    ao: options.ao ?? PROP_AO,
    flags: options.flags ?? PROP_FLAGS,
    unit: placement?.unit ?? 0,
    localGroundM: mm(placement?.localGroundMm ?? 0),
  };
}
function transform(context: PropContext) {
  const [x, y, z] = context.placement?.originMm ?? [0, 0, 0];
  return {
    origin: [mm(x), mm(y), mm(z)] as Vec3,
    yaw: context.placement?.yaw ?? (0 as Yaw4),
  };
}

export function bakedLampByte(
  pointMm: readonly [number, number, number],
  lamps: readonly LampPointMm[],
): number {
  let strongest = 0;
  for (const lamp of lamps) {
    const dx = pointMm[0] - lamp.xMm;
    const dy = pointMm[1] - lamp.yMm;
    const dz = pointMm[2] - lamp.zMm;
    // The cut-off uses the exact squared distance: the octahedral estimate below undershoots
    // diagonals (e.g. [1444, 1444, 1444] is 2501 mm away but estimates 2257 mm).
    if (dx * dx + dy * dy + dz * dz >= LAMP_RANGE_SQUARED_MM) continue;
    const axes = [Math.abs(dx), Math.abs(dy), Math.abs(dz)].sort((left, right) => right - left);
    // Integer octahedral approximation: max + 3/8 middle + 3/16 min.
    const distanceMm = axes[0]! + Math.round((axes[1]! * 3) / 8) + Math.round((axes[2]! * 3) / 16);
    // Rounded up so every lit point inside the range keeps at least 1 (2499 mm on an axis).
    const value =
      distanceMm >= LAMP_RANGE_MM
        ? 0
        : Math.ceil((255 * (LAMP_RANGE_MM - distanceMm)) / LAMP_RANGE_MM);
    strongest = Math.max(strongest, value);
  }
  return strongest;
}

class BakedWriter implements MeshWriter {
  constructor(
    private readonly target: MeshWriter,
    private readonly placement: PropPlacement,
  ) {}
  get vertexCount(): number {
    return this.target.vertexCount;
  }
  addVertex(vertex: VertexInput): number {
    const worldMm = vertex.position.map((value) => Math.round(value * 1000)) as [
      number,
      number,
      number,
    ];
    const light = bakedLampByte(worldMm, this.placement.lamps);
    const tint = vertex.tint;
    return this.target.addVertex({
      ...vertex,
      tint: [tint?.[0] ?? 255, tint?.[1] ?? 255, tint?.[2] ?? 255, light],
    });
  }
  addTriangle(a: number, b: number, c: number): void {
    this.target.addTriangle(a, b, c);
  }
}

export function propContext(writer: MeshWriter, placement?: PropPlacement): PropContext {
  return {
    writer: placement ? new BakedWriter(writer, placement) : writer,
    ...(placement ? { placement } : {}),
  };
}

export function solid(
  context: PropContext,
  centerMm: readonly [number, number, number],
  sizeMm: readonly [number, number, number],
  options: ShapeOptions = {},
): void {
  box(context.writer, {
    center: centerMm.map(mm) as unknown as Vec3,
    size: sizeMm.map(mm) as unknown as Vec3,
    ...material(context, options),
    ...transform(context),
  });
}

export function board(
  context: PropContext,
  centerMm: readonly [number, number, number],
  sizeMm: readonly [number, number, number],
  options?: ShapeOptions,
): void {
  solid(context, centerMm, sizeMm, options);
}

export function post(
  context: PropContext,
  xMm: number,
  zMm: number,
  y0Mm: number,
  y1Mm: number,
  thicknessMm: number,
  options?: ShapeOptions,
): void {
  solid(context, [xMm, (y0Mm + y1Mm) / 2, zMm], [thicknessMm, y1Mm - y0Mm, thicknessMm], options);
}

export function legs(
  context: PropContext,
  wMm: number,
  dMm: number,
  y0Mm: number,
  y1Mm: number,
  thicknessMm: number,
  options?: ShapeOptions,
): void {
  const x = Math.max(0, wMm / 2 - thicknessMm / 2);
  const z = Math.max(0, dMm / 2 - thicknessMm / 2);
  for (const px of [-x, x])
    for (const pz of [-z, z]) post(context, px, pz, y0Mm, y1Mm, thicknessMm, options);
}

export function shelfStack(
  context: PropContext,
  wMm: number,
  dMm: number,
  hMm: number,
  count: number,
  options?: ShapeOptions,
): void {
  const thickness = Math.max(25, Math.min(60, Math.round(hMm / 30)));
  for (let index = 0; index < count; index += 1) {
    const y = thickness / 2 + Math.round((index * (hMm - thickness)) / Math.max(1, count - 1));
    board(context, [0, y, 0], [wMm, thickness, dMm], options);
  }
}

export function drawerGrid(
  context: PropContext,
  wMm: number,
  dMm: number,
  hMm: number,
  columns: number,
  rows: number,
  lod: 0 | 1,
  options: ShapeOptions = {},
): void {
  if (lod === 1) {
    board(context, [0, hMm / 2, -dMm / 2 + 12], [wMm, hMm, 24], {
      ...options,
      layer: PROP_LAYER.medicineDrawers,
    });
    return;
  }
  const rail = Math.max(12, Math.round(Math.min(wMm / columns, hMm / rows) * 0.09));
  for (let column = 1; column < columns; column += 1) {
    const x = -wMm / 2 + Math.round((column * wMm) / columns);
    board(context, [x, hMm / 2, -dMm / 2 + 10], [rail, hMm, 20], options);
  }
  for (let row = 1; row < rows; row += 1) {
    const y = Math.round((row * hMm) / rows);
    board(context, [0, y, -dMm / 2 + 10], [wMm, rail, 20], options);
  }
}

export function cylinder(
  context: PropContext,
  centerMm: readonly [number, number, number],
  radiusMm: number,
  heightMm: number,
  sides: number,
  options?: ShapeOptions,
): void {
  prism(context.writer, {
    center: centerMm.map(mm) as unknown as Vec3,
    radiusM: mm(radiusMm),
    heightM: mm(heightMm),
    sides,
    ...material(context, options),
    ...transform(context),
  });
}

/** Revolves an integer-mm [radius,y] profile. Caps are included; consecutive zero radii are invalid. */
export function lathe(
  context: PropContext,
  profileMm: readonly (readonly [number, number])[],
  sides: number,
  options?: ShapeOptions,
): void {
  if (profileMm.length < 2 || sides < 3) throw new RangeError('BUILDGEN_INVALID_LATHE');
  const transformSpec = transform(context);
  const mat = material(context, options);
  const rings = profileMm.map(([radius, y]) =>
    Array.from({ length: sides }, (_, index) => {
      const angle = (Math.PI * 2 * index) / sides;
      return [Math.sin(angle) * mm(radius), mm(y), Math.cos(angle) * mm(radius)] as Vec3;
    }),
  );
  const centerTriangle = (center: Vec3, a: Vec3, b: Vec3): void => {
    const base = context.writer.vertexCount;
    const points = [center, a, b].map((point) => transformPoint(point, transformSpec));
    const normal: Vec3 = [0, center[1] === profileMm[0]![1] / 1000 ? -1 : 1, 0];
    for (const point of points)
      context.writer.addVertex({
        position: point,
        normal,
        layer: mat.layer,
        ao: mat.ao,
        flags: mat.flags,
        unit: mat.unit,
        localHeightCm: Math.max(0, Math.round((point[1] - (mat.localGroundM ?? 0)) * 100)),
      });
    context.writer.addTriangle(base, base + 1, base + 2);
  };
  for (let section = 0; section < rings.length - 1; section += 1) {
    const lower = rings[section]!;
    const upper = rings[section + 1]!;
    for (let side = 0; side < sides; side += 1) {
      const next = (side + 1) % sides;
      quad(
        context.writer,
        [lower[side]!, lower[next]!, upper[next]!, upper[side]!],
        mat,
        transformSpec,
      );
    }
  }
  const low = rings[0]!;
  const high = rings[rings.length - 1]!;
  const lowCenter: Vec3 = [0, mm(profileMm[0]![1]), 0];
  const highCenter: Vec3 = [0, mm(profileMm[profileMm.length - 1]![1]), 0];
  for (let side = 0; side < sides; side += 1) {
    const next = (side + 1) % sides;
    centerTriangle(lowCenter, low[next]!, low[side]!);
    centerTriangle(highCenter, high[side]!, high[next]!);
  }
}

export function sweep(
  context: PropContext,
  pathMm: readonly (readonly [number, number, number])[],
  profileMm: readonly (readonly [number, number])[],
  options?: ShapeOptions,
): void {
  extrudeAlong(
    context.writer,
    pathMm.map((point) => point.map(mm) as unknown as Vec3),
    profileMm.map((point) => point.map(mm) as unknown as Vec2),
    material(context, options),
    transform(context),
  );
}

export function panel(
  context: PropContext,
  pointsMm: readonly [Vec3, Vec3, Vec3, Vec3],
  options?: ShapeOptions,
): void {
  quad(
    context.writer,
    pointsMm.map((point) => point.map(mm) as unknown as Vec3) as unknown as [
      Vec3,
      Vec3,
      Vec3,
      Vec3,
    ],
    material(context, options),
    transform(context),
  );
}

export function transformedPointMm(
  pointMm: readonly [number, number, number],
  placement: PropPlacement,
): readonly [number, number, number] {
  const world = transformPoint(
    pointMm.map(mm) as unknown as Vec3,
    transform({ writer: {} as MeshWriter, placement }),
  );
  return world.map((value) => Math.round(value * 1000)) as [number, number, number];
}
