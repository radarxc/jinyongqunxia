import { describe, expect, it } from 'vitest';
import type { Rng } from '../../rng';
import {
  acupointHitChanceBp, applyAcupointStrike, digestAcupoint, injectPenetratingQi, tickForeignQi,
} from './meridian-effects';

const always = (word: number): Rng => ({ nextU32: () => word, snapshot: () => [word, 0, 0, 0] });
const injection = { projectionActive: true, enabled: true, sourceGrade: 4,
  attackerMpAfterCosts: 101, defenderMpAtHit: 100, sourceUnitId: 'attacker',
  sourceInnerId: 'sk_inner', releasedQi: 30, qiSpeedBp: 10_000, hitZone: 'body' as const,
  reversePath: [{ acupointRef: 'ap_a', lengthUnit: 1 }], sequence: 1, battleTick: 5 };

describe('penetrating Qi', () => {
  it.each([
    [{ projectionActive: false }, 'projection'], [{ sourceGrade: 3 }, 'grade'],
    [{ attackerMpAfterCosts: 100 }, 'strict MP advantage'],
  ] as const)('rejects an injection without %s eligibility', (override, _label) => {
    expect(injectPenetratingQi({ ...injection, ...override })).toBeNull();
  });

  it('copies released amount, speed and the hit-zone default anchor exactly', () => {
    expect(injectPenetratingQi(injection)).toMatchObject({ injectedQi: 30, remainingQi: 30,
      injectedSpeedBp: 10_000, injectionAcupoint: 'ap_renmai_danzhong',
      digestRatioBp: 10_000 });
  });

  it('digests ordinary 1:1 Qi before it reaches the dantian', () => {
    const state = injectPenetratingQi(injection)!;
    expect(tickForeignQi(state, { mp: 20, hp: 100, hpMax: 100, mpMax: 100,
      productionPerTick: 20 })).toMatchObject({ digestQi: 20, digestMpSpent: 20,
      mpAfter: 0, blockedAcupoint: null, cleared: true, impact: { level: 2, hpDamage: 5 } });
  });

  it('spends ten MP per Qi for a 10:1 source', () => {
    const state = injectPenetratingQi({ ...injection, releasedQi: 20, digestRatioBp: 100_000,
      reversePath: [{ acupointRef: 'ap_a', lengthUnit: 100 }] })!;
    expect(tickForeignQi(state, { mp: 50, hp: 100, hpMax: 100, mpMax: 100,
      productionPerTick: 50 })).toMatchObject({ digestQi: 5, digestMpSpent: 50,
      blockedAcupoint: 'ap_a', cleared: false });
  });
});

describe('Douzhuan reverse Qi', () => {
  it('guides at 1:1 MP and emits counter Qi at 1:2', () => {
    const state = injectPenetratingQi({ ...injection, releasedQi: 20,
      reversePath: [{ acupointRef: 'ap_a', lengthUnit: 100 }] })!;
    expect(tickForeignQi(state, { mp: 20, hp: 100, hpMax: 100, mpMax: 100,
      productionPerTick: 20, reverse: { minFluxCap: 20, routeCarryCap: 20 } }))
      .toMatchObject({ guidedQi: 20, redirectedQi: 10, mpAfter: 0, cleared: true });
  });

  it('leaves excess blocked when route width is insufficient', () => {
    const state = injectPenetratingQi({ ...injection, releasedQi: 30,
      reversePath: [{ acupointRef: 'ap_a', lengthUnit: 100 }] })!;
    expect(tickForeignQi(state, { mp: 10, hp: 100, hpMax: 100, mpMax: 100,
      productionPerTick: 20, reverse: { minFluxCap: 5, routeCarryCap: 30 } }))
      .toMatchObject({ guidedQi: 5, redirectedQi: 2, digestQi: 5,
        blockedAcupoint: 'ap_a', cleared: false });
    expect(state.remainingQi).toBe(20);
  });

  it('still suffers dantian impact after insufficient guidance', () => {
    const state = injectPenetratingQi({ ...injection, releasedQi: 40 })!;
    expect(tickForeignQi(state, { mp: 1, hp: 500, hpMax: 500, mpMax: 100,
      productionPerTick: 1, reverse: { minFluxCap: 1, routeCarryCap: 10 } })).toMatchObject({
        guidedQi: 1, redirectedQi: 0, cleared: true, impact: { level: 4, hpDamage: 75,
          productionPenaltyBp: 7500, durationOwnActions: 6 }, hpAfter: 425 });
  });
});

describe('acupoint strikes', () => {
  const input = { hitBp: 8500, sourceEffHit: 0, targetEffRes: 0, resSealEffBp: 0, sealBp: 700 };
  it('matches the standard 7200 bp sample', () => {
    expect(acupointHitChanceBp(input)).toBe(7200);
  });
  it('creates an occupancy with half digestion efficiency on success', () => {
    expect(applyAcupointStrike({ ...input, acupointRef: 'ap_a', sourceUnitId: 'a',
      sourceInnerId: 'sk_a', occupyingQi: 20, digestRatioBp: 10_000, level: 3,
      remainingOwnActions: 2 }, always(0))).toMatchObject({ occupyingQi: 20, digestRatioBp: 20_000 });
  });
  it('does not occupy the point when the independent check fails', () => {
    expect(applyAcupointStrike({ ...input, acupointRef: 'ap_a', sourceUnitId: 'a',
      sourceInnerId: 'sk_a', occupyingQi: 20, digestRatioBp: 10_000, level: 3,
      remainingOwnActions: 2 }, always(9999))).toBeNull();
  });
  it('costs 40 MP to digest 20 occupancy Qi at ordinary source ratio', () => {
    const occupancy = applyAcupointStrike({ ...input, acupointRef: 'ap_a', sourceUnitId: 'a',
      sourceInnerId: 'sk_a', occupyingQi: 20, digestRatioBp: 10_000, level: 3,
      remainingOwnActions: 2 }, always(0))!;
    expect(digestAcupoint(occupancy, 40, 40)).toBe(40);
    expect(occupancy.occupyingQi).toBe(0);
  });
});
