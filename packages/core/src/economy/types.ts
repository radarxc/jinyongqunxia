import type { ItemDef, MeridianProgress } from '@tianshu/data/schemas';
import type {
  Equipment, EquipmentSlot, GameClock, Inventory, ShopState, WorldItems,
} from '../state';
import type { ProgressionEvent } from '../progression';

export type ItemKind = ItemDef['kind'];
export type InventorySort = 'category' | 'grade' | 'id';

export interface InventoryQuery {
  readonly kind?: ItemKind;
  readonly minimumGrade?: number;
  readonly maximumGrade?: number;
}

export interface AilmentState {
  readonly tag: string;
  readonly grade: number;
}

export interface AppliedItemEffect {
  readonly op: string;
  readonly grade: number;
  readonly params: Readonly<Record<string, unknown>>;
}

export interface MeridianAidState {
  readonly sourceItemId: string;
  readonly expiresAtTick: number;
  readonly rateBp: number;
  readonly successBp: number;
  readonly costReduceBp: number;
  readonly meridians?: readonly string[];
}

export interface PermanentItemBonuses {
  readonly stats: Readonly<Record<string, number>>;
  readonly hpMaxBp: number;
  readonly mpMaxBp: number;
}

export interface ConsumableTargetState {
  readonly characterId: string;
  readonly alive: boolean;
  readonly hp: number;
  readonly hpMax: number;
  readonly mp: number;
  readonly mpMax: number;
  readonly stamina: number;
  readonly staminaMax: number;
  readonly ailments: readonly AilmentState[];
  readonly temporaryEffects: readonly AppliedItemEffect[];
  readonly permanentBonuses: PermanentItemBonuses;
  readonly meridianAids: readonly MeridianAidState[];
  readonly meridians: MeridianProgress;
}
export interface ConsumableUseState {
  readonly battleUses: Readonly<Record<string, number>>;
  readonly chapterUses: Readonly<Record<string, number>>;
  /** Last accepted own-action token per item; ENG-09 advances the token once per normal action. */
  readonly lastBattleUseTurns?: Readonly<Record<string, number>>;
}

export type EconomyEvent =
  | { readonly t: 'economy/itemUsed'; readonly itemId: string; readonly targetId: string }
  | { readonly t: 'economy/itemEquipped'; readonly itemId: string; readonly slot: EquipmentSlot }
  | { readonly t: 'economy/itemUnequipped'; readonly itemId: string; readonly slot: EquipmentSlot }
  | { readonly t: 'economy/worldItemPickedUp'; readonly instanceKey: string; readonly itemId: string }
  | { readonly t: 'economy/shopRestocked'; readonly shopKey: string; readonly dayIndex: number }
  | { readonly t: 'economy/shopBought'; readonly shopKey: string; readonly itemId: string; readonly count: number; readonly totalPrice: number }
  | { readonly t: 'economy/shopSold'; readonly shopKey: string; readonly itemId: string; readonly count: number; readonly totalPrice: number };

export interface UseConsumableInput {
  readonly inventory: Inventory;
  /** Complete definitions for every stack currently in inventory. */
  readonly itemDefs: readonly ItemDef[];
  readonly item: ItemDef;
  readonly target: ConsumableTargetState;
  readonly context: 'battle' | 'field';
  readonly currentTick: number;
  readonly battleTurnToken?: number;
  readonly healingReceivedBp?: number;
  readonly usage?: ConsumableUseState;
}

export interface UseConsumableResult {
  readonly inventory: Inventory;
  readonly target: ConsumableTargetState;
  readonly usage: ConsumableUseState;
  readonly fieldTime: number;
  readonly events: readonly (EconomyEvent | ProgressionEvent)[];
}

export type EquipmentPanelStat =
  | 'hpMax' | 'mpMax' | 'atkOut' | 'atkIn' | 'defOut' | 'defIn'
  | 'con' | 'str' | 'agi' | 'wis' | 'wil' | 'luk' | 'cha'
  | 'hit' | 'eva' | 'parry' | 'pierce' | 'crit' | 'critDmg' | 'tough'
  | 'spd' | 'mov' | 'jump' | 'qinggong' | 'counter' | 'combo' | 'seal'
  | 'effHit' | 'effRes' | 'healPower' | 'healRecv'
  | 'resPoison' | 'resGu' | 'resSeal' | 'resInjury' | 'resCold' | 'resHeat'
  | 'resMind' | 'resCC';
