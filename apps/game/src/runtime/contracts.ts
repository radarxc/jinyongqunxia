import type { Command, DomainEvent, GameState, KnownCharacterState, WorldMapProjection } from '@tianshu/core';
import type { TownRuntimeDefinition } from '@tianshu/data/schemas';
import type { EquipmentVisuals } from '@tianshu/render/rig';
import type { TownSceneProjection } from '@tianshu/render/town';
import type { ProjectionHost, ProjectionRemote, ProjectionUpdate } from '@tianshu/platform';
import type { UiProjection } from '@tianshu/ui';
import type { BattlePacket, BattleUiCommand } from '../battle/contracts';

export type KnownCharacter = KnownCharacterState;

/** The transport snapshot is the canonical rule state, without an app sidecar. */
export type SessionSnapshot = GameState;

/** Battle remains app-owned until ENG-16; every other command is core-owned. */
export type GameCommand = Command | BattleUiCommand;

export interface TownProjection {
  readonly scene: TownSceneProjection;
  readonly location: string;
  readonly canLeave: boolean;
  readonly movementPath?: readonly (readonly [number, number])[];
}

export type GameProjection = UiProjection & {
  readonly worldPaused: boolean;
  readonly worldmap: WorldMapProjection | null;
  readonly townRuntime: TownRuntimeDefinition | null;
  readonly town: TownProjection | null;
  readonly battle?: BattlePacket | null;
};

export type GameHost = ProjectionHost<GameCommand, GameProjection, SessionSnapshot, DomainEvent>;
export type GameRemote = ProjectionRemote<GameCommand, GameProjection, SessionSnapshot, DomainEvent>;
export type GameUpdate = ProjectionUpdate<GameProjection, DomainEvent>;

export type DirtyView =
  | 'hud' | 'characters' | 'inventory' | 'equipment'
  | 'quests' | 'worldmap' | 'townRuntime' | 'town';

export const ALL_VIEWS: readonly DirtyView[] = [
  'hud', 'characters', 'inventory', 'equipment',
  'quests', 'worldmap', 'townRuntime', 'town',
];

export function townEquipment(projection: UiProjection): EquipmentVisuals {
  return Object.fromEntries(projection.equipment.flatMap((row) =>
    row.item ? [[row.slot, row.item.id]] : [])) as EquipmentVisuals;
}
