import { compareCodePoints, floorDivInt } from '@tianshu/shared';

export interface DeadlineEntry {
  readonly atTick: number; readonly lineId: string; readonly nodeId: string;
  readonly kind?: 'open' | 'close';
}
function compare(left: DeadlineEntry, right: DeadlineEntry): number {
  return left.atTick - right.atTick || compareCodePoints(left.lineId, right.lineId) ||
    compareCodePoints(left.nodeId, right.nodeId) ||
    compareCodePoints(left.kind ?? 'close', right.kind ?? 'close');
}

/** Binary min-heap: timeout checks inspect only the next due entry. */
export class DeadlineQueue {
  readonly #values: DeadlineEntry[] = [];
  public push(entry: DeadlineEntry): void {
    this.#values.push(entry);
    let index = this.#values.length - 1;
    while (index > 0) {
      const parent = floorDivInt(index - 1, 2);
      if (compare(this.#values[parent]!, entry) <= 0) break;
      this.#values[index] = this.#values[parent]!; index = parent;
    }
    this.#values[index] = entry;
  }
  public peek(): DeadlineEntry | undefined { return this.#values[0]; }
  public pop(): DeadlineEntry | undefined {
    const root = this.#values[0]; const tail = this.#values.pop();
    if (root === undefined || tail === undefined || this.#values.length === 0) return root;
    let index = 0;
    while (true) {
      const left = index * 2 + 1; const right = left + 1;
      if (left >= this.#values.length) break;
      let child = left;
      if (right < this.#values.length && compare(this.#values[right]!, this.#values[left]!) < 0) child = right;
      if (compare(tail, this.#values[child]!) <= 0) break;
      this.#values[index] = this.#values[child]!; index = child;
    }
    this.#values[index] = tail; return root;
  }
}

