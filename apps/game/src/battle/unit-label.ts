export interface BattleUnitLabelMetrics {
  readonly width: number; readonly avatar: number; readonly nameFont: number;
  readonly auxiliaryFont: number; readonly offsetX: number; readonly bottomGap: number;
}

/** CSS-pixel contract for the always-visible battle identity marker (design/26 §4.8). */
export function battleUnitLabelMetrics(viewportWidth: number, _index = 0): BattleUnitLabelMetrics {
  return {
    width: 64,
    avatar: 24,
    nameFont: 14,
    auxiliaryFont: 14,
    offsetX: 0,
    bottomGap: 6,
  };
}

export function battleUnitLabelPosition(x: number, y: number, viewportWidth: number,
  index: number): { readonly left: number; readonly top: number; readonly metrics: BattleUnitLabelMetrics } {
  const metrics = battleUnitLabelMetrics(viewportWidth, index);
  const half = metrics.width / 2 + 4;
  return { left: Math.max(half, Math.min(viewportWidth - half, x + metrics.offsetX)),
    top: Math.max(4, y - metrics.bottomGap), metrics };
}
