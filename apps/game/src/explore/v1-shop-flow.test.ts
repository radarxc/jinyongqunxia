// @vitest-environment happy-dom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { compileInk, createManifest, emitLeaves, splitContentEntry } from '@tianshu/data/build';
import { parseContentFile } from '@tianshu/data/tooling';
import { createIndexedDbStorage, createProjectionMainThreadHost } from '@tianshu/platform';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { createPinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useUiStore } from '@tianshu/ui/runtime';
import type { FacilityDialogueDef, ItemDef, PriceTableDef, ShopTemplateDef,
  TownFacilitiesDef } from '@tianshu/data/schemas';
import type { ContentSource } from '@tianshu/data';
import App from '../App.vue';
import { createGameController } from '../game-controller';
import type { GameContent } from '../runtime/content';
import { createPreviewSession } from '../runtime/bootstrap';
import { createGameSession } from '../runtime/session';
import { fixtureContent } from '../runtime/test-fixture';

function authored<T>(path: string): T {
  return parseContentFile({ path, text: readFileSync(resolve(process.cwd(), path), 'utf8') }).value as T;
}
async function content(): Promise<GameContent> {
  const base = fixtureContent(); const shop = authored<ShopTemplateDef>('content/shops/shop_tpl_yaopu.yaml');
  const items = shop.supply.map(row => authored<ItemDef>(`content/items/${row.itemId}.yaml`));
  const facilities = authored<TownFacilitiesDef>('content/town/facilities/city_dali__ch01.yaml');
  const dialogues = authored<FacilityDialogueDef>('content/town/facility-dialogues.yaml');
  const price = authored<PriceTableDef>('content/common/economy/price-table.yaml');
  const compiled = await compileInk(readFileSync(resolve(process.cwd(),
    'content/story/ch01/story_ch01_facility.ink'), 'utf8'), readFileSync(resolve(process.cwd(),
    'content/story/ch01/story_ch01_facility.inkmeta.yaml'), 'utf8'),
  'content/story/ch01/story_ch01_facility.ink');
  const runtimeItems = items.map(item => {
    const split = splitContentEntry({ path: `content/items/${item.id}.yaml`, kind: 'item', value: item });
    return { ...(split.rules as unknown as Record<string, unknown>), text: item.text } as unknown as ItemDef;
  });
  return { ...base, items: [...base.items, ...runtimeItems],
    chapters: [{ schemaVersion: 'book-world.v1', id: 'ch01_tianlong', eraLayerId: 'ch01',
      gameYear: { start: 1093, end: 1094, approx: true }, worldTier: 'LOW', levelCap: 20,
      layerCap: 9, foreignSuppression: 4, startTick: 0, countsRealLevel: true,
      wake: { regionId: 'rg_yunnan', sceneId: 'city_dali', spawnId: 'fixture' } }],
    shopTemplates: [shop], priceTables: [price], townFacilities: [facilities],
    facilityDialogues: [dialogues], inkStories: [{ storyId: compiled.storyId,
      storyHash: compiled.structure.storyHash, storyJson: compiled.storyJson }] };
}
async function textSource(): Promise<ContentSource> {
  const leaves = await emitLeaves([{ logicalName: 'common.text.zh-Hans.json', kind: 'text',
    load: 'resident', locale: 'zh-Hans', value: {
      'town.city_dali__ch01.yaopu_01.name': '苍山药肆',
      'facility.role.keeper.name': '药铺掌柜', 'dialogue.player.name': '少侠',
    } }]);
  const manifest = await createManifest('ch01_tianlong', 'a'.repeat(64), leaves, []);
  const values = new Map<string, unknown>([['ch01_tianlong/manifest.json', manifest],
    ...leaves.map((leaf): [string, unknown] => [`ch01_tianlong/${leaf.logicalName}`, leaf.value])]);
  return { readJson: async path => values.get(path) };
}
afterEach(() => { vi.unstubAllGlobals(); document.body.innerHTML = ''; });

describe('v1 page facility shop flow', () => {
  it('starts at the page interaction strip, talks to the clerk and buys through core', async () => {
    vi.stubGlobal('indexedDB', new IDBFactory()); vi.stubGlobal('IDBKeyRange', IDBKeyRange);
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 404 })));
    const loaded = await content(); const initial = createPreviewSession(loaded);
    const shopIds = new Set(loaded.shopTemplates?.[0]?.supply.map(row => row.itemId) ?? []);
    const state = { ...initial, party: { ...initial.party, money: 10_000, inventory: {
      stacks: initial.party.inventory.stacks.filter(row => !shopIds.has(row.itemId)) } } };
    const host = createProjectionMainThreadHost(createGameSession(loaded, state));
    const pinia = createPinia(); const ui = useUiStore(pinia);
    const storage = await createIndexedDbStorage({ databaseName: 'v1-page-shop-flow',
      autosaveThrottleMs: 0, storageManager: null });
    const controller = createGameController(host, ui, { storage, flowTextSource: await textSource() });
    await controller.initialize(); const wrapper = mount(App, { attachTo: document.body,
      props: { controller }, global: { plugins: [pinia] } });
    try {
      expect(await controller.enterTown()).toBe(true);
      await controller.townCommand({ t: 'town/move', destination: [-10, 78], buildingId: 'bi_0023' });
      await controller.townCommand({ t: 'town/settle-building' });
      await vi.waitFor(() => expect(wrapper.get('.town-context-actions button').text()).toBe('交谈F'));
      await wrapper.get('.town-context-actions button').trigger('click');
      await vi.waitFor(() => expect(ui.projection.dialogue).toMatchObject({
        speakerId: 'interlocutor', entryKey: 'yaopu_keeper' }));
      while (ui.projection.dialogue?.choices.length === 0) await controller.dialogueContinue();
      await vi.waitFor(() => expect(wrapper.find('[data-testid=dialogue-page]').exists()).toBe(true));
      await wrapper.get('[data-testid=dialogue-page]').trigger('click');
      await vi.waitFor(() => expect(wrapper.findAll('[data-testid=dialogue-choice]').length).toBeGreaterThan(0));
      expect(ui.projection.dialogue!.choices[0]!.choiceIndex).toBe(0);
      const choice = wrapper.findAll('[data-testid=dialogue-choice]')[0];
      expect(choice).toBeDefined(); await choice!.trigger('click');
      while (ui.projection.dialogue && !controller.shopRequest.value) await controller.dialogueContinue();
      await vi.waitFor(() => expect(wrapper.find('.shop-panel').exists()).toBe(true), { timeout: 5_000 });
      const row = wrapper.get('[data-item-id=it_gancao]'); await row.get('.confirm').trigger('click');
      await vi.waitFor(async () => expect((await host.snapshot()).party.money).toBe(9_900));
      expect((await host.snapshot()).party.inventory.stacks
        .find(entry => entry.itemId === 'it_gancao')?.count).toBe(1);
    } finally { wrapper.unmount(); controller.dispose(); await storage.deleteDatabase(); }
  }, 30_000);
});
