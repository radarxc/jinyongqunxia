import { performance } from 'node:perf_hooks';
import { describe, expect, it } from 'vitest';
import { effectDisplayScale, effectLocalBounds, sampleVfxBatchFrame, VFX_POOL_CAPACITY } from './stage';
import type { VfxComposition } from './types';

const COMPOSITION: VfxComposition = {
  kind: 'TemplateComposition', version: 1, canvas_px: [1024, 512], background: '#000000',
  emit_at_px: [300, 256], angle_deg: 0, range_hex: 2, pixels_per_hex: 100, length_px: 560, scale: [1, 1], emitter_scale: 0.3,
  rhythm: { charge_s: 0.1, release_s: 0.14, sustain_s: 0.16, dissipate_s: 0.2 },
  transition: { interpolation: 'crossfade', scale_from: 0.9, drift_fraction: 0, brightness: [1, 1, 1, 1, 1] },
  output: { fps: 20, loop: false, loop_gap_s: 0 },
  template: { mode: 'qi_projection', nature: 'neutral', delivery: 'palm', color: '#f4f4f4', params: { duration_s: 0.6 } },
};

describe('VFX desktop CPU envelope', () => {
  it('updates 48 pooled effects inside a 60 fps frame budget', () => {
    const active = Array.from({ length: VFX_POOL_CAPACITY }, () => COMPOSITION); const output = new Float32Array(VFX_POOL_CAPACITY * 15);
    for (let warmup = 0; warmup < 120; warmup += 1) sampleVfxBatchFrame(active, warmup % 60 / 100, output);
    const samples: number[] = [];
    for (let frame = 0; frame < 600; frame += 1) {
      const start = performance.now();
      sampleVfxBatchFrame(active, frame % 60 / 100, output);
      samples.push(performance.now() - start);
    }
    samples.sort((a, b) => a - b); const p95 = samples[Math.floor(samples.length * 0.95)]!;
    process.stdout.write(`[vfx-perf] active=48 p95=${p95.toFixed(3)}ms budget=16.67ms\n`);
    expect(p95).toBeLessThan(16.67); expect(output[0]).toBeGreaterThanOrEqual(0);
    sampleVfxBatchFrame(active, 0.24, output);
    expect(output[5]).toBe(0); expect(output[6]).toBeCloseTo(0.08);
    expect(output[7]).toBe(1); expect(output[8]).toBe(0);
  });

  it('maps the authored reference length to the settled screen target exactly once', () => {
    const effect = { size_px: [680, 320], direction: [1, 0], reference_length_px: 554,
      root_width_px: 183, blend: 'screen', frames: [{ file: 'dragon.png', anchor_px: [63, 160], phase: 0 }] } as const;
    const emitter = { file: 'palm.png', size_px: [1254, 1254], emit_point_px: [850, 704],
      direction: [1, 0], emission_width_px: 320 } as const;
    const dragon = { ...COMPOSITION, scale: [1, 2], emitter_scale: 0.6, effect, emitter } satisfies VfxComposition;
    const [lengthScale, widthScale] = effectDisplayScale(dragon, 180);
    expect(effect.reference_length_px * lengthScale).toBeCloseTo(180);
    expect(effect.root_width_px * widthScale).toBeCloseTo(320 * 0.6 * 0.2 * 2);
  });

  it('uses one root-aligned union quad for temporal frame interpolation', () => {
    const effect = { size_px: [100, 80], direction: [1, 0], reference_length_px: 70,
      root_width_px: 20, blend: 'normal', frames: [
        { file: 'a.png', anchor_px: [10, 40], phase: 0 },
        { file: 'b.png', anchor_px: [20, 35], phase: 1 },
      ] } as const;
    expect(effectLocalBounds(effect)).toEqual([-20, -40, 110, 85]);
  });
});
