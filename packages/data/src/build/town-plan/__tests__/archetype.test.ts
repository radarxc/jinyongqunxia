import { describe, expect, it } from 'vitest';
import { parseBuildingType } from '../archetype';

const KIT_TYPES = {
  liao_jin_north: [
    'guardhouse', 'house_large', 'house_small', 'inn', 'market_stall', 'shop_1f',
    'shop_2f', 'stable', 'temple_hall', 'wangfu', 'warehouse', 'yamen',
  ],
  song_dali: [
    'biaoju', 'casino', 'courtyard', 'guardhouse', 'house', 'inn', 'manor',
    'market_stall', 'restaurant', 'shop', 'shrine', 'stable', 'temple_hall',
    'wangfu', 'warehouse', 'yamen',
  ],
  song_north: [
    'courtyard', 'house_large', 'house_small', 'inn', 'market_stall', 'shop_1f',
    'shop_2f', 'stable',
  ],
  song_southern: [
    'biaoju', 'casino', 'courtyard', 'guardhouse', 'house', 'inn', 'manor',
    'market_stall', 'pagoda', 'palace_hall', 'restaurant', 'shop_1f', 'shop_2f',
    'stable', 'temple_hall', 'warehouse', 'wharf', 'yamen',
  ],
  tubo: [
    'casino', 'courtyard', 'house_small', 'inn', 'market_stall', 'shop_1f', 'stable',
    'temple_hall', 'warehouse', 'yamen',
  ],
  xiyu: [
    'casino', 'courtyard', 'house_small', 'inn', 'market', 'palace', 'shop_1f',
    'stable', 'temple_hall', 'warehouse', 'yamen',
  ],
} as const;

const KIT_CASES = Object.entries(KIT_TYPES).flatMap(([kit, archetypes]) =>
  archetypes.map((archetype) => ({ type: `bld_kit_${kit}_${archetype}`, kit, archetype })),
);
const LANDMARKS = [
  'bld_lm_ch01_chongshengsi_pagoda',
  'bld_lm_ch01_chongshengsi_pagoda_small',
  'bld_lm_ch02_linan_palace_gate',
] as const;

describe('town layout building type parser', () => {
  it('covers exactly the 78 current layout type strings', () => {
    expect(KIT_CASES).toHaveLength(75);
    expect([...KIT_CASES.map(({ type }) => type), ...LANDMARKS]).toHaveLength(78);
  });

  it.each(KIT_CASES)('parses $type', ({ type, kit, archetype }) => {
    expect(parseBuildingType(type)).toEqual({ kit, archetype });
  });

  it.each(LANDMARKS)('parses landmark %s', (landmark) => {
    expect(parseBuildingType(landmark)).toEqual({ landmark });
  });

  it('uses longest known kit-prefix matching', () => {
    expect(parseBuildingType('bld_kit_song_southern_house')).toEqual({
      kit: 'song_southern', archetype: 'house',
    });
    expect(parseBuildingType('bld_kit_song_house')).toEqual({ kit: 'song', archetype: 'house' });
  });

  it.each([
    'bld_kit_unknown_house',
    'bld_kit_song_dali_unknown',
    'bld_lm_ch1_bad',
    'house',
  ])('rejects unknown type %s', (type) => {
    expect(() => parseBuildingType(type)).toThrow(`TOWN_PLAN_UNKNOWN_TYPE:${type}`);
  });
});
