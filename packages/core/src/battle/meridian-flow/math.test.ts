import { describe, expect, it } from 'vitest';
import {
  attackMeridianBp, circulationDamageBp, deriveQiParameters, effectiveNodeFlowBp,
  finalMeridianAttackBp, jamChanceBp, meridianStrengthBp, normalizeMeridianProfile,
  practiceBp, routeTravelTicks, segmentTravelTicks,
} from './math';

const standard = { releasedQi: 192, meanFluxCap: 16, meanFlowBp: 10_000, routeQualityBp: 10_000 };

describe('meridian-flow integer formulas', () => {
  it('derives layer-capped qi production and cumulative travel ticks', () => {
    const curve = [5625, 6250, 6875, 7500, 8125, 8750, 9375, 10_000, 10_625];
    expect(deriveQiParameters(16, 10_000, curve, 10)).toEqual({
      productionPerTick: 17, qiSpeedBp: 10_625, practiceLayer: 9,
    });
    expect([8000, 10_000, 12_500].map((speed) => routeTravelTicks(12, speed)))
      .toEqual([15, 12, 10]);
    for (const speed of [8000, 10_000, 12_500]) {
      expect([...segmentTravelTicks(Array.from({ length: 12 }, () => 1), speed)]
        .reduce((sum, value) => sum + value, 0)).toBe(routeTravelTicks(12, speed));
    }
  });

  it('applies flow, sealing, practice, normalization and bounded strength exactly', () => {
    expect(effectiveNodeFlowBp(9000, 1000, 2)).toBe(7200);
    expect(practiceBp(5, 6000)).toBe(7500);
    expect(jamChanceBp(16, 16, 7500, 200, 1000, 0)).toBe(1012);
    const profile = normalizeMeridianProfile(standard, standard);
    expect(profile).toEqual({ qiBp: 10_000, widthBp: 10_000, flowBp: 10_000, completionBp: 10_000 });
    expect(meridianStrengthBp(profile)).toBe(10_000);
    expect(attackMeridianBp(profile, profile, 12)).toBe(10_000);
  });

  it('keeps incomplete circulation soft and gives a full-cycle jump in the same multiplier', () => {
    expect([0, 2500, 5000, 7500, 9999, 10_000].map(circulationDamageBp))
      .toEqual([5000, 6000, 7500, 9000, 10_000, 13_500]);
    expect(finalMeridianAttackBp(10_000, 5000)).toBe(7500);
    expect(finalMeridianAttackBp(10_000, 10_000)).toBe(13_500);
  });
});
