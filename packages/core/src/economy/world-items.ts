import { compareCodePoints } from '@tianshu/shared';
import type { Inventory, WorldItemState, WorldItems } from '../state';
import { InventoryRuntime, type InventoryItemDef } from './inventory';
import type {
  EconomyEvent, WorldItemRule, WorldItemView, WorldPickupResult, WorldVisibilityContext,
} from './types';

function assertRule(rule: WorldItemRule): void {
  if (rule.sceneId.length === 0 || rule.anchorId.length === 0)
    throw new TypeError('WORLD_ITEM_LOCATION_REQUIRED');
  const from = rule.visibleFromTick ?? 0;
  const until = rule.visibleUntilTick;
  if (!Number.isSafeInteger(from) || from < 0
    || (until !== undefined && (!Number.isSafeInteger(until) || until <= from)))
    throw new RangeError('WORLD_ITEM_WINDOW');
}

export function isWorldItemVisible(
  rule: WorldItemRule, context: WorldVisibilityContext,
): boolean {
  if (!Number.isSafeInteger(context.worldTick) || context.worldTick < 0)
    throw new RangeError('WORLD_ITEM_TICK');
  if ((rule.visibleFromTick ?? 0) > context.worldTick
    || (rule.visibleUntilTick !== undefined && context.worldTick >= rule.visibleUntilTick))
    return false;
  const flags = new Set(context.flags);
  return (rule.requiredFlags ?? []).every((flag) => flags.has(flag))
    && !(rule.forbiddenFlags ?? []).some((flag) => flags.has(flag));
}

export class WorldItemsRuntime {
  readonly #entries = new Map<string, WorldItemState>();
  readonly #rules = new Map<string, WorldItemRule>();
  readonly #byScene = new Map<string, string[]>();

  constructor(worldItems: WorldItems, rules: readonly WorldItemRule[]) {
    for (const rule of rules) {
      assertRule(rule);
      if (this.#rules.has(rule.instanceKey)) throw new TypeError('WORLD_ITEM_RULE_DUPLICATE');
      this.#rules.set(rule.instanceKey, rule);
      const bucket = this.#byScene.get(rule.sceneId) ?? [];
      bucket.push(rule.instanceKey);
      this.#byScene.set(rule.sceneId, bucket);
    }
    for (const entry of worldItems.entries) {
      if (this.#entries.has(entry.instanceKey)) throw new TypeError('WORLD_ITEM_INSTANCE_DUPLICATE');
      if (!Number.isSafeInteger(entry.count) || entry.count <= 0)
        throw new TypeError('WORLD_ITEM_COUNT');
      const rule = this.#rules.get(entry.instanceKey);
      if (rule === undefined) throw new RangeError('WORLD_ITEM_RULE_MISSING');
      if (entry.locationId !== `${rule.sceneId}#${rule.anchorId}`)
        throw new RangeError('WORLD_ITEM_LOCATION_MISMATCH');
      this.#entries.set(entry.instanceKey, { ...entry });
    }
    for (const key of this.#rules.keys())
      if (!this.#entries.has(key)) throw new RangeError('WORLD_ITEM_INSTANCE_MISSING');
    for (const bucket of this.#byScene.values()) bucket.sort(compareCodePoints);
  }

  get(instanceKey: string, context: WorldVisibilityContext): WorldItemView | undefined {
    const entry = this.#entries.get(instanceKey);
    const rule = this.#rules.get(instanceKey);
    if (entry === undefined || rule === undefined || entry.pickedUp
      || !isWorldItemVisible(rule, context)) return undefined;
    return { instanceKey, itemId: entry.itemId, count: entry.count,
      sceneId: rule.sceneId, anchorId: rule.anchorId, collectible: entry.collectible };
  }

  queryScene(sceneId: string, context: WorldVisibilityContext): readonly WorldItemView[] {
    const result: WorldItemView[] = [];
    for (const key of this.#byScene.get(sceneId) ?? []) {
      const view = this.get(key, context);
      if (view !== undefined) result.push(view);
    }
    return result;
  }

  pickup(
    instanceKey: string, context: WorldVisibilityContext, inventory: Inventory,
    itemDefs: readonly InventoryItemDef[],
  ): WorldPickupResult {
    const view = this.get(instanceKey, context);
    if (view === undefined) throw new RangeError('WORLD_ITEM_NOT_AVAILABLE');
    const nextInventory = new InventoryRuntime(inventory, itemDefs);
    nextInventory.add(view.itemId, view.count);
    const entry = this.#entries.get(instanceKey)!;
    this.#entries.set(instanceKey, { ...entry, pickedUp: true });
    const event: EconomyEvent = {
      t: 'economy/worldItemPickedUp', instanceKey, itemId: view.itemId,
    };
    return { worldItems: this.snapshot(), inventory: nextInventory.snapshot(), event };
  }

  snapshot(): WorldItems {
    const entries = [...this.#entries.values()].map((entry) => ({ ...entry }));
    entries.sort((left, right) => compareCodePoints(left.instanceKey, right.instanceKey));
    return { entries };
  }
}

export function pickupWorldItem(
  worldItems: WorldItems, rules: readonly WorldItemRule[], instanceKey: string,
  context: WorldVisibilityContext, inventory: Inventory, itemDefs: readonly InventoryItemDef[],
): WorldPickupResult {
  return new WorldItemsRuntime(worldItems, rules).pickup(instanceKey, context, inventory, itemDefs);
}
