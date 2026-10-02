import type { BattleEvent, BattleUnit } from '@tianshu/core';
import type { BattleLaunch, BattleUnitView, MeridianPointView } from './contracts';

const STATUS: Readonly<Record<string, string>> = {
  bf_zhongdu: '中毒', bf_liuxue: '流血', bf_neishang: '内伤', bf_xuanyun: '眩晕',
  bf_chaqi: '岔气', bf_xueweishoufeng: '穴位受封', bf_dantianshousun: '丹田受损',
};
const POINTS: Readonly<Record<string, string>> = {
  ap_renmai_danzhong: '膻中', ap_shouyangming_hegu: '合谷', ap_zuyangming_zusanli: '足三里',
};
const ZONES = { body: '全身', hand: '手部', leg: '腿部' } as const;
export function projectBattleUnit(unit: BattleUnit, launch: BattleLaunch): BattleUnitView {
  const marker = launch.markers.find(row => row.id === unit.id)!;
  const points = new Map<string, MeridianPointView>();
  for (const foreign of unit.foreignQi) {
    const id = foreign.reversePath[foreign.stepIndex]?.acupointRef ?? foreign.injectionAcupoint;
    points.set(id, { id, label: POINTS[id] ?? '受阻穴位', qi: foreign.remainingQi, state: 'blocked' });
  }
  for (const occupied of unit.acupointOccupancies) points.set(occupied.acupointRef, {
    id: occupied.acupointRef, label: POINTS[occupied.acupointRef] ?? '受封穴位',
    qi: occupied.occupyingQi, state: 'occupied',
  });
  const dantian = unit.buffs.find(buff => buff.def === 'bf_dantianshousun')?.stacks ?? 0;
  return { ...marker, active: unit.active, side: unit.side, control: unit.control,
    hp: unit.hp, hpMax: unit.hpMax, mp: unit.mp, mpMax: unit.mpMax, ct: unit.ct, spd: unit.spd,
    state: unit.state, statuses: unit.buffs.map(buff => ({ id: String(buff.iid),
      label: STATUS[buff.def] ?? '状态效果', detail: `${buff.stacks} 层 · 剩余 ${buff.turnsLeft} 次自身行动` })),
    moves: unit.moves.flatMap(move => {
      const visual = launch.moves.find(row => row.id === move.id);
      return visual ? [{ ...visual, mpCost: move.mpCost, recovery: move.recovery,
        hitZone: ZONES[move.hitZone], available: unit.mp >= move.mpCost,
        completionBp: null, attackBp: move.meridianAttackBp ?? null }] : [];
    }),
    meridian: { routeId: null, completionBp: null, inFlight: null, capacity: null, attackBp: null,
      dantianDamage: dantian, points: [...points.values()] },
  };
}

const EVENT_LABELS: Readonly<Record<string, string>> = {
  'battle/damageResolved': '受到伤害', 'battle/unitDowned': '重伤倒地',
  'battle/foreignQiInjected': '透劲入体，经脉受阻', 'battle/foreignQiDigested': '化解异种真气',
  'battle/acupointOccupied': '打穴封脉，穴位被占', 'battle/acupointDigested': '运气解穴',
  'battle/dantianDamaged': '逆气侵入丹田，丹田受损', 'battle/reverseQiReleased': '引导逆气，借劲还施',
  'buff/damage': '负面效果伤害', 'buff/actionSkipped': '行动受阻',
  'buff/expired': '状态消退', 'battle/autoSimulationStarted': '开始自动战斗',
  'battle/autoSimulationEnded': '自动战斗停止', 'battle/autoExchangeResolved': '自动出手',
  'battle/acuteQiGathered': '急性聚气，继续蓄气', 'battle/ended': '战斗结束',
};
export function eventText(event: BattleEvent): string {
  if (event.message && !['battle/ended', 'battle/autoSimulationEnded'].includes(event.t)) return event.message;
  // Exact full-cycle/repel prose is owned by core and never reselected or randomized here.
  if (event.t === 'qi.fullCycleCrit' || event.t === 'battle/fullCirculationCritResolved') return '周天暴击';
  if (event.t === 'combat.qiRepel' || event.t === 'battle/outwardQiCancelled') return '外放抵消';
  return EVENT_LABELS[event.t] ?? (event.t.startsWith('buff/') ? '状态变化' : '战况更新');
}
