import type { FacilityKind } from '@tianshu/data/schemas';

export const V1_CONTEXT_ACTION_STRINGS = {
  verbs: { talk: '交谈', enter: '进入', leaveBuilding: '出门', leaveTown: '出城',
    meditate: '打坐', inspect: '查看' },
  labels: { leaveBuilding: '走出建筑，返回街市', leaveTown: '离开城镇，返回大地图' },
  busy: '此刻还不能行动',
  facilityNames: {
    shop: '店铺', inn: '客栈', tavern: '酒肆', teahouse: '茶馆', clinic: '医馆',
    escort: '镖局', casino: '坊场', school: '馆塾', relay: '驿站', manor: '庄院',
    stall: '市摊', temple: '寺观', office: '官署', residence: '宅院',
  } satisfies Readonly<Record<FacilityKind, string>>,
  facilityIcons: {
    shop: '铺', inn: '客', tavern: '酒', teahouse: '茶', clinic: '医', escort: '镖',
    casino: '坊', school: '学', relay: '驿', manor: '庄', stall: '市', temple: '寺',
    office: '衙', residence: '宅',
  } satisfies Readonly<Record<FacilityKind, string>>,
} as const;
