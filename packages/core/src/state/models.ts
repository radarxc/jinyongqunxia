import type { MeridianProgress, SkillInstance } from '@tianshu/data/schemas';
import type { JsonValue } from '@tianshu/shared';
import type { RngState, RngStreamName } from '../rng';
import type { ConsumableTargetState } from '../economy/types';
import type { BattleState } from '../battle/types';
import type { WorldMapState } from '../world/worldmap-types';
import type { TownSessionState } from '../world/town-runtime';

export type EquipmentSlot = 'mainHand' | 'offHand' | 'head' | 'body' | 'innerBody' | 'hands' | 'shoulder' | 'cape' | 'waist' | 'feet' | 'accessory';
export type SkillState = SkillInstance;
export interface CharacterStats { readonly hpMax: number; readonly mpMax: number; readonly strength: number; readonly speed: number; readonly tenacity: number; readonly coordination: number; }
export interface CharacterResources { readonly hp: number; readonly mp: number; }
export interface CharacterState {
  readonly characterId: string; readonly status: 'active' | 'departed' | 'dead';
  readonly innate: Readonly<Record<'con' | 'str' | 'agi' | 'wis' | 'wil' | 'luk' | 'cha', number>>;
  readonly skills: readonly SkillState[]; readonly meridians: MeridianProgress;
  readonly legacyHpCredit: number; readonly legacyMpCredit: number;
  readonly stats: CharacterStats; readonly resources: CharacterResources;
  readonly consumable: Omit<ConsumableTargetState, 'characterId' | 'alive' | 'hp' | 'hpMax' | 'mp' | 'mpMax' | 'meridians'>;
}
export interface InventoryStack { readonly itemId: string; readonly count: number; }
export interface Inventory { readonly stacks: readonly InventoryStack[]; }
export interface EquipmentEntry { readonly slot: EquipmentSlot; readonly itemId: string | null; }
export interface Equipment { readonly entries: readonly EquipmentEntry[]; }
export interface WorldItemState { readonly instanceKey: string; readonly itemId: string; readonly count: number; readonly locationId: string; readonly collectible: boolean; readonly pickedUp: boolean; }
export interface WorldItems { readonly entries: readonly WorldItemState[]; }
export interface ShopStockState { readonly itemId: string; readonly count: number; readonly lastRestockDay: number; }
export interface ShopState { readonly shopKey: string; readonly stock: readonly ShopStockState[]; }
export interface ResolvedStoryWindow { readonly opensAtTick: number; readonly closesAtTick: number; readonly defersUsed: number; }
export interface StoryLineState { readonly lineId: string; readonly status: 'locked' | 'available' | 'active' | 'completed' | 'expired'; readonly activeNodeIds: readonly string[]; readonly completedNodeIds: readonly string[]; readonly expiredNodeIds: readonly string[]; readonly chosenOptions: Readonly<Record<string, string>>; readonly branchPath: readonly string[]; readonly resolvedWindows: Readonly<Record<string, ResolvedStoryWindow>>; readonly appliedEffectIds: readonly string[]; readonly revision: number; }
export interface StoryState { readonly chapterId: string; readonly lines: readonly StoryLineState[]; }
export interface GameClock { readonly epochId: string; readonly calendarSpecId: string; readonly epochYear: number; readonly elapsedTicks: number; readonly shichenIndex: number; readonly dayIndex: number; readonly monthIndex: number; readonly yearOffset: number; readonly slotInDay: number; }
export interface MetaState {
  readonly saveSchema: number; readonly masterSeed: number; readonly runId: string;
  readonly nextRuntimeOrdinal: number; readonly contentHash: string; readonly rulesProtocol: number;
  readonly rngProtocol: number; readonly coreVersion: string; readonly coreBuild: string;
  readonly stateVersion: number; readonly worldTick: number; readonly nextEventSeq: number;
  readonly rng: Readonly<Record<RngStreamName, RngState>>; readonly debugTainted: boolean;
}
export type DifficultyId = 'diff_jianghu' | 'diff_xiake' | 'diff_zongshi';
export interface ProtagonistIdentity {
  readonly name: string; readonly gender: string; readonly appearance: string;
  readonly pronoun: string; readonly originId: string;
}
export interface DifficultyLogEntry {
  readonly difficulty: DifficultyId; readonly worldTick: number; readonly revision: number;
}
export interface RuleSwitchState {
  readonly difficulty: DifficultyId; readonly heavenlyTrialLevel: null;
  readonly switches: Readonly<Record<string, boolean>>;
  readonly difficultyLog: readonly DifficultyLogEntry[]; readonly ruleRevision: number;
}
export interface ProfileState {
  readonly protagonist: CharacterState | null; readonly companions: readonly CharacterState[];
  /** Optional only for schema-2 saves created before ENG-17a; factories always populate both. */
  readonly identity?: ProtagonistIdentity | null; readonly replayRules?: RuleSwitchState;
}
export interface KnownCharacterState {
  readonly npcId: string; readonly relationship: 'met' | 'befriended'; readonly affinity: number;
  readonly character: CharacterState | null;
}
export interface ChapterState {
  readonly chapterId: string; readonly worldYear: number; readonly clock: GameClock;
  readonly story: StoryState; readonly worldItems: WorldItems; readonly shops: readonly ShopState[];
  readonly worldMap: WorldMapState | null; readonly town: TownSessionState | null;
  readonly npcs: readonly KnownCharacterState[]; readonly itemChapterUses: Readonly<Record<string, number>>;
  /** Optional only for schema-2 saves created before ENG-17a. */
  readonly prologue?: PrologueState;
}
export interface PartyState { readonly inventory: Inventory; readonly equipment: Equipment; readonly money: number; }
export interface WorldNavigationState {
  readonly locationId: string; readonly selectedDestinationId: string | null;
}
export interface WorldState {
  readonly navigation: WorldNavigationState;
  readonly pendingTimeAdvance: { readonly remainingTicks: number; readonly reason: 'rest' | 'story' } | null;
}
export interface DialogueState {
  readonly storyId: string; readonly storyHash: string; readonly entryKey: string;
  readonly storyJsonState: string; readonly randomSeed: number;
  readonly pendingIntents: readonly JsonValue[]; readonly consumedTagKeys: readonly string[];
  readonly speakerId?: string; readonly textKey?: string | null;
  readonly choices?: readonly { readonly choiceIndex: number; readonly textKey: string;
    readonly unavailableReason: string | null }[];
  readonly history?: readonly { readonly speakerId: string; readonly textKey: string }[];
}
export type PrologueMode = 'full' | 'summary' | 'skip';
export type PrologueRouteNodeId = 'n_c01' | 'n_summary' | 'n_skip_direct';
export type PrologueCompletionNodeId = 'n_full_complete' | 'n_summary_complete' | 'n_skip_complete';
export interface PrologueState {
  readonly mode: PrologueMode | null;
  /** Optional only for schema-2 saves written before route settlement was added. */
  readonly routeNodeId?: PrologueRouteNodeId | null;
  readonly completionNodeId?: PrologueCompletionNodeId | null;
  readonly exitKey?: 'first_sleep_to_baima' | null;
  readonly receipts: readonly string[];
}
export interface GameState {
  readonly meta: MetaState; readonly profile: ProfileState; readonly chapter: ChapterState;
  readonly party: PartyState; readonly world: WorldState;
  readonly battle: BattleState | null; readonly dialogue: DialogueState | null;
}
