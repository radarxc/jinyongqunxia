import type { ItemCategory, ItemView } from '@tianshu/ui';
import { useUnavailableReason } from '../runtime/item-adapter';
import type { GameContent, GameItemDef } from '../runtime/content';
import { ITEM_TEXT_PLACEHOLDER, type ItemText, type ItemTextCache } from '../runtime/item-content';

interface ItemAttributesV2 {
  readonly atk?: number;
  readonly def?: number;
  readonly agi?: number;
  readonly block?: number;
  readonly hardness?: number;
  readonly qiAffinity?: number;
  readonly qiEffect?: string;
  readonly luck?: number;
  readonly antiPoison?: number;
  readonly reflect?: number;
  readonly antiHidden?: number;
  readonly poison?: number;
  readonly readWis?: number;
  readonly readBre?: number;
  readonly cultivation?: number;
  readonly maxLayer?: number;
}

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

function cleanRawText(text?: string): string {
  if (!text) return '';
  return text
    .replace(/^外观：/u, '')
    .replace(/^名录投影：[^。]*。/u, '')
    .replace(/\s*待运行时投影：[^。]*?(。|$)/gu, '')
    .replace(/（原创扩展[^）]*）/gu, '')
    .replace(/\*\*（原创扩展[^）]*）\*\*/gu, '')
    .replace(/（原创设计[^）]*）/gu, '')
    .replace(/（待考[^）]*）/gu, '')
    .replace(/同档换色同值[，。]?/gu, '')
    .replace(/[，；]?[^，；。]*(?:均为|均属|整理成册属|流传均属|增益均为|铜题签为|形制为|裁片默认原创)\s*[。；，]?/gu, '。')
    .replace(/；\s*来历与后续持有人仍\s*。/gu, '。')
    .replace(/来历与后续持有人仍\s*。/gu, '')
    .replace(/本表[^\s。；]*形制为\s*。/gu, '')
    .replace(/横襕与裁片默认原创[，。]?/gu, '')
    .replace(/实体\s*。/gu, '')
    .replace(/https?:\/\/[^\s；]+/gu, '')
    .replace(/\[H\d+\]\([^)]+\)/gu, '')
    .replace(/[，；、]\s*([。；])/gu, '$1')
    .replace(/；\s*；/gu, '；')
    .replace(/。\s*。/gu, '。')
    .replace(/，\s*，/gu, '，')
    .replace(/^[，；。]/u, '')
    .replace(/[，；、]$/u, '。')
    .replace(/\s+/gu, ' ')
    .trim();
}

function parseProjectionParams(text?: string): Record<string, string> {
  if (!text) return {};
  const m = text.match(/待运行时投影：(.*?)(?:。|$)/u);
  if (!m || !m[1]) return {};
  const res: Record<string, string> = {};
  for (const part of m[1].split(';')) {
    const idx = part.indexOf('=');
    if (idx !== -1) {
      const k = part.slice(0, idx).trim();
      const v = part.slice(idx + 1).trim();
      if (k && v) res[k] = v;
    }
  }
  return res;
}

