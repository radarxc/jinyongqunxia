export type QualityTier = 'low' | 'mid' | 'high' | 'ultra';
export type MemoryClass = 'S' | 'M' | 'L';

export interface QualityTierConfig {
  readonly dprCap: number;
  readonly renderScale: Readonly<{ min: number; initial: number; max: number }>;
  readonly dynamicLights: number;
  readonly particles: number;
  readonly particleScale: number;
  readonly vfxDrawCalls: number;
  readonly targetFps: number;
  readonly drawCalls: number;
  readonly gpuMemoryMB: number;
}

export const QUALITY_TIER_ORDER: readonly QualityTier[] = ['low', 'mid', 'high', 'ultra'];

export const QUALITY_TIERS: Readonly<Record<QualityTier, QualityTierConfig>> = {
  low: {
    dprCap: 1, renderScale: { min: 0.7, initial: 0.85, max: 1 },
    dynamicLights: 0, particles: 400, particleScale: 0.25, vfxDrawCalls: 8,
    targetFps: 30, drawCalls: 60, gpuMemoryMB: 96,
  },
  mid: {
    dprCap: 1.5, renderScale: { min: 0.7, initial: 0.9, max: 1 },
    dynamicLights: 2, particles: 1_200, particleScale: 0.5, vfxDrawCalls: 16,
    targetFps: 60, drawCalls: 100, gpuMemoryMB: 160,
  },
  high: {
    dprCap: 2, renderScale: { min: 0.75, initial: 1, max: 1 },
    dynamicLights: 4, particles: 3_000, particleScale: 1, vfxDrawCalls: 24,
    targetFps: 60, drawCalls: 150, gpuMemoryMB: 256,
  },
  ultra: {
    dprCap: 2, renderScale: { min: 0.85, initial: 1, max: 1 },
    dynamicLights: 8, particles: 6_000, particleScale: 1.5, vfxDrawCalls: 32,
    targetFps: 60, drawCalls: 250, gpuMemoryMB: 512,
  },
};

export function isQualityTier(value: unknown): value is QualityTier {
  return typeof value === 'string' && QUALITY_TIER_ORDER.includes(value as QualityTier);
}

export function lowerQualityTier(tier: QualityTier): QualityTier {
  const index = QUALITY_TIER_ORDER.indexOf(tier);
  return QUALITY_TIER_ORDER[Math.max(0, index - 1)]!;
}

export function minQualityTier(left: QualityTier, right: QualityTier): QualityTier {
  return QUALITY_TIER_ORDER[Math.min(QUALITY_TIER_ORDER.indexOf(left), QUALITY_TIER_ORDER.indexOf(right))]!;
}

export function normalizeRenderScale(value: number, tier: QualityTier): number {
  const range = QUALITY_TIERS[tier].renderScale;
  const finite = Number.isFinite(value) ? value : range.initial;
  return Math.min(range.max, Math.max(range.min, Math.round(finite * 20) / 20));
}

export function effectivePixelRatio(
  devicePixelRatio: number,
  tier: QualityTier,
  renderScale = QUALITY_TIERS[tier].renderScale.initial,
): number {
  const safeDpr = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
  return Math.min(safeDpr, QUALITY_TIERS[tier].dprCap) * normalizeRenderScale(renderScale, tier);
}

export interface RenderQualitySource {
  readonly tier: QualityTier;
  readonly renderScale: number;
  readonly gpuMemoryBudgetMB?: number | undefined;
  effectivePixelRatio(devicePixelRatio: number): number;
  sample?(frameIntervalMs: number, workMs?: number, timeMs?: number, state?: FrameSamplingState): void;
  markSizeChanged?(timeMs?: number): void;
  invalidateSamples?(timeMs?: number): void;
  reportContextLoss?(): void;
}

const fallbackQuality: RenderQualitySource = {
  tier: 'high',
  renderScale: QUALITY_TIERS.high.renderScale.initial,
  effectivePixelRatio: (deviceDpr) => effectivePixelRatio(deviceDpr, 'high'),
};
let configuredQuality: RenderQualitySource = fallbackQuality;
const sharedQuality: RenderQualitySource = {
  get tier() { return configuredQuality.tier; },
  get renderScale() { return configuredQuality.renderScale; },
  get gpuMemoryBudgetMB() { return configuredQuality.gpuMemoryBudgetMB; },
  effectivePixelRatio: (deviceDpr) => configuredQuality.effectivePixelRatio(deviceDpr),
  sample: (interval, work, time, state) => configuredQuality.sample?.(interval, work, time, state),
  markSizeChanged: (time) => configuredQuality.markSizeChanged?.(time),
  invalidateSamples: (time) => configuredQuality.invalidateSamples?.(time),
  reportContextLoss: () => configuredQuality.reportContextLoss?.(),
};
export function setDefaultRenderQuality(quality: RenderQualitySource): void { configuredQuality = quality; }
export function getDefaultRenderQuality(): RenderQualitySource {
  return sharedQuality;
}
import type { FrameSamplingState } from './auto-tuner';

