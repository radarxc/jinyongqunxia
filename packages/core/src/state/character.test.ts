import { describe, expect, it } from 'vitest';
import type { ItemDef } from '@tianshu/data/schemas';
import { addInventoryItem, deriveCharacterStats } from '.';

function meridianProgress(openedInput: readonly string[] = []) {
  const opened = [...openedInput];
  return {
    schemaVersion: 2 as const, opened,
    meridianStats: opened.length === 0 ? {} : {
      mer_fixture: { grade: 6, strengthLayer: 4, strengthXp: 0, fluxCap: 20 },
    },
    acupointStats: Object.fromEntries(opened.map((id) => [id, {
      grade: 6, strengthLayer: 3, strengthXp: 0, fluxCap: 12,
    }])),
    targets: {}, turnCompleted: 0, lastAppliedMigration: 2,
  };
}

describe('deriveCharacterStats', () => {
  it('matches the DES-qi 1300/1222 resource example', () => {
    const openedAcupointIds = Array.from({ length: 9 }, (_, index) => `ap_fixture_${index + 1}`);
    const stats = deriveCharacterStats({
      skills: [
        { skillId: 'sk_external', absGrade: 6, category: 'other', trueLayer: 5 },
        { skillId: 'sk_inner', absGrade: 6, category: 'inner', trueLayer: 5 },
      ],
      meridians: meridianProgress(openedAcupointIds),
      legacyHpCredit: 0,
      legacyMpCredit: 0,
    });
    expect(stats).toMatchObject({ hpMax: 1300, mpMax: 1222 });
  });

  it('caps the resource contribution of true layer ten at layer nine', () => {
    const base = { meridians: meridianProgress(), legacyHpCredit: 0, legacyMpCredit: 0 };
    const layerNine = deriveCharacterStats({
      ...base, skills: [{ skillId: 'sk_inner', absGrade: 12, category: 'inner', trueLayer: 9 }],
    });
    const layerTen = deriveCharacterStats({
      ...base, skills: [{ skillId: 'sk_inner', absGrade: 12, category: 'inner', trueLayer: 10 }],
    });
    expect(layerTen).toEqual(layerNine);
  });

  it('applies basis points exactly near the safe-integer boundary', () => {
    const hpRoot = 9_006_298_624_878_502;
    const stats = deriveCharacterStats({
      skills: [], meridians: meridianProgress(),
      legacyHpCredit: hpRoot - 300, legacyMpCredit: 0, hpMaxPctBp: 1,
    });
    expect(stats.hpMax).toBe(9_007_199_254_740_989);
    expect(Number.isSafeInteger(stats.hpMax)).toBe(true);
  });

  it('clamps a non-positive modified root to one', () => {
    const stats = deriveCharacterStats({
      skills: [], meridians: meridianProgress(), legacyHpCredit: 0, legacyMpCredit: 0,
      flatHpMax: -500, flatMpMax: -500,
    });
    expect(stats).toMatchObject({ hpMax: 1, mpMax: 1 });
  });
});

describe('addInventoryItem', () => {
  const item = { id: 'it_fixture', stack: 3 } as ItemDef;

  it('merges a stack without mutating the source inventory', () => {
    const source = { stacks: [{ itemId: 'it_other', count: 1 }] };
    const result = addInventoryItem(source, item, 2);
    expect(result.stacks).toEqual([
      { itemId: 'it_fixture', count: 2 },
      { itemId: 'it_other', count: 1 },
    ]);
    expect(source.stacks).toEqual([{ itemId: 'it_other', count: 1 }]);
  });

  it('rejects a count beyond the item stack cap', () => {
    expect(() => addInventoryItem({ stacks: [{ itemId: 'it_fixture', count: 2 }] }, item, 2))
      .toThrow('INVENTORY_STACK_LIMIT');
  });
});
