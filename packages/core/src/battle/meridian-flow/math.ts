import { BP_SCALE, ceilDivInt, clampInt, floorDivInt, mulDivFloor } from '@tianshu/shared';
import type { MeridianProfile, RawMeridianProfile } from './types';

const ATTACK_CURVE: readonly (readonly [number, number])[] = [
  [4000, 6500], [5000, 6500], [6500, 7200], [8000, 8600], [10000, 10000],
  [12000, 13000], [15000, 16500], [18000, 19000], [22000, 22000], [25000, 22000],
];
const DEFENSE_CURVE: readonly (readonly [number, number])[] = [
  [4000, 13000], [5000, 12500], [8000, 11000], [10000, 10000], [12000, 8800],
  [15000, 7000], [20000, 5500], [22000, 5000], [25000, 5000],
];
const SPEED_CURVE: readonly (readonly [number, number])[] = [
  [4000, 7500], [6000, 8000], [8000, 9000], [10000, 10000], [12000, 11000],
  [15000, 12250], [18000, 13500],
];
const CIRCULATION_CURVE: readonly (readonly [number, number])[] = [
  [0, 5000], [2500, 6000], [5000, 7500], [7500, 9000], [9999, 10000],
];
export const SEAL_FLOW_PENALTY_BP = [0, 500, 1000, 1600, 2300, 3200, 4300, 5700, 7500, 10000] as const;
const GRAPPLE_MOVE_BP = [0, 10_000, 9000, 8000, 7000, 6000, 5000, 3500, 2000, 0] as const;
const GRAPPLE_RECOVERY_ADD = [0, 50, 100, 150, 200, 250, 300, 400, 500, 0] as const;
const GRAPPLE_STAT_BP = [0, 9500, 9000, 8500, 8000, 7500, 7000, 6000, 5000, 0] as const;
const SEAL_MP_COST_ADD_BP = [0, 300, 600, 900, 1200, 1600, 2000, 2500, 3000, 0] as const;

export interface GrappleControlProjection {
  readonly level: number; readonly moveBp: number; readonly recoveryAdd: number;
  readonly strBp: number; readonly agiBp: number; readonly evadeBp: number;
  readonly weaponLocked: boolean; readonly actionLocked: boolean;
}

export interface AcupointControlProjection {
  readonly level: number; readonly flowPenaltyBp: number; readonly mpCostAddBp: number;
  readonly innerLocked: boolean; readonly breathLocked: boolean;
}

export function grappleControlProjection(level: number): GrappleControlProjection {
  if (!Number.isSafeInteger(level) || level < 1 || level > 9) throw new RangeError('QI_GRAPPLE_LEVEL');
  return { level, moveBp: GRAPPLE_MOVE_BP[level]!, recoveryAdd: GRAPPLE_RECOVERY_ADD[level]!,
    strBp: GRAPPLE_STAT_BP[level]!, agiBp: GRAPPLE_STAT_BP[level]!,
    evadeBp: GRAPPLE_STAT_BP[level]!, weaponLocked: level >= 7, actionLocked: level === 9 };
}

export function acupointControlProjection(level: number): AcupointControlProjection {
  if (!Number.isSafeInteger(level) || level < 1 || level > 9) throw new RangeError('QI_SEAL_LEVEL');
  return { level, flowPenaltyBp: SEAL_FLOW_PENALTY_BP[level]!,
    mpCostAddBp: SEAL_MP_COST_ADD_BP[level]!, innerLocked: level >= 8, breathLocked: level === 9 };
}

function safeInt(value: number, code: string): number {
  if (!Number.isSafeInteger(value)) throw new RangeError(code);
  return value;
}

function interpolate(value: number, anchors: readonly (readonly [number, number])[]): number {
  const first = anchors[0];
  const last = anchors[anchors.length - 1];
  if (first === undefined || last === undefined) throw new RangeError('QI_CURVE_EMPTY');
  if (value <= first[0]) return first[1];
  for (let index = 1; index < anchors.length; index += 1) {
    const right = anchors[index]!;
    const left = anchors[index - 1]!;
    if (value <= right[0]) {
      const offset = value - left[0];
      const width = right[0] - left[0];
      return right[1] >= left[1]
        ? left[1] + mulDivFloor(offset, right[1] - left[1], width)
        : left[1] - mulDivFloor(offset, left[1] - right[1], width);
    }
  }
  return last[1];
}

