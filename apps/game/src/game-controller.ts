import { markRaw, shallowRef, type ShallowRef } from 'vue';
import type { TownCommand, WorldMapCommand, WorldMapProjection } from '@tianshu/core';
import { createIndexedDbStorage, downloadBytes, type TianshuStorage } from '@tianshu/platform';
import { flowT, recoveredAutosaveText, t, uiBus, type useUiStore,
  type SaveSlotView, type UiProjection } from '@tianshu/ui/runtime';
import type { GameHost, GameProjection, GameUpdate, NewGameRequest, TownProjection } from './runtime/contracts';
import type { TownRuntimeDefinition } from '@tianshu/data/schemas';
import type { BattleController } from './battle/controller';
import type { createSaveService } from './storage/save-service';
import { slotViews } from './storage/slot-views';
import { defaultGameSettings, loadGameSettings, saveGameSettings, silentAudioSettingsPort,
  updateGameSetting, type AudioSettingsPort, type GameSettingKey, type GameSettings } from './settings';

export type GameController = ReturnType<typeof createGameController>;
export interface GameControllerOptions {
  readonly storage?: TianshuStorage;
  readonly settings?: ShallowRef<GameSettings>;
  readonly audio?: AudioSettingsPort;
  readonly setQuality?: (tier: GameSettings['quality']) => void | Promise<void>;
  readonly onFatal?: (error: unknown) => void;
  readonly autosave?: (trigger: string, force: boolean) => Promise<'saved' | 'throttled'>;
}
class GameplayRejection extends Error {
  public constructor(code?: string) { super(code || 'COMMAND_REJECTED'); this.name = 'GameplayRejection'; }
}
export function createGameController(host: GameHost, ui: ReturnType<typeof useUiStore>,
  options: GameControllerOptions = {}) {
  const battle = shallowRef<BattleController | null>(null);
  const battleActive = shallowRef(false);
  let battleLoading: Promise<BattleController> | undefined;
  async function ensureBattle(): Promise<BattleController> {
    if (battle.value) return battle.value;
    battleLoading ??= import('./battle/controller').then(({ createBattleController }) => {
      const controller = createBattleController(host); battle.value = markRaw(controller); return controller;
    });
    return battleLoading;
  }
  const busy = shallowRef(false);
  const loading = shallowRef(true);
  const saving = shallowRef(false);
  const sceneRunsWorldTicks = shallowRef(false);
  const slots = shallowRef<readonly SaveSlotView[]>(slotViews([]));
  const storageAvailable = shallowRef(false);
  const saveStatus = shallowRef(t('loading'));
  const notice = shallowRef('');
  const settings = options.settings ?? shallowRef<GameSettings>(defaultGameSettings());
  const worldmap = shallowRef<WorldMapProjection | null>(null);
  const worldPaused = shallowRef(false);
  const sessionFailed = shallowRef(false);
  const fatalError = shallowRef<unknown>();
  const frozenProjection = shallowRef<UiProjection | null>(null);
  const lastCommandSequence = shallowRef<number | null>(null);
  const playing = shallowRef(false);
  const townRuntime = shallowRef<TownRuntimeDefinition | null>(null);
  const town = shallowRef<TownProjection | null>(null);
  let storage: TianshuStorage | undefined = options.storage;
  let saves: ReturnType<typeof createSaveService> | undefined;
  let disposed = false;
  let pendingAutosave: { trigger: string; force: boolean } | undefined;
  let autosaveTask: Promise<void> | undefined;
  let bookSleepActive = false;
  let queuedForeground = 0;
  let commandQueue: Promise<unknown> = Promise.resolve();
  let lastGoodProjection: GameProjection | null = null;
  let bookSleepInFlight = false;
  let dirtyRevision = 0;
  let savedRevision = 0;
  async function refresh(): Promise<void> {
    if (!saves) return;
    const listed = await saves.list();
    slots.value = markRaw(slotViews(listed, Object.fromEntries(await Promise.all(listed.map(async (row) => [row.slot, await saves!.history(row.slot)])))));
    const persisted = { granted: '已获授权', denied: '未获授权，请定期导出', unsupported: '浏览器不支持', 'not-requested': '首次保存时请求' }[await saves.persistenceStatus()];
    if (storageAvailable.value) saveStatus.value = `${saveStatus.value === t('loading') ? t('saveReady') : saveStatus.value.split(' · 持久存储：')[0]!} · 持久存储：${persisted}`;
  }
  function describe(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error);
    const code = (error as { code?: unknown })?.code;
    if (message.includes('QUOTA') || code === 'QUOTA_EXCEEDED') return '存储空间不足，请导出存档并清理可重建缓存。';
    if (code === 'SAVE_TOO_NEW') return '这个存档由较新版本创建，请更新游戏后再读取。';
    if (code === 'SAVE_PROTOCOL_UNSUPPORTED' || code === 'MISSING_MIGRATION' ||
        code === 'UNSUPPORTED_VERSION' || /VERSION/.test(message))
      return '这个存档版本暂不兼容，原有进度已保留。';
    if (/HASH|INVALID|STATE_/.test(message)) return '存档校验失败，原有进度已保留。';
    if (/EQUIPMENT/.test(message)) return '此物无法放入所选装备位置。';
    if (/ITEM_|CONSUMABLE/.test(message)) return '此刻无法使用这件物品。';
    return t('error');
  }
  function terminal(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    return /CORE_WORKER_FAILED|CORE_CALL_TIMEOUT|HOST_DISPOSED/.test(message);
  }
  function reportInternalError(error?: unknown): void {
    if (disposed || sessionFailed.value) return;
    frozenProjection.value = markRaw(structuredClone(lastGoodProjection ?? ui.projection));
    sessionFailed.value = true; sceneRunsWorldTicks.value = false;
    fatalError.value = error ?? new Error('GAME_SESSION_FAILED');
    notice.value = '游戏内部错误，探索已暂停；请导出存档并刷新。';
    saveStatus.value = notice.value;
    if (error !== undefined) console.error('Game session terminated', error);
    options.onFatal?.(fatalError.value);
  }
  function run(work: () => Promise<void>, gameplay = false): Promise<void> {
    if (disposed || (gameplay && sessionFailed.value)) return Promise.resolve();
    queuedForeground += 1; busy.value = true;
    const next = commandQueue.then(async () => {
      if (disposed || (gameplay && sessionFailed.value)) return;
      try { await work(); } catch (error) {
        if (disposed) return;
        if (terminal(error) || (gameplay && !(error instanceof GameplayRejection))) reportInternalError(error);
        else { notice.value = describe(error); saveStatus.value = notice.value; }
      }
    });
    commandQueue = next.catch(() => undefined).finally(() => {
      queuedForeground -= 1; busy.value = queuedForeground > 0;
      if (queuedForeground === 0) {
        const pending = pendingAutosave; pendingAutosave = undefined;
        if (pending && !disposed) void autosave(pending.trigger, pending.force);
      }
    });
    return next;
  }
  const offHost = host.subscribe((update) => {
    if (!update.accepted) { if (terminal(update.error)) reportInternalError(new Error(update.error)); return; }
    if (lastGoodProjection) lastGoodProjection = { ...lastGoodProjection,
      ...structuredClone(update.changes) };
    if (update.changes.worldPaused !== undefined) worldPaused.value = update.changes.worldPaused;
    if (update.changes.worldmap !== undefined) worldmap.value = update.changes.worldmap
      ? markRaw(update.changes.worldmap) : null;
    if (update.changes.townRuntime !== undefined) townRuntime.value = update.changes.townRuntime
      ? markRaw(update.changes.townRuntime) : null;
    if (update.changes.town !== undefined) town.value = update.changes.town
      ? markRaw(update.changes.town) : null;
    ui.applyProjection(update.changes);
    for (const event of update.events) {
      if ('seq' in event && event.seq > (lastCommandSequence.value ?? 0))
        lastCommandSequence.value = event.seq;
    }
    if (update.changes.battle !== undefined) {
      battleActive.value = update.changes.battle !== null;
      if (!battle.value) {
        const packet = update.changes.battle ?? null;
        void ensureBattle().then(controller => controller.apply(packet));
      }
    }
    if (update.events.length) {
      dirtyRevision += 1;
      if (!bookSleepInFlight && update.events.some((event) => event.t !== 'world/ticked'))
        void autosave('state-change');
    }
  });
  async function dispatchCoreCommand(command: Parameters<GameHost['dispatch']>[0]): Promise<GameUpdate> {
    let existingPlan = false;
    if (command.t === 'chapter/bookSleep') {
      const progression = (await host.snapshot()).profile.progression;
      if (!progression) throw new Error('STATE_PROGRESSION_MISSING');
      existingPlan = progression.bookSleepLog.some((entry) => entry.planId === command.plan.id);
    }
    const firstSleep = command.t === 'chapter/bookSleep' && !existingPlan;
    if (firstSleep) {
      if (!saves) throw new Error('STORAGE_UNAVAILABLE');
      saving.value = true;
      const result = await saves.autosave('first-sleep', true);
      if (result.status !== 'saved') throw new Error('BOOK_SLEEP_AUTOSAVE_FAILED');
      savedRevision = dirtyRevision; await refresh(); bookSleepInFlight = true;
    }
    try {
      const result = await host.dispatch(command);
      if (!result.accepted) throw new GameplayRejection(result.error);
      if (firstSleep) { await saves!.checkpoint('save_wake_ch10');
        savedRevision = dirtyRevision; await refresh(); }
      notice.value = ''; return result;
    } finally { bookSleepInFlight = false; if (firstSleep) saving.value = false; }
  }
  const offBus = uiBus.subscribe((intent) => {
    void run(async () => { await dispatchCoreCommand(intent.command); }, true);
  });
  async function autosave(trigger: string, force = false): Promise<void> {
    if (battleActive.value || ui.projection.dialogue || bookSleepActive) return;
    if ((!saves && !options.autosave) || (dirtyRevision === savedRevision && !force) || disposed) return;
    if (busy.value) { pendingAutosave = { trigger, force: force || pendingAutosave?.force === true }; return; }
    if (autosaveTask) { pendingAutosave = { trigger, force: force || pendingAutosave?.force === true }; return autosaveTask; }
    saving.value = true; autosaveTask = (async () => {
      try {
      const capturedRevision = dirtyRevision;
      const status = options.autosave ? await options.autosave(trigger, force)
        : (await saves!.autosave(trigger, force)).status;
      if (status === 'saved') { savedRevision = capturedRevision; saveStatus.value = '已自动保存'; await refresh(); }
      } catch (error) {
        if (disposed) return;
        if (terminal(error)) reportInternalError(error);
        else { notice.value = describe(error); saveStatus.value = notice.value; }
      }
      finally { saving.value = false; autosaveTask = undefined;
        const pending = pendingAutosave; pendingAutosave = undefined;
        if (pending && !disposed) void autosave(pending.trigger, pending.force); }
    })();
    return autosaveTask;
  }
  async function initialize(): Promise<void> {
    const projection = await host.query(); worldPaused.value = projection.worldPaused;
    lastGoodProjection = structuredClone(projection);
    worldmap.value = projection.worldmap ? markRaw(projection.worldmap) : null;
    townRuntime.value = projection.townRuntime ? markRaw(projection.townRuntime) : null;
    town.value = projection.town ? markRaw(projection.town) : null;
    ui.replaceProjection(projection);
    if (projection.battle) { battleActive.value = true; (await ensureBattle()).apply(projection.battle); }
    try {
      if (!storage) storage = await createIndexedDbStorage({
        databaseName: ui.projection.hud.preview ? 'tianshu-ui-preview' : 'tianshu',
      });
      if (disposed) { await storage.close(); return; }
      saves = (await import('./storage/save-service')).createSaveService(storage, host);
      if (!options.settings) settings.value = await loadGameSettings(storage.settings);
      for (const category of ['master', 'music', 'effects', 'voice'] as const)
        (options.audio ?? silentAudioSettingsPort).setVolume(category, settings.value.volume[category]);
      await options.setQuality?.(settings.value.quality);
      await refresh(); storageAvailable.value = true; saveStatus.value = t('saveReady');
    } catch (error) { saveStatus.value = describe(error); }
    finally { loading.value = false; }
  }
  async function saveAction(action: 'save' | 'load' | 'remove' | 'export', request: string): Promise<void> {
    const [slot, option] = request.split('|');
    if (battleActive.value && (action === 'save' || action === 'load')) { notice.value = '战斗结束后可保存或读取旅程。'; return; }
    if ((ui.projection.dialogue || bookSleepActive) && action === 'save') {
      notice.value = bookSleepActive ? flowT('bookSleepSaveBlocked') : flowT('dialogueSaveBlocked'); return;
    }
    await run(async () => {
      if (!saves) throw new Error('STORAGE_UNAVAILABLE');
      if (action === 'export' && slot === '*') downloadBytes(await saves.exportAll(), 'tianshu-saves.zip');
      else if (action === 'export') downloadBytes(await saves.exportSlot(slot!, option === 'json' ? 'json' : 'tsav'), `${slot}.${option === 'json' ? 'json' : 'tsav'}`);
      else if (action === 'load') { const recovery = await saves.load(slot!, option ? Number(option) : undefined); if (recovery) saveStatus.value = `已从第 ${recovery.recoveredGeneration} 代恢复`; }
      else await saves[action](slot!);
      if (action === 'load') savedRevision = dirtyRevision;
      if (action !== 'load' || !saveStatus.value.startsWith('已从第')) saveStatus.value = { save: '已保存旅程', load: '已读取存档', remove: '已删除存档', export: '存档已导出' }[action];
      notice.value = ''; await refresh();
    });
  }
  async function importFile(slot: string, file: File): Promise<void> {
    await run(async () => {
      if (!saves) throw new Error('STORAGE_UNAVAILABLE');
      if (file.size > 256 * 1024 * 1024) throw new Error('SAVE_FILE_INVALID');
      const bytes = new Uint8Array(await file.arrayBuffer());
      const zip = bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
      const count = zip ? await saves.importAll(bytes) : (await saves.importSlot(slot, bytes), 1);
      saveStatus.value = zip ? `已从 ZIP 导入 ${count} 份存档` : '已导入所选槽位的新一代，可选择读取'; await refresh();
    });
  }
  async function loadSlot(slot: string, recoveredAt?: number): Promise<boolean> {
    let loaded = false;
    await run(async () => {
      if (!saves) throw new Error('STORAGE_UNAVAILABLE');
      await saves.load(slot); savedRevision = dirtyRevision; playing.value = true; loaded = true;
      saveStatus.value = recoveredAt === undefined ? '已读取存档' : recoveredAutosaveText(recoveredAt);
      notice.value = ''; await refresh();
    });
    return loaded;
  }
  async function startNewGame(input: NewGameRequest): Promise<boolean> {
    let started = false;
    await run(async () => {
      const result = await host.dispatch({ ...input, t: 'run/create' });
      if (!result.accepted) throw new GameplayRejection(result.error);
      playing.value = true; started = true; notice.value = '';
    }, true);
    return started;
  }
  function commitSetting(key: GameSettingKey, value: unknown): void {
    settings.value = updateGameSetting(settings.value, key, value);
    if (key === 'master' || key === 'music' || key === 'effects' || key === 'voice')
      (options.audio ?? silentAudioSettingsPort).setVolume(key, settings.value.volume[key]);
    if (key === 'quality') void options.setQuality?.(settings.value.quality);
    if (storage) void saveGameSettings(storage.settings, settings.value)
      .catch((error: unknown) => { notice.value = describe(error); });
  }
  function setSetting(key: GameSettingKey, value: unknown): void {
    if (key !== 'difficulty' || !playing.value) { commitSetting(key, value); return; }
    const difficulty = updateGameSetting(settings.value, key, value).difficulty;
    void run(async () => {
      const result = await host.dispatch({ t: 'rules/setDifficulty', difficulty });
      if (!result.accepted) throw new GameplayRejection(result.error);
      commitSetting('difficulty', difficulty); notice.value = '';
    }, true);
  }
  function setSceneRunsWorldTicks(value: boolean): void {
    sceneRunsWorldTicks.value = value;
  }
  async function worldMapCommand(command: WorldMapCommand): Promise<void> {
    await run(async () => { const result = await host.dispatch(command);
      if (!result.accepted) throw new GameplayRejection(result.error); notice.value = ''; }, true);
  }
  async function townCommand(command: TownCommand): Promise<GameUpdate | undefined> {
    let update: GameUpdate | undefined;
    await run(async () => { const result = await host.dispatch(command);
      if (!result.accepted) throw new GameplayRejection(result.error); notice.value = ''; update = result; }, true);
    return update;
  }
  return { busy, slots, storageAvailable, saveStatus, notice, settings, worldmap, worldPaused,
    townRuntime, town,
    battle, battleActive, loading, saving, sceneRunsWorldTicks, sessionFailed, fatalError,
    frozenProjection, lastCommandSequence, playing,
    ensureBattle, initialize, saveAction, importFile, loadSlot, startNewGame,
    setSetting, setSceneRunsWorldTicks, autosave,
    setBookSleepActive(value: boolean) { bookSleepActive = value; },
    canSave: () => !battleActive.value && !ui.projection.dialogue && !bookSleepActive,
    tick: () => host.dispatch({ t: 'world/tick' }),
    canRunWorldTicks: () => !sessionFailed.value && sceneRunsWorldTicks.value && !busy.value && !loading.value &&
      !saving.value && !battleActive.value && !worldPaused.value,
    reportInternalError,
    worldMapCommand, townCommand,
    dispose() { disposed = true; battle.value?.dispose(); offHost(); offBus(); host.dispose();
      if (!options.storage) void storage?.close(); },
  };
}
