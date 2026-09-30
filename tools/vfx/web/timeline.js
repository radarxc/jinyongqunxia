// Seconds throughout. Pure functions: no browser, renderer or wall-clock dependency.
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const smoothstep = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const durations = c => ['charge_s', 'release_s', 'sustain_s', 'dissipate_s']
  .map(key => c.rhythm[key]);

export function durationOf(composition) {
  const values = durations(composition);
  if (values.some(x => !Number.isFinite(x) || x < 0)) throw new Error('Invalid rhythm');
  const total = values.reduce((a, b) => a + b, 0);
  if (!(total > 0)) throw new Error('Duration must be positive');
  return total;
}

export function sampleTimeline(composition, seconds) {
  if (!Number.isFinite(seconds)) throw new Error('Time must be finite');
  const duration = durationOf(composition), time = clamp(seconds, 0, duration);
  const [c, r, s, d] = durations(composition), endSustain = c + r + s;
  const phase = time / duration, transition = composition.transition;
  const frames = composition.effect.frames;
  let frameIndex = 0;
  while (frameIndex + 1 < frames.length && frames[frameIndex + 1].phase <= phase) frameIndex++;
  const nextFrameIndex = Math.min(frameIndex + 1, frames.length - 1);
  const span = frames[nextFrameIndex].phase - frames[frameIndex].phase;
  const mix = transition.interpolation === 'hold' || span === 0 ? 0
    : clamp((phase - frames[frameIndex].phase) / span);
  let stage, alpha = 1, scale = 1, driftPx = 0, reveal = 1, erase = 0;
  if (time < c) {
    stage = '凝聚';
    reveal = smoothstep(time / c); alpha = reveal;
    scale = transition.scale_from + (1 - transition.scale_from) * reveal;
  } else if (time < c + r) stage = '发出';
  else if (time < endSustain) stage = '持续';
  else {
    stage = '消散';
    erase = d > 0 ? smoothstep((time - endSustain) / d) : 1;
    alpha = 1 - erase;
    const length = composition.length_px ?? composition.range_hex * composition.pixels_per_hex;
    driftPx = transition.drift_fraction * length * erase;
  }
  // The terminal sample is invisible even if dissipation has zero duration.
  if (time === duration) { alpha = 0; erase = 1; }
  const boundaries = [0, c, c + r, endSustain, duration];
  let segment = 0;
  // At repeated boundaries choose the last value, as design/23 §5.1 requires.
  while (segment < 4 && boundaries[segment + 1] <= time) segment++;
  const brightness = segment === 4 ? transition.brightness[4]
    : transition.brightness[segment] + (transition.brightness[segment + 1]
      - transition.brightness[segment]) * (time - boundaries[segment])
      / (boundaries[segment + 1] - boundaries[segment]);
  const config = transition.directional_mask;
  return {time, duration, phase, frameIndex, nextFrameIndex, mix, alpha, scale,
    driftPx, brightness, stage, mask: {enabled: config?.enabled ?? false,
      softness: config?.softness ?? 0.08, reveal, erase}};
}

// Reference mask math for tests/adapters. q is distance from root / reference length.
export function directionalMaskAt(q, mask) {
  if (!mask.enabled) return 1;
  const edge = front => smoothstep((q - front + mask.softness / 2) / mask.softness);
  const reveal = mask.reveal <= 0 ? 0 : mask.reveal >= 1 ? 1 : 1 - edge(mask.reveal);
  const erase = mask.erase <= 0 ? 1 : mask.erase >= 1 ? 0 : edge(mask.erase);
  return reveal * erase;
}

// Convert elapsed playback seconds to a clamped sample and an explicit loop gap.
export function playbackTime(composition, seconds) {
  if (!Number.isFinite(seconds)) throw new Error('Elapsed time must be finite');
  const duration = durationOf(composition), elapsed = Math.max(0, seconds);
  if (!composition.output.loop) return {time: Math.min(elapsed, duration),
    inGap: false, ended: elapsed >= duration, cycleTime: Math.min(elapsed, duration)};
  const period = duration + composition.output.loop_gap_s;
  const cycleTime = elapsed % period;
  return {time: Math.min(cycleTime, duration), inGap: cycleTime >= duration,
    ended: false, cycleTime};
}
