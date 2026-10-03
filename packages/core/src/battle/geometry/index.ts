import {
  HEX_DIRECTIONS, findHexPath, findReachableHexes, hexDistance, hexKey,
  lineOfSight, qinggongTier, type HexAim, type HexCoord, type HexDelivery, type HexDir, type HexPathQuery,
} from '../../hex';
import { resolveAreaCells } from '../formation';
import type { BattleMove, BattleState, BattleUnit } from '../types';

export type BattleGeometryReject = 'PATH_BLOCKED' | 'OUT_OF_RANGE' | 'NO_LOS' | 'INVALID_TARGET';
export interface BattleMoveQuery {
  readonly cells: readonly HexCoord[]; readonly targets: readonly BattleUnit[];
  readonly reason: BattleGeometryReject | null;
}

function relation(state: BattleState, actor: BattleUnit, unit: BattleUnit) {
  if (actor.id === unit.id) return 'self' as const;
  return state.setup.relations[actor.side][unit.side] ?? 'neutral';
}

function pathQuery(state: BattleState, actor: BattleUnit): HexPathQuery {
  return { cells: state.grid.cells, start: actor.pos,
    units: state.units.map((unit) => ({ ...unit.pos, id: unit.id, active: unit.active,
      relation: relation(state, actor, unit), exertsZoc: unit.active
        && relation(state, actor, unit) === 'hostile'
        && !unit.buffs.some((buff) => ['bf_xuanyun', 'bf_bingdong', 'bf_hunmi', 'bf_hunshui',
          'bf_dianxue', 'bf_kongju', 'bf_shouqin'].includes(buff.def)) })),
    mover: { id: actor.id, qgTier: qinggongTier(actor.qinggong),
      jump: actor.jump, move: actor.move,
      ignoreZoc: actor.buffs.some((buff) => buff.def === 'bf_dunzou') } };
}

export function queryReachable(state: BattleState, actorId: string) {
  const actor = state.units.find((unit) => unit.id === actorId && unit.active);
  return actor === undefined ? [] : findReachableHexes(pathQuery(state, actor));
}

export function queryPath(state: BattleState, actorId: string, destination: HexCoord) {
  const actor = state.units.find((unit) => unit.id === actorId && unit.active);
  return actor === undefined ? null
    : findHexPath({ ...pathQuery(state, actor), goal: destination, maxCost: actor.move });
}

export function directionBetween(from: HexCoord, to: HexCoord, preferred: HexDir = 0): HexDir {
  if (hexDistance(from, to) === 0) return preferred;
  const dq = to.q - from.q; const dr = to.r - from.r;
  const x = 2 * dq + dr;
  let bestDot = Number.MIN_SAFE_INTEGER; const candidates: HexDir[] = [];
  for (let direction = 0; direction < 6; direction += 1) {
    const vector = HEX_DIRECTIONS[direction]!; const fx = 2 * vector.q + vector.r;
    const dot = x * fx + 3 * dr * vector.r;
    if (dot > bestDot) { bestDot = dot; candidates.splice(0, candidates.length, direction as HexDir); }
    else if (dot === bestDot) candidates.push(direction as HexDir);
  }
  return candidates.sort((left, right) => {
    const dl = Math.min((left - preferred + 6) % 6, (preferred - left + 6) % 6);
    const dr = Math.min((right - preferred + 6) % 6, (preferred - right + 6) % 6);
    return dl - dr || left - right;
  })[0] ?? preferred;
}

function losCells(state: BattleState, moved?: { readonly id: string; readonly pos: HexCoord }) {
  const occupied = new Set(state.units.filter((unit) => unit.active && unit.id !== moved?.id)
    .map((unit) => hexKey(unit.pos)));
  if (moved !== undefined) occupied.add(hexKey(moved.pos));
  return state.grid.cells.map((cell) => ({ ...cell, occupied: occupied.has(hexKey(cell)) }));
}

function cellAt(state: BattleState, pos: HexCoord) {
  return state.grid.cells.find((cell) => cell.q === pos.q && cell.r === pos.r);
}

export function hasBattleLineOfSight(state: BattleState, actor: BattleUnit,
  target: HexCoord, delivery: HexDelivery): boolean {
  const from = cellAt(state, actor.pos); const to = cellAt(state, target);
  if (from === undefined || to === undefined) return false;
  const los = lineOfSight({ from: { ...from, occupied: true }, to: { ...to, occupied: true },
    delivery, cells: losCells(state) });
  return los.ok && los.partial <= 1;
}

