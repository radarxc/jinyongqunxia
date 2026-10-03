import type { ContextFailure, ContextState } from '../core/context-guard';
import type { EquipmentVisuals, RigManifestInput } from '../rig';
import type { RenderQualitySource } from '../quality/tiers';
import type { DataArrayTexture } from 'three';

export type RegionHexDir = 0 | 1 | 2 | 3 | 4 | 5;
export interface RegionHexPoint { readonly q: number; readonly r: number }
export interface RegionHexCell extends RegionHexPoint { readonly h: number }
export interface RegionRect {
  readonly q: number; readonly r: number; readonly width: number; readonly height: number;
}
export interface RegionBounds {
  readonly qMin: number; readonly qMax: number; readonly rMin: number; readonly rMax: number;
}
export interface RegionRampView { readonly index: number; readonly dir: number }
export interface RegionWaterView {
  readonly index: number; readonly kind: 'shallow' | 'deep' | 'flowing' | 'bigwater';
  readonly flowDir: number | null; readonly shoreDistance: number | null;
}
export interface RegionDecoView {
  readonly id: string; readonly index: number;
  /** Optional until the RegionMap schema publishes tech/02 section 2.4 metadata. */
  readonly occluder?: boolean | undefined; readonly castShadow?: boolean | undefined;
  readonly roof?: boolean | undefined; readonly fadeGroup?: string | undefined;
}
export interface RegionObjectView extends RegionHexPoint {
  readonly id: string; readonly class: string; readonly h: number;
  readonly cells: readonly RegionHexCell[];
  readonly npcId?: string | undefined; readonly facing?: number | undefined;
  readonly safe?: boolean | undefined; readonly autosave?: boolean | undefined;
  readonly mode?: 'door' | 'portal' | undefined; readonly yawDeg?: number | undefined;
  readonly zoom?: number | undefined; readonly allowRotation?: boolean | undefined;
  readonly bounds?: RegionRect | undefined; readonly footprint?: RegionRect | undefined;
  readonly interiorRect?: RegionRect | undefined; readonly roofGroup?: string | undefined;
  readonly cutawayWalls?: readonly number[] | undefined;
}
export interface RegionChunkView {
  readonly q: number; readonly r: number; readonly width: 32; readonly height: 32;
  readonly valid: string; readonly terrainEncoding: 'u8' | 'u16le';
  readonly terrain: string; readonly heights: string; readonly precomputedAo: string | null;
  readonly ramps: readonly RegionRampView[]; readonly water: readonly RegionWaterView[];
  readonly decos: readonly RegionDecoView[]; readonly objects: readonly RegionObjectView[];
}
export interface RegionStaticView {
  readonly schemaVersion: 'region-static.v1'; readonly regionId: string; readonly sceneId: string;
  readonly bounds: RegionBounds; readonly terrainTable: readonly string[];
  readonly chunks: readonly RegionChunkView[]; readonly objects: readonly RegionObjectView[];
  readonly backdropAssetKey: string | null;
}
export interface RegionAnchorView {
  readonly anchorId: string; readonly class: string; readonly hex: RegionHexPoint;
  readonly enabled: boolean; readonly reason: string | null;
}
export interface RegionDoorView {
  readonly anchorId: string; readonly open: boolean; readonly locked: boolean;
  readonly reason: string | null;
}
export interface RegionDynamicView {
  readonly regionId: string; readonly sceneId: string; readonly spawnId: string;
  readonly playerHex: RegionHexPoint; readonly facing: RegionHexDir;
  readonly interactableAnchors: readonly RegionAnchorView[]; readonly doors: readonly RegionDoorView[];
  readonly pendingMount: unknown | null;
}
export interface RegionSceneInput {
  readonly definition: RegionStaticView; readonly projection: RegionDynamicView;
}
export interface RegionScreenPoint { x: number; y: number; visible: boolean }
export interface RegionSceneStats {
  drawCalls: number; triangles: number; frameMs: number; cpuMs: number;
  terrainChunks: number; visibleChunks: number; queuedChunks: number;
  terrainCells: number; staticInstances: number; rigInstances: number;
}
export interface RegionCameraControl {
  readonly yawDeg: number; readonly rotating: boolean; readonly allowRotation: boolean;
  rotate(step: -1 | 1, reducedMotion?: boolean): Promise<void>;
}
export interface RegionSceneOptions {
  readonly projection: RegionDynamicView; readonly playerEquipment?: EquipmentVisuals;
  readonly npcEquipment?: Readonly<Record<string, EquipmentVisuals>>; readonly rig?: RigManifestInput;
  /** Optional production array texture; the scene retains ownership in the caller. */
  readonly terrainAlbedo?: DataArrayTexture;
  readonly zoom?: number; readonly reducedMotion?: boolean; readonly quality?: RenderQualitySource;
  readonly onContextStateChange?: (state: ContextState) => void;
  readonly onContextLoss?: (sessionLossCount: number) => void;
  readonly onContextRecreate?: () => Promise<boolean>;
  readonly onContextFatal?: (kind: ContextFailure) => void; readonly requestFrame?: () => void;
}
export interface RegionScene {
  readonly stats: RegionSceneStats; readonly camera: RegionCameraControl;
  readonly contextState: ContextState;
  render(timeMs: number, reducedMotion?: boolean): void;
  resize(width: number, height: number, devicePixelRatio?: number): void;
  update(projection: RegionDynamicView, playerEquipment?: EquipmentVisuals): Promise<void>;
  setPlayerPose(point: RegionHexPoint, facing: RegionHexDir, speedMps?: number): void;
  setTimeOfDay(hours: number): void;
  setPath(path: readonly RegionHexPoint[]): void; setZoom(zoom: number): void;
  pickHex(clientX: number, clientY: number, bounds: DOMRect): RegionHexPoint | null;
  pickAnchor(clientX: number, clientY: number, bounds: DOMRect): RegionAnchorView | null;
  project(hex: RegionHexPoint, height: number, out: RegionScreenPoint): void; dispose(): void;
}
