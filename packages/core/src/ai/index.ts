import { canonicalJson, compareCodePoints, mulDivFloor, type JsonValue } from '@tianshu/shared';
import { advanceBattleToReady, previewBattleRoute, queryBattleQi, resolveBattleAction } from '../battle/action';
import { evaluateBattleEnd, finishBattle } from '../battle/encounter';
import { calculateDamage, calculateJudgeChances, calculateZoneResistanceBp } from '../battle/damage';
import { isBattleUnitVisible, queryLegalTargets, queryReachable } from '../battle/geometry';
import { attackMeridianBp, finalMeridianAttackBp } from '../battle/meridian-flow';
import type { BattleCommand, BattleMove, BattleResult, BattleState, BattleUnit, SideId } from '../battle/types';
import {
  forbidsAcuteGather, guardDamageDownBp, guardDefenseBonusBp, hasGuardStance,
} from '../buff';
import type { Rng } from '../rng';

export interface AutoPolicy { readonly style: 'aggressive' | 'steady' | 'support' | 'custom';
  readonly reserveMpBp: number; readonly allowUltimate: boolean; readonly allowItems: boolean;
  readonly preferredTarget?: string }
export interface AutoBattleResult { readonly state: BattleState; readonly result: BattleResult;
  readonly commandLog: readonly BattleCommand[]; readonly eventLog: readonly BattleState['events'][number][];
  readonly stateHash: string }

export function defaultMaxActions(participants: number): number {
  return Math.min(2_000, Math.max(60, participants * 40));
}

function viableMoves(actor: BattleUnit, policy: AutoPolicy): readonly BattleUnit['moves'][number][] {
  const reserve = mulDivFloor(actor.mpMax, Math.max(0, Math.min(10_000, policy.reserveMpBp)), 10_000);
  return [...actor.moves].filter((move) => actor.mp - move.mpCost >= reserve
    && (policy.allowUltimate || move.ultimate !== true)).sort((left, right) =>
    right.powerBp - left.powerBp || left.mpCost - right.mpCost || compareCodePoints(left.id, right.id));
}

function targets(state: BattleState, actor: BattleUnit, preferred?: string, geometry = true): BattleUnit[] {
  return state.units.filter((unit) => unit.active && unit.hp > 0
    && state.setup.relations[actor.side][unit.side] === 'hostile'
    && (!geometry || isBattleUnitVisible(state, actor, unit))).sort((left, right) => {
      if (preferred !== undefined) {
        if (left.id === preferred && right.id !== preferred) return -1;
        if (right.id === preferred && left.id !== preferred) return 1;
      }
      return left.hp - right.hp || left.unitIndex - right.unitIndex;
    });
}

const STANDARD_MERIDIAN_PROFILE = { qiBp: 10_000, widthBp: 10_000, flowBp: 10_000, completionBp: 10_000 };
const GATHER_GAIN_THRESHOLD_BP = 1_500;
const GATHER_SURVIVAL_THRESHOLD_BP = 5_000;

interface AttackOutcome { readonly damage: number; readonly chanceBp: number }

function attackOutcomes(state: BattleState, enemy: BattleUnit, actor: BattleUnit,
  move: BattleMove): AttackOutcome[] {
  const guarded = hasGuardStance(actor.buffs);
  const direction = guarded && move.delivery === 'melee' ? 'front' : move.direction ?? 'front';
  const chances = calculateJudgeChances({ hitEff: enemy.stats.hit + (move.hitMod ?? 0),
    eva: actor.stats.eva, parry: actor.stats.parry + (guarded ? 20 : 0),
    pierce: enemy.stats.pierce, crit: enemy.stats.crit, tough: actor.stats.tough, direction });
  const guard = actor.zoneGuards[move.hitZone];
  const defenseBp = 10_000 + guardDefenseBonusBp(actor.buffs);
  let meridianAttackBp = move.meridianAttackBp ?? 10_000;
  if (move.meridianRouteRef !== undefined) {
    try {
      const preview = previewBattleRoute(state, enemy.id, move.meridianRouteRef);
      if (preview.disabledReason !== null) return [];
      meridianAttackBp = preview.meridianAttackBp;
    } catch { return []; }
  }
  const outcomes: AttackOutcome[] = [{ damage: 0, chanceBp: 10_000 - chances.hitBp }];
  for (const parried of [false, true]) for (const critical of [false, true]) {
    const chanceBp = mulDivFloor(chances.hitBp,
      (parried ? chances.parryBp : 10_000 - chances.parryBp)
      * (critical ? chances.critBp : 10_000 - chances.critBp), 100_000_000);
    const trace = calculateDamage({ attacker: enemy.stats, defender: { ...actor.stats,
      defOut: mulDivFloor(actor.stats.defOut, defenseBp, 10_000),
      defIn: mulDivFloor(actor.stats.defIn, defenseBp, 10_000) }, wInBp: move.wInBp,
    actualPower: { n: move.powerBp, d: 10_000 },
    referencePower: { n: move.referencePowerBp, d: 10_000 },
    pierceOutBp: move.pierceOutBp ?? 0, pierceInBp: move.pierceInBp ?? 0,
    dmgUpBp: move.dmgUpBp ?? 0, dmgDownBp: guardDamageDownBp(actor.buffs),
    zoneResistanceBp: calculateZoneResistanceBp(move.hitZone, actor.stats.strength,
      actor.stats.tough, guard.carryCapacity === 0 ? 0
        : Math.min(10_000, mulDivFloor(guard.qi, 10_000, guard.carryCapacity))),
    meridianAttackBp, meridianDefenseBp: actor.meridianDefenseBp,
    ultimate: move.ultimate ?? false, direction }, { parried, critical });
    outcomes.push({ damage: trace.z10, chanceBp });
  }
  return outcomes;
}

