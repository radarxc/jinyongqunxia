/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import build from 'virtual:tianshu-offline-build';
import { createSwRuntime } from './runtime';
import { classifySwRoute } from './routes';

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<{ url: string; revision?: string }> };
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
const runtime = createSwRuntime(build, caches, fetch);
registerRoute(({ url, sameOrigin }) => sameOrigin && classifySwRoute(url) === 'manifest',
  ({ request }) => runtime.manifest(request));
registerRoute(({ url, sameOrigin }) => sameOrigin && ['content', 'asset'].includes(classifySwRoute(url) ?? ''),
  ({ request }) => runtime.resource(request));
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html'),
  { denylist: [/^\/rig-demo(?:\/|$)/u] }));
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING' || event.data?.type === 'ACTIVATE_UPDATE')
    event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });
