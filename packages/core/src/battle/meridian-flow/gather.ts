import { clampInt } from '@tianshu/shared';
import type { GatherState } from './types';

export interface GatherAdvancedEvent {
  readonly t: 'qi.gatherAdvanced';
  readonly ticks: number;
  readonly previousCt: number;
  readonly ct: number;
  readonly ready: boolean;
}

export interface AcuteGatheredEvent {
  readonly t: 'qi.acuteGathered';
  readonly routeId: string;
  readonly previousCt: number;
  readonly ct: number;
  readonly skippedActions: number;
}

export function createGatherState(spd: number, initialCt = 0): GatherState {
  if (!Number.isSafeInteger(spd) || spd < 30 || spd > 300) throw new RangeError('QI_GATHER_SPEED');
  if (!Number.isSafeInteger(initialCt)) throw new RangeError('QI_GATHER_CT');
  const ct = clampInt(initialCt, -1000, 1299);
  return { ct, spd, status: ct >= 1000 ? 'ready' : 'charging', skippedActions: 0 };
}

export function advanceGatherState(
  state: GatherState, ticks = 1,
): GatherAdvancedEvent {
  if (!Number.isSafeInteger(ticks) || ticks < 0) throw new RangeError('QI_GATHER_TICKS');
  const previousCt = state.ct;
  state.ct = clampInt(state.ct + state.spd * ticks, -1000, 1299);
  state.status = state.ct >= 1000 ? 'ready' : 'charging';
  return { t: 'qi.gatherAdvanced', ticks, previousCt, ct: state.ct, ready: state.status === 'ready' };
}

export function acuteGather(state: GatherState, routeId: string): AcuteGatheredEvent {
  if (state.status !== 'ready' || state.ct < 1000) throw new RangeError('QI_GATHER_NOT_READY');
  const previousCt = state.ct;
  state.ct = clampInt(state.ct - 1000, -1000, 999);
  state.status = 'charging';
  state.skippedActions += 1;
  return { t: 'qi.acuteGathered', routeId, previousCt, ct: state.ct,
    skippedActions: state.skippedActions };
}

export function settleGatherAction(state: GatherState, recovery: number): void {
  if (state.status !== 'ready' || state.ct < 1000) throw new RangeError('QI_ACTION_NOT_READY');
  if (!Number.isSafeInteger(recovery)) throw new RangeError('QI_RECOVERY_INTEGER');
  state.ct = clampInt(state.ct - clampInt(recovery, 500, 2000), -1000, 999);
  state.status = 'charging';
}
