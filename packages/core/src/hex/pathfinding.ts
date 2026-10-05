import { HEX_DIRECTIONS, hexDistance, hexKey, type HexCoord } from './index';

export interface HexPathCell extends HexCoord {
  readonly height: number; readonly moveCost: number; readonly standable: boolean;
  readonly narrow: boolean; readonly dangerous: boolean;
}
export interface HexPathUnit extends HexCoord {
  readonly id: string; readonly relation: 'self' | 'friendly' | 'hostile' | 'neutral';
  readonly active: boolean; readonly exertsZoc: boolean;
}
export interface HexMover {
  readonly id: string; readonly qgTier: number; readonly jump: number; readonly move: number;
  readonly ignoreZoc?: boolean;
}
export interface HexPathQuery {
  readonly cells: readonly HexPathCell[]; readonly units: readonly HexPathUnit[];
  readonly mover: HexMover; readonly start: HexCoord; readonly goal?: HexCoord; readonly maxCost?: number;
}
export interface HexPathResult {
  readonly path: readonly HexCoord[]; readonly cost: number;
  readonly actionCount: number; readonly dangerCount: number;
}
export interface HexReachableCell extends HexPathResult { readonly pos: HexCoord }

export function qinggongTier(qinggong: number): number {
  return qinggong >= 200 ? 5 : qinggong >= 140 ? 4 : qinggong >= 90 ? 3
    : qinggong >= 50 ? 2 : qinggong >= 20 ? 1 : 0;
}

export function movementPoints(qinggong: number, input: {
  readonly moveSkillFlat?: number; readonly buffMoveFlat?: number;
  readonly heavyArmorPenalty?: number; readonly fatiguePenalty?: number;
  readonly meridianMoveDelta?: number;
} = {}): number {
  const tier = qinggongTier(qinggong);
  const threshold = [0, 20, 50, 90, 140, 200][tier]!;
  const withinTier = qinggong - threshold >= 30 ? 1 : 0;
  return Math.max(1, Math.min(10, 3 + tier + withinTier + (input.moveSkillFlat ?? 0)
    + (input.buffMoveFlat ?? 0) - (input.heavyArmorPenalty ?? 0)
    - (input.fatiguePenalty ?? 0) + (input.meridianMoveDelta ?? 0)));
}

export function jumpDistance(qinggong: number, flat = 0): number {
  return Math.max(0, Math.min(6, qinggongTier(qinggong) + flat));
}

function occupiedAt(units: readonly HexPathUnit[], pos: HexCoord, moverId: string): HexPathUnit | undefined {
  for (let index = 0; index < units.length; index += 1) {
    const unit = units[index]!;
    if (unit.active && unit.id !== moverId && unit.q === pos.q && unit.r === pos.r) return unit;
  }
  return undefined;
}

function evaluateStepCost(query: HexPathQuery, from: HexPathCell, to: HexPathCell): number {
  if (!to.standable || hexDistance(from, to) !== 1) {
    return -1;
  }
  const occupant = occupiedAt(query.units, to, query.mover.id);
  if (occupant !== undefined && (occupant.relation !== 'friendly' || to.narrow)) {
    return -1;
  }
  const deltaHeight = to.height - from.height;
  let actionCost = 0;
  if (deltaHeight === 1 && query.mover.qgTier === 0) actionCost = 2;
  else if (deltaHeight > query.mover.jump) {
    return -1;
  } else if (deltaHeight > 0) actionCost = (deltaHeight + 1) >> 1;
  if (-deltaHeight > 2 + query.mover.jump + 3) {
    return -1;
  }
  let zocCount = 0;
  for (const unit of query.units) {
    if (unit.active && unit.exertsZoc && unit.relation === 'hostile' && hexDistance(from, unit) === 1) {
      zocCount += 1;
    }
  }
  const zocCost = query.mover.ignoreZoc === true || query.mover.qgTier >= 5 ? 0
    : Math.max(0, Math.min(2, zocCount) - (query.mover.qgTier >= 3 ? 1 : 0));
  return Math.max(1, to.moveCost) + actionCost + zocCost;
}

/** The single edge authority shared by search, preview and command commit. */
export function evaluateStep(query: HexPathQuery, from: HexPathCell, to: HexPathCell): {
  readonly allowed: boolean; readonly canStop: boolean; readonly cost: number; readonly dangerous: boolean;
} {
  const cost = evaluateStepCost(query, from, to);
  return { allowed: cost >= 0, canStop: cost >= 0
    && occupiedAt(query.units, to, query.mover.id) === undefined,
  cost: Math.max(0, cost), dangerous: to.dangerous };
}

interface Workspace {
  readonly cells: HexPathCell[]; readonly indexByKey: Map<string, number>;
  readonly neighbors: number[];
  readonly cost: number[]; readonly actions: number[]; readonly dangers: number[];
  readonly parent: number[]; readonly heap: number[]; readonly heapPosition: number[];
  readonly nodeSequence: number[];
  readonly pathLength: number[]; readonly pathRank: number[];
  sequence: number; pathStride: number;
}

const WORKSPACE_POOL: Workspace[] = [];

