import { canonicalJson, compareCodePoints, mulDivFloor, type JsonValue } from '@tianshu/shared';
import { advanceBattleToReady, resolveBattleAction } from '../battle/action';
import { evaluateBattleEnd, finishBattle } from '../battle/encounter';
import { isBattleUnitVisible, queryLegalTargets, queryReachable } from '../battle/geometry';
import type { BattleCommand, BattleResult, BattleState, BattleUnit, SideId } from '../battle/types';
import { createRng, seedStream } from '../rng';

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
    && (!geometry || isBattleUnitVisible(state, actor, unit))
    && state.setup.relations[actor.side][unit.side] === 'hostile').sort((left, right) => {
      if (preferred !== undefined) {
        if (left.id === preferred && right.id !== preferred) return -1;
        if (right.id === preferred && left.id !== preferred) return 1;
      }
      return left.hp - right.hp || left.unitIndex - right.unitIndex;
    });
}

export function chooseAutoCommand(
  state: BattleState, actor: BattleUnit, policy: AutoPolicy,
): BattleCommand {
  const move = viableMoves(actor, policy)[0];
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
  state: BattleState, policyBySide: Partial<Record<SideId, AutoPolicy>>, maxActions = defaultMaxActions(state.units.length),
): AutoBattleResult {
  if (state.setup.rules.noAuto) throw new RangeError('BATTLE_AUTO_FORBIDDEN');
  const rng = createRng(seedStream(state.setup.seed, 'battle'));
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
