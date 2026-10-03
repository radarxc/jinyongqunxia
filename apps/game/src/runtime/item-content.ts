import type { ContentSource } from '@tianshu/data';
import { ChapterDefSchema, type ChapterDef } from '@tianshu/data/schemas';
import type { GameContent, StaticGameContent } from './content';

export const ITEM_CONTENT_CHAPTER = 'ch00_yuenv';
export const ITEM_TEXT_PLACEHOLDER = '正文载入中……';
export const itemContentChapter = (demo: boolean): string =>
  demo ? 'ch01_tianlong' : ITEM_CONTENT_CHAPTER;

export interface ItemText {
  readonly desc?: string | undefined;
  readonly lore?: string | undefined;
  readonly short?: string | undefined;
}

export class FetchContentSource implements ContentSource {
  public constructor(private readonly base = new URL('/content/',
    globalThis.location?.origin ?? 'http://localhost')) {}
  public async readJson(path: string): Promise<unknown> {
    const response = await fetch(new URL(path, this.base));
    if (!response.ok) throw new Error(`CONTENT_HTTP_${response.status}`);
    return response.json() as Promise<unknown>;
  }
}

function itemRuleName(name: string): boolean {
  return /^common\.rules\.items(?:\.p\d{3})?\.json$/u.test(name);
}
function chapterRuleName(name: string, chapter: string): boolean {
  return name.startsWith(`${chapter.slice(0, 4)}.rules.base`) && name.endsWith('.json');
}
function chapterDefs(leaves: Readonly<Record<string, unknown>>): readonly ChapterDef[] {
  const rows = Object.values(leaves).flatMap((value) => Array.isArray(value) ? value : []);
  return rows.flatMap((row) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return [];
    const entry = row as { kind?: unknown; value?: unknown };
    return entry.kind === 'bookWorld' ? [ChapterDefSchema.parse(entry.value)] : [];
  });
}
function itemTextName(name: string, locale: string): boolean {
  const match = name.match(/^common\.text\.([A-Za-z0-9-]+)\.items(?:\.p\d{3})?\.json$/u);
  return match?.[1] === locale;
}
function loadError(code: string, error: unknown): Error {
  const detail = error instanceof Error ? error.message : String(error);
  return new Error(`${code}:${detail}`, { cause: error });
}

export async function loadGameContent(base: StaticGameContent, source: ContentSource,
  chapter = ITEM_CONTENT_CHAPTER): Promise<GameContent> {
  try {
    const [{ loadChapterPackLeaves }, { parseItemRuleLeaves }] = await Promise.all([
      import('@tianshu/data'), import('@tianshu/data/item-content'),
    ]);
    const pack = await loadChapterPackLeaves(source, chapter, (leaf) => leaf.kind === 'rules' &&
      (itemRuleName(leaf.logicalName) || chapterRuleName(leaf.logicalName, chapter)));
    const names = pack.manifest.leaves.filter((leaf) => itemRuleName(leaf.logicalName))
      .map((leaf) => leaf.logicalName);
    if (names.length === 0) throw new TypeError('CONTENT_ITEM_RULE_LEAF_MISSING');
    const items = parseItemRuleLeaves(names.map((name) => pack.leaves[name]));
    const chapters = chapterDefs(pack.leaves);
    if (chapters.length !== 1 || chapters[0]?.id !== chapter)
      throw new TypeError('CONTENT_CHAPTER_DEF_MISSING');
    return { ...base, items: items as GameContent['items'], chapters,
      idRemaps: pack.manifest.idRemaps, contentHash: pack.manifest.contentHash };
  } catch (error) { throw loadError('ITEM_RULES_UNAVAILABLE', error); }
}

export class ItemTextCache {
  readonly #values = new Map<string, ItemText>();
  #pending: Promise<void> | undefined;
  public constructor(private readonly source: ContentSource,
    private readonly chapter = ITEM_CONTENT_CHAPTER, private readonly locale = 'zh-Hans') {}
  public get(itemId: string): ItemText | undefined { return this.#values.get(itemId); }
  public load(): Promise<void> {
    return this.#pending ??= this.#load().catch((error: unknown) => {
      this.#pending = undefined; throw loadError('ITEM_TEXT_UNAVAILABLE', error);
    });
  }
  async #load(): Promise<void> {
    const { loadChapterPackLeaves } = await import('@tianshu/data');
    const pack = await loadChapterPackLeaves(this.source, this.chapter, (leaf) =>
      leaf.kind === 'text' && leaf.locale === this.locale &&
      itemTextName(leaf.logicalName, this.locale));
    const names = pack.manifest.leaves.filter((leaf) =>
      itemTextName(leaf.logicalName, this.locale)).map((leaf) => leaf.logicalName);
    if (names.length === 0) throw new TypeError('CONTENT_ITEM_TEXT_LEAF_MISSING');
    const staged = new Map<string, ItemText>();
    const fields = new Set<string>();
    for (const name of names) {
      const value = pack.leaves[name];
      if (typeof value !== 'object' || value === null || Array.isArray(value))
        throw new TypeError('CONTENT_ITEM_TEXT_LEAF_INVALID');
      for (const [key, text] of Object.entries(value)) {
        const match = key.match(/^item\.([a-z0-9_]+)\.text\.(desc|lore|short)$/u);
        if (!match || typeof text !== 'string') throw new TypeError(`CONTENT_ITEM_TEXT_INVALID:${key}`);
        if (fields.has(key)) throw new TypeError(`CONTENT_ITEM_TEXT_DUPLICATE:${key}`);
        fields.add(key);
        const previous = staged.get(match[1]!) ?? {};
        staged.set(match[1]!, { ...previous, [match[2]!]: text });
      }
    }
    for (const [itemId, text] of staged) this.#values.set(itemId, Object.freeze(text));
  }
}
