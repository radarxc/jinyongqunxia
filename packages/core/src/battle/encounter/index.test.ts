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

function shuffled<T>(values: readonly T[], seed: number): T[] {
  const result = [...values];
  let state = seed >>> 0;
  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    const selected = state % (index + 1);
    [result[index], result[selected]] = [result[selected]!, result[index]!];
  }
  return result;
}

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

  it('rejects placements whose unit references do not match participants', () => {
    expect(() => createBattleSetup({ ...base, entryKind: 'story', initialUnits: [
      { unitRef: 'hero', pos: { q: 0, r: 0 }, facing: 0 },
      { unitRef: 'stranger', pos: { q: 1, r: 0 }, facing: 3 },
    ] })).toThrow('BATTLE_SETUP_PLACEMENTS');
  });

  it('rejects non-integer placement coordinates and out-of-range facings', () => {
    expect(() => createBattleSetup({ ...base, entryKind: 'story', initialUnits: [
      { unitRef: 'hero', pos: { q: 0.5, r: 0 }, facing: 0 },
      { unitRef: 'enemy', pos: { q: 1, r: 0 }, facing: 3 },
    ] })).toThrow('BATTLE_SETUP_PLACEMENTS');
    expect(() => createBattleSetup({ ...base, entryKind: 'story', initialUnits: [
      { unitRef: 'hero', pos: { q: 0, r: 0 }, facing: 6 as 0 },
      { unitRef: 'enemy', pos: { q: 1, r: 0 }, facing: 3 },
    ] })).toThrow('BATTLE_SETUP_PLACEMENTS');
  });

  it('normalizes grid and placements without retaining caller references', () => {
    const grid = [{ q: 1, r: 0, height: 0, moveCost: 1 },
      { q: 0, r: 0, height: 0, moveCost: 1 }];
    const initialUnits = [{ unitRef: 'hero', pos: { q: 0, r: 0 }, facing: 0 as const },
      { unitRef: 'enemy', pos: { q: 1, r: 0 }, facing: 3 as const }];
    const setup = createBattleSetup({ ...base, entryKind: 'story', grid, initialUnits });
    grid[0]!.height = 7; initialUnits[0]!.pos.q = 9;
    expect(setup.grid.cells.map(cell => [cell.q, cell.r, cell.height]))
      .toEqual([[0, 0, 0], [1, 0, 0]]);
    expect(setup.start.initialByUnit[0]!.pos).toEqual({ q: 0, r: 0 });
  });

  it('normalizes participant, placement and grid permutations to identical bytes', () => {
    const grid = [
      { q: 1, r: -1, height: 1, moveCost: 2, los: 'partial' as const },
      { q: 0, r: 0, height: 0, moveCost: 1 },
      { q: 1, r: 0, height: 0, moveCost: 1, dangerous: true },
    ];
    const initialUnits = [
      { unitRef: 'enemy', pos: { q: 1, r: 0 }, facing: 3 as const },
      { unitRef: 'hero', pos: { q: 0, r: 0 }, facing: 0 as const },
    ];
    const expected = JSON.stringify(createBattleSetup({
      ...base, entryKind: 'story', grid, initialUnits,
    }));
    for (let seed = 1; seed <= 100; seed += 1) {
      const actual = createBattleSetup({ ...base, entryKind: 'story',
        participants: shuffled(participants, seed),
        initialUnits: shuffled(initialUnits, seed ^ 0x1357_9bdf),
        grid: shuffled(grid, seed ^ 0x2468_ace0) });
      expect(JSON.stringify(actual), `seed=${seed}`).toBe(expected);
    }
  });

  it('rejects malformed, oversized-span, unstandable and occupied placement grids', () => {
    const placements = [{ unitRef: 'hero', pos: { q: 0, r: 0 }, facing: 0 as const },
      { unitRef: 'enemy', pos: { q: 21, r: 0 }, facing: 3 as const }];
    expect(() => createBattleSetup({ ...base, entryKind: 'story', initialUnits: placements, grid: [
      { q: 0, r: 0, height: 0, moveCost: 1 }, { q: 21, r: 0, height: 0, moveCost: 1 },
    ] })).toThrow('BATTLE_SETUP_GRID');
    expect(() => createBattleSetup({ ...base, entryKind: 'story', grid: [
      { q: 0, r: 0, height: 0, moveCost: 0 }, { q: 1, r: 0, height: 0, moveCost: 1 },
    ] })).toThrow('BATTLE_SETUP_GRID');
    expect(() => createBattleSetup({ ...base, entryKind: 'story', grid: [
      { q: 0, r: 0, height: 0, moveCost: 1, standable: false },
      { q: 1, r: 0, height: 0, moveCost: 1 },
    ] })).toThrow('BATTLE_SETUP_GRID');
  });

  it('rejects invalid LOS and non-boolean grid flags at runtime', () => {
    const invalidCells = [
      { q: 0, r: 0, height: 0, moveCost: 1, los: 'mist' as 'none' },
      { q: 0, r: 0, height: 0, moveCost: 1, standable: 1 as unknown as boolean },
      { q: 0, r: 0, height: 0, moveCost: 1, narrow: 'yes' as unknown as boolean },
      { q: 0, r: 0, height: 0, moveCost: 1, dangerous: null as unknown as boolean },
    ];
    for (const cell of invalidCells) {
      expect(() => createBattleSetup({ ...base, entryKind: 'story', grid: [cell,
        { q: 1, r: 0, height: 0, moveCost: 1 }] })).toThrow('BATTLE_SETUP_GRID');
    }
  });
});
