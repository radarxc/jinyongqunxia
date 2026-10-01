import type { MeditationState, ProgressionEvent, QigongDeviationEffect } from './types';

export interface MeditationInterruptedResult {
  readonly state: MeditationState;
  readonly effect: QigongDeviationEffect | null;
  readonly event: ProgressionEvent | null;
}

export function createMeditationState(sessionId: string, plannedTicks: number): MeditationState {
  if (sessionId.length === 0) throw new RangeError('PROGRESSION_MEDITATION_ID');
  if (!Number.isSafeInteger(plannedTicks) || plannedTicks < 1) {
    throw new RangeError('PROGRESSION_MEDITATION_TICKS');
  }
  return { sessionId, plannedTicks, elapsedTicks: 0, status: 'active', qiGatherState: 'gathering' };
}

export function interruptMeditation(
  state: MeditationState, causeId: string, worldTick: number,
): MeditationInterruptedResult {
  if (!Number.isSafeInteger(worldTick) || worldTick < 0) throw new RangeError('PROGRESSION_WORLD_TICK');
  if (state.status !== 'active' || state.elapsedTicks >= state.plannedTicks) {
    return { state, effect: null, event: null };
  }
  const next: MeditationState = { ...state, status: 'interrupted', qiGatherState: 'none' };
  const effect: QigongDeviationEffect = { buffId: 'bf_chaqi', ownActions: 3,
    productionBp: 5000, acuteGatherForbidden: true };
  return { state: next, effect, event: { t: 'progression/meditationInterrupted',
    sessionId: state.sessionId, causeId, worldTick, effect } };
}
