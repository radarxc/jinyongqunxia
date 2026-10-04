import { createHash } from 'node:crypto';
import { hashBattleReplay, replaySessionProjection, runBattleReplay } from '@tianshu/core';
import { describe, expect, it } from 'vitest';
import { createBattleDemo } from '../battle/demo';
import { createGameSession } from './session';
import { fixtureContent } from './test-fixture';

describe('app battle command transcript', () => {
  it('forwards native battle bus commands including retry and idempotent finalize', async () => {
    const app = createGameSession(fixtureContent()); const launch = createBattleDemo('world');
    expect((await app.dispatch({ t: 'battle/enter', setup: launch.setup, seeds: launch.seeds }))
      .accepted).toBe(true);
    for (let attempt = 0; attempt < 2; attempt += 1) {
      if (attempt > 0) expect((await app.dispatch({ t: 'battle/retry', option: 'restart' })).accepted).toBe(true);
      let update = await app.dispatch({ t: 'battle/setAuto', mode: 'auto' });
      expect(update.accepted).toBe(true); let packet = update.changes.battle!;
      while (!packet.result) {
        update = await app.dispatch({ t: 'battle/act', automatic: true, expectedRevision: packet.revision });
        expect(update.accepted).toBe(true); packet = update.changes.battle!;
      }
    }
    const live = (await app.snapshot()).battle!;
    expect(live.outcomeSeq).toBe(2); expect(live.retryCount).toBe(1);
    expect(runBattleReplay(live, live.commandLog).session).toEqual(replaySessionProjection(live));
    const command = { t: 'battle/finalize', battleId: live.battleId, outcomeSeq: live.outcomeSeq } as const;
    expect((await app.dispatch(command)).accepted).toBe(true); const before = await app.snapshot();
    expect((await app.dispatch(command)).accepted).toBe(true); expect(await app.snapshot()).toEqual(before);
  });

  it.each([false, true])('replays the dispatched session with action-cap mode %s', async (capped) => {
    const app = createGameSession(fixtureContent()); const launch = createBattleDemo('world');
    const configured = capped ? { ...launch, setup: { ...launch.setup, rules: {
      ...launch.setup.rules, roundLimit: 10_000,
    } }, seeds: launch.seeds.map((seed) => ({ ...seed, moves: [] })) } : launch;
    expect((await app.dispatch({ t: 'battle/enter', launch: configured })).accepted).toBe(true);
    let update = await app.dispatch({ t: 'battle/auto', enabled: true });
    expect(update.accepted).toBe(true); let packet = update.changes.battle!;
    while (!packet.result) {
      update = await app.dispatch({ t: 'battle/step', revision: packet.revision });
      expect(update.accepted).toBe(true); packet = update.changes.battle!;
    }
    const live = (await app.snapshot()).battle!;
    const replay = runBattleReplay(live, live.commandLog);
    const header = { appBuild: 'ENG-16c-app', coreVersion: '0.0.0', rulesProtocol: 3,
      rngProtocol: 2, contentHash: '0'.repeat(64), runtimeMartialArts: [], commandPrefix: live.commandLog };
    const sha = (value: string) => createHash('sha256').update(value, 'utf8').digest('hex');
    const liveHash = hashBattleReplay({ ...header, session: replaySessionProjection(live) }, sha);
    const replayHash = hashBattleReplay({ ...header, session: replay.session }, sha);
    expect(replay.rejected).toEqual([]); expect(replayHash).toBe(liveHash);
    expect(replay.session.battle.events).toEqual(live.battle.events);
    if (capped) expect(live.battle).toMatchObject({ result: 'draw', actionNo: 80 });
    console.info(JSON.stringify({ capped, liveHash, replayHash, events: live.battle.events.length }));
  });
});
