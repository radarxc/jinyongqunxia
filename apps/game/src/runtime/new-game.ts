import { createNewGameState } from '@tianshu/core/state';
import { CORE_BUILD, CORE_VERSION } from './core-version';
import type { GameContent } from './content';
import type { NewGameRequest, SessionSnapshot } from './contracts';

export type MasterSeedSource = () => number;

export function browserMasterSeed(): number {
  const words = new Uint32Array(1);
  globalThis.crypto.getRandomValues(words);
  return words[0]!;
}

/** Host boundary: entropy is sampled here and never inside deterministic core code. */
export function createNewGameSessionState(content: GameContent, input: NewGameRequest,
  seedSource: MasterSeedSource = browserMasterSeed): SessionSnapshot {
  const masterSeed = seedSource();
  if (!Number.isSafeInteger(masterSeed) || masterSeed < 0 || masterSeed > 0xffff_ffff)
    throw new TypeError('NEW_GAME_SEED');
  return createNewGameState({ ...input, masterSeed, coreVersion: CORE_VERSION,
    coreBuild: CORE_BUILD,
    ...(content.contentHash ? { contentHash: content.contentHash } : {}),
    ...(content.chapters?.find((entry) => entry.id === 'ch00_yuenv')
      ? { chapter: content.chapters.find((entry) => entry.id === 'ch00_yuenv')! } : {}) });
}
