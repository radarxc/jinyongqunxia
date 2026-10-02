import type { WorldMapRuntimeDefinition } from '@tianshu/data/schemas';
import { floorDivInt } from '@tianshu/shared';
import type { MapPosition, RoadLeg } from './worldmap-types';

export interface NavigationPath {
  readonly legs: readonly RoadLeg[]; readonly offsetLi: number; readonly totalLi: number;
}

/** Preallocated sparse integer A*. Only declared road endpoints connect. */
export class RoadPathfinder {
  readonly #ids: readonly string[]; readonly #lookup: ReadonlyMap<string, number>;
  readonly #adjacency: readonly (readonly { to: number; road: number }[])[];
  readonly #cost: Float64Array; readonly #score: Float64Array;
  readonly #parent: Int32Array; readonly #parentRoad: Int32Array;
  readonly #heap: Int32Array; readonly #heapPosition: Int32Array;
  readonly #closed: Uint8Array; #heapSize = 0; readonly #heuristicScale: number;

  public constructor(private readonly map: WorldMapRuntimeDefinition) {
    this.#ids = map.nodes.map((node) => node.id).sort(compareIds);
    this.#lookup = new Map(this.#ids.map((id, index) => [id, index]));
    const count = this.#ids.length;
    this.#cost = new Float64Array(count); this.#score = new Float64Array(count);
    this.#parent = new Int32Array(count); this.#parentRoad = new Int32Array(count);
    this.#heap = new Int32Array(count); this.#heapPosition = new Int32Array(count);
    this.#closed = new Uint8Array(count);
    const adjacency: { to: number; road: number }[][] = Array.from({ length: count }, () => []);
    let scale = Number.MAX_SAFE_INTEGER;
    for (let index = 0; index < map.roads.length; index += 1) {
      const road = map.roads[index]!; const from = this.#lookup.get(road.start)!;
      const to = this.#lookup.get(road.end)!;
      adjacency[from]!.push({ to, road: index }); adjacency[to]!.push({ to: from, road: index });
      const distance = this.distance(from, to);
      if (distance > 0) scale = Math.min(scale, floorDivInt(road.distanceLi, distance));
    }
    this.#heuristicScale = scale === Number.MAX_SAFE_INTEGER ? 0 : scale;
    this.#adjacency = adjacency.map((edges) => edges.sort((a, b) => a.to - b.to || a.road - b.road));
  }

  private distance(leftIndex: number, rightIndex: number): number {
    const left = this.map.nodes.find((node) => node.id === this.#ids[leftIndex])!.point;
    const right = this.map.nodes.find((node) => node.id === this.#ids[rightIndex])!.point;
    return Math.abs(left[0] - right[0]) + Math.abs(left[1] - right[1]);
  }
  private less(left: number, right: number): boolean {
    return this.#score[left]! < this.#score[right]! ||
      (this.#score[left] === this.#score[right] && left < right);
  }
  private swap(left: number, right: number): void {
    const item = this.#heap[left]!; this.#heap[left] = this.#heap[right]!; this.#heap[right] = item;
    this.#heapPosition[this.#heap[left]!] = left; this.#heapPosition[item] = right;
  }
  private push(index: number): void {
    let slot = this.#heapPosition[index]!;
    if (slot < 0) { slot = this.#heapSize; this.#heapSize += 1; this.#heap[slot] = index; this.#heapPosition[index] = slot; }
    while (slot > 0) {
      const above = floorDivInt(slot - 1, 2);
      if (!this.less(this.#heap[slot]!, this.#heap[above]!)) break;
      this.swap(slot, above); slot = above;
    }
  }
  private pop(): number {
    const index = this.#heap[0]!; this.#heapSize -= 1; this.#heapPosition[index] = -1;
    if (this.#heapSize === 0) return index;
    this.#heap[0] = this.#heap[this.#heapSize]!; this.#heapPosition[this.#heap[0]!] = 0;
    let slot = 0;
    while (slot * 2 + 1 < this.#heapSize) {
      let child = slot * 2 + 1;
      if (child + 1 < this.#heapSize && this.less(this.#heap[child + 1]!, this.#heap[child]!)) child += 1;
      if (!this.less(this.#heap[child]!, this.#heap[slot]!)) break;
      this.swap(slot, child); slot = child;
    }
    return index;
  }

  public find(start: string, destination: string): NavigationPath | null {
    const from = this.#lookup.get(start); const target = this.#lookup.get(destination);
    if (from === undefined || target === undefined ||
        !this.map.nodes.find((node) => node.id === destination)?.open) return null;
    this.#cost.fill(Infinity); this.#score.fill(Infinity); this.#parent.fill(-1);
    this.#parentRoad.fill(-1); this.#closed.fill(0); this.#heapPosition.fill(-1); this.#heapSize = 0;
    this.#cost[from] = 0; this.#score[from] = this.distance(from, target) * this.#heuristicScale;
    this.push(from);
    while (this.#heapSize > 0) {
      const current = this.pop();
      if (current === target) return this.path(from, target);
      this.#closed[current] = 1;
      for (const edge of this.#adjacency[current]!) {
        if (this.#closed[edge.to]) continue;
        const cost = this.#cost[current]! + this.map.roads[edge.road]!.distanceLi;
        if (cost >= this.#cost[edge.to]!) continue;
        this.#parent[edge.to] = current; this.#parentRoad[edge.to] = edge.road;
        this.#cost[edge.to] = cost;
        this.#score[edge.to] = cost + this.distance(edge.to, target) * this.#heuristicScale;
        this.push(edge.to);
      }
    }
    return null;
  }
  private path(from: number, target: number): NavigationPath {
    const legs: RoadLeg[] = [];
    for (let node = target; node !== from; node = this.#parent[node]!) {
      const previous = this.#parent[node]!;
      legs.push({ roadKey: this.map.roads[this.#parentRoad[node]!]!.key,
        from: this.#ids[previous]!, to: this.#ids[node]! });
    }
    legs.reverse();
    return { legs, offsetLi: 0, totalLi: this.#cost[target]! };
  }

  public fromPosition(position: MapPosition, destination: string): NavigationPath | null {
    if (position.kind === 'node') return this.find(position.nodeId, destination);
    const road = this.map.roads.find((entry) => entry.key === position.leg.roadKey)!;
    const forward = this.find(position.leg.to, destination);
    const backward = this.find(position.leg.from, destination);
    const remaining = road.distanceLi - position.offsetLi;
    if (forward && (!backward || forward.totalLi + remaining <= backward.totalLi + position.offsetLi))
      return { legs: [position.leg, ...forward.legs], offsetLi: position.offsetLi,
        totalLi: remaining + forward.totalLi };
    if (!backward) return null;
    return { legs: [{ roadKey: road.key, from: position.leg.to, to: position.leg.from },
      ...backward.legs], offsetLi: remaining, totalLi: position.offsetLi + backward.totalLi };
  }
}

function compareIds(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
