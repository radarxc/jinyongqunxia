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
import type { GameContent } from './content';
import { createPreviewSession } from './bootstrap';
import { createGameSession } from './session';
import { fixtureContent } from './test-fixture';

function authored<T>(path: string): T {
  return parseContentFile({ path, text: readFileSync(resolve(process.cwd(), path), 'utf8') }).value as T;
}
async function fullFlowContent(): Promise<GameContent> {
  const base = fixtureContent();
  const shop = authored<ShopTemplateDef>('content/shops/shop_tpl_yaopu.yaml');
  const authoredItems = shop.supply.map((row) =>
    authored<ItemDef>(`content/items/${row.itemId}.yaml`));
  const facilities = authored<TownFacilitiesDef>('content/town/facilities/city_dali__ch01.yaml');
  const dialogues = authored<FacilityDialogueDef>('content/town/facility-dialogues.yaml');
  const price = authored<PriceTableDef>('content/common/economy/price-table.yaml');
  const compiled = await compileInk(readFileSync(resolve(process.cwd(),
    'content/story/ch01/story_ch01_facility.ink'), 'utf8'), readFileSync(resolve(process.cwd(),
    'content/story/ch01/story_ch01_facility.inkmeta.yaml'), 'utf8'),
  'content/story/ch01/story_ch01_facility.ink');
  const runtimeItems = authoredItems.map((item) => {
    const split = splitContentEntry({ path: `content/items/${item.id}.yaml`,
      kind: 'item', value: item });
    return { ...(split.rules as unknown as Record<string, unknown>),
      text: item.text } as unknown as ItemDef;
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
function newDaliRun(content: GameContent) {
  const state = createPreviewSession(content);
  const shopItems = new Set(content.shopTemplates?.[0]?.supply.map((row) => row.itemId) ?? []);
  return { ...state, party: { ...state.party, money: 10_000, inventory: {
    stacks: state.party.inventory.stacks.filter((row) => !shopItems.has(row.itemId)),
  } } };
}
async function shopTextSource(): Promise<ContentSource> {
  const leaves = await emitLeaves([{ logicalName: 'common.text.zh-Hans.json', kind: 'text',
    load: 'resident', locale: 'zh-Hans', value: {
      'town.city_dali__ch01.yaopu_01.name': '苍山药肆',
    } }]);
  const manifest = await createManifest('ch01_tianlong', 'a'.repeat(64), leaves, []);
  const values = new Map<string, unknown>([['ch01_tianlong/manifest.json', manifest],
    ...leaves.map((leaf): [string, unknown] =>
      [`ch01_tianlong/${leaf.logicalName}`, leaf.value])]);
  return { readJson: async (path) => values.get(path) };
}
afterEach(() => { vi.unstubAllGlobals(); document.body.innerHTML = ''; });

describe('v1 town shop end-to-end flow', () => {
  it('talks, opens ShopLayer, buys from core, updates the topbar, and restores the save', async () => {
    vi.stubGlobal('indexedDB', new IDBFactory()); vi.stubGlobal('IDBKeyRange', IDBKeyRange);
    const content = await fullFlowContent(); const initial = newDaliRun(content);
    const host = createProjectionMainThreadHost(createGameSession(content, initial));
    const pinia = createPinia(); const ui = useUiStore(pinia);
    const storage = await createIndexedDbStorage({ databaseName: 'shop-flow',
      autosaveThrottleMs: 0, storageManager: null });
    const controller = createGameController(host, ui, { storage,
      flowTextSource: await shopTextSource() });
    await controller.initialize();
    const queryShop = vi.spyOn(controller, 'queryShop');
    controller.setSceneRunsWorldTicks(true);
    const wrapper = mount(App, { attachTo: document.body, props: { controller },
      global: { plugins: [pinia] } });
    try {
      expect(await controller.enterTown()).toBe(true);
      await vi.waitFor(() => expect(wrapper.find('.town-page').exists()).toBe(true),
        { timeout: 5_000 });
      expect((await host.snapshot()).chapter.town).toMatchObject({ sceneId: 'city_dali',
        buildingPhase: 'outside' });
      const entering = await controller.townCommand({ t: 'town/move', destination: [-10, 78],
        buildingId: 'bi_0023' });
      expect(entering?.changes.town?.scene).toMatchObject({ activeBuildingId: 'bi_0023',
        buildingPhase: 'fading-in' });
      await controller.townCommand({ t: 'town/settle-building' });
      const started = await controller.townCommand({ t: 'town/interact' });
      expect(started?.changes.dialogue).toMatchObject({ interlocutor: {
        nameKey: 'town.city_dali__ch01.yaopu_01.name' } });
      while (ui.projection.dialogue?.choices.length === 0) await controller.dialogueContinue();
      const choiceIndex = ui.projection.dialogue!.choices[0]!.choiceIndex;
      expect(await controller.dialogueChoose(choiceIndex)).toBe(true);
      while (ui.projection.dialogue && !controller.shopRequest.value)
        await controller.dialogueContinue();
      await vi.waitFor(() => expect(controller.shopRequest.value).toMatchObject({
        shopKey: 'city_dali__ch01/yaopu_01',
      }));
      await vi.waitFor(() => expect(queryShop).toHaveBeenCalledWith(
        'city_dali__ch01/yaopu_01'), { timeout: 5_000 });
      expect(await queryShop.mock.results[0]!.value).toMatchObject({ view: {
        instanceKey: 'city_dali__ch01/yaopu_01',
      } });
      await vi.waitFor(() => expect(wrapper.find('.shop-panel').exists()).toBe(true),
        { timeout: 5_000 });
      expect(wrapper.find('.dialogue-layer').exists()).toBe(false);
      expect(wrapper.text()).toContain('甘草');
      await vi.waitFor(() => expect(wrapper.get('.journey-status').text()).toContain('苍山药肆'));
      const before = await host.snapshot();
      const row = wrapper.get('[data-item-id=it_gancao]');
      const priceText = row.get('.item-numbers dd').text();
      expect(priceText).toBe('100 文');
      await row.get('.confirm').trigger('click');
      await vi.waitFor(async () => expect((await host.snapshot()).party.money).toBe(9_900));
      const after = await host.snapshot();
      expect(before.party.money).toBe(10_000); expect(after.party.money).toBe(9_900);
      expect(after.party.inventory.stacks.find((entry) => entry.itemId === 'it_gancao')?.count)
        .toBe(1);
      expect(after.chapter.shops[0]?.stock.find((entry) => entry.itemId === 'it_gancao')?.count)
        .toBe(9);
      expect(wrapper.get('.journey-status').text()).toContain('9 两 900 文');
      const map = content.worldMaps!.find((entry) => entry.chapterId === after.chapter.chapterId)!;
      const node = map.nodes.find((entry) => entry.id === 'city_dali')!;
      expect(after.chapter.worldMap?.scene).toEqual({ ...node.entry, kind: node.kind,
        nodeId: node.id, name: node.name, chapterId: map.chapterId, era: map.era,
        returnNodeId: node.id });
      await controller.saveAction('save', 'save_manual_01');
      await row.get('.confirm').trigger('click');
      await vi.waitFor(async () => expect((await host.snapshot()).party.money).toBe(9_800));
      const loaded = await controller.loadSlot('save_manual_01');
      expect({ loaded, notice: controller.notice.value, saveStatus: controller.saveStatus.value })
        .toMatchObject({ loaded: true });
      const restored = await host.snapshot();
      expect(restored.party).toEqual(after.party);
      expect(restored.chapter.shops).toEqual(after.chapter.shops);
    } finally { wrapper.unmount(); controller.dispose(); await storage.deleteDatabase(); }
  }, 30_000);
});
