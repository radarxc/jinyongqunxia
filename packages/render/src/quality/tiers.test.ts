import { describe, expect, it } from 'vitest';
import { QUALITY_TIERS, effectivePixelRatio, normalizeRenderScale } from './tiers';

describe('quality tiers', () => {
  it('matches the four rendering budget rows', () => {
    expect(QUALITY_TIERS.low).toMatchObject({
      dprCap: 1, renderScale: { min: 0.7, initial: 0.85, max: 1 },
      dynamicLights: 0, particles: 400, vfxDrawCalls: 8, targetFps: 30,
      drawCalls: 60, gpuMemoryMB: 96,
    });
    expect(QUALITY_TIERS.mid).toMatchObject({
      dprCap: 1.5, renderScale: { min: 0.7, initial: 0.9, max: 1 },
      dynamicLights: 2, particles: 1_200, vfxDrawCalls: 16, targetFps: 60,
      drawCalls: 100, gpuMemoryMB: 160,
    });
    expect(QUALITY_TIERS.high).toMatchObject({
      dprCap: 2, renderScale: { min: 0.75, initial: 1, max: 1 },
      dynamicLights: 4, particles: 3_000, vfxDrawCalls: 24, targetFps: 60,
      drawCalls: 150, gpuMemoryMB: 256,
    });
    expect(QUALITY_TIERS.ultra).toMatchObject({
      dprCap: 2, renderScale: { min: 0.85, initial: 1, max: 1 },
      dynamicLights: 8, particles: 6_000, vfxDrawCalls: 32, targetFps: 60,
      drawCalls: 250, gpuMemoryMB: 512,
    });
  });

  it('rounds scale to twentieths and applies both tier and scale caps', () => {
    expect(normalizeRenderScale(0.874, 'mid')).toBe(0.85);
    expect(normalizeRenderScale(0.701, 'high')).toBe(0.75);
    expect(effectivePixelRatio(3, 'mid', 0.85)).toBe(1.275);
    expect(effectivePixelRatio(1, 'low', 0.7)).toBe(0.7);
  });
});
