import type { Rng } from '../../rng';

export type QiNature = 'yin' | 'yang' | 'harmony';

export interface MeridianNodeInput {
  readonly acupointRef: string;
  readonly opened: boolean;
  readonly fluxCap: number;
  readonly lengthUnit: number;
  readonly flowBp: number;
  readonly stagnationBp?: number;
  readonly backlog?: number;
  readonly ruptureDamage?: number;
  readonly sealLevel?: number;
}

export interface MeridianRouteStepInput {
  readonly acupointRef: string;
  readonly lengthUnit: number;
  readonly segmentCt: number;
  readonly riskBp: number;
}

export interface MeridianRouteInput {
  readonly routeId: string;
  readonly purpose?: 'attack' | 'defense' | 'movement';
  readonly steps: readonly MeridianRouteStepInput[];
  readonly previewReference?: RawMeridianProfile;
}

export interface PreviewOptions {
  readonly previewRollBp?: number;
  readonly opponent?: MeridianProfile;
}

export interface MeridianFlowPreview {
  readonly unitId: string;
  readonly routeId: string;
  attempted: number;
  completed: number;
  flowCt: number;
  routeQualityBp: number;
  releasedQi: number;
  routeCarryCap: number;
  circulationBp: number;
  blockedAt: number | null;
  blockedNode: string | null;
  disabledReason: null | 'unopened_node' | 'ruptured_node' | 'point_seal_9' | 'occupied_node';
  readonly qualitiesBp: number[];
  readonly jamChancesBp: number[];
  readonly arrivalBp: number[];
  stateVersion: number;
  readonly profile: MeridianProfile;
  attackerStrengthBp: number;
  defenderStrengthBp: number;
  meridianAttackBp: number;
  meridianDefenseBp: number;
  meridianSpeedBp: number;
  readonly trace: QiFlowTraceStep[];
}

export interface MeridianFlowInput {
  readonly unitId: string;
  readonly productionPerTick: number;
  readonly qiSpeedBp: number;
  readonly practiceBp: number;
  readonly nodes: readonly MeridianNodeInput[];
  readonly routes: readonly MeridianRouteInput[];
  readonly activeRouteId?: string;
  readonly unitQiHardCap?: number;
}

export interface RawMeridianProfile {
  readonly releasedQi: number;
  readonly meanFluxCap: number;
  readonly meanFlowBp: number;
  readonly routeQualityBp: number;
}

export interface MeridianProfile {
  readonly qiBp: number;
  readonly widthBp: number;
  readonly flowBp: number;
  readonly completionBp: number;
}

export interface QiFlowTraceStep {
  readonly acupointRef: string;
  readonly incoming: number;
  readonly passed: number;
  readonly fluxCap: number;
  readonly effectiveFlowBp: number;
  readonly jamChanceBp: number;
  readonly jammed: boolean;
}

export interface ResolveQiMoveInput {
  readonly routeId: string;
  readonly moveId: string;
  readonly targetIds: readonly string[];
  readonly causeId: string;
  readonly battleTick: number;
  readonly reference: RawMeridianProfile;
  readonly defender?: MeridianProfile;
  readonly critical: boolean;
  readonly noCrit?: boolean;
  readonly critRollBp: number;
  readonly critChanceBp: number;
}

export type CommitQiMoveInput = Omit<ResolveQiMoveInput,
  'critical' | 'noCrit' | 'critRollBp' | 'critChanceBp'>;

export interface QiGatherStatus {
  readonly unitId: string; readonly routeId: string; readonly purpose: 'attack' | 'defense' | 'movement';
  readonly dantianQi: number; readonly routeInFlightQi: number; readonly totalInFlightQi: number;
  readonly routeCarryCap: number; readonly unitQiHardCap: number; readonly circulationBp: number;
  readonly canInject: boolean; readonly canAdvance: boolean; readonly full: boolean;
}

export interface QiMoveResolution {
  readonly t: 'qi.moveResolved';
  readonly unitId: string;
  readonly routeId: string;
  readonly attempted: number;
  readonly completed: number;
  readonly flowCt: number;
  readonly blockedAt: number | null;
  readonly blockedNode: string | null;
  readonly releasedQi: number;
  readonly routeCarryCap: number;
  readonly routeTravelTicks: number;
  readonly circulationBp: number;
  readonly routeQualityBp: number;
  readonly profile: MeridianProfile;
  readonly attackerStrengthBp: number;
  readonly baseMeridianAttackBp: number;
  readonly circulationDamageBp: number;
  readonly meridianAttackBp: number;
  readonly trace: readonly QiFlowTraceStep[];
}

export interface FullCycleCritEvent {
  readonly t: 'qi.fullCycleCrit';
  readonly unitId: string;
  readonly targetIds: readonly string[];
  readonly moveId: string;
  readonly routeId: string;
  readonly releasedQi: number;
  readonly routeCarryCap: number;
  readonly circulationBp: 10000;
  readonly critRollBp: number;
  readonly critChanceBp: number;
  readonly messageKey: string;
  readonly message: string;
  readonly causeId: string;
  readonly battleTick: number;
}

export interface ResolveQiMoveResult {
  readonly resolution: QiMoveResolution;
  readonly fullCycleCrit: FullCycleCritEvent | null;
}

export interface QiMoveResolver {
  resolve(input: ResolveQiMoveInput, battleRng: Rng): ResolveQiMoveResult;
}
