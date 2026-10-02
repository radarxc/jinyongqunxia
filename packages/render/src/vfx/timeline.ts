import type { VfxComposition, VfxTimelineSample } from './types';

const clamp = (value: number, low = 0, high = 1) => Math.min(high, Math.max(low, value));
export const smoothstep = (value: number): number => {
  const x = clamp(value); return x * x * (3 - 2 * x);
};
const durations = (composition: VfxComposition) => [composition.rhythm.charge_s,
  composition.rhythm.release_s, composition.rhythm.sustain_s, composition.rhythm.dissipate_s] as const;

export function durationOf(composition: VfxComposition): number {
  const values = durations(composition);
  if (values.some(value => !Number.isFinite(value) || value < 0)) throw new Error('Invalid rhythm');
  const total = Number(values.reduce((sum, value) => sum + value, 0).toFixed(12));
  if (!(total > 0)) throw new Error('Duration must be positive');
  const expected = composition.template?.params['duration_s'];
  if (composition.template && (!Number.isFinite(expected) || (expected ?? 0) <= 0 ||
    Math.abs(total - expected!) > 1e-9)) throw new Error('Template duration_s must equal the rhythm duration');
  if (composition.template?.mode === 'plain_strike' && total > 0.4 + 1e-9)
    throw new Error('Plain strike duration must not exceed 0.4 seconds');
  return total;
}

function templateEnvelope(composition: VfxComposition, phase: number): Partial<VfxTimelineSample> {
  const template = composition.template;
  if (!template || template.mode === 'qi_projection') return {};
  const attack = 0.18;
  const envelope = phase < attack ? smoothstep(phase / attack)
    : 1 - smoothstep((phase - attack) / (1 - attack));
  if (template.mode === 'plain_strike') return { alpha: envelope, brightness: 1,
    scale: 0.85 + 0.15 * smoothstep(phase / attack), driftPx: 0,
    stage: phase < attack ? '出招' : '收势', mask: { enabled: false, softness: 0.08, reveal: 1, erase: 0 } };
  const count = template.params['copies'] ?? 4; const spacing = template.params['spacing_px'] ?? 28;
  const stretch = template.params['stretch'] ?? 0.04;
  if (!Number.isInteger(count) || count < 3 || count > 5) throw new Error('Afterimage copies must be 3 to 5');
  if (!Number.isFinite(spacing) || spacing <= 0 || !Number.isFinite(stretch) || stretch < 0 || stretch > 0.1)
    throw new Error('Invalid afterimage geometry');
  return { alpha: 0, brightness: 1, driftPx: 0, stage: '残影',
    ghosts: Array.from({ length: count }, (_, index) => ({
      alpha: envelope * 0.44 * (1 - index / count * 0.65),
      offsetPx: (index + 1) * spacing * (1 + 0.25 * smoothstep((phase - attack) / (1 - attack))),
      stretch: 1 + (index + 1) * stretch * envelope,
    })) };
}

export function sampleTimeline(composition: VfxComposition, seconds: number): VfxTimelineSample {
  if (!Number.isFinite(seconds)) throw new Error('Time must be finite');
  const duration = durationOf(composition); const time = clamp(seconds, 0, duration);
  const [charge, release, sustain, dissipate] = durations(composition);
  const endSustain = charge + release + sustain; const phase = time / duration;
  const frames = composition.effect?.frames ?? [{ file: '', anchor_px: [0, 0] as const, phase: 0 },
    { file: '', anchor_px: [0, 0] as const, phase: 1 }];
  let frameIndex = 0;
  while (frameIndex + 1 < frames.length && frames[frameIndex + 1]!.phase <= phase) frameIndex += 1;
  const nextFrameIndex = Math.min(frameIndex + 1, frames.length - 1);
  const span = frames[nextFrameIndex]!.phase - frames[frameIndex]!.phase;
  const mix = composition.transition.interpolation === 'hold' || span === 0 ? 0
    : clamp((phase - frames[frameIndex]!.phase) / span);
  let stage = '持续'; let alpha = 1; let scale = 1; let driftPx = 0; let reveal = 1; let erase = 0;
  if (time < charge) { stage = '凝聚'; reveal = smoothstep(time / charge); alpha = reveal;
    scale = composition.transition.scale_from + (1 - composition.transition.scale_from) * reveal;
  } else if (time < charge + release) stage = '发出';
  else if (time >= endSustain) { stage = '消散'; erase = dissipate > 0 ? smoothstep((time - endSustain) / dissipate) : 1;
    alpha = 1 - erase; driftPx = composition.transition.drift_fraction *
      (composition.length_px ?? composition.range_hex * composition.pixels_per_hex) * erase; }
  if (time === duration) { alpha = 0; erase = 1; }
  const boundaries = [0, charge, charge + release, endSustain, duration]; let segment = 0;
  while (segment < 4 && boundaries[segment + 1]! <= time) segment += 1;
  const brightness = segment === 4 ? composition.transition.brightness[4]
    : composition.transition.brightness[segment]! + (composition.transition.brightness[segment + 1]!
      - composition.transition.brightness[segment]!) * (time - boundaries[segment]!)
      / (boundaries[segment + 1]! - boundaries[segment]!);
  const mask = composition.transition.directional_mask;
  return { time, duration, phase, frameIndex, nextFrameIndex, mix, alpha, scale, driftPx, brightness, stage,
    mask: { enabled: mask?.enabled ?? false, softness: mask?.softness ?? 0.08, reveal, erase },
    ...templateEnvelope(composition, phase) };
}

export function directionalMaskAt(q: number, mask: VfxTimelineSample['mask']): number {
  if (!mask.enabled) return 1;
  const edge = (front: number) => smoothstep((q - front + mask.softness / 2) / mask.softness);
  const reveal = mask.reveal <= 0 ? 0 : mask.reveal >= 1 ? 1 : 1 - edge(mask.reveal);
  const erase = mask.erase <= 0 ? 1 : mask.erase >= 1 ? 0 : edge(mask.erase);
  return reveal * erase;
}

export function playbackTime(composition: VfxComposition, seconds: number) {
  if (!Number.isFinite(seconds)) throw new Error('Elapsed time must be finite');
  const duration = durationOf(composition); const elapsed = Math.max(0, seconds);
  if (!composition.output.loop) return { time: Math.min(elapsed, duration), inGap: false,
    ended: elapsed >= duration, cycleTime: Math.min(elapsed, duration) };
  const period = duration + composition.output.loop_gap_s; const cycleTime = elapsed % period;
  return { time: Math.min(cycleTime, duration), inGap: cycleTime >= duration, ended: false, cycleTime };
}
