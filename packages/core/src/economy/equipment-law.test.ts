import { describe, expect, it } from 'vitest';
import { createEmptyEquipment } from '../state';
import { deriveEquipmentPanel, equipItem, unequipItem } from './equipment';
import { canEnterNormalCityGate, checkUniformExposure } from './law';
import type { EquipmentRule, LawProfile } from './types';

const ITEMS = [
  { id: 'eq_pair', kind: 'weapon', grade: 7, stack: 1 },
  { id: 'eq_hidden', kind: 'hidden', grade: 6, stack: 1 },
  { id: 'eq_hat', kind: 'armor', grade: 3, stack: 1 },
  { id: 'eq_uniform', kind: 'armor', grade: 3, stack: 1 },
] as const;
const LAW: LawProfile = { uniform: true, allowedIdentityTags: ['office_song_patrol'],
  violation: 'uniformImpersonation', wantedIntent: 'activate', normalGate: 'blocked' };
const RULES: readonly EquipmentRule[] = [
  { itemId: 'eq_pair', slot: 'mainHand', hands: 'pair', modifiers: [
    { stat: 'atkOut', mode: 'flat', value: 20 },
    { stat: 'atkOut', mode: 'pctBp', value: 1_000 },
  ] },
  { itemId: 'eq_hidden', slot: 'offHand', offHandRole: 'hiddenCarrier' },
  { itemId: 'eq_hat', slot: 'head', modifiers: [
    { stat: 'hpMax', mode: 'flat', value: 100 },
    { stat: 'hpMax', mode: 'pctBp', value: 500 },
  ] },
  { itemId: 'eq_uniform', slot: 'body', lawProfile: LAW, exposure: 'visible' },
];

describe('equipment runtime', () => {
  it('equips and unequips a paired weapon atomically across both hand slots', () => {
    const equipped = equipItem(createEmptyEquipment(),
      { stacks: [{ itemId: 'eq_pair', count: 1 }] }, ITEMS, RULES, 'eq_pair');
    expect(equipped.equipment.entries.filter((entry) => entry.itemId === 'eq_pair')
      .map((entry) => entry.slot)).toEqual(['mainHand', 'offHand']);
    expect(equipped.inventory.stacks).toEqual([]);
    const removed = unequipItem(equipped.equipment, equipped.inventory, ITEMS, RULES, 'offHand');
    expect(removed.equipment).toEqual(createEmptyEquipment());
    expect(removed.inventory.stacks).toEqual([{ itemId: 'eq_pair', count: 1 }]);
  });

  it('recomputes flat modifiers before integer basis-point modifiers and deduplicates pairs', () => {
    const equipment = createEmptyEquipment();
    const entries = equipment.entries.map((entry) => ({ ...entry, itemId:
      entry.slot === 'mainHand' || entry.slot === 'offHand' ? 'eq_pair'
        : entry.slot === 'head' ? 'eq_hat' : null }));
    const panel = deriveEquipmentPanel({ hpMax: 1_000, mpMax: 500, atkOut: 100, atkIn: 0,
      defOut: 0, defIn: 0, con: 10, str: 10, agi: 10, wis: 10, wil: 10, luk: 10,
      cha: 10, hit: 0, eva: 0, parry: 0, pierce: 0, crit: 0, critDmg: 15_000,
      tough: 0, spd: 10, mov: 3, jump: 0, qinggong: 10, counter: 0, combo: 0,
      seal: 0, effHit: 0, effRes: 0, healPower: 10_000, healRecv: 10_000,
      resPoison: 0, resGu: 0, resSeal: 0, resInjury: 0, resCold: 0, resHeat: 0,
      resMind: 0, resCC: 0 }, { entries }, RULES);
    expect(panel).toMatchObject({ hpMax: 1_155, atkOut: 132, mov: 3 });
  });

  it('keeps a hidden-weapon carrier with a two-handed main weapon', () => {
    const twoHandRules: readonly EquipmentRule[] = [
      { itemId: 'eq_pair', slot: 'mainHand', hands: 2 },
      { itemId: 'eq_hidden', slot: 'offHand', offHandRole: 'hiddenCarrier' },
    ];
    const withHidden = equipItem(createEmptyEquipment(),
      { stacks: [{ itemId: 'eq_hidden', count: 1 }, { itemId: 'eq_pair', count: 1 }] },
      ITEMS, twoHandRules, 'eq_hidden');
    const result = equipItem(withHidden.equipment, withHidden.inventory, ITEMS,
      twoHandRules, 'eq_pair');
    expect(result.equipment.entries.find((entry) => entry.slot === 'offHand')?.itemId)
      .toBe('eq_hidden');
  });
});

describe('official-uniform exposure', () => {
  const equipment = { entries: createEmptyEquipment().entries.map((entry) => ({ ...entry,
    itemId: entry.slot === 'body' ? 'eq_uniform' : null })) };

  it('raises wanted level and blocks normal gates for an unauthorized visible uniform', () => {
    const result = checkUniformExposure({ equipment, rules: RULES, wearerId: 'npc_player',
      identityTags: [], locationId: 'city_lin_an', time: 600,
      lawState: { wantedLevel: 2, normalCityGateBlocked: false }, wantedIncrease: 3 });
    expect(result.lawState).toEqual({ wantedLevel: 5, normalCityGateBlocked: true });
    expect(canEnterNormalCityGate(result.lawState)).toBe(false);
    expect(result.events).toEqual([{ equipId: 'eq_uniform', wearerId: 'npc_player',
      lawProfile: LAW, exposure: 'visible', locationId: 'city_lin_an', time: 600 }]);
  });

  it('emits nothing for an authorized identity or a covered uniform', () => {
    const state = { wantedLevel: 0, normalCityGateBlocked: false };
    expect(checkUniformExposure({ equipment, rules: RULES, wearerId: 'npc_guard',
      identityTags: ['office_song_patrol'], locationId: 'city_lin_an', time: 600,
      lawState: state })).toEqual({ lawState: state, events: [] });
    const covered = RULES.map((rule) => rule.itemId === 'eq_uniform'
      ? { ...rule, exposure: 'covered' as const } : rule);
    expect(checkUniformExposure({ equipment, rules: covered, wearerId: 'npc_player',
      identityTags: [], locationId: 'city_lin_an', time: 601, lawState: state }))
      .toEqual({ lawState: state, events: [] });
  });
});
