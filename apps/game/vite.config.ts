import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
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
      workbox: { navigateFallback: 'index.html' },
    }),
  ],
  worker: { format: 'es' },
  build: {
    target: 'es2022',
    sourcemap: true,
    manifest: true,
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/entry-[hash].js',
        manualChunks(id) {
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
