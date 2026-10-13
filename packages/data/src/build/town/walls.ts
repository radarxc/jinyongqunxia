import { floorDivInt } from '@tianshu/shared';
import type { RegionObject, TownWall } from '../../schemas/region-map';
import { HEX_DIRECTIONS, cellCentreMm } from './frame';
import { canTraverseBuildingEdge } from './geometry';
import type { CellState, TownSourceGate, TownWork } from './types';

function insidePolygon(
  point: readonly [number, number],
  polygon: readonly (readonly [number, number])[],
): boolean {
  let inside = false;
  for (
    let current = 0, previous = polygon.length - 1;
    current < polygon.length;
    previous = current, current += 1
  ) {
    const [cx, cz] = polygon[current]!;
    const [px, pz] = polygon[previous]!;
    if (cz > point[1] !== pz > point[1]) {
      const left = (point[0] - cx) * (pz - cz);
      const right = (px - cx) * (point[1] - cz);
      if (pz > cz ? left < right : left > right) inside = !inside;
    }
  }
  return inside;
}
function segmentPoint(
  points: readonly (readonly [number, number])[],
  gate: TownSourceGate,
  beyondMm = 0,
): readonly [number, number] {
  const start = points[gate.seg]!;
  const end = points[(gate.seg + 1) % points.length]!;
  const dx = end[0] - start[0];
  const dz = end[1] - start[1];
  const length = Math.max(Math.abs(dx), Math.abs(dz));
  const along = gate.offsetMm + beyondMm;
  return [start[0] + floorDivInt(dx * along, length), start[1] + floorDivInt(dz * along, length)];
}
function normal(
  points: readonly (readonly [number, number])[],
  gate: TownSourceGate,
): readonly [number, number] {
  const start = points[gate.seg]!;
  const end = points[(gate.seg + 1) % points.length]!;
  const dx = end[0] - start[0];
  const dz = end[1] - start[1];
  let area2 = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index]!;
    const next = points[(index + 1) % points.length]!;
    area2 += current[0] * next[1] - next[0] * current[1];
  }
  if (area2 === 0) throw new Error('TOWN_COMPILE_WALL_ZERO_AREA');
  // In x/z coordinates a positive winding has its interior on the left.
  const outwardX = area2 > 0 ? dz : -dz;
  const outwardZ = area2 > 0 ? -dx : dx;
  return Math.abs(outwardX) >= Math.abs(outwardZ)
    ? [outwardX >= 0 ? 1 : -1, 0]
    : [0, outwardZ >= 0 ? 1 : -1];
}
function makeObject(
  id: string,
  kind: 'spawn' | 'exit',
  cell: CellState,
  gate: TownSourceGate,
  side: 'north' | 'east' | 'south' | 'west',
): RegionObject {
  const base = {
    id,
    q: cell.q,
    r: cell.r,
    h: cell.height,
    cells: [{ q: cell.q, r: cell.r, h: cell.height }],
  };
  if (kind === 'spawn')
    return { ...base, class: 'PlayerSpawn', safe: true, entry: gate.id === 'road_entry' };
  return {
    ...base,
    class: 'Exit',
    gateId: gate.id,
    spawnId: `spawn_${gate.id}`,
    side,
    nameKey: `town.gate.${gate.id.replaceAll('_', '-')}`,
  };
}
function sideFor(normalX: number, normalZ: number): 'north' | 'east' | 'south' | 'west' {
  return Math.abs(normalX) >= Math.abs(normalZ)
    ? normalX >= 0
      ? 'east'
      : 'west'
    : normalZ >= 0
      ? 'south'
      : 'north';
}
function gateBoundaryEdge(
  work: TownWork,
  polygon: readonly (readonly [number, number])[],
  centre: readonly [number, number],
): readonly [outside: CellState, inside: CellState] {
  const candidates: { outside: CellState; inside: CellState; score: number }[] = [];
  for (const outside of work.cells.values()) {
    if (outside.blocked || outside.building !== 0 || outside.surface !== 'threshold') continue;
    if (insidePolygon(cellCentreMm(outside), polygon)) continue;
    for (const [dq, dr] of HEX_DIRECTIONS) {
      const inside = work.cells.get(`${outside.q + dq},${outside.r + dr}`);
      if (
        inside === undefined ||
        inside.blocked ||
        inside.building !== 0 ||
        inside.surface !== 'threshold' ||
        !insidePolygon(cellCentreMm(inside), polygon) ||
        !canTraverseBuildingEdge(outside, inside, work.plans)
      )
        continue;
      const [ox, oz] = cellCentreMm(outside);
      const [ix, iz] = cellCentreMm(inside);
      const dx = ox + ix - centre[0] * 2;
      const dz = oz + iz - centre[1] * 2;
      candidates.push({ outside, inside, score: dx * dx + dz * dz });
    }
  }
  candidates.sort(
    (a, b) =>
      a.score - b.score ||
      a.outside.r - b.outside.r ||
      a.outside.q - b.outside.q ||
      a.inside.r - b.inside.r ||
      a.inside.q - b.inside.q,
  );
  const edge = candidates[0];
  if (edge === undefined) throw new Error('TOWN_COMPILE_GATE_NO_BOUNDARY_EDGE');
  return [edge.outside, edge.inside];
}
function walkInward(
  work: TownWork,
  polygon: readonly (readonly [number, number])[],
  start: CellState,
  normalX: number,
  normalZ: number,
): CellState {
  let previous: CellState | undefined;
  let current = start;
  for (let step = 0; step < 2; step += 1) {
    const next = HEX_DIRECTIONS.map(([dq, dr]) =>
      work.cells.get(`${current.q + dq},${current.r + dr}`),
    )
      .filter(
        (cell): cell is CellState =>
          cell !== undefined &&
          cell !== previous &&
          cell.building === 0 &&
          !cell.blocked &&
          insidePolygon(cellCentreMm(cell), polygon) &&
          canTraverseBuildingEdge(current, cell, work.plans),
      )
      .sort((a, b) => {
        const [ax, az] = cellCentreMm(a);
        const [bx, bz] = cellCentreMm(b);
        return (
          (ax - bx) * normalX + (az - bz) * normalZ || a.r - b.r || a.q - b.q
        );
      })[0];
    if (next === undefined) throw new Error('TOWN_COMPILE_GATE_NO_INWARD_PATH');
    previous = current;
    current = next;
  }
  return current;
}
function emitSyntheticEntry(work: TownWork): void {
  const first = [...work.cells.values()]
    .filter((cell) => !cell.blocked)
    .sort((a, b) => a.r - b.r || a.q - b.q)[0];
  if (first === undefined) throw new Error('TOWN_COMPILE_NO_ENTRY_CELL');
  const inside =
    HEX_DIRECTIONS.map(([dq, dr]) => work.cells.get(`${first.q + dq},${first.r + dr}`)).find(
      (cell) => cell !== undefined && !cell.blocked && cell.building === 0,
    ) ?? first;
  const gate = {
    id: 'road_entry',
    seg: 0,
    offsetMm: 0,
    widthMm: 1_000,
    kind: 'gate',
  } as const;
  const [outsideX, outsideZ] = cellCentreMm(first);
  const [insideX, insideZ] = cellCentreMm(inside);
  const side = sideFor(outsideX - insideX, outsideZ - insideZ);
  work.diagnostics.push({
    code: 'TOWN_SYNTHETIC_ENTRY',
    severity: 'warning',
    message: 'source has no city wall; emitted road_entry at the first walkable boundary pair',
  });
  work.objects.push(makeObject('spawn_road_entry', 'spawn', inside, gate, side));
  work.objects.push(makeObject('exit_road_entry', 'exit', first, gate, side));
  work.primarySpawnId = 'spawn_road_entry';
}

