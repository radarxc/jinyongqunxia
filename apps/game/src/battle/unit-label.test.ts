import { describe, expect, it } from 'vitest';
import { battleUnitLabelMetrics, battleUnitLabelPosition } from './unit-label';

describe('battle unit identity labels', () => {
  it('keeps a centered label and head target contract', () => {
    const metrics = battleUnitLabelMetrics(390);
    expect(metrics).toMatchObject({ width: 64, avatar: 24, nameFont: 14,
      auxiliaryFont: 14, offsetX: 0, bottomGap: 6 });
  });

  it('aligns directly above unit center and clamps within the viewport', () => {
    expect(battleUnitLabelPosition(195, 300, 390, 0)).toMatchObject({ left: 195, top: 294 });
    expect(battleUnitLabelPosition(195, 300, 390, 1)).toMatchObject({ left: 195, top: 294 });
    expect(battleUnitLabelPosition(0, 2, 390, 0)).toMatchObject({ left: 36, top: 4 });
    expect(battleUnitLabelPosition(390, 300, 390, 1).left).toBe(354);
  });
});
