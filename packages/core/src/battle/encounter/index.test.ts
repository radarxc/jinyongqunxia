import { describe, expect, it } from 'vitest';
import { battleSeed } from '../../testing/combat-fixture';
import { createBattleState, createBattleSetup, createMeditationAmbushBattleSetup, evaluateBattleEnd } from './index';

const participants = [
  { unitRef: 'enemy', side: 'enemy' as const, control: 'ai' as const, spawn: 'e',
    state: 'active' as const, required: true },
  { unitRef: 'hero', side: 'player' as const, control: 'player' as const, spawn: 'p',
    state: 'active' as const, required: true },
];
const base = { encounterId: 'enc_test' as const, setupId: 'setup-test', seed: 7,
  sourceSnapshotHash: '0'.repeat(64), sourceId: 'source', triggerId: 'trigger', worldTick: 10,
  participants, sceneRef: 'sc_test', anchorRef: 'anchor' };

describe('BattleSetup and encounter state', () => {
  it('sorts participants, assigns stable indices and creates complete symmetric relations', () => {
    const setup = createBattleSetup({ ...base, entryKind: 'story' });
    expect(setup.participants.map((entry) => [entry.unitRef, entry.unitIndex]))
      .toEqual([['hero', 0], ['enemy', 1]]);
    expect(setup.relations.enemy.enemy).toBe('friendly');
    expect(setup.relations.neutral.player).toBe('neutral');
    expect(Object.isFrozen(setup)).toBe(true);
    expect(Object.isFrozen(setup.participants)).toBe(true);
    expect(Object.isFrozen(setup.end.winCond[0])).toBe(true);
  });

  it('materializes qi deviation only for interrupted meditators and gives enemies initiative', () => {
    const setup = createMeditationAmbushBattleSetup({ ...base, meditationUnitRefs: ['hero'] });
    const state = createBattleState(setup, [battleSeed('hero'), battleSeed('enemy')]);
    expect(setup.entry.meditationInterrupted).toBe(true);
    expect(state.openingOrder).toEqual(['enemy', 'hero']);
    expect(state.units[0]?.buffs).toEqual([expect.objectContaining({
      def: 'bf_chaqi', turnsLeft: 3, fresh: false })]);
    expect(state.units[1]?.buffs).toEqual([]);
  });

  it('uses lose before win and draw when several end conditions match', () => {
    const setup = createBattleSetup({ ...base, entryKind: 'story',
      winCond: [{ kind: 'actionLimit', actions: 0 }], loseCond: [{ kind: 'actionLimit', actions: 0 }],
      drawCond: [{ kind: 'actionLimit', actions: 0 }] });
    expect(evaluateBattleEnd(createBattleState(setup, [battleSeed('hero'), battleSeed('enemy')]))).toBe('lose');
  });

  it('does not share mutable seed arrays or nested guard objects', () => {
    const hero = battleSeed('hero');
    const state = createBattleState(createBattleSetup({ ...base, entryKind: 'encounter' }),
      [hero, battleSeed('enemy')]);
    state.units[0]!.zoneGuards.body.qi = 9; state.units[0]!.buffs.push({ iid: 1, def: 'bf_chaqi',
      holder: 'hero', source: null, grade: 1, stacks: 1, turnsLeft: 1, fresh: false });
    expect(hero.zoneGuards.body.qi).toBe(0); expect(hero.buffs).toEqual([]);
  });

  it('does not freeze caller-owned condition objects while freezing its normalized copy', () => {
    const winCond = [{ kind: 'actionLimit' as const, actions: 3 }];
    const setup = createBattleSetup({ ...base, entryKind: 'story', winCond });
    expect(Object.isFrozen(winCond)).toBe(false);
    expect(Object.isFrozen(winCond[0])).toBe(false);
    expect(setup.end.winCond).not.toBe(winCond);
    expect(Object.isFrozen(setup.end.winCond)).toBe(true);
  });
});
