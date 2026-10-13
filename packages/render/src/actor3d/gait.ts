import type { ActorGait } from './types';

export const DEFAULT_NATIVE_HPS = { walk: 0.612, run: 2.143 } as const;
export const GAIT_IDLE_THRESHOLD_MPS = 0.05;
export const GAIT_RUN_ENTER_MPS = 2.6;
export const GAIT_RUN_EXIT_MPS = 2.2;
export const GAIT_TIME_SCALE_MIN = 0.8;
export const GAIT_TIME_SCALE_MAX = 1.45;
export const CATCH_UP_LAG_M = 0.5;
export const CATCH_UP_MULTIPLIER_MAX = 1.15;
export const MAX_TURN_RAD_PER_SECOND = Math.PI * 3;

/** Chooses idle/walk/run without oscillating in the 2.2..2.6 m/s band. */
export function selectGait(prev: ActorGait, speedMps: number): ActorGait {
  if (speedMps < GAIT_IDLE_THRESHOLD_MPS) return 0;
  if (prev === 2) return speedMps < GAIT_RUN_EXIT_MPS ? 1 : 2;
  return speedMps > GAIT_RUN_ENTER_MPS ? 2 : 1;
}

/** Matches animation ground speed to route speed, clamped to the authored safe band. */
export function gaitTimeScale(speedMps: number, heightM: number, hps: number): number {
  const scale = speedMps / (hps * heightM);
  return Math.max(GAIT_TIME_SCALE_MIN, Math.min(GAIT_TIME_SCALE_MAX, scale));
}

/** Catch-up starts only after the actor trails its route sample by more than 0.5 m. */
export function catchUpMultiplier(lagM: number): number {
  return lagM > CATCH_UP_LAG_M ? CATCH_UP_MULTIPLIER_MAX : 1;
}

/** Applies the same catch-up multiplier to movement and animation playback. */
export function gaitPlaybackRate(
  speedMps: number, heightM: number, hps: number, lagM: number,
): number {
  return gaitTimeScale(speedMps, heightM, hps) * catchUpMultiplier(lagM);
}

function shortestAngleDelta(currentYawRad: number, targetYawRad: number): number {
  const turn = Math.PI * 2;
  let delta = (targetYawRad - currentYawRad) % turn;
  if (delta > Math.PI) delta -= turn;
  if (delta < -Math.PI) delta += turn;
  return delta;
}

/**
 * Advances yaw over the shortest arc with a two-frame smoothstep ease-out. A 180 degree turn at
 * 60 Hz is the physical-limit case: 20 saturated 9 degree steps finish in exactly one third second.
 */
export function stepActorYaw(currentYawRad: number, targetYawRad: number, dt: number): number {
  const delta = shortestAngleDelta(currentYawRad, targetYawRad);
  const maximum = MAX_TURN_RAD_PER_SECOND * Math.max(0, dt);
  const distance = Math.abs(delta);
  if (!(maximum > 0) || distance === 0) return currentYawRad;
  if (distance <= maximum + 1e-12) return currentYawRad + delta;
  const progress = Math.min(1, distance / (maximum * 2));
  const eased = progress * progress * (3 - 2 * progress);
  const step = maximum * eased;
  return currentYawRad + (delta < 0 ? -step : step);
}
