import { canonicalJson, type JsonValue } from '@tianshu/shared';
import { acceptBattleDemonstration, actBattleSession, concedeBattleSession, createBattleSession,
  retryBattleSession, setBattleAuto, subdueBattleUnit } from '../battle/session';
import type { BattleRecordedCommand, BattleSessionState, BattleState } from '../battle/types';
import type { RngState } from '../rng';

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
  readonly command: BattleRecordedCommand;
  readonly afterHash?: string;
}

export interface BattleReplaySession {
  readonly battle: BattleState;
  readonly battleRng: RngState;
  readonly aiRng: RngState;
  readonly acceptedOrdinal: number;
  readonly decisionOrdinal: number;
  readonly revision: number;
  readonly retryCount: number;
  readonly auto: boolean;
  readonly outcomeSeq: number;
}

export function replaySessionProjection(session: BattleSessionState): BattleReplaySession {
  return { battle: session.battle, battleRng: session.battleRng, aiRng: session.aiRng,
    acceptedOrdinal: session.acceptedOrdinal, decisionOrdinal: session.decisionOrdinal,
    revision: session.revision, retryCount: session.retryCount, auto: session.auto,
    outcomeSeq: session.outcomeSeq };
}

export interface BattleReplayRejection {
  readonly inputIndex: number;
  readonly command: BattleRecordedCommand;
  readonly error: string;
}

export interface BattleReplayRun {
  readonly session: BattleReplaySession;
  readonly records: readonly BattleReplayCommandRecord[];
  readonly rejected: readonly BattleReplayRejection[];
}

export interface BattleReplayHashParts extends ReplayHashHeader {
  readonly runtimeMartialArts: readonly JsonValue[];
  readonly commandPrefix: readonly BattleRecordedCommand[];
  readonly session: BattleReplaySession | JsonValue;
}

export type BattleReplayHashDomain = readonly [
  typeof BATTLE_REPLAY_HASH_DOMAIN, string, string, number, number, string,
  readonly JsonValue[], readonly BattleRecordedCommand[], BattleReplaySession | JsonValue,
];

/** The port may return a string in Node or a Promise in a Web Crypto host. */
export type Sha256Utf8Port<Result> = (canonicalUtf8: string) => Result;

export function acceptedCommandPrefix(
  records: readonly BattleReplayCommandRecord[],
): readonly BattleRecordedCommand[] {
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
  source: BattleState | BattleSessionState, commands: readonly BattleRecordedCommand[],
): BattleReplayRun {
  const session = 'battleId' in source
    ? createBattleSession(source.opening.setup, source.opening.seeds)
    : createBattleSession(source.setup, source.units);
  const records: BattleReplayCommandRecord[] = [];
  const rejected: BattleReplayRejection[] = [];
  for (let inputIndex = 0; inputIndex < commands.length; inputIndex += 1) {
    const command = commands[inputIndex]!;
    const before = session.commandLog.length; let error: string | undefined;
    try {
      if (command.t === 'battle/setAuto') setBattleAuto(session, command.mode === 'auto');
      else if (command.t === 'battle/retry') retryBattleSession(session);
      else if (command.t === 'battle/concede') concedeBattleSession(session);
      else if (command.t === 'battle/subdue')
        subdueBattleUnit(session, command.actor, command.target);
      else if (command.t === 'battle/demonstration')
        acceptBattleDemonstration(session, command.replayId);
      else {
        const result = actBattleSession(session, command);
        if (!result.accepted) error = result.error ?? 'BATTLE_ACTION_ERROR';
      }
    } catch (cause) {
      if (!(cause instanceof RangeError) || !['BATTLE_ENDED', 'BATTLE_NOT_ENDED',
        'BATTLE_AUTO_FORBIDDEN', 'BATTLE_CONCEDE_FORBIDDEN',
        'BATTLE_DEMONSTRATION_UNAVAILABLE', 'BATTLE_SUBDUE_FORBIDDEN',
        'BATTLE_AUTO_ACTIVE', 'BATTLE_SUBDUE_ACTOR', 'BATTLE_TARGET_INVALID',
        'BATTLE_SUBDUE_THRESHOLD'].includes(cause.message)) throw cause;
      error = cause.message;
    }
    if (error !== undefined) rejected.push({ inputIndex, command, error });
    else if (session.commandLog.length > before) records.push({ seq: records.length, command });
  }
  return { records, rejected, session: replaySessionProjection(session) };
}
