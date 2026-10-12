import { HEX_DIRECTIONS, hexDistance, hexLineBetween, type HexCoord } from '../../hex';
import {
  EXPLORE_DEEP_WATER,
  EXPLORE_GAP,
  EXPLORE_OPAQUE,
  EXPLORE_STANDABLE,
  EXPLORE_VALID,
  exploreNodeAt,
  exploreNodeQ,
  exploreNodeR,
  type ExploreGraph,
} from './graph';
import { ExploreMinHeap } from './heap';

export interface ExplorePath {
  readonly path: Int32Array;
  readonly cost: number;
}
export type ExploreOccupied = ReadonlySet<number> | Uint8Array;
export type ExploreEdgeVisitor = (target: number, cost: number) => void;

interface SearchWorkspace {
  generation: number;
  readonly seen: Uint32Array;
  readonly closed: Uint32Array;
  readonly g: Int32Array;
  readonly f: Int32Array;
  readonly h: Int32Array;
  readonly parent: Int32Array;
  heap: ExploreMinHeap;
}

const WORKSPACES = new WeakMap<ExploreGraph, SearchWorkspace>();

function workspace(graph: ExploreGraph): SearchWorkspace {
  const known = WORKSPACES.get(graph);
  if (known) return known;
  const g = new Int32Array(graph.nodeCount);
  const f = new Int32Array(graph.nodeCount);
  const h = new Int32Array(graph.nodeCount);
  const result: SearchWorkspace = {
    generation: 0,
    seen: new Uint32Array(graph.nodeCount),
    closed: new Uint32Array(graph.nodeCount),
    g,
    f,
    h,
    parent: new Int32Array(graph.nodeCount),
    heap: undefined as never,
  };
  result.heap = new ExploreMinHeap(graph, f, h);
  WORKSPACES.set(graph, result);
  return result;
}

function nextGeneration(ws: SearchWorkspace): number {
  if (ws.generation === 4_294_967_295) {
    ws.seen.fill(0);
    ws.closed.fill(0);
    ws.generation = 1;
  } else ws.generation += 1;
  ws.heap.clear();
  return ws.generation;
}

function occupiedAt(occupied: ExploreOccupied, node: number): boolean {
  return occupied instanceof Uint8Array ? occupied[node] !== 0 : occupied.has(node);
}

function isStandable(graph: ExploreGraph, node: number): boolean {
  return (
    node >= 0 &&
    node < graph.nodeCount &&
    (graph.flags[node]! & (EXPLORE_VALID | EXPLORE_STANDABLE)) ===
      (EXPLORE_VALID | EXPLORE_STANDABLE)
  );
}

function rampAllows(graph: ExploreGraph, from: number, to: number, direction: number): boolean {
  if (graph.heights[from] === graph.heights[to]) return true;
  const reverse = (direction + 3) % 6;
  return (graph.ramps[from]! & (1 << direction)) !== 0 || (graph.ramps[to]! & (1 << reverse)) !== 0;
}

function directStepCost(graph: ExploreGraph, from: number, to: number, direction: number): number {
  if (!isStandable(graph, to)) return -1;
  if (rampAllows(graph, from, to, direction)) return Math.max(1, graph.moveCosts[to]!);
  const delta = graph.heights[to]! - graph.heights[from]!;
  let actionCost = 0;
  if (delta === 1 && graph.qgTier === 0) actionCost = 2;
  else if (delta > graph.qgTier) return -1;
  else if (delta > 0) actionCost = (delta + 1) >> 1;
  if (-delta > graph.qgTier + 5) return -1;
  return Math.max(1, graph.moveCosts[to]!) + actionCost;
}

/** Enumerates exactly the old regionEdges static edge set in HEX_DIRECTIONS order. */
export function forEachExploreEdge(
  graph: ExploreGraph,
  from: number,
  visit: ExploreEdgeVisitor,
): void {
  if (from < 0 || from >= graph.nodeCount || (graph.flags[from]! & EXPLORE_VALID) === 0) return;
  const q = exploreNodeQ(graph, from);
  const r = exploreNodeR(graph, from);
  for (let direction = 0; direction < 6; direction += 1) {
    const step = HEX_DIRECTIONS[direction]!;
    const adjacent = exploreNodeAt(graph, q + step.q, r + step.r);
    if (adjacent < 0 || (graph.flags[adjacent]! & EXPLORE_VALID) === 0) continue;
    const walkCost = directStepCost(graph, from, adjacent, direction);
    if (walkCost >= 0) visit(adjacent, walkCost);
    if (
      isStandable(graph, adjacent) ||
      graph.qgTier === 0 ||
      (graph.flags[adjacent]! & EXPLORE_GAP) === 0
    )
      continue;
    for (let width = 1; width <= graph.qgTier; width += 1) {
      const landing = exploreNodeAt(graph, q + step.q * (width + 1), r + step.r * (width + 1));
      if (landing < 0 || (graph.flags[landing]! & EXPLORE_VALID) === 0) break;
      if (!isStandable(graph, landing)) {
        if ((graph.flags[landing]! & EXPLORE_GAP) === 0) break;
        continue;
      }
      const deltaUp = Math.max(0, graph.heights[landing]! - graph.heights[from]!);
      const drop = Math.max(0, graph.heights[from]! - graph.heights[landing]!);
      if (width + deltaUp > graph.qgTier + 1 || drop > graph.qgTier + 5) break;
      visit(landing, width + 1 + ((deltaUp + 1) >> 1));
      break;
    }
  }
}

