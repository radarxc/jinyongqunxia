import type { ChapterDef, EventDef, ItemDef, TownRuntimeDefinition, WorldMapRuntimeDefinition } from '@tianshu/data/schemas';
import type { JsonValue } from '@tianshu/shared';
import type { EquipmentRule } from '../economy';
import type { PendingDomainEvent } from '../event';
import type { Rng, RngStreamName } from '../rng';
import type { GameState } from '../state';
import type { TownCommand, TownMeditationEncounter, TownMeditationPractice } from '../world/town-runtime';
import type { WorldMapCommand } from '../world/worldmap-types';
import type { EventAnchor } from '../event';
import type { NpcWorldState } from '../npc';
import type { DifficultyId } from '../state';
import type { BookSleepPlan } from '../progression';
import type { RegionCommand, RegionRuntimeContent } from '../world/region-types';
import type { BattleActCommand, BattleSetup, BattleUnitSeed } from '../battle';

export interface WorldTickCommand { readonly t: 'world/tick' }
export type InventoryCommand =
  | { readonly t: 'inventory/equip'; readonly itemId: string; readonly slot: GameState['party']['equipment']['entries'][number]['slot'] }
  | { readonly t: 'inventory/unequip'; readonly slot: GameState['party']['equipment']['entries'][number]['slot'] }
  | { readonly t: 'inventory/use'; readonly itemId: string; readonly targetId: string };
export type DialogueCommand =
  | { readonly t: 'dialogue/start'; readonly storyId: string; readonly entryKey: string }
  | { readonly t: 'dialogue/continue' }
  | { readonly t: 'dialogue/choose'; readonly choiceIndex: number };
export type QuestChoiceCommand = { readonly t: 'quest/choose'; readonly questId: string;
  readonly optionId: string; readonly phase?: 'select' | 'settle';
  readonly completionNodeId?: string };
export type RulesCommand = { readonly t: 'rules/setDifficulty'; readonly difficulty: DifficultyId };
export type ChapterCommand = { readonly t: 'chapter/bookSleep'; readonly plan: BookSleepPlan };
export interface BattleEnterCommand { readonly t: 'battle/enter'; readonly setup: BattleSetup;
  readonly seeds: readonly BattleUnitSeed[] }
export type BattleBusActCommand =
  | (BattleActCommand & { readonly expectedRevision?: number; readonly automatic?: false })
  | { readonly t: 'battle/act'; readonly automatic: true; readonly expectedRevision?: number };
export interface BattleSetAutoBusCommand { readonly t: 'battle/setAuto'; readonly mode: 'manual' | 'auto';
  readonly expectedRevision?: number }
export interface BattleRetryBusCommand { readonly t: 'battle/retry'; readonly option: 'restart';
  readonly expectedRevision?: number }
export interface BattleReceiptCommand { readonly battleId: string; readonly outcomeSeq: number }
export type BattleFinalizeCommand = BattleReceiptCommand & { readonly t: 'battle/finalize' };
export type BattleLeaveCommand = BattleReceiptCommand & { readonly t: 'battle/leave' };
export type BattleBusCommand = BattleEnterCommand | BattleBusActCommand | BattleSetAutoBusCommand
  | BattleRetryBusCommand | BattleFinalizeCommand | BattleLeaveCommand;
