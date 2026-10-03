import type { ContentSource } from '@tianshu/data';
import type { GameRemote, GameUpdate } from './contracts';
import type { StaticGameContent, TownLoader } from './content';
export interface LazySessionLoaders {
  readonly session?: () => Promise<SessionFactory>;
  readonly content?: () => Promise<{ default: StaticGameContent }>;
  readonly towns?: () => Promise<{ loadTown: TownLoader }>;
  readonly source?: () => Promise<ContentSource>;
}
export type SessionFactory = (base: StaticGameContent, source: ContentSource,
  initial?: Parameters<GameRemote['restore']>[0], loadTown?: TownLoader,
  options?: { readonly demo?: boolean }) => Promise<GameRemote>;
export interface LazySessionOptions {
  readonly demo?: boolean; readonly contentSource?: ContentSource;
  readonly loaders?: LazySessionLoaders;
}
function unavailable(code: string, cause: unknown): Error {
  return cause instanceof Error && cause.message === code
    ? cause : new Error(code, { cause });
}
function rejected(error: unknown): GameUpdate {
  return { accepted: false, changes: {}, events: [],
    error: error instanceof Error ? error.message : 'CORE_SESSION_UNAVAILABLE' };
}
function recoverable(error: unknown): GameUpdate | null {
  return error instanceof Error && (error.message === 'CORE_SESSION_UNAVAILABLE' ||
    error.message.endsWith('_SUBSYSTEM_UNAVAILABLE'))
    ? rejected(error) : null;
}

/** RPC skeleton: failed imports are retryable and never expose bundler error strings. */
export function createLazyGameSession(options: LazySessionOptions = {}): GameRemote {
  let active: Promise<GameRemote> | undefined;
  const load = (): Promise<GameRemote> => {
    if (active) return active;
    const loaders = options.loaders ?? {};
    active = Promise.all([
      (loaders.session ?? (() => import('./session').then(
        ({ createLoadedGameSession }) => createLoadedGameSession)))(),
      (loaders.content ?? (() => import('virtual:tianshu-content')))(),
      options.contentSource === undefined
        ? (loaders.source ?? (() => import('./content-source').then(
          ({ createFetchContentSource }) => createFetchContentSource())))()
        : Promise.resolve(options.contentSource),
    ]).then(([createSession, content, source]) => createSession(
      content.default, source, undefined, async (sceneId) => {
        try {
          const towns = await (loaders.towns ?? (() => import('virtual:tianshu-towns')))();
          return await towns.loadTown(sceneId);
        } catch (error) { throw unavailable('TOWN_SUBSYSTEM_UNAVAILABLE', error); }
      }, { demo: options.demo === true },
    )).catch((error: unknown) => {
      active = undefined; throw unavailable('CORE_SESSION_UNAVAILABLE', error);
    });
    return active;
  };
  return {
    async dispatch(command) {
      try { return await (await load()).dispatch(command); }
      catch (error) {
        const result = recoverable(error); if (result) return result;
        throw error;
      }
    },
    async query() { return (await load()).query(); },
    async snapshot() { return (await load()).snapshot(); },
    async validate(snapshot) { return (await load()).validate(snapshot); },
    async restore(snapshot) {
      try { return await (await load()).restore(snapshot); }
      catch (error) { const result = recoverable(error); if (result) return result; throw error; }
    },
  };
}
