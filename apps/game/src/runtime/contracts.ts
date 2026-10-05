import type { Command, DomainEvent, FirstSleepAllocationQuery, GameState, KnownCharacterState,
  NewGameInput, RegionDynamicProjection, RegionPathQueryResult, RegionStaticProjection, WorldMapProjection,
  WorldMapStaticProjection } from '@tianshu/core';
import type { TownRuntimeDefinition } from '@tianshu/data/schemas';
import type { EquipmentVisuals } from '@tianshu/render/rig';
import type { TownSceneProjection } from '@tianshu/render/town';
import type { ProjectionHost, ProjectionRemote, ProjectionUpdate } from '@tianshu/platform';
import type { DialogueView, UiProjection } from '@tianshu/ui';
import type { BattlePacket, BattleUiCommand } from '../battle/contracts';

export type KnownCharacter = KnownCharacterState;

/** The transport snapshot is the canonical rule state, without an app sidecar. */
export type SessionSnapshot = GameState;

/** UI-only commands are adapted to the core command bus; GameState owns every rule mutation. */
export type NewGameRequest = Pick<NewGameInput, 'identity' | 'difficulty'>;
export type NewGameCommand = NewGameRequest & { readonly t: 'run/create' };
export type RegionPathPreviewCommand = { readonly t: 'world/previewRegionPath';
  readonly hex: { readonly q: number; readonly r: number } };
export type GameCommand = Command | BattleUiCommand | NewGameCommand | RegionPathPreviewCommand;

export interface TownProjection {
  readonly scene: TownSceneProjection;
  readonly location: string;
  readonly canLeave: boolean;
  readonly movementPath?: readonly (readonly [number, number])[];
}

export interface GameProjection extends UiProjection {
  readonly worldPaused: boolean;
  readonly worldmapStatic: WorldMapStaticProjection | null;
  readonly worldmap: WorldMapProjection | null;
  readonly townRuntime: TownRuntimeDefinition | null;
  readonly town: TownProjection | null;
  readonly dialogue: DialogueView | null;
  readonly regionStatic: RegionStaticProjection | null;
  readonly region: RegionDynamicProjection | null;
  readonly regionPathPreview: RegionPathQueryResult | null;
  readonly battle?: BattlePacket | null;
  readonly firstSleepAllocation: FirstSleepAllocationQuery | null;
}

export type GameHost = ProjectionHost<GameCommand, GameProjection, SessionSnapshot, DomainEvent> & {
  fixupContentRefs?(snapshot: SessionSnapshot, fromContentHash: string): Promise<SessionSnapshot>;
};
export type GameRemote = ProjectionRemote<GameCommand, GameProjection, SessionSnapshot, DomainEvent>;
export type GameUpdate = ProjectionUpdate<GameProjection, DomainEvent>;
export interface NewGameHost {
  createNewGame(input: NewGameRequest): Promise<GameUpdate>;
}

export type DirtyView =
  | 'hud' | 'characters' | 'inventory' | 'equipment'
  | 'quests' | 'dialogue' | 'worldmap' | 'townRuntime' | 'town'
  | 'regionStatic' | 'region';

export const ALL_VIEWS: readonly DirtyView[] = [
  'hud', 'characters', 'inventory', 'equipment',
  'quests', 'dialogue', 'worldmap', 'townRuntime', 'town', 'regionStatic', 'region',
];

export function townEquipment(projection: UiProjection): EquipmentVisuals {
  return Object.fromEntries(projection.equipment.flatMap((row) =>
    row.item ? [[row.slot, row.item.id]] : [])) as EquipmentVisuals;
}