export function compileWalls(work: TownWork): TownWall[] {
  const sources = work.input.source.walls;
  if (sources.length === 0) {
    emitSyntheticEntry(work);
    return [];
  }
  const walls: TownWall[] = sources.map((source) => ({
    id: source.id,
    points: [...source.points],
    closed: source.closed,
    heightMm: source.heightMm,
    thicknessMm: source.thicknessMm,
    gates: source.gates.map(({ seg, offsetMm, widthMm, kind }) => ({
      seg, offsetMm, widthMm, kind,
    })),
  }));
  const cells = [...work.cells.values()];
  for (const source of sources) {
    rasterizeWallCells(cells, source.points, source.closed, source.thicknessMm, source.heightMm);
    for (const gate of source.gates) openGate(work, source.points, gate);
  }
  const gates = sources.flatMap((source) =>
    source.gates.filter(({ kind }) => kind !== 'water').map((gate) => ({ source, gate })),
  );
  for (const [gateIndex, { source, gate }] of gates.entries()) {
    const centre = segmentPoint(source.points, gate);
    const [nx, nz] = normal(source.points, gate);
    const [outside, innerEdge] = gateBoundaryEdge(work, source.points, centre);
    const inside = walkInward(work, source.points, innerEdge, nx, nz);
    const side = sideFor(nx, nz);
    const spawnId = `spawn_${gate.id}`;
    work.objects.push(makeObject(spawnId, 'spawn', inside, gate, side));
    work.objects.push(makeObject(`exit_${gate.id}`, 'exit', outside, gate, side));
    if (gateIndex === 0) work.primarySpawnId = spawnId;
  }
  if (gates.length === 0) throw new Error('TOWN_COMPILE_NO_LAND_GATE');
  return walls;
}

