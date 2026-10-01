import type { Command } from '@tianshu/core';

export interface UiCommandIntent {
  readonly type: 'core-command';
  readonly command: Command;
}
type Listener = (intent: UiCommandIntent) => void;
const listeners = new Set<Listener>();

export const uiBus = {
  emit(intent: UiCommandIntent): void {
    for (const listener of listeners) listener(intent);
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
