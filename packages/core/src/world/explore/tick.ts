import { HEX_DIRECTIONS, type HexCoord, type HexDir } from '../../hex';
import type { CoreTransaction, RejectReason } from '../../command';
import { regionHandler } from '../../command/region-handler';
import type { RegionObject, RegionRuntimeContent } from '../region-types';
import { insideBuildingId } from './interactables';
import { HEX_STEP_MM, PACE_MM_PER_TICK } from './types';
import { directExploreStep, exploreTriggersAt, exploreWalkContext } from './walk-validate';

function runtime(tx: CoreTransaction): RegionRuntimeContent | null {
  return tx.content.region ?? null;
}

function stop(tx: CoreTransaction): void {
  if (tx.state.world.navigation.mountedRegion?.walk !== null)
    tx.set(['world', 'navigation', 'mountedRegion', 'walk'], null);
}

function interrupted(tx: CoreTransaction, at: HexCoord, reason: RejectReason): void {
  tx.emit({ t: 'world/pathInterrupted', payload: { at: { q: at.q, r: at.r }, reason } });
  stop(tx);
}

function activeObject(tx: CoreTransaction, object: RegionObject): boolean {
  const entry = tx.state.world.navigation.mountedRegion?.entities.find((value) =>
    value.anchorId === object.id);
  return entry?.active !== false && (!object || object.class !== 'Trigger' ||
    !object.once || entry?.consumed !== true);
}

function triggerStopsWalk(tx: CoreTransaction, anchor: Extract<RegionObject, { class: 'Trigger' }>):
  boolean {
  if (!anchor.eventId) return false;
  const event = tx.content.events?.find((entry) => entry.id === anchor.eventId);
  return event?.actions.some((action) => action.op === 'dialogue/start' ||
    action.op === 'battle/start' || action.op === 'world/loadScene') === true;
}

function steerTarget(context: NonNullable<ReturnType<typeof exploreWalkContext>>, from: HexCoord,
  dir: HexDir): HexCoord | null {
  const directions = [dir, ((dir + 1) % 6) as HexDir, ((dir + 5) % 6) as HexDir];
  for (const direction of directions) {
    const step = HEX_DIRECTIONS[direction]!;
    const next = { q: from.q + step.q, r: from.r + step.r };
    if (directExploreStep(context, from, next)) return next;
  }
  return null;
}

function enterHex(tx: CoreTransaction, content: RegionRuntimeContent, from: HexCoord, to: HexCoord,
  direction: HexDir): void {
  const context = exploreWalkContext(tx.state, content);
  const mounted = tx.state.world.navigation.mountedRegion;
  if (!context || !mounted) return;
  const beforeBuilding = insideBuildingId(context.map, context.graph, from);
  tx.set(['world', 'navigation', 'mountedRegion', 'playerHex'], { ...to });
  tx.set(['world', 'navigation', 'mountedRegion', 'facing'], direction);
  const triggers = exploreTriggersAt(context.map, to);
  let requestedStop = false;
  for (const trigger of triggers) {
    if (!activeObject(tx, trigger)) continue;
    requestedStop = triggerStopsWalk(tx, trigger) || requestedStop;
    regionHandler.apply(tx, { t: 'world/interact', anchorId: trigger.id });
  }
  const afterBuilding = insideBuildingId(context.map, context.graph, to);
  if (beforeBuilding !== afterBuilding) {
    if (beforeBuilding !== null) tx.emit({ t: 'world/buildingLeft',
      payload: { buildingId: beforeBuilding, at: { q: to.q, r: to.r } } });
    if (afterBuilding !== null) tx.emit({ t: 'world/buildingEntered',
      payload: { buildingId: afterBuilding, at: { q: to.q, r: to.r } } });
  }
  if (requestedStop || tx.state.dialogue !== null || tx.state.battle !== null ||
      tx.state.world.navigation.pendingMount !== null) stop(tx);
}

function arrive(tx: CoreTransaction): void {
  const walk = tx.state.world.navigation.mountedRegion?.walk;
  const at = tx.state.world.navigation.mountedRegion?.playerHex;
  if (!walk || !at) return;
  tx.emit({ t: 'world/arrived', payload: { at: { q: at.q, r: at.r }, goal: { ...walk.goal } } });
  if (walk.goal.kind === 'anchor' && walk.goal.interact) {
    const command = { t: 'world/interact' as const, anchorId: walk.goal.anchorId };
    const invalid = regionHandler.validate(tx.state, command, tx.content);
    if (invalid) tx.abort(invalid);
    regionHandler.apply(tx, command);
  }
  stop(tx);
}

/** Advances at most one geometric edge and never performs path search. */
export function advanceExploreWalk(tx: CoreTransaction): void {
  const content = runtime(tx);
  const mounted = tx.state.world.navigation.mountedRegion;
  const walk = mounted?.walk;
  if (!content || !mounted || !walk) return;
  if (tx.state.dialogue !== null || tx.state.battle !== null ||
      tx.state.world.pendingTimeAdvance !== null ||
      tx.state.world.navigation.pendingMount !== null) { stop(tx); return; }
  const context = exploreWalkContext(tx.state, content);
  if (!context) { interrupted(tx, mounted.playerHex, 'REGION_CONTENT_MISMATCH'); return; }
  let next = walk.path[1];
  if (walk.progressMm === 0 && walk.steer !== null) {
    next = steerTarget(context, mounted.playerHex, walk.steer) ?? undefined;
    if (!next) { interrupted(tx, mounted.playerHex, 'REGION_PATH_BLOCKED'); return; }
    if (walk.path.length === 1)
      tx.splice(['world', 'navigation', 'mountedRegion', 'walk', 'path'], 1, 0, [next]);
    else tx.splice(['world', 'navigation', 'mountedRegion', 'walk', 'path'], 1, 1, [next]);
  }
  if (!next) { arrive(tx); return; }
  const nextNode = (next.r - context.graph.rMin) * context.graph.width + next.q - context.graph.qMin;
  const moveCost = nextNode >= 0 && nextNode < context.graph.nodeCount
    ? Math.max(1, context.graph.moveCosts[nextNode]!) : 1;
  const stepMm = HEX_STEP_MM * moveCost;
  const progressMm = walk.progressMm + PACE_MM_PER_TICK[walk.pace];
  if (progressMm < stepMm) {
    tx.set(['world', 'navigation', 'mountedRegion', 'walk', 'progressMm'], progressMm);
    return;
  }
  const step = directExploreStep(context, mounted.playerHex, next);
  if (!step) { interrupted(tx, next, 'REGION_PATH_BLOCKED'); return; }
  enterHex(tx, content, mounted.playerHex, next, step.direction);
  if (tx.state.world.navigation.mountedRegion?.walk === null) return;
  tx.splice(['world', 'navigation', 'mountedRegion', 'walk', 'path'], 0, 1, []);
  tx.set(['world', 'navigation', 'mountedRegion', 'walk', 'progressMm'], progressMm - stepMm);
  const current = tx.state.world.navigation.mountedRegion?.walk;
  if (!current) return;
  if (current.steer !== null) {
    if (current.path.length > 1)
      tx.splice(['world', 'navigation', 'mountedRegion', 'walk', 'path'], 1,
        current.path.length - 1, []);
    const following = steerTarget(context, next, current.steer);
    if (!following) { interrupted(tx, next, 'REGION_PATH_BLOCKED'); return; }
    tx.splice(['world', 'navigation', 'mountedRegion', 'walk', 'path'], 1, 0, [following]);
    return;
  }
  if (current.path.length === 1) arrive(tx);
}
