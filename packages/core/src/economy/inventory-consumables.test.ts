import type { ItemDef, MeridianProgress } from '@tianshu/data/schemas';
import { describe, expect, it } from 'vitest';
import { InventoryRuntime } from './inventory';
import { useConsumable } from './consumables';
import type { ConsumableTargetState } from './types';

const INVENTORY_ITEMS = [
  { id: 'it_low', kind: 'food', grade: 1, stack: 3 },
  { id: 'it_high', kind: 'food', grade: 8, stack: 9 },
  { id: 'eq_blade', kind: 'weapon', grade: 4, stack: 1 },
] as const;

function meridians(): MeridianProgress {
  return {
    schemaVersion: 2, opened: ['ap_fixture'],
    meridianStats: {},
    acupointStats: {
      ap_fixture: { grade: 5, strengthLayer: 2, strengthXp: 0, fluxCap: 12 },
    },
    targets: {}, turnCompleted: 0, lastAppliedMigration: 2,
  };
}

function target(overrides: Partial<ConsumableTargetState> = {}): ConsumableTargetState {
  return {
    characterId: 'npc_fixture', alive: true, hp: 100, hpMax: 1_000,
    mp: 200, mpMax: 1_000, stamina: 20, staminaMax: 100,
    ailments: [{ tag: 'poison', grade: 3 }, { tag: 'injury', grade: 7 }],
    temporaryEffects: [],
    permanentBonuses: { stats: {}, hpMaxBp: 0, mpMaxBp: 0 },
    meridianAids: [], meridians: meridians(), ...overrides,
  };
}

function consumable(id: string, use: NonNullable<ItemDef['use']>): ItemDef {
  return {
    schemaVersion: 'item.v1', id, name: id, kind: 'pill', sub: 'medicine',
    grade: 6, stack: 9, chapters: 'any', origin: 'expanded', price: 'auto',
    flags: [], use, assets: { icon: `item/${id}` }, text: { desc: id },
    extension: { type: 'generic', value: {} },
  };
}

describe('InventoryRuntime', () => {
  it('adds, removes, filters and deterministically sorts stacks', () => {
    const runtime = new InventoryRuntime({ stacks: [
      { itemId: 'it_low', count: 1 }, { itemId: 'eq_blade', count: 1 },
      { itemId: 'it_high', count: 2 },
    ] }, INVENTORY_ITEMS);
    runtime.add('it_low', 2);
    runtime.remove('it_high', 1);
    expect(runtime.count('it_low')).toBe(3);
    expect(runtime.query({ kind: 'food', minimumGrade: 2 }, 'grade'))
      .toEqual([{ itemId: 'it_high', count: 1 }]);
    expect(runtime.snapshot('category').stacks.map((row) => row.itemId))
      .toEqual(['eq_blade', 'it_high', 'it_low']);
  });

  it('rejects non-positive counts, stack overflow and underflow without mutation', () => {
    const runtime = new InventoryRuntime({ stacks: [{ itemId: 'it_low', count: 2 }] },
      INVENTORY_ITEMS);
    expect(() => runtime.add('it_low', 2)).toThrow('INVENTORY_STACK_LIMIT');
    expect(() => runtime.remove('it_low', 3)).toThrow('INVENTORY_INSUFFICIENT');
    expect(() => runtime.add('it_low', 0)).toThrow('INVENTORY_COUNT');
    expect(runtime.snapshot()).toEqual({ stacks: [{ itemId: 'it_low', count: 2 }] });
    expect(() => new InventoryRuntime({ stacks: [{ itemId: 'it_low', count: -1 }] },
      INVENTORY_ITEMS)).toThrow('INVENTORY_COUNT');
  });
});