function formatSource(
  canonRef?: string,
  lore?: string,
  origin?: string,
  category?: ItemCategory,
): string {
  if (canonRef && canonRef.trim()) {
    const cleanRef = canonRef
      .replace(/https?:\/\/[^\s；]+/gu, '')
      .replace(/\[H\d+\]\([^)]+\)/gu, '')
      .replace(/（原创扩展[^）]*）/gu, '')
      .replace(/（待考[^）]*）/gu, '')
      .replace(/出现书界\s*ch\d+；?/gu, '')
      .replace(/准入：[^；]+；?/gu, '')
      .trim();

    const bookMatch = cleanRef.match(/《([^》]+)》[·\s]*([^；。]*)/u);
    if (bookMatch) {
      const book = bookMatch[1] ?? '';
      let detail = bookMatch[2] ? bookMatch[2].replace(/[（(].*?[）)]/gu, '').replace(/[《》]/gu, '').trim() : '';
      if (['宋史', '明史', '隋书', '元史', '汉书', '晋书', '周易', '考工记', '梦溪笔谈', '东京梦华录', '天工开物'].some((h) => book.includes(h))) {
        if (detail.includes('舆服')) detail = '舆服制式';
        return `历史文献 · 《${book}》${detail ? `（${detail}）` : ''}`;
      }
      return `金庸原著 · 《${book}》${detail ? `（${detail}）` : ''}`;
    }

    if (cleanRef.includes('历史器物') || cleanRef.includes('类型：')) {
      const eraMatch = cleanRef.match(/(北宋|南宋|唐代|隋代|元代|明代|清代|春秋)/u);
      return `历史考据 · ${eraMatch ? eraMatch[1] : '传世'}器物形制`;
    }

    if (cleanRef.startsWith('金庸原著 · ') || cleanRef.startsWith('历史文献 · ') ||
        cleanRef.startsWith('历史考据 · ') || cleanRef.includes(' · ')) {
      return cleanRef;
    }

    const firstSegment = cleanRef.split(/[；。]/u).map((s) => s.trim()).filter(Boolean)[0];
    if (firstSegment) {
      const cleaned = firstSegment.replace(/^形制／色系依据：/u, '');
      if (cleaned.length > 0 && cleaned.length <= 30) {
        return `历史考据 · ${cleaned}`;
      }
    }
  }

  if (lore) {
    const bookMatch = lore.match(/《([^》]+)》/u);
    if (bookMatch) {
      const book = bookMatch[1] ?? '';
      if (['宋史', '明史', '隋书', '元史', '梦溪笔谈', '东京梦华录'].some((h) => book.includes(h))) {
        return `历史文献 · 《${book}》考据`;
      }
      return `金庸原著 · 《${book}》典故`;
    }
  }

  if (origin === 'expanded' || !origin) {
    const catMap: Partial<Record<ItemCategory, string>> = {
      weapons: '武林名匠 · 淬火百炼铸就',
      'hidden-weapons': '暗器名家 · 精工机括秘制',
      clothing: '江湖行履 · 当朝民间通传制式',
      armor: '行军戎服 · 经久耐磨衣甲',
      innerarmor: '护身秘保 · 贴身柔韧防具',
      belts: '随身装束 · 行囊佩物',
      shoes: '远行步履 · 行万里路踏沙无声',
      accessories: '雅致配饰 · 江湖行侠佩饰',
      manuals: '武林散卷 · 前辈高人手书墨宝',
      medicine: '杏林名方 · 济世活人妙药',
      food: '四海风味 · 旅舍酒肆佳品',
      quest: '江湖要物 · 历经沧桑遗存',
      other: '江湖用具 · 行侠四方之物',
    };
    return catMap[category ?? 'other'] ?? '江湖传闻 · 名匠良工打造';
  }

  return '江湖典故 · 代代相传之物';
}

