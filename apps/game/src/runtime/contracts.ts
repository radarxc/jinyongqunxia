import type { CharacterState, ConsumableTargetState, ConsumableUseState, DomainEvent, GameState } from '@tianshu/core';
import type { ProjectionHost, ProjectionRemote, ProjectionUpdate } from '@tianshu/platform';
import type { UiCommand, UiProjection } from '@tianshu/ui';

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
export type GameHost = ProjectionHost<UiCommand, UiProjection, SessionSnapshot, DomainEvent>;
export type GameRemote = ProjectionRemote<UiCommand, UiProjection, SessionSnapshot, DomainEvent>;
export type GameUpdate = ProjectionUpdate<UiProjection, DomainEvent>;
export type DirtyView = 'hud' | 'characters' | 'inventory' | 'equipment' | 'quests';
export const ALL_VIEWS: readonly DirtyView[] = ['hud', 'characters', 'inventory', 'equipment', 'quests'];
