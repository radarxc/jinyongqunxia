import { ceilDivInt, clampInt, compareCodePoints, mulBpFloor, mulDivFloor } from '@tianshu/shared';
import { chanceBp, type Rng } from '../../rng';
import type { HitZone } from './formula';

export const HIT_ZONE_ACUPOINT: Readonly<Record<HitZone, string>> = {
  body: 'ap_renmai_danzhong', hand: 'ap_shouyangming_hegu', leg: 'ap_zuyangming_zusanli',
};
export interface ForeignQiInstance {
  readonly id: number; readonly sourceUnitId: string; readonly sourceInnerId: string;
  readonly injectedQi: number; remainingQi: number; readonly injectedSpeedBp: number;
  readonly injectionAcupoint: string; readonly hitZone: HitZone; readonly digestRatioBp: number;
  readonly reversePath: readonly { readonly acupointRef: string; readonly lengthUnit: number }[];
  stepIndex: number; remainingTravelTick: number; readonly arrivedAtTick: number;
}
export interface PenetratingQiInput {
  readonly projectionActive: boolean; readonly enabled: boolean; readonly sourceGrade: number;
  readonly attackerMpAfterCosts: number; readonly defenderMpAtHit: number;
  readonly sourceUnitId: string; readonly sourceInnerId: string; readonly releasedQi: number;
  readonly qiSpeedBp: number; readonly hitZone: HitZone; readonly targetAcupoint?: string;
  readonly digestRatioBp?: number; readonly reversePath: ForeignQiInstance['reversePath'];
  readonly sequence: number; readonly battleTick: number;
}

export function injectPenetratingQi(input: PenetratingQiInput): ForeignQiInstance | null {
  if (!input.projectionActive || !input.enabled || input.sourceGrade < 4
    || input.attackerMpAfterCosts <= input.defenderMpAtHit || input.releasedQi <= 0) return null;
  const first = input.reversePath[0];
  return { id: input.sequence, sourceUnitId: input.sourceUnitId, sourceInnerId: input.sourceInnerId,
    injectedQi: input.releasedQi, remainingQi: input.releasedQi,
    injectedSpeedBp: clampInt(input.qiSpeedBp, 1, 100_000),
    injectionAcupoint: input.targetAcupoint ?? HIT_ZONE_ACUPOINT[input.hitZone],
    hitZone: input.hitZone, digestRatioBp: clampInt(input.digestRatioBp ?? 10_000, 10_000, 100_000),
    reversePath: input.reversePath, stepIndex: 0, remainingTravelTick: first === undefined ? 0
      : ceilDivInt(first.lengthUnit * 10_000, Math.max(1, input.qiSpeedBp)), arrivedAtTick: input.battleTick };
}

export interface DantianImpact { readonly level: 1 | 2 | 3 | 4; readonly impactBp: number;
  readonly hpDamage: number; readonly productionPenaltyBp: number; readonly durationOwnActions: number }
export interface ForeignQiTickResult { readonly mpAfter: number; readonly hpAfter: number;
  readonly digestQi: number; readonly digestMpSpent: number; readonly guidedQi: number;
  readonly redirectedQi: number; readonly blockedAcupoint: string | null;
  readonly cleared: boolean; readonly impact: DantianImpact | null }

export function calculateDantianImpact(qi: number, hp: number, hpMax: number, mpMax: number): DantianImpact {
  const impactBp = clampInt(ceilDivInt(qi * 10_000, Math.max(1, mpMax)), 1, 10_000);
  const level: 1 | 2 | 3 | 4 = impactBp <= 500 ? 1
    : impactBp <= 1_500 ? 2 : impactBp <= 3_000 ? 3 : 4;
  const damageBp = [200, 500, 900, 1_500][level - 1]!;
  return { level, impactBp, hpDamage: Math.min(Math.max(0, hp - 1),
    Math.max(1, mulBpFloor(hpMax, damageBp))),
  productionPenaltyBp: [1_500, 3_000, 5_000, 7_500][level - 1]!,
  durationOwnActions: [2, 3, 4, 6][level - 1]! };
}

