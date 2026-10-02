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
    expect(transcript.commands).toHaveLength(13);
    expect(transcript.commands.map(command => command.actor)).toEqual([
      'hero', 'enemy_0', 'hero', 'enemy_0', 'hero', 'enemy_0', 'hero',
      'enemy_0', 'hero', 'enemy_0', 'hero', 'enemy_0', 'hero',
    ]);
    expect(transcript.events.map(event => event.t)).toEqual([
      'battle/autoSimulationStarted',
      ...Array.from({ length: 12 }, () => ['battle/damageResolved', 'battle/autoExchangeResolved']).flat(),
      'battle/damageResolved', 'battle/unitDowned', 'battle/autoExchangeResolved',
      'battle/ended', 'battle/autoSimulationEnded',
    ]);
    expect(packet).toMatchObject({ result: 'win', actionNo: 13, auto: false });
    expect(packet.units.find(unit => unit.id === 'enemy_0')).toMatchObject({ hp: 0, active: false });
  });
  it('keeps stale previews and unavailable actions transactional', () => {
    const battle = new BattleRuntime(createBattleDemo('world')); const before = battle.transcript();
    expect(() => battle.execute({ t: 'battle/defend', actor: 'hero', revision: 0 })).toThrow('BATTLE_ACTION_UNAVAILABLE');
    expect(() => battle.execute({ t: 'battle/step', revision: 1 })).toThrow('BATTLE_STALE_PREVIEW');
    expect(battle.transcript()).toEqual(before);
  });
});
