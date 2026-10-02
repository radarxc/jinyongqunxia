import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { useUiStore } from '@tianshu/ui/runtime';
import App from './App.vue';
import { createGameCoreHost } from './core-host';
import { createGameLoop } from './loop';
import { schedulePwaRegistration } from './pwa';
import './style.css';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('APP_ROOT_MISSING');

async function start(container: HTMLElement): Promise<void> {
  if (location.pathname === '/rig-demo' || location.pathname === '/rig-demo/') {
    const canvas = document.createElement('canvas');
    canvas.id = 'scene';
    container.append(canvas);
    const { mountRigDemo } = await import('./rig-demo');
    const dispose = await mountRigDemo(container, canvas);
    window.addEventListener('pagehide', dispose, { once: true });
    return;
  }
  container.textContent = '正在翻开书卷…';
  const [host, { createGameController }] = await Promise.all([
    createGameCoreHost(), import('./game-controller'),
  ]);
  const pinia = createPinia();
  const controller = createGameController(host, useUiStore(pinia));
  const app = createApp(App, { controller }).use(pinia);
  app.mount(container);
  await controller.initialize();
  const loop = createGameLoop({ tick: controller.tick, shouldRun: () =>
    document.visibilityState !== 'hidden' && controller.canRunWorldTicks(),
  onError: (error) => { console.error('World tick loop failed', error);
    controller.reportInternalError(); } });
  loop.start();
  schedulePwaRegistration();
  const visibility = () => {
    loop.reset();
    if (document.visibilityState === 'hidden') void controller.autosave('hidden', true);
  };
  document.addEventListener('visibilitychange', visibility);
  const onPageHide = (event: PageTransitionEvent) => {
    if (!event.persisted) void controller.autosave('pagehide', true);
  };
  window.addEventListener('pagehide', onPageHide);
  // Also flush a throttled final change without requiring another click.
  const autosaveTimer = window.setInterval(() => {
    void controller.autosave('idle');
  }, 30_000);
  if (import.meta.hot)
    import.meta.hot.dispose(() => {
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('pagehide', onPageHide);
      clearInterval(autosaveTimer);
      loop.stop();
      controller.dispose();
      app.unmount();
    });
}
void start(root).catch((error: unknown) => {
  console.error('Game initialization failed', error);
  root.textContent = '书卷暂未展开，请刷新后重试。';
});
