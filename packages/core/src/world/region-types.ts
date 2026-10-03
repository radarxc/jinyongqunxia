import type { GateExpr, RegionMap, RegionObject, TerrainId } from '@tianshu/data/schemas';
import type { HexCoord, HexDir } from '../hex';

export type RegionAnchorClass = RegionObject['class'];
export type RegionGateReason =
  | 'REGION_GATE_QINGGONG' | 'REGION_GATE_ITEM' | 'REGION_GATE_QUEST'
  | 'REGION_GATE_FLAG' | 'REGION_GATE_CAPABILITY' | 'REGION_GATE_LOCKED';

export interface RegionGateFacts {
  readonly qinggong: number; readonly items?: Readonly<Record<string, number>>;
  readonly flags?: readonly string[]; readonly quests?: Readonly<Record<string,
    'inactive' | 'active' | 'completed' | 'failed'>>;
  readonly fame?: number; readonly morality?: number; readonly sect?: string;
  readonly sectRank?: number; readonly statuses?: readonly string[]; readonly act?: number;
  readonly formation?: number; readonly skills?: Readonly<Record<string, number>>;
  readonly swim?: number; readonly beast?: number; readonly mounts?: readonly string[];
  readonly boats?: readonly string[]; readonly light?: boolean; readonly specials?: readonly string[];
  readonly devices?: readonly string[]; readonly strength?: number;
  readonly companionQinggongTiers?: readonly number[]; readonly buffs?: readonly string[];
  readonly shichen?: string; readonly day?: number; readonly festival?: string;
  readonly weather?: string; readonly season?: string;
}

export interface RegionDialogueBinding {
  readonly sceneId: string; readonly anchorId: string;
  readonly storyId: string; readonly entryKey: string;
}
export interface RegionLootBinding {
  readonly lootRef: string; readonly items: readonly { readonly itemId: string; readonly count: number }[];
}
export type RegionGateExpr = GateExpr | { readonly flag: string }
  | { readonly all: readonly RegionGateExpr[] } | { readonly any: readonly RegionGateExpr[] }
  | { readonly not: RegionGateExpr };
export interface RegionGateBinding { readonly gateId: string; readonly expression: RegionGateExpr }
export interface RegionRuntimeContent {
  readonly maps: readonly RegionMap[]; readonly gateFacts: RegionGateFacts;
  readonly gates?: readonly RegionGateBinding[];
  readonly dialogues?: readonly RegionDialogueBinding[];
  readonly loot?: readonly RegionLootBinding[];
}
export interface RegionDynamicTileState {
  readonly q: number; readonly r: number; readonly terrainId: TerrainId; readonly height: number;
}
export interface RegionEntityState {
  readonly anchorId: string; readonly active: boolean; readonly consumed: boolean;
}
export interface MountedRegionState {
  readonly regionId: string; readonly spawnId: string; readonly playerHex: HexCoord;
  readonly facing: HexDir; readonly dynamicTiles: readonly RegionDynamicTileState[];
  readonly entities: readonly RegionEntityState[];
}
export type PendingRegionMount = { readonly regionId: string; readonly sceneId: string } & (
  | { readonly spawnId: string; readonly targetHex?: never }
  | { readonly spawnId: null; readonly targetHex: HexCoord }
);

export type RegionCommand =
  | { readonly t: 'world/mountRegion'; readonly regionId: string; readonly sceneId: string;
      readonly spawnId: string }
  | { readonly t: 'world/walkTo'; readonly hex: HexCoord }
  | { readonly t: 'world/interact'; readonly anchorId: string };

export interface RegionPathPreview {
  readonly path: readonly HexCoord[]; readonly cost: number;
  readonly destination: HexCoord; readonly facing: HexDir;
}
export type RegionPathRejectReason =
  | 'REGION_UNAVAILABLE' | 'REGION_CONTENT_MISMATCH' | 'REGION_NOT_MOUNTED'
  | 'REGION_INTERACTION_BUSY' | 'REGION_PATH_NOT_STANDABLE'
  | 'REGION_PATH_BLOCKED' | 'REGION_PATH_HEIGHT' | 'REGION_PATH_QINGGONG';
export type RegionPathQueryResult =
  | { readonly ok: true; readonly preview: RegionPathPreview }
  | { readonly ok: false; readonly reason: RegionPathRejectReason };
export interface RegionAnchorView {
  readonly anchorId: string; readonly class: RegionAnchorClass; readonly hex: HexCoord;
  readonly enabled: boolean; readonly reason: RegionGateReason | null;
}
export interface RegionDoorView {
  readonly anchorId: string; readonly open: boolean; readonly locked: boolean;
  readonly reason: RegionGateReason | null;
}
export interface RegionDynamicProjection {
  readonly regionId: string; readonly sceneId: string; readonly spawnId: string;
  readonly playerHex: HexCoord; readonly facing: HexDir;
  readonly interactableAnchors: readonly RegionAnchorView[];
  readonly doors: readonly RegionDoorView[];
  readonly pendingMount: PendingRegionMount | null;
}
export interface RegionStaticProjection {
  readonly schemaVersion: 'region-static.v1'; readonly regionId: string; readonly sceneId: string;
  readonly bounds: RegionMap['bounds']; readonly terrainTable: readonly TerrainId[];
  readonly chunks: RegionMap['chunks']; readonly objects: readonly RegionObject[];
  readonly backdropAssetKey: string | null;
}

export interface GateEvaluation { readonly allowed: boolean; readonly reason: RegionGateReason | null }
export type { GateExpr, RegionMap, RegionObject, TerrainId };
