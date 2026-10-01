import { BP_SCALE, mulDivFloor } from '@tianshu/shared';
import type { Equipment, EquipmentSlot, Inventory } from '../state';
import { EQUIPMENT_SLOTS } from '../state';
import { InventoryRuntime, type InventoryItemDef } from './inventory';
import type {
  EconomyEvent, EquipmentChangeResult, EquipmentPanel, EquipmentPanelStat, EquipmentRule,
} from './types';

const EMPTY_PANEL: EquipmentPanel = {
  hpMax: 0, mpMax: 0, atkOut: 0, atkIn: 0, defOut: 0, defIn: 0,
  con: 0, str: 0, agi: 0, wis: 0, wil: 0, luk: 0, cha: 0,
  hit: 0, eva: 0, parry: 0, pierce: 0, crit: 0, critDmg: 0, tough: 0,
  spd: 0, mov: 0, jump: 0, qinggong: 0, counter: 0, combo: 0, seal: 0,
  effHit: 0, effRes: 0, healPower: 0, healRecv: 0,
  resPoison: 0, resGu: 0, resSeal: 0, resInjury: 0, resCold: 0, resHeat: 0,
  resMind: 0, resCC: 0,
};

function equipmentMap(equipment: Equipment): Map<EquipmentSlot, string | null> {
  const slots = new Map<EquipmentSlot, string | null>();
  for (const entry of equipment.entries) {
    if (slots.has(entry.slot)) throw new TypeError('EQUIPMENT_SLOT_DUPLICATE');
    slots.set(entry.slot, entry.itemId);
  }
  for (const slot of EQUIPMENT_SLOTS) if (!slots.has(slot)) throw new TypeError('EQUIPMENT_SLOT_MISSING');
  return slots;
}

function snapshot(slots: ReadonlyMap<EquipmentSlot, string | null>): Equipment {
  return { entries: EQUIPMENT_SLOTS.map((slot) => ({ slot, itemId: slots.get(slot) ?? null })) };
}

function ruleMap(rules: readonly EquipmentRule[]): Map<string, EquipmentRule> {
  const result = new Map<string, EquipmentRule>();
  for (const rule of rules) {
    if (result.has(rule.itemId)) throw new TypeError('EQUIPMENT_RULE_DUPLICATE');
    result.set(rule.itemId, rule);
  }
  return result;
}

export function equipItem(
  equipment: Equipment, source: Inventory, itemDefs: readonly InventoryItemDef[],
  itemRules: readonly EquipmentRule[], itemId: string,
): EquipmentChangeResult {
  const rules = ruleMap(itemRules);
  const rule = rules.get(itemId);
  if (rule === undefined) throw new RangeError('EQUIPMENT_ITEM_UNKNOWN');
  const slots = equipmentMap(equipment);
  const inventory = new InventoryRuntime(source, itemDefs);
  if (inventory.count(itemId) < 1) throw new RangeError('INVENTORY_INSUFFICIENT');
  if (rule.uniqueEquipped && [...slots.values()].includes(itemId))
    throw new RangeError('EQUIPMENT_ALREADY_EQUIPPED');
  const displaced: string[] = [];
  const displace = (slot: EquipmentSlot): void => {
    const oldId = slots.get(slot);
    if (oldId === null || oldId === undefined) return;
    const oldRule = rules.get(oldId);
    inventory.add(oldId, 1);
    displaced.push(oldId);
    slots.set(slot, null);
    if (oldRule?.hands === 'pair') {
      slots.set('mainHand', null);
      slots.set('offHand', null);
    }
  };
  if (rule.slot === 'offHand') {
    const mainId = slots.get('mainHand');
    const main = mainId === null || mainId === undefined ? undefined : rules.get(mainId);
    if (main?.hands === 'pair') throw new RangeError('EQUIPMENT_PAIR_OCCUPIES_OFFHAND');
    if (main?.hands === 2 && rule.offHandRole !== 'hiddenCarrier')
      throw new RangeError('EQUIPMENT_TWO_HAND_OFFHAND');
  }
  displace(rule.slot);
  if (rule.slot === 'mainHand' && rule.hands === 'pair') {
    displace('offHand');
    slots.set('offHand', itemId);
  } else if (rule.slot === 'mainHand' && rule.hands === 2) {
    const offhandId = slots.get('offHand');
    const offhandRule = offhandId === null || offhandId === undefined ? undefined : rules.get(offhandId);
    if (offhandId !== null && offhandId !== undefined
      && offhandRule?.offHandRole !== 'hiddenCarrier') displace('offHand');
  }
  inventory.remove(itemId, 1);
  slots.set(rule.slot, itemId);
  const event: EconomyEvent = { t: 'economy/itemEquipped', itemId, slot: rule.slot };
  return { equipment: snapshot(slots), inventory: inventory.snapshot(),
    displacedItemIds: displaced, events: [event] };
}

export function unequipItem(
  equipment: Equipment, source: Inventory, itemDefs: readonly InventoryItemDef[],
  itemRules: readonly EquipmentRule[], slot: EquipmentSlot,
): EquipmentChangeResult {
  const rules = ruleMap(itemRules);
  const slots = equipmentMap(equipment);
  const itemId = slots.get(slot);
  if (itemId === null || itemId === undefined) throw new RangeError('EQUIPMENT_SLOT_EMPTY');
  const inventory = new InventoryRuntime(source, itemDefs);
  inventory.add(itemId, 1);
  slots.set(slot, null);
  const rule = rules.get(itemId);
  if (rule?.hands === 'pair') { slots.set('mainHand', null); slots.set('offHand', null); }
  const event: EconomyEvent = { t: 'economy/itemUnequipped', itemId, slot };
  return { equipment: snapshot(slots), inventory: inventory.snapshot(),
    displacedItemIds: [], events: [event] };
}

export function deriveEquipmentPanel(
  base: EquipmentPanel, equipment: Equipment, rules: readonly EquipmentRule[],
): EquipmentPanel {
  const lookup = ruleMap(rules);
  const flat = { ...EMPTY_PANEL };
  const pct = { ...EMPTY_PANEL };
  const seen = new Set<string>();
  for (const entry of equipment.entries) {
    if (entry.itemId === null || seen.has(entry.itemId)) continue;
    seen.add(entry.itemId);
    const rule = lookup.get(entry.itemId);
    if (rule === undefined) throw new RangeError('EQUIPMENT_ITEM_UNKNOWN');
    for (const modifier of rule.modifiers ?? []) {
      if (!Number.isSafeInteger(modifier.value)) throw new TypeError('EQUIPMENT_MODIFIER_INT');
      const bucket = modifier.mode === 'flat' ? flat : pct;
      bucket[modifier.stat] += modifier.value;
    }
  }
  const result = { ...EMPTY_PANEL };
  for (const stat of Object.keys(result) as EquipmentPanelStat[]) {
    if (!Number.isSafeInteger(base[stat]) || !Number.isSafeInteger(flat[stat])
      || !Number.isSafeInteger(pct[stat])) throw new TypeError('EQUIPMENT_PANEL_INT');
    if (pct[stat] < -BP_SCALE) throw new RangeError('EQUIPMENT_PERCENT_RANGE');
    const value = Math.max(0, base[stat] + flat[stat]);
    result[stat] = mulDivFloor(value, BP_SCALE + pct[stat], BP_SCALE);
  }
  return result;
}
