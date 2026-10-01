import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { GameUi, useUiStore } from '@tianshu/ui';
import { createGameCoreHost } from './core-host';
import { projectTitleState } from './projection';
import { schedulePwaRegistration } from './pwa';
import { mountPlaceholderScene } from './render-host';
import { mountStorageDemo } from './storage-demo';
import './style.css';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('APP_ROOT_MISSING');
root.innerHTML = '<canvas id="scene" aria-label="天书录场景占位"></canvas><div id="ui"></div>';
const canvas = document.querySelector<HTMLCanvasElement>('#scene');
const uiRoot = document.querySelector<HTMLDivElement>('#ui');
if (!canvas || !uiRoot) throw new Error('APP_SURFACE_MISSING');

const pinia = createPinia();
createApp(GameUi).use(pinia).mount(uiRoot);
const ui = useUiStore(pinia);
const host = createGameCoreHost();
let disposeScene: (() => void) | undefined;
let disposeStorage: (() => Promise<void>) | undefined;
const isRigDemo = location.pathname === '/rig-demo' || location.pathname === '/rig-demo/';

if (isRigDemo) {
  uiRoot.hidden = true;
  void import('./rig-demo').then(({ mountRigDemo }) => mountRigDemo(root, canvas)).then((dispose) => { disposeScene = dispose; }).catch((error: unknown) => { root.dataset['error'] = String(error); });
} else {
  void mountStorageDemo(root).then((dispose) => { disposeStorage = dispose; });

  void Promise.all([host.tick(), mountPlaceholderScene(canvas)])
    .then(async ([result, dispose]) => {
      disposeScene = dispose;
      const state = await host.snapshot();
      ui.replaceProjection(projectTitleState(state, result, host.mode));
      schedulePwaRegistration();
    })
    .catch((error: unknown) => {
      ui.replaceProjection({ title: '天书录', coreVersion: '错误', worldTick: 0, status: String(error) });
    });
}

window.addEventListener(
  'pagehide',
  () => {
    disposeScene?.();
    void disposeStorage?.();
    host.dispose();
  },
  { once: true },
);
