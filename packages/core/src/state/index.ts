export * from './character';
export * from './clock';
export * from './equipment';
export * from './initial';
export * from './inventory';
export * from './models';
export * from './story';
export * from './validate';
export * from './world-items';

import type { GameState } from './models';

function cloneJsonValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneJsonValue(entry)) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const clone: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      clone[key] = cloneJsonValue(entry);
    }
    return clone as T;
  }
  return value;
}

export function cloneGameState(state: GameState): GameState {
  return cloneJsonValue(state);
}
