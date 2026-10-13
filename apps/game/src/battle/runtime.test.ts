import { createHash } from 'node:crypto';
import { acceptedCommandPrefix, buildEncounter, createBattleSession, hashBattleReplay,
  replaySessionProjection, runBattleReplay, setBattleAuto, stepBattleSession } from '@tianshu/core';
import { canonicalJson } from '@tianshu/shared';
import { EncounterDefSchema } from '@tianshu/data/tooling';
import { describe, expect, it } from 'vitest';
import { createBattleDemo } from './demo';
import { parseBattleEncounter } from './encounter';
import { COMBAT_DEMO_ENCOUNTER, combatDemoSources } from './demo-seed';
import { BattleRuntime } from './runtime';

function harness() {
  const fixture = createBattleDemo('world');
  const launch = { ...fixture, setup: { ...fixture.setup, seed: 20261001 } };
  const session = createBattleSession(launch.setup, launch.seeds);
  const runtime = new BattleRuntime(launch, session);
  return { launch, runtime, session };
}

describe('battle projection adapter', () => {
  it('parses and builds authored encounters at the battle boundary without changing bytes', async () => {
    const definition = COMBAT_DEMO_ENCOUNTER;
    const context = { setupId: 'setup-lazy', seed: 0x1234_5678,
      sourceSnapshotHash: '0'.repeat(64), sourceId: 'fixture', triggerId: 'fixture',
      worldTick: 7, difficulty: 'diff_xiake' as const, units: combatDemoSources(), templates: [] };
    expect(canonicalJson(parseBattleEncounter(structuredClone(definition)) as never))
      .toBe(canonicalJson(EncounterDefSchema.parse(definition) as never));
    const expected = buildEncounter(definition, context);
    const actual = BattleRuntime.buildEncounter(structuredClone(definition), context);
    expect(canonicalJson(actual as never)).toBe(canonicalJson(expected as never));
  });

  it('normalizes invalid authored encounters and permits a later retry', async () => {
    const definition = COMBAT_DEMO_ENCOUNTER;
    const context = { setupId: 'setup-retry', seed: 1, sourceSnapshotHash: '0'.repeat(64),
      sourceId: 'fixture', triggerId: 'fixture', worldTick: 0,
      difficulty: 'diff_xiake' as const, units: combatDemoSources(), templates: [] };
    const invalid = structuredClone(definition);
    invalid.difficulty.enemyStatBp += 1;
    expect(() => BattleRuntime.buildEncounter(invalid, context))
      .toThrow('BATTLE_ENCOUNTER_INVALID');
    expect(BattleRuntime.buildEncounter(definition, context))
      .toEqual(buildEncounter(definition, context));
  });

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
    expect(runtime.coreCommand({ t: 'battle/wait', actor: 'hero', revision: 0,
      walkTo: { q: -1, r: 0 } })).toEqual({ t: 'battle/act', actor: 'hero',
      walkTo: { q: -1, r: 0 }, action: { t: 'wait' }, expectedRevision: 0 });
    expect(runtime.transcript()).toEqual(before);
    setBattleAuto(session, true); stepBattleSession(session); runtime.update(session);
    const changed = runtime.packet().units;
    expect(changed.map((unit) => unit.id)).toContain('hero');
    expect(runtime.packet().units).toEqual([]);
    expect(() => runtime.previewArea({ t: 'battle/preview', revision: -1, actor: 'hero',
      moveId: 'mv_basic_strike', anchor: { q: 1, r: 0 },
      aim: { dirCount: 6, dir: 0 }, requestId: 1 })).toThrow('BATTLE_STALE_PREVIEW');
  });
  it('projects core-owned reachability, item rejection, guard, wait, and qi routes', () => {
    const { runtime } = harness(); const packet = runtime.packet(true);
    expect(packet.capabilities.move.reachable.some(cell => cell.cost > 0 && cell.path.length > 1)).toBe(true);
    expect(packet.capabilities.wait.enabled).toBe(true);
    expect(packet.capabilities.defend.enabled).toBe(true);
    expect(packet.capabilities.item).toEqual({ enabled: false, reason: '当前状态禁止此行动' });
    expect(packet.capabilities.items[0]).toMatchObject({ id: 'it_jinchuangyao', count: 2 });
    expect(packet.capabilities.items[0]?.targets[0]).toMatchObject({ id: 'hero',
      capability: { enabled: false, reason: '当前状态禁止此行动' } });
    expect(packet.capabilities.routes[0]).toMatchObject({ routeId: 'mfr_fixture_basic',
      capability: { enabled: true }, inFlight: 0, capacity: 16 });
    expect(packet.units[0]).not.toHaveProperty('qiNature');
  });
  it('stores and clears a core-queried movement preview without mutating the transcript', () => {
    const { runtime, session } = harness(); const before = runtime.transcript();
    const moved = runtime.previewArea({ t: 'battle/preview', kind: 'move', revision: 0,
      requestId: 1, actor: 'hero', destination: { q: -1, r: 0 } });
    expect(moved.capabilities.move.selected).toMatchObject({ q: -1, r: 0, cost: 2 });
    expect(runtime.transcript()).toEqual(before);
    runtime.update(session);
    expect(runtime.packet().capabilities.move.selected).toMatchObject({ q: -1, r: 0 });
    const original = runtime.previewArea({ t: 'battle/preview', kind: 'move', revision: 0,
      requestId: 2, actor: 'hero', destination: { q: 0, r: 0 } });
    expect(original.capabilities.move.selected).toBeNull();
    runtime.previewArea({ t: 'battle/preview', kind: 'move', revision: 0,
      requestId: 3, actor: 'hero', destination: { q: -1, r: 0 } });
    const cleared = runtime.previewArea({ t: 'battle/preview', kind: 'cancel',
      revision: 0, requestId: 4 });
    expect(cleared.capabilities.move.selected).toBeNull();
    expect(runtime.transcript()).toEqual(before);
  });
  it('clears an uncommitted movement preview when the authoritative revision changes', () => {
    const { runtime, session } = harness();
    runtime.previewArea({ t: 'battle/preview', kind: 'move', revision: 0,
      requestId: 1, actor: 'hero', destination: { q: -1, r: 0 } });
    setBattleAuto(session, true); runtime.update(session);
    expect(runtime.packet().capabilities.move.selected).toBeNull();
  });
  it('keeps walkTo in a queried skill plan while acute gather never carries movement', () => {
    const { runtime, session } = harness(); runtime.packet(true);
    runtime.previewArea({ t: 'battle/preview', kind: 'move', revision: 0, requestId: 1,
      actor: 'hero', destination: { q: 0, r: 1 } });
    runtime.update(session);
    expect(runtime.packet().capabilities.gather).toEqual({ enabled: true, reason: '' });
    const area = runtime.previewArea({ t: 'battle/preview', revision: 0, requestId: 2,
      actor: 'hero', moveId: 'mv_basic_strike', anchor: { q: 1, r: 0 },
      aim: { dirCount: 6, dir: 0 } }).preview!;
    expect(area).toMatchObject({ valid: true, walkTo: { q: 0, r: 1 } });
    expect(runtime.coreCommand({ t: 'battle/act-at', preview: area })).toMatchObject({
      t: 'battle/act', actor: 'hero', walkTo: { q: 0, r: 1 },
      action: { t: 'skill', move: 'mv_basic_strike', target: 'enemy_0' },
    });
    expect(runtime.coreCommand({ t: 'battle/gather', actor: 'hero', revision: 0,
      routeId: 'mfr_fixture_basic' })).toEqual({ t: 'battle/act', actor: 'hero',
      action: { t: 'acuteQiGather', routeRef: 'mfr_fixture_basic' }, expectedRevision: 0 });
  });
  it('enables a battle item only when core approves its target', () => {
    const { launch, session } = harness();
    const setup = { ...launch.setup, rules: { ...launch.setup.rules, mode: 'normal' as const, noItems: false } };
    const runtime = new BattleRuntime({ ...launch, setup }, createBattleSession(setup, launch.seeds));
    const packet = runtime.packet(true); const medicine = packet.capabilities.items[0]!;
    expect(packet.capabilities.item).toEqual({ enabled: true, reason: '' });
    expect(medicine.targets.find(target => target.id === 'hero')?.capability).toEqual({ enabled: true, reason: '' });
    expect(medicine.targets.find(target => target.id === 'enemy_0')?.capability.enabled).toBe(false);
    expect(runtime.coreCommand({ t: 'battle/item', actor: 'hero', itemId: medicine.id,
      targetId: 'hero', revision: session.revision })).toEqual({ t: 'battle/act', actor: 'hero',
      action: { t: 'item', item: medicine.id, target: 'hero' }, expectedRevision: session.revision });
  });
});
