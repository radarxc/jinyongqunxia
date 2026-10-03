import { shallowRef, watch, type Ref, type ShallowRef } from 'vue';
import type { ContentSource } from '@tianshu/data';
import type { FlowCardView } from '@tianshu/ui';
import { FetchContentSource } from '../runtime/item-content';
import type { TextCatalog } from './presentation';

const EMPTY_CATALOG: TextCatalog = Object.freeze({});
const defaultLoads = new Map<string, Promise<TextCatalog>>();

function textLeaf(name: string, chapterId: string, locale: string): boolean {
  const token = chapterId.slice(0, 4);
  const base = name.replace(/\.p\d{3}(?=\.json$)/u, '');
  return base === `common.text.${locale}.json` || base === `${token}.text.${locale}.base.json`;
}

export async function loadChapterTextCatalog(
  source: ContentSource,
  chapterId: string,
  locale = 'zh-Hans',
): Promise<TextCatalog> {
  const { loadChapterPackLeaves } = await import('@tianshu/data');
  const pack = await loadChapterPackLeaves(
    source,
    chapterId,
    (leaf) =>
      leaf.kind === 'text' &&
      leaf.locale === locale &&
      textLeaf(leaf.logicalName, chapterId, locale),
  );
  const values: Record<string, string> = {};
  for (const leaf of pack.manifest.leaves) {
    if (!textLeaf(leaf.logicalName, chapterId, locale)) continue;
    const content = pack.leaves[leaf.logicalName];
    if (typeof content !== 'object' || content === null || Array.isArray(content))
      throw new TypeError(`FLOW_TEXT_LEAF_INVALID:${leaf.logicalName}`);
    for (const [key, value] of Object.entries(content)) {
      if (typeof value !== 'string') continue;
      if (values[key] !== undefined && values[key] !== value)
        throw new TypeError(`FLOW_TEXT_KEY_CONFLICT:${key}`);
      values[key] = value;
    }
  }
  return Object.freeze(values);
}

function defaultCatalog(chapterId: string): Promise<TextCatalog> {
  let pending = defaultLoads.get(chapterId);
  if (!pending) {
    pending = loadChapterTextCatalog(new FetchContentSource(), chapterId);
    defaultLoads.set(chapterId, pending);
    void pending.catch(() => {
      if (defaultLoads.get(chapterId) === pending) defaultLoads.delete(chapterId);
    });
  }
  return pending;
}

export function useChapterTextCatalog(
  chapter: string | Readonly<Ref<string>>,
  source?: ContentSource,
): ShallowRef<TextCatalog> {
  const catalog = shallowRef<TextCatalog>(EMPTY_CATALOG);
  let generation = 0;
  const load = (chapterId: string): void => {
    const current = ++generation;
    catalog.value = EMPTY_CATALOG;
    void (source ? loadChapterTextCatalog(source, chapterId) : defaultCatalog(chapterId))
      .then((value) => {
        if (generation === current) catalog.value = value;
      })
      .catch(() => {
        if (generation === current) catalog.value = EMPTY_CATALOG;
      });
  };
  if (typeof chapter === 'string') load(chapter);
  else watch(chapter, load, { immediate: true });
  return catalog;
}

function escapePattern(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

export function flowCardsFromCatalog(
  catalog: TextCatalog,
  prefix: string,
  fallback: readonly FlowCardView[],
): readonly FlowCardView[] {
  const pattern = new RegExp(`^${escapePattern(prefix)}\\.([0-9]{3})\\.(title|body)$`, 'u');
  const rows = new Map<string, { title?: string; body?: string }>();
  for (const [key, value] of Object.entries(catalog)) {
    const match = key.match(pattern);
    if (!match) continue;
    const row = rows.get(match[1]!) ?? {};
    row[match[2] as 'title' | 'body'] = value;
    rows.set(match[1]!, row);
  }
  const cards = [...rows]
    .sort(([left], [right]) => left.localeCompare(right))
    .flatMap(([ordinal, row]) =>
      row.title && row.body
        ? [{ key: `${prefix}.${ordinal}`, title: row.title, body: row.body }]
        : [],
    );
  return cards.length ? cards : fallback;
}
