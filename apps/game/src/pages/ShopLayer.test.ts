// @vitest-environment happy-dom
import { mount } from '@vue/test-utils';
import { nextTick, shallowRef } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ShopLayer from './ShopLayer.vue';
import type { GameController } from '../game-controller';

const item = { id: 'it_jinchuangyao', name: '金创药', category: 'medicine' as const, count: 0,
  grade: 1, ageYears: null, icon: null, description: '', source: '', effects: [], slot: null,
  canUse: true, useReason: '' };
function shop(price = 200, reason: 'SHOP_MONEY_INSUFFICIENT' | null = null) {
  return { instanceKey: 'city_dali__ch01/yaopu_01',
    nameKey: 'town.city_dali__ch01.yaopu_01.name', facilityKind: 'shop' as const, money: 10_000,
    nextRestockDay: 3, offers: [{ itemId: item.id, stock: 8, unitBuyPrice: price, maxGrade: 3,
      reason }], buys: [] };
}
function controller(overrides: Partial<GameController> = {}) {
  const queryShop = vi.fn().mockResolvedValue({ view: shop(), items: [item] });
  const shopCommand = vi.fn().mockResolvedValue({ accepted: true, changes: {}, events: [] });
  const setSceneRunsWorldTicks = vi.fn();
  return { queryShop, shopCommand, setSceneRunsWorldTicks, sceneRunsWorldTicks: shallowRef(true),
    shopRequest: shallowRef<{ shopKey: string; nonce: number } | null>(null),
    chapterId: shallowRef('ch01_tianlong'), flowTextSource: undefined, town: shallowRef(null),
    ...overrides } as unknown as GameController;
}
afterEach(() => { document.body.innerHTML = ''; vi.restoreAllMocks(); });
async function openLayer(current: ReturnType<typeof controller>) {
  const wrapper = mount(ShopLayer, { attachTo: document.body, props: { controller: current } });
  current.shopRequest.value = { shopKey: 'city_dali__ch01/yaopu_01', nonce: 1 };
  await vi.waitFor(() => expect(current.queryShop).toHaveBeenCalledOnce());
  await nextTick(); return wrapper;
}

describe('ShopLayer command wiring', () => {
  it('opens from shop/open, pauses ticks, and restores them on close', async () => {
    const current = controller(); const wrapper = await openLayer(current);
    expect(wrapper.text()).toContain('金创药');
    expect(current.setSceneRunsWorldTicks).toHaveBeenCalledWith(false);
    await wrapper.get('.close').trigger('click');
    expect(current.setSceneRunsWorldTicks).toHaveBeenLastCalledWith(true);
  });

  it('uses the projected disable reason instead of recomputing affordability', async () => {
    const current = controller();
    vi.mocked(current.queryShop).mockResolvedValue({ view: shop(200, 'SHOP_MONEY_INSUFFICIENT'),
      items: [item] });
    const wrapper = await openLayer(current);
    expect(wrapper.get('[data-item-id=it_jinchuangyao]').text()).toContain('身上银两不够');
    expect(wrapper.get('[data-item-id=it_jinchuangyao] .confirm').attributes('disabled')).toBeDefined();
  });

  it('requeries after a stale-price rejection and shows the refreshed price', async () => {
    const current = controller();
    vi.mocked(current.queryShop).mockResolvedValueOnce({ view: shop(200), items: [item] })
      .mockResolvedValueOnce({ view: shop(240), items: [item] });
    vi.mocked(current.shopCommand).mockResolvedValueOnce({ accepted: false, changes: {}, events: [],
      error: 'SHOP_PRICE_STALE' });
    const wrapper = await openLayer(current);
    await wrapper.get('[data-item-id=it_jinchuangyao] .confirm').trigger('click');
    await vi.waitFor(() => expect(current.queryShop).toHaveBeenCalledTimes(2)); await nextTick();
    expect(wrapper.text()).toContain('价钱变了，请再看一眼');
    expect(wrapper.get('[data-item-id=it_jinchuangyao]').text()).toContain('240 文');
    expect(current.shopCommand).toHaveBeenCalledWith({ t: 'shop/buy',
      shopKey: 'city_dali__ch01/yaopu_01', itemId: item.id, count: 1, expectedUnitPrice: 200 });
  });
});