export function deriveQiParameters(
  baseQiPerTick: number, baseQiSpeedBp: number, layerCurveBp: readonly number[], effectiveLayer: number,
): { readonly productionPerTick: number; readonly qiSpeedBp: number; readonly practiceLayer: number } {
  if (layerCurveBp.length !== 9) throw new RangeError('QI_LAYER_CURVE_LENGTH');
  const practiceLayer = clampInt(safeInt(effectiveLayer, 'QI_LAYER_INTEGER'), 1, 9);
  const layerBp = safeInt(layerCurveBp[practiceLayer - 1]!, 'QI_LAYER_CURVE_INTEGER');
  return {
    productionPerTick: clampInt(mulDivFloor(baseQiPerTick, layerBp, BP_SCALE), 1, 64),
    qiSpeedBp: clampInt(mulDivFloor(baseQiSpeedBp, layerBp, BP_SCALE), 1000, 20000),
    practiceLayer,
  };
}

export function routeTravelTicks(lengthUnit: number, qiSpeedBp: number): number {
  safeInt(lengthUnit, 'QI_LENGTH_INTEGER');
  safeInt(qiSpeedBp, 'QI_SPEED_INTEGER');
  if (lengthUnit < 1 || qiSpeedBp < 1) throw new RangeError('QI_TRAVEL_DOMAIN');
  return ceilDivInt(safeInt(lengthUnit * BP_SCALE, 'QI_TRAVEL_OVERFLOW'), qiSpeedBp);
}

export function segmentTravelTicks(lengths: ArrayLike<number>, qiSpeedBp: number): Int16Array {
  const result = new Int16Array(lengths.length);
  let cumulative = 0;
  let previousArrival = 0;
  for (let index = 0; index < lengths.length; index += 1) {
    cumulative = safeInt(cumulative + safeInt(lengths[index]!, 'QI_LENGTH_INTEGER'), 'QI_LENGTH_OVERFLOW');
    const arrival = routeTravelTicks(cumulative, qiSpeedBp);
    result[index] = arrival - previousArrival;
    previousArrival = arrival;
  }
  return result;
}

export function effectiveNodeFlowBp(flowBp: number, stagnationBp: number, sealLevel: number): number {
  const penalty = SEAL_FLOW_PENALTY_BP[clampInt(sealLevel, 0, 9)]!;
  return mulDivFloor(flowBp, Math.max(0, BP_SCALE - stagnationBp - penalty), BP_SCALE);
}

export function jamChanceBp(
  incoming: number, fluxCap: number, practiceBp: number, riskBp: number,
  stagnationBp: number, sealLevel: number,
): number {
  const loadBp = ceilDivInt(safeInt(incoming * BP_SCALE, 'QI_LOAD_OVERFLOW'), Math.max(1, fluxCap));
  const overloadBp = floorDivInt(Math.max(0, loadBp - 9000), 4);
  return clampInt(
    riskBp + floorDivInt(BP_SCALE - practiceBp, 8) + floorDivInt(stagnationBp, 4)
      + overloadBp + 350 * sealLevel,
    0, 8500,
  );
}

export function normalizeMeridianProfile(raw: RawMeridianProfile, standard: RawMeridianProfile): MeridianProfile {
  if (standard.releasedQi < 1 || standard.meanFluxCap < 1 || standard.meanFlowBp < 1
    || standard.routeQualityBp < 1) throw new RangeError('QI_REFERENCE_ZERO');
  return {
    qiBp: clampInt(mulDivFloor(raw.releasedQi, BP_SCALE, standard.releasedQi), 4000, 18000),
    widthBp: clampInt(mulDivFloor(raw.meanFluxCap, BP_SCALE, standard.meanFluxCap), 4000, 18000),
    flowBp: clampInt(mulDivFloor(raw.meanFlowBp, BP_SCALE, standard.meanFlowBp), 4000, 18000),
    completionBp: clampInt(mulDivFloor(raw.routeQualityBp, BP_SCALE, standard.routeQualityBp), 0, 18000),
  };
}

