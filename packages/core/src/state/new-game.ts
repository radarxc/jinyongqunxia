import { RNG_PROTOCOL, RNG_STREAMS, seedStream, type RngState, type RngStreamName } from '../rng';
import { createCharacterState } from './character';
import { CONTENT_HASH_PLACEHOLDER, createInitialGameState } from './initial';
import type { DifficultyId, GameState, ProtagonistIdentity } from './models';
import type { ChapterDef } from '@tianshu/data/schemas';

export const NEW_GAME_CHAPTER_ID = 'ch00_yuenv';
export const NEW_GAME_EPOCH_ID = 'epoch_ch00_yuenv';
export const NEW_GAME_EPOCH_YEAR = -482;
export const NEW_GAME_LOCATION_ID = 'sc_00_zhulin';
export const NEW_GAME_ORIGINS = [
  'origin_yixuesheng', 'origin_huwai', 'origin_wenshiguan',
  'origin_gongchengshi', 'origin_shejiren',
] as const;

export interface NewGameInput {
  readonly masterSeed: number; readonly identity: ProtagonistIdentity;
  readonly difficulty: DifficultyId; readonly contentHash?: string;
  readonly coreVersion?: string; readonly coreBuild?: string;
  readonly chapter?: ChapterDef;
}
function initialRng(masterSeed: number): Readonly<Record<RngStreamName, RngState>> {
  return Object.fromEntries(RNG_STREAMS.map((stream) => [stream, seedStream(masterSeed, stream)])) as
    unknown as Readonly<Record<RngStreamName, RngState>>;
}
function assertIdentity(identity: ProtagonistIdentity): void {
  for (const value of [identity.name, identity.gender, identity.appearance, identity.pronoun])
    if (value.trim().length === 0) throw new TypeError('NEW_GAME_IDENTITY');
  if (!(NEW_GAME_ORIGINS as readonly string[]).includes(identity.originId))
    throw new TypeError('NEW_GAME_ORIGIN');
}

/** Creates the canonical pre-allocation ch00 state; combat attributes are assigned at first sleep. */
export function createNewGameState(input: NewGameInput): GameState {
  if (!Number.isSafeInteger(input.masterSeed) || input.masterSeed < 0 ||
      input.masterSeed > 0xffff_ffff) throw new TypeError('NEW_GAME_SEED');
  assertIdentity(input.identity);
  const chapter = input.chapter;
  if (chapter && chapter.id !== NEW_GAME_CHAPTER_ID) throw new TypeError('NEW_GAME_CHAPTER');
  const state = createInitialGameState({ coreVersion: input.coreVersion ?? '0.0.0',
    coreBuild: input.coreBuild ?? '20261002-new-run', chapterId: NEW_GAME_CHAPTER_ID,
    epochId: NEW_GAME_EPOCH_ID, epochYear: chapter?.gameYear.start ?? NEW_GAME_EPOCH_YEAR,
    ...(chapter ? { eraLayerId: chapter.eraLayerId, worldTier: chapter.worldTier } : {}),
    rngProtocol: RNG_PROTOCOL,
    masterSeed: input.masterSeed, rng: initialRng(input.masterSeed),
    contentHash: input.contentHash ?? CONTENT_HASH_PLACEHOLDER,
    locationId: chapter?.wake.sceneId ?? NEW_GAME_LOCATION_ID,
    identity: { ...input.identity }, difficulty: input.difficulty });
  const protagonist = createCharacterState({ characterId: 'npc_zhujue', status: 'active',
    innate: { con: 0, str: 0, bre: 0, agi: 0, wis: 0, wil: 0, luk: 50, cha: 50 }, skills: [],
    meridians: { schemaVersion: 2, opened: [], meridianStats: {}, acupointStats: {},
      targets: {}, turnCompleted: 0, lastAppliedMigration: 0 },
    legacyHpCredit: 0, legacyMpCredit: 0 }, []);
  return { ...state, profile: { ...state.profile, protagonist } };
}