export type EquipmentPanel = Readonly<Record<EquipmentPanelStat, number>>;
export interface EquipmentModifier {
  readonly stat: EquipmentPanelStat;
  readonly mode: 'flat' | 'pctBp';
  readonly value: number;
}
export interface LawProfile {
  readonly uniform: true;
  readonly allowedIdentityTags: readonly string[];
  readonly violation: 'uniformImpersonation';
  readonly wantedIntent: 'activate';
  readonly normalGate: 'blocked';
}
export interface EquipmentRule {
  readonly itemId: string;
  readonly slot: EquipmentSlot;
  readonly hands?: 1 | 2 | 'pair';
  /** Required for off-hand rules so two-handed compatibility is explicit. */
  readonly offHandRole?: 'secondaryWeapon' | 'shield' | 'hiddenCarrier';
  readonly uniqueEquipped?: boolean;
  readonly modifiers?: readonly EquipmentModifier[];
  readonly lawProfile?: LawProfile;
  readonly exposure?: 'visible' | 'covered';
}
export interface EquipmentChangeResult {
  readonly equipment: Equipment;
  readonly inventory: Inventory;
  readonly displacedItemIds: readonly string[];
  readonly events: readonly EconomyEvent[];
}

export interface UniformExposureEvent {
  readonly equipId: string; readonly wearerId: string; readonly lawProfile: LawProfile;
  readonly exposure: 'visible' | 'covered'; readonly locationId: string; readonly time: number;
}
export interface LawEnforcementState {
  readonly wantedLevel: number;
  readonly normalCityGateBlocked: boolean;
}
export interface UniformCheckInput {
  readonly equipment: Equipment; readonly rules: readonly EquipmentRule[];
  readonly wearerId: string; readonly identityTags: readonly string[];
  readonly locationId: string; readonly time: number;
  readonly lawState: LawEnforcementState; readonly wantedIncrease?: number;
}
export interface UniformCheckResult {
  readonly lawState: LawEnforcementState; readonly events: readonly UniformExposureEvent[];
}

export interface WorldItemRule {
  readonly instanceKey: string; readonly sceneId: string; readonly anchorId: string;
  readonly visibleFromTick?: number; readonly visibleUntilTick?: number;
  readonly requiredFlags?: readonly string[]; readonly forbiddenFlags?: readonly string[];
}
export interface WorldVisibilityContext { readonly worldTick: number; readonly flags: readonly string[]; }
export interface WorldItemView {
  readonly instanceKey: string; readonly itemId: string; readonly count: number;
  readonly sceneId: string; readonly anchorId: string; readonly collectible: boolean;
}
export interface WorldPickupResult {
  readonly worldItems: WorldItems; readonly inventory: Inventory; readonly event: EconomyEvent;
}

export type WorldTier = 'HIGH' | 'MID' | 'LOW';
export type ShopKind = 'normal' | 'famous' | 'blackMarket';
export interface ShopContext {
  readonly chapterId: string; readonly worldTier: WorldTier; readonly shopKind: ShopKind;
  readonly townLevel: number; readonly flags: readonly string[];
}
export interface ShopPricing {
  /** Resolved item value in integer wen. */
  readonly referencePrice: number; readonly charisma: number; readonly speech: number;
  readonly shopBp?: number; readonly chapterPriceBp?: number; readonly outletBp?: number;
  /** Frozen 30-day supply multiplier and per-category sale saturation. */
  readonly marketBp?: number; readonly saturationBp?: number;
}
export interface ShopOffer {
  readonly itemId: string; readonly count: number; readonly unitBuyPrice: number;
  readonly maxGrade: number; readonly nextRestockDay: number;
}
export interface ShopRestockResult {
  readonly shop: ShopState; readonly events: readonly EconomyEvent[];
}
export interface ShopTransactionInput {
  readonly itemId: string; readonly count: number; readonly inventory: Inventory;
  readonly money: number; readonly pricing: ShopPricing; readonly clock: GameClock;
}
export interface ShopTransactionResult {
  readonly shop: ShopState; readonly inventory: Inventory; readonly money: number;
  readonly events: readonly EconomyEvent[];
}
