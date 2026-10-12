import { transformNormal, transformPoint, type PrimitiveMaterial, type Vec3 } from '../core/prims';
import type { MeshWriter, Yaw4 } from '../../types';

export interface RoofPatchSample {
  readonly u: number;
  readonly t: number;
  readonly point: Vec3;
}
export type RoofPatchDeformer = (sample: RoofPatchSample) => Vec3;
export interface RoofPatchOptions {
  readonly eaveLine: readonly [Vec3, Vec3];
  readonly ridgeLine: readonly [Vec3, Vec3];
  readonly heightAt: (t: number) => number;
  /** Horizontal interpolation fraction. Defaults to t; use a piecewise curve for an eave tail. */
  readonly horizontalAt?: ((t: number) => number) | undefined;
  /** Uniform refinement request. Values below the one-metre baseline cannot reduce it. */
  readonly uSegments?: number | undefined;
  /** Complete, normalized eave stations for local refinement (for example wing corners). */
  readonly uStations?: readonly number[] | undefined;
  readonly tSegments: number;
  /** Explicit eave-to-ridge rows. Structural callers use this to preserve every fold. */
  readonly tStations?: readonly number[] | undefined;
  readonly deform?: RoofPatchDeformer | undefined;
  readonly material?: PrimitiveMaterial | undefined;
  readonly normalSign?: 1 | -1 | undefined;
  readonly origin?: Vec3 | undefined;
  readonly yaw?: Yaw4 | undefined;
}
export interface RoofPatchMesh {
  readonly rows: number;
  readonly columns: number;
  readonly uStations: readonly number[];
  readonly tStations: readonly number[];
  readonly points: readonly Vec3[];
}

function distance(a: Vec3, b: Vec3): number {
  const x = b[0] - a[0];
  const y = b[1] - a[1];
  const z = b[2] - a[2];
  return Math.sqrt(x * x + y * y + z * z);
}
function mix(a: Vec3, b: Vec3, amount: number): Vec3 {
  return [
    a[0] + (b[0] - a[0]) * amount,
    a[1] + (b[1] - a[1]) * amount,
    a[2] + (b[2] - a[2]) * amount,
  ];
}
function validSegments(value: number): boolean {
  return Number.isInteger(value) && value >= 1;
}
function uniformStations(segments: number): readonly number[] {
  return Array.from({ length: segments + 1 }, (_, index) => index / segments);
}
function validatedUStations(stations: readonly number[], eaveLengthM: number): readonly number[] {
  if (
    stations.length < 2 ||
    stations[0] !== 0 ||
    stations.at(-1) !== 1 ||
    stations.some(
      (value, index) =>
        !Number.isFinite(value) ||
        value < 0 ||
        value > 1 ||
        (index > 0 && value <= stations[index - 1]!),
    )
  )
    throw new RangeError('BUILDGEN_ROOF_INVALID_U_STATIONS');
  if (
    stations.some(
      (value, index) => index > 0 && (value - stations[index - 1]!) * eaveLengthM > 1 + 1e-9,
    )
  )
    throw new RangeError('BUILDGEN_ROOF_U_STATION_GAP');
  return [...stations];
}

/** One-metre baseline plus `perCorner` local stations inside each end zone. */
export function cornerUStations(
  eaveLengthMm: number,
  cornerZoneMm: number,
  perCorner = 3,
): readonly number[] {
  if (!Number.isFinite(eaveLengthMm) || eaveLengthMm <= 0)
    throw new RangeError('BUILDGEN_ROOF_INVALID_EAVE_LENGTH');
  if (!Number.isFinite(cornerZoneMm) || cornerZoneMm <= 0 || cornerZoneMm * 2 > eaveLengthMm)
    throw new RangeError('BUILDGEN_ROOF_INVALID_CORNER_ZONE');
  if (!validSegments(perCorner)) throw new RangeError('BUILDGEN_ROOF_INVALID_CORNER_COUNT');
  const stations = [...uniformStations(Math.ceil(eaveLengthMm / 1000))];
  const zoneFraction = cornerZoneMm / eaveLengthMm;
  for (let index = 1; index <= perCorner; index += 1) {
    const offset = (zoneFraction * index) / (perCorner + 1);
    stations.push(offset, 1 - offset);
  }
  stations.sort((a, b) => a - b);
  return stations.filter(
    (value, index) => index === 0 || Math.abs(value - stations[index - 1]!) > 1e-12,
  );
}

/** Samples one roof surface in row-major order: t rows (eave -> ridge), u columns. */
export function sampleRoofPatch(options: RoofPatchOptions): RoofPatchMesh {
  if (!validSegments(options.tSegments)) throw new RangeError('BUILDGEN_ROOF_INVALID_T_SEGMENTS');
  const tStations =
    options.tStations ??
    Array.from({ length: options.tSegments + 1 }, (_, row) => row / options.tSegments);
  if (
    tStations.length < 2 ||
    tStations[0] !== 0 ||
    tStations.at(-1) !== 1 ||
    tStations.some(
      (value, index) => !Number.isFinite(value) || (index > 0 && value <= tStations[index - 1]!),
    )
  )
    throw new RangeError('BUILDGEN_ROOF_INVALID_T_STATIONS');
  const eaveLength = distance(options.eaveLine[0], options.eaveLine[1]);
  if (!(eaveLength > 0)) throw new RangeError('BUILDGEN_ROOF_DEGENERATE_PATCH');
  if (options.uSegments !== undefined && !validSegments(options.uSegments))
    throw new RangeError('BUILDGEN_ROOF_INVALID_U_SEGMENTS');
  const uStations = options.uStations
    ? validatedUStations(options.uStations, eaveLength)
    : uniformStations(Math.max(Math.ceil(eaveLength), options.uSegments ?? 1));
  const points: Vec3[] = [];
  for (const t of tStations) {
    for (const u of uStations) {
      const horizontalT = options.horizontalAt?.(t) ?? t;
      if (!Number.isFinite(horizontalT) || horizontalT < 0 || horizontalT > 1)
        throw new RangeError('BUILDGEN_ROOF_INVALID_HORIZONTAL_PROFILE');
      const horizontal = mix(
        mix(options.eaveLine[0], options.eaveLine[1], u),
        mix(options.ridgeLine[0], options.ridgeLine[1], u),
        horizontalT,
      );
      const point: Vec3 = [horizontal[0], options.heightAt(t), horizontal[2]];
      points.push(options.deform?.({ u, t, point }) ?? point);
    }
  }
  return { rows: tStations.length, columns: uStations.length, uStations, tStations, points };
}

