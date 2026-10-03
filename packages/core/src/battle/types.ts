import type { BuffInstance } from '../buff';
import type { ItemDef } from '@tianshu/data/schemas';
import type { AppliedItemEffect } from '../economy';
import type { Inventory } from '../state';
import type { ForeignQiInstance, AcupointOccupancy, HitZone } from './damage';
import type { MeridianFlowInput } from './meridian-flow/types';
import type { MeridianFlowSnapshot } from './meridian-flow/runtime';
import type { AttackDirection } from './damage';
import type { HexAim, HexCoord, HexDelivery, HexDir, HexLosKind } from '../hex';
import type { HexPrimitiveShape } from './formation';

export type SideId = 'player' | 'ally' | 'enemy' | 'neutral';
export type UnitState = 'active' | 'hidden' | 'offgrid' | 'held' | 'downed'
  | 'yielded' | 'surrendered' | 'captured' | 'fled' | 'plunged';
export type EntryKind = 'encounter' | 'story' | 'spar' | 'deathmatch' | 'guard' | 'meditationAmbush';
export type BattleResult = 'win' | 'lose' | 'retreat' | 'draw';
export type Relation = 'friendly' | 'hostile' | 'neutral';

export interface BattleParticipant {
  readonly unitRef: string; readonly unitIndex: number; readonly side: SideId;
  readonly control: 'player' | 'ai'; readonly spawn: string; readonly state: UnitState;
  readonly required: boolean; readonly group?: string;
}
export interface BattleInitialEffect { readonly unitRef: string; readonly buffRef: `bf_${string}`;
  readonly stacks: number; readonly remainingOwnActions: number; readonly cause: string }
export interface BattleCover {
  readonly vs: readonly Extract<HexDelivery, 'projectile' | 'ranged'>[];
  readonly hit: number; readonly damageBp: number;
  /** World directions from the target toward sources for which directional cover applies. */
  readonly sourceDirs?: readonly HexDir[];
}
export interface BattleGridCell extends HexCoord {
  readonly height: number; readonly moveCost: number; readonly canopy: number;
  readonly los: HexLosKind; readonly standable: boolean; readonly narrow: boolean;
  readonly dangerous: boolean; readonly terrainDealtBp: number; readonly terrainTakenBp: number;
  readonly cover: BattleCover | null;
}
export interface BattleInitialUnit {
  readonly unitRef: string; readonly ct: number; readonly rage: number;
  readonly pos: HexCoord; readonly facing: HexDir;
}
export interface BattleDrop { readonly itemId: string; readonly name: string; readonly count: number }
export interface BattleLootEntry extends BattleDrop { readonly weight: number }
export interface BattleRewardSetup {
  readonly drops: readonly BattleDrop[];
  readonly lootPool: readonly BattleLootEntry[];
  readonly lootDraws: number;
}
export type BattleCondition =
  | { readonly kind: 'allHostileDown'; readonly side: SideId }
  | { readonly kind: 'unitDown'; readonly unitRef: string }
  | { readonly kind: 'surviveRounds'; readonly rounds: number }
  | { readonly kind: 'actionLimit'; readonly actions: number };
export interface BattleSetup {
  readonly schema: 'battle-setup.v1'; readonly encounterId: `enc_${string}`;
  readonly setupId: string; readonly seed: number; readonly sourceSnapshotHash: string;
  readonly entry: { readonly kind: EntryKind; readonly sourceId: string; readonly triggerId: string;
    readonly worldTick: number; readonly meditationInterrupted: boolean };
  readonly participants: readonly BattleParticipant[];
  readonly relations: Readonly<Record<SideId, Partial<Record<SideId, Relation>>>>;
  readonly grid: { readonly topology: 'hex-pointy'; readonly cells: readonly BattleGridCell[] };
  readonly start: { readonly deployment: string; readonly initiativeSide: SideId;
    readonly battleAnchor: string; readonly profile: 'normal' | 'narrow';
    readonly initialByUnit: readonly BattleInitialUnit[];
    readonly initialEffects: readonly BattleInitialEffect[] };
  readonly end: { readonly winCond: readonly BattleCondition[]; readonly loseCond: readonly BattleCondition[];
    readonly drawCond: readonly BattleCondition[]; readonly onDefeat: 'retry' | `branch:${string}` | 'continue' };
  readonly rules: { readonly mode: 'normal' | 'spar' | 'deathmatch' | 'guard';
    readonly noAuto: boolean; readonly noRetreat: boolean; readonly noItems: boolean;
    readonly mercyAllowed: boolean; readonly lethalIntent: boolean; readonly roundLimit: number;
    readonly friendlyFire: boolean; readonly boss: boolean };
  readonly waves: readonly string[]; readonly returnContext: { readonly sceneRef: string;
    readonly anchorRef: string; readonly recovery: 'preserve' | 'sparRestore' | 'checkpoint';
    readonly storyBranchRef?: string };
  readonly meridianInputs: readonly MeridianFlowInput[];
  readonly inventory: Inventory; readonly itemDefs: readonly ItemDef[];
  readonly rewards: BattleRewardSetup;
}

export interface BattleStats { readonly level: number; readonly atkOut: number; readonly atkIn: number;
  readonly defOut: number; readonly defIn: number; readonly aptitude: number; readonly aptitudeInner: number;
  readonly critDamagePct: number; readonly hit: number; readonly eva: number; readonly parry: number;
  readonly pierce: number; readonly crit: number; readonly tough: number; readonly strength: number }
