import type { Command, EquipmentSlot } from '@tianshu/core';

export type UiCommand = Command
  | { readonly t: 'inventory/equip'; readonly itemId: string; readonly slot: EquipmentSlot }
  | { readonly t: 'inventory/unequip'; readonly slot: EquipmentSlot }
  | { readonly t: 'inventory/use'; readonly itemId: string; readonly targetId: string };

export interface UiCommandIntent {
  readonly type: 'core-command';
  readonly command: UiCommand;
}
type Listener = (intent: UiCommandIntent) => void;
const listeners = new Set<Listener>();

export const uiBus = {
  emit(intent: UiCommandIntent): void {
    for (const listener of listeners) listener(intent);
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
