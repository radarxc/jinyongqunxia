import { buildgenNotImplemented, type BuildingPlanView, type RecipeSink } from '../../types';

export type RoofMesher = (plan: BuildingPlanView, unitBase: number, sink: RecipeSink) => void;
export function roofMesherFor(_style: number): RoofMesher {
  return () => buildgenNotImplemented('roofMesher');
}
