import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { isReactive, nextTick } from 'vue';
import { EQUIPMENT_SLOTS } from '@tianshu/core';
import { uiBus } from '../ui-bus';
import { useUiStore } from '../store';
import type { EquipmentView, ItemView } from '../projections';
import TxInventory from './TxInventory.vue';
import TxVirtualList from './TxVirtualList.vue';
import TxHud from './TxHud.vue';

const sword: ItemView = { id: 'eq_qinggangjian', name: '青钢剑', category: 'weapons', count: 1,
  grade: 3, ageYears: null, icon: null, description: '练习用剑', source: '原创扩展', effects: [],
  slot: 'mainHand', canUse: false, useReason: '不可服用' };
const medicine: ItemView = { ...sword, id: 'it_jinchuangyao', name: '金创药', category: 'medicine',
  slot: null, canUse: true, count: 3, useReason: '' };
const equipment: readonly EquipmentView[] = EQUIPMENT_SLOTS.map((slot) => ({ slot, item: null }));
afterEach(() => { document.body.innerHTML = ''; });

describe('inventory commands', () => {
  it('sends equip and use intent without optimistically editing its props', async () => {
    const listener = vi.fn(); const off = uiBus.subscribe(listener);
    const wrapper = mount(TxInventory, { props: { items: [sword, medicine], equipment, targetId: 'npc_zhujue' } });
    await wrapper.get('[data-item-id="eq_qinggangjian"]').trigger('click');
    await wrapper.get('.primary').trigger('click');
    expect(listener).toHaveBeenLastCalledWith({ type: 'core-command', command: { t: 'inventory/equip', itemId: sword.id, slot: 'mainHand' } });
    await wrapper.get('[data-item-id="it_jinchuangyao"]').trigger('click');
    await wrapper.get('.primary').trigger('click');
    expect(listener).toHaveBeenLastCalledWith({ type: 'core-command', command: { t: 'inventory/use', itemId: medicine.id, targetId: 'npc_zhujue' } });
    expect(medicine.count).toBe(3); expect(equipment[0]?.item).toBeNull();
    expect(wrapper.findAll('[data-slot]')).toHaveLength(11);
    off(); wrapper.unmount();
  });
  it('translates drops and unequip clicks, and ignores duplicate actions while busy', async () => {
    const listener = vi.fn(); const off = uiBus.subscribe(listener);
    const wrapper = mount(TxInventory, { props: { items: [sword], equipment: equipment.map((entry) => entry.slot === 'mainHand' ? { ...entry, item: sword } : entry), targetId: 'npc_zhujue' } });
    await wrapper.get('[data-slot="mainHand"]').trigger('drop', { dataTransfer: { getData: () => sword.id } });
    expect(listener).toHaveBeenLastCalledWith({ type: 'core-command', command: { t: 'inventory/equip', itemId: sword.id, slot: 'mainHand' } });
    await wrapper.get('[aria-label="卸下主手"]').trigger('click');
    expect(listener).toHaveBeenLastCalledWith({ type: 'core-command', command: { t: 'inventory/unequip', slot: 'mainHand' } });
    await wrapper.setProps({ busy: true });
    await wrapper.get('[data-slot="mainHand"]').trigger('drop', { dataTransfer: { getData: () => sword.id } });
    expect(listener).toHaveBeenCalledTimes(2); off(); wrapper.unmount();
  });
  it('filters eleven content categories and the separate quest tab', async () => {
    const wrapper = mount(TxInventory, { props: { items: [sword, medicine], equipment, targetId: 'npc_zhujue' } });
    expect(wrapper.findAll('.category-tabs button')).toHaveLength(13);
    await wrapper.get('input').setValue('金创');
    expect(wrapper.findAll('[data-item-id]')).toHaveLength(1);
    expect(wrapper.get('[data-item-id]').attributes('data-item-id')).toBe(medicine.id);
    wrapper.unmount();
  });
});

describe('projection-only rendering and bounded lists', () => {
  it('updates HUD from a shallow projection and preserves the unchanged list', async () => {
    setActivePinia(createPinia()); const store = useUiStore();
    const inventory = store.projection.inventory;
    const wrapper = mount(TxHud, { props: { hud: store.projection.hud } });
    const hud = { ...store.projection.hud, hp: { current: 117, maximum: 342 }, date: '1093年 1月 1日 子时' };
    store.applyProjection({ hud }); await wrapper.setProps({ hud: store.projection.hud });
    expect(wrapper.get('[aria-label="生命"]').attributes('aria-valuenow')).toBe('117');
    expect(wrapper.text()).toContain('117 / 342');
    expect(isReactive(store.projection.hud)).toBe(false);
    expect(store.projection.inventory).toBe(inventory); wrapper.unmount();
  });
  it('keeps 10000 items bounded and handles scrolling and keyboard End navigation', async () => {
    const items = Array.from({ length: 10000 }, (_, index) => ({ id: String(index) }));
    const wrapper = mount(TxVirtualList<{ id: string }>, { attachTo: document.body, props: { items, itemKey: (item) => item.id, label: '长列表', height: 300, rowHeight: 100 },
      slots: { default: '<template #default="{ item }"><button>{{ item.id }}</button></template>' } });
    expect(wrapper.findAll('[role=listitem]').length).toBeLessThanOrEqual(8);
    const scroll = wrapper.get('[role=list]'); (scroll.element as HTMLElement).scrollTop = 100000;
    await scroll.trigger('scroll'); expect(wrapper.text()).toContain('998');
    await wrapper.find('button').trigger('keydown', { key: 'End' }); await nextTick();
    expect(document.activeElement?.textContent).toBe('9999');
    expect(wrapper.findAll('[role=listitem]').length).toBeLessThanOrEqual(8); wrapper.unmount();
  });
});
