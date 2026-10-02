import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { compareCodePoints, type JsonValue } from '@tianshu/shared';
import { loadContent } from '../content-index';
import { parseYamlFile, type ContentEntry, type ContentFile } from '../content-registry';
import { discoverContent, type DiscoveredSource } from './discover';
import { CONTENT_FIELD_REGISTRY } from './field-registry';
import { hashValue } from './hash'; import { compileInk, type CompiledInk } from './ink';
import { emitLeaves, packSizeDiagnostics } from './leaves'; import { createManifest, manifestBytes } from './manifest';
import { applyPathRemaps, parseIdRemaps, validatePathRemaps } from './remaps'; import { splitContentEntry } from './split-fields';
import type { BuildLeaf, BuildOptions, ContentBuildResult, Diagnostic } from './types';

interface BuildEntry extends ContentEntry { readonly owner: string; }
const chapterToken = (chapter: string): string => chapter.slice(0, 4);
const identity = (entry: ContentEntry): string => {
  const value = entry.value as Record<string, unknown>;
  return String(value['id'] ?? value['key'] ?? value['lineId'] ?? value['cityId']);
};
function owner(entry: ContentEntry): string {
  const value = entry.value as Record<string, unknown>; const chapter = value['chapterId'];
  const pathChapter = entry.path.match(/^content\/chapters\/([^/]+)\//u)?.[1];
  if (pathChapter !== undefined) return pathChapter;
  if (entry.path.startsWith('content/common/') || entry.path.startsWith('content/items/')) return 'common';
  if (entry.path.startsWith('content/world/')) return 'world';
  if (typeof chapter === 'string' && chapter.includes('_')) return chapter;
  if (typeof chapter === 'string' && /^ch\d{2}$/u.test(chapter)) return chapter;
  return 'common';
}
function diagnostic(error: unknown): Diagnostic {
  const message = error instanceof Error ? error.message : String(error);
  const match = message.match(/(?:^|:)(content\/[^:]+)(?::(\d+))?/u);
  return { code: message.split(':')[0] || 'CONTENT_BUILD', severity: 'error', message,
    primary: { file: match?.[1] ?? '<tool>', line: Number(match?.[2] ?? 1), column: 1,
      endLine: Number(match?.[2] ?? 1), endColumn: 1 } };
}
function isContentError(error: unknown): boolean {
  return error instanceof TypeError || error instanceof SyntaxError ||
    (error instanceof Error && error.constructor.name === 'ZodError');
}

function parseLocale(source: DiscoveredSource): Readonly<Record<string, string>> {
  const value: unknown = source.path.endsWith('.json') ? JSON.parse(source.text) :
    parseYamlFile({ path: source.path, text: source.text });
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new TypeError(`CONTENT_LOCALE:${source.path}`);
  const flat: Record<string, string> = {};
  const walk = (entry: unknown, prefix: string): void => {
    if (typeof entry === 'string') { flat[prefix] = entry; return; }
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) throw new TypeError(`CONTENT_LOCALE:${source.path}:${prefix}`);
    for (const [key, child] of Object.entries(entry)) walk(child, prefix ? `${prefix}.${key}` : key);
  };
  walk(value, ''); return flat;
}
function diagnosticSort(left: Diagnostic, right: Diagnostic): number {
  return compareCodePoints(left.primary.file, right.primary.file) || left.primary.line - right.primary.line ||
    left.primary.column - right.primary.column || compareCodePoints(left.code, right.code);
}
function localeDiagnostics(locale: string, leaves: readonly BuildLeaf[], overlays: Readonly<Record<string, string>>): Diagnostic[] {
  if (locale === 'zh-Hans') return [];
  const keys = new Set(leaves.filter((leaf) => leaf.kind === 'text').flatMap((leaf) =>
    Object.keys(leaf.value as Record<string, JsonValue>)));
  return [...keys].filter((key) => overlays[key] === undefined).sort(compareCodePoints).map((key) => ({
    code: 'CONTENT_LOCALE_FALLBACK', severity: 'warning' as const,
    message: `${locale} missing ${key}; falling back to zh-Hans`,
    primary: { file: `content/locales/${locale}`, line: 1, column: 1, endLine: 1, endColumn: 1 },
  }));
}

async function parseInkSources(sources: readonly DiscoveredSource[]): Promise<readonly CompiledInk[]> {
  const metadata = new Map(sources.filter((source) => source.kind === 'inkmeta').map((source) =>
    [source.path.replace(/\.inkmeta\.yaml$/u, '.ink'), source.text]));
  const result: CompiledInk[] = [];
  for (const source of sources.filter((entry) => entry.kind === 'ink')) {
    const meta = metadata.get(source.path);
    if (meta === undefined) throw new TypeError(`INK_META_MISSING:${source.path}`);
    result.push(await compileInk(source.text, meta, source.path));
  }
  for (const path of metadata.keys()) if (!sources.some((source) => source.path === path))
    throw new TypeError(`INK_SOURCE_MISSING:${path}`);
  return result;
}

