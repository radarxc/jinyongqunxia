import { describe, expect, it } from 'vitest';
import { settleDamage, settleOutwardQi } from './settlement';

const outwardBase = { postShield: 1000, d10: 1200, neutralQiD10: 1000, wInBp: 10_000,
  zoneQi: 500, zoneCarryCapacity: 1000, defenderStrengthBp: 10_000,
  defenderFlowRatioBp: 10_000, causeId: 'cause', targetId: 'target', segmentIndex: 0 };

describe('outward Qi and damage settlement', () => {
  it('does nothing below the 50 percent projection threshold', () => {
    expect(settleOutwardQi({ ...outwardBase, zoneQi: 499 })).toMatchObject({
      projectionReady: false, cancelled: 0, zoneQiSpent: 0, damageBeforeMpGuard: 1000, event: null,
    });
  });

  it('cancels attacking Qi at 100 percent before basic damage', () => {
    expect(settleOutwardQi(outwardBase)).toMatchObject({ projectionReady: true, attackQiBonus: 200,
      outwardQi: 1000, qiBonusCancelled: 200, baseCancelled: 400, cancelled: 600,
      damageBeforeMpGuard: 400, zoneQiSpent: 300 });
  });

  it('caps cancellation of a purely external attack at 50 percent', () => {
    expect(settleOutwardQi({ ...outwardBase, d10: 1000, neutralQiD10: 1000, wInBp: 0,
      zoneQi: 1000 })).toMatchObject({ eligibleIncoming: 500, cancelled: 500,
      damageBeforeMpGuard: 500 });
  });

  it('applies break guard before cancellation and emits a deterministic compatibility event', () => {
    const result = settleOutwardQi({ ...outwardBase, breakGuardBp: 8000 });
    expect(result).toMatchObject({ outwardQi: 200, qiBonusCancelled: 200, baseCancelled: 0,
      cancelled: 200, damageBeforeMpGuard: 800 });
    expect(result.event).toMatchObject({ t: 'combat.qiRepel',
      canonicalType: 'battle/outwardQiCancelled', amount: 200 });
    expect(result.event?.message.length).toBeGreaterThan(0);
  });

  it('settles shield, outward Qi, MP guard and HP in fixed order', () => {
    const result = settleDamage({ incoming: 1200, hp: 300, mp: 100, shield: 200,
      shieldDamageMultBp: 15_000, mpGuardPctBp: 5_000, mpGuardRatio: 2,
      outwardQi: outwardBase });
    expect(result).toMatchObject({ shieldBlocked: 200, shieldSpent: 200,
      damageBeforeMpGuard: 400, guardedHp: 200, mpSpent: 100, uncappedHpDamage: 200,
      hpDamage: 200, overkill: 0, hpAfter: 100, mpAfter: 0, shieldAfter: 0 });
    expect(result.shieldBlocked + (result.outwardQi?.cancelled ?? 0)
      + result.guardedHp + result.uncappedHpDamage).toBe(result.incoming);
  });

  it('tracks overkill while preventing negative resource values', () => {
    expect(settleDamage({ incoming: 50, hp: 10, mp: 0, shield: 0 })).toMatchObject({
      hpDamage: 10, overkill: 40, hpAfter: 0, mpAfter: 0, shieldAfter: 0,
    });
  });
});
