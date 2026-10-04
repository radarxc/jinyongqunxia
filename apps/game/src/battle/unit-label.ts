export interface BattleUnitLabelMetrics {
  readonly width: number; readonly avatar: number; readonly nameFont: number;
  readonly auxiliaryFont: number; readonly offsetX: number; readonly bottomGap: number;
}

/** CSS-pixel contract for the always-visible battle identity marker (design/26 §4.8). */
export function battleUnitLabelMetrics(viewportWidth: number, index = 0): BattleUnitLabelMetrics {
  const compact = viewportWidth <= 390;
  return { width: compact ? 92 : 104, avatar: compact ? 24 : 28,
    nameFont: compact ? 14 : 16, auxiliaryFont: 14,
    offsetX: (index % 2 === 0 ? -1 : 1) * (compact ? 48 : 58), bottomGap: 16 };
}

export function battleUnitLabelPosition(x: number, y: number, viewportWidth: number,
  index: number): { readonly left: number; readonly top: number; readonly metrics: BattleUnitLabelMetrics } {
  const metrics = battleUnitLabelMetrics(viewportWidth, index);
  const half = metrics.width / 2 + 4;
  return { left: Math.max(half, Math.min(viewportWidth - half, x + metrics.offsetX)),
    top: Math.max(4, y - metrics.bottomGap), metrics };
}
