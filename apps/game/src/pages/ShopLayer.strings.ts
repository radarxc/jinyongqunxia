import type { ShopRejectReason } from '@tianshu/core/shop-command';

export const SHOP_LAYER_STRINGS = {
  loading: '掌柜正在清点货架……',
  queryFailed: '货单暂时取不到，请稍后再试。',
  facilityKinds: { shop: '商铺', inn: '客栈', tavern: '酒肆', teahouse: '茶馆',
    clinic: '医馆', escort: '镖局', casino: '坊场', school: '馆塾', relay: '驿站',
    manor: '庄院', stall: '市摊', temple: '寺观', office: '官署', residence: '宅院' },
  rejection: {
    SHOP_UNKNOWN: '这家铺子已经不在此处。',
    SHOP_NOT_HERE: '须在店内与掌柜当面交易。',
    SHOP_CLOSED: '铺子已经打烊。',
    SHOP_ITEM_UNAVAILABLE: '这件货眼下不能交易。',
    SHOP_STOCK_INSUFFICIENT: '货架上的存货不够。',
    SHOP_MONEY_INSUFFICIENT: '身上银两不够。',
    SHOP_PRICE_STALE: '价钱变了，请再看一眼。',
    SHOP_INVENTORY_FULL: '行囊已经装不下了。',
    SHOP_BUSY: '此刻还不能交易。',
  } satisfies Readonly<Record<ShopRejectReason, string>>,
} as const;

export function shopRejectionText(code?: string): string {
  return SHOP_LAYER_STRINGS.rejection[code as ShopRejectReason] ?? '这笔买卖未能成交。';
}
