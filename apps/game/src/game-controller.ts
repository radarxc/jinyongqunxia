import { markRaw, shallowRef } from 'vue';
import { createIndexedDbStorage, downloadBytes, type TianshuStorage } from '@tianshu/platform';
import { t, uiBus, type useUiStore, type SaveSlotView } from '@tianshu/ui/runtime';
import type { GameHost } from './runtime/contracts';
import type { BattleController } from './battle/controller';
import { createSaveService } from './storage/save-service';
import { slotViews } from './storage/slot-views';

export type GameController = ReturnType<typeof createGameController>;
export function createGameController(host: GameHost, ui: ReturnType<typeof useUiStore>) {
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
  const slots = shallowRef<readonly SaveSlotView[]>(slotViews([]));
  const storageAvailable = shallowRef(false);
  const saveStatus = shallowRef(t('loading'));
  const notice = shallowRef('');
  const settings = shallowRef({ largeText: false, reducedMotion: false });
  let storage: TianshuStorage | undefined;
  let saves: ReturnType<typeof createSaveService> | undefined;
  let disposed = false;
  let pendingAutosave: { trigger: string; force: boolean } | undefined;
  let dirtyRevision = 0;
  let savedRevision = 0;
  async function refresh(): Promise<void> {
    if (saves) slots.value = markRaw(slotViews(await saves.list()));
  }
  function describe(error: unknown): string {
    const code = error instanceof Error ? error.message : String(error);
    if (code.includes('QUOTA') || (error as { code?: string })?.code === 'QUOTA_EXCEEDED') return '存储空间不足，请导出存档并清理可重建缓存。';
    if (/VERSION/.test(code)) return '这个存档版本暂不兼容，原有进度已保留。';
    if (/HASH|INVALID|STATE_/.test(code)) return '存档校验失败，原有进度已保留。';
    if (/EQUIPMENT/.test(code)) return '此物无法放入所选装备位置。';
    if (/ITEM_|CONSUMABLE/.test(code)) return '此刻无法使用这件物品。';
    return t('error');
  }
  async function run(work: () => Promise<void>): Promise<void> {
    if (disposed || busy.value) return;
    busy.value = true;
    try { await work(); } catch (error) { notice.value = describe(error); saveStatus.value = notice.value; }
    finally {
      busy.value = false;
      const pending = pendingAutosave; pendingAutosave = undefined;
      if (pending && !disposed) void autosave(pending.trigger, pending.force);
    }
  }
  const offHost = host.subscribe((update) => {
    if (!update.accepted) return;
    ui.applyProjection(update.changes);
    if (update.changes.battle !== undefined) {
      battleActive.value = update.changes.battle !== null;
      if (!battle.value) {
        const packet = update.changes.battle ?? null;
        void ensureBattle().then(controller => controller.apply(packet));
      }
    }
    if (update.events.length) { dirtyRevision += 1; void autosave('state-change'); }
  });
  const offBus = uiBus.subscribe((intent) => {
    void run(async () => {
      const result = await host.dispatch(intent.command);
      if (!result.accepted) throw new Error(result.error);
      notice.value = '';
    });
  });
  async function autosave(trigger: string, force = false): Promise<void> {
    if (battleActive.value) return;
    if (!saves || (dirtyRevision === savedRevision && !force) || disposed) return;
    if (busy.value) { pendingAutosave = { trigger, force }; return; }
    await run(async () => {
      const capturedRevision = dirtyRevision;
      const result = await saves!.autosave(trigger, force);
      if (result.status === 'saved') { savedRevision = capturedRevision; saveStatus.value = '已自动保存'; await refresh(); }
    });
  }
  async function initialize(): Promise<void> {
    const initial = await host.query(); ui.replaceProjection(initial);
    if (initial.battle) { battleActive.value = true; (await ensureBattle()).apply(initial.battle); }
    try {
      const opened = await createIndexedDbStorage({ databaseName: ui.projection.hud.preview ? 'tianshu-ui-preview' : 'tianshu' });
      if (disposed) { await opened.close(); return; }
      storage = opened; saves = createSaveService(storage, host);
      const stored = await storage.settings.get<{ largeText: boolean; reducedMotion: boolean }>('ui.accessibility');
      if (stored) settings.value = { largeText: stored.largeText === true, reducedMotion: stored.reducedMotion === true };
      await refresh(); storageAvailable.value = true; saveStatus.value = t('saveReady');
    } catch (error) { saveStatus.value = describe(error); }
  }
  async function saveAction(action: 'save' | 'load' | 'remove' | 'export', slot: string): Promise<void> {
    if (battleActive.value && (action === 'save' || action === 'load')) { notice.value = '战斗结束后可保存或读取旅程。'; return; }
    await run(async () => {
      if (!saves) throw new Error('STORAGE_UNAVAILABLE');
      if (action === 'export') downloadBytes(await saves.exportSlot(slot), `${slot}.tsui`);
      else await saves[action](slot);
      if (action === 'load') savedRevision = dirtyRevision;
      saveStatus.value = { save: '已保存旅程', load: '已读取存档', remove: '已删除存档', export: '存档已导出' }[action];
      notice.value = ''; await refresh();
    });
  }
  async function importFile(slot: string, file: File): Promise<void> {
    await run(async () => {
      if (!saves) throw new Error('STORAGE_UNAVAILABLE');
      if (file.size > 32 * 1024 * 1024 + 16 * 1024 + 9) throw new Error('SAVE_FILE_INVALID');
      await saves.importSlot(slot, new Uint8Array(await file.arrayBuffer()));
      saveStatus.value = '已导入所选槽位，可选择读取'; await refresh();
    });
  }
  function setSetting(key: 'largeText' | 'reducedMotion', value: boolean): void {
    settings.value = { ...settings.value, [key]: value };
    void storage?.settings.set('ui.accessibility', settings.value).catch((error: unknown) => { notice.value = describe(error); });
  }
  return { busy, slots, storageAvailable, saveStatus, notice, settings, battle, battleActive, ensureBattle, initialize, saveAction, importFile, setSetting, autosave,
    dispose() { disposed = true; battle.value?.dispose(); offHost(); offBus(); host.dispose(); void storage?.close(); },
  };
}