function rasterizeWallCells(
  cells: readonly CellState[],
  points: readonly (readonly [number, number])[],
  closed: boolean,
  thicknessMm: number,
  heightMm: number,
): void {
  const limit = closed ? points.length : points.length - 1;
  const radius = floorDivInt(thicknessMm, 2);
  for (const cell of cells) {
    if (cell.building !== 0) continue;
    const point = cellCentreMm(cell);
    let covered = false;
    for (let segment = 0; segment < limit && !covered; segment += 1)
      covered = withinSegmentBand(
        point,
        points[segment]!,
        points[(segment + 1) % points.length]!,
        radius,
      );
    if (covered) {
      cell.terrain = 'tr_chengqiang';
      cell.surface = 'wall_top';
      cell.height = Math.min(10, floorDivInt(heightMm + 500, 1_000));
      cell.blocked = true;
    }
  }
}
function withinSegmentBand(
  point: readonly [number, number],
  start: readonly [number, number],
  end: readonly [number, number],
  radius: number,
): boolean {
  const vx = BigInt(end[0] - start[0]);
  const vz = BigInt(end[1] - start[1]);
  const wx = BigInt(point[0] - start[0]);
  const wz = BigInt(point[1] - start[1]);
  const length2 = vx * vx + vz * vz;
  const radius2 = BigInt(radius) * BigInt(radius);
  if (length2 === 0n) return wx * wx + wz * wz <= radius2;
  const projection = wx * vx + wz * vz;
  if (projection <= 0n) return wx * wx + wz * wz <= radius2;
  if (projection >= length2) {
    const ex = BigInt(point[0] - end[0]);
    const ez = BigInt(point[1] - end[1]);
    return ex * ex + ez * ez <= radius2;
  }
  const cross = vx * wz - vz * wx;
  return cross * cross <= radius2 * length2;
}
function openGate(
  work: TownWork,
  points: readonly (readonly [number, number])[],
  gate: TownSourceGate,
): void {
  const start = points[gate.seg]!;
  const end = points[(gate.seg + 1) % points.length]!;
  const vx = BigInt(end[0] - start[0]);
  const vz = BigInt(end[1] - start[1]);
  const length2 = vx * vx + vz * vz;
  const half = BigInt(floorDivInt(gate.widthMm, 2));
  const centre = segmentPoint(points, gate);
  for (const cell of work.cells.values()) {
    const [x, z] = cellCentreMm(cell);
    const dx = BigInt(x - centre[0]);
    const dz = BigInt(z - centre[1]);
    const along = dx * vx + dz * vz;
    if (cell.terrain === 'tr_chengqiang' && along * along <= half * half * length2) {
      cell.height = 0;
      cell.blocked = gate.kind === 'water';
      cell.terrain = gate.kind === 'water' ? 'tr_shenshui' : 'tr_pingdi';
      cell.surface = gate.kind === 'water' ? 'water' : 'threshold';
    }
  }
}
