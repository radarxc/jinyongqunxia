import { canonicalJson, type JsonValue } from '@tianshu/shared';
import { advanceBattleToReady, resolveBattleAction } from '../battle/action';
import type { BattleCommand, BattleState } from '../battle/types';
import { createRng, seedStream, type RngState } from '../rng';

export const BATTLE_REPLAY_SCHEMA = 1 as const;
export const BATTLE_REPLAY_HASH_DOMAIN = 'tianshu:battle-replay:v1' as const;

export interface ReplayHashHeader {
  readonly appBuild: string;
  readonly coreVersion: string;
  readonly rulesProtocol: number;
  readonly rngProtocol: number;
  readonly contentHash: string;
}

export interface BattleReplayCommandRecord {
  readonly seq: number;
  readonly command: BattleCommand;
  readonly afterHash?: string;
}

export interface BattleReplaySession {
  readonly battle: BattleState;
  readonly battleRng: RngState;
  readonly aiRng: RngState;
  readonly acceptedOrdinal: number;
  readonly decisionOrdinal: number;
}

export interface BattleReplayRejection {
  readonly inputIndex: number;
  readonly command: BattleCommand;
  readonly error: string;
}

export interface BattleReplayRun {
  readonly session: BattleReplaySession;
  readonly records: readonly BattleReplayCommandRecord[];
  readonly rejected: readonly BattleReplayRejection[];
}

export interface BattleReplayHashParts extends ReplayHashHeader {
  readonly runtimeMartialArts: readonly JsonValue[];
  readonly commandPrefix: readonly BattleCommand[];
  readonly session: BattleReplaySession | JsonValue;
}

export type BattleReplayHashDomain = readonly [
  typeof BATTLE_REPLAY_HASH_DOMAIN, string, string, number, number, string,
  readonly JsonValue[], readonly BattleCommand[], BattleReplaySession | JsonValue,
];

/** The port may return a string in Node or a Promise in a Web Crypto host. */
export type Sha256Utf8Port<Result> = (canonicalUtf8: string) => Result;

export function acceptedCommandPrefix(
  records: readonly BattleReplayCommandRecord[],
): readonly BattleCommand[] {
  const sorted = [...records].sort((left, right) => left.seq - right.seq);
  for (let index = 0; index < sorted.length; index += 1) {
    if (sorted[index]!.seq !== index) throw new RangeError('REPLAY_COMMAND_SEQUENCE');
  }
  return sorted.map((record) => record.command);
}

export function battleReplayHashDomain(input: BattleReplayHashParts): BattleReplayHashDomain {
  return [BATTLE_REPLAY_HASH_DOMAIN, input.appBuild, input.coreVersion, input.rulesProtocol,
    input.rngProtocol, input.contentHash, input.runtimeMartialArts, input.commandPrefix, input.session];
}

export function canonicalBattleReplayHashInput(input: BattleReplayHashParts): string {
  return canonicalJson(battleReplayHashDomain(input) as unknown as JsonValue);
}

export function hashBattleReplay<Result>(
  input: BattleReplayHashParts, sha256Utf8: Sha256Utf8Port<Result>,
): Result {
  return sha256Utf8(canonicalBattleReplayHashInput(input));
}

/** Executes submitted commands with the production action resolver; only accepted commands enter the prefix. */
export function runBattleReplay(
  state: BattleState, commands: readonly BattleCommand[],
): BattleReplayRun {
  const battleRng = createRng(seedStream(state.setup.seed, 'battle'));
  const aiRng = createRng(seedStream(state.setup.seed, 'ai'));
  const records: BattleReplayCommandRecord[] = [];
  const rejected: BattleReplayRejection[] = [];
  if (state.phase !== 'ended') advanceBattleToReady(state);
  for (let inputIndex = 0; inputIndex < commands.length; inputIndex += 1) {
    const command = commands[inputIndex]!;
    const result = resolveBattleAction(state, command, battleRng);
    if (result.accepted) {
      records.push({ seq: records.length, command });
      if (state.phase !== 'ended') advanceBattleToReady(state);
    } else rejected.push({ inputIndex, command, error: result.error ?? 'BATTLE_ACTION_ERROR' });
  }
  return { records, rejected, session: { battle: state, battleRng: battleRng.snapshot(),
    aiRng: aiRng.snapshot(), acceptedOrdinal: records.length, decisionOrdinal: records.length } };
}
