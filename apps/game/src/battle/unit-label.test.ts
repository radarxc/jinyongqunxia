import { describe, expect, it } from 'vitest';
import { battleUnitLabelMetrics, battleUnitLabelPosition } from './unit-label';

describe('battle unit identity labels', () => {
  it('keeps a readable 390 px label and 44 px touch target contract', () => {
    const metrics = battleUnitLabelMetrics(390);
    expect(metrics).toMatchObject({ width: 92, avatar: 24, nameFont: 14,
      auxiliaryFont: 14, bottomGap: 16 });
  });

  it('alternates away from the occupied tile centre and clamps within the viewport', () => {
    expect(battleUnitLabelPosition(195, 300, 390, 0)).toMatchObject({ left: 147, top: 284 });
    expect(battleUnitLabelPosition(195, 300, 390, 1)).toMatchObject({ left: 243, top: 284 });
    expect(battleUnitLabelPosition(0, 2, 390, 0)).toMatchObject({ left: 50, top: 4 });
    expect(battleUnitLabelPosition(390, 300, 390, 1).left).toBe(340);
  });
});
