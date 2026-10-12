import { exploreNodeQ, exploreNodeR, type ExploreGraph } from './graph';

/** Int32 node min-heap ordered by f, h, r, then q. */
export class ExploreMinHeap {
  #nodes: Int32Array;
  readonly #positions: Int32Array;
  #length = 0;

  constructor(
    private readonly graph: ExploreGraph,
    private readonly f: Int32Array,
    private readonly h: Int32Array,
    initialCapacity = 64,
  ) {
    if (!Number.isSafeInteger(initialCapacity) || initialCapacity < 1)
      throw new RangeError('EXPLORE_HEAP_CAPACITY');
    this.#nodes = new Int32Array(initialCapacity);
    this.#positions = new Int32Array(graph.nodeCount);
    this.#positions.fill(-1);
  }

  get size(): number {
    return this.#length;
  }

  clear(): void {
    for (let index = 0; index < this.#length; index += 1) this.#positions[this.#nodes[index]!] = -1;
    this.#length = 0;
  }

  #compare(left: number, right: number): number {
    return (
      this.f[left]! - this.f[right]! ||
      this.h[left]! - this.h[right]! ||
      exploreNodeR(this.graph, left) - exploreNodeR(this.graph, right) ||
      exploreNodeQ(this.graph, left) - exploreNodeQ(this.graph, right)
    );
  }

  #grow(): void {
    const next = new Int32Array(this.#nodes.length << 1);
    next.set(this.#nodes);
    this.#nodes = next;
  }

  pushOrDecrease(node: number): void {
    if (!Number.isSafeInteger(node) || node < 0 || node >= this.graph.nodeCount)
      throw new RangeError('EXPLORE_HEAP_NODE');
    let index = this.#positions[node]!;
    if (index < 0) {
      if (this.#length === this.#nodes.length) this.#grow();
      index = this.#length;
      this.#length += 1;
    }
    while (index > 0) {
      const parent = (index - 1) >> 1;
      const parentNode = this.#nodes[parent]!;
      if (this.#compare(parentNode, node) <= 0) break;
      this.#nodes[index] = parentNode;
      this.#positions[parentNode] = index;
      index = parent;
    }
    this.#nodes[index] = node;
    this.#positions[node] = index;
  }

  pop(): number {
    if (this.#length === 0) return -1;
    const result = this.#nodes[0]!;
    this.#positions[result] = -1;
    this.#length -= 1;
    if (this.#length === 0) return result;
    const tail = this.#nodes[this.#length]!;
    let index = 0;
    while (true) {
      const left = index * 2 + 1;
      if (left >= this.#length) break;
      const right = left + 1;
      const child =
        right < this.#length && this.#compare(this.#nodes[right]!, this.#nodes[left]!) < 0
          ? right
          : left;
      if (this.#compare(tail, this.#nodes[child]!) <= 0) break;
      this.#nodes[index] = this.#nodes[child]!;
      this.#positions[this.#nodes[index]!] = index;
      index = child;
    }
    this.#nodes[index] = tail;
    this.#positions[tail] = index;
    return result;
  }
}
