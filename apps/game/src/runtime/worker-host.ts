import type { DomainEvent } from '@tianshu/core';
import { createProjectionWorkerHost } from '@tianshu/platform/host';
import type { GameCommand, GameHost, GameProjection, SessionSnapshot } from './contracts';

export function createWorkerGameHost(): GameHost {
  return createProjectionWorkerHost<GameCommand, GameProjection, SessionSnapshot, DomainEvent>(
    new Worker(new URL('../core-worker.ts', import.meta.url), {
      type: 'module',
      name: 'tianshu-core',
    }),
  );
}
