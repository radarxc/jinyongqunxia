import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleTimeline, durationOf, playbackTime, directionalMaskAt} from './timeline.js';

const fixture = () => ({
  effect: {frames: [0, 0.2, 0.4, 0.6, 0.8, 1].map(phase => ({phase, anchor_px: [10, 20]}))},
  length_px: 800, range_hex: 3, pixels_per_hex: 100,
  rhythm: {charge_s: 0.1, release_s: 0.15, sustain_s: 0.25, dissipate_s: 0.1},
  transition: {interpolation: 'crossfade', scale_from: 0.95, drift_fraction: 0.05,
    brightness: [0.8, 1.2, 1.5, 1.1, 0.7], directional_mask: {enabled: true, softness: 0.08}},
  output: {loop: true, loop_gap_s: 0.4, peak_phase: 0.25 / 0.6}
});
const near = (actual, expected, tolerance = 1e-10) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

test('stage boundaries, cubic envelope, geometry and brightness are independent', () => {
  const c = fixture();
  near(durationOf(c), 0.6);
  const halfCharge = sampleTimeline(c, 0.05);
  assert.equal(halfCharge.stage, '凝聚'); near(halfCharge.alpha, 0.5);
  near(halfCharge.scale, 0.975); near(halfCharge.brightness, 1);
  assert.equal(sampleTimeline(c, 0.1).stage, '发出');
  assert.equal(sampleTimeline(c, 0.25).stage, '持续');
  assert.equal(sampleTimeline(c, 0.5).stage, '消散');
  const halfFade = sampleTimeline(c, 0.55);
  near(halfFade.alpha, 0.5); near(halfFade.scale, 1);
  near(halfFade.driftPx, 20); near(halfFade.brightness, 0.9);
  assert.equal(sampleTimeline(c, 0).alpha, 0);
  assert.equal(sampleTimeline(c, 0.6).alpha, 0);
});

test('exact phase samples, irregular phase interpolation, hold and terminal frame', () => {
  const c = fixture();
  c.effect.frames = [0, 0.1, 0.7, 1].map(phase => ({phase}));
  const a = sampleTimeline(c, 0.24);
  assert.equal(a.frameIndex, 1); assert.equal(a.nextFrameIndex, 2); near(a.mix, 0.5);
  const boundary = sampleTimeline(c, 0.6 * 0.7);
  assert.equal(boundary.frameIndex, 2); near(boundary.mix, 0);
  const end = sampleTimeline(c, 0.6);
  assert.equal(end.frameIndex, 3); assert.equal(end.nextFrameIndex, 3); assert.equal(end.mix, 0);
  c.transition.interpolation = 'hold';
  const held = sampleTimeline(c, 0.24);
  assert.equal(held.frameIndex, 1); assert.equal(held.mix, 0);
});

test('zero-duration stages skip and coincident brightness boundaries take the later value', () => {
  const c = fixture();
  c.rhythm = {charge_s: 0, release_s: 0, sustain_s: 0.6, dissipate_s: 0};
  const start = sampleTimeline(c, 0);
  assert.equal(start.stage, '持续'); assert.equal(start.alpha, 1);
  near(start.brightness, 1.5); near(start.scale, 1);
  const end = sampleTimeline(c, 0.6);
  assert.equal(end.alpha, 0); near(end.brightness, 0.7);
  c.rhythm.sustain_s = 0;
  assert.throws(() => durationOf(c), /positive/);
  c.rhythm.charge_s = -1;
  assert.throws(() => durationOf(c), /rhythm/);
});

test('seek clamps out-of-range seconds and does not quantize the peak to output FPS', () => {
  const c = fixture();
  assert.equal(sampleTimeline(c, -100).time, 0);
  assert.equal(sampleTimeline(c, 100).time, durationOf(c));
  const exact = sampleTimeline(c, durationOf(c) * c.output.peak_phase);
  near(exact.time, 0.25); near(exact.alpha, 1); near(exact.brightness, 1.5);
  assert.throws(() => sampleTimeline(c, NaN), /finite/);
  assert.throws(() => sampleTimeline(c, Infinity), /finite/);
});

test('drift uses resolved visual length, falling back to the demonstration ruler', () => {
  const c = fixture();
  near(sampleTimeline(c, 0.55).driftPx, 800 * 0.05 * 0.5);
  delete c.length_px;
  near(sampleTimeline(c, 0.55).driftPx, 3 * 100 * 0.05 * 0.5);
  c.transition.drift_fraction = 0; c.transition.scale_from = 1;
  for (const t of [0, 0.03, 0.3, 0.55, 0.6]) {
    near(sampleTimeline(c, t).scale, 1); near(sampleTimeline(c, t).driftPx, 0);
  }
});

test('directional reveal and root-first erase include tails and exact zero residual endpoints', () => {
  const c = fixture();
  const charge = sampleTimeline(c, 0.05).mask;
  near(directionalMaskAt(0.1, charge), 1); near(directionalMaskAt(0.9, charge), 0);
  near(directionalMaskAt(0.5, charge), 0.5);
  near(directionalMaskAt(0.46, charge), 1); near(directionalMaskAt(0.54, charge), 0);
  const fade = sampleTimeline(c, 0.55).mask;
  near(directionalMaskAt(0.1, fade), 0); near(directionalMaskAt(0.9, fade), 1);
  for (const q of [-3, 0, 0.5, 1, 3]) {
    assert.equal(directionalMaskAt(q, sampleTimeline(c, 0).mask), 0);
    assert.equal(directionalMaskAt(q, sampleTimeline(c, 0.3).mask), 1);
    assert.equal(directionalMaskAt(q, sampleTimeline(c, 0.6).mask), 0);
  }
  delete c.transition.directional_mask;
  assert.equal(sampleTimeline(c, 0.05).mask.enabled, false);
  assert.equal(directionalMaskAt(9, sampleTimeline(c, 0.05).mask), 1);
});

test('loop gap holds precisely the endpoint without one extra FPS interval', () => {
  const c = fixture(), T = durationOf(c), period = T + c.output.loop_gap_s;
  assert.deepEqual(playbackTime(c, T), {time: T, inGap: true, ended: false, cycleTime: T});
  assert.equal(playbackTime(c, period - 0.001).inGap, true);
  assert.deepEqual(playbackTime(c, period), {time: 0, inGap: false, ended: false, cycleTime: 0});
  near(playbackTime(c, period * 120 + 0.15).time, 0.15);
  c.output.loop_gap_s = 0;
  near(playbackTime(c, T).time, 0);
  c.output.loop = false;
  assert.equal(playbackTime(c, T + 100).time, T);
  assert.equal(playbackTime(c, T).ended, true);
  assert.equal(playbackTime(c, T - 0.001).ended, false);
  assert.throws(() => playbackTime(c, Infinity), /finite/);
});