function buildLeaf(logicalName: string, kind: 'rules' | 'text', load: 'resident' | 'chapter',
  value: JsonValue, locale?: string): BuildLeaf {
  return { logicalName, kind, load, value, ...(locale === undefined ? {} : { locale }) };
}
function chapterIds(entries: readonly BuildEntry[], inks: readonly CompiledInk[]): readonly string[] {
  const ids = new Set<string>();
  for (const entry of entries) {
    const value = entry.value as Record<string, unknown>;
    for (const candidate of [value['chapterId'], value['id'], ...(Array.isArray(value['sourceChapters']) ? value['sourceChapters'] : [])])
      if (typeof candidate === 'string' && /^ch\d{2}_[a-z0-9_]+$/u.test(candidate)) ids.add(candidate);
  }
  for (const ink of inks) ids.add(ink.structure.chapter);
  const longByToken = new Map([...ids].map((id) => [chapterToken(id), id]));
  for (const entry of entries) if (/^ch\d{2}$/u.test(entry.owner) && !longByToken.has(entry.owner))
    throw new TypeError(`CONTENT_CHAPTER_OWNER:${entry.path}:${entry.owner}`);
  return [...ids].sort(compareCodePoints);
}

function partitions(entries: readonly BuildEntry[], inks: readonly CompiledInk[], locale: string): readonly BuildLeaf[] {
  const leaves: BuildLeaf[] = []; const split = entries.map((entry) => ({ entry, value: splitContentEntry(entry) }));
  const makeRules = (selected: typeof split): JsonValue => selected.map(({ entry, value }) =>
    ({ kind: entry.kind, id: identity(entry), value: value.rules }));
  const makeText = (selected: typeof split): JsonValue => Object.fromEntries(selected.flatMap(({ value }) => Object.entries(value.text)));
  const common = split.filter(({ entry }) => entry.owner === 'common');
  const world = split.filter(({ entry }) => entry.owner === 'world');
  leaves.push(buildLeaf('common.rules.base.json', 'rules', 'resident', makeRules(common)));
  leaves.push(buildLeaf(`common.text.${locale}.json`, 'text', 'resident', makeText(common), locale));
  leaves.push(buildLeaf('world.rules.navigation.json', 'rules', 'resident',
    { kind: 'worldNavigation', entries: [] }));
  for (const chapter of chapterIds(entries, inks)) {
    const token = chapterToken(chapter); const chapterEntries = split.filter(({ entry }) => entry.owner === chapter || entry.owner === token);
    const chapterInks = inks.filter((ink) => ink.structure.chapter === chapter);
    const entryRules = makeRules(chapterEntries) as JsonValue[];
    const rules: JsonValue[] = [...entryRules, ...chapterInks.map((ink) =>
      ink.structure as unknown as JsonValue)];
    const text = { ...(makeText(chapterEntries) as Record<string, JsonValue>),
      ...Object.assign({}, ...chapterInks.map((ink) => ink.text)),
      ...Object.fromEntries(chapterInks.map((ink) => [`ink.${ink.storyId}`, JSON.parse(ink.storyJson) as JsonValue])) };
    leaves.push(buildLeaf(`world.rules.era.${token}.json`, 'rules', 'chapter', makeRules(world.filter(({ entry }) =>
      (entry.value as Record<string, unknown>)['chapterId'] === chapter))));
    leaves.push(buildLeaf(`${token}.rules.base.json`, 'rules', 'chapter', rules));
    leaves.push(buildLeaf(`${token}.text.${locale}.base.json`, 'text', 'chapter', text, locale));
  }
  return leaves;
}

async function emitBuild(outputDir: string, cacheDir: string, result: ContentBuildResult, refs?: JsonValue): Promise<void> {
  await rm(outputDir, { recursive: true, force: true }); await mkdir(outputDir, { recursive: true });
  await mkdir(cacheDir, { recursive: true });
  for (const chapter of result.chapters) {
    const directory = join(outputDir, chapter.chapter); await mkdir(directory, { recursive: true });
    for (const leaf of chapter.leaves) await writeFile(join(directory, leaf.logicalName), leaf.bytes);
    await writeFile(join(directory, 'manifest.json'), manifestBytes(chapter.manifest));
  }
  await writeFile(join(outputDir, 'index.json'), Buffer.from(JSON.stringify({ format: 1, chapters: result.chapters.map((chapter) => ({
    chapter: chapter.chapter, manifest: `${chapter.chapter}/manifest.json`, contentHash: chapter.manifest.contentHash,
    releaseHash: chapter.manifest.releaseHash })) }) + '\n'));
  await writeFile(join(cacheDir, 'build.json'), Buffer.from(JSON.stringify({ entryCount: result.entryCount, chapters: result.chapters.length }) + '\n'));
  if (refs !== undefined) await writeFile(join(cacheDir, 'refs.json'), Buffer.from(JSON.stringify(refs) + '\n'));
}

