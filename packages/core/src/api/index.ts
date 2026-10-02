import { canonicalJson, type JsonValue } from '@tianshu/shared';
import { dispatchCommand, type Command, type CoreContent, type DispatchResult } from '../command';
import { RNG_PROTOCOL, RNG_STREAMS, seedStream, type RngState, type RngStreamName } from '../rng';
import { assertCanonicalGameState, cloneGameState, createInitialGameState, type GameState } from '../state';

export const CORE_VERSION = '0.0.0';
export const CORE_BUILD = '20261002-core-bus';
export interface CreateCoreOptions { readonly state?: GameState; readonly content?: CoreContent }
export interface Core {
  dispatch(command: Command): DispatchResult;
  tick(): DispatchResult;
  snapshot(): GameState;
  serialize(): JsonValue;
  canonicalStateJson(): string;
}
function initialRng(masterSeed: number): Readonly<Record<RngStreamName, RngState>> {
  return Object.fromEntries(RNG_STREAMS.map((stream) => [stream, seedStream(masterSeed, stream)])) as
    unknown as Readonly<Record<RngStreamName, RngState>>;
}
function legacyTickResult(result: DispatchResult): DispatchResult {
  // Pre-command-bus CoreHost callers inspected tick().accepted. Keep a non-wire alias while
  // dispatch() and serialized Worker results expose only the canonical `ok` discriminant.
  Object.defineProperty(result, 'accepted', { value: result.ok, enumerable: false });
  return result;
}

export function createCore(masterSeed = 1, options: CreateCoreOptions = {}): Core {
  const state = options.state ? cloneGameState(options.state) : createInitialGameState({
    coreVersion: CORE_VERSION, coreBuild: CORE_BUILD, chapterId: 'ch01_tianlong',
    epochId: 'epoch_ch01', epochYear: 1093, rngProtocol: RNG_PROTOCOL, masterSeed,
    rng: initialRng(masterSeed),
  });
  assertCanonicalGameState(state);
  const dispatch = (command: Command): DispatchResult =>
    dispatchCommand(state, command, options.content);
  return {
    dispatch, tick: () => legacyTickResult(dispatch({ t: 'world/tick' })),
    snapshot: () => cloneGameState(state),
    serialize: () => { assertCanonicalGameState(state); return cloneGameState(state) as unknown as JsonValue; },
    canonicalStateJson: () => {
      assertCanonicalGameState(state); return canonicalJson(cloneGameState(state) as unknown as JsonValue);
    },
  };
}

export function createCoreFromState(state: GameState, content: CoreContent = {}): Core {
  return createCore(state.meta.masterSeed, { state, content });
}

export type { DispatchResult } from '../command';
