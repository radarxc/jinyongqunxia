import { describe, expect, it } from 'vitest';
import { createRng, seedStream } from '../rng';
import { BASIC_MOVE, battleSeed, combatFixture } from '../testing/combat-fixture';
import { createBattleSession, deriveRetrySeed, retryBattleSession, setBattleAuto,
  stepBattleSession, actBattleSession, queryBattleSubdue, subdueBattleUnit } from './session';

function session(input: Parameters<typeof combatFixture>[0] = {}) {
  const battle = combatFixture(input);
  return createBattleSession(battle.setup, battle.units.map((unit) => battleSeed(unit.id, unit.moves)));
}

describe('BattleSession', () => {
  it('owns battle and ai RNG while recording automatic events once', () => {
    const active = session({ seed: 20261001, hp: 300 });
    setBattleAuto(active, true);
    while (active.battle.phase !== 'ended') stepBattleSession(active);
    expect(active.battle.events.filter((event) => event.t === 'battle/autoExchangeResolved'))
      .toHaveLength(active.battle.actionNo);
    expect(active.battle.events.filter((event) => event.t === 'battle/autoSimulationStarted')).toHaveLength(1);
    expect(active.battle.events.filter((event) => event.t === 'battle/autoSimulationEnded')).toHaveLength(1);
    expect(active.acceptedOrdinal).toBe(active.battle.actionNo + 1);
    expect(active.decisionOrdinal).toBe(active.battle.actionNo);
  });

  it('does not mutate session or either RNG after a rejected action', () => {
    const active = session({ seed: 7 }); const before = structuredClone(active);
    const result = actBattleSession(active, { t: 'battle/act', actor: 'enemy_0',
      action: { t: 'skill', move: BASIC_MOVE.id, target: 'hero' } });
    expect(result).toMatchObject({ accepted: false, error: 'NOT_YOUR_TURN' });
    expect(active).toEqual(before);
  });

  it('derives every retry from the opening seed and resets both streams', () => {
    expect(deriveRetrySeed(0x1234_5678, 1)).toBe(0x48c6_9a09);
    const active = session({ seed: 0x1234_5678, hp: 100 }); setBattleAuto(active, true);
    while (active.battle.phase !== 'ended') stepBattleSession(active);
    retryBattleSession(active);
    expect(active.retryCount).toBe(1); expect(active.battle.setup.seed).toBe(0x48c6_9a09);
    expect(active.battleRng).toEqual(seedStream(0x48c6_9a09, 'battle'));
    expect(active.aiRng).toEqual(seedStream(0x48c6_9a09, 'ai'));
    expect(active.battle.actionNo).toBe(0); expect(active.auto).toBe(false);
    expect(active.commandLog.at(-1)).toEqual({ t: 'battle/retry', option: 'restart' });
    expect(active.battle.events.some((event) => event.t === 'battle/ended')).toBe(true);
    expect(active.battle.events.at(-1)).toMatchObject({ t: 'battle/retried', amount: 1 });
  });

  it('stops a long no-op battle at the documented action cap', () => {
    const battle = combatFixture({ playerMoves: [], enemyMoves: [] });
    const setup = { ...battle.setup, rules: { ...battle.setup.rules, roundLimit: 10_000 } };
    const active = createBattleSession(setup, battle.units.map((unit) => battleSeed(unit.id, [])));
    setBattleAuto(active, true);
    for (let action = 0; action < 100 && active.battle.phase !== 'ended'; action += 1) {
      stepBattleSession(active);
    }
    expect(active.battle).toMatchObject({ phase: 'ended', result: 'draw', actionNo: 80 });
  });

  it('rejects a stale AI seed without consuming either stream', () => {
    const active = session(); setBattleAuto(active, true); const before = structuredClone(active);
    const seed = createRng(active.aiRng).nextU32();
    expect(actBattleSession(active, { t: 'battle/wait', actor: 'hero', automatic: true,
      aiSeed: (seed + 1) >>> 0 })).toMatchObject({ accepted: false, error: 'BATTLE_AI_SEED_MISMATCH' });
    expect(active).toEqual(before);
  });

  it('subdues a hostile at the 30% mercy line without consuming a turn or RNG', () => {
    const active = session({ enemies: 2 }); const target = active.battle.units[1]!;
    target.hp = 360;
    const rng = [active.battleRng, active.aiRng] as const; const actionNo = active.battle.actionNo;
    expect(queryBattleSubdue(active, 'hero', target.id)).toEqual({ enabled: true, reason: null });
    subdueBattleUnit(active, 'hero', target.id);
    expect(target).toMatchObject({ active: false, state: 'surrendered' });
    expect(active.battle.events.at(-1)).toMatchObject({ t: 'battle/unitSurrendered',
      actor: 'hero', target: target.id, message: 'mercy' });
    expect(active.commandLog.at(-1)).toEqual({ t: 'battle/subdue', actor: 'hero', target: target.id });
    expect(active.battle.actionNo).toBe(actionNo); expect([active.battleRng, active.aiRng]).toEqual(rng);
  });

  it('rejects subdue above the mercy line and when the encounter is lethal', () => {
    const active = session(); const before = structuredClone(active);
    expect(queryBattleSubdue(active, 'hero', 'enemy_0').reason).toBe('BATTLE_SUBDUE_THRESHOLD');
    expect(() => subdueBattleUnit(active, 'hero', 'enemy_0')).toThrow('BATTLE_SUBDUE_THRESHOLD');
    expect(active).toEqual(before);
    const opening = combatFixture();
    const lethal = createBattleSession({ ...opening.setup, rules: { ...opening.setup.rules,
      lethalIntent: true } }, opening.units);
    lethal.battle.units[1]!.hp = 1;
    expect(queryBattleSubdue(lethal, 'hero', 'enemy_0').reason).toBe('BATTLE_SUBDUE_FORBIDDEN');
  });

  it('propagates internal faults and preserves the session on a late action error', () => {
    const broken = { ...BASIC_MOVE, recovery: Number.MAX_SAFE_INTEGER + 1 };
    const active = session({ playerMoves: [broken] }); const before = structuredClone(active);
    expect(() => actBattleSession(active, { t: 'battle/act', actor: 'hero', action: {
      t: 'skill', move: broken.id, target: 'enemy_0',
    } })).toThrow();
    expect(active).toEqual(before);
  });
});
