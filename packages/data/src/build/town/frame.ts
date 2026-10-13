import { floorDivInt } from '@tianshu/shared';
import { hexCentreMm, type PlanningFrame } from '../town-plan';
import type { AxialPoint, CellState, TownLayout } from './types';

export const CELL_MM = 1_000;
export const HEX_DIRECTIONS = [
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
] as const;

export interface TownFrame {
  readonly planning: PlanningFrame;
  readonly qMin: number;
  readonly rMin: number;
  readonly width: number;
  readonly height: number;
}

export function createTownFrame(layout: TownLayout): TownFrame {
  const partition = layout.runtime_partition;
  if (partition.q_slot_count > 256 || partition.r_slot_count > 256)
    throw new RangeError('TOWN_COMPILE_FRAME_TOO_LARGE');
  return {
    planning: { heightCells: layout.grid.height, originXMm: 0, originZMm: 0 },
    qMin: partition.q_min,
    rMin: partition.r_min,
    width: partition.q_slot_count,
    height: partition.r_slot_count,
  };
}

export const rawKey = (q: number, r: number): string => `${q},${r}`;
export const localKey = (q: number, r: number): string => `${q},${r}`;
export function localHex(frame: TownFrame, point: AxialPoint): AxialPoint {
  return { q: point.q - frame.qMin, r: point.r - frame.rMin };
}
export function rawHex(frame: TownFrame, point: AxialPoint): AxialPoint {
  return { q: point.q + frame.qMin, r: point.r + frame.rMin };
}
export function planningCellAtHex(layout: TownLayout, rawQ: number, rawR: number): GridCell {
  const [xMm] = hexCentreMm(rawQ, rawR);
  const x = clamp(floorDivInt(xMm, CELL_MM), 0, layout.grid.width - 1);
  const z = clamp(layout.grid.height - rawR, 0, layout.grid.height - 1);
  return { x, z };
}
export interface GridCell {
  readonly x: number;
  readonly z: number;
}
function clamp(value: number, low: number, high: number): number {
  return value < low ? low : value > high ? high : value;
}

export function cellCentreMm(cell: Pick<CellState, 'rawQ' | 'rawR'>): readonly [number, number] {
  return hexCentreMm(cell.rawQ, cell.rawR);
}
export function hexDistance(a: AxialPoint, b: AxialPoint): number {
  const dq = a.q - b.q;
  const dr = a.r - b.r;
  return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));
}
