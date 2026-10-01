import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vue()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: [
            'packages/{shared,data,core,platform,render}/**/*.test.ts',
            'apps/**/*.test.ts',
            'tools/perf/**/*.test.mjs',
          ],
        },
      },
      {
        extends: true,
        test: {
          name: 'ui',
          environment: 'happy-dom',
          include: ['packages/ui/**/*.test.ts'],
        },
      },
    ],
    passWithNoTests: false,
    restoreMocks: true,
  },
});
