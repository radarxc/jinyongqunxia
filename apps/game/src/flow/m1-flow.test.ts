// @vitest-environment happy-dom
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { watch } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createNewGameState,
  FIRST_SLEEP_RULE,
  type BookSleepPlan,
  type DomainEvent,
} from '@tianshu/core';
import type { ContentSource } from '@tianshu/data';
import { splitContentEntry } from '@tianshu/data/build';
import { parseContentFile } from '@tianshu/data/tooling';
import {
  createIndexedDbStorage,
  createProjectionMainThreadHost,
  type TianshuStorage,
} from '@tianshu/platform';
import { useUiStore } from '@tianshu/ui/runtime';
import App from '../App.vue';
import type { BattlePacket } from '../battle/contracts';
import { createGameController, type GameController } from '../game-controller';
import { fixtureContent, fixtureItemPack } from '../runtime/test-fixture';
import { loadGameContent, loadRegionContent } from '../runtime/item-content';
import type { GameCommand, GameHost, GameProjection, GameUpdate, SessionSnapshot }
  from '../runtime/contracts';
import { createGameSession } from '../runtime/session';
type GameSession = ReturnType<typeof createGameSession>;
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

const contentDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../public/content');
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');

const fsSource: ContentSource = {
  readJson: async (relativePath: string) => {
    const full = resolve(contentDir, relativePath);
    if (!existsSync(full)) return undefined;
    return JSON.parse(readFileSync(full, 'utf8'));
  },
};

async function buildTestSessions() {
  const base = fixtureContent();
  const mapPath = 'content/world/ch10/map.yaml';
  const mapEntry = parseContentFile({
    path: mapPath,
    text: readFileSync(resolve(repoRoot, mapPath), 'utf8'),
  });
  const ch10MapText = splitContentEntry(mapEntry).text;

  const [opening, wake] = await Promise.all([
    loadGameContent(base, fsSource, 'ch00_yuenv'),
    loadGameContent(base, fsSource, 'ch10_baima', async () => ({ assets: {}, mapText: ch10MapText })),
  ]);

  const createSession = () => {
    const chapter = opening.chapters?.[0];
    if (!chapter) throw new TypeError('TEST_CHAPTER_MISSING');
    const initial = createNewGameState({
      masterSeed: 42,
      contentHash: opening.contentHash ?? 'a'.repeat(64),
      identity: {
        name: '沈砚',
        gender: 'female',
        appearance: 'hero_f01',
        pronoun: '她',
        originId: 'origin_wenshiguan',
      },
      difficulty: 'diff_jianghu',
      chapter,
    });

    return createGameSession(opening, initial, undefined, {
      demo: false,
      seedSource: () => 42,
      preloadChapter: async (chapterId) => {
        if (chapterId === 'ch10_baima') return wake;
        throw new Error(`UNKNOWN_CHAPTER:${chapterId}`);
      },
      preloadRegion: async (chapterId, regionId) => {
        return loadRegionContent(fsSource, chapterId, regionId);
      },
    });
  };

  return { createSession, opening, wake };
}

async function advanceDialogue(
  session: GameSession,
  chooseOption?: (entryKey: string, choices: readonly { textKey: string; choiceIndex: number }[]) => number,
): Promise<void> {
  let projection = await session.query();
  let guard = 0;
  while (projection.dialogue && guard++ < 100) {
    const d = projection.dialogue;
    if (d.choices && d.choices.length > 0) {
      const choiceIndex = chooseOption ? chooseOption(d.entryKey, d.choices) : 0;
      await session.dispatch({ t: 'dialogue/choose', choiceIndex });
    } else {
      await session.dispatch({ t: 'dialogue/continue' });
    }
    projection = await session.query();
  }
}

