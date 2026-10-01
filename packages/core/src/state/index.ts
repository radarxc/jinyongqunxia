import type { RngState, RngStreamName } from '../rng';

export interface GameState {
  readonly meta: {
    readonly coreVersion: string;
    readonly rngProtocol: number;
    readonly stateVersion: number;
    readonly worldTick: number;
    readonly rng: Readonly<Record<RngStreamName, RngState>>;
  };
  readonly battle: null;
}

export function cloneGameState(state: GameState): GameState {
  return {
    meta: {
      coreVersion: state.meta.coreVersion,
      rngProtocol: state.meta.rngProtocol,
      stateVersion: state.meta.stateVersion,
      worldTick: state.meta.worldTick,
      rng: {
        battle: [...state.meta.rng.battle] as RngState,
        loot: [...state.meta.rng.loot] as RngState,
        world: [...state.meta.rng.world] as RngState,
        ai: [...state.meta.rng.ai] as RngState,
        qiyu: [...state.meta.rng.qiyu] as RngState,
      },
    },
    battle: null,
  };
}
