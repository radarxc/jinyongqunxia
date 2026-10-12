import type { BuildingPlanView, BuildKitRecipeView, BuildKitView } from '../../types';
import { box, prism } from '../core/prims';
import { hallOrigin, hallSizeM, kitLayer, type HallPartContext } from './platform';

export interface ColumnLayout {
  readonly bays: 1 | 3 | 5 | 7;
  readonly rows: number;
  readonly xM: readonly number[];
  readonly zM: readonly number[];
  readonly diameterM: number;
  readonly heightM: number;
  readonly hall: boolean;
}

function localFloorSizeM(plan: BuildingPlanView): readonly [number, number] | undefined {
  const floor = plan.floors[0];
  if (!floor) return undefined;
  const worldWidth = (floor[2] - floor[0]) / 1000;
  const worldDepth = (floor[3] - floor[1]) / 1000;
  return plan.yaw % 2 === 0 ? [worldWidth, worldDepth] : [worldDepth, worldWidth];
}

function structuralSpanM(interiorM: number, wallMm: number): number {
  return Math.round((interiorM + wallMm / 1000) * 20) / 20;
}

export function hallDefinition(plan: BuildingPlanView, kit: BuildKitView): BuildKitRecipeView {
  const definition = kit.archetypes[plan.archetype] ?? kit.landmarks[plan.archetype];
  if (!definition) throw new Error(`BUILDGEN_UNKNOWN_ARCHETYPE:${plan.archetype}`);
  return definition;
}

export function hallSizeKey(plan: BuildingPlanView, kit: BuildKitView) {
  const definition = hallDefinition(plan, kit);
  if (definition.size) return definition.size;
  if (definition.brackets || plan.facility === 'temple') return 'hall' as const;
  if (plan.facility === 'general_store') return 'shop' as const;
  if (plan.storeys > 1) return 'middle' as const;
  return 'vernacular' as const;
}

export function entranceClearWidthM(
  plan: BuildingPlanView,
  kit: BuildKitView,
  requestedMm: number,
): number {
  return Math.max(hallSizeKey(plan, kit) === 'hall' ? 2 : 1.2, requestedMm / 1000);
}

function bayCount(plan: BuildingPlanView, kit: BuildKitView, spanM: number): 1 | 3 | 5 | 7 {
  const declared = hallDefinition(plan, kit).bays;
  if (typeof declared === 'number' && [1, 3, 5, 7].includes(declared))
    return declared as 1 | 3 | 5 | 7;
  const shopfront =
    hallDefinition(plan, kit).front === 'shopfront' || plan.facility === 'general_store';
  if (shopfront && spanM < 5) return 1;
  if (spanM < 11) return 3;
  if (spanM < 18) return 5;
  return 7;
}

function bayRatios(bays: ColumnLayout['bays']): readonly number[] {
  if (bays === 1) return [1];
  if (bays === 3) return [0.82, 1, 0.82];
  if (bays === 5) return [0.68, 0.82, 1, 0.82, 0.68];
  return [0.68, 0.75, 0.82, 1, 0.82, 0.75, 0.68];
}

function boundaries(spanM: number, ratios: readonly number[]): number[] {
  const total = ratios.reduce((sum, value) => sum + value, 0);
  const result = [-spanM / 2];
  let cursor = -spanM / 2;
  for (const ratio of ratios) {
    cursor += (spanM * ratio) / total;
    result.push(cursor);
  }
  return result;
}

export function columnLayout(plan: BuildingPlanView, kit: BuildKitView): ColumnLayout {
  const [width, depth] = hallSizeM(plan);
  const size = hallSizeKey(plan, kit);
  const dims = kit.dims[size];
  const hall = size === 'hall';
  const heightM = dims.column / 1000;
  const diameterM = hall
    ? Math.max(0.35, Math.min(0.5, heightM / 10))
    : Math.max(0.18, Math.min(0.3, heightM / (dims.diaRatio ?? 11)));
  const floor = localFloorSizeM(plan);
  const xSpan = floor ? structuralSpanM(floor[0], kit.walls.gable.t) : width - 0.4;
  const zSpan = floor
    ? structuralSpanM(floor[1], (kit.walls.front.t + kit.walls.back.t) / 2)
    : depth - 0.4;
  const bays = bayCount(plan, kit, Math.max(0.5, xSpan));
  const xM = boundaries(Math.max(0.5, Math.min(width, xSpan)), bayRatios(bays));
  const rows = 2;
  const clearZ = floor ? floor[1] / 2 + diameterM / 2 + 0.011 : 0;
  const documentedShop = size === 'shop' && Math.abs(width - 5.92) < 0.01 && Math.abs(depth - 4.92) < 0.01;
  const zEdge = Math.max(0.25, documentedShop ? 1.65 : Math.min(depth / 2, Math.max(zSpan / 2, clearZ)));
  const zM = [-zEdge, zEdge];
  return { bays, rows, xM, zM, diameterM, heightM, hall };
}

export function columnFacadeAt(
  plan: BuildingPlanView,
  xIndex: number,
  xCount: number,
  zIndex: number,
  zCount: number,
) {
  let mask = 0;
  if (zIndex === zCount - 1) mask |= 1 << plan.yaw;
  if (xIndex === 0) mask |= 1 << ((plan.yaw + 1) % 4);
  if (zIndex === 0) mask |= 1 << ((plan.yaw + 2) % 4);
  if (xIndex === xCount - 1) mask |= 1 << ((plan.yaw + 3) % 4);
  return mask;
}

export function emitColumns(context: HallPartContext, kit: BuildKitView, lod: 0 | 1): ColumnLayout {
  const { writer, plan, unit, localGroundM } = context;
  const layout = columnLayout(plan, kit);
  const floor = (plan.elev[0] + plan.elev[1]) / 1000;
  const origin = hallOrigin(plan);
  const stoneLayer = kitLayer(kit, 'stone_dressed', 'stone_rubble', 'stone');
  const timberLayer = kitLayer(kit, 'timber_raw', 'timber_painted', kit.walls.front.layer);
  for (let zIndex = 0; zIndex < layout.zM.length; zIndex += 1)
    for (let xIndex = 0; xIndex < layout.xM.length; xIndex += 1) {
      const x = layout.xM[xIndex]!;
      const z = layout.zM[zIndex]!;
      const facade = columnFacadeAt(plan, xIndex, layout.xM.length, zIndex, layout.zM.length);
      box(writer, {
        center: [x, floor + 0.06, z],
        size: [layout.diameterM, 0.12, layout.diameterM],
        origin,
        yaw: plan.yaw,
        unit,
        localGroundM,
        layer: stoneLayer,
        ao: 209,
        flags: 1,
        facade,
      });
      prism(writer, {
        center: [x, floor + layout.heightM / 2, z],
        radiusM: layout.diameterM / 2,
        heightM: layout.heightM,
        sides: lod === 0 ? 8 : 6,
        origin,
        yaw: plan.yaw,
        unit,
        localGroundM,
        layer: timberLayer,
        ao: 230,
        flags: 1,
        facade,
      });
    }
  return layout;
}
