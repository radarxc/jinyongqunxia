// @vitest-environment happy-dom
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { watch } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createNewGameState, type DomainEvent } from '@tianshu/core';
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
import type { GameCommand, GameHost, GameProjection, GameUpdate, SessionSnapshot }
  from '../runtime/contracts';
import { createGameSession } from '../runtime/session';
import {
  allocationComplete,
  changeAllocation,
  presetAllocation,
  resetAllocation,
} from './allocation';
import { COLD_ENTRY, prologueCompletion } from './stage';

const regionRender = vi.hoisted(() => ({ createScene: vi.fn() }));
vi.mock('@tianshu/render/region', () => ({ createRegionScene: regionRender.createScene }));
vi.mock('../render-host', () => ({ createRenderQuality: vi.fn(async () => ({
  tier: 'high', renderScale: 1, effectivePixelRatio: (value: number) => value, setTier: vi.fn(),
})) }));

const regionStatic: NonNullable<GameProjection['regionStatic']> = {
  schemaVersion: 'region-static.v1', regionId: COLD_ENTRY.regionId, sceneId: COLD_ENTRY.sceneId,
  bounds: { qMin: 0, qMax: 2, rMin: 0, rMax: 2 }, terrainTable: ['tr_shadi'], chunks: [],
  objects: [], backdropAssetKey: null,
};
const regionView = (moved: boolean, open: boolean): NonNullable<GameProjection['region']> => ({
  regionId: COLD_ENTRY.regionId, sceneId: COLD_ENTRY.sceneId, spawnId: COLD_ENTRY.spawnId,
  playerHex: moved ? { q: 0, r: 1 } : { q: 0, r: 0 }, facing: 5,
  interactableAnchors: moved ? [{ anchorId: 'first_talk', class: 'NpcSpawn',
    hex: { q: 1, r: 1 }, enabled: true, reason: null }] : [],
  doors: [{ anchorId: 'door_grass_a', open, locked: !open,
    reason: open ? null : 'REGION_GATE_FLAG' }], pendingMount: null,
});
const dialogue = { storyId: COLD_ENTRY.storyId, storyHash: 'a'.repeat(64),
  entryKey: COLD_ENTRY.firstTalkKnot, speakerId: 'npc_shenqinghe10',
  textKey: 'ink.story_ch10_cold_entry.text.0004', choices: [], history: [] } as const;
function event(t: string, payload: DomainEvent['payload']): DomainEvent { return { t, payload }; }

