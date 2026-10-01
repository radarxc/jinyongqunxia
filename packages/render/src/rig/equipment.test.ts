import { describe, expect, it } from 'vitest';
import { assembleEquipment, equipmentEquals, tintForEquipment, weightClassForEquipment } from './equipment';

describe('assembleEquipment', () => {
  it('assembles the full equipment projection within four attachment slots', () => {
    const result = assembleEquipment({
      mainHand: { id: 'eq_demo_sword_pair', hands: 'pair', tint: '#a04030' },
      body: 'eq_demo_armor', head: 'eq_demo_head', hands: 'eq_demo_gloves',
      shoulder: 'eq_demo_pauldron', cape: 'eq_demo_cape', waist: 'eq_demo_belt',
      feet: 'eq_demo_boots', accessory: { id: 'eq_demo_pouch', visibleHolster: true },
      innerBody: 'eq_demo_inner',
    }, 'front34');
    const snapshot = {
      attachments: result.attachments.map(({ kind, itemId, parent, zOrder }) => ({ kind, itemId, parent, zOrder })),
      composites: result.composites.map(({ part, itemId }) => ({ part, itemId })),
      replacements: result.replacements.map(({ part, itemId }) => ({ part, itemId })),
    };
    expect(snapshot).toMatchInlineSnapshot(`
      {
        "attachments": [
          {
            "itemId": "eq_demo_sword_pair",
            "kind": "weapon_R",
            "parent": "hand_R",
            "zOrder": 15.25,
          },
          {
            "itemId": "eq_demo_sword_pair",
            "kind": "weapon_L",
            "parent": "hand_L",
            "zOrder": 1.75,
          },
          {
            "itemId": "eq_demo_pauldron",
            "kind": "pauldron_R",
            "parent": "upper_arm_R",
            "zOrder": 13.35,
          },
          {
            "itemId": "eq_demo_cape",
            "kind": "cape",
            "parent": "torso",
            "zOrder": -2,
          },
        ],
        "composites": [
          {
            "itemId": "eq_demo_belt",
            "part": "pelvis_skirt",
          },
          {
            "itemId": "eq_demo_pouch",
            "part": "pelvis_skirt",
          },
          {
            "itemId": "eq_demo_pauldron",
            "part": "upper_arm_L",
          },
        ],
        "replacements": [
          {
            "itemId": "eq_demo_armor",
            "part": "torso",
          },
          {
            "itemId": "eq_demo_armor",
            "part": "pelvis_skirt",
          },
          {
            "itemId": "eq_demo_armor",
            "part": "upper_arm_L",
          },
          {
            "itemId": "eq_demo_armor",
            "part": "upper_arm_R",
          },
          {
            "itemId": "eq_demo_armor",
            "part": "forearm_L",
          },
          {
            "itemId": "eq_demo_armor",
            "part": "forearm_R",
          },
          {
            "itemId": "eq_demo_armor",
            "part": "thigh_L",
          },
          {
            "itemId": "eq_demo_armor",
            "part": "thigh_R",
          },
          {
            "itemId": "eq_demo_armor",
            "part": "shin_L",
          },
          {
            "itemId": "eq_demo_armor",
            "part": "shin_R",
          },
          {
            "itemId": "eq_demo_head",
            "part": "hair_or_headgear",
          },
          {
            "itemId": "eq_demo_gloves",
            "part": "hand_L",
          },
          {
            "itemId": "eq_demo_gloves",
            "part": "hand_R",
          },
          {
            "itemId": "eq_demo_boots",
            "part": "foot_L",
          },
          {
            "itemId": "eq_demo_boots",
            "part": "foot_R",
          },
        ],
      }
    `);
    expect(tintForEquipment({ id: 'explicit', tint: '#a04030' })).toBe(41478);
  });

  it('mirrors near and far shoulder priority and never renders inner armor', () => {
    const result = assembleEquipment({ shoulder: 'eq_shoulder', cape: 'eq_cape', innerBody: 'eq_inner' }, 'back34', true);
    expect(result.attachments.map((layer) => layer.kind)).toEqual(['pauldron_L', 'cape', 'pauldron_R']);
    expect(result.attachments.find((layer) => layer.kind === 'cape')?.zOrder).toBe(11.5);
    expect(JSON.stringify(result)).not.toContain('eq_inner');
  });

  it('detects visual metadata changes and derives the load class from readonly equipment', () => {
    expect(equipmentEquals({ body: { id: 'eq_armor', tint: '#ffffff' } }, { body: { id: 'eq_armor', tint: '#000000' } })).toBe(false);
    expect(weightClassForEquipment({})).toBe('light');
    expect(weightClassForEquipment({ body: 'eq_cloth' })).toBe('medium');
    expect(weightClassForEquipment({ mainHand: { id: 'eq_hammer', heavy: true } })).toBe('heavy');
  });
});
