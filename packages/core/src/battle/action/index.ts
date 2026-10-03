import { BP_SCALE, compareCodePoints, mulBpFloor, mulDivFloor } from '@tianshu/shared';
import { createRng, type Rng } from '../../rng';
import { endOwnAction, executeBuffHook, forbidsAcuteGather, guardDamageDownBp,
  guardDefenseBonusBp, hasGuardStance, qiProductionBp } from '../../buff';
import { useConsumable, type ConsumableTargetState, type UseConsumableResult } from '../../economy';
import { hexDistance, type HexCoord } from '../../hex';
import {
  applyAcupointStrike, calculateZoneResistanceBp, injectPenetratingQi, resolveDamage,
  tickHostileMeridianEffects,
} from '../damage';
import { evaluateBattleEnd, finishBattle } from '../encounter';
import { directionBetween, hasBattleLineOfSight, isBattleUnitVisible, queryMoveAt, queryPath } from '../geometry';
import { createMeridianFlowRuntime, type MeridianFlowRuntime, type MeridianFlowSnapshot,
  type MeridianFlowInput, type QiGatherStatus, type MeridianFlowPreview, type QiMoveResolution } from '../meridian-flow';
import { nextTimelineEntry, peekReadyUnitId, settleTimelineAction, type TimelineEntry } from '../timeline';
import type { BattleActCommand, BattleAction, BattleCommand, BattleMove, BattleState, BattleUnit } from '../types';

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
  readonly actor: BattleUnit; readonly action: BattleAction; readonly move: BattleMove | null;
  readonly targets: readonly BattleUnit[];
  readonly path: readonly HexCoord[]; readonly destination: HexCoord; readonly targetPos: HexCoord | null;
}

interface MeridianCacheEntry { readonly input: MeridianFlowInput; flow: MeridianFlowSnapshot;
  readonly runtime: MeridianFlowRuntime }
const meridianCache = new WeakMap<BattleState, Map<string, MeridianCacheEntry>>();

function projectMeridianEffects(unit: BattleUnit, runtime: MeridianFlowRuntime): MeridianFlowRuntime {
  runtime.projectOccupancies(unit.foreignQi, unit.acupointOccupancies);
  for (const buff of unit.buffs) {
    if (buff.def === 'bf_xueweishoufeng' && buff.key !== undefined) runtime.projectSeal(buff.key, buff.stacks);
  }
  return runtime;
}

function meridianRuntime(state: BattleState, unit: BattleUnit): MeridianFlowRuntime {
  const input = state.setup.meridianInputs[unit.unitIndex];
  const saved = state.meridianByUnit[unit.unitIndex];
  if (input?.unitId !== unit.id || saved?.unitId !== unit.id) throw new RangeError('QI_ROUTE_UNAVAILABLE');
  let cache = meridianCache.get(state);
  if (cache === undefined) { cache = new Map(); meridianCache.set(state, cache); }
  const cached = cache.get(unit.id);
  if (cached?.input === input && cached.flow === saved.flow) return projectMeridianEffects(unit, cached.runtime);
  const runtime = createMeridianFlowRuntime(input);
  runtime.restore(saved.flow);
  cache.set(unit.id, { input, flow: saved.flow, runtime });
  return projectMeridianEffects(unit, runtime);
}

function snapshotMeridian(state: BattleState, unit: BattleUnit, runtime?: MeridianFlowRuntime): void {
  const saved = state.meridianByUnit[unit.unitIndex];
  if (saved?.unitId !== unit.id) throw new RangeError('QI_ROUTE_UNAVAILABLE');
  const active = projectMeridianEffects(unit, runtime ?? meridianRuntime(state, unit));
  saved.flow = active.snapshot({ foreignQi: unit.foreignQi,
    acupointOccupancies: unit.acupointOccupancies, redirectedQi: unit.redirectedQi,
    redirectedQiExpiresAtOwnAction: unit.redirectedQiExpiresAtOwnAction });
  const cached = meridianCache.get(state)?.get(unit.id);
  if (cached?.runtime === active) cached.flow = saved.flow;
}

