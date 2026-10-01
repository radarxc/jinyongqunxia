// eslint-disable-next-line no-restricted-imports -- Test-only SHA-256 port; runtime stays platform-neutral.
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import type { BattleCommand } from '../battle';
import { combatFixture } from '../testing/combat-fixture';
import {
  acceptedCommandPrefix, battleReplayHashDomain, canonicalBattleReplayHashInput, hashBattleReplay,
  runBattleReplay, type BattleReplayHashParts,
} from './index';

const accepted: readonly BattleCommand[] = [
  { t: 'battle/act', actor: 'hero', moveId: 'mv_basic_strike', targetIds: ['enemy_0'] },
  { t: 'battle/act', actor: 'enemy_0', moveId: 'mv_basic_strike', targetIds: ['hero'] },
];
const rejected: BattleCommand =
  { t: 'battle/act', actor: 'enemy_0', moveId: 'mv_basic_strike', targetIds: ['hero'] };
const sha256 = (text: string): string => createHash('sha256').update(text, 'utf8').digest('hex');

function replay(commands: readonly BattleCommand[]) {
  const run = runBattleReplay(combatFixture({ seed: 20261001 }), commands);
  const parts: BattleReplayHashParts = { appBuild: 'test-app-1', coreVersion: 'test-core-1',
    rulesProtocol: 3, rngProtocol: 2, contentHash: 'a'.repeat(64), runtimeMartialArts: [],
    commandPrefix: acceptedCommandPrefix(run.records), session: run.session };
  return { run, parts, input: canonicalBattleReplayHashInput(parts), hash: hashBattleReplay(parts, sha256) };
}

describe('battle replay protocol', () => {
  it('replays the same seed and accepted commands to the golden SHA-256', () => {
    const first = replay(accepted); const second = replay(accepted);
    expect(second.input).toBe(first.input); expect(second.hash).toBe(first.hash);
    expect(first.hash).toBe('3a71767d47d38d9a2efe83085561dd4625c2bc84b1b49ababfa90f2550cc4382');
    expect(first.run.session.battle.acceptedCommands).toEqual(accepted);
  });

  it('excludes rejected attempts from the prefix and all deterministic state', () => {
    const clean = replay(accepted); const withRejected = replay([rejected, ...accepted]);
    expect(withRejected.run.rejected).toEqual([expect.objectContaining({ inputIndex: 0,
      error: 'NOT_YOUR_TURN' })]);
    expect(withRejected.parts.commandPrefix).toEqual(accepted);
    expect(withRejected.input).toBe(clean.input); expect(withRejected.hash).toBe(clean.hash);
  });

  it('puts command payloads in the exact domain and changes the hash when one changes', () => {
    const base = replay(accepted);
    expect(battleReplayHashDomain(base.parts).slice(0, 8)).toEqual([
      'tianshu:battle-replay:v1', 'test-app-1', 'test-core-1', 3, 2, 'a'.repeat(64), [], accepted,
    ]);
    const changed = { ...base.parts, commandPrefix: [
      { t: 'battle/wait', actor: 'hero' } as const, accepted[1]!,
    ] };
    expect(canonicalBattleReplayHashInput(changed)).not.toBe(base.input);
    expect(hashBattleReplay(changed, sha256)).not.toBe(base.hash);
  });

  it('rejects duplicate or gapped accepted sequence numbers', () => {
    expect(() => acceptedCommandPrefix([{ seq: 1, command: accepted[0]! }]))
      .toThrow('REPLAY_COMMAND_SEQUENCE');
  });
});
