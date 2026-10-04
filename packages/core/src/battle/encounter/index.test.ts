import { describe, expect, it } from 'vitest';
import type { ItemDef } from '@tianshu/data/schemas';
import { battleSeed } from '../../testing/combat-fixture';
import { createMeridianFlowRuntime, type MeridianFlowInput } from '../meridian-flow';
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

  it('derives the item-use cap from medical instead of trusting a seed snapshot', () => {
    const hero = battleSeed('hero');
    Object.assign(hero, { medical: 45, itemState: { uses: 1, maxUses: 99,
      battleUses: { it_test: 1 }, lastBattleUseTurns: { it_test: 0 } } });
    const state = createBattleState(createBattleSetup({ ...base, entryKind: 'encounter' }),
      [hero, battleSeed('enemy')]);
    expect(state.units[0]!.itemState).toEqual({ uses: 1, maxUses: 4,
      battleUses: { it_test: 1 }, lastBattleUseTurns: { it_test: 0 } });
  });

  it('does not freeze caller-owned condition objects while freezing its normalized copy', () => {
    const winCond = [{ kind: 'actionLimit' as const, actions: 3 }];
    const setup = createBattleSetup({ ...base, entryKind: 'story', winCond });
    expect(Object.isFrozen(winCond)).toBe(false);
    expect(Object.isFrozen(winCond[0])).toBe(false);
    expect(setup.end.winCond).not.toBe(winCond);
    expect(Object.isFrozen(setup.end.winCond)).toBe(true);
  });

  it('deep-clones meridians, item definitions and rewards before freezing setup', () => {
    const routeSteps = [{ acupointRef: 'ap_test', lengthUnit: 1, segmentCt: 60, riskBp: 0 }];
    const meridianInputs: MeridianFlowInput[] = participants.map((participant) => ({
      unitId: participant.unitRef, productionPerTick: 4, qiSpeedBp: 10_000, practiceBp: 9_000,
      nodes: [{ acupointRef: 'ap_test', opened: true, fluxCap: 8, lengthUnit: 1, flowBp: 10_000 }],
      routes: [{ routeId: 'mfr_test', purpose: 'attack', steps: routeSteps }],
      activeRouteId: 'mfr_test',
    }));
    const itemDefs: ItemDef[] = [{ schemaVersion: 'item.v1', id: 'it_test', name: '测试药',
      kind: 'pill', sub: 'medicine', grade: 1, stack: 9, chapters: 'any', origin: 'expanded',
      price: 1, flags: [], use: { context: 'battle', action: 'consume', target: 'self',
        effects: [{ op: 'healFlat', params: { value: 10 } }] }, assets: { icon: 'item/test' },
      text: { desc: 'test' }, extension: { type: 'generic', value: {} } }];
    const rewards = { drops: [{ itemId: 'it_test', name: '测试药', count: 1 }],
      lootPool: [{ itemId: 'it_test', name: '测试药', count: 2, weight: 1 }], lootDraws: 1 };
    const setup = createBattleSetup({ ...base, entryKind: 'story', meridianInputs, itemDefs, rewards });

    expect(Object.isFrozen(routeSteps)).toBe(false);
    expect(Object.isFrozen(meridianInputs[0]!.nodes[0])).toBe(false);
    expect(Object.isFrozen(itemDefs[0]!.use!.effects[0]!.params)).toBe(false);
    expect(Object.isFrozen(rewards.lootPool[0])).toBe(false);
    routeSteps[0]!.riskBp = 100;
    (itemDefs[0]!.use!.effects[0]!.params as { value: number }).value = 99;
    rewards.lootPool[0]!.count = 7;
    expect(setup.meridianInputs[0]!.routes[0]!.steps[0]!.riskBp).toBe(0);
    expect(setup.itemDefs[0]!.use!.effects[0]!.params['value']).toBe(10);
    expect(setup.rewards.lootPool[0]!.count).toBe(2);
  });

  it('keeps two units built from the same meridian template dynamically independent', () => {
    const node = { acupointRef: 'ap_shared', opened: true, fluxCap: 8, lengthUnit: 1, flowBp: 10_000 };
    const step = { acupointRef: 'ap_shared', lengthUnit: 1, segmentCt: 60, riskBp: 0 };
    const meridianInputs = participants.map((participant) => ({ unitId: participant.unitRef,
      productionPerTick: 4, qiSpeedBp: 10_000, practiceBp: 9_000, nodes: [node],
      routes: [{ routeId: 'mfr_shared', purpose: 'attack' as const, steps: [step] }],
      activeRouteId: 'mfr_shared' }));
    const setup = createBattleSetup({ ...base, entryKind: 'story', meridianInputs });
    const state = createBattleState(setup, [battleSeed('hero'), battleSeed('enemy')]);
    const hero = createMeridianFlowRuntime(setup.meridianInputs[0]!);
    hero.restore(state.meridianByUnit[0]!.flow);
    hero.tick(3);
    state.meridianByUnit[0]!.flow = hero.snapshot();

    expect(state.meridianByUnit[0]!.flow.routes[0]!.totalQi).toBeGreaterThan(0);
    expect(state.meridianByUnit[1]!.flow.routes[0]!.totalQi).toBe(0);
    expect(state.meridianByUnit[0]!.flow.routes).not.toBe(state.meridianByUnit[1]!.flow.routes);
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
    const grid = [{ q: 1, r: 0, height: 0, moveCost: 1, terrainDealtBp: 500,
      terrainTakenBp: -250, cover: { vs: ['ranged' as const], hit: -10, damageBp: -500,
        sourceDirs: [3 as const] } },
      { q: 0, r: 0, height: 0, moveCost: 1 }];
    const initialUnits = [{ unitRef: 'hero', pos: { q: 0, r: 0 }, facing: 0 as const },
      { unitRef: 'enemy', pos: { q: 1, r: 0 }, facing: 3 as const }];
    const setup = createBattleSetup({ ...base, entryKind: 'story', grid, initialUnits });
    grid[0]!.height = 7; (grid[0]!.cover!.sourceDirs as number[])[0] = 2; initialUnits[0]!.pos.q = 9;
    expect(setup.grid.cells.map(cell => [cell.q, cell.r, cell.height]))
      .toEqual([[0, 0, 0], [1, 0, 0]]);
    expect(setup.grid.cells[0]).toMatchObject({ terrainDealtBp: 0, terrainTakenBp: 0, cover: null });
    expect(setup.grid.cells[1]).toMatchObject({ terrainDealtBp: 500, terrainTakenBp: -250,
      cover: { vs: ['ranged'], hit: -10, damageBp: -500, sourceDirs: [3] } });
    expect(setup.start.initialByUnit[0]!.pos).toEqual({ q: 0, r: 0 });
  });

  it('normalizes participant, placement and grid permutations to identical bytes', () => {
    const grid = [
      { q: 1, r: -1, height: 1, moveCost: 2, los: 'partial' as const, cover: {
        vs: ['ranged' as const, 'projectile' as const], hit: -10, damageBp: -500,
        sourceDirs: [5 as const, 1 as const],
      } },
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
        grid: shuffled(grid, seed ^ 0x2468_ace0).map((cell) => cell.cover === undefined ? cell : {
          ...cell, cover: { ...cell.cover, vs: shuffled(cell.cover.vs, seed),
            sourceDirs: shuffled(cell.cover.sourceDirs, seed ^ 0xfeed) },
        }) });
      expect(JSON.stringify(actual), `seed=${seed}`).toBe(expected);
    }
  });

  it('rejects malformed, oversized-span, unstandable and occupied placement grids', () => {
    const placements = [{ unitRef: 'hero', pos: { q: 0, r: 0 }, facing: 0 as const },
      { unitRef: 'enemy', pos: { q: 20, r: 0 }, facing: 3 as const }];
    expect(() => createBattleSetup({ ...base, entryKind: 'story', initialUnits: placements, grid: [
      { q: 0, r: 0, height: 0, moveCost: 1 }, { q: 20, r: 0, height: 0, moveCost: 1 },
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

  it('rejects malformed materialized terrain and cover values at runtime', () => {
    const invalidCells = [
      { q: 0, r: 0, height: 0, moveCost: 1, terrainDealtBp: 0.5 },
      { q: 0, r: 0, height: 0, moveCost: 1, terrainTakenBp: Number.NaN },
      { q: 0, r: 0, height: 0, moveCost: 1,
        cover: { vs: ['melee' as 'ranged'], hit: -10, damageBp: -500 } },
      { q: 0, r: 0, height: 0, moveCost: 1,
        cover: { vs: ['ranged' as const], hit: -10.5, damageBp: -500 } },
      { q: 0, r: 0, height: 0, moveCost: 1,
        cover: { vs: ['ranged' as const], hit: -10, damageBp: -500, sourceDirs: [6 as 0] } },
    ];
    for (const cell of invalidCells) {
      expect(() => createBattleSetup({ ...base, entryKind: 'story', grid: [cell,
        { q: 1, r: 0, height: 0, moveCost: 1 }] })).toThrow('BATTLE_SETUP_GRID');
    }
  });
});
