import type { Command, CoreContent, DispatchResult } from '@tianshu/core/session';
import { cloneGameState } from '@tianshu/core/session';
import type { GameState } from '@tianshu/core/state';
import { dispatchCoreCommand } from './core-dispatch';

export interface AsyncCore {
  dispatch(command: Command): Promise<DispatchResult>; snapshot(): GameState;
}
export function createAsyncCore(state: GameState, content: CoreContent = {}): AsyncCore {
  const owned = cloneGameState(state);
  return { dispatch: (command) => dispatchCoreCommand(owned, command, content),
    snapshot: () => cloneGameState(owned) };
}
