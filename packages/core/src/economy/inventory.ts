import { compareCodePoints } from '@tianshu/shared';
import type { ItemDef } from '@tianshu/data/schemas';
import type { Inventory, InventoryStack } from '../state';
import type { InventoryQuery, InventorySort, ItemKind } from './types';

export type InventoryItemDef = Pick<ItemDef, 'id' | 'kind' | 'grade' | 'stack'>;

const KIND_ORDER: readonly ItemKind[] = [
  'weapon', 'armor', 'offhand', 'hidden', 'accessory', 'ammo', 'pill', 'tonic',
  'poison', 'antidote', 'food', 'dish', 'wine', 'material', 'tool', 'manual',
  'page', 'recipe', 'quest', 'token', 'curio', 'mount', 'collectible', 'system',
];
const KIND_RANK = new Map(KIND_ORDER.map((kind, index) => [kind, index]));

function positiveCount(count: number): void {
  if (!Number.isSafeInteger(count) || count <= 0) throw new TypeError('INVENTORY_COUNT');
}

export class InventoryRuntime {
  readonly #items = new Map<string, InventoryItemDef>();
  readonly #counts = new Map<string, number>();
  readonly #byKind = new Map<ItemKind, Set<string>>();

  constructor(inventory: Inventory, itemDefs: readonly InventoryItemDef[]) {
    for (const item of itemDefs) {
      if (this.#items.has(item.id)) throw new TypeError('INVENTORY_ITEM_DEF_DUPLICATE');
      this.#items.set(item.id, item);
    }
    for (const stack of inventory.stacks) {
      positiveCount(stack.count);
      if (this.#counts.has(stack.itemId)) throw new TypeError('INVENTORY_STACK_DUPLICATE');
      const item = this.requireItem(stack.itemId);
      if (stack.count > item.stack) throw new TypeError('INVENTORY_STACK_LIMIT');
      this.#counts.set(item.id, stack.count);
      this.kindBucket(item.kind).add(item.id);
    }
  }

  private requireItem(itemId: string): InventoryItemDef {
    const item = this.#items.get(itemId);
    if (item === undefined) throw new RangeError('INVENTORY_ITEM_UNKNOWN');
    return item;
  }

  private kindBucket(kind: ItemKind): Set<string> {
    let bucket = this.#byKind.get(kind);
    if (bucket === undefined) {
      bucket = new Set<string>();
      this.#byKind.set(kind, bucket);
    }
    return bucket;
  }

  count(itemId: string): number { return this.#counts.get(itemId) ?? 0; }
  item(itemId: string): InventoryItemDef | undefined { return this.#items.get(itemId); }

  add(itemId: string, count: number): void {
    positiveCount(count);
    const item = this.requireItem(itemId);
    const next = (this.#counts.get(itemId) ?? 0) + count;
    if (!Number.isSafeInteger(next) || next > item.stack)
      throw new RangeError('INVENTORY_STACK_LIMIT');
    this.#counts.set(itemId, next);
    this.kindBucket(item.kind).add(itemId);
  }

  remove(itemId: string, count: number): void {
    positiveCount(count);
    const current = this.#counts.get(itemId) ?? 0;
    if (current < count) throw new RangeError('INVENTORY_INSUFFICIENT');
    const next = current - count;
    if (next === 0) {
      this.#counts.delete(itemId);
      const item = this.requireItem(itemId);
      this.#byKind.get(item.kind)?.delete(itemId);
    } else this.#counts.set(itemId, next);
  }

  query(query: InventoryQuery = {}, sort: InventorySort = 'id'): readonly InventoryStack[] {
    const ids = query.kind === undefined
      ? [...this.#counts.keys()] : [...(this.#byKind.get(query.kind) ?? [])];
    const rows = ids.filter((id) => {
      const grade = this.requireItem(id).grade ?? 0;
      return (query.minimumGrade === undefined || grade >= query.minimumGrade)
        && (query.maximumGrade === undefined || grade <= query.maximumGrade);
    }).map((itemId) => ({ itemId, count: this.#counts.get(itemId)! }));
    rows.sort((left, right) => this.compare(left.itemId, right.itemId, sort));
    return rows;
  }

  snapshot(sort: InventorySort = 'id'): Inventory { return { stacks: this.query({}, sort) }; }

  private compare(leftId: string, rightId: string, sort: InventorySort): number {
    const left = this.requireItem(leftId);
    const right = this.requireItem(rightId);
    if (sort === 'category') {
      const delta = (KIND_RANK.get(left.kind) ?? 0) - (KIND_RANK.get(right.kind) ?? 0);
      if (delta !== 0) return delta;
    }
    if (sort === 'grade') {
      const delta = (right.grade ?? 0) - (left.grade ?? 0);
      if (delta !== 0) return delta;
    }
    return compareCodePoints(leftId, rightId);
  }
}

export function addInventory(
  inventory: Inventory, items: readonly InventoryItemDef[], itemId: string, count: number,
): Inventory {
  const runtime = new InventoryRuntime(inventory, items);
  runtime.add(itemId, count);
  return runtime.snapshot();
}

export function removeInventory(
  inventory: Inventory, items: readonly InventoryItemDef[], itemId: string, count: number,
): Inventory {
  const runtime = new InventoryRuntime(inventory, items);
  runtime.remove(itemId, count);
  return runtime.snapshot();
}
