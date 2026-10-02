import type { BattleUnitSeed } from '@tianshu/core';

/** Literal ENG-04 combat-fixture values, kept as demo input; never derive production stats here. */
export function demoSeed(id: string): BattleUnitSeed {
  return { id, hp: 1200, hpMax: 1200, mp: 400, mpMax: 400, shield: 0, ctFrozen: false,
    pendingShift: 0, spd: 100, qinggong: 50, openingQinggong: 50, openingPriority: 0, agi: 50,
    stats: { level: 35, atkOut: 240, atkIn: 220, defOut: 180, defIn: 170, aptitude: 50,
      aptitudeInner: 50, critDamagePct: 150, hit: 100, eva: -100, parry: -100, pierce: 100,
      crit: -100, tough: 40, strength: 50 },
    moves: [{ id: 'mv_basic_strike', powerBp: 10_000, referencePowerBp: 10_000, wInBp: 3500,
      recovery: 900, mpCost: 0, hitZone: 'body', autoTargetCap: 1 }],
    zoneGuards: {
      body: { qi: 0, carryCapacity: 100, strengthBp: 10_000, flowRatioBp: 10_000, breakGuardBp: 0 },
      hand: { qi: 0, carryCapacity: 100, strengthBp: 10_000, flowRatioBp: 10_000, breakGuardBp: 0 },
      leg: { qi: 0, carryCapacity: 100, strengthBp: 10_000, flowRatioBp: 10_000, breakGuardBp: 0 },
    }, buffs: [], foreignQi: [], acupointOccupancies: [], ownActions: 0 };
}