async function playBattleToVictory(session: GameSession): Promise<BattlePacket> {
  let reqId = 100;
  let guard = 0;
  while (guard++ < 200) {
    const projection = await session.query();
    const battle = projection.battle;
    if (!battle || battle.result) return battle!;

    const readyUnit = battle.units.find((u: { id: string }) => u.id === battle.actorId);
    if (!readyUnit || readyUnit.control === 'ai') {
      await session.dispatch({ t: 'battle/step', revision: battle.revision });
      continue;
    }

    const enemies = battle.units.filter((u: { side: string; hp: number; active: boolean }) => u.side !== readyUnit.side && u.hp > 0 && u.active);
    if (enemies.length === 0) {
      await session.dispatch({ t: 'battle/wait', actor: readyUnit.id, revision: battle.revision });
      continue;
    }

    let acted = false;
    for (const enemy of enemies) {
      if (!enemy.pos) continue;
      let previewRes = await session.dispatch({
        t: 'battle/preview',
        revision: battle.revision,
        requestId: ++reqId,
        actor: readyUnit.id,
        moveId: 'mv_basic_strike',
        anchor: enemy.pos,
        aim: { dirCount: 6, dir: 0 },
      });
      let preview = previewRes.changes.battle?.preview;
      if (preview && preview.valid) {
        await session.dispatch({ t: 'battle/act-at', preview });
        acted = true;
        break;
      }
      const reachable = battle.capabilities.move?.reachable ?? [];
      for (const cell of reachable) {
        previewRes = await session.dispatch({
          t: 'battle/preview',
          revision: battle.revision,
          requestId: ++reqId,
          actor: readyUnit.id,
          moveId: 'mv_basic_strike',
          anchor: enemy.pos,
          aim: { dirCount: 6, dir: 0 },
          walkTo: { q: cell.q, r: cell.r },
        });
        preview = previewRes.changes.battle?.preview;
        if (preview && preview.valid) {
          await session.dispatch({ t: 'battle/act-at', preview });
          acted = true;
          break;
        }
      }
      if (acted) break;
    }

    if (!acted) {
      const reachable = battle.capabilities.move?.reachable ?? [];
      if (reachable.length > 0 && enemies[0]?.pos) {
        const enemyPos = enemies[0].pos;
        let bestCell = reachable[0]!;
        let bestDist = Math.hypot(bestCell.q - enemyPos.q, bestCell.r - enemyPos.r);
        for (const cell of reachable) {
          const dist = Math.hypot(cell.q - enemyPos.q, cell.r - enemyPos.r);
          if (dist < bestDist) {
            bestDist = dist;
            bestCell = cell;
          }
        }
        await session.dispatch({
          t: 'battle/move',
          actor: readyUnit.id,
          destination: { q: bestCell.q, r: bestCell.r },
          revision: battle.revision,
        });
        acted = true;
      } else {
        const gather = battle.capabilities.gather;
        if (gather && gather.enabled) {
          await session.dispatch({
            t: 'battle/gather',
            actor: readyUnit.id,
            routeId: 'mfr_fixture_basic',
            revision: battle.revision,
          });
        } else {
          await session.dispatch({
            t: 'battle/wait',
            actor: readyUnit.id,
            revision: battle.revision,
          });
        }
      }
    }
  }
  throw new Error('BATTLE_TIMEOUT');
}

