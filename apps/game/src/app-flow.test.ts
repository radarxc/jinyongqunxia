// @vitest-environment happy-dom
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createIndexedDbStorage, createProjectionMainThreadHost } from '@tianshu/platform';
import { uiBus, useUiStore } from '@tianshu/ui/runtime';
import App from './App.vue';
import { createGameController } from './game-controller';
import { actionMap } from './input/action-map';
import { createGameSession } from './runtime/session';
import { fixtureContent } from './runtime/test-fixture';

afterEach(() => { vi.unstubAllGlobals(); document.body.innerHTML = ''; });
describe('application shell with real session and fake IndexedDB', () => {
  // These waits synchronize functional state; loaded-host latency is not a performance assertion.
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
      await vi.waitFor(() => expect(commitStarted).toBe(true), { timeout: 10_000 });
      expect(controller.saving.value).toBe(true); expect(controller.busy.value).toBe(false);
      uiBus.emit({ type: 'core-command', command: { t: 'inventory/unequip', slot: 'mainHand' } });
      await vi.waitFor(async () => expect((await host.snapshot()).party.equipment.entries[0]?.itemId)
        .toBeNull(), { timeout: 10_000 });
      releaseSave(); await vi.waitFor(() => expect(controller.saving.value).toBe(false),
        { timeout: 10_000 });
    } finally { if (commitStarted && controller.saving.value) releaseSave();
      controller.dispose(); await storage.close(); }
  }, 30_000);

  // These waits synchronize functional state; loaded-host latency is not a performance assertion.
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
      await vi.waitFor(() => expect(wrapper.find('[data-item-id="eq_qinggangjian"]').exists()).toBe(true),
        { timeout: 10_000 });
      await wrapper.get('[data-item-id="eq_qinggangjian"]').trigger('click');
      await wrapper.get('.item-detail .primary').trigger('click');
      await vi.waitFor(() => expect(controller.busy.value).toBe(false), { timeout: 10_000 });
      expect((await host.snapshot()).party.equipment.entries[0]?.itemId).toBe('eq_qinggangjian');
      await click('存档');
      await vi.waitFor(() => expect(wrapper.find('.save-page').exists()).toBe(true),
        { timeout: 10_000 });
      await click('记载事迹');
      await vi.waitFor(() => expect(controller.slots.value[0]?.occupied).toBe(true),
        { timeout: 10_000 });
      await vi.waitFor(() => expect(controller.busy.value).toBe(false), { timeout: 10_000 });
      await host.dispatch({ t: 'world/tick' });
      await vi.waitFor(() => expect(controller.busy.value).toBe(false), { timeout: 10_000 });
      await click('进入回忆');
      await wrapper.get('[data-confirm]').trigger('click');
      await vi.waitFor(() => expect(controller.busy.value).toBe(false), { timeout: 10_000 });
      expect((await host.snapshot()).meta.worldTick).toBe(0);
      await click('人物');
      await vi.waitFor(() => expect(wrapper.find('.character-page').exists()).toBe(true),
        { timeout: 10_000 });
      expect(wrapper.text()).toContain('未遇之人'); expect(wrapper.text()).not.toContain('萧峰');
      await click('设置');
      await vi.waitFor(() => expect(wrapper.find('input[value="150"]').exists()).toBe(true),
        { timeout: 10_000 });
      await wrapper.get('input[value="150"]').setValue();
      expect(wrapper.classes()).toContain('text-scale-150');
      await flushPromises();
    } finally { wrapper.unmount(); controller.dispose(); }
  }, 30_000);

  it('keeps all global page, back and developer-console keyboard actions', async () => {
    vi.stubGlobal('indexedDB', new IDBFactory()); vi.stubGlobal('IDBKeyRange', IDBKeyRange);
    const pinia = createPinia();
    const host = createProjectionMainThreadHost(createGameSession(fixtureContent()));
    const controller = createGameController(host, useUiStore(pinia));
    await controller.initialize();
    const wrapper = mount(App, { attachTo: document.body, props: { controller },
      global: { plugins: [pinia] } });
    const press = async (code: string, key: string) => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code, key, bubbles: true }));
      window.dispatchEvent(new KeyboardEvent('keyup', { code, key, bubbles: true }));
      await flushPromises();
    };
    try {
      for (const [code, key, heading] of [
        ['KeyC', 'c', '立身与经脉'], ['KeyB', 'b', '行囊'],
        ['KeyK', 'k', '武学修行'], ['KeyJ', 'j', '行旅手记'],
      ] as const) {
        await press(code, key); expect(wrapper.text()).toContain(heading);
        await press(code, key); expect(wrapper.find('.folio-screen').isVisible()).toBe(false);
      }
      await press('KeyC', 'c');
      await press('KeyM', 'm'); expect(wrapper.find('.folio-screen').isVisible()).toBe(false);
      await press('KeyB', 'b');
      await press('Escape', 'Escape'); expect(wrapper.find('.folio-screen').isVisible()).toBe(false);
      expect(wrapper.find('.dev-panel-container').classes()).toContain('is-collapsed');
      await press('Backquote', String.fromCharCode(96));
      expect(wrapper.find('.dev-panel-container').classes()).not.toContain('is-collapsed');
    } finally { wrapper.unmount(); controller.dispose(); }
  }, 30_000);

  it('leaves battle keyboard input exclusively to BattleField', async () => {
    vi.stubGlobal('indexedDB', new IDBFactory()); vi.stubGlobal('IDBKeyRange', IDBKeyRange);
    const pinia = createPinia();
    const host = createProjectionMainThreadHost(createGameSession(fixtureContent()));
    const controller = createGameController(host, useUiStore(pinia));
    await controller.initialize();
    const wrapper = mount(App, { attachTo: document.body, props: { controller },
      global: { plugins: [pinia] } });
    const press = async (code: string, key: string): Promise<KeyboardEvent> => {
      const event = new KeyboardEvent('keydown', { code, key, bubbles: true, cancelable: true });
      window.dispatchEvent(event);
      window.dispatchEvent(new KeyboardEvent('keyup', { code, key, bubbles: true }));
      await flushPromises();
      return event;
    };
    try {
      await wrapper.findAll('button').find(button => button.attributes('aria-label') === '战斗')!.trigger('click');
      await vi.waitFor(() => expect(wrapper.find('.battle-field-wrap').exists()).toBe(true),
        { timeout: 10_000 });
      for (const [code, key] of [
        ['KeyC', 'c'], ['KeyB', 'b'], ['KeyK', 'k'], ['KeyJ', 'j'],
        ['KeyM', 'm'], ['Backquote', String.fromCharCode(96)],
      ] as const) {
        expect((await press(code, key)).defaultPrevented).toBe(false);
        expect(wrapper.find('.battle-screen').isVisible()).toBe(true);
      }
      expect(wrapper.find('.dev-panel-container').classes()).toContain('is-collapsed');
      controller.battle.value?.setMovement(true);
      expect(controller.battle.value?.movement.value).toBe(true);
      expect((await press('Escape', 'Escape')).defaultPrevented).toBe(true);
      expect(controller.battle.value?.movement.value).toBe(false);
    } finally { wrapper.unmount(); controller.dispose(); }
  }, 30_000);
  it('stops a held-W explore walk the moment the scene switches to battle', async () => {
    vi.stubGlobal('indexedDB', new IDBFactory()); vi.stubGlobal('IDBKeyRange', IDBKeyRange);
    const pinia = createPinia();
    const host = createProjectionMainThreadHost(createGameSession(fixtureContent()));
    const controller = createGameController(host, useUiStore(pinia));
    await controller.initialize();
    const wrapper = mount(App, { attachTo: document.body, props: { controller },
      global: { plugins: [pinia] } });
    const move = vi.fn();
    const popExplore = actionMap.pushContext('explore', { move });
    try {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW', key: 'w', bubbles: true }));
      await flushPromises();
      expect(move.mock.calls).toEqual([[{ vx: 0, vy: -1 }]]);
      // Enter battle with W still held and no further key edges.
      await wrapper.findAll('button').find(button => button.attributes('aria-label') === '战斗')!.trigger('click');
      await vi.waitFor(() => expect(wrapper.find('.battle-field-wrap').exists()).toBe(true),
        { timeout: 10_000 });
      expect(move.mock.calls).toEqual([[{ vx: 0, vy: -1 }], [{ vx: 0, vy: 0 }]]);
    } finally {
      popExplore();
      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW', key: 'w', bubbles: true }));
      wrapper.unmount(); controller.dispose();
    }
  }, 30_000);
});
