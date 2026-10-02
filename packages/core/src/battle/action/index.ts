import { compareCodePoints, mulDivFloor } from '@tianshu/shared';
import { createRng, type Rng } from '../../rng';
import { endOwnAction, executeBuffHook, qiProductionBp } from '../../buff';
import type { HexCoord } from '../../hex';
import {
  applyAcupointStrike, calculateZoneResistanceBp, injectPenetratingQi, resolveDamage,
  tickHostileMeridianEffects,
} from '../damage';
import { evaluateBattleEnd, finishBattle } from '../encounter';
import { directionBetween, isBattleUnitVisible, queryMoveAt, queryPath } from '../geometry';
import { nextTimelineEntry, peekReadyUnitId, settleTimelineAction, type TimelineEntry } from '../timeline';
import type { BattleActCommand, BattleCommand, BattleMove, BattleState, BattleUnit } from '../types';

export interface BattleActionResult { readonly accepted: boolean; readonly error?: string;
  readonly hpDamage: number; readonly eventsAdded: number }

function actorFor(state: BattleState, command: BattleCommand): BattleUnit {
  if (state.phase === 'ended') throw new RangeError('BATTLE_ENDED');
  const actor = state.units.find((unit) => unit.id === command.actor);
  if (actor === undefined || !actor.active) throw new RangeError('INVALID_ACTOR');
  if (peekReadyUnitId(state) !== actor.id) throw new RangeError('NOT_YOUR_TURN');
  return actor;
}

interface ValidatedPlan {
  readonly actor: BattleUnit; readonly move: BattleMove | null; readonly targets: readonly BattleUnit[];
  readonly path: readonly HexCoord[]; readonly destination: HexCoord; readonly targetPos: HexCoord | null;
}

function validatePlan(state: BattleState, command: BattleActCommand): ValidatedPlan {
  const actor = actorFor(state, command);
  if (command.facing !== undefined && (!Number.isSafeInteger(command.facing)
    || command.facing < 0 || command.facing > 5)) throw new RangeError('INVALID_FACING');
  const destination = command.walkTo ?? actor.pos;
  const pathResult = queryPath(state, actor.id, destination);
  if (pathResult === null) throw new RangeError('PATH_BLOCKED');
  const path = pathResult.path; const origin = actor.pos;
  actor.pos = { ...destination };
  try {
    if (command.action.t === 'wait') {
      return { actor, move: null, targets: [], path, destination, targetPos: null };
    }
    const action = command.action;
    const move = actor.moves.find((candidate) => candidate.id === action.move);
    if (move === undefined) throw new RangeError('UNKNOWN_MOVE');
    if (actor.mp < move.mpCost) throw new RangeError('MP_NOT_ENOUGH');
    const queried = queryMoveAt(state, actor.id, move.id, action.target,
      action.aim === undefined ? {} : { aim: action.aim });
    if (queried.reason !== null) throw new RangeError(queried.reason);
    const targetPos = typeof action.target === 'string'
      ? state.units.find((unit) => unit.id === action.target)?.pos ?? null : action.target;
    return { actor, move, targets: queried.targets, path, destination, targetPos };
  } finally { actor.pos = origin; }
}

function pushBuffEvents(state: BattleState, target: BattleUnit): 'active' | 'skipped' | 'downed' {
  const events = executeBuffHook({ hook: 'onTurnStart', holder: target, instances: target.buffs });
  for (const event of events) state.events.push({ t: event.t, actionNo: state.actionNo,
    actor: event.holder, amount: event.amount,
    ...(event.shieldSpent === undefined ? {} : { shieldSpent: event.shieldSpent }) });
  if (target.hp === 0 && target.active) { target.active = false; target.state = 'downed';
    state.events.push({ t: 'battle/unitDowned', actionNo: state.actionNo + 1, target: target.id }); }
  if (!target.active) return 'downed';
  return events.some((event) => event.t === 'buff/actionSkipped') ? 'skipped' : 'active';
}

