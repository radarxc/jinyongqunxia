import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { isReactive, nextTick } from 'vue';
import TxShop from './TxShop.vue';
import type { ShopPanelView, ShopRow } from './TxShop.types';

const buyMedicine: ShopRow = { itemId: 'it_jinchuangyao', name: '金创药', icon: null, grade: 2,
  unitPriceWen: 1000, stock: 9, owned: 1, disabledReason: null };
const buySword: ShopRow = { itemId: 'eq_qinggangjian', name: '青钢剑', icon: 'assets/sword.webp', grade: 3,
  unitPriceWen: 500, stock: 3, owned: 0, disabledReason: null };
const disabled: ShopRow = { itemId: 'it_secret', name: '镇店之宝', icon: null, grade: 10,
  unitPriceWen: 44_977, stock: 1, owned: 0, disabledReason: '非卖品' };
const sellMedicine: ShopRow = { ...buyMedicine, unitPriceWen: 300, stock: null, owned: 2 };

function view(overrides: Partial<ShopPanelView> = {}): ShopPanelView {
  return { title: '仁和药铺', facilityKind: '药铺', moneyWen: 2500,
    rows: { buy: [buyMedicine, buySword, disabled], sell: [sellMedicine] }, busy: false, ...overrides };
}
function row(wrapper: ReturnType<typeof mount>, itemId: string) {
  return wrapper.get(`[data-item-id="${itemId}"]`);
}
function quantity(wrapper: ReturnType<typeof mount>, itemId: string): string {
  return row(wrapper, itemId).get<HTMLInputElement>('input[type=number]').element.value;
}
afterEach(() => { document.body.innerHTML = ''; });

describe('TxShop rendering and quantity bounds', () => {
  it('renders item grade, price, stock and a whole-row disabled reason', () => {
    const wrapper = mount(TxShop, { props: { view: view() } });
    expect(row(wrapper, buyMedicine.itemId).text()).toContain('金创药');
    expect(row(wrapper, buyMedicine.itemId).text()).toContain('黄中');
    expect(row(wrapper, buyMedicine.itemId).text()).toContain('1 两');
    expect(row(wrapper, buyMedicine.itemId).text()).toContain('9');
    const unavailable = row(wrapper, disabled.itemId);
    expect(unavailable.text()).toContain('44 两 977 文');
    expect(unavailable.get('.disabled-reason').text()).toBe('非卖品');
    expect(unavailable.findAll('button').every(button => button.attributes('disabled') !== undefined)).toBe(true);
    expect(unavailable.get('input').attributes('disabled')).toBeDefined();
  });

  it('clamps buy stepping by money and stock and sell stepping by owned count', async () => {
    const wrapper = mount(TxShop, { props: { view: view() } });
    const medicine = row(wrapper, buyMedicine.itemId);
    await medicine.get('[aria-label="金创药数量减一"]').trigger('click');
    expect(quantity(wrapper, buyMedicine.itemId)).toBe('1');
    await medicine.get('[aria-label="金创药数量加一"]').trigger('click');
    await medicine.get('[aria-label="金创药数量加一"]').trigger('click');
    expect(quantity(wrapper, buyMedicine.itemId)).toBe('2');

    const sword = row(wrapper, buySword.itemId);
    for (let index = 0; index < 4; index += 1) await sword.get('[aria-label="青钢剑数量加一"]').trigger('click');
    expect(quantity(wrapper, buySword.itemId)).toBe('3');
    await wrapper.get('.shop-tabs button:nth-child(2)').trigger('click');
    const sell = row(wrapper, sellMedicine.itemId);
    await sell.get('[aria-label="金创药数量加一"]').trigger('click');
    await sell.get('[aria-label="金创药数量加一"]').trigger('click');
    expect(quantity(wrapper, sellMedicine.itemId)).toBe('2');
  });

  it('restores the displayed count after fractional or unsafe integer input', async () => {
    const wrapper = mount(TxShop, { props: { view: view() } });
    const item = row(wrapper, buyMedicine.itemId);
    const input = item.get<HTMLInputElement>('input');
    expect(input.attributes('step')).toBe('1');

    await input.setValue('1.5');
    expect(input.element.value).toBe('1');
    await input.setValue(String(Number.MAX_SAFE_INTEGER + 1));
    expect(input.element.value).toBe('1');
    await item.get('.confirm').trigger('click');
    expect(wrapper.emitted('buy')).toEqual([[{ itemId: buyMedicine.itemId, count: 1, unitPriceWen: 1000 }]]);
  });
});