/** Scratch is reused: copy it before retaining it. Neither query changes canonical state or RNG. */
export function previewBattleRoute(state: BattleState, unitId: string, routeId: string): MeridianFlowPreview {
  for (const unit of state.units) if (unit.id === unitId) return meridianRuntime(state, unit).preview(routeId);
  throw new RangeError('QI_ROUTE_UNAVAILABLE');
}

export function queryBattleQi(state: BattleState, unitId: string, routeId: string): QiGatherStatus {
  const unit = state.units.find((entry) => entry.id === unitId);
  if (unit === undefined) throw new RangeError('QI_ROUTE_UNAVAILABLE');
  return meridianRuntime(state, unit).queryGatherStatus(routeId);
}

function routeUnavailable(error: unknown): never {
  if (error instanceof RangeError && error.message.startsWith('QI_ROUTE_')) {
    throw new RangeError('QI_ROUTE_UNAVAILABLE');
  }
  throw error;
}

function itemRecovery(action: string): number {
  if (action === 'load') return 1_000;
  if (action === 'throw' || action === 'dose') return 900;
  return 800;
}

function itemTargetAllowed(state: BattleState, actor: BattleUnit, target: BattleUnit,
  action: Extract<BattleAction, { readonly t: 'item' }>): boolean {
  const item = state.setup.itemDefs.find((candidate) => candidate.id === action.item);
  const use = item?.use;
  if (item === undefined || use === undefined) throw new RangeError('ILLEGAL_TARGET');
  if (state.setup.rules.noItems || state.setup.rules.mode === 'spar') {
    throw new RangeError('DISABLED_BY_STATUS');
  }
  const relation = actor.id === target.id ? 'self'
    : state.setup.relations[actor.side][target.side] ?? 'neutral';
  const reviving = use.effects.some((effect) => effect.op === 'revive');
  if (!target.active || target.hp <= 0) {
    if (!reviving || target.state !== 'downed' || relation !== 'friendly') return false;
  } else if (reviving) return false;
  if (target.state === 'hidden' || target.buffs.some((buff) => buff.def === 'bf_yinshen')
    && !actor.buffs.some((buff) => buff.def === 'bf_tingfeng')) return false;
  if (use.target === 'area') return false;
  if (use.target === 'self' && relation !== 'self') return false;
  if (use.target === 'ally' && relation !== 'self' && relation !== 'friendly') return false;
  if (use.target === 'enemy' && relation !== 'hostile') return false;
  const distance = hexDistance(actor.pos, target.pos);
  const range = use.range ?? (use.target === 'self' ? 0 : use.target === 'ally'
    ? actor.medical >= 40 ? 2 : 1 : 3);
  if (distance > range) return false;
  if (use.action === 'throw' && !hasBattleLineOfSight(state, actor, target.pos, 'projectile')) {
    throw new RangeError('NO_LOS');
  }
  return true;
}