describe('Prologue full flow end-to-end verification', () => {
  it('completes the full prologue flow from New Game to waking in Chapter 10', async () => {
    const { createSession } = await buildTestSessions();
    const session = createSession();

    // 1. Initial mounting & prologue decision
    const mounted = await session.dispatch({
      t: 'world/mountRegion',
      regionId: 'rg_jiangnan_taihu',
      sceneId: 'sc_00_zhulin',
      spawnId: 'bookfall',
    });
    expect(mounted.accepted).toBe(true);

    const fullChoice = await session.dispatch({
      t: 'quest/choose',
      questId: 'dc_00_01',
      optionId: 'full',
    });
    expect(fullChoice.accepted).toBe(true);

    let state = await session.snapshot();
    expect(state.chapter.chapterId).toBe('ch00_yuenv');
    expect(state.chapter.prologue?.mode).toBe('full');

    // 2. C01 Progression: Interact with bamboo staff and gain items
    const walkToStaff = await session.dispatch({
      t: 'world/walkTo',
      hex: { q: 9, r: 10 },
    });
    expect(walkToStaff.accepted).toBe(true);

    const staffInteract = await session.dispatch({
      t: 'world/interact',
      anchorId: 'pickup_bamboo_staff',
    });
    expect(staffInteract.accepted).toBe(true);
    expect((await session.query()).dialogue?.entryKey).toBe('aqing_first_meeting');

    await advanceDialogue(session, (_knot, _choices) => 2); // 拾起竹枝
    expect((await session.query()).dialogue).toBeNull();

    state = await session.snapshot();
    expect(state.profile.replayRules?.switches['fl_00_staff_accepted']).toBe(true);
    // Inventory contains bamboo staff and items awarded by C01
    const staffStack = state.party.inventory.stacks.find((s: { itemId: string }) => s.itemId === 'prop_bamboo_staff');
    expect(staffStack?.count).toBeGreaterThanOrEqual(1);

    // Door to_shanjing is now unlocked
    const regionProjection = (await session.query()).region;
    const doorToShanjing = regionProjection?.doors.find((d) => d.anchorId === 'to_shanjing');
    expect(doorToShanjing?.locked).toBe(false);

    // 3. C02 Progression: Initial battle enc_00_zhulin
    const arenaInteract = await session.dispatch({
      t: 'world/interact',
      anchorId: 'arena_00_zhulin',
    });
    expect(arenaInteract.accepted).toBe(true);
    expect((await session.query()).battle).not.toBeNull();

    const battleZhulinResult = await playBattleToVictory(session);
    expect(battleZhulinResult.result).toBe('win');

    const leaveBattleZhulin = await session.dispatch({ t: 'battle/leave' });
    expect(leaveBattleZhulin.accepted).toBe(true);
    expect((await session.query()).battle).toBeNull();

    // after_initial_battle dialogue automatically starts
    expect((await session.query()).dialogue?.entryKey).toBe('after_initial_battle');
    await advanceDialogue(session, () => 0); // 还想自己再试
    expect((await session.query()).dialogue).toBeNull();

    state = await session.snapshot();
    expect(state.profile.replayRules?.switches['fl_00_initial_battle_manual']).toBe(true);

    // Walk to door to_shanjing (q: 13, r: 2) and travel to sc_00_shanjing
    const walkToShanjingDoor = await session.dispatch({
      t: 'world/walkTo',
      hex: { q: 12, r: 2 },
    });
    expect(walkToShanjingDoor.accepted).toBe(true);

    const enterShanjing = await session.dispatch({
      t: 'world/interact',
      anchorId: 'to_shanjing',
    });
    expect(enterShanjing.accepted).toBe(true);

    const mountShanjing = await session.dispatch({
      t: 'world/mountRegion',
      regionId: 'rg_jiangnan_taihu',
      sceneId: 'sc_00_shanjing',
      spawnId: 'from_zhulin',
    });
    expect(mountShanjing.accepted).toBe(true);
    expect((await session.query()).region?.sceneId).toBe('sc_00_shanjing');

    // Walk near offer_tao (q: 13, r: 8) and offer peach to Baiyuan
    const walkToOfferTao = await session.dispatch({
      t: 'world/walkTo',
      hex: { q: 12, r: 8 },
    });
    expect(walkToOfferTao.accepted).toBe(true);

    const offerTaoInteract = await session.dispatch({
      t: 'world/interact',
      anchorId: 'offer_tao',
    });
    expect(offerTaoInteract.accepted).toBe(true);
    expect((await session.query()).dialogue?.entryKey).toBe('baiyuan_choice');

    await advanceDialogue(session, () => 0); // 放下一枚桃子
    expect((await session.query()).dialogue).toBeNull();

    state = await session.snapshot();
    expect(state.profile.replayRules?.switches['fl_00_baiyuan_merged']).toBe(true);

    // 4. C03 Progression: Yue camp & Biandao Battle
    const walkToYueyingDoor = await session.dispatch({
      t: 'world/walkTo',
      hex: { q: 15, r: 10 },
    });
    expect(walkToYueyingDoor.accepted).toBe(true);

    const enterYueying = await session.dispatch({
      t: 'world/interact',
      anchorId: 'to_yueying',
    });
    expect(enterYueying.accepted).toBe(true);
    await session.dispatch({
      t: 'world/mountRegion',
      regionId: 'rg_jiangnan_taihu',
      sceneId: 'sc_00_yueying',
      spawnId: 'from_shanjing',
    });
    expect((await session.query()).region?.sceneId).toBe('sc_00_yueying');

    // Door camp_gate is unlocked because fl_00_baiyuan_merged is true
    const campGateDoor = (await session.query()).region?.doors.find((d) => d.anchorId === 'camp_gate');
    expect(campGateDoor?.locked).toBe(false);

    // Walk to camp_gate (q: 9, r: 15) and enter camp
    const walkToCampGate = await session.dispatch({
      t: 'world/walkTo',
      hex: { q: 9, r: 14 },
    });
    expect(walkToCampGate.accepted).toBe(true);

    const enterCampGate = await session.dispatch({
      t: 'world/interact',
      anchorId: 'camp_gate',
    });
    expect(enterCampGate.accepted).toBe(true);
    await session.dispatch({
      t: 'world/mountRegion',
      regionId: 'rg_jiangnan_taihu',
      sceneId: 'sc_00_yueying',
      spawnId: 'camp_gate_inside',
    });

    // Walk near Fan Li (q: 14, r: 6) inside camp
    const walkToFanLi = await session.dispatch({
      t: 'world/walkTo',
      hex: { q: 13, r: 6 },
    });
    expect(walkToFanLi.accepted).toBe(true);

    const fanLiInteract = await session.dispatch({
      t: 'world/interact',
      anchorId: 'npc_fanli_yueying',
    });
    expect(fanLiInteract.accepted).toBe(true);
    expect((await session.query()).dialogue?.entryKey).toBe('fanli_request');

    await advanceDialogue(session, () => 0); // 劝阿青相助
    expect((await session.query()).dialogue).toBeNull();

    // Biandao battle starts
    expect((await session.query()).battle).not.toBeNull();
    const battleBiandaoResult = await playBattleToVictory(session);
    expect(battleBiandaoResult.result).toBe('win');

    const leaveBattleBiandao = await session.dispatch({ t: 'battle/leave' });
    expect(leaveBattleBiandao.accepted).toBe(true);

    // biandao_after -> sword_source -> nine_layer_preview chained dialogues
    expect((await session.query()).dialogue?.entryKey).toBe('biandao_after');
    await advanceDialogue(session, (_knot, _choices) => 1); // 一键观看演示 / 一键观看远景
    expect((await session.query()).dialogue).toBeNull();

    state = await session.snapshot();
    expect(state.profile.replayRules?.switches['fl_00_biandao_done']).toBe(true);
    expect(state.profile.replayRules?.switches['fl_00_sword_demo_seen']).toBe(true);
    expect(state.profile.replayRules?.switches['fl_00_nine_preview_seen']).toBe(true);

    // 5. C04 Progression: Transmission Inkpoint & Northbound departure
    const walkToTransmission = await session.dispatch({
      t: 'world/walkTo',
      hex: { q: 13, r: 12 },
    });
    expect(walkToTransmission.accepted).toBe(true);

    const transmissionInteract = await session.dispatch({
      t: 'world/interact',
      anchorId: 'transmission_inkpoint',
    });
    expect(transmissionInteract.accepted).toBe(true);
    expect((await session.query()).dialogue?.entryKey).toBe('aqing_first_layer');

    await advanceDialogue(session, (_knot, choices) => choices.length - 1); // 默记呼吸 -> 稍后再导出 -> 直接北行
    expect((await session.query()).dialogue).toBeNull();

    state = await session.snapshot();
    expect(state.profile.replayRules?.switches['fl_00_first_layer_committed']).toBe(true);
    expect(state.profile.replayRules?.switches['fl_00_avalanche_survived']).toBe(true);

    // Auto-mounted to Changbai snow cave sc_00_changbai_cave
    expect((await session.query()).region?.sceneId).toBe('sc_00_changbai_cave');

    // 6. First sleep allocation & Waking to Chapter 10
    const walkToSleepAnchor = await session.dispatch({
      t: 'world/walkTo',
      hex: { q: 4, r: 4 },
    });
    expect(walkToSleepAnchor.accepted).toBe(true);

    const sleepInteract = await session.dispatch({
      t: 'world/interact',
      anchorId: 'first_sleep_allocation',
    });
    expect(sleepInteract.accepted).toBe(true);
    expect((await session.query()).dialogue?.entryKey).toBe('first_sleep_allocation');

    await advanceDialogue(session, () => 1); // 使用六项各五十的均衡方案 -> wake_to_baima
    expect((await session.query()).dialogue).toBeNull();

    state = await session.snapshot();
    expect(state.profile.replayRules?.switches['fl_00_allocation_ready']).toBe(true);
    expect(state.profile.replayRules?.switches['fl_00_first_sleep_committed']).toBe(true);
    expect(state.profile.replayRules?.switches['fl_00_wake_baima']).toBe(true);

    // Settle prologue choice
    const settled = await session.dispatch({
      t: 'quest/choose',
      questId: 'dc_00_01',
      optionId: 'full',
      phase: 'settle',
      completionNodeId: prologueCompletion('full'),
    });
    expect(settled.accepted).toBe(true);

    // Dispatch chapter/bookSleep
    const sleepPlan: BookSleepPlan = {
      id: '00000000-0000-4000-8000-000000000042',
      from: 'ch00_yuenv',
      to: 'ch10_baima',
      targetTier: 'LOW',
      sleepEventId: 'slp_first_changbai',
      skills: { martial: [], inner: [] },
      convert: { forget: [], dissipate: [] },
      equips: [],
      sleepAlloc: Object.fromEntries(FIRST_SLEEP_RULE.keys.map((k) => [k, 50])),
      acknowledged: [],
      allocationSource: 'balanced',
      allocationRuleVersion: FIRST_SLEEP_RULE.version,
    };

    const wakeResult = await session.dispatch({
      t: 'chapter/bookSleep',
      plan: sleepPlan,
    });
    expect(wakeResult.accepted).toBe(true);

    const finalState = await session.snapshot();
    expect(finalState.chapter.chapterId).toBe('ch10_baima');
    expect(finalState.world.navigation.pendingMount?.sceneId).toBe('sc_10_fengshi_feiyi');
    expect(finalState.profile.progression?.changshengLayer).toBe(1);
  }, 45_000);

  it('completes summary prologue mode and wakes in Chapter 10', async () => {
    const { createSession } = await buildTestSessions();
    const session = createSession();

    await session.dispatch({
      t: 'quest/choose',
      questId: 'dc_00_01',
      optionId: 'summary',
    });
    await session.dispatch({
      t: 'quest/choose',
      questId: 'dc_00_01',
      optionId: 'summary',
      phase: 'settle',
      completionNodeId: prologueCompletion('summary'),
    });

    const sleepPlan: BookSleepPlan = {
      id: '00000000-0000-4000-8000-000000000043',
      from: 'ch00_yuenv',
      to: 'ch10_baima',
      targetTier: 'LOW',
      sleepEventId: 'slp_first_changbai',
      skills: { martial: [], inner: [] },
      convert: { forget: [], dissipate: [] },
      equips: [],
      sleepAlloc: Object.fromEntries(FIRST_SLEEP_RULE.keys.map((k) => [k, 50])),
      acknowledged: [],
      allocationSource: 'balanced',
      allocationRuleVersion: FIRST_SLEEP_RULE.version,
    };

    const wakeResult = await session.dispatch({
      t: 'chapter/bookSleep',
      plan: sleepPlan,
    });
    expect(wakeResult.accepted).toBe(true);

    const finalState = await session.snapshot();
    expect(finalState.chapter.chapterId).toBe('ch10_baima');
  });

  it('completes skip prologue mode and wakes in Chapter 10', async () => {
    const { createSession } = await buildTestSessions();
    const session = createSession();

    await session.dispatch({
      t: 'quest/choose',
      questId: 'dc_00_01',
      optionId: 'skip',
    });
    await session.dispatch({
      t: 'quest/choose',
      questId: 'dc_00_01',
      optionId: 'skip',
      phase: 'settle',
      completionNodeId: prologueCompletion('skip'),
    });

    const sleepPlan: BookSleepPlan = {
      id: '00000000-0000-4000-8000-000000000044',
      from: 'ch00_yuenv',
      to: 'ch10_baima',
      targetTier: 'LOW',
      sleepEventId: 'slp_first_changbai',
      skills: { martial: [], inner: [] },
      convert: { forget: [], dissipate: [] },
      equips: [],
      sleepAlloc: Object.fromEntries(FIRST_SLEEP_RULE.keys.map((k) => [k, 50])),
      acknowledged: [],
      allocationSource: 'balanced',
      allocationRuleVersion: FIRST_SLEEP_RULE.version,
    };

    const wakeResult = await session.dispatch({
      t: 'chapter/bookSleep',
      plan: sleepPlan,
    });
    expect(wakeResult.accepted).toBe(true);

    const finalState = await session.snapshot();
    expect(finalState.chapter.chapterId).toBe('ch10_baima');
  });

  it('completes prologue flow with Baiyuan combat spar branch', async () => {
    const { createSession } = await buildTestSessions();
    const session = createSession();

    await session.dispatch({
      t: 'world/mountRegion',
      regionId: 'rg_jiangnan_taihu',
      sceneId: 'sc_00_zhulin',
      spawnId: 'bookfall',
    });
    await session.dispatch({
      t: 'quest/choose',
      questId: 'dc_00_01',
      optionId: 'full',
    });

    // C01
    await session.dispatch({ t: 'world/walkTo', hex: { q: 9, r: 10 } });
    await session.dispatch({ t: 'world/interact', anchorId: 'pickup_bamboo_staff' });
    await advanceDialogue(session, () => 2);

    // C02 Zhulin battle
    await session.dispatch({ t: 'world/interact', anchorId: 'arena_00_zhulin' });
    await playBattleToVictory(session);
    await session.dispatch({ t: 'battle/leave' });
    await advanceDialogue(session, () => 0);

    // Move to Shanjing
    await session.dispatch({ t: 'world/walkTo', hex: { q: 12, r: 2 } });
    await session.dispatch({ t: 'world/interact', anchorId: 'to_shanjing' });
    await session.dispatch({
      t: 'world/mountRegion',
      regionId: 'rg_jiangnan_taihu',
      sceneId: 'sc_00_shanjing',
      spawnId: 'from_zhulin',
    });

    // Baiyuan spar choice (choice index 1: 以竹棒试手)
    await session.dispatch({ t: 'world/walkTo', hex: { q: 12, r: 8 } });
    await session.dispatch({ t: 'world/interact', anchorId: 'offer_tao' });
    expect((await session.query()).dialogue?.entryKey).toBe('baiyuan_choice');

    await advanceDialogue(session, () => 1); // 以竹棒试手
    expect((await session.query()).battle).not.toBeNull();

    const battleRes = await playBattleToVictory(session);
    expect(battleRes.result).toBe('win');

    await session.dispatch({ t: 'battle/leave' });
    await advanceDialogue(session, () => 0);

    const state = await session.snapshot();
    expect(state.profile.replayRules?.switches['fl_00_baiyuan_spar_done']).toBe(true);
    expect(state.profile.replayRules?.switches['fl_00_baiyuan_merged']).toBe(true);
  });

  it('completes prologue flow with Baiyuan bypass branch', async () => {
    const { createSession } = await buildTestSessions();
    const session = createSession();

    await session.dispatch({
      t: 'world/mountRegion',
      regionId: 'rg_jiangnan_taihu',
      sceneId: 'sc_00_zhulin',
      spawnId: 'bookfall',
    });
    await session.dispatch({
      t: 'quest/choose',
      questId: 'dc_00_01',
      optionId: 'full',
    });

    // C01
    await session.dispatch({ t: 'world/walkTo', hex: { q: 9, r: 10 } });
    await session.dispatch({ t: 'world/interact', anchorId: 'pickup_bamboo_staff' });
    await advanceDialogue(session, () => 2);

    // C02 Zhulin battle
    await session.dispatch({ t: 'world/interact', anchorId: 'arena_00_zhulin' });
    await playBattleToVictory(session);
    await session.dispatch({ t: 'battle/leave' });
    await advanceDialogue(session, () => 0);

    // Move to Shanjing
    await session.dispatch({ t: 'world/walkTo', hex: { q: 12, r: 2 } });
    await session.dispatch({ t: 'world/interact', anchorId: 'to_shanjing' });
    await session.dispatch({
      t: 'world/mountRegion',
      regionId: 'rg_jiangnan_taihu',
      sceneId: 'sc_00_shanjing',
      spawnId: 'from_zhulin',
    });

    // Baiyuan bypass choice (choice index 2: 走明示的绕路)
    await session.dispatch({ t: 'world/walkTo', hex: { q: 12, r: 8 } });
    await session.dispatch({ t: 'world/interact', anchorId: 'offer_tao' });
    expect((await session.query()).dialogue?.entryKey).toBe('baiyuan_choice');

    await advanceDialogue(session, () => 2); // 走明示的绕路
    expect((await session.query()).dialogue).toBeNull();

    const state = await session.snapshot();
    expect(state.profile.replayRules?.switches['fl_00_baiyuan_bypass']).toBe(true);
    expect(state.profile.replayRules?.switches['fl_00_baiyuan_merged']).toBe(true);
  });
});
