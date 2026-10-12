import { describe, expect, it } from 'vitest';
import type { TownRuntimeDefinition } from '@tianshu/data/schemas';
import { queryShop } from '../economy/shop-query';
import { shopContent, shopState } from '../economy/__fixtures__/shop-fixture';
import type { CoreContent } from '../command';
import type { GameState } from '../state';
import { currentTownLayoutKey, resolveFacilityDialogue } from './facility';

const town = {
  sceneId: 'city_dali',
  cityId: 'city_dali',
  chapterId: 'ch01',
} as unknown as TownRuntimeDefinition;

function borrowedContent(): CoreContent {
  const base = shopContent();
  const chapter = base.chapters![0]!;
  const map = base.worldMaps![0]!;
  return {
    ...base,
    towns: [town],
    chapters: [chapter, { ...chapter, id: 'ch10_baima', eraLayerId: 'ch10' }],
    worldMaps: [map, { ...map, chapterId: 'ch10_baima', era: 'ch10' }],
    facilityDialogues: [
      {
        schemaVersion: 'facility-dialogue.v1',
        bindings: [
          {
            chapter: 'ch01_tianlong',
            kind: 'shop',
            sub: 'yaopu',
            roleKey: 'keeper',
            storyId: 'story_ch01_facility',
            entryKey: 'yaopu_keeper',
          },
          {
            chapter: 'ch10_baima',
            kind: 'shop',
            sub: 'yaopu',
            roleKey: 'keeper',
            storyId: 'story_ch10_facility',
            entryKey: 'yaopu_keeper',
          },
        ],
      },
    ],
  };
}

function chapter(state: GameState, chapterId: 'ch01_tianlong' | 'ch10_baima'): GameState {
  const eraLayerId = chapterId.slice(0, 4);
  return {
    ...state,
    chapter: {
      ...state.chapter,
      chapterId,
      eraLayerId,
      story: { ...state.chapter.story, chapterId },
    },
  };
}

describe('current town facility layout key', () => {
  it.each([
    ['keeps the native ch01 result', 'ch01_tianlong', 'story_ch01_facility'],
    ['uses the ch01 town definition while ch10 borrows Dali', 'ch10_baima', 'story_ch10_facility'],
  ] as const)('%s', (_name, chapterId, storyId) => {
    const content = borrowedContent();
    const state = chapter(shopState(), chapterId);
    expect(currentTownLayoutKey(state, content)).toBe('city_dali__ch01');
    const dialogue = resolveFacilityDialogue(state, content, {
      sceneId: 'city_dali',
      facilityKey: 'yaopu_01',
      roleKey: 'keeper',
    });
    expect(dialogue).toMatchObject({
      storyId,
      entryKey: 'yaopu_keeper',
      context: {
        shopKey: 'city_dali__ch01/yaopu_01',
        facilityKey: 'yaopu_01',
        roleKey: 'keeper',
      },
    });
    expect(queryShop(state, content, dialogue.context.shopKey!)).toMatchObject({
      instanceKey: 'city_dali__ch01/yaopu_01',
    });
  });

  it('keeps the authored layout when the borrowed definition is re-identified as ch10', () => {
    // The dev build borrows the ch01 runtime under the ch10 identity (cityId / chapterId rewritten,
    // source kept); the facility layout must still come from the compiled design spec.
    const borrowed = {
      ...town,
      chapterId: 'ch10',
      source: { spec: 'docs/design/town/city_dali__ch01.yaml' },
    } as unknown as TownRuntimeDefinition;
    const content = { ...borrowedContent(), towns: [borrowed] };
    const state = chapter(shopState(), 'ch10_baima');
    expect(currentTownLayoutKey(state, content)).toBe('city_dali__ch01');
    const dialogue = resolveFacilityDialogue(state, content, {
      sceneId: 'city_dali',
      facilityKey: 'yaopu_01',
      roleKey: 'keeper',
    });
    expect(dialogue).toMatchObject({
      storyId: 'story_ch10_facility',
      entryKey: 'yaopu_keeper',
      context: { shopKey: 'city_dali__ch01/yaopu_01' },
    });
  });

  it('prefers an explicit region town layout key', () => {
    const state = chapter(shopState(), 'ch10_baima');
    const region = {
      maps: [
        {
          id: 'sc_10_town_turpan',
          town: {
            layoutKey: 'city_turpan__ch10',
          },
        },
      ],
      gateFacts: { qinggong: 0 },
    } as unknown as NonNullable<CoreContent['region']>;
    expect(currentTownLayoutKey(state, { towns: [town], region }, 'sc_10_town_turpan')).toBe(
      'city_turpan__ch10',
    );
  });
});
