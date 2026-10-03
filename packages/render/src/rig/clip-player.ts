import type { RigClip, RigClipEventType } from './clip';
import { createClipProjection, isClipMainHandFar, projectClipFrame, resetClipProjection, type ClipProjection } from './project';
import type { ClipPlayOptions, PartPoseBuffer, RigSet } from './types';

export const CLIP_SAMPLE_FPS = 12; export const CLIP_CROSSFADE_SECONDS = .16;
export type ClipPlayerPhase = 'playing' | 'fading-out' | 'stopped';
export interface ClipPlayer {
  readonly clip: RigClip; readonly projection: ClipProjection; readonly output: PartPoseBuffer;
  readonly phase: ClipPlayerPhase; readonly blend: number; readonly frame: number; readonly rate: number;
  readonly fallbackToGait: boolean; readonly mirrored: boolean; readonly facingYawDeg: number;
  readonly projectionAllocations: 0; readonly projectionGeneration: number;
  setFacingYawDeg(value: number): void; setSpeedMps(value: number): void;
  update(dtSeconds: number): PartPoseBuffer; stop(): void;
}
export interface ClipPlayerOptions extends ClipPlayOptions {
  readonly speedMps?: number; readonly movement?: boolean; readonly nearHandWeapon?: boolean;
  readonly yawAssistMaxDeg?: number; readonly rigSet?: RigSet;
}

function finitePositive(value: number | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  if (!Number.isFinite(value) || value <= 0) throw new RangeError('RIG_CLIP_RATE'); return value;
}
function movementRate(clip: RigClip, speedMps: number | undefined): number {
  if (!Number.isFinite(speedMps) || clip.nativeSpeedMmps <= 0) return Number.NaN;
  return Math.round((speedMps as number) / (clip.nativeSpeedMmps / 1000) * 1_000_000) / 1_000_000;
}
function clampYawAssist(clip: RigClip, requested: number | undefined): number {
  const cap = Math.min(30, clip.viewHints.yawAssistMaxCdeg / 100); const value = requested ?? 0;
  return Math.min(cap, Math.max(-cap, Number.isFinite(value) ? value : 0));
}
export function createClipPlayer(clip: RigClip, options: ClipPlayerOptions): ClipPlayer {
  if (!Number.isFinite(options.facingYawDeg)) throw new RangeError('RIG_CLIP_FACING');
  const projection = createClipProjection(clip, options.rigSet); const probe = createClipProjection(clip, options.rigSet);
  const movement = options.movement ?? clip.nativeSpeedMmps > 0; let rate = movement ? movementRate(clip, options.speedMps) : finitePositive(options.rate, 1);
  let fallbackToGait = movement && !(rate >= .8 && rate <= 1.4); if (fallbackToGait) rate = 1;
  let facingYawDeg = options.facingYawDeg + clampYawAssist(clip, options.yawAssistMaxDeg);
  projectClipFrame(clip, probe, 0, facingYawDeg, false); let mirrored = options.nearHandWeapon === true && isClipMainHandFar(clip, probe);
  resetClipProjection(projection);
  let elapsed = 0; let fadeInElapsed = 0; let eventCursor = -Number.EPSILON; let phase: ClipPlayerPhase = fallbackToGait ? 'stopped' : 'playing';
  let fadeElapsed = 0; let fadeStartBlend = 1; let lastProjectedFrame = -1; let projectionGeneration = 0;
  const emit = (type: RigClipEventType): void => options.onEvent?.(type);
  const duration = Math.max(clip.durationMs / 1_000, 1 / clip.fps);

  function sampledFrame(time: number): number {
    const local = clip.loop ? time - Math.floor(time / duration) * duration : Math.min(time, duration);
    const sampled = Math.floor(local * CLIP_SAMPLE_FPS) / CLIP_SAMPLE_FPS;
    return Math.min(clip.frameCount - 1, Math.floor(sampled * clip.fps));
  }
  function advanceEvents(nextElapsed: number): void {
    const firstLoop = clip.loop ? Math.max(0, Math.floor(Math.max(0, eventCursor) / duration)) : 0;
    const lastLoop = clip.loop ? Math.floor(nextElapsed / duration) : 0;
    for (let loop = firstLoop; loop <= lastLoop; loop += 1) {
      const base = loop * duration;
      for (let index = 0; index < clip.events.length; index += 1) {
        const event = clip.events[index]!; const eventTime = base + event.frame / clip.fps;
        const playbackTime = event.type === 'end' ? base + duration : eventTime;
        if (playbackTime > eventCursor && playbackTime <= nextElapsed) emit(event.type);
      }
    }
    eventCursor = nextElapsed;
  }
  function projectCurrentFrame(frame: number): void {
    if (options.nearHandWeapon === true) {
      projectClipFrame(clip, probe, frame, facingYawDeg, false);
      mirrored = isClipMainHandFar(clip, probe);
    }
    projectClipFrame(clip, projection, frame, facingYawDeg, mirrored);
    lastProjectedFrame = frame; projectionGeneration += 1;
  }
  const player: ClipPlayer = {
    clip, projection, get output() { return projection.output; },
    get phase() { return phase; },
    get blend() {
      if (phase === 'stopped') return 0;
      if (phase === 'fading-out') return fadeStartBlend * Math.max(0, 1 - fadeElapsed / CLIP_CROSSFADE_SECONDS);
      return Math.min(1, fadeInElapsed / CLIP_CROSSFADE_SECONDS);
    },
    get frame() { return sampledFrame(elapsed); },
    get rate() { return rate; }, get fallbackToGait() { return fallbackToGait; }, projectionAllocations: 0,
    get projectionGeneration() { return projectionGeneration; },
    get mirrored() { return mirrored; }, get facingYawDeg() { return facingYawDeg; },
    setFacingYawDeg(value) {
      if (!Number.isFinite(value)) throw new RangeError('RIG_CLIP_FACING');
      facingYawDeg = value + clampYawAssist(clip, options.yawAssistMaxDeg);
      resetClipProjection(probe); resetClipProjection(projection); lastProjectedFrame = -1;
    },
    setSpeedMps(value) {
      if (!movement) return; const next = movementRate(clip, value); fallbackToGait = !(next >= .8 && next <= 1.4); rate = fallbackToGait ? 1 : next;
      if (fallbackToGait && phase === 'playing') {
        fadeStartBlend = Math.min(1, fadeInElapsed / CLIP_CROSSFADE_SECONDS); phase = 'fading-out'; fadeElapsed = 0;
      }
    },
    update(dtSeconds) {
      if (phase === 'stopped') return projection.output;
      const dt = Number.isFinite(dtSeconds) ? Math.max(0, dtSeconds) : 0;
      if (phase === 'fading-out') { fadeElapsed += dt; if (fadeElapsed >= CLIP_CROSSFADE_SECONDS) phase = 'stopped'; }
      else {
        fadeInElapsed += dt; elapsed += dt * rate; advanceEvents(elapsed);
        if (!clip.loop && elapsed >= duration) { elapsed = duration; fadeStartBlend = Math.min(1, fadeInElapsed / CLIP_CROSSFADE_SECONDS); phase = 'fading-out'; fadeElapsed = 0; }
      }
      if (player.frame !== lastProjectedFrame) projectCurrentFrame(player.frame);
      return projection.output;
    },
    stop() { if (phase === 'playing') { fadeStartBlend = Math.min(1, fadeInElapsed / CLIP_CROSSFADE_SECONDS); phase = 'fading-out'; fadeElapsed = 0; } },
  };
  projectCurrentFrame(0); return player;
}
