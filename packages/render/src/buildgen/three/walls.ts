import type {
  BuildKitView,
  CellPayload,
  CityWallView,
  MeshWriter,
  PickBounds,
  VertexInput,
} from '../types';
import { MeshBufferBuilder } from '../mesher/core/buffer';
import { quad, type Vec3 } from '../mesher/core/prims';
import { mergeCellPayload } from './payloads';

function cellId(x: number, z: number): number {
  return ((((x + 32_768) & 0xffff) << 16) | ((z + 32_768) & 0xffff)) >>> 0;
}
function emptyMesh() {
  return new MeshBufferBuilder(1, 1).finish();
}
function emptyCell(cell: number, lod: 0 | 1): CellPayload {
  return {
    cell,
    lod,
    shell: emptyMesh(),
    roof: emptyMesh(),
    doors: new Float32Array(),
    signs: new Float32Array(),
    units: new Uint16Array(),
    hanging: new Uint32Array(),
  };
}
function materialLayer(kit: BuildKitView): number {
  for (const candidate of ['citywall', 'stone_rubble', 'earth_plaster']) {
    const index = kit.layers.findIndex((layer) => layer.id === candidate);
    if (index >= 0) return index;
  }
  return 0;
}
function addCap(
  writer: MeshWriter,
  points: readonly [Vec3, Vec3, Vec3, Vec3],
  material: Omit<VertexInput, 'position' | 'normal'>,
): void {
  quad(writer, points, material);
}
function addWallBox(
  writer: MeshWriter,
  topWriter: MeshWriter,
  ax: number,
  az: number,
  bx: number,
  bz: number,
  baseM: number,
  heightM: number,
  thicknessM: number,
  unit: number,
  layer: number,
): void {
  const dx = bx - ax,
    dz = bz - az;
  const length = Math.hypot(dx, dz);
  if (length <= 1e-6) return;
  const px = ((-dz / length) * thicknessM) / 2,
    pz = ((dx / length) * thicknessM) / 2;
  const y0 = baseM,
    y1 = baseM + heightM;
  const a0: Vec3 = [ax + px, y0, az + pz],
    a1: Vec3 = [ax - px, y0, az - pz];
  const b0: Vec3 = [bx + px, y0, bz + pz],
    b1: Vec3 = [bx - px, y0, bz - pz];
  const A0: Vec3 = [a0[0], y1, a0[2]],
    A1: Vec3 = [a1[0], y1, a1[2]];
  const B0: Vec3 = [b0[0], y1, b0[2]],
    B1: Vec3 = [b1[0], y1, b1[2]];
  const material = { layer, ao: 210, flags: 0, facade: 0, unit, localGroundM: baseM };
  addCap(writer, [a0, b0, B0, A0], material);
  addCap(writer, [b1, a1, A1, B1], material);
  addCap(writer, [a1, a0, A0, A1], material);
  addCap(writer, [b0, b1, B1, B0], material);
  addCap(topWriter, [A0, B0, B1, A1], material);
  addCap(writer, [a1, b1, b0, a0], material);
}
function solidRanges(wall: CityWallView, segment: number, lengthMm: number): number[] {
  const cuts = wall.gates
    .filter((gate) => gate.seg === segment)
    .map(
      (gate) =>
        [
          Math.max(0, gate.offsetMm - gate.widthMm / 2),
          Math.min(lengthMm, gate.offsetMm + gate.widthMm / 2),
        ] as const,
    )
    .filter(([start, end]) => end > start)
    .sort((a, b) => a[0] - b[0]);
  const result: number[] = [];
  let cursor = 0;
  for (const [start, end] of cuts) {
    if (start > cursor) result.push(cursor, start);
    cursor = Math.max(cursor, end);
  }
  if (cursor < lengthMm) result.push(cursor, lengthMm);
  return result;
}

