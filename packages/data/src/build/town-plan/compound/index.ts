import { townPlanNotImplemented } from '../types';
import type { PartTuple, RectMm } from '../types';

export interface CompoundLayout {
  readonly parts: readonly PartTuple[];
  readonly floors: readonly RectMm[];
  readonly floorY: readonly number[];
}

export function layoutCompound(_bounds: RectMm): CompoundLayout {
  return townPlanNotImplemented('layoutCompound');
}
