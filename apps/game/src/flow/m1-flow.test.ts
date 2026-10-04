// @vitest-environment happy-dom
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createNewGameState } from '@tianshu/core';
import {
  createIndexedDbStorage,
  createProjectionMainThreadHost,
  type TianshuStorage,
} from '@tianshu/platform';
import { useUiStore } from '@tianshu/ui/runtime';
import App from '../App.vue';
import { createGameController, type GameController } from '../game-controller';
import { fixtureContent, fixtureItemPack } from '../runtime/test-fixture';
import { loadGameContent } from '../runtime/item-content';
import type { GameHost, SessionSnapshot } from '../runtime/contracts';
import { createGameSession } from '../runtime/session';
import {
  allocationComplete,
  changeAllocation,
  presetAllocation,
  resetAllocation,
} from './allocation';
import { prologueCompletion } from './stage';

const controllers: GameController[] = [];
const storages: TianshuStorage[] = [];
afterEach(async () => {
  for (const controller of controllers.splice(0)) controller.dispose();
  for (const storage of storages.splice(0)) await storage.deleteDatabase();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

async function harness(): Promise<{
  controller: GameController;
  storage: TianshuStorage;
  wrapper: VueWrapper;
  ui: ReturnType<typeof useUiStore>;
  host: GameHost;
  snapshot: () => Promise<SessionSnapshot>;
}> {
  const factory = new IDBFactory();
  vi.stubGlobal('indexedDB', factory);
  vi.stubGlobal('IDBKeyRange', IDBKeyRange);
  const [ch00, ch10] = await Promise.all([
    fixtureItemPack('ch00_yuenv'),
    fixtureItemPack('ch10_baima'),
  ]);
  const source = {
    readJson: async (path: string) => ch00.values.get(path) ?? ch10.values.get(path),
  };
  const base = fixtureContent();
  const [opening, wake] = await Promise.all([
    loadGameContent(base, source, 'ch00_yuenv'),
    loadGameContent(base, source, 'ch10_baima'),
  ]);
  const chapter = opening.chapters?.[0];
  if (!chapter) throw new TypeError('TEST_CHAPTER_MISSING');
  const initial = createNewGameState({
    masterSeed: 19,
    contentHash: ch00.manifest.contentHash,
    identity: {
      name: '旧档人物',
      gender: 'female',
      appearance: 'hero_f01',
      pronoun: '她',
      originId: 'origin_wenshiguan',
    },
    difficulty: 'diff_jianghu',
    chapter,
  });
  const session = createGameSession(opening, initial, undefined, {
    demo: false,
    seedSource: () => 23,
    preloadChapter: async () => wake,
  });
  const host = createProjectionMainThreadHost(session);
  const storage = await createIndexedDbStorage({
    databaseName: 'm1-flow',
    indexedDB: factory,
    IDBKeyRange,
    storageManager: null,
    autosaveThrottleMs: 0,
  });
  storages.push(storage);
  const pinia = createPinia();
  const ui = useUiStore(pinia);
  const controller = createGameController(host, ui, { storage, flowTextSource: source });
  controllers.push(controller);
  await controller.initialize();
  await controller.startNewGame({
    identity: {
      name: '无名侠客',
      gender: 'unspecified',
      appearance: 'appearance_default',
      pronoun: '你',
      originId: 'origin_wenshiguan',
    },
    difficulty: 'diff_jianghu',
  });
  const wrapper = mount(App, {
    attachTo: document.body,
    props: { controller },
    global: { plugins: [pinia] },
  });
  return { controller, storage, wrapper, ui, host, snapshot: () => host.snapshot() };
}

async function waitFor(wrapper: VueWrapper, selector: string): Promise<void> {
  await vi.waitFor(
    async () => {
      await flushPromises();
      expect(wrapper.find(selector).exists()).toBe(true);
    },
    { timeout: 5_000 },
  );
}

describe('M1 application flow with fake IndexedDB', () => {
  it('goes from character creation through skip and default allocation to the ch10 title', async () => {
    const { controller, storage, wrapper, snapshot } = await harness();
    try {
      await waitFor(wrapper, '[data-testid=character-creation]');
      expect((await snapshot()).profile.identity?.name).toBe('旧档人物');
      await wrapper.get('[data-testid=character-name]').setValue('沈砚');
      await wrapper.get('[data-testid=character-creation]').trigger('submit');
      await waitFor(wrapper, '[data-testid=cutscene]');
      await wrapper.get('[data-testid=cutscene-skip]').trigger('click');
      await waitFor(wrapper, '[data-testid=prologue-mode]');
      await wrapper.get('input[value=skip]').setValue();
      await wrapper.get('[data-testid=mode-confirm]').trigger('click');
      // This wait synchronizes functional state; loaded-host latency is not a performance assertion.
      await vi.waitFor(() => expect(controller.flowStage.value).toBe('skip-bridge'),
        { timeout: 10_000 });
      await waitFor(wrapper, '[data-testid=cutscene-next]');
      await wrapper.get('[data-testid=cutscene-next]').trigger('click');
      await waitFor(wrapper, '[data-testid=cutscene-next]');
      await wrapper.get('[data-testid=cutscene-next]').trigger('click');
      await waitFor(wrapper, '[data-testid=export-prompt]');
      await wrapper.get('[data-testid=export-later]').trigger('click');
      await waitFor(wrapper, '[data-testid=sleep-allocation]');
      await wrapper.get('[data-testid=allocation-default]').trigger('click');
      await wrapper.get('[data-testid=allocation-review]').trigger('click');
      await waitFor(wrapper, '[data-testid=sleep-confirmation]');
      await wrapper.get('[data-testid=allocation-confirm]').trigger('click');
      await vi.waitFor(() => expect(controller.flowStage.value).toBe('wake-cutscene'), {
        timeout: 5_000,
      });
      await waitFor(wrapper, '[data-testid=cutscene-skip]');
      await wrapper.get('[data-testid=cutscene-skip]').trigger('click');
      await waitFor(wrapper, '[data-testid=baima-title-card]');
      expect(wrapper.get('[data-testid=baima-dateloc]').text()).toBe('长安二年（702）·西州以北');
      expect(wrapper.text()).toContain('第一卷·白马啸西风');
      expect((await snapshot()).chapter.chapterId).toBe('ch10_baima');
      const slots = (await storage.saves.listSlots()).map((entry) => entry.slot);
      expect(slots).toContain('save_auto_1');
      expect(slots).toContain('save_wake_ch10');
    } finally {
      wrapper.unmount();
    }
  }, 30_000);

  it('keeps a rejected dialogue choice unchanged and blocks manual saves in transactions', async () => {
    const { controller, wrapper, ui, host } = await harness();
    try {
      await controller.startNewGame({
        identity: {
          name: '沈砚',
          gender: 'female',
          appearance: 'hero_f01',
          pronoun: '她',
          originId: 'origin_wenshiguan',
        },
        difficulty: 'diff_jianghu',
      });
      controller.setFlowStage('game');
      const rejectedView = {
        storyId: 'story_test',
        storyHash: 'a'.repeat(64),
        entryKey: 'opening',
        speakerId: 'book_spirit',
        textKey: 'ink.story_test.text.0000',
        choices: [
          { choiceIndex: 0, textKey: 'ink.story_test.text.0001', unavailableReason: null },
          {
            choiceIndex: 1,
            textKey: 'ink.story_test.text.0002',
            unavailableReason: 'ink.story_test.reason.locked',
          },
        ],
        history: [],
      };
      const dispatch = vi.spyOn(host, 'dispatch');
      ui.applyProjection({ dialogue: rejectedView });
      await waitFor(wrapper, '[data-testid=dialogue]');
      await wrapper.get('[data-testid=dialogue-page]').trigger('click');
      await waitFor(wrapper, '[data-testid=dialogue-choice]');
      expect(wrapper.get('[data-testid=dialogue-choice-reason]').text()).toBe('正文尚未装载。');
      await wrapper.findAll('[data-testid=dialogue-choice]')[0]!.trigger('click');
      // These waits synchronize functional state; loaded-host latency is not a performance assertion.
      await vi.waitFor(() =>
        expect(dispatch).toHaveBeenCalledWith({
          t: 'dialogue/choose',
          choiceIndex: 0,
        }),
        { timeout: 10_000 },
      );
      await vi.waitFor(() => expect(controller.busy.value).toBe(false), { timeout: 10_000 });
      expect(ui.projection.dialogue).toEqual(rejectedView);
      await controller.saveAction('save', 'save_quick');
      expect(controller.notice.value).toContain('对话结束后');
      ui.applyProjection({ dialogue: null });
      controller.setBookSleepActive(true);
      await controller.saveAction('save', 'save_quick');
      expect(controller.notice.value).toContain('书眠事务结束后');
      expect(controller.canSave()).toBe(false);
      controller.setBookSleepActive(false);
      expect(await controller.choosePrologueMode('skip')).toBe(true);
      const settled = await controller.settlePrologueMode('skip', prologueCompletion('skip'));
      expect(settled).toBe(true);
      expect(controller.firstSleepAllocation.value).not.toBeNull();
      await controller.saveAction('save', 'save_quick');
      expect(controller.notice.value).toContain('书眠事务结束后');
      expect(controller.canSave()).toBe(false);
    } finally {
      controller.setBookSleepActive(false);
      wrapper.unmount();
    }
  }, 30_000);
});

describe('M1 allocation draft rules', () => {
  const rules = {
    ruleVersion: 'first-sleep.v1',
    keys: ['str', 'con', 'bre', 'wis', 'agi', 'wil'] as const,
    base: 35,
    min: 20,
    max: 80,
    budget: 90,
    requiredTotal: 300,
    draft: null,
    presets: { balanced: { str: 50, con: 50, bre: 50, wis: 50, agi: 50, wil: 50 } },
    lockedKeys: ['luk', 'cha'] as const,
  };

  it('resets to the queried base, uses the queried balanced preset and clamps edits', () => {
    const reset = resetAllocation(rules);
    expect(reset.values).toEqual({ str: 35, con: 35, bre: 35, wis: 35, agi: 35, wil: 35 });
    const balanced = presetAllocation(rules, 'balanced');
    expect(balanced.values).toEqual(rules.presets.balanced);
    expect(allocationComplete(rules, balanced)).toBe(true);
    const tooHigh = changeAllocation(rules, reset, 'str', 999);
    expect(tooHigh.values['str']).toBe(80);
    const tooLow = changeAllocation(rules, tooHigh, 'str', -999);
    expect(tooLow.values['str']).toBe(20);
  });
});
