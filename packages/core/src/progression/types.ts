import type { ItemDef, MeridianProgress, SkillInstance } from '@tianshu/data/schemas';

export type MeridianTemperEffect = NonNullable<
  NonNullable<ItemDef['use']>['meridianTemper']
>;

export interface InnerPracticeInput {
  readonly mode: 'meditation' | 'practice';
  readonly elapsedTicks: number;
  readonly carriedTicks?: number;
  readonly cycleTicks: number;
  readonly fluxTrainBase: number;
  readonly effectiveLayer: number;
  readonly rateH: number;
  readonly meridianIds: readonly string[];
  readonly acupointIds: readonly string[];
}

export interface FluxTrainingChange {
  readonly targetKind: 'meridian' | 'acupoint';
  readonly targetRef: string;
  readonly previousFluxCap: number;
  readonly fluxCap: number;
  readonly previousStrengthLayer: number;
  readonly strengthLayer: number;
  readonly strengthXp: number;
}

export interface InnerPracticeResult {
  readonly progress: MeridianProgress;
  readonly completedCycles: number;
  readonly remainderTicks: number;
  readonly changes: readonly FluxTrainingChange[];
  readonly events: readonly ProgressionEvent[];
}

export interface MeditationState {
  readonly sessionId: string;
  readonly plannedTicks: number;
  readonly elapsedTicks: number;
  readonly status: 'active' | 'completed' | 'interrupted';
  readonly qiGatherState: 'gathering' | 'none';
}

export interface QigongDeviationEffect {
  readonly buffId: 'bf_chaqi';
  readonly ownActions: 3;
  readonly productionBp: 5000;
  readonly acuteGatherForbidden: true;
}

export type ProgressionEvent =
  | { readonly t: 'progression/innerPracticeCompleted'; readonly mode: InnerPracticeInput['mode'];
      readonly completedCycles: number; readonly remainderTicks: number }
  | { readonly t: 'progression/meridianBoostApplied'; readonly targetKind: MeridianTemperEffect['targetKind'];
      readonly targetRef: string; readonly grade: number; readonly strengthLayer: number;
      readonly strengthXp: number; readonly fluxCap: number }
  | { readonly t: 'progression/martialArtAdvanced'; readonly skillId: string;
      readonly gainedSxp: number; readonly gainedLayers: number; readonly trueLayer: number; readonly sxp: number }
  | { readonly t: 'progression/meditationInterrupted'; readonly sessionId: string;
      readonly causeId: string; readonly worldTick: number; readonly effect: QigongDeviationEffect };

export interface ProgressionState {
  readonly meridians: MeridianProgress;
  readonly skills: readonly SkillInstance[];
  readonly meditation: MeditationState | null;
}

export type ProgressionCommand =
  | { readonly t: 'progression/practiceInner'; readonly input: InnerPracticeInput }
  | { readonly t: 'progression/advanceMartialArt'; readonly skillId: string; readonly gainedSxp: number }
  | { readonly t: 'progression/applyMeridianBoost'; readonly effect: MeridianTemperEffect }
  | { readonly t: 'progression/interruptMeditation'; readonly causeId: string; readonly worldTick: number };

export interface ProgressionCommandResult {
  readonly accepted: boolean;
  readonly state: ProgressionState;
  readonly events: readonly ProgressionEvent[];
  readonly error?: string;
}
