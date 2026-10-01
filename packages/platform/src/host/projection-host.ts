import * as Comlink from 'comlink';
import type { ProjectionHost, ProjectionRemote, ProjectionUpdate } from './projection-types';

function hostFor<C, V, S, E>(
  remote: ProjectionRemote<C, V, S, E>, mode: 'worker' | 'main-thread',
  cleanup: () => void, failure?: Promise<never>,
): ProjectionHost<C, V, S, E> {
  let disposed = false;
  let queue: Promise<unknown> = Promise.resolve();
  const listeners = new Set<(update: ProjectionUpdate<V, E>) => void>();
  let rejectDisposed: (error: Error) => void = () => undefined;
  const closed = new Promise<never>((_resolve, reject) => { rejectDisposed = reject; });
  void closed.catch(() => undefined);
  const copy = <T>(value: T): T => mode === 'main-thread' ? structuredClone(value) : value;
  function run<T>(work: () => T | Promise<T>): Promise<T> {
    if (disposed) return Promise.reject(new Error('HOST_DISPOSED'));
    const next = queue.then(async () => {
      if (disposed) throw new Error('HOST_DISPOSED');
      const races: Promise<T>[] = [Promise.resolve().then(work), closed];
      if (failure) races.push(failure);
      return copy(await Promise.race(races));
    });
    queue = next.catch(() => undefined);
    return next;
  }
  function publish(update: ProjectionUpdate<V, E>): ProjectionUpdate<V, E> {
    if (!disposed) for (const listener of listeners) {
      try { listener(update); } catch (error) { console.error('Projection subscriber failed', error); }
    }
    return update;
  }
  return {
    mode,
    dispatch: (command) => run(async () => publish(copy(await remote.dispatch(copy(command))))),
    query: () => run(() => remote.query()),
    snapshot: () => run(() => remote.snapshot()),
    validate: (snapshot) => run(() => remote.validate(copy(snapshot))),
    restore: (snapshot) => run(async () => publish(copy(await remote.restore(copy(snapshot))))),
    subscribe(listener) {
      if (disposed) throw new Error('HOST_DISPOSED');
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    dispose() {
      if (disposed) return;
      disposed = true; listeners.clear();
      rejectDisposed(new Error('HOST_DISPOSED')); cleanup();
    },
  };
}

export function createProjectionMainThreadHost<C, V, S, E>(
  remote: ProjectionRemote<C, V, S, E>,
): ProjectionHost<C, V, S, E> {
  return hostFor(remote, 'main-thread', () => undefined);
}

export function createProjectionWorkerHost<C, V, S, E>(
  worker: Worker,
): ProjectionHost<C, V, S, E> {
  const remote = Comlink.wrap<ProjectionRemote<C, V, S, E>>(worker);
  let fail: (error: Error) => void = () => undefined;
  const failure = new Promise<never>((_resolve, reject) => { fail = reject; });
  void failure.catch(() => undefined);
  const onError = () => { fail(new Error('CORE_WORKER_FAILED')); };
  worker.addEventListener('error', onError);
  worker.addEventListener('messageerror', onError);
  // The RPC contract restricts all generic arguments to structured-cloneable DTOs.
  return hostFor<C, V, S, E>(remote as unknown as ProjectionRemote<C, V, S, E>, 'worker', () => {
    worker.removeEventListener('error', onError);
    worker.removeEventListener('messageerror', onError);
    remote[Comlink.releaseProxy](); worker.terminate();
  }, failure);
}

export function exposeProjectionCore<C, V, S, E>(remote: ProjectionRemote<C, V, S, E>): void {
  Comlink.expose(remote);
}
