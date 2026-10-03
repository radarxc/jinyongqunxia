// @vitest-environment happy-dom
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createIndexedDbStorage, createProjectionMainThreadHost } from '@tianshu/platform';
import { uiBus, useUiStore } from '@tianshu/ui/runtime';
import App from './App.vue';
import { createGameController } from './game-controller';
import { createGameSession } from './runtime/session';
import { fixtureContent } from './runtime/test-fixture';

afterEach(() => { vi.unstubAllGlobals(); document.body.innerHTML = ''; });
describe('application shell with real session and fake IndexedDB', () => {
  it('accepts a second user command while a real IndexedDB autosave is committing', async () => {
    vi.stubGlobal('indexedDB', new IDBFactory()); vi.stubGlobal('IDBKeyRange', IDBKeyRange);
    let releaseSave!: () => void; let commitStarted = false;
    const storage = await createIndexedDbStorage({ databaseName: 'tianshu-command-queue',
      autosaveThrottleMs: 0, storageManager: null, saveCommitHook: () => {
        if (commitStarted) return; commitStarted = true;
        return new Promise<void>((resolve) => { releaseSave = resolve; });
      } });
    const pinia = createPinia();
    const host = createProjectionMainThreadHost(createGameSession(fixtureContent()));
    const controller = createGameController(host, useUiStore(pinia), { storage });
    try {
      await controller.initialize();
      uiBus.emit({ type: 'core-command', command: { t: 'inventory/equip',
        itemId: 'eq_qinggangjian', slot: 'mainHand' } });
      await vi.waitFor(() => expect(commitStarted).toBe(true));
      expect(controller.saving.value).toBe(true); expect(controller.busy.value).toBe(false);
      uiBus.emit({ type: 'core-command', command: { t: 'inventory/unequip', slot: 'mainHand' } });
      await vi.waitFor(async () => expect((await host.snapshot()).party.equipment.entries[0]?.itemId)
        .toBeNull());
      releaseSave(); await vi.waitFor(() => expect(controller.saving.value).toBe(false));
    } finally { if (commitStarted && controller.saving.value) releaseSave();
      controller.dispose(); await storage.close(); }
  });

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
      expect((await host.snapshot()).party.equipment.entries[0]?.itemId).toBe('eq_qinggangjian');
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
      expect((await host.snapshot()).meta.worldTick).toBe(0);
      await click('人物');
      await vi.waitFor(() => expect(wrapper.find('.character-page').exists()).toBe(true));
      expect(wrapper.text()).toContain('未遇之人'); expect(wrapper.text()).not.toContain('萧峰');
      await click('设置'); await vi.waitFor(() => expect(wrapper.find('input[value="150"]').exists()).toBe(true));
      await wrapper.get('input[value="150"]').setValue();
      expect(wrapper.classes()).toContain('text-scale-150');
      await flushPromises();
    } finally { wrapper.unmount(); controller.dispose(); }
  });
});
