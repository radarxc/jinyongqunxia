import { createCore } from '@tianshu/core';
import { createMainThreadCoreHost, createWorkerCoreHost, type CoreHost } from '@tianshu/platform';

export function createGameCoreHost(): CoreHost {
  if (typeof Worker === 'function') {
    try {
      return createWorkerCoreHost(
        new Worker(new URL('./core-worker.ts', import.meta.url), {
          type: 'module',
          name: 'tianshu-core',
        }),
      );
    } catch (error: unknown) {
      console.warn('Core Worker 不可用，回退主线程。', error);
    }
  }
  return createMainThreadCoreHost(createCore(1));
}
