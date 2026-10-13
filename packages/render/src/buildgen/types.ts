import type {
  BufferGeometry,
  DataArrayTexture,
  DataTexture,
  Object3D,
  Raycaster,
  Texture,
  Vector3,
  WebGLRenderer,
} from 'three';
import type { RenderQualitySource } from '../quality/tiers';

export type Yaw4 = 0 | 1 | 2 | 3;
export type LocalSide = 0 | 1 | 2 | 3;
export type RectMm = readonly [x0: number, z0: number, x1: number, z1: number];
export type EntranceView = readonly [side: LocalSide, offsetMm: number, widthMm: number];
export type FacilityKind =
  | 'none'
  | 'residence'
  | 'general_store'
  | 'cloth'
  | 'books'
  | 'pharmacy'
  | 'inn'
  | 'tavern'
  | 'teahouse'
  | 'smithy'
  | 'pawnshop'
  | 'bank'
  | 'escort'
  | 'school'
  | 'temple'
  | 'office'
  | 'casino'
  | 'stable'
  | 'storehouse'
  | 'guardhouse'
  | 'stall_goods'
  | 'stall_food';
export type FixtureView = readonly [
  fixtureIdx: number,
  cxMm: number,
  czMm: number,
  wMm: number,
  dMm: number,
  yaw: Yaw4,
  blocks: 0 | 1,
];
export type PartView = readonly [
  kind: number,
  cxMm: number,
  czMm: number,
  wMm: number,
  dMm: number,
  yaw: Yaw4,
  storeys: 1 | 2 | 3,
  roofStyle: number,
  eaveMm: number,
  ridgeMm: number,
  platformMm: number,
  flags: number,
];

/**
 * Mirror of data's `RoofStyle` enum (packages/data/src/build/town-plan/types.ts): same names and
 * numeric values, used for `BuildingPlanView.roof[0]` and `PartView` roof styles.
 */
export const ROOF_STYLE = Object.freeze({
  None: 0,
  Yingshan: 1,
  Xuanshan: 2,
  Xieshan: 3,
  Wudian: 4,
  Cuanjian: 5,
  Juanpeng: 6,
  Flat: 7,
  Dome: 8,
  Canopy: 9,
} as const);
export type RoofStyleCode = (typeof ROOF_STYLE)[keyof typeof ROOF_STYLE];

/** Structural mirror of data's TownBuildingPlan. Keep this package independent of @tianshu/data. */
export interface BuildingPlanView {
  readonly id: string;
  readonly archetype: string;
  readonly kit: string;
  readonly seed: number;
  readonly footprint: readonly [cxMm: number, czMm: number, wMm: number, dMm: number];
  readonly yaw: Yaw4;
  readonly storeys: 1 | 2 | 3;
  readonly roof: readonly [style: number, eaveMm: number, ridgeMm: number];
  readonly entrances: readonly EntranceView[];
  readonly enterable: boolean;
  readonly elev: readonly [baseYMm: number, platformMm: number];
  readonly floors: readonly RectMm[];
  readonly floorY: readonly number[];
  readonly fixtures: readonly FixtureView[];
  readonly parts?: readonly PartView[];
  readonly signage: readonly [textKey: string, signStyleIdx: number] | null;
  readonly facility: FacilityKind;
  /** 镜像 data TownBuildingPlan.finial；r5 据此出唐式塔刹。 */
  readonly finial?: 'tang_stupa';
}

export type BuildRecipeKey =
  | 'hall'
  | 'storeyed'
  | 'stall'
  | 'adobe'
  | 'compound'
  | 'pagoda_dense'
  | 'pagoda_oct'
  | 'citywall'
  | 'gate';