function acquireWorkspace(query: HexPathQuery): Workspace {
  const ws = WORKSPACE_POOL.pop() ?? { cells: [], indexByKey: new Map(), neighbors: [], cost: [],
    actions: [], dangers: [], parent: [], heap: [], heapPosition: [], nodeSequence: [],
    pathLength: [], pathRank: [], sequence: 0, pathStride: 0 };
  const cells = ws.cells; cells.length = query.cells.length;
  for (let index = 0; index < query.cells.length; index += 1) cells[index] = query.cells[index]!;
  cells.sort((a, b) => a.r - b.r || a.q - b.q); ws.indexByKey.clear();
  for (let index = 0; index < cells.length; index += 1) ws.indexByKey.set(hexKey(cells[index]!), index);
  const count = cells.length; ws.neighbors.length = count * 6;
  for (let index = 0; index < count; index += 1) {
    ws.cost[index] = Number.MAX_SAFE_INTEGER; ws.actions[index] = Number.MAX_SAFE_INTEGER;
    ws.dangers[index] = Number.MAX_SAFE_INTEGER; ws.parent[index] = -1;
    ws.heapPosition[index] = -1; ws.nodeSequence[index] = -1; ws.pathLength[index] = 0;
    const cell = cells[index]!;
    for (let direction = 0; direction < 6; direction += 1) {
      const step = HEX_DIRECTIONS[direction]!;
      ws.neighbors[index * 6 + direction] = ws.indexByKey.get(
        `${cell.q + step.q},${cell.r + step.r}`,
      ) ?? -1;
    }
  }
  ws.cost.length = count; ws.actions.length = count; ws.dangers.length = count;
  ws.parent.length = count; ws.heapPosition.length = count; ws.nodeSequence.length = count;
  ws.pathLength.length = count; ws.pathRank.length = count * count; ws.pathStride = count;
  ws.heap.length = 0; ws.sequence = 0;
  return ws;
}

function releaseWorkspace(ws: Workspace): void { WORKSPACE_POOL.push(ws); }

function pathIndices(ws: Workspace, index: number): number[] {
  const result: number[] = [];
  for (let cursor = index; cursor >= 0; cursor = ws.parent[cursor]!) result.push(cursor);
  return result.reverse();
}

function pathCell(ws: Workspace, node: number, pathIndex: number): HexPathCell {
  return ws.cells[ws.pathRank[node * ws.pathStride + pathIndex]!]!;
}

function comparePaths(ws: Workspace, leftIndex: number, rightIndex: number): number {
  const leftCount = ws.pathLength[leftIndex]!; const rightCount = ws.pathLength[rightIndex]!;
  const count = Math.min(leftCount, rightCount);
  for (let index = 0; index < count; index += 1) {
    const a = pathCell(ws, leftIndex, index); const b = pathCell(ws, rightIndex, index);
    const order = a.r - b.r || a.q - b.q;
    if (order !== 0) return order;
  }
  return leftCount - rightCount;
}

function comparePathRank(ws: Workspace, leftParent: number, rightIndex: number): number {
  const leftCount = ws.pathLength[leftParent]! + 1; const rightCount = ws.pathLength[rightIndex]!;
  const count = Math.min(leftCount, rightCount);
  for (let index = 0; index < count; index += 1) {
    const a = index < leftCount - 1 ? pathCell(ws, leftParent, index) : ws.cells[rightIndex]!;
    const b = pathCell(ws, rightIndex, index); const order = a.r - b.r || a.q - b.q;
    if (order !== 0) return order;
  }
  return leftCount - rightCount;
}

function writePath(ws: Workspace, index: number, parent: number): void {
  const offset = index * ws.pathStride;
  if (parent < 0) { ws.pathRank[offset] = index; ws.pathLength[index] = 1; return; }
  const parentOffset = parent * ws.pathStride; const count = ws.pathLength[parent]!;
  for (let pathIndex = 0; pathIndex < count; pathIndex += 1) {
    ws.pathRank[offset + pathIndex] = ws.pathRank[parentOffset + pathIndex]!;
  }
  ws.pathRank[offset + count] = index; ws.pathLength[index] = count + 1;
}

function better(ws: Workspace, index: number, cost: number, actions: number, dangers: number,
  parent: number): boolean {
  return cost < ws.cost[index]! || (cost === ws.cost[index] && (actions < ws.actions[index]!
    || (actions === ws.actions[index] && (dangers < ws.dangers[index]!
    || (dangers === ws.dangers[index] && comparePathRank(ws, parent, index) < 0)))));
}

function heapCompare(ws: Workspace, left: number, right: number, goal?: HexCoord): number {
  const a = ws.heap[left]!; const b = ws.heap[right]!;
  const af = ws.cost[a]! + (goal === undefined ? 0 : hexDistance(ws.cells[a]!, goal));
  const bf = ws.cost[b]! + (goal === undefined ? 0 : hexDistance(ws.cells[b]!, goal));
  return af - bf || ws.actions[a]! - ws.actions[b]! || ws.dangers[a]! - ws.dangers[b]!
    || comparePaths(ws, a, b)
    || ws.cells[a]!.r - ws.cells[b]!.r || ws.cells[a]!.q - ws.cells[b]!.q
    || ws.nodeSequence[a]! - ws.nodeSequence[b]!;
}