export type Command = WorldTickCommand | WorldMapCommand | TownCommand | InventoryCommand
  | DialogueCommand | QuestChoiceCommand | RulesCommand | ChapterCommand | RegionCommand
  | BattleBusCommand;

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
  | 'CONSUMABLE_PERMANENT_CONTEXT' | 'CONSUMABLE_MERIDIAN_CONTEXT'
  | 'RULES_BATTLE_ACTIVE' | 'RULES_DIFFICULTY_INVALID' | 'DIALOGUE_ACTIVE'
  | 'DIALOGUE_INACTIVE' | 'DIALOGUE_STORY_UNKNOWN' | 'DIALOGUE_CHOICE_UNAVAILABLE'
  | 'DIALOGUE_CONTINUE_UNAVAILABLE' | 'QUEST_CHOICE_UNKNOWN' | 'QUEST_CHOICE_COMMITTED'
  | 'QUEST_ROUTE_NOT_SELECTED' | 'QUEST_ROUTE_MISMATCH'
  | 'BOOK_SLEEP_UNSUPPORTED' | 'BOOK_SLEEP_BUSY' | 'BOOK_SLEEP_NOT_READY'
  | 'BOOK_SLEEP_PLAN_INVALID' | 'BOOK_SLEEP_PLAN_CONFLICT' | 'BOOK_SLEEP_ALLOCATION_INVALID'
  | 'BOOK_SLEEP_CONTENT_UNAVAILABLE' | 'REGION_UNAVAILABLE' | 'REGION_CONTENT_MISMATCH'
  | 'REGION_SPAWN_UNKNOWN' | 'REGION_NOT_MOUNTED' | 'REGION_PATH_NOT_STANDABLE'
  | 'REGION_PATH_BLOCKED' | 'REGION_PATH_HEIGHT' | 'REGION_PATH_QINGGONG'
  | 'REGION_ANCHOR_UNKNOWN' | 'REGION_ANCHOR_OUT_OF_RANGE' | 'REGION_ANCHOR_NOT_VISIBLE'
  | 'REGION_ANCHOR_CONSUMED' | 'REGION_INTERACTION_UNSUPPORTED'
  | 'REGION_LOOT_UNKNOWN' | 'REGION_LOOT_CAPACITY' | 'REGION_EXIT_PENDING'
  | 'REGION_INTERACTION_BUSY'
  | 'REGION_EVENT_UNKNOWN' | 'REGION_EVENT_CHAPTER' | 'REGION_EVENT_CONDITION'
  | 'REGION_EVENT_ACTION' | 'REGION_EVENT_REFERENCE' | 'REGION_EVENT_INVENTORY'
  | 'SOURCE_EVENT_CONDITION' | 'SOURCE_EVENT_ACTION'
  | 'SOURCE_EVENT_REFERENCE' | 'SOURCE_EVENT_INVENTORY'
  | 'REGION_GATE_QINGGONG' | 'REGION_GATE_ITEM' | 'REGION_GATE_QUEST'
  | 'REGION_GATE_FLAG' | 'REGION_GATE_CAPABILITY' | 'REGION_GATE_LOCKED'
  | 'BATTLE_ALREADY_ACTIVE' | 'BATTLE_NOT_ACTIVE' | 'BATTLE_NOT_ENDED'
  | 'BATTLE_ENDED'
  | 'BATTLE_STALE_REVISION' | 'BATTLE_AUTO_FORBIDDEN' | 'BATTLE_AUTO_ACTIVE'
  | 'BATTLE_MANUAL_TURN' | 'BATTLE_NOT_MANUAL_TURN' | 'BATTLE_ACTION_REJECTED'
  | 'BATTLE_RECEIPT_MISMATCH' | 'BATTLE_REWARD_ITEM_UNKNOWN' | 'BATTLE_REWARD_CAPACITY';

export interface InkStoryContent { readonly storyId: string; readonly storyHash: string;
  readonly storyJson: string | Readonly<Record<string, unknown>> }

export interface CoreContent {
  readonly items?: readonly ItemDef[]; readonly equipmentRules?: readonly EquipmentRule[];
  readonly identityTags?: readonly string[]; readonly worldMaps?: readonly WorldMapRuntimeDefinition[];
  readonly towns?: readonly TownRuntimeDefinition[]; readonly townEventAnchors?: readonly EventAnchor[];
  readonly townNpcWorld?: NpcWorldState; readonly eraLayer?: string;
  readonly townNpcPlacements?: readonly { readonly npcId: string; readonly sceneId: string;
    readonly eraLayer: string; readonly point: readonly [number, number] }[];
  readonly meditationPractices?: readonly TownMeditationPractice[];
  readonly meditationEncounters?: readonly TownMeditationEncounter[];
  readonly inkStories?: readonly InkStoryContent[];
  readonly chapters?: readonly ChapterDef[]; readonly targetContentHash?: string;
  readonly events?: readonly EventDef[];
  readonly region?: RegionRuntimeContent;
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
  /** A successful retry-safe no-op. It must not read or advance an RNG stream. */
  readonly noop?: (state: Readonly<GameState>, command: C, content: CoreContent) => boolean;
  validate(state: Readonly<GameState>, command: C, content: CoreContent): RejectReason | null;
  apply(tx: CoreTransaction, command: C): void;
}
export interface CommandFact { readonly t: string; readonly payload?: JsonValue }
export * from './bus';
export { worldPaused } from './handlers';
export { battleHandler } from './battle-handler';