export function tickForeignQi(
  state: ForeignQiInstance, input: { readonly mp: number; readonly hp: number; readonly hpMax: number;
    readonly mpMax: number; readonly productionPerTick: number; readonly reverse?: { readonly minFluxCap: number;
      readonly routeCarryCap: number }; readonly deferDantianDamage?: boolean },
): ForeignQiTickResult {
  let mp = input.mp; let guidedQi = 0; let redirectedQi = 0;
  if (input.reverse !== undefined) {
    const capacity = Math.min(input.productionPerTick, input.reverse.minFluxCap,
      input.reverse.routeCarryCap);
    guidedQi = Math.min(state.remainingQi, capacity, mp);
    state.remainingQi -= guidedQi; mp -= guidedQi; redirectedQi = mulBpFloor(guidedQi, 5_000);
  }
  const budget = Math.min(mp, Math.max(0, input.productionPerTick - guidedQi));
  const digestQi = Math.min(state.remainingQi, mulDivFloor(budget, 10_000, state.digestRatioBp));
  const digestMpSpent = digestQi === 0 ? 0 : ceilDivInt(digestQi * state.digestRatioBp, 10_000);
  state.remainingQi -= digestQi; mp -= digestMpSpent;
  if (state.remainingQi === 0) return { mpAfter: mp, hpAfter: input.hp, digestQi, digestMpSpent,
    guidedQi, redirectedQi, blockedAcupoint: null, cleared: true, impact: null };
  if (state.remainingTravelTick > 0) state.remainingTravelTick -= 1;
  while (state.remainingTravelTick === 0 && state.stepIndex < state.reversePath.length) {
    state.stepIndex += 1;
    const step = state.reversePath[state.stepIndex];
    if (step !== undefined) state.remainingTravelTick = ceilDivInt(step.lengthUnit * 10_000, state.injectedSpeedBp);
  }
  if (state.stepIndex < state.reversePath.length) {
    const node = state.reversePath[state.stepIndex];
    return { mpAfter: mp, hpAfter: input.hp, digestQi, digestMpSpent, guidedQi, redirectedQi,
      blockedAcupoint: node?.acupointRef ?? state.injectionAcupoint, cleared: false, impact: null };
  }
  const impact = calculateDantianImpact(state.remainingQi, input.hp, input.hpMax, input.mpMax);
  state.remainingQi = 0;
  return { mpAfter: mp, hpAfter: input.deferDantianDamage === true ? input.hp : input.hp - impact.hpDamage,
    digestQi, digestMpSpent,
    guidedQi, redirectedQi, blockedAcupoint: null, cleared: true, impact };
}

export interface MeridianTickTarget {
  readonly id: string; hp: number; readonly hpMax: number; mp: number; readonly mpMax: number;
  readonly qiProductionPerTick: number; readonly reverseQi: { readonly minFluxCap: number;
    readonly routeCarryCap: number } | null; redirectedQi: number;
  foreignQi: ForeignQiInstance[]; acupointOccupancies: AcupointOccupancy[];
}
export interface MeridianTickEvent { readonly t: 'battle/foreignQiDigested' | 'battle/reverseQiReleased'
  | 'battle/dantianDamaged' | 'battle/acupointDigested'; readonly target: string; readonly amount: number;
  readonly level?: number; readonly productionPenaltyBp?: number; readonly durationOwnActions?: number }

