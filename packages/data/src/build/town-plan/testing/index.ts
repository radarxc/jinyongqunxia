import { townPlanNotImplemented } from '../types';
import type { CompiledBuildKit, LayoutBuildingInput } from '../types';
import { compileKit } from '../kit/compile';

export function testBuildKit(source?: unknown): CompiledBuildKit {
  if (source === undefined) return townPlanNotImplemented('testBuildKit');
  return compileKit(source);
}

export function testLayoutBuilding(): LayoutBuildingInput {
  return townPlanNotImplemented('testLayoutBuilding');
}