function settleTarget(state: BattleState, actor: BattleUnit, target: BattleUnit,
  move: BattleMove, rng: Rng, segmentIndex: number): number {
  if (target.state === 'hidden') target.state = 'active';
  const defenderMpAtHit = target.mp;
  const guard = target.zoneGuards[move.hitZone];
  const zoneFlowBp = guard.carryCapacity === 0 ? 0
    : Math.min(10_000, mulDivFloor(guard.qi, 10_000, guard.carryCapacity));
  const result = resolveDamage({ judge: { hitEff: actor.stats.hit + (move.hitMod ?? 0),
    eva: target.stats.eva, parry: target.stats.parry, pierce: actor.stats.pierce,
    crit: actor.stats.crit, tough: target.stats.tough, direction: move.direction ?? 'front' },
  formula: { attacker: actor.stats, defender: target.stats, wInBp: move.wInBp,
    actualPower: { n: move.powerBp, d: 10_000 }, referencePower: { n: move.referencePowerBp, d: 10_000 },
    pierceOutBp: move.pierceOutBp ?? 0, pierceInBp: move.pierceInBp ?? 0,
    dmgUpBp: move.dmgUpBp ?? 0, direction: move.direction ?? 'front',
    zoneResistanceBp: calculateZoneResistanceBp(move.hitZone, target.stats.strength,
      target.stats.tough, zoneFlowBp), meridianAttackBp: move.meridianAttackBp ?? 10_000,
    meridianDefenseBp: target.meridianDefenseBp, ultimate: move.ultimate ?? false },
  resources: { hp: target.hp, mp: target.mp, shield: target.shield },
  outwardQi: { wInBp: move.wInBp, zoneQi: guard.qi, zoneCarryCapacity: guard.carryCapacity,
    defenderStrengthBp: guard.strengthBp, defenderFlowRatioBp: guard.flowRatioBp,
    breakGuardBp: guard.breakGuardBp, causeId: `act:${state.actionNo}`, targetId: target.id,
    segmentIndex } }, rng);
  if (result.settlement === null) return 0;
  target.hp = result.settlement.hpAfter; target.mp = result.settlement.mpAfter;
  target.shield = result.settlement.shieldAfter;
  guard.qi -= result.settlement.outwardQi?.zoneQiSpent ?? 0;
  state.events.push({ t: 'battle/damageResolved', actionNo: state.actionNo + 1, actor: actor.id,
    target: target.id, amount: result.settlement.hpDamage });
  const repel = result.settlement.outwardQi?.event;
  if (repel !== null && repel !== undefined) state.events.push({ t: repel.t, actionNo: state.actionNo + 1,
    actor: actor.id, target: target.id, amount: repel.amount, message: repel.message });
  if (target.hp === 0 && target.active) { target.active = false; target.state = 'downed';
    state.events.push({ t: 'battle/unitDowned', actionNo: state.actionNo + 1,
      actor: actor.id, target: target.id }); }
  applyMoveEffects(state, actor, target, move, result.judge.hitBp, defenderMpAtHit, rng);
  return result.settlement.hpDamage;
}

function nextBuffIid(target: BattleUnit): number {
  let result = 1;
  for (const buff of target.buffs) result = Math.max(result, buff.iid + 1);
  return result;
}

function upsertAcupointBuff(target: BattleUnit, sourceId: string, sourceGrade: number,
  acupointRef: string, level: number, turnsLeft: number): void {
  const existing = target.buffs.find((buff) => buff.def === 'bf_xueweishoufeng'
    && buff.key === acupointRef);
  if (existing === undefined) {
    target.buffs.push({ iid: nextBuffIid(target), def: 'bf_xueweishoufeng', holder: target.id,
      source: sourceId, grade: sourceGrade, key: acupointRef, stacks: level, turnsLeft, fresh: false });
    return;
  }
  existing.stacks = level; existing.turnsLeft = Math.max(existing.turnsLeft, turnsLeft);
  existing.fresh = false;
}