function scriptedColdEntryHost(base: GameHost): { host: GameHost; events: string[] } {
  const listeners = new Set<(update: GameUpdate) => void>(); const events: string[] = [];
  let projection: GameProjection | undefined;
  const publish = (update: GameUpdate): GameUpdate => {
    if (update.accepted) {
      if (projection) projection = { ...projection, ...update.changes };
      events.push(...update.events.map((entry) => entry.t));
    }
    for (const listener of listeners) listener(update);
    return update;
  };
  const scripted = async (command: GameCommand): Promise<GameUpdate | undefined> => {
    if (command.t === 'world/mountRegion') return { accepted: true, changes: { regionStatic,
      region: regionView(false, false), regionPathPreview: null }, events: [
      event('world/regionMounted', { regionId: command.regionId, sceneId: command.sceneId,
        spawnId: command.spawnId }),
    ] };
    if (command.t === 'world/walkTo') return { accepted: true,
      changes: { region: regionView(true, false), regionPathPreview: null }, events: [
        event('world/walked', { regionId: COLD_ENTRY.regionId, sceneId: COLD_ENTRY.sceneId,
          destination: { q: command.hex.q, r: command.hex.r }, facing: 5, cost: 1,
          path: [{ q: 0, r: 0 }, { q: command.hex.q, r: command.hex.r }] }),
      ] };
    if (command.t === 'world/interact' && command.anchorId === 'first_talk')
      return { accepted: true, changes: { dialogue }, events: [event('dialogue/started',
        { storyId: COLD_ENTRY.storyId, entryKey: COLD_ENTRY.firstTalkKnot })] };
    if (command.t === 'dialogue/continue') return { accepted: true, changes: {
      dialogue: null, region: regionView(true, true) }, events: [
      event('world/entranceOpened', { entranceId: COLD_ENTRY.entranceId }),
      event('world/autosaveRequested', { regionId: COLD_ENTRY.regionId,
        sceneId: COLD_ENTRY.sceneId, anchorId: 'dialogue', reason: 'ch10_cold_entry_complete' }),
      event('world/eventPresented', { eventId: `dialogue:${COLD_ENTRY.storyId}`,
        steps: [{ op: 'ui/showTitleCard', card: COLD_ENTRY.titleCard }] }),
    ] };
    return undefined;
  };
  const host: GameHost = { mode: 'main-thread', async dispatch(command) {
    const update = await scripted(command) ?? await base.dispatch(command);
    if (command.t === 'chapter/bookSleep' && update.accepted) return publish({ ...update,
      events: [...update.events, event('world/eventPresented', {
        eventId: COLD_ENTRY.arrivalEventId, steps: [
          { op: 'dialogue/start', storyId: COLD_ENTRY.storyId, knot: 'westward_journey',
            presentation: 'text_stills', skippable: true, durationSeconds: 54 },
          { op: 'ui/revealText', textKey: 'ch10.coldEntry.eraTitle' },
          { op: 'world/loadScene', regionId: COLD_ENTRY.regionId,
            sceneId: COLD_ENTRY.sceneId, spawnId: COLD_ENTRY.spawnId },
        ],
      })],
    });
    return publish(update);
  }, async query() { return projection ??= await base.query(); }, snapshot: () => base.snapshot(),
  validate: (value) => base.validate(value), async restore(value) { return publish(
    await base.restore(value)); }, subscribe(listener) { listeners.add(listener);
    return () => listeners.delete(listener); }, dispose() { listeners.clear(); base.dispose(); } };
  return { host, events };
}

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

