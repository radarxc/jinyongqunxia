import { ceilDivInt, clampInt, floorDivInt } from '@tianshu/shared';
import type { MeridianFlowCommandContext } from '../meridian-flow';
import { dispatchMeridianFlowCommand } from '../meridian-flow';

export type TimelineSide = 'player' | 'ally' | 'enemy' | 'neutral';
export interface TimelineUnit {
  readonly id: string; readonly unitIndex: number; readonly side: TimelineSide;
  readonly agi: number; readonly qinggong: number; readonly openingQinggong: number;
  readonly openingPriority: number; readonly spd: number;
  ct: number; ctFrozen: boolean; pendingShift: number; active: boolean; hidden?: boolean;
}
export interface TimelineEvent { readonly id: string; readonly atTick: number; readonly order: number }
export interface TimelineState {
  tick: number; readonly units: TimelineUnit[]; openingOrder: string[];
  readonly timedEvents: TimelineEvent[]; env: { ct: number } | null;
}
export interface TimelineAdvanceObserver { advance(fromTick: number, toTick: number): void }
export type TimelineEntry =
  | { readonly kind: 'unit'; readonly unitId: string }
  | { readonly kind: 'event'; readonly eventId: string }
  | { readonly kind: 'environment' }
  | { readonly kind: 'stalled' };

const SIDE_RANK: Readonly<Record<TimelineSide, number>> =
  { player: 0, ally: 1, enemy: 2, neutral: 3 };

function initiativeRank(side: TimelineSide, initiative: TimelineSide): number {
  return side === initiative ? -1 : SIDE_RANK[side];
}

export function createOpeningOrder(
  units: readonly TimelineUnit[], initiative: TimelineSide = 'player',
): string[] {
  return units.filter((unit) => unit.active || unit.hidden === true).sort((left, right) =>
    right.openingQinggong - left.openingQinggong || right.spd - left.spd
    || right.agi - left.agi || right.openingPriority - left.openingPriority
    || initiativeRank(left.side, initiative) - initiativeRank(right.side, initiative)
    || left.unitIndex - right.unitIndex).map((unit) => unit.id);
}

function activeUnit(unit: TimelineUnit): boolean {
  return unit.active || unit.hidden === true;
}

function readyOrder(left: TimelineUnit, right: TimelineUnit): number {
  return right.ct - left.ct || right.spd - left.spd || right.qinggong - left.qinggong
    || SIDE_RANK[left.side] - SIDE_RANK[right.side] || left.unitIndex - right.unitIndex;
}

export function peekReadyUnitId(state: Pick<TimelineState, 'units' | 'openingOrder'>): string | null {
  for (const id of state.openingOrder) {
    const unit = state.units.find((candidate) => candidate.id === id);
    if (unit !== undefined && activeUnit(unit)) return id;
  }
  return state.units.filter((unit) => activeUnit(unit) && unit.ct >= 1000)
    .sort(readyOrder)[0]?.id ?? null;
}

export function currentReadyUnitId(state: Pick<TimelineState, 'units' | 'openingOrder'>): string | null {
  while (state.openingOrder.length > 0) {
    const id = state.openingOrder[0]!;
    const unit = state.units.find((candidate) => candidate.id === id);
    if (unit !== undefined && activeUnit(unit)) return id;
    state.openingOrder.shift();
  }
  return state.units.filter((unit) => activeUnit(unit) && unit.ct >= 1000)
    .sort(readyOrder)[0]?.id ?? null;
}

function nextDueEvent(state: TimelineState): TimelineEvent | undefined {
  return state.timedEvents.filter((event) => event.atTick <= state.tick)
    .sort((left, right) => left.atTick - right.atTick || left.order - right.order)[0];
}

export function nextTimelineEntry(state: TimelineState, observer?: TimelineAdvanceObserver): TimelineEntry {
  const current = currentReadyUnitId(state);
  if (state.openingOrder.length > 0 && current !== null) return { kind: 'unit', unitId: current };
  const due = nextDueEvent(state);
  if (due !== undefined) return { kind: 'event', eventId: due.id };
  if (state.env !== null && state.env.ct >= 1000) return { kind: 'environment' };
  const active = state.units.filter((unit) => activeUnit(unit) && !unit.ctFrozen);
  if (current !== null) return { kind: 'unit', unitId: current };
  let delta: number | null = null;
  for (const unit of active) {
    const wait = ceilDivInt(1000 - unit.ct, clampInt(unit.spd, 30, 300));
    if (wait > 0 && (delta === null || wait < delta)) delta = wait;
  }
  if (state.env !== null) {
    const wait = ceilDivInt(1000 - state.env.ct, 100);
    if (wait > 0 && (delta === null || wait < delta)) delta = wait;
  }
  for (const event of state.timedEvents) {
    const wait = event.atTick - state.tick;
    if (wait > 0 && (delta === null || wait < delta)) delta = wait;
  }
  if (delta === null) return { kind: 'stalled' };
  for (const unit of active) unit.ct = clampInt(unit.ct + unit.spd * delta, -1000, 1299);
  if (state.env !== null) state.env.ct = clampInt(state.env.ct + 100 * delta, -1000, 1299);
  const fromTick = state.tick;
  state.tick += delta;
  observer?.advance(fromTick, state.tick);
  return nextTimelineEntry(state, observer);
}

export function settleTimelineAction(
  unit: TimelineUnit, baseRecovery: number, recoveryPctBp = 0, flowCt = 0, flat = 0,
): number {
  const rounded = floorDivInt(baseRecovery * (10_000 + recoveryPctBp) + 5_000, 10_000);
  const recovery = clampInt(rounded + flowCt + flat, 500, 2000);
  unit.ct = clampInt(unit.ct - recovery + unit.pendingShift, -1000, 999);
  unit.pendingShift = 0;
  return recovery;
}

export function acuteQiGather(
  unit: TimelineUnit, context: MeridianFlowCommandContext, routeId: string,
): { readonly accepted: boolean; readonly events: readonly unknown[]; readonly recovery: number } {
  const result = dispatchMeridianFlowCommand(context, { t: 'qi.acuteGather', routeId });
  if (!result.accepted) return { accepted: false, events: [], recovery: 0 };
  const recovery = settleTimelineAction(unit, 1000);
  return { accepted: true, events: result.events.map((event) => event.t === 'qi.acuteGathered'
    ? { ...event, t: 'battle/acuteQiGathered' as const } : event), recovery };
}