function upsertDantianDamageBuff(unit: BattleUnit, level: number, turnsLeft: number): void {
  const existing = unit.buffs.find((buff) => buff.def === 'bf_dantianshousun');
  if (existing === undefined) {
    unit.buffs.push({ iid: nextBuffIid(unit), def: 'bf_dantianshousun', holder: unit.id,
      source: null, grade: 1, stacks: level, turnsLeft, fresh: false });
    return;
  }
  existing.stacks = Math.max(existing.stacks, level);
  existing.turnsLeft = Math.max(existing.turnsLeft, turnsLeft); existing.fresh = false;
}

function applyMoveEffects(state: BattleState, actor: BattleUnit, target: BattleUnit, move: BattleMove,
  hitBp: number, defenderMpAtHit: number, rng: Rng): void {
  const foreign = injectPenetratingQi({ projectionActive: move.projection === true,
    enabled: move.penetratingQi === true, sourceGrade: move.sourceGrade ?? 0,
    attackerMpAfterCosts: actor.mp, defenderMpAtHit, sourceUnitId: actor.id,
    sourceInnerId: move.sourceInnerId ?? 'sk_none', releasedQi: move.releasedQi ?? 0,
    qiSpeedBp: move.qiSpeedBp ?? 10_000, hitZone: move.hitZone,
    ...(move.targetAcupoint === undefined ? {} : { targetAcupoint: move.targetAcupoint }),
    digestRatioBp: move.digestRatioBp ?? 10_000, reversePath: move.reversePath ?? [],
    sequence: target.foreignQi.length + 1, battleTick: state.tick });
  if (foreign !== null) { target.foreignQi.push(foreign); state.events.push({
    t: 'battle/foreignQiInjected', actionNo: state.actionNo + 1, actor: actor.id,
    target: target.id, amount: foreign.injectedQi }); }
  if (move.acupointStrike !== true || (move.releasedQi ?? 0) <= 0) return;
  const occupancy = applyAcupointStrike({ hitBp, sourceEffHit: actor.stats.hit,
    targetEffRes: target.stats.tough, resSealEffBp: 0, sealBp: move.sealBp ?? 0,
    acupointRef: move.targetAcupoint ?? 'ap_renmai_danzhong', sourceUnitId: actor.id,
    sourceInnerId: move.sourceInnerId ?? 'sk_none', occupyingQi: move.releasedQi ?? 0,
    digestRatioBp: move.digestRatioBp ?? 10_000, level: move.sealLevel ?? 1,
    remainingOwnActions: (move.sealLevel ?? 1) >= 7 ? 1 : 2,
    affectedRouteRefs: move.affectedRouteRefs ?? [] }, rng);
  if (occupancy === null) return;
  const existing = target.acupointOccupancies.find((entry) => entry.acupointRef === occupancy.acupointRef);
  if (existing === undefined) target.acupointOccupancies.push(occupancy);
  else {
    existing.occupyingQi += occupancy.occupyingQi;
    existing.level = Math.min(9, occupancy.level > existing.level ? occupancy.level : existing.level + 1);
    existing.remainingOwnActions = Math.max(existing.remainingOwnActions, occupancy.remainingOwnActions);
  }
  if (target.acupointOccupancies.length > 3) {
    const evicted = target.acupointOccupancies.sort((left, right) => left.level - right.level
      || left.remainingOwnActions - right.remainingOwnActions
      || compareCodePoints(left.acupointRef, right.acupointRef)).shift();
    if (evicted !== undefined) target.buffs = target.buffs.filter((buff) =>
      buff.def !== 'bf_xueweishoufeng' || buff.key !== evicted.acupointRef);
  }
  const projected = target.acupointOccupancies.find((entry) => entry.acupointRef === occupancy.acupointRef);
  if (projected !== undefined) upsertAcupointBuff(target, actor.id, move.sourceGrade ?? 1,
    projected.acupointRef, projected.level, projected.remainingOwnActions);
  state.events.push({ t: 'battle/acupointOccupied', actionNo: state.actionNo + 1, actor: actor.id,
    target: target.id, amount: occupancy.occupyingQi, level: occupancy.level });
}