export interface BattleMove {
  readonly id: `mv_${string}`; readonly powerBp: number; readonly referencePowerBp: number;
  readonly skillId?: `sk_${string}`; readonly meridianRouteRef?: string;
  readonly wInBp: number; readonly recovery: number; readonly mpCost: number; readonly hitZone: HitZone;
  readonly hitMod?: number; readonly dmgUpBp?: number; readonly pierceOutBp?: number;
  readonly pierceInBp?: number; readonly ultimate?: boolean; readonly projection?: boolean;
  readonly penetratingQi?: boolean; readonly acupointStrike?: boolean; readonly sourceGrade?: number;
  readonly sourceInnerId?: string; readonly releasedQi?: number; readonly qiSpeedBp?: number;
  readonly digestRatioBp?: number; readonly sealBp?: number; readonly sealLevel?: number;
  readonly targetAcupoint?: string; readonly affectedRouteRefs?: readonly string[];
  readonly reversePath?: ForeignQiInstance['reversePath']; readonly autoTargetCap?: number;
  readonly meridianAttackBp?: number; readonly direction?: AttackDirection;
  readonly range: { readonly min: number; readonly max: number };
  readonly delivery: HexDelivery; readonly shape: HexPrimitiveShape;
  readonly hTol: number; readonly target: 'enemy' | 'ally' | 'self' | 'tile' | 'any';
  readonly friendlyFire?: 'none' | 'allies' | 'all';
}
export interface ZoneGuardState { qi: number; readonly carryCapacity: number;
  readonly strengthBp: number; readonly flowRatioBp: number; readonly breakGuardBp: number }
export interface BattleUnit {
  readonly id: string; readonly unitIndex: number; readonly side: SideId; readonly control: 'player' | 'ai';
  state: UnitState; active: boolean; hp: number; readonly hpMax: number; mp: number; readonly mpMax: number;
  shield: number; ct: number; ctFrozen: boolean; pendingShift: number; readonly spd: number;
  readonly qinggong: number; readonly openingQinggong: number; readonly openingPriority: number;
  readonly agi: number; readonly stats: BattleStats; readonly moves: readonly BattleMove[];
  readonly zoneGuards: Record<HitZone, ZoneGuardState>;
  buffs: BuffInstance[]; foreignQi: ForeignQiInstance[]; acupointOccupancies: AcupointOccupancy[];
  readonly meridianDefenseBp: number; readonly qiProductionPerTick: number;
  readonly reverseQi: { readonly minFluxCap: number; readonly routeCarryCap: number } | null;
  redirectedQi: number; redirectedQiExpiresAtOwnAction: number | null;
  ownActions: number; pos: HexCoord; facing: HexDir;
  readonly move: number; readonly jump: number; waitStreak: number;
  readonly medical: number; readonly innerGrade: number;
  stamina: number; readonly staminaMax: number; readonly healingReceivedBp: number;
  itemEffects: AppliedItemEffect[];
  itemState: { uses: number; readonly maxUses: number; battleUses: Record<string, number>;
    lastBattleUseTurns: Record<string, number> };
}
export interface BattleEvent { readonly t: string; readonly actionNo: number; readonly actor?: string;
  readonly target?: string; readonly amount?: number; readonly shieldSpent?: number;
  readonly level?: number; readonly message?: string; readonly routeId?: string;
  readonly itemId?: string; readonly payload?: unknown }
export type BattleAction =
  | { readonly t: 'skill'; readonly move: string; readonly target: string | HexCoord;
      readonly aim?: HexAim }
  | { readonly t: 'item'; readonly item: string; readonly target: string | HexCoord }
  | { readonly t: 'guard'; readonly routeRef?: string }
  | { readonly t: 'acuteQiGather'; readonly routeRef: string }
  | { readonly t: 'wait' };
export interface BattleActCommand {
  readonly t: 'battle/act'; readonly actor: string; readonly walkTo?: HexCoord;
  readonly action: BattleAction; readonly facing?: HexDir;
}
export interface BattleWaitCommand { readonly t: 'battle/wait'; readonly actor: string }
export type BattleCommand = BattleActCommand | BattleWaitCommand;
export interface BattleMeridianUnitState {
  readonly unitId: string; readonly unitIndex: number; flow: MeridianFlowSnapshot;
  activeDefense: { readonly routeId: string; readonly qualityBp: number;
    readonly expiresAtOwnAction: number; readonly causeId: string | null } | null;
  movementProjection: { readonly routeId: string; readonly qualityBp: number;
    readonly speedBp: number; readonly sealed: boolean; readonly ruptured: boolean } | null;
  innerGuard: { readonly enabled: boolean; readonly routeId: string;
    readonly breakGuardBp: number; readonly reflectBp: number } | null;
}
export interface BattleRewardStats {
  readonly martialUses: Array<{ unitId: string; skillId: string; uses: number }>;
  readonly movementActions: Array<{ unitId: string; count: number }>;
  readonly fullCirculations: Array<{ unitId: string; count: number }>;
}
export interface BattleRewards {
  readonly drops: readonly BattleDrop[];
  readonly martialUses: readonly { readonly unitId: string; readonly skillId: string; readonly uses: number }[];
  readonly movementTrained: readonly string[]; readonly fullCirculations: readonly {
    readonly unitId: string; readonly count: number;
  }[];
}
export interface BattleState {
  readonly setup: BattleSetup; readonly grid: { readonly topology: 'hex-pointy';
    readonly cells: readonly BattleGridCell[] }; readonly units: BattleUnit[];
  tick: number; round: number; actionNo: number;
  phase: 'opening' | 'running' | 'ended'; result: BattleResult | null; openingOrder: string[];
  readonly meridianByUnit: BattleMeridianUnitState[]; inventory: Inventory;
  readonly rewardStats: BattleRewardStats;
  readonly events: BattleEvent[]; readonly acceptedCommands: BattleCommand[];
}
