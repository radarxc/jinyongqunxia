import { describe, expect, it } from 'vitest';
import { createRng, type Rng } from '../../rng';
import { combatFixture } from '../../testing/combat-fixture';
import { computeBattleRewards, emitBattleRewards } from './index';

describe('battle rewards', () => {
  it('returns stable use, movement, circulation and fixed-drop facts without RNG', () => {
    const state = combatFixture({ rewards: { drops: [
      { itemId: 'it_z', name: '乙', count: 1 }, { itemId: 'it_a', name: '甲', count: 2 },
    ] } });
    state.rewardStats.martialUses.push(
      { unitId: 'hero', skillId: 'sk_normal', uses: 1 },
      { unitId: 'hero', skillId: 'sk_ultimate', uses: 3 });
    state.rewardStats.movementActions.push({ unitId: 'hero', count: 3 },
      { unitId: 'enemy_0', count: 2 });
    state.rewardStats.fullCirculations.push({ unitId: 'hero', count: 2 });
    let calls = 0;
    const rng: Rng = { nextU32: () => { calls += 1; return 0; }, snapshot: () => [0, 0, 0, 0] };

    expect(computeBattleRewards(state, rng)).toEqual({
      drops: [{ itemId: 'it_a', name: '甲', count: 2 }, { itemId: 'it_z', name: '乙', count: 1 }],
      martialUses: [{ unitId: 'hero', skillId: 'sk_normal', uses: 1 },
        { unitId: 'hero', skillId: 'sk_ultimate', uses: 3 }],
      movementTrained: ['hero'], fullCirculations: [{ unitId: 'hero', count: 2 }],
    });
    expect(calls).toBe(0);
  });

  it('uses only the injected loot stream for declared random draws and merges stacks', () => {
    const state = combatFixture({ rewards: { drops: [{ itemId: 'it_a', name: '甲', count: 1 }],
      lootPool: [{ itemId: 'it_a', name: '甲', count: 2, weight: 1 },
        { itemId: 'it_b', name: '乙', count: 1, weight: 1 }], lootDraws: 2 } });
    let calls = 0; const rng: Rng = { nextU32: () => { calls += 1; return 0; },
      snapshot: () => [calls, 0, 0, 0] };
    expect(computeBattleRewards(state, rng).drops).toEqual([
      { itemId: 'it_a', name: '甲', count: 5 },
    ]);
    expect(calls).toBe(2);
  });

  it('draws with replacement when draw count exceeds pool entry count', () => {
    const state = combatFixture({ rewards: { lootPool: [
      { itemId: 'it_a', name: '甲', count: 2, weight: 1 },
    ], lootDraws: 3 } });
    let calls = 0;
    const rng: Rng = { nextU32: () => { calls += 1; return 0; },
      snapshot: () => [calls, 0, 0, 0] };

    expect(computeBattleRewards(state, rng).drops).toEqual([
      { itemId: 'it_a', name: '甲', count: 6 },
    ]);
    expect(calls).toBe(3);
  });

  it('emits battle/rewards once and does not write world state', () => {
    const state = combatFixture(); state.phase = 'ended'; state.result = 'win';
    const rewards = computeBattleRewards(state, createRng([1, 2, 3, 4]));
    emitBattleRewards(state, rewards); emitBattleRewards(state, rewards);
    expect(state.events.filter((event) => event.t === 'battle/rewards')).toEqual([
      expect.objectContaining({ payload: rewards }),
    ]);
  });

  it('merges duplicate fixed drops and returns data detached from canonical state', () => {
    const state = combatFixture({ rewards: { drops: [
      { itemId: 'it_a', name: '甲', count: 1 }, { itemId: 'it_a', name: '甲', count: 2 },
    ] } });
    const before = structuredClone(state);
    const rewards = computeBattleRewards(state);
    expect(rewards.drops).toEqual([{ itemId: 'it_a', name: '甲', count: 3 }]);
    Object.assign(rewards.drops[0]!, { count: 100 });
    expect(state).toEqual(before);
  });

  it('copies event payloads so callers cannot rewrite the recorded reward', () => {
    const state = combatFixture({ rewards: { drops: [{ itemId: 'it_a', name: '甲', count: 1 }] } });
    state.phase = 'ended'; state.result = 'win';
    const rewards = computeBattleRewards(state); emitBattleRewards(state, rewards);
    Object.assign(rewards.drops[0]!, { count: 9 });
    expect(state.events[0]!.payload).toMatchObject({
      drops: [{ itemId: 'it_a', name: '甲', count: 1 }],
    });
  });

  it('rejects invalid loot setups before any battle starts', () => {
    expect(() => combatFixture({ rewards: { lootDraws: 1 } })).toThrow('BATTLE_SETUP_REWARDS');
    expect(() => combatFixture({ rewards: { lootDraws: 1, lootPool: [
      { itemId: 'it_a', name: '甲', count: 1, weight: 0x1_0000_0000 },
      { itemId: 'it_b', name: '乙', count: 1, weight: 1 },
    ] } })).toThrow('BATTLE_SETUP_REWARDS');
  });

  it('produces the same declared loot for identical injected RNG state', () => {
    const state = combatFixture({ rewards: { lootDraws: 3, lootPool: [
      { itemId: 'it_a', name: '甲', count: 1, weight: 1 },
      { itemId: 'it_b', name: '乙', count: 1, weight: 3 },
    ] } });
    const before = structuredClone(state);
    const first = createRng([1, 2, 3, 4]); const second = createRng(first.snapshot());
    expect(computeBattleRewards(state, first)).toEqual(computeBattleRewards(state, second));
    expect(first.snapshot()).toEqual(second.snapshot()); expect(state).toEqual(before);
  });
});
