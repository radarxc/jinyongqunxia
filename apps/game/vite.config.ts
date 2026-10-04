import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { gameContentPlugin } from './build/content-plugin';
import { sizeGroupsPlugin } from './build/size-groups-plugin';
import { offlineSwPlugin } from './build/offline-sw-plugin';

// Core exports pure rule functions; unused barrels must not eagerly run Ink's runtime.
const treeshake = { moduleSideEffects: [{ test: /\/packages\/core\/src\/.*\.ts$/, sideEffects: false }] };

export default defineConfig({
  plugins: [
    gameContentPlugin(),
    vue(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src/sw',
      filename: 'sw.ts',
      registerType: 'prompt',
      injectRegister: false,
      includeManifestIcons: false,
      integration: { beforeBuildServiceWorker: async options => {
        const path = resolve(import.meta.dirname, 'dist/manifest.webmanifest');
        const revision = createHash('sha256').update(await readFile(path)).digest('hex');
        const entries = options.injectManifest.additionalManifestEntries ?? [];
        options.injectManifest.additionalManifestEntries = [...entries.filter(entry =>
          (typeof entry === 'string' ? entry : entry.url) !== 'manifest.webmanifest'),
        { url: 'manifest.webmanifest', revision }];
      } },
      pwaAssets: { image: 'build/pwa-icon.svg', preset: 'minimal-2023',
        overrideManifestIcons: true, includeHtmlHeadLinks: false,
        integration: { publicDir: resolve(import.meta.dirname, 'build'),
          outDir: resolve(import.meta.dirname, 'dist') } },
      manifest: {
        name: '金庸群侠传·天书录',
        short_name: '天书录',
        lang: 'zh-Hans',
        display: 'standalone',
        display_override: ['fullscreen', 'standalone'],
        orientation: 'landscape',
        theme_color: '#15110f',
        background_color: '#15110f',
      },
      injectManifest: { maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        buildPlugins: { vite: [offlineSwPlugin(resolve(import.meta.dirname, 'dist'))] },
        // The plugin contributes manifest.webmanifest separately; avoid a second glob entry.
        globPatterns: ['**/*.{js,css,html,wasm,woff2,svg}'],
        globIgnores: [
          '**/assets/book-*.js',
          '**/assets/rig-demo-*.js',
          '**/assets/vfx-*.js',
          '**/assets/default/**',
          '**/content/**',
          '**/content/vfx/**',
        ],
        dontCacheBustURLsMatching: /(?:^|\/)[^/]+-[A-Za-z0-9_-]{8,}\.(?:js|css|wasm|woff2|svg)$/u,
        manifestTransforms: [async entries => {
          const version = JSON.parse(await readFile(resolve(import.meta.dirname, 'dist/version.json'), 'utf8')) as
            { releaseHash: string };
          const unique = new Map<string, (typeof entries)[number]>();
          for (const entry of entries) {
            if (!unique.has(entry.url)) unique.set(entry.url, entry);
            else if (entry.revision !== null) {
              const bytes = await readFile(resolve(import.meta.dirname, 'dist', entry.url));
              unique.set(entry.url, { ...entry, revision: createHash('sha256').update(bytes).digest('hex') });
            }
          }
          return { manifest: [...unique.values()].map(entry => entry.url === 'index.html'
            ? { ...entry, revision: [entry.revision ?? 'shell', version.releaseHash].join('-') } : entry) };
        }],
      },
    }),
  ],
  worker: {
    format: 'es',
    plugins: () => [gameContentPlugin({ copyAssets: false }), sizeGroupsPlugin()],
    rollupOptions: { treeshake },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    manifest: true,
    rollupOptions: {
      treeshake,
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/entry-[hash].js',
        manualChunks(id) {
          if (id.includes('/packages/render/src/vfx/')) return 'vfx';
          if (id.includes('/packages/render/src/rig/')) return 'rig';
          if (id.includes('/three/')) return 'render';
          if (id.includes('/packages/render/')) return 'render';
          if (id.includes('/content/chapters/')) {
            const chapter = id.match(/\/content\/chapters\/(ch\d{2}_[^/]+)/)?.[1] ?? 'shared';
            return `book-${chapter}`;
          }
          if (id.includes('/packages/core/')) return 'core';
          return undefined;
        },
      },
    },
  },
  resolve: { alias: { '@game': resolve(import.meta.dirname, 'src') } },
});