function roundAnchorId(state: BattleState, actingUnitId: string): string | undefined {
  const protagonistRef = state.setup.participants.find((entry) =>
    entry.side === 'player' && entry.required)?.unitRef
    ?? state.setup.participants.find((entry) => entry.side === 'player')?.unitRef;
  if (actingUnitId === protagonistRef) return protagonistRef;
  const protagonist = state.units.find((unit) => unit.id === protagonistRef);
  if (protagonist?.active === true) return protagonist.id;
  return state.units.filter((unit) => unit.active
    && state.setup.relations.player[unit.side] === 'friendly')
    .sort((left, right) => left.unitIndex - right.unitIndex
      || compareCodePoints(left.id, right.id))[0]?.id;
}

function faceNearestEnemy(state: BattleState, actor: BattleUnit): void {
  const nearest = state.units.filter((unit) => isBattleUnitVisible(state, actor, unit)
    && state.setup.relations[actor.side][unit.side] === 'hostile')
    .sort((left, right) => {
      const leftDistance = Math.max(Math.abs(left.pos.q - actor.pos.q), Math.abs(left.pos.r - actor.pos.r),
        Math.abs(left.pos.q + left.pos.r - actor.pos.q - actor.pos.r));
      const rightDistance = Math.max(Math.abs(right.pos.q - actor.pos.q), Math.abs(right.pos.r - actor.pos.r),
        Math.abs(right.pos.q + right.pos.r - actor.pos.q - actor.pos.r));
      return leftDistance - rightDistance || left.unitIndex - right.unitIndex
        || compareCodePoints(left.id, right.id);
    })[0];
  if (nearest !== undefined) actor.facing = directionBetween(actor.pos, nearest.pos, actor.facing);
}

function completeAction(state: BattleState, actor: BattleUnit, recovery: number, command: BattleCommand,
  checkEnd = true): void {
  state.actionNo += 1; actor.ownActions += 1;
  if (actor.id === roundAnchorId(state, actor.id)) state.round += 1;
  if (state.phase === 'opening' && state.openingOrder[0] === actor.id) actor.ct = 1000;
  settleTimelineAction(actor, recovery); actor.buffs = endOwnAction(actor.buffs);
  for (const occupancy of actor.acupointOccupancies) occupancy.remainingOwnActions -= 1;
  actor.acupointOccupancies = actor.acupointOccupancies.filter((entry) => entry.remainingOwnActions > 0);
  if (state.openingOrder[0] === actor.id) state.openingOrder.shift();
  if (state.openingOrder.length === 0 && state.phase === 'opening') state.phase = 'running';
  state.acceptedCommands.push(structuredClone(command));
  const end = checkEnd ? evaluateBattleEnd(state) : null; if (end !== null) finishBattle(state, end);
}

export function advanceBattleTick(state: BattleState): void {
  for (const unit of [...state.units].sort((left, right) => left.unitIndex - right.unitIndex)) {
    if (!unit.active) continue;
    const production = mulDivFloor(unit.qiProductionPerTick, qiProductionBp(unit.buffs), 10_000);
    const events = tickHostileMeridianEffects(unit, production);
    for (const event of events) {
      state.events.push({ t: event.t, actionNo: state.actionNo, target: event.target, amount: event.amount,
        ...(event.level === undefined ? {} : { level: event.level }) });
      if (event.t === 'battle/dantianDamaged') upsertDantianDamageBuff(unit,
        event.level ?? 1, event.durationOwnActions ?? 2);
    }
    if (unit.hp === 0) { unit.active = false; unit.state = 'downed'; }
  }
}

export function advanceBattleToReady(state: BattleState): TimelineEntry {
  const timeline = { tick: state.tick, units: state.units, openingOrder: state.openingOrder,
    timedEvents: [], env: null };
  const entry = nextTimelineEntry(timeline, { advance: (fromTick, toTick) => {
    for (let tick = fromTick; tick < toTick; tick += 1) advanceBattleTick(state);
  } });
  state.tick = timeline.tick;
  return entry;
}

