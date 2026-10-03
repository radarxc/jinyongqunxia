import { createNewGameCore, type CoreContent } from '@tianshu/core';
import type { GameContent } from './content';
import type { NewGameRequest, SessionSnapshot } from './contracts';

export type MasterSeedSource = () => number;

export function browserMasterSeed(): number {
  const words = new Uint32Array(1);
  globalThis.crypto.getRandomValues(words);
  return words[0]!;
}

function newGameContent(content: GameContent): CoreContent {
  return content.inkStories ? { inkStories: content.inkStories } : {};
}

/** Host boundary: entropy is sampled here and never inside deterministic core code. */
export function createNewGameSessionState(content: GameContent, input: NewGameRequest,
  seedSource: MasterSeedSource = browserMasterSeed): SessionSnapshot {
  const masterSeed = seedSource();
  if (!Number.isSafeInteger(masterSeed) || masterSeed < 0 || masterSeed > 0xffff_ffff)
    throw new TypeError('NEW_GAME_SEED');
  return createNewGameCore({ ...input, masterSeed,
    ...(content.contentHash ? { contentHash: content.contentHash } : {}) },
  newGameContent(content)).snapshot();
}