async function coldEntryHarness(): Promise<Awaited<ReturnType<typeof harness>> &
{ events: string[] }> {
  const factory = new IDBFactory();
  vi.stubGlobal('indexedDB', factory); vi.stubGlobal('IDBKeyRange', IDBKeyRange);
  const [ch00, ch10] = await Promise.all([
    fixtureItemPack('ch00_yuenv'), fixtureItemPack('ch10_baima'),
  ]);
  const source = { readJson: async (path: string) => ch00.values.get(path) ?? ch10.values.get(path) };
  const base = fixtureContent();
  const [opening, wake] = await Promise.all([
    loadGameContent(base, source, 'ch00_yuenv'), loadGameContent(base, source, 'ch10_baima'),
  ]);
  const initial = createNewGameState({ masterSeed: 19, contentHash: ch00.manifest.contentHash,
    identity: { name: '旧档人物', gender: 'female', appearance: 'hero_f01', pronoun: '她',
      originId: 'origin_wenshiguan' }, difficulty: 'diff_jianghu',
    chapter: opening.chapters![0]! });
  const session = createGameSession(opening, initial, undefined, { demo: false,
    seedSource: () => 23, preloadChapter: async () => wake });
  const scripted = scriptedColdEntryHost(createProjectionMainThreadHost(session));
  const storage = await createIndexedDbStorage({ databaseName: 'm1-cold-entry',
    indexedDB: factory, IDBKeyRange, storageManager: null, autosaveThrottleMs: 0 });
  storages.push(storage);
  const pinia = createPinia(); const ui = useUiStore(pinia);
  const controller = createGameController(scripted.host, ui, { storage, flowTextSource: source });
  controllers.push(controller); await controller.initialize();
  await controller.startNewGame({ identity: { name: '沈砚', gender: 'female',
    appearance: 'hero_f01', pronoun: '她', originId: 'origin_wenshiguan' },
  difficulty: 'diff_jianghu' });
  const wrapper = mount(App, { attachTo: document.body, props: { controller },
    global: { plugins: [pinia] } });
  return { controller, storage, wrapper, ui, host: scripted.host, events: scripted.events,
    snapshot: () => scripted.host.snapshot() };
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
  it('follows the eight domain-event stages before free control and persists the autosave', async () => {
    const { controller, storage, wrapper, ui, events } = await coldEntryHarness();
    const stages: string[] = [];
    const stopStages = watch(controller.coldEntryStage, (stage) => stages.push(stage),
      { flush: 'sync' });
    try {
      expect(await controller.choosePrologueMode('skip')).toBe(true);
      expect(await controller.settlePrologueMode('skip', prologueCompletion('skip'))).toBe(true);
      const rules = controller.firstSleepAllocation.value;
      if (!rules) throw new TypeError('TEST_ALLOCATION_MISSING');
      expect(await controller.commitFirstSleep(rules.presets.balanced, 'balanced')).toBe(true);
      await vi.waitFor(() => expect(controller.coldEntryStage.value).toBe('cutscene'),
        { timeout: 10_000 });
      await waitFor(wrapper, '[data-testid=cutscene-skip]');
      await wrapper.get('[data-testid=cutscene-skip]').trigger('click');
      expect(controller.coldEntryStage.value).toBe('scene-loading');
      await vi.waitFor(() => expect(controller.coldEntryStage.value).toBe('movement'),
        { timeout: 10_000 });
      await waitFor(wrapper, '[data-region-canvas]');
      expect(controller.notice.value).toBe('长安二年（702）·西州以北');

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));
      await vi.waitFor(() => expect(events).toContain('world/walked'), { timeout: 5_000 });
      await waitFor(wrapper, '[data-region-anchor=first_talk]');
      await wrapper.get('[data-region-anchor=first_talk]').trigger('click');
      await vi.waitFor(() => expect(controller.coldEntryStage.value).toBe('first-talk'),
        { timeout: 5_000 });
      await waitFor(wrapper, '[data-testid=dialogue]');
      await vi.waitFor(() => expect(wrapper.get('[data-testid=dialogue-speaker]').text())
        .toBe('沈青禾'), { timeout: 5_000 });
      await wrapper.get('[data-testid=dialogue-page]').trigger('click');
      await waitFor(wrapper, '[data-testid=dialogue-continue]');
      await wrapper.get('[data-testid=dialogue-continue]').trigger('click');

      await vi.waitFor(() => expect(controller.coldEntryStage.value).toBe('east-exit-open'),
        { timeout: 5_000 });
      expect((ui.projection as GameProjection).region?.doors[0])
        .toMatchObject({ open: true, locked: false });
      await vi.waitFor(async () => expect((await storage.saves.listSlots())
        .map((entry) => entry.slot)).toContain('save_auto_1'), { timeout: 5_000 });
      await waitFor(wrapper, '[data-testid=baima-title-card]');
      expect(controller.coldEntryStage.value).toBe('title-card');
      await wrapper.get('[data-testid=baima-continue]').trigger('click');
      await vi.waitFor(() => expect(controller.coldEntryStage.value).toBe('free'),
        { timeout: 5_000 });
      await waitFor(wrapper, '[data-region-canvas]');
      expect(stages).toContain('autosave');
      expect(stages).toEqual(['cutscene', 'scene-loading', 'movement', 'first-talk',
        'east-exit-open', 'autosave', 'title-card', 'free']);
      expect(events).toEqual(expect.arrayContaining(['world/eventPresented',
        'world/regionMounted', 'world/walked', 'dialogue/started',
        'world/entranceOpened', 'world/autosaveRequested']));
    } finally { stopStages(); wrapper.unmount(); }
  }, 30_000);

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
