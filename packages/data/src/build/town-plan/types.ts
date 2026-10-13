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
  readonly finial?: 'tang_stupa';
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

export type BuildRecipeKey =
  | 'hall' | 'storeyed' | 'stall' | 'adobe' | 'compound'
  | 'pagoda_dense' | 'pagoda_oct' | 'citywall' | 'gate';
export type BuildKitSize = 'vernacular' | 'shop' | 'middle' | 'hall';
export interface BuildKitRecipeFields {
  readonly size?: BuildKitSize;
  readonly roof?: string;
  readonly storeys?: 1 | 2 | 3;
  readonly front?: string;
  readonly facility?: FacilityKind;
  readonly signage?: string;
  readonly bays?: 'odd' | number;
  readonly balcony?: boolean;
  readonly brackets?: boolean;
  readonly layout?: string;
  readonly screenWall?: boolean;
  readonly eaves?: number;
  readonly heightM?: number;
  readonly material?: string;
}
export type BuildKitRecipe =
  | (BuildKitRecipeFields & { readonly recipe: BuildRecipeKey; readonly unsupported?: never })
  | (BuildKitRecipeFields & { readonly recipe?: never; readonly unsupported: string });
export interface BuildKitDims {
  readonly platform: number;
  readonly column: number;
  readonly diaRatio?: number;
  readonly beam?: number;
  readonly eave: number;
  readonly rise: number;
  readonly lift: readonly [number, number];
  readonly verge?: number;
  readonly upperStorey?: number;
}
export interface BuildKitWallFace {
  readonly layer: string;
  readonly t: number;
  readonly h?: number;
  readonly dado?: { readonly layer: string; readonly h: number };
  readonly coping?: string;
}
export type BuildKitPaletteEntry = readonly [string, (readonly number[])?];
export interface BuildKitVariantSet {
  readonly forbid?: readonly string[];
  readonly finial?: string;
}

interface BuildKitPayload {
  readonly style: 'timber' | 'adobe';
  readonly profile: 'song_zhe' | 'qing_jujia';
  readonly dims: Readonly<Record<BuildKitSize, BuildKitDims>>;
  readonly door: {
    readonly clearH: number; readonly single: number; readonly double: number;
    readonly threshold: number; readonly frame: number;
  };
  readonly window: {
    readonly sill: number; readonly head: number; readonly width: number;
    readonly pattern: readonly string[];
  };
  readonly walls: Readonly<Record<'gable' | 'back' | 'front' | 'enclosure', BuildKitWallFace>>;
  readonly ridge: { readonly h: number; readonly ends: string; readonly hallEnds: string };
  readonly palette: Readonly<Record<string, BuildKitPaletteEntry>>;
  readonly layers: readonly { readonly id: string; readonly repeatMm: readonly [number, number] }[];
  readonly variants: Readonly<Record<string, readonly string[] | number | boolean>>;
  readonly cityWall: {
    readonly h: number; readonly top: number; readonly batter: number;
    readonly merlon: readonly [number, number, number];
    readonly gate: { readonly opening: string; readonly w: number; readonly h: number };
  };
  readonly variantSets?: Readonly<Record<string, BuildKitVariantSet>>;
  readonly preferSouthHall?: boolean;
}

/** Build-time validated mirror of render's BuildKitView; dimensions are integer mm or bp. */
export interface CompiledBuildKit extends BuildKitPayload {
  readonly schemaVersion: 'buildkit-runtime.v1';
  readonly id: string;
  readonly archetypes: Readonly<Record<string, BuildKitRecipe>>;
  readonly landmarks: Readonly<Record<string, BuildKitRecipe>>;
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
