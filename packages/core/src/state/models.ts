import type { MeridianProgress, SkillInstance } from '@tianshu/data/schemas';
import type { RngState, RngStreamName } from '../rng';
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
export interface MetaState { readonly coreVersion: string; readonly rngProtocol: number; readonly stateVersion: number; readonly worldTick: number; readonly nextEventSeq: number; readonly rng: Readonly<Record<RngStreamName, RngState>>; }
export interface ProfileState { readonly protagonist: CharacterState | null; readonly companions: readonly CharacterState[]; }
export interface ChapterState { readonly chapterId: string; readonly worldYear: number; readonly clock: GameClock; readonly story: StoryState; readonly worldItems: WorldItems; readonly shops: readonly ShopState[]; readonly worldMap: WorldMapState | null; readonly town: TownSessionState | null; }
export interface PartyState { readonly inventory: Inventory; readonly equipment: Equipment; readonly money: number; }
export interface TransientState { readonly pendingTimeAdvance: { readonly remainingTicks: number; readonly reason: 'rest' | 'story' } | null; readonly dialogue: null; readonly battle: null; }
export interface GameState { readonly meta: MetaState; readonly profile: ProfileState; readonly chapter: ChapterState; readonly party: PartyState; readonly transient: TransientState; readonly battle: null; }