export function resolveBattleAction(
  state: BattleState, command: BattleCommand, rng: Rng, options: { readonly deferEndCheck?: boolean;
    readonly ignoreGeometry?: boolean } = {},
): BattleActionResult {
  const candidate = structuredClone(state);
  const stagedRng = createRng(rng.snapshot()); let rngCalls = 0;
  const transactionalRng: Rng = { nextU32: () => { rngCalls += 1; return stagedRng.nextU32(); },
    snapshot: () => stagedRng.snapshot() };
  const beforeEvents = candidate.events.length;
  try {
    const planCommand: BattleActCommand = command.t === 'battle/wait'
      ? { t: 'battle/act', actor: command.actor, action: { t: 'wait' } } : command;
    const validated = options.ignoreGeometry === true
      ? validateAbstractPlan(candidate, planCommand) : validatePlan(candidate, planCommand);
    const { actor, targets, move, path, destination, targetPos } = validated;
    const moved = path.length > 1; const start = pushBuffEvents(candidate, actor);
    if (start === 'active') actor.pos = { ...destination };
    if (start === 'active' && moved) {
      actor.facing = directionBetween(path[path.length - 2]!, destination, actor.facing);
    }
    let hpDamage = 0;
    let recovery: number;
    if (move === null) {
      recovery = start === 'skipped' ? 1_000 : actor.waitStreak >= 1 ? 1_000 : moved ? 800 : 700;
      actor.waitStreak += 1;
    } else {
      recovery = start === 'skipped' ? 1_000 : move.recovery; actor.waitStreak = 0;
    }
    if (start === 'active' && move !== null) {
      actor.mp -= move.mpCost;
      for (let index = 0; index < targets.length; index += 1) {
        hpDamage += settleTarget(candidate, actor, targets[index]!, move, transactionalRng, index);
      }
      if (targetPos !== null) actor.facing = directionBetween(actor.pos, targetPos, actor.facing);
    }
    if (start === 'active' && planCommand.facing !== undefined) actor.facing = planCommand.facing;
    else if (start === 'active') faceNearestEnemy(candidate, actor);
    completeAction(candidate, actor, recovery, command,
      options.deferEndCheck !== true);
    commitCandidate(state, candidate);
    for (let call = 0; call < rngCalls; call += 1) rng.nextU32();
    return { accepted: true, hpDamage, eventsAdded: state.events.length - beforeEvents };
  } catch (error) {
    return { accepted: false, error: error instanceof Error ? error.message : 'BATTLE_ACTION_ERROR',
      hpDamage: 0, eventsAdded: 0 };
  }
}

function commitCandidate(state: BattleState, candidate: BattleState): void {
  for (const next of candidate.units) {
    const current = state.units.find((unit) => unit.id === next.id);
    if (current !== undefined) Object.assign(current, next);
  }
  state.tick = candidate.tick; state.round = candidate.round; state.actionNo = candidate.actionNo;
  state.phase = candidate.phase; state.result = candidate.result;
  state.openingOrder.splice(0, state.openingOrder.length, ...candidate.openingOrder);
  state.events.splice(0, state.events.length, ...candidate.events);
  state.acceptedCommands.splice(0, state.acceptedCommands.length, ...candidate.acceptedCommands);
}

function validateAbstractPlan(state: BattleState, command: BattleActCommand): ValidatedPlan {
  const actor = actorFor(state, command);
  if (command.facing !== undefined && (!Number.isSafeInteger(command.facing)
    || command.facing < 0 || command.facing > 5)) throw new RangeError('INVALID_FACING');
  if (command.action.t === 'wait') return { actor, move: null, targets: [],
    path: [actor.pos], destination: actor.pos, targetPos: null };
  const action = command.action;
  const move = actor.moves.find((candidate) => candidate.id === action.move);
  const target = typeof action.target === 'string'
    ? state.units.find((unit) => unit.id === action.target) : undefined;
  if (move === undefined) throw new RangeError('UNKNOWN_MOVE');
  if (actor.mp < move.mpCost) throw new RangeError('MP_NOT_ENOUGH');
  if (target === undefined || !target.active
    || state.setup.relations[actor.side][target.side] !== 'hostile') throw new RangeError('INVALID_TARGET');
  return { actor, move, targets: [target], path: [actor.pos], destination: actor.pos, targetPos: target.pos };
}
