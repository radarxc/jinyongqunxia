import {
  hexDistance, hexKey, nextTimelineEntry, peekReadyUnitId, resolveAreaCells, settleTimelineAction,
  type BattleState, type HexAim, type HexCoord, type TimelineState,
} from '@tianshu/core';
import type { AreaPreview, BattleLaunch, TimelineView } from './contracts';

/** Estimate with core's CT functions on a disposable timeline, without advancing real state/RNG. */
export function queryTimeline(state: BattleState, count = 8): readonly TimelineView[] {
  if (state.result) return [];
  const timeline: TimelineState = { tick: state.tick, openingOrder: [...state.openingOrder],
    units: state.units.map(unit => ({ ...unit })), timedEvents: [], env: null };
  const entries: TimelineView[] = [];
  for (let index = 0; index < count; index += 1) {
    const next = nextTimelineEntry(timeline);
    if (next.kind !== 'unit') break;
    const unit = timeline.units.find(row => row.id === next.unitId)!;
    const opening = timeline.openingOrder[0] === unit.id;
    entries.push({ unitId: unit.id, atTick: timeline.tick, opening });
    if (opening) { timeline.openingOrder.shift(); unit.ct = 1000; }
    // Subsequent entries explicitly assume the first known move, not a predicted AI decision.
    const recovery = state.units.find(row => row.id === unit.id)?.moves[0]?.recovery ?? 700;
    settleTimelineAction(unit, recovery);
  }
  return entries;
}

export function queryArea(state: BattleState, launch: BattleLaunch, input: {
  readonly actor: string; readonly moveId: string; readonly anchor: HexCoord; readonly aim: HexAim;
  readonly revision: number; readonly requestId: number;
}): AreaPreview {
  const actor = state.units.find(unit => unit.id === input.actor);
  const marker = launch.markers.find(unit => unit.id === input.actor);
  const move = actor?.moves.find(row => row.id === input.moveId);
  const visual = launch.moves.find(row => row.id === input.moveId);
  if (!actor || !marker || !move || !visual) throw new Error('BATTLE_MOVE_UNKNOWN');
  if (!Number.isInteger(input.aim.dir) || ![6, 12].includes(input.aim.dirCount) ||
    input.aim.dir < 0 || input.aim.dir >= input.aim.dirCount) throw new Error('BATTLE_AIM_INVALID');
  let reason = '';
  if (peekReadyUnitId(state) !== actor.id || !actor.active || state.result) reason = '尚未轮到此人行动';
  else if (actor.mp < move.mpCost) reason = '内力不足';
  else if (!launch.cells.some(cell => hexKey(cell) === hexKey(input.anchor))) reason = '落点在战场之外';
  else if (hexDistance(marker, input.anchor) > visual.range) reason = '落点超出射程';
  const cells = resolveAreaCells(visual.shape, { origin: marker, anchor: input.anchor,
    aim: input.aim, available: launch.cells });
  const cellKeys = new Set(cells.map(hexKey));
  const targets = state.units.filter(unit => {
    const position = launch.markers.find(row => row.id === unit.id);
    return unit.active && position && cellKeys.has(hexKey(position)) &&
      state.setup.relations[actor.side][unit.side] === 'hostile';
  }).sort((left, right) => left.unitIndex - right.unitIndex);
  if (!reason && targets.length === 0) reason = '范围内没有敌方单位';
  if (!reason && targets.length > Math.max(1, move.autoTargetCap ?? 1)) reason = '命中人数超出此招可结算人数';
  return { ...input, cells, targetIds: targets.map(unit => unit.id), valid: reason === '', reason };
}
