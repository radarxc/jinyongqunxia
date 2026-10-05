import {
  HEX_DIRECTIONS, findHexPath, findReachableHexes, hexDistance, hexKey,
  lineOfSight, qinggongTier, type HexAim, type HexCoord, type HexDelivery, type HexDir, type HexPathQuery,
} from '../../hex';
import { clampInt, mulDivFloor } from '@tianshu/shared';
import { hasGuardStance } from '../../buff';
import { resolveAreaCells } from '../formation';
import type { AttackDirection } from '../damage';
import type { BattleGridCell, BattleMove, BattleState, BattleUnit } from '../types';

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
  if (actor !== undefined && actor.pos.q === destination.q && actor.pos.r === destination.r) {
    if (state.units.some((unit) => unit.active && unit.id !== actor.id
      && unit.pos.q === destination.q && unit.pos.r === destination.r)) return null;
    if (!state.grid.cells.some((cell) => cell.q === destination.q && cell.r === destination.r))
      throw new RangeError('PATH_START_OUTSIDE_GRID');
    return { path: [{ ...actor.pos }], cost: 0, actionCount: 0, dangerCount: 0 };
  }
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

export interface KnockbackResult {
  readonly from: HexCoord; readonly to: HexCoord; readonly cellsMoved: number;
  readonly stoppedBy: 'distance' | 'edge' | 'terrain' | 'uphill' | 'unit'
    | 'fall' | 'water' | 'void' | 'ringOut';
  readonly collisionUnitId?: string; readonly fallHeight?: number; readonly landMulBp?: number;
}

