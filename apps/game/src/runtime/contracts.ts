import type { CharacterState, ConsumableTargetState, ConsumableUseState, DomainEvent,
  GameState, TownCommand, WorldMapCommand, WorldMapProjection } from '@tianshu/core';
import type { TownRuntimeDefinition } from '@tianshu/data/schemas';
import type { EquipmentVisuals } from '@tianshu/render/rig';
import type { TownSceneProjection } from '@tianshu/render/town';
import type { ProjectionHost, ProjectionRemote, ProjectionUpdate } from '@tianshu/platform';
import type { UiCommand, UiProjection } from '@tianshu/ui';
import type { BattlePacket, BattleUiCommand } from '../battle/contracts';

export interface KnownCharacter {
  readonly npcId: string; readonly relationship: 'met' | 'befriended'; readonly affinity: number;
  readonly character: CharacterState | null;
}
/** Sidecar for upstream fields not yet in GameState; never sent to Pinia. */
export interface SessionSnapshot {
  readonly schema: 'ui-session.v1'; readonly state: GameState;
  readonly known: readonly KnownCharacter[];
  readonly usage: ConsumableUseState;
  readonly itemTargets: Readonly<Record<string, ConsumableTargetState>>;
  readonly location: string; readonly preview: boolean;
}
export type GameCommand = UiCommand | WorldMapCommand | TownCommand | BattleUiCommand;
export interface TownProjection {
  readonly scene: TownSceneProjection;
  readonly location: string; readonly canLeave: boolean;
  readonly movementPath?: readonly (readonly [number, number])[];
}
export type GameProjection = UiProjection & {
  readonly worldmap: WorldMapProjection | null;
  readonly townRuntime: TownRuntimeDefinition | null;
  readonly town: TownProjection | null;
  readonly battle?: BattlePacket | null;
};
export type GameHost = ProjectionHost<GameCommand, GameProjection, SessionSnapshot, DomainEvent>;
export type GameRemote = ProjectionRemote<GameCommand, GameProjection, SessionSnapshot, DomainEvent>;
export type GameUpdate = ProjectionUpdate<GameProjection, DomainEvent>;
export type DirtyView = 'hud' | 'characters' | 'inventory' | 'equipment' | 'quests' | 'worldmap' | 'townRuntime' | 'town';
export const ALL_VIEWS: readonly DirtyView[] = ['hud', 'characters', 'inventory', 'equipment', 'quests', 'worldmap', 'townRuntime', 'town'];
export function townEquipment(projection: UiProjection): EquipmentVisuals {
  return Object.fromEntries(projection.equipment.flatMap((row) =>
    row.item ? [[row.slot, row.item.id]] : [])) as EquipmentVisuals;
}
