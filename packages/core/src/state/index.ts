export * from './character';
export * from './clock';
export * from './equipment';
export * from './initial';
export * from './inventory';
export * from './json';
export * from './models';
export * from './new-game';
export * from './migrations';
export * from './story';
export * from './summary';
export * from './validate';
export * from './world-items';

import type { GameState } from './models';
import { cloneJsonValue } from './json';

/**
 * Copy the complete rule state across an ownership boundary.
 *
 * The implementation deliberately uses the core JSON clone rather than the
 * host's `structuredClone`: GameState is a canonical JSON value, and keeping
 * this operation in core gives browser, worker, and Node hosts one behavior.
 * Command dispatch itself does not call this helper; its hot path uses the
 * transaction journal and only clones RNG streams on first access.
 */
export function cloneGameState(state: GameState): GameState {
  return cloneJsonValue(state);
}