/** Mean variance, two attacks from the strongest visible threat; no RNG or state writes.
 * Rounding loss and unmodelled outward-qi cancellation conservatively lower survival. */
function survivalEstimateBp(state: BattleState, actor: BattleUnit): number {
  if (!actor.active || actor.hp <= 0) return 0;
  let threat: readonly AttackOutcome[] = [{ damage: 0, chanceBp: 10_000 }];
  let maximumExpected = 0;
  for (const enemy of targets(state, actor)) for (const move of enemy.moves) {
    if (enemy.mp < move.mpCost) continue;
    const outcomes = attackOutcomes(state, enemy, actor, move);
    const expected = outcomes.reduce((sum, outcome) => sum + outcome.damage * outcome.chanceBp, 0);
    if (expected > maximumExpected) { maximumExpected = expected; threat = outcomes; }
  }
  let survival = 0;
  for (const first of threat) for (const second of threat) {
    if (first.damage + second.damage < actor.hp + actor.shield) {
      survival += first.chanceBp * second.chanceBp;
    }
  }
  return mulDivFloor(survival, 1, 10_000);
}

export function chooseAcuteGatherAction(
  state: BattleState, actor: BattleUnit,
): Extract<BattleCommand, { readonly t: 'battle/act' }> | null {
  if (forbidsAcuteGather(actor.buffs)) return null;
  const input = state.setup.meridianInputs.find((candidate) => candidate.unitId === actor.id);
  const saved = state.meridianByUnit[actor.unitIndex];
  if (input === undefined || saved?.unitId !== actor.id) return null;
  const routes = [...input.routes].filter((route) => (route.purpose ?? 'attack') === 'attack')
    .sort((left, right) => compareCodePoints(left.routeId, right.routeId));
  if (routes.length === 0 || survivalEstimateBp(state, actor) < GATHER_SURVIVAL_THRESHOLD_BP) return null;
  for (const route of routes) {
    try {
      const status = queryBattleQi(state, actor.id, route.routeId);
      const preview = previewBattleRoute(state, actor.id, route.routeId);
      const baseBp = attackMeridianBp(preview.profile, STANDARD_MERIDIAN_PROFILE, route.steps.length);
      const gainBp = finalMeridianAttackBp(baseBp, 10_000) - preview.meridianAttackBp;
      if (!status.full && status.circulationBp < 10_000 && gainBp >= GATHER_GAIN_THRESHOLD_BP) {
        return { t: 'battle/act', actor: actor.id, action: { t: 'acuteQiGather', routeRef: route.routeId } };
      }
    } catch { /* A blocked route is not an AI candidate. */ }
  }
  return null;
}

export function chooseAutoCommand(
  state: BattleState, actor: BattleUnit, policy: AutoPolicy,
): BattleCommand {
  const gather = chooseAcuteGatherAction(state, actor);
  if (gather !== null) return gather;
  const move = viableMoves(actor, policy)[0];
  if (move === undefined) return { t: 'battle/wait', actor: actor.id };
  const candidates = targets(state, actor, policy.preferredTarget);
  if (move === undefined || candidates.length === 0) return { t: 'battle/wait', actor: actor.id };
  const legal = new Set(queryLegalTargets(state, actor.id, move.id).map((unit) => unit.id));
  const direct = candidates.find((target) => legal.has(target.id));
  if (direct !== undefined) return { t: 'battle/act', actor: actor.id,
    action: { t: 'skill', move: move.id, target: direct.id } };
  const target = candidates[0]!;
  const approach = queryReachable(state, actor.id).filter((entry) => entry.cost > 0)
    .sort((left, right) => {
      const ld = Math.max(Math.abs(left.pos.q - target.pos.q), Math.abs(left.pos.r - target.pos.r),
        Math.abs(left.pos.q + left.pos.r - target.pos.q - target.pos.r));
      const rd = Math.max(Math.abs(right.pos.q - target.pos.q), Math.abs(right.pos.r - target.pos.r),
        Math.abs(right.pos.q + right.pos.r - target.pos.q - target.pos.r));
      return ld - rd || left.cost - right.cost || left.pos.r - right.pos.r || left.pos.q - right.pos.q;
    })[0];
  if (approach === undefined) return { t: 'battle/wait', actor: actor.id };
  const fromLegal = queryLegalTargets(state, actor.id, move.id, approach.pos)
    .some((unit) => unit.id === target.id);
  return { t: 'battle/act', actor: actor.id, walkTo: approach.pos,
    action: fromLegal ? { t: 'skill', move: move.id, target: target.id } : { t: 'wait' } };
}

