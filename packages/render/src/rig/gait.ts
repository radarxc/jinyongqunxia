import type { Dir8, MotionMode, RigView, WeightClass } from './types';

const TAU = Math.PI * 2;
const WEIGHT = {
  light: { amplitude: 1.08, period: 0.94, stride: 1.06, inertia: 1.1 },
  medium: { amplitude: 1, period: 1, stride: 1, inertia: 1 },
  heavy: { amplitude: 0.78, period: 1.16, stride: 0.86, inertia: 0.72 },
} as const satisfies Record<WeightClass, object>;

const MOTION = {
  walk: { hip: 24, knee: 34, kneeBase: 4, ankle: 12, shoulder: 18, elbowBase: 18, elbow: 10, bob: 0.025, stride: 0.7 },
  run: { hip: 42, knee: 64, kneeBase: 10, ankle: 20, shoulder: 30, elbowBase: 58, elbow: 12, bob: 0.055, stride: 1.2 },
} as const;

export interface GaitPose {
  hipL: number; hipR: number; kneeL: number; kneeR: number;
  ankleL: number; ankleR: number; shoulderL: number; shoulderR: number;
  elbowL: number; elbowR: number; bodyY: number; torsoRoll: number; torsoLean: number;
}

export interface DirectionView { readonly view: RigView; readonly mirrored: boolean }
export function createGaitPose(): GaitPose {
  return { hipL: 0, hipR: 0, kneeL: 0, kneeR: 0, ankleL: 0, ankleR: 0,
    shoulderL: 0, shoulderR: 0, elbowL: 0, elbowR: 0, bodyY: 0, torsoRoll: 0, torsoLean: 0 };
}

function fract(value: number): number {
  return value - Math.floor(value);
}

function legSwing(phase: number): number {
  return Math.sin(TAU * phase) + 0.12 * Math.sin(2 * TAU * phase + Math.PI / 6);
}

function kneeBend(phase: number): number {
  return Math.max(0, Math.sin(TAU * (phase - 0.08))) ** 1.25;
}

function ankleSwing(phase: number): number {
  return 0.7 * Math.sin(TAU * (phase + 0.08)) + 0.3 * Math.sin(2 * TAU * phase);
}

function shoulderSwing(phase: number): number {
  return -Math.sin(TAU * phase) - 0.08 * Math.sin(2 * TAU * phase - Math.PI / 4);
}

function elbowBend(phase: number): number {
  return 0.5 + 0.5 * Math.cos(TAU * (phase - 0.1));
}

export function motionModeForSpeed(speedMps: number, previous?: MotionMode): MotionMode {
  if (!Number.isFinite(speedMps) || speedMps <= 0.05) return 'idle';
  if (previous === 'run' && speedMps >= 1.9) return 'run';
  if (previous === 'walk' && speedMps < 2.1) return 'walk';
  return speedMps >= 2 ? 'run' : 'walk';
}

export function gaitPeriod(mode: MotionMode, speedMps: number, weight: WeightClass): number {
  if (mode === 'idle') return 3.6;
  const config = MOTION[mode];
  const raw = (2 * config.stride * WEIGHT[weight].stride) / Math.max(speedMps, 0.05);
  const [minimum, maximum] = mode === 'walk' ? [0.6, 1.8] : [0.38, 0.9];
  return Math.min(maximum, Math.max(minimum, raw * WEIGHT[weight].period));
}

export function sampleGaitInto(out: GaitPose, mode: Exclude<MotionMode, 'idle'>, weight: WeightClass, phase: number): GaitPose {
  const config = MOTION[mode];
  const scale = WEIGHT[weight].amplitude;
  const left = fract(phase);
  const right = fract(phase + 0.5);
  out.hipL = config.hip * scale * legSwing(left); out.hipR = config.hip * scale * legSwing(right);
  out.kneeL = config.kneeBase + config.knee * scale * kneeBend(left); out.kneeR = config.kneeBase + config.knee * scale * kneeBend(right);
  out.ankleL = config.ankle * scale * ankleSwing(left); out.ankleR = config.ankle * scale * ankleSwing(right);
  out.shoulderL = config.shoulder * scale * shoulderSwing(left); out.shoulderR = config.shoulder * scale * shoulderSwing(right);
  out.elbowL = config.elbowBase + config.elbow * scale * elbowBend(left); out.elbowR = config.elbowBase + config.elbow * scale * elbowBend(right);
  out.bodyY = config.bob * scale * (-Math.cos(2 * TAU * left) + 0.15 * Math.sin(TAU * left));
  out.torsoRoll = -2.5 * scale * Math.sin(TAU * left) * (mode === 'run' ? 1.4 : 1);
  out.torsoLean = (mode === 'run' ? 7 : 2) + (weight === 'heavy' ? 2 : 0);
  return out;
}

export function sampleGait(mode: Exclude<MotionMode, 'idle'>, weight: WeightClass, phase: number): GaitPose {
  return sampleGaitInto(createGaitPose(), mode, weight, phase);
}

export function sampleIdleInto(out: GaitPose, elapsedSeconds: number, phaseOffset = 0): GaitPose {
  const breath = Math.sin(TAU * (elapsedSeconds / 3.6 + phaseOffset));
  out.hipL = 0; out.hipR = 0; out.kneeL = 0; out.kneeR = 0; out.ankleL = 0; out.ankleR = 0;
  out.shoulderL = 0.8 * breath; out.shoulderR = -0.8 * breath; out.elbowL = 18; out.elbowR = 18;
  out.bodyY = 0.004 * breath; out.torsoRoll = 0; out.torsoLean = 0;
  return out;
}

export function sampleIdle(elapsedSeconds: number, phaseOffset = 0): GaitPose {
  return sampleIdleInto(createGaitPose(), elapsedSeconds, phaseOffset);
}

export function quantizePoseTime(elapsedSeconds: number, stepFps: number): number {
  return stepFps > 0 ? Math.floor(elapsedSeconds * stepFps) / stepFps : elapsedSeconds;
}

export function resolveDirection(dir8: Dir8, previousMirrored = false): DirectionView {
  if (dir8 === 0) return { view: 'front34', mirrored: previousMirrored };
  if (dir8 === 4) return { view: 'back34', mirrored: previousMirrored };
  if (dir8 === 2 || dir8 === 6) return { view: 'side', mirrored: dir8 === 6 };
  return { view: dir8 === 1 || dir8 === 7 ? 'front34' : 'back34', mirrored: dir8 >= 5 };
}

export function stableIdlePhase(stableId: number): number {
  let value = stableId | 0;
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  return ((value ^ (value >>> 16)) >>> 0) / 0x1_0000_0000;
}

export function weightTuning(weight: WeightClass): (typeof WEIGHT)[WeightClass] { return WEIGHT[weight]; }
