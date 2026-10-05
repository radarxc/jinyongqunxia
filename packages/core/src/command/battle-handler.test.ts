import type { ItemDef } from '@tianshu/data/schemas';
import { describe, expect, it } from 'vitest';
import { createCore } from '../api';
import { deriveRetrySeed } from '../battle';
import { createRng } from '../rng';
import { assertCanonicalGameState } from '../state';
import { BASIC_MOVE, battleSeed, combatFixture } from '../testing/combat-fixture';
import type { BattleEnterCommand, BattleBusCommand, CommandHandler, CoreTransaction } from '.';
import { dispatchCommand } from './bus';
import { battleHandler } from './battle-handler';

const drop: ItemDef = { schemaVersion: 'item.v1', id: 'it_battle_receipt', name: '战利品',
  kind: 'material', sub: 'ore', grade: 1, stack: 99, chapters: 'any', origin: 'expanded',
  price: 1, flags: [], assets: { icon: 'item/test' }, text: { desc: '测试。' },
  extension: { type: 'generic', value: {} } };
const medicine: ItemDef = { schemaVersion: 'item.v1', id: 'it_battle_medicine', name: '战斗药',
  kind: 'pill', sub: 'medicine', grade: 1, stack: 9, chapters: 'any', origin: 'expanded',
  price: 1, flags: [], use: { context: 'battle', action: 'consume', target: 'self',
    effects: [{ op: 'healPct', params: { valueBp: 1_000 } }] },
  assets: { icon: 'item/test' }, text: { desc: '测试。' },
  extension: { type: 'generic', value: {} } };

function enterCommand(input: Parameters<typeof combatFixture>[0] = {}): BattleEnterCommand {
  const battle = combatFixture(input);
  return { t: 'battle/enter', setup: battle.setup,
    seeds: battle.units.map((unit) => battleSeed(unit.id, unit.moves)) };
}
function state(seed = 23) { return createCore(seed).snapshot(); }
function enter(target: ReturnType<typeof state>, command = enterCommand()) {
  const result = dispatchCommand(target, command);
  expect(result.ok).toBe(true); expect(target.battle).not.toBeNull();
}
function finish(target: ReturnType<typeof state>): void {
  expect(dispatchCommand(target, { t: 'battle/setAuto', mode: 'auto' }).ok).toBe(true);
  for (let count = 0; count < 100 && target.battle?.battle.phase !== 'ended'; count += 1) {
    expect(dispatchCommand(target, { t: 'battle/act', automatic: true }).ok).toBe(true);
  }
  expect(target.battle?.battle.phase).toBe('ended');
}

