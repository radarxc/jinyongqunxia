import type { BuildingLayerInput, BuildingPlanView } from '../types';

/** Plan units first, then compound parts in plan order; walls are not part of the topology. */
export interface UnitTopology {
  readonly groups: number[][];
  readonly owners: Int32Array;
  readonly kinds: Int8Array;
}
export interface UnitPlacement {
  readonly owner: number;
  readonly x: number;
  readonly z: number;
  readonly width: number;
  readonly depth: number;
  readonly yaw: number;
  readonly textKey: string;
}
export function createUnitPlacements(plans: readonly BuildingPlanView[]): UnitPlacement[] {
  const placements: UnitPlacement[] = [];
  let partUnit = plans.length;
  for (let unit = 0; unit < plans.length; unit += 1) {
    const plan = plans[unit]!;
    placements[unit] = {
      owner: unit,
      x: plan.footprint[0] / 1000,
      z: plan.footprint[1] / 1000,
      width: plan.footprint[2] / 1000,
      depth: plan.footprint[3] / 1000,
      yaw: plan.yaw,
      textKey: plan.signage?.[0] ?? '',
    };
    for (const part of plan.parts ?? [])
      placements[partUnit++] = {
        owner: unit,
        x: part[1] / 1000,
        z: part[2] / 1000,
        width: part[3] / 1000,
        depth: part[4] / 1000,
        yaw: part[5],
        textKey: plan.signage?.[0] ?? '',
      };
  }
  return placements;
}
export function createUnitTopology(input: BuildingLayerInput, units: number): UnitTopology {
  let nextPart = input.plans.length;
  const owners = new Int32Array(units);
  owners.fill(-1);
  const kinds = new Int8Array(units);
  kinds.fill(-1);
  const groups = input.plans.map((plan, unit) => {
    const result = [unit];
    owners[unit] = unit;
    for (const part of plan.parts ?? []) {
      owners[nextPart] = unit;
      kinds[nextPart] = part[0];
      result.push(nextPart++);
    }
    return result;
  });
  return { groups, owners, kinds };
}
