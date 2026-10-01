import { ceilDivInt, clampInt, mulBpFloor, mulDivFloor } from '@tianshu/shared';

export interface OutwardQiInput {
  readonly postShield: number; readonly d10: number; readonly neutralQiD10: number;
  readonly wInBp: number; readonly zoneQi: number; readonly zoneCarryCapacity: number;
  readonly defenderStrengthBp: number; readonly defenderFlowRatioBp: number;
  readonly breakGuardBp?: number; readonly causeId: string; readonly targetId: string;
  readonly segmentIndex: number;
}
export interface OutwardQiResult {
  readonly projectionReady: boolean; readonly zoneQi: number;
  readonly zoneProjectionThreshold: number; readonly attackQiBonus: number;
  readonly outwardQi: number; readonly eligibleIncoming: number;
  readonly qiBonusCancelled: number; readonly baseCancelled: number; readonly cancelled: number;
  readonly zoneQiSpent: number; readonly damageBeforeMpGuard: number;
  readonly event: QiRepelEvent | null;
}
export interface QiRepelEvent {
  readonly t: 'combat.qiRepel'; readonly canonicalType: 'battle/outwardQiCancelled';
  readonly causeId: string; readonly targetId: string; readonly segmentIndex: number;
  readonly amount: number; readonly messageKey: string; readonly message: string;
}
const QI_REPEL_MESSAGES = [
  '真气鼓荡震开攻击', '护体内劲迸发，来势顿消',
  '经脉真气外荡，将劲力逼退', '内息奔涌而出，卸开来招',
] as const;

function stableMessageIndex(input: OutwardQiInput): number {
  const text = `${input.causeId}:${input.targetId}:${input.segmentIndex}`;
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash = Math.imul(hash ^ text.charCodeAt(index), 0x01000193) >>> 0;
  }
  return hash % QI_REPEL_MESSAGES.length;
}

export function settleOutwardQi(input: OutwardQiInput): OutwardQiResult {
  const postShield = Math.max(0, input.postShield);
  const capacity = Math.max(0, input.zoneCarryCapacity);
  const zoneQi = clampInt(input.zoneQi, 0, Math.max(capacity, input.zoneQi));
  const threshold = ceilDivInt(capacity * 5_000, 10_000);
  const ready = capacity > 0 && zoneQi >= threshold;
  const fillBp = ready ? clampInt(mulDivFloor(zoneQi, 10_000, Math.max(1, threshold)),
    10_000, 20_000) : 0;
  const raw = ready ? mulDivFloor(clampInt(input.defenderStrengthBp, 0, 30_000),
    clampInt(input.defenderFlowRatioBp, 0, 30_000), 100_000) : 0;
  const filled = mulBpFloor(raw, fillBp);
  const outwardQi = mulBpFloor(filled, 10_000 - clampInt(input.breakGuardBp ?? 0, 0, 8_000));
  const attackQiBonus = Math.max(0, input.d10 - input.neutralQiD10);
  const qiBonusCancelled = Math.min(attackQiBonus, outwardQi);
  const baseCancelled = mulBpFloor(Math.max(0, outwardQi - attackQiBonus), 5_000);
  const innerPart = mulBpFloor(postShield, clampInt(input.wInBp, 0, 10_000));
  const eligible = innerPart + mulBpFloor(postShield - innerPart, 5_000);
  const cancelled = Math.min(postShield, eligible, qiBonusCancelled + baseCancelled);
  const zoneQiSpent = cancelled === 0 ? 0 : Math.min(zoneQi,
    ceilDivInt(cancelled * zoneQi, Math.max(1, outwardQi)));
  const messageIndex = stableMessageIndex(input);
  const event = cancelled === 0 ? null : { t: 'combat.qiRepel' as const,
    canonicalType: 'battle/outwardQiCancelled' as const, causeId: input.causeId,
    targetId: input.targetId, segmentIndex: input.segmentIndex, amount: cancelled,
    messageKey: `combat.qiRepel.${messageIndex}`, message: QI_REPEL_MESSAGES[messageIndex]! };
  return { projectionReady: ready, zoneQi, zoneProjectionThreshold: threshold, attackQiBonus,
    outwardQi, eligibleIncoming: eligible, qiBonusCancelled, baseCancelled, cancelled,
    zoneQiSpent, damageBeforeMpGuard: postShield - cancelled, event };
}

export interface DamageSettlementInput {
  readonly incoming: number; readonly hp: number; readonly mp: number; readonly shield: number;
  readonly shieldDamageMultBp?: number; readonly outwardQi?: OutwardQiInput;
  readonly mpGuardPctBp?: number; readonly mpGuardRatio?: number;
}
export interface DamageSettlement {
  readonly incoming: number; readonly shieldBlocked: number; readonly shieldSpent: number;
  readonly outwardQi: OutwardQiResult | null; readonly damageBeforeMpGuard: number;
  readonly guardedHp: number; readonly mpSpent: number; readonly uncappedHpDamage: number;
  readonly hpDamage: number; readonly overkill: number; readonly hpAfter: number;
  readonly mpAfter: number; readonly shieldAfter: number;
}

export function settleDamage(input: DamageSettlementInput): DamageSettlement {
  const incoming = Math.max(0, input.incoming);
  const shieldBlocked = Math.min(input.shield, incoming);
  const shieldSpent = Math.min(input.shield, mulBpFloor(incoming,
    Math.max(10_000, input.shieldDamageMultBp ?? 10_000)));
  const postShield = incoming - shieldBlocked;
  const outwardQi = input.outwardQi === undefined ? null
    : settleOutwardQi({ ...input.outwardQi, postShield });
  const beforeGuard = outwardQi?.damageBeforeMpGuard ?? postShield;
  const guardWant = mulBpFloor(beforeGuard, clampInt(input.mpGuardPctBp ?? 0, 0, 10_000));
  const ratio = Math.max(1, input.mpGuardRatio ?? 2);
  const mpSpent = Math.min(input.mp, ceilDivInt(guardWant, ratio));
  const guardedHp = Math.min(guardWant, mpSpent * ratio);
  const uncappedHpDamage = beforeGuard - guardedHp;
  const hpDamage = Math.min(input.hp, uncappedHpDamage);
  return { incoming, shieldBlocked, shieldSpent, outwardQi, damageBeforeMpGuard: beforeGuard,
    guardedHp, mpSpent, uncappedHpDamage, hpDamage, overkill: uncappedHpDamage - hpDamage,
    hpAfter: input.hp - hpDamage, mpAfter: input.mp - mpSpent, shieldAfter: input.shield - shieldSpent };
}