function unitPosAt(unit: BattleUnit, actor: BattleUnit, from: HexCoord): HexCoord {
  return unit.id === actor.id ? from : unit.pos;
}

function visibleFrom(state: BattleState, observer: BattleUnit, unit: BattleUnit, from: HexCoord): boolean {
  if (!observer.active || !unit.active || unit.state === 'hidden') return false;
  if (hexDistance(from, unit.pos) > 12) return false;
  if (unit.buffs.some((buff) => buff.def === 'bf_yinshen')
    && !observer.buffs.some((buff) => buff.def === 'bf_tingfeng')) return false;
  const fromCell = cellAt(state, from); const to = cellAt(state, unit.pos);
  if (fromCell === undefined || to === undefined) return false;
  const los = lineOfSight({ from: { ...fromCell, occupied: true }, to: { ...to, occupied: true },
    delivery: 'ranged', cells: losCells(state, { id: observer.id, pos: from }) });
  return los.ok && los.partial <= 1;
}

export function isBattleUnitVisible(
  state: BattleState, observer: BattleUnit, unit: BattleUnit,
): boolean {
  return visibleFrom(state, observer, unit, observer.pos);
}

function relationAllowed(state: BattleState, actor: BattleUnit, move: BattleMove, unit: BattleUnit): boolean {
  if (!unit.active) return false;
  const side = relation(state, actor, unit);
  if (move.target === 'self') return side === 'self';
  if (move.target === 'ally') return side === 'friendly';
  if (move.target === 'enemy' || move.target === 'tile') return side === 'hostile';
  return move.target === 'any';
}

function selectableTarget(state: BattleState, actor: BattleUnit, move: BattleMove, unit: BattleUnit): boolean {
  const actorHearsHidden = actor.buffs.some((buff) => buff.def === 'bf_tingfeng');
  const concealed = actor.id !== unit.id && (unit.state === 'hidden'
    || unit.buffs.some((buff) => buff.def === 'bf_yinshen') && !actorHearsHidden);
  const feigning = unit.buffs.some((buff) => buff.def === 'bf_zhasi');
  return !concealed && !feigning && move.target !== 'tile'
    && relationAllowed(state, actor, move, unit);
}

function affectedTarget(state: BattleState, actor: BattleUnit, move: BattleMove, unit: BattleUnit): boolean {
  if (!unit.active || unit.buffs.some((buff) => buff.def === 'bf_zhasi')) return false;
  const side = relation(state, actor, unit);
  if (move.friendlyFire === 'all') return true;
  if (move.friendlyFire === 'allies') return side === 'self' || side === 'friendly';
  if (move.shape.tpl === 'aoe_self') return side === 'self';
  if (move.shape.tpl === 'aoe_allies' || move.shape.tpl === 'aoe_ally_all') {
    return side === 'self' || side === 'friendly';
  }
  if (move.shape.tpl === 'aoe_field' && move.shape.side === 'all') return true;
  if (move.shape.tpl === 'aoe_single') return relationAllowed(state, actor, move, unit);
  return side === 'hostile';
}

function effectiveRange(state: BattleState, from: HexCoord, target: HexCoord, move: BattleMove): number {
  if (move.delivery === 'melee' || move.delivery === 'sonic' || move.delivery === 'self') {
    return move.range.max;
  }
  const fromCell = cellAt(state, from); const toCell = cellAt(state, target);
  if (fromCell === undefined || toCell === undefined) return move.range.max;
  return move.range.max + Math.max(0, Math.min(2, (fromCell.height - toCell.height) >> 1));
}

export function validateMoveTarget(state: BattleState, actor: BattleUnit, move: BattleMove,
  target: string | HexCoord, from = actor.pos): BattleGeometryReject | null {
  const targetUnit = typeof target === 'string' ? state.units.find((unit) => unit.id === target) : undefined;
  const targetPos = targetUnit?.id === actor.id ? from
    : targetUnit?.pos ?? (typeof target === 'string' ? undefined : target);
  if (targetPos === undefined || (targetUnit !== undefined && !selectableTarget(state, actor, move, targetUnit))
    || (targetUnit === undefined && move.target !== 'tile')) return 'INVALID_TARGET';
  const fromCell = cellAt(state, from); const toCell = cellAt(state, targetPos);
  if (fromCell === undefined || toCell === undefined) return 'INVALID_TARGET';
  const distance = hexDistance(from, targetPos);
  if (distance < move.range.min || distance > effectiveRange(state, from, targetPos, move)) {
    return 'OUT_OF_RANGE';
  }
  if (targetUnit !== undefined && targetUnit.id !== actor.id
    && !visibleFrom(state, actor, targetUnit, from)) return 'NO_LOS';
  const cells = losCells(state, { id: actor.id, pos: from });
  const los = lineOfSight({ from: { ...fromCell, occupied: true },
    to: { ...toCell, occupied: targetUnit !== undefined }, delivery: move.delivery,
    hTol: move.hTol, cells: move.shape.tpl === 'aoe_bolt'
      ? cells.map((cell) => ({ ...cell, occupied: false })) : cells });
  return los.ok && (targetUnit === undefined || los.partial <= 1) ? null : 'NO_LOS';
}

