import { createProjectionMainThreadHost, createProjectionWorkerHost } from '@tianshu/platform/host';
import type { DomainEvent } from '@tianshu/core';
import type { GameCommand, GameHost, GameProjection, SessionSnapshot } from './runtime/contracts';

export async function createGameCoreHost(): Promise<GameHost> {
  let host: GameHost | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  if (typeof Worker === 'function') {
    try {
      host = createProjectionWorkerHost<GameCommand, GameProjection, SessionSnapshot, DomainEvent>(
        new Worker(new URL('./core-worker.ts', import.meta.url), { type: 'module', name: 'tianshu-core' }),
      );
      await Promise.race([host.query(), new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(() => reject(new Error('CORE_START_TIMEOUT')), 10_000);
      })]);
      return host;
    } catch (error) {
      host?.dispose(); console.warn('Core Worker initialization failed; using compatibility host.', error);
    } finally { if (timeout) clearTimeout(timeout); }
  }
  // Only initialization failure can fall back. A running Worker is never silently restarted.
  const [{ createGameSession }, { default: content }, { loadTown }] = await Promise.all([
    import('./runtime/session'), import('virtual:tianshu-content'), import('virtual:tianshu-towns'),
  ]);
  return createProjectionMainThreadHost(createGameSession(content, undefined, loadTown));
}
