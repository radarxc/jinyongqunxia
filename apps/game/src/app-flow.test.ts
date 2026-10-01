// @vitest-environment happy-dom
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createProjectionMainThreadHost } from '@tianshu/platform';
import { useUiStore } from '@tianshu/ui/runtime';
import App from './App.vue';
import { createGameController } from './game-controller';
import { createGameSession } from './runtime/session';
import { fixtureContent } from './runtime/test-fixture';

afterEach(() => { vi.unstubAllGlobals(); document.body.innerHTML = ''; });
describe('application shell with real session and fake IndexedDB', () => {
  it('navigates by keyboard, equips by click, saves, changes state and reloads through the UI', async () => {
    vi.stubGlobal('indexedDB', new IDBFactory()); vi.stubGlobal('IDBKeyRange', IDBKeyRange);
    const pinia = createPinia();
    const host = createProjectionMainThreadHost(createGameSession(fixtureContent()));
    const controller = createGameController(host, useUiStore(pinia));
    await controller.initialize();
    const wrapper = mount(App, { attachTo: document.body, props: { controller }, global: { plugins: [pinia] } });
    const click = async (label: string) => {
      const button = wrapper.findAll('button').find(row => row.text() === label);
      expect(button, label).toBeDefined(); await button!.trigger('click');
    };
    try {
      expect(wrapper.text()).toContain('342 / 342');
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', bubbles: true }));
      await vi.waitFor(() => expect(wrapper.find('[data-item-id="eq_qinggangjian"]').exists()).toBe(true));
      await wrapper.get('[data-item-id="eq_qinggangjian"]').trigger('click');
      await wrapper.get('.item-detail .primary').trigger('click');
      await vi.waitFor(() => expect(controller.busy.value).toBe(false));
      expect((await host.snapshot()).state.party.equipment.entries[0]?.itemId).toBe('eq_qinggangjian');
      await click('存档');
      await vi.waitFor(() => expect(wrapper.find('.save-page').exists()).toBe(true));
      await click('保存');
      await vi.waitFor(() => expect(controller.slots.value[0]?.occupied).toBe(true));
      await vi.waitFor(() => expect(controller.busy.value).toBe(false));
      await host.dispatch({ t: 'world/tick' });
      await vi.waitFor(() => expect(controller.busy.value).toBe(false));
      await click('读取');
      await wrapper.get('[data-confirm]').trigger('click');
      await vi.waitFor(() => expect(controller.busy.value).toBe(false));
      expect((await host.snapshot()).state.meta.worldTick).toBe(0);
      await click('人物');
      await vi.waitFor(() => expect(wrapper.find('.character-page').exists()).toBe(true));
      expect(wrapper.text()).toContain('未遇之人'); expect(wrapper.text()).not.toContain('萧峰');
      await click('设置'); await wrapper.get('input[type="checkbox"]').setValue(true);
      expect(wrapper.classes()).toContain('large-text');
      await flushPromises();
    } finally { wrapper.unmount(); controller.dispose(); }
  });
});
