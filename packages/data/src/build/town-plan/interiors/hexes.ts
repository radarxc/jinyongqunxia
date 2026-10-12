import { townPlanNotImplemented } from '../types';
import type { FixtureTuple, RectMm } from '../types';

export interface InteriorHex { readonly q: number; readonly r: number }

export function reachableInteriorHexes(
  _floors: readonly RectMm[], _fixtures: readonly FixtureTuple[], _start: InteriorHex,
): readonly InteriorHex[] {
  return townPlanNotImplemented('reachableInteriorHexes');
}