export async function buildContent(options: BuildOptions = {}): Promise<ContentBuildResult> {
  const started = performance.now(); const rootDir = resolve(options.rootDir ?? process.cwd());
  const outputDir = resolve(rootDir, options.outputDir ?? 'dist/content'); const cacheDir = resolve(rootDir, options.cacheDir ?? '.cache/content-build');
  const diagnostics: Diagnostic[] = [];
  try {
    const discovered = await discoverContent(rootDir);
    const pathSource = discovered.find((source) => source.path === 'content/migrations/path-remaps.yaml');
    const pathRemaps = pathSource ? validatePathRemaps(parseYamlFile({ path: pathSource.path, text: pathSource.text })) : [];
    const migrated = applyPathRemaps(discovered.filter((source) => source.kind !== 'migration'), pathRemaps);
    for (const remap of migrated.applied) diagnostics.push({ code: 'CONTENT_PATH_DEPRECATED', severity: 'warning',
      message: `${remap.from} is read as ${remap.to}`,
      primary: { file: remap.from, line: 1, column: 1, endLine: 1, endColumn: 1 } });
    const sources = [...migrated.sources, ...discovered.filter((source) => source.kind === 'migration')];
    const contentSources = sources.filter((source) => source.kind === 'content' &&
      !source.path.startsWith('content/vfx/')).map(({ path, text }): ContentFile => ({ path, text }));
    const registry = loadContent(contentSources);
    const entries = registry.entries.map((entry): BuildEntry => ({ ...entry, owner: owner(entry) }));
    const inks = await parseInkSources(sources); diagnostics.push(...inks.flatMap((ink) => ink.diagnostics));
    if (diagnostics.some((entry) => entry.severity === 'error'))
      return { chapters: [], diagnostics, outputDir, durationMs: performance.now() - started,
        entryCount: entries.length };
    const definedIds = new Set(entries.map(identity));
    const idSource = sources.find((source) => source.path === 'content/migrations/id-remaps.yaml');
    const idRemaps = idSource ? parseIdRemaps(idSource.text, idSource.path, definedIds) : [];
    const locale = options.locale ?? 'zh-Hans';
    const localeEntries = sources.filter((source) => source.kind === 'locale' && source.path.includes(`/locales/${locale}/`))
      .reduce<Record<string, string>>((all, source) => ({ ...all, ...parseLocale(source) }), {});
    const baseLeaves = partitions(entries, inks, locale);
    diagnostics.push(...localeDiagnostics(locale, baseLeaves, localeEntries));
    const leaves = baseLeaves.map((leaf) => leaf.kind !== 'text' || Object.keys(localeEntries).length === 0
      ? leaf : { ...leaf, value: { ...(leaf.value as Record<string, JsonValue>), ...localeEntries } });
    const allChapters = chapterIds(entries, inks);
    const selected = options.chapter === undefined ? allChapters : allChapters.filter((chapter) => chapter === options.chapter);
    if (options.chapter !== undefined && selected.length === 0) throw new TypeError(`CONTENT_CHAPTER_UNKNOWN:${options.chapter}`);
    const schemaHash = await hashValue({ registry: 'content-fields.v1',
      fields: CONTENT_FIELD_REGISTRY as unknown as JsonValue });
    const chapters = [];
    for (const chapter of selected) {
      const token = chapterToken(chapter); const relevant = leaves.filter((leaf) =>
        leaf.logicalName.startsWith('common.') || leaf.logicalName.startsWith('world.rules.navigation.') || leaf.logicalName.startsWith(`${token}.`) || leaf.logicalName === `world.rules.era.${token}.json`);
      const emitted = await emitLeaves(relevant, options.maxLeafBytes); const manifest = await createManifest(chapter, schemaHash, emitted, idRemaps);
      diagnostics.push(...packSizeDiagnostics(chapter, emitted)); chapters.push({ chapter, manifest, leaves: emitted });
    }
    diagnostics.sort(diagnosticSort);
    const result = { chapters, diagnostics, outputDir, durationMs: performance.now() - started, entryCount: entries.length };
    const refUses = entries.flatMap((entry) => { const value = splitContentEntry(entry);
      return value.assetRefs.map(({ asset, pointer }) => ({ asset, chapter: entry.owner === 'common' ? null : entry.owner,
        region: null, by: `${entry.kind}:${identity(entry)}`, boss: false,
        source: { file: entry.path, pointer } })); });
    refUses.sort((left, right) => compareCodePoints(left.asset, right.asset) ||
      compareCodePoints(left.chapter ?? '', right.chapter ?? '') || compareCodePoints(left.by, right.by) ||
      compareCodePoints(left.source.file, right.source.file) || compareCodePoints(left.source.pointer, right.source.pointer));
    const refs = Object.fromEntries([...new Set(refUses.map((use) => use.asset))].sort(compareCodePoints)
      .map((asset) => [asset, refUses.filter((use) => use.asset === asset).map(({ asset: _asset, ...use }) => use)]));
    if (options.write !== false && !diagnostics.some((entry) => entry.severity === 'error'))
      await emitBuild(outputDir, cacheDir, result, options.emitRefs ? refs : undefined);
    return result;
  } catch (error) {
    if (!isContentError(error)) throw error;
    diagnostics.push(diagnostic(error));
    return { chapters: [], diagnostics, outputDir, durationMs: performance.now() - started,
      entryCount: 0 };
  }
}
