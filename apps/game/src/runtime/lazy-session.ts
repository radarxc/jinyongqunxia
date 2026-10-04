import type { ContentSource } from '@tianshu/data';
import type { GameRemote, GameUpdate } from './contracts';
import type { ChapterAssetLoader, StaticGameContent, TownLoader } from './content';
export interface LazySessionLoaders {
  readonly session?: () => Promise<SessionFactory>;
  readonly content?: () => Promise<{ default: StaticGameContent;
    loadChapterAssets?: ChapterAssetLoader }>;
  readonly towns?: () => Promise<{ loadTown: TownLoader }>;
  readonly source?: () => Promise<ContentSource>;
}
export type SessionFactory = (base: StaticGameContent, source: ContentSource,
  initial?: Parameters<GameRemote['restore']>[0], loadTown?: TownLoader,
  options?: { readonly demo?: boolean }, loadAssets?: ChapterAssetLoader) => Promise<GameRemote>;
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
function subsystemFailure(error: unknown): Error | null {
  if (!(error instanceof Error)) return null;
  if (error.message === 'CORE_SESSION_UNAVAILABLE' ||
      error.message.endsWith('_SUBSYSTEM_UNAVAILABLE')) return error;
  if (error.message.startsWith('ITEM_RULES_UNAVAILABLE:'))
    return unavailable('CHAPTER_CONTENT_SUBSYSTEM_UNAVAILABLE', error);
  if (error.message.startsWith('CHAPTER_ASSETS_UNAVAILABLE:'))
    return unavailable('CHAPTER_ASSETS_SUBSYSTEM_UNAVAILABLE', error);
  return null;
}
function recoverable(error: unknown): GameUpdate | null {
  const failure = subsystemFailure(error);
  return failure ? rejected(failure) : null;
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
    ]).then(async ([createSession, contentModule, source]) => {
      const content = contentModule as typeof contentModule & {
        loadChapterAssets?: ChapterAssetLoader };
      return createSession(content.default, source, undefined, async (sceneId) => {
        try {
          const towns = await (loaders.towns ?? (() => import('virtual:tianshu-towns')))();
          return await towns.loadTown(sceneId);
        } catch (error) { throw unavailable('TOWN_SUBSYSTEM_UNAVAILABLE', error); }
      }, { demo: options.demo === true }, async (chapterId) => {
        try {
          if (!content.loadChapterAssets) return {};
          return await content.loadChapterAssets(chapterId);
        } catch (error) { throw unavailable('CHAPTER_ASSETS_SUBSYSTEM_UNAVAILABLE', error); }
      });
    }).catch((error: unknown) => {
      active = undefined;
      const failure = subsystemFailure(error);
      if (failure) throw failure;
      throw unavailable('CORE_SESSION_UNAVAILABLE', error);
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