interface BuildKitRecipeFields {
  readonly size?: 'vernacular' | 'shop' | 'middle' | 'hall';
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
export type BuildKitRecipeView =
  | (BuildKitRecipeFields & { readonly recipe: BuildRecipeKey; readonly unsupported?: never })
  | (BuildKitRecipeFields & { readonly recipe?: never; readonly unsupported: string });
export interface BuildKitDimsView {
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
export interface BuildKitDoorView {
  readonly clearH: number;
  readonly single: number;
  readonly double: number;
  readonly threshold: number;
  readonly frame: number;
}
export interface BuildKitWindowView {
  readonly sill: number;
  readonly head: number;
  readonly width: number;
  readonly pattern: readonly string[];
}
export interface BuildKitWallFaceView {
  readonly layer: string;
  readonly t: number;
  readonly h?: number;
  readonly dado?: { readonly layer: string; readonly h: number };
  readonly coping?: string;
}
export interface BuildKitRidgeView {
  readonly h: number;
  readonly ends: string;
  readonly hallEnds: string;
}
export interface BuildKitLayerView {
  readonly id: string;
  readonly repeatMm: readonly [number, number];
}
export type BuildKitPaletteEntryView = readonly [color: string, variationBp?: readonly number[]];
export interface BuildKitCityWallView {
  readonly h: number;
  readonly top: number;
  readonly batter: number;
  readonly merlon: readonly [number, number, number];
  readonly gate: { readonly opening: string; readonly w: number; readonly h: number };
}
export interface BuildKitVariantSetView {
  readonly forbid?: readonly string[];
  readonly finial?: string;
}

/** Structural mirror of data's CompiledBuildKit; all dimensions are integer mm or bp. */
export interface BuildKitView {
  readonly schemaVersion: 'buildkit-runtime.v1';
  readonly id: string;
  readonly style: 'timber' | 'adobe';
  readonly profile: 'song_zhe' | 'qing_jujia';
  readonly dims: Readonly<Record<'vernacular' | 'shop' | 'middle' | 'hall', BuildKitDimsView>>;
  readonly door: BuildKitDoorView;
  readonly window: BuildKitWindowView;
  readonly walls: Readonly<Record<'gable' | 'back' | 'front' | 'enclosure', BuildKitWallFaceView>>;
  readonly ridge: BuildKitRidgeView;
  readonly palette: Readonly<Record<string, BuildKitPaletteEntryView>>;
  readonly layers: readonly BuildKitLayerView[];
  readonly archetypes: Readonly<Record<string, BuildKitRecipeView>>;
  readonly landmarks: Readonly<Record<string, BuildKitRecipeView>>;
  readonly variants: Readonly<Record<string, readonly string[] | number | boolean>>;
  readonly cityWall: BuildKitCityWallView;
  readonly variantSets?: Readonly<Record<string, BuildKitVariantSetView>>;
  readonly preferSouthHall?: boolean;
}
export interface CityWallView {
  readonly id: string;
  readonly points: readonly (readonly [number, number])[];
  readonly closed: boolean;
  readonly heightMm: number;
  readonly thicknessMm: number;
  readonly gates: readonly {
    readonly seg: number;
    readonly offsetMm: number;
    readonly widthMm: number;
    readonly kind: 'gate' | 'water';
  }[];
}

export interface MeshPayload {
  position: Float32Array;
  normal: Int8Array;
  uv: Float32Array;
  mat: Uint8Array;
  unit: Uint16Array;
  tint: Uint8Array;
  index: Uint16Array | Uint32Array;
  bounds: Float32Array;
}
export interface CellPayload {
  cell: number;
  lod: 0 | 1;
  shell: MeshPayload;
  roof: MeshPayload;
  doors: Float32Array;
  signs: Float32Array;
  units: Uint16Array;
  /** Variable records: target, kind, vertexCount, then vertex indices. */
  hanging: Uint32Array;
}

export type MeshTarget = 'shell' | 'roof';
export interface VertexInput {
  readonly position: readonly [number, number, number];
  readonly normal: readonly [number, number, number];
  readonly uv?: readonly [number, number] | undefined;
  readonly layer?: number | undefined;
  readonly ao?: number | undefined;
  readonly flags?: number | undefined;
  readonly facade?: number | undefined;
  readonly unit?: number | undefined;
  readonly localHeightCm?: number | undefined;
  readonly tint?: readonly [number, number, number, number] | undefined;
}
/** Exact INV-1 category metadata. It is separate from aMat's generic flag bits. */
export type HangingPropKind = 'sign' | 'flag' | 'lantern';
export interface HangingPropView {
  readonly target: MeshTarget;
  readonly kind: HangingPropKind;
  readonly vertices: readonly number[];
}
export interface MeshWriter {
  readonly vertexCount: number;
  addVertex(vertex: VertexInput): number;
  addTriangle(a: number, b: number, c: number): void;
}
export interface RecipeSink {
  readonly shell: MeshWriter;
  readonly roof: MeshWriter;
  readonly doors: number[];
  readonly signs: number[];
  readonly hangingProps: HangingPropView[];
  /** Unit ids for plan.parts, in tuple order; main unit is Recipe's unitBase. */
  readonly partUnits: readonly number[];
}
export type Recipe = (
  plan: BuildingPlanView,
  unitBase: number,
  kit: BuildKitView,
  lod: 0 | 1,
  sink: RecipeSink,
) => void;

export interface BuildingLayerInput {
  readonly plans: readonly BuildingPlanView[];
  readonly walls: readonly CityWallView[];
  readonly kit: BuildKitView;
  readonly quality: RenderQualitySource;
  readonly renderer: WebGLRenderer;
  readonly signAtlas?: {
    readonly url: string;
    readonly rects: Readonly<Record<string, readonly [number, number, number, number]>>;
  };
  readonly generator?: 'worker' | 'inline';
  readonly batchStrategy?: BatchStrategy;
  readonly pickStrategy?: PickStrategy;
  readonly layerTextures?: LayerTextureSource;
  readonly signText?: SignTextSource;
  /** Optional camera adapter for exact HUD visibility counts; Three still frustum-culls by bounds. */
  readonly cellVisible?: ((bounds: Float32Array) => boolean) | undefined;
  /** Test/diagnostic hook; receives the exact CPU bytes owned by the layer. */
  readonly observeStateTexture?: ((texture: DataTexture, data: Uint8Array) => void) | undefined;
}
export interface BatchStrategy {
  readonly id: string;
  createGeometry(payload: MeshPayload): BufferGeometry;
}
export interface PickBounds {
  readonly unit: number;
  readonly bounds: readonly [number, number, number, number, number, number];
}
export interface PickStrategy {
  readonly id: string;
  pick(raycaster: Raycaster, bounds: readonly PickBounds[]): number;
}
export interface LayerTextureResult {
  readonly texture: DataArrayTexture;
  readonly repeatM: Float32Array;
  readonly owned: boolean;
}
export interface LayerTextureSource {
  load(kit: BuildKitView, quality: RenderQualitySource): Promise<LayerTextureResult>;
}
export interface SignTextSource {
  readonly texture?: Texture;
  readonly owned?: boolean;
  rect(textKey: string, style: number): readonly [number, number, number, number];
}
export interface BuildingLayerStats {
  drawCalls: number;
  triangles: number;
  cells: number;
  visibleCells: number;
  units: number;
  interiors: number;
  pendingCells: number;
  geometryBytes: number;
  textureBytes: number;
  lastCellMs: number;
}
export interface BuildingMeasure {
  readonly bounds: readonly [
    minX: number,
    minY: number,
    minZ: number,
    maxX: number,
    maxY: number,
    maxZ: number,
  ];
  readonly widthM: number;
  readonly depthM: number;
  readonly heightM: number;
}
export interface BuildingLayer {
  readonly object: Object3D;
  readonly stats: BuildingLayerStats;
  setCutaway(index: number, mode: 0 | 1 | 2): void;
  setCameraYaw(deg: number): void;
  setFocusOcclusion(focus: Vector3, radiusM: number): void;
  update(dt: number, reducedMotion: boolean): void;
  pick(raycaster: Raycaster): number;
  restore(): void;
  dispose(): void;
  ready(): Promise<void>;
  occludes(point: Vector3): boolean;
  measure(index: number): BuildingMeasure;
}

export function buildgenNotImplemented(name: string): never {
  throw new Error(`BUILDGEN_NOT_IMPLEMENTED:${name}`);
}
export { cutFacadeMask } from './three/cutaway';
