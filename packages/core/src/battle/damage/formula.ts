import { clampInt, mulBpFloor, mulDivFloor } from '@tianshu/shared';
import { chanceBp, intInclusive, type Rng } from '../../rng';

export type HitZone = 'body' | 'hand' | 'leg';
export type AttackDirection = 'front' | 'side' | 'back';
export interface Ratio { readonly n: number; readonly d: number }
export interface JudgeInput {
  readonly hitEff: number; readonly eva: number; readonly evadeRatingDelta?: number;
  readonly parry: number; readonly pierce: number; readonly direction?: AttackDirection;
  readonly targetParryMultBp?: number; readonly crit: number; readonly tough: number;
  readonly mustHit?: boolean; readonly skipParry?: boolean; readonly parryable?: boolean;
  readonly mustCrit?: boolean; readonly noCrit?: boolean;
}
export interface JudgeChances { readonly hitBp: number; readonly parryBp: number; readonly critBp: number }
export interface JudgeResult extends JudgeChances {
  readonly hit: boolean; readonly parried: boolean; readonly critical: boolean;
}

const DIRECTION_PARRY: Readonly<Record<AttackDirection, number>> =
  { front: 10_000, side: 7_500, back: 5_000 };
const DIRECTION_DAMAGE: Readonly<Record<AttackDirection, number>> =
  { front: 10_000, side: 11_000, back: 13_000 };

export function calculateJudgeChances(input: JudgeInput): JudgeChances {
  const hitBp = input.mustHit === true ? 10_000 : clampInt(8_500 + 40 *
    (input.hitEff - input.eva - (input.evadeRatingDelta ?? 0)), 4_000, 9_900);
  const baseParry = clampInt(1_200 + 40 * (input.parry - input.pierce), 0, 6_000);
  const parryBp = input.skipParry === true || input.parryable === false ? 0
    : mulDivFloor(baseParry, DIRECTION_PARRY[input.direction ?? 'front']
      * clampInt(input.targetParryMultBp ?? 10_000, 0, 10_000), 100_000_000);
  const critBp = input.noCrit === true ? 0 : input.mustCrit === true ? 10_000
    : clampInt(1_000 + 40 * (input.crit - input.tough), 200, 7_500);
  return { hitBp, parryBp, critBp };
}

export function rollJudge(input: JudgeInput, rng: Rng): JudgeResult {
  const chances = calculateJudgeChances(input);
  const hit = chanceBp(rng, chances.hitBp);
  if (!hit) return { ...chances, hit, parried: false, critical: false };
  const parried = chanceBp(rng, chances.parryBp);
  const critical = chanceBp(rng, chances.critBp);
  return { ...chances, hit, parried, critical };
}

export interface DamageFormulaInput {
  readonly attacker: { readonly level: number; readonly atkOut: number; readonly atkIn: number;
    readonly aptitude: number; readonly aptitudeInner: number; readonly critDamagePct: number };
  readonly defender: { readonly level: number; readonly defOut: number; readonly defIn: number };
  readonly wInBp: number; readonly actualPower: Ratio; readonly referencePower: Ratio;
  readonly pierceOutBp?: number; readonly pierceInBp?: number; readonly ignoreDef?: boolean;
  readonly dmgUpBp?: number; readonly dmgDownBp?: number; readonly zoneResistanceBp?: number;
  readonly meridianDefenseBp?: number; readonly natureAddBp?: number; readonly breakAddBp?: number;
  readonly synergyAddBp?: number; readonly meridianAttackBp?: number;
  readonly direction?: AttackDirection; readonly directionAddBp?: number;
  readonly heightAddBp?: number; readonly terrainAddBp?: number; readonly ultimate?: boolean;
}
export interface DamageTrace {
  readonly atkMix: number; readonly defMix: number; readonly z1: number; readonly z2: number;
  readonly z3: number; readonly z4: number; readonly z4m: number; readonly z5: number;
  readonly z5m: number; readonly z6: number; readonly z7: number; readonly z8: number;
  readonly z9: number; readonly z10: number; readonly varianceBp: number;
}

