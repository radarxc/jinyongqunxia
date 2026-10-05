import type { Command, DispatchResult, GameState } from '@tianshu/core';

export interface CoreRemote {
  dispatch(command: Command): DispatchResult | Promise<DispatchResult>;
  tick(): DispatchResult | Promise<DispatchResult>;
  snapshot(): GameState | Promise<GameState>;
}

export interface CoreHost {
  readonly mode: 'worker' | 'main-thread';
  dispatch(command: Command): Promise<DispatchResult>;
  tick(): Promise<DispatchResult>;
  snapshot(): Promise<GameState>;
  dispose(): void;
}
