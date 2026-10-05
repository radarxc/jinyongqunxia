import { canonicalJson, type JsonValue } from '@tianshu/shared';
import { dispatchCommand, type Command, type CoreContent, type DispatchResult } from '../command';
import { assertCanonicalGameState, cloneGameState, createNewGameState, type GameState,
  type NewGameInput } from '../state';
import { firstSleepQueryForState, type FirstSleepAllocationQuery,
  type SleepAllocation } from '../progression';

export const CORE_VERSION = '0.0.0';
export const CORE_BUILD = '20261002-core-bus';
export interface CreateCoreOptions { readonly state?: GameState; readonly content?: CoreContent }
export interface Core {
  dispatch(command: Command): DispatchResult;
  tick(): DispatchResult;
  snapshot(): GameState;
  serialize(): JsonValue;
  canonicalStateJson(): string;
  firstSleepAllocation(draft?: SleepAllocation | null): FirstSleepAllocationQuery | null;
}
function legacyTickResult(result: DispatchResult): DispatchResult {
  // Pre-command-bus CoreHost callers inspected tick().accepted. Keep a non-wire alias while
  // dispatch() and serialized Worker results expose only the canonical `ok` discriminant.
  Object.defineProperty(result, 'accepted', { value: result.ok, enumerable: false });
  return result;
}

export function createCore(masterSeed = 1, options: CreateCoreOptions = {}): Core {
  const state = options.state ? cloneGameState(options.state) : createNewGameState({
    masterSeed, coreVersion: CORE_VERSION, coreBuild: CORE_BUILD, difficulty: 'diff_xiake',
    identity: { name: '无名侠客', gender: 'unspecified', appearance: 'appearance_default',
      pronoun: '你', originId: 'origin_wenshiguan' },
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
    firstSleepAllocation: (draft = null) => firstSleepQueryForState(state, draft),
  };
}

export function createCoreFromState(state: GameState, content: CoreContent = {}): Core {
  return createCore(state.meta.masterSeed, { state, content });
}

export function createNewGameCore(input: NewGameInput, content: CoreContent = {}): Core {
  const state = createNewGameState({ ...input, coreVersion: input.coreVersion ?? CORE_VERSION,
    coreBuild: input.coreBuild ?? CORE_BUILD });
  return createCore(input.masterSeed, { state, content });
}

export type { DispatchResult } from '../command';
