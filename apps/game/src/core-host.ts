import { createProjectionMainThreadHost } from '@tianshu/platform/host';
import type { ContentSource } from '@tianshu/data';
import type { JsonValue } from '@tianshu/shared';
import type { GameHost, GameProjection, NewGameRequest,
  NewGameHost, SessionSnapshot } from './runtime/contracts';
import type { ChapterAssetLoader } from './runtime/content';
import { applyItemText } from './selectors/items';
import { FetchContentSource, ItemTextCache, itemContentChapter } from './runtime/item-content';
import { createLazyGameSession } from './runtime/lazy-session';
import { preloadFlowForCommand } from './runtime/flow-preload';

function withNewGame(host: GameHost): GameHost & NewGameHost {
  return Object.assign(host, { createNewGame: (input: NewGameRequest) =>
    host.dispatch({ ...input, t: 'run/create' }) });
}
function withFlowPreload(host: GameHost): GameHost {
  return { ...host, async dispatch(command) {
    await preloadFlowForCommand(command);
    return host.dispatch(command);
  } };
}

function withItemText(host: GameHost, cache: ItemTextCache,
  fixup?: NonNullable<GameHost['fixupContentRefs']>): GameHost {
  const listeners = new Set<(update: Awaited<ReturnType<GameHost['dispatch']>>) => void>();
  let inventory: GameProjection['inventory'] = []; let equipment: GameProjection['equipment'] = [];
  const rawItems = new Map<string, GameProjection['inventory'][number]>();
  let loading = false;
  const publish = (update: Awaited<ReturnType<GameHost['dispatch']>>) => {
    for (const listener of listeners) listener(update);
  };
  const ensure = () => {
    if (loading) return;
    loading = true;
    void cache.load().then(() => {
      loading = false;
      inventory = inventory.map((item) => applyItemText(rawItems.get(item.id) ?? item, cache));
      equipment = equipment.map((entry) => ({ ...entry,
        item: entry.item ? applyItemText(rawItems.get(entry.item.id) ?? entry.item, cache) : null }));
      publish({ accepted: true, changes: { inventory, equipment }, events: [] });
    }).catch((error: unknown) => {
      loading = false; console.warn('Item text loading failed.', error);
      publish({ accepted: true, changes: { status: 'ITEM_TEXT_UNAVAILABLE' }, events: [] });
    });
  };
  const lazy = (item: GameProjection['inventory'][number]) => {
    const ready = applyItemText(item, cache);
    if (ready !== item) return ready;
    const view = { ...item };
    for (const key of ['description', 'source'] as const) Object.defineProperty(view, key, {
      enumerable: true, configurable: true, get() { ensure(); return item[key]; },
    });
    return view;
  };
  const decorate = (changes: Partial<GameProjection>): Partial<GameProjection> => {
    const next = { ...changes };
    if (changes.inventory) { changes.inventory.forEach((item) => rawItems.set(item.id, item));
      inventory = changes.inventory.map(lazy); next.inventory = inventory; }
    if (changes.equipment) { equipment = changes.equipment.map((entry) => ({ ...entry,
      item: entry.item ? (rawItems.set(entry.item.id, entry.item), lazy(entry.item)) : null }));
      next.equipment = equipment; }
    return next;
  };
  const off = host.subscribe((update) => publish({ ...update, changes: decorate(update.changes) }));
  return { mode: host.mode, dispatch: (command) => host.dispatch(command).then((update) =>
    ({ ...update, changes: decorate(update.changes) })), query: () => host.query().then((view) =>
    ({ ...view, ...decorate(view) })), snapshot: () => host.snapshot(),
  validate: (snapshot) => host.validate(snapshot), restore: (snapshot) => host.restore(snapshot).then(
    (update) => ({ ...update, changes: decorate(update.changes) })),
  ...(fixup || host.fixupContentRefs ? { fixupContentRefs: (snapshot: SessionSnapshot, hash: string) =>
    (fixup ?? host.fixupContentRefs!)(snapshot, hash) } : {}),
  subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  dispose() { off(); listeners.clear(); host.dispose(); } };
}

export async function createGameCoreHost(options: { readonly demo?: boolean;
  readonly contentSource?: ContentSource } = {}):
Promise<GameHost & NewGameHost> {
  const source = options.contentSource ?? new FetchContentSource();
  const localFixup: NonNullable<GameHost['fixupContentRefs']> = async (snapshot, fromHash) => {
    const [loadGameContent, { fixupContentRefs }, content] = await Promise.all([
      import('./runtime/item-content').then(({ loadGameContent }) => loadGameContent),
      import('@tianshu/data'), import('virtual:tianshu-content'),
    ]);
    const chapterAssets = content as typeof content & { loadChapterAssets?: ChapterAssetLoader };
    const target = await loadGameContent(content.default, source, snapshot.chapter.chapterId,
      chapterAssets.loadChapterAssets);
    if (fromHash === target.contentHash) return structuredClone(snapshot);
    const fixed = fixupContentRefs(
      snapshot as unknown as JsonValue, target.idRemaps ?? [],
    ) as unknown as SessionSnapshot;
    return { ...fixed, meta: { ...fixed.meta, contentHash: target.contentHash! } };
  };
  const wrap = (entry: GameHost): GameHost & NewGameHost => withNewGame(withFlowPreload(withItemText(
    entry, new ItemTextCache(source, itemContentChapter(options.demo === true)), localFixup)));
  let host: (GameHost & NewGameHost) | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  if (typeof Worker === 'function' && options.demo !== true && options.contentSource === undefined) {
    try {
      const { createWorkerGameHost } = await import('./runtime/worker-host');
      host = withNewGame(createWorkerGameHost());
      await Promise.race([host.query(), new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(() => reject(new Error('CORE_START_TIMEOUT')), 10_000);
      })]);
      return wrap(host);
    } catch (error) {
      host?.dispose(); console.warn('Core Worker initialization failed; using compatibility host.', error);
    } finally { if (timeout) clearTimeout(timeout); }
  }
  // Only initialization failure can fall back. A running Worker is never silently restarted.
  return wrap(createProjectionMainThreadHost(createLazyGameSession({
    demo: options.demo === true, contentSource: source,
  })));
}