describe('battle command handler', () => {
  it('enters with one world-stream seed and rejects a second active battle', () => {
    const target = state(); const before = target.meta.rng.world;
    const expected = createRng(before); const seed = expected.nextU32();
    enter(target);
    expect(target.battle?.battle.setup.seed).toBe(seed);
    expect(target.meta.rng.world).toEqual(expected.snapshot());
    const unchanged = structuredClone(target);
    expect(dispatchCommand(target, enterCommand())).toEqual({ ok: false, reason: 'BATTLE_ALREADY_ACTIVE' });
    expect(target).toEqual(unchanged);
  });

  it('accepts a manual action and rejects a stale or wrong-turn action atomically', () => {
    const target = state(); enter(target); const revision = target.battle!.revision;
    const success = dispatchCommand(target, { t: 'battle/act', actor: 'hero',
      action: { t: 'skill', move: BASIC_MOVE.id, target: 'enemy_0' }, expectedRevision: revision });
    expect(success.ok).toBe(true); expect(target.battle?.battle.actionNo).toBe(1);
    const before = structuredClone(target);
    expect(dispatchCommand(target, { t: 'battle/act', actor: 'enemy_0', action: { t: 'wait' },
      expectedRevision: revision })).toEqual({ ok: false, reason: 'BATTLE_STALE_REVISION' });
    expect(target).toEqual(before);
  });

  it('sets auto once, treats duplicate mode as a zero-write success, and honors noAuto', () => {
    const target = state(); enter(target);
    expect(dispatchCommand(target, { t: 'battle/setAuto', mode: 'auto' }).ok).toBe(true);
    const before = structuredClone(target);
    expect(dispatchCommand(target, { t: 'battle/setAuto', mode: 'auto' }))
      .toEqual({ ok: true, stateVersion: before.meta.stateVersion, events: [] });
    expect(target).toEqual(before);
    const forbidden = state(); enter(forbidden, enterCommand({ noAuto: true }));
    expect(dispatchCommand(forbidden, { t: 'battle/setAuto', mode: 'auto' }))
      .toEqual({ ok: false, reason: 'BATTLE_AUTO_FORBIDDEN' });
  });

  it('retries only an ended battle using hash(opening seed, retry count)', () => {
    const target = state(); enter(target);
    expect(dispatchCommand(target, { t: 'battle/retry', option: 'restart' }))
      .toEqual({ ok: false, reason: 'BATTLE_NOT_ENDED' });
    finish(target); const openingSeed = target.battle!.opening.setup.seed;
    expect(dispatchCommand(target, { t: 'battle/retry', option: 'restart' }).ok).toBe(true);
    expect(target.battle).toMatchObject({ retryCount: 1, auto: false,
      battle: { phase: 'opening', setup: { seed: deriveRetrySeed(openingSeed, 1) } } });
  });

  it('leaves only a matching ended battle and rejects a mismatched receipt', () => {
    const target = state(); enter(target); finish(target); const battle = target.battle!;
    const before = structuredClone(target);
    expect(dispatchCommand(target, { t: 'battle/leave', battleId: battle.battleId,
      outcomeSeq: battle.outcomeSeq + 1 })).toEqual({ ok: false, reason: 'BATTLE_RECEIPT_MISMATCH' });
    expect(target).toEqual(before);
    const result = dispatchCommand(target, { t: 'battle/leave', battleId: battle.battleId,
      outcomeSeq: battle.outcomeSeq });
    expect(result.ok).toBe(true); expect(target.battle).toBeNull();
  });

  it('finalizes rewards and inventory once with a durable receipt', () => {
    const target = state(); const command = enterCommand({ hp: 100, rewards: {
      drops: [{ itemId: drop.id, name: drop.name, count: 2 }], lootDraws: 0, lootPool: [],
    } });
    Object.assign(target.party, { inventory: { stacks: [{ itemId: drop.id, count: 3 }] } });
    const withItem = { ...command, setup: { ...command.setup, itemDefs: [drop] } };
    enter(target, withItem); finish(target); const battle = target.battle!;
    const receipt = { battleId: battle.battleId, outcomeSeq: battle.outcomeSeq };
    const result = dispatchCommand(target, { t: 'battle/finalize', ...receipt });
    expect(result.ok).toBe(true); expect(target.battle).toBeNull();
    expect(target.party.inventory.stacks).toEqual([{ itemId: drop.id, count: 5 }]);
    expect(target.world.battleReceipts).toEqual([receipt]);
    const before = structuredClone(target);
    expect(dispatchCommand(target, { t: 'battle/finalize', ...receipt }))
      .toEqual({ ok: true, stateVersion: before.meta.stateVersion, events: [] });
    expect(target).toEqual(before);
  });

  it('freezes the world inventory at enter and writes battle consumption back on finalize', () => {
    const target = state();
    Object.assign(target.party, { inventory: { stacks: [{ itemId: medicine.id, count: 2 }] } });
    const command = enterCommand({ hp: 300, itemDefs: [medicine] });
    enter(target, { ...command, setup: { ...command.setup, inventory: { stacks: [] } } });
    expect(target.battle?.battle.inventory.stacks).toEqual([{ itemId: medicine.id, count: 2 }]);
    expect(dispatchCommand(target, { t: 'battle/act', actor: 'hero',
      action: { t: 'item', item: medicine.id, target: 'hero' } }).ok).toBe(true);
    expect(target.battle?.battle.inventory.stacks).toEqual([{ itemId: medicine.id, count: 1 }]);
    finish(target); const active = target.battle!;
    expect(dispatchCommand(target, { t: 'battle/finalize', battleId: active.battleId,
      outcomeSeq: active.outcomeSeq }).ok).toBe(true);
    expect(target.party.inventory.stacks).toEqual([{ itemId: medicine.id, count: 1 }]);
  });

  it('carries a unique-use medicine limit across consecutive battles', () => {
    const target = state(); const unique = { ...medicine, flags: ['uniqueUse'] };
    Object.assign(target.party, { inventory: { stacks: [{ itemId: unique.id, count: 2 }] } });
    const command = enterCommand({ itemDefs: [unique] });
    const use = { t: 'battle/act', actor: 'hero',
      action: { t: 'item', item: unique.id, target: 'hero' } } as const;
    enter(target, command); expect(dispatchCommand(target, use).ok).toBe(true);
    finish(target); const active = target.battle!;
    expect(dispatchCommand(target, { t: 'battle/finalize', battleId: active.battleId,
      outcomeSeq: active.outcomeSeq }).ok).toBe(true);
    expect(target.chapter.itemChapterUses).toEqual({ [unique.id]: 1 });
    enter(target, command); const before = structuredClone(target);
    expect(dispatchCommand(target, use)).toEqual({ ok: false,
      reason: 'BATTLE_ACTION_REJECTED', at: 'LIMIT_REACHED' });
    expect(target).toEqual(before);
  });

  it('propagates malformed consumable rules without partial consumption', () => {
    const target = state();
    const broken = { ...medicine, use: { ...medicine.use!,
      effects: [{ op: 'healPct', params: { valueBp: 'invalid' } }] } };
    Object.assign(target.party, { inventory: { stacks: [{ itemId: medicine.id, count: 1 }] } });
    enter(target, enterCommand({ itemDefs: [broken] })); const before = structuredClone(target);
    expect(() => dispatchCommand(target, { t: 'battle/act', actor: 'hero',
      action: { t: 'item', item: medicine.id, target: 'hero' } })).toThrow('CONSUMABLE_EFFECT_INT');
    expect(target).toEqual(before);
  });

  it('rolls back a late finalize failure, including loot RNG and version counters', () => {
    const target = state(); const command = enterCommand({ hp: 100, rewards: {
      drops: [{ itemId: 'it_missing_drop', name: '缺失', count: 1 }], lootDraws: 0, lootPool: [],
    } });
    enter(target, command); finish(target); const battle = target.battle!;
    const before = structuredClone(target);
    expect(dispatchCommand(target, { t: 'battle/finalize', battleId: battle.battleId,
      outcomeSeq: battle.outcomeSeq })).toEqual({ ok: false, reason: 'BATTLE_REWARD_ITEM_UNKNOWN' });
    expect(target).toEqual(before);
  });

  it('rolls back random loot and receipts after writes, then awards the same draw once', () => {
    const target = state(); enter(target, enterCommand({ hp: 100, itemDefs: [drop], rewards: {
      drops: [], lootDraws: 2,
      lootPool: [{ itemId: drop.id, name: drop.name, count: 1, weight: 1 }],
    } }));
    finish(target); const active = target.battle!; const before = structuredClone(target);
    const command = { t: 'battle/finalize', battleId: active.battleId, outcomeSeq: active.outcomeSeq } as const;
    const failing: CommandHandler = { validate: battleHandler.validate, apply(tx, input) {
      battleHandler.apply(tx, input as BattleBusCommand); throw new Error('AFTER_LOOT');
    } };
    expect(() => dispatchCommand(target, command, {}, { [command.t]: failing })).toThrow('AFTER_LOOT');
    expect(target).toEqual(before);
    const expected = structuredClone(before);
    expect(dispatchCommand(expected, command).ok).toBe(true);
    expect(dispatchCommand(target, command).ok).toBe(true); expect(target).toEqual(expected);
    expect(target.meta.rng.loot).not.toEqual(before.meta.rng.loot);
    expect(target.party.inventory.stacks).toEqual([{ itemId: drop.id, count: 2 }]);
    const after = structuredClone(target);
    expect(dispatchCommand(target, command).ok).toBe(true); expect(target).toEqual(after);
  });

  it.each([['lose', 'normal'], ['win', 'spar']] as const)(
    'does not grant or draw loot for %s in %s mode', (result, mode) => {
      const target = state(); const command = enterCommand({ rewards: {
        drops: [{ itemId: drop.id, name: drop.name, count: 1 }],
        lootDraws: 1, lootPool: [{ itemId: drop.id, name: drop.name, count: 1, weight: 1 }],
      } });
      const setup = { ...command.setup, rules: { ...command.setup.rules, mode }, itemDefs: [drop] };
      enter(target, { ...command, setup }); const active = target.battle!;
      active.battle.phase = 'ended'; active.battle.result = result; active.outcomeSeq = 1;
      const lootBefore = target.meta.rng.loot;
      const finalized = dispatchCommand(target, { t: 'battle/finalize',
        battleId: active.battleId, outcomeSeq: active.outcomeSeq });
      expect(finalized.ok).toBe(true); expect(target.party.inventory.stacks).toEqual([]);
      expect(target.meta.rng.loot).toEqual(lootBefore);
      expect(finalized.ok && finalized.events.find((event) => event.t === 'battle/rewards')?.payload)
        .toMatchObject({ drops: [] });
    });

  it('pauses world tick for an active session without changing state or RNG', () => {
    const target = state(); enter(target); const before = structuredClone(target);
    expect(dispatchCommand(target, { t: 'world/tick' })).toEqual({ ok: false, reason: 'WORLD_PAUSED' });
    expect(target).toEqual(before);
  });

  it('rolls back writes, both RNG streams, session and version after a late handler failure', () => {
    const target = state(); enter(target); const before = structuredClone(target);
    const failing: CommandHandler = { validate: battleHandler.validate, apply(tx, command) {
      battleHandler.apply(tx, command as never); tx.rng('world').nextU32();
      tx.rng('loot').nextU32(); tx.set(['party', 'money'], 77); throw new Error('AFTER_K');
    } };
    expect(() => dispatchCommand(target, { t: 'battle/act', actor: 'hero', action: { t: 'wait' } },
      {}, { 'battle/act': failing })).toThrow('AFTER_K');
    expect(target).toEqual(before);
  });

  it('assigns separate receipts when the same encounter is entered twice', () => {
    const target = state(); enter(target); finish(target);
    const first = target.battle!;
    expect(dispatchCommand(target, { t: 'battle/finalize', battleId: first.battleId,
      outcomeSeq: first.outcomeSeq }).ok).toBe(true);
    enter(target); finish(target); const second = target.battle!;
    expect(second.battleId).not.toBe(first.battleId);
    expect(dispatchCommand(target, { t: 'battle/finalize', battleId: second.battleId,
      outcomeSeq: second.outcomeSeq }).ok).toBe(true);
    expect(target.battle).toBeNull(); expect(target.world.battleReceipts).toHaveLength(2);
  });

  it('does not bypass revision validation for an unchanged auto mode', () => {
    const target = state(); enter(target); const before = structuredClone(target);
    expect(dispatchCommand(target, { t: 'battle/setAuto', mode: 'manual', expectedRevision: 99 }))
      .toEqual({ ok: false, reason: 'BATTLE_STALE_REVISION' });
    expect(target).toEqual(before);
  });

  it('validates overwritten history even after its append prefix was cached', () => {
    const target = state(); enter(target);
    expect(dispatchCommand(target, { t: 'battle/setAuto', mode: 'auto' }).ok).toBe(true);
    target.battle!.commandLog[0] = { t: 'battle/setAuto', mode: 'auto', invalid: undefined } as never;
    expect(() => assertCanonicalGameState(target)).toThrow('STATE_UNDEFINED');
  });

  it('never caches mutable values appended outside the battle handler', () => {
    const target = state(); enter(target);
    expect(dispatchCommand(target, { t: 'battle/setAuto', mode: 'auto' }).ok).toBe(true);
    const append: CommandHandler = { validate: () => null, apply(tx) {
      tx.splice(['battle', 'commandLog'], target.battle!.commandLog.length, 0,
        [{ t: 'battle/setAuto', mode: 'manual' }]);
    } };
    const command = { t: 'battle/setAuto', mode: 'manual' } as const;
    expect(dispatchCommand(target, command, {}, { [command.t]: append }).ok).toBe(true);
    const before = structuredClone(target);
    const corrupt: CommandHandler = { validate: () => null, apply(tx) {
      tx.set(['battle', 'commandLog', 1, 'mode'], undefined);
    } };
    expect(() => dispatchCommand(target, command, {}, { [command.t]: corrupt }))
      .toThrow('STATE_UNDEFINED');
    expect(target).toEqual(before);
  });

  it('invalidates appended-history checks after a failed commit validation', () => {
    const target = state(); enter(target);
    expect(dispatchCommand(target, { t: 'battle/setAuto', mode: 'auto' }).ok).toBe(true);
    const before = structuredClone(target);
    const broken: CommandHandler = { validate: () => null, apply(tx, input) {
      battleHandler.apply(tx, input as BattleBusCommand);
      tx.set(['battle', 'revision'], -1);
    } };
    const command = { t: 'battle/act', automatic: true } as const;
    expect(() => dispatchCommand(target, command, {}, { [command.t]: broken })).toThrow('STATE_SHAPE');
    expect(target).toEqual(before);
    const expected = structuredClone(before);
    expect(dispatchCommand(target, command)).toEqual(dispatchCommand(expected, command));
    expect(target).toEqual(expected);
  });

  it('settles only participating profile training facts and keeps them after leaving', () => {
    const target = state();
    const hero = target.profile.protagonist!;
    Object.assign(target.profile, { protagonist: { ...hero, characterId: 'hero' } });
    enter(target); finish(target); const active = target.battle!;
    active.battle.rewardStats.fullCirculations.push({ unitId: 'hero', count: 3 },
      { unitId: 'enemy_0', count: 4 });
    active.battle.rewardStats.movementActions.push({ unitId: 'hero', count: 5 });
    const uses = active.battle.rewardStats.martialUses.filter((row) => row.unitId === 'hero');
    const receipt = { battleId: active.battleId, outcomeSeq: active.outcomeSeq };
    expect(dispatchCommand(target, { t: 'battle/leave', ...receipt }).ok).toBe(true);
    expect(target.profile.battleTraining).toEqual({ martialUses: uses,
      movementActions: [{ unitId: 'hero', count: 5 }], fullCirculations: [{ unitId: 'hero', count: 3 }] });
    const before = structuredClone(target);
    expect(dispatchCommand(target, { t: 'battle/finalize', ...receipt }).ok).toBe(true);
    expect(target).toEqual(before);
  });

  it.each(['enter', 'act', 'setAuto', 'retry', 'finalize', 'leave'] as const)(
    'rolls back %s after each transaction write and RNG draw', (kind) => {
      const baseline = state();
      if (kind !== 'enter') enter(baseline);
      if (kind === 'retry' || kind === 'finalize' || kind === 'leave') finish(baseline);
      const active = baseline.battle;
      const command: BattleBusCommand = kind === 'enter' ? enterCommand()
        : kind === 'act' ? { t: 'battle/act', actor: 'hero', action: { t: 'wait' } }
        : kind === 'setAuto' ? { t: 'battle/setAuto', mode: 'auto' }
        : kind === 'retry' ? { t: 'battle/retry', option: 'restart' }
        : { t: kind === 'leave' ? 'battle/leave' : 'battle/finalize',
          battleId: active!.battleId, outcomeSeq: active!.outcomeSeq };
      let writes = 0; let failAt = Number.POSITIVE_INFINITY;
      const after = () => { writes += 1; if (writes === failAt) throw new Error('AFTER_K'); };
      const failing: CommandHandler = { validate: battleHandler.validate, apply(tx, input) {
        const proxy: CoreTransaction = { state: tx.state, content: tx.content,
          set: (...args) => { tx.set(...args); after(); },
          splice: (...args) => { tx.splice(...args); after(); },
          rng: (stream) => { const rng = tx.rng(stream); return { snapshot: () => rng.snapshot(),
            nextU32: () => { const value = rng.nextU32(); after(); return value; } }; },
          emit: (event) => tx.emit(event), abort: (reason, at) => tx.abort(reason, at) };
        battleHandler.apply(proxy, input as BattleBusCommand);
      } };
      expect(dispatchCommand(structuredClone(baseline), command, {}, { [command.t]: failing }).ok).toBe(true);
      const total = writes; expect(total).toBeGreaterThan(0);
      for (failAt = 1; failAt <= total; failAt += 1) {
        writes = 0; const target = structuredClone(baseline);
        expect(() => dispatchCommand(target, command, {}, { [command.t]: failing })).toThrow('AFTER_K');
        expect(target).toEqual(baseline);
      }
    });
});