function nodeDistance(graph: ExploreGraph, node: number, target: HexCoord): number {
  return hexDistance({ q: exploreNodeQ(graph, node), r: exploreNodeR(graph, node) }, target);
}

function hasLineOfSight(graph: ExploreGraph, node: number, target: HexCoord): boolean {
  const from = { q: exploreNodeQ(graph, node), r: exploreNodeR(graph, node) };
  for (const cell of hexLineBetween(from, target)) {
    const between = exploreNodeAt(graph, cell.q, cell.r);
    if (
      between < 0 ||
      (graph.flags[between]! & EXPLORE_VALID) === 0 ||
      (graph.flags[between]! & EXPLORE_OPAQUE) !== 0
    )
      return false;
  }
  return true;
}

function buildPath(ws: SearchWorkspace, generation: number, goal: number): Int32Array {
  let length = 0;
  for (let node = goal; node >= 0 && ws.seen[node] === generation; node = ws.parent[node]!)
    length += 1;
  const path = new Int32Array(length);
  let cursor = goal;
  for (let index = length - 1; index >= 0; index -= 1) {
    path[index] = cursor;
    cursor = ws.parent[cursor]!;
  }
  return path;
}

function deepWaterAllowed(graph: ExploreGraph, path: Int32Array): boolean {
  if (graph.qgTier !== 3 && graph.qgTier !== 4) return true;
  const limit = graph.qgTier === 3 ? 3 : 6;
  let run = 0;
  for (const node of path) {
    run = (graph.flags[node]! & EXPLORE_DEEP_WATER) !== 0 ? run + 1 : 0;
    if (run > limit) return false;
  }
  return true;
}

function search(
  graph: ExploreGraph,
  start: number,
  occupied: ExploreOccupied,
  heuristic: (node: number) => number,
  goal: (node: number) => boolean,
): ExplorePath | null {
  if (!isStandable(graph, start)) return null;
  const ws = workspace(graph);
  const generation = nextGeneration(ws);
  ws.seen[start] = generation;
  ws.g[start] = 0;
  ws.h[start] = heuristic(start);
  ws.f[start] = ws.h[start]!;
  ws.parent[start] = -1;
  ws.heap.pushOrDecrease(start);
  while (ws.heap.size > 0) {
    const current = ws.heap.pop();
    if (ws.closed[current] === generation) continue;
    ws.closed[current] = generation;
    if (!occupiedAt(occupied, current) && goal(current)) {
      const path = buildPath(ws, generation, current);
      return deepWaterAllowed(graph, path) ? { path, cost: ws.g[current]! } : null;
    }
    forEachExploreEdge(graph, current, (next, edgeCost) => {
      if (occupiedAt(occupied, next) || ws.closed[next] === generation) return;
      const nextCost = ws.g[current]! + edgeCost;
      if (ws.seen[next] === generation && nextCost >= ws.g[next]!) return;
      const h = heuristic(next);
      ws.seen[next] = generation;
      ws.g[next] = nextCost;
      ws.h[next] = h;
      ws.f[next] = nextCost + h;
      ws.parent[next] = current;
      ws.heap.pushOrDecrease(next);
    });
  }
  return null;
}

export function findPath(
  graph: ExploreGraph,
  start: number,
  goal: number,
  occupied: ExploreOccupied,
): ExplorePath | null {
  if (!isStandable(graph, goal) || occupiedAt(occupied, goal)) return null;
  const target = { q: exploreNodeQ(graph, goal), r: exploreNodeR(graph, goal) };
  return search(
    graph,
    start,
    occupied,
    (node) => nodeDistance(graph, node, target),
    (node) => node === goal,
  );
}

export function findPathToAny(
  graph: ExploreGraph,
  start: number,
  anchorHex: HexCoord,
  range: number,
  occupied: ExploreOccupied,
): ExplorePath | null {
  if (
    !Number.isSafeInteger(anchorHex.q) ||
    !Number.isSafeInteger(anchorHex.r) ||
    !Number.isSafeInteger(range) ||
    range < 0
  )
    throw new RangeError('EXPLORE_TARGET_RANGE');
  return search(
    graph,
    start,
    occupied,
    (node) => Math.max(0, nodeDistance(graph, node, anchorHex) - range),
    (node) =>
      nodeDistance(graph, node, anchorHex) <= range && hasLineOfSight(graph, node, anchorHex),
  );
}
