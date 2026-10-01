import type { Equipment, EquipmentSlot } from './models';

export const EQUIPMENT_SLOTS: readonly EquipmentSlot[] = Object.freeze([
  'mainHand', 'offHand', 'head', 'body', 'innerBody', 'hands',
  'shoulder', 'cape', 'waist', 'feet', 'accessory',
]);

export function createEmptyEquipment(): Equipment {
  return { entries: EQUIPMENT_SLOTS.map((slot) => ({ slot, itemId: null })) };
}
