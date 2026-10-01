import type { BuffInstance } from '../buff';
import type { ForeignQiInstance, AcupointOccupancy, HitZone } from './damage';
import type { AttackDirection } from './damage';

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
  readonly start: { readonly deployment: string; readonly initiativeSide: SideId;
    readonly battleAnchor: string; readonly profile: 'normal' | 'narrow';
    readonly initialByUnit: readonly { readonly unitRef: string; readonly ct: number; readonly rage: number }[];
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
}

export interface BattleStats { readonly level: number; readonly atkOut: number; readonly atkIn: number;
  readonly defOut: number; readonly defIn: number; readonly aptitude: number; readonly aptitudeInner: number;
  readonly critDamagePct: number; readonly hit: number; readonly eva: number; readonly parry: number;
  readonly pierce: number; readonly crit: number; readonly tough: number; readonly strength: number }
export interface BattleMove {
  readonly id: `mv_${string}`; readonly powerBp: number; readonly referencePowerBp: number;
  readonly wInBp: number; readonly recovery: number; readonly mpCost: number; readonly hitZone: HitZone;
  readonly hitMod?: number; readonly dmgUpBp?: number; readonly pierceOutBp?: number;
  readonly pierceInBp?: number; readonly ultimate?: boolean; readonly projection?: boolean;
  readonly penetratingQi?: boolean; readonly acupointStrike?: boolean; readonly sourceGrade?: number;
  readonly sourceInnerId?: string; readonly releasedQi?: number; readonly qiSpeedBp?: number;
  readonly digestRatioBp?: number; readonly sealBp?: number; readonly sealLevel?: number;
  readonly targetAcupoint?: string; readonly affectedRouteRefs?: readonly string[];
  readonly reversePath?: ForeignQiInstance['reversePath']; readonly autoTargetCap?: number;
  readonly meridianAttackBp?: number; readonly direction?: AttackDirection;
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
  redirectedQi: number; ownActions: number;
}
export interface BattleEvent { readonly t: string; readonly actionNo: number; readonly actor?: string;
  readonly target?: string; readonly amount?: number; readonly shieldSpent?: number;
  readonly level?: number; readonly message?: string }
export interface BattleActCommand { readonly t: 'battle/act'; readonly actor: string; readonly moveId: string;
  readonly targetIds: readonly string[] }
export interface BattleWaitCommand { readonly t: 'battle/wait'; readonly actor: string }
export type BattleCommand = BattleActCommand | BattleWaitCommand;
export interface BattleState {
  readonly setup: BattleSetup; readonly units: BattleUnit[]; tick: number; round: number; actionNo: number;
  phase: 'opening' | 'running' | 'ended'; result: BattleResult | null; openingOrder: string[];
  readonly events: BattleEvent[]; readonly acceptedCommands: BattleCommand[];
}
