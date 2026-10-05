import type { ItemCategory, ItemView } from '@tianshu/ui';
import { useUnavailableReason } from '../runtime/item-adapter';
import type { GameContent, GameItemDef } from '../runtime/content';
import { ITEM_TEXT_PLACEHOLDER, type ItemText, type ItemTextCache } from '../runtime/item-content';

export function itemCategory(item: GameItemDef): ItemCategory {
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
export const CATEGORY_FALLBACK_ICONS: Record<ItemCategory, string> = {
  weapons: '/assets/default/item/weapons/icons/eq_biyudao_64.png',
  'hidden-weapons': '/assets/default/item/hidden-weapons/eq_baoyulihuading.png',
  clothing: '/assets/default/item/clothing/icons/eq_buyi_64.png',
  armor: '/assets/default/item/armor/eq_pijia.png',
  innerarmor: '/assets/default/item/innerarmor/icons/eq_jinsijia_64.png',
  belts: '/assets/default/item/belts/icons/eq_mayaodai_64.png',
  shoes: '/assets/default/item/shoes/icons/eq_caoxie_64.png',
  accessories: '/assets/default/item/accessories/icons/eq_baiyuguan_64.png',
  manuals: '/assets/default/item/manuals/it_miji_baiyuanjianyi_can.png',
  medicine: '/assets/default/item/medicine/icons/it_jinchuangyao_64.png',
  food: '/assets/default/item/food/icons/it_baihuagao_64.png',
  quest: '/assets/default/item/collectibles/it_beisongbaijian.png',
  other: '/assets/default/item/collectibles/it_beisongsuqin.png',
};

const CATEGORY_NAMES: Record<ItemCategory, string> = {
  weapons: '兵刃',
  'hidden-weapons': '暗器',
  clothing: '衣衫',
  armor: '护甲',
  innerarmor: '内甲',
  belts: '腰带',
  shoes: '鞋靴',
  accessories: '配饰',
  manuals: '秘籍',
  medicine: '伤药与丹方',
  food: '吃食佳酿',
  quest: '要事奇物',
  other: '江湖用具',
};

function effectText(effect: NonNullable<GameItemDef['use']>['effects'][number]): string {
  const value = effect.params['valueBp'];
  const percent = typeof value === 'number' ? `${value / 100}%` : '';
  if (effect.op === 'healPct') return `恢复气血上限的 ${percent}`;
  if (effect.op === 'mpPct') return `恢复内力上限的 ${percent}`;
  if (effect.op === 'staPct') return `恢复体力上限的 ${percent}`;
  if (effect.op === 'dispel') return '解除对应品阶的异常状态';
  return '特殊效果详见物品说明';
}

function description(text?: ItemText): string {
  return (text?.desc ?? text?.short ?? ITEM_TEXT_PLACEHOLDER)
    .replace(/^名录投影：[^。]*。/, '').replace(/^外观：/, '');
}

export function projectItem(item: GameItemDef, count: number, assets?: GameContent['assets'],
  texts?: Pick<ItemTextCache, 'get'>): ItemView {
  const category = itemCategory(item);
  const text = item.text ?? texts?.get(item.id);
  const useReason = useUnavailableReason(item);
  const explicitIcon = assets?.[item.id]?.icon;
  const icon = explicitIcon
    ? (explicitIcon.startsWith('/') ? explicitIcon : `/${explicitIcon}`)
    : (CATEGORY_FALLBACK_ICONS[category] ?? CATEGORY_FALLBACK_ICONS.other);

  return {
    id: item.id,
    name: item.name,
    category,
    count,
    grade: item.grade,
    ageYears: item.extension.type === 'material' ? item.extension.value.ageYears ?? null : null,
    icon,
    description: description(text),
    source: item.canonRef ?? (item.origin === 'expanded'
      ? '原创扩展' : text?.lore ?? ITEM_TEXT_PLACEHOLDER),
    effects: item.use?.effects.map(effectText) ?? [],
    slot: item.extension.type === 'equipment' ? item.extension.value.slot : null,
    canUse: useReason === '',
    useReason,
  };
}

export function applyItemText(view: ItemView, texts: Pick<ItemTextCache, 'get'>): ItemView {
  const text = texts.get(view.id);
  if (!text) return view;
  const rawDesc = (text.desc ?? text.short ?? '').replace(/^名录投影：[^。]*。/, '').replace(/^外观：/, '').trim();
  const fallbackDesc = `${view.name}，${view.grade ? `品阶为${view.grade}品之` : ''}${CATEGORY_NAMES[view.category] ?? '江湖用具'}。武林中人常用此物行侠四方。`;
  const desc = rawDesc && rawDesc !== ITEM_TEXT_PLACEHOLDER
    ? rawDesc
    : (view.description && view.description !== ITEM_TEXT_PLACEHOLDER ? view.description : fallbackDesc);

  const rawLore = text?.lore?.trim();
  const fallbackLore = '江湖传闻此物由来已久，经多方巧匠之手流传至今。';
  const lore = rawLore && rawLore !== ITEM_TEXT_PLACEHOLDER
    ? rawLore
    : (view.source && view.source !== ITEM_TEXT_PLACEHOLDER ? view.source : fallbackLore);

  return {
    ...view,
    description: desc,
    source: lore,
  };
}
