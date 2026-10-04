import { createHash } from 'node:crypto';
import { acceptedCommandPrefix, createBattleSession, hashBattleReplay, replaySessionProjection,
  runBattleReplay, setBattleAuto, stepBattleSession } from '@tianshu/core';
import { describe, expect, it } from 'vitest';
import { createBattleDemo } from './demo';
import { BattleRuntime } from './runtime';

function harness() {
  const fixture = createBattleDemo('world');
  const launch = { ...fixture, setup: { ...fixture.setup, seed: 20261001 } };
  const session = createBattleSession(launch.setup, launch.seeds);
  const runtime = new BattleRuntime(launch, session);
  return { launch, runtime, session };
}

describe('battle projection adapter', () => {
  it('projects a core-owned automatic session without changing its transcript', () => {
    const { runtime, session } = harness();
    setBattleAuto(session, true); runtime.update(session);
    while (session.battle.phase !== 'ended') {
      stepBattleSession(session); runtime.update(session);
    }
    const transcript = runtime.transcript(); const packet = runtime.packet(true);
    const acts = transcript.commands.filter((command) => command.t === 'battle/act');
    expect(acts).toHaveLength(11);
    expect(acts.map((command) => command.actor)).toEqual([
      'hero', 'enemy_0', 'hero', 'enemy_0', 'hero', 'enemy_0',
      'hero', 'enemy_0', 'hero', 'enemy_0', 'hero',
    ]);
    expect(transcript.commands[0]).toEqual({ t: 'battle/setAuto', mode: 'auto' });
    expect(acts.slice(0, 2).map((command) => command.t === 'battle/act'
      ? command.action : null)).toEqual([
      { t: 'acuteQiGather', routeRef: 'mfr_fixture_basic' },
      { t: 'acuteQiGather', routeRef: 'mfr_fixture_basic' },
    ]);
    expect(transcript.events.map((event) => event.t)).toEqual([
      'battle/autoSimulationStarted',
      'battle/acuteQiGathered', 'battle/autoExchangeResolved',
      'battle/acuteQiGathered', 'battle/autoExchangeResolved',
      ...Array.from({ length: 6 }, () => ['qi.moveResolved', 'battle/damageResolved',
        'battle/autoExchangeResolved']).flat(),
      'qi.moveResolved', 'battle/damageResolved', 'battle/fullCirculationCritResolved',
      'battle/autoExchangeResolved',
      'qi.moveResolved', 'battle/damageResolved', 'battle/autoExchangeResolved',
      'qi.moveResolved', 'battle/damageResolved', 'battle/unitDowned', 'battle/autoExchangeResolved',
      'battle/ended', 'battle/autoSimulationEnded',
    ]);
    expect(transcript.events.filter((event) => event.t === 'battle/autoSimulationStarted')).toHaveLength(1);
    expect(transcript.events.filter((event) => event.t === 'battle/autoSimulationEnded')).toHaveLength(1);
    expect(packet).toMatchObject({ result: 'win', actionNo: 11, auto: false });
    expect(packet.units.find((unit) => unit.id === 'enemy_0')).toMatchObject({ hp: 0, active: false });
    expect(packet.rewards).toEqual({ drops: [], martial: null, cycles: 9,
      martialUses: [{ unitId: 'enemy_0', skillId: 'sk_basic', uses: 4 },
        { unitId: 'hero', skillId: 'sk_basic', uses: 5 }],
      movementTrained: [], fullCirculations: [
        { unitId: 'enemy_0', count: 4 }, { unitId: 'hero', count: 5 },
      ] });
    const settled = runtime.transcript(); runtime.packet(); runtime.packet(true);
    expect(runtime.transcript()).toEqual(settled);
  });

  it('hashes an app transcript exactly like core replay, including automatic events', () => {
    const { launch, runtime, session } = harness(); setBattleAuto(session, true);
    while (session.battle.phase !== 'ended') stepBattleSession(session);
    runtime.update(session); const transcript = runtime.transcript();
    const replay = runBattleReplay(session, transcript.commands);
    const parts = (projected: ReturnType<typeof replaySessionProjection>) => ({
      appBuild: 'test-app', coreVersion: 'test-core', rulesProtocol: 3, rngProtocol: 2,
      contentHash: 'a'.repeat(64), runtimeMartialArts: [],
      commandPrefix: acceptedCommandPrefix(replay.records), session: projected,
    });
    const digest = (text: string) => createHash('sha256').update(text, 'utf8').digest('hex');
    const liveHash = hashBattleReplay(parts(replaySessionProjection(session)), digest);
    const replayHash = hashBattleReplay(parts(replay.session), digest);
    expect(replay.rejected).toEqual([]); expect(replayHash).toBe(liveHash);
    expect(replay.session.battle.events).toEqual(transcript.events);
    expect(replay.session.battle.setup.seed).toBe(launch.setup.seed);
  });

  it('maps UI commands without mutating state and emits only revised unit projections', () => {
    const { runtime, session } = harness(); const before = runtime.transcript();
    expect(runtime.packet(true).units).toHaveLength(2);
    expect(runtime.packet().units).toEqual([]);
    expect(runtime.coreCommand({ t: 'battle/wait', actor: 'hero', revision: 0 }))
      .toEqual({ t: 'battle/act', actor: 'hero', action: { t: 'wait' }, expectedRevision: 0 });
    expect(runtime.transcript()).toEqual(before);
    setBattleAuto(session, true); stepBattleSession(session); runtime.update(session);
    const changed = runtime.packet().units;
    expect(changed.map((unit) => unit.id)).toContain('hero');
    expect(runtime.packet().units).toEqual([]);
    expect(() => runtime.previewArea({ revision: -1, actor: 'hero',
      moveId: 'mv_basic_strike', anchor: { q: 1, r: 0 },
      aim: { dirCount: 6, dir: 0 }, requestId: 1 })).toThrow('BATTLE_STALE_PREVIEW');
  });
});