describe('TxShop intent boundary', () => {
  it('emits buy and sell with the current count and the price from that row', async () => {
    const wrapper = mount(TxShop, { props: { view: view() } });
    const buy = row(wrapper, buyMedicine.itemId);
    await buy.get('[aria-label="金创药数量加一"]').trigger('click');
    await buy.get('.confirm').trigger('click');
    expect(wrapper.emitted('buy')).toEqual([[{ itemId: buyMedicine.itemId, count: 2, unitPriceWen: 1000 }]]);

    await wrapper.get('.shop-tabs button:nth-child(2)').trigger('click');
    const sell = row(wrapper, sellMedicine.itemId);
    await sell.get('[aria-label="金创药数量加一"]').trigger('click');
    await sell.get('.confirm').trigger('click');
    expect(wrapper.emitted('sell')).toEqual([[{ itemId: sellMedicine.itemId, count: 2, unitPriceWen: 300 }]]);
  });

  it('uses the latest projected price after the caller requeries', async () => {
    const wrapper = mount(TxShop, { props: { view: view() } });
    const repriced = { ...buyMedicine, unitPriceWen: 1200 };
    await wrapper.setProps({ view: view({ rows: { buy: [repriced], sell: [] } }) });
    await row(wrapper, repriced.itemId).get('.confirm').trigger('click');
    expect(wrapper.emitted('buy')).toEqual([[{ itemId: repriced.itemId, count: 1, unitPriceWen: 1200 }]]);
  });

  it('disables confirmation while busy without disabling local inspection controls', async () => {
    const wrapper = mount(TxShop, { props: { view: view({ busy: true }) } });
    const first = row(wrapper, buyMedicine.itemId);
    expect(first.get('.confirm').attributes('disabled')).toBeDefined();
    expect(first.get('[aria-label="金创药数量加一"]').attributes('disabled')).toBeUndefined();
    await first.get('.confirm').trigger('click');
    expect(wrapper.emitted('buy')).toBeUndefined();
  });

  it('emits close on Escape even when the quantity input is focused', async () => {
    const wrapper = mount(TxShop, { attachTo: document.body, props: { view: view() } });
    const input = row(wrapper, buyMedicine.itemId).get('input');
    input.element.focus();
    await input.trigger('keydown', { key: 'Escape' });
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it.each([
    ['an empty buy list', []],
    ['an entirely disabled buy list', [disabled]],
  ])('focuses close and emits close on Escape for %s', async (_label, buyRows) => {
    const wrapper = mount(TxShop, {
      attachTo: document.body,
      props: { view: view({ rows: { buy: buyRows, sell: [] } }) },
    });
    await nextTick();
    const close = wrapper.get('.close');
    expect(document.activeElement).toBe(close.element);
    await close.trigger('keydown', { key: 'Escape' });
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('focuses the first interactive row when opened', async () => {
    const wrapper = mount(TxShop, { attachTo: document.body, props: { view: view() } });
    await nextTick();
    expect(document.activeElement).toBe(row(wrapper, buyMedicine.itemId).get('[aria-label="金创药数量加一"]').element);
  });

  it('does not make its projection reactive or mutate it while stepping and confirming', async () => {
    const projection = view();
    const before = structuredClone(projection);
    const wrapper = mount(TxShop, { props: { view: projection } });
    expect(isReactive(projection)).toBe(false);
    const first = row(wrapper, buyMedicine.itemId);
    await first.get('[aria-label="金创药数量加一"]').trigger('click');
    await first.get('.confirm').trigger('click');
    await wrapper.get('.shop-tabs button:nth-child(2)').trigger('click');
    expect(projection).toEqual(before);
    expect(isReactive(projection)).toBe(false);
  });
});
