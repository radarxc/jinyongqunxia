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
  packSaveJson,
  sha256Hex,
  StorageErrorCode,
  unpackTsav,
  type SaveHeaderInput,
  type SaveJson,
  type TianshuStorage,
} from '@tianshu/platform';
import { SAVE_SCHEMA, type GameState } from '@tianshu/core';
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
async function legacyTsui(state: GameState): Promise<Uint8Array> {
  const hero = state.profile.protagonist!;
  const target = { characterId: hero.characterId, alive: true, hp: hero.resources.hp,
    hpMax: hero.stats.hpMax, mp: hero.resources.mp, mpMax: hero.stats.mpMax, stamina: 4,
    staminaMax: 9, ailments: [], temporaryEffects: [], permanentBonuses: { stats: {},
      hpMaxBp: 0, mpMaxBp: 0 }, meridianAids: [], meridians: hero.meridians };
  const oldState = { meta: { coreVersion: state.meta.coreVersion,
    rngProtocol: state.meta.rngProtocol, stateVersion: state.meta.stateVersion,
    worldTick: state.meta.worldTick, nextEventSeq: state.meta.nextEventSeq, rng: state.meta.rng },
    profile: { protagonist: Object.fromEntries(Object.entries(hero).filter(([key]) =>
      key !== 'consumable')), companions: [] },
    chapter: Object.fromEntries(Object.entries(state.chapter).filter(([key]) =>
      !['npcs', 'itemChapterUses'].includes(key))),
    party: state.party, transient: { pendingTimeAdvance: null, dialogue: null, battle: null },
    battle: state.battle };
  const envelope = { schema: 'ui-session.v1', state: oldState,
    known: [{ npcId: 'npc_duanyu', relationship: 'met', affinity: 7, character: null }],
    usage: { battleUses: {}, chapterUses: { it_jinchuangyao: 2 } },
    itemTargets: { [hero.characterId]: target }, location: '旧显示地点', preview: true };
  const payload = new TextEncoder().encode(JSON.stringify(envelope));
  const header = new TextEncoder().encode(JSON.stringify({ format: 'tianshu-ui-slot',
    version: 1, hash: await sha256Hex(payload) }));
  const bytes = new Uint8Array(9 + header.length + payload.length); bytes.set([84, 83, 85, 73, 1]);
  new DataView(bytes.buffer).setUint32(5, header.length, true); bytes.set(header, 9);
  bytes.set(payload, 9 + header.length); return bytes;
}
describe('save slots through ENG-01 IndexedDB API', () => {
  it('saves, loads, deletes, exports and imports a validated single slot', async () => {
    const { host, saves } = await setup();
    await saves.save('save_manual_01');
    const original = await host.snapshot();
    await host.dispatch({ t: 'world/tick' });
    expect((await host.snapshot()).meta.worldTick).toBe(1);
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
  it('projects save metadata from the current GameState instead of inherited header placeholders', async () => {
    const { host, saves } = await setup();
    for (let tick = 0; tick < 20; tick += 1) await host.dispatch({ t: 'world/tick' });
    await saves.save('save_manual_01');
    const first = await unpackTsav(await saves.exportSlot('save_manual_01'));
    expect(first.header).toMatchObject({ saveSchema: SAVE_SCHEMA,
      summary: { locationName: 'city_dali', playTimeSec: 2, debugTainted: true } });
    expect((await saves.list())[0]?.meta.gameTime).toBe(2);
    const { sizes, payloadSha256, bodySha256, ...inherited } = first.header;
    void sizes; void payloadSha256; void bodySha256;
    const legacyHeader = { ...inherited, saveSchema: 1,
      summary: { ...inherited.summary, locationName: '旧占位地点', playTimeSec: 999 } };
    const state = first.state as Record<string, SaveJson>;
    const { contentHash, ...legacyMeta } = state['meta'] as Record<string, SaveJson>;
    void contentHash;
    const oldState = { ...state, meta: { ...legacyMeta, saveSchema: 1 } } as SaveJson;
    const legacy = await packSaveJson(oldState, legacyHeader);
    await saves.importSlot('save_manual_02', legacy.bytes);
    const migrated = await unpackTsav(await saves.exportSlot('save_manual_02'));
    expect(migrated.header.summary).toMatchObject({
      locationName: 'city_dali', playTimeSec: 2, debugTainted: true,
    });
    expect((migrated.state as { meta: { contentHash: string } }).meta.contentHash)
      .toBe(inherited.contentHash);
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
    await saves.importSlot('save_manual_03', await legacyTsui(state));
    const exported = await saves.exportSlot('save_manual_03');
    expect(new TextDecoder().decode(exported.subarray(0, 4))).toBe('TSAV');
    expect((await unpackTsav(exported)).header.saveSchema).toBe(SAVE_SCHEMA);
    await saves.load('save_manual_03');
    const migrated = await host.snapshot();
    expect(migrated.chapter.npcs).toEqual([
      { npcId: 'npc_duanyu', relationship: 'met', affinity: 7, character: null },
    ]);
    expect(migrated.chapter.itemChapterUses).toEqual({ it_jinchuangyao: 2 });
    expect(migrated.profile.protagonist?.consumable).toMatchObject({
      stamina: 4, staminaMax: 9,
    });
    expect(migrated).not.toHaveProperty('schema');
    expect(migrated).not.toHaveProperty('location');
    host.dispose();
  });
  it('reports a future save without falling back to the preceding generation', async () => {
    const { storage, host, saves } = await setup();
    await saves.save('save_manual_04');
    const current = await unpackTsav(await saves.exportSlot('save_manual_04'));
    const { sizes, payloadSha256, bodySha256, ...base } = current.header;
    void sizes; void payloadSha256; void bodySha256;
    const futureState = { ...(current.state as Record<string, SaveJson>),
      meta: { ...((current.state as Record<string, SaveJson>)['meta'] as Record<string, SaveJson>),
        saveSchema: SAVE_SCHEMA + 1 } } as SaveJson;
    const future = await packSaveJson(futureState, { ...base, saveSchema: SAVE_SCHEMA + 1,
      savedAt: '2026-10-02T00:00:00.000Z' } satisfies SaveHeaderInput);
    await storage.saves.save('save_manual_04', future.bytes, { worldId: 'ch01_tianlong',
      gameTime: 0, version: 'tsav.v1', schemaVersion: SAVE_SCHEMA + 1,
      hash: await sha256Hex(future.bytes), summary: {} });
    const before = await host.snapshot();
    await expect(saves.load('save_manual_04')).rejects.toMatchObject({
      code: StorageErrorCode.SaveTooNew,
    });
    expect(await host.snapshot()).toEqual(before);
    expect(await storage.saves.listHistory('save_manual_04')).toHaveLength(2);
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
