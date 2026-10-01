import vue from '@vitejs/plugin-vue';
import { configDefaults, defineConfig } from 'vitest/config';

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
          exclude: [...configDefaults.exclude, 'packages/render/src/rig/performance.test.ts'],
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
      {
        extends: true,
        test: {
          name: 'perf',
          environment: 'node',
          include: ['packages/render/src/rig/performance.test.ts'],
          fileParallelism: false,
          maxWorkers: 1,
          disableConsoleIntercept: true,
          sequence: { concurrent: false, groupOrder: 1 },
        },
      },
    ],
    passWithNoTests: false,
    restoreMocks: true,
  },
});
