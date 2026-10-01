import { compareCodePoints, mulDivFloor } from '@tianshu/shared';
import type { Rng } from '../../rng';
import { endOwnAction, executeBuffHook, qiProductionBp } from '../../buff';
import {
  applyAcupointStrike, calculateZoneResistanceBp, injectPenetratingQi, resolveDamage,
  tickHostileMeridianEffects,
} from '../damage';
import { evaluateBattleEnd, finishBattle } from '../encounter';
import { nextTimelineEntry, peekReadyUnitId, settleTimelineAction, type TimelineEntry } from '../timeline';
import type { BattleActCommand, BattleCommand, BattleMove, BattleState, BattleUnit } from '../types';

export interface BattleActionResult { readonly accepted: boolean; readonly error?: string;
  readonly hpDamage: number; readonly eventsAdded: number }

function hostile(state: BattleState, attacker: BattleUnit, defender: BattleUnit): boolean {
  return state.setup.relations[attacker.side][defender.side] === 'hostile';
}

function actorFor(state: BattleState, command: BattleCommand): BattleUnit {
  if (state.phase === 'ended') throw new RangeError('BATTLE_ENDED');
  const actor = state.units.find((unit) => unit.id === command.actor);
  if (actor === undefined || !actor.active) throw new RangeError('INVALID_ACTOR');
  if (peekReadyUnitId(state) !== actor.id) throw new RangeError('NOT_YOUR_TURN');
  return actor;
}

function validateAct(state: BattleState, command: BattleActCommand):
{ actor: BattleUnit; targets: BattleUnit[]; move: BattleMove } {
  const actor = actorFor(state, command);
  const move = actor.moves.find((candidate) => candidate.id === command.moveId);
  if (move === undefined) throw new RangeError('UNKNOWN_MOVE');
  if (actor.mp < move.mpCost) throw new RangeError('MP_NOT_ENOUGH');
  const unique = [...new Set(command.targetIds)];
  if (unique.length === 0 || unique.length > Math.max(1, move.autoTargetCap ?? 1)) {
    throw new RangeError('ILLEGAL_TARGET');
  }
  const targets = unique.map((id) => state.units.find((unit) => unit.id === id))
    .filter((unit): unit is BattleUnit => unit !== undefined)
    .sort((left, right) => left.unitIndex - right.unitIndex || compareCodePoints(left.id, right.id));
  if (targets.length !== unique.length || targets.some((target) => !target.active || !hostile(state, actor, target))) {
    throw new RangeError('ILLEGAL_TARGET');
  }
  return { actor, targets, move };
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
  state.acceptedCommands.push(command);
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
  state: BattleState, command: BattleCommand, rng: Rng, options: { readonly deferEndCheck?: boolean } = {},
): BattleActionResult {
  const beforeEvents = state.events.length;
  try {
    if (command.t === 'battle/wait') {
      const actor = actorFor(state, command); const start = pushBuffEvents(state, actor);
      completeAction(state, actor, start === 'skipped' ? 1_000 : 700, command);
      return { accepted: true, hpDamage: 0, eventsAdded: state.events.length - beforeEvents };
    }
    const { actor, targets, move } = validateAct(state, command);
    const start = pushBuffEvents(state, actor);
    let hpDamage = 0;
    if (start === 'active') {
      actor.mp -= move.mpCost;
      for (let index = 0; index < targets.length; index += 1) {
        hpDamage += settleTarget(state, actor, targets[index]!, move, rng, index);
      }
    }
    completeAction(state, actor, start === 'skipped' ? 1_000 : move.recovery, command,
      options.deferEndCheck !== true);
    return { accepted: true, hpDamage, eventsAdded: state.events.length - beforeEvents };
  } catch (error) {
    return { accepted: false, error: error instanceof Error ? error.message : 'BATTLE_ACTION_ERROR',
      hpDamage: 0, eventsAdded: 0 };
  }
}