export function queryMoveAt(state: BattleState, actorId: string, moveId: string,
  target: string | HexCoord, input: { readonly from?: HexCoord; readonly aim?: HexAim } = {}): BattleMoveQuery {
  const actor = state.units.find((unit) => unit.id === actorId && unit.active);
  const move = actor?.moves.find((candidate) => candidate.id === moveId);
  if (actor === undefined || move === undefined) return { cells: [], targets: [], reason: 'INVALID_TARGET' };
  const from = input.from ?? actor.pos;
  const anchorUnit = typeof target === 'string' ? state.units.find((unit) => unit.id === target) : undefined;
  const anchor = anchorUnit?.id === actor.id ? from
    : anchorUnit?.pos ?? (typeof target === 'string' ? undefined : target);
  if (anchor === undefined) return { cells: [], targets: [], reason: 'INVALID_TARGET' };
  const reason = validateMoveTarget(state, actor, move, target, from);
  let areaCells: HexCoord[];
  try {
    areaCells = resolveAreaCells(move.shape, { origin: from, anchor,
      ...(input.aim === undefined ? {} : { aim: input.aim }), available: state.grid.cells });
  } catch (error) {
    if (error instanceof RangeError && error.message === 'HEX_AIM_REQUIRED') {
      return { cells: [], targets: [], reason: 'INVALID_TARGET' };
    }
    throw error;
  }
  const fromOrigin = move.shape.tpl === 'aoe_self' || move.shape.tpl === 'aoe_around'
    || move.shape.tpl === 'aoe_line' || move.shape.tpl === 'aoe_bolt'
    || move.shape.tpl === 'aoe_allies' || move.shape.tpl === 'aoe_cone';
  const origin = cellAt(state, fromOrigin ? from : anchor);
  const cells = areaCells.filter((cell) => {
    const gridCell = cellAt(state, cell);
    return origin !== undefined && gridCell !== undefined
      && Math.abs(gridCell.height - origin.height) <= move.hTol;
  });
  if (reason !== null) return { cells, targets: [], reason };
  const keys = new Set(cells.map(hexKey));
  let targets = state.units.filter((unit) => keys.has(hexKey(unitPosAt(unit, actor, from)))
    && (move.shape.tpl === 'aoe_bolt'
      ? unit.active && unit.id !== actor.id
        && !unit.buffs.some((buff) => buff.def === 'bf_zhasi')
      : affectedTarget(state, actor, move, unit)))
    .sort((left, right) => hexDistance(from, unitPosAt(left, actor, from))
      - hexDistance(from, unitPosAt(right, actor, from))
      || left.unitIndex - right.unitIndex);
  if (move.shape.tpl === 'aoe_bolt') targets = targets.slice(0, 1);
  const allowsEmpty = move.target === 'tile';
  if (targets.length === 0 && !allowsEmpty) {
    return { cells, targets: [], reason: 'INVALID_TARGET' };
  }
  return { cells, targets, reason: null };
}

export function queryLegalTargets(state: BattleState, actorId: string, moveId: string,
  from?: HexCoord): readonly BattleUnit[] {
  const actor = state.units.find((unit) => unit.id === actorId);
  const move = actor?.moves.find((candidate) => candidate.id === moveId);
  if (actor === undefined || move === undefined) return [];
  return state.units.filter((unit) => selectableTarget(state, actor, move, unit)
    && validateMoveTarget(state, actor, move, unit.id, from) === null)
    .sort((left, right) => hexDistance(from ?? actor.pos, unitPosAt(left, actor, from ?? actor.pos))
      - hexDistance(from ?? actor.pos, unitPosAt(right, actor, from ?? actor.pos))
      || left.unitIndex - right.unitIndex);
}
