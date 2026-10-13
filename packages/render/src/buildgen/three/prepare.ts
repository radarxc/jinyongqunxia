import { generateCells } from '../mesher/generate';
import type { BuildingLayerInput, CellPayload } from '../types';
import { mergeCellPayload, withoutHangingSignTriangles } from './payloads';
import { generateWallCells } from './walls';

export interface LayerPayloads {
  readonly payloads: CellPayload[];
  /** Unit ids are dense: plans, then compound parts, then city-wall segments. */
  readonly units: number;
  readonly wallUnitBase: number;
}

/** Buildings and city walls generated on the main thread, then merged into one payload per cell. */
export function prepareLayerPayloads(
  input: BuildingLayerInput,
  lod: 0 | 1,
  cellSizeM: number,
): LayerPayloads {
  const buildingCells = generateCells(input.plans, input.kit, lod, cellSizeM).map(
    withoutHangingSignTriangles,
  );
  const partCount = input.plans.reduce((count, plan) => count + (plan.parts?.length ?? 0), 0);
  const wallUnitBase = input.plans.length + partCount;
  const wallCells = generateWallCells(input.walls, input.kit, lod, cellSizeM, wallUnitBase);
  const byCell = new Map<number, CellPayload>();
  for (const cell of [...buildingCells, ...wallCells]) {
    const previous = byCell.get(cell.cell);
    byCell.set(cell.cell, previous ? mergeCellPayload(previous, cell) : cell);
  }
  const payloads = [...byCell.values()];
  let maxUnit = wallUnitBase + input.walls.length - 1;
  for (const cell of payloads) for (const unit of cell.units) maxUnit = Math.max(maxUnit, unit);
  return { payloads, units: Math.max(0, maxUnit + 1), wallUnitBase };
}
