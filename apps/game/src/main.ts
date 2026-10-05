import { createPinia } from 'pinia';
import { createApp, defineComponent, h, reactive, shallowRef,
  type App as VueApp, type Component } from 'vue';
import type { SaveSlotSummary, TianshuStorage } from '@tianshu/platform';
import { useUiStore } from '@tianshu/ui/runtime';
import { flowT } from '@tianshu/ui/runtime';
import { defaultGameSettings, silentAudioSettingsPort,
  type GameSettingKey, type GameSettings } from './settings';
import type { GameController } from './game-controller';
import './style.css';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('APP_ROOT_MISSING');
let view: VueApp<Element> | undefined; let controller: GameController | undefined;
interface StartupState { readonly storage?: TianshuStorage; readonly settings: GameSettings;
  readonly saves: readonly SaveSlotSummary[]; readonly error?: unknown }
let stopLifecycle: (() => void) | undefined; let startup: StartupState;
const pinia = createPinia(); const settings = shallowRef(defaultGameSettings());

function unmountView(): void { view?.unmount(); view = undefined; root!.replaceChildren(); }
function mount(component: Component, props: Record<string, unknown>): void {
  unmountView(); view = createApp(component, props).use(pinia); view.mount(root!);
}
function mountFlow(component: Component, props: () => Record<string, unknown>): void {
  mount(defineComponent({ name: 'FlowRoot', setup: () => () => h('div',
    { class: [`flow-root text-scale-${settings.value.textScale}`,
      { 'reduced-motion': settings.value.reducedMotion }] }, [h(component, props())]) }), {});
}
function stopSession(): void { stopLifecycle?.(); stopLifecycle = undefined; controller?.dispose(); controller = undefined; }
function latestSave(rows: readonly SaveSlotSummary[]): SaveSlotSummary | undefined {
  return rows.filter(row => /^(save_manual_\d{2}|save_quick|save_auto_[123])$/.test(row.slot))
    .sort((left, right) => right.savedAt - left.savedAt)[0];
}
async function quality(tier: StartupState['settings']['quality']): Promise<void> {
  (await (await import('./render-host')).createRenderQuality()).setTier(tier);
}
async function attachLifecycle(current: GameController): Promise<void> {
  const { createGameLoop } = await import('./loop');
  const loop = createGameLoop({ tick: current.tick, shouldRun: () =>
    document.visibilityState !== 'hidden' && current.canRunWorldTicks(),
  onError: (error) => current.reportInternalError(error) });
  loop.start();
  const visibility = () => { loop.reset(); if (document.visibilityState === 'hidden')
    void current.autosave('hidden', true); };
  const pagehide = (event: PageTransitionEvent) => { if (!event.persisted)
    void current.autosave('pagehide', true); };
  document.addEventListener('visibilitychange', visibility); window.addEventListener('pagehide', pagehide);
  const timer = window.setInterval(() => { void current.autosave('idle'); }, 30_000);
  let offRender: () => void = () => undefined;
  void import('./render-host').then(({ setRenderRecoveryHandlers }) => {
    offRender = setRenderRecoveryHandlers({ onContextLoss: () => renderRecovery(new Error('WEBGL_CONTEXT_LOST')),
      reloadLatestAutosave: recoverLatest });
  });
  stopLifecycle = () => { document.removeEventListener('visibilitychange', visibility);
    window.removeEventListener('pagehide', pagehide); clearInterval(timer); loop.stop(); offRender(); };
}
async function createSession(demo = false): Promise<GameController> {
  stopSession(); unmountView(); root!.textContent = flowT('loadingGame');
  const [{ createGameCoreHost }, { createGameController }] = await Promise.all([
    import('./core-host'), import('./game-controller'),
  ]);
  const host = await createGameCoreHost({ demo });
  const current = createGameController(host, useUiStore(pinia), {
    ...(demo || !startup.storage ? {} : { storage: startup.storage }), settings,
    audio: silentAudioSettingsPort, setQuality: quality, onFatal: error => { void renderRecovery(error); },
  });
  controller = current; await current.initialize(); await attachLifecycle(current); return current;
}
async function beginSession(input: { slot?: string; recoveredAt?: number; demo?: boolean; fresh?: boolean }): Promise<boolean> {
  try {
    const current = await createSession(input.demo === true); let ready = true;
    if (input.slot) ready = await current.loadSlot(input.slot, input.recoveredAt);
    else if (input.fresh) ready = await current.startNewGame({
      identity: { name: flowT('defaultHero'), gender: 'unspecified', appearance: 'appearance_default',
        pronoun: flowT('defaultPronoun'), originId: 'origin_wenshiguan' }, difficulty: settings.value.difficulty,
    });
    else current.playing.value = true;
    if (!ready) throw new Error('SAVE_LOAD_FAILED');
    const { default: App } = await import('./App.vue'); mount(App, { controller: current });
    return true;
  } catch (error) { await renderRecovery(error); return false; }
}
async function recoverLatest(): Promise<boolean> {
  if (!startup.storage) return false;
  const { loadNewestAutosave } = await import('./recovery');
  const auto = await loadNewestAutosave(startup.storage);
  if (!auto) return false; return beginSession({ slot: auto.slot, recoveredAt: auto.savedAt });
}
async function renderRecovery(error: unknown): Promise<void> {
  stopSession();
  const [{ default: RecoveryPage }, { exportStoredSaves, loadNewestAutosave, recoveryReason },
    { downloadBytes }] = await Promise.all([
    import('./pages/RecoveryPage.vue'), import('./recovery'), import('@tianshu/platform'),
  ]);
  const state = reactive({ busy: false, status: '',
    autosave: await loadNewestAutosave(startup.storage) });
  mountFlow(RecoveryPage, () => ({ reason: recoveryReason(error),
    get autosaveLabel() { return state.autosave?.label; }, get busy() { return state.busy; },
    get status() { return state.status; }, exportAvailable: !!startup.storage,
    onExport: async () => {
      if (!startup.storage || state.busy) return; state.busy = true;
      try { downloadBytes(await exportStoredSaves(startup.storage), 'tianshu-saves-recovery.zip');
        state.status = flowT('exportDone'); } catch { state.status = flowT('exportFailed'); }
      finally { state.busy = false; }
    },
    onRestore: async () => { if (!state.autosave || state.busy) return; state.busy = true;
      await beginSession({ slot: state.autosave.slot, recoveredAt: state.autosave.savedAt }); },
    onReload: () => location.reload(),
  }));
}
async function showSettings(): Promise<void> {
  const [{ default: SettingsPage }, { saveGameSettings, updateGameSetting }] = await Promise.all([
    import('./pages/SettingsPage.vue'), import('./settings'),
  ]);
  mountFlow(SettingsPage, () => ({ settings: settings.value,
    onChange: (key: GameSettingKey, value: unknown) => {
      settings.value = updateGameSetting(settings.value, key, value);
      if (key === 'quality') void quality(settings.value.quality);
      if (startup.storage) void saveGameSettings(startup.storage.settings, settings.value);
    }, onBack: showTitle }));
}
async function showTitle(status = ''): Promise<void> {
  if (startup.storage) startup = { ...startup, saves: await startup.storage.saves.listSlots() };
  const save = latestSave(startup.saves);
  const { default: TitlePage } = await import('./pages/TitlePage.vue');
  mountFlow(TitlePage, () => ({ canContinue: !!save,
    continueSummary: save ? `${save.meta.summary['name'] ?? flowT('defaultHero')} · ${new Date(save.savedAt).toLocaleString('zh-CN')}` : undefined,
    newGameAvailable: true, demoAvailable: import.meta.env.DEV, status,
    onContinue: () => { if (save) void beginSession({ slot: save.slot }); },
    onNewGame: () => { void beginSession({ fresh: true }); }, onSettings: showSettings,
    onDemo: () => { if (import.meta.env.DEV) void beginSession({ demo: true }); },
  }));
}
async function start(): Promise<void> {
  if (import.meta.env.DEV && (location.pathname === '/rig-demo' || location.pathname === '/rig-demo/')) {
    const canvas = document.createElement('canvas'); canvas.id = 'scene'; root!.append(canvas);
    const { mountRigDemo } = await import('./rig-demo');
    const dispose = await mountRigDemo(root!, canvas); window.addEventListener('pagehide', dispose, { once: true });
    return;
  }
  root!.textContent = flowT('loadingStorage');
  const [{ prepareStartup }, { schedulePwaRegistration }] = await Promise.all([
    import('./recovery'), import('./pwa'),
  ]);
  startup = await prepareStartup(); settings.value = startup.settings;
  if (startup.error) { await renderRecovery(startup.error); return; }
  await showTitle(); schedulePwaRegistration();
}
export const gameReady = start().catch(error => { console.error('Game initialization failed', error);
  startup ??= { settings: settings.value, saves: [], error }; return renderRecovery(error); });
export function disposeGameShell(): void { stopSession(); unmountView();
  if (startup?.storage) void startup.storage.close(); }
if (import.meta.hot) import.meta.hot.dispose(() => { stopSession(); unmountView();
  if (startup.storage) void startup.storage.close(); });
