import { describe, expect, it } from 'vitest';
import { createRng, type Rng } from '../../rng';
import { calculateDamage, calculateJudgeChances, calculateZoneResistanceBp, rollJudge } from './formula';

function fixedRng(words: readonly number[]): Rng {
  let index = 0;
  return { nextU32: () => words[index++] ?? 0, snapshot: () => [index, 0, 0, 0] };
}

const neutral = {
  attacker: { level: 35, atkOut: 1095, atkIn: 939, aptitude: 45, aptitudeInner: 45,
    critDamagePct: 150 }, defender: { level: 35, defOut: 633, defIn: 561 },
  wInBp: 3500, actualPower: { n: 288, d: 100 }, referencePower: { n: 288, d: 100 },
} as const;

describe('Z0-Z10 damage formula', () => {
  it('matches the Lv35 neutral reference row exactly', () => {
    expect(calculateDamage(neutral, { critical: false, parried: false })).toMatchObject({
      atkMix: 1040, defMix: 607, z1: 1289, z2: 867, z3: 867, z4: 867,
      z4m: 867, z5: 849, z5m: 849, z6: 849, z7: 849, z8: 849, z9: 849, z10: 849,
    });
  });

  it.each([
    ['body', 728], ['hand', 714], ['leg', 752],
  ] as const)('calculates %s hit-zone resistance', (zone, expected) => {
    expect(calculateZoneResistanceBp(zone, 50, 38, 5000)).toBe(expected);
  });

  it('preserves each rounding boundary across Z4M, Z5 and Z5M', () => {
    expect(calculateDamage({ ...neutral, dmgUpBp: 1234, dmgDownBp: 456,
      zoneResistanceBp: 728, meridianDefenseBp: 9876, natureAddBp: 333,
      meridianAttackBp: 11234, direction: 'back', heightAddBp: 500, terrainAddBp: -300,
      attacker: { ...neutral.attacker, level: 40 } }, { critical: true, parried: true }, 9500))
      .toEqual({ atkMix: 1040, defMix: 607, z1: 1289, z2: 867, z3: 973, z4: 857,
        z4m: 846, z5: 856, z5m: 961, z6: 1441, z7: 1907, z8: 2050, z9: 1025,
        z10: 973, varianceBp: 9500 });
  });

  it('computes bounded hit, parry and crit chances', () => {
    expect(calculateJudgeChances({ hitEff: 55, eva: 50, evadeRatingDelta: 5, parry: 40,
      pierce: 30, direction: 'side', targetParryMultBp: 8000, crit: 45, tough: 40 }))
      .toEqual({ hitBp: 8500, parryBp: 960, critBp: 1200 });
  });

  it('consumes only the hit roll on a miss and all three rolls on a hit', () => {
    const input = { hitEff: 0, eva: 0, parry: 0, pierce: 0, crit: 0, tough: 0 };
    const miss = fixedRng([9999]);
    expect(rollJudge(input, miss).hit).toBe(false);
    expect(miss.snapshot()[0]).toBe(1);
    const hit = fixedRng([0, 0, 0]);
    expect(rollJudge(input, hit)).toMatchObject({ hit: true, parried: true, critical: true });
    expect(hit.snapshot()[0]).toBe(3);
  });

  it('is deterministic for identical battle RNG seeds', () => {
    expect(rollJudge({ hitEff: 60, eva: 55, parry: 50, pierce: 45, crit: 60, tough: 50 },
      createRng([1, 2, 3, 4]))).toEqual(rollJudge(
      { hitEff: 60, eva: 55, parry: 50, pierce: 45, crit: 60, tough: 50 },
      createRng([1, 2, 3, 4])));
  });
});
