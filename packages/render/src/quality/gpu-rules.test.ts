import { describe, expect, it } from 'vitest';
import { capTierForDevice, capTierForMemory, classifyGpu, classifyMemory, selectStaticTier } from './gpu-rules';

describe('GPU quality rules', () => {
  it('distinguishes old two-digit Mali names from new three-digit generations', () => {
    expect(classifyGpu('ANGLE (ARM, Mali-G71, OpenGL ES 3.2)')).toBe('low');
    expect(classifyGpu('ANGLE (ARM, Mali-G710, OpenGL ES 3.2)')).toBe('high');
  });

  it('sends opaque Apple GPUs to the visible benchmark', () => {
    expect(classifyGpu('Apple GPU')).toBe('benchmark');
    expect(selectStaticTier({ gpu: 'Apple GPU', memClass: 'L', maxTextureSize: 2_048 })).toBe('benchmark');
  });

  it('applies low capability and missing half-float hard caps after benchmarking', () => {
    expect(capTierForDevice('high', { memClass: 'L', maxTextureSize: 2_048 })).toBe('low');
    expect(capTierForDevice('ultra', { memClass: 'L', halfFloatColorBuffer: false })).toBe('mid');
  });

  it('caps GPU tier independently by memory class and embedded browser', () => {
    expect(capTierForMemory('ultra', 'S')).toBe('mid');
    expect(capTierForMemory('ultra', 'M')).toBe('high');
    expect(capTierForMemory('ultra', 'L')).toBe('ultra');
    expect(selectStaticTier({ gpu: 'Mali-G710', memClass: 'M', inAppBrowser: true })).toBe('mid');
  });

  it('keeps Chromium memory buckets separate from GPU speed and desktop defaults', () => {
    expect(classifyMemory({ mobile: false, deviceMemory: 4 })).toBe('S');
    expect(classifyMemory({ mobile: true, deviceMemory: 8 })).toBe('M');
    expect(classifyMemory({ mobile: false })).toBe('L');
    expect(classifyMemory({ mobile: true })).toBe('S');
    expect(classifyMemory({ mobile: true, ipad: true })).toBe('M');
    expect(classifyMemory({ mobile: true, deviceMemory: 8, verifiedRamGB: 12 })).toBe('L');
    expect(classifyMemory({ mobile: true, deviceMemory: 8, registeredClass: 'S' })).toBe('S');
  });
});
