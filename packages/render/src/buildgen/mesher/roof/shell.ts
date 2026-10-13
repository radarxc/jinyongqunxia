import type { MeshWriter } from '../../types';
import { quad, type PrimitiveMaterial, type Vec3 } from '../core/prims';
import { writeRoofPatch, type RoofPatchMesh, type RoofPatchOptions } from './patch';

export const DEFAULT_SHELL_THICKNESS_MM = 180;
export const EAVE_FASCIA_MM = 120;

export interface RoofShellOptions extends RoofPatchOptions {
  readonly thicknessMm?: number | undefined;
  readonly undersideMaterial?: PrimitiveMaterial | undefined;
  readonly fasciaMaterial?: PrimitiveMaterial | undefined;
  readonly bargeboardMaterial?: PrimitiveMaterial | undefined;
  readonly closeVerges?: boolean | undefined;
  /** Optional 250 mm bargeboard on both gable edges. */
  readonly bargeboardMm?: number | undefined;
}

function transformed(point: Vec3, options: RoofShellOptions): Vec3 {
  const [x, y, z] = point;
  const [ox, oy, oz] = options.origin ?? [0, 0, 0];
  switch (options.yaw ?? 0) {
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
function lower(point: Vec3, thicknessM: number): Vec3 {
  return [point[0], point[1] - thicknessM, point[2]];
}
function strip(
  writer: MeshWriter,
  outer: readonly Vec3[],
  inner: readonly Vec3[],
  material: PrimitiveMaterial,
  options: RoofShellOptions,
): void {
  for (let index = 0; index < outer.length - 1; index += 1)
    quad(
      writer,
      [
        transformed(outer[index]!, options),
        transformed(inner[index]!, options),
        transformed(inner[index + 1]!, options),
        transformed(outer[index + 1]!, options),
      ],
      material,
    );
}
function boundary(mesh: RoofPatchMesh, row: number): Vec3[] {
  return Array.from(
    { length: mesh.columns },
    (_, column) => mesh.points[row * mesh.columns + column]!,
  );
}
function side(mesh: RoofPatchMesh, column: number): Vec3[] {
  return Array.from({ length: mesh.rows }, (_, row) => mesh.points[row * mesh.columns + column]!);
}

/** Upper tiles, 150–200 mm lower boarding, 120 mm eave fascia, and optional verge strips. */
export function writeRoofShell(writer: MeshWriter, options: RoofShellOptions): RoofPatchMesh {
  const thicknessMm = options.thicknessMm ?? DEFAULT_SHELL_THICKNESS_MM;
  if (thicknessMm < 150 || thicknessMm > 200)
    throw new RangeError('BUILDGEN_ROOF_INVALID_SHELL_THICKNESS');
  const upper = writeRoofPatch(writer, options);
  const thicknessM = thicknessMm / 1000;
  const underside = options.undersideMaterial ?? options.material ?? {};
  writeRoofPatch(writer, {
    ...options,
    heightAt: (t) => options.heightAt(t) - thicknessM,
    material: underside,
    normalSign: -1,
  });
  const eave = boundary(upper, 0);
  const eaveInner = eave.map((point) => lower(point, EAVE_FASCIA_MM / 1000));
  strip(writer, eave, eaveInner, options.fasciaMaterial ?? options.material ?? {}, options);
  if (options.closeVerges) {
    for (const edge of [side(upper, 0), side(upper, upper.columns - 1)])
      strip(
        writer,
        edge,
        edge.map((point) => lower(point, thicknessM)),
        options.bargeboardMaterial ?? options.fasciaMaterial ?? options.material ?? {},
        options,
      );
  }
  if (options.bargeboardMm !== undefined) {
    if (!(options.bargeboardMm > 0)) throw new RangeError('BUILDGEN_ROOF_INVALID_BARGEBOARD');
    const dropM = options.bargeboardMm / 1000;
    for (const edge of [side(upper, 0), side(upper, upper.columns - 1)])
      strip(
        writer,
        edge.map((point) => lower(point, thicknessM)),
        edge.map((point) => lower(point, thicknessM + dropM)),
        options.bargeboardMaterial ?? options.fasciaMaterial ?? options.material ?? {},
        options,
      );
  }
  return upper;
}
