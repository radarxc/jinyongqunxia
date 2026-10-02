import type {
  BattleCommand, BattleEvent, BattleSetup, BattleUnitSeed, HexAim, HexCoord,
  HexPrimitiveShape, RngState, BattleResult, SideId,
} from '@tianshu/core';
import type { BattleCell, BattleMarker } from '@tianshu/render/battle';

export interface MovePresentation {
  readonly id: string; readonly name: string; readonly skillId: string; readonly skillName: string;
  readonly shape: HexPrimitiveShape; readonly range: number;
}
export interface BattleLaunch {
  readonly setup: BattleSetup; readonly seeds: readonly BattleUnitSeed[];
  readonly cells: readonly BattleCell[]; readonly markers: readonly (BattleMarker & { readonly name: string })[];
  readonly moves: readonly MovePresentation[]; readonly title: string; readonly preview: boolean;
}
export interface BattleCapability { readonly enabled: boolean; readonly reason: string }
export interface BattleCapabilities {
  readonly move: BattleCapability; readonly item: BattleCapability;
  readonly defend: BattleCapability; readonly gather: BattleCapability;
}
export interface MeridianPointView {
  readonly id: string; readonly label: string; readonly qi: number;
  readonly state: 'flowing' | 'blocked' | 'occupied' | 'damaged';
}
export interface MeridianView {
  readonly routeId: string | null; readonly completionBp: number | null;
  readonly inFlight: number | null; readonly capacity: number | null;
  readonly attackBp: number | null; readonly dantianDamage: number;
  readonly points: readonly MeridianPointView[];
}
export interface BattleMoveView extends MovePresentation {
  readonly mpCost: number; readonly recovery: number; readonly hitZone: string;
  readonly available: boolean; readonly completionBp: number | null; readonly attackBp: number | null;
}
export interface BattleUnitView extends BattleMarker {
  readonly name: string; readonly side: SideId; readonly control: 'player' | 'ai';
  readonly hp: number; readonly hpMax: number; readonly mp: number; readonly mpMax: number;
  readonly ct: number; readonly spd: number; readonly state: string;
  readonly statuses: readonly { readonly id: string; readonly label: string; readonly detail: string }[];
  readonly moves: readonly BattleMoveView[]; readonly meridian: MeridianView;
}
export interface TimelineView { readonly unitId: string; readonly atTick: number; readonly opening: boolean }
export interface AreaPreview {
  readonly requestId: number; readonly revision: number; readonly actor: string; readonly moveId: string;
  readonly anchor: HexCoord; readonly aim: HexAim; readonly cells: readonly HexCoord[];
  readonly targetIds: readonly string[]; readonly valid: boolean; readonly reason: string;
}
export interface BattleRewards {
  readonly drops: readonly { readonly name: string; readonly count: number }[] | null;
  readonly martial: readonly { readonly name: string; readonly experience: number; readonly proficiency: number }[] | null;
  readonly cycles: number | null;
}
export interface MovePlayback {
  readonly moveId: string; readonly from: BattleMarker; readonly to: readonly BattleMarker[];
  readonly result: { readonly actionNo: number; readonly hpDamage: number; readonly events: readonly BattleEvent[] };
}
export type MoveResolvedHook = (moveId: string, from: BattleMarker, to: readonly BattleMarker[], result: MovePlayback['result']) => void;
export interface BattleInfo {
  readonly title: string; readonly preview: boolean; readonly setup: BattleSetup;
  readonly cells: readonly BattleCell[]; readonly capabilities: BattleCapabilities;
}
/** Full packet on query/entry; action packets contain only changed units. */
export interface BattlePacket {
  readonly id: string; readonly revision: number; readonly info?: BattleInfo;
  readonly units: readonly BattleUnitView[]; readonly actorId: string | null;
  readonly tick: number; readonly round: number; readonly actionNo: number;
  readonly timeline: readonly TimelineView[]; readonly auto: boolean;
  readonly preview: AreaPreview | null; readonly result: BattleResult | null;
  readonly rewards: BattleRewards | null; readonly resolved?: MovePlayback;
}
export interface BattleView extends Omit<BattlePacket, 'info'> { readonly info: BattleInfo }
export type BattleUiCommand =
  | { readonly t: 'battle/demo'; readonly source: 'world' | 'town' }
  | { readonly t: 'battle/enter'; readonly launch: BattleLaunch }
  | { readonly t: 'battle/leave' }
  | { readonly t: 'battle/auto'; readonly enabled: boolean }
  | { readonly t: 'battle/step'; readonly revision: number }
  | { readonly t: 'battle/preview'; readonly revision: number; readonly actor: string; readonly moveId: string;
      readonly anchor: HexCoord; readonly aim: HexAim; readonly requestId: number }
  | { readonly t: 'battle/act-at'; readonly preview: AreaPreview }
  | { readonly t: 'battle/wait'; readonly actor: string; readonly revision: number }
  | { readonly t: 'battle/move'; readonly actor: string; readonly destination: HexCoord; readonly revision: number }
  | { readonly t: 'battle/item'; readonly actor: string; readonly itemId: string; readonly targetId: string; readonly revision: number }
  | { readonly t: 'battle/defend'; readonly actor: string; readonly revision: number }
  | { readonly t: 'battle/gather'; readonly actor: string; readonly routeId: string; readonly revision: number };
export interface BattleTranscript {
  readonly launch: BattleLaunch; readonly commands: readonly BattleCommand[];
  readonly events: readonly BattleEvent[]; readonly rng: RngState;
}
