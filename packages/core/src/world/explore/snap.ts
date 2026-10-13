import { hexDistance, type HexCoord } from '../../hex';
import { forEachExploreEdge, type ExploreOccupied } from './astar';
import {
  EXPLORE_STANDABLE,
  EXPLORE_VALID,
  exploreNodeAt,
  exploreNodeQ,
  exploreNodeR,
  type ExploreGraph,
} from './graph';

export type ExploreSnapResult = number | 'REGION_PATH_BLOCKED';

const COMPONENTS = new WeakMap<ExploreGraph, Int32Array>();
const EMPTY_OCCUPIED: ReadonlySet<number> = new Set();

function root(parent: Int32Array, node: number): number {
  let value = node;
  while (parent[value] !== value) value = parent[value]!;
  while (parent[node] !== node) {
    const next = parent[node]!;
    parent[node] = value;
    node = next;
  }
  return value;
}

function join(parent: Int32Array, left: number, right: number): void {
  const a = root(parent, left);
  const b = root(parent, right);
  if (a === b) return;
  if (a < b) parent[b] = a;
  else parent[a] = b;
}

function components(graph: ExploreGraph): Int32Array {
  const known = COMPONENTS.get(graph);
  if (known) return known;
  const parent = new Int32Array(graph.nodeCount);
  for (let node = 0; node < graph.nodeCount; node += 1) parent[node] = node;
  for (let node = 0; node < graph.nodeCount; node += 1) {
    if (
      (graph.flags[node]! & (EXPLORE_VALID | EXPLORE_STANDABLE)) !==
      (EXPLORE_VALID | EXPLORE_STANDABLE)
    )
      continue;
    forEachExploreEdge(graph, node, (target) => join(parent, node, target));
  }
  for (let node = 0; node < graph.nodeCount; node += 1) parent[node] = root(parent, node);
  COMPONENTS.set(graph, parent);
  return parent;
}

function occupiedAt(occupied: ExploreOccupied, node: number): boolean {
  return occupied instanceof Uint8Array ? occupied[node] !== 0 : occupied.has(node);
}

function ring(graph: ExploreGraph, target: HexCoord, radius: number): number[] {
  const nodes: number[] = [];
  for (let r = target.r - radius; r <= target.r + radius; r += 1) {
    for (let q = target.q - radius; q <= target.q + radius; q += 1) {
      if (hexDistance(target, { q, r }) !== radius) continue;
      const node = exploreNodeAt(graph, q, r);
      if (node >= 0) nodes.push(node);
    }
  }
  return nodes.sort(
    (left, right) =>
      exploreNodeR(graph, left) - exploreNodeR(graph, right) ||
      exploreNodeQ(graph, left) - exploreNodeQ(graph, right),
  );
}

/** Chooses at most six geometric candidates from rings zero through four. */
export function snapExploreTarget(
  graph: ExploreGraph,
  start: number,
  target: HexCoord,
  occupied: ExploreOccupied = EMPTY_OCCUPIED,
): ExploreSnapResult {
  if (
    !Number.isSafeInteger(target.q) ||
    !Number.isSafeInteger(target.r) ||
    start < 0 ||
    start >= graph.nodeCount ||
    (graph.flags[start]! & EXPLORE_STANDABLE) === 0
  )
    return 'REGION_PATH_BLOCKED';
  const labels = components(graph);
  const startComponent = labels[start];
  let attempts = 0;
  for (let radius = 0; radius <= 4; radius += 1)
    for (const node of ring(graph, target, radius)) {
      if (
        (graph.flags[node]! & (EXPLORE_VALID | EXPLORE_STANDABLE)) !==
          (EXPLORE_VALID | EXPLORE_STANDABLE) ||
        occupiedAt(occupied, node)
      )
        continue;
      attempts += 1;
      if (labels[node] === startComponent) return node;
      if (attempts === 6) return 'REGION_PATH_BLOCKED';
    }
  return 'REGION_PATH_BLOCKED';
}

export const snapToStandable = snapExploreTarget;
