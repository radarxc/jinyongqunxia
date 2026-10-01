import type { ItemDef, MartialArtDef, NpcDef } from '@tianshu/data/schemas';
import type { EquipmentRule } from '@tianshu/core';

export interface MeridianTopology {
  readonly id: string; readonly name: string;
  readonly points: readonly { readonly id: string; readonly name: string }[];
}
export interface GameContent {
  readonly items: readonly ItemDef[]; readonly npcs: readonly NpcDef[];
  readonly skills: readonly MartialArtDef[]; readonly topology: readonly MeridianTopology[];
  readonly factions: Readonly<Record<string, string>>;
  readonly assets?: Readonly<Record<string, { readonly icon?: string; readonly portrait?: string }>>;
  readonly equipmentRules?: readonly EquipmentRule[];
}
export function equipmentRules(content: GameContent): readonly EquipmentRule[] {
  if (content.equipmentRules) return content.equipmentRules;
  return content.items.flatMap((item): EquipmentRule[] => {
    if (item.extension.type !== 'equipment') return [];
    const extension = item.extension.value;
    return [{ itemId: item.id, slot: extension.slot, uniqueEquipped: extension.uniqueEquipped,
      ...(extension.hands === undefined ? {} : { hands: extension.hands }),
      ...(extension.slot !== 'offHand' ? {} : { offHandRole: item.kind === 'hidden' || item.sub === 'pouch'
        ? 'hiddenCarrier' as const : item.sub === 'shield' ? 'shield' as const : 'secondaryWeapon' as const }),
    }];
  });
}