function chooseAbstractCommand(state: BattleState, actor: BattleUnit, policy: AutoPolicy): BattleCommand {
  const move = viableMoves(actor, policy)[0];
  const candidates = targets(state, actor, policy.preferredTarget, false);
  if (move === undefined || candidates.length === 0) return { t: 'battle/wait', actor: actor.id };
  return { t: 'battle/act', actor: actor.id,
    action: { t: 'skill', move: move.id, target: candidates[0]!.id } };
}

function fnv1a(text: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash = Math.imul(hash ^ text.charCodeAt(index), 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function effectiveState(state: BattleState): string {
  return canonicalJson(state.units.map((unit) => [unit.id, unit.hp, unit.mp, unit.shield,
    unit.active, unit.state, unit.zoneGuards.body.qi, unit.zoneGuards.hand.qi,
    unit.zoneGuards.leg.qi, unit.redirectedQi,
    unit.buffs.map((buff) => [buff.iid, buff.def, buff.source, buff.grade, buff.stacks,
      buff.turnsLeft, buff.fresh]),
    unit.foreignQi.map((foreign) => [foreign.id, foreign.remainingQi, foreign.stepIndex,
      foreign.remainingTravelTick]),
    unit.acupointOccupancies.map((occupancy) => [occupancy.acupointRef, occupancy.sourceUnitId,
      occupancy.occupyingQi, occupancy.level, occupancy.remainingOwnActions])]) as JsonValue);
}

export function simulateAbstractBattle(
  state: BattleState, policyBySide: Partial<Record<SideId, AutoPolicy>>, rng: Rng,
  maxActions = defaultMaxActions(state.units.length),
): AutoBattleResult {
  if (state.setup.rules.noAuto) throw new RangeError('BATTLE_AUTO_FORBIDDEN');
  state.events.push({ t: 'battle/autoSimulationStarted', actionNo: state.actionNo });
  let unchangedActions = 0;
  while (state.phase !== 'ended' && state.actionNo < maxActions) {
    const next = advanceBattleToReady(state);
    if (next.kind !== 'unit') { finishBattle(state, 'draw'); break; }
    const actor = state.units.find((unit) => unit.id === next.unitId);
    if (actor === undefined || !actor.active) { state.openingOrder.shift(); continue; }
    const policy = policyBySide[actor.side] ?? { style: 'aggressive', reserveMpBp: 0,
      allowUltimate: true, allowItems: false };
    const command = chooseAbstractCommand(state, actor, policy);
    const before = effectiveState(state);
    const result = resolveBattleAction(state, command, rng, { deferEndCheck: true, ignoreGeometry: true });
    if (!result.accepted) { finishBattle(state, 'draw'); break; }
    const target = command.t === 'battle/act' && command.action.t === 'skill'
      && typeof command.action.target === 'string' ? command.action.target : undefined;
    state.events.push({ t: 'battle/autoExchangeResolved', actionNo: state.actionNo, actor: actor.id,
      ...(target === undefined ? {} : { target }), amount: result.hpDamage });
    const after = effectiveState(state);
    unchangedActions = before === after ? unchangedActions + 1 : 0;
    const roundSpan = Math.max(1, state.units.filter((unit) => unit.active).length);
    if (unchangedActions >= roundSpan * 5) finishBattle(state, 'draw');
    const end = evaluateBattleEnd(state); if (end !== null && state.result === null) finishBattle(state, end);
  }
  if (state.phase !== 'ended') finishBattle(state, 'draw');
  state.events.push({ t: 'battle/autoSimulationEnded', actionNo: state.actionNo, message: state.result ?? 'draw' });
  return { state, result: state.result ?? 'draw', commandLog: state.acceptedCommands, eventLog: state.events,
    stateHash: fnv1a(canonicalJson(state as unknown as JsonValue)) };
}
