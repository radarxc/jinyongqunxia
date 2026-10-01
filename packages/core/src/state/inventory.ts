import { compareCodePoints } from '@tianshu/shared';
import type { ItemDef } from '@tianshu/data/schemas';
import type { Inventory } from './models';

export function addInventoryItem(inventory: Inventory, item: ItemDef, count: number): Inventory {
  if (!Number.isSafeInteger(count) || count <= 0) throw new TypeError('INVENTORY_COUNT');
  const previous = inventory.stacks.find((stack) => stack.itemId === item.id)?.count ?? 0;
  const next = previous + count;
  if (!Number.isSafeInteger(next) || next > item.stack) throw new TypeError('INVENTORY_STACK_LIMIT');
  const stacks = inventory.stacks.filter((stack) => stack.itemId !== item.id);
  stacks.push({ itemId: item.id, count: next });
  stacks.sort((left, right) => compareCodePoints(left.itemId, right.itemId));
  return { stacks };
}
