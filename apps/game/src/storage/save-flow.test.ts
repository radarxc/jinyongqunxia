// @vitest-environment happy-dom
import { mount } from '@vue/test-utils';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { afterEach, describe, expect, it } from 'vitest';
import {
  createIndexedDbStorage,
  createProjectionMainThreadHost,
  decodeJsonSave,
  decodeZip,
  encodeZip,
  sha256Hex,
  type TianshuStorage,
} from '@tianshu/platform';
import { TxSaveSlots } from '@tianshu/ui';
import { createGameSession } from '../runtime/session';
import { fixtureContent } from '../runtime/test-fixture';
import { createSaveService } from './save-service';
import { slotViews } from './slot-views';

const opened: TianshuStorage[] = [];
afterEach(async () => {
  for (const storage of opened.splice(0)) await storage.deleteDatabase();
});
async function setup() {
  const storage = await createIndexedDbStorage({
    databaseName: `ui-save-test-${opened.length}`,
    indexedDB: new IDBFactory(),
    IDBKeyRange,
    clock: { now: () => 1000 },
  });
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
    await saves.load('save_manual_01');
    expect(await host.snapshot()).toEqual(original);
    const bytes = await saves.exportSlot('save_manual_01');
    expect(new TextDecoder().decode(bytes.subarray(0, 4))).toBe('TSAV');
    await saves.remove('save_manual_01');
    expect(await saves.list()).toEqual([]);
    await saves.importSlot('save_manual_02', bytes);
    expect((await saves.list())[0]?.slot).toBe('save_manual_02');
    await saves.load('save_manual_02');
    expect(await host.snapshot()).toEqual(original);
    host.dispose();
  });
  it('leaves all saves and active state intact after a corrupt import or an invalid slot', async () => {
    const { host, saves } = await setup();
    await saves.save('save_manual_01');
    const before = await saves.list();
    const state = await host.snapshot();
    const bytes = await saves.exportSlot('save_manual_01');
    bytes[bytes.length - 1]! ^= 0xff;
    await expect(saves.importSlot('save_manual_01', bytes)).rejects.toThrow(
      'gzip body checksum mismatch',
    );
    await expect(saves.save('save_auto_1')).rejects.toThrow('SAVE_SLOT_READONLY');
    expect(await saves.list()).toEqual(before);
    expect(await host.snapshot()).toEqual(state);
    host.dispose();
  });
  it('honors automatic save rotation and throttle without overwriting manual slots', async () => {
    const { host, saves } = await setup();
    // The first storage operation is intentionally an autosave: ID initialization must not
    // deadlock by enqueueing settings writes from inside autosavePrepared's write queue.
    expect((await saves.autosave('change')).slot).toBe('save_auto_1');
    await saves.save('save_manual_01');
    expect((await saves.autosave('change')).status).toBe('throttled');
    expect((await saves.autosave('hidden', true)).slot).toBe('save_auto_2');
    expect((await saves.list()).map((row) => row.slot)).toContain('save_manual_01');
    host.dispose();
  });
  it('exports JSON and append-only ZIP, preserving every included generation', async () => {
    const { host, saves } = await setup();
    await saves.save('save_manual_01');
    await host.dispatch({ t: 'world/tick' });
    await saves.save('save_manual_01');
    const json = await decodeJsonSave(await saves.exportSlot('save_manual_01', 'json'));
    expect(json.header.slotId).toBe('save_manual_01');
    expect(json.state).toEqual(await host.snapshot());
    const zip = await saves.exportAll();
    expect(decodeZip(zip).map(({ name }) => name)).toEqual([
      'manifest.json',
      'README.txt',
      'saves/save_manual_01/2.tsav',
      'saves/save_manual_01/1.tsav',
    ]);
    await saves.remove('save_manual_01');
    await expect(saves.importAll(zip)).resolves.toBe(2);
    expect((await saves.history('save_manual_01')).map(({ generation }) => generation)).toEqual([
      2, 1,
    ]);
    host.dispose();
  });
  it('validates every ZIP member before appending any generation', async () => {
    const { host, saves } = await setup();
    await saves.save('save_manual_01');
    const zip = await saves.exportAll();
    const entries = decodeZip(zip);
    const manifestEntry = entries.find(({ name }) => name === 'manifest.json')!;
    const manifest = JSON.parse(new TextDecoder().decode(manifestEntry.bytes)) as {
      saves: { slot: string; generation: number; path: string; sha256: string }[];
    };
    manifest.saves.push({
      slot: 'save_manual_02',
      generation: 1,
      path: 'saves/save_manual_02/1.tsav',
      sha256: '0'.repeat(64),
    });
    const tampered = encodeZip(
      entries.map((entry) =>
        entry.name === 'manifest.json'
          ? { ...entry, bytes: new TextEncoder().encode(JSON.stringify(manifest)) }
          : entry,
      ),
    );
    const before = await saves.history('save_manual_01');
    await expect(saves.importAll(tampered)).rejects.toThrow('SAVE_HASH_MISMATCH');
    expect(await saves.history('save_manual_01')).toEqual(before);
    manifest.saves[0]!.path = 'README.txt';
    const redirected = encodeZip(
      entries.map((entry) =>
        entry.name === 'manifest.json'
          ? { ...entry, bytes: new TextEncoder().encode(JSON.stringify(manifest)) }
          : entry,
      ),
    );
    await expect(saves.importAll(redirected)).rejects.toThrow('SAVE_ZIP_MANIFEST_INVALID');
    expect(await saves.history('save_manual_01')).toEqual(before);
    host.dispose();
  });
  it('converts legacy TSUI into a TSAV generation', async () => {
    const { host, saves } = await setup();
    const state = await host.snapshot();
    const payload = new TextEncoder().encode(JSON.stringify(state));
    const header = new TextEncoder().encode(
      JSON.stringify({
        format: 'tianshu-ui-slot',
        version: 1,
        hash: await sha256Hex(payload),
      }),
    );
    const legacy = new Uint8Array(9 + header.length + payload.length);
    legacy.set([84, 83, 85, 73, 1]);
    new DataView(legacy.buffer).setUint32(5, header.length, true);
    legacy.set(header, 9);
    legacy.set(payload, 9 + header.length);
    await saves.importSlot('save_manual_03', legacy);
    expect(
      new TextDecoder().decode((await saves.exportSlot('save_manual_03')).subarray(0, 4)),
    ).toBe('TSAV');
    host.dispose();
  });
  it('drives the slot component through save, overwrite confirmation, load and deletion', async () => {
    const { host, saves } = await setup();
    const wrapper = mount(TxSaveSlots, {
      props: {
        slots: slotViews(await saves.list()),
        busy: false,
        available: true,
        status: '已就绪',
      },
    });
    const button = (label: string) =>
      wrapper.findAll('button').find((entry) => entry.text() === label)!;
    await button('保存').trigger('click');
    expect(wrapper.emitted('save')?.[0]).toEqual(['save_manual_01']);
    await saves.save('save_manual_01');
    await wrapper.setProps({ slots: slotViews(await saves.list()) });
    await button('保存').trigger('click');
    expect(wrapper.find('[role=dialog]').exists()).toBe(true);
    expect(wrapper.emitted('save')).toHaveLength(1);
    await wrapper.get('[data-confirm]').trigger('click');
    expect(wrapper.emitted('save')).toHaveLength(2);
    await saves.save('save_manual_01');
    await wrapper.setProps({
      slots: slotViews(await saves.list(), {
        save_manual_01: await saves.history('save_manual_01'),
      }),
    });
    await button('导出 JSON').trigger('click');
    await button('导出 TSAV').trigger('click');
    await button('全部导出 ZIP').trigger('click');
    expect(wrapper.emitted('export')).toEqual([
      ['save_manual_01|json'],
      ['save_manual_01|tsav'],
      ['*|zip'],
    ]);
    await button('回到此代').trigger('click');
    expect(wrapper.emitted('load')?.[0]).toEqual(['save_manual_01|1']);
    expect(wrapper.get('input[type=file]').attributes('accept')).toContain('.zip');
    await button('读取').trigger('click');
    await wrapper.get('[data-confirm]').trigger('click');
    expect(wrapper.emitted('load')?.[1]).toEqual(['save_manual_01']);
    await saves.load('save_manual_01');
    await button('删除').trigger('click');
    await wrapper.get('[data-confirm]').trigger('click');
    expect(wrapper.emitted('remove')?.[0]).toEqual(['save_manual_01']);
    await saves.remove('save_manual_01');
    await wrapper.setProps({ slots: slotViews(await saves.list()) });
    expect(button('读取').attributes('disabled')).toBeDefined();
    wrapper.unmount();
    host.dispose();
  });
});
