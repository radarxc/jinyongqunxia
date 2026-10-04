import type { Dir8, EquipmentVisuals } from '../rig/types';
import type * as RigRuntime from '../rig/runtime';

export type TownPoint = readonly [number, number];
export type TownBuildingPhase = 'outside' | 'fading-in' | 'inside' | 'fading-out';
export interface TownAssetEntry {
  readonly id: string; readonly file: string; readonly kind: string;
  readonly width: number | null; readonly height: number | null;
  readonly anchor: readonly [number, number] | null; readonly footprintWidthPx: number | null;
}
export interface TownAtlasView {
  readonly baseUrl: string; readonly entries: readonly TownAssetEntry[];
}
export interface TownGroundView {
  readonly ground: string; readonly overlay: string | null; readonly elevationCm: number;
  readonly walkable: boolean;
}
export interface TownBuildingView {
  readonly id: string; readonly origin: TownPoint; readonly size: TownPoint;
  readonly rotationDeg: 0 | 90 | 180 | 270; readonly assetId: string;
  readonly entrances: readonly TownPoint[]; readonly enterable: boolean;
  readonly interiorKind: 'shop' | 'inn' | 'temple' | 'residence' | 'other';
}
export interface TownAnchorView {
  readonly id: string; readonly kind: 'npc' | 'location' | 'building' | 'meditation';
  readonly point: TownPoint; readonly label: string; readonly npcId?: string;
  readonly buildingId?: string;
  readonly active?: boolean;
}
export interface TownNpcView {
  readonly npcId: string; readonly point: TownPoint; readonly direction?: Dir8;
  readonly equipment: EquipmentVisuals; readonly interactive: boolean;
}
export interface TownRuntimeView {
  readonly cityId: string; readonly displayName: string;
  readonly grid: { readonly width: number; readonly height: number; readonly chunkCells: number };
  readonly assets: { readonly tile: TownAtlasView; readonly building: TownAtlasView };
  readonly groundPalette: readonly TownGroundView[];
  readonly groundRuns: readonly (readonly [number, number, number])[];
  readonly edgeTiles: readonly (readonly [number, 'road_edge' | 'riverbank', number])[];
  readonly navigation: { readonly nodes: readonly (readonly [number, number, number, string])[] };
  readonly buildings: readonly TownBuildingView[];
}
export interface TownActorView {
  readonly point: TownPoint; readonly walking: boolean; readonly direction?: Dir8;
  readonly equipment: EquipmentVisuals;
}
export interface TownSceneProjection {
  readonly actor: TownActorView; readonly npcs: readonly TownNpcView[];
  readonly anchors: readonly TownAnchorView[]; readonly activeBuildingId: string | null;
  readonly buildingPhase: TownBuildingPhase;
}
export interface TownSceneStats {
  drawCalls: number; triangles: number; frameMs: number; cpuMs: number;
  groundInstances: number; buildingInstances: number; rigInstances: number;
  visibleChunks: number; atlasTextures: number;
}
export interface TownScreenPoint { x: number; y: number; visible: boolean }
export interface TownSceneOptions { readonly projection: TownSceneProjection; readonly zoom?: number;
  /** Test seam; production loads the rig runtime when the town is first entered. */
  readonly loadRigRuntime?: () => Promise<typeof RigRuntime> }
export interface TownScene {
  readonly stats: TownSceneStats;
  render(timeMs: number, reducedMotion?: boolean): void;
  resize(width: number, height: number, pixelRatio?: number): void;
  update(projection: TownSceneProjection): Promise<void>;
  setZoom(zoom: number): void;
  pickPoint(clientX: number, clientY: number, bounds: DOMRect): TownPoint | null;
  pickAnchor(clientX: number, clientY: number, bounds: DOMRect): TownAnchorView | null;
  project(point: TownPoint, elevationCm: number, out: TownScreenPoint): void;
  dispose(): void;
}
