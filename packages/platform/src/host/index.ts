import * as Comlink from 'comlink';
import type { CoreHost, CoreRemote } from './types';

export type { CoreHost, CoreRemote } from './types';
export * from './projection-host';
export type * from './projection-types';

export function exposeCore(remote: CoreRemote): void {
  Comlink.expose(remote);
}

function wrap(remote: CoreRemote, mode: CoreHost['mode'], dispose: () => void): CoreHost {
  return {
    mode,
    dispatch: async (command) => remote.dispatch(command),
    tick: async () => remote.tick(),
    snapshot: async () => remote.snapshot(),
    dispose,
  };
}

export function createMainThreadCoreHost(core: CoreRemote): CoreHost {
  return wrap(core, 'main-thread', () => undefined);
}

export function createWorkerCoreHost(worker: Worker): CoreHost {
  const remote = Comlink.wrap<CoreRemote>(worker);
  return wrap(remote, 'worker', () => {
    remote[Comlink.releaseProxy]();
    worker.terminate();
  });
}
