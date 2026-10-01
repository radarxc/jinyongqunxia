import { canonicalJson, type JsonValue } from '@tianshu/shared';
import type { Command } from '../command';
import type { DomainEvent } from '../event';
import { RNG_PROTOCOL, RNG_STREAMS, seedStream, type RngState, type RngStreamName } from '../rng';
import { advanceGameClock, assertCanonicalGameState, cloneGameState,
  createInitialGameState, type GameState } from '../state';

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
  let state = createInitialGameState({ coreVersion: CORE_VERSION, chapterId: 'ch01_tianlong',
    epochId: 'epoch_ch01', epochYear: 1093, rngProtocol: RNG_PROTOCOL,
    rng: initialRng(masterSeed) });
  const dispatch = (command: Command): DispatchResult => {
    if (command.t !== 'world/tick') return { accepted: false, events: [] };
    const stateVersion = state.meta.stateVersion + 1;
    const worldTick = state.meta.worldTick + 1;
    const clock = advanceGameClock(state.chapter.clock, 1).clock;
    state = { ...state, meta: { ...state.meta, stateVersion, worldTick, nextEventSeq: state.meta.nextEventSeq + 1 },
      chapter: { ...state.chapter, worldYear: clock.epochYear + clock.yearOffset, clock } };
    return {
      accepted: true,
      events: [{ t: 'world/ticked', seq: stateVersion, stateVersion, worldTick }],
    };
  };
  return {
    dispatch,
    tick: () => dispatch({ t: 'world/tick' }),
    snapshot: () => cloneGameState(state),
    serialize: () => { assertCanonicalGameState(state); return cloneGameState(state) as unknown as JsonValue; },
    canonicalStateJson: () => { assertCanonicalGameState(state); return canonicalJson(cloneGameState(state) as unknown as JsonValue); },
  };
}
