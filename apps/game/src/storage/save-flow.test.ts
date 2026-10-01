// @vitest-environment happy-dom
import { mount } from '@vue/test-utils';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { afterEach, describe, expect, it } from 'vitest';
import { createIndexedDbStorage, createProjectionMainThreadHost, type TianshuStorage } from '@tianshu/platform';
import { TxSaveSlots } from '@tianshu/ui';
import { createGameSession } from '../runtime/session';
import { fixtureContent } from '../runtime/test-fixture';
import { createSaveService } from './save-service';
import { slotViews } from './slot-views';

const opened: TianshuStorage[] = [];
afterEach(async () => { for (const storage of opened.splice(0)) await storage.deleteDatabase(); });
async function setup() {
  const storage = await createIndexedDbStorage({ databaseName: 'ui-save-test', indexedDB: new IDBFactory(), IDBKeyRange, clock: { now: () => 1000 } });
  opened.push(storage);
  const remote = createGameSession(fixtureContent());
  const host = createProjectionMainThreadHost(remote);
  return { storage, host, saves: createSaveService(storage, host) };
}
describe('save slots through ENG-01 IndexedDB API', () => {
  it('saves, loads, deletes, exports and imports a validated single slot', async () => {
    const { host, saves } = await setup();
    await saves.save('save_manual_01');
    const original = await host.snapshot();
    await host.dispatch({ t: 'world/tick' });
    expect((await host.snapshot()).state.meta.worldTick).toBe(1);
    await saves.load('save_manual_01'); expect(await host.snapshot()).toEqual(original);
    const bytes = await saves.exportSlot('save_manual_01');
    await saves.remove('save_manual_01'); expect(await saves.list()).toEqual([]);
    await saves.importSlot('save_manual_02', bytes);
    expect((await saves.list())[0]?.slot).toBe('save_manual_02');
    await saves.load('save_manual_02'); expect(await host.snapshot()).toEqual(original);
    host.dispose();
  });
  it('leaves all saves and active state intact after a corrupt import or an invalid slot', async () => {
    const { host, saves } = await setup(); await saves.save('save_manual_01');
    const before = await saves.list(); const state = await host.snapshot();
    const bytes = await saves.exportSlot('save_manual_01'); bytes[bytes.length - 1] = 0;
    await expect(saves.importSlot('save_manual_01', bytes)).rejects.toThrow('SAVE_HASH_MISMATCH');
    await expect(saves.save('save_auto_1')).rejects.toThrow('SAVE_SLOT_READONLY');
    expect(await saves.list()).toEqual(before); expect(await host.snapshot()).toEqual(state); host.dispose();
  });
  it('honors automatic save rotation and throttle without overwriting manual slots', async () => {
    const { host, saves } = await setup();
    await saves.save('save_manual_01');
    expect((await saves.autosave('change')).slot).toBe('save_auto_1');
    expect((await saves.autosave('change')).status).toBe('throttled');
    expect((await saves.autosave('hidden', true)).slot).toBe('save_auto_2');
    expect((await saves.list()).map((row) => row.slot)).toContain('save_manual_01'); host.dispose();
  });
  it('drives the slot component through save, overwrite confirmation, load and deletion', async () => {
    const { host, saves } = await setup();
    const wrapper = mount(TxSaveSlots, { props: { slots: slotViews(await saves.list()), busy: false, available: true, status: '已就绪' } });
    const button = (label: string) => wrapper.findAll('button').find((entry) => entry.text() === label)!;
    await button('保存').trigger('click');
    expect(wrapper.emitted('save')?.[0]).toEqual(['save_manual_01']);
    await saves.save('save_manual_01'); await wrapper.setProps({ slots: slotViews(await saves.list()) });
    await button('保存').trigger('click');
    expect(wrapper.find('[role=dialog]').exists()).toBe(true);
    expect(wrapper.emitted('save')).toHaveLength(1);
    await wrapper.get('[data-confirm]').trigger('click');
    expect(wrapper.emitted('save')).toHaveLength(2);
    await button('读取').trigger('click'); await wrapper.get('[data-confirm]').trigger('click');
    expect(wrapper.emitted('load')?.[0]).toEqual(['save_manual_01']);
    await saves.load('save_manual_01');
    await button('删除').trigger('click'); await wrapper.get('[data-confirm]').trigger('click');
    expect(wrapper.emitted('remove')?.[0]).toEqual(['save_manual_01']);
    await saves.remove('save_manual_01'); await wrapper.setProps({ slots: slotViews(await saves.list()) });
    expect(button('读取').attributes('disabled')).toBeDefined(); wrapper.unmount(); host.dispose();
  });
});
