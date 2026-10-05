import { describe, expect, it } from 'vitest';
import { directionalMaskAt, durationOf, playbackTime, sampleTimeline } from './timeline';
import type { VfxComposition } from './types';

const composition = {
  kind: 'TemplateComposition', version: 1, canvas_px: [1024, 512], emit_at_px: [300, 256],
  angle_deg: 0, range_hex: 1, pixels_per_hex: 100, length_px: 560, scale: [1, 1],
  emitter_scale: 1, background: '#000000',
  rhythm: { charge_s: 0.1, release_s: 0.14, sustain_s: 0.16, dissipate_s: 0.2 },
  transition: { interpolation: 'crossfade', scale_from: 0.8, drift_fraction: 0.1,
    brightness: [0.8, 1, 1, 1, 0.8], directional_mask: { enabled: true, softness: 0.08 } },
  output: { fps: 20, loop: false, loop_gap_s: 0.5, peak_phase: 0.4 },
  template: { mode: 'qi_projection', nature: 'yin', delivery: 'palm', shape: 'fan',
    color: '#5FB5B0', params: { duration_s: 0.6 } },
  effect: { size_px: [10, 10], direction: [1, 0], reference_length_px: 10,
    root_width_px: 2, blend: 'screen', frames: [
      { file: 'a.png', anchor_px: [0, 5], phase: 0 },
      { file: 'b.png', anchor_px: [0, 5], phase: 1 },
    ] },
} satisfies VfxComposition;

describe('VFX timeline', () => {
  it('samples the four phases without wall-clock state', () => {
    expect(durationOf(composition)).toBeCloseTo(0.6);
    expect(sampleTimeline(composition, 0)).toMatchObject({ stage: '凝聚', alpha: 0, frameIndex: 0 });
    expect(sampleTimeline(composition, 0.2)).toMatchObject({ stage: '发出' });
    expect(sampleTimeline(composition, 0.35)).toMatchObject({ stage: '持续' });
    expect(sampleTimeline(composition, 0.6)).toMatchObject({ stage: '消散', alpha: 0, frameIndex: 1 });
  });

  it('clamps one-shot playback and exposes an explicit loop gap', () => {
    expect(playbackTime(composition, 9)).toEqual({ time: 0.6, inGap: false, ended: true, cycleTime: 0.6 });
    const looping = { ...composition, output: { ...composition.output, loop: true } };
    expect(playbackTime(looping, 0.8)).toMatchObject({ time: 0.6, inGap: true, ended: false });
    expect(playbackTime(looping, 1.2).time).toBeCloseTo(0.1);
  });

  it('enforces the plain-strike cap and directional reveal', () => {
    const plain = { ...composition, template: { ...composition.template, mode: 'plain_strike' as const,
      params: { duration_s: 0.6 } } };
    expect(() => durationOf(plain)).toThrow(/0\.4/);
    expect(directionalMaskAt(0.2, { enabled: true, softness: 0.08, reveal: 0, erase: 0 })).toBe(0);
    expect(directionalMaskAt(0.2, { enabled: false, softness: 0.08, reveal: 0, erase: 1 })).toBe(1);
  });
});
