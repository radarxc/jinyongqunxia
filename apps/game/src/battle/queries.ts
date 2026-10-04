import {
  nextTimelineEntry, previewBattleRoute, queryBattleAction, queryBattleQi,
  queryDamageGeometry, queryMoveAt, queryPath, queryReachable, settleTimelineAction,
  type BattleActCommand, type BattleState, type HexAim, type HexCoord, type TimelineState,
} from '@tianshu/core';
import { battleReason, t } from '@tianshu/ui/runtime';
import type { AreaPreview, BattleCapabilities, BattleCapability, BattleLaunch,
  BattleUnitView, ReachableCellView, TimelineView } from './contracts';

const capability = (value: ReturnType<typeof queryBattleAction>): BattleCapability => ({
  enabled: value.enabled, reason: value.reason === null ? '' : battleReason(value.reason),
});
const plan = (actor: string, action: BattleActCommand['action'], walkTo?: HexCoord): BattleActCommand =>
  ({ t: 'battle/act', actor, action, ...(walkTo === undefined ? {} : { walkTo }) });

/** Every enabled bit comes from core's full transaction preflight; this adapter only shapes labels. */
export function queryActions(state: BattleState, actorId: string | null,
  units: readonly BattleUnitView[], destination?: HexCoord): BattleCapabilities {
  const actor = actorId === null ? undefined : state.units.find(unit => unit.id === actorId);
  const unavailable = (reason: string): BattleCapability => ({ enabled: false, reason });
  if (actor === undefined) return { move: { ...unavailable(t('battleWaitingActor')),
    reachable: [], selected: null }, item: unavailable(t('battleWaitingActor')),
    defend: unavailable(t('battleWaitingActor')), gather: unavailable(t('battleWaitingActor')),
    wait: unavailable(t('battleWaitingActor')), items: [], routes: [], itemUses: 0, itemMaxUses: 0 };
  const reachable: ReachableCellView[] = queryReachable(state, actor.id).map(entry => ({
    q: entry.pos.q, r: entry.pos.r, path: entry.path.map(cell => ({ ...cell })),
    cost: entry.cost, actionCount: entry.actionCount, dangerCount: entry.dangerCount }));
  const selected = destination === undefined ? null : reachable.find(cell =>
    cell.q === destination.q && cell.r === destination.r) ?? null;
  const walkTo = selected !== null && selected.cost > 0
    ? { q: selected.q, r: selected.r } : undefined;
  const wait = capability(queryBattleAction(state, plan(actor.id, { t: 'wait' }, walkTo)));
  const defend = capability(queryBattleAction(state, plan(actor.id, { t: 'guard' }, walkTo)));
  const targets = units.filter(unit => unit.active || unit.state === 'downed');
  const items = state.inventory.stacks.flatMap(stack => {
    const item = state.setup.itemDefs.find(def => def.id === stack.itemId);
    if (item?.use === undefined || stack.count <= 0) return [];
    const projected = targets.map(target => ({ id: target.id, name: target.name,
      capability: capability(queryBattleAction(state, plan(actor.id,
        { t: 'item', item: item.id, target: target.id }, walkTo))) }));
    const available = projected.find(target => target.capability.enabled);
    return [{ id: item.id, name: item.name, count: stack.count,
      capability: available?.capability ?? projected[0]?.capability ?? unavailable(t('battleNoItemTarget')),
      targets: projected }];
  });
  const routeDefs = state.setup.meridianInputs.find(input => input.unitId === actor.id)?.routes ?? [];
  const routes = routeDefs.flatMap(route => {
    if ((route.purpose ?? 'attack') !== 'attack') return [];
    try {
      const status = queryBattleQi(state, actor.id, route.routeId);
      const preview = previewBattleRoute(state, actor.id, route.routeId);
      return [{ routeId: route.routeId, purpose: status.purpose,
        capability: capability(queryBattleAction(state, plan(actor.id,
          { t: 'acuteQiGather', routeRef: route.routeId }))), dantianQi: status.dantianQi,
        inFlight: status.routeInFlightQi, capacity: status.routeCarryCap,
        completionBp: status.circulationBp, routeQualityBp: preview.routeQualityBp,
        blockedAt: preview.blockedAt }];
    } catch (error) {
      const code = error instanceof Error ? error.message : 'QI_ROUTE_UNAVAILABLE';
      return [{ routeId: route.routeId, purpose: 'attack' as const, capability: unavailable(battleReason(code)),
        dantianQi: 0, inFlight: 0, capacity: 0, completionBp: 0, routeQualityBp: 0, blockedAt: null }];
    }
  });
  const gather = routes.find(route => route.capability.enabled)?.capability
    ?? routes[0]?.capability ?? unavailable(t('battleNoAttackRoute'));
  const item = items.find(entry => entry.capability.enabled)?.capability
    ?? items[0]?.capability ?? unavailable(t('battleNoItems'));
  const movable = reachable.find(cell => cell.cost > 0);
  const move = movable === undefined ? unavailable(t('battleNoReachable'))
    : capability(queryBattleAction(state, plan(actor.id, { t: 'wait' }, movable)));
  return { move: { ...move,
    reachable, selected }, item, defend, gather, wait, items, routes,
    itemUses: actor.itemState.uses, itemMaxUses: actor.itemState.maxUses };
}

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
  readonly revision: number; readonly requestId: number; readonly walkTo?: HexCoord;
}): AreaPreview {
  const actor = state.units.find(unit => unit.id === input.actor);
  const move = actor?.moves.find(row => row.id === input.moveId);
  if (!actor || !move || !launch.moves.some(row => row.id === input.moveId)) throw new Error('BATTLE_MOVE_UNKNOWN');
  if (!Number.isInteger(input.aim.dir) || ![6, 12].includes(input.aim.dirCount) ||
    input.aim.dir < 0 || input.aim.dir >= input.aim.dirCount) throw new Error('BATTLE_AIM_INVALID');
  let reason = '';
  const origin = input.walkTo ?? actor.pos;
  const path = input.walkTo === undefined ? undefined : queryPath(state, actor.id, input.walkTo);
  if (input.walkTo !== undefined && path === null) reason = battleReason('PATH_BLOCKED');
  const unitAtAnchor = state.units.find(unit => unit.pos.q === input.anchor.q && unit.pos.r === input.anchor.r);
  const target = move.target === 'tile' ? input.anchor : move.target === 'self'
    ? actor.id : unitAtAnchor?.id;
  const queried = queryMoveAt(state, actor.id, move.id, target ?? input.anchor,
    { from: origin, aim: input.aim });
  const cells = queried.cells; const targets = queried.targets;
  const projectedActor = input.walkTo === undefined ? actor : { ...actor, pos: { ...origin } };
  const projectedState = projectedActor === actor ? state : { ...state,
    units: state.units.map(unit => unit.id === actor.id ? projectedActor : unit) };
  const targetGeometry = targets.map(target => {
    const geometry = queryDamageGeometry(projectedState, projectedActor, target, move);
    return { targetId: target.id, direction: geometry.direction, heightDelta: geometry.heightDelta,
      heightHit: geometry.heightHit, hitAdd: geometry.hitAdd, heightAddBp: geometry.heightAddBp,
      terrainAddBp: geometry.terrainAddBp, positionBp: geometry.positionBp };
  });
  if (target !== undefined) {
    const queriedAction = queryBattleAction(state, plan(actor.id,
      { t: 'skill', move: move.id, target, aim: input.aim }, input.walkTo));
    reason = queriedAction.enabled ? '' : battleReason(queriedAction.reason ?? 'INVALID_TARGET');
  } else reason = battleReason('INVALID_TARGET');
  if (!reason && queried.reason !== null) reason = battleReason(queried.reason);
  return { ...input, cells, targetIds: targets.map(unit => unit.id), targetGeometry,
    valid: reason === '', reason };
}