describe('useConsumable', () => {
  it('applies recovery, dispel, temporary and permanent effects then consumes one item', () => {
    const item = consumable('it_effects', {
      context: 'field', action: 'consume', target: 'self', effects: [
        { op: 'healPct', params: { valueBp: 2_000 } },
        { op: 'mpPct', params: { valueBp: 1_000 } },
        { op: 'staPct', params: { valueBp: 5_000 } },
        { op: 'dispel', params: { tags: ['poison', 'injury'], grade: 6 } },
        { op: 'permStat', params: { stat: 'strength', value: 2 } },
        { op: 'permMaxPct', params: { hpMaxBp: 100, mpMaxBp: 200 } },
        { op: 'applyBuff', params: { value: 'bf_fixture' } },
      ],
    });
    const result = useConsumable({ inventory: { stacks: [{ itemId: item.id, count: 2 }] },
      itemDefs: [item], item, target: target(), context: 'field', currentTick: 10,
      healingReceivedBp: 5_000 });
    expect(result.inventory.stacks).toEqual([{ itemId: item.id, count: 1 }]);
    expect(result.target).toMatchObject({ hp: 200, mp: 300, stamina: 70,
      ailments: [{ tag: 'injury', grade: 7 }],
      permanentBonuses: { stats: { strength: 2 }, hpMaxBp: 100, mpMaxBp: 200 },
      temporaryEffects: [{ op: 'applyBuff', grade: 6, params: { value: 'bf_fixture' } }],
    });
    expect(result.events).toEqual([
      { t: 'economy/itemUsed', itemId: item.id, targetId: 'npc_fixture' },
    ]);
  });

  it('floors percentage healing only after multiplying healing received', () => {
    const item = consumable('it_rounding', { context: 'field', action: 'consume',
      target: 'self', effects: [{ op: 'healPct', params: { valueBp: 4_000 } }] });
    const result = useConsumable({ inventory: { stacks: [{ itemId: item.id, count: 1 }] },
      itemDefs: [item], item, target: target({ hp: 0, hpMax: 2 }), context: 'field',
      currentTick: 0, healingReceivedBp: 15_000 });
    expect(result.target.hp).toBe(1);
  });

  it('routes herb permanent tempering through ENG-03 and records temporary aid expiry', () => {
    const temper = consumable('it_temper', {
      context: 'field', action: 'consume', target: 'self', effects: [],
      meridianTemper: { targetKind: 'acupoint', targetRef: 'ap_fixture',
        gradeUp: 1, strengthXp: 100, fluxFlat: 4 },
    });
    const boosted = useConsumable({ inventory: { stacks: [{ itemId: temper.id, count: 1 }] },
      itemDefs: [temper], item: temper, target: target(), context: 'field', currentTick: 30 });
    expect(boosted.target.meridians.acupointStats['ap_fixture']).toEqual({
      grade: 6, strengthLayer: 2, strengthXp: 100, fluxCap: 16,
    });
    expect(boosted.events.map((event) => event.t)).toEqual([
      'economy/itemUsed', 'progression/meridianBoostApplied',
    ]);

    const aid = consumable('it_aid', {
      context: 'field', action: 'consume', target: 'self', effects: [],
      meridianAid: { rateBp: 1_000, successBp: 500, costReduceBp: 250, hours: 2 },
    });
    const aided = useConsumable({ inventory: { stacks: [{ itemId: aid.id, count: 1 }] },
      itemDefs: [aid], item: aid, target: target(), context: 'field', currentTick: 30 });
    expect(aided.target.meridianAids).toEqual([{ sourceItemId: aid.id, expiresAtTick: 1_230,
      rateBp: 1_000, successBp: 500, costReduceBp: 250 }]);
  });

  it('revives only in battle and preserves the item when validation fails', () => {
    const item = consumable('it_revive', { context: 'both', action: 'consume',
      target: 'self', effects: [{ op: 'revive', params: { valueBp: 3_000 } }] });
    const inventory = { stacks: [{ itemId: item.id, count: 1 }] };
    expect(() => useConsumable({ inventory, itemDefs: [item], item,
      target: target({ alive: false, hp: 0 }), context: 'field', currentTick: 0 }))
      .toThrow('CONSUMABLE_REVIVE_CONTEXT');
    const result = useConsumable({ inventory, itemDefs: [item], item,
      target: target({ alive: false, hp: 0 }), context: 'battle', currentTick: 0 });
    expect(result.target).toMatchObject({ alive: true, hp: 300 });
    expect(inventory.stacks).toEqual([{ itemId: item.id, count: 1 }]);
  });

  it('reports field time and enforces per-battle and unique-use ledgers atomically', () => {
    const item = { ...consumable('it_limited', { context: 'both', action: 'consume',
      target: 'self', effects: [], fieldTime: 6,
      battleLimit: { perBattle: 1, cooldown: 0 } }), flags: ['uniqueUse'] };
    const inventory = { stacks: [{ itemId: item.id, count: 2 }] };
    const first = useConsumable({ inventory, itemDefs: [item], item, target: target(),
      context: 'battle', currentTick: 0 });
    expect(first).toMatchObject({ fieldTime: 6, usage: {
      battleUses: { it_limited: 1 }, chapterUses: { it_limited: 1 },
    }, inventory: { stacks: [{ itemId: 'it_limited', count: 1 }] } });
    expect(() => useConsumable({ inventory: first.inventory, itemDefs: [item], item,
      target: first.target, context: 'battle', currentTick: 1, usage: first.usage }))
      .toThrow('CONSUMABLE_BATTLE_LIMIT');
    expect(first.inventory.stacks).toEqual([{ itemId: 'it_limited', count: 1 }]);
  });

  it('enforces item cooldown by ENG-09 own-action token', () => {
    const item = consumable('it_cooldown', { context: 'battle', action: 'consume',
      target: 'self', effects: [], battleLimit: { perBattle: 3, cooldown: 2 } });
    const inventory = { stacks: [{ itemId: item.id, count: 3 }] };
    const first = useConsumable({ inventory, itemDefs: [item], item, target: target(),
      context: 'battle', currentTick: 0, battleTurnToken: 7 });
    expect(first.usage.lastBattleUseTurns).toEqual({ it_cooldown: 7 });
    expect(() => useConsumable({ inventory: first.inventory, itemDefs: [item], item,
      target: first.target, context: 'battle', currentTick: 0, battleTurnToken: 9,
      usage: first.usage })).toThrow('CONSUMABLE_COOLDOWN');
    expect(useConsumable({ inventory: first.inventory, itemDefs: [item], item,
      target: first.target, context: 'battle', currentTick: 0, battleTurnToken: 10,
      usage: first.usage }).inventory.stacks).toEqual([{ itemId: item.id, count: 1 }]);
  });
});
