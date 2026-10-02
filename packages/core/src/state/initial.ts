import type { RngState, RngStreamName } from '../rng';
import { createEmptyEquipment } from './equipment';
import { createGameClock } from './clock';
import type { GameState } from './models';

export interface InitialGameStateInput {
  readonly coreVersion: string; readonly chapterId: string; readonly epochId: string;
  readonly epochYear: number; readonly rngProtocol: number;
  readonly rng: Readonly<Record<RngStreamName, RngState>>;
}

export function createInitialGameState(input: InitialGameStateInput): GameState {
  const clock = createGameClock(input.epochId, input.epochYear);
  return {
    meta: { coreVersion: input.coreVersion, rngProtocol: input.rngProtocol,
      stateVersion: 0, worldTick: 0, nextEventSeq: 1, rng: input.rng },
    profile: { protagonist: null, companions: [] },
    chapter: { chapterId: input.chapterId, worldYear: input.epochYear, clock,
      story: { chapterId: input.chapterId, lines: [] }, worldItems: { entries: [] }, shops: [],
      worldMap: null },
    party: { inventory: { stacks: [] }, equipment: createEmptyEquipment(), money: 0 },
    transient: { pendingTimeAdvance: null, dialogue: null, battle: null },
    battle: null,
  };
}
