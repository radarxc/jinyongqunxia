import { describe, expect, it } from 'vitest';
import { BattleRuntime } from './runtime';
import { createBattleDemo } from './demo';

describe('golden battle UI runtime', () => {
  it('replays the fixed battle as one event sequence and exposes the final result', () => {
    const battle = new BattleRuntime(createBattleDemo('world'));
    battle.execute({ t: 'battle/auto', enabled: true });
    while (!battle.packet().result) {
      const packet = battle.packet();
      battle.execute({ t: 'battle/step', revision: packet.revision });
    }
    const transcript = battle.transcript(); const packet = battle.packet(true);
    expect(transcript.commands).toHaveLength(11);
    expect(transcript.commands.map(command => command.actor)).toEqual([
      'hero', 'enemy_0', 'hero', 'enemy_0', 'hero', 'enemy_0',
      'hero', 'enemy_0', 'hero', 'enemy_0', 'hero',
    ]);
    expect(transcript.commands.slice(0, 2).map(command => command.t === 'battle/act'
      ? command.action : null)).toEqual([
      { t: 'acuteQiGather', routeRef: 'mfr_fixture_basic' },
      { t: 'acuteQiGather', routeRef: 'mfr_fixture_basic' },
    ]);
    expect(transcript.events.map(event => event.t)).toEqual([
      'battle/autoSimulationStarted',
      'battle/acuteQiGathered', 'battle/autoExchangeResolved',
      'battle/acuteQiGathered', 'battle/autoExchangeResolved',
      ...Array.from({ length: 6 }, () => ['qi.moveResolved', 'battle/damageResolved',
        'battle/autoExchangeResolved']).flat(),
      'qi.moveResolved', 'battle/damageResolved', 'battle/fullCirculationCritResolved',
      'battle/autoExchangeResolved',
      'qi.moveResolved', 'battle/damageResolved', 'battle/autoExchangeResolved',
      'qi.moveResolved', 'battle/damageResolved', 'battle/unitDowned', 'battle/autoExchangeResolved',
      'battle/ended', 'battle/rewards', 'battle/autoSimulationEnded',
    ]);
    expect(packet).toMatchObject({ result: 'win', actionNo: 11, auto: false });
    expect(packet.units.find(unit => unit.id === 'enemy_0')).toMatchObject({ hp: 0, active: false });
    expect(packet.rewards).toEqual({ drops: [], martial: null, cycles: 9,
      martialUses: [{ unitId: 'enemy_0', skillId: 'sk_basic', uses: 4 },
        { unitId: 'hero', skillId: 'sk_basic', uses: 5 }],
      movementTrained: [], fullCirculations: [
        { unitId: 'enemy_0', count: 4 }, { unitId: 'hero', count: 5 },
      ] });
    const settled = battle.transcript(); battle.packet(); battle.packet(true);
    expect(battle.transcript()).toEqual(settled);
    expect(settled.events.filter(event => event.t === 'battle/rewards')).toHaveLength(1);
  });
  it('keeps stale previews and unavailable actions transactional', () => {
    const battle = new BattleRuntime(createBattleDemo('world')); const before = battle.transcript();
    expect(() => battle.execute({ t: 'battle/defend', actor: 'hero', revision: 0 })).toThrow('BATTLE_ACTION_UNAVAILABLE');
    expect(() => battle.execute({ t: 'battle/step', revision: 1 })).toThrow('BATTLE_STALE_PREVIEW');
    expect(battle.transcript()).toEqual(before);
  });
});