export function meridianStrengthBp(profile: MeridianProfile): number {
  const weighted = 30 * clampInt(profile.qiBp, 4000, 18000)
    + 25 * clampInt(profile.widthBp, 4000, 18000)
    + 25 * clampInt(profile.flowBp, 4000, 18000)
    + 20 * clampInt(profile.completionBp, 0, 18000);
  return clampInt(floorDivInt(weighted, 100), 4000, 18000);
}

function relativeMultiplierBp(
  self: MeridianProfile, opponent: MeridianProfile, routeLength: number,
  anchors: readonly (readonly [number, number])[], minimum: number, maximum: number,
): number {
  if (routeLength < 1 || routeLength > 18) throw new RangeError('QI_ROUTE_LENGTH');
  const relativeBp = clampInt(mulDivFloor(
    meridianStrengthBp(self), BP_SCALE, meridianStrengthBp(opponent),
  ), 4000, 25000);
  const targetBp = interpolate(relativeBp, anchors);
  const advantageCompletionBp = relativeBp >= BP_SCALE
    ? self.completionBp : opponent.completionBp;
  const qualityReachBp = clampInt(5000 + floorDivInt(advantageCompletionBp, 2), 5000, 10000);
  const routeReachBp = Math.min(BP_SCALE, 3000 + floorDivInt(7000 * routeLength, 18));
  const realiseBp = mulDivFloor(routeReachBp, qualityReachBp, BP_SCALE);
  const result = targetBp >= BP_SCALE
    ? BP_SCALE + mulDivFloor(targetBp - BP_SCALE, realiseBp, BP_SCALE)
    : BP_SCALE - mulDivFloor(BP_SCALE - targetBp, realiseBp, BP_SCALE);
  return clampInt(result, minimum, maximum);
}

export function attackMeridianBp(
  attacker: MeridianProfile, defender: MeridianProfile, routeLength: number,
): number {
  return relativeMultiplierBp(attacker, defender, routeLength, ATTACK_CURVE, 6500, 22000);
}

export function defenseMeridianBp(
  defender: MeridianProfile, attacker: MeridianProfile, routeLength: number,
): number {
  return relativeMultiplierBp(defender, attacker, routeLength, DEFENSE_CURVE, 5000, 13000);
}

export function speedMeridianBp(self: MeridianProfile, reference: MeridianProfile): number {
  const relativeBp = clampInt(mulDivFloor(
    meridianStrengthBp(self), BP_SCALE, meridianStrengthBp(reference),
  ), 4000, 18000);
  return clampInt(interpolate(relativeBp, SPEED_CURVE), 6500, 13500);
}

export function applyMeridianSpeed(
  baseSpd: number, baseMove: number, speedBp: number, grappleMoveBp = BP_SCALE,
): { readonly spd: number; readonly move: number; readonly openingQinggongBp: number;
  readonly evadeRatingDelta: number } {
  const combinedBp = mulDivFloor(speedBp, clampInt(grappleMoveBp, 0, BP_SCALE), BP_SCALE);
  const delta = combinedBp - BP_SCALE;
  const moveDelta = clampInt((delta >= 0 ? 1 : -1)
    * floorDivInt(Math.abs(delta), 1500), -2, 2);
  return { spd: clampInt(mulDivFloor(baseSpd, combinedBp, BP_SCALE), 30, 300),
    move: clampInt(baseMove + moveDelta, 1, 10), openingQinggongBp: combinedBp,
    evadeRatingDelta: clampInt(floorDivInt(speedBp - BP_SCALE, 100), -35, 35) };
}

export function circulationDamageBp(circulationBp: number): number {
  const value = clampInt(circulationBp, 0, BP_SCALE);
  return value === BP_SCALE ? 13500 : interpolate(value, CIRCULATION_CURVE);
}

export function finalMeridianAttackBp(baseBp: number, circulationBp: number): number {
  return clampInt(mulDivFloor(baseBp, circulationDamageBp(circulationBp), BP_SCALE), 6500, 22000);
}

export function practiceBp(effectiveLayer: number, movePracticeBp: number): number {
  return clampInt(3500 + 500 * clampInt(effectiveLayer, 1, 9)
    + floorDivInt(clampInt(movePracticeBp, 0, 10000), 4), 3500, 9800);
}