function validatePlan(state: BattleState, command: BattleActCommand, abstract = false): ValidatedPlan {
  const actor = actorFor(state, command);
  if (command.facing !== undefined && (!Number.isSafeInteger(command.facing)
    || command.facing < 0 || command.facing > 5)) throw new RangeError('INVALID_FACING');
  const action = command.action;
  if (action.t === 'acuteQiGather' && command.walkTo !== undefined) {
    throw new RangeError('QI_ROUTE_UNAVAILABLE');
  }
  const destination = abstract ? actor.pos : command.walkTo ?? actor.pos;
  const path = abstract ? [actor.pos] : queryPath(state, actor.id, destination)?.path;
  if (path === undefined) throw new RangeError('PATH_BLOCKED');
  const origin = actor.pos;
  actor.pos = { ...destination };
  try {
    if (action.t === 'wait' || action.t === 'guard' || action.t === 'acuteQiGather') {
      if (action.t === 'guard' && action.routeRef !== undefined) {
        throw new RangeError('MERIDIAN_ROUTE_BLOCKED');
      }
      if (action.t === 'acuteQiGather') {
        if (forbidsAcuteGather(actor.buffs)) throw new RangeError('DISABLED_BY_STATUS');
        try {
          if (meridianRuntime(state, actor).queryGatherStatus(action.routeRef).full) {
            throw new RangeError('QI_CARRY_FULL');
          }
        } catch (error) {
          if (error instanceof RangeError && error.message === 'QI_CARRY_FULL') throw error;
          routeUnavailable(error);
        }
      }
      return { actor, action, move: null, targets: [], path, destination, targetPos: null };
    }
    if (action.t === 'item') {
      const target = typeof action.target === 'string'
        ? state.units.find((unit) => unit.id === action.target) : undefined;
      if (target === undefined || !itemTargetAllowed(state, actor, target, action)) {
        throw new RangeError('ILLEGAL_TARGET');
      }
      if (actor.itemState.uses >= actor.itemState.maxUses) throw new RangeError('LIMIT_REACHED');
      const item = state.setup.itemDefs.find((entry) => entry.id === action.item)!;
      const singleUse = item.kind === 'pill' && (item.grade ?? 0) >= 10
        || item.flags.includes('uniqueUse');
      const battleUses = state.units.reduce((total, unit) =>
        total + (unit.itemState.battleUses[action.item] ?? 0), 0);
      if (singleUse && battleUses >= 1) {
        throw new RangeError('LIMIT_REACHED');
      }
      const previousUse = actor.itemState.lastBattleUseTurns[action.item];
      if (previousUse !== undefined && actor.ownActions <= previousUse + 2) {
        throw new RangeError('ON_COOLDOWN');
      }
      return { actor, action, move: null, targets: [target], path, destination, targetPos: target.pos };
    }
    const move = actor.moves.find((candidate) => candidate.id === action.move);
    if (move === undefined) throw new RangeError('UNKNOWN_MOVE');
    if (actor.mp < move.mpCost) throw new RangeError('MP_NOT_ENOUGH');
    if (move.meridianRouteRef !== undefined) try {
      meridianRuntime(state, actor).validateAttackRoute(move.meridianRouteRef);
    } catch { throw new RangeError('MERIDIAN_ROUTE_BLOCKED'); }
    let targets: readonly BattleUnit[];
    if (abstract) {
      const target = typeof action.target === 'string'
        ? state.units.find((unit) => unit.id === action.target) : undefined;
      if (target === undefined || !target.active
        || state.setup.relations[actor.side][target.side] !== 'hostile') throw new RangeError('INVALID_TARGET');
      targets = [target];
    } else {
      const queried = queryMoveAt(state, actor.id, move.id, action.target,
        action.aim === undefined ? {} : { aim: action.aim });
      if (queried.reason !== null) throw new RangeError(queried.reason);
      targets = queried.targets;
    }
    const targetPos = typeof action.target === 'string'
      ? state.units.find((unit) => unit.id === action.target)?.pos ?? null : action.target;
    return { actor, action, move, targets, path, destination, targetPos };
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
  move: BattleMove, rng: Rng, segmentIndex: number, qi?: QiMoveResolution): { damage: number;
    critical: boolean; critRollBp: number | null; critChanceBp: number } {
  if (target.state === 'hidden') target.state = 'active';
  if (move.delivery === 'melee' && hasGuardStance(target.buffs)) {
    target.facing = directionBetween(target.pos, actor.pos, target.facing);
  }
  const guardedMelee = move.delivery === 'melee' && hasGuardStance(target.buffs);
  const attackDirection = guardedMelee ? 'front' : move.direction ?? 'front';
  const defenderMpAtHit = target.mp;
  const guard = target.zoneGuards[move.hitZone];
  const zoneFlowBp = guard.carryCapacity === 0 ? 0
    : Math.min(10_000, mulDivFloor(guard.qi, 10_000, guard.carryCapacity));
  const defenseBonusBp = guardDefenseBonusBp(target.buffs);
  const defenderStats = defenseBonusBp === 0 ? target.stats : { ...target.stats,
    defOut: mulBpFloor(target.stats.defOut, BP_SCALE + defenseBonusBp),
    defIn: mulBpFloor(target.stats.defIn, BP_SCALE + defenseBonusBp) };
  const result = resolveDamage({ judge: { hitEff: actor.stats.hit + (move.hitMod ?? 0),
    eva: target.stats.eva, parry: target.stats.parry + (hasGuardStance(target.buffs) ? 20 : 0),
    pierce: actor.stats.pierce,
    crit: actor.stats.crit, tough: target.stats.tough, direction: attackDirection },
  formula: { attacker: actor.stats, defender: defenderStats, wInBp: move.wInBp,
    actualPower: { n: move.powerBp, d: 10_000 }, referencePower: { n: move.referencePowerBp, d: 10_000 },
    pierceOutBp: move.pierceOutBp ?? 0, pierceInBp: move.pierceInBp ?? 0,
    dmgUpBp: move.dmgUpBp ?? 0, dmgDownBp: guardDamageDownBp(target.buffs),
    direction: attackDirection,
    zoneResistanceBp: calculateZoneResistanceBp(move.hitZone, target.stats.strength,
      target.stats.tough, zoneFlowBp), meridianAttackBp: qi?.meridianAttackBp
        ?? move.meridianAttackBp ?? 10_000,
    meridianDefenseBp: target.meridianDefenseBp, ultimate: move.ultimate ?? false },
  resources: { hp: target.hp, mp: target.mp, shield: target.shield },
  outwardQi: { wInBp: move.wInBp, zoneQi: guard.qi, zoneCarryCapacity: guard.carryCapacity,
    defenderStrengthBp: guard.strengthBp, defenderFlowRatioBp: guard.flowRatioBp,
    breakGuardBp: guard.breakGuardBp, causeId: `act:${state.actionNo}`, targetId: target.id,
    segmentIndex } }, rng);
  if (result.settlement === null) return { damage: 0, critical: result.judge.critical,
    critRollBp: result.judge.critRollBp, critChanceBp: result.judge.critBp };
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
  applyMoveEffects(state, actor, target, move, qi?.releasedQi ?? move.releasedQi ?? 0,
    result.judge.hitBp, defenderMpAtHit, rng);
  return { damage: result.settlement.hpDamage, critical: result.judge.critical,
    critRollBp: result.judge.critRollBp, critChanceBp: result.judge.critBp };
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

function upsertGuardBuff(unit: BattleUnit, def: 'bf_jiangu' | 'bf_xieli'): void {
  const index = unit.buffs.findIndex((buff) => buff.def === def);
  if (index < 0) {
    unit.buffs.push({ iid: nextBuffIid(unit), def, holder: unit.id, source: unit.id,
      grade: unit.innerGrade, stacks: 1, turnsLeft: 1, fresh: true });
    return;
  }
  const existing = unit.buffs[index]!;
  unit.buffs[index] = { ...existing, grade: Math.max(existing.grade, unit.innerGrade),
    stacks: Math.max(existing.stacks, 1), turnsLeft: Math.max(existing.turnsLeft, 1), fresh: true };
}

const AILMENT_BY_BUFF: Readonly<Record<string, string>> = {
  bf_zhongdu: 'poison', bf_liuxue: 'bleed', bf_neishang: 'injury',
};

function consumableTarget(unit: BattleUnit): ConsumableTargetState {
  return { characterId: unit.id, alive: unit.active, hp: unit.hp, hpMax: unit.hpMax,
    mp: unit.mp, mpMax: unit.mpMax, stamina: unit.stamina, staminaMax: unit.staminaMax,
    ailments: unit.buffs.flatMap((buff) => {
      const tag = AILMENT_BY_BUFF[buff.def];
      return tag === undefined ? [] : [{ tag, grade: buff.grade }];
    }), temporaryEffects: unit.itemEffects, permanentBonuses: { stats: {}, hpMaxBp: 0, mpMaxBp: 0 },
    meridianAids: [], meridians: { schemaVersion: 2, opened: [], meridianStats: {},
      acupointStats: {}, targets: {}, turnCompleted: 0, lastAppliedMigration: 2 } };
}

function applyConsumableTarget(unit: BattleUnit, result: UseConsumableResult): void {
  unit.hp = result.target.hp; unit.mp = result.target.mp; unit.stamina = result.target.stamina;
  unit.itemEffects = result.target.temporaryEffects.map((effect) =>
    ({ ...effect, params: { ...effect.params } }));
  const ailments = new Set(result.target.ailments.map((ailment) => ailment.tag));
  unit.buffs = unit.buffs.filter((buff) => {
    const tag = AILMENT_BY_BUFF[buff.def]; return tag === undefined || ailments.has(tag);
  });
  if (result.target.alive && !unit.active) { unit.active = true; unit.state = 'active'; }
}

function useBattleItem(state: BattleState, actor: BattleUnit, target: BattleUnit, itemId: string): number {
  const item = state.setup.itemDefs.find((candidate) => candidate.id === itemId);
  if (item?.use === undefined) throw new RangeError('ILLEGAL_TARGET');
  let used: UseConsumableResult;
  try {
    used = useConsumable({ inventory: state.inventory, itemDefs: state.setup.itemDefs, item,
      target: consumableTarget(target), context: 'battle', currentTick: state.tick,
      battleTurnToken: actor.ownActions, healingReceivedBp: target.healingReceivedBp,
      usage: { battleUses: actor.itemState.battleUses, chapterUses: {},
        lastBattleUseTurns: actor.itemState.lastBattleUseTurns } });
  } catch (error) { mapConsumableError(error); }
  state.inventory = { stacks: used.inventory.stacks.map((stack) => ({ ...stack })) };
  applyConsumableTarget(target, used);
  actor.itemState.uses += 1;
  actor.itemState.battleUses = { ...actor.itemState.battleUses,
    [itemId]: (actor.itemState.battleUses[itemId] ?? 0) + 1 };
  actor.itemState.lastBattleUseTurns = { ...used.usage.lastBattleUseTurns, [itemId]: actor.ownActions };
  state.events.push({ t: 'battle/itemUsed', actionNo: state.actionNo + 1, actor: actor.id,
    target: target.id, itemId });
  return itemRecovery(item.use.action);
}

function mapConsumableError(error: unknown): never {
  if (!(error instanceof Error)) throw error;
  if (error.message === 'CONSUMABLE_COOLDOWN') throw new RangeError('ON_COOLDOWN');
  if (error.message === 'CONSUMABLE_BATTLE_LIMIT'
    || error.message === 'CONSUMABLE_CHAPTER_LIMIT'
    || error.message === 'INVENTORY_INSUFFICIENT') throw new RangeError('LIMIT_REACHED');
  if (error.message === 'CONSUMABLE_CONTEXT' || error.message === 'CONSUMABLE_PERMANENT_CONTEXT'
    || error.message === 'CONSUMABLE_MERIDIAN_CONTEXT') throw new RangeError('DISABLED_BY_STATUS');
  throw new RangeError('ILLEGAL_TARGET');
}

function incrementStat(rows: Array<{ unitId: string; count: number }>, unitId: string): void {
  const row = rows.find((entry) => entry.unitId === unitId);
  if (row === undefined) rows.push({ unitId, count: 1 });
  else row.count += 1;
}

function recordMoveUse(state: BattleState, actor: BattleUnit, move: BattleMove): void {
  if (move.skillId === undefined) return;
  const row = state.rewardStats.martialUses.find((entry) => entry.unitId === actor.id
    && entry.skillId === move.skillId);
  const uses = move.ultimate === true ? 3 : 1;
  if (row === undefined) state.rewardStats.martialUses.push({ unitId: actor.id, skillId: move.skillId, uses });
  else row.uses += uses;
}

function applyMoveEffects(state: BattleState, actor: BattleUnit, target: BattleUnit, move: BattleMove,
  releasedQi: number, hitBp: number, defenderMpAtHit: number, rng: Rng): void {
  const foreign = injectPenetratingQi({ projectionActive: move.projection === true,
    enabled: move.penetratingQi === true, sourceGrade: move.sourceGrade ?? 0,
    attackerMpAfterCosts: actor.mp, defenderMpAtHit, sourceUnitId: actor.id,
    sourceInnerId: move.sourceInnerId ?? 'sk_none', releasedQi,
    qiSpeedBp: move.qiSpeedBp ?? 10_000, hitZone: move.hitZone,
    ...(move.targetAcupoint === undefined ? {} : { targetAcupoint: move.targetAcupoint }),
    digestRatioBp: move.digestRatioBp ?? 10_000, reversePath: move.reversePath ?? [],
    sequence: target.foreignQi.length + 1, battleTick: state.tick });
  if (foreign !== null) { target.foreignQi.push(foreign); state.events.push({
    t: 'battle/foreignQiInjected', actionNo: state.actionNo + 1, actor: actor.id,
    target: target.id, amount: foreign.injectedQi }); }
  if (move.acupointStrike !== true || releasedQi <= 0) {
    if (foreign !== null) snapshotMeridian(state, target);
    return;
  }
  const occupancy = applyAcupointStrike({ hitBp, sourceEffHit: actor.stats.hit,
    targetEffRes: target.stats.tough, resSealEffBp: 0, sealBp: move.sealBp ?? 0,
    acupointRef: move.targetAcupoint ?? 'ap_renmai_danzhong', sourceUnitId: actor.id,
    sourceInnerId: move.sourceInnerId ?? 'sk_none', occupyingQi: releasedQi,
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
  snapshotMeridian(state, target);
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
  settleTimelineAction(actor, recovery);
  const previousSeals = actor.buffs.filter((buff) => buff.def === 'bf_xueweishoufeng');
  actor.buffs = endOwnAction(actor.buffs);
  for (const occupancy of actor.acupointOccupancies) occupancy.remainingOwnActions -= 1;
  actor.acupointOccupancies = actor.acupointOccupancies.filter((entry) => entry.remainingOwnActions > 0);
  if (actor.redirectedQiExpiresAtOwnAction !== null
    && actor.ownActions >= actor.redirectedQiExpiresAtOwnAction) {
    actor.redirectedQi = 0; actor.redirectedQiExpiresAtOwnAction = null;
  }
  const runtime = meridianRuntime(state, actor);
  for (const seal of previousSeals) {
    if (seal.key !== undefined && !actor.buffs.some((buff) =>
      buff.def === 'bf_xueweishoufeng' && buff.key === seal.key)) runtime.projectSeal(seal.key, 0);
  }
  snapshotMeridian(state, actor, runtime);
  if (state.openingOrder[0] === actor.id) state.openingOrder.shift();
  if (state.openingOrder.length === 0 && state.phase === 'opening') state.phase = 'running';
  state.acceptedCommands.push(structuredClone(command));
  const end = checkEnd ? evaluateBattleEnd(state) : null; if (end !== null) finishBattle(state, end);
}

function commitSkillRoute(state: BattleState, actor: BattleUnit, move: BattleMove,
  targets: readonly BattleUnit[], rng: Rng): { runtime: MeridianFlowRuntime; qi: QiMoveResolution } | null {
  if (move.meridianRouteRef === undefined) return null;
  const runtime = meridianRuntime(state, actor);
  const qi = runtime.commitMove({ routeId: move.meridianRouteRef, moveId: move.id,
    targetIds: targets.map((target) => target.id), causeId: `act:${state.actionNo + 1}`,
    battleTick: state.tick, reference: runtime.routeReference(move.meridianRouteRef) }, rng);
  snapshotMeridian(state, actor, runtime);
  state.events.push({ t: qi.t, actionNo: state.actionNo + 1, actor: actor.id,
    routeId: qi.routeId, amount: qi.releasedQi, payload: qi });
  return { runtime, qi };
}

function emitFullCycleCrit(state: BattleState, actor: BattleUnit, move: BattleMove,
  targets: readonly BattleUnit[], route: NonNullable<ReturnType<typeof commitSkillRoute>>,
  critical: boolean, critRollBp: number | null, critChanceBp: number): void {
  if (critRollBp === null) return;
  const event = route.runtime.createFullCycleCrit({ routeId: route.qi.routeId, moveId: move.id,
    targetIds: targets.map((target) => target.id), causeId: `act:${state.actionNo + 1}`,
    battleTick: state.tick, reference: route.runtime.routeReference(route.qi.routeId),
    critical, critRollBp, critChanceBp }, route.qi.releasedQi, route.qi.routeCarryCap,
  route.qi.circulationBp);
  if (event === null) return;
  state.events.push({ t: 'battle/fullCirculationCritResolved', actionNo: state.actionNo + 1,
    actor: actor.id, routeId: event.routeId, amount: event.releasedQi, payload: event });
}

function performAction(state: BattleState, validated: ValidatedPlan, rng: Rng,
  moved: boolean): { hpDamage: number; recovery: number } {
  const { actor, action, move, targets } = validated;
  if (moved) incrementStat(state.rewardStats.movementActions, actor.id);
  if (action.t === 'wait') { actor.waitStreak += 1; return { hpDamage: 0,
    recovery: actor.waitStreak > 1 ? 1_000 : moved ? 800 : 700 }; }
  actor.waitStreak = 0;
  if (action.t === 'guard') {
    upsertGuardBuff(actor, 'bf_jiangu'); upsertGuardBuff(actor, 'bf_xieli');
    state.events.push({ t: 'battle/guarded', actionNo: state.actionNo + 1, actor: actor.id });
    return { hpDamage: 0, recovery: 700 };
  }
  if (action.t === 'acuteQiGather') {
    const runtime = meridianRuntime(state, actor); runtime.selectRoute(action.routeRef);
    snapshotMeridian(state, actor, runtime);
    const status = runtime.queryGatherStatus(action.routeRef);
    state.events.push({ t: 'battle/acuteQiGathered', actionNo: state.actionNo + 1, actor: actor.id,
      routeId: action.routeRef, payload: { ...status, recEff: 1_000, battleTick: state.tick,
        causeId: `act:${state.actionNo + 1}` } });
    return { hpDamage: 0, recovery: 1_000 };
  }
  if (action.t === 'item') return { hpDamage: 0,
    recovery: useBattleItem(state, actor, targets[0]!, action.item) };
  if (move === null) throw new RangeError('UNKNOWN_MOVE');
  actor.mp -= move.mpCost; recordMoveUse(state, actor, move);
  const route = commitSkillRoute(state, actor, move, targets, rng);
  if (route?.qi.circulationBp === BP_SCALE && route.qi.releasedQi > 0) {
    incrementStat(state.rewardStats.fullCirculations, actor.id);
  }
  let hpDamage = 0; let criticalJudge: ReturnType<typeof settleTarget> | null = null;
  for (let index = 0; index < targets.length; index += 1) {
    const settled = settleTarget(state, actor, targets[index]!, move, rng, index, route?.qi);
    if (settled.critical && criticalJudge === null) criticalJudge = settled;
    hpDamage += settled.damage;
  }
  if (route !== null && criticalJudge !== null) emitFullCycleCrit(state, actor, move, targets, route,
    criticalJudge.critical, criticalJudge.critRollBp, criticalJudge.critChanceBp);
  return { hpDamage, recovery: move.recovery + (route?.qi.flowCt ?? 0) };
}

export function advanceBattleTick(state: BattleState): void {
  for (const unit of [...state.units].sort((left, right) => left.unitIndex - right.unitIndex)) {
    if (!unit.active) continue;
    const productionBp = qiProductionBp(unit.buffs);
    const runtime = meridianRuntime(state, unit);
    const production = mulDivFloor(runtime.productionPerTick, productionBp, 10_000);
    runtime.tick(1, productionBp);
    const events = tickHostileMeridianEffects(unit, production);
    for (const event of events) {
      state.events.push({ t: event.t, actionNo: state.actionNo, target: event.target, amount: event.amount,
        ...(event.level === undefined ? {} : { level: event.level }) });
      if (event.t === 'battle/dantianDamaged') upsertDantianDamageBuff(unit,
        event.level ?? 1, event.durationOwnActions ?? 2);
      if (event.t === 'battle/reverseQiReleased') {
        unit.redirectedQiExpiresAtOwnAction = unit.ownActions + 1;
      }
    }
    snapshotMeridian(state, unit, runtime);
    if (unit.hp === 0) { unit.active = false; unit.state = 'downed'; }
  }
}

function advanceBattleTicks(state: BattleState, count: number): void {
  if (count <= 0) return;
  const active = [...state.units].filter((unit) => unit.active)
    .sort((left, right) => left.unitIndex - right.unitIndex);
  const needsPerTickEffects = active.some((unit) =>
    unit.foreignQi.length > 0 || unit.acupointOccupancies.length > 0);
  if (needsPerTickEffects) {
    for (let tick = 0; tick < count; tick += 1) advanceBattleTick(state);
    return;
  }
  for (const unit of active) {
    const runtime = meridianRuntime(state, unit);
    runtime.tick(count, qiProductionBp(unit.buffs));
    snapshotMeridian(state, unit, runtime);
  }
}

export function advanceBattleToReady(state: BattleState): TimelineEntry {
  const timeline = { tick: state.tick, units: state.units, openingOrder: state.openingOrder,
    timedEvents: [], env: null };
  const entry = nextTimelineEntry(timeline, { advance: (fromTick, toTick) => {
    advanceBattleTicks(state, toTick - fromTick);
  } });
  state.tick = timeline.tick;
  return entry;
}

/** Full validation for ENG-16c buttons; canonical battle and RNG are never changed. */
export function queryBattleAction(state: BattleState, command: BattleCommand): {
  readonly enabled: boolean; readonly reason: string | null;
} {
  const candidate = structuredClone(state);
  try {
    const plan = validatePlan(candidate, command.t === 'battle/wait'
      ? { t: 'battle/act', actor: command.actor, action: { t: 'wait' } } : command);
    if (plan.action.t === 'item') useBattleItem(candidate, plan.actor, plan.targets[0]!, plan.action.item);
    return { enabled: true, reason: null };
  } catch (error) {
    return { enabled: false, reason: error instanceof Error ? error.message : 'BATTLE_ACTION_ERROR' };
  }
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
    const validated = validatePlan(candidate, planCommand, options.ignoreGeometry === true);
    const { actor, path, destination, targetPos } = validated;
    const moved = path.length > 1; const start = pushBuffEvents(candidate, actor);
    if (start === 'active') actor.pos = { ...destination };
    if (start === 'active' && moved) {
      actor.facing = directionBetween(path[path.length - 2]!, destination, actor.facing);
    }
    const performed = start === 'active' ? performAction(candidate, validated, transactionalRng, moved)
      : { hpDamage: 0, recovery: 1_000 };
    if (start === 'active' && targetPos !== null) {
      actor.facing = directionBetween(actor.pos, targetPos, actor.facing);
    }
    if (start === 'active' && planCommand.facing !== undefined) actor.facing = planCommand.facing;
    else if (start === 'active') faceNearestEnemy(candidate, actor);
    completeAction(candidate, actor, performed.recovery, command,
      options.deferEndCheck !== true);
    commitCandidate(state, candidate);
    for (let call = 0; call < rngCalls; call += 1) rng.nextU32();
    return { accepted: true, hpDamage: performed.hpDamage, eventsAdded: state.events.length - beforeEvents };
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
  state.inventory = { stacks: candidate.inventory.stacks.map((stack) => ({ ...stack })) };
  state.meridianByUnit.splice(0, state.meridianByUnit.length,
    ...structuredClone(candidate.meridianByUnit));
  state.rewardStats.martialUses.splice(0, state.rewardStats.martialUses.length,
    ...structuredClone(candidate.rewardStats.martialUses));
  state.rewardStats.movementActions.splice(0, state.rewardStats.movementActions.length,
    ...structuredClone(candidate.rewardStats.movementActions));
  state.rewardStats.fullCirculations.splice(0, state.rewardStats.fullCirculations.length,
    ...structuredClone(candidate.rewardStats.fullCirculations));
  state.openingOrder.splice(0, state.openingOrder.length, ...candidate.openingOrder);
  state.events.splice(0, state.events.length, ...candidate.events);
  state.acceptedCommands.splice(0, state.acceptedCommands.length, ...candidate.acceptedCommands);
}
