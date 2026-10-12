import type { TownRuntimeDefinition } from '@tianshu/data/schemas';
import { describe, expect, it } from 'vitest';
import { createCoreFromState } from '../api';
import type { CoreContent } from '../command';
import type { GameState } from '../state';
import { ITEM_AUTO, SHOP_KEY, shopContent, shopState } from './__fixtures__/shop-fixture';
import { locateShop } from './shop-locator';

const town = {
  sceneId: 'city_dali',
  cityId: 'city_dali',
  chapterId: 'ch01',
} as unknown as TownRuntimeDefinition;

function borrowed(): { readonly state: GameState; readonly content: CoreContent } {
  const baseContent = shopContent();
  const chapter = baseContent.chapters![0]!;
  const map = baseContent.worldMaps![0]!;
  const baseState = shopState();
  return {
    content: {
      ...baseContent,
      towns: [town],
      chapters: [{ ...chapter, id: 'ch10_baima', eraLayerId: 'ch10' }],
      worldMaps: [{ ...map, chapterId: 'ch10_baima', era: 'ch10' }],
    },
    state: {
      ...baseState,
      chapter: {
        ...baseState.chapter,
        chapterId: 'ch10_baima',
        eraLayerId: 'ch10',
        story: { ...baseState.chapter.story, chapterId: 'ch10_baima' },
      },
    },
  };
}

describe('locateShop', () => {
  it('locates and buys from a ch01 shop while a ch10 session borrows Dali', () => {
    const { state, content } = borrowed();
    expect(locateShop(state, content, SHOP_KEY)).toBe(true);
    const core = createCoreFromState(state, content);
    expect(
      core.dispatch({
        t: 'shop/buy',
        shopKey: SHOP_KEY,
        itemId: ITEM_AUTO,
        count: 1,
        expectedUnitPrice: 46_851,
      }),
    ).toMatchObject({ ok: true });
    expect(core.snapshot()).toMatchObject({
      party: { money: 953_149, inventory: { stacks: [{ itemId: ITEM_AUTO, count: 1 }] } },
    });
  });

  it('reports only insufficient money for the borrowed shop when funds are short', () => {
    const { state, content } = borrowed();
    const poor = { ...state, party: { ...state.party, money: 1 } };
    const core = createCoreFromState(poor, content);
    expect(
      core.dispatch({
        t: 'shop/buy',
        shopKey: SHOP_KEY,
        itemId: ITEM_AUTO,
        count: 1,
        expectedUnitPrice: 46_851,
      }),
    ).toEqual({
      ok: false,
      reason: 'SHOP_MONEY_INSUFFICIENT',
    });
  });
});
