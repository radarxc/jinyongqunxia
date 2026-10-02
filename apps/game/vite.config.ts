import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { gameContentPlugin } from './build/content-plugin';

// Core exports pure rule functions; unused barrels must not eagerly run Ink's runtime.
const treeshake = { moduleSideEffects: [{ test: /\/packages\/core\/src\/.*\.ts$/, sideEffects: false }] };

export default defineConfig({
  plugins: [
    gameContentPlugin(),
    vue(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      manifest: {
        name: '金庸群侠传·天书录',
        short_name: '天书录',
        lang: 'zh-Hans',
        display: 'standalone',
        orientation: 'landscape',
        theme_color: '#15110f',
        background_color: '#15110f',
      },
      workbox: { navigateFallback: 'index.html', maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,webmanifest}',
          'assets/default/baseline/map/ref_map_jianghu__ch01_base01.png'],
        // VFX JSON and atlases are fetched by move on first use, never during shell/PWA startup.
        globIgnores: [
          '**/assets/vfx-*.js',
          '**/assets/default/vfx/**',
          '**/assets/default/baseline/vfx/**',
          '**/content/vfx/**',
        ] },
    }),
  ],
  worker: { format: 'es', plugins: () => [gameContentPlugin({ copyAssets: false })], rollupOptions: { treeshake } },
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