/** Per-cell wall fragments for picking/occlusion; unlike measure bounds these never span a court. */
export function createWallPickBounds(
  walls: readonly CityWallView[],
  unitBase: number,
  cellSizeM: number,
): PickBounds[] {
  const result: PickBounds[] = [];
  for (let wallIndex = 0; wallIndex < walls.length; wallIndex += 1) {
    const wall = walls[wallIndex]!;
    const segmentCount = wall.closed ? wall.points.length : wall.points.length - 1;
    for (let segment = 0; segment < segmentCount; segment += 1) {
      const start = wall.points[segment]!,
        end = wall.points[(segment + 1) % wall.points.length]!;
      const dx = end[0] - start[0],
        dz = end[1] - start[1],
        lengthMm = Math.hypot(dx, dz);
      if (lengthMm <= 0) continue;
      const half = wall.thicknessMm / 2000;
      const xPad = Math.abs(dz / lengthMm) * half,
        zPad = Math.abs(dx / lengthMm) * half;
      const ranges = solidRanges(wall, segment, lengthMm);
      for (let range = 0; range < ranges.length; range += 2) {
        const from = ranges[range]!,
          to = ranges[range + 1]!;
        const pieces = Math.max(1, Math.ceil((to - from) / (cellSizeM * 1000)));
        for (let piece = 0; piece < pieces; piece += 1) {
          const a = from + ((to - from) * piece) / pieces;
          const b = from + ((to - from) * (piece + 1)) / pieces;
          const ax = (start[0] + (dx * a) / lengthMm) / 1000;
          const az = (start[1] + (dz * a) / lengthMm) / 1000;
          const bx = (start[0] + (dx * b) / lengthMm) / 1000;
          const bz = (start[1] + (dz * b) / lengthMm) / 1000;
          result.push({
            unit: unitBase + wallIndex,
            bounds: [
              Math.min(ax, bx) - xPad,
              0,
              Math.min(az, bz) - zPad,
              Math.max(ax, bx) + xPad,
              wall.heightMm / 1000,
              Math.max(az, bz) + zPad,
            ],
          });
        }
      }
    }
  }
  return result;
}

/** Three-layer adapter until the r7 detailed city-wall recipe is available. */
export function generateWallCells(
  walls: readonly CityWallView[],
  kit: BuildKitView,
  lod: 0 | 1,
  cellSizeM: number,
  unitBase: number,
): CellPayload[] {
  const cells = new Map<number, CellPayload>();
  const layer = materialLayer(kit);
  for (let wallIndex = 0; wallIndex < walls.length; wallIndex += 1) {
    const wall = walls[wallIndex]!;
    const segmentCount = wall.closed ? wall.points.length : wall.points.length - 1;
    for (let segment = 0; segment < segmentCount; segment += 1) {
      const start = wall.points[segment]!,
        end = wall.points[(segment + 1) % wall.points.length]!;
      const dx = end[0] - start[0],
        dz = end[1] - start[1];
      const lengthMm = Math.hypot(dx, dz);
      if (lengthMm <= 0) continue;
      const ranges = solidRanges(wall, segment, lengthMm);
      for (let range = 0; range < ranges.length; range += 2) {
        const from = ranges[range]!,
          to = ranges[range + 1]!;
        const pieces = Math.max(1, Math.ceil((to - from) / (cellSizeM * 1000)));
        for (let piece = 0; piece < pieces; piece += 1) {
          const a = from + ((to - from) * piece) / pieces;
          const b = from + ((to - from) * (piece + 1)) / pieces;
          const ax = (start[0] + (dx * a) / lengthMm) / 1000;
          const az = (start[1] + (dz * a) / lengthMm) / 1000;
          const bx = (start[0] + (dx * b) / lengthMm) / 1000;
          const bz = (start[1] + (dz * b) / lengthMm) / 1000;
          const id = cellId(
            Math.floor((ax + bx) / 2 / cellSizeM),
            Math.floor((az + bz) / 2 / cellSizeM),
          );
          const writer = new MeshBufferBuilder(),
            topWriter = new MeshBufferBuilder();
          addWallBox(
            writer,
            topWriter,
            ax,
            az,
            bx,
            bz,
            0,
            wall.heightMm / 1000,
            wall.thicknessMm / 1000,
            unitBase + wallIndex,
            layer,
          );
          const fragment = {
            ...emptyCell(id, lod),
            shell: writer.finish(),
            roof: topWriter.finish(),
            units: new Uint16Array([unitBase + wallIndex]),
          };
          const previous = cells.get(id);
          cells.set(id, previous ? mergeCellPayload(previous, fragment) : fragment);
        }
      }
    }
  }
  return [...cells.values()];
}