export function tickHostileMeridianEffects(
  target: MeridianTickTarget, productionPerTick = target.qiProductionPerTick,
): MeridianTickEvent[] {
  const events: MeridianTickEvent[] = [];
  const tickBudget = Math.min(target.mp, Math.max(0, productionPerTick));
  let budget = tickBudget;
  const occupancies = [...target.acupointOccupancies].sort((left, right) =>
    compareCodePoints(left.acupointRef, right.acupointRef)
      || compareCodePoints(left.sourceUnitId, right.sourceUnitId));
  for (const occupancy of occupancies) {
    if (budget === 0) break;
    const spent = digestAcupoint(occupancy, target.mp, budget);
    if (spent > 0) { target.mp -= spent; budget -= spent; events.push({
      t: 'battle/acupointDigested', target: target.id, amount: spent }); }
  }
  target.acupointOccupancies = target.acupointOccupancies.filter((entry) => entry.occupyingQi > 0);
  const ordered = [...target.foreignQi].sort((left, right) => left.arrivedAtTick - right.arrivedAtTick
    || left.id - right.id);
  let impactQi = 0;
  for (const foreign of ordered) {
    const beforeQi = foreign.remainingQi;
    const beforeMp = target.mp;
    let reverse: MeridianTickTarget['reverseQi'] = null;
    if (target.reverseQi !== null && budget > 0) {
      reverse = { minFluxCap: Math.min(target.reverseQi.minFluxCap, budget),
        routeCarryCap: target.reverseQi.routeCarryCap };
    }
    const result = tickForeignQi(foreign, { mp: target.mp, hp: target.hp, hpMax: target.hpMax,
      mpMax: target.mpMax, productionPerTick: Math.min(budget, productionPerTick),
      ...(reverse === null ? {} : { reverse }), deferDantianDamage: true });
    target.mp = result.mpAfter; target.hp = result.hpAfter; budget -= beforeMp - result.mpAfter;
    if (result.digestQi > 0) events.push({ t: 'battle/foreignQiDigested',
      target: target.id, amount: result.digestQi });
    if (result.redirectedQi > 0) { target.redirectedQi += result.redirectedQi; events.push({
      t: 'battle/reverseQiReleased', target: target.id, amount: result.redirectedQi }); }
    if (result.impact !== null) impactQi += beforeQi - result.digestQi - result.guidedQi;
  }
  target.foreignQi = target.foreignQi.filter((entry) => entry.remainingQi > 0);
  if (impactQi > 0) {
    const impact = calculateDantianImpact(impactQi, target.hp, target.hpMax, target.mpMax);
    target.hp -= impact.hpDamage; events.push({ t: 'battle/dantianDamaged', target: target.id,
      amount: impact.hpDamage, level: impact.level, productionPenaltyBp: impact.productionPenaltyBp,
      durationOwnActions: impact.durationOwnActions });
  }
  return events;
}

export interface AcupointStrikeInput { readonly hitBp: number; readonly sourceEffHit: number;
  readonly targetEffRes: number; readonly resSealEffBp: number; readonly sealBp: number }
export function acupointHitChanceBp(input: AcupointStrikeInput): number {
  const rating = clampInt(10_000 + 100 * (input.sourceEffHit - input.targetEffRes), 3_000, 20_000);
  return clampInt(mulDivFloor(Math.max(0, input.hitBp - 2_000),
    rating * (10_000 - clampInt(input.resSealEffBp, -5_000, 10_000)), 100_000_000)
    + input.sealBp, 500, 9_500);
}

export interface AcupointOccupancy { readonly acupointRef: string; readonly sourceUnitId: string;
  readonly sourceInnerId: string; occupyingQi: number; readonly digestRatioBp: number;
  level: number; remainingOwnActions: number; readonly affectedRouteRefs: readonly string[] }
export function applyAcupointStrike(input: AcupointStrikeInput & { readonly acupointRef: string;
  readonly sourceUnitId: string; readonly sourceInnerId: string; readonly occupyingQi: number;
  readonly digestRatioBp: number; readonly level: number; readonly remainingOwnActions: number;
  readonly affectedRouteRefs?: readonly string[] }, rng: Rng): AcupointOccupancy | null {
  if (!chanceBp(rng, acupointHitChanceBp(input))) return null;
  return { acupointRef: input.acupointRef, sourceUnitId: input.sourceUnitId,
    sourceInnerId: input.sourceInnerId, occupyingQi: input.occupyingQi,
    digestRatioBp: clampInt(input.digestRatioBp * 2, 20_000, 200_000),
    level: clampInt(input.level, 1, 9), remainingOwnActions: Math.max(1, input.remainingOwnActions),
    affectedRouteRefs: [...new Set(input.affectedRouteRefs ?? [])].sort(compareCodePoints) };
}

export function digestAcupoint(occupancy: AcupointOccupancy, mp: number, budget: number): number {
  const digest = Math.min(occupancy.occupyingQi, mulDivFloor(Math.min(mp, budget), 10_000, occupancy.digestRatioBp));
  occupancy.occupyingQi -= digest;
  return digest === 0 ? 0 : ceilDivInt(digest * occupancy.digestRatioBp, 10_000);
}

export function blockedRouteRefs(occupancies: readonly AcupointOccupancy[]): string[] {
  return [...new Set(occupancies.filter((entry) => entry.occupyingQi > 0)
    .flatMap((entry) => entry.affectedRouteRefs))].sort(compareCodePoints);
}
