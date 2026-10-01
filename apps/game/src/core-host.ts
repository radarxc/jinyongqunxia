import { createProjectionMainThreadHost, createProjectionWorkerHost } from '@tianshu/platform/host';
import type { DomainEvent } from '@tianshu/core';
import type { UiCommand, UiProjection } from '@tianshu/ui';
import type { GameHost, SessionSnapshot } from './runtime/contracts';

export async function createGameCoreHost(): Promise<GameHost> {
  let host: GameHost | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  if (typeof Worker === 'function') {
    try {
      host = createProjectionWorkerHost<UiCommand, UiProjection, SessionSnapshot, DomainEvent>(
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
  const [{ createGameSession }, { default: content }] = await Promise.all([
    import('./runtime/session'), import('virtual:tianshu-content'),
  ]);
  return createProjectionMainThreadHost(createGameSession(content));
}