function extractItemEffects(item: GameItemDef, text?: ItemText): readonly string[] {
  const effects: string[] = [];
  const rawDesc = text?.desc ?? item.text?.desc ?? '';
  const proj = parseProjectionParams(rawDesc);
  const grade = item.grade ?? 1;

  if (item.use?.effects) {
    for (const eff of item.use.effects) {
      const val = eff.params['valueBp'];
      const pct = typeof val === 'number' ? `${val / 100}%` : '';
      if (eff.op === 'healPct') effects.push(`【气血恢复】恢复上限的 ${pct}`);
      else if (eff.op === 'mpPct') effects.push(`【内力恢复】恢复上限的 ${pct}`);
      else if (eff.op === 'staPct') effects.push(`【体力恢复】恢复上限的 ${pct}`);
      else if (eff.op === 'dispel') effects.push('【祛除异常】解除相应品阶负面状态');
      else if (eff.op === 'permMaxPct') effects.push('【培元固本】永久提升内力上限');
      else if (eff.op === 'permStat') effects.push('【先天洗髓】永久提升所选根骨或天赋');
      else if (eff.op === 'revive') effects.push('【起死回生】受创倒地后复生重聚元气');
      else if (eff.op === 'applyBuff') effects.push('【增益加持】获得相应心法或灵丹药效');
    }
  }

  if (item.extension.type === 'equipment') {
    const ext = item.extension.value as { slot: string; attributes?: ItemAttributesV2; armorWeight?: string };
    const attrs: ItemAttributesV2 = ext.attributes ?? {};

    if (attrs.atk !== undefined) {
      effects.push(`【兵刃攻击】+${attrs.atk}`);
    } else if (ext.slot === 'mainHand' || ext.slot === 'offHand') {
      const baseAtk = Math.round(75 + grade * 6);
      effects.push(`【兵刃攻击】+${baseAtk}`);
    }

    if (attrs.def !== undefined) {
      effects.push(`【护甲防御】+${attrs.def}`);
    } else if (['body', 'innerBody', 'head', 'feet', 'waist', 'shoulder', 'cape'].includes(ext.slot)) {
      const baseDef = ext.slot === 'body' ? Math.round(20 + grade * 5) : Math.round(5 + grade * 2);
      effects.push(`【护甲防御】+${baseDef}`);
    }

    if (attrs.agi && attrs.agi > 0) effects.push(`【身法轻盈】+${attrs.agi}`);
    if (attrs.block && attrs.block > 0) effects.push(`【招架格挡】+${attrs.block}`);
    if (attrs.hardness && attrs.hardness > 0) effects.push(`【坚韧硬度】${attrs.hardness}`);
    if (attrs.qiAffinity && attrs.qiAffinity !== 100) effects.push(`【内力亲和】${attrs.qiAffinity}%`);
    if (attrs.luck && attrs.luck > 0) effects.push(`【吉运福缘】+${attrs.luck}`);
    if (attrs.antiPoison && attrs.antiPoison > 0) effects.push(`【辟毒抗性】+${attrs.antiPoison}`);
    if (attrs.reflect && attrs.reflect > 0) effects.push(`【真气反震】反弹伤害 ${attrs.reflect / 100}%`);
    if (attrs.antiHidden && attrs.antiHidden > 0) effects.push(`【防范暗器】暗器减免 ${attrs.antiHidden / 100}%`);
    if (attrs.poison && attrs.poison > 0) effects.push(`【淬毒加持】附带毒伤 +${attrs.poison}`);
    if (attrs.qiEffect) {
      const qeNames: Record<string, string> = {
        bf_luanxin: '乱心扰神（以内力音波扰乱敌方心神）',
        bf_weici: '猬甲刺芒（近身肉搏刺伤攻伐敌手）',
        bf_bingpo: '冰魄寒霜（寒气透骨迟滞敌方真气）',
      };
      effects.push(`【兵刃特效】${qeNames[attrs.qiEffect] ?? attrs.qiEffect}`);
    }

    if (proj['defOutK']) {
      const v = Math.round(parseFloat(proj['defOutK']) * 100);
      effects.push(`【外防减免】${v}%`);
    }
    if (proj['defInK']) {
      const v = Math.round(parseFloat(proj['defInK']) * 100);
      effects.push(`【内劲减免】${v}%`);
    }
    if (proj['hpMaxK']) {
      const v = Math.round(parseFloat(proj['hpMaxK']) * 100);
      effects.push(`【气血充盈】最大气血 +${v}%`);
    }
    if (proj['eva']) effects.push('【轻灵避敌】闪避身法随品阶提升');
    if (proj['qinggong']) effects.push('【飞檐走壁】轻功身法提升');
    if (proj['wearer'] === 'male') effects.push('【穿戴限制】限男性侠士穿戴');
    else if (proj['wearer'] === 'female') effects.push('【穿戴限制】限女性女侠穿戴');

    if (ext.armorWeight === 'light') effects.push('【轻装规格】灵巧轻盈，不碍身法');
    else if (ext.armorWeight === 'heavy') effects.push('【重铠规格】坚固厚重，坚不可摧');
  }

  if (item.extension.type === 'manual' || item.kind === 'manual') {
    const ext = item.extension.type === 'manual' ? item.extension.value : {} as Record<string, unknown>;
    const attrs = (ext as { attributes?: Record<string, number> }).attributes ?? {};
    const wis = attrs['readWis'] ?? (15 + Math.round(grade * 4.5));
    const bre = attrs['readBre'];
    const cult = attrs['cultivation'] ?? (grade * 300);
    const maxL = (ext as { maxLayer?: number }).maxLayer ?? attrs['maxLayer'] ?? (grade >= 10 ? 10 : 8);

    effects.push(`【研读门槛】悟性需求 ≥ ${wis}`);
    if (bre) effects.push(`【根骨门槛】根骨需求 ≥ ${bre}`);
    effects.push(`【参悟消耗】消耗修为 ${cult} 点`);
    effects.push(`【武学极诣】最高可修炼至第 ${maxL} 重`);
  }

  if (item.kind === 'collectible' || proj['giftTo']) {
    if (proj['giftTo']) {
      const prefMap: Record<string, string> = {
        scholar: '文人学士', merchant: '商贾巨室', collector: '金石藏家',
        musician: '琴乐名士', monastic: '禅门道家',
      };
      const matched = Object.entries(prefMap)
        .filter(([k]) => proj['giftTo']!.includes(k))
        .map(([, v]) => v);
      if (matched.length > 0) {
        effects.push(`【投其所好】珍爱雅好：${matched.join('、')}`);
      }
    }
    effects.push('【文玩雅器】赠礼结交与赏鉴雅玩');
  }

  if (proj['party']) {
    effects.push(`【珍馐共飨】可供 ${proj['party']} 位同行侠士同膳`);
  }

  return effects;
}

