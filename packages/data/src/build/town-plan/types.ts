export type Yaw4 = 0 | 1 | 2 | 3;
export type LocalSide = 0 | 1 | 2 | 3;
export type RectMm = readonly [x0: number, z0: number, x1: number, z1: number];
export type EntranceTuple = readonly [
  side: LocalSide, offsetMm: number, widthMm: number,
];
export type FixtureTuple = readonly [
  fixtureIdx: number, cxMm: number, czMm: number, wMm: number, dMm: number,
  yaw: Yaw4, blocks: 0 | 1,
];

export enum RoofStyle {
  None, Yingshan, Xuanshan, Xieshan, Wudian, Cuanjian, Juanpeng, Flat, Dome, Canopy,
}

export enum PartKind {
  Hall, Wing, Gatehouse, Enclosure, Yard, Gallery, ScreenWall, Trellis,
}

export type PartTuple = readonly [
  kind: PartKind, cxMm: number, czMm: number, wMm: number, dMm: number, yaw: Yaw4,
  storeys: 1 | 2 | 3, roofStyle: RoofStyle, eaveMm: number, ridgeMm: number,
  platformMm: number, flags: number,
];

export type FacilityKind =
  | 'none' | 'residence' | 'general_store' | 'cloth' | 'books' | 'pharmacy'
  | 'inn' | 'tavern' | 'teahouse' | 'smithy' | 'pawnshop' | 'bank' | 'escort'
  | 'school' | 'temple' | 'office' | 'casino' | 'stable' | 'storehouse'
  | 'guardhouse' | 'stall_goods' | 'stall_food';

export interface TownBuildingPlan {
  readonly id: string;
  readonly archetype: string;
  readonly kit: string;
  readonly seed: number;
  readonly footprint: readonly [cxMm: number, czMm: number, wMm: number, dMm: number];
  readonly yaw: Yaw4;
  readonly storeys: 1 | 2 | 3;
  readonly roof: readonly [style: RoofStyle, eaveMm: number, ridgeMm: number];
  readonly entrances: readonly EntranceTuple[];
  readonly enterable: boolean;
  readonly elev: readonly [baseYMm: number, platformMm: number];
  readonly floors: readonly RectMm[];
  readonly floorY: readonly number[];
  readonly fixtures: readonly FixtureTuple[];
  readonly parts?: readonly PartTuple[];
  readonly signage: readonly [textKey: string, signStyleIdx: number] | null;
  readonly facility: FacilityKind;
}

export interface LayoutBuildingInput {
  readonly id: string;
  readonly type: string;
  readonly originCell: readonly [x: number, z: number];
  readonly sizeCells: readonly [w: number, h: number];
  readonly entranceCell: readonly [x: number, z: number];
  readonly enterable: boolean;
  readonly baseYMm: number;
  readonly facility?: FacilityKind;
  readonly signTextKey?: string;
}

export interface PlanningFrame {
  readonly heightCells: number;
  readonly originXMm: number;
  readonly originZMm: number;
}

/** Minimal p0 runtime shape; ENG-buildgen-p1-kits will replace its payload fields. */
export interface CompiledBuildKit {
  readonly schemaVersion: 'buildkit-runtime.v1';
  readonly id: string;
  readonly archetypes: Readonly<Record<string, unknown>>;
  readonly landmarks: Readonly<Record<string, unknown>>;
}

export interface PlanDiagnostic {
  readonly code: string;
  readonly message: string;
  readonly path?: string;
}

export interface FixtureKindDef {
  readonly idx: number;
  readonly name: string;
  readonly wMm: number;
  readonly dMm: number;
  readonly hMm: number;
  readonly blocks: 0 | 1;
  readonly lowClutter?: true;
  readonly station?: string;
}

export type ParsedBuildingType =
  | { readonly kit: string; readonly archetype: string }
  | { readonly landmark: string };

export function townPlanNotImplemented(functionName: string): never {
  throw new Error(`TOWN_PLAN_NOT_IMPLEMENTED:${functionName}`);
}