/** tech/16 default: two t segments per structural step plus two for the eave tail. */
export function roofPatchTSegments(steps: number, lod: 0 | 1 = 0): number {
  if (!validSegments(steps)) throw new RangeError('BUILDGEN_ROOF_INVALID_STEPS');
  void lod;
  return steps * 2 + 2;
}

/** Two rows in the eave tail and two rows in every structural fold interval. */
export function roofPatchTStations(steps: number, tailFraction: number): readonly number[] {
  if (!validSegments(steps) || !(tailFraction > 0 && tailFraction < 1))
    throw new RangeError('BUILDGEN_ROOF_INVALID_T_STATIONS');
  const stations = [0, tailFraction / 2, tailFraction];
  for (let step = 1; step <= steps; step += 1) {
    const previous = tailFraction + ((1 - tailFraction) * (step - 1)) / steps;
    const next = step === steps ? 1 : tailFraction + ((1 - tailFraction) * step) / steps;
    stations.push((previous + next) / 2, next);
  }
  return stations;
}

function subtract(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function normalFrom(du: Vec3, dt: Vec3): Vec3 {
  let x = du[1] * dt[2] - du[2] * dt[1];
  let y = du[2] * dt[0] - du[0] * dt[2];
  let z = du[0] * dt[1] - du[1] * dt[0];
  if (y < 0) {
    x = -x;
    y = -y;
    z = -z;
  }
  const length = Math.sqrt(x * x + y * y + z * z);
  if (length <= Number.EPSILON) throw new RangeError('BUILDGEN_ROOF_DEGENERATE_PATCH');
  return [x / length, y / length, z / length];
}

/** Writes a shared-vertex curved grid with metre UVs: u along eave, v along slope arc. */
export function writeRoofPatch(writer: MeshWriter, options: RoofPatchOptions): RoofPatchMesh {
  const mesh = sampleRoofPatch(options);
  const base = writer.vertexCount;
  const arcs = new Array<number>(mesh.points.length).fill(0);
  for (let row = 1; row < mesh.rows; row += 1)
    for (let column = 0; column < mesh.columns; column += 1) {
      const at = row * mesh.columns + column;
      arcs[at] =
        arcs[at - mesh.columns]! + distance(mesh.points[at - mesh.columns]!, mesh.points[at]!);
    }
  const eaveLength = distance(options.eaveLine[0], options.eaveLine[1]);
  for (let row = 0; row < mesh.rows; row += 1)
    for (let column = 0; column < mesh.columns; column += 1) {
      const at = row * mesh.columns + column;
      const left = mesh.points[row * mesh.columns + Math.max(0, column - 1)]!;
      const right = mesh.points[row * mesh.columns + Math.min(mesh.columns - 1, column + 1)]!;
      const down = mesh.points[Math.max(0, row - 1) * mesh.columns + column]!;
      const up = mesh.points[Math.min(mesh.rows - 1, row + 1) * mesh.columns + column]!;
      const point = transformPoint(mesh.points[at]!, { origin: options.origin, yaw: options.yaw });
      const rawNormal = normalFrom(subtract(right, left), subtract(up, down));
      const sign = options.normalSign ?? 1;
      const normal = transformNormal(
        [rawNormal[0] * sign, rawNormal[1] * sign, rawNormal[2] * sign],
        options.yaw,
      );
      const material = options.material ?? {};
      writer.addVertex({
        ...material,
        position: point,
        normal,
        uv: [eaveLength * mesh.uStations[column]!, arcs[at]!],
        localHeightCm: Math.max(0, Math.round((point[1] - (material.localGroundM ?? 0)) * 100)),
      });
    }
  for (let row = 0; row < mesh.rows - 1; row += 1)
    for (let column = 0; column < mesh.columns - 1; column += 1) {
      const a = base + row * mesh.columns + column;
      const b = a + 1;
      const d = a + mesh.columns;
      const c = d + 1;
      const du = subtract(
        mesh.points[row * mesh.columns + column + 1]!,
        mesh.points[row * mesh.columns + column]!,
      );
      const dt = subtract(
        mesh.points[(row + 1) * mesh.columns + column]!,
        mesh.points[row * mesh.columns + column]!,
      );
      const crossY = du[2] * dt[0] - du[0] * dt[2];
      const reverse = crossY * (options.normalSign ?? 1) < 0;
      if (reverse) {
        writer.addTriangle(a, c, b);
        writer.addTriangle(a, d, c);
      } else {
        writer.addTriangle(a, b, c);
        writer.addTriangle(a, c, d);
      }
    }
  return mesh;
}