function formatDescription(
  desc?: string,
  lore?: string,
  fallbackName = '此物',
  category?: ItemCategory,
  grade?: number | null,
): string {
  if (desc === ITEM_TEXT_PLACEHOLDER) return ITEM_TEXT_PLACEHOLDER;
  const cd = cleanRawText(desc);
  const cl = cleanRawText(lore);

  if (cl && cl.length > 15) {
    if (!cd || cl.includes(cd.slice(0, 10))) {
      return cl;
    }
    return `${cd}${cd.endsWith('。') ? '' : '。'} ${cl}`;
  }

  if (cd) return cd;
  const gradeStr = grade ? `品阶为${grade}品之` : '';
  const catName = category ? (CATEGORY_NAMES[category] ?? '江湖用具') : '江湖用具';
  return `${fallbackName}，${gradeStr}${catName}。制式精良，质地沉稳，行侠四方常用之物。`;
}

export function projectItem(item: GameItemDef, count: number, assets?: GameContent['assets'],
  texts?: Pick<ItemTextCache, 'get'>): ItemView {
  const category = itemCategory(item);
  const text = item.text ?? texts?.get(item.id);
  const useReason = useUnavailableReason(item);
  const explicitIcon = assets?.[item.id]?.icon;
  const icon = explicitIcon
    ? (explicitIcon.startsWith('/') ? explicitIcon : `/${explicitIcon}`)
    : `/assets/default/item-by-id/${item.id}.png`;

  const rawDesc = text?.desc ?? text?.short;
  const description = rawDesc === undefined
    ? ITEM_TEXT_PLACEHOLDER
    : formatDescription(rawDesc, text?.lore, item.name, category, item.grade);

  const source = formatSource(item.canonRef, text?.lore, item.origin, category);
  const effects = extractItemEffects(item, text);

  return {
    id: item.id,
    name: item.name,
    category,
    count,
    grade: item.grade,
    ageYears: item.extension.type === 'material' ? item.extension.value.ageYears ?? null : null,
    icon,
    description,
    source,
    effects,
    slot: item.extension.type === 'equipment' ? item.extension.value.slot : null,
    canUse: useReason === '',
    useReason,
  };
}

export function applyItemText(view: ItemView, texts: Pick<ItemTextCache, 'get'>): ItemView {
  const text = texts.get(view.id);
  if (!text) return view;

  const desc = formatDescription(text.desc ?? text.short, text.lore, view.name, view.category, view.grade);
  const source = formatSource(view.source, text.lore, undefined, view.category);

  const newEffects = [...view.effects];
  const proj = parseProjectionParams(text.desc);
  if (proj['defOutK'] && !newEffects.some((e) => e.includes('外防减免'))) {
    newEffects.push(`【外防减免】${Math.round(parseFloat(proj['defOutK']) * 100)}%`);
  }
  if (proj['defInK'] && !newEffects.some((e) => e.includes('内劲减免'))) {
    newEffects.push(`【内劲减免】${Math.round(parseFloat(proj['defInK']) * 100)}%`);
  }
  if (proj['hpMaxK'] && !newEffects.some((e) => e.includes('气血充盈'))) {
    newEffects.push(`【气血充盈】最大气血 +${Math.round(parseFloat(proj['hpMaxK']) * 100)}%`);
  }
  if (proj['eva'] && !newEffects.some((e) => e.includes('轻灵避敌'))) {
    newEffects.push('【轻灵避敌】闪避身法随品阶提升');
  }
  if (proj['qinggong'] && !newEffects.some((e) => e.includes('飞檐走壁'))) {
    newEffects.push('【飞檐走壁】轻功身法提升');
  }
  if (proj['wearer'] === 'male' && !newEffects.some((e) => e.includes('穿戴限制'))) {
    newEffects.push('【穿戴限制】限男性侠士穿戴');
  } else if (proj['wearer'] === 'female' && !newEffects.some((e) => e.includes('穿戴限制'))) {
    newEffects.push('【穿戴限制】限女性女侠穿戴');
  }
  if (proj['party'] && !newEffects.some((e) => e.includes('珍馐共飨'))) {
    newEffects.push(`【珍馐共飨】可供 ${proj['party']} 位同行侠士同膳`);
  }

  return {
    ...view,
    description: desc,
    source,
    effects: newEffects,
  };
}
