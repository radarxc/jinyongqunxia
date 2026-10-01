import { canonicalJson, type JsonValue } from '@tianshu/shared';
import type { Command } from '../command';
import type { DomainEvent } from '../event';
import { RNG_STREAMS, seedStream, type RngState, type RngStreamName } from '../rng';
import { cloneGameState, type GameState } from '../state';

export const CORE_VERSION = '0.0.0';

export interface DispatchResult {
  readonly accepted: boolean;
  readonly events: readonly DomainEvent[];
}
export interface Core {
  dispatch(command: Command): DispatchResult;
  tick(): DispatchResult;
  snapshot(): GameState;
  serialize(): JsonValue;
  canonicalStateJson(): string;
}

function initialRng(masterSeed: number): Readonly<Record<RngStreamName, RngState>> {
  return Object.fromEntries(
    RNG_STREAMS.map((stream) => [stream, seedStream(masterSeed, stream)]),
  ) as unknown as Readonly<Record<RngStreamName, RngState>>;
}

export function createCore(masterSeed = 1): Core {
  let state: GameState = {
    meta: { coreVersion: CORE_VERSION, stateVersion: 0, worldTick: 0, rng: initialRng(masterSeed) },
    battle: null,
  };
  const dispatch = (command: Command): DispatchResult => {
    if (command.t !== 'world/tick') return { accepted: false, events: [] };
    const stateVersion = state.meta.stateVersion + 1;
    const worldTick = state.meta.worldTick + 1;
    state = { ...state, meta: { ...state.meta, stateVersion, worldTick } };
    return {
      accepted: true,
      events: [{ t: 'world/ticked', seq: stateVersion, stateVersion, worldTick }],
    };
  };
  return {
    dispatch,
    tick: () => dispatch({ t: 'world/tick' }),
    snapshot: () => cloneGameState(state),
    serialize: () => cloneGameState(state) as unknown as JsonValue,
    canonicalStateJson: () => canonicalJson(cloneGameState(state) as unknown as JsonValue),
  };
}
