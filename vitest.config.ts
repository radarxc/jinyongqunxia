import vue from '@vitejs/plugin-vue';
import { configDefaults, defineConfig } from 'vitest/config';

const managedMaxWorkers = (() => {
  const raw = process.env.TIANSHU_VITEST_MAX_WORKERS;
  if (raw === undefined) return undefined;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`TIANSHU_VITEST_MAX_WORKERS must be a positive integer, got ${raw}`);
  }
  return value;
})();

export default defineConfig({
  plugins: [vue()],
  test: {
    ...(managedMaxWorkers === undefined ? {} : { maxWorkers: managedMaxWorkers }),
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
          // New gates use <name>.performance.test.ts; keep historical bare names out too.
          exclude: [
            ...configDefaults.exclude,
            '**/*.performance.test.ts',
            '**/performance.test.ts',
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
      {
        extends: true,
        test: {
          name: 'perf',
          environment: 'node',
          // Filename registration covers new gates and the historical bare filename.
          include: [
            'packages/**/*.performance.test.ts',
            'packages/**/performance.test.ts',
          ],
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
