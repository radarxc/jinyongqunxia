/**
 * Save-shape facts for `mountedRegion.walk` needed by the first-session state validator. They
 * live under `state/` so the session static closure carries no `world/explore/**` module
 * (tech/15 §10); explore code re-exports them.
 */
export const MAX_WALK_PATH = 512;

export function isPace(value: unknown): value is 'walk' | 'run' {
  return value === 'walk' || value === 'run';
}