function mixed(outer: number, inner: number, wInBp: number): number {
  const w = clampInt(wInBp, 0, 10_000);
  const numerator = outer * (10_000 - w) + inner * w;
  if (!Number.isSafeInteger(numerator)) throw new RangeError('DAMAGE_INT_OVERFLOW');
  return mulDivFloor(numerator, 1, 10_000);
}

export function calculateZoneResistanceBp(
  zone: HitZone, strength: number, toughness: number, zoneFlowBp: number,
): number {
  const coefficients = zone === 'body' ? [2, 6, 800] : zone === 'hand'
    ? [6, 3, 600] : [5, 4, 700];
  return clampInt(coefficients[0]! * strength + coefficients[1]! * toughness
    + mulBpFloor(coefficients[2]!, clampInt(zoneFlowBp, 0, 10_000)), 0, 1_800);
}

export function calculateDamage(
  input: DamageFormulaInput, outcomes: { readonly critical: boolean; readonly parried: boolean },
  varianceBp = 10_000,
): DamageTrace {
  const w = clampInt(input.wInBp, 0, 10_000);
  const atkMix = mixed(input.attacker.atkOut, input.attacker.atkIn, w);
  const defOut = mulBpFloor(input.defender.defOut, 10_000 - clampInt(input.pierceOutBp ?? 0, 0, 6_000));
  const defIn = mulBpFloor(input.defender.defIn, 10_000 - clampInt(input.pierceInBp ?? 0, 0, 6_000));
  const defMix = input.ignoreDef === true ? 0 : mixed(defOut, defIn, w);
  const powerNum = 12_400 * input.actualPower.n * input.referencePower.d;
  const powerDen = 10_000 * input.actualPower.d * input.referencePower.n;
  const z1 = mulDivFloor(atkMix, powerNum, powerDen);
  const defenseK = 12_000 * atkMix;
  const z2 = atkMix === 0 ? 0 : mulDivFloor(z1, defenseK, defMix * 10_000 + defenseK);
  const z3 = mulBpFloor(z2, clampInt(10_000 + (input.dmgUpBp ?? 0), 5_000, 20_000));
  const reduction = clampInt((input.dmgDownBp ?? 0) + (input.zoneResistanceBp ?? 0), -5_000, 7_500);
  const z4 = mulBpFloor(z3, 10_000 - reduction);
  const z4m = mulBpFloor(z4, clampInt(input.meridianDefenseBp ?? 10_000, 5_000, 13_000));
  const aptitude = mixed(8_000 + 40 * clampInt(input.attacker.aptitude, 0, 100),
    8_000 + 40 * clampInt(input.attacker.aptitudeInner, 0, 100), w);
  const affinity = 10_000 + clampInt((input.natureAddBp ?? 0) + (input.breakAddBp ?? 0)
    + (input.synergyAddBp ?? 0), -3_000, 5_000);
  const z5 = mulDivFloor(z4m, aptitude * affinity, 100_000_000);
  const z5m = mulBpFloor(z5, clampInt(input.meridianAttackBp ?? 10_000, 6_500, 22_000));
  const z6 = outcomes.critical ? mulDivFloor(z5m, clampInt(input.attacker.critDamagePct, 120, 300), 100) : z5m;
  const direction = DIRECTION_DAMAGE[input.direction ?? 'front'] + (input.directionAddBp ?? 0);
  const position = clampInt(mulDivFloor(direction, (10_000 + clampInt(input.heightAddBp ?? 0, -1_200, 1_600))
    * (10_000 + clampInt(input.terrainAddBp ?? 0, -3_000, 3_000)), 100_000_000), 5_000, 20_000);
  const z7 = mulBpFloor(z6, position);
  const gap = clampInt((input.attacker.level - input.defender.level) * 150, -1_500, 1_500);
  const z8 = mulBpFloor(z7, 10_000 + gap);
  const z9 = outcomes.parried ? mulBpFloor(z8, input.ultimate === true ? 7_500 : 5_000) : z8;
  const variance = clampInt(varianceBp, 9_500, 10_500);
  return { atkMix, defMix, z1, z2, z3, z4, z4m, z5, z5m, z6, z7, z8, z9,
    z10: mulBpFloor(z9, variance), varianceBp: variance };
}

export const rollDamageVariance = (rng: Rng): number => intInclusive(rng, 9_500, 10_500);