function heapSwap(ws: Workspace, left: number, right: number): void {
  const value = ws.heap[left]!; ws.heap[left] = ws.heap[right]!; ws.heap[right] = value;
  ws.heapPosition[ws.heap[left]!] = left; ws.heapPosition[ws.heap[right]!] = right;
}

function heapPushOrDecrease(ws: Workspace, value: number, goal?: HexCoord): void {
  let index = ws.heapPosition[value]!; ws.nodeSequence[value] = ws.sequence++;
  if (index < 0) { index = ws.heap.length; ws.heap.push(value); ws.heapPosition[value] = index; }
  while (index > 0) {
    const parent = (index - 1) >> 1;
    if (heapCompare(ws, parent, index, goal) <= 0) break;
    heapSwap(ws, parent, index); index = parent;
  }
}

function heapPop(ws: Workspace, goal?: HexCoord): number {
  const result = ws.heap[0]!; const tail = ws.heap.pop()!; ws.heapPosition[result] = -1;
  if (ws.heap.length > 0) {
    ws.heap[0] = tail; ws.heapPosition[tail] = 0; let cursor = 0;
    while (true) {
      const left = cursor * 2 + 1; if (left >= ws.heap.length) break;
      const right = left + 1;
      const child = right < ws.heap.length && heapCompare(ws, right, left, goal) < 0 ? right : left;
      if (heapCompare(ws, cursor, child, goal) <= 0) break;
      heapSwap(ws, cursor, child); cursor = child;
    }
  }
  return result;
}

function search(query: HexPathQuery): Workspace {
  const ws = acquireWorkspace(query);
  const start = ws.indexByKey.get(hexKey(query.start));
  if (start === undefined) { releaseWorkspace(ws); throw new RangeError('PATH_START_OUTSIDE_GRID'); }
  ws.cost[start] = 0; ws.actions[start] = 0; ws.dangers[start] = 0;
  writePath(ws, start, -1);
  heapPushOrDecrease(ws, start, query.goal);
  const limit = query.maxCost ?? Number.MAX_SAFE_INTEGER;
  while (ws.heap.length > 0) {
    const currentIndex = heapPop(ws, query.goal); const current = ws.cells[currentIndex]!;
    if (ws.cost[currentIndex]! > limit) continue;
    for (let direction = 0; direction < 6; direction += 1) {
      const next = ws.neighbors[currentIndex * 6 + direction]!; if (next < 0) continue;
      const edgeCost = evaluateStepCost(query, current, ws.cells[next]!); if (edgeCost < 0) continue;
      const cost = ws.cost[currentIndex]! + edgeCost;
      if (cost > limit) continue;
      const actions = ws.actions[currentIndex]! + 1;
      const dangers = ws.dangers[currentIndex]! + Number(ws.cells[next]!.dangerous);
      if (!better(ws, next, cost, actions, dangers, currentIndex)) continue;
      ws.cost[next] = cost; ws.actions[next] = actions; ws.dangers[next] = dangers;
      ws.parent[next] = currentIndex; writePath(ws, next, currentIndex);
      heapPushOrDecrease(ws, next, query.goal);
    }
  }
  return ws;
}

function resultFrom(ws: Workspace, index: number): HexPathResult {
  const indices = pathIndices(ws, index);
  return { path: indices.map((cellIndex) => {
    const cell = ws.cells[cellIndex]!; return { q: cell.q, r: cell.r };
  }), cost: ws.cost[index]!, actionCount: ws.actions[index]!, dangerCount: ws.dangers[index]! };
}

export function findHexPath(query: HexPathQuery & { readonly goal: HexCoord }): HexPathResult | null {
  if (occupiedAt(query.units, query.goal, query.mover.id) !== undefined) return null;
  const ws = search(query); const index = ws.indexByKey.get(hexKey(query.goal));
  const result = index === undefined || ws.cost[index] === Number.MAX_SAFE_INTEGER
    ? null : resultFrom(ws, index);
  releaseWorkspace(ws); return result;
}

export function findReachableHexes(query: HexPathQuery): HexReachableCell[] {
  const base: HexPathQuery = { cells: query.cells, units: query.units, mover: query.mover,
    start: query.start, ...(query.maxCost === undefined ? {} : { maxCost: query.maxCost }) };
  const ws = search({ ...base, maxCost: query.maxCost ?? query.mover.move });
  const results: HexReachableCell[] = [];
  for (let index = 0; index < ws.cells.length; index += 1) {
    const cell = ws.cells[index]!;
    if (ws.cost[index] === Number.MAX_SAFE_INTEGER
      || occupiedAt(query.units, cell, query.mover.id) !== undefined) continue;
    results.push({ pos: { q: cell.q, r: cell.r }, ...resultFrom(ws, index) });
  }
  releaseWorkspace(ws);
  return results.sort((a, b) => a.cost - b.cost || a.pos.r - b.pos.r || a.pos.q - b.pos.q);
}
