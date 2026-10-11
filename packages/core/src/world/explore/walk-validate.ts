import type { ExploreWalkState } from './types';

export function isPace(value: unknown): value is ExploreWalkState['pace'] {
  return value === 'walk' || value === 'run';
}
