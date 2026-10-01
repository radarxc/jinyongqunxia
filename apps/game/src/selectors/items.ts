import type { ItemDef } from '@tianshu/data/schemas';
import type { ItemCategory, ItemView } from '@tianshu/ui';
import { useUnavailableReason } from '../runtime/item-adapter';
import type { GameContent } from '../runtime/content';

export function itemCategory(item: ItemDef): ItemCategory {
  if (['quest', 'token', 'system'].includes(item.kind)) return 'quest';
  if (item.kind === 'weapon' || item.kind === 'offhand') return 'weapons';
  if (item.kind === 'hidden' || item.kind === 'ammo') return 'hidden-weapons';
  if (['manual', 'page', 'recipe'].includes(item.kind)) return 'manuals';
  if (['pill', 'tonic', 'poison', 'antidote'].includes(item.kind) || item.sub === 'herb' || item.sub === 'toxin') return 'medicine';
  if (['food', 'dish', 'wine'].includes(item.kind) || item.sub === 'ingredient') return 'food';
  if (item.extension.type === 'equipment') {
    const slot = item.extension.value.slot;
    if (slot === 'innerBody') return 'innerarmor';
    if (slot === 'feet') return 'shoes';
    if (slot === 'waist') return 'belts';
    if (slot === 'body') return item.sub === 'officialArmor' ? 'armor' : 'clothing';
    return 'accessories';
  }
  return 'other';
}
function effectText(effect: NonNullable<ItemDef['use']>['effects'][number]): string {
  const value = effect.params['valueBp'];
  const percent = typeof value === 'number' ? `${value / 100}%` : '';
  if (effect.op === 'healPct') return `恢复气血上限的 ${percent}`;
  if (effect.op === 'mpPct') return `恢复内力上限的 ${percent}`;
  if (effect.op === 'staPct') return `恢复体力上限的 ${percent}`;
  if (effect.op === 'dispel') return '解除对应品阶的异常状态';
  return '特殊效果详见物品说明';
}
export function projectItem(item: ItemDef, count: number, assets?: GameContent['assets']): ItemView {
  const category = itemCategory(item);
  const description = item.text.desc.replace(/^名录投影：[^。]*。/, '').replace(/^外观：/, '');
  const useReason = useUnavailableReason(item);
  return { id: item.id, name: item.name, category, count, grade: item.grade,
    ageYears: item.extension.type === 'material' ? item.extension.value.ageYears ?? null : null,
    icon: assets ? assets[item.id]?.icon ?? null
      : category === 'other' || category === 'quest' ? null : `assets/default/item/${category}/icons/${item.id}_64.png`,
    description, source: item.canonRef ?? (item.origin === 'expanded' ? '原创扩展' : item.text.lore ?? '出处未登记'),
    effects: item.use?.effects.map(effectText) ?? [],
    slot: item.extension.type === 'equipment' ? item.extension.value.slot : null,
    canUse: useReason === '', useReason,
  };
}
