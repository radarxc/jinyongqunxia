import type { RngState, RngStreamName } from '../rng';
import { createEmptyEquipment } from './equipment';
import { createGameClock } from './clock';
import type { GameState } from './models';

export const SAVE_SCHEMA = 2;
export const RULES_PROTOCOL = 3;
export const CONTENT_HASH_PLACEHOLDER = '0'.repeat(64);

export interface InitialGameStateInput {
  readonly coreVersion: string; readonly chapterId: string; readonly epochId: string;
  readonly epochYear: number; readonly rngProtocol: number;
  readonly rng: Readonly<Record<RngStreamName, RngState>>;
  readonly masterSeed?: number; readonly contentHash?: string; readonly coreBuild?: string;
  readonly locationId?: string;
}

function runId(masterSeed: number): string {
  const word = Math.imul((masterSeed >>> 0) ^ 0x7469616e, 0x9e3779b1) >>> 0;
  return `run_${word.toString(16).padStart(8, '0')}`;
}

export function createInitialGameState(input: InitialGameStateInput): GameState {
  const clock = createGameClock(input.epochId, input.epochYear);
  const masterSeed = input.masterSeed ?? 1;
  return {
    meta: { saveSchema: SAVE_SCHEMA, masterSeed, runId: runId(masterSeed),
      nextRuntimeOrdinal: 1, contentHash: input.contentHash ?? CONTENT_HASH_PLACEHOLDER,
      rulesProtocol: RULES_PROTOCOL, rngProtocol: input.rngProtocol,
      coreVersion: input.coreVersion, coreBuild: input.coreBuild ?? input.coreVersion,
      stateVersion: 0, worldTick: 0, nextEventSeq: 1, rng: input.rng, debugTainted: false },
    profile: { protagonist: null, companions: [] },
    chapter: { chapterId: input.chapterId, worldYear: input.epochYear, clock,
      story: { chapterId: input.chapterId, lines: [] }, worldItems: { entries: [] }, shops: [],
      worldMap: null, town: null, npcs: [], itemChapterUses: {} },
    party: { inventory: { stacks: [] }, equipment: createEmptyEquipment(), money: 0 },
    world: { navigation: { locationId: input.locationId ?? 'city_dali',
      selectedDestinationId: null }, pendingTimeAdvance: null },
    battle: null, dialogue: null,
  };
}
