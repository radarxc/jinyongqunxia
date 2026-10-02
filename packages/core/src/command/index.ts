import type { ItemDef, TownRuntimeDefinition, WorldMapRuntimeDefinition } from '@tianshu/data/schemas';
import type { JsonValue } from '@tianshu/shared';
import type { EquipmentRule } from '../economy';
import type { PendingDomainEvent } from '../event';
import type { Rng, RngStreamName } from '../rng';
import type { GameState } from '../state';
import type { TownCommand, TownMeditationEncounter, TownMeditationPractice } from '../world/town-runtime';
import type { WorldMapCommand } from '../world/worldmap-types';
import type { EventAnchor } from '../event';
import type { NpcWorldState } from '../npc';

export interface WorldTickCommand { readonly t: 'world/tick' }
export type InventoryCommand =
  | { readonly t: 'inventory/equip'; readonly itemId: string; readonly slot: GameState['party']['equipment']['entries'][number]['slot'] }
  | { readonly t: 'inventory/unequip'; readonly slot: GameState['party']['equipment']['entries'][number]['slot'] }
  | { readonly t: 'inventory/use'; readonly itemId: string; readonly targetId: string };
export type Command = WorldTickCommand | WorldMapCommand | TownCommand | InventoryCommand;

export type RejectReason =
  | 'COMMAND_UNKNOWN' | 'WORLD_PAUSED' | 'MAP_UNAVAILABLE' | 'MAP_STILL_TRAVELLING'
  | 'MAP_NODE_CLOSED' | 'MAP_SCENE_BUSY' | 'MAP_UNREACHABLE' | 'MAP_STEP_STALE'
  | 'MAP_NOT_WALKING' | 'MAP_NOT_PAUSED' | 'MAP_NOT_IN_SCENE' | 'TOWN_UNAVAILABLE'
  | 'TOWN_STATE_MISMATCH' | 'TOWN_UNREACHABLE' | 'TOWN_BUILDING_BUSY'
  | 'TOWN_BUILDING_ENTRY' | 'TOWN_ALREADY_INSIDE' | 'TOWN_NOT_INSIDE'
  | 'TOWN_NPC_ABSENT' | 'TOWN_NPC_NOT_HERE' | 'TOWN_NOT_AT_SHOP'
  | 'TOWN_MEDITATION_UNAVAILABLE' | 'EQUIPMENT_SLOT_MISMATCH'
  | 'EQUIPMENT_ITEM_UNKNOWN' | 'EQUIPMENT_ALREADY_EQUIPPED'
  | 'EQUIPMENT_PAIR_OCCUPIES_OFFHAND' | 'EQUIPMENT_TWO_HAND_OFFHAND'
  | 'EQUIPMENT_SLOT_EMPTY' | 'INVENTORY_INSUFFICIENT' | 'ITEM_EFFECT_UNAVAILABLE'
  | 'ITEM_TARGET_UNAVAILABLE' | 'CONSUMABLE_CONTEXT' | 'CONSUMABLE_BATTLE_LIMIT'
  | 'CONSUMABLE_CHAPTER_LIMIT' | 'CONSUMABLE_COOLDOWN' | 'CONSUMABLE_REVIVE_CONTEXT'
  | 'CONSUMABLE_PERMANENT_CONTEXT' | 'CONSUMABLE_MERIDIAN_CONTEXT';

export interface CoreContent {
  readonly items?: readonly ItemDef[]; readonly equipmentRules?: readonly EquipmentRule[];
  readonly identityTags?: readonly string[]; readonly worldMaps?: readonly WorldMapRuntimeDefinition[];
  readonly towns?: readonly TownRuntimeDefinition[]; readonly townEventAnchors?: readonly EventAnchor[];
  readonly townNpcWorld?: NpcWorldState; readonly eraLayer?: string;
  readonly townNpcPlacements?: readonly { readonly npcId: string; readonly sceneId: string;
    readonly eraLayer: string; readonly point: readonly [number, number] }[];
  readonly meditationPractices?: readonly TownMeditationPractice[];
  readonly meditationEncounters?: readonly TownMeditationEncounter[];
}
export type StatePath = readonly (string | number)[];
export interface CoreTransaction {
  readonly state: Readonly<GameState>; readonly content: CoreContent;
  set(path: StatePath, value: unknown): void;
  splice(path: StatePath, start: number, deleteCount: number, values: readonly unknown[]): void;
  rng(stream: RngStreamName): Rng;
  emit(event: PendingDomainEvent): void;
  abort(reason: RejectReason, at?: string): never;
}
export interface CommandHandler<C extends Command = Command> {
  validate(state: Readonly<GameState>, command: C, content: CoreContent): RejectReason | null;
  apply(tx: CoreTransaction, command: C): void;
}
export interface CommandFact { readonly t: string; readonly payload?: JsonValue }
export * from './bus';
export { worldPaused } from './handlers';