/** Pure, cell-by-cell displacement; edge metadata distinguishes walls, hazards and ring-outs. */
export function queryKnockback(state: BattleState, source: BattleUnit,
  target: BattleUnit, cells: number): KnockbackResult {
  const direction = directionBetween(source.pos, target.pos, target.facing);
  const delta = HEX_DIRECTIONS[direction]!; const from = { ...target.pos };
  let to = from; let stoppedBy: KnockbackResult['stoppedBy'] = 'distance';
  for (let step = 0; step < cells; step += 1) {
    const next = { q: to.q + delta.q, r: to.r + delta.r };
    const cell = cellAt(state, next);
    if (cell === undefined) {
      const current = cellAt(state, to);
      const exit = current?.displacementExits?.find((entry) => entry.direction === direction);
      if (state.setup.rules.ringOut) stoppedBy = 'ringOut';
      else if (exit?.kind === 'void') stoppedBy = 'void';
      else if (exit?.kind === 'water') stoppedBy = 'water';
      else if (exit?.kind === 'fall') stoppedBy = 'fall';
      else stoppedBy = 'edge';
      return { from, to, cellsMoved: hexDistance(from, to), stoppedBy,
        ...(exit?.landingHeight === undefined ? {} : { fallHeight: current!.height - exit.landingHeight }),
        ...(exit?.landMulBp === undefined ? {} : { landMulBp: exit.landMulBp }) };
    }
    const current = cellAt(state, to)!;
    if (cell.height - current.height >= 2) { stoppedBy = 'uphill'; break; }
    if (!cell.standable) { stoppedBy = 'terrain'; break; }
    const occupied = state.units.find((unit) => unit.active && unit.id !== target.id
      && unit.pos.q === next.q && unit.pos.r === next.r);
    if (occupied !== undefined) return { from, to, cellsMoved: hexDistance(from, to),
      stoppedBy: 'unit', collisionUnitId: occupied.id };
    to = next;
    if (current.height - cell.height > 1 + target.jump) return { from, to,
      cellsMoved: hexDistance(from, to), stoppedBy: 'fall', fallHeight: current.height - cell.height,
      landMulBp: cell.landMulBp ?? 10_000 };
  }
  return { from, to, cellsMoved: hexDistance(from, to), stoppedBy };
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

function battleLineOfSight(state: BattleState, actor: BattleUnit,
  target: HexCoord, delivery: HexDelivery) {
  const from = cellAt(state, actor.pos); const to = cellAt(state, target);
  if (from === undefined || to === undefined) return null;
  return lineOfSight({ from: { ...from, occupied: true }, to: { ...to, occupied: true },
    delivery, cells: losCells(state) });
}

export function hasBattleLineOfSight(state: BattleState, actor: BattleUnit,
  target: HexCoord, delivery: HexDelivery): boolean {
  const los = battleLineOfSight(state, actor, target, delivery);
  return los !== null && los.ok && los.partial <= 1;
}

const DIRECTION_BP: Readonly<Record<AttackDirection, number>> =
  { front: 10_000, side: 11_000, back: 13_000 };

function attackDirection(sourceDirection: HexDir, targetFacing: HexDir): AttackDirection {
  const delta = (sourceDirection - targetFacing + 6) % 6;
  if (delta === 3) return 'back';
  return delta === 2 || delta === 4 ? 'side' : 'front';
}

function coverFor(cell: BattleGridCell, delivery: HexDelivery, sourceDirection: HexDir) {
  const cover = cell.cover;
  return cover !== null && cover.vs.includes(delivery as 'projectile' | 'ranged')
    && (cover.sourceDirs === undefined || cover.sourceDirs.includes(sourceDirection)) ? cover : null;
}

export interface BattleDamageGeometry {
  readonly sourceDirection: HexDir; readonly direction: AttackDirection; readonly heightDelta: number;
  readonly heightHit: number; readonly heightAddBp: number; readonly coverHit: number;
  readonly coverDamageBp: number; readonly losHitPenalty: number; readonly hitAdd: number;
  readonly terrainAddBp: number; readonly positionBp: number; readonly evadeRatingDelta: number;
  readonly lineOfSight: NonNullable<ReturnType<typeof battleLineOfSight>>;
}

/** Pure damage geometry shared by settlement, prediction and presentation. */
export function queryDamageGeometry(state: BattleState, actor: BattleUnit, target: BattleUnit,
  move: BattleMove): BattleDamageGeometry {
  const attackerCell = cellAt(state, actor.pos); const targetCell = cellAt(state, target.pos);
  if (attackerCell === undefined || targetCell === undefined) throw new RangeError('INVALID_TARGET');
  const sourceDirection = directionBetween(target.pos, actor.pos, target.facing);
  const direction = move.delivery === 'melee' && hasGuardStance(target.buffs)
    ? 'front' : attackDirection(sourceDirection, target.facing);
  const heightDelta = attackerCell.height - targetCell.height;
  const heightHit = clampInt(heightDelta * 4, -12, 12);
  const heightAddBp = move.delivery === 'melee'
    ? clampInt(heightDelta * 500, -1_000, 1_000)
    : move.delivery === 'ranged' || move.delivery === 'projectile'
      ? clampInt(heightDelta * 400, -1_200, 1_600) : 0;
  const cover = coverFor(targetCell, move.delivery, sourceDirection);
  const line = battleLineOfSight(state, actor, target.pos, move.delivery);
  if (line === null) throw new RangeError('INVALID_TARGET');
  const coverHit = cover?.hitByDelivery?.[move.delivery as 'projectile' | 'ranged']
    ?? cover?.hit ?? 0;
  const coverDamageBp = cover?.damageBp ?? 0;
  const subTypeDamageBp = move.subType === undefined ? 0
    : attackerCell.terrainDealtBySubTypeBp?.[move.subType] ?? 0;
  const terrainAddBp = clampInt(attackerCell.terrainDealtBp + subTypeDamageBp
    + targetCell.terrainTakenBp + coverDamageBp, -3_000, 3_000);
  const positionBp = clampInt(mulDivFloor(DIRECTION_BP[direction],
    (10_000 + heightAddBp) * (10_000 + terrainAddBp), 100_000_000), 5_000, 20_000);
  return { sourceDirection, direction, heightDelta, heightHit, heightAddBp, coverHit, coverDamageBp,
    losHitPenalty: line.hitPenalty, hitAdd: heightHit + coverHit + line.hitPenalty,
    terrainAddBp, positionBp, evadeRatingDelta: 0, lineOfSight: line };
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
